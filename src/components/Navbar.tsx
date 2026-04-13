import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { motion } from 'motion/react';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
      <div className="flex items-center gap-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-black tracking-tighter text-white flex items-center gap-2"
        >
          <span className="bg-red-600 px-2 rounded-lg italic">F</span>
          LICK
        </motion.div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <a href="#" className="text-white hover:text-white transition-colors">Home</a>
          <a href="#" className="hover:text-white transition-colors">Movies</a>
          <a href="#" className="hover:text-white transition-colors">TV Shows</a>
          <a href="#" className="hover:text-white transition-colors">New & Popular</a>
          <a href="#" className="hover:text-white transition-colors">My List</a>
        </div>
      </div>

      <div className="flex items-center gap-6 text-white">
        <button className="hover:text-red-500 transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="hover:text-red-500 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden cursor-pointer hover:border-red-500 transition-all">
          <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" referrerPolicy="no-referrer" />
        </div>
        <button className="md:hidden">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}
