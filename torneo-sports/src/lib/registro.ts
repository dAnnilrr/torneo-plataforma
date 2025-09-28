import { supabase } from "../lib/supabaseClient";
import { Categoria, Genero } from "./types";

export async function registrarEquipo(
  nombre: string,
  categoria: Categoria,
  genero: Genero
) {
  const { data, error } = await supabase
    .from("equipos")
    .insert([{ nombre, categoria, genero }]); // ⚡️ No agregues id

  if (error) throw error;

  return data;
}
