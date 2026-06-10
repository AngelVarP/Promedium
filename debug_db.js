import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env', 'utf8')
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim()
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim()

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data: sistemas } = await supabase.from('sistemas_evaluacion').select('*')
  console.log("SISTEMAS:", sistemas)
  
  const { data: carreras } = await supabase.from('carreras').select('*')
  console.log("CARRERAS:", carreras)
}

check()
