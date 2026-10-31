import { unlinkSync, existsSync } from 'node:fs';

process.env.TURSO_DATABASE_URL = 'file:test-visitas-temp.db';

const dbPath = 'test-visitas-temp.db';
if (existsSync(dbPath)) {
  try {
    unlinkSync(dbPath);
  } catch {
    /* Windows lock */
  }
}

const { default: handler } = await import('../api/visitas.js');

function mockReq(method, url = '/api/visitas') {
  return { method, url, headers: { 'user-agent': 'test-agent' } };
}

function mockRes() {
  return {
    statusCode: 0,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    end(body) {
      this.body = body;
    },
  };
}

async function run(method, url) {
  const req = mockReq(method, url);
  const res = mockRes();
  await handler(req, res);
  const data = JSON.parse(res.body);
  return { status: res.statusCode, data };
}

const post = await run('POST', '/api/visitas?src=whatsapp');
const get = await run('GET');
const post2 = await run('POST', '/api/visitas?src=directo');
const get2 = await run('GET');

console.log(JSON.stringify({ post, get, post2, get2 }, null, 2));

if (post.status !== 200 || get.status !== 200) process.exit(1);
if (post.data.total !== 1 || get.data.total !== 1) process.exit(1);
if (post2.data.total !== 2 || get2.data.total !== 2) process.exit(1);
console.log('OK: API visitas');
