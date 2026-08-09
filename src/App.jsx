import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { PUZZLES } from './data/puzzles.js';

const playSound = (type) => {
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
    setNav(screen);
  };

  const pokeMascot = () => {
    if (playState !== 'IDLE') return;
    playSound('boop');
    const states = ['shocked', 'happy', 'cool', 'thinking'];
    setMascotState(states[Math.floor(Math.random() * states.length)]);
    setTimeout(() => setMascotState('thinking'), 1000);
  };

  const startGame = (mode) => {
    playSound('tap');
    setGameMode(mode);
    setScore(0);
    setDisplayScore(0);
    setStreak(0);
    setQuestionsAnswered(0);
    setLives(mode === 'MARATHON' ? 3 : 1);
    nextPuzzle();
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
    
    let available = PUZZLES.filter(p => !playedPuzzles.includes(p.id));
    
    // If all puzzles played, reset the list!
    if (available.length === 0) {
      setPlayedPuzzles([]);
      available = [...PUZZLES];
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
      setInteractionState('wrong');
      setMascotState('shocked');
      setStreak(0);
      triggerFlash('orange');
      
      setTrapRateData(prev => ({ seen: prev.seen + 1, fallen: prev.fallen + 1 }));
      
      if (gameMode === 'MARATHON') setLives(l => l - 1);
    }
    
    setPlayState('FEEDBACK');
  };

  const triggerFlash = (type) => {
    setFlashScreen(type);
    setTimeout(() => setFlashScreen(null), 800);
  };

  const handleFeedbackContinue = () => {
    playSound('tap');
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

      <div style={{ flex: 1, padding: '1.5rem', paddingBottom: '100px' }}>
        
        {/* HOME SCREEN */}
        {nav === 'HOME' && playState === 'IDLE' && (
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
            
            <div className="glass-panel mode-card" onClick={() => startGame('QUICK')}>
              <div className="mode-icon">⚡</div>
              <div style={{ flex: 1 }}>
                <h3>Quick Play</h3>
                <p style={{ fontSize: '0.9rem' }}>10 questions. No pressure.</p>
              </div>
              <div style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}>→</div>
            </div>
            
            <div className="glass-panel mode-card" onClick={() => startGame('MARATHON')}>
              <div className="mode-icon">♾️</div>
              <div style={{ flex: 1 }}>
                <h3>Marathon</h3>
                <p style={{ fontSize: '0.9rem' }}>Endless. 3 lives. High stakes.</p>
              </div>
              <div style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>→</div>
            </div>
          </div>
        )}

        {/* SETTINGS SCREEN */}
        {nav === 'SETTINGS' && (
          <div className="slide-fade flex-col gap-4">
            <h1 style={{ fontSize: '2rem', marginTop: '10px' }}>Settings</h1>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Sound Effects</h3>
                <div style={{ width: '50px', height: '26px', background: 'var(--secondary)', borderRadius: '15px', position: 'relative' }}>
                  <div style={{ width: '22px', height: '22px', background: '#111318', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Haptic Feedback</h3>
                <div style={{ width: '50px', height: '26px', background: 'var(--secondary)', borderRadius: '15px', position: 'relative' }}>
                  <div style={{ width: '22px', height: '22px', background: '#111318', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
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

            <div className="flex-col gap-3">
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
