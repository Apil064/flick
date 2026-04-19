import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { TVShows } from './pages/TVShows';
import { NewAndPopular } from './pages/NewAndPopular';
import { Watchlist } from './pages/Watchlist';
import { WatchHistory } from './pages/WatchHistory';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      throwOnError: false,
    },
  },
});

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  const isValidKey = CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_') || CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_');
  const showAuthError = CLERK_PUBLISHABLE_KEY && !isValidKey;

  // If key is missing, we continue in "Guest Mode"
  // If key is invalid, we show a warning but still allow the app to render if possible
  
  const content = (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-bg-primary text-white selection:bg-accent-red selection:text-white">
          {showAuthError && (
            <div className="bg-accent-red/20 border-b border-accent-red/50 p-2 text-center text-[10px] font-bold uppercase tracking-widest text-white z-[300] relative">
              Authentication Configuration Error: Invalid Clerk Key
            </div>
          )}
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/tv" element={<TVShows />} />
              <Route path="/new" element={<NewAndPopular />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/history" element={<WatchHistory />} />
            </Routes>
          </main>
          
          {/* Footer */}
          <footer className="py-20 px-6 md:px-16 border-t border-white/5 bg-bg-primary">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
              <div className="space-y-4">
                <h3 className="text-2xl font-black tracking-tighter text-accent-red italic">FLICK</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  The ultimate streaming experience. Watch thousands of movies and TV shows anytime, anywhere.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest">Platform</h4>
                <ul className="space-y-2 text-xs text-text-secondary">
                  <li><a href="#" className="hover:text-white transition-colors">Browse Movies</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">TV Shows</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">New Releases</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest">Support</h4>
                <ul className="space-y-2 text-xs text-text-secondary">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest">Connect</h4>
                <ul className="space-y-2 text-xs text-text-secondary">
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                © 2024 FLICK STREAMING. ALL RIGHTS RESERVED.
              </p>
              <div className="flex gap-6 text-[10px] text-text-muted uppercase tracking-widest font-bold">
                <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
                <a href="#" className="hover:text-white transition-colors">Corporate Information</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );

  return (
    <ErrorBoundary>
      {CLERK_PUBLISHABLE_KEY && isValidKey ? (
        <ClerkProvider 
          publishableKey={CLERK_PUBLISHABLE_KEY}
          afterSignOutUrl="/"
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: '#e50914',
              colorBackground: '#0a0a0a',
              colorText: 'white',
              colorTextSecondary: '#a3a3a3',
              colorInputBackground: '#171717',
              colorInputText: 'white',
              borderRadius: '1rem',
            },
            elements: {
              card: 'bg-bg-primary border border-white/10 shadow-2xl',
              headerTitle: 'text-2xl font-black tracking-tighter uppercase italic text-white',
              headerSubtitle: 'text-text-secondary',
              socialButtonsBlockButton: 'bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white',
              socialButtonsBlockButtonText: 'font-bold text-white',
              formButtonPrimary: 'bg-accent-red hover:bg-red-700 transition-all font-bold uppercase tracking-widest text-xs py-3 text-white',
              footerActionLink: 'text-accent-red hover:text-red-400 font-bold',
              identityPreviewText: 'text-white font-medium',
              identityPreviewEditButtonIcon: 'text-accent-red',
              formLabel: 'text-white font-bold uppercase tracking-widest text-[10px] mb-2',
              formFieldInput: 'bg-bg-secondary border-white/10 text-white focus:border-accent-red transition-all',
              footerActionText: 'text-text-secondary',
              dividerText: 'text-text-muted uppercase text-[10px] font-black',
              dividerLine: 'bg-white/10',
              formFieldSuccessText: 'text-green-500',
              formFieldErrorText: 'text-accent-red',
            }
          }}
        >
          {content}
        </ClerkProvider>
      ) : (
        content
      )}
    </ErrorBoundary>
  );
}

export default App;
