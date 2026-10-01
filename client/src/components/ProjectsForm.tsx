import SectionForm from './SectionForm';
import type { EntryField, SectionProps } from './SectionForm';
import { emptyProject } from '../types/profile';
import type { Project } from '../types/profile';

const fields: EntryField<Project>[] = [
  { key: 'name', label: 'Project name', required: true },
  { key: 'type', label: 'Type' },
  { key: 'url', label: 'Project website', kind: 'url' },
  { key: 'startDate', label: 'Start date', kind: 'date' },
  { key: 'endDate', label: 'End date', kind: 'date' },
  { key: 'description', label: 'Description', kind: 'text' },
  { key: 'highlights', label: 'Highlights', kind: 'list' },
  { key: 'roles', label: 'Roles', kind: 'list' },
];

export default function ProjectsForm(props: SectionProps<Project>) {
  return <SectionForm {...props} section="projects" title="Projects" singular="Project"
    description="Share the things you've built and the results you achieved." fields={fields} createEntry={emptyProject} />;
}
