import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================================
// COMPONENTE GLOBAL DE ICONOS: GOOGLE MATERIAL SYMBOLS ROUNDED (CERO EMOJIS)
// ============================================================================
const Icon = ({ name, className = '', filled = false, size = 20, style = {} }) => (
  <span
    className={`material-symbols-rounded select-none inline-flex items-center justify-center leading-none shrink-0 ${className}`}
    style={{
      fontSize: typeof size === 'number' ? `${size}px` : size,
      fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
      ...style
    }}
    aria-hidden="true"
  >
    {name}
  </span>
);

// ============================================================================
// ICONO VECTORIAL DE TARJETA DISCIPLINARIA (AMARILLA / ROJA / DOBLE AMARILLA)
// ============================================================================
const CardBadge = ({ type = 'yellow', count = 1, className = '' }) => {
  const isRed = type === 'red';
  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      title={isRed ? 'Tarjeta Roja' : 'Tarjeta Amarilla'}
    >
      <span
        className={`w-2.5 h-3.5 rounded-[2px] inline-block shrink-0 border ${
          isRed
            ? 'bg-[#ff3b3b] border-red-300/40 shadow-[0_0_8px_rgba(255,59,59,0.5)]'
            : 'bg-[#facc15] border-yellow-200/40 shadow-[0_0_8px_rgba(250,204,21,0.35)]'
        }`}
      />
      {count > 1 && (
        <span className="text-[10px] font-heading font-bold text-[#f5f5f5]">{count}</span>
      )}
    </span>
  );
};

// ============================================================================
// CATÁLOGO OFICIAL DE LIGAS CON LOGOS OFICIALES EXTRAÍDOS DE CDN / API
// ============================================================================
const LEAGUES_CATALOG = [
  // ARGENTINA
  {
    id: 'arg.1',
    espnSlug: 'arg.1',
    name: 'Liga Profesional Argentina',
    shortName: 'Liga Profesional',
    country: 'Argentina',
    countryCode: 'ARG',
    category: 'Argentina',
    priority: 1,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/1.png',
    tvDefault: ['ESPN Premium', 'TNT Sports']
  },
  {
    id: 'arg.copa',
    espnSlug: 'arg.copa',
    name: 'Copa Argentina',
    shortName: 'Copa Argentina',
    country: 'Argentina',
    countryCode: 'ARG',
    category: 'Argentina',
    priority: 2,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2192.png',
    tvDefault: ['TyC Sports']
  },
  {
    id: 'arg.2',
    espnSlug: 'arg.2',
    name: 'Primera Nacional',
    shortName: 'Primera Nacional',
    country: 'Argentina',
    countryCode: 'ARG',
    category: 'Argentina',
    priority: 3,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/202.png',
    tvDefault: ['TyC Sports', 'DSports']
  },
  // CONMEBOL
  {
    id: 'conmebol.libertadores',
    espnSlug: 'conmebol.libertadores',
    name: 'CONMEBOL Libertadores',
    shortName: 'Copa Libertadores',
    country: 'Sudamérica',
    countryCode: 'CON',
    category: 'CONMEBOL',
    priority: 4,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/13.png',
    tvDefault: ['Fox Sports', 'Disney+', 'Telefe']
  },
  {
    id: 'conmebol.sudamericana',
    espnSlug: 'conmebol.sudamericana',
    name: 'CONMEBOL Sudamericana',
    shortName: 'Copa Sudamericana',
    country: 'Sudamérica',
    countryCode: 'CON',
    category: 'CONMEBOL',
    priority: 5,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/1931.png',
    tvDefault: ['ESPN', 'DSports', 'Disney+']
  },
  // TOP EUROPA
  {
    id: 'uefa.champions',
    espnSlug: 'uefa.champions',
    name: 'UEFA Champions League',
    shortName: 'Champions League',
    country: 'Europa',
    countryCode: 'EUR',
    category: 'Top Europa',
    priority: 6,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png',
    tvDefault: ['ESPN', 'Fox Sports', 'Disney+']
  },
  {
    id: 'uefa.europa',
    espnSlug: 'uefa.europa',
    name: 'UEFA Europa League',
    shortName: 'Europa League',
    country: 'Europa',
    countryCode: 'EUR',
    category: 'Top Europa',
    priority: 7,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2310.png',
    tvDefault: ['ESPN', 'Disney+']
  },
  {
    id: 'eng.1',
    espnSlug: 'eng.1',
    name: 'Premier League',
    shortName: 'Premier League',
    country: 'Inglaterra',
    countryCode: 'ING',
    category: 'Top Europa',
    priority: 8,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png',
    tvDefault: ['ESPN', 'Disney+']
  },
  {
    id: 'esp.1',
    espnSlug: 'esp.1',
    name: 'LaLiga EA Sports',
    shortName: 'LaLiga',
    country: 'España',
    countryCode: 'ESP',
    category: 'Top Europa',
    priority: 9,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png',
    tvDefault: ['DSports', 'ESPN', 'Disney+']
  },
  {
    id: 'ita.1',
    espnSlug: 'ita.1',
    name: 'Serie A Enilive',
    shortName: 'Serie A',
    country: 'Italia',
    countryCode: 'ITA',
    category: 'Top Europa',
    priority: 10,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/12.png',
    tvDefault: ['ESPN', 'Disney+']
  },
  {
    id: 'ger.1',
    espnSlug: 'ger.1',
    name: 'Bundesliga',
    shortName: 'Bundesliga',
    country: 'Alemania',
    countryCode: 'ALE',
    category: 'Top Europa',
    priority: 11,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png',
    tvDefault: ['ESPN', 'Disney+']
  },
  {
    id: 'fra.1',
    espnSlug: 'fra.1',
    name: 'Ligue 1 McDonald’s',
    shortName: 'Ligue 1',
    country: 'Francia',
    countryCode: 'FRA',
    category: 'Top Europa',
    priority: 12,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/9.png',
    tvDefault: ['ESPN', 'Disney+']
  },
  // AMÉRICA Y MUNDO
  {
    id: 'bra.1',
    espnSlug: 'bra.1',
    name: 'Brasileirão Betano',
    shortName: 'Brasileirão',
    country: 'Brasil',
    countryCode: 'BRA',
    category: 'América & Mundo',
    priority: 13,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/85.png',
    tvDefault: ['Globo', 'Fanatiz']
  },
  {
    id: 'uru.1',
    espnSlug: 'uru.1',
    name: 'Campeonato Uruguayo',
    shortName: 'Liga Uruguaya',
    country: 'Uruguay',
    countryCode: 'URU',
    category: 'América & Mundo',
    priority: 14,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/1751.png',
    tvDefault: ['VTV Plus', 'Disney+']
  },
  {
    id: 'col.1',
    espnSlug: 'col.1',
    name: 'Liga BetPlay Dimayor',
    shortName: 'Liga BetPlay',
    country: 'Colombia',
    countryCode: 'COL',
    category: 'América & Mundo',
    priority: 15,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/1543.png',
    tvDefault: ['Win Sports+', 'RCN']
  },
  {
    id: 'usa.1',
    espnSlug: 'usa.1',
    name: 'Major League Soccer',
    shortName: 'MLS',
    country: 'Estados Unidos',
    countryCode: 'USA',
    category: 'América & Mundo',
    priority: 16,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/19.png',
    tvDefault: ['MLS Season Pass', 'Apple TV']
  },
  {
    id: 'mex.1',
    espnSlug: 'mex.1',
    name: 'Liga MX Apertura/Clausura',
    shortName: 'Liga MX',
    country: 'México',
    countryCode: 'MEX',
    category: 'América & Mundo',
    priority: 17,
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/22.png',
    tvDefault: ['TUDN', 'ViX Premium']
  }
];

// ============================================================================
// CATÁLOGO DE LOGOS Y ESTILOS DE CANALES DE TV EN ESPAÑOL
// ============================================================================
const TV_CHANNELS_CATALOG = {
  'TNT Sports': {
    short: 'TNT SPORTS',
    accent: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(244, 63, 94, 0.35)',
    code: 'TNT'
  },
  'ESPN Premium': {
    short: 'ESPN PREMIUM',
    accent: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
    code: 'ESPN+'
  },
  ESPN: {
    short: 'ESPN',
    accent: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.35)',
    code: 'ESPN'
  },
  'TyC Sports': {
    short: 'TYC SPORTS',
    accent: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.35)',
    code: 'TyC'
  },
  'Disney+': {
    short: 'DISNEY+',
    accent: '#60a5fa',
    bg: 'rgba(96, 165, 250, 0.12)',
    border: 'rgba(96, 165, 250, 0.35)',
    code: 'D+'
  },
  DSports: {
    short: 'DSPORTS',
    accent: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.35)',
    code: 'DSP'
  },
  'Fox Sports': {
    short: 'FOX SPORTS',
    accent: '#fb923c',
    bg: 'rgba(251, 146, 60, 0.12)',
    border: 'rgba(251, 146, 60, 0.35)',
    code: 'FOX'
  },
  Telefe: {
    short: 'TELEFE',
    accent: '#34d399',
    bg: 'rgba(52, 211, 153, 0.12)',
    border: 'rgba(52, 211, 153, 0.35)',
    code: 'TLF'
  },
  'MLS Season Pass': {
    short: 'MLS PASS',
    accent: '#ccff00',
    bg: 'rgba(204, 255, 0, 0.12)',
    border: 'rgba(204, 255, 0, 0.35)',
    code: 'MLS'
  },
  'Apple TV': {
    short: 'APPLE TV',
    accent: '#e5e7eb',
    bg: 'rgba(229, 231, 235, 0.1)',
    border: 'rgba(229, 231, 235, 0.25)',
    code: 'ATV'
  }
};

