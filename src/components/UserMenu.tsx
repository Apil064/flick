import React from 'react';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Settings, LogOut, Bookmark, History } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserMenu: React.FC = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 hover:border-accent-red transition-colors"
      >
        <img src={user.imageUrl} alt={user.fullName || ''} className="w-full h-full object-cover" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-4 w-72 bg-bg-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[120] overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-4">
                  <img src={user.imageUrl} alt="" className="w-12 h-12 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{user.fullName}</p>
                    <p className="text-[10px] text-text-secondary truncate uppercase tracking-widest">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <Link
                  to="/watchlist"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  <Bookmark className="w-4 h-4 text-accent-red" />
                  My Watchlist
                </Link>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  <History className="w-4 h-4 text-accent-red" />
                  Watch History
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  <Settings className="w-4 h-4 text-text-secondary" />
                  Settings
                </button>
              </div>

              <div className="p-2 border-t border-white/5">
                <SignOutButton>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors text-sm font-bold">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
