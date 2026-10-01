import type { Profile } from '../types/profile';

function Website({ url }: { url: string }) {
  if (!url) return null;
  // Drafts can contain invalid URLs, so only link complete HTTP(S) addresses.
  let safe = false;
  try { safe = /^https?:\/\//i.test(url) && ['http:', 'https:'].includes(new URL(url).protocol); } catch { /* Show plain text. */ }
  return <p className="preview-link">{safe ? <a href={url} target="_blank" rel="noopener noreferrer">{url}</a> : url}</p>;
}

function DateRange({ start, end }: { start: string; end: string }) {
  if (!start && !end) return null;
  return <p className="preview-meta">{start || 'Start date not provided'} — {end || 'Present'}</p>;
}

function Items({ items }: { items: string[] }) {
  const visible = items.filter((item) => item.trim());
  return visible.length ? <ul>{visible.map((item, index) => <li key={index}>{item}</li>)}</ul> : null;
}

export default function ProfilePreview({ profile }: { profile: Profile }) {
  const { basics, work, education, skills, projects, certificates } = profile;
  return (
    <article className="profile-card resume-preview" aria-label="Profile preview">
      <header className="preview-header">
        <h2>{basics.name || 'Your name'}</h2>
        {basics.label && <p className="preview-title">{basics.label}</p>}
        {(basics.email || basics.phone) && <p className="preview-meta">{[basics.email, basics.phone].filter(Boolean).join(' · ')}</p>}
        <Website url={basics.url} />
        {basics.summary && <p className="preserve-lines">{basics.summary}</p>}
      </header>
      {work.length > 0 && <section><h3>Work experience</h3>{work.map((entry, index) => (
        <div className="preview-entry" key={index}>
          <h4>{entry.position || 'Position'} · {entry.name || 'Company'}</h4>
          <DateRange start={entry.startDate} end={entry.endDate} /><Website url={entry.url} />
          {entry.summary && <p className="preserve-lines">{entry.summary}</p>}<Items items={entry.highlights} />
        </div>
      ))}</section>}
      {education.length > 0 && <section><h3>Education</h3>{education.map((entry, index) => (
        <div className="preview-entry" key={index}>
          <h4>{entry.institution || 'Institution'}</h4>
          {(entry.studyType || entry.area) && <p>{[entry.studyType, entry.area].filter(Boolean).join(' · ')}</p>}
          <DateRange start={entry.startDate} end={entry.endDate} />
          {entry.score && <p>Score / GPA: {entry.score}</p>}<Website url={entry.url} /><Items items={entry.courses} />
        </div>
      ))}</section>}
      {skills.length > 0 && <section><h3>Skills</h3>{skills.map((entry, index) => (
        <div className="preview-entry" key={index}><h4>{entry.name || 'Skill group'}{entry.level && ` · ${entry.level}`}</h4>
          <Items items={entry.keywords} /></div>
      ))}</section>}
      {projects.length > 0 && <section><h3>Projects</h3>{projects.map((entry, index) => (
        <div className="preview-entry" key={index}><h4>{entry.name || 'Project'}</h4>
          <DateRange start={entry.startDate} end={entry.endDate} /><Website url={entry.url} />
          {entry.description && <p className="preserve-lines">{entry.description}</p>}<Items items={entry.highlights} />
        </div>
      ))}</section>}
      {certificates.length > 0 && <section><h3>Certificates</h3>{certificates.map((entry, index) => (
        <div className="preview-entry" key={index}><h4>{entry.name || 'Certificate'}</h4>
          {(entry.issuer || entry.date) && <p className="preview-meta">{[entry.issuer, entry.date].filter(Boolean).join(' · ')}</p>}
          <Website url={entry.url} /></div>
      ))}</section>}
      {!work.length && !education.length && !skills.length && !projects.length && !certificates.length &&
        <p className="empty-section">Add experience, education, skills, projects, or certificates to see them here.</p>}
    </article>
  );
}
