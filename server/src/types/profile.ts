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
}

export type FieldErrors = Partial<Record<keyof Basics, string>>;
