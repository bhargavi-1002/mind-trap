import React, { useState, useEffect } from 'react';
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
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
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
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    }
  } catch(e) {}
};

const Mascot3D = ({ state, style }) => {
  return (
    <div className={`char-3d ${state}`} style={style}>
      <div className="char-head">
        <div className="char-hair"></div>
        <div className="char-eyes">
          <div className="char-eye"></div>
          <div className="char-eye"></div>
        </div>
        <div className="char-mouth"></div>
      </div>
      <div className="char-body"></div>
    </div>
  );
};

export default function App() {
  const [nav, setNav] = useState('HOME'); // HOME, PLAY, PROFILE
  const [playState, setPlayState] = useState('IDLE'); // IDLE, PLAYING, RESULT
  
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
      }, 1500);
    } else {
      playSound('correct');
      setInteractionState('correct');
      setMascotState('happy');
      setScore(score + 100 + (combo * 20));
      setCombo(combo + 1);
      setPlayedPuzzles([...playedPuzzles, currentPuzzle.id]);
      
      setTimeout(() => nextPuzzle(), 1200);
    }
  };

  const renderNav = () => (
    <div className="glass-nav">
      <div className={`nav-btn ${nav === 'HOME' ? 'active' : ''}`} onClick={() => switchNav('HOME')}>
        <div className="nav-btn-icon">🏠</div><div>HOME</div>
      </div>
      <div className={`nav-btn ${nav === 'PLAY' ? 'active' : ''}`} onClick={() => switchNav('PLAY')}>
        <div className="nav-btn-icon">🧩</div><div>PLAY</div>
      </div>
      <div className={`nav-btn ${nav === 'PROFILE' ? 'active' : ''}`} onClick={() => switchNav('PROFILE')}>
        <div className="nav-btn-icon">👤</div><div>PROFILE</div>
      </div>
    </div>
  );

  return (
    <>
      {/* 3D Cinematic Background Layer */}
      <div className="environment-3d">
        <div className="ambient-particles"></div>
        <div className="light-beam"></div>
      </div>

      <div style={{ flex: 1, padding: '1rem', paddingBottom: '90px' }}>
        
        {/* HOME SCREEN */}
        {nav === 'HOME' && (
          <div className="slide-up-fade flex-col gap-4">
            <div className="cinematic-header">
              <div className="stat-pill-3d" style={{ padding: '4px 12px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>😎</div>
                <span style={{ fontSize: '0.9rem' }}>Player</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="stat-pill-3d">🔥 3</div>
                <div className="stat-pill-3d">🪙 120</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2vh' }}>
              <h1 style={{ fontSize: '3rem', marginBottom: '5px' }}>MIND TRAP</h1>
              <p style={{ color: 'var(--text-light)', opacity: 0.8, letterSpacing: '2px' }}>THINK TWICE</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0', minHeight: '180px' }}>
              <Mascot3D state="idle" style={{ transform: 'scale(1.2)' }} />
            </div>

            <div style={{ padding: '0 20px' }}>
              <button className="btn-primary" style={{ width: '100%', padding: '1.5rem', fontSize: '1.5rem' }} onClick={() => switchNav('PLAY')}>
                PLAY NOW
              </button>
            </div>

            <div style={{ padding: '0 20px', marginTop: '20px' }}>
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'var(--accent-mint)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>🌟</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>Daily Challenge</h3>
                  <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Solve today's puzzle box!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLAY SELECTION (WORLD MAP) */}
        {nav === 'PLAY' && playState === 'IDLE' && (
          <div className="slide-up-fade flex-col gap-4 text-center">
            <div className="cinematic-header" style={{ justifyContent: 'center' }}>
              <h2 style={{ color: 'white' }}>World Progression</h2>
            </div>
            
            <div className="card-3d mt-4" style={{ margin: '0 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-deep)', padding: '20px', borderRadius: '50%', boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5)' }}>
                  <Mascot3D state="thinking" style={{ transform: 'scale(0.8)', margin: '-20px' }} />
                </div>
              </div>
              <h2 className="mb-2">Chapter 1: The Study Room</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Level 4 - Logic & Observation</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '4px', background: '#e0e0e0', zIndex: 1, transform: 'translateY(-50%)' }}></div>
                <div style={{ position: 'absolute', top: '50%', left: '0', width: '75%', height: '4px', background: 'var(--primary)', zIndex: 2, transform: 'translateY(-50%)' }}></div>
                
                {[1, 2, 3, 4, 5].map((level, i) => (
                  <div key={i} style={{ width: '30px', height: '30px', borderRadius: '50%', background: i < 3 ? 'var(--primary)' : i === 3 ? 'var(--accent-gold)' : '#e0e0e0', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', color: i < 3 ? 'white' : 'var(--text-main)', fontWeight: 'bold', boxShadow: i === 3 ? '0 0 15px var(--accent-gold)' : 'none', border: '3px solid white' }}>
                    {i < 3 ? '✓' : level}
                  </div>
                ))}
              </div>

              <button className="btn-primary" style={{ width: '100%' }} onClick={startLevel}>ENTER WORLD</button>
            </div>
          </div>
        )}

        {/* GAMEPLAY */}
        {nav === 'PLAY' && playState === 'PLAYING' && currentPuzzle && (
          <div className="slide-up-fade flex-col h-full" style={{ height: '100%' }}>
            <div className="cinematic-header">
              <div className="stat-pill-3d" style={{ color: 'var(--danger)' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} style={{ opacity: i < lives ? 1 : 0.2, filter: i < lives ? 'none' : 'grayscale(1)' }}>❤️</span>
                ))}
              </div>
              <div className="stat-pill-3d" style={{ color: 'var(--accent-gold)' }}>⭐ {score}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', minHeight: '160px' }}>
              <Mascot3D state={mascotState} />
            </div>

            <div className="card-3d mb-4" style={{ textAlign: 'center', margin: '0 20px', padding: '2rem 1rem' }}>
              <h2 style={{ lineHeight: 1.4 }}>{currentPuzzle.question}</h2>
            </div>

            <div className="flex-col gap-3" style={{ padding: '0 20px' }}>
              {shuffledOptions.map((opt, i) => {
                let btnClass = "tile-3d";
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
            
            <div style={{ textAlign: 'center', marginTop: '1rem', height: '30px' }}>
              {combo > 2 && <span style={{ color: 'var(--accent-gold)', fontWeight: 900, fontSize: '1.2rem', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>🔥 {combo} COMBO!</span>}
            </div>
          </div>
        )}

        {/* RESULT SCREEN */}
        {nav === 'PLAY' && playState === 'RESULT' && (
          <div className="slide-up-fade flex-col gap-4 text-center mt-4" style={{ padding: '0 20px' }}>
            <div className="cinematic-header" style={{ justifyContent: 'center' }}>
              <h1 style={{ color: lives <= 0 ? 'var(--danger)' : 'var(--accent-mint)', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                {lives <= 0 ? 'OUT OF LIVES' : 'LEVEL COMPLETE! 🎉'}
              </h1>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <Mascot3D state={lives <= 0 ? 'shocked' : 'happy'} style={{ transform: 'scale(1.2)' }} />
            </div>
            
            <div className="glass-card text-center mb-4">
              <h3 style={{ opacity: 0.8 }}>Final Score</h3>
              <h1 style={{ fontSize: '3.5rem', color: 'var(--accent-gold)', margin: '10px 0' }}>{score}</h1>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                <div><p style={{ opacity: 0.8 }}>🔥 Combo</p><h3>{combo}</h3></div>
                <div><p style={{ opacity: 0.8 }}>🪙 Coins</p><h3>+45</h3></div>
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', padding: '1.5rem' }} onClick={() => switchNav('HOME')}>
              {lives <= 0 ? 'TRY AGAIN' : 'NEXT LEVEL'}
            </button>
          </div>
        )}

        {/* PROFILE MOCK */}
        {nav === 'PROFILE' && (
          <div className="slide-up-fade text-center mt-4" style={{ padding: '0 20px' }}>
            <div className="cinematic-header" style={{ justifyContent: 'center' }}>
              <h2 style={{ color: 'white' }}>Player Profile</h2>
            </div>
            
            <div className="card-3d mb-4" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <Mascot3D state="idle" style={{ transform: 'scale(1)' }} />
              </div>
              <h2>Player One</h2>
              <p style={{ color: 'var(--text-muted)' }}>Level 5 Explorer</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                <div style={{ background: '#f0f0f5', padding: '15px', borderRadius: '15px' }}>
                  <h2 style={{ color: 'var(--primary)' }}>32</h2><p style={{ fontSize: '0.9rem' }}>Games</p>
                </div>
                <div style={{ background: '#f0f0f5', padding: '15px', borderRadius: '15px' }}>
                  <h2 style={{ color: 'var(--accent-mint)' }}>94%</h2><p style={{ fontSize: '0.9rem' }}>Accuracy</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      {renderNav()}
    </>
  );
}
