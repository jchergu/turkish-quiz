let words = [];
let current = 0;
let score = 0;
let timer;
let timeLeft = 30;

async function loadWords() {
  const res = await fetch("words.json");
  words = await res.json();
  startQuiz();
}

function startQuiz() {
  const total = parseInt(prompt("How many words? (default 20)")) || 20;
  words = words.sort(() => 0.5 - Math.random()).slice(0, total);
  nextQuestion();
}

function nextQuestion() {
  if (current >= words.length) return endQuiz();
  const q = words[current];
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
  const correct = words[current].tr.map(t => t.toLowerCase());
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
  document.body.innerHTML = `<h2>Quiz finished!</h2><p>Your score: ${score}/${words.length}</p>`;
}

document.addEventListener("DOMContentLoaded", loadWords);
