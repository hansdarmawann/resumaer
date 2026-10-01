import SectionForm from './SectionForm';
import type { EntryField, SectionProps } from './SectionForm';
import { emptyLanguage } from '../types/profile';
import type { Language } from '../types/profile';

const fields: EntryField<Language>[] = [
  { key: 'language', label: 'Language', required: true },
  { key: 'fluency', label: 'Fluency' },
];

export default function LanguagesForm(props: SectionProps<Language>) {
  return <SectionForm {...props} section="languages" title="Languages" singular="Language"
    description="Languages you speak and your proficiency level."
    fields={fields} createEntry={emptyLanguage} />;
}
