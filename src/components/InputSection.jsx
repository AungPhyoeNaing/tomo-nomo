import React from 'react';
import { motion } from 'framer-motion';

function InputSection({ 
  p1Name, setP1Name, p1Dob, setP1Dob, 
  p2Name, setP2Name, p2Dob, setP2Dob, 
  relType, setRelType, mood, setMood,
  apiKey, setApiKey, loading, inputError, onCalculate, onDemo
}) {
  
  const handlePreset = () => {
    setP1Name('သူရိန်');
    setP1Dob('1996-06-15');
    setP2Name('သီရိ');
    setP2Dob('1996-10-08');
  };

  const handleReset = () => {
    setP1Name('');
    setP1Dob('');
    setP2Name('');
    setP2Dob('');
  };

  const todayISO = new Date().toISOString().split('T')[0];

  return (
    <section id="page-inputs" className="page-section">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, staggerChildren: 0.2 }}
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-4xl mx-auto w-full space-y-5"
      >
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-red-600 dark:text-red-400 font-['Fredoka']">
            Person 1 & Person 2 Soul Details
          </h2>
          <p className="text-xs sm:text-sm text-red-500 dark:text-red-300 font-bold">
            နာမည်နှင့် မွေးနေ့လေး ဖြည့်သွင်းပြီး Tomo ၏ စစ်ဆေးချက်ကို ရယူပါ
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-red-500 font-bold">Quick Presets:</span>
          <button type="button" onClick={handlePreset} className="tomo-chip-3d px-3.5 py-1 rounded-full text-red-700 dark:text-red-300 text-xs font-bold transition-all cursor-pointer">
            သူရိန် & သီရိ
          </button>
          <button type="button" onClick={handleReset} className="tomo-chip-3d px-3.5 py-1 rounded-full text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer">
            ↺ Reset Form
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-5 w-full">
          {/* Person 1 Input Card */}
          <div className="tomo-card rounded-[32px] p-5 sm:p-6 flex flex-col gap-3.5 shadow-xl relative overflow-hidden text-left">
            <div className="flex items-center gap-3">
              <img src="/icon_3d_p1.jpg" alt="Person 1 3D" className="w-12 h-12 rounded-2xl object-cover border-2 border-red-300 shadow-md" />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 font-['Fredoka']">ပထမ လူသားလေး (First Soul)</h3>
                <p className="text-[11px] text-red-400 font-medium">နာမည်နဲ့ မွေးနေ့လေး ဖြည့်ပေးပါ</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-red-700 dark:text-red-300 mb-1">Name (အမည်)</label>
                <input 
                  type="text" 
                  value={p1Name} 
                  onChange={e => setP1Name(e.target.value)} 
                  placeholder="e.g. သူရိန်" 
                  className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-2 border-red-200/80 dark:border-slate-700/80 focus:border-red-400 focus:ring-4 focus:ring-red-100 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-white focus:outline-none shadow-sm transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-red-700 dark:text-red-300 mb-1">Birthdate (မွေးနေ့)</label>
                <input 
                  type="date" 
                  value={p1Dob} 
                  max={todayISO} 
                  onChange={e => setP1Dob(e.target.value)} 
                  className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-2 border-red-200/80 dark:border-slate-700/80 focus:border-red-400 focus:ring-4 focus:ring-red-100 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-white focus:outline-none shadow-sm transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Person 2 Input Card */}
          <div className="tomo-card rounded-[32px] p-5 sm:p-6 flex flex-col gap-3.5 shadow-xl relative overflow-hidden text-left">
            <div className="flex items-center gap-3">
              <img src="/icon_3d_p2.jpg" alt="Person 2 3D" className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-300 shadow-md" />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400 font-['Fredoka']">ဒုတိယ လူသားလေး (Second Soul)</h3>
                <p className="text-[11px] text-orange-400 font-medium">နာမည်နဲ့ မွေးနေ့လေး ဖြည့်ပေးပါ</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-orange-700 dark:text-orange-300 mb-1">Name (အမည်)</label>
                <input 
                  type="text" 
                  value={p2Name} 
                  onChange={e => setP2Name(e.target.value)} 
                  placeholder="e.g. သီရိ" 
                  className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-2 border-orange-200/80 dark:border-slate-700/80 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-white focus:outline-none shadow-sm transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-orange-700 dark:text-orange-300 mb-1">Birthdate (မွေးနေ့)</label>
                <input 
                  type="date" 
                  value={p2Dob} 
                  max={todayISO} 
                  onChange={e => setP2Dob(e.target.value)} 
                  className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-2 border-orange-200/80 dark:border-slate-700/80 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-white focus:outline-none shadow-sm transition-all" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tone & Relationship Selector Bar in Form */}
        <div className="tomo-card rounded-[28px] p-4 max-w-xl mx-auto w-full space-y-3 shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="w-full sm:w-1/2">
              <label className="block text-[11px] font-black text-red-700 dark:text-red-300 uppercase tracking-wider mb-1">
                Relationship Mode
              </label>
              <div className="grid grid-cols-2 p-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-red-200/80 dark:border-slate-700/80 gap-1 text-center">
                <button 
                  type="button" 
                  onClick={() => setRelType && setRelType('Friends')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${relType === 'Friends' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm border border-red-200' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Friends
                </button>
                <button 
                  type="button" 
                  onClick={() => setRelType && setRelType('Couple')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${relType === 'Couple' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm border border-red-200' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Couple
                </button>
              </div>
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block text-[11px] font-black text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-1">
                Tomo's Mood Tone
              </label>
              <div className="grid grid-cols-3 p-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-rose-200/80 dark:border-slate-700/80 gap-1 text-center">
                {[
                  { val: 'Sweet', text: 'Sweet', dot: 'bg-rose-400' },
                  { val: 'Playful', text: 'Playful', dot: 'bg-amber-400' },
                  { val: 'Mystic', text: 'Mystic', dot: 'bg-purple-400' }
                ].map(item => (
                  <button 
                    key={item.val}
                    type="button" 
                    onClick={() => setMood && setMood(item.val)}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${mood === item.val ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm border border-rose-200' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`}></span>
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-1">
          {inputError && (
            <p role="alert" className="basis-full text-center text-xs font-bold text-red-600 dark:text-red-300">{inputError}</p>
          )}
          <motion.button type="button" disabled={loading} whileHover={{ scale: loading ? 1 : 1.03 }} whileTap={{ scale: loading ? 1 : 0.97 }} onClick={onCalculate} className="tomo-button-3d-primary w-full sm:w-auto px-8 py-4 text-white font-extrabold rounded-2xl text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer font-['Fredoka'] shadow-lg disabled:cursor-wait disabled:opacity-60">
            <img src="/icon_3d_heart.jpg" alt="Heart" className="w-5 h-5 rounded-full object-cover shadow-sm" />
            <span>Tomo ရဲ့ ဖတ်ရှုချက် ရယူမည် ➔</span>
          </motion.button>

          <motion.button type="button" disabled={loading} whileHover={{ scale: loading ? 1 : 1.03 }} whileTap={{ scale: loading ? 1 : 0.97 }} onClick={onDemo} className="tomo-button-3d-secondary w-full sm:w-auto px-6 py-4 text-red-600 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:cursor-wait disabled:opacity-60">
            <img src="/icon_3d_p1.jpg" alt="Demo" className="w-4 h-4 rounded-full object-cover" />
            <span>Tomo တွက်ချက်မှု နမူနာ</span>
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}

export default InputSection;
