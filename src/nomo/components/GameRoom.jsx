import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import socket from '../socket';
import QuestionSelection from './QuestionSelection';
import Quiz from './Quiz';
import Results from './Results';
import { BURMESE_QUESTIONS } from '../questions';

const STAGES = [
  { id: 'waiting', label: '1. Lobby' },
  { id: 'selecting', label: '2. Pick Truths' },
  { id: 'playing', label: '3. Guess Quiz' },
  { id: 'results', label: '4. Results' }
];

const GameRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState(location.state?.username || '');
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState('waiting'); 
  const [questionsPool, setQuestionsPool] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!username) {
      navigate(roomId ? `/nomo?room=${roomId}` : '/nomo');
      return;
    }

    if (!socket.connected) {
      socket.connect();
      socket.emit('join_room', { username, roomId });
    }
    
    socket.on('error', (msg) => {
      alert(msg);
      navigate(roomId ? `/nomo?room=${roomId}` : '/nomo');
    });

    socket.on('room_data', (data) => {
      setPlayers(data?.players || []);
      setGameState(data?.gameState || 'waiting');
    });

    socket.on('game_start_selection', (data) => {
      const rawQuestions = data?.questions && data.questions.length ? data.questions : BURMESE_QUESTIONS.slice(0, 60);
      const burmeseQuestions = rawQuestions.map(q => {
        const bq = BURMESE_QUESTIONS.find(b => String(b.id) === String(q.id) || b.id === q.id);
        return bq ? { ...bq, ...q } : q;
      });
      setQuestionsPool(burmeseQuestions);
      setGameState('selecting');
    });

    socket.on('waiting_for_opponent', () => {
      setGameState('waiting_others');
    });

    socket.on('start_quiz', (data) => {
      if (!data) return;
      const updatedQuizData = {
        ...data,
        questionsToAnswer: (data.questionsToAnswer || []).map(q => {
          const bq = BURMESE_QUESTIONS.find(b => String(b.id) === String(q.id) || b.id === q.id);
          return bq ? { ...bq, options: bq.options || q.options, answer: q.answer } : q;
        })
      };
      setQuizData(updatedQuizData);
      setGameState('playing');
    });

    socket.on('waiting_results', () => {
      setGameState('waiting_results');
    });

    socket.on('game_over', (data) => {
      if (!data) return;
      const updatedSelections = {};
      if (data.selections) {
        Object.keys(data.selections).forEach(userKey => {
          updatedSelections[userKey] = (data.selections[userKey] || []).map(q => {
            const bq = BURMESE_QUESTIONS.find(b => String(b.id) === String(q.id) || b.id === q.id);
            return bq ? { ...q, text: bq.text || q.text, options: bq.options || q.options } : q;
          });
        });
      }
      setGameOverData({ ...data, selections: updatedSelections });
      setPlayers(data.players || []);
      setGameState('results');
    });

    return () => {
      socket.off('error');
      socket.off('room_data');
      socket.off('game_start_selection');
      socket.off('waiting_for_opponent');
      socket.off('start_quiz');
      socket.off('waiting_results');
      socket.off('game_over');
    };
  }, [username, roomId, navigate]);

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/nomo?room=${roomId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    socket.emit('leave_room', { roomId });
    navigate('/nomo');
  };

  const opponent = players.find(p => p.username !== username);

  // Active step calculation
  const getActiveStep = () => {
    if (gameState === 'waiting') return 0;
    if (gameState === 'selecting' || gameState === 'waiting_others') return 1;
    if (gameState === 'playing' || gameState === 'waiting_results') return 2;
    if (gameState === 'results') return 3;
    return 0;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Game Header Bar */}
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-wrap items-center justify-between gap-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border-2 border-sky-200/80 dark:border-slate-700 shadow-md"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="px-3.5 py-1.5 bg-gradient-to-r from-sky-100 to-cyan-100 dark:from-slate-700 dark:to-sky-950/60 rounded-2xl border border-sky-300 dark:border-sky-700 font-mono font-black text-sky-800 dark:text-sky-300 text-xs sm:text-sm tracking-wider shadow-sm">
            ROOM: {roomId}
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="button" 
            onClick={handleCopyLink}
            className="text-xs font-black px-3.5 py-1.5 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-sky-300 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {copied ? (
              <span className="text-emerald-500 font-bold">✓ Copied</span>
            ) : (
              <span>🔗 Copy Link</span>
            )}
          </motion.button>
        </div>

        {/* Game Stage Stepper */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-black">
          {STAGES.map((s, idx) => {
            const isActive = idx === getActiveStep();
            const isDone = idx < getActiveStep();
            return (
              <div 
                key={s.id} 
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm' 
                    : isDone 
                    ? 'bg-sky-100 text-sky-700 dark:bg-slate-700/60 dark:text-sky-300' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {s.label}
              </div>
            );
          })}
        </div>

        <button 
          onClick={handleLeave}
          className="text-xs font-black text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 px-2 py-1 transition-colors cursor-pointer"
        >
          Leave Room
        </button>
      </motion.div>

      {/* Main Content View Switcher */}
      <div className="w-full">
        {/* WAITING FOR PLAYER 2 LOBBY */}
        {players.length < 2 && gameState === 'waiting' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="nomo-card rounded-[36px] p-6 sm:p-10 text-center space-y-8 max-w-xl mx-auto shadow-2xl"
          >
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 dark:bg-slate-800 text-sky-800 dark:text-sky-300 text-xs font-black border border-sky-200 dark:border-sky-800 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                Waiting for Player 2 to join
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 font-['Fredoka']">
                Game Lobby
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-sm mx-auto">
                Share this Room Code or invite link with your friend to start together.
              </p>
            </div>

            {/* Dual Player Slots */}
            <div className="grid grid-cols-2 gap-4">
              {/* Player 1 (You) */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-sky-300 dark:border-sky-700 shadow-md text-center space-y-2.5"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-200 via-cyan-100 to-sky-300 dark:from-slate-700 dark:to-sky-900 text-sky-700 dark:text-sky-300 font-black text-2xl flex items-center justify-center mx-auto shadow-inner uppercase border border-white/60">
                  {username.charAt(0) || 'P1'}
                </div>
                <div className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 truncate">
                  {username}
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-[10px] font-black tracking-wider uppercase shadow-sm">
                  Host (Ready)
                </span>
              </motion.div>

              {/* Player 2 (Empty) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/80 dark:bg-slate-800/40 border-2 border-dashed border-sky-300 dark:border-slate-700 text-center space-y-2.5 flex flex-col justify-center items-center">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-slate-700/50 flex items-center justify-center shadow-inner">
                  <div className="w-6 h-6 border-3 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="font-bold text-xs text-slate-400">
                  Player 2 Slot
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider">
                  Waiting...
                </span>
              </div>
            </div>

            {/* 1-Click Share Button */}
            <div className="pt-2">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button" 
                onClick={handleCopyLink}
                className="nomo-button-3d-primary w-full py-4 rounded-2xl text-white font-black text-sm sm:text-base tracking-wide uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-400/30"
              >
                <span>{copied ? '✓ Invite Link Copied' : 'Copy & Share Invite Link ➔'}</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* SELECTING QUESTIONS */}
        {gameState === 'selecting' && (
          <QuestionSelection 
            roomId={roomId} 
            questions={questionsPool} 
            onSubmit={() => setGameState('waiting_others')} 
          />
        )}

        {/* WAITING FOR OPPONENT TO FINISH SELECTING */}
        {gameState === 'waiting_others' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="nomo-card rounded-[36px] p-8 sm:p-12 text-center space-y-6 max-w-lg mx-auto shadow-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-100 to-sky-200 dark:from-cyan-950/40 dark:to-sky-900/40 border-2 border-cyan-300 dark:border-cyan-700 flex items-center justify-center mx-auto text-sky-600 dark:text-sky-300 shadow-inner">
              <span className="text-2xl font-black">✓</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-['Fredoka']">
                10 Truths Locked In!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold max-w-sm mx-auto">
                Waiting for <strong className="text-sky-600 dark:text-sky-400 font-black">{opponent?.username || 'your friend'}</strong> to finish selecting...
              </p>
            </div>
            <div className="p-3.5 bg-sky-50 dark:bg-slate-800 rounded-2xl border border-sky-200 dark:border-slate-700 text-xs text-sky-800 dark:text-sky-300 font-bold">
              Next up: Guess what your friend chose about themselves.
            </div>
          </motion.div>
        )}

        {/* QUIZ ANSWERING PHASE */}
        {gameState === 'playing' && quizData && (
          <Quiz 
            roomId={roomId}
            data={quizData}
            onFinish={() => setGameState('waiting_results')}
          />
        )}
        
        {/* WAITING FOR OPPONENT TO FINISH QUIZ */}
        {gameState === 'waiting_results' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="nomo-card rounded-[36px] p-8 sm:p-12 text-center space-y-6 max-w-lg mx-auto shadow-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-sky-950/40 border-2 border-sky-300 dark:border-sky-700 flex items-center justify-center mx-auto shadow-inner">
              <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-['Fredoka']">
                Quiz Submitted!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold max-w-sm mx-auto">
                Calculating results... Waiting for <strong className="text-sky-600 dark:text-sky-400 font-black">{opponent?.username || 'your friend'}</strong> to complete their quiz.
              </p>
            </div>
          </motion.div>
        )}

        {/* RESULTS SCREEN */}
        {gameState === 'results' && gameOverData && (
          <Results 
            players={gameOverData.players} 
            selections={gameOverData.selections}
            myUsername={username}
            roomId={roomId}
          />
        )}
      </div>
    </div>
  );
};

export default GameRoom;