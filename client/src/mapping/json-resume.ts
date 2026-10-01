import {
  emptyBasics, emptyLocation, emptyWork, emptyVolunteer, emptyEducation,
  emptyAward, emptyCertificate, emptyPublication, emptySkill, emptyLanguage,
  emptyInterest, emptyReference, emptyProject, emptySocialProfile,
} from '../types/profile';
import type { Profile, SocialProfile, Location } from '../types/profile';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  return typeof v === 'string' ? v.trim() : '';
}

function getStringArray(obj: Record<string, unknown>, key: string): string[] {
  const v = obj[key];
  if (!Array.isArray(v)) return [];
  return v.filter((item): item is string => typeof item === 'string').map((s) => s.trim()).filter(Boolean);
}

/**
 * Maps a raw JSON Resume object (any shape) to our internal Profile type.
 * Missing fields are filled with defaults. Extra/unknown fields are ignored.
 */
export function mapJsonResumeToProfile(data: unknown): Profile {
  if (!isObject(data)) throw new Error('The imported file must be a JSON object.');
  if (!isObject(data.basics)) throw new Error('The imported file must contain a \'basics\' object.');

  const b = data.basics;
  const locRaw = isObject(b.location) ? b.location : {};
  const location: Location = {
    address: getString(locRaw, 'address'),
    postalCode: getString(locRaw, 'postalCode'),
    city: getString(locRaw, 'city'),
    countryCode: getString(locRaw, 'countryCode'),
    region: getString(locRaw, 'region'),
  };

  const profilesRaw = Array.isArray(b.profiles) ? b.profiles : [];
  const profiles: SocialProfile[] = profilesRaw
    .filter(isObject)
    .map((p) => ({
      network: getString(p, 'network'),
      username: getString(p, 'username'),
      url: getString(p, 'url'),
    }));

  function mapSection<T extends Record<string, unknown>>(
    section: string,
    mapper: (entry: Record<string, unknown>) => T,
  ): T[] {
    const raw = (data as Record<string, unknown>)[section];
    if (!Array.isArray(raw)) return [];
    return raw.filter(isObject).map(mapper);
  }

  return {
    basics: {
      name: getString(b, 'name'),
      label: getString(b, 'label'),
      image: getString(b, 'image'),
      email: getString(b, 'email'),
      phone: getString(b, 'phone'),
      url: getString(b, 'url'),
      summary: getString(b, 'summary'),
      location,
      profiles,
    },
    work: mapSection('work', (e) => ({
      ...emptyWork(),
      name: getString(e, 'name'),
      position: getString(e, 'position'),
      url: getString(e, 'url'),
      startDate: getString(e, 'startDate'),
      endDate: getString(e, 'endDate'),
      summary: getString(e, 'summary'),
      highlights: getStringArray(e, 'highlights'),
    })),
    volunteer: mapSection('volunteer', (e) => ({
      ...emptyVolunteer(),
      organization: getString(e, 'organization'),
      position: getString(e, 'position'),
      url: getString(e, 'url'),
      startDate: getString(e, 'startDate'),
      endDate: getString(e, 'endDate'),
      summary: getString(e, 'summary'),
      highlights: getStringArray(e, 'highlights'),
    })),
    education: mapSection('education', (e) => ({
      ...emptyEducation(),
      institution: getString(e, 'institution'),
      url: getString(e, 'url'),
      area: getString(e, 'area'),
      studyType: getString(e, 'studyType'),
      startDate: getString(e, 'startDate'),
      endDate: getString(e, 'endDate'),
      score: getString(e, 'score'),
      courses: getStringArray(e, 'courses'),
    })),
    awards: mapSection('awards', (e) => ({
      ...emptyAward(),
      title: getString(e, 'title'),
      date: getString(e, 'date'),
      awarder: getString(e, 'awarder'),
      summary: getString(e, 'summary'),
    })),
    certificates: mapSection('certificates', (e) => ({
      ...emptyCertificate(),
      name: getString(e, 'name'),
      date: getString(e, 'date'),
      issuer: getString(e, 'issuer'),
      url: getString(e, 'url'),
    })),
    publications: mapSection('publications', (e) => ({
      ...emptyPublication(),
      name: getString(e, 'name'),
      publisher: getString(e, 'publisher'),
      releaseDate: getString(e, 'releaseDate'),
      url: getString(e, 'url'),
      summary: getString(e, 'summary'),
    })),
    skills: mapSection('skills', (e) => ({
      ...emptySkill(),
      name: getString(e, 'name'),
      level: getString(e, 'level'),
      keywords: getStringArray(e, 'keywords'),
    })),
    languages: mapSection('languages', (e) => ({
      ...emptyLanguage(),
      language: getString(e, 'language'),
      fluency: getString(e, 'fluency'),
    })),
    interests: mapSection('interests', (e) => ({
      ...emptyInterest(),
      name: getString(e, 'name'),
      keywords: getStringArray(e, 'keywords'),
    })),
    references: mapSection('references', (e) => ({
      ...emptyReference(),
      name: getString(e, 'name'),
      reference: getString(e, 'reference'),
    })),
    projects: mapSection('projects', (e) => ({
      ...emptyProject(),
      name: getString(e, 'name'),
      description: getString(e, 'description'),
      url: getString(e, 'url'),
      startDate: getString(e, 'startDate'),
      endDate: getString(e, 'endDate'),
      highlights: getStringArray(e, 'highlights'),
      roles: getStringArray(e, 'roles'),
      type: getString(e, 'type'),
    })),
  };
}

/**
 * Exports our internal Profile to a full JSON Resume object.
 * Adds $schema and meta for spec compliance.
 */
export function mapProfileToJsonResume(profile: Profile): Record<string, unknown> {
  return {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/master/schema.json',
    basics: {
      name: profile.basics.name,
      label: profile.basics.label,
      image: profile.basics.image,
      email: profile.basics.email,
      phone: profile.basics.phone,
      url: profile.basics.url,
      summary: profile.basics.summary,
      location: profile.basics.location,
      profiles: profile.basics.profiles,
    },
    work: profile.work,
    volunteer: profile.volunteer,
    education: profile.education,
    awards: profile.awards,
    certificates: profile.certificates,
    publications: profile.publications,
    skills: profile.skills,
    languages: profile.languages,
    interests: profile.interests,
    references: profile.references,
    projects: profile.projects,
    meta: {
      version: 'v1.0.0',
      lastModified: new Date().toISOString().split('T')[0],
    },
  };
}
