# Resumaer

A local career profile and resume builder, built one MERN milestone at a time.

**Current milestone: V2 - MongoDB persistence through Mongoose.**

Enter your personal details and add **Work experience, Education, Skills,
Projects, and Certificates**. Each section supports adding, editing, and removing
entries. Click **Save profile** to save the entire draft; refresh to load it again.
Failed saves preserve every section and show errors beside the affected fields.

Switch to **Preview** to see the current draft as a readable profile, or **JSON**
to inspect the object sent to the API. Both views include unsaved edits. The save
button works from all three views. **Delete profile** opens a confirmation dialog;
successful deletion clears the saved profile and the draft. Cancel or Escape
keeps your data, and a failed deletion preserves your draft.

V2 stores the profile in **MongoDB** (`resumaer` database on `localhost:27017`).
Data persists across Express restarts and `tsx watch` reloads. You need a running
MongoDB instance before starting the backend. There is no user account yet;
one shared profile document lives in the `profiles` collection.

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

Field names follow our subset of the [official JSON Resume schema](https://jsonresume.org/schema).
Professional title uses `basics.label`; website uses `url`.

| Personal detail | JSON field | Validation |
| --- | --- | --- |
| Name | `basics.name` | Required text, at most 120 characters |
| Professional title | `basics.label` | Optional text, at most 120 characters |
| Email | `basics.email` | Optional valid email, at most 254 characters |
| Phone | `basics.phone` | Optional text, at most 50 characters |
| Website | `basics.url` | Optional absolute HTTP(S) URL, at most 2048 characters |
| Summary | `basics.summary` | Optional text, at most 5000 characters |

| Section | Required fields for each added entry | Other supported fields |
| --- | --- | --- |
| Work | Company (`name`), `position` | `url`, `startDate`, `endDate`, `summary`, `highlights` |
| Education | `institution` | `url`, `area`, `studyType`, `startDate`, `endDate`, `score`, `courses` |
| Skills | Group (`name`) | `level`, `keywords` |
| Projects | `name` | `description`, `url`, `startDate`, `endDate`, `highlights` |
| Certificates | `name` | `date`, `issuer`, `url` |

The five repeating sections are optional, with up to **50 entries each**. Short
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
  "basics": {
    "name": "Ayu Pratama",
    "label": "Frontend Developer",
    "email": "ayu@example.com",
    "phone": "+62 0812 3456 7890",
    "url": "https://example.com",
    "summary": "I build accessible web applications."
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
    "startDate": "2024-02", "endDate": "", "highlights": ["Responsive design"]
  }],
  "certificates": [{ "name": "Cloud fundamentals", "issuer": "Example", "date": "2024-06", "url": "" }]
}
```

Phone and education score are **strings**, so plus signs, leading zeroes, spaces,
and formatting stay intact. The API trims surrounding whitespace and fills omitted
optional text fields with empty strings. Missing sections and list fields become
empty arrays. Lists trim each item and omit blank lines on save.

Unsupported sections and fields, wrong value types, and invalid entries are
rejected before any saved data changes. This validator covers our V1 subset;
full JSON Resume validation, mapping, import, and export belong to V3.

## Follow one save

```text
React draft -> fetch() -> Route -> Controller -> Service -> In-memory profile
                          Express on localhost:3000
