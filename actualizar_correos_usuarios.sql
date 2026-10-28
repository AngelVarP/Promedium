-- =========================================================================
-- MIGRACIÓN SUPABASE: SINCRONIZACIÓN AUTOMÁTICA DE CORREOS DE USUARIOS
-- =========================================================================
-- Ejecuta este script en el SQL Editor de tu consola de Supabase.
-- Realiza 4 acciones esenciales:
-- 1. Añade la columna 'correo' a la tabla 'public.perfiles' si aún no existe.
-- 2. Copia inmediatamente los correos de TODOS los usuarios existentes desde auth.users.
-- 3. Crea la función RPC 'sync_perfiles_correos()' para sincronizaciones automáticas desde la app.
-- 4. Actualiza el trigger 'handle_new_user()' para que todo nuevo registro guarde su correo automáticamente.
-- =========================================================================

-- 1. Asegurar columna correo en la tabla perfiles
ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS correo TEXT;

-- 2. Copiar de golpe todos los correos de auth.users a public.perfiles para todas las cuentas existentes
UPDATE public.perfiles p
SET correo = u.email
FROM auth.users u
WHERE p.user_id = u.id;

-- 3. Crear función de sincronización accesible por la app (SECURITY DEFINER permite consultar auth.users)
CREATE OR REPLACE FUNCTION public.sync_perfiles_correos()
RETURNS void AS $$
BEGIN
  UPDATE public.perfiles p
  SET correo = u.email
  FROM auth.users u
  WHERE p.user_id = u.id 
    AND (p.correo IS NULL OR p.correo = '' OR p.correo != u.email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Actualizar trigger para nuevos usuarios registrados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfiles (user_id, nombre_completo, correo)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre_completo', 'Estudiante ' || substr(new.id::text, 1, 4)),
    new.email
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nombre_completo = COALESCE(EXCLUDED.nombre_completo, perfiles.nombre_completo),
    correo = COALESCE(EXCLUDED.correo, perfiles.correo);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Asegurar que el trigger esté activo en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Garantizar permisos RLS para lectura y actualización
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica perfiles" ON public.perfiles;
CREATE POLICY "Lectura publica perfiles" 
ON public.perfiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Actualizacion perfiles" ON public.perfiles;
CREATE POLICY "Actualizacion perfiles" 
ON public.perfiles FOR ALL 
USING (true);
