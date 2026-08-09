import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { PUZZLES } from './data/puzzles.js';

// Simple sound synthesizer using Web Audio API
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch(e) {
    console.log("Audio not supported or interaction required first");
  }
};

export default function App() {
  const [gameState, setGameState] = useState('HOME'); 
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [feedback, setFeedback] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [playedPuzzles, setPlayedPuzzles] = useState([]);
  const [theme, setTheme] = useState(''); // Default

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const getRandomPuzzle = () => {
    const available = PUZZLES.filter(p => !playedPuzzles.includes(p.id));
    if (available.length === 0) return null; // All played
    return available[Math.floor(Math.random() * available.length)];
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setCombo(0);
    setPlayedPuzzles([]);
    setGameState('PLAYING');
    
    const firstPuzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
    setupPuzzle(firstPuzzle);
  };

  const setupPuzzle = (puzzle) => {
    setCurrentPuzzle(puzzle);
    setFeedback(null);
    setTimeLeft(puzzle.timeLimit);
    if (!puzzle.requiresWait) {
      setShuffledOptions([...puzzle.options].sort(() => Math.random() - 0.5));
    } else {
      setShuffledOptions(puzzle.options);
    }
  };

  useEffect(() => {
    let timer;
    if (gameState === 'PLAYING' && timeLeft > 0 && !feedback && currentPuzzle) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (gameState === 'PLAYING' && timeLeft === 0 && !feedback && currentPuzzle) {
      if (currentPuzzle.requiresWait) {
        handleCorrectAnswer(); 
      } else {
        handleWrongAnswer("Time's up!");
      }
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, feedback, currentPuzzle]);

  const handleOptionClick = (option) => {
    if (feedback) return; 
    
    if (currentPuzzle.requiresWait) {
      handleWrongAnswer("You pressed it!");
    } else if (option.isCorrect) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };

  const handleCorrectAnswer = () => {
    playSound('correct');
    setFeedback('correct');
    const timeBonus = timeLeft * 10;
    const comboBonus = combo * 20;
    const pointsEarned = 100 + timeBonus + comboBonus;
    
    setScore(score + pointsEarned);
    setCombo(combo + 1);
    setPlayedPuzzles([...playedPuzzles, currentPuzzle.id]);

    setTimeout(() => nextPuzzle(), 1500);
  };

  const handleWrongAnswer = (customMessage = null) => {
    playSound('wrong');
    setFeedback('wrong');
    setCombo(0);
    const newLives = lives - 1;
    setLives(newLives);
    setPlayedPuzzles([...playedPuzzles, currentPuzzle.id]);

    if (newLives <= 0) {
      setTimeout(() => setGameState('GAMEOVER'), 1500);
    } else {
      setTimeout(() => nextPuzzle(), 1500);
    }
  };

  const nextPuzzle = () => {
    const nextP = getRandomPuzzle();
    if (!nextP) {
      setGameState('LEVEL_COMPLETE');
    } else {
      setupPuzzle(nextP);
    }
  };

  return (
    <div className="app-container fade-in">
      {gameState === 'HOME' && (
        <div style={{ textAlign: 'center', margin: 'auto' }}>
          <h1 className="floating" style={{ fontSize: '3.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>🧠 MIND TRAP</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--text-muted)' }}>"Can you outsmart your own brain?"</p>
          
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <p>🔥 Current Streak: 1</p>
            <p>⭐ Brain Points: {score}</p>
            <p>🎯 Player Level: 1</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn-primary" onClick={startGame}>PLAY</button>
            <button className="btn-secondary" onClick={() => setGameState('DAILY')}>DAILY TRAP</button>
            <button className="btn-secondary" onClick={() => setGameState('CHALLENGES')}>CHALLENGES</button>
            <button className="btn-secondary" onClick={() => setGameState('LEADERBOARD')}>LEADERBOARD</button>
          </div>

          <div className="theme-selector fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="theme-dot" style={{ background: '#9d4edd' }} onClick={() => setTheme('')}></div>
            <div className="theme-dot" style={{ background: '#0077b6' }} onClick={() => setTheme('theme-ocean')}></div>
            <div className="theme-dot" style={{ background: '#d00000' }} onClick={() => setTheme('theme-lava')}></div>
            <div className="theme-dot" style={{ background: '#39ff14' }} onClick={() => setTheme('theme-neon')}></div>
          </div>
        </div>
      )}

      {gameState === 'PLAYING' && currentPuzzle && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.5rem' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} style={{ opacity: i < lives ? 1 : 0.2, filter: i < lives ? 'none' : 'grayscale(1)' }}>❤️</span>
              ))}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>SCORE: {score}</div>
          </div>
          
          <div style={{ height: '30px' }}>
            {combo > 2 && (
               <div className="pop" style={{ color: 'var(--warning)', fontWeight: 'bold', textAlign: 'center' }}>
                 🔥 {combo} COMBO!
               </div>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className={`glass-card ${feedback === 'wrong' ? 'shake' : ''}`} style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '1rem' }}>
                {timeLeft}s
              </div>
              
              <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', lineHeight: '1.4' }}>
                {currentPuzzle.question}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {shuffledOptions.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => handleOptionClick(opt)}
                    className="option-btn"
                    style={{
                      backgroundColor: opt.color && opt.color !== 'transparent' ? opt.color : 'rgba(255,255,255,0.05)',
                      color: opt.color === 'transparent' ? 'transparent' : 'white',
                      border: opt.color === 'transparent' ? 'none' : ''
                    }}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
              
              <div style={{ height: '40px', marginTop: '1rem' }}>
                {feedback === 'correct' && (
                  <div className="pop" style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    🧠 Nice. Your brain survived.
                  </div>
                )}
                {feedback === 'wrong' && (
                  <div className="pop" style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    😈 Your brain fell for it.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOCK SCREENS */}
      {['LEADERBOARD', 'CHALLENGES', 'DAILY'].includes(gameState) && (
        <div className="fade-in" style={{ textAlign: 'center', margin: 'auto' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>{gameState}</h1>
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
              {gameState === 'LEADERBOARD' && "Coming soon! Connect with Firebase to see global rankings."}
              {gameState === 'CHALLENGES' && "Generate a code and challenge your friends. (Coming in V2)"}
              {gameState === 'DAILY' && "One puzzle. One chance. Check back tomorrow!"}
            </p>
          </div>
          <button className="btn-secondary" onClick={() => setGameState('HOME')}>BACK TO HOME</button>
        </div>
      )}

      {gameState === 'GAMEOVER' && (
        <div className="fade-in" style={{ textAlign: 'center', margin: 'auto' }}>
          <h1 className="shake" style={{ fontSize: '3.5rem', color: 'var(--danger)', marginBottom: '1rem' }}>GAME OVER</h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Final Score: {score}</p>
          <button className="btn-primary" onClick={startGame}>TRY AGAIN</button>
          <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setGameState('HOME')}>HOME</button>
        </div>
      )}

      {gameState === 'LEVEL_COMPLETE' && (
        <div className="fade-in" style={{ textAlign: 'center', margin: 'auto' }}>
          <h1 className="pop" style={{ fontSize: '3rem', color: 'var(--success)', marginBottom: '1rem' }}>WORLD CLEAR!</h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>You survived! Score: {score}</p>
          <button className="btn-primary" onClick={() => setGameState('HOME')}>HOME</button>
        </div>
      )}
    </div>
  );
}
