import { readFileSync } from 'node:fs';

for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i === -1) continue;
  process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const { default: handler } = await import('../api/visitas.js');

function mockReq(method, url = '/api/visitas') {
  return { method, url, headers: { 'user-agent': 'turso-smoke-test' } };
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

const req = mockReq('GET');
const res = mockRes();
await handler(req, res);
const data = JSON.parse(res.body);
if (res.statusCode !== 200) {
  console.error('FAIL', res.statusCode, data);
  process.exit(1);
}
console.log('OK Turso remoto — visitas actuales:', data.total);
