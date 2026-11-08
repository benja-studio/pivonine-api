export interface Liga {
  id: string; espn: string; nombre: string; corto: string; pais: string; categoria: string; prioridad: number; logo: string;
}
const L = (id: string, nombre: string, corto: string, pais: string, categoria: string, logoId: number): Liga => ({
  id, espn: id, nombre, corto, pais, categoria, prioridad: 0,
  logo: `https://a.espncdn.com/i/leaguelogos/soccer/500/${logoId}.png`,
});

// Los IDs de logo vienen del catálogo original del admin. Si elnine publica el logo de la liga,
// el enriquecimiento (elnine.ts) lo pisa automáticamente.
export const LIGAS: Liga[] = [
  L('arg.1', 'Liga Profesional Argentina', 'Liga Profesional', 'Argentina', 'Argentina', 1),
  L('arg.copa', 'Copa Argentina', 'Copa Argentina', 'Argentina', 'Argentina', 2192),
  L('arg.2', 'Primera Nacional', 'Primera Nacional', 'Argentina', 'Argentina', 202),
  L('conmebol.libertadores', 'CONMEBOL Libertadores', 'Copa Libertadores', 'Sudamérica', 'CONMEBOL', 13),
  L('conmebol.sudamericana', 'CONMEBOL Sudamericana', 'Copa Sudamericana', 'Sudamérica', 'CONMEBOL', 1931),
  L('uefa.champions', 'UEFA Champions League', 'Champions League', 'Europa', 'Top Europa', 2),
  L('uefa.europa', 'UEFA Europa League', 'Europa League', 'Europa', 'Top Europa', 2310),
  L('eng.1', 'Premier League', 'Premier League', 'Inglaterra', 'Top Europa', 23),
  L('esp.1', 'LaLiga', 'LaLiga', 'España', 'Top Europa', 15),
  L('ita.1', 'Serie A', 'Serie A', 'Italia', 'Top Europa', 12),
  L('ger.1', 'Bundesliga', 'Bundesliga', 'Alemania', 'Top Europa', 10),
  L('fra.1', 'Ligue 1', 'Ligue 1', 'Francia', 'Top Europa', 9),
  L('bra.1', 'Brasileirão Betano', 'Brasileirão', 'Brasil', 'América y Mundo', 85),
  L('uru.1', 'Campeonato Uruguayo', 'Liga Uruguaya', 'Uruguay', 'América y Mundo', 1751),
  L('col.1', 'Liga BetPlay Dimayor', 'Liga BetPlay', 'Colombia', 'América y Mundo', 1543),
  L('usa.1', 'Major League Soccer', 'MLS', 'Estados Unidos', 'América y Mundo', 19),
  L('mex.1', 'Liga MX', 'Liga MX', 'México', 'América y Mundo', 22),
].map((l, i) => ({ ...l, prioridad: i + 1 }));

export const ligaPorId = (id: string) => LIGAS.find((l) => l.id === id);
