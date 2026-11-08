import { parse } from 'node-html-parser';
import { fetchText } from './http';

// ---------------------------------------------------------------------------------------------
// Lectura de elnine.com.ar (escudos / logos / tablas que ESPN no tiene, como la anual).
// IMPORTANTE: elnine no publica una API, así que esto lee el HTML. Si el sitio cambia o bloquea
// servidores, /v1/debug/elnine?url=... muestra qué está viendo el Worker para ajustar.
// ---------------------------------------------------------------------------------------------

export const normNombre = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/\b(club|atletico|deportivo|cd|ca|c\.a\.|fc|de|la|el|sc)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, '');

const absoluta = (src: string, base: string) => {
  try { return new URL(src, base).toString(); } catch { return null; }
};

const bestSrc = (el: any) => {
  const srcset = el.getAttribute('srcset') || el.getAttribute('data-srcset');
  if (srcset) {
    const last = srcset.split(',').map((x: string) => x.trim().split(/\s+/)[0]).filter(Boolean).pop();
    if (last) return last;
  }
  return el.getAttribute('data-src') || el.getAttribute('data-lazy-src') || el.getAttribute('src') || '';
};

/** Escudos: cualquier <img> con alt = nombre del equipo (funciona sin conocer la estructura del sitio). */
export function escudosDesdeHtml(html: string, baseUrl: string) {
  const root = parse(html);
  const mapa: Record<string, string> = {};
  for (const img of root.querySelectorAll('img')) {
    const alt = (img.getAttribute('alt') || img.getAttribute('title') || '').trim();
    const src = bestSrc(img);
    if (!alt || !src || src.startsWith('data:')) continue;
    if (/^(logo|icono|icon|banner|ad|publicidad)$/i.test(alt) || alt.length > 40) continue;
    const abs = absoluta(src, baseUrl);
    if (abs) mapa[normNombre(alt)] = abs;
  }
  // Next.js <Image> codifica la URL real en /_next/image?url=...
  for (const k of Object.keys(mapa)) {
    try {
      const u = new URL(mapa[k]);
      if (u.pathname.startsWith('/_next/image') && u.searchParams.get('url')) {
        mapa[k] = absoluta(decodeURIComponent(u.searchParams.get('url')!), baseUrl) || mapa[k];
      }
    } catch {}
  }
  return mapa;
}

/** Tabla genérica: busca <table> con encabezados PJ / PTS y devuelve filas normalizadas. */
export function tablasDesdeHtml(html: string, baseUrl: string) {
  const root = parse(html);
  const salida: { titulo: string; filas: any[] }[] = [];
  for (const table of root.querySelectorAll('table')) {
    const heads = table.querySelectorAll('thead th, tr:first-child th').map((h) => h.text.trim().toUpperCase());
    const idx = (...names: string[]) => heads.findIndex((h) => names.includes(h));
    const iPJ = idx('PJ', 'J', 'PG'), iPts = idx('PTS', 'PUNTOS', 'P'), iClub = idx('EQUIPO', 'CLUB', 'EQUIPOS');
    if (iPJ < 0 || iPts < 0) continue;
    const num = (cells: any[], i: number) => (i >= 0 ? Number((cells[i]?.text || '0').replace(/[^\d.,-]/g, '').replace(',', '.')) || 0 : 0);
    const iG = idx('G', 'PG'), iE = idx('E', 'PE'), iP = idx('PP', 'PERD'), iGF = idx('GF'), iGC = idx('GC'), iDif = idx('DIF', 'DG');
    const iProm = idx('PROM', 'PROMEDIO');
    const filas: any[] = [];
    for (const tr of table.querySelectorAll('tbody tr')) {
      const cells = tr.querySelectorAll('td');
      if (cells.length < 3) continue;
      const nombre = (iClub >= 0 ? cells[iClub] : cells[1])?.text.replace(/\s+/g, ' ').trim();
      if (!nombre) continue;
      const img = tr.querySelector('img');
      const gf = num(cells, iGF), gc = num(cells, iGC), pj = num(cells, iPJ), pts = num(cells, iPts);
      filas.push({
        posicion: filas.length + 1,
        equipo: { id: '', nombre, escudo: img ? absoluta(bestSrc(img), baseUrl) : null },
        pj, g: num(cells, iG), e: num(cells, iE), p: num(cells, iP), gf, gc,
        dif: iDif >= 0 ? num(cells, iDif) : gf - gc, pts,
        promedio: iProm >= 0 ? num(cells, iProm) : pj ? Math.round((pts / pj) * 1000) / 1000 : 0,
        zona: null, zonaColor: null,
      });
    }
    if (filas.length >= 2) {
      const prev = table.previousElementSibling?.text?.trim();
      salida.push({ titulo: prev && prev.length < 60 ? prev : `Tabla ${salida.length + 1}`, filas });
    }
  }
  return salida;
}

export async function leerElnine(url: string) {
  const t0 = Date.now();
  try {
    const r = await fetchText(url, 9000);
    return { ok: r.ok, status: r.status, html: r.text, ms: Date.now() - t0, error: r.ok ? null : `HTTP ${r.status}` };
  } catch (e: any) {
    return { ok: false, status: 0, html: '', ms: Date.now() - t0, error: e?.name === 'AbortError' ? 'Tiempo agotado' : String(e?.message || e) };
  }
}

/** Diagnóstico: qué ve el Worker en la página. */
export function diagnosticar(html: string, baseUrl: string) {
  const root = parse(html);
  return {
    bytes: html.length,
    titulo: root.querySelector('title')?.text || null,
    bloqueado: /cf-chl|captcha|just a moment|access denied|attention required/i.test(html),
    scripts: root.querySelectorAll('script').length,
    nextData: !!root.querySelector('#__NEXT_DATA__'),
    imagenes: root.querySelectorAll('img').length,
    tablas: root.querySelectorAll('table').length,
    escudosDetectados: Object.keys(escudosDesdeHtml(html, baseUrl)).length,
    tablasDetectadas: tablasDesdeHtml(html, baseUrl).map((t) => ({ titulo: t.titulo, filas: t.filas.length })),
    muestra: html.slice(0, 600),
  };
}
