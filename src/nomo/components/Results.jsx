import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const Results = ({ players, selections, myUsername }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('p1'); // 'p1' | 'p2'
  const [animatedScore, setAnimatedScore] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!players || !Array.isArray(players) || players.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-extrabold text-slate-400">Loading Results...</h2>
      </div>
    );
  }

  const p1 = players[0] || { username: 'Player 1', score: 0, answers: [] };
  const p2 = players[1] || { username: 'Player 2', score: 0, answers: [] };

  const totalScore = (p1.score || 0) + (p2.score || 0);
  const resonanceScore = Math.min(100, Math.max(0, Math.round((totalScore / 20) * 100)));

  const maxScore = Math.max(p1.score || 0, p2.score || 0);
  const isDraw = (p1.score || 0) === (p2.score || 0);

  // Animate compatibility score
  useEffect(() => {
    const startTime = performance.now();
    const duration = 900;
    let animId = 0;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(easeProgress * resonanceScore));

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [resonanceScore]);

  // Confetti effect with cool ice blue tones
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    let frameId = 0;
    let isCancelled = false;
    const end = Date.now() + 2500;
    const colors = ['#38bdf8', '#0ea5e9', '#06b6d4', '#60a5fa', '#bae6fd'];

    function frame() {
      if (isCancelled) return;
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        frameId = requestAnimationFrame(frame);
      }
    }

    frame();
    return () => {
      isCancelled = true;
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  const getChemistryData = () => {
    if (resonanceScore >= 85) {
      return {
        title: "Twin Souls (အသည်းချင်း တထပ်တည်း)",
        roast: "တစ်ယောက်အကြောင်း တစ်ယောက် အကုန်သိနေကြတယ်! မာလာရှမ်းကော အဝ သွားစားဖို့ပဲ လိုတော့တယ်!",
        badge: "100% Perfect Sync"
      };
    }
    if (resonanceScore >= 65) {
      return {
        title: "True Besties (သဲသဲလှုပ် အချစ်ဆုံးသူငယ်ချင်းများ)",
        roast: "အချင်းချင်း လျှို့ဝှက်ချက်တွေ အတော်များများ သိနေကြပြီ! မုန့်လိုက်ကျွေးဖို့ အဆင်သင့်ပြင်ထား!",
        badge: "High Chemistry"
      };
    }
    if (resonanceScore >= 45) {
      return {
        title: "Gossip Buddies (အတင်းတူတူပြောတဲ့ အတွဲ)",
        roast: "အတင်းပဲ အတူတူပြောပြီး အချင်းချင်းကျ သိပ်မသိကြသေးဘူးနော်! ညှိယူစရာလေးတွေ ရှိသေးတယ်!",
        badge: "Fun Duo"
      };
    }
    if (resonanceScore >= 25) {
      return {
        title: "Casual Buddies (မျက်မှန်းတန်းမိရုံ)",
        roast: "စကားတွေ အများကြီး ထပ်ပြောဖို့ လိုသေးတယ်! မုန့်ခဏခဏ အတူတူ သွားစားကြဦး!",
        badge: "Developing Chemistry"
      };
    }
    return {
      title: "Total Strangers (သူစိမ်းနှစ်ယောက်)",
      roast: "တစ်ယောက်အကြောင်း တစ်ယောက် ဘာမှန်းမသိဘဲ ခန့်မှန်းသွားတာလား! နောက်တစ်ခေါက် ချက်ချင်း ပြန်ဆော့ကြ!",
      badge: "Chaos Level"
    };
  };

  const chemData = getChemistryData();

  const handleCopySummary = () => {
    const summaryText = `Nomo Friendship Chemistry Match\n${p1.username} (${p1.score}/10) vs ${p2.username} (${p2.score}/10)\nSync Rate: ${resonanceScore}%\n${chemData.title}\n"${chemData.roast}"`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const circumference = 283;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Build Answer Comparison Lists
  const buildBreakdown = (guesser, truthOwner) => {
    const truthList = (selections && truthOwner && selections[truthOwner.username]) || [];
    const guessList = (guesser && Array.isArray(guesser.answers)) ? guesser.answers : [];

    return truthList.map((truthQ) => {
      const matchedGuess = guessList.find(g => g && (String(g.questionId) === String(truthQ.id) || g.questionId === truthQ.id));
      const isCorrect = !!(matchedGuess && matchedGuess.selectedOption === truthQ.answer);

      return {
        id: truthQ.id,
        text: truthQ.text,
        truth: truthQ.answer,
        guess: matchedGuess ? matchedGuess.selectedOption : 'No answer',
        isCorrect
      };
    });
  };

  const p1GuessesOnP2 = buildBreakdown(p1, p2);
  const p2GuessesOnP1 = buildBreakdown(p2, p1);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-center pb-12">
      {/* Soul Resonance Gauge Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="nomo-card-ice rounded-[36px] p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center gap-4"
      >
        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-sky-900 dark:text-sky-200 bg-sky-100 dark:bg-sky-900/60 border border-sky-300 dark:border-sky-700 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Friendship Chemistry Results</span>
        </div>

        {/* Circular Gauge with Lively Glow */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center my-1">
          <svg className="w-full h-full transform -rotate-90 filter drop-shadow-md" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="nomoScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <circle 
              cx="50" cy="50" r="45" 
              stroke="currentColor" 
              strokeWidth="9" 
              className="text-sky-100 dark:text-slate-800" 
              fill="transparent" 
            />
            <circle 
              cx="50" cy="50" r="45" 
              stroke="url(#nomoScoreGradient)" 
              strokeWidth="9" 
              className="transition-all duration-300 ease-out" 
              strokeDasharray="283" 
              strokeDashoffset={offset} 
              strokeLinecap="round" 
              fill="transparent" 
            />
          </svg>
          
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-black text-sky-600 dark:text-sky-400 font-['Fredoka'] tracking-tight">
              {animatedScore}%
            </span>
            <span className="text-[11px] text-sky-800 dark:text-sky-300 font-extrabold uppercase tracking-wider">
              {chemData.badge}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-w-lg">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-sky-100 font-['Fredoka'] leading-tight">
            {chemData.title}
          </h2>
          
          <p className="text-xs sm:text-sm text-sky-800 dark:text-sky-200 font-semibold bg-sky-50 dark:bg-sky-950/60 p-3 rounded-2xl border border-sky-200 dark:border-sky-800">
            "{chemData.roast}"
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold pt-1">
            Combined Score: <strong className="text-sky-600 dark:text-sky-400">{totalScore} / 20 Truths Guessed Correctly</strong>
          </p>
        </div>
      </motion.div>

      {/* Dual Player Scores Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[p1, p2].map((p, i) => {
          const isWinner = (p.score || 0) === maxScore && !isDraw;

          return (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`relative nomo-card rounded-[32px] p-5 sm:p-6 shadow-xl flex flex-col items-center gap-3 transition-all ${
                isWinner ? 'ring-2 ring-sky-400 border-sky-300 bg-sky-50/50 dark:bg-slate-800' : ''
              }`}
            >
              {isWinner && (
                <span className="absolute -top-3.5 bg-gradient-to-r from-sky-400 to-cyan-500 text-white text-[11px] font-black px-3.5 py-1 rounded-full shadow-md uppercase tracking-wider animate-pulse">
                  🏆 Top Score
                </span>
              )}
              {isDraw && (
                <span className="absolute -top-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-[11px] font-black px-3.5 py-1 rounded-full shadow-md uppercase tracking-wider">
                  🤝 Tie Match
                </span>
              )}

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-200 via-cyan-100 to-sky-300 dark:from-slate-700 dark:to-sky-900 text-sky-700 dark:text-sky-300 font-black text-2xl flex items-center justify-center shadow-inner mt-1 uppercase border border-white/60">
                {p.username.charAt(0) || String(i + 1)}
              </div>

              <div className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 truncate max-w-[140px]">
                {p.username}
              </div>

              <div className="text-3xl sm:text-4xl font-black text-sky-600 dark:text-sky-400 font-['Fredoka']">
                {p.score || 0} <span className="text-xs font-bold text-slate-400">/ 10</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Answer Comparison Breakdown Tabs */}
      <div className="nomo-card rounded-[36px] p-5 sm:p-7 shadow-xl text-left space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-sky-100 dark:border-slate-700 pb-4">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-slate-100 font-['Fredoka']">
              Truth vs Guess Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ဘယ်မေးခွန်းတွေကို မှန်အောင် ခန့်မှန်းနိုင်ခဲ့ကြလဲ ကြည့်မယ်
            </p>
          </div>

          <div className="flex p-1 bg-sky-50 dark:bg-slate-800 rounded-2xl gap-1.5 text-xs font-black border border-sky-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('p1')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'p1'
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-sky-600'
              }`}
            >
              {p1.username}'s Guesses
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('p2')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'p2'
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-sky-600'
              }`}
            >
              {p2.username}'s Guesses
            </button>
          </div>
        </div>

        {/* Question Review List */}
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {((activeTab === 'p2') ? p2GuessesOnP1 : p1GuessesOnP2).map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`p-4 rounded-2xl border-2 transition-all text-xs sm:text-sm shadow-sm backdrop-blur-md ${
                item.isCorrect 
                  ? 'bg-cyan-50/70 dark:bg-cyan-950/30 border-cyan-300/80 dark:border-cyan-800' 
                  : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                  {idx + 1}. {item.text}
                </span>
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0 shadow-sm ${
                  item.isCorrect ? 'bg-cyan-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {item.isCorrect ? '✓ Match' : '✗ Missed'}
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">
                  Guessed: <strong className={item.isCorrect ? 'text-cyan-700 dark:text-cyan-300 font-extrabold' : 'text-rose-600 dark:text-rose-400 font-extrabold'}>{item.guess}</strong>
                </span>
                {!item.isCorrect && (
                  <span className="text-slate-600 dark:text-slate-300">
                    Real Truth: <strong className="text-cyan-700 dark:text-cyan-300 font-extrabold">{item.truth}</strong>
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button 
          type="button" 
          onClick={handleCopySummary}
          className="flex-1 nomo-button-3d-secondary py-4 px-6 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
        >
          {copied ? '✓ Summary Copied!' : 'Copy Match Summary'}
        </button>

        <button 
          type="button"
          onClick={() => navigate('/nomo')}
          className="flex-1 nomo-button-3d-primary py-4 px-6 rounded-2xl text-white font-black text-xs sm:text-sm tracking-wide uppercase transition-all shadow-md cursor-pointer"
        >
          Play Another Round ➔
        </button>
      </div>

      {/* Link to Tomo Destiny Matcher */}
      <div className="pt-2">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-extrabold text-sky-600 dark:text-sky-400 hover:underline"
        >
          <span>Try Tomo Destiny Matcher ➔</span>
        </Link>
      </div>
    </div>
  );
};

export default Results;