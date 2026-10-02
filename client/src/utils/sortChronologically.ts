import type { FieldErrors, Profile } from '../types/profile';

type DatedEntry = {
  startDate?: string;
  endDate?: string;
  date?: string;
  releaseDate?: string;
};

const datedSections = ['work', 'volunteer', 'education', 'projects', 'awards', 'certificates', 'publications'] as const;
const noDate = Number.NEGATIVE_INFINITY;

function dateValue(value = ''): number {
  const date = value.trim();
  if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(date)) return noDate;
  const [year, month = 1, day = 1] = date.split('-').map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1]) return noDate;
  // Partial dates use the start of the known year/month, without timezone conversion.
  return year * 10000 + month * 100 + day;
}

function dates(entry: object): [number, number] {
  const value = entry as DatedEntry;
  if ('startDate' in value || 'endDate' in value) {
    const start = dateValue(value.startDate);
    const end = dateValue(value.endDate);
    if (start !== noDate && !value.endDate?.trim()) return [Number.POSITIVE_INFINITY, start];
    return [end === noDate ? start : end, start];
  }
  return [dateValue(value.date ?? value.releaseDate), noDate];
}

/** Original indexes in newest-first order; ties and undated entries stay stable. */
export function chronologicalIndexes(entries: readonly object[]): number[] {
  const keys = entries.map(dates);
  return entries.map((_, index) => index).sort((left, right) => {
    for (let key = 0; key < 2; key++) {
      if (keys[left][key] !== keys[right][key]) return keys[left][key] > keys[right][key] ? -1 : 1;
    }
    return left - right;
  });
}

export function sortProfileChronologically(profile: Profile): Profile {
  return {
    ...profile,
    ...Object.fromEntries(datedSections.map((section) => [
      section, chronologicalIndexes(profile[section]).map((index) => profile[section][index]),
    ])),
  };
}

/** Keep editor row identities after the API normalizes a sorted save payload. */
export function restoreDraftOrder(draft: Profile, saved: Profile): Profile {
  return {
    ...saved,
    ...Object.fromEntries(datedSections.map((section) => {
      const restored = [...saved[section]];
      chronologicalIndexes(draft[section]).forEach((originalIndex, sortedIndex) => {
        restored[originalIndex] = saved[section][sortedIndex];
      });
      return [section, restored];
    })),
  };
}

/** API validation indexes refer to the sorted payload, while form names use draft indexes. */
export function errorsInDraftOrder(errors: FieldErrors, draft: Profile): FieldErrors {
  return Object.fromEntries(Object.entries(errors).map(([path, message]) => {
    const [section, index, ...fields] = path.split('.');
    const datedSection = datedSections.find((candidate) => candidate === section);
    if (!datedSection || !/^\d+$/.test(index ?? '')) return [path, message];
    const originalIndex = chronologicalIndexes(draft[datedSection])[Number(index)];
    return [originalIndex === undefined ? path : [section, originalIndex, ...fields].join('.'), message];
  }));
}
