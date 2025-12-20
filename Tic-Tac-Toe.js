let board = Array(9).fill("");
let mode = "cpu";
let currentPlayer = "X";
let player, cpu;

let scores = { player: 0, cpu: 0, tie: 0 };

const screens = ["front", "choice", "game"];
const grid = document.getElementById("grid");

const playerScore = document.getElementById("playerScore");
const cpuScore = document.getElementById("cpuScore");
const tieScore = document.getElementById("tieScore");

const popup = document.getElementById("popup");
const overlay = document.getElementById("overlay");
const resultText = document.getElementById("resultText");

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
        return;
    }

    grid.style.pointerEvents = "none";
    setTimeout(() => {
        let best = minimax(board, cpu).index;
        board[best] = cpu;
        updateUI();
        checkEnd();
        grid.style.pointerEvents = "auto";
    }, 1000);
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
            win === player ? "You Win!" : "CPU Wins!");
        updateScore(win);
        return true;
    }
    if (!board.includes("")) {
        showResult("Draw!");
        scores.tie++;
        updateScoreUI();
        return true;
    }
    return false;
}

function showResult(msg) {
    resultText.innerText = msg;
    overlay.style.display = popup.style.display = "block";
}

function closePopup() {
    overlay.style.display = popup.style.display = "none";
    startGame();
}

function retryGame() { startGame(); }
function goHome() { show("front"); }

function updateScore(win) {
    if (mode === "two") {
        win === "X" ? scores.player++ : scores.cpu++;
    } else {
        win === player ? scores.player++ : scores.cpu++;
    }
    updateScoreUI();
}

function updateScoreUI() {
    playerScore.innerHTML = `YOU<br>${scores.player}`;
    cpuScore.innerHTML = `CPU<br>${scores.cpu}`;
    tieScore.innerHTML = `TIES<br>${scores.tie}`;
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
