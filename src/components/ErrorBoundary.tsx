import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  reloadCount: number;
}

const RELOAD_COUNT_KEY = 'flick_error_reload_count';
const MAX_AUTO_RELOADS = 1;

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    reloadCount: 0,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    const count = parseInt(sessionStorage.getItem(RELOAD_COUNT_KEY) || '0', 10);
    return { hasError: true, error, reloadCount: count };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private async handleHardReset() {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      sessionStorage.clear();
      localStorage.removeItem(RELOAD_COUNT_KEY);
    } catch (e) {
      console.error('Error during hard reset:', e);
    } finally {
      window.location.reload();
    }
  }

  private handleSoftReload() {
    const currentCount = parseInt(sessionStorage.getItem(RELOAD_COUNT_KEY) || '0', 10);
    if (currentCount < MAX_AUTO_RELOADS) {
      sessionStorage.setItem(RELOAD_COUNT_KEY, String(currentCount + 1));
      window.location.reload();
    }
  }

  componentDidMount() {
    sessionStorage.removeItem(RELOAD_COUNT_KEY);
  }

  public render() {
    if (this.state.hasError) {
      const hasExhaustedRetries = this.state.reloadCount >= MAX_AUTO_RELOADS;

      return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-4xl font-black text-[#E50914] mb-4 italic">FLICK</h1>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-[#a3a3a3] max-w-md mb-2">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>

          {hasExhaustedRetries ? (
            <>
              <p className="text-[#a3a3a3] max-w-md mb-8 text-sm">
                A simple reload didn't fix it. This is likely caused by an outdated cached version of the app.
                Click below to fully clear the cache and start fresh.
              </p>
              <button
                onClick={() => this.handleHardReset()}
                className="px-8 py-3 bg-[#E50914] text-white font-bold rounded-full hover:bg-red-700 transition-all"
              >
                Clear Cache &amp; Reload
              </button>
            </>
          ) : (
            <>
              <p className="text-[#a3a3a3] max-w-md mb-8 text-sm">
                Try reloading the page. If the problem persists, use the "Clear Cache" option.
              </p>
              <div className="flex gap-4 flex-wrap justify-center">
                <button
                  onClick={() => this.handleSoftReload()}
                  className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => this.handleHardReset()}
                  className="px-8 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all border border-white/20"
                >
                  Clear Cache &amp; Reload
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

    return (this as any).props.children;
  }
}
