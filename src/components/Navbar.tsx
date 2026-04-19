import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bookmark, Menu, X, Bell } from 'lucide-react';
import { UserButton, useUser, SignInButton } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchPage } from '../pages/SearchPage';
import { UserMenu } from './UserMenu';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      if (isMobileMenuOpen && window.scrollY > 100) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'TV Shows', path: '/tv' },
    { name: 'New & Popular', path: '/new' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-4 sm:px-8 md:px-16 h-20 flex items-center justify-between ${
          isScrolled ? 'bg-bg-primary/95 backdrop-blur-md shadow-2xl' : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
      >
        <div className="flex items-center gap-4 sm:gap-10">
          <Link to="/" className="text-2xl sm:text-3xl font-black tracking-tighter text-accent-red italic">
            FLICK
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-accent-red ${
                  location.pathname === link.path ? 'text-white' : 'text-text-secondary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link
            to="/watchlist"
            className="hidden md:flex items-center gap-2 p-2 hover:bg-white/10 rounded-full transition-colors text-text-secondary hover:text-white"
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-xs font-medium">Watchlist</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {isSignedIn ? (
              <UserMenu />
            ) : (
              <SignInButton mode="modal">
                <button className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}

            <button
              className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-bg-primary pt-24 px-6 flex flex-col lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xl font-bold py-4 border-b border-white/5 active:bg-white/5 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/watchlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl font-bold py-4 border-b border-white/5 flex items-center gap-3 active:bg-white/5 transition-colors"
              >
                <Bookmark className="w-6 h-6 text-accent-red" />
                Watchlist
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && <SearchPage onClose={() => setIsSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
};
