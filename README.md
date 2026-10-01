# Resumaer

A local career profile and resume builder, built one small MERN milestone at a time.

**Current milestone: V0 — React talks to Express.**

V0 is implemented and verified locally: both TypeScript builds pass; Chrome
receives the real API response; stopping and restarting the backend exercises
error handling and recovery. HTTP-error and invalid-response handling, mobile
layout, and the compiled frontend preview were also checked.

V0 contains a React + TypeScript frontend and an Express + TypeScript backend.
The page calls `GET /api/health` and shows the JSON response. MongoDB starts in V2;
profile editing starts in V1. This milestone does not store profile data.

## Start locally

Use Node.js 24.11 or newer in the Node 24 series (npm comes with Node).
Check your installation in PowerShell:

```powershell
node --version
npm.cmd --version
```

The commands below use `npm.cmd` so PowerShell does not need permission to run
the `npm.ps1` script. On macOS/Linux, use `npm` instead.

Open **two terminals in the repository root**. Each server stays running in its
own terminal; use Ctrl+C to stop it.

Terminal 1 — backend:

```powershell
cd server
npm.cmd ci
npm.cmd run dev
```

Terminal 2 — frontend:

```powershell
cd client
npm.cmd ci
npm.cmd run dev
```

`npm ci` installs the exact dependencies recorded in `package-lock.json`. Run it
the first time or after dependencies change, not every time you start the app.

Open **http://localhost:5173**. The page should say **Connected to Express** and show:

```json
{
  "status": "ok"
}
```

You can also open http://localhost:3000/api/health directly. That checks the API
on its own; the frontend page checks the full browser-to-backend connection.
Use `localhost` consistently: `127.0.0.1` is a different origin for CORS purposes.

## Follow one request

```text
Browser renders the React App component       localhost:5173
    ↓ fetch('http://localhost:3000/api/health')
HTTP GET /api/health
    ↓
Express matches app.get('/api/health', ...)    localhost:3000
    ↓ response.json({ status: 'ok' })
HTTP 200 + JSON response
    ↓ response.json() in the browser
React updates component state and displays “Connected to Express”
```

- **Frontend:** React runs in the browser and controls what the user sees. Vite
  serves the frontend files during development and updates the page as you edit.
- **Backend:** Node.js runs JavaScript outside the browser. Express handles
  incoming HTTP requests inside that Node process.
- **Ports:** `5173` identifies the Vite server; `3000` identifies the Express
  server. Both run on your own computer (`localhost`).
- **HTTP:** The browser sends a method (`GET`) and a path (`/api/health`). The
  server sends a status code (`200` means success), headers, and a response body.
- **JSON:** A text format for exchanging data. Express serializes an object to
  JSON; the browser's `response.json()` parses it back into a JavaScript value.
- **REST:** We are beginning an HTTP API that uses paths and methods. `GET`
  reads information; later milestones will introduce methods that save changes.
- **CORS:** An origin includes protocol, hostname, and port. These two servers
  have different origins. The Express CORS middleware adds a response header
  permitting the browser page at `http://localhost:5173` to read the API response.
  CORS is a browser rule, not authentication or a way to block other clients.
- **TypeScript:** Checks code before it runs. Network JSON still needs runtime
  validation, so the component explicitly checks that the response has `status: 'ok'`.

There is deliberately no Vite API proxy: the browser calls Express directly,
making the two servers and CORS visible while learning.

## What each file does

```text
resumaer/
├── client/
│   ├── src/
│   │   ├── App.tsx         Connection check, React state, and page content
│   │   ├── main.tsx        Mounts React inside index.html
│   │   └── styles.css      Page styling and mobile layout
│   ├── index.html         Browser entry point; contains React's root element
│   ├── vite.config.ts     React plugin and fixed localhost development port
│   ├── tsconfig.json      Strict TypeScript settings for browser code
│   ├── package.json       Frontend packages and commands
│   └── package-lock.json  Exact installed dependency versions
├── server/
│   ├── src/index.ts       Express app, CORS, health route, and listening port
│   ├── tsconfig.json      Strict TypeScript settings; outputs JavaScript to dist/
│   ├── package.json       Backend packages and commands
│   └── package-lock.json  Exact installed dependency versions
├── .gitignore             Keeps dependencies, builds, and local files out of Git
└── README.md              Setup, concepts, verification, and milestone progress
```

