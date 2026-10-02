import type { ReactNode } from 'react';
import type { Profile } from '../types/profile';

function hasText(value: string) {
  return value.trim().length > 0;
}

function joined(values: string[], separator = ' · ') {
  return values.filter(hasText).join(separator);
}

function hasContent(value: unknown): boolean {
  if (typeof value === 'string') return hasText(value);
  if (Array.isArray(value)) return value.some(hasContent);
  return false;
}

function Website({ url }: { url: string }) {
  if (!hasText(url)) return null;
  const href = url.trim();
  let safe = false;
  try {
    safe = /^https?:\/\//i.test(href) && ['http:', 'https:'].includes(new URL(href).protocol);
  } catch {
    // Unsaved, invalid URLs remain readable without becoming clickable links.
  }
  return (
    <p className="resume-link">
      {safe ? <a href={href} target="_blank" rel="noopener noreferrer">{url}</a> : url}
    </p>
  );
}

function Text({ children, meta = false }: { children: string; meta?: boolean }) {
  return hasText(children) ? <p className={meta ? 'resume-meta' : 'resume-text'}>{children}</p> : null;
}

function DateRange({ start, end }: { start: string; end: string }) {
  if (!hasText(start) && !hasText(end)) return null;
  const range = hasText(start)
    ? `${start} — ${hasText(end) ? end : 'Present'}`
    : `Until ${end}`;
  return <Text meta>{range}</Text>;
}

function Heading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="resume-entry-heading">
      {hasText(title) && <h4>{title}</h4>}
      {children}
    </div>
  );
}

function Items({ items }: { items: string[] }) {
  const visible = items.filter(hasText);
  return visible.length > 0
    ? <ul className="resume-list">{visible.map((item, index) => <li key={index}>{item}</li>)}</ul>
    : null;
}

function Section<T extends object>({ title, entries, children }: {
  title: string;
  entries: T[];
  children: (entry: T) => ReactNode;
}) {
  const visible = entries.filter((entry) => Object.values(entry).some(hasContent));
  if (visible.length === 0) return null;
  return (
    <section className="resume-section">
      <h3>{title}</h3>
      {visible.map((entry, index) => <div className="resume-entry" key={index}>{children(entry)}</div>)}
    </section>
  );
}

export default function ResumeDocument({ profile }: { profile: Profile }) {
  const { basics } = profile;
  const { address, postalCode, city, region, countryCode } = basics.location;
  const location = joined([address, city, region, postalCode, countryCode], ', ');
  const socialProfiles = basics.profiles.filter((entry) => Object.values(entry).some(hasContent));

  return (
    <article className="resume-document" aria-label="Resume preview">
      <header className="resume-header">
        {hasText(basics.name) && <h2>{basics.name}</h2>}
        {hasText(basics.label) && <p className="resume-title">{basics.label}</p>}
        <Text meta>{joined([basics.email, basics.phone])}</Text>
        <Text meta>{location}</Text>
        <Website url={basics.url} />
        {socialProfiles.map((entry, index) => (
          <div className="resume-social" key={index}>
            <Text meta>{joined([entry.network, entry.username], ': ')}</Text>
            <Website url={entry.url} />
          </div>
        ))}
      </header>

      {hasText(basics.summary) && (
        <section className="resume-section">
          <h3>Professional summary</h3>
          <Text>{basics.summary}</Text>
        </section>
      )}

      <Section title="Work experience" entries={profile.work}>{(entry) => <>
        <Heading title={joined([entry.position, entry.name])}>
          <DateRange start={entry.startDate} end={entry.endDate} />
        </Heading>
        <Website url={entry.url} />
        <Text>{entry.summary}</Text>
        <Items items={entry.highlights} />
      </>}</Section>

      <Section title="Education" entries={profile.education}>{(entry) => <>
        <Heading title={entry.institution}>
          <Text meta>{joined([entry.studyType, entry.area])}</Text>
          <DateRange start={entry.startDate} end={entry.endDate} />
        </Heading>
        {hasText(entry.score) && <Text>{`Score / GPA: ${entry.score}`}</Text>}
        <Website url={entry.url} />
        <Items items={entry.courses} />
      </>}</Section>

      <Section title="Skills" entries={profile.skills}>{(entry) => <>
        <Heading title={joined([entry.name, entry.level])} />
        <Items items={entry.keywords} />
      </>}</Section>

      <Section title="Projects" entries={profile.projects}>{(entry) => <>
        <Heading title={joined([entry.name, entry.type])}>
          <DateRange start={entry.startDate} end={entry.endDate} />
        </Heading>
        <Website url={entry.url} />
        <Text>{entry.description}</Text>
        {entry.roles.some(hasText) && <Text meta>{`Roles: ${joined(entry.roles, ', ')}`}</Text>}
        <Items items={entry.highlights} />
      </>}</Section>

      <Section title="Volunteer experience" entries={profile.volunteer}>{(entry) => <>
        <Heading title={joined([entry.position, entry.organization])}>
          <DateRange start={entry.startDate} end={entry.endDate} />
        </Heading>
        <Website url={entry.url} />
        <Text>{entry.summary}</Text>
        <Items items={entry.highlights} />
      </>}</Section>

      <Section title="Awards" entries={profile.awards}>{(entry) => <>
        <Heading title={entry.title}>
          <Text meta>{joined([entry.awarder, entry.date])}</Text>
        </Heading>
        <Text>{entry.summary}</Text>
      </>}</Section>

      <Section title="Certificates" entries={profile.certificates}>{(entry) => <>
        <Heading title={entry.name}>
          <Text meta>{joined([entry.issuer, entry.date])}</Text>
        </Heading>
        <Website url={entry.url} />
      </>}</Section>

      <Section title="Publications" entries={profile.publications}>{(entry) => <>
        <Heading title={entry.name}>
          <Text meta>{joined([entry.publisher, entry.releaseDate])}</Text>
        </Heading>
        <Website url={entry.url} />
        <Text>{entry.summary}</Text>
      </>}</Section>

      <Section title="Languages" entries={profile.languages}>{(entry) => (
        <Heading title={joined([entry.language, entry.fluency])} />
      )}</Section>

      <Section title="Interests" entries={profile.interests}>{(entry) => <>
        <Heading title={entry.name} />
        <Items items={entry.keywords} />
      </>}</Section>

      <Section title="References" entries={profile.references}>{(entry) => <>
        <Heading title={entry.name} />
        <Text>{entry.reference}</Text>
      </>}</Section>
    </article>
  );
}
