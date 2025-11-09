let words = [];
let quizWords = [];
let current = 0;
let score = 0;
let timer;
let timeLeft = 30;

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

function startQuiz() {
  if (words.length === 0) {
    alert("Words not loaded yet!");
    return;
  }

  const total = parseInt(document.getElementById("wordCount").value) || 20;
  quizWords = [...words].sort(() => 0.5 - Math.random()).slice(0, total);
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
  const input = document.getElementById("answer").value.trim().toLowerCase();
  const correct = quizWords[current].tr.map(t => t.toLowerCase());

  if (correct.includes(input)) {
    document.getElementById("result").innerText = "✅ Correct!";
    score++;
  } else {
    document.getElementById("result").innerText = "❌ Correct: " + correct.join(", ");
  }

  current++;
  setTimeout(nextQuestion, 1500);
}

function endQuiz() {
  document.getElementById("quiz-screen").style.display = "none";
  document.getElementById("end-screen").style.display = "block";
  document.getElementById("score").innerText = `Your score: ${score}/${quizWords.length}`;
}

function restartQuiz() {
  document.getElementById("start-screen").style.display = "block";
  document.getElementById("quiz-screen").style.display = "none";
  document.getElementById("end-screen").style.display = "none";
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
