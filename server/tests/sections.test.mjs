import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { app } from '../dist/app.js';
import * as service from '../dist/services/profile.service.js';

let server;
let origin;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  origin = `http://127.0.0.1:${server.address().port}/api/profile`;
});
after(async () => { await new Promise((resolve) => server.close(resolve)); });
beforeEach(async () => { await fetch(origin, { method: 'DELETE' }); });

async function request(method, body) {
  const response = await fetch(origin, { method, ...(body && {
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }) });
  return { status: response.status, body: response.status === 204 ? undefined : await response.json() };
}

const profile = {
  basics: { name: 'Ada', label: 'Engineer', email: '', phone: '+62 0812', url: '', summary: '' },
  work: [{ name: 'Acme', position: 'Engineer', url: 'https://acme.example', startDate: '2020-01', endDate: '', summary: 'Built tools.', highlights: ['Improved accessibility', 'Reduced load time'] }],
  education: [{ institution: 'University', area: 'Computing', studyType: 'BSc', score: '3.90', url: '', startDate: '2016', endDate: '2020', courses: ['Algorithms'] }],
  skills: [{ name: 'Web', level: 'Advanced', keywords: ['React', 'TypeScript'] }],
  projects: [{ name: 'Resumaer', description: 'A profile builder.', url: 'https://example.com', startDate: '2024-02-29', endDate: '2025', highlights: ['Accessible forms'] }],
  certificates: [{ name: 'Cloud fundamentals', issuer: 'Example', date: '2024-02-29', url: 'https://example.com/certificate' }],
};

test('all sections can be created, loaded, edited, removed, and deleted together', async () => {
  const draft = structuredClone(profile);
  for (const section of ['work', 'education', 'skills', 'projects', 'certificates']) {
    draft[section].push(structuredClone(draft[section][0]));
  }
  assert.deepEqual(await request('POST', draft), { status: 201, body: draft });
  assert.deepEqual((await request('GET')).body, draft);
  draft.work[1].position = 'Senior engineer';
  draft.education[1].score = '4.00';
  draft.skills[1].keywords.push('CSS');
  draft.projects[1].description = 'Updated project.';
  draft.certificates[1].issuer = 'Updated issuer';
  assert.deepEqual(await request('PUT', draft), { status: 200, body: draft });
  for (const section of ['work', 'education', 'skills', 'projects', 'certificates']) draft[section].splice(0, 1);
  assert.deepEqual(await request('PUT', draft), { status: 200, body: draft });
  assert.deepEqual((await request('GET')).body, draft);
  assert.equal((await request('DELETE')).status, 204);
  assert.equal((await request('GET')).status, 404);
  assert.equal((await request('POST', profile)).status, 201);
});

test('optional fields and arrays are normalized, including text lists', async () => {
  const minimal = {
    basics: { name: '  Ada  ' }, work: [{ name: ' Acme ', position: ' Engineer ', highlights: [' One ', '', ' Two '] }],
    education: [{ institution: ' University ' }], skills: [{ name: ' Web ' }],
    projects: [{ name: ' Project ' }], certificates: [{ name: ' Certificate ' }],
  };
  const result = await request('POST', minimal);
  assert.equal(result.status, 201);
  assert.deepEqual(result.body.work[0], {
    name: 'Acme', position: 'Engineer', url: '', startDate: '', endDate: '', summary: '', highlights: ['One', 'Two'],
  });
  assert.deepEqual(result.body.education[0].courses, []);
  assert.deepEqual(result.body.skills[0].keywords, []);
  assert.deepEqual(result.body.projects[0].highlights, []);
  assert.equal(result.body.certificates[0].date, '');
  assert.equal(result.body.basics.name, 'Ada');
});

