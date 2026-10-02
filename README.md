# Resumaer

Resumaer was born from the limitations of LinkedIn PDF exports: they are useful
to share, but are not designed as a complete, reusable source of career data.
This project is a local **master resume**—a place to maintain a full professional
history, then turn it into a resume ready to review or save as a PDF.

**Current version: V4.x — section subtabs, editor pagination, project links, and browser PDF output.**

## Current capabilities

- Build one master profile with personal details and **Work experience,
  Volunteer, Education, Awards, Certificates, Publications, Skills, Languages,
  Interests, References, and Projects**.
- Add, edit, and remove entries in every section; data is stored locally in
  MongoDB and survives backend restarts.
- Edit one section at a time using subtabs. Each list has its own page and
  **Items per page** setting: **3**, **5** (default), or **10**.
- Store validated **JSON Resume** data, then import or export the full profile
  as `resume.json`.
- View the latest draft—including unsaved changes—in the editor, resume preview,
  or JSON view.
- Create an ATS-friendly, single-column resume and print or save a PDF through
  the browser's native print dialog without saving changes first.
- Validate important inputs such as email, HTTP(S) URLs, dates, date order,
  text-length limits, and required data; failed saves do not discard the draft.
- Delete the saved profile through a confirmation dialog when starting over.

Click **Save profile** to save the entire draft; refresh to load it again. Failed
saves preserve every section and show errors beside the affected fields.

In **Edit profile**, choose Personal, Experience, Education, Skills, Projects,
or another section. On narrow screens, swipe or scroll the tab row; keyboard
users can use Left/Right, Home, and End. Switching sections or pages preserves
unsaved edits and each section's pagination. Personal details use one form with
no pagination. Changing the page size returns to page one; adding an entry opens
its page, and deleting the last entry on a page keeps the page number valid.
Pagination limits only the editor: saving, JSON, Preview, and PDF include every
entry. A failed save opens the section and page containing the first error and
focuses its field. Importing, deleting the profile, or refreshing resets editor
navigation to its defaults.

Switch to **Preview** to see the current draft as a single-column resume, or
**JSON** to inspect the object sent to the API. Both views include unsaved edits.
**Save profile** and **Print / Save PDF** work from all three views. Printing uses
the current draft without saving it. **Delete profile** opens a confirmation
dialog; successful deletion clears the saved profile and the draft.

**Import** and **Export**, introduced in V3, support full JSON Resume data. You can upload a `resume.json` file or paste JSON data to populate the editor. Use Export to download your profile as a standard `resume.json` file or copy the raw JSON to your clipboard.

Since V2, the profile is stored in **MongoDB** (`resumaer` database on `localhost:27017`). Data persists across Express restarts and `tsx watch` reloads. You need a running MongoDB instance before starting the backend. There is no user account yet; one shared profile document lives in the `profiles` collection.

## Preview and save a PDF

The resume includes personal details and all eleven supported sections, with
standard headings, real text, and a single reading column. Empty sections are
omitted. The image field remains available in profile data but is not shown on
the resume. Website and social profile URLs remain visible as text; only safe
HTTP(S) URLs become website links. Multiline text and long URLs wrap to fit.
Projects with a URL show **Project website: [URL]**; safe links open a new tab
with `noopener noreferrer`. Blank project URLs produce no link or placeholder.
This layout is intended to be ATS-friendly, but parsing varies between applicant
tracking systems and is not guaranteed.

Choose **Print / Save PDF** from Edit, Preview, or JSON. The app uses the browser's
native print dialog through `window.print()`, with the same resume content shown
in Preview. The editor, navigation, buttons, and feedback are excluded from the
printed document. No save request is made, and canceling the dialog preserves
your draft and current view.

In the print dialog:

1. Choose **Save as PDF** as the destination.
2. Use **A4**, **Portrait**, **100%** scale, and **Default** margins. The print
   stylesheet requests 16 mm page margins; browser settings can override them.
3. Disable **Headers and footers** to remove the browser's date, page URL, and
   other added text.
4. Check every page in the print preview, then save the PDF.

Long resumes flow automatically onto additional pages. The screen preview adapts
to the available width and does not simulate individual paper pages; the browser
print preview determines the final pagination. PDF output keeps text selectable
and searchable rather than turning the resume into an image. Printing runs in
the browser, with no additional dependency, backend schema, or API changes.

