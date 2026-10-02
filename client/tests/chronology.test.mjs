import assert from 'node:assert/strict';
import { test } from 'node:test';
import { emptyProfile } from '../src/types/profile.ts';
import {
  chronologicalIndexes, errorsInDraftOrder, restoreDraftOrder, sortProfileChronologically,
} from '../src/utils/sortChronologically.ts';

test('ongoing ranges come first, completed ranges use end date and then start date', () => {
  const entries = [
    { startDate: '2024', endDate: '2025' },
    { startDate: '2020', endDate: '2026' },
    { startDate: '2022', endDate: '' },
    { startDate: '2025', endDate: '   ' },
    { startDate: '2023', endDate: '2025' },
    { startDate: '', endDate: '' },
  ];
  assert.deepEqual(chronologicalIndexes(entries), [3, 2, 1, 0, 4, 5]);
});

test('single dates and release dates sort consistently across date precisions', () => {
  const values = ['2024', '2025-03', '2025-03-09', '2025', '2025-03-01', '2024-12-31'];
  assert.deepEqual(chronologicalIndexes(values.map(date => ({ date }))), [2, 1, 4, 3, 5, 0]);
  assert.deepEqual(chronologicalIndexes(values.map(releaseDate => ({ releaseDate }))), [2, 1, 4, 3, 5, 0]);
});

test('equal and missing dates retain original order, including sections without dates', () => {
  assert.deepEqual(chronologicalIndexes([
    { date: '' }, { date: '2025' }, { date: '2025-01-01' }, { date: '2025' }, { date: '' },
  ]), [1, 2, 3, 0, 4]);
  assert.deepEqual(chronologicalIndexes([{ name: 'Z' }, { name: 'A' }]), [0, 1]);
  assert.deepEqual(chronologicalIndexes([]), []);
});

test('invalid and incomplete draft dates go last without calendar rollover', () => {
  const values = ['2025-02-29', '2024-02-29', '0000', '2025-13', '2025-04-31', '2025-', '', ' 2025-02-28 '];
  assert.deepEqual(chronologicalIndexes(values.map(date => ({ date }))), [7, 1, 0, 2, 3, 4, 5, 6]);
  assert.deepEqual(chronologicalIndexes([
    { startDate: '', endDate: '' },
    { startDate: '', endDate: '2025' },
    { startDate: '2024', endDate: 'invalid' },
  ]), [1, 2, 0]);
});

test('every dated profile section sorts without mutating the draft or its other sections', () => {
  const draft = emptyProfile();
  for (const section of ['work', 'volunteer', 'education', 'projects']) {
    draft[section] = [
      { name: 'Older', startDate: '2020', endDate: '2021' },
      { name: 'Newer', startDate: '2024', endDate: '' },
    ];
  }
  for (const section of ['awards', 'certificates']) {
    draft[section] = [{ name: 'Older', date: '2021' }, { name: 'Newer', date: '2024' }];
  }
  draft.publications = [{ name: 'Older', releaseDate: '2021' }, { name: 'Newer', releaseDate: '2024' }];
  draft.skills = [{ name: 'Z' }, { name: 'A' }];
  draft.languages = [{ language: 'Z' }, { language: 'A' }];
  draft.interests = [{ name: 'Z' }, { name: 'A' }];
  draft.references = [{ name: 'Z' }, { name: 'A' }];
  const snapshot = structuredClone(draft);
  const ordered = sortProfileChronologically(draft);
  for (const section of ['work', 'volunteer', 'education', 'projects', 'awards', 'certificates', 'publications']) {
    assert.deepEqual(ordered[section].map(entry => entry.name), ['Newer', 'Older']);
  }
  for (const section of ['basics', 'skills', 'languages', 'interests', 'references']) {
    assert.equal(ordered[section], draft[section]);
  }
  assert.deepEqual(draft, snapshot);
});

test('save normalization returns to the draft order and keeps subsequent sorts correct', () => {
  const draft = emptyProfile();
  draft.certificates = [
    { name: ' Older ', date: '2021' },
    { name: ' Newer ', date: '2024' },
    { name: ' No date ', date: '' },
  ];
  const ordered = sortProfileChronologically(draft);
  const saved = structuredClone(ordered);
  saved.certificates.forEach(entry => { entry.name = entry.name.trim(); });
  const restored = restoreDraftOrder(draft, saved);
  assert.deepEqual(restored.certificates.map(entry => entry.name), ['Older', 'Newer', 'No date']);
  assert.deepEqual(sortProfileChronologically(restored), saved);
  assert.deepEqual(ordered.certificates.map(entry => entry.name), [' Newer ', ' Older ', ' No date ']);
});

test('validation errors map back to original editor rows, including nested list fields', () => {
  const draft = emptyProfile();
  draft.projects = [
    { startDate: '2020', endDate: '2021' },
    { startDate: '2024', endDate: '' },
    { startDate: '', endDate: '' },
  ];
  assert.deepEqual(errorsInDraftOrder({
    'projects.0.url': 'Invalid URL',
    'projects.1.highlights.2': 'Too long',
    'projects.2': 'Missing name',
    'projects.99.name': 'Unknown row',
    projects: 'Section error',
    'skills.1.name': 'Required',
    name: 'Required',
  }, draft), {
    'projects.1.url': 'Invalid URL',
    'projects.0.highlights.2': 'Too long',
    'projects.2': 'Missing name',
    'projects.99.name': 'Unknown row',
    projects: 'Section error',
    'skills.1.name': 'Required',
    name: 'Required',
  });
});
