import React, { useState } from "react";
import { book } from "./data/book";
import { getDefaultLanguage, getAvailableLanguages } from "./utils/language";
import { useTextSize } from "./utils/useTextSize";
import { useBookmark } from "./utils/useBookmark";
import { useSearch } from "./utils/useSearch";
import { useAudioPlayer } from "./utils/useAudioPlayer";
import { useShareQuote } from "./utils/useShareQuote";

import { icons } from "./assets/icons";
import BookReader from "./BookReader";

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


function App() {
  // Show the new minimal, offline-friendly book reader with error boundary
  return (
    <ErrorBoundary>
      <BookReader />
      {/* ...existing code... */}
    </ErrorBoundary>
  );
}

export default App;
