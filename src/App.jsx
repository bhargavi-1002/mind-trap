import React, { useState, useEffect } from 'react';
import './index.css';
import { PUZZLES } from './data/puzzles.js';

// Audio Context
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    
    if (type === 'portal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc.start(); osc.stop(ctx.currentTime + 1);
    } else if (type === 'correct') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    }
  } catch(e) {}
};

// Mascot Component (Brain Explorer)
const Mascot = ({ state }) => {
  return (
    <div className={`explorer ${state}`}>
      <div className="explorer-head">
        <div className="explorer-eyes">
          <div className="eye"></div>
          <div className="eye"></div>
        </div>
      </div>
      <div className="explorer-body"></div>
      <div className="hologram-ring"></div>
    </div>
  );
};

export default function App() {
  const [appState, setAppState] = useState('HOME'); // HOME, MAP, GAME, RESULT
  const [cameraState, setCameraState] = useState('camera-normal');
  const [mascotState, setMascotState] = useState('idle'); // idle, thinking, happy, shocked
  
  // Game State
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [playedPuzzles, setPlayedPuzzles] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [interactionState, setInteractionState] = useState(null); // 'correct', 'wrong'

  const enterWorld = () => {
    playSound('portal');
    setCameraState('camera-zoom-in');
    setTimeout(() => {
      setAppState('MAP');
      setCameraState('camera-normal');
    }, 1000);
  };

  const startLevel = () => {
    playSound('portal');
    setCameraState('camera-zoom-in');
    setTimeout(() => {
      setScore(0); setLives(3); setCombo(0); setPlayedPuzzles([]);
      setAppState('GAME');
      setCameraState('camera-normal');
      nextPuzzle(true);
    }, 1000);
  };

  const nextPuzzle = (isFirst = false) => {
    setInteractionState(null);
    setMascotState('thinking');
    
    const available = PUZZLES.filter(p => !playedPuzzles.includes(p.id));
    if (available.length === 0) {
      setAppState('RESULT');
      return;
    }
    
    const puzzle = available[Math.floor(Math.random() * available.length)];
    setCurrentPuzzle(puzzle);
    
    if (!puzzle.requiresWait) {
      setShuffledOptions([...puzzle.options].sort(() => Math.random() - 0.5));
    } else {
      setShuffledOptions(puzzle.options);
    }
  };

  const handleInteract = (option) => {
    if (interactionState) return;
    
    if (currentPuzzle.requiresWait || !option.isCorrect) {
      playSound('wrong');
      setInteractionState('wrong');
      setMascotState('shocked');
      setCombo(0);
      const newLives = lives - 1;
      setLives(newLives);
      setPlayedPuzzles([...playedPuzzles, currentPuzzle.id]);
      
      setTimeout(() => {
        if (newLives <= 0) setAppState('RESULT');
        else nextPuzzle();
      }, 2000);
    } else {
      playSound('correct');
      setInteractionState('correct');
      setMascotState('happy');
      setScore(score + 150 + (combo * 50));
      setCombo(combo + 1);
      setPlayedPuzzles([...playedPuzzles, currentPuzzle.id]);
      
      setTimeout(() => {
        nextPuzzle();
      }, 1500);
    }
  };

  return (
    <div className={cameraState} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
      <div className="universe-bg"></div>
      <div className="stars"></div>
      <div className="giant-brain"></div>

      {appState === 'HOME' && (
        <div className="cinematic-screen fade-enter-active">
          <Mascot state="idle" />
          <div className="game-logo">MIND<br/>TRAP</div>
          <div className="game-tagline">THE BRAINVERSE</div>
          
          <div className="portal-container" onClick={enterWorld}>
            <div className="portal-ring"></div>
            <div className="portal-ring"></div>
            <div className="portal-text">ENTER</div>
          </div>
        </div>
      )}

      {appState === 'MAP' && (
        <div className="cinematic-screen fade-enter-active">
          <div className="hud-top">
            <div className="hud-item">WORLD MAP</div>
          </div>
          <div className="map-container">
            <div className="island" onClick={startLevel}>
              <div className="island-title">ISLAND 01<br/>THE CURIOUS MIND</div>
            </div>
            <div className="island" style={{ filter: 'grayscale(1)', opacity: 0.5 }}>
              <div className="island-title">ISLAND 02<br/>LOCKED</div>
            </div>
          </div>
        </div>
      )}

      {appState === 'GAME' && currentPuzzle && (
        <div className="cinematic-screen fade-enter-active">
          <div className="hud-top">
            <div className="hud-item" style={{ color: 'var(--danger)' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>❤️</span>
              ))}
            </div>
            <div className="hud-item" style={{ color: 'var(--gold)' }}>SCORE: {score}</div>
          </div>

          <div className="puzzle-room">
            <Mascot state={mascotState} />
            
            <div className="hologram-question">
              <h2>{currentPuzzle.question}</h2>
              {interactionState === 'correct' && <h3 style={{ color: 'var(--neon-cyan)', marginTop: '10px' }}>SYSTEM BYPASSED</h3>}
              {interactionState === 'wrong' && <h3 style={{ color: 'var(--neon-magenta)', marginTop: '10px' }}>TRAP TRIGGERED</h3>}
            </div>

            <div className="objects-container">
              {shuffledOptions.map((opt, i) => (
                <div 
                  key={i} 
                  className="floating-object"
                  onClick={() => handleInteract(opt)}
                  style={{
                    backgroundColor: opt.color && opt.color !== 'transparent' ? opt.color : '',
                    borderColor: interactionState && opt.isCorrect ? 'var(--neon-cyan)' : '',
                    boxShadow: interactionState && opt.isCorrect ? '0 0 50px var(--neon-cyan)' : '',
                    opacity: interactionState && !opt.isCorrect ? 0.2 : 1
                  }}
                >
                  {opt.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {appState === 'RESULT' && (
        <div className="cinematic-screen fade-enter-active">
          <Mascot state={lives <= 0 ? 'shocked' : 'happy'} />
          <div className="result-hologram">
            <h1>{lives <= 0 ? 'SYSTEM FAILURE' : 'WORLD CLEAR'}</h1>
            <p>FINAL SCORE: {score}</p>
            <p>MAX COMBO: {combo}</p>
            <div style={{ marginTop: '30px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <div className="floating-object" onClick={() => setAppState('HOME')} style={{ width: 'auto', padding: '10px 30px', height: 'auto' }}>
                RETURN TO NEXUS
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
