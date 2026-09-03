import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', backgroundColor: '#070a0f', color: '#f87171', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>SYSTEM RUNTIME EXCEPTION</h1>
          <p style={{ color: '#cbd5e1', marginTop: '8px' }}>{this.state.error?.toString()}</p>
          <pre style={{ backgroundColor: '#0e1116', padding: '16px', borderRadius: '8px', border: '1px solid #242a33', color: '#94a3b8', marginTop: '16px', overflow: 'auto' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#c7a86b', color: '#080a0d', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            RELOAD SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
