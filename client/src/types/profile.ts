// JSON Resume uses label for a professional title and url for a website.
export type Basics = {
  name: string;
  label: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
};

export type Work = {
  name: string; position: string; url: string; startDate: string; endDate: string;
  summary: string; highlights: string[];
};
export type Education = {
  institution: string; url: string; area: string; studyType: string;
  startDate: string; endDate: string; score: string; courses: string[];
};
export type Skill = { name: string; level: string; keywords: string[] };
export type Project = {
  name: string; description: string; url: string; startDate: string; endDate: string; highlights: string[];
};
export type Certificate = { name: string; date: string; issuer: string; url: string };
export type Profile = {
  basics: Basics; work: Work[]; education: Education[]; skills: Skill[];
  projects: Project[]; certificates: Certificate[];
};
export type Section = Exclude<keyof Profile, 'basics'>;
export type FieldErrors = Record<string, string | undefined>;

export const emptyBasics: Basics = {
  name: '',
  label: '',
  email: '',
  phone: '',
  url: '',
  summary: '',
};

export const emptyWork = (): Work => ({ name: '', position: '', url: '', startDate: '', endDate: '', summary: '', highlights: [] });
export const emptyEducation = (): Education => ({ institution: '', url: '', area: '', studyType: '', startDate: '', endDate: '', score: '', courses: [] });
export const emptySkill = (): Skill => ({ name: '', level: '', keywords: [] });
export const emptyProject = (): Project => ({ name: '', description: '', url: '', startDate: '', endDate: '', highlights: [] });
export const emptyCertificate = (): Certificate => ({ name: '', date: '', issuer: '', url: '' });
export const emptyProfile = (): Profile => ({ basics: { ...emptyBasics }, work: [], education: [], skills: [], projects: [], certificates: [] });
export const entryFactories = { work: emptyWork, education: emptyEducation, skills: emptySkill, projects: emptyProject, certificates: emptyCertificate };
