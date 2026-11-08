// Cliente listo para copiar a tu app (web, React Native, Node 18+). Sin dependencias.
// Uso:
//   const api = crearClienteElNine('https://elnine-api.TU-USUARIO.workers.dev');
//   const { partidos } = await api.partidos({ liga: 'arg.1' });

export type EstadoPartido = 'programado' | 'en_vivo' | 'entretiempo' | 'finalizado' | 'suspendido' | 'postergado' | 'cancelado';
export interface Equipo { id: string; nombre: string; nombreCompleto: string | null; abreviatura: string | null; escudo: string | null; goles: number | null; tarjetasRojas: number; goleadores: { jugador: string; minuto: string; penal: boolean; enContra: boolean }[] }
export interface Partido { id: string; ligaId: string; liga: { id: string; nombre: string; corto: string; pais: string; categoria: string; logo: string }; fecha: string; hora: string; diaSemana: string; inicioAR: string; inicioUTC: string; estado: EstadoPartido; detalleEstado: string; minuto: string | null; estadio: string | null; ciudad: string | null; canales: string[]; local: Equipo; visitante: Equipo }
export interface FilaTabla { posicion: number; equipo: { id: string; nombre: string; abreviatura: string | null; escudo: string | null }; pj: number; g: number; e: number; p: number; gf: number; gc: number; dif: number; pts: number; promedio: number; zona: string | null; zonaColor: string | null }
export interface GrupoTabla { nombre: string; filas: FilaTabla[] }

export function crearClienteElNine(baseUrl: string, apiKey?: string) {
  const base = baseUrl.replace(/\/$/, '');
  async function get<T>(ruta: string, params: Record<string, string | number | boolean | undefined> = {}): Promise<T> {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString();
    const res = await fetch(`${base}${ruta}${qs ? `?${qs}` : ''}`, { headers: apiKey ? { 'X-API-Key': apiKey } : {} });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error?.mensaje || `Error ${res.status}`);
    return json.data as T;
  }
  return {
    partidos: (o: { fecha?: string; liga?: string; envivo?: boolean } = {}) =>
      get<{ fecha: string; fechaLarga: string; total: number; partidos: Partido[] }>('/v1/partidos', { fecha: o.fecha, liga: o.liga, envivo: o.envivo ? 1 : undefined }),
    detalle: (liga: string, id: string) => get<any>(`/v1/partidos/${liga}/${id}`),
    tabla: (liga: string) => get<{ grupos: GrupoTabla[]; leyenda: { color: string; descripcion: string }[]; esMultiZona: boolean }>(`/v1/tablas/${liga}`),
    anual: (liga: string) => get<{ grupos: GrupoTabla[] }>(`/v1/tablas/${liga}/anual`),
    promedios: (liga: string) => get<{ grupos: GrupoTabla[] }>(`/v1/tablas/${liga}/promedios`),
    ligas: () => get<any[]>('/v1/ligas'),
    escudos: () => get<{ escudos: Record<string, string> }>('/v1/escudos'),
  };
}
