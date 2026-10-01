import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { app } from '../dist/app.js';

let server;
let origin;

before(async () => {
  // Port 0 asks the OS for a free port, keeping tests separate from the dev server.
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

beforeEach(async () => {
  await fetch(`${origin}/api/profile`, { method: 'DELETE' });
});

async function request(method, body, path = '/api/profile') {
  const response = await fetch(`${origin}${path}`, {
    method,
    ...(body !== undefined && {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  });
  return {
    status: response.status,
    body: response.status === 204 ? undefined : await response.json(),
  };
}

const profile = {
  basics: {
    name: 'Ada Lovelace',
    label: 'Software engineer',
    email: 'ada@example.com',
    phone: '+62 123 456 789',
    url: 'https://example.com',
    summary: 'I build useful software.',
  },
};

test('complete create, load, update, and delete lifecycle', async () => {
  assert.equal((await request('GET')).status, 404);
  assert.equal((await request('PUT', profile)).status, 404);
  assert.equal((await request('DELETE')).status, 404);

  const created = await request('POST', profile);
  assert.equal(created.status, 201);
  assert.deepEqual(created.body, profile);
  assert.deepEqual((await request('GET')).body, profile);

  assert.equal((await request('POST', { basics: { name: 'Replacement' } })).status, 409);
  assert.deepEqual((await request('GET')).body, profile);

  const updated = { basics: { ...profile.basics, name: 'Grace Hopper', summary: 'Compiler pioneer.' } };
  assert.deepEqual(await request('PUT', updated), { status: 200, body: updated });
  // A separate GET represents loading the saved profile after a browser refresh.
  assert.deepEqual((await request('GET')).body, updated);
  assert.deepEqual(await request('DELETE'), { status: 204, body: undefined });
  assert.equal((await request('GET')).status, 404);
  assert.equal((await request('POST', profile)).status, 201);
});

test('optional fields default to empty strings and input strings are trimmed', async () => {
  assert.deepEqual((await request('POST', { basics: { name: '  Ada  ' } })).body, {
    basics: { name: 'Ada', label: '', email: '', phone: '', url: '', summary: '' },
  });
  const padded = { basics: Object.fromEntries(Object.entries(profile.basics).map(([key, value]) => [key, `  ${value}  `])) };
  assert.deepEqual((await request('PUT', padded)).body, profile);
  assert.deepEqual((await request('GET')).body, profile);
});

test('invalid fields return useful errors without changing the saved profile', async () => {
  await request('POST', profile);
  const invalidInputs = [
    [{ name: '' }, 'name'],
    [{ name: '   ' }, 'name'],
    [{ name: null }, 'name'],
    [{ label: 42 }, 'label'],
    [{ email: 'invalid-address' }, 'email'],
    [{ phone: ['123'] }, 'phone'],
    [{ url: 'example.com' }, 'url'],
    [{ url: 'https:example.com' }, 'url'],
    [{ url: 'ftp://example.com' }, 'url'],
    [{ summary: {} }, 'summary'],
  ];

  for (const [changes, field] of invalidInputs) {
    const result = await request('PUT', { basics: { ...profile.basics, ...changes } });
    assert.equal(result.status, 400, field);
    assert.equal(typeof result.body.errors[field], 'string', field);
    assert.deepEqual((await request('GET')).body, profile);
  }
});

test('field limits are enforced, and exact limits are accepted', async () => {
  await request('POST', profile);
  const limits = { name: 120, label: 120, email: 254, phone: 50, url: 2048, summary: 5000 };
  const atLimit = {
    name: 'a'.repeat(120),
    label: 'a'.repeat(120),
    email: `${'a'.repeat(242)}@example.com`,
    phone: '1'.repeat(50),
    url: `https://example.com/${'a'.repeat(2028)}`,
    summary: 'a'.repeat(5000),
  };
  for (const [field, limit] of Object.entries(limits)) {
    const result = await request('PUT', { basics: { ...profile.basics, [field]: 'a'.repeat(limit + 1) } });
    assert.equal(result.status, 400, field);
    assert.match(result.body.errors[field], new RegExp(String(limit)), field);
    assert.deepEqual((await request('GET')).body, profile);
    assert.equal(atLimit[field].length, limit);
  }
  assert.deepEqual(await request('PUT', { basics: atLimit }), { status: 200, body: { basics: atLimit } });
});

test('wrong shapes and unsupported fields do not create or overwrite a profile', async () => {
  const invalid = [
    {}, [], null,
    { basics: [] }, { basics: null }, { basics: {} },
    { basics: { name: 'Ada' }, work: [] },
    { basics: { name: 'Ada', website: 'https://example.com' } },
  ];
  for (const body of invalid) {
    const result = await request('POST', body);
    assert.equal(result.status, 400);
    assert.equal(typeof result.body.message, 'string');
    assert.equal((await request('GET')).status, 404);
  }
  await request('POST', profile);
  for (const body of invalid) {
    assert.equal((await request('PUT', body)).status, 400);
    assert.deepEqual((await request('GET')).body, profile);
  }
});

test('malformed JSON, empty bodies, wrong content types, and oversized requests preserve saved data', async () => {
  await request('POST', profile);
  const requests = [
    [{ headers: { 'Content-Type': 'application/json' }, body: '{"basics":' }, 400],
    [{ headers: { 'Content-Type': 'application/json' } }, 400],
    [{ headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(profile) }, 415],
    [{ headers: { 'Content-Type': 'application/json; charset=latin1' }, body: JSON.stringify(profile) }, 415],
    [{ headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'unsupported' }, body: JSON.stringify(profile) }, 415],
    [{ body: JSON.stringify(profile) }, 415],
    [{ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ basics: { name: 'Ada', summary: 'a'.repeat(34000) } }) }, 413],
  ];
  for (const [options, expectedStatus] of requests) {
    const response = await fetch(`${origin}/api/profile`, { method: 'PUT', ...options });
    assert.equal(response.status, expectedStatus);
    assert.match(response.headers.get('content-type'), /application\/json/);
    assert.equal(typeof (await response.json()).message, 'string');
    assert.deepEqual((await request('GET')).body, profile);
  }
  assert.equal((await request('PUT', { basics: { ...profile.basics, label: 'Recovered' } })).status, 200);
});

test('health, unknown endpoints, and local browser CORS work', async () => {
  assert.deepEqual(await request('GET', undefined, '/api/health'), { status: 200, body: { status: 'ok' } });
  const missing = await request('GET', undefined, '/api/missing');
  assert.equal(missing.status, 404);
  assert.equal(typeof missing.body.message, 'string');

  const response = await fetch(`${origin}/api/profile`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:5173',
      'Access-Control-Request-Method': 'PUT',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  assert.match(response.headers.get('access-control-allow-methods'), /PUT/);
  assert.match(response.headers.get('access-control-allow-headers'), /content-type/i);
});
