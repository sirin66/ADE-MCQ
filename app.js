/**
 * QUIZ 🏆 — MODERN INTERACTIVE APPLICATION ENGINE
 * Replicates the Dribbble/Figma Mobile-First UI
 * Controls Onboarding, Home Dashboard, Gameplay Quiz, Leaderboard Podiums, and Chapters.
 */

// Chapter / Syllabus Definition
const CHAPTERS_LIST = [
  { id: 'Half Adder', roman: 'CHAP. I', title: 'Half Adder Circuits', count: 15, tag: 'Logic Units', color: 'coral' },
  { id: 'Full Adder', roman: 'CHAP. II', title: 'Full Adder Synthesis', count: 15, tag: 'Logic Units', color: 'coral' },
  { id: 'Half Subtractor', roman: 'CHAP. III', title: 'Half Subtractor Circuits', count: 15, tag: 'Arithmetic', color: 'pink' },
  { id: 'Full Subtractor', roman: 'CHAP. IV', title: 'Full Subtractor Synthesis', count: 15, tag: 'Arithmetic', color: 'pink' },
  { id: 'SR Flip-Flop', roman: 'CHAP. V', title: 'SR Flip-Flop & Latches', count: 30, tag: 'Sequential', color: 'blue' },
  { id: 'JK Flip-Flop', roman: 'CHAP. VI', title: 'JK Flip-Flop & Race-Around', count: 30, tag: 'Sequential', color: 'blue' },
  { id: 'T Flip-Flop', roman: 'CHAP. VII', title: 'T Flip-Flop & Counters', count: 30, tag: 'Sequential', color: 'blue' },
  { id: 'D Flip-Flop', roman: 'CHAP. VIII', title: 'D Flip-Flop & Registers', count: 30, tag: 'Sequential', color: 'blue' },
  { id: 'Ring & Johnson Counters', roman: 'CHAP. IX', title: 'Ring & Johnson Counters', count: 30, tag: 'Registers', color: 'green' },
  { id: 'Asynchronous Counters', roman: 'CHAP. X', title: 'Asynchronous Ripple Counters', count: 30, tag: 'Registers', color: 'green' },
  { id: 'Inverting & Non-Inverting Op-Amps', roman: 'CHAP. XI', title: 'Linear Op-Amp Topologies', count: 30, tag: 'Analog', color: 'amber' },
  { id: '555 Timer Astable Multivibrator', roman: 'CHAP. XII', title: '555 Astable Multivibrators', count: 30, tag: 'Timers', color: 'purple' },
  { id: '555 Timer Monostable Multivibrator', roman: 'CHAP. XIII', title: '555 Monostable One-Shots', count: 30, tag: 'Timers', color: 'purple' },
  { id: 'RC Phase Shift Oscillator Using Op-Amp', roman: 'CHAP. XIV', title: 'RC Phase Shift Oscillators', count: 30, tag: 'Harmonics', color: 'purple' },
  { id: 'Wien Bridge Oscillator Using Op-Amp', roman: 'CHAP. XV', title: 'Wien Bridge Oscillators', count: 20, tag: 'Harmonics', color: 'purple' }
];

// App Global State
let allQuestions = (typeof window.QUESTIONS_DATA !== 'undefined' && Array.isArray(window.QUESTIONS_DATA))
  ? [...window.QUESTIONS_DATA]
  : [];

let currentScreen = 'home';
let userDiamonds = 20; // Starts with 20 diamonds as in user reference screenshot
let activeQuizQuestions = [];
let currentQuizIndex = 0;
let userAnswers = {};
let bookmarkedIds = new Set();
let favoriteCategories = new Set(['Logic Units', 'Sequential']);
let soundEnabled = true;

// Timer State
let quizTimerSeconds = 45 * 60;
let quizTimerInterval = null;

// Audio Synthesizer (Web Audio API)
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'correct') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(246.94, now);
      osc.frequency.linearRampToValueAtTime(196.00, now + 0.14);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch(e) {}
}

