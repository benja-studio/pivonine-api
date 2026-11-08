export const PAGINA_DOCS = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>API El Nine — Documentación</title>
<style>
:root{--bg:#080808;--card:#141414;--tx:#f5f5f5;--mut:#999;--ac:#ccff00;--bd:#2e2e2e}
body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.6 system-ui,sans-serif;padding:24px;max-width:860px;margin-inline:auto}
h1{color:var(--ac);margin:0 0 4px}h2{margin-top:32px;border-bottom:1px solid var(--bd);padding-bottom:6px}
code,pre{background:var(--card);border:1px solid var(--bd);border-radius:6px;font-family:ui-monospace,monospace}
code{padding:1px 6px}pre{padding:12px;overflow-x:auto}.m{color:var(--ac);font-weight:700}p,li{color:#ddd}.s{color:var(--mut)}
</style></head><body>
<h1>API El Nine</h1><p class="s">Fútbol en español, horario argentino (UTC-3). Todas las respuestas son JSON.</p>
<h2>Endpoints</h2>
<p><span class="m">GET</span> <code>/v1/partidos?fecha=AAAA-MM-DD&amp;liga=arg.1,arg.copa&amp;envivo=1</code><br>Partidos del día argentino. Todos los parámetros son opcionales (por defecto: hoy, todas las ligas).</p>
<p><span class="m">GET</span> <code>/v1/envivo</code> — atajo a los partidos en juego.</p>
<p><span class="m">GET</span> <code>/v1/partidos/:liga/:id</code> — estadísticas, alineaciones y eventos clave.</p>
<p><span class="m">GET</span> <code>/v1/tablas/:liga</code> — posiciones con zonas/grupos y leyenda de clasificación.</p>
<p><span class="m">GET</span> <code>/v1/tablas/:liga/anual</code> y <code>/promedios</code> — leídas de elnine.com.ar (requieren configurar la URL).</p>
<p><span class="m">GET</span> <code>/v1/ligas</code> · <code>/v1/escudos</code> · <code>/v1/health</code></p>
<h2>Ejemplo</h2>
<pre>fetch("/v1/partidos?liga=arg.1")
  .then(r =&gt; r.json())
  .then(({ data }) =&gt; data.partidos.forEach(p =&gt;
    console.log(p.hora, p.local.nombre, p.local.goles, "-", p.visitante.goles, p.visitante.nombre)))</pre>
<h2>Formato</h2>
<pre>{ "ok": true, "data": { ... }, "meta": { "generadoEn": "ISO", "zonaHoraria": "America/Argentina/Buenos_Aires", "fuente": "..." } }
{ "ok": false, "error": { "codigo": "FECHA_INVALIDA", "mensaje": "..." } }</pre>
<p>Estados de partido: <code>programado</code> · <code>en_vivo</code> · <code>entretiempo</code> · <code>finalizado</code> · <code>suspendido</code> · <code>postergado</code> · <code>cancelado</code>.</p>
<p>Si el servicio tiene clave, enviá el header <code>X-API-Key</code>.</p>
</body></html>`;
