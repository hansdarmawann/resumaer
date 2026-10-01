// JSON Resume uses label for a professional title and url for a website.
export type Basics = {
  name: string;
  label: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
};

export type Profile = { basics: Basics };
export type FieldErrors = Partial<Record<keyof Basics, string>>;

export const emptyBasics: Basics = {
  name: '',
  label: '',
  email: '',
  phone: '',
  url: '',
  summary: '',
};
