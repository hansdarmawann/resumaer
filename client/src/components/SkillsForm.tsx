import SectionForm from './SectionForm';
import type { EntryField, SectionProps } from './SectionForm';
import { emptySkill } from '../types/profile';
import type { Skill } from '../types/profile';

const fields: EntryField<Skill>[] = [
  { key: 'name', label: 'Skill group', required: true },
  { key: 'level', label: 'Level' },
  { key: 'keywords', label: 'Skills / keywords', kind: 'list' },
];

export default function SkillsForm(props: SectionProps<Skill>) {
  return <SectionForm {...props} section="skills" title="Skills" singular="Skill group"
    description="Group your skills and describe your proficiency." fields={fields} createEntry={emptySkill} />;
}
