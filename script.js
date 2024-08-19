//let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-btn");
//This code was downloaded from www.sahilharyana.com
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");

let turnO = true; //playerX, playerO
let count = 0; //To Track Draw

let boxes;
let size = 3; // Default size
let winPatterns = [];

const createGameBoard = (size) => {
  const gameContainer = document.querySelector("#game-container");
  gameContainer.innerHTML = ''; // Clear existing board
  gameContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  boxes = [];

  for (let i = 0; i < size * size; i++) {
    const box = document.createElement('div');
    box.className = 'box';
    box.dataset.index = i;
    gameContainer.appendChild(box);
    boxes.push(box);
  }

  generateWinPatterns(size);
  attachEventListeners();
};

const generateWinPatterns = (size) => {
  winPatterns = [];

  // Rows and Columns
  for (let i = 0; i < size; i++) {
    let row = [];
    let col = [];
    for (let j = 0; j < size; j++) {
      row.push(i * size + j);
      col.push(j * size + i);
    }
    winPatterns.push(row);
    winPatterns.push(col);
  }

  // Diagonals
  let diag1 = [];
  let diag2 = [];
  for (let i = 0; i < size; i++) {
    diag1.push(i * size + i);
    diag2.push((i + 1) * size - i - 1);
  }
  winPatterns.push(diag1);
  winPatterns.push(diag2);
};

const resetGame = () => {
  turnO = true;
  count = 0;
  enableBoxes();
  document.querySelector(".msg-container").classList.add("hide");
};

const enableBoxes = () => {
  for (let box of boxes) {
    box.innerText = "";
    box.style.color = "";
    box.disabled = false;
  }
};

const disableBoxes = () => {
  for (let box of boxes) {
    box.disabled = true;
  }
};

const showWinner = (winner) => {
  document.querySelector("#msg").innerText = `Congratulations, Winner is ${winner}`;
  document.querySelector(".msg-container").classList.remove("hide");
  disableBoxes();
};

const gameDraw = () => {
  document.querySelector("#msg").innerText = `Game was a Draw.`;
  document.querySelector(".msg-container").classList.remove("hide");
  disableBoxes();
};

const checkWinner = () => {
  for (let pattern of winPatterns) {
    let first = boxes[pattern[0]].innerText;
    if (first === '') continue;

    let win = pattern.every(index => boxes[index].innerText === first);
    if (win) {
      showWinner(first);
      return true;
    }
  }
  return false;
};

const attachEventListeners = () => {
  boxes.forEach(box => {
    box.addEventListener("click", () => {
      if (box.disabled) return;

      if (turnO) {
        box.innerText = "O";
        box.style.color = "#b0413e";
      } else {
        box.innerText = "X";
        box.style.color = "#008000";
      }

      box.disabled = true;
      count++;

      if (checkWinner()) return;
      if (count === size * size) gameDraw();
      
      turnO = !turnO;
    });
  });
};

// Initialize game with default size
createGameBoard(size);

// Event listener for New Game button
document.querySelector("#new-game-btn").addEventListener("click", () => {
  size = parseInt(prompt("Enter the size of the game board (e.g., 3 for 3x3, 4 for 4x4)"));
  createGameBoard(size);
});
