import SectionForm from './SectionForm';
import type { EntryField, SectionProps } from './SectionForm';
import { emptyAward } from '../types/profile';
import type { Award } from '../types/profile';

const fields: EntryField<Award>[] = [
  { key: 'title', label: 'Award title', required: true },
  { key: 'awarder', label: 'Awarder' },
  { key: 'date', label: 'Date awarded', kind: 'date' },
  { key: 'summary', label: 'Summary', kind: 'text' },
];

export default function AwardsForm(props: SectionProps<Award>) {
  return <SectionForm {...props} section="awards" title="Awards" singular="Award"
    description="Honors and recognitions you have received."
    fields={fields} createEntry={emptyAward} />;
}
