import type { Basics, FieldErrors } from '../types/profile';

type Props = {
  basics: Basics;
  onChange: (field: keyof Basics, value: string) => void;
  onSave: () => Promise<void>;
  disabled: boolean;
  saving: boolean;
  errors: FieldErrors;
};

export default function BasicsForm({ basics, onChange, onSave, disabled, saving, errors }: Props) {
  return (
    <form onSubmit={(event) => { event.preventDefault(); void onSave(); }}>
      <fieldset disabled={disabled}>
        <legend className="visually-hidden">Profile basics</legend>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="name">Full name <span className="required-label">(required)</span></label>
            <input id="name" name="name" autoComplete="name" placeholder="e.g. Alex Morgan"
              required maxLength={120} value={basics.name} onChange={(event) => onChange('name', event.target.value)}
              aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
            {errors.name && <p className="field-error" id="name-error">{errors.name}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="label">Professional title</label>
            <input id="label" name="label" autoComplete="organization-title" placeholder="e.g. Frontend Developer"
              maxLength={120} value={basics.label} onChange={(event) => onChange('label', event.target.value)}
              aria-invalid={Boolean(errors.label)} aria-describedby={errors.label ? 'label-error' : undefined} />
            {errors.label && <p className="field-error" id="label-error">{errors.label}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="alex@example.com"
              maxLength={254} value={basics.email} onChange={(event) => onChange('email', event.target.value)}
              aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
            {errors.email && <p className="field-error" id="email-error">{errors.email}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="e.g. +62 812 3456 7890"
              maxLength={50} value={basics.phone} onChange={(event) => onChange('phone', event.target.value)}
              aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} />
            {errors.phone && <p className="field-error" id="phone-error">{errors.phone}</p>}
          </div>
          <div className="form-field full-width">
            <label htmlFor="url">Website</label>
            <input id="url" name="url" type="url" autoComplete="url" placeholder="https://yourwebsite.com"
              maxLength={2048} value={basics.url} onChange={(event) => onChange('url', event.target.value)}
              aria-invalid={Boolean(errors.url)} aria-describedby={errors.url ? 'url-hint url-error' : 'url-hint'} />
            <p className="field-hint" id="url-hint">Use a full address starting with https:// or http://.</p>
            {errors.url && <p className="field-error" id="url-error">{errors.url}</p>}
          </div>
          <div className="form-field full-width">
            <label htmlFor="summary">Summary</label>
            <textarea id="summary" name="summary" rows={5} placeholder="A few sentences about your experience, strengths, and what you’d like to do next."
              maxLength={5000} value={basics.summary} onChange={(event) => onChange('summary', event.target.value)}
              aria-invalid={Boolean(errors.summary)} aria-describedby={errors.summary ? 'summary-error' : undefined} />
            {errors.summary && <p className="field-error" id="summary-error">{errors.summary}</p>}
          </div>
        </div>
        <div className="form-actions">
          <button type="submit">{saving ? 'Saving…' : 'Save profile'}<span aria-hidden="true"> →</span></button>
          <p>Only your name is required. You can fill in the rest later.</p>
        </div>
      </fieldset>
    </form>
  );
}
