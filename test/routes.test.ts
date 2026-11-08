import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/index';

const scoreboard = { leagues: [{ logos: [{ href: 'liga.png' }] }], events: [
  { id: 10, date: '2026-11-09T00:00Z', status: { type: { name: 'STATUS_SCHEDULED', state: 'pre' } }, competitions: [{ competitors: [
    { homeAway: 'home', team: { id: '1', displayName: 'Boca Juniors', shortDisplayName: 'Boca', logo: 'espn-boca.png' } },
    { homeAway: 'away', team: { id: '2', displayName: 'River Plate', shortDisplayName: 'River' } }] }] },
  { id: 11, date: '2026-11-10T12:00Z', status: { type: { name: 'STATUS_SCHEDULED', state: 'pre' } }, competitions: [{ competitors: [] }] },
] };

test('GET /v1/partidos filtra por día argentino y usa escudo de elnine', async () => {
  globalThis.fetch = (async (url: any) => {
    const u = String(url);
    if (u.includes('elnine.com.ar')) return new Response('<img alt="Boca Juniors" src="/boca.png">', { status: 200 });
    return new Response(JSON.stringify(scoreboard), { status: 200 });
  }) as any;
  const res = await app.request('/v1/partidos?fecha=2026-11-08&liga=arg.1');
  const j: any = await res.json();
  assert.equal(j.ok, true);
  assert.equal(j.data.total, 1);                     // el del 10/11 queda afuera
  assert.equal(j.data.partidos[0].hora, '21:00');
  assert.equal(j.data.partidos[0].local.escudo, 'https://elnine.com.ar/boca.png');
  assert.equal(j.data.partidos[0].visitante.escudo, null);
});
test('errores claros', async () => {
  assert.equal((await app.request('/v1/partidos?fecha=hoy')).status, 400);
  assert.equal((await app.request('/v1/partidos?liga=xxx')).status, 404);
  assert.equal((await app.request('/v1/tablas/arg.1/anual')).status, 501);
});
test('API key opcional', async () => {
  const r = await app.request('/v1/ligas', {}, { API_KEY: 'secreta' } as any);
  assert.equal(r.status, 401);
  const ok = await app.request('/v1/ligas', { headers: { 'x-api-key': 'secreta' } }, { API_KEY: 'secreta' } as any);
  assert.equal(ok.status, 200);
});
test('una liga caída no rompe el resto', async () => {
  globalThis.fetch = (async (url: any) => {
    const u = String(url);
    if (u.includes('elnine')) return new Response('', { status: 403 });
    if (u.includes('arg.copa')) return new Response('x', { status: 500 });
    return new Response(JSON.stringify(scoreboard), { status: 200 });
  }) as any;
  const j: any = await (await app.request('/v1/partidos?fecha=2026-11-08&liga=arg.1,arg.copa')).json();
  assert.equal(j.data.total, 1); assert.equal(j.meta.errores.length, 1); assert.equal(j.meta.elnine.ok, false);
});