// Initialization
async function initApp() {
  // Load local diamonds
  try {
    const savedDiamonds = localStorage.getItem('quiz_diamonds');
    if (savedDiamonds) userDiamonds = parseInt(savedDiamonds, 10);
    const savedMarks = localStorage.getItem('quiz_bookmarks');
    if (savedMarks) bookmarkedIds = new Set(JSON.parse(savedMarks));
    const savedAns = localStorage.getItem('quiz_answers');
    if (savedAns) userAnswers = JSON.parse(savedAns);
  } catch(e) {}

  // Fetch questions if hosted
  if (window.location.protocol.startsWith('http')) {
    try {
      const resp = await fetch('questions.json');
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data) && data.length >= allQuestions.length) {
          allQuestions = data;
        }
      }
    } catch(e) {}
  }

  activeQuizQuestions = [...allQuestions];
  updateDiamondDisplays();
  renderChaptersList();
  updateCompletedStats();
  navigateToScreen('home');
  startTimerCountdown();
}

// Screen Navigation
function navigateToScreen(screenId) {
  playSound('click');
  currentScreen = screenId;

  // Toggle screens
  const screens = {
    'onboarding': document.getElementById('screenOnboarding'),
    'home': document.getElementById('screenHome'),
    'quiz': document.getElementById('screenQuiz'),
    'leaderboard': document.getElementById('screenLeaderboard'),
    'chapters': document.getElementById('screenChapters')
  };

  for (const [key, el] of Object.entries(screens)) {
    if (!el) continue;
    if (key === screenId) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }

  // Scroll to top inside phone viewport
  const viewport = document.getElementById('appViewport');
  if (viewport) viewport.scrollTop = 0;

  // Update floating dock state
  document.querySelectorAll('.dock-item').forEach(btn => btn.classList.remove('active'));
  if (screenId === 'home') document.getElementById('dockHome')?.classList.add('active');
  else if (screenId === 'chapters') document.getElementById('dockChapters')?.classList.add('active');
  else if (screenId === 'quiz') document.getElementById('dockQuiz')?.classList.add('active');
  else if (screenId === 'leaderboard') document.getElementById('dockLeaderboard')?.classList.add('active');

  // Update top toolbar pills
  document.querySelectorAll('.switch-pill').forEach(btn => btn.classList.remove('active'));
  if (screenId === 'home') document.getElementById('swHome')?.classList.add('active');
  else if (screenId === 'quiz') document.getElementById('swQuiz')?.classList.add('active');
  else if (screenId === 'leaderboard') document.getElementById('swBoard')?.classList.add('active');
  else if (screenId === 'chapters') document.getElementById('swChapters')?.classList.add('active');

  // Toggle floating dock visibility: hide on onboarding
  const dock = document.getElementById('floatingDock');
  if (dock) {
    dock.style.display = (screenId === 'onboarding') ? 'none' : 'flex';
  }
}

// Viewport Presentation Mode: Phone Mockup vs Fluid Desktop
function setViewMode(mode) {
  playSound('click');
  const body = document.body;
  const btnPhone = document.getElementById('btnPhoneView');
  const btnFluid = document.getElementById('btnFluidView');

  if (mode === 'fluid') {
    body.classList.add('fluid-mode');
    body.classList.remove('showcase-mode');
    btnFluid?.classList.add('active');
    btnPhone?.classList.remove('active');
  } else {
    body.classList.remove('fluid-mode');
    body.classList.add('showcase-mode');
    btnPhone?.classList.add('active');
    btnFluid?.classList.remove('active');
  }
}

// Diamond Management & Visual Reward
function addDiamonds(amount, clickEvent) {
  userDiamonds += amount;
  try {
    localStorage.setItem('quiz_diamonds', userDiamonds.toString());
  } catch(e) {}

  updateDiamondDisplays();

  // Trigger floating reward animation at click or center
  spawnDiamondRewardAnimation(amount, clickEvent);
}

function updateDiamondDisplays() {
  const dHome = document.getElementById('userDiamondCount');
  const dQuiz = document.getElementById('quizDiamondCounter');
  const dBoard = document.getElementById('leaderboardDiamonds');
  const dUserPoints = document.getElementById('userPointsText');
  const dScoreBadge = document.getElementById('userScoreBadge');

  if (dHome) dHome.innerText = userDiamonds;
  if (dQuiz) dQuiz.innerText = userDiamonds;
  if (dBoard) dBoard.innerText = userDiamonds;
  if (dUserPoints) dUserPoints.innerText = `${userDiamonds} Point`;
  if (dScoreBadge) dScoreBadge.innerText = Math.min(99 + Math.floor(userDiamonds / 10), 999);
}

