import { startTransition, useEffect, useMemo, useState } from 'react';
import { appConfig } from './config.js';
import { ensureFreshToken, getKeycloak, initKeycloak } from './auth/keycloak.js';
import './App.css';

const initialState = {
  loading: true,
  authenticated: false,
  userProfile: null,
  authError: '',
  profileError: '',
  profileLoading: false
};

export default function App() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let refreshTimer;

    async function bootstrap() {
      try {
        const client = await initKeycloak();

        startTransition(() => {
          setState((current) => ({
            ...current,
            loading: false,
            authenticated: Boolean(client.authenticated),
            authError: ''
          }));
        });

        if (client.authenticated) {
          await loadProfile();
          refreshTimer = window.setInterval(() => {
            ensureFreshToken().catch(() => {
              setState((current) => ({
                ...current,
                authError: 'Token refresh failed. Log in again.'
              }));
            });
          }, 20_000);
        }
      } catch (error) {
        startTransition(() => {
          setState((current) => ({
            ...current,
            loading: false,
            authError: error instanceof Error ? error.message : 'Failed to initialize authentication.'
          }));
        });
      }
    }

    bootstrap();

    return () => {
      if (refreshTimer) {
        window.clearInterval(refreshTimer);
      }
    };
  }, []);

  async function loadProfile() {
    const client = getKeycloak();

    if (!client.authenticated) {
      return;
    }

    startTransition(() => {
      setState((current) => ({
        ...current,
        profileLoading: true,
        profileError: ''
      }));
    });

    try {
      const token = await ensureFreshToken();
      const response = await fetch(`${appConfig.userServiceUrl}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`User profile request failed with status ${response.status}.`);
      }

      const profile = await response.json();

      startTransition(() => {
        setState((current) => ({
          ...current,
          userProfile: profile,
          profileLoading: false,
          profileError: ''
        }));
      });
    } catch (error) {
      startTransition(() => {
        setState((current) => ({
          ...current,
          profileLoading: false,
          profileError: error instanceof Error ? error.message : 'Failed to load user profile.'
        }));
      });
    }
  }

  const keycloak = getKeycloak();
  const tokenSummary = useMemo(() => {
    if (!keycloak.tokenParsed) {
      return [];
    }

    return [
      ['sub', keycloak.tokenParsed.sub],
      ['preferred_username', keycloak.tokenParsed.preferred_username],
      ['email', keycloak.tokenParsed.email],
      ['scope', keycloak.tokenParsed.scope]
    ].filter(([, value]) => value);
  }, [keycloak.tokenParsed]);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">ChatApp Frontend</p>
        <h1>Keycloak-ready React client for the chat platform.</h1>
        <p className="hero-copy">
          This frontend is scaffolded to log in against Keycloak, call <code>/api/users/me</code>,
          and grow into the full chat UI without reworking the auth flow.
        </p>
        <div className="actions">
          <button
            className="primary"
            type="button"
            onClick={() => keycloak.login()}
            disabled={state.loading || state.authenticated}
          >
            Log In
          </button>
          <button
            className="secondary"
            type="button"
            onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
            disabled={state.loading || !state.authenticated}
          >
            Log Out
          </button>
          <button
            className="ghost"
            type="button"
            onClick={() => loadProfile()}
            disabled={state.loading || !state.authenticated || state.profileLoading}
          >
            Load My Profile
          </button>
        </div>
        {state.authError ? <p className="error-banner">{state.authError}</p> : null}
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Auth Status</h2>
          <dl className="stack">
            <div>
              <dt>Client</dt>
              <dd>{appConfig.keycloakClientId}</dd>
            </div>
            <div>
              <dt>Realm</dt>
              <dd>{appConfig.keycloakRealm}</dd>
            </div>
            <div>
              <dt>Authenticated</dt>
              <dd>{state.loading ? 'Checking...' : state.authenticated ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <h2>Service Targets</h2>
          <ul className="service-list">
            <li>
              <span>User Service</span>
              <code>{appConfig.userServiceUrl}</code>
            </li>
            <li>
              <span>Chat Service</span>
              <code>{appConfig.chatServiceUrl}</code>
            </li>
            <li>
              <span>Notification Service</span>
              <code>{appConfig.notificationServiceUrl}</code>
            </li>
          </ul>
        </article>

        <article className="panel wide">
          <h2>User Profile</h2>
          {state.profileLoading ? <p>Loading profile...</p> : null}
          {state.profileError ? <p className="error-inline">{state.profileError}</p> : null}
          {state.userProfile ? (
            <pre>{JSON.stringify(state.userProfile, null, 2)}</pre>
          ) : (
            <p>No profile loaded yet.</p>
          )}
        </article>

        <article className="panel wide">
          <h2>Token Claims</h2>
          {tokenSummary.length > 0 ? (
            <ul className="claims-list">
              {tokenSummary.map(([key, value]) => (
                <li key={key}>
                  <span>{key}</span>
                  <code>{String(value)}</code>
                </li>
              ))}
            </ul>
          ) : (
            <p>No token claims available yet.</p>
          )}
        </article>
      </section>
    </main>
  );
}