test('invalid section shapes and entries return paths and preserve every saved section', async () => {
  await request('POST', profile);
  for (const section of ['work', 'education', 'skills', 'projects', 'certificates']) {
    for (const [value, path] of [[null, section], [{}, section], [[null], `${section}.0`], [[[]], `${section}.0`], [[{}], `${section}.0.${section === 'education' ? 'institution' : 'name'}`]]) {
      const result = await request('PUT', { ...profile, [section]: value });
      assert.equal(result.status, 400, path);
      assert.equal(typeof result.body.errors[path], 'string', path);
      assert.deepEqual((await request('GET')).body, profile);
    }
    const invalid = { ...profile, [section]: [{ ...profile[section][0], unsupported: true }] };
    assert.equal((await request('PUT', invalid)).status, 400);
    assert.deepEqual((await request('GET')).body, profile);
  }
});

test('required text, real dates, date order, URLs, lists, and lengths are validated', async () => {
  await request('POST', profile);
  const cases = [
    ['work', { position: ' ' }, 'position'],
    ['work', { summary: 42 }, 'summary'],
    ['work', { startDate: '2023-02-29' }, 'startDate'],
    ['education', { endDate: '2015-12' }, 'endDate'],
    ['education', { startDate: '2020-13' }, 'startDate'],
    ['projects', { startDate: '2024-04-31' }, 'startDate'],
    ['projects', { url: 'javascript:alert(1)' }, 'url'],
    ['certificates', { date: '0000' }, 'date'],
    ['certificates', { url: 'https:example.com' }, 'url'],
    ['work', { highlights: 'One item' }, 'highlights'],
    ['skills', { keywords: ['React', null] }, 'keywords'],
    ['education', { courses: ['a'.repeat(501)] }, 'courses'],
    ['projects', { name: 'a'.repeat(121) }, 'name'],
    ['projects', { description: 'a'.repeat(5001) }, 'description'],
  ];
  for (const [section, changes, field] of cases) {
    const draft = structuredClone(profile);
    draft[section][0] = { ...draft[section][0], ...changes };
    const result = await request('PUT', draft);
    assert.equal(result.status, 400, `${section}.${field}`);
    assert.equal(typeof result.body.errors[`${section}.0.${field}`], 'string');
    assert.deepEqual((await request('GET')).body, profile);
  }
});

test('entry and list limits allow their boundaries and reject excess', async () => {
  const draft = structuredClone(profile);
  draft.work = Array.from({ length: 50 }, () => ({ ...profile.work[0], highlights: Array(50).fill('a'.repeat(500)) }));
  assert.equal((await request('POST', draft)).status, 413); // The independent 1 MB body limit still applies.
  draft.work = Array.from({ length: 50 }, () => structuredClone(profile.work[0]));
  draft.skills[0].keywords = Array(50).fill('a'.repeat(500));
  assert.equal((await request('POST', draft)).status, 201);
  for (const section of ['work', 'education', 'skills', 'projects', 'certificates']) {
    const invalid = { ...draft, [section]: Array(51).fill(profile[section][0]) };
    const result = await request('PUT', invalid);
    assert.equal(result.status, 400);
    assert.equal(typeof result.body.errors[section], 'string');
    assert.deepEqual((await request('GET')).body, draft);
  }
  draft.skills[0].keywords.push('One too many');
  const result = await request('PUT', draft);
  assert.equal(result.status, 400);
  assert.equal(typeof result.body.errors['skills.0.keywords'], 'string');
});

test('partial dates allow overlapping periods and reject reversed periods', async () => {
  const draft = structuredClone(profile);
  await request('POST', draft);
  for (const [startDate, endDate, status] of [
    ['2024-02-29', '2024-02', 200], ['2024-12-31', '2024', 200],
    ['2024', '2024-01-01', 200], ['2024-03', '2024-02', 400],
    ['2000-02-29', '', 200], ['1900-02-29', '', 400], ['2024-01-02', '2024-01-01', 400],
  ]) {
    draft.work[0].startDate = startDate;
    draft.work[0].endDate = endDate;
    assert.equal((await request('PUT', draft)).status, status, `${startDate} to ${endDate}`);
  }
});

test('nested service copies cannot mutate stored entries or lists', async () => {
  await request('POST', profile);
  const copy = service.getProfile();
  copy.work[0].highlights.push('Unwanted change');
  copy.skills[0].name = 'Unwanted change';
  copy.education.splice(0, 1);
  assert.deepEqual((await request('GET')).body, profile);
});
