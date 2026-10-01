import SectionForm from './SectionForm';
import type { EntryField, SectionProps } from './SectionForm';
import { emptyPublication } from '../types/profile';
import type { Publication } from '../types/profile';

const fields: EntryField<Publication>[] = [
  { key: 'name', label: 'Publication name', required: true },
  { key: 'publisher', label: 'Publisher' },
  { key: 'releaseDate', label: 'Release date', kind: 'date' },
  { key: 'url', label: 'Publication URL', kind: 'url' },
  { key: 'summary', label: 'Summary', kind: 'text' },
];

export default function PublicationsForm(props: SectionProps<Publication>) {
  return <SectionForm {...props} section="publications" title="Publications" singular="Publication"
    description="Articles, papers, and books you have published."
    fields={fields} createEntry={emptyPublication} />;
}
