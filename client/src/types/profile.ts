// JSON Resume uses label for a professional title and url for a website.
export type Location = {
  address: string;
  postalCode: string;
  city: string;
  countryCode: string;
  region: string;
};

export type SocialProfile = {
  network: string;
  username: string;
  url: string;
};

export type Basics = {
  name: string;
  label: string;
  image: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
  location: Location;
  profiles: SocialProfile[];
};

export type Work = {
  name: string; position: string; url: string; startDate: string; endDate: string;
  summary: string; highlights: string[];
};
export type Volunteer = {
  organization: string; position: string; url: string; startDate: string; endDate: string;
  summary: string; highlights: string[];
};
export type Education = {
  institution: string; url: string; area: string; studyType: string;
  startDate: string; endDate: string; score: string; courses: string[];
};
export type Award = { title: string; date: string; awarder: string; summary: string };
export type Certificate = { name: string; date: string; issuer: string; url: string };
export type Publication = { name: string; publisher: string; releaseDate: string; url: string; summary: string };
export type Skill = { name: string; level: string; keywords: string[] };
export type Language = { language: string; fluency: string };
export type Interest = { name: string; keywords: string[] };
export type Reference = { name: string; reference: string };
export type Project = {
  name: string; description: string; url: string; startDate: string; endDate: string;
  highlights: string[]; roles: string[]; type: string;
};
export type Profile = {
  basics: Basics;
  work: Work[];
  volunteer: Volunteer[];
  education: Education[];
  awards: Award[];
  certificates: Certificate[];
  publications: Publication[];
  skills: Skill[];
  languages: Language[];
  interests: Interest[];
  references: Reference[];
  projects: Project[];
};
export type Section = Exclude<keyof Profile, 'basics'>;
export type FieldErrors = Record<string, string | undefined>;

export const emptyLocation: Location = {
  address: '', postalCode: '', city: '', countryCode: '', region: '',
};

export const emptySocialProfile = (): SocialProfile => ({ network: '', username: '', url: '' });

export const emptyBasics: Basics = {
  name: '', label: '', image: '', email: '', phone: '', url: '', summary: '',
  location: { ...emptyLocation }, profiles: [],
};

export const emptyWork = (): Work => ({ name: '', position: '', url: '', startDate: '', endDate: '', summary: '', highlights: [] });
export const emptyVolunteer = (): Volunteer => ({ organization: '', position: '', url: '', startDate: '', endDate: '', summary: '', highlights: [] });
export const emptyEducation = (): Education => ({ institution: '', url: '', area: '', studyType: '', startDate: '', endDate: '', score: '', courses: [] });
export const emptyAward = (): Award => ({ title: '', date: '', awarder: '', summary: '' });
export const emptyCertificate = (): Certificate => ({ name: '', date: '', issuer: '', url: '' });
export const emptyPublication = (): Publication => ({ name: '', publisher: '', releaseDate: '', url: '', summary: '' });
export const emptySkill = (): Skill => ({ name: '', level: '', keywords: [] });
export const emptyLanguage = (): Language => ({ language: '', fluency: '' });
export const emptyInterest = (): Interest => ({ name: '', keywords: [] });
export const emptyReference = (): Reference => ({ name: '', reference: '' });
export const emptyProject = (): Project => ({ name: '', description: '', url: '', startDate: '', endDate: '', highlights: [], roles: [], type: '' });
export const emptyProfile = (): Profile => ({
  basics: { ...emptyBasics, location: { ...emptyLocation }, profiles: [] },
  work: [], volunteer: [], education: [], awards: [], certificates: [],
  publications: [], skills: [], languages: [], interests: [], references: [], projects: [],
});
export const entryFactories = {
  work: emptyWork, volunteer: emptyVolunteer,
  education: emptyEducation, awards: emptyAward,
  certificates: emptyCertificate, publications: emptyPublication,
  skills: emptySkill, languages: emptyLanguage,
  interests: emptyInterest, references: emptyReference,
  projects: emptyProject,
};
