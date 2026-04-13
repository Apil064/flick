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
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  const isValidKey = CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_') || CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_');

  if (!CLERK_PUBLISHABLE_KEY || !isValidKey) {
    return (
      <div className="min-h-screen bg-bg-primary text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-accent-red mb-4 italic">FLICK</h1>
        <h2 className="text-xl font-bold mb-2">Authentication Config Error</h2>
        <p className="text-text-secondary max-w-md mb-8">
          {!CLERK_PUBLISHABLE_KEY 
            ? "Missing VITE_CLERK_PUBLISHABLE_KEY in environment variables."
            : "The provided VITE_CLERK_PUBLISHABLE_KEY appears to be invalid. It should start with 'pk_test_' or 'pk_live_'."}
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all"
          >
            Retry
          </button>
          <a 
            href="https://dashboard.clerk.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-8 py-3 bg-bg-secondary text-white font-bold rounded-full border border-white/10 hover:bg-white/5 transition-all"
          >
            Clerk Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider 
        publishableKey={CLERK_PUBLISHABLE_KEY}
        afterSignOutUrl="/"
      >
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="min-h-screen bg-bg-primary text-white selection:bg-accent-red selection:text-white">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/tv" element={<TVShows />} />
                  <Route path="/new" element={<NewAndPopular />} />
                  <Route path="/watchlist" element={<Watchlist />} />
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
      </ClerkProvider>
    </ErrorBoundary>
  );
}

export default App;
