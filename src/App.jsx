import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { PUZZLES } from './data/puzzles.js';

const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); 
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'tap') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    }
  } catch(e) {}
};

const Mascot = ({ state }) => {
  let emoji = '🧠';
  let className = 'mascot';
  let message = '';

  if (state === 'happy') { emoji = '🤩'; className += ' happy'; message = 'Perfect!'; }
  else if (state === 'shocked') { emoji = '😱'; className += ' shocked'; message = 'Gotcha! 👀'; }
  else if (state === 'thinking') { emoji = '🤔'; message = 'Think carefully...'; }
  else if (state === 'dead') { emoji = '😵'; className += ' shocked'; message = 'Brain Fried.'; }

  return (
    <div className="mascot-container">
      {message && <div className="speech-bubble pop-in">{message}</div>}
      <div className={className}>{emoji}</div>
    </div>
  );
};

const Particles = ({ active, type }) => {
  if (!active) return null;
  const chars = type === 'correct' ? ['⭐', '✨', '🔥'] : ['❌', '💀', '💨'];
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="particle" style={{
          '--tx': `${(Math.random() - 0.5) * 200}px`,
          '--ty': `${(Math.random() - 0.5) * 200}px`,
          left: '50%', top: '50%'
        }}>
          {chars[Math.floor(Math.random() * chars.length)]}
        </div>
      ))}
    </>
  );
};

