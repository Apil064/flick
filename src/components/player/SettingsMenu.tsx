import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Globe, Subtitles, Settings as SettingsIcon } from 'lucide-react';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  sources: { label: string; url: string; type: 'iframe' | 'video' }[];
  activeSourceIndex: number;
  onSourceChange: (index: number) => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  isOpen,
  onClose,
  sources,
  activeSourceIndex,
  onSourceChange
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[220]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute bottom-24 right-8 w-72 bg-bg-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[230] overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
              <SettingsIcon className="w-4 h-4 text-accent-red" />
              <span className="text-xs font-black uppercase tracking-widest">Playback Settings</span>
            </div>

            <div className="p-4 space-y-6">
              {/* Server Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                  <Globe className="w-3 h-3" />
                  Server Source
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {sources.map((source, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSourceChange(index);
                        onClose();
                      }}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all text-xs font-bold ${
                        activeSourceIndex === index 
                          ? 'bg-accent-red text-white' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {source.label}
                      {activeSourceIndex === index && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitles Placeholder */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                  <Subtitles className="w-3 h-3" />
                  Subtitles
                </div>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 text-white/40 text-xs font-bold cursor-not-allowed">
                  Off (Default)
                  <Check className="w-4 h-4 opacity-40" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
