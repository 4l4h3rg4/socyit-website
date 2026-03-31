export interface Division {
  id: string;
  nombre: string;
  slug: string;
  descripcion_corta: string;
  descripcion_extendida: string;
  sobre_division: string;
  planes: string[];
  como_apoyamos: string;
  tags: string[];
  color_hex: string;
  icono: string;
  orden: number;
  activa: boolean;
  creada_en: string;
  actualizada_en: string;
  lider?: Lider;
}

export interface Lider {
  id: string;
  division_id: string;
  nombre: string;
  rol: string;
  contexto: string;
  foto_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
}

export interface Suscriptor {
  id: string;
  email: string;
  suscrito_en: string;
}
