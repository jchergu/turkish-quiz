let words = [];
let quizWords = [];
let current = 0;
let score = 0;
let timer;
let timeLeft = 30;
let mistakes = []; // track wrong answers

async function loadWords() {
  try {
    const res = await fetch("./words.json");
    words = await res.json();

    // Enable button after loading
    const btn = document.getElementById("startButton");
    btn.textContent = "Start Quiz";
    btn.disabled = false;
    btn.onclick = startQuiz;
  } catch (e) {
    console.error("Error loading words:", e);
    document.getElementById("startButton").textContent = "Error loading file!";
  }
}

// helper: Fisher–Yates shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// helper: guess whether an entry is a verb by checking common keys/flags
function isVerbEntry(w) {
  if (!w) return false;
  if (w.isVerb === true) return true;
  const keys = ['pos', 'type', 'tag', 'partOfSpeech', 'posTag'];
  for (const k of keys) {
    if (w[k]) {
      const val = Array.isArray(w[k]) ? w[k].join(' ').toLowerCase() : String(w[k]).toLowerCase();
      if (val.includes('verb') || val.startsWith('v ' ) || /^v\b/.test(val)) return true;
    }
  }
  return false;
}

function startQuiz() {
  if (words.length === 0) {
    alert("Words not loaded yet!");
    return;
  }

  mistakes = []; // reset mistakes at start
  let total = parseInt(document.getElementById("wordCount").value) || 20;
  // compute max verbs allowed (20%)
  let maxVerbs = Math.floor(total * 0.2);

  // split verbs and non-verbs using heuristic
  const verbs = words.filter(isVerbEntry);
  const others = words.filter(w => !isVerbEntry(w));

  // ensure we don't request more words than available
  const availableTotal = verbs.length + others.length;
  total = Math.min(total, availableTotal);

  // cap verb count to available verbs and to the 20% limit
  const verbCount = Math.min(maxVerbs, verbs.length);

  // shuffle pools and pick
  shuffleArray(verbs);
  shuffleArray(others);

  const selected = [];
  selected.push(...verbs.slice(0, verbCount));
  const need = total - selected.length;
  selected.push(...others.slice(0, need));

  // if still short (shouldn't happen because total was capped), fill from remaining words
  if (selected.length < total) {
    const leftover = words.filter(w => !selected.includes(w));
    shuffleArray(leftover);
    for (const w of leftover) {
      if (selected.length >= total) break;
      selected.push(w);
    }
  }

  // final random order
  quizWords = [...selected].sort(() => 0.5 - Math.random());
  current = 0;
  score = 0;

  document.getElementById("start-screen").style.display = "none";
  document.getElementById("quiz-screen").style.display = "block";
  document.getElementById("end-screen").style.display = "none";

  nextQuestion();
}

function nextQuestion() {
  if (current >= quizWords.length) return endQuiz();

  const q = quizWords[current];
  document.getElementById("english").innerText = q.en;
  document.getElementById("answer").value = "";
  document.getElementById("result").innerText = "";
  startTimer();
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 30;
  document.getElementById("timer").innerText = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = timeLeft;
    if (timeLeft <= 0) checkAnswer();
  }, 1000);
}

function checkAnswer() {
  clearInterval(timer);
  const inputRaw = document.getElementById("answer").value;
  const input = inputRaw.trim().toLowerCase();
  const q = quizWords[current];
  const correct = q.tr.map(t => t.toLowerCase());

  if (correct.includes(input)) {
    document.getElementById("result").innerText = "✅ Correct!";
    score++;
  } else {
    document.getElementById("result").innerText = "❌ Correct: " + q.tr.join(", ");
    mistakes.push({
      en: q.en,
      user: inputRaw === "" ? "(no answer)" : inputRaw,
      correct: q.tr.slice() // keep original array
    });
  }

  current++;
  setTimeout(nextQuestion, 1500);
}

function endQuiz() {
  document.getElementById("quiz-screen").style.display = "none";
  document.getElementById("end-screen").style.display = "block";
  document.getElementById("score").innerText = `Your score: ${score}/${quizWords.length}`;

  // render mistakes
  const out = document.getElementById("mistakes");
  if (!mistakes || mistakes.length === 0) {
    out.innerHTML = "<p>No mistakes — nice job!</p>";
  } else {
    const html = mistakes.map(m => {
      const correct = m.correct.join(", ");
      return `<div class="mistake-item">
                <div><strong>${escapeHtml(m.en)}</strong></div>
                <div>User: <span class="user">${escapeHtml(m.user)}</span></div>
                <div>Correct: <span class="correct">${escapeHtml(correct)}</span></div>
              </div>`;
    }).join("");
    out.innerHTML = `<h3>Errors (${mistakes.length})</h3>${html}`;
  }
}

// small helper to avoid accidental HTML injection from data
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

function restartQuiz() {
  document.getElementById("start-screen").style.display = "block";
  document.getElementById("quiz-screen").style.display = "none";
  document.getElementById("end-screen").style.display = "none";
  document.getElementById("mistakes").innerHTML = "";
}

function insertChar(char) {
  const input = document.getElementById("answer");
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const text = input.value;

  // Insert the chosen char at the cursor position
  input.value = text.slice(0, start) + char + text.slice(end);

  // Move the cursor after the inserted char
  input.selectionStart = input.selectionEnd = start + char.length;

  // Focus back on input
  input.focus();
}


document.addEventListener("DOMContentLoaded", loadWords);