// Normalizador de cadenas de canales de TV a lista de canales limpios
const normalizeTvChannels = (rawTv, defaultList = []) => {
  if (!rawTv) return defaultList;
  if (Array.isArray(rawTv)) {
    const clean = rawTv.flatMap((item) => String(item).split(/[/,|]/).map((s) => s.trim())).filter(Boolean);
    return clean.length > 0 ? clean.slice(0, 3) : defaultList;
  }
  const split = String(rawTv)
    .split(/[/,|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return split.length > 0 ? split.slice(0, 3) : defaultList;
};

// ============================================================================
// COMPONENTE INSIGNIA Y LOGO VECTORIAL DE CANAL DE TV
// ============================================================================
const TvChannelBadge = ({ channelName, compact = false }) => {
  const cleanName = String(channelName || 'TV en Vivo').trim();
  const matchedKey = Object.keys(TV_CHANNELS_CATALOG).find((k) =>
    cleanName.toLowerCase().includes(k.toLowerCase())
  );
  const meta = matchedKey
    ? TV_CHANNELS_CATALOG[matchedKey]
    : {
        short: cleanName.toUpperCase().slice(0, 14),
        accent: '#ccff00',
        bg: 'rgba(204, 255, 0, 0.08)',
        border: 'rgba(204, 255, 0, 0.28)',
        code: cleanName.slice(0, 3).toUpperCase()
      };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg font-heading font-bold tracking-wider uppercase select-none transition-all ${
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
      }`}
      style={{
        backgroundColor: meta.bg,
        border: `1px solid ${meta.border}`,
        color: '#f5f5f5'
      }}
      title={`Transmisión oficial: ${cleanName}`}
    >
      <span
        className="px-1 py-0.2 rounded text-[9px] font-black leading-tight"
        style={{ backgroundColor: meta.accent, color: '#080808' }}
      >
        {meta.code}
      </span>
      <span className="truncate max-w-[95px]">{compact ? meta.short : cleanName}</span>
    </span>
  );
};

// ============================================================================
// COMPONENTE LOGO OFICIAL DE LIGA CON FALLBACK VECTORIAL
// ============================================================================
const LeagueLogo = ({ name, logoUrl, countryCode = 'INT', size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const sizeMap = {
    xs: 'w-4 h-4 text-[8px]',
    sm: 'w-5 h-5 text-[9px]',
    md: 'w-7 h-7 text-[10px]',
    lg: 'w-9 h-9 text-xs'
  }[size] || 'w-7 h-7 text-[10px]';

  if (logoUrl && !imgError) {
    return (
      <div
        className={`${sizeMap} rounded-lg bg-[#1f1f1f] border border-[#2e2e2e] p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-sm`}
        title={name}
      >
        <img
          src={logoUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain select-none"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeMap} rounded-lg bg-[#1f1f1f] border border-[#2e2e2e] flex items-center justify-center font-heading font-bold text-[#ccff00] shrink-0`}
      title={name}
    >
      {countryCode.slice(0, 3)}
    </div>
  );
};

// ============================================================================
// COMPONENTE ESCUDO OFICIAL DE CLUB CON FALLBACK SVG PROFESIONAL
// ============================================================================
const TeamCrest = ({ name, logoUrl, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = {
    xs: 'w-4 h-4 text-[8px]',
    sm: 'w-5 h-5 text-[9px]',
    md: 'w-7 h-7 text-[10px]',
    lg: 'w-12 h-12 text-xs',
    xl: 'w-16 h-16 text-sm'
  }[size] || 'w-7 h-7 text-[10px]';

  const getDeterministicHue = (str = 'Club') => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
  };

  const initials = (name || 'FC')
    .split(' ')
    .filter((w) => w.length > 2 || name.split(' ').length <= 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClasses} object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] select-none`}
        loading="lazy"
      />
    );
  }

  const hue = getDeterministicHue(name);
  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center font-heading font-extrabold text-[#f5f5f5] shrink-0 border border-[#2e2e2e] shadow-inner select-none`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 65%, 32%), hsl(${(hue + 40) % 360}, 70%, 18%))`
      }}
      title={name}
    >
      {initials || 'FC'}
    </div>
  );
};

// ============================================================================
// UTILIDADES DE FECHAS Y TRADUCCIÓN DE ESTADOS / POSICIONES AL ESPAÑOL
// ============================================================================
const formatDateKey = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatEspnDate = (dateKey) => dateKey.replace(/-/g, '');

const parseDateKey = (dateKey) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
};

// ---- Horario argentino real (UTC-3 fijo, sin horario de verano), independiente del dispositivo
const AR_OFFSET_MS = -3 * 3600 * 1000;
const pad2 = (n) => String(n).padStart(2, '0');
const hoyAR = () => {
  const d = new Date(Date.now() + AR_OFFSET_MS);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
};
const moverFecha = (key, dias) => {
  const [y, m, d] = key.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + dias));
  return `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(t.getUTCDate())}`;
};
const horaAR = () =>
  new Date().toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

// ---- Conexión con TU API (el Worker de /elnine-api). Se guarda en el navegador desde la pestaña Admin.
const API_BASE_POR_DEFECTO = 'https://elnine-api.TU-USUARIO.workers.dev';
const leerApiBase = () => {
  try { return (localStorage.getItem('elnine_api_base') || API_BASE_POR_DEFECTO).replace(/\/$/, ''); }
  catch { return API_BASE_POR_DEFECTO; }
};
const leerApiKey = () => { try { return localStorage.getItem('elnine_api_key') || ''; } catch { return ''; } };
const apiGet = async (base, ruta, timeoutMs = 15000) => {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);
  const key = leerApiKey();
  try {
    const res = await fetch(`${base}${ruta}`, { signal: ctrl.signal, headers: key ? { 'X-API-Key': key } : {} });
    const json = await res.json().catch(() => null);
    if (!json) throw new Error(`Respuesta inválida (HTTP ${res.status})`);
    if (!json.ok) { const e = new Error(json.error?.mensaje || `HTTP ${res.status}`); e.codigo = json.error?.codigo; throw e; }
    return json;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('La API tardó demasiado en responder');
    throw err;
  } finally { clearTimeout(to); }
};

// Convierte un partido de la API al formato que usa toda la interfaz
const apiAMatch = (p) => {
  const cat = LEAGUES_CATALOG.find((l) => l.id === p.ligaId);
  const enVivo = p.estado === 'en_vivo' || p.estado === 'entretiempo';
  const statusType = enVivo ? 'LIVE' : p.estado === 'finalizado' ? 'FINAL' : 'UPCOMING';
  const displayClock =
    p.estado === 'entretiempo' ? 'ENT'
    : enVivo ? p.minuto || 'EN JUEGO'
    : p.estado === 'finalizado' ? 'FINAL'
    : p.estado === 'programado' ? p.hora
    : String(p.detalleEstado || '').toUpperCase();
  const lado = (t) => ({
    id: t.id,
    name: t.nombre,
    shortName: t.abreviatura || t.nombre.slice(0, 3).toUpperCase(),
    logo: t.escudo || '',
    score: t.goles,
    redCards: t.tarjetasRojas,
    scorers: (t.goleadores || []).map((g) => ({ player: g.jugador, minute: g.minuto, penalty: g.penal })),
    formation: null
  });
  return {
    id: `live-${p.id}`,
    espnEventId: p.id,
    dateKey: p.fecha,
    leagueId: p.ligaId,
    leagueName: p.liga.nombre,
    leagueLogo: p.liga.logo,
    countryCode: cat?.countryCode || 'INT',
    leagueCategory: cat?.category || p.liga.categoria,
    startTime: p.hora,
    statusType,
    displayClock,
    estadoDetalle: p.detalleEstado,
    venue: p.estadio || 'Estadio a confirmar',
    tv: (p.canales || []).join(' / '),
    tvChannels: p.canales || [],
    homeTeam: lado(p.local),
    awayTeam: lado(p.visitante),
    sourceOrigin: 'API El Nine'
  };
};

const DAYS_SHORT_ES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const translatePositionEs = (posAbbr = '') => {
  const map = {
    G: 'ARQ',
    GK: 'ARQ',
    D: 'DEF',
    DF: 'DEF',
    CD: 'DEF',
    CB: 'DEF',
    LB: 'DEF',
    RB: 'DEF',
    M: 'MED',
    MF: 'MED',
    CM: 'MED',
    DM: 'MED',
    AM: 'MED',
    LM: 'MED',
    RM: 'MED',
    F: 'DEL',
    FW: 'DEL',
    ST: 'DEL',
    CF: 'DEL',
    LW: 'DEL',
    RW: 'DEL',
    SUB: 'SUP'
  };
  return map[String(posAbbr).toUpperCase()] || posAbbr || 'JUG';
};

const translateStatLabelEs = (name = '', label = '') => {
  const key = String(name).toLowerCase();
  if (key.includes('possession')) return 'Posesión del balón (%)';
  if (key.includes('shotsontarget') || key.includes('shotsongoal')) return 'Remates al arco';
  if (key.includes('totalshots') || key === 'shots') return 'Remates totales';
  if (key.includes('woncorners') || key.includes('corner')) return 'Tiros de esquina';
  if (key.includes('fouls')) return 'Faltas cometidas';
  if (key.includes('offsides')) return 'Fueras de juego';
  if (key.includes('saves')) return 'Atajadas del arquero';
  if (key.includes('yellowcards')) return 'Tarjetas amarillas';
  if (key.includes('redcards')) return 'Tarjetas rojas';
  if (key.includes('accuratepasses') || key.includes('passes')) return 'Pases precisos';
  if (key.includes('tackles')) return 'Quites ganados';
  return label || name;
};

// ============================================================================
// SINTETIZADOR DE SONIDO DE "¡GOL!" EN VIVO (WEB AUDIO API)
// ============================================================================
const playGoalAlertSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // Acorde Mayor ascendente
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.09);
      osc.stop(ctx.currentTime + idx * 0.09 + 0.46);
    });
  } catch {
    // Ignorar si el navegador bloquea el audio antes de interacción
  }
};

// ============================================================================
// MOTOR DE COORDENADAS 2D TÁCTICAS PARA LOS 22 JUGADORES TITULARES
// ============================================================================
const computePitchCoordinates = (starters = [], formation = '4-3-3', isHome = true) => {
  const lines = String(formation || '4-3-3')
    .split('-')
    .map((n) => parseInt(n, 10))
    .filter((n) => !isNaN(n) && n > 0);
  const validLines = lines.length >= 2 ? lines : [4, 3, 3];

  const gk = starters[0];
  const outfield = starters.slice(1, 11);
  const positioned = [];

  if (gk) {
    positioned.push({
      ...gk,
      x: isHome ? 6.5 : 93.5,
      y: 50
    });
  }

  let playerIdx = 0;
  const totalLines = validLines.length;
  validLines.forEach((countInLine, lineIdx) => {
    const depthRatio = (lineIdx + 1) / (totalLines + 0.65);
    const x = isHome ? 12 + depthRatio * 34 : 88 - depthRatio * 34;

    for (let i = 0; i < countInLine; i++) {
      const p = outfield[playerIdx];
      if (!p) break;
      const y = countInLine === 1 ? 50 : 14 + (i * 72) / (countInLine - 1);
      positioned.push({
        ...p,
        x,
        y: isHome ? y : 100 - y
      });
      playerIdx++;
    }
  });

  while (playerIdx < outfield.length) {
    const p = outfield[playerIdx];
    positioned.push({
      ...p,
      x: isHome ? 36 : 64,
      y: 20 + ((playerIdx * 19) % 60)
    });
    playerIdx++;
  }

  return positioned;
};

// ============================================================================
// (El scraping de elnine.com.ar ahora vive en el backend: /elnine-api)
// ============================================================================
// GENERADOR DE DETALLES TÁCTICOS DE RESPALDO SI UN PARTIDO AÚN NO TIENE ROSTER
// ============================================================================
const buildFallbackMatchDetails = (match) => {
  const hScore = Number(match.homeTeam.score ?? 0);
  const aScore = Number(match.awayTeam.score ?? 0);

  const events = [];
  (match.homeTeam.scorers || []).forEach((s, idx) => {
    events.push({
      id: `hg-${idx}`,
      minute: s.minute,
      minNum: parseInt(s.minute, 10) || 25,
      team: 'home',
      type: 'goal',
      player: s.player,
      detail: s.penalty ? 'Gol de penal' : 'Gol'
    });
  });

  (match.awayTeam.scorers || []).forEach((s, idx) => {
    events.push({
      id: `ag-${idx}`,
      minute: s.minute,
      minNum: parseInt(s.minute, 10) || 40,
      team: 'away',
      type: 'goal',
      player: s.player,
      detail: s.penalty ? 'Gol de penal' : 'Gol'
    });
  });

  events.sort((a, b) => a.minNum - b.minNum);

  const stats = [];
  const defaultHomeStarters = [];
  const defaultAwayStarters = [];

  return {
    isRealSummary: false,
    events,
    stats,
    homeFormation: match.homeTeam.formation || '4-3-3',
    awayFormation: match.awayTeam.formation || '4-4-2',
    homeLineup: [],
    awayLineup: [],
    homeSubs: [],
    awaySubs: [],
    commentary: [],
    headToHead: [],
    venueInfo: {
      fullName: match.venue || 'Estadio Oficial',
      city: '',
      capacity: null,
      attendance: null,
      referee: 'No informado'
    }
  };
};

// ============================================================================
// TABLAS DE POSICIONES REALES (por zona / grupo) DESDE LA API
// ============================================================================
const resumirCelda = (v) => (v === undefined || v === null || Number.isNaN(v) ? '-' : v);

const StandingsView = ({ data, error, errorCode, loading, subTab }) => {
  if (loading && !data) {
    return (
      <div className="py-16 text-center text-sm text-[#999999] font-heading flex items-center justify-center gap-2">
        <Icon name="sync" size={18} className="animate-spin text-[#ccff00]" />
        <span>Cargando tabla...</span>
      </div>
    );
  }
  if (error) {
    const sinConfig = errorCode === 'NO_CONFIGURADA';
    return (
      <div className="rounded-xl border border-[#2e2e2e] bg-[#0e0e0e] p-6 text-center space-y-2">
        <Icon name={sinConfig ? 'settings' : 'info'} size={28} className="text-[#ccff00]" />
        <p className="text-sm text-[#f5f5f5] font-heading font-bold">
          {sinConfig ? 'Esta tabla todavía no está configurada en tu API' : 'No hay tabla disponible'}
        </p>
        <p className="text-xs text-[#999999] max-w-md mx-auto">{error}</p>
      </div>
    );
  }
  if (!data || !data.grupos || data.grupos.length === 0) return null;
  const esProm = subTab === 'promedios';
  const mostrarTitulo = data.grupos.length > 1 || (data.grupos[0].nombre && data.grupos[0].nombre !== 'Posiciones');

  return (
    <div className="space-y-6">
      {data.grupos.map((grupo, gi) => (
        <div key={gi} className="space-y-2">
          {mostrarTitulo && (
            <h3 className="font-heading font-bold text-sm text-[#ccff00] uppercase tracking-wide">{grupo.nombre}</h3>
          )}
          <div className="overflow-x-auto rounded-xl border border-[#2e2e2e]">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1f1f1f] text-[#999999] font-heading font-bold text-[11px] uppercase border-b border-[#2e2e2e]">
                  <th className="py-3 px-3 w-10">#</th>
                  <th className="py-3 px-3">Club</th>
                  <th className="py-3 px-2 text-center">PJ</th>
                  <th className="py-3 px-2 text-center">G</th>
                  <th className="py-3 px-2 text-center">E</th>
                  <th className="py-3 px-2 text-center">P</th>
                  <th className="py-3 px-2 text-center hidden sm:table-cell">GF</th>
                  <th className="py-3 px-2 text-center hidden sm:table-cell">GC</th>
                  <th className="py-3 px-2 text-center">DIF</th>
                  <th className="py-3 px-3 text-center text-[#ccff00]">{esProm ? 'PROM' : 'PTS'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {grupo.filas.map((row, idx) => {
                  const dif = row.dif;
                  return (
                    <tr
                      key={`${row.equipo.nombre}-${idx}`}
                      className="bg-[#141414] hover:bg-[#1a1a1a] transition-colors"
                      style={{ boxShadow: row.zonaColor ? `inset 4px 0 0 ${row.zonaColor}` : undefined }}
                      title={row.zona || undefined}
                    >
                      <td className="py-3 px-3 font-heading font-bold text-[#999999]">{row.posicion}</td>
                      <td className="py-3 px-3 font-bold text-[#f5f5f5]">
                        <div className="flex items-center gap-2.5">
                          <TeamCrest name={row.equipo.nombre} logoUrl={row.equipo.escudo} size="sm" />
                          <span className="truncate">{row.equipo.nombre}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-heading text-[#f5f5f5]">{resumirCelda(row.pj)}</td>
                      <td className="py-3 px-2 text-center font-heading text-[#999999]">{resumirCelda(row.g)}</td>
                      <td className="py-3 px-2 text-center font-heading text-[#999999]">{resumirCelda(row.e)}</td>
                      <td className="py-3 px-2 text-center font-heading text-[#999999]">{resumirCelda(row.p)}</td>
                      <td className="py-3 px-2 text-center font-heading text-[#999999] hidden sm:table-cell">{resumirCelda(row.gf)}</td>
                      <td className="py-3 px-2 text-center font-heading text-[#999999] hidden sm:table-cell">{resumirCelda(row.gc)}</td>
                      <td className={`py-3 px-2 text-center font-heading font-bold ${dif > 0 ? 'text-[#ccff00]' : dif < 0 ? 'text-[#ff3b3b]' : 'text-[#737373]'}`}>
                        {dif > 0 ? `+${dif}` : dif}
                      </td>
                      <td className="py-3 px-3 text-center font-heading font-black text-sm text-[#ccff00] bg-[rgba(204,255,0,0.06)]">
                        {esProm ? Number(row.promedio).toFixed(3) : row.pts}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {data.leyenda && data.leyenda.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-[#999999]">
          {data.leyenda.map((z, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm" style={{ background: z.color }} />
              <span>{z.descripcion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN
// ============================================================================
export default function App() {
  // Fecha seleccionada en el calendario (YYYY-MM-DD)
  const [selectedDateKey, setSelectedDateKey] = useState(() => hoyAR());
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(() => parseDateKey(hoyAR()));

  // Menú Lateral Desplegable (Collapsible en Desktop + Drawer en Móvil)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Vistas y Filtros
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'multipantalla' | 'standings' | 'scorers' | 'favorites' | 'admin'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLeagueId, setSelectedLeagueId] = useState('ALL');
  const [groupByMode, setGroupByMode] = useState('competition'); // 'competition' | 'time'
  const [onlyLiveFilter, setOnlyLiveFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timezone, setTimezone] = useState('UTC-3 (ARG)');
  const [collapsedLeagues, setCollapsedLeagues] = useState({});
  const [expandedScorersMap, setExpandedScorersMap] = useState({});

  // Auto-Refresh, Sonido y Alertas de Gol en Vivo
  const [autoRefreshSec, setAutoRefreshSec] = useState(20);
  const [countdownSec, setCountdownSec] = useState(20);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [goalAlerts, setGoalAlerts] = useState([]);
  const [recentlyScoredIds, setRecentlyScoredIds] = useState({});
  const previousScoresRef = useRef({});

  // Multipantalla (Hasta 4 partidos en simultáneo)
  const [multiScreenMatchIds, setMultiScreenMatchIds] = useState([]);

  // Favoritos persistidos
  const [favoriteMatchIds, setFavoriteMatchIds] = useState(() => {
    try {
      const saved = localStorage.getItem('elnine_fav_matches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [favoriteTeams, setFavoriteTeams] = useState(() => {
    try {
      const saved = localStorage.getItem('elnine_fav_teams');
      return saved ? JSON.parse(saved) : ['Boca Juniors', 'River Plate', 'Real Madrid', 'Inter Miami CF'];
    } catch {
      return ['Boca Juniors', 'River Plate'];
    }
  });

  // Estado de Partidos, Logos Dinámicos de Ligas y Telemetría de la API
  const [matches, setMatches] = useState([]);
  const [dynamicLeagueLogos, setDynamicLeagueLogos] = useState({});
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [apiBase, setApiBase] = useState(() => leerApiBase());
  const [apiBaseInput, setApiBaseInput] = useState(() => leerApiBase());
  const [apiKeyInput, setApiKeyInput] = useState(() => leerApiKey());
  const [apiError, setApiError] = useState(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState('');
  const soundRef = useRef(true);
  const refreshRef = useRef(20);
  const [endpointHealthList, setEndpointHealthList] = useState([]);
  const [syncTelemetry, setSyncTelemetry] = useState({
    status: 'ONLINE',
    targetUrl: leerApiBase(),
    lastSyncTime: '--:--:--',
    latencyMs: 0,
    liveApiCount: 0,
    totalLogosExtracted: 0,
    totalTvChannelsDetected: 0,
    elnineSourceStatus: 'Esperando primera sincronización',
    logs: []
  });

  // Match Center Modal + Deep Live Summary Data (/summary?event={id})
  const [activeMatchModal, setActiveMatchModal] = useState(null);
  const [matchModalTab, setMatchModalTab] = useState('lineups'); // 'lineups' | 'stats' | 'summary' | 'commentary' | 'h2h'
  const [liveMatchSummary, setLiveMatchSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [selectedPitchPlayer, setSelectedPitchPlayer] = useState(null);

  // Tablas de Posiciones en Vivo
  const [standingsLeagueId, setStandingsLeagueId] = useState('arg.1');
  const [standingsSubTab, setStandingsSubTab] = useState('posiciones'); // 'posiciones' | 'anual' | 'promedios'
  const [liveStandingsData, setLiveStandingsData] = useState(null);
  const [standingsError, setStandingsError] = useState(null);
  const [standingsErrorCode, setStandingsErrorCode] = useState(null);
  const [isLoadingStandings, setIsLoadingStandings] = useState(false);

  // Persistencia de favoritos
  useEffect(() => {
    try {
      localStorage.setItem('elnine_fav_matches', JSON.stringify(favoriteMatchIds));
    } catch {
      // ignore
    }
  }, [favoriteMatchIds]);

  useEffect(() => {
    try {
      localStorage.setItem('elnine_fav_teams', JSON.stringify(favoriteTeams));
    } catch {
      // ignore
    }
  }, [favoriteTeams]);

  // ==========================================================================
  // MOTOR DE EXTRACCIÓN EN TIEMPO REAL: ELNINE.COM.AR + 17 LIGAS POR FECHA
  // ==========================================================================
  soundRef.current = soundEnabled;
  refreshRef.current = autoRefreshSec;

  const fetchMatchesForDate = useCallback(
    async (dateKey, silent = false) => {
      if (!silent) setIsLoadingMatches(true);
      const t0 = performance.now();
      const logs = [];
      let combined = null;
      let healthRecords = [];
      let sourceStatus = '';
      let logosCounter = 0;
      let tvCounter = 0;

      try {
        const json = await apiGet(apiBase, `/v1/partidos?fecha=${dateKey}`);
        const lista = json.data?.partidos || [];
        combined = lista.map(apiAMatch);
        const erroresPorLiga = new Map((json.meta?.errores || []).map((e) => [e.liga, e.error]));
        healthRecords = LEAGUES_CATALOG.map((lg) => {
          const delaLiga = lista.filter((p) => p.ligaId === lg.id);
          const err = erroresPorLiga.get(lg.id);
          return {
            id: lg.id,
            name: lg.name,
            logo: delaLiga[0]?.liga?.logo || lg.logo,
            endpoint: `/v1/partidos?fecha=${dateKey}&liga=${lg.id}`,
            status: err ? 'ERROR' : 'OK',
            ok: !err,
            detail: err || '',
            eventsCount: delaLiga.length,
            logosCount: delaLiga.reduce((n, p) => n + (p.local.escudo ? 1 : 0) + (p.visitante.escudo ? 1 : 0), 0),
            tvCount: delaLiga.reduce((n, p) => n + (p.canales?.length || 0), 0)
          };
        });
        logosCounter = healthRecords.reduce((n, h) => n + h.logosCount, 0);
        tvCounter = healthRecords.reduce((n, h) => n + h.tvCount, 0);
        const el = json.meta?.elnine;
        sourceStatus = el?.ok
          ? `elnine.com.ar OK (${el.escudosAplicados} escudos aplicados)`
          : `elnine.com.ar sin respuesta${el?.error ? `: ${el.error}` : ''} — usando escudos de la fuente principal`;
        logs.push(`[API] ${lista.length} partidos para ${dateKey} (horario argentino).`);
        if (erroresPorLiga.size > 0) logs.push(`[AVISO] ${erroresPorLiga.size} liga(s) no respondieron: ${[...erroresPorLiga.keys()].join(', ')}`);
        setApiError(null);
      } catch (err) {
        const msg = err?.message || 'Error desconocido';
        logs.push(`[ERROR] ${msg}`);
        setApiError(msg);
        sourceStatus = 'Sin conexión con la API';
      }

      const elapsed = Math.round(performance.now() - t0);

      if (combined === null) {
        // Falla de red: NO se pisan los partidos que ya estaban en pantalla ni se inventan otros.
        if (!silent) setMatches([]);
        setSyncTelemetry((prev) => ({
          ...prev,
          status: 'ERROR',
          targetUrl: apiBase,
          latencyMs: elapsed,
          elnineSourceStatus: sourceStatus,
          logs: [...logs, ...prev.logs].slice(0, 40)
        }));
        if (!silent) setIsLoadingMatches(false);
        setCountdownSec(refreshRef.current);
        return;
      }

      // Detector de goles comparando con el estado anterior
      const newGoalAlerts = [];
      const newScoredFlash = {};
      combined.forEach((m) => {
        if (m.statusType === 'LIVE' || m.statusType === 'FINAL') {
          const prev = previousScoresRef.current[m.id];
          const curH = Number(m.homeTeam.score ?? 0);
          const curA = Number(m.awayTeam.score ?? 0);
          if (prev && m.statusType === 'LIVE' && (curH > prev.home || curA > prev.away)) {
            newGoalAlerts.push({
              id: `${m.id}-${Date.now()}`,
              leagueName: m.leagueName,
              scoringTeam: curH > prev.home ? m.homeTeam.name : m.awayTeam.name,
              homeName: m.homeTeam.name,
              awayName: m.awayTeam.name,
              homeScore: curH,
              awayScore: curA,
              clock: m.displayClock
            });
            newScoredFlash[m.id] = true;
          }
          previousScoresRef.current[m.id] = { home: curH, away: curA };
        }
      });

      if (newGoalAlerts.length > 0) {
        if (soundRef.current) playGoalAlertSound();
        setGoalAlerts((prev) => [...newGoalAlerts, ...prev].slice(0, 4));
        setRecentlyScoredIds((prev) => ({ ...prev, ...newScoredFlash }));
        setTimeout(() => setRecentlyScoredIds({}), 10000);
      }

      const newLeagueLogos = {};
      combined.forEach((m) => { if (m.leagueLogo) newLeagueLogos[m.leagueId] = m.leagueLogo; });

      setDynamicLeagueLogos((prev) => ({ ...prev, ...newLeagueLogos }));
      setMatches(combined);
      setEndpointHealthList(healthRecords);
      setSyncTelemetry({
        status: 'ONLINE',
        targetUrl: apiBase,
        lastSyncTime: horaAR(),
        latencyMs: elapsed,
        liveApiCount: combined.length,
        totalLogosExtracted: logosCounter,
        totalTvChannelsDetected: tvCounter,
        elnineSourceStatus: sourceStatus,
        logs
      });
      setCountdownSec(refreshRef.current);
      if (!silent) setIsLoadingMatches(false);
    },
    [apiBase]
  );

  // Cargar partidos cuando cambia la fecha seleccionada
  useEffect(() => {
    previousScoresRef.current = {};
    fetchMatchesForDate(selectedDateKey, false);
  }, [selectedDateKey, fetchMatchesForDate]);

  // Temporizador de auto-refresh: solo refresca el día de HOY (ARG) y con la pestaña visible.
  useEffect(() => {
    setCountdownSec(autoRefreshSec);
  }, [autoRefreshSec]);

  useEffect(() => {
    let restante = refreshRef.current;
    const timer = setInterval(() => {
      if (document.hidden) return;
      restante -= 1;
      if (restante <= 0) {
        restante = refreshRef.current;
        if (selectedDateKey === hoyAR()) fetchMatchesForDate(selectedDateKey, true);
      }
      setCountdownSec(restante);
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedDateKey, fetchMatchesForDate]);

  // ==========================================================================
  // FETCH PROFUNDO DE PARTIDO EN VIVO (/summary?event={espnEventId})
  // ==========================================================================
  useEffect(() => {
    if (!activeMatchModal) {
      setLiveMatchSummary(null);
      setSelectedPitchPlayer(null);
      return;
    }

    let isMounted = true;
    const fetchDeepMatchSummary = async () => {
      if (!activeMatchModal.espnEventId) {
        setLiveMatchSummary(buildFallbackMatchDetails(activeMatchModal));
        return;
      }

      setIsLoadingSummary(true);
      try {
        const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${activeMatchModal.leagueId}/summary?event=${activeMatchModal.espnEventId}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Summary no disponible');
        const data = await res.json();
        if (!isMounted) return;

        // 1. Extraer Formaciones y Jugadores Reales (Rosters)
        const rosters = data?.rosters || [];
        const homeRosterObj = rosters.find((r) => r.homeAway === 'home') || rosters[0] || {};
        const awayRosterObj = rosters.find((r) => r.homeAway === 'away') || rosters[1] || {};

        const homeFormation =
          homeRosterObj.formation || activeMatchModal.homeTeam.formation || '4-3-3';
        const awayFormation =
          awayRosterObj.formation || activeMatchModal.awayTeam.formation || '4-4-2';

        const parseRosterEntries = (entries = []) => {
          const starters = [];
          const subs = [];
          entries.forEach((p) => {
            const statsMap = {};
            (p.stats || []).forEach((st) => {
              statsMap[st.name] = st.displayValue ?? st.value;
            });
            const playerObj = {
              id: p.athlete?.id || Math.random().toString(),
              num: p.jersey || '--',
              name: p.athlete?.shortName || p.athlete?.displayName || 'Jugador',
              fullName: p.athlete?.displayName || 'Jugador',
              pos: translatePositionEs(p.position?.abbreviation || ''),
              starter: !!p.starter,
              subbedIn: !!p.subbedIn,
              subbedOut: !!p.subbedOut,
              goals: Number(statsMap.totalGoals || 0),
              assists: Number(statsMap.goalAssists || 0),
              yellowCard: Number(statsMap.yellowCards || 0) > 0,
              redCard: Number(statsMap.redCards || 0) > 0,
              shots: statsMap.totalShots || 0,
              shotsOnTarget: statsMap.shotsOnTarget || 0,
              fouls: statsMap.foulsCommitted || 0,
              saves: statsMap.saves || 0
            };
            if (p.starter) starters.push(playerObj);
            else subs.push(playerObj);
          });
          return { starters, subs };
        };

        const homeParsed = parseRosterEntries(homeRosterObj.roster || []);
        const awayParsed = parseRosterEntries(awayRosterObj.roster || []);

        const fallbackDetails = buildFallbackMatchDetails(activeMatchModal);

        const homeLineup =
          homeParsed.starters.length >= 7
            ? computePitchCoordinates(homeParsed.starters, homeFormation, true)
            : fallbackDetails.homeLineup;

        const awayLineup =
          awayParsed.starters.length >= 7
            ? computePitchCoordinates(awayParsed.starters, awayFormation, false)
            : fallbackDetails.awayLineup;

        // 2. Extraer Estadísticas Reales de Boxscore
        const teamsBox = data?.boxscore?.teams || [];
        const homeStatsArr = teamsBox[0]?.statistics || [];
        const awayStatsArr = teamsBox[1]?.statistics || [];

        const realStats = [];
        homeStatsArr.forEach((hStat) => {
          const aStat = awayStatsArr.find((a) => a.name === hStat.name);
          if (aStat) {
            const hVal = parseFloat(String(hStat.displayValue).replace('%', '')) || 0;
            const aVal = parseFloat(String(aStat.displayValue).replace('%', '')) || 0;
            const total = hVal + aVal || 1;
            realStats.push({
              label: translateStatLabelEs(hStat.name, hStat.label),
              home: hStat.displayValue,
              away: aStat.displayValue,
              homePct: Math.round((hVal / total) * 100),
              awayPct: Math.round((aVal / total) * 100)
            });
          }
        });

        // 3. Extraer Eventos Cronológicos Reales (Key Events)
        const keyEvents = data?.keyEvents || [];
        const realEvents = keyEvents.map((ke, i) => {
          const txt = String(ke.type?.text || ke.shortText || '').toLowerCase();
          let type = 'info';
          if (ke.scoringPlay || txt.includes('goal') || txt.includes('gol')) type = 'goal';
          else if (txt.includes('red') || txt.includes('roja')) type = 'red';
          else if (txt.includes('yellow') || txt.includes('amarilla')) type = 'yellow';
          else if (txt.includes('sub') || txt.includes('cambio')) type = 'sub';

          const isHome = ke.team?.id === activeMatchModal.homeTeam.id;
          return {
            id: ke.id || `ke-${i}`,
            minute: ke.clock?.displayValue || '',
            team: isHome ? 'home' : 'away',
            type,
            player:
              ke.participants?.[0]?.athlete?.displayName ||
              ke.shortText ||
              ke.type?.text ||
              'Incidencia',
            detail: ke.text || ''
          };
        });

        // 4. Relato Minuto a Minuto
        const rawCommentary = data?.commentary || [];
        const commentary = rawCommentary
          .slice(-30)
          .reverse()
          .map((c, idx) => ({
            id: `com-${idx}`,
            minute: c.time?.displayValue || '',
            text: c.text || ''
          }));

        // 5. Historial Cara a Cara (H2H)
        const h2hEvents = data?.headToHeadGames?.[0]?.events || [];
        const headToHead = h2hEvents.slice(0, 5).map((g, i) => ({
          id: g.id || `h2h-${i}`,
          date: g.gameDate ? new Date(g.gameDate).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }) : '',
          league: g.leagueName || activeMatchModal.leagueName,
          score: g.score || 'Finalizado'
        }));

        // 6. Información de Estadio y Árbitro
        const gameInfo = data?.gameInfo || {};
        const venueInfo = {
          fullName: gameInfo.venue?.fullName || activeMatchModal.venue,
          city: gameInfo.venue?.address?.city || '',
          capacity: gameInfo.venue?.capacity || null,
          attendance: gameInfo.attendance || null,
          referee: gameInfo.officials?.[0]?.fullName || 'Árbitro Oficial'
        };

        setLiveMatchSummary({
          isRealSummary: true,
          events: realEvents.length > 0 ? realEvents : fallbackDetails.events,
          stats: realStats.length > 0 ? realStats : fallbackDetails.stats,
          homeFormation,
          awayFormation,
          homeLineup,
          awayLineup,
          homeSubs: homeParsed.subs,
          awaySubs: awayParsed.subs,
          commentary,
          headToHead,
          venueInfo
        });
      } catch {
        if (isMounted) {
          setLiveMatchSummary(buildFallbackMatchDetails(activeMatchModal));
        }
      } finally {
        if (isMounted) setIsLoadingSummary(false);
      }
    };

    fetchDeepMatchSummary();
    return () => {
      isMounted = false;
    };
  }, [activeMatchModal]);

  // ==========================================================================
  // CARGAR TABLA DE POSICIONES REAL DESDE LA API
  // ==========================================================================
  useEffect(() => {
    let active = true;
    setIsLoadingStandings(true);
    setStandingsError(null);
    setStandingsErrorCode(null);
    const sufijo = standingsSubTab === 'anual' ? '/anual' : standingsSubTab === 'promedios' ? '/promedios' : '';
    apiGet(apiBase, `/v1/tablas/${standingsLeagueId}${sufijo}`)
      .then((json) => { if (active) setLiveStandingsData(json.data); })
      .catch((err) => {
        if (!active) return;
        setLiveStandingsData(null);
        setStandingsError(err.message);
        setStandingsErrorCode(err.codigo || null);
      })
      .finally(() => { if (active) setIsLoadingStandings(false); });
    return () => { active = false; };
  }, [standingsLeagueId, standingsSubTab, apiBase]);

  // ==========================================================================
  // MANEJADORES DE INTERACCIÓN
  // ==========================================================================
  const toggleFavoriteMatch = (e, matchId) => {
    e.stopPropagation();
    setFavoriteMatchIds((prev) =>
      prev.includes(matchId) ? prev.filter((id) => id !== matchId) : [...prev, matchId]
    );
  };

  const toggleMultiScreenMatch = (e, matchId) => {
    e.stopPropagation();
    setMultiScreenMatchIds((prev) => {
      if (prev.includes(matchId)) return prev.filter((id) => id !== matchId);
      if (prev.length >= 4) return [...prev.slice(1), matchId];
      return [...prev, matchId];
    });
  };

  const toggleScorersDrawer = (e, matchId) => {
    e.stopPropagation();
    setExpandedScorersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const toggleLeagueAccordion = (leagueId) => {
    setCollapsedLeagues((prev) => ({ ...prev, [leagueId]: !prev[leagueId] }));
  };

  const guardarConexionApi = () => {
    const limpia = apiBaseInput.trim().replace(/\/$/, '');
    if (!/^https?:\/\//.test(limpia)) { setApiError('La URL debe empezar con https://'); return; }
    try {
      localStorage.setItem('elnine_api_base', limpia);
      localStorage.setItem('elnine_api_key', apiKeyInput.trim());
    } catch { /* sin almacenamiento */ }
    setApiBase(limpia);
  };

  const copiarEndpoint = async (texto) => {
    try { await navigator.clipboard.writeText(texto); setCopiedEndpoint(texto); setTimeout(() => setCopiedEndpoint(''), 1800); } catch { /* ignorar */ }
  };

  // ==========================================================================
  // CÁLCULO DE TIRA DE FECHAS Y CALENDARIO MENSUAL
  // ==========================================================================
  const dateStripItems = useMemo(() => {
    const center = parseDateKey(selectedDateKey);
    const todayKey = hoyAR();
    const yesterdayKey = moverFecha(todayKey, -1);
    const tomorrowKey = moverFecha(todayKey, 1);

    const items = [];
    for (let offset = -5; offset <= 5; offset++) {
      const d = new Date(center);
      d.setDate(center.getDate() + offset);
      const key = formatDateKey(d);
      let label = DAYS_SHORT_ES[d.getDay()];
      if (key === todayKey) label = 'HOY';
      else if (key === yesterdayKey) label = 'AYER';
      else if (key === tomorrowKey) label = 'MAÑANA';

      items.push({
        key,
        label,
        dayNumber: String(d.getDate()).padStart(2, '0'),
        monthShort: MONTHS_ES[d.getMonth()].slice(0, 3).toUpperCase(),
        isToday: key === todayKey
      });
    }
    return items;
  }, [selectedDateKey]);

  const calendarDaysGrid = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day, 12, 0, 0);
      cells.push({
        day,
        dateKey: formatDateKey(d),
        isToday: formatDateKey(d) === hoyAR()
      });
    }
    return cells;
  }, [calendarViewDate]);

  // ==========================================================================
  // FILTRADO Y AGRUPACIÓN DE PARTIDOS
  // ==========================================================================
  const liveMatchesCount = useMemo(
    () => matches.filter((m) => m.statusType === 'LIVE').length,
    [matches]
  );

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (onlyLiveFilter && m.statusType !== 'LIVE') return false;
      if (activeTab === 'favorites') {
        const isFavMatch = favoriteMatchIds.includes(m.id);
        const isFavTeam =
          favoriteTeams.includes(m.homeTeam.name) || favoriteTeams.includes(m.awayTeam.name);
        if (!isFavMatch && !isFavTeam) return false;
      }
      if (selectedCategory !== 'ALL' && m.leagueCategory !== selectedCategory) return false;
      if (selectedLeagueId !== 'ALL' && m.leagueId !== selectedLeagueId) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const inHome = m.homeTeam.name.toLowerCase().includes(q);
        const inAway = m.awayTeam.name.toLowerCase().includes(q);
        const inLeague = m.leagueName.toLowerCase().includes(q);
        const inTv = (m.tv || '').toLowerCase().includes(q);
        const inScorers =
          (m.homeTeam.scorers || []).some((s) => s.player.toLowerCase().includes(q)) ||
          (m.awayTeam.scorers || []).some((s) => s.player.toLowerCase().includes(q));
        if (!inHome && !inAway && !inLeague && !inTv && !inScorers) return false;
      }
      return true;
    });
  }, [
    matches,
    onlyLiveFilter,
    activeTab,
    favoriteMatchIds,
    favoriteTeams,
    selectedCategory,
    selectedLeagueId,
    searchQuery
  ]);

  const groupedByLeague = useMemo(() => {
    const map = new Map();
    filteredMatches.forEach((m) => {
      if (!map.has(m.leagueId)) {
        const meta = LEAGUES_CATALOG.find((l) => l.id === m.leagueId);
        map.set(m.leagueId, {
          leagueId: m.leagueId,
          leagueName: m.leagueName,
          leagueLogo: dynamicLeagueLogos[m.leagueId] || m.leagueLogo || meta?.logo,
          country: meta?.country || m.leagueCategory,
          countryCode: meta?.countryCode || m.countryCode || 'INT',
          priority: meta?.priority || 99,
          matches: []
        });
      }
      map.get(m.leagueId).matches.push(m);
    });
    return Array.from(map.values()).sort((a, b) => a.priority - b.priority);
  }, [filteredMatches, dynamicLeagueLogos]);

  const sortedByTime = useMemo(
    () => [...filteredMatches].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [filteredMatches]
  );

  // Ranking de Goleadores Dinámico extraído de la jornada + Base Oficial
  const dynamicTopScorers = useMemo(() => {
    const scorerCounts = new Map();
    matches.forEach((m) => {
      (m.homeTeam.scorers || []).forEach((s) => {
        const key = `${s.player}-${m.homeTeam.name}`;
        const prev = scorerCounts.get(key) || {
          player: s.player,
          team: m.homeTeam.name,
          teamLogo: m.homeTeam.logo,
          leagueName: m.leagueName,
          goals: 0,
          penalties: 0
        };
        prev.goals += 1;
        if (s.penalty) prev.penalties += 1;
        scorerCounts.set(key, prev);
      });
      (m.awayTeam.scorers || []).forEach((s) => {
        const key = `${s.player}-${m.awayTeam.name}`;
        const prev = scorerCounts.get(key) || {
          player: s.player,
          team: m.awayTeam.name,
          teamLogo: m.awayTeam.logo,
          leagueName: m.leagueName,
          goals: 0,
          penalties: 0
        };
        prev.goals += 1;
        if (s.penalty) prev.penalties += 1;
        scorerCounts.set(key, prev);
      });
    });

    const fromToday = Array.from(scorerCounts.values()).sort((a, b) => b.goals - a.goals);
    return fromToday.map((item, idx) => ({ ...item, rank: idx + 1, matches: 1 }));
  }, [matches]);

  // ==========================================================================
  // RENDERIZADO DE FILA DE PARTIDO (DISEÑO #141414 / #CCFF00 / #FF3B3B)
  // ==========================================================================
  const renderMatchCard = (match) => {
    const isFav =
      favoriteMatchIds.includes(match.id) ||
      favoriteTeams.includes(match.homeTeam.name) ||
      favoriteTeams.includes(match.awayTeam.name);

    const isPinnedMulti = multiScreenMatchIds.includes(match.id);
    const isGoalFlash = !!recentlyScoredIds[match.id];

    const hasGoals =
      (match.homeTeam.scorers && match.homeTeam.scorers.length > 0) ||
      (match.awayTeam.scorers && match.awayTeam.scorers.length > 0);

    const showScorers = expandedScorersMap[match.id] ?? (match.statusType === 'LIVE' && hasGoals);
    const channelsToRender = match.tvChannels || normalizeTvChannels(match.tv);

    return (
      <div
        key={match.id}
        onClick={() => {
          setActiveMatchModal(match);
          setMatchModalTab('lineups');
        }}
        className={`group border-b border-[#222222] last:border-b-0 transition-all cursor-pointer ${
          isGoalFlash
            ? 'bg-[#ccff00]/15 ring-1 ring-[#ccff00]'
            : 'bg-[#141414] hover:bg-[#1a1a1a]'
        }`}
      >
        <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-2 sm:gap-4">
          {/* COLUMNA IZQUIERDA: FAVORITO + MULTIPANTALLA + ESTADO / RELOJ */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-28 sm:w-36 shrink-0">
            <button
              onClick={(e) => toggleFavoriteMatch(e, match.id)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                isFav
                  ? 'bg-[#ccff00]/15 border-[#ccff00]/40 text-[#ccff00]'
                  : 'bg-[#1f1f1f] border-[#2e2e2e] text-[#737373] hover:text-[#f5f5f5]'
              }`}
              title="Destacar en Mis Favoritos"
            >
              <Icon name="star" size={16} filled={isFav} />
            </button>

            <button
              onClick={(e) => toggleMultiScreenMatch(e, match.id)}
              className={`hidden sm:flex w-7 h-7 rounded-lg items-center justify-center border transition-all ${
                isPinnedMulti
                  ? 'bg-[#ccff00] border-[#ccff00] text-[#080808]'
                  : 'bg-[#1f1f1f] border-[#2e2e2e] text-[#737373] hover:text-[#f5f5f5]'
              }`}
              title="Anclar o quitar de Multipantalla"
            >
              <Icon name="grid_view" size={15} filled={isPinnedMulti} />
            </button>

            {match.statusType === 'LIVE' ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(255,59,59,0.12)] border border-[#ff3b3b]/40 text-[#ff3b3b] font-heading font-bold text-xs tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#ff3b3b] animate-live-pulse" />
                <span>{match.displayClock}</span>
              </div>
            ) : match.statusType === 'FINAL' ? (
              <span className="px-2.5 py-1 rounded-lg bg-[#1f1f1f] border border-[#2e2e2e] text-[#999999] font-heading font-bold text-[11px] tracking-widest uppercase">
                FINAL
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[rgba(204,255,0,0.12)] border border-[#ccff00]/30 text-[#ccff00] font-heading font-bold text-xs">
                <Icon name="schedule" size={13} />
                <span>{match.startTime}</span>
              </span>
            )}
          </div>

          {/* COLUMNA CENTRAL: EQUIPOS Y MARCADOR */}
          <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 min-w-0">
            {/* EQUIPO LOCAL */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 min-w-0 text-right">
              {match.homeTeam.redCards > 0 && (
                <CardBadge type="red" count={match.homeTeam.redCards} />
              )}
              <span
                className={`truncate text-xs sm:text-sm tracking-tight ${
                  match.homeTeam.score > match.awayTeam.score
                    ? 'text-[#f5f5f5] font-bold'
                    : 'text-[#999999] font-medium group-hover:text-[#f5f5f5]'
                }`}
              >
                {match.homeTeam.name}
              </span>
              <TeamCrest name={match.homeTeam.name} logoUrl={match.homeTeam.logo} size="md" />
            </div>

            {/* MARCADOR CENTRAL CON TIPOGRAFÍA CHAKRA PETCH */}
            <div className="flex items-center justify-center min-w-[70px] sm:min-w-[88px]">
              {match.statusType === 'UPCOMING' ? (
                <div className="px-3 py-1 rounded-lg bg-[#0e0e0e] border border-[#2e2e2e] text-[#737373] font-heading text-xs font-bold tracking-widest">
                  VS
                </div>
              ) : (
                <div
                  className={`flex items-center justify-center gap-2 px-3 py-1 rounded-lg font-heading text-base sm:text-lg font-bold tracking-wider border ${
                    match.statusType === 'LIVE'
                      ? 'bg-[#0e0e0e] border-[#ff3b3b]/50 text-[#f5f5f5] shadow-[0_0_15px_rgba(255,59,59,0.2)]'
                      : 'bg-[#0e0e0e] border-[#2e2e2e] text-[#f5f5f5]'
                  }`}
                >
                  <span
                    className={
                      match.homeTeam.score > match.awayTeam.score ? 'text-[#ccff00]' : ''
                    }
                  >
                    {match.homeTeam.score ?? 0}
                  </span>
                  <span className="text-[#737373] text-xs">:</span>
                  <span
                    className={
                      match.awayTeam.score > match.homeTeam.score ? 'text-[#ccff00]' : ''
                    }
                  >
                    {match.awayTeam.score ?? 0}
                  </span>
                </div>
              )}
            </div>

            {/* EQUIPO VISITANTE */}
            <div className="flex items-center justify-start gap-2 sm:gap-3 min-w-0 text-left">
              <TeamCrest name={match.awayTeam.name} logoUrl={match.awayTeam.logo} size="md" />
              <span
                className={`truncate text-xs sm:text-sm tracking-tight ${
                  match.awayTeam.score > match.homeTeam.score
                    ? 'text-[#f5f5f5] font-bold'
                    : 'text-[#999999] font-medium group-hover:text-[#f5f5f5]'
                }`}
              >
                {match.awayTeam.name}
              </span>
              {match.awayTeam.redCards > 0 && (
                <CardBadge type="red" count={match.awayTeam.redCards} />
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA: LOGOS DE CANALES DE TV + BOTÓN DETALLES */}
          <div className="flex items-center justify-end gap-1.5 sm:w-48 shrink-0">
            <div className="hidden xl:flex items-center gap-1 justify-end flex-wrap">
              {channelsToRender.slice(0, 2).map((ch, idx) => (
                <TvChannelBadge key={idx} channelName={ch} compact />
              ))}
            </div>

            {hasGoals && (
              <button
                onClick={(e) => toggleScorersDrawer(e, match.id)}
                className="w-7 h-7 rounded-lg bg-[#1f1f1f] border border-[#2e2e2e] text-[#999999] hover:text-[#ccff00] hover:border-[#ccff00]/40 flex items-center justify-center transition-all"
                title="Desplegar goleadores del partido"
              >
                <Icon name={showScorers ? 'expand_less' : 'expand_more'} size={18} />
              </button>
            )}

            <span className="w-7 h-7 rounded-lg bg-[#1f1f1f] border border-[#2e2e2e] text-[#737373] group-hover:text-[#ccff00] group-hover:border-[#ccff00]/40 flex items-center justify-center transition-all">
              <Icon name="analytics" size={16} />
            </span>
          </div>
        </div>

        {/* SUB-FILA DESPLEGABLE DE GOLEADORES CON ICONOS MATERIAL SYMBOLS ROUNDED */}
        {hasGoals && showScorers && (
          <div className="px-4 py-2 bg-[#0e0e0e] border-t border-[#222222] grid grid-cols-[1fr_80px_1fr] items-center gap-2 text-[11px] text-[#999999]">
            <div className="text-right flex flex-wrap items-center justify-end gap-3">
              {(match.homeTeam.scorers || []).map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  <span className="font-heading font-bold text-[#ccff00]">{s.minute}</span>
                  <span className="text-[#f5f5f5] font-medium">{s.player}</span>
                  <Icon name="sports_soccer" size={13} className="text-[#ccff00]" />
                </span>
              ))}
            </div>
            <div className="text-center text-[10px] font-heading font-bold text-[#737373] uppercase tracking-widest">
              Goles
            </div>
            <div className="text-left flex flex-wrap items-center justify-start gap-3">
              {(match.awayTeam.scorers || []).map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  <Icon name="sports_soccer" size={13} className="text-[#ccff00]" />
                  <span className="text-[#f5f5f5] font-medium">{s.player}</span>
                  <span className="font-heading font-bold text-[#ccff00]">{s.minute}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================================================
  // RENDERIZADO DEL MENÚ LATERAL DESPLEGABLE (SIDEBAR)
  // ==========================================================================
  const navMenuItems = [
    { id: 'matches', label: 'Agenda & Fixture', icon: 'calendar_month', badge: matches.length },
    {
      id: 'live_now',
      label: 'En Juego Ahora',
      icon: 'sensors',
      badge: liveMatchesCount,
      isLiveBadge: true
    },
    {
      id: 'multipantalla',
      label: 'Multipantalla TV',
      icon: 'grid_view',
      badge: multiScreenMatchIds.length
    },
    { id: 'standings', label: 'Tablas & Promedios', icon: 'leaderboard' },
    { id: 'scorers', label: 'Goleadores', icon: 'emoji_events' },
    {
      id: 'favorites',
      label: 'Mis Favoritos',
      icon: 'star',
      badge: favoriteMatchIds.length + favoriteTeams.length
    },
    {
      id: 'admin',
      label: 'Consola Admin API',
      icon: 'terminal',
      badge: 'PRO',
      isAccentBadge: true
    }
  ];

  const renderSidebarContent = (isCompact = false) => (
    <div className="flex flex-col h-full bg-[#0e0e0e] border-r border-[#2e2e2e] select-none">
      {/* Cabecera de Marca + Botón Colapsar */}
      <div className="h-16 px-3.5 border-b border-[#222222] flex items-center justify-between gap-2 shrink-0">
        <div
          onClick={() => {
            setActiveTab('matches');
            setOnlyLiveFilter(false);
            setSelectedCategory('ALL');
            setSelectedLeagueId('ALL');
          }}
          className="flex items-center gap-2.5 cursor-pointer group overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-[#ccff00] text-[#080808] flex items-center justify-center font-heading font-black text-xl shadow-[0_0_20px_rgba(204,255,0,0.3)] shrink-0">
            9
          </div>
          {!isCompact && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-lg tracking-wider text-[#f5f5f5] group-hover:text-[#ccff00] transition-colors">
                  ELNINE
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[rgba(204,255,0,0.12)] border border-[#ccff00]/30 text-[#ccff00] font-heading font-bold text-[10px]">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-[#737373] truncate">API & Live Match Center</p>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (mobileDrawerOpen) setMobileDrawerOpen(false);
            else setSidebarCollapsed(!sidebarCollapsed);
          }}
          className="w-8 h-8 rounded-lg bg-[#1f1f1f] border border-[#2e2e2e] text-[#999999] hover:text-[#ccff00] hover:border-[#ccff00]/40 flex items-center justify-center transition-all shrink-0"
          title={isCompact ? 'Expandir menú lateral' : 'Contraer menú lateral'}
        >
          <Icon name={isCompact ? 'menu' : 'menu_open'} size={18} />
        </button>
      </div>

      {/* Navegación Principal */}
      <div className="p-2.5 space-y-1 border-b border-[#222222]">
        {!isCompact && (
          <div className="px-2.5 py-1 text-[10px] font-heading font-bold uppercase tracking-widest text-[#737373]">
            Panel Principal
          </div>
        )}
        {navMenuItems.map((item) => {
          const isSelected =
            (item.id === 'live_now' && onlyLiveFilter && activeTab === 'matches') ||
            (item.id !== 'live_now' && activeTab === item.id && !onlyLiveFilter);

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'live_now') {
                  setActiveTab('matches');
                  setOnlyLiveFilter(true);
                } else {
                  setOnlyLiveFilter(false);
                  setActiveTab(item.id);
                }
                setMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center ${
                isCompact ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
              } rounded-xl text-xs font-semibold transition-all border ${
                isSelected
                  ? 'bg-[rgba(204,255,0,0.12)] border-[#ccff00]/40 text-[#ccff00] shadow-sm'
                  : 'bg-transparent border-transparent text-[#999999] hover:bg-[#1a1a1a] hover:text-[#f5f5f5]'
              }`}
              title={item.label}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  name={item.icon}
                  size={20}
                  filled={isSelected}
                  className={
                    item.isLiveBadge && liveMatchesCount > 0 ? 'text-[#ff3b3b]' : ''
                  }
                />
                {!isCompact && <span className="truncate">{item.label}</span>}
              </div>

              {!isCompact && item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-md font-heading font-bold text-[10px] ${
                    item.isLiveBadge
                      ? 'bg-[rgba(255,59,59,0.15)] text-[#ff3b3b] border border-[#ff3b3b]/30'
                      : item.isAccentBadge
                      ? 'bg-[#ccff00] text-[#080808]'
                      : 'bg-[#1f1f1f] text-[#999999] border border-[#2e2e2e]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explorador de Ligas con Logos Oficiales */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-2.5 space-y-1">
        {!isCompact && (
          <div className="px-2.5 py-1 flex items-center justify-between">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#737373]">
              Ligas & Logos Oficiales
            </span>
            <span className="text-[10px] font-heading text-[#ccff00]">
              {LEAGUES_CATALOG.length} activas
            </span>
          </div>
        )}

        {/* Botón Todas las Competiciones */}
        <button
          onClick={() => {
            setSelectedLeagueId('ALL');
            setSelectedCategory('ALL');
            setActiveTab('matches');
            setMobileDrawerOpen(false);
          }}
          className={`w-full flex items-center ${
            isCompact ? 'justify-center p-2' : 'justify-between px-3 py-2'
          } rounded-xl text-xs transition-all border ${
            selectedLeagueId === 'ALL' && activeTab === 'matches'
              ? 'bg-[#1f1f1f] border-[#ccff00]/40 text-[#f5f5f5] font-bold'
              : 'border-transparent text-[#999999] hover:bg-[#141414] hover:text-[#f5f5f5]'
          }`}
          title="Todas las Competiciones"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#1f1f1f] border border-[#2e2e2e] flex items-center justify-center text-[#ccff00] shrink-0">
              <Icon name="public" size={17} />
            </div>
            {!isCompact && <span className="truncate">Todas las Ligas</span>}
          </div>
          {!isCompact && (
            <span className="px-2 py-0.5 rounded-md bg-[#141414] border border-[#2e2e2e] font-heading text-[11px] text-[#999999]">
              {matches.length}
            </span>
          )}
        </button>

        {/* Lista de Ligas con su Logo Oficial Extraído */}
        {LEAGUES_CATALOG.map((league) => {
          const count = matches.filter((m) => m.leagueId === league.id).length;
          const liveInLeague = matches.filter(
            (m) => m.leagueId === league.id && m.statusType === 'LIVE'
          ).length;
          const isSelected = selectedLeagueId === league.id && activeTab === 'matches';
          const resolvedLogo = dynamicLeagueLogos[league.id] || league.logo;

          return (
            <button
              key={league.id}
              onClick={() => {
                setSelectedLeagueId(league.id);
                setActiveTab('matches');
                setMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center ${
                isCompact ? 'justify-center p-2' : 'justify-between px-2.5 py-2'
              } rounded-xl text-xs transition-all border ${
                isSelected
                  ? 'bg-[rgba(204,255,0,0.12)] border-[#ccff00]/40 text-[#f5f5f5] font-bold'
                  : 'border-transparent text-[#999999] hover:bg-[#141414] hover:text-[#f5f5f5]'
              }`}
              title={`${league.name} (${count} partidos)`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <LeagueLogo
                  name={league.name}
                  logoUrl={resolvedLogo}
                  countryCode={league.countryCode}
                  size="md"
                />
                {!isCompact && (
                  <div className="text-left min-w-0">
                    <div className="truncate text-xs leading-tight">{league.shortName}</div>
                    <div className="text-[10px] text-[#737373] truncate">{league.country}</div>
                  </div>
                )}
              </div>

              {!isCompact && (
                <div className="flex items-center gap-1 shrink-0">
                  {liveInLeague > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#ff3b3b] animate-live-pulse" />
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-md font-heading text-[11px] font-bold ${
                      count > 0
                        ? 'bg-[#1f1f1f] text-[#ccff00] border border-[#2e2e2e]'
                        : 'bg-[#141414] text-[#737373]'
                    }`}
                  >
                    {count}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Pie del Sidebar: Estado Auto-Refresh + Control de Intervalo */}
      <div className="p-3 border-t border-[#222222] bg-[#080808]/60 space-y-2 shrink-0">
        {!isCompact ? (
          <>
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-[#999999] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                <span>Auto-Sync en vivo</span>
              </span>
              <span className="font-heading font-bold text-[#ccff00]">{countdownSec}s</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#1f1f1f] overflow-hidden">
              <div
                className="h-full bg-[#ccff00] transition-all duration-700"
                style={{
                  width: `${Math.max(5, ((autoRefreshSec - countdownSec) / autoRefreshSec) * 100)}%`
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-1 pt-1">
              {[15, 30, 60].map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    setAutoRefreshSec(sec);
                    setCountdownSec(sec);
                  }}
                  className={`flex-1 py-1 rounded-lg font-heading font-bold text-[10px] border transition-all ${
                    autoRefreshSec === sec
                      ? 'bg-[#ccff00] text-[#080808] border-[#ccff00]'
                      : 'bg-[#141414] text-[#999999] border-[#2e2e2e] hover:text-[#f5f5f5]'
                  }`}
                >
                  {sec}s
                </button>
              ))}
              <button
                onClick={() => fetchMatchesForDate(selectedDateKey, false)}
                className="px-2.5 py-1 rounded-lg bg-[#1f1f1f] border border-[#2e2e2e] text-[#ccff00] hover:bg-[#ccff00] hover:text-[#080808] transition-all"
                title="Sincronizar ahora"
              >
                <Icon
                  name="sync"
                  size={14}
                  className={isLoadingMatches ? 'animate-spin' : ''}
                />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => fetchMatchesForDate(selectedDateKey, false)}
            className="w-full py-2 rounded-xl bg-[#1f1f1f] border border-[#2e2e2e] text-[#ccff00] flex items-center justify-center"
            title={`Sincronizar ahora (${countdownSec}s)`}
          >
            <Icon name="sync" size={18} className={isLoadingMatches ? 'animate-spin' : ''} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080808] text-[#f5f5f5] flex overflow-x-hidden selection:bg-[#ccff00] selection:text-[#080808]">
      {/* ================================================================== */}
      {/* INYECCIÓN DEL SISTEMA DE DISEÑO CSS Y FUENTES GOOGLE               */}
      {/* ================================================================== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,500;0,600;0,700;1,700&family=Inter:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        :root {
          --theme-bg-body: #080808;
          --theme-bg-secondary: #0e0e0e;
          --theme-bg-card: #141414;
          --theme-bg-card-hover: #1a1a1a;
          --theme-bg-elevated: #1f1f1f;
          --theme-bg-surface: #222222;
          --theme-accent: #ccff00;
          --theme-accent-dim: #99cc00;
          --theme-accent-ghost: rgba(204, 255, 0, 0.12);
          --theme-border: #2e2e2e;
          --theme-border-subtle: #222222;
          --theme-border-ghost: #1a1a1a;
          --theme-text-primary: #f5f5f5;
          --theme-text-secondary: #999999;
          --theme-text-muted: #737373;
          --theme-live: #ff3b3b;
          --theme-live-bg: rgba(255, 59, 59, 0.12);
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background-color: var(--theme-bg-body);
          color: var(--theme-text-primary);
          overflow-x: hidden;
        }

        .font-heading {
          font-family: 'Chakra Petch', 'Inter', sans-serif;
        }

        @keyframes livePulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.35;
            transform: scale(1.3);
          }
        }

        .animate-live-pulse {
          animation: livePulse 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ================================================================== */}
      {/* MENÚ LATERAL DESPLEGABLE EN ESCRITORIO                             */}
      {/* ================================================================== */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 sticky top-0 h-screen z-30 ${
          sidebarCollapsed ? 'w-[76px]' : 'w-72'
        }`}
      >
        {renderSidebarContent(sidebarCollapsed)}
      </aside>

      {/* ================================================================== */}
      {/* MENÚ LATERAL DESLIZABLE EN DISPOSITIVOS MÓVILES                    */}
      {/* ================================================================== */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden flex"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-72 max-w-[85vw] h-full shadow-2xl"
          >
            {renderSidebarContent(false)}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* CONTENEDOR CENTRAL Y SUPERIOR                                      */}
      {/* ================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* NOTIFICACIONES FLOTANTES DE ¡GOL! EN VIVO */}
        {goalAlerts.length > 0 && (
          <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full px-3 pointer-events-none">
            {goalAlerts.map((alert) => (
              <div
                key={alert.id}
                className="pointer-events-auto bg-[#141414] border-2 border-[#ccff00] rounded-2xl p-4 shadow-[0_0_30px_rgba(204,255,0,0.3)] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ccff00] text-[#080808] flex items-center justify-center shrink-0">
                    <Icon name="sports_soccer" size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#ccff00]">
                      GOL EN VIVO • {alert.clock}
                    </div>
                    <div className="text-sm font-heading font-bold text-[#f5f5f5]">
                      {alert.homeName} {alert.homeScore} - {alert.awayScore} {alert.awayName}
                    </div>
                    <div className="text-xs text-[#999999]">Anotó: {alert.scoringTeam}</div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setGoalAlerts((prev) => prev.filter((a) => a.id !== alert.id))
                  }
                  className="text-[#737373] hover:text-[#f5f5f5]"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CABECERA SUPERIOR STICKY */}
        <header className="sticky top-0 z-20 bg-[#0e0e0e]/95 backdrop-blur-xl border-b border-[#2e2e2e]">
          {/* Barra Superior de Estado Técnico */}
          <div className="px-3 sm:px-6 py-1.5 bg-[#080808] border-b border-[#222222] flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2 text-[#999999] min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[rgba(204,255,0,0.12)] border border-[#ccff00]/30 text-[#ccff00] font-heading font-bold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-live-pulse" />
                API ELNINE ACTIVA
              </span>
              <span className="hidden md:inline truncate text-[#999999]">
                {syncTelemetry.elnineSourceStatus}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-[#737373] font-heading">
                Logos: <strong className="text-[#f5f5f5]">{syncTelemetry.totalLogosExtracted}</strong> • TV:{' '}
                <strong className="text-[#f5f5f5]">{syncTelemetry.totalTvChannelsDetected}</strong> • Latencia:{' '}
                <strong className="text-[#ccff00]">{syncTelemetry.latencyMs}ms</strong>
              </span>
              <button
                onClick={() => setActiveTab('admin')}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#1f1f1f] hover:bg-[#ccff00] text-[#ccff00] hover:text-[#080808] border border-[#2e2e2e] font-heading font-bold text-[10px] transition-all"
              >
                <Icon name="terminal" size={13} />
                <span>ADMIN API</span>
              </button>
            </div>
          </div>

          {/* Barra Principal del Header */}
          <div className="px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Botón Menú Móvil + Título de Sección */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#f5f5f5] hover:border-[#ccff00] flex items-center justify-center"
                aria-label="Abrir menú lateral"
              >
                <Icon name="menu" size={22} />
              </button>

              <div>
                <h1 className="font-heading font-bold text-base sm:text-lg text-[#f5f5f5] tracking-wide flex items-center gap-2">
                  <span>
                    {activeTab === 'admin'
                      ? 'CONSOLA DE ADMINISTRACIÓN API & SCRAPER'
                      : activeTab === 'standings'
                      ? 'CLASIFICACIONES, TABLA ANUAL Y PROMEDIOS'
                      : activeTab === 'scorers'
                      ? 'GOLEADORES Y ESTADÍSTICAS'
                      : activeTab === 'multipantalla'
                      ? 'CENTRO MULTIPANTALLA EN VIVO'
                      : 'CARTELERA DE PARTIDOS Y TRANSMISIONES'}
                  </span>
                </h1>
                <p className="text-[11px] text-[#737373]">
                   Sincronizado con <span className="text-[#ccff00]">elnine.com.ar</span> • Fecha activa:{' '}
                  <span className="font-heading text-[#f5f5f5]">{selectedDateKey}</span>
                </p>
              </div>
            </div>

            {/* Buscador Global Instantáneo */}
            <div className="flex-1 max-w-md order-3 md:order-2 w-full md:w-auto">
              <div className="relative">
                <Icon
                  name="search"
                  size={18}
                  className="text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar equipo, liga, goleador o canal de TV..."
                  className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#141414] border border-[#2e2e2e] focus:border-[#ccff00] focus:outline-none text-xs sm:text-sm text-[#f5f5f5] placeholder-[#737373] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#f5f5f5]"
                  >
                    <Icon name="close" size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Controles Rápidos: En Vivo, Sonido, Agrupación y Actualizar */}
            <div className="flex items-center gap-2 order-2 md:order-3">
              {/* Botón Filtro EN VIVO */}
              <button
                onClick={() => {
                  setActiveTab('matches');
                  setOnlyLiveFilter(!onlyLiveFilter);
                }}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl font-heading font-bold text-xs border transition-all ${
                  onlyLiveFilter
                    ? 'bg-[#ff3b3b] text-[#f5f5f5] border-[#ff3b3b] shadow-[0_0_20px_rgba(255,59,59,0.4)]'
                    : 'bg-[#141414] text-[#f5f5f5] border-[#2e2e2e] hover:border-[#ff3b3b]/60'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    onlyLiveFilter ? 'bg-white animate-live-pulse' : 'bg-[#ff3b3b] animate-live-pulse'
                  }`}
                />
                <span>EN VIVO</span>
                <span className="px-1.5 py-0.2 rounded bg-black/40 text-[11px]">
                  {liveMatchesCount}
                </span>
              </button>

              {/* Botón Audio de Gol */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  soundEnabled
                    ? 'bg-[rgba(204,255,0,0.12)] border-[#ccff00]/40 text-[#ccff00]'
                    : 'bg-[#141414] border-[#2e2e2e] text-[#737373]'
                }`}
                title={
                  soundEnabled
                    ? 'Alerta sonora de gol activada'
                    : 'Alerta sonora de gol silenciada'
                }
              >
                <Icon name={soundEnabled ? 'volume_up' : 'volume_off'} size={18} />
              </button>

              {/* Selector de Agrupación */}
              <div className="hidden sm:inline-flex rounded-xl bg-[#141414] p-0.5 border border-[#2e2e2e]">
                <button
                  onClick={() => setGroupByMode('competition')}
                  className={`px-2.5 py-1.5 rounded-lg font-heading font-bold text-[11px] transition-all flex items-center gap-1 ${
                    groupByMode === 'competition'
                      ? 'bg-[#ccff00] text-[#080808]'
                      : 'text-[#999999] hover:text-[#f5f5f5]'
                  }`}
                >
                  <Icon name="emoji_events" size={14} />
                  <span>Torneo</span>
                </button>
                <button
                  onClick={() => setGroupByMode('time')}
                  className={`px-2.5 py-1.5 rounded-lg font-heading font-bold text-[11px] transition-all flex items-center gap-1 ${
                    groupByMode === 'time'
                      ? 'bg-[#ccff00] text-[#080808]'
                      : 'text-[#999999] hover:text-[#f5f5f5]'
                  }`}
                >
                  <Icon name="schedule" size={14} />
                  <span>Hora</span>
                </button>
              </div>

              {/* Botón Forzar Sincronización */}
              <button
                onClick={() => fetchMatchesForDate(selectedDateKey, false)}
                className="w-9 h-9 rounded-xl bg-[#141414] border border-[#2e2e2e] text-[#f5f5f5] hover:border-[#ccff00] hover:text-[#ccff00] flex items-center justify-center transition-all"
                title="Sincronizar datos ahora"
              >
                <Icon
                  name="sync"
                  size={18}
                  className={isLoadingMatches ? 'animate-spin text-[#ccff00]' : ''}
                />
              </button>
            </div>
          </div>

          {/* TIRA INTERACTIVA DE FECHAS (CALENDARIO DÍA POR DÍA) */}
          <div className="px-3 sm:px-6 py-2.5 bg-[#080808] border-t border-[#222222] flex items-center gap-2">
            <button
              onClick={() => {
                const d = parseDateKey(selectedDateKey);
                d.setDate(d.getDate() - 1);
                setSelectedDateKey(formatDateKey(d));
              }}
              className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] border border-[#2e2e2e] text-[#f5f5f5] flex items-center justify-center shrink-0 transition-all"
              title="Día anterior"
            >
              <Icon name="chevron_left" size={20} />
            </button>

            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {dateStripItems.map((item) => {
                const isSelected = item.key === selectedDateKey;
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedDateKey(item.key)}
                    className={`flex flex-col items-center justify-center min-w-[68px] sm:min-w-[78px] py-1.5 px-2.5 rounded-xl border text-center transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#ccff00] text-[#080808] border-[#ccff00] font-heading font-bold shadow-[0_0_16px_rgba(204,255,0,0.28)]'
                        : item.isToday
                        ? 'bg-[#141414] text-[#ccff00] border-[#ccff00]/40 font-heading font-bold hover:bg-[#1a1a1a]'
                        : 'bg-[#141414] text-[#999999] border-[#222222] hover:border-[#2e2e2e] hover:text-[#f5f5f5]'
                    }`}
                  >
                    <span className="text-[10px] tracking-widest uppercase font-extrabold">
                      {item.label}
                    </span>
                    <span className="text-xs sm:text-sm font-heading mt-0.5">
                      {item.dayNumber} {item.monthShort}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                const d = parseDateKey(selectedDateKey);
                d.setDate(d.getDate() + 1);
                setSelectedDateKey(formatDateKey(d));
              }}
              className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] border border-[#2e2e2e] text-[#f5f5f5] flex items-center justify-center shrink-0 transition-all"
              title="Día siguiente"
            >
              <Icon name="chevron_right" size={20} />
            </button>

            {selectedDateKey !== hoyAR() && (
              <button
                onClick={() => setSelectedDateKey(hoyAR())}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[rgba(204,255,0,0.12)] border border-[#ccff00]/40 text-[#ccff00] font-heading font-bold text-xs hover:bg-[#ccff00] hover:text-[#080808] transition-all shrink-0"
              >
                <Icon name="today" size={16} />
                <span>HOY</span>
              </button>
            )}

            <button
              onClick={() => {
                setCalendarViewDate(parseDateKey(selectedDateKey));
                setCalendarModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#ccff00] hover:bg-[#99cc00] text-[#080808] font-heading font-bold text-xs shadow-md transition-all shrink-0"
            >
              <Icon name="calendar_month" size={18} />
              <span className="hidden sm:inline">CALENDARIO</span>
            </button>
          </div>
        </header>

        {/* ================================================================ */}
        {/* CUERPO PRINCIPAL DE VISTAS                                       */}
        {/* ================================================================ */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-5 space-y-5">
          {(apiError || apiBase === API_BASE_POR_DEFECTO) && (
            <div role="alert" className="rounded-2xl border border-[#ff3b3b]/40 bg-[rgba(255,59,59,0.08)] p-4 flex items-start gap-3">
              <Icon name="cloud_off" size={22} className="text-[#ff3b3b] mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-heading font-bold text-sm text-[#f5f5f5]">
                  {apiBase === API_BASE_POR_DEFECTO ? 'Falta conectar tu API' : 'No se pudo conectar con la API'}
                </p>
                <p className="text-[#999999]">
                  {apiBase === API_BASE_POR_DEFECTO
                    ? 'Desplegá el backend (carpeta elnine-api) y pegá su URL en la pestaña Admin.'
                    : `${apiError}. Se muestran los últimos datos cargados; no se inventan partidos.`}
                </p>
                <button
                  onClick={() => { setActiveTab('admin'); }}
                  className="mt-1 px-3 py-1.5 rounded-lg bg-[#1f1f1f] border border-[#2e2e2e] font-heading font-bold text-[#f5f5f5] hover:border-[#ccff00]"
                >
                  Ir a Admin
                </button>
              </div>
            </div>
          )}
          {/* Píldoras Rápidas de Categorías */}
          {(activeTab === 'matches' || activeTab === 'favorites') && (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'ALL', label: 'Todas las Regiones', icon: 'public' },
                  { id: 'Argentina', label: 'Fútbol Argentino', icon: 'sports_soccer' },
                  { id: 'CONMEBOL', label: 'Libertadores & Sudamericana', icon: 'emoji_events' },
                  { id: 'Top Europa', label: 'Élite Europea', icon: 'stars' },
                  { id: 'América & Mundo', label: 'América & Mundo', icon: 'language' }
                ].map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedLeagueId('ALL');
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-bold border transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-[#ccff00] text-[#080808] border-[#ccff00]'
                          : 'bg-[#141414] text-[#999999] border-[#2e2e2e] hover:text-[#f5f5f5] hover:border-[#737373]'
                      }`}
                    >
                      <Icon name={cat.icon} size={15} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5">
                {favoriteTeams.slice(0, 3).map((team) => (
                  <button
                    key={team}
                    onClick={() => setSearchQuery(searchQuery === team ? '' : team)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all inline-flex items-center gap-1 ${
                      searchQuery === team
                        ? 'bg-[#ccff00] text-[#080808] border-[#ccff00] font-bold'
                        : 'bg-[#141414] text-[#999999] border-[#2e2e2e] hover:text-[#f5f5f5]'
                    }`}
                  >
                    <Icon name="star" size={12} filled className="text-[#ccff00]" />
                    <span>{team}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VISTA 1: AGENDA DE PARTIDOS Y FIXTURE                          */}
          {/* ============================================================== */}
          {(activeTab === 'matches' || activeTab === 'favorites') && (
            <>
              {isLoadingMatches ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="bg-[#141414] border border-[#2e2e2e] rounded-2xl p-4 animate-pulse space-y-3"
                    >
                      <div className="h-5 w-52 bg-[#222222] rounded-lg" />
                      <div className="h-11 w-full bg-[#1f1f1f] rounded-xl" />
                      <div className="h-11 w-full bg-[#1f1f1f] rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="bg-[#141414] border border-[#2e2e2e] rounded-2xl p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[rgba(204,255,0,0.12)] border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center mx-auto">
                    <Icon name="event_busy" size={26} />
                  </div>
                  <h3 className="font-heading text-base font-bold text-[#f5f5f5]">
                    No se encontraron partidos para los filtros seleccionados
                  </h3>
                  <p className="text-xs text-[#999999] max-w-md mx-auto">
                    Puedes cambiar la fecha en el calendario superior, desactivar el filtro de solo partidos en vivo o limpiar la búsqueda.
                  </p>
                  <button
                    onClick={() => {
                      setOnlyLiveFilter(false);
                      setSelectedCategory('ALL');
                      setSelectedLeagueId('ALL');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#ccff00] text-[#080808] font-heading font-bold text-xs hover:bg-[#99cc00] transition-all"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              ) : groupByMode === 'competition' ? (
                <div className="space-y-4">
                  {groupedByLeague.map((group) => {
                    const isCollapsed = !!collapsedLeagues[group.leagueId];
                    const liveInGroup = group.matches.filter(
                      (m) => m.statusType === 'LIVE'
                    ).length;

                    return (
                      <div
                        key={group.leagueId}
                        className="bg-[#141414] border border-[#2e2e2e] rounded-2xl overflow-hidden shadow-xl"
                      >
                        {/* Cabecera de Liga con Logo Oficial */}
                        <div
                          onClick={() => toggleLeagueAccordion(group.leagueId)}
                          className="px-4 py-3 bg-[#1a1a1a] border-b border-[#2e2e2e] flex items-center justify-between cursor-pointer select-none hover:bg-[#1f1f1f] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <LeagueLogo
                              name={group.leagueName}
                              logoUrl={group.leagueLogo}
                              countryCode={group.countryCode}
                              size="md"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="font-heading text-xs sm:text-sm font-bold tracking-wider uppercase text-[#f5f5f5] truncate">
                                  {group.leagueName}
                                </h2>
                                <span className="px-2 py-0.5 rounded-md bg-[#222222] border border-[#2e2e2e] text-[#ccff00] font-heading font-bold text-[10px]">
                                  {group.matches.length} PARTIDOS
                                </span>
                                {liveInGroup > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(255,59,59,0.12)] border border-[#ff3b3b]/30 text-[#ff3b3b] font-heading font-bold text-[10px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b3b] animate-live-pulse" />
                                    {liveInGroup} EN VIVO
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#737373]">{group.country}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setStandingsLeagueId(group.leagueId);
                                setActiveTab('standings');
                              }}
                              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#222222] hover:bg-[#ccff00] text-[#f5f5f5] hover:text-[#080808] border border-[#2e2e2e] font-heading font-bold text-[11px] transition-all"
                            >
                              <Icon name="leaderboard" size={14} />
                              <span>Posiciones</span>
                            </button>
                            <Icon
                              name={isCollapsed ? 'expand_more' : 'expand_less'}
                              size={20}
                              className="text-[#999999]"
                            />
                          </div>
                        </div>

                        {!isCollapsed && (
                          <div className="divide-y divide-[#222222]">
                            {group.matches.map((match) => renderMatchCard(match))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Agrupado Cronológicamente por Hora */
                <div className="bg-[#141414] border border-[#2e2e2e] rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-4 py-3 bg-[#1a1a1a] border-b border-[#2e2e2e] flex items-center justify-between">
                    <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ccff00] flex items-center gap-2">
                      <Icon name="schedule" size={17} />
                      <span>Orden Cronológico del Día</span>
                    </span>
                    <span className="font-heading text-xs text-[#999999]">
                      {sortedByTime.length} partidos
                    </span>
                  </div>
                  <div className="divide-y divide-[#222222]">
                    {sortedByTime.map((match) => (
                      <div key={match.id}>
                        <div className="px-4 py-1.5 bg-[#0e0e0e] flex items-center justify-between text-[10px] text-[#999999]">
                          <div className="flex items-center gap-2">
                            <LeagueLogo
                              name={match.leagueName}
                              logoUrl={dynamicLeagueLogos[match.leagueId] || match.leagueLogo}
                              countryCode={match.countryCode}
                              size="xs"
                            />
                            <span className="font-heading font-bold uppercase text-[#f5f5f5]">
                              {match.leagueName}
                            </span>
                          </div>
                          <span className="text-[#737373]">{match.venue}</span>
                        </div>
                        {renderMatchCard(match)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============================================================== */}
          {/* VISTA 2: CENTRO MULTIPANTALLA (HASTA 4 PARTIDOS EN SIMULTÁNEO) */}
          {/* ============================================================== */}
          {activeTab === 'multipantalla' && (
            <div className="space-y-4">
              <div className="bg-[#141414] border border-[#2e2e2e] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(204,255,0,0.12)] border border-[#ccff00]/40 text-[#ccff00] flex items-center justify-center">
                    <Icon name="grid_view" size={22} />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-base text-[#f5f5f5]">
                      Modo Multipantalla en Vivo ({multiScreenMatchIds.length}/4 activos)
                    </h2>
                    <p className="text-xs text-[#999999]">
                      Monitorea hasta 4 partidos simultáneamente con goles, reloj y canales de TV en tiempo real.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const autoPick = matches
                        .filter((m) => m.statusType === 'LIVE')
                        .concat(matches)
                        .slice(0, 4)
                        .map((m) => m.id);
                      setMultiScreenMatchIds(Array.from(new Set(autoPick)));
                    }}
                    className="px-3 py-2 rounded-xl bg-[#ccff00] text-[#080808] font-heading font-bold text-xs hover:bg-[#99cc00] transition-all inline-flex items-center gap-1.5"
                  >
                    <Icon name="bolt" size={16} />
                    <span>Cargar 4 Destacados</span>
                  </button>
                  {multiScreenMatchIds.length > 0 && (
                    <button
                      onClick={() => setMultiScreenMatchIds([])}
                      className="px-3 py-2 rounded-xl bg-[#1f1f1f] border border-[#2e2e2e] text-[#999999] hover:text-[#f5f5f5] font-heading font-bold text-xs"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {multiScreenMatchIds.length === 0 ? (
                <div className="bg-[#141414] border border-[#2e2e2e] rounded-2xl p-10 text-center space-y-3">
                  <Icon name="grid_view" size={36} className="text-[#ccff00] mx-auto" />
                  <h3 className="font-heading font-bold text-base text-[#f5f5f5]">
                    No has anclado partidos a la Multipantalla todavía
                  </h3>
                  <p className="text-xs text-[#999999] max-w-md mx-auto">
                    Haz clic en el botón &ldquo;Cargar 4 Destacados&rdquo; o pulsa el icono de cuadrícula en cualquier fila de partido.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {multiScreenMatchIds.map((id) => {
                    const m = matches.find((item) => item.id === id);
                    if (!m) return null;
                    return (
                      <div
                        key={m.id}
                        className="bg-[#141414] border border-[#2e2e2e] rounded-2xl p-4 space-y-4 shadow-xl flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between border-b border-[#222222] pb-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <LeagueLogo
                              name={m.leagueName}
                              logoUrl={dynamicLeagueLogos[m.leagueId] || m.leagueLogo}
                              countryCode={m.countryCode}
                              size="sm"
                            />
                            <span className="font-heading font-bold text-xs text-[#f5f5f5] truncate">
                              {m.leagueName}
                            </span>
                          </div>
                          <button
                            onClick={(e) => toggleMultiScreenMatch(e, m.id)}
                            className="text-[#737373] hover:text-[#ff3b3b]"
                            title="Quitar de Multipantalla"
                          >
                            <Icon name="close" size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-2 py-2">
                          <div className="flex flex-col items-center text-center gap-1.5">
                            <TeamCrest
                              name={m.homeTeam.name}
                              logoUrl={m.homeTeam.logo}
                              size="lg"
                            />
                            <span className="text-xs font-bold text-[#f5f5f5] truncate max-w-full">
                              {m.homeTeam.name}
                            </span>
                          </div>

                          <div className="flex flex-col items-center justify-center">
                            <div className="font-heading font-black text-2xl sm:text-3xl text-[#f5f5f5] flex items-center gap-2">
                              <span className="text-[#ccff00]">{m.homeTeam.score ?? '-'}</span>
                              <span className="text-[#737373]">:</span>
                              <span className="text-[#ccff00]">{m.awayTeam.score ?? '-'}</span>
                            </div>
                            <span
                              className={`mt-1 px-2.5 py-0.5 rounded-md font-heading font-bold text-[10px] ${
                                m.statusType === 'LIVE'
                                  ? 'bg-[rgba(255,59,59,0.12)] text-[#ff3b3b] border border-[#ff3b3b]/40'
                                  : 'bg-[#1f1f1f] text-[#999999]'
                              }`}
                            >
                              {m.displayClock}
                            </span>
                          </div>

                          <div className="flex flex-col items-center text-center gap-1.5">
                            <TeamCrest
                              name={m.awayTeam.name}
                              logoUrl={m.awayTeam.logo}
                              size="lg"
                            />
                            <span className="text-xs font-bold text-[#f5f5f5] truncate max-w-full">
                              {m.awayTeam.name}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#222222] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 flex-wrap">
                            {(m.tvChannels || []).slice(0, 2).map((ch, idx) => (
                              <TvChannelBadge key={idx} channelName={ch} compact />
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              setActiveMatchModal(m);
                              setMatchModalTab('lineups');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#1f1f1f] hover:bg-[#ccff00] text-[#ccff00] hover:text-[#080808] font-heading font-bold text-xs transition-all inline-flex items-center gap-1"
                          >
                            <Icon name="open_in_new" size={14} />
                            <span>Match Center</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* VISTA 3: TABLAS DE POSICIONES, TABLA ANUAL Y PROMEDIOS         */}
          {/* ============================================================== */}
          {activeTab === 'standings' && (
            <div className="bg-[#141414] border border-[#2e2e2e] rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222222] pb-4">
                <div className="flex items-center gap-3">
                  <LeagueLogo
                    name={
                      LEAGUES_CATALOG.find((l) => l.id === standingsLeagueId)?.name || 'Liga'
                    }
                    logoUrl={
                      dynamicLeagueLogos[standingsLeagueId] ||
                      LEAGUES_CATALOG.find((l) => l.id === standingsLeagueId)?.logo
                    }
                    size="lg"
                  />
                  <div>
                    <h2 className="font-heading text-base sm:text-lg font-bold text-[#f5f5f5]">
                      Clasificación Oficial y Promedios en Vivo
                    </h2>
                    <p className="text-xs text-[#999999]">
                      Datos extraídos del endpoint oficial de posiciones por liga
                    </p>
                  </div>
                </div>

                <select
                  value={standingsLeagueId}
                  onChange={(e) => setStandingsLeagueId(e.target.value)}
                  className="bg-[#1f1f1f] border border-[#2e2e2e] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-heading font-bold text-[#f5f5f5] focus:outline-none focus:border-[#ccff00]"
                >
                  {LEAGUES_CATALOG.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.country})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {[
                    { id: 'posiciones', label: 'Tabla de Posiciones', icon: 'leaderboard' },
                    { id: 'anual', label: 'Tabla Anual (Copas)', icon: 'emoji_events' },
                    { id: 'promedios', label: 'Tabla de Promedios', icon: 'analytics' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setStandingsSubTab(st.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-heading font-bold text-xs border transition-all ${
                        standingsSubTab === st.id
                          ? 'bg-[#ccff00] text-[#080808] border-[#ccff00]'
                          : 'bg-[#1f1f1f] text-[#999999] border-[#2e2e2e] hover:text-[#f5f5f5]'
                      }`}
                    >
                      <Icon name={st.icon} size={15} />
                      <span>{st.label}</span>
                    </button>
                  ))}
                </div>

                {isLoadingStandings && (
                  <span className="text-xs text-[#ccff00] font-heading flex items-center gap-1.5">
                    <Icon name="sync" size={15} className="animate-spin" />
                    <span>Actualizando tabla...</span>
                  </span>
                )}
              </div>

              <StandingsView
                data={liveStandingsData}
                error={standingsError}
                errorCode={standingsErrorCode}
                loading={isLoadingStandings}
                subTab={standingsSubTab}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* VISTA 4: GOLEADORES Y ARTILLEROS CON ESCUDOS OFICIALES         */}
          {/* ============================================================== */}
          {activeTab === 'scorers' && (
            <div className="bg-[#141414] border border-[#2e2e2e] rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#222222] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(204,255,0,0.12)] border border-[#ccff00]/40 text-[#ccff00] flex items-center justify-center">
                    <Icon name="emoji_events" size={22} />
                  </div>
                  <div>
                    <h2 className="font-heading text-base sm:text-lg font-bold text-[#f5f5f5]">
                      Tabla de Goleadores y Artilleros de la Jornada
                    </h2>
                    <p className="text-xs text-[#999999]">
                      Extraído en tiempo real de las incidencias de los partidos y estadísticas oficiales
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dynamicTopScorers.map((sc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e] hover:border-[#ccff00]/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg font-heading font-black text-xs flex items-center justify-center shrink-0 ${
                          idx === 0
                            ? 'bg-[#ccff00] text-[#080808]'
                            : 'bg-[#222222] text-[#999999] border border-[#2e2e2e]'
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      <TeamCrest name={sc.team} logoUrl={sc.teamLogo} size="md" />
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-[#f5f5f5] truncate">
                          {sc.player}
                        </div>
                        <div className="text-xs text-[#999999] truncate">
                          {sc.team} • {sc.penalties || 0} de penal
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-heading font-black text-2xl text-[#ccff00]">
                        {sc.goals}
                      </div>
                      <div className="text-[10px] font-heading uppercase tracking-wider text-[#737373]">
                        Goles
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VISTA 5: CONSOLA ADMIN DE LA API Y SCRAPER (TEMA #080808)      */}
          {/* ============================================================== */}
          {activeTab === 'admin' && (
            <div className="space-y-5">
              {/* Tarjetas KPI de Telemetría */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  {
                    label: 'Partidos Cargados',
                    value: matches.length,
                    icon: 'sports_soccer',
                    accent: 'text-[#ccff00]'
                  },
                  {
                    label: 'En Juego Ahora',
                    value: liveMatchesCount,
                    icon: 'sensors',
                    accent: 'text-[#ff3b3b]'
                  },
                  {
                    label: 'Logos Extraídos',
                    value: syncTelemetry.totalLogosExtracted,
                    icon: 'shield',
                    accent: 'text-[#ccff00]'
                  },
                  {
                    label: 'Canales TV Activos',
                    value: syncTelemetry.totalTvChannelsDetected,
                    icon: 'tv',
                    accent: 'text-[#f5f5f5]'
                  },
                  {
                    label: 'Latencia Media',
                    value: `${syncTelemetry.latencyMs}ms`,
                    icon: 'speed',
                    accent: 'text-[#ccff00]'
                  },
                  {
                    label: 'Nodos Conectados',
                    value: `${endpointHealthList.filter((n) => n.ok).length}/${endpointHealthList.length}`,
                    icon: 'router',
                    accent: 'text-[#ccff00]'
                  }
                ].map((kpi, idx) => (
                  <div
                    key={idx}
                    className="bg-[#141414] border border-[#2e2e2e] rounded-2xl p-4 space-y-2 shadow-lg"
                  >
                    <div className="flex items-center justify-between text-[#737373]">
                      <span className="text-[10px] font-heading font-bold uppercase tracking-wider">
                        {kpi.label}
                      </span>
                      <Icon name={kpi.icon} size={18} className={kpi.accent} />
                    </div>
                    <div className={`font-heading font-black text-2xl ${kpi.accent}`}>
                      {kpi.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Conexión con la API propia y sincronización */}
              <div className="bg-[#141414] border border-[#2e2e2e] rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222222] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(204,255,0,0.12)] border border-[#ccff00]/40 text-[#ccff00] flex items-center justify-center">
                      <Icon name="terminal" size={22} />
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-base text-[#f5f5f5]">
                        Conexión con tu API y estado de las fuentes
                      </h2>
                      <p className="text-xs text-[#999999]">
                        El backend lee elnine.com.ar y las ligas por vos: acá configurás su URL y ves qué fuente responde
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      value={apiBaseInput}
                      onChange={(e) => setApiBaseInput(e.target.value)}
                      placeholder="https://elnine-api.tu-usuario.workers.dev"
                      aria-label="URL de la API"
                      className="w-64 rounded-xl bg-[#0e0e0e] border border-[#2e2e2e] px-3 py-2 text-xs font-mono text-[#f5f5f5] placeholder-[#737373] focus:outline-none focus:border-[#ccff00]"
                    />
                    <input
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Clave (opcional)"
                      type="password"
                      aria-label="Clave de la API"
                      className="w-36 rounded-xl bg-[#0e0e0e] border border-[#2e2e2e] px-3 py-2 text-xs font-mono text-[#f5f5f5] placeholder-[#737373] focus:outline-none focus:border-[#ccff00]"
                    />
                    <button
                      onClick={guardarConexionApi}
                      className="px-4 py-2 rounded-xl bg-[#1f1f1f] border border-[#2e2e2e] text-[#f5f5f5] font-heading font-bold text-xs hover:border-[#ccff00]"
                    >
                      Guardar
                    </button>

                    <button
                      onClick={() => fetchMatchesForDate(selectedDateKey, false)}
                      className="px-4 py-2 rounded-xl bg-[#ccff00] hover:bg-[#99cc00] text-[#080808] font-heading font-bold text-xs inline-flex items-center gap-1.5 transition-all"
                    >
                      <Icon name="sync" size={16} className={isLoadingMatches ? 'animate-spin' : ''} />
                      <span>Sincronizar ahora</span>
                    </button>
                  </div>
                </div>

                {/* Estado por liga según la última sincronización */}
                <div className="overflow-x-auto rounded-xl border border-[#2e2e2e]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#1f1f1f] text-[#999999] font-heading font-bold uppercase border-b border-[#2e2e2e]">
                        <th className="py-3 px-3">Nodo / Competición</th>
                        <th className="py-3 px-3">Endpoint Activo</th>
                        <th className="py-3 px-2 text-center">Estado</th>
                        <th className="py-3 px-2 text-center">Latencia</th>
                        <th className="py-3 px-2 text-center">Eventos</th>
                        <th className="py-3 px-2 text-center">Logos</th>
                        <th className="py-3 px-2 text-center">Canales TV</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]">
                      {endpointHealthList.map((node) => (
                        <tr key={node.id} className="bg-[#141414] hover:bg-[#1a1a1a]">
                          <td className="py-2.5 px-3 font-bold text-[#f5f5f5] flex items-center gap-2.5">
                            {node.logo ? (
                              <LeagueLogo name={node.name} logoUrl={node.logo} size="xs" />
                            ) : (
                              <Icon name="language" size={16} className="text-[#ccff00]" />
                            )}
                            <span className="truncate">{node.name}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[#999999] truncate max-w-xs">
                            {node.endpoint}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              title={node.detail || ''}
                              className={`px-2 py-0.5 rounded border font-heading font-bold text-[10px] ${
                                node.ok
                                  ? 'bg-[rgba(204,255,0,0.12)] border-[#ccff00]/30 text-[#ccff00]'
                                  : 'bg-[rgba(255,59,59,0.12)] border-[#ff3b3b]/40 text-[#ff3b3b]'
                              }`}
                            >
                              {node.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-heading text-[#f5f5f5]">
                            {node.latencyMs} ms
                          </td>
                          <td className="py-2.5 px-2 text-center font-heading font-bold text-[#ccff00]">
                            {node.eventsCount}
                          </td>
                          <td className="py-2.5 px-2 text-center font-heading text-[#999999]">
                            {node.logosCount}
                          </td>
                          <td className="py-2.5 px-2 text-center font-heading text-[#999999]">
                            {node.tvCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Consola de Logs + Extractor Manual de Código Fuente HTML */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#999999] flex items-center gap-1.5">
                      <Icon name="code" size={16} className="text-[#ccff00]" />
                      <span>Registro de Telemetría en Tiempo Real</span>
                    </label>
                    <div className="bg-[#080808] border border-[#2e2e2e] rounded-xl p-3 font-mono text-[11px] text-[#ccff00] space-y-1.5 h-44 overflow-y-auto">
                      {syncTelemetry.logs.map((log, i) => (
                        <div key={i} className="leading-relaxed">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#999999] flex items-center gap-1.5">
                      <Icon name="link" size={16} className="text-[#ccff00]" />
                      <span>URLs para integrar en tu app</span>
                    </label>
                    <div className="bg-[#080808] border border-[#2e2e2e] rounded-xl p-3 space-y-2 h-44 overflow-y-auto">
                      {[
                        { t: 'Partidos de hoy', u: '/v1/partidos' },
                        { t: 'Partidos por fecha y liga', u: `/v1/partidos?fecha=${selectedDateKey}&liga=arg.1` },
                        { t: 'En vivo ahora', u: '/v1/partidos?envivo=1' },
                        { t: 'Tabla de posiciones', u: '/v1/tablas/arg.1' },
                        { t: 'Tabla anual', u: '/v1/tablas/arg.1/anual' },
                        { t: 'Escudos de elnine.com.ar', u: '/v1/escudos' },
                        { t: 'Documentación', u: '/' }
                      ].map((ep) => {
                        const full = `${apiBase}${ep.u}`;
                        return (
                          <div key={ep.u} className="flex items-center gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] uppercase font-heading text-[#737373]">{ep.t}</div>
                              <div className="font-mono text-[11px] text-[#ccff00] truncate">{full}</div>
                            </div>
                            <button
                              onClick={() => copiarEndpoint(full)}
                              className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#1f1f1f] border border-[#2e2e2e] text-[11px] font-heading font-bold text-[#f5f5f5] hover:border-[#ccff00]"
                            >
                              {copiedEndpoint === full ? 'Copiado' : 'Copiar'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* PIE DE PÁGINA PROFESIONAL */}
        <footer className="mt-auto border-t border-[#222222] bg-[#0e0e0e] py-4 px-4 sm:px-6 text-xs text-[#737373]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-[#f5f5f5]">ELNINE.COM.AR PRO</span>
              <span>•</span>
              <span>Logos Oficiales, Canales de TV, Formaciones Tácticas y Estadísticas en Vivo</span>
            </div>
            <div className="font-heading text-[#999999]">
              Fecha Activa: <span className="text-[#ccff00]">{selectedDateKey}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ================================================================== */}
      {/* MODAL DE CALENDARIO MENSUAL COMPLETO                               */}
      {/* ================================================================== */}
      {calendarModalOpen && (
        <div
          onClick={() => setCalendarModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border border-[#2e2e2e] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <div className="flex items-center gap-2">
                <Icon name="calendar_month" size={20} className="text-[#ccff00]" />
                <h3 className="font-heading font-bold text-base text-[#f5f5f5]">
                  Calendario de Partidos por Fecha
                </h3>
              </div>
              <button
                onClick={() => setCalendarModalOpen(false)}
                className="text-[#999999] hover:text-[#f5f5f5]"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between bg-[#1f1f1f] p-2.5 rounded-xl border border-[#2e2e2e]">
              <button
                onClick={() =>
                  setCalendarViewDate(
                    new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1)
                  )
                }
                className="w-8 h-8 rounded-lg hover:bg-[#222222] text-[#f5f5f5] flex items-center justify-center"
              >
                <Icon name="chevron_left" size={20} />
              </button>
              <span className="font-heading font-bold text-sm uppercase tracking-wider text-[#f5f5f5]">
                {MONTHS_ES[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
              </span>
              <button
                onClick={() =>
                  setCalendarViewDate(
                    new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1)
                  )
                }
                className="w-8 h-8 rounded-lg hover:bg-[#222222] text-[#f5f5f5] flex items-center justify-center"
              >
                <Icon name="chevron_right" size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-heading font-bold text-[#737373]">
              {DAYS_SHORT_ES.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarDaysGrid.map((cell, idx) => {
                if (!cell) return <div key={`empty-${idx}`} className="h-10" />;
                const isSelected = cell.dateKey === selectedDateKey;
                return (
                  <button
                    key={cell.dateKey}
                    onClick={() => {
                      setSelectedDateKey(cell.dateKey);
                      setCalendarModalOpen(false);
                    }}
                    className={`h-10 rounded-xl font-heading text-xs font-bold flex flex-col items-center justify-center transition-all border ${
                      isSelected
                        ? 'bg-[#ccff00] text-[#080808] border-[#ccff00] font-black shadow-lg'
                        : cell.isToday
                        ? 'bg-[rgba(204,255,0,0.12)] text-[#ccff00] border-[#ccff00]/40'
                        : 'bg-[#1f1f1f] text-[#f5f5f5] border-[#2e2e2e] hover:border-[#ccff00]/50'
                    }`}
                  >
                    <span>{cell.day}</span>
                    {cell.isToday && (
                      <span className="text-[8px] leading-none uppercase">Hoy</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#222222] flex items-center justify-between gap-2">
              <input
                type="date"
                value={selectedDateKey}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDateKey(e.target.value);
                    setCalendarModalOpen(false);
                  }
                }}
                className="bg-[#1f1f1f] border border-[#2e2e2e] rounded-xl px-3 py-2 text-xs font-heading text-[#f5f5f5] focus:outline-none focus:border-[#ccff00]"
              />
              <button
                onClick={() => {
                  setSelectedDateKey(hoyAR());
                  setCalendarModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#ccff00] text-[#080808] font-heading font-bold text-xs hover:bg-[#99cc00]"
              >
                Saltar a Hoy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL MATCH CENTER EN VIVO (CANCHA 2D, ESTADÍSTICAS, RELATO, H2H)  */}
      {/* ================================================================== */}
      {activeMatchModal && (() => {
        const details = liveMatchSummary || buildFallbackMatchDetails(activeMatchModal);
        const modalChannels =
          activeMatchModal.tvChannels || normalizeTvChannels(activeMatchModal.tv);

        return (
          <div
            onClick={() => setActiveMatchModal(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-[#2e2e2e] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl my-auto"
            >
              {/* Cabecera del Match Center */}
              <div className="bg-gradient-to-b from-[#1f1f1f] to-[#141414] p-4 sm:p-6 border-b border-[#2e2e2e] relative">
                <button
                  onClick={() => setActiveMatchModal(null)}
                  className="absolute right-4 top-4 w-9 h-9 rounded-xl bg-[#222222] border border-[#2e2e2e] text-[#999999] hover:text-[#f5f5f5] flex items-center justify-center"
                >
                  <Icon name="close" size={20} />
                </button>

                {/* Liga y Estadio */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-heading font-bold text-[#ccff00] uppercase tracking-wider mb-4">
                  <LeagueLogo
                    name={activeMatchModal.leagueName}
                    logoUrl={
                      dynamicLeagueLogos[activeMatchModal.leagueId] ||
                      activeMatchModal.leagueLogo
                    }
                    countryCode={activeMatchModal.countryCode}
                    size="sm"
                  />
                  <span>{activeMatchModal.leagueName}</span>
                  <span className="text-[#737373]">•</span>
                  <span className="text-[#999999] inline-flex items-center gap-1">
                    <Icon name="stadium" size={15} />
                    {details.venueInfo?.fullName || activeMatchModal.venue}
                  </span>
                </div>

                {/* Equipos y Marcador */}
                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <TeamCrest
                      name={activeMatchModal.homeTeam.name}
                      logoUrl={activeMatchModal.homeTeam.logo}
                      size="xl"
                    />
                    <h3 className="font-heading font-bold text-sm sm:text-lg text-[#f5f5f5]">
                      {activeMatchModal.homeTeam.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-[#222222] border border-[#2e2e2e] text-[11px] font-heading text-[#ccff00]">
                      Esquema {details.homeFormation}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="font-heading font-black text-3xl sm:text-5xl tracking-wider text-[#f5f5f5] flex items-center gap-3">
                      <span className="text-[#ccff00]">
                        {activeMatchModal.homeTeam.score ?? '-'}
                      </span>
                      <span className="text-[#737373] text-2xl">:</span>
                      <span className="text-[#ccff00]">
                        {activeMatchModal.awayTeam.score ?? '-'}
                      </span>
                    </div>

                    <div
                      className={`mt-2 px-3 py-1 rounded-lg font-heading font-bold text-xs inline-flex items-center gap-1.5 ${
                        activeMatchModal.statusType === 'LIVE'
                          ? 'bg-[rgba(255,59,59,0.15)] text-[#ff3b3b] border border-[#ff3b3b]/40'
                          : 'bg-[#222222] text-[#999999] border border-[#2e2e2e]'
                      }`}
                    >
                      {activeMatchModal.statusType === 'LIVE' && (
                        <span className="w-2 h-2 rounded-full bg-[#ff3b3b] animate-live-pulse" />
                      )}
                      <span>{activeMatchModal.displayClock}</span>
                    </div>

                    {/* Insignias de Canales de TV */}
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                      {modalChannels.map((ch, idx) => (
                        <TvChannelBadge key={idx} channelName={ch} />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center gap-2">
                    <TeamCrest
                      name={activeMatchModal.awayTeam.name}
                      logoUrl={activeMatchModal.awayTeam.logo}
                      size="xl"
                    />
                    <h3 className="font-heading font-bold text-sm sm:text-lg text-[#f5f5f5]">
                      {activeMatchModal.awayTeam.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-[#222222] border border-[#2e2e2e] text-[11px] font-heading text-[#f5f5f5]">
                      Esquema {details.awayFormation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pestañas del Match Center */}
              <div className="flex overflow-x-auto no-scrollbar border-b border-[#2e2e2e] bg-[#0e0e0e]">
                {[
                  { id: 'lineups', label: 'Cancha 2D & Formaciones', icon: 'groups' },
                  { id: 'stats', label: 'Estadísticas', icon: 'bar_chart' },
                  { id: 'summary', label: 'Cronología', icon: 'timeline' },
                  { id: 'commentary', label: 'Relato en Vivo', icon: 'Description' },
                  { id: 'h2h', label: 'Cara a Cara & Estadio', icon: 'history' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setMatchModalTab(t.id)}
                    className={`flex-1 min-w-[140px] py-3 px-3 text-xs font-heading font-bold flex items-center justify-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                      matchModalTab === t.id
                        ? 'border-[#ccff00] text-[#ccff00] bg-[rgba(204,255,0,0.06)]'
                        : 'border-transparent text-[#999999] hover:text-[#f5f5f5]'
                    }`}
                  >
                    <Icon name={t.icon} size={17} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Cuerpo del Match Center */}
              <div className="p-4 sm:p-6 max-h-[62vh] overflow-y-auto space-y-5">
                {isLoadingSummary && (
                  <div className="text-center py-2 text-xs font-heading text-[#ccff00] flex items-center justify-center gap-2">
                    <Icon name="sync" size={16} className="animate-spin" />
                    <span>Sincronizando datos tácticos en tiempo real...</span>
                  </div>
                )}

                {/* PESTAÑA 1: CANCHA 2D INTERACTIVA Y FORMACIONES */}
                {matchModalTab === 'lineups' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between text-xs text-[#999999]">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#ccff00] inline-block" />
                        <strong className="text-[#f5f5f5]">{activeMatchModal.homeTeam.name}</strong> ({details.homeFormation})
                      </span>
                      <span className="text-[11px] text-[#737373]">
                        Haz clic en cualquier jugador para ver su ficha técnica
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <strong className="text-[#f5f5f5]">{activeMatchModal.awayTeam.name}</strong> ({details.awayFormation})
                        <span className="w-3 h-3 rounded-full bg-[#f5f5f5] inline-block" />
                      </span>
                    </div>

                    {/* Campo de Juego 2D Estilizado */}
                    <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-[#0e1f14] border-2 border-[#2e2e2e] overflow-hidden shadow-inner select-none">
                      {/* Franjas de césped */}
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(90deg, transparent, transparent 10%, rgba(204,255,0,0.08) 10%, rgba(204,255,0,0.08) 20%)'
                        }}
                      />
                      {/* Líneas reglamentarias */}
                      <div className="absolute inset-3 border border-white/25 rounded-lg pointer-events-none" />
                      <div className="absolute top-3 bottom-3 left-1/2 w-px bg-white/25 pointer-events-none" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/25 pointer-events-none" />
                      <div className="absolute top-1/4 bottom-1/4 left-3 w-16 border-r border-y border-white/25 pointer-events-none" />
                      <div className="absolute top-1/4 bottom-1/4 right-3 w-16 border-l border-y border-white/25 pointer-events-none" />

                      {/* 11 Titulares Locales */}
                      {details.homeLineup.map((p, idx) => (
                        <button
                          key={`h-${idx}`}
                          onClick={() =>
                            setSelectedPitchPlayer({
                              ...p,
                              teamName: activeMatchModal.homeTeam.name,
                              teamLogo: activeMatchModal.homeTeam.logo
                            })
                          }
                          style={{ left: `${p.x}%`, top: `${p.y}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group focus:outline-none"
                        >
                          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ccff00] text-[#080808] font-heading font-black text-xs flex items-center justify-center border-2 border-[#080808] shadow-lg group-hover:scale-110 transition-transform">
                            {p.num}
                            {p.goals > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#080808] text-[#ccff00] border border-[#ccff00] flex items-center justify-center">
                                <Icon name="sports_soccer" size={10} />
                              </span>
                            )}
                          </div>
                          <span className="mt-1 px-1.5 py-0.5 rounded bg-[#080808]/90 border border-[#2e2e2e] text-[9px] sm:text-[10px] text-[#f5f5f5] font-medium whitespace-nowrap">
                            {p.name}
                          </span>
                        </button>
                      ))}

                      {/* 11 Titulares Visitantes */}
                      {details.awayLineup.map((p, idx) => (
                        <button
                          key={`a-${idx}`}
                          onClick={() =>
                            setSelectedPitchPlayer({
                              ...p,
                              teamName: activeMatchModal.awayTeam.name,
                              teamLogo: activeMatchModal.awayTeam.logo
                            })
                          }
                          style={{ left: `${p.x}%`, top: `${p.y}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group focus:outline-none"
                        >
                          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f5f5f5] text-[#080808] font-heading font-black text-xs flex items-center justify-center border-2 border-[#080808] shadow-lg group-hover:scale-110 transition-transform">
                            {p.num}
                            {p.goals > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#080808] text-[#ccff00] border border-[#ccff00] flex items-center justify-center">
                                <Icon name="sports_soccer" size={10} />
                              </span>
                            )}
                          </div>
                          <span className="mt-1 px-1.5 py-0.5 rounded bg-[#080808]/90 border border-[#2e2e2e] text-[9px] sm:text-[10px] text-[#f5f5f5] font-medium whitespace-nowrap">
                            {p.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Ficha del Jugador Seleccionado en la Cancha */}
                    {selectedPitchPlayer && (
                      <div className="p-4 rounded-xl bg-[#1f1f1f] border border-[#ccff00]/40 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <TeamCrest
                            name={selectedPitchPlayer.teamName}
                            logoUrl={selectedPitchPlayer.teamLogo}
                            size="md"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-[#ccff00] text-[#080808] font-heading font-black text-xs">
                                #{selectedPitchPlayer.num}
                              </span>
                              <span className="font-heading font-bold text-sm text-[#f5f5f5]">
                                {selectedPitchPlayer.fullName || selectedPitchPlayer.name}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-[#141414] border border-[#2e2e2e] text-[10px] font-heading text-[#999999]">
                                {selectedPitchPlayer.pos}
                              </span>
                            </div>
                            <p className="text-xs text-[#999999] mt-0.5">
                              {selectedPitchPlayer.teamName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-heading">
                          <div>
                            <span className="text-[#737373] block text-[10px]">GOLES</span>
                            <strong className="text-[#ccff00] text-sm">
                              {selectedPitchPlayer.goals || 0}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[#737373] block text-[10px]">REMATES</span>
                            <strong className="text-[#f5f5f5] text-sm">
                              {selectedPitchPlayer.shots || 0}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[#737373] block text-[10px]">FALTAS</span>
                            <strong className="text-[#f5f5f5] text-sm">
                              {selectedPitchPlayer.fouls || 0}
                            </strong>
                          </div>
                          <button
                            onClick={() => setSelectedPitchPlayer(null)}
                            className="text-[#999999] hover:text-[#f5f5f5]"
                          >
                            <Icon name="close" size={18} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Bancos de Suplentes */}
                    {(details.homeSubs?.length > 0 || details.awaySubs?.length > 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="bg-[#0e0e0e] border border-[#222222] rounded-xl p-3 space-y-2">
                          <h4 className="font-heading font-bold text-xs uppercase text-[#ccff00]">
                            Suplentes {activeMatchModal.homeTeam.name}
                          </h4>
                          <div className="divide-y divide-[#222222] text-xs">
                            {details.homeSubs.slice(0, 9).map((s, i) => (
                              <div
                                key={i}
                                className="py-1.5 flex items-center justify-between text-[#999999]"
                              >
                                <span className="text-[#f5f5f5] font-medium">
                                  <strong className="font-heading text-[#ccff00] mr-2">
                                    #{s.num}
                                  </strong>
                                  {s.name}
                                </span>
                                <span className="text-[10px] font-heading">{s.pos}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-[#0e0e0e] border border-[#222222] rounded-xl p-3 space-y-2">
                          <h4 className="font-heading font-bold text-xs uppercase text-[#f5f5f5]">
                            Suplentes {activeMatchModal.awayTeam.name}
                          </h4>
                          <div className="divide-y divide-[#222222] text-xs">
                            {details.awaySubs.slice(0, 9).map((s, i) => (
                              <div
                                key={i}
                                className="py-1.5 flex items-center justify-between text-[#999999]"
                              >
                                <span className="text-[#f5f5f5] font-medium">
                                  <strong className="font-heading text-[#999999] mr-2">
                                    #{s.num}
                                  </strong>
                                  {s.name}
                                </span>
                                <span className="text-[10px] font-heading">{s.pos}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* PESTAÑA 2: ESTADÍSTICAS COMPARATIVAS */}
                {matchModalTab === 'stats' && (
                  <div className="space-y-4">
                    {details.stats.map((st, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-heading font-bold">
                          <span className="text-[#ccff00]">{st.home}</span>
                          <span className="text-[#f5f5f5] uppercase tracking-wider text-[11px]">
                            {st.label}
                          </span>
                          <span className="text-[#f5f5f5]">{st.away}</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-[#0e0e0e] border border-[#2e2e2e] overflow-hidden flex">
                          <div
                            className="bg-[#ccff00] h-full transition-all"
                            style={{ width: `${st.homePct}%` }}
                          />
                          <div
                            className="bg-[#737373] h-full transition-all"
                            style={{ width: `${st.awayPct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* PESTAÑA 3: CRONOLOGÍA E INCIDENCIAS (CERO EMOJIS) */}
                {matchModalTab === 'summary' && (
                  <div className="space-y-2.5">
                    {details.events.length === 0 ? (
                      <div className="text-center py-8 text-xs text-[#999999]">
                        El encuentro aún no registra incidencias oficiales.
                      </div>
                    ) : (
                      details.events.map((ev) => (
                        <div
                          key={ev.id}
                          className={`flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e] ${
                            ev.team === 'away' ? 'flex-row-reverse text-right' : ''
                          }`}
                        >
                          <span className="px-2.5 py-1 rounded-lg bg-[#0e0e0e] border border-[#2e2e2e] text-[#ccff00] font-heading font-bold text-xs">
                            {ev.minute}
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-[#222222] flex items-center justify-center shrink-0">
                            {ev.type === 'goal' ? (
                              <Icon name="sports_soccer" size={18} className="text-[#ccff00]" />
                            ) : ev.type === 'red' ? (
                              <CardBadge type="red" />
                            ) : ev.type === 'yellow' ? (
                              <CardBadge type="yellow" />
                            ) : (
                              <Icon name="swap_horiz" size={18} className="text-sky-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-[#f5f5f5]">
                              {ev.player}
                            </div>
                            {ev.detail && (
                              <div className="text-[11px] text-[#999999] truncate">
                                {ev.detail}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* PESTAÑA 4: RELATO MINUTO A MINUTO */}
                {matchModalTab === 'commentary' && (
                  <div className="space-y-2.5">
                    {details.commentary?.length > 0 ? (
                      details.commentary.map((com) => (
                        <div
                          key={com.id}
                          className="p-3 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e] flex items-start gap-3 text-xs"
                        >
                          <span className="px-2 py-0.5 rounded bg-[#0e0e0e] border border-[#2e2e2e] font-heading font-bold text-[#ccff00] shrink-0">
                            {com.minute || 'INFO'}
                          </span>
                          <p className="text-[#f5f5f5] leading-relaxed">{com.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-xs text-[#999999]">
                        Relato minuto a minuto disponible durante el transcurso en vivo del partido.
                      </div>
                    )}
                  </div>
                )}

                {/* PESTAÑA 5: CARA A CARA (H2H) Y DATOS DEL ESTADIO */}
                {matchModalTab === 'h2h' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e]">
                        <div className="text-[10px] font-heading uppercase text-[#737373]">
                          Estadio Oficial
                        </div>
                        <div className="font-bold text-xs text-[#f5f5f5] mt-1">
                          {details.venueInfo?.fullName}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e]">
                        <div className="text-[10px] font-heading uppercase text-[#737373]">
                          Árbitro Principal
                        </div>
                        <div className="font-bold text-xs text-[#ccff00] mt-1">
                          {details.venueInfo?.referee}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e]">
                        <div className="text-[10px] font-heading uppercase text-[#737373]">
                          Capacidad / Asistencia
                        </div>
                        <div className="font-bold text-xs text-[#f5f5f5] mt-1">
                          {details.venueInfo?.attendance ||
                            details.venueInfo?.capacity ||
                            'Confirmado por Liga'}
                        </div>
                      </div>
                    </div>

                    {details.headToHead?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-heading font-bold text-xs uppercase text-[#ccff00]">
                          Últimos Enfrentamientos Directos (H2H)
                        </h4>
                        {details.headToHead.map((h) => (
                          <div
                            key={h.id}
                            className="p-3 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-between text-xs"
                          >
                            <span className="text-[#999999]">{h.date}</span>
                            <span className="font-bold text-[#f5f5f5]">{h.league}</span>
                            <span className="font-heading font-bold text-[#ccff00]">
                              {h.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}