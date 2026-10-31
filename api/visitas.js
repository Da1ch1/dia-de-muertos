// Contador de visitas — Turso (SQLite en la nube)
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'file:visitas-local.db';
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.TURSO_DATABASE_AUTH_TOKEN;
const db = createClient(authToken ? { url, authToken } : { url });

let listo = null;
function preparar() {
  if (!listo) {
    listo = db.execute(`CREATE TABLE IF NOT EXISTS visitas (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha   TEXT NOT NULL DEFAULT (datetime('now')),
      origen  TEXT,
      agente  TEXT
    )`).catch((e) => { listo = null; throw e; });
  }
  return listo;
}

function responder(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  try {
    await preparar();
    if (req.method === 'POST') {
      const q = new URL(req.url, 'http://x').searchParams;
      const origen = (q.get('src') || 'directo').slice(0, 40);
      const agente = String(req.headers['user-agent'] || '').slice(0, 200);
      await db.execute({ sql: 'INSERT INTO visitas (origen, agente) VALUES (?, ?)', args: [origen, agente] });
    } else if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET, POST');
      return responder(res, 405, { error: 'Método no permitido' });
    }
    const r = await db.execute('SELECT COUNT(*) AS total FROM visitas');
    return responder(res, 200, { total: Number(r.rows[0].total) });
  } catch (e) {
    console.error('visitas:', e);
    return responder(res, 500, { error: 'No se pudo leer el contador' });
  }
}