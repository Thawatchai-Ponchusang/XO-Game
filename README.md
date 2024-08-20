
# Tic Tac Toe Game on website

## วิธีการติดตั้งและรันโปรแกรม

### ขั้นตอนการติดตั้ง

1. **ดาวน์โหลด Xampp**:
    ดาวน์โหลดและติดตั้ง [[Download XAMPP (apachefriends.org)](https://www.apachefriends.org/download.html)) หากยังไม่ได้ติดตั้งหรือจะใช้โปรแกรมตัวอื่นที่โฮสสามารถได้ก็ได้เช่นเดียวกัน หากยังไม่มีสามารถโหลด Xampp ได้

2. **การสมัคร Firebase**:
	database ที่ใช้ในการเก็บข้อมูลคือของ Firebase
```js
```

### ขั้นตอนการรันโปรแกรม

1. **โฮสต์เว็บไซต์ได้เลย**:
   หลังจากที่ดาวน์โหลด file ต่าง ๆ ใน github แล้วสามารถโฮสต์เว็บไซต์ผ่านโปรแกรมที่มีได้เลย

## การออกแบบโปรแกรมและ Algorithm ที่ใช้

### การออกแบบโปรแกรมและโครงสร้างไฟล์ของโปรเจค

  * index.html: ไฟล์หลักที่ใช้ในการแสดงหน้าต่าง ๆ บนเว็บไซต์ และแสดงผลหน้าจอเริ่มต้น StartGame
    
  * style.css: ไฟล์ที่ใช้ในการตกแต่งหน้า ui ต่าง ๆ บนเว็บไซต์
    
  * game.js: ไฟล์หลักที่ใช้ในการประมวลผลเกม XO

## Algorithm ที่ใช้
  การทำการเคลื่อนไหวของผู้เล่น:
```js
function makeMove(row, col) {
    if (board[row][col] === '' && !gameEnd) {
        board[row][col] = currentPlayer;
        moveHistory.push({player: currentPlayer, row, col});
        updateBoard(boardSize);
        
        const result = checkWinner();

        if (result === 'winner') {
            showPopup(`${currentPlayer} Wins!`);
            whoWin = currentPlayer + ' win';
            saveGameToFirebase();
            gameEnd = true;
            initializeBoard(boardSize);
        } else if (result === 'draw') {
            showPopup(`Draw!!`);
            whoWin = 'Draw'
            gameEnd = true;
            saveGameToFirebase();
            initializeBoard(boardSize);
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        }
    }
}
```

  การตรวจสอบผู้ชนะ:
```js
function checkWinner() {
    let boardFull = true;

    // Check rows
    for (let i = 0; i < boardSize; i++) {
        if (board[i].every(cell => cell === currentPlayer)) {
            return 'winner';
        }
    }

    // Check columns
    for (let i = 0; i < boardSize; i++) {
        if (board.map(row => row[i]).every(cell => cell === currentPlayer)) {
            return 'winner';
        }
    }

    // Check diagonals
    if (board.map((row, i) => row[i]).every(cell => cell === currentPlayer)) {
        return 'winner';
    }
    if (board.map((row, i) => row[boardSize - i - 1]).every(cell => cell === currentPlayer)) {
        return 'winner';
    }

    // Check if the board is full
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === '') {
                boardFull = false;
            }
        }
    }

    console.log(boardFull);
    if (boardFull) {
        return 'draw';
    }

    return false;
}
```
  การบันทึกข้อมูลเกมลงฐานข้อมูล:
```js
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
```
  การดึงข้อมูลประวัติการเล่นเกม:
```js
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
                const gameWin = childSnapshot.child("winner").val();

                // สร้างแถวใหม่ใน table
                const row = document.createElement('tr');

                // สร้างเซลล์แรกในแถวสำหรับแสดงข้อมูลเกม
                const gameElementCell = document.createElement('td');
                gameElementCell.style.fontWeight = 'bold';
                gameElementCell.textContent = `เกมที่ ${gameIndex} ผลแพ้ชนะ: ${gameWin} ขนาดตาราง: ${gameSize} x ${gameSize}`;
                
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
```
  การแสดง Replay:
```js
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
```
  การสร้าง Board ตามขนาดที่กำหนด:
```js
function initializeBoard(size) {
    board = Array(size).fill().map(() => Array(size).fill(''));
    gameBoard.style.gridTemplateColumns = `repeat(${size}, auto)`;
    gameBoard.innerHTML = '';
    moveHistory = [];
    currentPlayer = 'X';
    gameEnd = false;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.addEventListener('click', () => makeMove(i, j));
            gameBoard.appendChild(cell);
        }
    }
}
```

## การใช้งาน
* เปิดไฟล์ index.html ขึ้นมาจะมาหน้าเริ่มต้นเกมใหม่ โดยสามารถเลือกขนาดของบอร์ดได้โดยการกรอกขนาดของช่องที่ต้องการเช่น กรอก 3 เพื่อ ได้ขนาดช่อง 3x3
* เล่นเกมบนหน้าจอ GameBoard โดยการคลิกที่ตำแหน่งที่ต้องการทำการเคลื่อนไหว
* เมื่อเกมจบลง จะแสดงผลผู้ชนะหรือ และบันทึกข้อมูลเกมลงในฐานข้อมูล
* สามารถดูประวัติการเล่นเกมที่ผ่านมาได้จาก Game History จากด้านล่าง
* สามารถดูรีเพย์เกมที่เคยเล่นไว้ได้จากปุ่ม Replay
