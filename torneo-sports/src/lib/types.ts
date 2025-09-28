export type Categoria = "prepa" | "profesional";
export type Genero = "varonil" | "femenil";

export type EquipoType = {
  id?: number;
  nombre: string;
  categoria: Categoria;
  genero: Genero;
  created_at?: string;
};