import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { LIGAS, ligaPorId } from './leagues';
import { detallePartido, partidosDeLiga, tablaDeLiga } from './espn';
import { diagnosticar, escudosDesdeHtml, leerElnine, normNombre, tablasDesdeHtml } from './elnine';
import { ZONA_HORARIA, esFechaValida, fechaLarga, hoyAR } from './tz';
import { PAGINA_DOCS } from './docs';

type Env = { Bindings: { API_KEY?: string; ELNINE_BASE?: string; ELNINE_ANUAL_URL?: string; ELNINE_PROMEDIOS_URL?: string } };
const app = new Hono<Env>();

app.use('*', cors({ origin: '*', allowMethods: ['GET', 'OPTIONS'], allowHeaders: ['X-API-Key', 'Content-Type'], maxAge: 86400 }));

// Clave opcional (solo si definís API_KEY en el Worker)
app.use('/v1/*', async (c, next) => {
  const key = c.env?.API_KEY;
  if (key && c.req.header('x-api-key') !== key && c.req.query('key') !== key) {
    return c.json({ ok: false, error: { codigo: 'NO_AUTORIZADO', mensaje: 'Falta o es incorrecto el header X-API-Key.' } }, 401);
  }
  await next();
});

const meta = (fuente: string, extra: object = {}) => ({ generadoEn: new Date().toISOString(), zonaHoraria: ZONA_HORARIA, fuente, ...extra });
const fail = (c: any, status: number, codigo: string, mensaje: string) => c.json({ ok: false, error: { codigo, mensaje } }, status);

// Caché en el borde (Cloudflare). En local/Node simplemente no cachea.
async function cached<T>(c: any, ttl: number, producir: () => Promise<T>): Promise<T> {
  const cache = (globalThis as any).caches?.default as Cache | undefined;
  const key = new Request(new URL(c.req.url).toString());
  if (cache) {
    const hit = await cache.match(key);
    if (hit) return (await hit.json()) as T;
  }
  const data = await producir();
  if (cache) {
    const res = new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json', 'cache-control': `public, max-age=${ttl}` } });
    c.executionCtx?.waitUntil?.(cache.put(key, res));
  }
  return data;
}

app.get('/', (c) => c.html(PAGINA_DOCS));
app.get('/v1/health', (c) => c.json({ ok: true, data: { estado: 'ok', ahoraAR: new Date().toISOString(), hoyAR: hoyAR() }, meta: meta('local') }));

app.get('/v1/ligas', (c) => c.json({ ok: true, data: LIGAS, meta: meta('catálogo') }));

// Escudos extraídos de elnine.com.ar: { "bocajuniors": "https://..." } indexado por nombre normalizado
async function escudosElnine(env: any) {
  const base = env?.ELNINE_BASE || 'https://elnine.com.ar';
  const r = await leerElnine(base + '/');
  return { mapa: r.ok ? escudosDesdeHtml(r.html, base) : {}, ok: r.ok, error: r.error };
}

app.get('/v1/partidos', async (c) => {
  const fecha = c.req.query('fecha') || hoyAR();
  if (!esFechaValida(fecha)) return fail(c, 400, 'FECHA_INVALIDA', 'Usá el formato AAAA-MM-DD, por ejemplo 2026-11-08.');
  const filtro = c.req.query('liga');
  const ligas = filtro ? filtro.split(',').map((x) => ligaPorId(x.trim())).filter(Boolean) : LIGAS;
  if (!ligas.length) return fail(c, 404, 'LIGA_INEXISTENTE', 'Liga no encontrada. Consultá /v1/ligas.');
  const soloVivo = c.req.query('envivo') === '1';
  const ttl = fecha === hoyAR() ? 15 : 300;

  const data = await cached(c, ttl, async () => {
    const [rs, el] = await Promise.all([
      Promise.allSettled(ligas.map((l) => partidosDeLiga(l!, fecha))),
      escudosElnine(c.env),
    ]);
    const errores: { liga: string; error: string }[] = [];
    let partidos = rs.flatMap((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      errores.push({ liga: ligas[i]!.id, error: String(r.reason?.message || r.reason) });
      return [];
    });
    let escudosElnineUsados = 0;
    for (const p of partidos) {
      for (const lado of [p.local, p.visitante]) {
        const e = el.mapa[normNombre(lado.nombreCompleto || lado.nombre)] || el.mapa[normNombre(lado.nombre)];
        if (e) { lado.escudo = e; escudosElnineUsados++; }
      }
    }
    partidos.sort((a, b) => a.inicioUTC.localeCompare(b.inicioUTC) || LIGAS.findIndex((l) => l.id === a.ligaId) - LIGAS.findIndex((l) => l.id === b.ligaId));
    return { partidos, errores, elnine: { ok: el.ok, error: el.error, escudosAplicados: escudosElnineUsados } };
  });

  const partidos = soloVivo ? data.partidos.filter((p: any) => p.estado === 'en_vivo' || p.estado === 'entretiempo') : data.partidos;
  return c.json({
    ok: true,
    data: { fecha, fechaLarga: fechaLarga(fecha), total: partidos.length, partidos },
    meta: meta('ESPN + elnine.com.ar (escudos)', { ligasConsultadas: ligas.length, errores: data.errores, elnine: data.elnine }),
  });
});

