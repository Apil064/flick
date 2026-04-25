import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Camera, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  React.useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-red" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Shield className="w-16 h-16 text-accent-red mb-4" />
        <h1 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Access Denied</h1>
        <p className="text-text-secondary mb-6">Please sign in to view your profile.</p>
        <Link to="/" className="px-8 py-3 bg-white text-black font-black rounded-full hover:bg-zinc-200 transition-all uppercase tracking-widest text-xs">
          Go Home
        </Link>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      await user.update({
        firstName,
        lastName,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 md:px-16 overflow-hidden relative">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-red/5 blur-[150px] -z-10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-red/5 blur-[150px] -z-10 rounded-full" />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <Link to="/" className="p-2 hover:bg-white/5 rounded-full transition-colors group">
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform text-white/50 group-hover:text-white" />
          </Link>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
            Your <span className="text-accent-red">Profile</span>
          </h1>
        </div>

        <div className="grid md:grid-cols-[1fr,2fr] gap-12">
          {/* Left Column: Avatar & Quick Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="relative group mx-auto md:mx-0 w-48 h-48">
              <div className="absolute inset-0 bg-accent-red/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              <img 
                src={user.imageUrl} 
                alt={user.fullName || ''} 
                className="w-full h-full rounded-3xl object-cover border-4 border-white/5 group-hover:border-accent-red transition-all duration-500 shadow-2xl relative z-10" 
              />
              <button className="absolute bottom-2 right-2 p-3 bg-accent-red text-white rounded-2xl shadow-xl z-20 hover:scale-110 transition-transform md:opacity-0 md:group-hover:opacity-100">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 pt-4">
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                 <div className="flex items-center gap-4 mb-4">
                    <Shield className="w-5 h-5 text-accent-red" />
                    <span className="text-xs font-black uppercase tracking-widest text-text-secondary">Account Status</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-bold text-white uppercase tracking-tight">Active Plan: Premium</span>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Details & Edit */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="p-8 md:p-10 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl shadow-2xl relative overflow-hidden">
               {/* Shine effect */}
               <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/5 to-transparent rotate-12 pointer-events-none" />

              <div className="flex justify-between items-start mb-10 relative z-10">
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-1">General Info</h2>
                  <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">Keep your details up to date</p>
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {message && (
                <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-widest ${
                  message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-accent-red/10 text-accent-red border border-accent-red/20'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">First Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      <input
                        type="text"
                        value={isEditing ? firstName : user.firstName || ''}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-accent-red focus:outline-none disabled:opacity-50 transition-all placeholder:text-white/20"
                        placeholder="First Name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      <input
                        type="text"
                        value={isEditing ? lastName : user.lastName || ''}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-accent-red focus:outline-none disabled:opacity-50 transition-all placeholder:text-white/20"
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="email"
                      value={user.primaryEmailAddress?.emailAddress || ''}
                      disabled={true}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold opacity-50 cursor-not-allowed transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-accent-red/20 text-accent-red text-[8px] font-black uppercase rounded tracking-widest">
                      Primary
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFirstName(user.firstName || '');
                        setLastName(user.lastName || '');
                        setMessage(null);
                      }}
                      className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
            
            <div className="flex justify-center flex-col items-center gap-2 pt-4">
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em]">Member since {new Date(user.createdAt!).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
