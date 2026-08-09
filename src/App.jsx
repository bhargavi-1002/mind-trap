import React, { useState } from 'react';
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
  const [nav, setNav] = useState('HOME');
  const [playState, setPlayState] = useState('IDLE');
  
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [playedPuzzles, setPlayedPuzzles] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  
  const [mascotState, setMascotState] = useState('');
  const [interactionState, setInteractionState] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const switchNav = (screen) => {
    playSound('tap');
    setNav(screen);
    if (screen === 'PLAY') setPlayState('IDLE');
  };

  const startLevel = () => {
    playSound('tap');
    setScore(0); setLives(3); setCombo(0); setPlayedPuzzles([]);
    setPlayState('PLAYING');
    nextPuzzle();
  };

  const nextPuzzle = () => {
    setInteractionState(null);
    setSelectedOption(null);
    setMascotState('');
    
    const available = PUZZLES.filter(p => !playedPuzzles.includes(p.id));
    if (available.length === 0) {
      playSound('win');
      setMascotState('happy');
      setPlayState('RESULT');
      return;
    }
    
    const puzzle = available[Math.floor(Math.random() * available.length)];
    setCurrentPuzzle(puzzle);
    if (!puzzle.requiresWait) setShuffledOptions([...puzzle.options].sort(() => Math.random() - 0.5));
    else setShuffledOptions(puzzle.options);
  };

  const handleOptionClick = (option, index) => {
    if (interactionState) return;
    setSelectedOption(index);
    
    if (currentPuzzle.requiresWait || !option.isCorrect) {
      playSound('wrong');
      setInteractionState('wrong');
      setMascotState('shocked');
      setCombo(0);
      setLives(lives - 1);
      setPlayedPuzzles([...playedPuzzles, currentPuzzle.id]);
      
      setTimeout(() => {
        if (lives - 1 <= 0) {
          playSound('wrong');
          setPlayState('RESULT');
        } else nextPuzzle();
      }, 1200);
    } else {
      playSound('correct');
      setInteractionState('correct');
      setMascotState('happy');
      setScore(score + 100 + (combo * 20));
      setCombo(combo + 1);
      setPlayedPuzzles([...playedPuzzles, currentPuzzle.id]);
      
      setTimeout(() => nextPuzzle(), 1000);
    }
  };

  const renderNav = () => (
    <div className="bottom-nav">
      <div className={`nav-item ${nav === 'HOME' ? 'active' : ''}`} onClick={() => switchNav('HOME')}>
        <div className="nav-icon">⬡</div><div>Hub</div>
      </div>
      <div className={`nav-item ${nav === 'PLAY' ? 'active' : ''}`} onClick={() => switchNav('PLAY')}>
        <div className="nav-icon">⏣</div><div>Play</div>
      </div>
      <div className={`nav-item ${nav === 'LEADERBOARD' ? 'active' : ''}`} onClick={() => switchNav('LEADERBOARD')}>
        <div className="nav-icon">⟡</div><div>Rank</div>
      </div>
      <div className={`nav-item ${nav === 'PROFILE' ? 'active' : ''}`} onClick={() => switchNav('PROFILE')}>
        <div className="nav-icon">⎔</div><div>Data</div>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ flex: 1, padding: '1.5rem', paddingBottom: '100px' }}>
        
        {/* HOME SCREEN */}
        {nav === 'HOME' && (
          <div className="slide-fade flex-col gap-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>System Active</p>
                <h3 style={{ margin: 0 }}>Subject 42</h3>
              </div>
              <div className="stats-pill">
                <div className="stat-badge">🔥 3</div>
                <div className="stat-badge">⟡ 120</div>
              </div>
            </div>

            <div className="hero-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h1 style={{ margin: 0, fontSize: '2rem' }}>MIND<br/>TRAP</h1>
                <p style={{ marginTop: '10px', color: 'rgba(255,255,255,0.8)' }}>Outsmart Yourself.</p>
                <button className="btn-primary" style={{ marginTop: '20px', padding: '0.8rem 1.5rem' }} onClick={() => switchNav('PLAY')}>
                  INITIALIZE
                </button>
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <BrainMascot state="thinking" scale={0.7} />
              </div>
            </div>

            <h3 style={{ marginTop: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Sequence</h3>
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '1.5rem' }} onClick={() => switchNav('PLAY')}>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                💠
              </div>
              <div style={{ flex: 1 }}>
                <h3>The Neural Box</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Solve today's logic trap</p>
              </div>
            </div>

            <h3 style={{ marginTop: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Simulation Modes</h3>
            <div className="glass-panel mode-card">
              <div className="mode-icon">⚡</div>
              <div><h3>Speed Trap</h3><p style={{ fontSize: '0.9rem' }}>Fast paced puzzles</p></div>
            </div>
            <div className="glass-panel mode-card">
              <div className="mode-icon">🧠</div>
              <div><h3>Logic Lab</h3><p style={{ fontSize: '0.9rem' }}>Test your reasoning</p></div>
            </div>
          </div>
        )}

        {/* PLAY SELECTION & WORLD MAP */}
        {nav === 'PLAY' && playState === 'IDLE' && (
          <div className="slide-fade flex-col gap-4 text-center">
            <h1 style={{ marginTop: '20px', fontSize: '2rem' }}>Neural Pathways</h1>
            <p style={{ color: 'var(--text-muted)' }}>Sector 1: Logic Gates</p>
            
            <div className="world-map-container">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div className={`level-node ${i < 3 ? 'completed' : i === 3 ? 'current' : ''}`}>
                    {i < 3 ? '✓' : i === 5 ? '🔒' : i + 1}
                  </div>
                  {i < 5 && <div style={{ width: '30px', height: '2px', background: i < 3 ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}></div>}
                </div>
              ))}
            </div>

            <div className="glass-panel mt-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem' }}>
              <BrainMascot state="idle" scale={1.2} />
              <h2 className="mt-4 mb-2" style={{ marginTop: '30px' }}>Node 4</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Pattern Recognition</p>
              <button className="btn-primary" style={{ width: '100%' }} onClick={startLevel}>ENGAGE</button>
            </div>
          </div>
        )}

        {/* GAMEPLAY */}
        {nav === 'PLAY' && playState === 'PLAYING' && currentPuzzle && (
          <div className="slide-fade flex-col h-full" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0 1rem 0' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ width: '30px', height: '6px', borderRadius: '3px', background: i < lives ? 'var(--secondary)' : 'rgba(255,255,255,0.1)', boxShadow: i < lives ? '0 0 10px var(--secondary-glow)' : 'none' }}></div>
                ))}
              </div>
              <div className="stat-badge" style={{ color: 'var(--text-main)' }}>⟡ {score}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0 40px 0', minHeight: '140px' }}>
              <BrainMascot state={mascotState} scale={1} />
            </div>

            <div className="glass-panel mb-4" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <h2 style={{ lineHeight: 1.4, fontSize: '1.4rem' }}>{currentPuzzle.question}</h2>
            </div>

            <div className="flex-col gap-4">
              {shuffledOptions.map((opt, i) => {
                let btnClass = "btn-answer";
                if (interactionState && selectedOption === i) {
                  btnClass += opt.isCorrect ? " correct" : " wrong";
                } else if (interactionState && opt.isCorrect) {
                  btnClass += " correct"; 
                }
                return (
                  <button 
                    key={i}
                    onClick={() => handleOptionClick(opt, i)}
                    className={btnClass}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem', height: '30px' }}>
              {combo > 2 && <span style={{ color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 0 15px rgba(6, 182, 212, 0.5)' }}>Chain x{combo}</span>}
            </div>
          </div>
        )}

        {/* RESULT */}
        {nav === 'PLAY' && playState === 'RESULT' && (
          <div className="slide-fade flex-col gap-4 text-center mt-4">
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <BrainMascot state={lives <= 0 ? 'shocked' : 'happy'} scale={1.4} />
            </div>
            
            <h1 style={{ fontSize: '2rem', color: lives <= 0 ? 'var(--danger)' : 'var(--success)' }}>
              {lives <= 0 ? 'SYSTEM FAILURE' : 'SEQUENCE CLEARED'}
            </h1>
            
            <div className="glass-panel text-center mb-4" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>Final Yield</h3>
              <h1 style={{ fontSize: '3.5rem', color: 'var(--text-main)', margin: '10px 0' }}>{score}</h1>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                <div><p>Chain</p><h3>x{combo}</h3></div>
                <div><p>Credits</p><h3>+45</h3></div>
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={() => switchNav('HOME')}>
              {lives <= 0 ? 'REBOOT' : 'NEXT SEQUENCE'}
            </button>
          </div>
        )}

        {/* MOCK SCREENS */}
        {nav === 'LEADERBOARD' && (
          <div className="slide-fade text-center mt-4">
            <h1 style={{ fontSize: '2rem' }}>Global Rank</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Top Neural Networks</p>
            
            <div className="glass-panel" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '15px', padding: '1rem', borderLeft: '4px solid #fbbf24' }}>
              <h2 style={{ width: '30px' }}>1</h2>
              <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>⚡</div>
              <h3 style={{ flex: 1, textAlign: 'left', margin: 0 }}>NeuroMaster</h3>
              <h2 style={{ color: 'var(--primary)' }}>9420</h2>
            </div>
            
            <div className="glass-panel" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '15px', padding: '1rem', borderLeft: '4px solid #9ca3af' }}>
              <h2 style={{ width: '30px' }}>2</h2>
              <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>👁️</div>
              <h3 style={{ flex: 1, textAlign: 'left', margin: 0 }}>LogicBot</h3>
              <h2 style={{ color: 'var(--primary)' }}>8100</h2>
            </div>

            <div className="glass-panel mt-4" style={{ border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', gap: '15px', padding: '1rem' }}>
              <h2 style={{ width: '30px' }}>42</h2>
              <div style={{ width: '40px', height: '40px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🧠</div>
              <h3 style={{ flex: 1, textAlign: 'left', margin: 0 }}>You</h3>
              <h2 style={{ color: 'var(--primary)' }}>2100</h2>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {nav === 'PROFILE' && (
          <div className="slide-fade text-center mt-4">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
              <BrainMascot state="idle" scale={1} />
            </div>
            <h1 style={{ fontSize: '2rem' }}>Subject 42</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Clearance Level 5</p>
            
            <div className="glass-panel mb-4" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px' }}>
                  <h2 style={{ color: 'var(--primary)' }}>32</h2><p style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Cycles</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px' }}>
                  <h2 style={{ color: 'var(--success)' }}>94%</h2><p style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Efficiency</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px' }}>
                  <h2 style={{ color: 'var(--accent)' }}>12</h2><p style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Chain Max</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px' }}>
                  <h2 style={{ color: 'var(--secondary)' }}>450</h2><p style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Credits</p>
                </div>
              </div>
            </div>

            <h3 style={{ textAlign: 'left', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>System Badges</h3>
            <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
              <div className="glass-panel" style={{ minWidth: '110px', textAlign: 'center', padding: '15px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💠</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>First Boot</div>
              </div>
              <div className="glass-panel" style={{ minWidth: '110px', textAlign: 'center', padding: '15px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚡</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>Overclock</div>
              </div>
              <div className="glass-panel" style={{ minWidth: '110px', textAlign: 'center', padding: '15px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🧠</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>Big Brain</div>
              </div>
            </div>
          </div>
        )}

      </div>
      {renderNav()}
    </>
  );
}
