import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function registrarEquipo(nombre: string, categoria: string, genero: string) {
  const { data, error } = await supabase
    .from("equipos")
    .insert([{ nombre, categoria, genero }])

  if (error) throw error
  return data
}
