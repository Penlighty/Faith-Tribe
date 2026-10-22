import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Icon } from '../../design/icons';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[FaithTribe ErrorBoundary] Uncaught render error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = window.location.origin;
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-xl mx-auto px-4 py-8 sm:py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <Card variant="hero" padding="lg" className="w-full flex flex-col items-center text-center gap-4 shadow-lg border border-[var(--border-tint)]">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <Icon name="info" size={32} />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-black text-[var(--on-container)]">
                {this.props.fallbackTitle || 'Session Refresh Needed'}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[var(--on-container-variant)] max-w-md">
                {this.props.fallbackMessage ||
                  'A temporary connection or room synchronization hiccup occurred. Restoring the fellowship connection now.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full mt-2">
              <Button
                variant="primary"
                size="md"
                onClick={this.handleReset}
                leftIcon={<Icon name="refresh" size={16} />}
              >
                Reconnect & Refresh
              </Button>
              <Button
                variant="tonal"
                size="md"
                onClick={this.handleGoHome}
                leftIcon={<Icon name="home" size={16} />}
              >
                Return Home
              </Button>
            </div>

            {/* Collapsible Technical Details for Debugging */}
            <div className="w-full mt-4 text-left border-t border-[var(--border-tint)] pt-3">
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="text-[11px] font-bold text-[var(--on-container-variant)] hover:text-[var(--primary-action)] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{this.state.showDetails ? '▼ Hide Diagnostic Info' : '▶ Show Diagnostic Info'}</span>
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3 rounded-xl bg-[var(--surface-container)] text-[10px] font-mono text-[var(--on-container)] overflow-x-auto max-h-48 border border-[var(--border-tint)]/60">
                  <div className="font-bold text-red-500 mb-1">{this.state.error?.toString()}</div>
                  <pre className="opacity-75 whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                </div>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
