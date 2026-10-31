# dia-de-muertos

Landing con video de Día de Muertos, contador de visitas con pétalos de cempasúchil y despliegue en [Vercel](https://vercel.com).

## Contenido

- `index.html` — reproductor + contador (UI)
- `api/visitas.js` — API serverless (GET conteo, POST nueva visita)
- `video.mp4` — video principal
- `poster.jpg` — poster / Open Graph
- `vercel.json` — cabeceras de caché

## Turso (producción en Vercel)

El contador persiste en [Turso](https://turso.tech). Sin estas variables, la API falla en Vercel y el contador se oculta en la página.

1. Crea una base en Turso (CLI o dashboard).
2. En Vercel → **Project → Settings → Environment Variables**, agrega:
   - `TURSO_DATABASE_URL` — URL `libsql://...`
   - `TURSO_AUTH_TOKEN` — token de la base
3. Redespliega el proyecto.

## Desarrollo local

Sirve la carpeta (solo HTML estático; la API requiere `vercel dev` o probar el handler):

```bash
npm install
npx vercel dev
```

Prueba rápida del handler (SQLite local `file:`):

```bash
node scripts/test-visitas.mjs
```