function spawnDiamondRewardAnimation(amount, e) {
  const container = document.getElementById('floatingRewardContainer');
  if (!container) return;

  const reward = document.createElement('div');
  reward.className = 'reward-popup';
  reward.innerHTML = `<span>💎</span> +${amount}`;

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  if (e && e.clientX) {
    x = e.clientX;
    y = e.clientY;
  }

  reward.style.left = `${x}px`;
  reward.style.top = `${y}px`;

  container.appendChild(reward);
  setTimeout(() => {
    reward.remove();
  }, 1000);
}

// Quiz Initiation
function startQuizSession() {
  activeQuizQuestions = [...allQuestions];
  currentQuizIndex = 0;
  renderCurrentQuestion();
  navigateToScreen('quiz');
}

function startQuizWithTopic(topicName) {
  const filtered = allQuestions.filter(q => q.topic === topicName);
  activeQuizQuestions = filtered.length > 0 ? filtered : [...allQuestions];
  currentQuizIndex = 0;
  renderCurrentQuestion();
  navigateToScreen('quiz');
}

// Render Current Quiz Question
function renderCurrentQuestion() {
  if (activeQuizQuestions.length === 0) return;
  if (currentQuizIndex < 0) currentQuizIndex = 0;
  if (currentQuizIndex >= activeQuizQuestions.length) currentQuizIndex = activeQuizQuestions.length - 1;

  const q = activeQuizQuestions[currentQuizIndex];
  const selectedAnswer = userAnswers[q.id];
  const isAnswered = selectedAnswer !== undefined;

  // Header & Badges
  document.getElementById('quizProgressPill').innerText = `Q ${currentQuizIndex + 1} / ${activeQuizQuestions.length}`;
  document.getElementById('quizTopicBadge').innerText = q.topic.toUpperCase();
  document.getElementById('quizQuestionStem').innerText = q.question;

  // Bookmark State
  const isBookmarked = bookmarkedIds.has(q.id);
  const bmBtn = document.getElementById('quizBookmarkBtn');
  document.getElementById('quizBookmarkIcon').innerText = isBookmarked ? '★' : '☆';
  document.getElementById('quizBookmarkText').innerText = isBookmarked ? 'Saved' : 'Save';
  bmBtn?.classList.toggle('active', isBookmarked);

  // Render Options
  const container = document.getElementById('quizOptionsContainer');
  container.innerHTML = '';

  for (const [key, text] of Object.entries(q.options)) {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt-btn';
    btn.setAttribute('data-opt', key);

    const badge = document.createElement('div');
    badge.className = 'opt-badge-pill';
    badge.innerText = key;

    const label = document.createElement('div');
    label.className = 'opt-label-text';
    label.innerText = text;

    btn.appendChild(badge);
    btn.appendChild(label);

    if (isAnswered) {
      if (key === q.answer) {
        btn.classList.add('correct-choice');
      }
      if (key === selectedAnswer && selectedAnswer !== q.answer) {
        btn.classList.add('wrong-choice');
      }
      btn.disabled = true;
    }

    btn.onclick = (e) => selectQuizOption(key, e);
    container.appendChild(btn);
  }

  // Explanation Card
  const expCard = document.getElementById('quizExplanationCard');
  if (isAnswered) {
    expCard.classList.remove('hidden');
    const isCorrect = selectedAnswer === q.answer;
    const header = document.getElementById('expHeader');
    header.className = `exp-header ${isCorrect ? 'correct' : 'incorrect'}`;
    document.getElementById('expStatusIcon').innerText = isCorrect ? '✓' : '✗';
    document.getElementById('expStatusLabel').innerText = isCorrect
      ? 'Accurate Resolution (+10 💎)'
      : `Erroneous Choice [Accurate: Option ${q.answer}]`;
    document.getElementById('expBody').innerText = q.reason;
  } else {
    expCard.classList.add('hidden');
  }

  // Navigation Buttons
  document.getElementById('btnQuizPrev').disabled = currentQuizIndex === 0;
  const isLast = currentQuizIndex === activeQuizQuestions.length - 1;
  document.getElementById('btnQuizNext').innerText = isLast ? 'Finish 🏁' : 'Next →';
}

// Option Selection
function selectQuizOption(key, event) {
  const q = activeQuizQuestions[currentQuizIndex];
  if (userAnswers[q.id] !== undefined) return; // Prevent double answer

  userAnswers[q.id] = key;
  try {
    localStorage.setItem('quiz_answers', JSON.stringify(userAnswers));
  } catch(e) {}

  const isCorrect = key === q.answer;
  if (isCorrect) {
    playSound('correct');
    addDiamonds(10, event);
  } else {
    playSound('wrong');
  }

  updateCompletedStats();
  renderCurrentQuestion();
}

