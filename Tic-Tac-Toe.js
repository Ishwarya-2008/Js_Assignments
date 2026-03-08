let board = Array(9).fill("");
let mode = "cpu";
let currentPlayer = "X";
let player, cpu;

let scores = { player: 0, cpu: 0, tie: 0 };

const screens = ["front", "choice", "game"];
const grid = document.getElementById("grid");

const playerScoreValue = document.getElementById("playerScoreValue");
const cpuScoreValue = document.getElementById("cpuScoreValue");
const tieScoreValue = document.getElementById("tieScoreValue");

const popup = document.getElementById("popup");
const overlay = document.getElementById("overlay");
const resultText = document.getElementById("resultText");
const popupIcon = document.getElementById("popupIcon");
const turnIndicator = document.getElementById("turnIndicator");

window.onload = () => show("front");

function show(id) {
    screens.forEach(s => document.getElementById(s).style.display = "none");
    document.getElementById(id).style.display = "flex";
}

function enterMode(m) {
    mode = m;
    if (mode === "cpu"){
        show("choice");
    }
    else {
        player = "X";
        cpu = "O";
        startGame();
        show("game");
    }
}

function selectMark(mark) {
    player = mark;
    cpu = mark === "X" ? "O" : "X";
    startGame();
    show("game");
}

function startGame() {
    board.fill("");
    currentPlayer = "X";
    updateTurnIndicator();
    createGrid();
}

function createGrid() {
    grid.innerHTML = "";
    board.forEach((_, i) => {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.onclick = () => playerMove(i);
        grid.appendChild(cell);
    });
}

function updateTurnIndicator() {
    if (turnIndicator) {
        turnIndicator.textContent = currentPlayer;
    }
}

function playerMove(i) {
    if (board[i]){
        return;
    }
    if (mode === "cpu" && currentPlayer !== player){
        return;
    }

    board[i] = currentPlayer;
    updateUI();

    if (checkEnd()) return;

    if (mode === "two") {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateTurnIndicator();
        return;
    }

    // CPU's turn in single player mode
    grid.style.pointerEvents = "none";
    setTimeout(() => cpuMove(), 800);
}

function cpuMove() {
    if (checkEnd()) {
        grid.style.pointerEvents = "auto";
        return;
    }
    
    let best = minimax(board, cpu).index;
    board[best] = cpu;
    currentPlayer = player;
    updateUI();
    updateTurnIndicator();
    checkEnd();
    grid.style.pointerEvents = "auto";
}

function updateUI() {
    document.querySelectorAll(".cell").forEach((c, i) => {
        c.innerHTML =
            board[i] === "X" ? '<i class="fa-solid fa-xmark"></i>' :
                board[i] === "O" ? '<i class="fa-regular fa-circle"></i>' : "";
    });
}

function checkEnd() {
    let win = winner(board);
    if (win) {
        showResult(mode === "two" ? `Player ${win} Wins!` :
            win === player ? "You Win!" : "CPU Wins!", win);
        updateScore(win);
        return true;
    }
    if (!board.includes("")) {
        showResult("It's a Draw!", "tie");
        scores.tie++;
        updateScoreUI();
        return true;
    }
    return false;
}

function showResult(msg, type) {
    resultText.innerText = msg;
    
    // Update popup icon based on result
    if (type === "tie") {
        popupIcon.innerHTML = '<i class="fa-solid fa-handshake" style="color: #cbd5e1;"></i>';
    } else if (msg.includes("You Win")) {
        popupIcon.innerHTML = '<i class="fa-solid fa-trophy" style="color: #10b981;"></i>';
    } else {
        popupIcon.innerHTML = '<i class="fa-solid fa-robot" style="color: #f59e0b;"></i>';
    }
    
    overlay.style.display = popup.style.display = "block";
}

function closePopup() {
    overlay.style.display = popup.style.display = "none";
    startGame();
}

function retryGame() {
    startGame();
}

function goHome() {
    scores = { player: 0, cpu: 0, tie: 0 };
    updateScoreUI();
    show("front");
}

function updateScore(win) {
    if (mode === "two") {
        win === "X" ? scores.player++ : scores.cpu++;
    } else {
        win === player ? scores.player++ : scores.cpu++;
    }
    updateScoreUI();
}

function updateScoreUI() {
    playerScoreValue.textContent = scores.player;
    cpuScoreValue.textContent = scores.cpu;
    tieScoreValue.textContent = scores.tie;
}

function minimax(b, turn) {
    let avail = b.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    if (winner(b) === player){
        return { score: -10 };
    }
    if (winner(b) === cpu){
        return { score: 10 };
    }
    if (avail.length === 0){
        return { score: 0 };
    }
    let moves = [];
    for (let i of avail) {
        let move = { index: i };
        b[i] = turn;
        move.score = minimax(b, turn === cpu ? player : cpu).score;
        b[i] = "";
        moves.push(move);
    }
    return turn === cpu ?
        moves.reduce((a, b) => b.score > a.score ? b : a) :
        moves.reduce((a, b) => b.score < a.score ? b : a);
}

function winner(b) {
    const w = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (let [a, b1, c] of w) {
        if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    return null;
}
