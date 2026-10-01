import type { Profile } from '../types/profile';

function Website({ url }: { url: string }) {
  if (!url) return null;
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
  const { basics, work, volunteer, education, awards, certificates,
    publications, skills, languages, interests, references, projects } = profile;
  const loc = basics.location;
  const locationStr = [loc.city, loc.region, loc.countryCode].filter(Boolean).join(', ');
  return (
    <article className="profile-card resume-preview" aria-label="Profile preview">
      <header className="preview-header">
        {basics.image && (
          <img src={basics.image} alt={basics.name || 'Profile'}
            className="preview-avatar"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        )}
        <h2>{basics.name || 'Your name'}</h2>
        {basics.label && <p className="preview-title">{basics.label}</p>}
        {(basics.email || basics.phone) && <p className="preview-meta">{[basics.email, basics.phone].filter(Boolean).join(' · ')}</p>}
        <Website url={basics.url} />
        {locationStr && <p className="preview-meta">{locationStr}</p>}
        {basics.profiles.length > 0 && (
          <p className="preview-meta">
            {basics.profiles.map((p, i) => (
              <span key={i}>
                {i > 0 && ' · '}
                {p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer">{p.network || p.username}</a>
                  : (p.network || p.username)}
              </span>
            ))}
          </p>
        )}
        {basics.summary && <p className="preserve-lines">{basics.summary}</p>}
      </header>

      {work.length > 0 && <section><h3>Work experience</h3>{work.map((entry, index) => (
        <div className="preview-entry" key={index}>
          <h4>{entry.position || 'Position'} · {entry.name || 'Company'}</h4>
          <DateRange start={entry.startDate} end={entry.endDate} /><Website url={entry.url} />
          {entry.summary && <p className="preserve-lines">{entry.summary}</p>}<Items items={entry.highlights} />
        </div>
      ))}</section>}

      {volunteer.length > 0 && <section><h3>Volunteer experience</h3>{volunteer.map((entry, index) => (
        <div className="preview-entry" key={index}>
          <h4>{entry.position || 'Volunteer'} · {entry.organization || 'Organization'}</h4>
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

      {awards.length > 0 && <section><h3>Awards</h3>{awards.map((entry, index) => (
        <div className="preview-entry" key={index}>
          <h4>{entry.title || 'Award'}</h4>
          {(entry.awarder || entry.date) && <p className="preview-meta">{[entry.awarder, entry.date].filter(Boolean).join(' · ')}</p>}
          {entry.summary && <p className="preserve-lines">{entry.summary}</p>}
        </div>
      ))}</section>}

      {certificates.length > 0 && <section><h3>Certificates</h3>{certificates.map((entry, index) => (
        <div className="preview-entry" key={index}><h4>{entry.name || 'Certificate'}</h4>
          {(entry.issuer || entry.date) && <p className="preview-meta">{[entry.issuer, entry.date].filter(Boolean).join(' · ')}</p>}
          <Website url={entry.url} /></div>
      ))}</section>}

      {publications.length > 0 && <section><h3>Publications</h3>{publications.map((entry, index) => (
        <div className="preview-entry" key={index}>
          <h4>{entry.name || 'Publication'}</h4>
          {(entry.publisher || entry.releaseDate) && <p className="preview-meta">{[entry.publisher, entry.releaseDate].filter(Boolean).join(' · ')}</p>}
          <Website url={entry.url} />
          {entry.summary && <p className="preserve-lines">{entry.summary}</p>}
        </div>
      ))}</section>}

      {skills.length > 0 && <section><h3>Skills</h3>{skills.map((entry, index) => (
        <div className="preview-entry" key={index}><h4>{entry.name || 'Skill group'}{entry.level && ` · ${entry.level}`}</h4>
          <Items items={entry.keywords} /></div>
      ))}</section>}

      {languages.length > 0 && <section><h3>Languages</h3>{languages.map((entry, index) => (
        <div className="preview-entry" key={index}><h4>{entry.language || 'Language'}{entry.fluency && ` · ${entry.fluency}`}</h4></div>
      ))}</section>}

      {interests.length > 0 && <section><h3>Interests</h3>{interests.map((entry, index) => (
        <div className="preview-entry" key={index}><h4>{entry.name || 'Interest'}</h4>
          <Items items={entry.keywords} /></div>
      ))}</section>}

      {references.length > 0 && <section><h3>References</h3>{references.map((entry, index) => (
        <div className="preview-entry" key={index}><h4>{entry.name || 'Reference'}</h4>
          {entry.reference && <p className="preserve-lines">{entry.reference}</p>}
        </div>
      ))}</section>}

      {projects.length > 0 && <section><h3>Projects</h3>{projects.map((entry, index) => (
        <div className="preview-entry" key={index}><h4>{entry.name || 'Project'}{entry.type && ` · ${entry.type}`}</h4>
          <DateRange start={entry.startDate} end={entry.endDate} /><Website url={entry.url} />
          {entry.description && <p className="preserve-lines">{entry.description}</p>}
          <Items items={entry.highlights} />
          {entry.roles.length > 0 && <p className="preview-meta">Roles: {entry.roles.join(', ')}</p>}
        </div>
      ))}</section>}

      {!work.length && !volunteer.length && !education.length && !awards.length &&
       !certificates.length && !publications.length && !skills.length &&
       !languages.length && !interests.length && !references.length && !projects.length &&
        <p className="empty-section">Add experience, education, skills, projects, or other sections to see them here.</p>}
    </article>
  );
}
