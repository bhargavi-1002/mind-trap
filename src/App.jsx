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
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'correct') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'wrong') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'win') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    }
  } catch(e) {}
};

// 3D Pixar Cute Princess Avatar (Emoji inside glowing orb - glitch free!)
const PrincessAvatar = ({ state, size = '80px' }) => {
  let emoji = '👸🏼';
  if (state === 'happy') emoji = '🥰';
  if (state === 'shocked') emoji = '😱';
  
  return (
    <div className={`princess-avatar ${state}`} style={{ width: size, height: size, fontSize: `calc(${size} * 0.6)` }}>
      {emoji}
    </div>
  );
};

const Particles = ({ active, type }) => {
  if (!active) return null;
  const emojis = type === 'correct' ? ['✨', '💖', '👑'] : ['💨'];
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="particle-burst" style={{
          '--tx': `${(Math.random() - 0.5) * 150}px`,
          '--ty': `${(Math.random() - 0.5) * -150}px`,
          left: '50%', top: '30%', fontSize: '2rem'
        }}>
          {emojis[Math.floor(Math.random() * emojis.length)]}
        </div>
      ))}
    </>
  );
};

export default function App() {
  const [nav, setNav] = useState('HOME'); // HOME, PLAY, LEADERBOARD, PROFILE
  const [playState, setPlayState] = useState('IDLE'); // IDLE, PLAYING, RESULT
  const [theme, setTheme] = useState('light');
  
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [playedPuzzles, setPlayedPuzzles] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  
  const [mascotState, setMascotState] = useState('');
  const [interactionState, setInteractionState] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'theme-dark' : '';
  }, [theme]);

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
        <div className="nav-icon">🏰</div><div>Castle</div>
      </div>
      <div className={`nav-item ${nav === 'PLAY' ? 'active' : ''}`} onClick={() => switchNav('PLAY')}>
        <div className="nav-icon">🧩</div><div>Play</div>
      </div>
      <div className={`nav-item ${nav === 'LEADERBOARD' ? 'active' : ''}`} onClick={() => switchNav('LEADERBOARD')}>
        <div className="nav-icon">👑</div><div>Royal Rank</div>
      </div>
      <div className={`nav-item ${nav === 'PROFILE' ? 'active' : ''}`} onClick={() => switchNav('PROFILE')}>
        <div className="nav-icon">👸</div><div>Profile</div>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ flex: 1, padding: '1.5rem', paddingBottom: '90px' }}>
        
        {/* HOME SCREEN */}
        {nav === 'HOME' && (
          <div className="slide-fade flex-col gap-4">
            <div className="top-header" style={{ padding: 0 }}>
              <div className="profile-pill">
                <div className="avatar">👸</div>
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Hello, Princess ✨</p>
                  <p style={{ fontWeight: 800 }}>Ready to play?</p>
                </div>
              </div>
              <div className="stats-pill">
                <div className="stat-badge">💖 3</div>
                <div className="stat-badge">🪙 120</div>
              </div>
            </div>

            <div className="hero-card" style={{ padding: 0, backgroundImage: 'url(/assets/princess_home_scene.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', height: '220px', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', width: '100%', padding: '2rem 1.5rem 1.5rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '2.5rem', marginBottom: '5px', color: 'white' }}>ROYAL TRAP</h1>
                  <p style={{ opacity: 0.9, color: '#f0f0f0' }}>"A Magical Puzzle."</p>
                </div>
                <button className="btn-primary" style={{ padding: '0.8rem 1.5rem' }} onClick={() => switchNav('PLAY')}>
                  PLAY NOW
                </button>
              </div>
            </div>

            <h3 style={{ marginTop: '10px' }}>Daily Magic Trap</h3>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '1rem' }} onClick={() => switchNav('PLAY')}>
              <div style={{ width: '80px', height: '80px', borderRadius: '15px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <img src="/assets/puzzle_box.jpg" alt="Daily Puzzle Box" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3>The Mystery Box</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Solve today's royal trick!</p>
                <div style={{ color: 'var(--accent-yellow)', fontWeight: 800, marginTop: '4px' }}>🔥 3 Day Streak</div>
              </div>
            </div>

            <h3 style={{ marginTop: '10px' }}>Continue Quest</h3>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }} onClick={() => switchNav('PLAY')}>
              <PrincessAvatar state="thinking" size="60px" />
              <div style={{ flex: 1 }}>
                <h3>Level 27</h3>
                <div style={{ background: 'var(--bg-main)', height: '8px', borderRadius: '4px', margin: '8px 0', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--primary)', width: '90%', height: '100%' }}></div>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>27 / 30 • Normal</p>
              </div>
            </div>

            <h3 style={{ marginTop: '10px' }}>Magic Modes</h3>
            <div className="mode-card">
              <div className="mode-icon">⚡</div>
              <div><h3>Quick Spell</h3><p style={{ color: 'var(--text-muted)' }}>Fast paced puzzles</p></div>
            </div>
            <div className="mode-card">
              <div className="mode-icon">🔮</div>
              <div><h3>Logic Lab</h3><p style={{ color: 'var(--text-muted)' }}>Test your reasoning</p></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <button className="btn-secondary" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                Toggle Night Magic ({theme})
              </button>
            </div>
          </div>
        )}

        {/* PLAY SELECTION & WORLD MAP */}
        {nav === 'PLAY' && playState === 'IDLE' && (
          <div className="slide-fade flex-col gap-4 text-center">
            <h1 style={{ marginTop: '20px' }}>Kingdom Progression</h1>
            <p style={{ color: 'var(--text-muted)' }}>Chapter 1: The Royal Study</p>
            
            <div className="world-map-container">
              {Array.from({ length: 6 }).map((_, i) => (
                <React.Fragment key={i}>
                  <div className={`level-node ${i < 3 ? 'completed' : i === 3 ? 'current' : ''}`}>
                    {i < 3 ? '✓' : i === 5 ? '🔒' : i + 1}
                  </div>
                  {i < 5 && <div className={`level-line ${i < 3 ? 'filled' : ''}`}></div>}
                </React.Fragment>
              ))}
            </div>

            <div className="card mt-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <PrincessAvatar state="thinking" size="120px" />
              <h2 className="mt-4 mb-2">Level 4</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Logic & Observation</p>
              <button className="btn-primary" style={{ width: '100%' }} onClick={startLevel}>START LEVEL</button>
            </div>
          </div>
        )}

        {/* GAMEPLAY */}
        {nav === 'PLAY' && playState === 'PLAYING' && currentPuzzle && (
          <div className="slide-fade flex-col h-full" style={{ height: '100%' }}>
            <div className="top-header" style={{ padding: '0 0 1rem 0' }}>
              <div style={{ display: 'flex', gap: '5px', fontSize: '1.5rem' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} style={{ opacity: i < lives ? 1 : 0.2, filter: i < lives ? 'none' : 'grayscale(1)' }}>💖</span>
                ))}
              </div>
              <div className="stat-badge" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>👑 {score}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', minHeight: '100px' }}>
              <PrincessAvatar state={mascotState} size="100px" />
            </div>

            <Particles active={!!interactionState} type={interactionState} />

            <div className="card mb-4" style={{ textAlign: 'center', padding: '2rem' }}>
              <h2 style={{ lineHeight: 1.4 }}>{currentPuzzle.question}</h2>
            </div>

            <div className="flex-col gap-2">
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
            
            <div style={{ textAlign: 'center', marginTop: '1rem', height: '30px' }}>
              {combo > 2 && <span style={{ color: 'var(--accent-yellow)', fontWeight: 800 }}>🔥 {combo} COMBO!</span>}
            </div>
          </div>
        )}

        {/* RESULT */}
        {nav === 'PLAY' && playState === 'RESULT' && (
          <div className="slide-fade flex-col gap-4 text-center mt-4">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PrincessAvatar state={lives <= 0 ? 'shocked' : 'happy'} size="150px" />
            </div>
            
            <h1 style={{ color: lives <= 0 ? 'var(--danger)' : 'var(--accent-mint)' }}>
              {lives <= 0 ? 'OH NO!' : 'ROYAL VICTORY! 🎉'}
            </h1>
            
            <div className="card text-center mb-4">
              <h3 style={{ color: 'var(--text-muted)' }}>Final Score</h3>
              <h1 style={{ fontSize: '3rem', color: 'var(--primary)', margin: '10px 0' }}>{score}</h1>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                <div><p>🔥 Combo</p><h3>{combo}</h3></div>
                <div><p>🪙 Coins</p><h3>+45</h3></div>
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={() => switchNav('HOME')}>
              {lives <= 0 ? 'TRY AGAIN' : 'NEXT LEVEL →'}
            </button>
            <button className="btn-secondary mt-2" style={{ width: '100%' }} onClick={() => switchNav('HOME')}>
              RETURN TO CASTLE
            </button>
          </div>
        )}

        {/* MOCK SCREENS */}
        {nav === 'LEADERBOARD' && (
          <div className="slide-fade text-center mt-4">
            <h1>Royal Rank</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Top Princesses</p>
            
            <div className="card" style={{ marginBottom: '10px', background: 'var(--accent-yellow)', color: '#2b2b45' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h2>🥇</h2><div className="avatar">👸🏼</div><h3 className="spacer" style={{textAlign:'left'}}>ElsaFan</h3><h2>9420</h2>
              </div>
            </div>
            <div className="card" style={{ marginBottom: '10px', background: '#d7d7d7', color: '#2b2b45' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h2>🥈</h2><div className="avatar">👸🏽</div><h3 className="spacer" style={{textAlign:'left'}}>MoanaPro</h3><h2>8100</h2>
              </div>
            </div>
            <div className="card" style={{ marginBottom: '10px', background: '#e0a96d', color: '#2b2b45' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h2>🥉</h2><div className="avatar">👸🏻</div><h3 className="spacer" style={{textAlign:'left'}}>SnowWhite</h3><h2>7530</h2>
              </div>
            </div>
            
            <div className="card mt-4" style={{ border: '2px solid var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h2>42</h2><div className="avatar">👸</div><h3 className="spacer" style={{textAlign:'left'}}>You</h3><h2>2100</h2>
              </div>
            </div>
          </div>
        )}

        {nav === 'PROFILE' && (
          <div className="slide-fade text-center mt-4">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <PrincessAvatar state="happy" size="120px" />
            </div>
            <h1>Princess Player</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Level 5 Explorer</p>
            
            <div className="card mb-4">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="stat-badge" style={{ flexDirection: 'column', padding: '15px' }}>
                  <h2 style={{ color: 'var(--primary)' }}>32</h2><p>Quests</p>
                </div>
                <div className="stat-badge" style={{ flexDirection: 'column', padding: '15px' }}>
                  <h2 style={{ color: 'var(--accent-mint)' }}>94%</h2><p>Magic</p>
                </div>
                <div className="stat-badge" style={{ flexDirection: 'column', padding: '15px' }}>
                  <h2 style={{ color: 'var(--accent-yellow)' }}>12</h2><p>Streak</p>
                </div>
                <div className="stat-badge" style={{ flexDirection: 'column', padding: '15px' }}>
                  <h2 style={{ color: 'var(--secondary)' }}>450</h2><p>Gold</p>
                </div>
              </div>
            </div>

            <h3 style={{ textAlign: 'left', marginBottom: '10px' }}>Treasures</h3>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              <div className="card" style={{ minWidth: '100px', textAlign: 'center', padding: '15px' }}>👑<br/>First Crown</div>
              <div className="card" style={{ minWidth: '100px', textAlign: 'center', padding: '15px' }}>💖<br/>True Love</div>
              <div className="card" style={{ minWidth: '100px', textAlign: 'center', padding: '15px' }}>🦄<br/>Magic Pro</div>
            </div>
          </div>
        )}

      </div>
      {renderNav()}
    </>
  );
}
