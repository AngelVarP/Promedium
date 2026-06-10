import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env', 'utf8')
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim()
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim()

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { error: errorId } = await supabase.from('perfiles').insert({ id: '123' })
  console.log("Insert id error:", errorId)
  const { error: errorUserId } = await supabase.from('perfiles').insert({ user_id: '123' })
  console.log("Insert user_id error:", errorUserId)
}

check()
