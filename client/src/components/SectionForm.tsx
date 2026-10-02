import { useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { FieldErrors, Section } from '../types/profile';

export type EntryField<T> = {
  key: keyof T & string;
  label: string;
  required?: boolean;
  kind?: 'url' | 'date' | 'text' | 'list';
  max?: number;
};
export type SectionProps<T> = {
  entries: T[];
  onChange: (entries: T[]) => void;
  disabled: boolean;
  errors: FieldErrors;
  errorFocus?: { path: string } | null;
};
type Props<T> = SectionProps<T> & {
  section: Section;
  title: string;
  singular: string;
  description: string;
  fields: EntryField<T>[];
  createEntry: () => T;
};

export default function SectionForm<T extends Record<string, string | string[]>>({
  entries, onChange, disabled, errors, errorFocus, section, title, singular, description, fields, createEntry,
}: Props<T>) {
  // These keys stay with the visible rows when an earlier row is removed.
  // They belong only to the editor and never enter the saved JSON.
  const [rowIds, setRowIds] = useState(() => entries.map(() => crypto.randomUUID()));
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const handledError = useRef<typeof errorFocus>(null);

  useLayoutEffect(() => {
    if (!errorFocus || handledError.current === errorFocus) return;
    handledError.current = errorFocus;
    const [errorSection, index] = errorFocus.path.split('.');
    if (errorSection === section && /^\d+$/.test(index ?? '')) {
      setPage(Math.min(totalPages, Math.floor(Number(index) / pageSize) + 1));
    }
  }, [errorFocus, section, pageSize, totalPages]);

  function addEntry() {
    setRowIds((previous) => [...previous, crypto.randomUUID()]);
    setPage(Math.floor(entries.length / pageSize) + 1);
    onChange([...entries, createEntry()]);
  }

  function removeEntry(index: number) {
    setRowIds((previous) => previous.filter((_, row) => row !== index));
    setPage(Math.min(currentPage, Math.max(1, Math.ceil((entries.length - 1) / pageSize))));
    onChange(entries.filter((_, row) => row !== index));
  }

  function changeField(index: number, key: keyof T, value: string | string[]) {
    onChange(entries.map((entry, row) => row === index ? { ...entry, [key]: value } : entry));
  }

  return (
    <section className="profile-card section-card" aria-labelledby={`${section}-title`}>
      <div className="card-heading">
        <div><h2 id={`${section}-title`}>{title} <span className="entry-count">{entries.length}</span></h2>
          <p className="card-description">{description}</p></div>
      </div>
      {errors[section] && <p className="field-error">{errors[section]}</p>}
      <fieldset disabled={disabled}>
        <legend className="visually-hidden">{title}</legend>
        <div className="section-pagination" role="group" aria-label={`${title} pagination`}>
          <div className="page-size-control">
            <label htmlFor={`${section}-page-size`}>Items per page</label>
            <select id={`${section}-page-size`} value={pageSize} onChange={(event) => {
              setPageSize(Number(event.target.value)); setPage(1);
            }}>
              {[3, 5, 10].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
          <p className="pagination-status" aria-live="polite" aria-atomic="true">
            Page {currentPage} of {totalPages} · {entries.length} {entries.length === 1 ? 'item' : 'items'}
          </p>
          <div className="pagination-actions">
            <button type="button" className="outline-button" disabled={disabled || entries.length >= 50} onClick={addEntry}>
              + Add {singular.toLowerCase()}
            </button>
            <button type="button" className="outline-button" disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}>Previous</button>
            <button type="button" className="outline-button" disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}>Next</button>
          </div>
        </div>
        {entries.length === 0 && <p className="empty-section">No {title.toLowerCase()} yet. Add one when you’re ready.</p>}
        {entries.slice(startIndex, startIndex + pageSize).map((entry, offset) => {
          const index = startIndex + offset;
          return (
          <fieldset key={rowIds[index]} className="entry-card">
            <legend>{singular} {index + 1}</legend>
            <div className="entry-actions">
              <button type="button" className="remove-button" aria-label={`Remove ${singular.toLowerCase()} ${index + 1}`}
                onClick={() => removeEntry(index)}>Remove</button>
            </div>
            {errors[`${section}.${index}`] && <p className="field-error">{errors[`${section}.${index}`]}</p>}
            <div className="form-grid">
              {fields.map((field) => {
                const path = `${section}.${index}.${field.key}`;
                const id = `${section}-${rowIds[index]}-${field.key}`;
                const error = errors[path];
                const multiline = field.kind === 'text' || field.kind === 'list';
                const hint = field.kind === 'date' ? (field.key === 'endDate'
                  ? 'YYYY, YYYY-MM, or YYYY-MM-DD. Leave blank if ongoing.'
                  : 'YYYY, YYYY-MM, or YYYY-MM-DD.')
                  : field.kind === 'list' ? 'One item per line. Up to 50 items, 500 characters each.'
                  : field.kind === 'url' ? 'A full address starting with https:// or http://.' : '';
                const value = entry[field.key];
                const inputProps = {
                  id, name: path, required: field.required,
                  value: Array.isArray(value) ? value.join('\n') : value,
                  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    changeField(index, field.key, field.kind === 'list' ? event.target.value.split('\n') : event.target.value),
                  'aria-invalid': Boolean(error),
                  'aria-describedby': [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined,
                };
                return (
                  <div key={field.key} className={`form-field ${multiline ? 'full-width' : ''}`}>
                    <label htmlFor={id}>{field.label}{field.required && <span className="required-label"> (required)</span>}</label>
                    {multiline ? <textarea {...inputProps} rows={3} maxLength={field.kind === 'list' ? undefined : field.max ?? 5000} />
                      : <input {...inputProps} type={field.kind === 'url' ? 'url' : 'text'}
                        maxLength={field.max ?? (field.kind === 'url' ? 2048 : field.kind === 'date' ? 10 : 120)}
                        placeholder={field.kind === 'date' ? 'e.g. 2024-01' : undefined} />}
                    {hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
                    {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
                  </div>
                );
              })}
            </div>
          </fieldset>
          );
        })}
        {entries.length >= 50 && <p className="field-hint">This section has reached the limit of 50 entries.</p>}
      </fieldset>
    </section>
  );
}
