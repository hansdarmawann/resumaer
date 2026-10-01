import SectionForm from './SectionForm';
import type { EntryField, SectionProps } from './SectionForm';
import { emptyVolunteer } from '../types/profile';
import type { Volunteer } from '../types/profile';

const fields: EntryField<Volunteer>[] = [
  { key: 'organization', label: 'Organization', required: true },
  { key: 'position', label: 'Position' },
  { key: 'startDate', label: 'Start date', kind: 'date' },
  { key: 'endDate', label: 'End date', kind: 'date' },
  { key: 'url', label: 'Organization website', kind: 'url' },
  { key: 'summary', label: 'Summary', kind: 'text' },
  { key: 'highlights', label: 'Highlights', kind: 'list' },
];

export default function VolunteerForm(props: SectionProps<Volunteer>) {
  return <SectionForm {...props} section="volunteer" title="Volunteer experience" singular="Volunteer entry"
    description="Show your volunteer work and community involvement."
    fields={fields} createEntry={emptyVolunteer} />;
}
