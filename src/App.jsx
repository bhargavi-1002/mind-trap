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
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'win') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    }
  } catch(e) {}
};

// Premium 3D CSS Brain Mascot
const BrainMascot = ({ state, scale = 1 }) => {
  return (
    <div className="brain-container" style={{ transform: `scale(${scale})` }}>
      <div className={`brain-3d ${state}`}>
        <div className="brain-eyes">
          <div className="brain-eye"><div className="brain-pupil"></div></div>
          <div className="brain-eye"><div className="brain-pupil"></div></div>
        </div>
      </div>
      <div className="brain-glow"></div>
    </div>
  );
};

export default function App() {
  const [nav, setNav] = useState('HOME'); // HOME, PLAY, SETTINGS
  const [gameMode, setGameMode] = useState(null); // QUICK, MARATHON
  const [playState, setPlayState] = useState('IDLE'); // IDLE, PLAYING, FEEDBACK, RESULT
  
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [playedPuzzles, setPlayedPuzzles] = useState([]);
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [trapsFallenFor, setTrapsFallenFor] = useState(0);
  const [trapsAvoided, setTrapsAvoided] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  
  const [mascotState, setMascotState] = useState('');
  const [interactionState, setInteractionState] = useState(null); // 'correct', 'wrong', 'timeout'
  const [selectedOption, setSelectedOption] = useState(null);

  const switchNav = (screen) => {
    playSound('tap');
    setNav(screen);
  };

  const startGame = (mode) => {
    playSound('tap');
    setGameMode(mode);
    setScore(0);
    setStreak(0);
    setQuestionsAnswered(0);
    setTrapsFallenFor(0);
    setTrapsAvoided(0);
    setLives(mode === 'MARATHON' ? 3 : 1); // Quick play doesn't use lives, but setting 1 prevents game over
    setPlayedPuzzles([]);
    nextPuzzle();
  };

  const nextPuzzle = () => {
    if (gameMode === 'QUICK' && questionsAnswered >= 10) {
      endGame();
      return;
    }
    
    setInteractionState(null);
    setSelectedOption(null);
    setMascotState('thinking');
    setPlayState('PLAYING');
    
    const available = PUZZLES.filter(p => !playedPuzzles.includes(p.id));
    if (available.length === 0) {
      endGame();
      return;
    }
    
    // Pick random puzzle
    const puzzle = available[Math.floor(Math.random() * available.length)];
    
    // Map options to objects so we can track correct answer after shuffle
    const optionsWithMeta = puzzle.options.map((opt, i) => ({
      text: opt,
      isCorrect: i === puzzle.correctIndex,
      isTrap: i === puzzle.trapIndex
    }));
    
    setCurrentPuzzle(puzzle);
    setShuffledOptions(optionsWithMeta.sort(() => Math.random() - 0.5));
    
    // Start Timer
    setTimeLeft(puzzle.timerSeconds * 100); // 10ms ticks for smooth bar
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
    playSound('wrong');
    setInteractionState('timeout');
    setMascotState('shocked');
    setStreak(0);
    setTrapsFallenFor(prev => prev + 1);
    
    if (gameMode === 'MARATHON') {
      setLives(l => l - 1);
    }
    
    setPlayState('FEEDBACK');
  };

  const handleOptionClick = (opt, index) => {
    if (playState !== 'PLAYING') return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    setSelectedOption(index);
    setQuestionsAnswered(prev => prev + 1);
    setPlayedPuzzles([...playedPuzzles, currentPuzzle.id]);
    
    if (opt.isCorrect) {
      playSound('correct');
      setInteractionState('correct');
      setMascotState('happy');
      setTrapsAvoided(prev => prev + 1);
      
      const multiplier = streak >= 10 ? 2 : streak >= 5 ? 1.5 : 1;
      const timeBonus = Math.floor(timeLeft / 100);
      setScore(s => s + Math.floor((100 + timeBonus * 10) * multiplier));
      setStreak(s => s + 1);
    } else {
      playSound('wrong');
      setInteractionState('wrong');
      setMascotState('shocked');
      setTrapsFallenFor(prev => prev + 1);
      setStreak(0);
      
      if (gameMode === 'MARATHON') {
        setLives(l => l - 1);
      }
    }
    
    setPlayState('FEEDBACK');
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
    playSound('win');
    setMascotState(score > 500 ? 'happy' : 'shocked');
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
      <div style={{ flex: 1, padding: '1.5rem', paddingBottom: '100px' }}>
        
        {/* HOME SCREEN */}
        {nav === 'HOME' && playState === 'IDLE' && (
          <div className="slide-fade flex-col gap-4">
            <div className="hero-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h1 style={{ margin: 0, fontSize: '2.5rem' }}>MIND<br/>TRAP</h1>
                <p style={{ marginTop: '10px', color: 'rgba(255,255,255,0.8)' }}>"Oh, I got baited."</p>
              </div>
              <div style={{ position: 'relative', zIndex: 1, marginRight: '-20px' }}>
                <BrainMascot state="thinking" scale={0.8} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <div className="glass-panel" style={{ flex: 1, padding: '15px', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>14</h2>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Best Streak</p>
              </div>
              <div className="glass-panel" style={{ flex: 1, padding: '15px', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--success)', fontSize: '1.5rem' }}>42%</h2>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Trap Rate</p>
              </div>
            </div>

            <h3 style={{ marginTop: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Select Mode</h3>
            
            <div className="glass-panel mode-card" onClick={() => startGame('QUICK')}>
              <div className="mode-icon">⚡</div>
              <div style={{ flex: 1 }}>
                <h3>Quick Play</h3>
                <p style={{ fontSize: '0.9rem' }}>10 questions. No pressure.</p>
              </div>
              <div style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>→</div>
            </div>
            
            <div className="glass-panel mode-card" onClick={() => startGame('MARATHON')}>
              <div className="mode-icon">♾️</div>
              <div style={{ flex: 1 }}>
                <h3>Marathon</h3>
                <p style={{ fontSize: '0.9rem' }}>Endless. 3 lives. High stakes.</p>
              </div>
              <div style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}>→</div>
            </div>
            
            <div className="glass-panel mode-card" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              <div className="mode-icon">📅</div>
              <div style={{ flex: 1 }}>
                <h3>Daily Challenge</h3>
                <p style={{ fontSize: '0.9rem' }}>Coming soon</p>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS SCREEN */}
        {nav === 'SETTINGS' && (
          <div className="slide-fade flex-col gap-4">
            <h1 style={{ fontSize: '2rem', marginTop: '10px' }}>Configuration</h1>
            
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Sound Effects</h3>
                <div style={{ width: '50px', height: '26px', background: 'var(--primary)', borderRadius: '15px', position: 'relative' }}>
                  <div style={{ width: '22px', height: '22px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Haptic Feedback</h3>
                <div style={{ width: '50px', height: '26px', background: 'var(--primary)', borderRadius: '15px', position: 'relative' }}>
                  <div style={{ width: '22px', height: '22px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>Timer Speed</h3>
                  <p style={{ fontSize: '0.8rem' }}>Multiplier: 1.0x</p>
                </div>
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Adjust</button>
              </div>
            </div>
            
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Category Filters</h3>
            <div className="glass-panel" style={{ padding: '10px 20px' }}>
              {['Logic', 'Math', 'Perception', 'Pattern', 'Riddle'].map(cat => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0' }}>
                  <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>{cat}</p>
                  <div style={{ width: '20px', height: '20px', background: 'var(--success)', borderRadius: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✓</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GAMEPLAY SCREEN */}
        {nav === 'HOME' && playState === 'PLAYING' && currentPuzzle && (
          <div className="slide-fade flex-col h-full" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0 1rem 0' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>{currentPuzzle.category}</span>
                <span style={{ color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: 800 }}>TIER {currentPuzzle.difficulty}</span>
              </div>
              <div className="stat-badge" style={{ color: 'var(--text-main)' }}>⟡ {score}</div>
            </div>
            
            {/* HUD: Lives (Marathon) or Progress (Quick Play) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              {gameMode === 'MARATHON' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ width: '30px', height: '6px', borderRadius: '3px', background: i < lives ? 'var(--secondary)' : 'rgba(255,255,255,0.1)', boxShadow: i < lives ? '0 0 10px var(--secondary-glow)' : 'none' }}></div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--primary)', fontWeight: 800 }}>Q: {questionsAnswered + 1} / 10</p>
              )}
              {streak > 2 && <span style={{ color: 'var(--accent)', fontWeight: 800 }}>🔥 {streak} STREAK</span>}
            </div>

            {/* Timer Bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ 
                height: '100%', 
                width: `${(timeLeft / (currentPuzzle.timerSeconds * 100)) * 100}%`,
                background: timeLeft > 300 ? 'var(--primary)' : 'var(--danger)',
                transition: 'width 10ms linear, background 0.3s'
              }}></div>
            </div>

            <div className="glass-panel mb-4" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h2 style={{ lineHeight: 1.4, fontSize: '1.4rem' }}>{currentPuzzle.question}</h2>
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
            <h1 style={{ marginTop: '20px', color: interactionState === 'correct' ? 'var(--success)' : 'var(--danger)' }}>
              {interactionState === 'correct' ? 'EVADED!' : interactionState === 'timeout' ? 'OUT OF TIME' : 'BAITED!'}
            </h1>
            
            <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0', minHeight: '140px' }}>
              <BrainMascot state={mascotState} scale={1.2} />
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', width: '100%', border: `1px solid ${interactionState === 'correct' ? 'var(--success)' : 'var(--danger)'}`, marginBottom: '20px' }}>
              <p style={{ color: 'var(--text-main)', marginBottom: '15px', fontSize: '1.1rem', lineHeight: 1.4 }}>
                {currentPuzzle.trapExplanation}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Correct Answer:</p>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '12px', borderRadius: '10px', fontWeight: 800 }}>
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
            
            <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
              <BrainMascot state={score > 500 ? 'happy' : 'shocked'} scale={1.2} />
            </div>
            
            <div className="glass-panel text-center mb-4" style={{ padding: '2rem' }}>
              <p style={{ color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, marginBottom: '5px' }}>{gameMode} MODE</p>
              <h1 style={{ fontSize: '3.5rem', color: 'var(--text-main)', margin: '10px 0' }}>{score}</h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Traps Evaded</p>
                  <h3 style={{ color: 'var(--success)' }}>{trapsAvoided}</h3>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Traps Fallen For</p>
                  <h3 style={{ color: 'var(--danger)' }}>{trapsFallenFor}</h3>
                </div>
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

            <button className="btn-primary" style={{ width: '100%', marginBottom: '10px' }} onClick={() => setPlayState('IDLE')}>
              BACK TO HUB
            </button>
            <button className="btn-secondary" style={{ width: '100%', borderColor: 'var(--secondary)', color: 'var(--secondary)' }} onClick={() => {}}>
              SHARE RESULT
            </button>
          </div>
        )}

      </div>
      {renderNav()}
    </>
  );
}
