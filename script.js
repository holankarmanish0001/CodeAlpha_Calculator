
const resultDisplay = document.getElementById("result");
const expressionDisplay = document.getElementById("expression");
const historyList = document.getElementById("history-list");

let current = "0";
let previous = null;
let operator = null;
let shouldReset = false;
let history = [];

function updateDisplay() {
  resultDisplay.textContent = current;
}

function formatNumber(number) {
  if (!Number.isFinite(number)) return "Error";
  return String(Number(number.toPrecision(12)));
}

function clearCalculator() {
  current = "0";
  previous = null;
  operator = null;
  shouldReset = false;
  expressionDisplay.textContent = "Ready";
  updateDisplay();
}

function inputNumber(number) {
  if (current === "Error") clearCalculator();

  if (shouldReset) {
    current = number === "." ? "0." : number;
    shouldReset = false;
  } else if (number === ".") {
    if (!current.includes(".")) current += ".";
  } else {
    current = current === "0" ? number : current + number;
  }

  updateDisplay();
}

function calculate(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function chooseOperator(nextOperator) {
  if (current === "Error") return;

  const inputValue = Number(current);

  if (operator && !shouldReset) {
    const answer = calculate(previous, inputValue, operator);

    if (!Number.isFinite(answer)) {
      current = "Error";
      expressionDisplay.textContent = "Cannot divide by zero";
      updateDisplay();
      previous = null;
      operator = null;
      shouldReset = true;
      return;
    }

    current = formatNumber(answer);
  }

  previous = Number(current);
  operator = nextOperator;
  shouldReset = true;

  expressionDisplay.textContent =
    `${formatNumber(previous)} ${operator}`;

  updateDisplay();
}

function showHistory(calculation, answer) {
  if (historyList.querySelector(".empty")) {
    historyList.innerHTML = "";
  }

  history.unshift({ calculation, answer });
  history = history.slice(0, 5);

  historyList.innerHTML = "";

  history.forEach(item => {
    const li = document.createElement("li");
    const left = document.createElement("span");
    const right = document.createElement("strong");

    left.textContent = item.calculation;
    right.textContent = item.answer;

    li.append(left, right);
    historyList.appendChild(li);
  });
}

function equals() {
  if (operator === null || shouldReset || current === "Error") return;

  const first = previous;
  const second = Number(current);
  const op = operator;
  const answer = calculate(first, second, op);

  const calculation =
    `${formatNumber(first)} ${op} ${formatNumber(second)}`;

  if (!Number.isFinite(answer)) {
    current = "Error";
    expressionDisplay.textContent = "Cannot divide by zero";
  } else {
    current = formatNumber(answer);
    expressionDisplay.textContent = calculation + " =";
    showHistory(calculation, current);
  }

  previous = null;
  operator = null;
  shouldReset = true;
  updateDisplay();
}

function percentage() {
  if (current === "Error") return;

  current = formatNumber(Number(current) / 100);
  updateDisplay();
}

function toggleSign() {
  if (current === "Error" || current === "0") return;

  current = formatNumber(-Number(current));
  updateDisplay();
}

function backspace() {
  if (shouldReset || current === "Error") {
    current = "0";
    shouldReset = false;
  } else {
    current = current.length > 1 ? current.slice(0, -1) : "0";

    if (current === "-") current = "0";
  }

  updateDisplay();
}

// Button controls
document.querySelectorAll(".key").forEach(button => {
  button.addEventListener("click", () => {
    if (button.dataset.number !== undefined) {
      inputNumber(button.dataset.number);
    }

    if (button.dataset.operator) {
      chooseOperator(button.dataset.operator);
    }

    switch (button.dataset.action) {
      case "clear": clearCalculator(); break;
      case "backspace": backspace(); break;
      case "percent": percentage(); break;
      case "sign": toggleSign(); break;
      case "equals": equals(); break;
    }
  });
});

// Keyboard support
document.addEventListener("keydown", event => {
  const key = event.key;

  if (/^[0-9.]$/.test(key)) {
    inputNumber(key);
  } else if (key === "+") {
    chooseOperator("+");
  } else if (key === "-") {
    chooseOperator("−");
  } else if (key === "*") {
    chooseOperator("×");
  } else if (key === "/") {
    event.preventDefault();
    chooseOperator("÷");
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearCalculator();
  } else if (key === "%") {
    percentage();
  }
});

// Clear history
document.getElementById("clear-history").addEventListener("click", () => {
  history = [];
  historyList.innerHTML =
    '<li class="empty">Your calculations will appear here.</li>';
});

updateDisplay();
