# Tic Tac Toe Game on website

## วิธีการติดตั้งและรันโปรแกรม

### ขั้นตอนการติดตั้ง

1. **ดาวน์โหลด Xampp**:
    ดาวน์โหลดและติดตั้ง [[Download XAMPP (apachefriends.org)](https://www.apachefriends.org/download.html)) หากยังไม่ได้ติดตั้งหรือจะใช้โปรแกรมตัวอื่นที่โฮสสามารถได้ก็ได้เช่นเดียวกัน หากยังไม่มีสามารถโหลด Xampp ได้

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
        if (checkWinner()) {
            alert(`${currentPlayer} wins!`);
            whoWin = currentPlayer;
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
            snapshot.forEach((childSnapshot) => {
                
                // ดึงค่าจากแต่ละเกม
                const gameMove = childSnapshot.child("moves").val();
                const gameSize = childSnapshot.child("size").val();
                const gameDiv = document.createElement('div');
                //const gameWinner = childSnapshot.child("winner").val();

                // สร้าง element เพื่อแสดงข้อมูล
                const gameElement = document.createElement('div');
                gameElement.style.display = 'inline-block';
                gameElement.style.fontWeight = 'bold';
                gameElement.textContent = `เกมที่ ${gameIndex} ขนาดตาราง: ${gameSize} x ${gameSize}`;
                
                const gameButton = document.createElement('button');
                gameButton.textContent = 'Replay';
                gameButton.addEventListener('click', () => {
                    console.log(gameMove); // ดูหรือทำงานกับ moves เมื่อกดปุ่ม
                });

                // เพิ่ม element ไปยัง document
                gameButton.addEventListener('click', () => replayGame(gameMove, gameSize));
                gameButton.classList.add('btn', 'btn-primary', 'button-history');
                gameButton.style.display = 'inline-block';

                historyDiv.appendChild(gameElement);
                historyDiv.appendChild(gameButton);
                historyDiv.appendChild(gameDiv);

                gameIndex++;
            });
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

## การใช้งาน
* เปิดไฟล์ index.html ขึ้นมาจะมาหน้าเริ่มต้นเกมใหม่ โดยสามารถเลือกขนาดของบอร์ดได้โดยการกรอกขนาดของช่องที่ต้องการเช่น กรอก 3 เพื่อ ได้ขนาดช่อง 3x3
* เล่นเกมบนหน้าจอ GameBoard โดยการคลิกที่ตำแหน่งที่ต้องการทำการเคลื่อนไหว
* เมื่อเกมจบลง จะแสดงผลผู้ชนะหรือ และบันทึกข้อมูลเกมลงในฐานข้อมูล
* สามารถดูประวัติการเล่นเกมที่ผ่านมาได้จาก HistoryView ด้านล่าง
* สามารถดูรีเพย์เกมที่เคยเล่นไว้ได้จากปุ่ม Replay
