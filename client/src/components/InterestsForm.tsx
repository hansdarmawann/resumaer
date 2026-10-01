import SectionForm from './SectionForm';
import type { EntryField, SectionProps } from './SectionForm';
import { emptyInterest } from '../types/profile';
import type { Interest } from '../types/profile';

const fields: EntryField<Interest>[] = [
  { key: 'name', label: 'Interest', required: true },
  { key: 'keywords', label: 'Keywords', kind: 'list' },
];

export default function InterestsForm(props: SectionProps<Interest>) {
  return <SectionForm {...props} section="interests" title="Interests" singular="Interest"
    description="Personal or professional interests and hobbies."
    fields={fields} createEntry={emptyInterest} />;
}
