import React, { Component } from 'react';

// Last-resort safety net for the whole app. Catches render-time errors
// anywhere below it, logs them, and shows a recovery affordance instead
// of a blank white screen. Errors thrown in event handlers, async
// callbacks, or effects don't reach error boundaries — those still need
// per-call-site handling.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console -- visible signal during dev.
    console.error('CivitFree crashed:', error, info?.componentStack);
  }

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div role="alert" style={fallbackStyles.wrap}>
        <div style={fallbackStyles.card}>
          <p style={fallbackStyles.eyebrow}>CivitFree Personal</p>
          <h1 style={fallbackStyles.heading}>Something broke.</h1>
          <p style={fallbackStyles.body}>
            The app hit an unexpected error and stopped rendering. Try again, or
            reload the page if it keeps happening.
          </p>
          <pre style={fallbackStyles.pre}>{String(error?.message || error)}</pre>
          <div style={fallbackStyles.actions}>
            <button type="button" style={fallbackStyles.btnPrimary} onClick={this.handleReset}>
              Try again
            </button>
            <button type="button" style={fallbackStyles.btnGhost} onClick={this.handleReload}>
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const fallbackStyles = {
  wrap: {
    position: 'fixed',
    inset: 0,
    background: '#0b0d12',
    color: '#e7e9ee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    zIndex: 1000,
  },
  card: {
    maxWidth: 480,
    width: '100%',
    background: '#14171f',
    border: '1px solid #262b39',
    borderRadius: 10,
    padding: 24,
    boxShadow: '0 24px 60px -32px rgba(0,0,0,.85)',
  },
  eyebrow: {
    margin: 0,
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#6b7185',
  },
  heading: { margin: '8px 0 12px', fontSize: 22 },
  body: { margin: '0 0 16px', color: '#9ba1b0', lineHeight: 1.5 },
  pre: {
    margin: '0 0 20px',
    padding: 12,
    background: '#0b0d12',
    border: '1px solid #262b39',
    borderRadius: 6,
    color: '#e7e9ee',
    fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
    fontSize: 12,
    lineHeight: 1.4,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxHeight: 160,
    overflow: 'auto',
  },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  btnPrimary: {
    padding: '10px 16px',
    background: 'oklch(0.68 0.22 340)',
    color: '#0b0d12',
    border: 0,
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnGhost: {
    padding: '10px 16px',
    background: 'transparent',
    color: '#e7e9ee',
    border: '1px solid #262b39',
    borderRadius: 8,
    cursor: 'pointer',
  },
};
