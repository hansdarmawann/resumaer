# Resumaer

A local career profile and resume builder, built one small MERN milestone at a time.

**Current milestone: V1.1 - Basics form and saving.**

Enter your name, professional title, email, phone, website, and summary, then
click **Save profile**. Refresh the browser to load the saved information.
Failed saves preserve your edits and show an error.

V1 stores **one shared profile in the Express process's memory**. Browser refreshes
keep that process running; restarting Express clears its data. Editing backend
files with `tsx watch` also restarts Express. There is no database or user account
yet. MongoDB persistence comes in V2.

## Start locally

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

Open **http://localhost:5173**. With a fresh backend, the form starts empty because
no profile exists. The health endpoint remains at http://localhost:3000/api/health.
Use `localhost` consistently: `127.0.0.1` is a different browser origin.

The browser calls `http://localhost:3000/api/profile` directly through `fetch()`.
There is no Vite API proxy. Express allows the frontend origin
`http://localhost:5173` through CORS response headers. CORS is a browser rule;
it is not authentication.

## The data we save

The [official JSON Resume schema](https://jsonresume.org/schema) puts these fields
inside `basics`. Professional title uses `label`; website uses `url`.

| Form field | JSON field | V1.1 validation |
| --- | --- | --- |
| Name | `basics.name` | Required text, at most 120 characters |
| Professional title | `basics.label` | Optional text, at most 120 characters |
| Email | `basics.email` | Optional valid email, at most 254 characters |
| Phone | `basics.phone` | Optional text, at most 50 characters |
| Website | `basics.url` | Optional absolute `http://` or `https://` URL, at most 2048 characters |
| Summary | `basics.summary` | Optional text, at most 5000 characters |

```json
{
  "basics": {
    "name": "Ayu Pratama",
    "label": "Frontend Developer",
    "email": "ayu@example.com",
    "phone": "+62 0812 3456 7890",
    "url": "https://example.com",
    "summary": "I build accessible web applications."
  }
}
```

Phone is a **string**, so plus signs, leading zeroes, spaces, and punctuation stay
intact. The API trims surrounding whitespace and fills omitted optional fields
with empty strings. Non-string values, extra sections, and unsupported basics
fields are rejected. This validator covers our V1.1 subset; full JSON Resume
validation, import, and export belong to V3.

## Follow one save

```text
React form -> fetch() -> Route -> Controller -> Service -> In-memory profile
                         Express on localhost:3000
```

1. React keeps the current input values in state. Clicking **Save profile** runs
   the save handler; typing alone does not send a save request.
2. `client/src/api/profile.ts` calls `fetch()` with `Content-Type: application/json`
   and `JSON.stringify({ basics })`. Stringifying turns an object into JSON text.
3. The router matches the HTTP method and `/api/profile` path to a controller.
4. The controller validates the request body, calls the service, and sends an
   HTTP response. The service reads or changes the profile stored in memory.
5. The browser checks `response.ok`, parses the JSON, and updates save feedback.
   `fetch()` rejects network failures, but HTTP 400 or 500 still need that check.

The first save uses **POST** and receives **201 Created**. Once a profile exists,
subsequent saves use **PUT** and receive **200 OK**. Loading uses **GET**. An initial
GET **404** means the store is empty, so the app displays a blank form.

If a save fails, React keeps your draft. If Express restarts after a profile was
loaded, PUT receives 404. The app keeps the draft, explains that no saved profile
exists, and lets the next save create it with POST.

## What each file teaches

Frontend files:

| File | Responsibility and concept |
| --- | --- |
| `client/src/types/profile.ts` | Defines `Basics`, `Profile`, and field-error types: the shape our TypeScript code expects. |
| `client/src/api/profile.ts` | Handles GET/POST/PUT requests, checks HTTP status and response shapes, and turns API failures into usable errors. |
| `client/src/components/BasicsForm.tsx` | A focused form component: labeled controlled inputs, field messages, and an explicit submit button. |
| `client/src/App.tsx` | Owns the draft and loading/saving state, loads the profile on mount, and chooses POST or PUT. |
| `client/src/main.tsx` | Mounts React into the root element and enables development StrictMode. |
| `client/src/styles.css` | Styles the form, feedback, and responsive layout. |
| `client/index.html` | Browser entry point containing React's root element. |
| `client/vite.config.ts` | Sets the React plugin and fixed localhost ports for development and preview. |

A **controlled input** gets its `value` from React state. Its `onChange` handler
updates that state; React then displays the updated value. `useState` keeps data
between renders. The form passes changes to its parent through a callback prop.

An immutable update makes a new object while keeping the other fields:

```tsx
setBasics((previous) => ({ ...previous, [field]: value }));
```

`previous` is the latest state, `...previous` copies its fields, and `[field]`
selects the field being changed. React can render the new object without mutating
the old one. Changing the name should not erase the email.

`useEffect` loads the saved profile when the app mounts. Its cleanup calls
`AbortController.abort()` to cancel an obsolete load, such as when the component
unmounts or loading is retried. Save and loading feedback belong to separate
state so an error can be shown without clearing the form.

Backend files:

| File | Responsibility and concept |
| --- | --- |
| `server/src/index.ts` | Starts listening on port 3000. |
| `server/src/app.ts` | Configures Express, CORS, JSON parsing with a 32 KB limit, routes, and the central error handler. Exporting the app lets tests run it independently. |
| `server/src/routes/profile.routes.ts` | Connects each method/path to a controller and requires JSON for POST/PUT. |
| `server/src/controllers/profile.controller.ts` | Handles HTTP: validates bodies, calls services, and chooses response status/body. |
| `server/src/services/profile.service.ts` | Owns the stored profile and implements create/read/update/delete. Copies prevent callers from mutating stored data by reference. |
| `server/src/validation/profile.validation.ts` | Checks untrusted input at runtime, normalizes accepted values, and returns field errors. TypeScript alone cannot validate network JSON. |
| `server/src/types/profile.ts` | Defines the backend's profile and field-error types. |
| `server/src/errors/http-error.ts` | Represents expected errors with an HTTP status, readable message, and optional field errors. |
| `server/tests/profile.test.mjs` | Exercises real HTTP requests against the app, including validation and storage lifecycle. |

Read the router, controller, service, and validator in that order, then follow the
frontend API helper back to `App.tsx` and `BasicsForm.tsx`. Backend import paths end
in `.js` because the TypeScript build emits JavaScript files for Node to run.

## API contract

All endpoints below use `/api/profile`.

| Method | Successful response | When the profile is absent or already exists |
| --- | --- | --- |
| GET | 200 with the profile | 404 if absent |
| POST | 201 with the created profile | 409 if already present |
| PUT | 200 with the updated profile | 404 if absent |
| DELETE | 204 with no body | 404 if absent |

DELETE is available to API clients; the profile deletion button comes in V1.4.
POST and PUT accept the JSON shape above. Invalid data or malformed JSON returns
400; unsupported content type/encoding returns 415; oversized bodies return 413.
Failures use `{ "message": "...", "errors": { "name": "..." } }`, where `errors`
is optional and field keys match `name`, `label`, `email`, `phone`, `url`, `summary`.

## Verify V1.1

Verified locally: both TypeScript builds and all seven backend integration tests
pass. Chrome checks passed for create/update, refresh loading, validation, failed
save preservation, HTTP errors, unexpected responses, Express restart recovery,
load retry, create conflicts between tabs, and timeout recovery before headers
and while reading the body. The form also fits 390 px and 320 px mobile widths
without horizontal overflow; no browser runtime errors were observed.

Use this walkthrough with both servers running:

1. Restart the backend and open the frontend. Confirm that the empty store loads
   as a blank form. Open browser developer tools > **Network**.
2. Fill all six fields and click **Save profile**. Inspect the `profile` request:
   method POST, status 201, JSON request body under `basics`, and returned values.
3. Refresh the browser. Inspect GET with status 200 and confirm all values reload.
4. Change the professional title, then save. Inspect PUT with status 200. Refresh
   again and confirm the changed title reloads.
5. Stop Express with Ctrl+C. Change a field and try saving. Confirm an error is
   visible and your edited values remain in the form.
6. Restart Express. Try saving the same draft: the old PUT returns 404. Follow the
   feedback and click **Save profile** again; POST should recreate the profile.
7. Stop Express, refresh the page, and confirm loading failure is shown. Restart
   it and choose **Retry loading**. Confirm loading recovers.
8. Try an empty name, an invalid email, and a website without `https://`. Confirm
   validation messages, then correct the values and save successfully.

Run the automated HTTP tests and both builds from the repository root:

```powershell
npm.cmd --prefix server test
npm.cmd --prefix server run build
npm.cmd --prefix client run build
```

Tests use their own temporary server, so they do not clear your running development
server's profile. The backend build creates `server/dist/`; stop the development
server before `npm.cmd --prefix server start`. The frontend build creates
`client/dist/`; stop Vite before `npm.cmd --prefix client run preview`, which uses
localhost port 5173 and the same CORS origin.

**Small exercise:** enter a phone number with `+62`, a leading zero, and spaces.
Find that string in React's input value, the Network request body, the API response,
and the form after refresh. Explain why changing `phone` to a number would lose
information. Then explain how the spread in the state update keeps sibling fields.

## Troubleshooting and next milestones

- **`node` is not recognized:** reopen the terminal after installing Node. If it is
  installed at `C:\Program Files\nodejs`, set the current session's path with
  `$env:Path = 'C:\Program Files\nodejs;' + $env:Path`.
- **Loading or saving fails:** check the backend terminal and health endpoint.
  Open the frontend at exactly `http://localhost:5173`; inspect Network/Console
  for errors. Failed saves retain your draft so you can try again.
- **Saved data disappeared:** an Express restart, including `tsx watch` restarting
  after a backend edit, clears V1's in-memory profile.
- **Port already in use:** stop the previous server. Vite's `strictPort` prevents
  quietly switching to another origin and breaking CORS.
- **Two initial GETs in development:** StrictMode checks effect cleanup by running
  an extra setup/cleanup cycle. You may see one canceled load request.

| Version | Scope |
| --- | --- |
| V0 | Completed React/Express health check, TypeScript, and CORS foundation |
| **V1.1 - current** | Basics form with explicit saving and loading; temporary storage |
| V1.2 | Create, edit, and remove work experience entries |
| V1.3 | Education, Skills, Projects, and Certificates in focused components |
| V1.4 | Profile preview, JSON view, expanded feedback/verification, and deletion UI |
| V2 | MongoDB persistence through Mongoose |
| V3 | Full JSON Resume validation, mapping, import, and export |
| V4 | Single-column ATS-friendly resume and PDF output |

Stop here to understand V1.1 and complete the exercise before adding work entries.
Stay on localhost through V4; authentication, deployment, Docker, and AI features
are outside these milestones.
