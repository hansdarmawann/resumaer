import { useEffect, useRef, useState } from 'react';
import { ApiError, deleteProfile, getProfile, saveProfile } from './api/profile';
import BasicsForm from './components/BasicsForm';
import WorkForm from './components/WorkForm';
import EducationForm from './components/EducationForm';
import SkillsForm from './components/SkillsForm';
import ProjectsForm from './components/ProjectsForm';
import CertificatesForm from './components/CertificatesForm';
import ProfilePreview from './components/ProfilePreview';
import DeleteProfileDialog from './components/DeleteProfileDialog';
import { emptyProfile } from './types/profile';
import type { Basics, FieldErrors, Profile, Section } from './types/profile';

type LoadState = 'loading' | 'ready' | 'error';
type Feedback =
  | { state: 'idle' | 'saving' | 'deleting' }
  | { state: 'success' | 'error'; message: string };
type View = 'edit' | 'preview' | 'json';

export default function App() {
  // A single draft keeps all sections together until an explicit save succeeds.
  const [draft, setDraft] = useState<Profile>(emptyProfile);
  const [savedProfile, setSavedProfile] = useState<Profile | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>({ state: 'idle' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [view, setView] = useState<View>('edit');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editorVersion, setEditorVersion] = useState(0);
  const operationInProgress = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const profile = await getProfile(controller.signal);
        if (controller.signal.aborted) return;
        setDraft(profile ?? emptyProfile());
        setSavedProfile(profile);
        setProfileExists(profile !== null);
        setEditorVersion((previous) => previous + 1);
        setLoadState('ready');
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : 'The request failed.');
        setLoadState('error');
      }
    }
    void load();
    return () => controller.abort();
  }, [loadAttempt]);

  useEffect(() => {
    if (Object.keys(fieldErrors).length) {
      document.querySelector<HTMLElement>('#profile-form [aria-invalid="true"]')?.focus();
    }
  }, [fieldErrors]);

  function changeBasics(field: keyof Basics, value: string) {
    setDraft((previous) => ({ ...previous, basics: { ...previous.basics, [field]: value } }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined, basics: undefined }));
    setFeedback({ state: 'idle' });
  }

  function changeSection<S extends Section>(section: S, entries: Profile[S]) {
    setDraft((previous) => ({ ...previous, [section]: entries }));
    // Entry indices shift after removal, so clear this section's old errors.
    setFieldErrors((previous) => Object.fromEntries(
      Object.entries(previous).filter(([path]) => path !== section && !path.startsWith(`${section}.`)),
    ));
    setFeedback({ state: 'idle' });
  }

  async function handleSave() {
    if (loadState !== 'ready' || operationInProgress.current || deleteOpen) return;
    operationInProgress.current = true;
    setFeedback({ state: 'saving' });
    setFieldErrors({});
    try {
      const saved = await saveProfile(draft, profileExists);
      setDraft(saved);
      setSavedProfile(saved);
      setProfileExists(true);
      setFeedback({ state: 'success', message: 'Profile saved, including all sections. You can refresh to load it again.' });
    } catch (error) {
      let message = error instanceof Error ? error.message : 'The save failed.';
      if (error instanceof ApiError) {
        setFieldErrors(error.errors);
        if (Object.values(error.errors).some(Boolean)) setView('edit');
        if (error.status === 404 && profileExists) {
          setProfileExists(false);
          setSavedProfile(null);
          message = 'The saved profile is no longer available. Save again to create it.';
        } else if (error.status === 409 && !profileExists) {
          setProfileExists(true);
          message = 'A profile already exists. Save again to update it with these details.';
        }
      }
      setFeedback({ state: 'error', message: `${message} Your edits are still here.` });
    } finally {
      operationInProgress.current = false;
    }
  }

  async function handleDelete() {
    if (loadState !== 'ready' || operationInProgress.current || !deleteOpen) return;
    operationInProgress.current = true;
    setFeedback({ state: 'deleting' });
    try {
      await deleteProfile();
      setDraft(emptyProfile());
      setSavedProfile(null);
      setProfileExists(false);
      setFieldErrors({});
      setEditorVersion((previous) => previous + 1);
      setView('edit');
      setFeedback({ state: 'success', message: 'Profile deleted. You can start a new profile.' });
    } catch (error) {
      let message = error instanceof Error ? error.message : 'The deletion failed.';
      if (error instanceof ApiError && error.status === 404) {
        setProfileExists(false);
        setSavedProfile(null);
        message = 'The saved profile is already unavailable. Save your draft to create it again.';
      }
      setFeedback({ state: 'error', message: `${message} Your edits are still here.` });
    } finally {
      setDeleteOpen(false);
      operationInProgress.current = false;
    }
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(savedProfile ?? emptyProfile());
  const draftStatus = savedProfile === null ? 'Not saved yet' : dirty ? 'Unsaved changes' : 'All changes saved';
  const busy = loadState !== 'ready' || feedback.state === 'saving' || feedback.state === 'deleting';
  const sectionProps = { disabled: busy, errors: fieldErrors };

  return (
    <main>
      <header className="page-header">
        <a className="wordmark" href="/">resumaer<span>.</span></a>
        <span className="milestone">V1.4 · Complete profile</span>
      </header>
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">YOUR CAREER, IN YOUR WORDS</p>
        <h1 id="page-title">Tell your whole story.</h1>
        <p className="description">Bring your experience, education, and skills together.
          Preview your profile and save when you’re ready.</p>
      </section>

      <div className="feedback-region" aria-live="polite" aria-atomic="true">
        {loadState === 'loading' && <p className="feedback loading">Loading your profile…</p>}
        {loadState === 'error' && <div className="feedback error">
          <p><strong>Couldn’t load your profile.</strong> {loadError}</p>
          <p>Check that Express is running, then try again.</p>
          <button type="button" className="secondary-button" onClick={() => {
            setLoadState('loading'); setLoadAttempt((previous) => previous + 1);
          }}>Retry loading</button>
        </div>}
        {feedback.state === 'saving' && <p className="feedback loading">Saving your profile…</p>}
        {feedback.state === 'deleting' && <p className="feedback loading">Deleting your profile…</p>}
        {(feedback.state === 'success' || feedback.state === 'error') &&
          <p className={`feedback ${feedback.state}`}>{feedback.message}</p>}
      </div>

      {loadState === 'ready' && <>
        <div className="editor-toolbar">
          <div className="view-switcher" role="group" aria-label="Profile view">
            {(['edit', 'preview', 'json'] as const).map((option) => <button key={option} type="button"
              aria-pressed={view === option} disabled={busy} onClick={() => setView(option)}>
              {option === 'edit' ? 'Edit profile' : option === 'preview' ? 'Preview' : 'JSON'}
            </button>)}
          </div>
          <div className="save-controls">
            <span className={`draft-status ${savedProfile !== null && !dirty ? 'saved' : ''}`}>
              <span className="status-dot" aria-hidden="true" />{draftStatus}
            </span>
            <button type="submit" form="profile-form" disabled={busy}>
              {feedback.state === 'saving' ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </div>

        <form id="profile-form" noValidate hidden={view !== 'edit'} key={editorVersion}
          onSubmit={(event) => { event.preventDefault(); void handleSave(); }} aria-busy={busy}>
          <section className="profile-card" aria-labelledby="basics-title">
            <div className="card-heading"><div><h2 id="basics-title">Personal details</h2>
              <p className="card-description">Introduce yourself and help people get in touch. Your name is required.</p></div></div>
            {fieldErrors.basics && <p className="field-error">{fieldErrors.basics}</p>}
            <BasicsForm basics={draft.basics} onChange={changeBasics} {...sectionProps} />
          </section>
          <WorkForm entries={draft.work} onChange={(entries) => changeSection('work', entries)} {...sectionProps} />
          <EducationForm entries={draft.education} onChange={(entries) => changeSection('education', entries)} {...sectionProps} />
          <SkillsForm entries={draft.skills} onChange={(entries) => changeSection('skills', entries)} {...sectionProps} />
          <ProjectsForm entries={draft.projects} onChange={(entries) => changeSection('projects', entries)} {...sectionProps} />
          <CertificatesForm entries={draft.certificates} onChange={(entries) => changeSection('certificates', entries)} {...sectionProps} />
          <p className="editor-note">Adding, editing, or removing an entry changes your draft. Click Save profile to save all sections.</p>
        </form>

        {view !== 'edit' && <p className="view-note">Showing your current draft{dirty ? ' with unsaved changes' : ''}.</p>}
        {view === 'preview' && <ProfilePreview profile={draft} />}
        {view === 'json' && <section className="profile-card json-card" aria-labelledby="json-title">
          <h2 id="json-title">Profile JSON</h2>
          <p className="card-description">The current draft sent to the API when you save.</p>
          <pre tabIndex={0} aria-label="Profile JSON"><code>{JSON.stringify(draft, null, 2)}</code></pre>
        </section>}

        {profileExists && <section className="delete-section" aria-labelledby="delete-section-title">
          <div><h2 id="delete-section-title">Delete profile</h2>
            <p>Remove the saved profile and clear all current entries.</p></div>
          <button type="button" className="danger-outline-button" disabled={busy} onClick={() => setDeleteOpen(true)}>Delete profile</button>
        </section>}
      </>}

      <aside className="storage-note" aria-label="About saving">
        <span className="note-icon" aria-hidden="true">i</span>
        <p><strong>A place to start.</strong> Saved details stay available after a page refresh.
          For now, restarting Express clears your saved profile.</p>
      </aside>
      <footer>Made for your next chapter. One small step at a time.</footer>
      <DeleteProfileDialog open={deleteOpen} deleting={feedback.state === 'deleting'}
        onCancel={() => setDeleteOpen(false)} onConfirm={handleDelete} />
    </main>
  );
}