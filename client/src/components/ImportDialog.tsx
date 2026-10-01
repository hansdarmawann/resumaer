import { useEffect, useRef, useState } from 'react';
import type { Profile } from '../types/profile';
import { mapJsonResumeToProfile } from '../mapping/json-resume';

type Props = {
  open: boolean;
  onImport: (profile: Profile) => void;
  onCancel: () => void;
};

export default function ImportDialog({ open, onImport, onCancel }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'file' | 'paste'>('file');
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      setError('');
      setJsonText('');
      setMode('file');
    } else {
      dialog.current?.close();
    }
  }, [open]);

  function parseAndImport(text: string) {
    try {
      const data: unknown = JSON.parse(text);
      const profile = mapJsonResumeToProfile(data);
      onImport(profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse JSON.');
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') parseAndImport(text);
    };
    reader.onerror = () => setError('Failed to read the file.');
    reader.readAsText(file, 'utf-8');
  }

  function handlePasteImport() {
    if (!jsonText.trim()) { setError('Please paste a JSON Resume before importing.'); return; }
    parseAndImport(jsonText);
  }

  return (
    <dialog ref={dialog} className="delete-dialog import-dialog"
      aria-labelledby="import-title" aria-describedby="import-description"
      onCancel={(event) => { event.preventDefault(); onCancel(); }}>
      <h2 id="import-title">Import JSON Resume</h2>
      <p id="import-description" className="card-description">
        Load a <a href="https://jsonresume.org/schema" target="_blank" rel="noopener noreferrer">JSON Resume</a> file.
        This will replace your current draft.
      </p>

      <div className="import-tabs" role="group" aria-label="Import mode">
        <button type="button" aria-pressed={mode === 'file'} onClick={() => { setMode('file'); setError(''); }}>
          Upload file
        </button>
        <button type="button" aria-pressed={mode === 'paste'} onClick={() => { setMode('paste'); setError(''); }}>
          Paste JSON
        </button>
      </div>

      {mode === 'file' && (
        <div className="import-file-area">
          <input ref={fileInput} type="file" accept=".json,application/json" id="import-file"
            className="visually-hidden" onChange={handleFileChange} />
          <label htmlFor="import-file" className="file-label">
            Choose a .json file
          </label>
          <p className="field-hint">Select a resume.json file from your computer.</p>
        </div>
      )}

      {mode === 'paste' && (
        <div className="import-paste-area">
          <label htmlFor="import-json" className="visually-hidden">Paste JSON Resume content</label>
          <textarea id="import-json" rows={10}
            placeholder={'{ "basics": { "name": "..." }, "work": [...] }'}
            value={jsonText} onChange={(e) => { setJsonText(e.target.value); setError(''); }} />
        </div>
      )}

      {error && <p className="field-error import-error" role="alert">{error}</p>}

      <div className="dialog-actions">
        <button type="button" className="outline-button" onClick={onCancel} autoFocus>Cancel</button>
        {mode === 'paste' && (
          <button type="button" onClick={handlePasteImport}>Import</button>
        )}
        {mode === 'file' && (
          <button type="button" onClick={() => fileInput.current?.click()}>Choose file &amp; import</button>
        )}
      </div>
    </dialog>
  );
}