```

1. React owns one draft containing all six sections. Typing, adding, and removing
   entries change state; clicking **Save profile** sends the request.
2. `client/src/api/profile.ts` calls `fetch()` with `Content-Type: application/json`
   and `JSON.stringify(profile)`. Stringifying turns an object into JSON text.
3. The router matches the HTTP method and `/api/profile` path to a controller.
4. The controller validates every section, calls the service, and sends an HTTP
   response. The service reads or changes the profile stored in memory.
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

If a save fails, React keeps the entire draft. If Express restarts after a profile
was loaded, PUT receives 404. The app keeps the draft and lets the next save create
it with POST. If another tab creates the profile first, POST receives 409 and the
next save uses PUT. This shared V1 store uses the most recent successful write;
there is no per-user isolation or conflict merging.

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
| `client/src/components/SectionForm.tsx` | Repeating-entry editor with add/remove, immutable updates, stable row keys, and indexed errors. Keys stay out of saved JSON. |
| `client/src/components/WorkForm.tsx` | Work experience fields and required inputs. |
| `client/src/components/EducationForm.tsx`, `SkillsForm.tsx`, `ProjectsForm.tsx`, `CertificatesForm.tsx` | Focused components defining the other four sections. |
| `client/src/components/ProfilePreview.tsx` | All draft sections, multiline text, dates, lists, and safe website links. |
| `client/src/components/DeleteProfileDialog.tsx` | Native confirmation dialog, Cancel/Escape, and disabled actions during deletion. |
| `client/src/App.tsx` | Entire draft, saved snapshot, loading, feedback, view selection, POST/PUT selection, and deletion recovery. |
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
| `server/src/services/profile.service.ts` | Shared in-memory CRUD with deep copies, including nested arrays. |
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

## Verify V1.2-V1.4

Verified locally: both builds and all **14 backend integration tests** pass.
An isolated Chrome check passed create/edit/remove across all five repeating
sections, full refresh loading, preview/JSON, safe links, indexed validation and
focus, failed save preservation, deletion cancellation/failure/success, conflicts
between tabs, backend restart recovery, unexpected nested responses, and load retry.
The editor, preview, JSON, and dialog fit **390 px and 320 px** widths without
horizontal overflow; no browser runtime errors were observed.
Separate streaming-response checks passed save timeouts before headers and while
reading the body, deletion timeout recovery, and preservation of the entire draft.
Unexpected deletion responses and stale DELETE 404 responses also preserve the
draft; saving after DELETE 404 recreates the profile with POST.

Use this walkthrough with both development servers running:

1. Start with a fresh backend and open the frontend. Confirm empty personal
   details and zero entries in all five sections.
2. Fill personal details and add two entries in every section. Enter multiline
   highlights, courses, and keywords. Click **Save profile**.
3. In browser developer tools > **Network**, inspect POST, status 201, all six
   sections in the request and response, and string-valued phone/score.
4. Refresh. Confirm every field and list reloads. Edit the second entries, remove
   the first entries, then save. Inspect PUT, status 200, and the remaining entries.
5. Change a value without saving. Switch to Preview and JSON; confirm both show
   the draft and the unsaved status. Save from either view.
6. Try an invalid calendar date, an end date before its start, an invalid URL,
   and an empty required entry field. Confirm precise field errors and focus;
   correct them and save.
7. Stop Express, change a field, and save. Confirm the error preserves all
   sections. Restart Express: the first PUT receives 404; saving again uses POST.
8. Stop Express and refresh. Restart it and click **Retry loading**.
9. Open **Delete profile** and choose Cancel, then test Escape. Confirm saved
   data remains. Reopen and confirm deletion: inspect DELETE 204, a cleared draft,
   and GET 404 after refresh. Enter a name and save a new profile with POST.

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
- **Saved data persists between restarts:** V2 uses MongoDB; an Express restart no
  longer clears the profile. To reset, delete the profile through the UI or drop the
  `resumaer` collection in MongoDB.
- **Port already in use:** stop the previous server. Vite's `strictPort` prevents
  quietly switching origins and breaking CORS.
- **Two initial GETs in development:** StrictMode checks effect cleanup by running
  an extra setup/cleanup cycle. You may see one canceled load request.
- **Removed entries return after refresh:** entry removal changes the draft.
  Click **Save profile** before refreshing.

| Version | Scope |
| --- | --- |
| V0 - completed | React/Express health check, TypeScript, and CORS foundation |
| V1.1 - completed | Basics form with explicit saving and loading; temporary storage |
| V1.2 - completed | Create, edit, and remove work experience entries |
| V1.3 - completed | Education, Skills, Projects, and Certificates in focused components |
| V1.4 - completed | Profile preview, JSON view, expanded feedback/verification, and deletion UI |
| **V2 - current, completed** | MongoDB persistence through Mongoose |
| V3 | Full JSON Resume validation, mapping, import, and export |
| V4 | Single-column ATS-friendly resume and PDF output |

Stay on localhost through V4; authentication, deployment, Docker, and AI features
are outside these milestones.
