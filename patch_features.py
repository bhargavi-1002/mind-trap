import re

with open('/data/data/com.termux/files/home/mind-trap/src/App.jsx', 'r') as f:
    code = f.read()

# 1. Update playSound and add playHaptic
sound_code = """const playSound = (type) => {
  if (localStorage.getItem('mt_sound') === 'false') return;
  try {
"""
code = code.replace("const playSound = (type) => {\n  try {", sound_code)

haptic_code = """
const playHaptic = (pattern = 50) => {
  if (localStorage.getItem('mt_haptics') === 'false') return;
  if (navigator.vibrate) navigator.vibrate(pattern);
};
"""
code = code.replace("export default function App() {", haptic_code + "\nexport default function App() {")

# 2. Settings states
settings_state = """  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('mt_sound') !== 'false');
  const [hapticsEnabled, setHapticsEnabled] = useState(() => localStorage.getItem('mt_haptics') !== 'false');
  
  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem('mt_sound', newVal ? 'true' : 'false');
  };
  
  const toggleHaptics = () => {
    const newVal = !hapticsEnabled;
    setHapticsEnabled(newVal);
    localStorage.setItem('mt_haptics', newVal ? 'true' : 'false');
  };
"""
code = code.replace("const [flashScreen, setFlashScreen] = useState(null);", "const [flashScreen, setFlashScreen] = useState(null);\n" + settings_state)

# 3. Add playHaptic to some actions
code = code.replace("playSound('tap');", "playSound('tap');\n    playHaptic();")
code = code.replace("playSound('boop');", "playSound('boop');\n    playHaptic([30, 50, 30]);")
code = code.replace("playSound('correct');", "playSound('correct');\n      playHaptic([50, 50, 50]);")
code = code.replace("playSound('trap');", "playSound('trap');\n      playHaptic([100, 50, 100]);")

# 4. Settings UI
settings_ui_orig = """              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
              </div>"""

settings_ui_new = """              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} onClick={toggleSound}>
                <h3>Sound Effects</h3>
                <div style={{ width: '50px', height: '26px', background: soundEnabled ? 'var(--secondary)' : 'rgba(255,255,255,0.2)', borderRadius: '15px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                  <div style={{ width: '22px', height: '22px', background: '#111318', borderRadius: '50%', position: 'absolute', left: soundEnabled ? '26px' : '2px', top: '2px', transition: 'left 0.3s' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} onClick={toggleHaptics}>
                <h3>Haptic Feedback</h3>
                <div style={{ width: '50px', height: '26px', background: hapticsEnabled ? 'var(--secondary)' : 'rgba(255,255,255,0.2)', borderRadius: '15px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                  <div style={{ width: '22px', height: '22px', background: '#111318', borderRadius: '50%', position: 'absolute', left: hapticsEnabled ? '26px' : '2px', top: '2px', transition: 'left 0.3s' }}></div>
                </div>
              </div>"""
code = code.replace(settings_ui_orig, settings_ui_new)

# 5. Pause Logic
pause_logic = """
  const pauseGame = () => {
    playSound('tap');
    playHaptic();
    if (timerRef.current) clearInterval(timerRef.current);
    setPlayState('PAUSED');
  };

  const resumeGame = () => {
    playSound('tap');
    playHaptic();
    setPlayState('PLAYING');
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
"""
code = code.replace("  const triggerFlash = (type) => {", pause_logic + "\n  const triggerFlash = (type) => {")

# 6. Pause UI and Header Button
header_orig = """            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0 1rem 0' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>{currentPuzzle.category}</span>
                <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 900 }}>T{currentPuzzle.difficulty}</span>
              </div>
              <div className="stat-badge score-text">{displayScore}</div>
            </div>"""

header_new = """            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0 1rem 0' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={pauseGame} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>⏸️</button>
                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>{currentPuzzle.category}</span>
                <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 900 }}>T{currentPuzzle.difficulty}</span>
              </div>
              <div className="stat-badge score-text">{displayScore}</div>
            </div>"""
code = code.replace(header_orig, header_new)

paused_screen = """
        {/* PAUSED SCREEN */}
        {nav === 'HOME' && playState === 'PAUSED' && (
          <div className="slide-fade flex-col h-full" style={{ height: '100%', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '2rem' }}>PAUSED</h1>
            
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button className="btn-primary" style={{ padding: '1.2rem', fontSize: '1.2rem', fontWeight: '900' }} onClick={resumeGame}>
                RESUME
              </button>
              <button className="btn-answer" style={{ padding: '1.2rem', fontWeight: 'bold' }} onClick={() => setPlayState('IDLE')}>
                EXIT TO HUB
              </button>
            </div>
          </div>
        )}
"""
code = code.replace("{/* RESULT SCREEN */}", paused_screen + "\n        {/* RESULT SCREEN */}")

with open('/data/data/com.termux/files/home/mind-trap/src/App.jsx', 'w') as f:
    f.write(code)

