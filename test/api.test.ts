import test from 'node:test';
import assert from 'node:assert/strict';
import { arDateKey, arHora, arISO, moverFecha, esFechaValida } from '../src/tz';
import { normalizarPartido, normalizarTabla, mapEstado } from '../src/espn';
import { escudosDesdeHtml, tablasDesdeHtml, normNombre } from '../src/elnine';
import { ligaPorId } from '../src/leagues';

test('horario argentino: 00:00 UTC es 21:00 del día anterior', () => {
  const d = new Date('2026-11-09T00:00:00Z');
  assert.equal(arDateKey(d), '2026-11-08');
  assert.equal(arHora(d), '21:00');
  assert.equal(arISO(d), '2026-11-08T21:00:00-03:00');
});
test('horario argentino: no depende de la zona del servidor', () => {
  assert.equal(arHora(new Date('2026-01-15T15:30:00Z')), '12:30');
});
test('fechas', () => {
  assert.equal(moverFecha('2026-03-01', -1), '2026-02-28');
  assert.equal(moverFecha('2026-12-31', 1), '2027-01-01');
  assert.ok(esFechaValida('2026-11-08'));
  assert.ok(!esFechaValida('2026-02-30'));
});
test('estados', () => {
  assert.equal(mapEstado({ name: 'STATUS_HALFTIME', state: 'in' }).estado, 'entretiempo');
  assert.equal(mapEstado({ name: 'STATUS_FULL_TIME', state: 'post' }).estado, 'finalizado');
  assert.equal(mapEstado({ name: 'STATUS_POSTPONED', state: 'pre' }).estado, 'postergado');
});
test('partido ESPN → normalizado, con goles, rojas y hora AR', () => {
  const ev = {
    id: 1, date: '2026-11-09T00:30Z',
    status: { displayClock: "67'", type: { name: 'STATUS_IN_PROGRESS', state: 'in' } },
    competitions: [{
      venue: { fullName: 'La Bombonera', address: { city: 'Buenos Aires' } },
      broadcasts: [{ names: ['ESPN Premium'] }], geoBroadcasts: [{ media: { shortName: 'ESPN Premium' } }, { media: { shortName: 'TNT Sports' } }],
      competitors: [
        { homeAway: 'home', score: '2', team: { id: '5', shortDisplayName: 'Boca', displayName: 'Boca Juniors', logo: 'x.png' } },
        { homeAway: 'away', score: '1', team: { id: '16', shortDisplayName: 'River', displayName: 'River Plate' } },
      ],
      details: [
        { scoringPlay: true, team: { id: '5' }, clock: { displayValue: "10'" }, athletesInvolved: [{ shortName: 'Cavani' }] },
        { scoringPlay: true, penaltyKick: true, team: { id: '16' }, clock: { displayValue: "50'" }, athletesInvolved: [{ shortName: 'Borja' }] },
        { redCard: true, team: { id: '16' } },
      ],
    }],
  };
  const p = normalizarPartido(ev, ligaPorId('arg.1')!);
  assert.equal(p.fecha, '2026-11-08'); assert.equal(p.hora, '21:30'); assert.equal(p.estado, 'en_vivo');
  assert.equal(p.local.goles, 2); assert.equal(p.visitante.tarjetasRojas, 1);
  assert.equal(p.visitante.goleadores[0].penal, true);
  assert.deepEqual(p.canales, ['ESPN Premium', 'TNT Sports']);
});
test('partido programado no inventa marcador', () => {
  const p = normalizarPartido({ id: 2, date: '2026-11-08T22:00Z', status: { type: { name: 'STATUS_SCHEDULED', state: 'pre' } },
    competitions: [{ competitors: [{ homeAway: 'home', score: '0', team: { id: '1', displayName: 'A' } }, { homeAway: 'away', score: '0', team: { id: '2', displayName: 'B' } }] }] }, ligaPorId('arg.1')!);
  assert.equal(p.local.goles, null); assert.deepEqual(p.canales, []);
});
test('tabla con zonas A/B y leyenda', () => {
  const entry = (id: string, rank: number, pts: number, note?: any) => ({
    team: { id, displayName: `Eq ${id}`, logos: [{ href: `${id}.png` }] }, note,
    stats: [{ name: 'rank', value: rank }, { name: 'gamesPlayed', value: 10 }, { name: 'wins', value: 3 }, { name: 'ties', value: 1 }, { name: 'losses', value: 0 }, { name: 'pointsFor', value: 9 }, { name: 'pointsAgainst', value: 4 }, { name: 'points', value: pts }],
  });
  const t = normalizarTabla({ children: [
    { name: 'Zona A', standings: { entries: [entry('2', 2, 20), entry('1', 1, 25, { color: '#00ff00', description: 'Libertadores' })] } },
    { name: 'Zona B', standings: { entries: [entry('3', 1, 22)] } },
  ] });
  assert.equal(t.grupos.length, 2);
  assert.equal(t.grupos[0].nombre, 'Zona A');
  assert.equal(t.grupos[0].filas[0].equipo.id, '1');           // ordenado por posición
  assert.equal(t.grupos[0].filas[0].zona, 'Clasifica a Copa Libertadores');
  assert.equal(t.grupos[0].filas[0].dif, 5);
  assert.equal(t.grupos[0].filas[0].promedio, 2.5);
  assert.equal(t.leyenda.length, 1);
});
test('escudos desde <img alt> (incluye /_next/image y lazy)', () => {
  const html = `<img alt="Boca Juniors" src="/img/boca.png"><img alt="River Plate" data-src="https://cdn.x/river.svg" src="data:image/gif;base64,AAA">
  <img alt="Racing Club" src="/_next/image?url=%2Fe%2Fracing.png&w=64"><img alt="logo" src="/l.png">`;
  const m = escudosDesdeHtml(html, 'https://elnine.com.ar/');
  assert.equal(m[normNombre('Boca Juniors')], 'https://elnine.com.ar/img/boca.png');
  assert.equal(m[normNombre('River Plate')], 'https://cdn.x/river.svg');
  assert.equal(m[normNombre('Racing Club')], 'https://elnine.com.ar/e/racing.png');
  assert.equal(Object.keys(m).length, 3);
});
test('tabla genérica HTML (anual)', () => {
  const html = `<h3>Tabla anual 2026</h3><table><thead><tr><th>#</th><th>Equipo</th><th>PTS</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DIF</th></tr></thead><tbody>
  <tr><td>1</td><td><img src="/b.png">Vélez</td><td>60</td><td>30</td><td>18</td><td>6</td><td>6</td><td>40</td><td>20</td><td>+20</td></tr>
  <tr><td>2</td><td>Racing</td><td>55</td><td>30</td><td>16</td><td>7</td><td>7</td><td>35</td><td>25</td><td>+10</td></tr></tbody></table>`;
  const t = tablasDesdeHtml(html, 'https://elnine.com.ar/');
  assert.equal(t[0].filas.length, 2); assert.equal(t[0].filas[0].pts, 60); assert.equal(t[0].filas[0].dif, 20);
  assert.equal(t[0].filas[0].equipo.escudo, 'https://elnine.com.ar/b.png'); assert.equal(t[0].titulo, 'Tabla anual 2026');
});