For the underlying browser behavior, see
[MDN's printing guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing).

## Start locally

You need **MongoDB 6 or newer** running on `localhost:27017` before starting the
backend. The Community Edition is free; [download it here](https://www.mongodb.com/try/download/community).
On Windows you can also start a local instance with:

```powershell
mongod --dbpath C:\data\db
```

Use Node.js 24.11 or newer in the Node 24 series (npm comes with Node).
Check your installation in PowerShell:

```powershell
node --version
npm.cmd --version
```

These commands use `npm.cmd` so PowerShell does not need permission to run
`npm.ps1`. On macOS/Linux, use `npm` instead.

Open **two terminals in the repository root**. Each server stays running in its
own terminal; press Ctrl+C to stop it.

Terminal 1 - backend:

```powershell
cd server
npm.cmd ci
npm.cmd run dev
```

Terminal 2 - frontend:

```powershell
cd client
npm.cmd ci
npm.cmd run dev
```

`npm ci` installs the exact dependencies in `package-lock.json`. Run it the first
time or after dependencies change, not every time you start the app.

Open **http://localhost:5173**. With a running MongoDB and no previous data, personal
details start empty and the other sections have no entries. The health endpoint remains at
http://localhost:3000/api/health. Use `localhost` consistently: `127.0.0.1` is
a different browser origin.

The browser calls `http://localhost:3000/api/profile` directly through `fetch()`.
There is no Vite API proxy. Express allows the frontend origin
`http://localhost:5173` through CORS response headers. CORS is a browser rule;
it is not authentication.

## The data we save

Field names follow the [official JSON Resume schema](https://jsonresume.org/schema) (v1.0.0).
Professional title uses `basics.label`; website uses `url`.

| Personal detail | JSON field | Validation |
| --- | --- | --- |
| Name | `basics.name` | Required text, at most 120 characters |
| Professional title | `basics.label` | Optional text, at most 120 characters |
| Email | `basics.email` | Optional valid email, at most 254 characters |
| Phone | `basics.phone` | Optional text, at most 50 characters |
| Website | `basics.url` | Optional absolute HTTP(S) URL, at most 2048 characters |
| Image | `basics.image` | Optional absolute HTTP(S) URL, at most 2048 characters |
| Summary | `basics.summary` | Optional text, at most 5000 characters |
| Location | `basics.location` | Optional nested object (`address`, `postalCode`, `city`, `countryCode`, `region`) |
| Social profiles| `basics.profiles` | Optional list of networks, up to 20 profiles (`network`, `username`, `url`) |

| Section | Required fields for each added entry | Other supported fields |
| --- | --- | --- |
| Work | Company (`name`), `position` | `url`, `startDate`, `endDate`, `summary`, `highlights` |
| Volunteer | Organization (`organization`) | `position`, `url`, `startDate`, `endDate`, `summary`, `highlights` |
| Education | `institution` | `url`, `area`, `studyType`, `startDate`, `endDate`, `score`, `courses` |
| Awards | `title` | `date`, `awarder`, `summary` |
| Certificates | `name` | `date`, `issuer`, `url` |
| Publications | `name` | `publisher`, `releaseDate`, `url`, `summary` |
| Skills | Group (`name`) | `level`, `keywords` |
| Languages | `language` | `fluency` |
| Interests | `name` | `keywords` |
| References | `name` | `reference` |
| Projects | `name` | `description`, `url`, `startDate`, `endDate`, `highlights`, `roles`, `type` |

The eleven repeating sections are optional, with up to **50 entries each**. Short
text fields allow 120 characters; education score allows 50; summaries and project
descriptions allow 5000. URLs use the same HTTP(S) rule and 2048-character limit
as basics. Dates accept real calendar values as `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`.
An end date cannot precede its start date; overlapping partial periods are allowed.
Leave an end date blank for an ongoing experience, education, or project.

Highlights, courses, and keywords use **one item per line** in the editor and
arrays of strings in JSON. Each list allows 50 items of at most 500 characters.
The independent **1 MB request limit** applies to the combined profile.

```json
{
  "$schema": "https://raw.githubusercontent.com/jsonresume/resume-schema/master/schema.json",
  "basics": {
    "name": "Ayu Pratama",
    "label": "Frontend Developer",
    "email": "ayu@example.com",
    "phone": "+62 0812 3456 7890",
    "url": "https://example.com",
    "summary": "I build accessible web applications.",
    "location": { "city": "Jakarta", "countryCode": "ID" },
    "profiles": [{ "network": "GitHub", "username": "ayupratama", "url": "https://github.com/ayupratama" }]
  },
  "work": [{
    "name": "Example company", "position": "Developer", "url": "",
    "startDate": "2024-01", "endDate": "", "summary": "Built web applications.",
    "highlights": ["Improved accessibility"]
  }],
  "education": [{
    "institution": "Example university", "area": "Computing", "studyType": "BSc",
    "url": "", "startDate": "2020", "endDate": "2024", "score": "3.90",
    "courses": ["Algorithms"]
  }],
  "skills": [{ "name": "Web development", "level": "Advanced", "keywords": ["React", "TypeScript"] }],
  "projects": [{
    "name": "Portfolio", "description": "A personal website.", "url": "https://example.com",
    "startDate": "2024-02", "endDate": "", "highlights": ["Responsive design"],
    "roles": [], "type": ""
  }],
  "certificates": [{ "name": "Cloud fundamentals", "issuer": "Example", "date": "2024-06", "url": "" }],
  "volunteer": [], "awards": [], "publications": [], "languages": [], "interests": [], "references": [],
  "meta": { "version": "v1.0.0", "lastModified": "2026-10-01" }
}
```

Phone and education score are **strings**, so plus signs, leading zeroes, spaces,
and formatting stay intact. The API trims surrounding whitespace and fills omitted
optional text fields with empty strings. Missing sections and list fields become
empty arrays. Lists trim each item and omit blank lines on save.

Unsupported sections and fields, wrong value types, and invalid entries are
rejected before any saved data changes. The validator strictly enforces the full JSON Resume schema.

## Follow one save

```text
React draft -> fetch() -> Route -> Controller -> Service -> Mongoose -> MongoDB
                          Express on localhost:3000
```

1. React owns one draft containing basics and all eleven repeating sections.
   Typing, adding, and removing entries change state; clicking **Save profile**
   sends the request.
2. `client/src/api/profile.ts` calls `fetch()` with `Content-Type: application/json`
   and `JSON.stringify(profile)`. Stringifying turns an object into JSON text.
3. The router matches the HTTP method and `/api/profile` path to a controller.
4. The controller validates every section, calls the service, and sends an HTTP
   response. The service reads or changes the profile stored in MongoDB through
   Mongoose.
5. The browser checks `response.ok`, validates the returned profile shape, and
   updates feedback. `fetch()` rejects network failures, but HTTP 400 or 500 still
   need that explicit status check.
6. A successful save uses the server's normalized values and records a saved
   snapshot. Comparing the draft with that snapshot shows unsaved changes.

The first save uses **POST** and receives **201 Created**. Once a profile exists,
subsequent saves use **PUT** and receive **200 OK**. Loading uses **GET**. An initial
GET **404** means the store is empty.

**PUT replaces the whole profile.** API clients must send every section they
want to keep; omitted arrays become empty arrays. Basics-only V1.1 requests still
work and produce an otherwise empty profile.

If a save fails, React keeps the entire draft. Restarting Express preserves saved
data in MongoDB. If the saved profile is deleted elsewhere, PUT receives 404; the
app keeps the draft and lets the next save create it with POST. If another tab
creates the profile first, POST receives 409 and the next save uses PUT. This
shared store uses the most recent successful write; there is no per-user isolation
or conflict merging.

Every request has a ten-second timeout, including reading a response body.
Loading failures offer **Retry loading**. Saving errors focus the first invalid
field and return to the editor if the save was triggered from Preview or JSON.

## What each file teaches

Frontend files:

| File | Responsibility and concept |
| --- | --- |
| `client/src/types/profile.ts` | Types for every section, empty-entry factories, and field-error paths. |
| `client/src/api/profile.ts` | GET/POST/PUT/DELETE, HTTP status checks, response shape checks, and usable errors. |
| `client/src/components/BasicsForm.tsx` | Labeled controlled inputs and field messages for personal details. |
| `client/src/components/ProfileEditor.tsx` | Responsive, keyboard-accessible section subtabs; mounted forms preserve editor state; validation reveals the invalid section. |
| `client/src/components/SectionForm.tsx` | Repeating-entry editor with independent pagination, add/remove, immutable updates, stable row keys, and indexed errors. Keys and pagination stay out of saved JSON. |
| `client/src/components/WorkForm.tsx` | Work experience fields and required inputs. |
| `client/src/components/EducationForm.tsx`, `SkillsForm.tsx`, `ProjectsForm.tsx`, `CertificatesForm.tsx`, and the remaining section forms | Focused components defining fields for each repeating section. |
| `client/src/components/ResumeDocument.tsx` | Shared resume content for Preview and print: basics, all eleven sections, standard headings, multiline text, and visible safe website links. |
| `client/src/hooks/useResumePrint.ts` | Browser print lifecycle and printing the current draft from any view. |
| `client/src/resume.css` | Responsive single-column resume and print styles, A4 portrait pages, 16 mm margins, and automatic page flow. |
| `client/src/components/DeleteProfileDialog.tsx` | Native confirmation dialog, Cancel/Escape, and disabled actions during deletion. |
| `client/src/App.tsx` | Entire draft, saved snapshot, loading, feedback, view selection, print action, POST/PUT selection, and deletion recovery. |
| `client/src/main.tsx` | React mounting and development StrictMode. |
| `client/src/styles.css` | Responsive editor, preview, JSON, and dialog styles. |
| `client/index.html`, `client/vite.config.ts` | Browser entry point, React plugin, and fixed localhost ports. |

A **controlled input** gets its `value` from React state. Its `onChange` handler
updates that state; React then displays the updated value. Child components pass
changes to their parent through callback props.

An immutable basics update copies both the profile and its basics object:

```tsx
setDraft((previous) => ({
  ...previous,
  basics: { ...previous.basics, [field]: value },
}));
```

For entries, `map()` copies the array and replaces only the edited entry;
`filter()` creates a new array without the removed entry. This keeps sibling
fields and other sections intact. Editor row keys stay with entries when an earlier
row is removed, while validation errors use paths such as `work.0.position`.
Removing or editing an entry clears that section's old errors because its indices
may have changed.

`useEffect` loads the saved profile on mount. Cleanup calls
`AbortController.abort()` to cancel obsolete loads. Saving and loading feedback
live separately from the draft, so reporting an error cannot clear the form.

Backend files:

| File | Responsibility and concept |
| --- | --- |
| `server/src/index.ts` | Starts listening on localhost port 3000. |
| `server/src/app.ts` | Express, CORS, JSON parsing with a 1 MB limit, routes, and central error handling. |
| `server/src/routes/profile.routes.ts` | Method/path routing and JSON content-type checks. |
| `server/src/controllers/profile.controller.ts` | Request validation, service calls, and HTTP response selection. |
| `server/src/services/profile.service.ts` | Shared profile CRUD through Mongoose queries and MongoDB persistence. |
| `server/src/models/profile.model.ts` | Mongoose schema for the stored profile and conversion to API data. |
| `server/src/validation/profile.validation.ts` | Runtime shape, text, list, URL, calendar date, date order, and limit checks for all supported sections. |
| `server/src/types/profile.ts`, `server/src/errors/http-error.ts` | Profile types and expected errors with status, message, and optional field errors. |
| `server/tests/profile.test.mjs`, `server/tests/sections.test.mjs` | Real HTTP tests for CRUD, validation, storage integrity, and error responses. |

Read router, controller, service, and validator in that order, then follow the
frontend API helper to `App.tsx` and the focused components. TypeScript types check
our code; runtime validation checks untrusted network data. Backend import paths
end in `.js` because the TypeScript build emits JavaScript for Node.

## API contract

All endpoints below use `/api/profile`.

| Method | Successful response | When the profile is absent or already exists |
| --- | --- | --- |
| GET | 200 with the whole profile | 404 if absent |
| POST | 201 with the created profile | 409 if already present |
| PUT | 200 with the replaced profile | 404 if absent |
| DELETE | 204 with no body | 404 if absent |

POST and PUT accept the JSON shape above. Invalid data or malformed JSON returns
400; unsupported content type/encoding returns 415; bodies over 1 MB return 413.
Failures use `{ "message": "...", "errors": { "work.0.position": "Position is required." } }`,
where `errors` is optional. Basics errors retain short field keys such as `name`
and `email`; section errors use `skills`, `skills.0`, or `skills.0.keywords`.

DELETE clears all saved sections. The UI clears its draft only after a confirmed
204 response. If DELETE returns 404 because the profile disappeared elsewhere,
the draft remains available and the next save creates it again.

## Verification

Historical V1.2-V1.4 verification (before MongoDB and the full V3 schema): both
builds and all **14 backend integration tests** passed at that milestone.
An isolated Chrome check passed create/edit/remove across the five then-supported
repeating sections, full refresh loading, preview/JSON, safe links, indexed validation and
focus, failed save preservation, deletion cancellation/failure/success, conflicts
between tabs, backend restart recovery, unexpected nested responses, and load retry.
The editor, preview, JSON, and dialog fit **390 px and 320 px** widths without
horizontal overflow; no browser runtime errors were observed.
Separate streaming-response checks passed save timeouts before headers and while
reading the body, deletion timeout recovery, and preservation of the entire draft.
Unexpected deletion responses and stale DELETE 404 responses also preserved the
draft; saving after DELETE 404 recreated the profile with POST. These results are
a historical record, not a report of V4 verification.

Use this current profile walkthrough with MongoDB and both development servers
running:

1. Open the frontend with no saved profile (use **Delete profile** first if you
   intend to clear an existing profile). Confirm empty personal details and zero
   entries in all eleven repeating sections.
2. Fill personal details and add two entries in every section. Enter multiline
   highlights, courses, and keywords. Click **Save profile**.
3. In browser developer tools > **Network**, inspect POST, status 201, basics and
   all eleven sections in the request and response, and string-valued phone/score.
4. Refresh. Confirm every field and list reloads. Edit the second entries, remove
   the first entries, then save. Inspect PUT, status 200, and the remaining entries.
5. Change a value without saving. Switch to Preview and JSON; confirm both show
   the draft and the unsaved status. Save from either view.
6. Try an invalid calendar date, an end date before its start, an invalid URL,
   and an empty required entry field. Confirm precise field errors and focus;
   correct them and save.
7. Stop Express, change a field, and save. Confirm the error preserves all
   sections. Restart Express and save again: PUT succeeds with the existing
   MongoDB profile. Refresh and confirm persistence.
8. Stop Express and refresh. Restart it and click **Retry loading**.
9. Open **Delete profile** and choose Cancel, then test Escape. Confirm saved
   data remains. Reopen and confirm deletion: inspect DELETE 204, a cleared draft,
   and GET 404 after refresh. Enter a name and save a new profile with POST.

For V4, also verify the resume and PDF manually:

1. Populate basics and all eleven repeating sections, including multiline
   summaries, lists, dates, and a long URL. Open Preview and check every section
   appears in one reading column, with readable wrapped text and no photo.
2. Clear a section and add an entirely blank entry to another. Confirm empty
   sections and entries do not produce empty headings or placeholder text.
3. Check that website and social links show their URL text. Enter an unsafe URL
   such as `javascript:alert(1)` in an unsaved website field and confirm Preview
   renders it as text without making it a clickable link.
4. Make an unsaved edit and choose **Print / Save PDF** separately from Edit,
   Preview, and JSON. Check the latest draft appears in each print preview and
   Network shows no POST or PUT caused by printing.
5. Cancel each print dialog. Confirm the selected view, complete draft, unsaved
   status, and ability to keep editing are preserved. Open the dialog again to
   confirm repeated printing works.
6. Add enough long entries to span multiple pages. Save a PDF with the settings
   above and inspect each page for clipping, missing text, unwanted app controls,
   and extra blank pages. Check a long entry can continue onto another page.
7. Open the PDF, select and copy a sentence, search for text from its last page,
   and check a safe URL remains usable. Also check Preview at a narrow mobile
   width for horizontal overflow.

For V4.x, also verify section navigation and editor pagination:

1. Add at least eleven entries to Experience, Education, and Projects. Change
   **Items per page** to 3, 5, and 10 and verify visible counts, page totals,
   Previous/Next boundaries, and reset to page one after a size change.
2. Edit entries on different pages, switch subtabs, and return. Confirm unsaved
   edits and each section's selected size/page remain. Add an entry and confirm
   its page opens; delete the last entry on the last page and confirm the page
   stays valid. Save and refresh to confirm every entry is persisted.
3. Enter an invalid URL in a project on a later page. Save from Personal, Preview,
   or JSON; confirm Projects opens to the invalid entry and focuses its field.
   Correct it and save. Check Preview, JSON, and PDF include all entries.
4. Check project links with valid and blank URLs. Valid links should show a clear
   label and open a new tab; blank URLs should show nothing. Test all subtabs at
   390 px and 320 px, and navigate tabs with Left/Right, Home, and End.

V4.x verification passed the frontend production build, all **14 backend HTTP
integration tests**, and isolated Chromium checks covering all eleven lists,
page sizes, unsaved edits, add/edit/remove, hidden-field validation, save/reload,
import, deletion, and secure project links. Every subtab, Preview, and JSON fit
**390 px and 320 px** without document overflow. The existing V4 preview/print
checks also passed, including long documents and PDF generation. Browser checks
used a disposable mock API with the real backend validator; backend integration
tests used temporary MongoDB instances. Safari and Firefox were not tested.

Run the automated HTTP tests and both builds from the repository root:

```powershell
npm.cmd --prefix server test
npm.cmd --prefix server run build
npm.cmd --prefix client run build
```

Tests use their own temporary servers and do not clear your running development
server's profile. The backend build creates `server/dist/`; stop the development
server before `npm.cmd --prefix server start`. The frontend build creates
`client/dist/`; stop Vite before `npm.cmd --prefix client run preview`, which uses
localhost port 5173 and the same CORS origin.

**Small exercise:** follow a phone string with `+62`, a leading zero, and spaces
through React state, the request, the response, and refresh. Then add two work
entries, edit the second, remove the first, and explain how `map()`, `filter()`,
and stable row keys preserve the remaining entry.

## Troubleshooting and next milestones

- **`node` is not recognized:** reopen the terminal after installing Node. If it is
  installed at `C:\Program Files\nodejs`, set the current session's path with
  `$env:Path = 'C:\Program Files\nodejs;' + $env:Path`.
- **Backend won't start:** confirm MongoDB is running on `localhost:27017`. The
  backend prints `Failed to connect to MongoDB` and exits if it cannot connect.
- **Loading, saving, or deletion fails:** check the backend terminal and health
  endpoint. Open exactly `http://localhost:5173`; inspect Network/Console errors.
  Failed save/delete requests retain the draft.
- **Saved data persists between restarts:** MongoDB keeps the profile after an
  Express restart. To reset, delete the profile through the UI.
- **Port already in use:** stop the previous server. Vite's `strictPort` prevents
  quietly switching origins and breaking CORS.
- **Two initial GETs in development:** StrictMode checks effect cleanup by running
  an extra setup/cleanup cycle. You may see one canceled load request.
- **Removed entries return after refresh:** entry removal changes the draft.
  Click **Save profile** before refreshing.
- **PDF looks different from the screen preview:** use the browser print preview
  to check pagination; choose A4, Portrait, 100% scale, and Default margins.
  Disable Headers and footers to remove the browser's added page text.

| Version | Scope |
| --- | --- |
| V0 - completed | React/Express health check, TypeScript, and CORS foundation |
| V1.1 - completed | Basics form with explicit saving and loading; temporary storage |
| V1.2 - completed | Create, edit, and remove work experience entries |
| V1.3 - completed | Education, Skills, Projects, and Certificates in focused components |
| V1.4 - completed | Profile preview, JSON view, expanded feedback/verification, and deletion UI |
| V2 - completed | MongoDB persistence through Mongoose |
| V3 - completed | Full JSON Resume validation, mapping, import, and export |
| V4 - completed | Single-column ATS-friendly resume preview and browser-native Print / Save PDF for the current draft |
| **V4.1 - current, completed** | Project link labels, responsive Edit Profile subtabs, independent list pagination, and validation navigation to hidden fields |
