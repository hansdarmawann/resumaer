import { useEffect, useState } from 'react';

const HEALTH_URL = 'http://localhost:3000/api/health';

type HealthResponse = { status: 'ok' };
type Connection =
  | { state: 'loading' }
  | { state: 'success'; response: HealthResponse }
  | { state: 'error'; message: string };

export default function App() {
  const [connection, setConnection] = useState<Connection>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function checkConnection() {
      try {
        // fetch sends an HTTP request from the browser to our Express server.
        const response = await fetch(HEALTH_URL, { signal: controller.signal });

        // fetch does not throw for HTTP errors such as 404 or 500.
        if (!response.ok) {
          throw new Error(`The API returned HTTP ${response.status}.`);
        }

        // TypeScript cannot validate network data, so check the small contract.
        const data: unknown = await response.json();
        if (
          typeof data !== 'object' ||
          data === null ||
          !('status' in data) ||
          data.status !== 'ok'
        ) {
          throw new Error('The API response did not contain status: "ok".');
        }

        if (!controller.signal.aborted) {
          setConnection({ state: 'success', response: { status: data.status } });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setConnection({
            state: 'error',
            message: error instanceof Error ? error.message : 'The request failed.',
          });
        }
      }
    }

    void checkConnection();
    // Cancel this request when the component unmounts or a new check starts.
    return () => controller.abort();
  }, [attempt]);

  function retryConnection() {
    setConnection({ state: 'loading' });
    setAttempt((previous) => previous + 1);
  }

  return (
    <main>
      <header className="page-header">
        <a className="wordmark" href="/">resumaer<span>.</span></a>
        <span className="milestone">V0 · MERN connection</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">ONE REQUEST. YOUR FIRST CONNECTION.</p>
        <h1 id="page-title">A small start.<br />A working connection.</h1>
        <p className="description">
          Your career profile builder starts here. This page asks the backend
          whether it is running, then displays its response.
        </p>
      </section>

      <section className="connection-card" aria-labelledby="connection-title">
        <div className="card-heading">
          <h2 id="connection-title">Backend connection</h2>
          <span className="request-method">GET</span>
        </div>
        <code className="endpoint">{HEALTH_URL}</code>

        <div className={`result ${connection.state}`} role="status" aria-live="polite">
          {connection.state === 'loading' && <p>Checking the connection…</p>}
          {connection.state === 'success' && (
            <>
              <p className="result-title">Connected to Express</p>
              <p>The backend replied with HTTP 200 and this JSON:</p>
              <pre>{JSON.stringify(connection.response, null, 2)}</pre>
            </>
          )}
          {connection.state === 'error' && (
            <>
              <p className="result-title">Connection failed</p>
              <p>{connection.message}</p>
              <p>Check that the backend is running on port 3000, then try again.</p>
            </>
          )}
        </div>

        <button onClick={retryConnection} disabled={connection.state === 'loading'}>
          {connection.state === 'loading' ? 'Checking…' : 'Check again'}
        </button>
      </section>

      <section className="request-flow" aria-label="Request and response flow">
        <div><strong>React</strong><span>Browser · port 5173</span></div>
        <span className="flow-arrow" aria-hidden="true">↔</span>
        <div><strong>HTTP + JSON</strong><span>Request and response</span></div>
        <span className="flow-arrow" aria-hidden="true">↔</span>
        <div><strong>Express</strong><span>Node.js · port 3000</span></div>
      </section>

      <footer>Current milestone: V0. Next: the professional profile editor.</footer>
    </main>
  );
}