// Navigate Quiz
function navigateQuizQuestion(step) {
  playSound('click');
  const target = currentQuizIndex + step;
  if (target >= 0 && target < activeQuizQuestions.length) {
    currentQuizIndex = target;
    renderCurrentQuestion();
  } else if (target >= activeQuizQuestions.length) {
    navigateToScreen('leaderboard');
  }
}

// Toggle Question Flag / Bookmark
function toggleCurrentQuestionFlag() {
  if (activeQuizQuestions.length === 0) return;
  playSound('click');
  const q = activeQuizQuestions[currentQuizIndex];
  if (bookmarkedIds.has(q.id)) {
    bookmarkedIds.delete(q.id);
  } else {
    bookmarkedIds.add(q.id);
  }

  try {
    localStorage.setItem('quiz_bookmarks', JSON.stringify([...bookmarkedIds]));
  } catch(e) {}

  renderCurrentQuestion();
}

function toggleFavorite(category) {
  playSound('click');
  if (favoriteCategories.has(category)) {
    favoriteCategories.delete(category);
  } else {
    favoriteCategories.add(category);
  }
}

// Render Chapters View
function renderChaptersList(filterQuery = '') {
  const container = document.getElementById('chaptersGridList');
  if (!container) return;
  container.innerHTML = '';

  const q = filterQuery.toLowerCase().trim();
  const list = CHAPTERS_LIST.filter(ch => {
    if (!q) return true;
    return ch.title.toLowerCase().includes(q) || ch.id.toLowerCase().includes(q) || ch.tag.toLowerCase().includes(q);
  });

  if (list.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding: 2rem; color: #888;">No topics found matching your query.</div>';
    return;
  }

  list.forEach(ch => {
    const answeredInTopic = allQuestions.filter(item => item.topic === ch.id && userAnswers[item.id] !== undefined).length;
    
    const card = document.createElement('div');
    card.className = 'chapter-card-item';
    card.onclick = () => startQuizWithTopic(ch.id);

    card.innerHTML = `
      <div class="ch-meta-left">
        <span class="ch-roman">${ch.roman} • ${ch.tag.toUpperCase()}</span>
        <div class="ch-title">${ch.title}</div>
        <div class="ch-count">${answeredInTopic}/${ch.count} Completed</div>
      </div>
      <button class="ch-play-btn" onclick="event.stopPropagation(); startQuizWithTopic('${ch.id}')">Play</button>
    `;

    container.appendChild(card);
  });
}

function handleChapterSearch() {
  const val = document.getElementById('chapterSearchInput')?.value || '';
  renderChaptersList(val);
}

// Timer Countdown
function startTimerCountdown() {
  if (quizTimerInterval) clearInterval(quizTimerInterval);
  quizTimerInterval = setInterval(() => {
    if (quizTimerSeconds > 0) {
      quizTimerSeconds--;
      const m = Math.floor(quizTimerSeconds / 60).toString().padStart(2, '0');
      const s = (quizTimerSeconds % 60).toString().padStart(2, '0');
      const timerPill = document.getElementById('quizTimerPill');
      if (timerPill) timerPill.innerText = `⏱️ ${m}:${s}`;
    }
  }, 1000);
}

// Stats Sync
function updateCompletedStats() {
  const attempted = Object.keys(userAnswers).length;
  const badge = document.getElementById('completedCountBadge');
  if (badge) badge.innerText = `${attempted}/380 Solved`;
}

// Sound Toggle
function toggleSound() {
  soundEnabled = !soundEnabled;
  const icon = document.getElementById('soundIcon');
  if (icon) icon.innerText = soundEnabled ? '🔊' : '🔇';
  playSound('click');
}

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

  if (currentScreen === 'quiz') {
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') {
      navigateQuizQuestion(1);
    } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'p') {
      navigateQuizQuestion(-1);
    } else if (['1', '2', '3', '4'].includes(e.key)) {
      const map = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
      selectQuizOption(map[e.key]);
    } else if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
      selectQuizOption(e.key.toUpperCase());
    } else if (e.key.toLowerCase() === 'f') {
      toggleCurrentQuestionFlag();
    }
  }
});

// Run upon loading
window.addEventListener('DOMContentLoaded', initApp);
