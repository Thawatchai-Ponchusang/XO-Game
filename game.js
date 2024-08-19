import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, set, get, push} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBGgQwMrzhEIGCHLsbQir6BEm6QksMosuA",
    authDomain: "tictactoe-3f6e4.firebaseapp.com",
    projectId: "tictactoe-3f6e4",
    storageBucket: "tictactoe-3f6e4.appspot.com",
    messagingSenderId: "420381249883",
    appId: "1:420381249883:web:4c8f107f14d3d0b1a3ca7e",
    databaseURL: "https://tictactoe-3f6e4-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM Elements
const gameBoard = document.getElementById('game-board');
const historyDiv = document.getElementById('history');
const startButton = document.getElementById('start');
const sizeInput = document.getElementById('size');

let boardSize = 3;
let board = [];
let currentPlayer = 'X';
let moveHistory = [];
let gameEnd = false;
let whoWin = '';

initializeBoard(boardSize);
// Start a new game
startButton.addEventListener('click', () => {
    boardSize = parseInt(sizeInput.value, 20);
    if (boardSize >= 0) {
        initializeBoard(boardSize);
    } else {
        alert("Please enter a size of 2 or greater.");
    }
});

// Initialize the board
function initializeBoard(size) {
    board = Array(size).fill().map(() => Array(size).fill(''));
    gameBoard.style.gridTemplateColumns = `repeat(${size}, auto)`;
    gameBoard.innerHTML = '';
    moveHistory = [];

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.addEventListener('click', () => makeMove(i, j));
            gameBoard.appendChild(cell);
        }
    }
}

function showPopup(message) {
    document.getElementById('popupMessage').innerText = message;
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popupOverlay').style.display = 'block';
}

function makeMove(row, col) {
    if (board[row][col] === '' && !gameEnd) {
        board[row][col] = currentPlayer;
        moveHistory.push({player: currentPlayer, row, col});
        updateBoard(boardSize);
        if (checkWinner()) {
            showPopup(`${currentPlayer} wins!`);
            whoWin = currentPlayer;
            saveGameToFirebase();
            currentPlayer = 'X'
            initializeBoard(boardSize);
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        }
    }
}

// Handle a move
// function makeMove(row, col) {
//     if (board[row][col] === '' && !gameEnd) {
//         board[row][col] = currentPlayer;
//         moveHistory.push({player: currentPlayer, row, col});
//         updateBoard(boardSize);
//         if (checkWinner()) {
//             alert(`${currentPlayer} wins!`);
//             whoWin = currentPlayer;
//             saveGameToFirebase();
//             initializeBoard(boardSize);
//         } else {
//             currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
//         }
//     }
// }

// Update the board display
function updateBoard(boardSize) {
    const cells = document.getElementsByClassName('cell');
    let index = 0;
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            cells[index].textContent = board[i][j];
            index++;
        }
    }
}

// Check for a winner
function checkWinner() {
    // Check rows
    for (let i = 0; i < boardSize; i++) {
        if (board[i].every(cell => cell === currentPlayer)) {
            return true;
        }
    }

    // Check columns
    for (let i = 0; i < boardSize; i++) {
        if (board.map(row => row[i]).every(cell => cell === currentPlayer)) {
            return true;
        }
    }

    // Check diagonals
    if (board.map((row, i) => row[i]).every(cell => cell === currentPlayer)) {
        return true;
    }
    if (board.map((row, i) => row[boardSize - i - 1]).every(cell => cell === currentPlayer)) {
        return true;
    }

    return false;
}

// Save game history to Firebase
function saveGameToFirebase() {
    const newGameRef = push(ref(db, 'games')); // สร้าง reference ใหม่พร้อมกับ id ไม่ซ้ำ
    set(newGameRef, {
        winner: whoWin,
        size: boardSize,
        moves: moveHistory
    }).then(() => {
        fetchGameHistory(); // ดึงข้อมูลเกมที่บันทึกแล้วทั้งหมด
    }).catch((error) => {
        console.error("Error saving game: ", error);
    });
    console.log(newGameRef);
    historyDiv.innerHTML = '';
}

