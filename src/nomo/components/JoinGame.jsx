import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import socket from '../socket';
import NomoHeroSection from './HeroSection';

const generateFriendlyRoomId = () => {
  const prefixes = ['NOMO', 'SOUL', 'DESTINY', 'BOND', 'STAR'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${num}`;
};

const JoinGame = () => {
  const [searchParams] = useSearchParams();
  const roomParam = searchParams.get('room') || '';

  const [mode, setMode] = useState(roomParam ? 'join' : 'create');
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState(roomParam || generateFriendlyRoomId());
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (roomParam) {
      setRoomId(roomParam.toUpperCase());
      setMode('join');
    }
  }, [roomParam]);

  const handleRandomize = () => {
    setRoomId(generateFriendlyRoomId());
  };

  const handleScrollToForm = () => {
    const el = document.getElementById('nomo-room-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartOrJoin = (e) => {
    e.preventDefault();
    setError('');

    const cleanName = username.trim();
    const cleanRoom = roomId.trim().toUpperCase();

    if (!cleanName) {
      setError('ကျေးဇူးပြု၍ သင့်နာမည်လေး အရင်ရိုက်ထည့်ပါ (Please enter your name)');
      return;
    }

    if (!cleanRoom) {
      setError('ကျေးဇူးပြု၍ Room ID ထည့်ပါ (Please enter a Room ID)');
      return;
    }

    socket.connect();
    socket.emit('join_room', { username: cleanName, roomId: cleanRoom });
    navigate(`/nomo/game/${cleanRoom}`, { state: { username: cleanName } });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Grand Hero Section Matching Tomo */}
      <NomoHeroSection onScrollToForm={handleScrollToForm} />

      {/* Main Room Selection & Creation Form Card */}
      <motion.div 
        id="nomo-room-form"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true, margin: "-40px" }}
        className="nomo-card rounded-[36px] p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left"
      >
        <div className="flex items-center gap-3 border-b border-sky-100 dark:border-slate-800 pb-4 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 to-cyan-400 flex items-center justify-center text-white shadow-md">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-sky-600 dark:text-sky-400 font-['Fredoka']">
              Game Lobby & Room Setup
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              Room တစ်ခု ဖန်တီးပြီး သူငယ်ချင်းကို Link ပို့ကာ အပြိုင်ကစားပါ
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-sky-50 dark:bg-slate-800/90 rounded-2xl border-2 border-sky-200/80 dark:border-slate-700 gap-1.5 mb-6">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button" 
            onClick={() => { setMode('create'); setError(''); }}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              mode === 'create' 
                ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md border-t border-white/50' 
                : 'text-slate-600 dark:text-slate-400 hover:text-sky-600'
            }`}
          >
            Create Room 
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button" 
            onClick={() => { setMode('join'); setError(''); }}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              mode === 'join' 
                ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md border-t border-white/50' 
                : 'text-slate-600 dark:text-slate-400 hover:text-sky-600'
            }`}
          >
            Join Room 
          </motion.button>
        </div>

        <form onSubmit={handleStartOrJoin} className="space-y-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-2xl text-xs font-bold text-center"
            >
              ⚠️ {error}
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-sky-900 dark:text-sky-200 mb-1.5 uppercase tracking-wider">
              Your Name (သင့်နာမည်)
            </label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Alex / ဇင်မင်း"
              className="w-full bg-slate-50 dark:bg-slate-800/90 border-2 border-sky-200 dark:border-slate-700 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none shadow-inner transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-extrabold text-sky-900 dark:text-sky-200 uppercase tracking-wider">
                {mode === 'create' ? 'Generated Room ID' : 'Enter Room ID'}
              </label>
              {mode === 'create' && (
                <button 
                  type="button" 
                  onClick={handleRandomize}
                  className="text-xs font-black text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Generate New ID</span>
                </button>
              )}
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={roomId} 
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                readOnly={mode === 'create'}
                placeholder="e.g. BOND-101"
                className={`w-full border-2 focus:ring-4 focus:ring-sky-100 rounded-2xl px-4 py-3 text-sm font-black tracking-widest uppercase focus:outline-none shadow-inner transition-all ${
                  mode === 'create' 
                    ? 'bg-sky-100/50 dark:bg-slate-800/50 border-sky-300/80 dark:border-slate-600 text-sky-800 dark:text-sky-300 cursor-not-allowed'
                    : 'bg-slate-50 dark:bg-slate-800/90 border-sky-200 dark:border-slate-700 text-slate-800 dark:text-white focus:border-sky-400'
                }`}
              />
            </div>
            {mode === 'create' && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                room ကိုဖွင့်ပြီးရင် သူငယ်ချင်းကို Room Code ပေးလိုက်ပါ
              </p>
            )}
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="nomo-button-3d-primary w-full py-4 text-white font-extrabold rounded-2xl text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer font-['Fredoka'] shadow-xl mt-4"
          >
            <span>{mode === 'create' ? 'Create Room & Pick Questions ➔' : 'Join Room & Start Quiz ➔'}</span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default JoinGame;