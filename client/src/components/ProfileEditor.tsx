import { useLayoutEffect, useState } from 'react';
import BasicsForm from './BasicsForm';
import WorkForm from './WorkForm';
import VolunteerForm from './VolunteerForm';
import EducationForm from './EducationForm';
import AwardsForm from './AwardsForm';
import CertificatesForm from './CertificatesForm';
import PublicationsForm from './PublicationsForm';
import SkillsForm from './SkillsForm';
import LanguagesForm from './LanguagesForm';
import InterestsForm from './InterestsForm';
import ReferencesForm from './ReferencesForm';
import ProjectsForm from './ProjectsForm';
import type { Basics, FieldErrors, Location, Profile, Section, SocialProfile } from '../types/profile';

const tabs = [
  { section: 'basics', label: 'Personal' },
  { section: 'work', label: 'Experience' },
  { section: 'education', label: 'Education' },
  { section: 'skills', label: 'Skills' },
  { section: 'projects', label: 'Projects' },
  { section: 'volunteer', label: 'Volunteer' },
  { section: 'awards', label: 'Awards' },
  { section: 'certificates', label: 'Certificates' },
  { section: 'publications', label: 'Publications' },
  { section: 'languages', label: 'Languages' },
  { section: 'interests', label: 'Interests' },
  { section: 'references', label: 'References' },
] as const;
type EditorSection = typeof tabs[number]['section'];

type Props = {
  profile: Profile;
  disabled: boolean;
  errors: FieldErrors;
  errorFocus: { path: string } | null;
  onChangeBasics: (field: keyof Basics, value: string) => void;
  onChangeLocation: (field: keyof Location, value: string) => void;
  onChangeProfiles: (profiles: SocialProfile[]) => void;
  onChangeSection: <S extends Section>(section: S, entries: Profile[S]) => void;
};

export default function ProfileEditor({ profile, disabled, errors, errorFocus,
  onChangeBasics, onChangeLocation, onChangeProfiles, onChangeSection }: Props) {
  const [active, setActive] = useState<EditorSection>('basics');
  const sectionProps = { disabled, errors, errorFocus };

  useLayoutEffect(() => {
    if (!errorFocus) return;
    const section = errorFocus.path.split('.')[0];
    setActive(tabs.find((tab) => tab.section === section)?.section ?? 'basics');
  }, [errorFocus]);

  function focusTab(index: number) {
    const section = tabs[index].section;
    setActive(section);
    document.getElementById(`editor-tab-${section}`)?.focus();
  }

  return <>
    <div className="editor-tabs" role="tablist" aria-label="Profile sections">
      {tabs.map((tab, index) => {
        const hasErrors = Object.entries(errors).some(([path, message]) => message && (tab.section === 'basics'
          ? !tabs.some((item) => item.section !== 'basics' && path.split('.')[0] === item.section)
          : path.split('.')[0] === tab.section));
        return <button key={tab.section} type="button" role="tab" aria-label={tab.label}
          id={`editor-tab-${tab.section}`} aria-controls={`editor-panel-${tab.section}`}
          aria-describedby={hasErrors ? `editor-tab-${tab.section}-error` : undefined}
          aria-selected={active === tab.section} tabIndex={active === tab.section ? 0 : -1}
          disabled={disabled} onClick={() => setActive(tab.section)}
          onFocus={(event) => event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })}
          onKeyDown={(event) => {
            const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
              : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length
              : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
            if (next !== null) { event.preventDefault(); focusTab(next); }
          }}>
          {tab.label}
          {hasErrors && <span id={`editor-tab-${tab.section}-error`} className="tab-error" aria-label="has errors">!</span>}
        </button>;
      })}
    </div>
    {/* Keep forms mounted so row identities and each section's pagination survive navigation. */}
    {tabs.map(({ section }) => <div key={section} role="tabpanel"
      id={`editor-panel-${section}`} aria-labelledby={`editor-tab-${section}`}
      hidden={active !== section} tabIndex={0} className="editor-panel">
      {section === 'basics' && <section className="profile-card" aria-labelledby="basics-title">
        <div className="card-heading"><div><h2 id="basics-title">Personal details</h2>
          <p className="card-description">Introduce yourself and help people get in touch. Your name is required.</p></div></div>
        {errors.basics && <p className="field-error">{errors.basics}</p>}
        <BasicsForm basics={profile.basics} onChange={onChangeBasics} onChangeLocation={onChangeLocation}
          onChangeProfiles={onChangeProfiles} {...sectionProps} />
      </section>}
      {section === 'work' && <WorkForm entries={profile.work} onChange={(entries) => onChangeSection('work', entries)} {...sectionProps} />}
      {section === 'education' && <EducationForm entries={profile.education} onChange={(entries) => onChangeSection('education', entries)} {...sectionProps} />}
      {section === 'skills' && <SkillsForm entries={profile.skills} onChange={(entries) => onChangeSection('skills', entries)} {...sectionProps} />}
      {section === 'projects' && <ProjectsForm entries={profile.projects} onChange={(entries) => onChangeSection('projects', entries)} {...sectionProps} />}
      {section === 'volunteer' && <VolunteerForm entries={profile.volunteer} onChange={(entries) => onChangeSection('volunteer', entries)} {...sectionProps} />}
      {section === 'awards' && <AwardsForm entries={profile.awards} onChange={(entries) => onChangeSection('awards', entries)} {...sectionProps} />}
      {section === 'certificates' && <CertificatesForm entries={profile.certificates} onChange={(entries) => onChangeSection('certificates', entries)} {...sectionProps} />}
      {section === 'publications' && <PublicationsForm entries={profile.publications} onChange={(entries) => onChangeSection('publications', entries)} {...sectionProps} />}
      {section === 'languages' && <LanguagesForm entries={profile.languages} onChange={(entries) => onChangeSection('languages', entries)} {...sectionProps} />}
      {section === 'interests' && <InterestsForm entries={profile.interests} onChange={(entries) => onChangeSection('interests', entries)} {...sectionProps} />}
      {section === 'references' && <ReferencesForm entries={profile.references} onChange={(entries) => onChangeSection('references', entries)} {...sectionProps} />}
    </div>)}
    <p className="editor-note">Adding, editing, or removing an entry changes your draft. Click Save profile to save all sections.</p>
  </>;
}
