import React, { useState, useEffect } from 'react';
import './index.css';

// Small initial puzzle database for V1
const PUZZLES = [
  {
    id: 1,
    type: 'meta',
    question: 'Tap the green button.',
    options: [
      { text: 'RED', color: 'green', isCorrect: true },
      { text: 'GREEN', color: 'red', isCorrect: false },
      { text: 'BLUE', color: 'blue', isCorrect: false }
    ],
    timeLimit: 7
  },
  {
    id: 2,
    type: 'logic',
    question: 'Some months have 31 days. How many have 28?',
    options: [
      { text: '1', isCorrect: false },
      { text: '12', isCorrect: true },
      { text: '6', isCorrect: false },
      { text: 'Depends on leap year', isCorrect: false }
    ],
    timeLimit: 10
  },
  {
    id: 3,
    type: 'trick',
    question: 'Don\\'t press the button.',
    options: [
      { text: 'PRESS ME', isCorrect: false }
    ],
    timeLimit: 5,
    requiresWait: true // player must wait out the timer
  },
  {
    id: 4,
    type: 'math',
    question: 'What is half of 2 plus 2?',
    options: [
      { text: '2', isCorrect: false },
      { text: '3', isCorrect: true },
      { text: '4', isCorrect: false },
      { text: '1', isCorrect: false }
    ],
    timeLimit: 10
  }
  // We can add more puzzles easily later.
];

export default function App() {
  const [gameState, setGameState] = useState('HOME'); // HOME, PLAYING, GAMEOVER, LEVEL_COMPLETE
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', null
  const [shuffledOptions, setShuffledOptions] = useState([]);
  
  const currentPuzzle = PUZZLES[currentPuzzleIndex];

  const startGame = () => {
    setScore(0);
    setLives(3);
    setCombo(0);
    setCurrentPuzzleIndex(0);
    setGameState('PLAYING');
    setupPuzzle(PUZZLES[0]);
  };

  const setupPuzzle = (puzzle) => {
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
    if (gameState === 'PLAYING' && timeLeft > 0 && !feedback) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (gameState === 'PLAYING' && timeLeft === 0 && !feedback) {
      // Time out logic
      if (currentPuzzle.requiresWait) {
        handleCorrectAnswer(); // Survived the trick
      } else {
        handleWrongAnswer("Time's up!");
      }
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, feedback]);

  const handleOptionClick = (option) => {
    if (feedback) return; // Prevent double clicks
    
    if (currentPuzzle.requiresWait) {
      handleWrongAnswer("You pressed it!");
    } else if (option.isCorrect) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };

  const handleCorrectAnswer = () => {
    setFeedback('correct');
    const timeBonus = timeLeft * 10;
    const comboBonus = combo * 20;
    const pointsEarned = 100 + timeBonus + comboBonus;
    
    setScore(score + pointsEarned);
    setCombo(combo + 1);

    setTimeout(() => nextPuzzle(), 1500);
  };

  const handleWrongAnswer = (customMessage = null) => {
    setFeedback('wrong');
    setCombo(0);
    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0) {
      setTimeout(() => setGameState('GAMEOVER'), 1500);
    } else {
      setTimeout(() => nextPuzzle(), 1500);
    }
  };

  const nextPuzzle = () => {
    const nextIndex = currentPuzzleIndex + 1;
    if (nextIndex >= PUZZLES.length) {
      setGameState('LEVEL_COMPLETE');
    } else {
      setCurrentPuzzleIndex(nextIndex);
      setupPuzzle(PUZZLES[nextIndex]);
    }
  };

  return (
    <div className="app-container fade-in">
      {gameState === 'HOME' && (
        <div style={{ textAlign: 'center', margin: 'auto' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>🧠 MIND TRAP</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--text-muted)' }}>"Can you outsmart your own brain?"</p>
          
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <p>🔥 Current Streak: 1</p>
            <p>⭐ Brain Points: 0</p>
            <p>🎯 Player Level: 1</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn-primary" onClick={startGame}>PLAY</button>
            <button className="btn-secondary">DAILY TRAP</button>
            <button className="btn-secondary">CHALLENGES</button>
            <button className="btn-secondary">LEADERBOARD</button>
          </div>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.5rem' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} style={{ opacity: i < lives ? 1 : 0.3 }}>❤️</span>
              ))}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>SCORE: {score}</div>
          </div>
          
          {combo > 2 && (
             <div className="pop" style={{ color: 'var(--warning)', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem' }}>
               🔥 {combo} COMBO!
             </div>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className={`glass-card ${feedback === 'wrong' ? 'shake' : ''}`} style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '1rem' }}>
                {timeLeft}s
              </div>
              
              <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
                {currentPuzzle.question}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {shuffledOptions.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => handleOptionClick(opt)}
                    style={{
                      backgroundColor: opt.color ? opt.color : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      fontSize: '1.2rem',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
              
              {feedback === 'correct' && (
                <div className="pop" style={{ marginTop: '1rem', color: 'var(--success)', fontWeight: 'bold', fontSize: '1.5rem' }}>
                  🧠 Nice. Your brain survived that one.
                </div>
              )}
              {feedback === 'wrong' && (
                <div className="pop" style={{ marginTop: '1rem', color: 'var(--danger)', fontWeight: 'bold', fontSize: '1.5rem' }}>
                  😈 Your brain fell for it.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {gameState === 'GAMEOVER' && (
        <div style={{ textAlign: 'center', margin: 'auto' }}>
          <h1 style={{ fontSize: '3rem', color: 'var(--danger)', marginBottom: '1rem' }}>GAME OVER</h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Final Score: {score}</p>
          <button className="btn-primary" onClick={startGame}>TRY AGAIN</button>
          <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setGameState('HOME')}>HOME</button>
        </div>
      )}

      {gameState === 'LEVEL_COMPLETE' && (
        <div style={{ textAlign: 'center', margin: 'auto' }}>
          <h1 style={{ fontSize: '3rem', color: 'var(--success)', marginBottom: '1rem' }}>LEVEL COMPLETE!</h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Score: {score}</p>
          <button className="btn-primary" onClick={() => setGameState('HOME')}>HOME</button>
        </div>
      )}
    </div>
  );
}
