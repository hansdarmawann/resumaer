// JSON Resume calls a professional title "label" and a website "url".
export interface Basics {
  name: string;
  label: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
}

export interface Profile {
  basics: Basics;
  work: Work[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certificates: Certificate[];
}

export interface Work {
  name: string; position: string; url: string; startDate: string; endDate: string;
  summary: string; highlights: string[];
}
export interface Education {
  institution: string; url: string; area: string; studyType: string;
  startDate: string; endDate: string; score: string; courses: string[];
}
export interface Skill { name: string; level: string; keywords: string[] }
export interface Project {
  name: string; description: string; url: string; startDate: string; endDate: string; highlights: string[];
}
export interface Certificate { name: string; date: string; issuer: string; url: string }

// Basics uses field names; repeating sections use paths such as work.0.name.
export type FieldErrors = Record<string, string | undefined>;