export default function App() {
  const [gameState, setGameState] = useState('HOME'); // HOME, PLAY, PROFILE, RANK
  const [playState, setPlayState] = useState('IDLE'); // IDLE, PLAYING, GAMEOVER, LEVEL_COMPLETE
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [mascotState, setMascotState] = useState('idle');
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [playedPuzzles, setPlayedPuzzles] = useState([]);
  const [theme, setTheme] = useState('');
  const [particleEvent, setParticleEvent] = useState(null);

  useEffect(() => { document.body.className = theme; }, [theme]);

  const navTo = (screen) => {
    playSound('tap');
    setGameState(screen);
    if (screen === 'PLAY') setPlayState('IDLE');
  };

  const getRandomPuzzle = () => {
    const available = PUZZLES.filter(p => !playedPuzzles.includes(p.id));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  };

  const startGame = () => {
    playSound('tap');
    setScore(0); setLives(3); setCombo(0); setPlayedPuzzles([]);
    setPlayState('PLAYING');
    setupPuzzle(PUZZLES[Math.floor(Math.random() * PUZZLES.length)]);
  };

  const setupPuzzle = (puzzle) => {
    setCurrentPuzzle(puzzle);
    setMascotState(puzzle.type === 'logic' ? 'thinking' : 'idle');
    setTimeLeft(puzzle.timeLimit);
    setParticleEvent(null);
    if (!puzzle.requiresWait) {
      setShuffledOptions([...puzzle.options].sort(() => Math.random() - 0.5));
    } else {
      setShuffledOptions(puzzle.options);
    }
  };

  useEffect(() => {
    let timer;
    if (playState === 'PLAYING' && timeLeft > 0 && !particleEvent) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      if (timeLeft <= 3) setMascotState('shocked');
    } else if (playState === 'PLAYING' && timeLeft === 0 && !particleEvent) {
      if (currentPuzzle?.requiresWait) handleCorrectAnswer(); 
      else handleWrongAnswer();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, playState, particleEvent, currentPuzzle]);

  const handleOptionClick = (option) => {
    if (particleEvent) return;
    if (currentPuzzle.requiresWait) handleWrongAnswer();
    else if (option.isCorrect) handleCorrectAnswer();
    else handleWrongAnswer();
  };

  const handleCorrectAnswer = () => {
    playSound('correct');
    setMascotState('happy');
    setParticleEvent('correct');
    const points = 100 + (timeLeft * 10) + (combo * 20);
    setScore(score + points);
    setCombo(combo + 1);
    setPlayedPuzzles([...playedPuzzles, currentPuzzle.id]);
    setTimeout(() => nextPuzzle(), 1200);
  };

  const handleWrongAnswer = () => {
    playSound('wrong');
    setMascotState('shocked');
    setParticleEvent('wrong');
    setCombo(0);
    const newLives = lives - 1;
    setLives(newLives);
    setPlayedPuzzles([...playedPuzzles, currentPuzzle.id]);

    setTimeout(() => {
      if (newLives <= 0) {
        setMascotState('dead');
        setPlayState('GAMEOVER');
      } else {
        nextPuzzle();
      }
    }, 1500);
  };

  const nextPuzzle = () => {
    const nextP = getRandomPuzzle();
    if (!nextP) setPlayState('LEVEL_COMPLETE');
    else setupPuzzle(nextP);
  };

  const renderNav = () => (
    <div className="bottom-nav">
      <div className={`nav-item ${gameState === 'HOME' ? 'active' : ''}`} onClick={() => navTo('HOME')}>
        <div className="nav-icon">🏠</div><div>HOME</div>
      </div>
      <div className={`nav-item ${gameState === 'PLAY' ? 'active' : ''}`} onClick={() => navTo('PLAY')}>
        <div className="nav-icon">🧠</div><div>PLAY</div>
      </div>
      <div className={`nav-item ${gameState === 'RANK' ? 'active' : ''}`} onClick={() => navTo('RANK')}>
        <div className="nav-icon">🏆</div><div>RANK</div>
      </div>
      <div className={`nav-item ${gameState === 'PROFILE' ? 'active' : ''}`} onClick={() => navTo('PROFILE')}>
        <div className="nav-icon">👤</div><div>PROFILE</div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-elements">
        <span className="floating-icon" style={{ left: '10%', animationDelay: '0s' }}>❓</span>
        <span className="floating-icon" style={{ left: '80%', animationDelay: '2s' }}>🧩</span>
        <span className="floating-icon" style={{ left: '50%', animationDelay: '5s' }}>💡</span>
        <span className="floating-icon" style={{ left: '20%', animationDelay: '7s' }}>⚡</span>
        <span className="floating-icon" style={{ left: '70%', animationDelay: '9s' }}>🎲</span>
      </div>

      <div className="app-content">
        {gameState === 'HOME' && (
          <div className="slide-up" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Mascot state="happy" />
            <h1 className="pop-in" style={{ color: 'var(--text-light)', marginBottom: '5px' }}>MIND TRAP</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>"Your brain is the trap."</p>
            
            <button className="btn-primary" style={{ width: '100%', marginBottom: '1rem', padding: '1.5rem', fontSize: '1.5rem' }} onClick={() => navTo('PLAY')}>
              ▶ PLAY NOW
            </button>

            <div className="theme-selector">
              <div className="theme-dot" style={{ background: '#9d4edd' }} onClick={() => setTheme('')}></div>
              <div className="theme-dot" style={{ background: '#0077b6' }} onClick={() => setTheme('theme-ocean')}></div>
              <div className="theme-dot" style={{ background: '#d00000' }} onClick={() => setTheme('theme-lava')}></div>
              <div className="theme-dot" style={{ background: '#39ff14' }} onClick={() => setTheme('theme-neon')}></div>
            </div>
          </div>
        )}

        {gameState === 'PLAY' && playState === 'IDLE' && (
          <div className="slide-up" style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>WORLD 1</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Brain Beginner</p>
            <button className="btn-primary" style={{ width: '100%', padding: '1.5rem' }} onClick={startGame}>START LEVEL</button>
          </div>
        )}

        {gameState === 'PLAY' && playState === 'PLAYING' && currentPuzzle && (
          <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="hud">
              <div>
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} style={{ fontSize: '1.5rem', opacity: i < lives ? 1 : 0.3, filter: i < lives ? 'none' : 'grayscale(1)' }}>❤️</span>
                ))}
              </div>
              <div className={`timer ${timeLeft <= 3 ? 'danger' : ''}`}>⏱️ {timeLeft}</div>
              <div style={{ fontWeight: 'bold' }}>⭐ {score}</div>
            </div>
            
            <div style={{ height: '30px', textAlign: 'center', marginBottom: '10px' }}>
              {combo > 2 && <div className="pop-in" style={{ color: 'var(--warning)', fontWeight: 'bold', fontSize: '1.2rem' }}>🔥 {combo} COMBO!</div>}
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
              <Particles active={!!particleEvent} type={particleEvent} />
              <Mascot state={mascotState} />
              
              <div className={`cartoon-card ${particleEvent === 'wrong' ? 'shakeBtn' : ''}`}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                  {currentPuzzle.question}
                </h2>
                
                <div className={currentPuzzle.options.length <= 2 ? "col-1" : "grid-2"}>
                  {shuffledOptions.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => handleOptionClick(opt)}
                      className={`btn-option ${particleEvent ? (opt.isCorrect ? 'correct' : 'wrong') : ''}`}
                      style={{
                        backgroundColor: opt.color && opt.color !== 'transparent' ? opt.color : '',
                        color: opt.color === 'transparent' ? 'transparent' : 'white',
                        border: opt.color === 'transparent' ? 'none' : ''
                      }}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === 'PLAY' && playState === 'GAMEOVER' && (
          <div className="slide-up" style={{ textAlign: 'center', margin: 'auto' }}>
            <Mascot state="dead" />
            <h1 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>GAME OVER</h1>
            <div className="cartoon-card" style={{ marginBottom: '2rem' }}>
              <h2>Final Score: {score}</h2>
            </div>
            <button className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }} onClick={startGame}>TRY AGAIN</button>
          </div>
        )}

        {gameState === 'PLAY' && playState === 'LEVEL_COMPLETE' && (
          <div className="slide-up" style={{ textAlign: 'center', margin: 'auto' }}>
            <Mascot state="happy" />
            <h1 className="pop-in" style={{ color: 'var(--success)', marginBottom: '1rem' }}>WORLD CLEAR!</h1>
            <div className="cartoon-card" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--warning)' }}>⭐ {score}</h2>
              <p style={{ color: 'var(--text-muted)' }}>XP Earned: +250</p>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setGameState('HOME')}>CONTINUE</button>
          </div>
        )}

        {gameState === 'RANK' && (
          <div className="slide-up" style={{ textAlign: 'center' }}>
            <h1 style={{ marginBottom: '2rem' }}>LEADERBOARD</h1>
            <div className="cartoon-card" style={{ marginBottom: '1rem', background: 'var(--warning)' }}>
              <h2>🥇 Player One</h2>
              <p>Score: 99,999</p>
            </div>
            <div className="cartoon-card" style={{ marginBottom: '1rem', background: '#c0c0c0' }}>
              <h2>🥈 Player Two</h2>
              <p>Score: 88,888</p>
            </div>
            <div className="cartoon-card" style={{ background: '#cd7f32' }}>
              <h2>🥉 Player Three</h2>
              <p>Score: 77,777</p>
            </div>
          </div>
        )}

        {gameState === 'PROFILE' && (
          <div className="slide-up" style={{ textAlign: 'center' }}>
            <Mascot state="idle" />
            <h1 style={{ marginBottom: '2rem' }}>YOUR PROFILE</h1>
            <div className="cartoon-card">
              <h2 style={{ marginBottom: '1rem' }}>Level 5 Genius</h2>
              <div className="grid-2">
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '15px' }}>
                  <h3>🔥 12</h3><p>Best Streak</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '15px' }}>
                  <h3>🎯 94%</h3><p>Accuracy</p>
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
