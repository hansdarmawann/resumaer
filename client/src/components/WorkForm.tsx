import SectionForm from './SectionForm';
import type { EntryField, SectionProps } from './SectionForm';
import { emptyWork } from '../types/profile';
import type { Work } from '../types/profile';

const fields: EntryField<Work>[] = [
  { key: 'name', label: 'Company', required: true },
  { key: 'position', label: 'Position', required: true },
  { key: 'startDate', label: 'Start date', kind: 'date' },
  { key: 'endDate', label: 'End date', kind: 'date' },
  { key: 'url', label: 'Company website', kind: 'url' },
  { key: 'summary', label: 'Summary', kind: 'text' },
  { key: 'highlights', label: 'Highlights', kind: 'list' },
];

export default function WorkForm(props: SectionProps<Work>) {
  return <SectionForm {...props} section="work" title="Work experience" singular="Experience"
    description="Show where you’ve worked and what you accomplished." fields={fields} createEntry={emptyWork} />;
}
