import { useState } from 'react';
import type { Profile } from '../types/profile';
import { mapProfileToJsonResume } from '../mapping/json-resume';

type Props = { profile: Profile; disabled: boolean };

export default function ExportPanel({ profile, disabled }: Props) {
  const [copied, setCopied] = useState(false);

  function handleDownload() {
    const json = mapProfileToJsonResume(profile);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    const json = mapProfileToJsonResume(profile);
    await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="export-panel">
      <button type="button" className="outline-button" disabled={disabled} onClick={handleDownload}>
        ↓ Download resume.json
      </button>
      <button type="button" className="outline-button" disabled={disabled} onClick={() => void handleCopy()}>
        {copied ? '✓ Copied!' : '⎘ Copy JSON'}
      </button>
    </div>
  );
}
