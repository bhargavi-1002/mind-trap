import re

with open('/data/data/com.termux/files/home/mind-trap/src/App.jsx', 'r') as f:
    code = f.read()

# Add states
state_addition = """
  const allTopics = [...new Set(PUZZLES.map(p => p.category))];
  const [selectedTopics, setSelectedTopics] = useState(allTopics);
  const [selectedLevels, setSelectedLevels] = useState([1, 2, 3]);
  const [setupMode, setSetupMode] = useState(false);
  const [pendingGameMode, setPendingGameMode] = useState(null);
"""
code = code.replace("const [flashScreen, setFlashScreen] = useState(null);", "const [flashScreen, setFlashScreen] = useState(null);" + state_addition)

# Modify startGame
start_game_orig = """  const startGame = (mode) => {
    playSound('tap');
    setGameMode(mode);
    setScore(0);
    setDisplayScore(0);
    setStreak(0);
    setQuestionsAnswered(0);
    setLives(mode === 'MARATHON' ? 3 : 1);
    nextPuzzle();
  };"""

start_game_new = """  const startGame = (mode) => {
    playSound('tap');
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
    setPendingGameMode(mode);
    setSetupMode(true);
  };
  
  const toggleTopic = (topic) => {
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };
  
  const toggleLevel = (level) => {
    setSelectedLevels(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]);
  };
"""
code = code.replace(start_game_orig, start_game_new)

# Modify nextPuzzle
next_puzzle_orig = """    let available = PUZZLES.filter(p => !playedPuzzles.includes(p.id));
    
    // If all puzzles played, reset the list!
    if (available.length === 0) {
      setPlayedPuzzles([]);
      available = [...PUZZLES];
    }"""
    
next_puzzle_new = """    let filteredPuzzles = PUZZLES.filter(p => selectedTopics.includes(p.category) && selectedLevels.includes(p.difficulty));
    if (filteredPuzzles.length === 0) {
       filteredPuzzles = PUZZLES; // fallback if empty
    }
    let available = filteredPuzzles.filter(p => !playedPuzzles.includes(p.id));
    
    // If all puzzles played, reset the list!
    if (available.length === 0) {
      setPlayedPuzzles([]);
      available = [...filteredPuzzles];
    }"""
code = code.replace(next_puzzle_orig, next_puzzle_new)

# Modify Home Screen HTML to use initiateGame
code = code.replace("onClick={() => startGame('QUICK')}", "onClick={() => initiateGame('QUICK')}")
code = code.replace("onClick={() => startGame('MARATHON')}", "onClick={() => initiateGame('MARATHON')}")

# Add Setup Mode UI
setup_ui = """
        {nav === 'HOME' && playState === 'IDLE' && setupMode && (
          <div className="slide-fade flex-col gap-4">
            <h1 style={{ fontSize: '2rem', marginTop: '10px' }}>Setup Mode</h1>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Select Topics</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {allTopics.map(topic => (
                  <button 
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    style={{
                      padding: '8px 15px', 
                      borderRadius: '15px', 
                      border: 'none',
                      background: selectedTopics.includes(topic) ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      color: selectedTopics.includes(topic) ? '#000' : '#fff',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              <h3 style={{ marginBottom: '10px' }}>Select Levels</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {[1, 2, 3].map(level => (
                  <button 
                    key={level}
                    onClick={() => toggleLevel(level)}
                    style={{
                      padding: '8px 15px', 
                      borderRadius: '15px', 
                      border: 'none',
                      background: selectedLevels.includes(level) ? 'var(--secondary)' : 'rgba(255,255,255,0.1)',
                      color: selectedLevels.includes(level) ? '#000' : '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    Level {level}
                  </button>
                ))}
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <button className="btn-answer" style={{ flex: 1, padding: '1rem' }} onClick={() => setSetupMode(false)}>
                  Cancel
                </button>
                <button 
                   className="btn-primary" 
                   style={{ flex: 1, padding: '1rem' }} 
                   onClick={() => {
                     setSetupMode(false);
                     startGame(pendingGameMode);
                   }}
                   disabled={selectedTopics.length === 0 || selectedLevels.length === 0}
                >
                  Start!
                </button>
              </div>
            </div>
          </div>
        )}
"""

code = code.replace("{/* SETTINGS SCREEN */}", setup_ui + "\n        {/* SETTINGS SCREEN */}")
code = code.replace("nav === 'HOME' && playState === 'IDLE' && (", "nav === 'HOME' && playState === 'IDLE' && !setupMode && (")

with open('/data/data/com.termux/files/home/mind-trap/src/App.jsx', 'w') as f:
    f.write(code)

