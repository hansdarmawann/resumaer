import { useEffect, useRef } from 'react';

type Props = { open: boolean; deleting: boolean; onCancel: () => void; onConfirm: () => Promise<void> };

export default function DeleteProfileDialog({ open, deleting, onCancel, onConfirm }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  return (
    <dialog ref={dialog} className="delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-description"
      onCancel={(event) => { event.preventDefault(); if (!deleting) onCancel(); }}>
      <h2 id="delete-title">Delete this profile?</h2>
      <p id="delete-description">This removes the entire saved profile and clears your current draft, including all entries. This cannot be undone.</p>
      <div className="dialog-actions">
        <button type="button" className="outline-button" disabled={deleting} onClick={onCancel} autoFocus>Cancel</button>
        <button type="button" className="danger-button" disabled={deleting} onClick={() => { void onConfirm(); }}>
          {deleting ? 'Deleting…' : 'Delete profile permanently'}
        </button>
      </div>
    </dialog>
  );
}
