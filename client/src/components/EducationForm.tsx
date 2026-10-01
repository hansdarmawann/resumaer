import SectionForm from './SectionForm';
import type { EntryField, SectionProps } from './SectionForm';
import { emptyEducation } from '../types/profile';
import type { Education } from '../types/profile';

const fields: EntryField<Education>[] = [
  { key: 'institution', label: 'Institution', required: true },
  { key: 'area', label: 'Area of study' }, { key: 'studyType', label: 'Degree' },
  { key: 'score', label: 'Score / GPA', max: 50 },
  { key: 'startDate', label: 'Start date', kind: 'date' },
  { key: 'endDate', label: 'End date', kind: 'date' },
  { key: 'url', label: 'Institution website', kind: 'url' },
  { key: 'courses', label: 'Courses', kind: 'list' },
];

export default function EducationForm(props: SectionProps<Education>) {
  return <SectionForm {...props} section="education" title="Education" singular="Education entry"
    description="Add your education, degree, and relevant courses." fields={fields} createEntry={emptyEducation} />;
}
