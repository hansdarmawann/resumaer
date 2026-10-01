import { useState } from 'react';
import type { Basics, FieldErrors, Location, SocialProfile } from '../types/profile';
import { emptySocialProfile } from '../types/profile';

type Props = {
  basics: Basics;
  onChange: (field: keyof Basics, value: string) => void;
  onChangeLocation: (field: keyof Location, value: string) => void;
  onChangeProfiles: (profiles: SocialProfile[]) => void;
  disabled: boolean;
  errors: FieldErrors;
};

export default function BasicsForm({ basics, onChange, onChangeLocation, onChangeProfiles, disabled, errors }: Props) {
  const [profileRowIds, setProfileRowIds] = useState(() => basics.profiles.map(() => crypto.randomUUID()));

  function addProfile() {
    setProfileRowIds((prev) => [...prev, crypto.randomUUID()]);
    onChangeProfiles([...basics.profiles, emptySocialProfile()]);
  }

  function removeProfile(index: number) {
    setProfileRowIds((prev) => prev.filter((_, i) => i !== index));
    onChangeProfiles(basics.profiles.filter((_, i) => i !== index));
  }

  function changeProfile(index: number, field: keyof SocialProfile, value: string) {
    onChangeProfiles(basics.profiles.map((p, i) => i === index ? { ...p, [field]: value } : p));
  }

  return (
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
          <label htmlFor="image">Profile image URL</label>
          <input id="image" name="image" type="url" placeholder="https://example.com/photo.jpg"
            maxLength={2048} value={basics.image} onChange={(event) => onChange('image', event.target.value)}
            aria-invalid={Boolean(errors.image)} aria-describedby={errors.image ? 'image-hint image-error' : 'image-hint'} />
          <p className="field-hint" id="image-hint">Optional. A full https:// URL to a JPEG or PNG image.</p>
          {errors.image && <p className="field-error" id="image-error">{errors.image}</p>}
        </div>
        <div className="form-field full-width">
          <label htmlFor="summary">Summary</label>
          <textarea id="summary" name="summary" rows={5} placeholder="A few sentences about your experience, strengths, and what you'd like to do next."
            maxLength={5000} value={basics.summary} onChange={(event) => onChange('summary', event.target.value)}
            aria-invalid={Boolean(errors.summary)} aria-describedby={errors.summary ? 'summary-error' : undefined} />
          {errors.summary && <p className="field-error" id="summary-error">{errors.summary}</p>}
        </div>
      </div>

      {/* Location */}
      <div className="basics-subsection">
        <h3 className="subsection-title">Location <span className="required-label">(optional)</span></h3>
        {errors.location && <p className="field-error">{errors.location}</p>}
        <div className="form-grid">
          <div className="form-field full-width">
            <label htmlFor="address">Street address</label>
            <input id="address" name="address" autoComplete="street-address" placeholder="e.g. Jl. Sudirman No. 1"
              maxLength={500} value={basics.location.address} onChange={(e) => onChangeLocation('address', e.target.value)}
              aria-invalid={Boolean(errors['location.address'])} />
            {errors['location.address'] && <p className="field-error">{errors['location.address']}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="city">City</label>
            <input id="city" name="city" autoComplete="address-level2" placeholder="e.g. Jakarta"
              maxLength={120} value={basics.location.city} onChange={(e) => onChangeLocation('city', e.target.value)}
              aria-invalid={Boolean(errors['location.city'])} />
            {errors['location.city'] && <p className="field-error">{errors['location.city']}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="region">Region / Province</label>
            <input id="region" name="region" autoComplete="address-level1" placeholder="e.g. DKI Jakarta"
              maxLength={120} value={basics.location.region} onChange={(e) => onChangeLocation('region', e.target.value)}
              aria-invalid={Boolean(errors['location.region'])} />
            {errors['location.region'] && <p className="field-error">{errors['location.region']}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="postalCode">Postal code</label>
            <input id="postalCode" name="postalCode" autoComplete="postal-code" placeholder="e.g. 10220"
              maxLength={50} value={basics.location.postalCode} onChange={(e) => onChangeLocation('postalCode', e.target.value)}
              aria-invalid={Boolean(errors['location.postalCode'])} />
            {errors['location.postalCode'] && <p className="field-error">{errors['location.postalCode']}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="countryCode">Country code</label>
            <input id="countryCode" name="countryCode" autoComplete="country" placeholder="e.g. ID"
              maxLength={10} value={basics.location.countryCode} onChange={(e) => onChangeLocation('countryCode', e.target.value)}
              aria-invalid={Boolean(errors['location.countryCode'])} />
            <p className="field-hint">ISO 3166-1 alpha-2, e.g. ID, US, GB.</p>
            {errors['location.countryCode'] && <p className="field-error">{errors['location.countryCode']}</p>}
          </div>
        </div>
      </div>

      {/* Social Profiles */}
      <div className="basics-subsection">
        <div className="subsection-heading">
          <h3 className="subsection-title">Social profiles <span className="entry-count">{basics.profiles.length}</span></h3>
          <p className="card-description">Links to your online presence (LinkedIn, GitHub, etc.)</p>
        </div>
        {errors.profiles && <p className="field-error">{errors.profiles}</p>}
        {basics.profiles.map((profile, index) => (
          <div key={profileRowIds[index]} className="compact-entry">
            <div className="compact-entry-actions">
              <button type="button" className="remove-button"
                aria-label={`Remove profile ${index + 1}`}
                onClick={() => removeProfile(index)}>Remove</button>
            </div>
            {errors[`profiles.${index}`] && <p className="field-error">{errors[`profiles.${index}`]}</p>}
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor={`profile-network-${profileRowIds[index]}`}>Network <span className="required-label">(required)</span></label>
                <input id={`profile-network-${profileRowIds[index]}`} placeholder="e.g. LinkedIn"
                  maxLength={120} value={profile.network}
                  onChange={(e) => changeProfile(index, 'network', e.target.value)}
                  aria-invalid={Boolean(errors[`profiles.${index}.network`])} />
                {errors[`profiles.${index}.network`] && <p className="field-error">{errors[`profiles.${index}.network`]}</p>}
              </div>
              <div className="form-field">
                <label htmlFor={`profile-username-${profileRowIds[index]}`}>Username</label>
                <input id={`profile-username-${profileRowIds[index]}`} placeholder="e.g. johndoe"
                  maxLength={120} value={profile.username}
                  onChange={(e) => changeProfile(index, 'username', e.target.value)}
                  aria-invalid={Boolean(errors[`profiles.${index}.username`])} />
                {errors[`profiles.${index}.username`] && <p className="field-error">{errors[`profiles.${index}.username`]}</p>}
              </div>
              <div className="form-field full-width">
                <label htmlFor={`profile-url-${profileRowIds[index]}`}>Profile URL</label>
                <input id={`profile-url-${profileRowIds[index]}`} type="url" placeholder="https://linkedin.com/in/johndoe"
                  maxLength={2048} value={profile.url}
                  onChange={(e) => changeProfile(index, 'url', e.target.value)}
                  aria-invalid={Boolean(errors[`profiles.${index}.url`])} />
                {errors[`profiles.${index}.url`] && <p className="field-error">{errors[`profiles.${index}.url`]}</p>}
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="outline-button"
          disabled={disabled || basics.profiles.length >= 20}
          onClick={addProfile}>
          + Add social profile
        </button>
        {basics.profiles.length >= 20 && <p className="field-hint">Maximum of 20 profiles reached.</p>}
      </div>
    </fieldset>
  );
}