app.get('/v1/envivo', (c) => c.redirect('/v1/partidos?envivo=1', 302));

app.get('/v1/partidos/:liga/:id', async (c) => {
  const liga = ligaPorId(c.req.param('liga'));
  if (!liga) return fail(c, 404, 'LIGA_INEXISTENTE', 'Liga no encontrada.');
  try {
    const data = await cached(c, 20, () => detallePartido(liga.id, c.req.param('id')));
    return c.json({ ok: true, data, meta: meta('ESPN') });
  } catch (e: any) {
    return fail(c, 502, 'FUENTE_NO_DISPONIBLE', String(e?.message || e));
  }
});

app.get('/v1/tablas/:liga', async (c) => {
  const liga = ligaPorId(c.req.param('liga'));
  if (!liga) return fail(c, 404, 'LIGA_INEXISTENTE', 'Liga no encontrada.');
  try {
    const data = await cached(c, 600, () => tablaDeLiga(liga.id, c.req.query('temporada')));
    if (!data.grupos.length) return fail(c, 404, 'SIN_TABLA', 'Esta competencia no tiene tabla de posiciones disponible (por ejemplo, copas de eliminación directa).');
    return c.json({ ok: true, data: { liga, ...data, esMultiZona: data.grupos.length > 1 }, meta: meta('ESPN') });
  } catch (e: any) {
    return fail(c, 502, 'FUENTE_NO_DISPONIBLE', String(e?.message || e));
  }
});

// Tabla anual / promedios: ESPN no las publica. Se leen de elnine.com.ar (URL configurable).
for (const tipo of ['anual', 'promedios'] as const) {
  app.get(`/v1/tablas/:liga/${tipo}`, async (c) => {
    const url = tipo === 'anual' ? c.env?.ELNINE_ANUAL_URL : c.env?.ELNINE_PROMEDIOS_URL;
    if (!url) {
      return fail(c, 501, 'NO_CONFIGURADA', `Falta configurar ELNINE_${tipo.toUpperCase()}_URL en wrangler.toml con la página de elnine.com.ar donde está la tabla ${tipo}.`);
    }
    const data = await cached(c, 900, async () => {
      const r = await leerElnine(url);
      return { ok: r.ok, error: r.error, grupos: r.ok ? tablasDesdeHtml(r.html, url).map((t) => ({ nombre: t.titulo, filas: t.filas })) : [] };
    });
    if (!data.ok) return fail(c, 502, 'ELNINE_NO_RESPONDE', `No se pudo leer elnine.com.ar: ${data.error}`);
    if (!data.grupos.length) return fail(c, 404, 'TABLA_NO_ENCONTRADA', 'La página cargó pero no se encontró una tabla con columnas PJ/PTS. Revisá /v1/debug/elnine?url=...');
    return c.json({ ok: true, data: { liga: ligaPorId(c.req.param('liga')) ?? null, tipo, grupos: data.grupos }, meta: meta('elnine.com.ar') });
  });
}

app.get('/v1/escudos', async (c) => {
  const el = await escudosElnine(c.env);
  return c.json({ ok: el.ok, data: { total: Object.keys(el.mapa).length, escudos: el.mapa }, meta: meta('elnine.com.ar', { error: el.error }) });
});

app.get('/v1/debug/elnine', async (c) => {
  const base = c.env?.ELNINE_BASE || 'https://elnine.com.ar';
  const url = c.req.query('url') || base + '/';
  if (!url.startsWith(base)) return fail(c, 400, 'URL_NO_PERMITIDA', `Solo se permiten URLs de ${base}`);
  const r = await leerElnine(url);
  return c.json({ ok: r.ok, data: { url, status: r.status, ms: r.ms, error: r.error, ...diagnosticar(r.html, url) }, meta: meta('elnine.com.ar') });
});

app.notFound((c) => fail(c, 404, 'RUTA_INEXISTENTE', 'Ruta inexistente. Mirá la documentación en la raíz (/).'));
app.onError((e, c) => fail(c, 500, 'ERROR_INTERNO', String(e?.message || e)));

export default app;
