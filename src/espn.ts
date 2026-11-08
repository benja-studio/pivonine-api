import { fetchJson } from './http';
import { Liga } from './leagues';
import { aEspn, arDateKey, arDiaSemana, arHora, arISO, moverFecha } from './tz';

const SITE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const V2 = 'https://site.api.espn.com/apis/v2/sports/soccer';

export type Estado = 'programado' | 'en_vivo' | 'entretiempo' | 'finalizado' | 'suspendido' | 'postergado' | 'cancelado';

export function mapEstado(type: any): { estado: Estado; detalle: string } {
  const name: string = type?.name || '';
  const state: string = type?.state || 'pre';
  const detalle: Record<string, string> = {
    STATUS_HALFTIME: 'Entretiempo', STATUS_FINAL: 'Finalizado', STATUS_FULL_TIME: 'Finalizado',
    STATUS_POSTPONED: 'Postergado', STATUS_SUSPENDED: 'Suspendido', STATUS_CANCELED: 'Cancelado',
    STATUS_DELAYED: 'Demorado', STATUS_ABANDONED: 'Suspendido', STATUS_FORFEIT: 'Finalizado (por walkover)',
    STATUS_EXTRA_TIME: 'Alargue', STATUS_END_OF_EXTRATIME: 'Fin del alargue', STATUS_SHOOTOUT: 'Penales',
    STATUS_FIRST_HALF: 'Primer tiempo', STATUS_SECOND_HALF: 'Segundo tiempo',
    STATUS_FINAL_AET: 'Finalizado (alargue)', STATUS_FINAL_PEN: 'Finalizado (penales)',
    STATUS_SCHEDULED: 'Programado', STATUS_IN_PROGRESS: 'En juego',
  };
  const d = detalle[name] || (state === 'in' ? 'En juego' : state === 'post' ? 'Finalizado' : 'Programado');
  if (name === 'STATUS_HALFTIME') return { estado: 'entretiempo', detalle: d };
  if (name === 'STATUS_POSTPONED') return { estado: 'postergado', detalle: d };
  if (name === 'STATUS_CANCELED') return { estado: 'cancelado', detalle: d };
  if (name === 'STATUS_SUSPENDED' || name === 'STATUS_ABANDONED') return { estado: 'suspendido', detalle: d };
  if (state === 'in') return { estado: 'en_vivo', detalle: d };
  if (state === 'post') return { estado: 'finalizado', detalle: d };
  return { estado: 'programado', detalle: d };
}

const uniq = (a: string[]) => [...new Set(a.map((x) => x.trim()).filter(Boolean))];

export function normalizarPartido(ev: any, liga: Liga) {
  const comp = ev.competitions?.[0] || {};
  const cs: any[] = comp.competitors || [];
  const loc = cs.find((c) => c.homeAway === 'home') || cs[0] || {};
  const vis = cs.find((c) => c.homeAway === 'away') || cs[1] || {};
  const inicio = new Date(ev.date);
  const { estado, detalle } = mapEstado(ev.status?.type);
  const conMarcador = estado !== 'programado' && estado !== 'postergado' && estado !== 'cancelado';

  const eq = (c: any) => ({
    id: String(c.team?.id ?? ''),
    nombre: c.team?.shortDisplayName || c.team?.displayName || c.team?.name || 'Por definir',
    nombreCompleto: c.team?.displayName || null,
    abreviatura: c.team?.abbreviation || null,
    escudo: c.team?.logo || c.team?.logos?.[0]?.href || null,
    goles: conMarcador && c.score !== undefined && c.score !== '' ? Number(c.score) : null,
    tarjetasRojas: 0,
    goleadores: [] as { jugador: string; minuto: string; penal: boolean; enContra: boolean }[],
  });
  const local = eq(loc), visitante = eq(vis);

  for (const d of comp.details || []) {
    const esLocal = String(d.team?.id) === local.id;
    const lado = esLocal ? local : visitante;
    if (d.redCard) lado.tarjetasRojas += 1;
    if (d.scoringPlay) {
      lado.goleadores.push({
        jugador: d.athletesInvolved?.[0]?.shortName || d.athletesInvolved?.[0]?.displayName || 'Gol',
        minuto: d.clock?.displayValue || '',
        penal: !!d.penaltyKick,
        enContra: !!d.ownGoal,
      });
    }
  }

  const canales = uniq([
    ...(comp.broadcasts || []).flatMap((b: any) => b.names || []),
    ...(comp.geoBroadcasts || []).map((g: any) => g.media?.shortName).filter(Boolean),
  ]);

  return {
    id: String(ev.id),
    ligaId: liga.id,
    liga: { id: liga.id, nombre: liga.nombre, corto: liga.corto, pais: liga.pais, categoria: liga.categoria, logo: liga.logo },
    fecha: arDateKey(inicio),
    hora: arHora(inicio),
    diaSemana: arDiaSemana(inicio),
    inicioAR: arISO(inicio),
    inicioUTC: inicio.toISOString(),
    zonaHoraria: 'America/Argentina/Buenos_Aires',
    estado,
    detalleEstado: detalle,
    minuto: estado === 'en_vivo' ? ev.status?.displayClock || null : null,
    estadio: comp.venue?.fullName || null,
    ciudad: comp.venue?.address?.city || null,
    canales,
    local,
    visitante,
  };
}

