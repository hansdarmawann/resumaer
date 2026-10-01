import SectionForm from './SectionForm';
import type { EntryField, SectionProps } from './SectionForm';
import { emptyReference } from '../types/profile';
import type { Reference } from '../types/profile';

const fields: EntryField<Reference>[] = [
  { key: 'name', label: 'Name', required: true },
  { key: 'reference', label: 'Reference text', kind: 'text', max: 5000 },
];

export default function ReferencesForm(props: SectionProps<Reference>) {
  return <SectionForm {...props} section="references" title="References" singular="Reference"
    description="Professional references who can speak to your work."
    fields={fields} createEntry={emptyReference} />;
}
