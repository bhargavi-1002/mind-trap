import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { PUZZLES } from './data/puzzles.js';

const playSound = (type) => {
  if (localStorage.getItem('mt_sound') === 'false') return;
  try {

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    
    if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'trap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'milestone') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.2);
      osc.frequency.linearRampToValueAtTime(1760, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'boop') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    }
  } catch(e) {}
};

const Mascot = ({ state, scale = 1, onClick }) => {
  return (
    <div className="mascot-container" style={{ transform: `scale(${scale})` }} onClick={onClick}>
      <div className={`mascot-body ${state}`}>
        <div className="mascot-eyes">
          <div className="mascot-eye"><div className="mascot-pupil"></div></div>
          <div className="mascot-eye"><div className="mascot-pupil"></div></div>
        </div>
      </div>
    </div>
  );
};


const playHaptic = (pattern = 50) => {
  if (localStorage.getItem('mt_haptics') === 'false') return;
  if (navigator.vibrate) navigator.vibrate(pattern);
};

export default function App() {
  const [nav, setNav] = useState('HOME');
  const [gameMode, setGameMode] = useState(null);
  const [playState, setPlayState] = useState('IDLE');
  
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  
  // Persistent stats
  const [playedPuzzles, setPlayedPuzzles] = useState(() => JSON.parse(localStorage.getItem('mt_played')) || []);
  const [bestStreak, setBestStreak] = useState(() => parseInt(localStorage.getItem('mt_best_streak')) || 0);
  const [trapRateData, setTrapRateData] = useState(() => JSON.parse(localStorage.getItem('mt_trap_data')) || { seen: 0, fallen: 0 });
  
  // Current game session
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const scoreIntervalRef = useRef(null);
  
  const [mascotState, setMascotState] = useState('thinking'); 
  const [interactionState, setInteractionState] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  
  const [flashScreen, setFlashScreen] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('mt_sound') !== 'false');
  const [hapticsEnabled, setHapticsEnabled] = useState(() => localStorage.getItem('mt_haptics') !== 'false');
  
  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem('mt_sound', newVal ? 'true' : 'false');
  };
  
  const toggleHaptics = () => {
    const newVal = !hapticsEnabled;
    setHapticsEnabled(newVal);
    localStorage.setItem('mt_haptics', newVal ? 'true' : 'false');
  };

  const allTopics = [...new Set(PUZZLES.map(p => p.category))];
  const [selectedTopics, setSelectedTopics] = useState(allTopics);
  const [selectedLevels, setSelectedLevels] = useState([1, 2, 3, 4, 5]);
  const [setupMode, setSetupMode] = useState(false);
  const [pendingGameMode, setPendingGameMode] = useState(null);
 

  useEffect(() => {
    localStorage.setItem('mt_played', JSON.stringify(playedPuzzles));
    localStorage.setItem('mt_best_streak', bestStreak.toString());
    localStorage.setItem('mt_trap_data', JSON.stringify(trapRateData));
  }, [playedPuzzles, bestStreak, trapRateData]);

  useEffect(() => {
    if (displayScore < score) {
      if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
      scoreIntervalRef.current = setInterval(() => {
        setDisplayScore(prev => {
          const step = Math.max(1, Math.floor((score - prev) / 5));
          if (prev + step >= score) {
            clearInterval(scoreIntervalRef.current);
            return score;
          }
          return prev + step;
        });
      }, 30);
    }
    return () => clearInterval(scoreIntervalRef.current);
  }, [score, displayScore]);

  useEffect(() => {
    if (playState === 'PLAYING' && timeLeft > 0 && timeLeft < 300 && mascotState !== 'anxious') {
      setMascotState('anxious');
    }
  }, [timeLeft, playState, mascotState]);

  const switchNav = (screen) => {
    playSound('tap');
    playHaptic();
    setNav(screen);
  };

  const pokeMascot = () => {
    if (playState !== 'IDLE') return;
    playSound('boop');
    playHaptic([30, 50, 30]);
    const states = ['shocked', 'happy', 'cool', 'thinking'];
    setMascotState(states[Math.floor(Math.random() * states.length)]);
    setTimeout(() => setMascotState('thinking'), 1000);
  };

  const startGame = (mode) => {
    playSound('tap');
    playHaptic();
    setGameMode(mode);
    setScore(0);
    setDisplayScore(0);
    setStreak(0);
    setQuestionsAnswered(0);
    setLives(mode === 'MARATHON' ? 3 : 1);
    nextPuzzle();
  };
  
  const initiateGame = (mode) => {
    playSound('tap');
    playHaptic();
    setPendingGameMode(mode);
    setSetupMode(true);
  };
  
  const toggleTopic = (topic) => {
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };
  
  const toggleLevel = (level) => {
    // Difficulty ladder: selecting a level includes all levels up to that difficulty
    const newLevels = [];
    for(let i = 1; i <= level; i++) newLevels.push(i);
    setSelectedLevels(newLevels);
  };


  const nextPuzzle = () => {
    if (gameMode === 'QUICK' && questionsAnswered >= 10) {
      endGame();
      return;
    }
    
    setInteractionState(null);
    setSelectedOption(null);
    setMascotState(streak >= 5 ? 'cool' : 'thinking');
    setPlayState('PLAYING');
    setFlashScreen(null);
    
    let filteredPuzzles = PUZZLES.filter(p => selectedTopics.includes(p.category) && selectedLevels.includes(p.difficulty));
    if (filteredPuzzles.length === 0) {
       filteredPuzzles = PUZZLES; // fallback if empty
    }
    let available = filteredPuzzles.filter(p => !playedPuzzles.includes(p.id));
    
    // If all puzzles played, reset the list!
    if (available.length === 0) {
      setPlayedPuzzles([]);
      available = [...filteredPuzzles];
    }
    
    const puzzle = available[Math.floor(Math.random() * available.length)];
    const optionsWithMeta = puzzle.options.map((opt, i) => ({
      text: opt,
      isCorrect: i === puzzle.correctIndex,
      isTrap: i === puzzle.trapIndex
    }));
    
    setCurrentPuzzle(puzzle);
    setShuffledOptions(optionsWithMeta.sort(() => Math.random() - 0.5));
    
    setTimeLeft(puzzle.timerSeconds * 100);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 10);
  };

  const handleTimeout = () => {
    playSound('trap');
      playHaptic([100, 50, 100]);
    setInteractionState('timeout');
    setMascotState('shocked');
    setStreak(0);
    triggerFlash('orange');
    
    setTrapRateData(prev => ({ seen: prev.seen + 1, fallen: prev.fallen + 1 }));
    setPlayedPuzzles(prev => [...prev, currentPuzzle.id]);
    setQuestionsAnswered(prev => prev + 1);
    
    if (gameMode === 'MARATHON') setLives(l => l - 1);
    setPlayState('FEEDBACK');
  };

  const handleOptionClick = (opt, index) => {
    if (playState !== 'PLAYING') return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    setSelectedOption(index);
    setPlayedPuzzles(prev => [...prev, currentPuzzle.id]);
    setQuestionsAnswered(prev => prev + 1);
    
    if (opt.isCorrect) {
      playSound('correct');
      playHaptic([50, 50, 50]);
      setInteractionState('correct');
      setMascotState('happy');
      
      setTrapRateData(prev => ({ seen: prev.seen + 1, fallen: prev.fallen }));
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      
      if (newStreak === 5 || newStreak === 10) {
        playSound('milestone');
        triggerFlash('streak');
        setTimeout(() => setMascotState('cool'), 800);
      }
      
      const multiplier = newStreak >= 10 ? 2 : newStreak >= 5 ? 1.5 : 1;
      const timeBonus = Math.floor(timeLeft / 100);
      setScore(s => s + Math.floor((100 + timeBonus * 10) * multiplier));
    } else {
      playSound('trap');
      playHaptic([100, 50, 100]);
      setInteractionState('wrong');
      setMascotState('shocked');
      setStreak(0);
      triggerFlash('orange');
      
      setTrapRateData(prev => ({ seen: prev.seen + 1, fallen: prev.fallen + 1 }));
      
      if (gameMode === 'MARATHON') setLives(l => l - 1);
    }
    
    setPlayState('FEEDBACK');
  };


  const pauseGame = () => {
    playSound('tap');
    playHaptic();
    if (timerRef.current) clearInterval(timerRef.current);
    setPlayState('PAUSED');
  };

  const resumeGame = () => {
    playSound('tap');
    playHaptic();
    setPlayState('PLAYING');
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 10);
  };

  const triggerFlash = (type) => {
    setFlashScreen(type);
    setTimeout(() => setFlashScreen(null), 800);
  };

  const handleFeedbackContinue = () => {
    playSound('tap');
    playHaptic();
    if (gameMode === 'MARATHON' && lives <= 0) {
      endGame();
    } else {
      nextPuzzle();
    }
  };

  const endGame = () => {
    setMascotState(score > 500 ? 'cool' : 'shocked');
    setPlayState('RESULT');
  };

  const renderNav = () => (
    <div className="bottom-nav">
      <div className={`nav-item ${nav === 'HOME' ? 'active' : ''}`} onClick={() => switchNav('HOME')}>
        <div className="nav-icon">⬡</div><div>Hub</div>
      </div>
      <div className={`nav-item ${nav === 'SETTINGS' ? 'active' : ''}`} onClick={() => switchNav('SETTINGS')}>
        <div className="nav-icon">⚙️</div><div>Config</div>
      </div>
    </div>
  );

  return (
    <>
      {flashScreen === 'orange' && <div className="screen-flash-orange"></div>}
      {flashScreen === 'streak' && <div className="streak-glow"></div>}

      <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {/* HOME SCREEN */}
        {nav === 'HOME' && playState === 'IDLE' && !setupMode && (
          <div className="slide-fade flex-col gap-4">
            <div className="hero-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h1 style={{ margin: 0, fontSize: '2.5rem' }}>MIND<br/>TRAP</h1>
                <p style={{ marginTop: '10px', color: 'rgba(255,255,255,0.8)' }}>"Oh, I got baited."</p>
              </div>
              <div style={{ position: 'relative', zIndex: 1, marginRight: '-10px' }}>
                <Mascot state={mascotState} scale={0.9} onClick={pokeMascot} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <div className="glass-panel" style={{ flex: 1, padding: '15px', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--secondary)', fontSize: '1.5rem' }}>🔥 {bestStreak}</h2>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Best Streak</p>
              </div>
              <div className="glass-panel" style={{ flex: 1, padding: '15px', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>
                  {trapRateData.seen === 0 ? '0' : Math.round((trapRateData.fallen / trapRateData.seen) * 100)}%
                </h2>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Trap Rate</p>
              </div>
            </div>

            <h3 style={{ marginTop: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Select Mode</h3>
            
            <div className="glass-panel mode-card" onClick={() => initiateGame('QUICK')}>
              <div className="mode-icon">⚡</div>
              <div style={{ flex: 1 }}>
                <h3>Quick Play</h3>
                <p style={{ fontSize: '0.9rem' }}>10 questions. No pressure.</p>
              </div>
              <div style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}>→</div>
            </div>
            
            <div className="glass-panel mode-card" onClick={() => initiateGame('MARATHON')}>
              <div className="mode-icon">♾️</div>
              <div style={{ flex: 1 }}>
                <h3>Marathon</h3>
                <p style={{ fontSize: '0.9rem' }}>Endless. 3 lives. High stakes.</p>
              </div>
              <div style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>→</div>
            </div>
          </div>
        )}

        
        {nav === 'HOME' && playState === 'IDLE' && setupMode && (
          <div className="slide-fade flex-col h-full" style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '20px', textAlign: 'center' }}>SETUP MODE</h1>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '10px' }}>
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '15px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>SELECT TOPICS</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{selectedTopics.length} selected</span>
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                  gap: '12px' 
                }}>
                  {[
                    { id: 'logic', label: 'Logic', icon: '🧠' },
                    { id: 'math', label: 'Math', icon: '🔢' },
                    { id: 'pattern', label: 'Pattern', icon: '🧩' },
                    { id: 'perception', label: 'Perception', icon: '👁️' },
                    { id: 'riddle', label: 'Riddle', icon: '📜' },
                    { id: 'science', label: 'Science', icon: '🧪' },
                    { id: 'wordplay', label: 'Wordplay', icon: '🔤' }
                  ].map(topic => (
                    <button 
                      key={topic.id}
                      onClick={() => toggleTopic(topic.id)}
                      style={{
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: selectedTopics.includes(topic.id) ? '2px solid var(--primary)' : '2px solid rgba(255,255,255,0.2)',
                        background: selectedTopics.includes(topic.id) ? 'var(--primary)' : 'transparent',
                        color: selectedTopics.includes(topic.id) ? '#000' : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        boxShadow: selectedTopics.includes(topic.id) ? '0 0 15px rgba(255,215,0,0.3)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '1.2rem', filter: selectedTopics.includes(topic.id) ? 'none' : 'grayscale(100%) opacity(70%)' }}>{topic.icon}</span>
                      <span style={{ fontWeight: 'bold' }}>{topic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '15px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>DIFFICULTY LADDER</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    Max: {['Novice', 'Adept', 'Sharp', 'Expert', 'Mastermind'][Math.max(0, selectedLevels.length - 1)] || 'None'}
                  </span>
                </h3>
                
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', overflowX: 'auto' }}>
                  {/* Background track line */}
                  <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '4px', background: 'rgba(255,255,255,0.1)', transform: 'translateY(-50%)', zIndex: 1, borderRadius: '2px' }}></div>
                  
                  {/* Filled track line */}
                  <div style={{ 
                    position: 'absolute', top: '50%', left: '10%', 
                    width: `${((Math.max(1, selectedLevels.length) - 1) / 4) * 80}%`, 
                    height: '4px', background: 'var(--secondary)', 
                    transform: 'translateY(-50%)', zIndex: 2, borderRadius: '2px',
                    transition: 'width 0.3s ease-out'
                  }}></div>

                  {[
                    { id: 1, label: 'Novice' },
                    { id: 2, label: 'Adept' },
                    { id: 3, label: 'Sharp' },
                    { id: 4, label: 'Expert' },
                    { id: 5, label: 'Mastermind' }
                  ].map((level, index) => {
                    const isSelected = selectedLevels.includes(level.id);
                    const isMax = selectedLevels.length === level.id;
                    return (
                      <div 
                        key={level.id} 
                        onClick={() => toggleLevel(level.id)}
                        style={{ 
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                          cursor: 'pointer', zIndex: 3, flex: 1, minWidth: '60px'
                        }}
                      >
                        <div style={{
                          width: isMax ? '32px' : '24px',
                          height: isMax ? '32px' : '24px',
                          borderRadius: '50%',
                          background: isSelected ? 'var(--secondary)' : '#1a1d24',
                          border: `3px solid ${isSelected ? 'var(--secondary)' : 'rgba(255,255,255,0.2)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                          boxShadow: isMax ? '0 0 15px rgba(0,255,204,0.6)' : (isSelected ? '0 0 5px rgba(0,255,204,0.3)' : 'none'),
                          color: isSelected ? '#000' : 'rgba(255,255,255,0.5)',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}>
                          {level.id}
                        </div>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: isSelected ? 'bold' : 'normal',
                          color: isSelected ? '#fff' : 'rgba(255,255,255,0.4)',
                          textTransform: 'uppercase',
                          transition: 'color 0.2s'
                        }}>
                          {level.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button 
                style={{ 
                  flex: 1, padding: '1.2rem', fontWeight: 'bold', 
                  background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', 
                  cursor: 'pointer', transition: 'color 0.2s' 
                }} 
                onClick={() => setSetupMode(false)}
                onMouseOver={e => e.target.style.color = '#fff'}
                onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
              >
                CANCEL
              </button>
              <button 
                className="btn-primary" 
                style={{ 
                  flex: 2, padding: '1.2rem', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '1px',
                  opacity: (selectedTopics.length === 0 || selectedLevels.length === 0) ? 0.3 : 1,
                  boxShadow: (selectedTopics.length === 0 || selectedLevels.length === 0) ? 'none' : '0 0 20px rgba(255,215,0,0.4)',
                  transition: 'all 0.2s'
                }} 
                onClick={() => {
                  setSetupMode(false);
                  startGame(pendingGameMode);
                }}
                disabled={selectedTopics.length === 0 || selectedLevels.length === 0}
              >
                START GAME
              </button>
            </div>
          </div>
        )}

        {/* SETTINGS SCREEN */}
        {nav === 'SETTINGS' && (
          <div className="slide-fade flex-col gap-4">
            <h1 style={{ fontSize: '2rem', marginTop: '10px' }}>Settings</h1>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} onClick={toggleSound}>
                <h3>Sound Effects</h3>
                <div style={{ width: '50px', height: '26px', background: soundEnabled ? 'var(--secondary)' : 'rgba(255,255,255,0.2)', borderRadius: '15px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                  <div style={{ width: '22px', height: '22px', background: '#111318', borderRadius: '50%', position: 'absolute', left: soundEnabled ? '26px' : '2px', top: '2px', transition: 'left 0.3s' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} onClick={toggleHaptics}>
                <h3>Haptic Feedback</h3>
                <div style={{ width: '50px', height: '26px', background: hapticsEnabled ? 'var(--secondary)' : 'rgba(255,255,255,0.2)', borderRadius: '15px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                  <div style={{ width: '22px', height: '22px', background: '#111318', borderRadius: '50%', position: 'absolute', left: hapticsEnabled ? '26px' : '2px', top: '2px', transition: 'left 0.3s' }}></div>
                </div>
              </div>
              
              <button 
                className="btn-answer" 
                style={{ padding: '1rem', marginTop: '1rem' }}
                onClick={() => {
                  if(window.confirm('Erase all stats?')) {
                    setPlayedPuzzles([]);
                    setBestStreak(0);
                    setTrapRateData({seen:0, fallen:0});
                  }
                }}
              >
                Reset Progress
              </button>
            </div>
          </div>
        )}

        {/* GAMEPLAY SCREEN */}
        {nav === 'HOME' && playState === 'PLAYING' && currentPuzzle && (
          <div className="slide-fade flex-col h-full" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0 1rem 0' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={pauseGame} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>⏸️</button>
                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>{currentPuzzle.category}</span>
                <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 900 }}>T{currentPuzzle.difficulty}</span>
              </div>
              <div className="stat-badge score-text">{displayScore}</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              {gameMode === 'MARATHON' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ width: '30px', height: '6px', borderRadius: '3px', background: i < lives ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}></div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontWeight: 800 }}>{questionsAnswered + 1} / 10</p>
              )}
              {streak > 2 && <span className="streak-text">🔥 {streak} STREAK</span>}
            </div>

            {/* Timer Bar */}
            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px' }}>
              <div className={timeLeft < 300 ? 'timer-pulse' : ''} style={{ 
                height: '100%', 
                width: `${(timeLeft / (currentPuzzle.timerSeconds * 100)) * 100}%`,
                background: timeLeft > 300 ? 'var(--secondary)' : 'var(--primary)',
                transition: 'width 10ms linear, background 0.3s'
              }}></div>
            </div>

            <div className="glass-panel mb-4" style={{ textAlign: 'center', padding: '3rem 1.5rem', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h2 style={{ lineHeight: 1.4, fontSize: '1.5rem' }}>{currentPuzzle.question}</h2>
            </div>

            <div className="flex-col gap-6">
              {shuffledOptions.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleOptionClick(opt, i)}
                  className="btn-answer"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FEEDBACK SCREEN */}
        {nav === 'HOME' && playState === 'FEEDBACK' && currentPuzzle && (
          <div className="slide-fade flex-col h-full" style={{ height: '100%', alignItems: 'center' }}>
            <h1 style={{ marginTop: '10px', color: interactionState === 'correct' ? 'var(--secondary)' : 'var(--primary)' }}>
              {interactionState === 'correct' ? 'EVADED!' : interactionState === 'timeout' ? 'OUT OF TIME' : 'BAITED!'}
            </h1>
            
            <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0', minHeight: '140px' }}>
              <Mascot state={mascotState} scale={1.3} />
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', width: '100%', border: `2px solid ${interactionState === 'correct' ? 'var(--secondary)' : 'var(--primary)'}`, marginBottom: '20px' }}>
              <p style={{ color: 'var(--text-main)', marginBottom: '15px', fontSize: '1.1rem', lineHeight: 1.4 }}>
                {currentPuzzle.trapExplanation}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Correct Answer:</p>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', padding: '12px', borderRadius: '10px', fontWeight: 900 }}>
                  {currentPuzzle.options[currentPuzzle.correctIndex]}
                </div>
              </div>
            </div>
            
            <div style={{ flex: 1 }}></div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={handleFeedbackContinue}>
              {gameMode === 'MARATHON' && lives <= 0 ? 'VIEW RESULTS' : 'NEXT QUESTION'}
            </button>
          </div>
        )}

        
        {/* PAUSED SCREEN */}
        {nav === 'HOME' && playState === 'PAUSED' && (
          <div className="slide-fade flex-col h-full" style={{ height: '100%', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '2rem' }}>PAUSED</h1>
            
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button className="btn-primary" style={{ padding: '1.2rem', fontSize: '1.2rem', fontWeight: '900' }} onClick={resumeGame}>
                RESUME
              </button>
              <button className="btn-answer" style={{ padding: '1.2rem', fontWeight: 'bold' }} onClick={() => setPlayState('IDLE')}>
                EXIT TO HUB
              </button>
            </div>
          </div>
        )}

        {/* RESULT SCREEN */}
        {nav === 'HOME' && playState === 'RESULT' && (
          <div className="slide-fade flex-col gap-4 text-center mt-4">
            <h1 style={{ fontSize: '2rem', color: 'white' }}>Run Summary</h1>
            
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <Mascot state={mascotState} scale={1.3} />
            </div>
            
            <div className="glass-panel text-center mb-4" style={{ padding: '2rem' }}>
              <h1 style={{ fontSize: '4rem', color: 'var(--secondary)', margin: '10px 0' }}>{displayScore}</h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Best Streak</p>
                  <h3>{streak}</h3>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Questions</p>
                  <h3>{questionsAnswered}</h3>
                </div>
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setPlayState('IDLE')}>
              BACK TO HUB
            </button>
          </div>
        )}

      </div>
      {renderNav()}
    </>
  );
}
