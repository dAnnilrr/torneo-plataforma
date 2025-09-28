import { supabase } from '../../../lib/supabaseClient'

export async function GET() {
  const { data, error } = await supabase.from('equipos').select('*').limit(5)
  if (error) return new Response(JSON.stringify({ error }), { status: 500 })
  return new Response(JSON.stringify(data), { status: 200 })
}