function fetchGameHistory() {
    const gamesRef = ref(db, 'games');
    get(gamesRef).then((snapshot) => {
        if (snapshot.exists()) {
            let gameIndex = 1;

            // สร้าง table
            const table = document.createElement('table');
            table.style.width = '100%';
            table.classList = 'table';
            table.style.borderCollapse = 'collapse';
            table.setAttribute('border', '1');

            snapshot.forEach((childSnapshot) => {
                
                // ดึงค่าจากแต่ละเกม
                const gameMove = childSnapshot.child("moves").val();
                const gameSize = childSnapshot.child("size").val();

                // สร้างแถวใหม่ใน table
                const row = document.createElement('tr');

                // สร้างเซลล์แรกในแถวสำหรับแสดงข้อมูลเกม
                const gameElementCell = document.createElement('td');
                gameElementCell.style.fontWeight = 'bold';
                gameElementCell.textContent = `เกมที่ ${gameIndex} ขนาดตาราง: ${gameSize} x ${gameSize}`;
                
                // สร้างเซลล์ที่สองในแถวสำหรับปุ่ม replay
                const gameButtonCell = document.createElement('td');
                const gameButton = document.createElement('button');
                gameButton.textContent = 'Replay';
                gameButton.classList.add('btn', 'btn-primary', 'button-history');
                gameButton.addEventListener('click', () => {
                    console.log(gameMove);
                    replayGame(gameMove, gameSize);
                });

                gameButtonCell.appendChild(gameButton);

                // เพิ่มเซลล์ลงในแถว
                row.appendChild(gameElementCell);
                row.appendChild(gameButtonCell);

                // เพิ่มแถวลงในตาราง
                table.appendChild(row);

                gameIndex++;
            });

            // สร้าง wrapper สำหรับ table เพื่อให้สามารถ scroll ได้
            const wrapperDiv = document.createElement('div');
            wrapperDiv.style.maxHeight = '300px';
            wrapperDiv.style.overflowY = 'auto';
            wrapperDiv.style.border = '1px solid #ddd';
            
            // เพิ่มตารางลงใน wrapper
            wrapperDiv.appendChild(table);

            // เพิ่ม wrapper ลงใน historyDiv
            historyDiv.appendChild(wrapperDiv);

        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error("Error fetching game data: ", error);
    });
}


// function fetchGameHistory() {
//     const gamesRef = ref(db, 'games');
//     get(gamesRef).then((snapshot) => {
//         if (snapshot.exists()) {
//             let gameIndex = 1;
//             snapshot.forEach((childSnapshot) => {
                
//                 // ดึงค่าจากแต่ละเกม
//                 const gameMove = childSnapshot.child("moves").val();
//                 const gameSize = childSnapshot.child("size").val();
//                 const gameDiv = document.createElement('div');
//                 //const gameWinner = childSnapshot.child("winner").val();

//                 // สร้าง element เพื่อแสดงข้อมูล
//                 const gameElement = document.createElement('div');
//                 gameElement.style.display = 'inline-block';
//                 gameElement.style.fontWeight = 'bold';
//                 gameElement.textContent = `เกมที่ ${gameIndex} ขนาดตาราง: ${gameSize} x ${gameSize}`;
                
//                 const gameButton = document.createElement('button');
//                 gameButton.textContent = 'Replay';
//                 gameButton.addEventListener('click', () => {
//                     console.log(gameMove); // ดูหรือทำงานกับ moves เมื่อกดปุ่ม
//                 });

//                 // เพิ่ม element ไปยัง document
//                 gameButton.addEventListener('click', () => replayGame(gameMove, gameSize));
//                 gameButton.classList.add('btn', 'btn-primary', 'button-history');
//                 gameButton.style.display = 'inline-block';

//                 historyDiv.appendChild(gameElement);
//                 historyDiv.appendChild(gameButton);
//                 historyDiv.appendChild(gameDiv);

//                 gameIndex++;
//             });
//         } else {
//             console.log("No data available");
//         }
//     }).catch((error) => {
//         console.error("Error fetching game data: ", error);
//     });
// }

// Replay a game from history
function replayGame(moves, size) {
    initializeBoard(size);
    console.log("Move:",moves);
    let i = 0;
    const interval = setInterval(() => {
        if (i < moves.length) {
            const move = moves[i];
            console.log(move);
            board[move.row][move.col] = move.player;
            updateBoard(size);
            i++;
        } else {
            clearInterval(interval);
        }
    }, 500);
}

// Load game history on startup
fetchGameHistory();