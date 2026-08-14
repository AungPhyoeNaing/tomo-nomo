import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ApiKeyModal({ isOpen, onClose, apiKey, onSaveKey }) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTempKey(apiKey || '');
  }, [apiKey, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setTempKey(text.trim());
    } catch (err) {
      console.error("Clipboard paste error:", err);
    }
  };

  const handleSave = () => {
    onSaveKey(tempKey.trim());
    onClose();
  };

  const handleClear = () => {
    setTempKey('');
    onSaveKey('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Frosted Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-red-950/40 dark:bg-black/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
            className="relative w-full max-w-md tomo-card rounded-[32px] p-6 sm:p-7 shadow-2xl border-2 border-red-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 text-left space-y-5 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-red-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-md">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-red-600 dark:text-red-400 font-['Fredoka']">
                    Tomo Gemini API Key
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                    Configure Google Gemini 3.1 Flash Lite
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-slate-700 text-slate-500 hover:text-red-600 flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Input Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="modalApiKeyInput" className="text-xs font-black text-red-700 dark:text-red-300 uppercase tracking-wider">
                  API Key
                </label>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={handlePaste}
                    className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Paste</span>
                  </button>
                  {tempKey && (
                    <button 
                      type="button" 
                      onClick={handleClear}
                      className="text-[11px] font-bold text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="relative flex items-center">
                <input 
                  type={showKey ? 'text' : 'password'}
                  id="modalApiKeyInput"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border-2 border-red-200 dark:border-slate-700 focus:border-red-400 focus:ring-4 focus:ring-red-100 rounded-2xl pl-4 pr-11 py-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none shadow-inner transition-all font-mono"
                />
                <button 
                  type="button" 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3.5 text-slate-400 hover:text-red-600 text-sm cursor-pointer p-1"
                  title={showKey ? "Hide API Key" : "Show API Key"}
                >
                  {showKey ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Status & Helper Info */}
            <div className="bg-red-50/70 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-red-100 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">API Key Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 ${
                  tempKey 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${tempKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  <span>{tempKey ? 'Active & Ready' : 'Procedural Mode'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                API Key ထည့်သွင်းပါက Google Gemini AI ဖြင့် ပိုမိုနက်ရှိုင်းဆန်းကြယ်စွာ တွက်ချက်ပေးမည် ဖြစ်ပါသည်။ Key မရှိပါကလည်း Deep Procedural Engine ဖြင့် အပြည့်အဝ အသုံးပြုနိုင်ပါသည်။
              </p>
              <div className="pt-1">
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <span>Get a free Gemini API Key from Google AI Studio</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSave}
                className="tomo-button-3d-primary px-6 py-2.5 rounded-2xl text-white text-xs font-black shadow-md cursor-pointer hover:scale-105 transition-all"
              >
                Save & Apply Key
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ApiKeyModal;
