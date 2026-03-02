import React, { Suspense, useEffect, useState } from "react";
import { getAnalyticsConsentStatus, setAnalyticsConsent } from './utils/analytics';
const BookReader = React.lazy(() => import('./BookReader'));
const Splash = React.lazy(() => import('./components/Splash'));

type ErrorBoundaryProps = { children: React.ReactNode };
type ErrorBoundaryState = { hasError: boolean; error: unknown };
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: unknown, errorInfo: unknown) {
    // You can log errorInfo to an error reporting service here
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2em', color: '#b00', background: '#fffbe6', borderRadius: '8px', margin: '2em auto', maxWidth: '600px', textAlign: 'center' }}>
          <h2>Something went wrong in the BookReader.</h2>
          <pre style={{ color: '#b00', fontSize: '1em', whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
import "./App.css";


import { useDarkMode } from "./utils/useDarkMode";

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      const u = new URL(window.location.href);
      if (u.searchParams.has('splash')) return true;
    } catch (e) {
      // ignore
    }
    return !localStorage.getItem('gc_seen_splash_v1');
  });

  const [dark] = useDarkMode();
  const [consentStatus, setConsentStatus] = useState<'granted' | 'denied' | 'unknown'>(() => getAnalyticsConsentStatus());

  // Accent theme: allow ?accent=blue or localStorage.gc_splash_accent
  useEffect(() => {
    let accent = '';
    try {
      const u = new URL(window.location.href);
      accent = u.searchParams.get('accent') || localStorage.getItem('gc_splash_accent') || '';
    } catch {}
    if (dark) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
    }
    if (accent) {
      document.body.setAttribute('data-theme', `${document.body.getAttribute('data-theme')} accent-${accent}`);
    }
  }, [dark]);

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        {showSplash && (
          <Splash
            onStart={() => {
              localStorage.setItem('gc_seen_splash_v1','1');
              localStorage.setItem('gc_jump_to_toc','1');
              setShowSplash(false);
            }}
            onClose={() => setShowSplash(false)}
            onChooseLanguage={() => setShowSplash(false)}
          />
        )}
      </Suspense>
      {!showSplash && (
        <Suspense fallback={null}>
          <BookReader />
        </Suspense>
      )}
      {consentStatus === 'unknown' && (
        <div className="analytics-consent-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
          <div className="analytics-consent-text">
            We use privacy-friendly analytics to understand traffic and improve reading experience.
          </div>
          <div className="analytics-consent-actions">
            <button
              className="analytics-consent-btn secondary"
              onClick={() => {
                setAnalyticsConsent(false);
                setConsentStatus('denied');
              }}
            >
              Decline
            </button>
            <button
              className="analytics-consent-btn primary"
              onClick={() => {
                setAnalyticsConsent(true);
                setConsentStatus('granted');
              }}
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}

export default App;