// ESPN filtra por fecha en horario de EE.UU. Para no perder partidos nocturnos argentinos
// se pide una ventana de ±1 día (UNA sola request por liga) y se filtra por fecha ARGENTINA.
export async function partidosDeLiga(liga: Liga, fechaAR: string) {
  const desde = aEspn(moverFecha(fechaAR, -1));
  const hasta = aEspn(moverFecha(fechaAR, 1));
  const json = await fetchJson(`${SITE}/${liga.espn}/scoreboard?dates=${desde}-${hasta}&limit=300`);
  const logo = json?.leagues?.[0]?.logos?.[0]?.href as string | undefined;
  const partidos = (json?.events || [])
    .map((ev: any) => normalizarPartido(ev, logo ? { ...liga, logo } : liga))
    .filter((p: any) => p.fecha === fechaAR);
  return partidos;
}

// ---------------------------------------------------------------- TABLAS
const TRAD_NOTA: [RegExp, string][] = [
  [/champions league/i, 'Clasifica a Champions League'],
  [/europa league/i, 'Clasifica a Europa League'],
  [/conference league/i, 'Clasifica a Conference League'],
  [/libertadores/i, 'Clasifica a Copa Libertadores'],
  [/sudamericana|sud-?american/i, 'Clasifica a Copa Sudamericana'],
  [/relegation playoff|relegation play/i, 'Reclasificación por el descenso'],
  [/relegation/i, 'Descenso'],
  [/promotion playoff|promotion play/i, 'Reclasificación por el ascenso'],
  [/promotion/i, 'Ascenso'],
  [/playoff|play-off/i, 'Clasifica a playoffs'],
  [/knockout|round of 16/i, 'Clasifica a octavos de final'],
  [/quarter/i, 'Clasifica a cuartos de final'],
];
export const traducirNota = (d: string) => TRAD_NOTA.find(([re]) => re.test(d))?.[1] || d;

export function traducirGrupo(nombre: string) {
  return nombre
    .replace(/^group\s+/i, 'Grupo ')
    .replace(/^zone\s+/i, 'Zona ')
    .replace(/^apertura$/i, 'Apertura').replace(/^clausura$/i, 'Clausura')
    .replace(/^league phase$/i, 'Fase de liga')
    .replace(/^overall$/i, 'Posiciones');
}

export function normalizarTabla(json: any) {
  const grupos: any[] = Array.isArray(json?.children) && json.children.length
    ? json.children
    : json?.standings ? [{ name: json.name || 'Posiciones', standings: json.standings }] : [];
  const leyenda = new Map<string, { clave: string; color: string; descripcion: string }>();

  const out = grupos
    .map((g) => {
      const entries: any[] = g.standings?.entries || [];
      const filas = entries.map((e, i) => {
        const st = (n: string) => {
          const s = (e.stats || []).find((x: any) => x.name === n || x.abbreviation === n);
          return typeof s?.value === 'number' ? s.value : Number(s?.value ?? 0) || 0;
        };
        const nota = e.note;
        let zona: string | null = null;
        if (nota?.description) {
          zona = traducirNota(nota.description);
          leyenda.set(zona, { clave: zona, color: nota.color || '#999999', descripcion: zona });
        }
        const pj = st('gamesPlayed'), pts = st('points'), gf = st('pointsFor'), gc = st('pointsAgainst');
        return {
          posicion: st('rank') || i + 1,
          equipo: {
            id: String(e.team?.id ?? ''),
            nombre: e.team?.shortDisplayName || e.team?.displayName || 'Equipo',
            nombreCompleto: e.team?.displayName || null,
            abreviatura: e.team?.abbreviation || null,
            escudo: e.team?.logos?.[0]?.href || e.team?.logo || null,
          },
          pj, g: st('wins'), e: st('ties'), p: st('losses'),
          gf, gc, dif: e.stats?.some((x: any) => x.name === 'pointDifferential') ? st('pointDifferential') : gf - gc,
          pts,
          promedio: pj > 0 ? Math.round((pts / pj) * 1000) / 1000 : 0,
          zona,
          zonaColor: nota?.color || null,
        };
      });
      filas.sort((a, b) => a.posicion - b.posicion);
      return { nombre: traducirGrupo(g.name || 'Posiciones'), filas };
    })
    .filter((g) => g.filas.length);

  return { grupos: out, leyenda: [...leyenda.values()] };
}

