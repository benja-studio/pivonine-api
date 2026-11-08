// Argentina no usa horario de verano: es UTC-3 todo el año (America/Argentina/Buenos_Aires).
// Por eso se calcula con un offset fijo, sin depender de la zona del servidor ni del navegador.
const AR_OFFSET_MS = -3 * 3600 * 1000;
export const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';

export const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

const p2 = (n: number) => String(n).padStart(2, '0');

export function arParts(d: Date) {
  const s = new Date(d.getTime() + AR_OFFSET_MS);
  return {
    y: s.getUTCFullYear(), m: s.getUTCMonth() + 1, d: s.getUTCDate(),
    hh: s.getUTCHours(), mm: s.getUTCMinutes(), ss: s.getUTCSeconds(), dow: s.getUTCDay(),
  };
}
export const arDateKey = (d: Date) => { const p = arParts(d); return `${p.y}-${p2(p.m)}-${p2(p.d)}`; };
export const arHora = (d: Date) => { const p = arParts(d); return `${p2(p.hh)}:${p2(p.mm)}`; };
export const arISO = (d: Date) => { const p = arParts(d); return `${arDateKey(d)}T${p2(p.hh)}:${p2(p.mm)}:${p2(p.ss)}-03:00`; };
export const arDiaSemana = (d: Date) => DIAS[arParts(d).dow];
export const hoyAR = () => arDateKey(new Date());

export const esFechaValida = (k: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return false;
  const [y, m, d] = k.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
};

export function moverFecha(key: string, dias: number) {
  const [y, m, d] = key.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + dias));
  return `${t.getUTCFullYear()}-${p2(t.getUTCMonth() + 1)}-${p2(t.getUTCDate())}`;
}
export const aEspn = (key: string) => key.replace(/-/g, '');

export function fechaLarga(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DIAS[dow]} ${d} de ${MESES[m - 1]} de ${y}`;
}
