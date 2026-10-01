import { useEffect, useState } from 'react';
import { ApiError, getProfile, saveProfile } from './api/profile';
import BasicsForm from './components/BasicsForm';
import { emptyBasics } from './types/profile';
import type { Basics, FieldErrors } from './types/profile';

type LoadState = 'loading' | 'ready' | 'error';
type Feedback =
  | { state: 'idle' | 'saving' }
  | { state: 'success' | 'error'; message: string };

export default function App() {
  // The draft belongs to React; it reaches Express only when you click Save.
  const [basics, setBasics] = useState<Basics>(emptyBasics);
  const [savedBasics, setSavedBasics] = useState<Basics | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>({ state: 'idle' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const profile = await getProfile(controller.signal);
        if (controller.signal.aborted) return;

        setBasics(profile?.basics ?? { ...emptyBasics });
        setSavedBasics(profile?.basics ?? null);
        setProfileExists(profile !== null);
        setLoadState('ready');
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : 'The request failed.');
        setLoadState('error');
      }
    }

    void loadProfile();
    // StrictMode and unmounting can cancel an obsolete load safely.
    return () => controller.abort();
  }, [loadAttempt]);

  function changeField(field: keyof Basics, value: string) {
    // Make a new object so React can see that this controlled input changed.
    setBasics((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setFeedback({ state: 'idle' });
  }

  async function handleSave() {
    if (loadState !== 'ready' || feedback.state === 'saving') return;
    setFeedback({ state: 'saving' });
    setFieldErrors({});

    try {
      const saved = await saveProfile({ basics }, profileExists);
      // Use the server's trimmed values after a confirmed successful save.
      setBasics(saved.basics);
      setSavedBasics(saved.basics);
      setProfileExists(true);
      setFeedback({ state: 'success', message: 'Profile saved. You can refresh to load it again.' });
    } catch (error) {
      let message = error instanceof Error ? error.message : 'The save failed.';

      if (error instanceof ApiError) {
        setFieldErrors(error.errors);
        if (error.status === 404 && profileExists) {
          // Restarting Express clears memory, so the next save must create.
          setProfileExists(false);
          setSavedBasics(null);
          message = 'The saved profile is no longer available. Save again to create it.';
        } else if (error.status === 409 && !profileExists) {
          setProfileExists(true);
          message = 'A profile already exists. Save again to update it with these details.';
        }
      }

      // Keep the draft unchanged on every failure, including network errors.
      setFeedback({ state: 'error', message: `${message} Your edits are still here.` });
    }
  }

  function retryLoad() {
    setLoadState('loading');
    setLoadAttempt((previous) => previous + 1);
  }

  const dirty = savedBasics !== null && JSON.stringify(basics) !== JSON.stringify(savedBasics);
  const draftStatus = savedBasics === null ? 'Not saved yet' : dirty ? 'Unsaved changes' : 'All changes saved';
  const busy = loadState !== 'ready' || feedback.state === 'saving';

  return (
    <main>
      <header className="page-header">
        <a className="wordmark" href="/">resumaer<span>.</span></a>
        <span className="milestone">V1.1 · Profile basics</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">YOUR CAREER, IN YOUR WORDS</p>
        <h1 id="page-title">Start with the basics.</h1>
        <p className="description">
          Build your profile, one section at a time. Add your details below
          and save when you’re ready.
        </p>
      </section>

      <section className="profile-card" aria-labelledby="basics-title" aria-busy={busy}>
        <div className="card-heading">
          <div>
            <h2 id="basics-title">Personal details</h2>
            <p className="card-description">Introduce yourself and help people get in touch.</p>
          </div>
          {loadState === 'ready' && (
            <span className={`draft-status ${savedBasics !== null && !dirty ? 'saved' : ''}`}>
              <span className="status-dot" aria-hidden="true" />{draftStatus}
            </span>
          )}
        </div>

        <div className="feedback-region" aria-live="polite" aria-atomic="true">
          {loadState === 'loading' && <p className="feedback loading">Loading your profile…</p>}
          {loadState === 'error' && (
            <div className="feedback error">
              <p><strong>Couldn’t load your profile.</strong> {loadError}</p>
              <p>Check that Express is running, then try again.</p>
              <button className="secondary-button" type="button" onClick={retryLoad}>Retry loading</button>
            </div>
          )}
          {feedback.state === 'saving' && <p className="feedback loading">Saving your profile…</p>}
          {(feedback.state === 'success' || feedback.state === 'error') && (
            <p className={`feedback ${feedback.state}`}>{feedback.message}</p>
          )}
        </div>

        <BasicsForm
          basics={basics}
          onChange={changeField}
          onSave={handleSave}
          disabled={busy}
          saving={feedback.state === 'saving'}
          errors={fieldErrors}
        />
      </section>

      <aside className="storage-note" aria-label="About saving">
        <span className="note-icon" aria-hidden="true">i</span>
        <p><strong>A place to start.</strong> Saved details stay available after a page refresh.
          For now, restarting Express clears your saved profile.</p>
      </aside>

      <footer>Made for your next chapter. One small step at a time.</footer>
    </main>
  );
}
