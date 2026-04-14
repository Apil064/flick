import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary text-white flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-4xl font-black text-accent-red mb-4 italic">FLICK</h1>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-text-secondary max-w-md mb-8">
            {this.state.error?.message || "An unexpected error occurred while initializing the application."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
