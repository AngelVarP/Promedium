-- Añadir columna pre_requisitos
ALTER TABLE public.catalogo_cursos 
ADD COLUMN IF NOT EXISTS pre_requisitos TEXT;

-- Limpiar la tabla completa para eliminar los duplicados y prepararla para el nuevo seed
DELETE FROM public.catalogo_cursos WHERE id != '00000000-0000-0000-0000-000000000000';