Start reading with `server/src/index.ts`, then `client/src/App.tsx`, then
`client/src/main.tsx`. The route and request handler fit in one backend file for
now. Controllers, services, models, and extra directories will appear when
profile features give them actual work to do.

The backend uses `express` for HTTP routes and `cors` for response headers.
`tsx watch` runs TypeScript during development and restarts the backend on edits;
`typescript` checks types and compiles it to JavaScript. The frontend uses
`react` for components, `react-dom` to render them, and Vite's React plugin for
development integration. The `@types/*` packages describe libraries' types to
TypeScript; they add no application features.

## Verify and explore V0

1. Start both servers and open the frontend. Confirm the green connection result.
2. Open browser developer tools → **Network**, then click **Check again**. Inspect
   the `health` request: URL, method `GET`, status `200`, and JSON response.
3. Inspect its response headers for
   `Access-Control-Allow-Origin: http://localhost:5173`.
4. Stop the backend with Ctrl+C, then click **Check again**. The page should show
   **Connection failed**, rather than leaving the previous success visible.
5. Restart the backend and click **Check again**. The connection should recover.

To check TypeScript and build both packages, run from the repository root:

```powershell
npm.cmd --prefix server run build
npm.cmd --prefix client run build
```

The backend build produces `server/dist/index.js`. After stopping its development
server, `npm.cmd --prefix server start` runs this compiled JavaScript on port 3000.
The frontend build produces static files in `client/dist/`. After stopping its
development server, `npm.cmd --prefix client run preview` serves that build on
the same localhost port 5173, so the allowed CORS origin stays the same.

**Try this yourself:** in the backend, change `status: 'ok'` to `status: 'learning'`
and check again. The page should report an unexpected response. Explain why the
request can return HTTP 200 but still fail the frontend's contract check, then
restore `'ok'`. This connects the server response to the frontend's validation.

## Troubleshooting

- **`node` is not recognized:** reopen your terminal after installing Node. If it
  is already installed at `C:\Program Files\nodejs`, this command makes it
  available in the current PowerShell session:
  `$env:Path = 'C:\Program Files\nodejs;' + $env:Path`.
- **Connection failed:** ensure the backend terminal is running and open the
  health endpoint directly. Look in the browser console for a network or CORS
  error. Open the frontend at exactly `http://localhost:5173`.
- **Port already in use:** stop the previous process using that port. Vite uses
  `strictPort` so it fails clearly instead of silently changing the frontend
  origin and breaking CORS.
- **Two initial requests in development:** React StrictMode runs an extra effect
  setup/cleanup cycle to help find bugs. The effect's AbortController cancels an
  obsolete request; you may see one canceled request in the Network panel.
- **An unknown API path returns 404:** only `/api/health` exists at V0. Opening the
  backend root `/` is not the same as opening the React app.

## Milestones

| Version | Scope |
| --- | --- |
| **V0 — current** | Local React → Express health check, TypeScript, CORS |
| V1 | Profile editor and REST CRUD, initially in memory |
| V2 | MongoDB persistence through Mongoose |
| V3 | JSON Resume validation, mapping, import, and export |
| V4 | Single-column ATS-friendly resume and PDF output |

Future data will follow JSON Resume while keeping application metadata separate.
Stay on localhost through V4. Authentication, deployment, Docker, and AI features
are outside these milestones. Stop after V0 verification and understand the
request flow before moving to V1.

Reference documentation: [Vite getting started](https://vite.dev/guide/),
[Express first route](https://expressjs.com/en/starter/hello-world/),
[Express CORS middleware](https://expressjs.com/en/resources/middleware/cors/).
