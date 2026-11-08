# API El Nine

Backend que le da a tu admin (y a tu app) una **URL propia** con fútbol en español y horario argentino.

## Publicarla (5 minutos, gratis)

```bash
cd elnine-api
npm install
npx wrangler login        # abre el navegador, creás cuenta Cloudflare si no tenés
npm run deploy            # te imprime tu URL: https://elnine-api.TU-USUARIO.workers.dev
```

1. Abrí esa URL en el navegador: ves la documentación.
2. En el admin, pestaña **Admin**, pegá la URL en "URL de la API" y tocá **Guardar**.
3. (Opcional) Clave: `npx wrangler secret put API_KEY` y mandá `X-API-Key` desde tu app.
4. (Para la tabla anual) En `wrangler.toml` descomentá `ELNINE_ANUAL_URL` con la página de elnine donde está esa tabla y volvé a hacer `npm run deploy`.

## Usarla desde tu app

```ts
import { crearClienteElNine } from './client/elnine';
const api = crearClienteElNine('https://elnine-api.TU-USUARIO.workers.dev');

const { partidos } = await api.partidos({ liga: 'arg.1' });        // hoy (horario ARG)
const { grupos, leyenda } = await api.tabla('arg.1');              // zonas A/B, etc.
```

O con `fetch` directo: `GET /v1/partidos?fecha=2026-11-08&liga=arg.1,arg.copa`.

| Ruta | Qué devuelve |
|---|---|
| `/v1/partidos?fecha=&liga=&envivo=1` | Partidos del día argentino (hora, estado, escudos, canales, goleadores, rojas) |
| `/v1/partidos/:liga/:id` | Estadísticas, alineaciones, eventos |
| `/v1/tablas/:liga` | Posiciones por zona/grupo + leyenda de clasificación/descenso |
| `/v1/tablas/:liga/anual` · `/promedios` | Desde elnine.com.ar (hay que configurar la URL) |
| `/v1/ligas` · `/v1/escudos` · `/v1/health` | Catálogo, escudos de elnine, estado |
| `/v1/debug/elnine?url=` | Qué ve el servidor en una página de elnine (para ajustar el lector) |

Errores: `{ "ok": false, "error": { "codigo": "...", "mensaje": "..." } }`.

## Pruebas

`npm test` (13 pruebas: horario UTC-3, partidos nocturnos, zonas A/B, escudos, caída de una liga, clave).

## Qué hay que saber

- **elnine.com.ar bloquea bots**: desde donde armé esto no pude abrirlo, así que el lector de escudos/tablas está probado con HTML de ejemplo, no con el sitio real. Después de publicar, abrí `/v1/debug/elnine` y `/v1/escudos`: si dice `bloqueado: true` o 0 escudos, avisame lo que muestra y lo ajusto. Mientras tanto la API sigue funcionando con los escudos de ESPN.
- El **caché de borde** de Cloudflare funciona con dominio propio; en `workers.dev` puede no aplicar (cada consulta va directo a la fuente, sigue andando).
- Plan gratis de Workers: 100.000 consultas/día. Cada `/v1/partidos` hace 18 llamadas internas (límite gratis: 50).