export async function tablaDeLiga(ligaId: string, temporada?: string) {
  const q = temporada ? `?season=${encodeURIComponent(temporada)}` : '';
  const json = await fetchJson(`${V2}/${ligaId}/standings${q}`);
  return { ...normalizarTabla(json), temporada: json?.seasons?.[0]?.displayName || json?.season?.displayName || temporada || null };
}

// ---------------------------------------------------------------- DETALLE
const ETIQUETAS: [RegExp, string][] = [
  [/possession/i, 'Posesión (%)'], [/shotsontarget|shotsongoal/i, 'Remates al arco'], [/totalshots|^shots$/i, 'Remates totales'],
  [/corner/i, 'Tiros de esquina'], [/foulscommitted|^fouls$/i, 'Faltas'], [/offside/i, 'Posiciones adelantadas'],
  [/saves/i, 'Atajadas'], [/yellow/i, 'Tarjetas amarillas'], [/red/i, 'Tarjetas rojas'],
  [/accuratepass|passpct|passes/i, 'Pases'], [/tackle/i, 'Quites'], [/blocked/i, 'Remates bloqueados'],
];
const POS: Record<string, string> = { G: 'ARQ', GK: 'ARQ', D: 'DEF', DF: 'DEF', CD: 'DEF', CB: 'DEF', LB: 'DEF', RB: 'DEF', M: 'MED', MF: 'MED', CM: 'MED', DM: 'MED', AM: 'MED', LM: 'MED', RM: 'MED', F: 'DEL', FW: 'DEL', ST: 'DEL', CF: 'DEL', LW: 'DEL', RW: 'DEL', SUB: 'SUP' };

export async function detallePartido(ligaId: string, eventId: string) {
  const j = await fetchJson(`${SITE}/${ligaId}/summary?event=${encodeURIComponent(eventId)}`, 10000);
  const teams: any[] = j?.boxscore?.teams || [];
  const [a, b] = [teams.find((t) => t.homeAway === 'home') || teams[0], teams.find((t) => t.homeAway === 'away') || teams[1]];
  const mapa = new Map<string, { clave: string; etiqueta: string; local: string | null; visitante: string | null }>();
  const cargar = (t: any, lado: 'local' | 'visitante') => {
    for (const s of t?.statistics || []) {
      const et = ETIQUETAS.find(([re]) => re.test(s.name))?.[1] || s.label || s.name;
      const fila = mapa.get(s.name) || { clave: s.name, etiqueta: et, local: null, visitante: null };
      fila[lado] = s.displayValue ?? String(s.value ?? '');
      mapa.set(s.name, fila);
    }
  };
  cargar(a, 'local'); cargar(b, 'visitante');

  const alineaciones = (j?.rosters || []).map((r: any) => ({
    lado: r.homeAway === 'home' ? 'local' : 'visitante',
    equipoId: String(r.team?.id ?? ''),
    formacion: r.formation || null,
    jugadores: (r.roster || []).map((p: any) => ({
      id: String(p.athlete?.id ?? ''), nombre: p.athlete?.displayName || '', camiseta: p.jersey || null,
      posicion: POS[String(p.position?.abbreviation || '').toUpperCase()] || p.position?.abbreviation || null,
      titular: !!p.starter, ingreso: !!p.subbedIn, salio: !!p.subbedOut,
    })),
  }));

  const eventos = (j?.keyEvents || []).map((k: any) => ({
    minuto: k.clock?.displayValue || '', tipo: k.type?.text || '', texto: k.text || k.shortText || '',
    equipoId: k.team?.id ? String(k.team.id) : null,
  }));

  return {
    id: String(eventId),
    ligaId,
    estadisticas: [...mapa.values()],
    alineaciones,
    eventos,
    arbitro: j?.gameInfo?.officials?.[0]?.displayName || null,
    asistencia: j?.gameInfo?.attendance ?? null,
    estadio: j?.gameInfo?.venue?.fullName || null,
  };
}
