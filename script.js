// Game variables - keeping track of everything
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameMode = ''; // 'ai' or 'human'
let aiDifficulty = ''; // 'easy', 'medium', 'hard'
let gameActive = false;
let scores = {
    player1: 0,
    player2: 0,
    draws: 0
};

// All possible winning combinations
const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
];

// Function to select game mode
function selectGameMode(mode) {
    gameMode = mode;
    
    if (mode === 'ai') {
        // Show difficulty selection for AI
        document.getElementById('gameModes').classList.add('hidden');
        document.getElementById('difficultyScreen').classList.remove('hidden');
    } else {
        // Start human vs human game directly
        startHumanGame();
    }
}

// Function to start AI game with selected difficulty
function startAIGame(difficulty) {
    aiDifficulty = difficulty;
    document.getElementById('difficultyScreen').classList.add('hidden');
    document.getElementById('gameBoard').classList.remove('hidden');
    
    // Set player names for AI mode
    document.getElementById('player1Name').textContent = 'You';
    document.getElementById('player2Name').textContent = `AI (${difficulty})`;
    
    initializeGame();
}

// Function to start human vs human game
function startHumanGame() {
    document.getElementById('gameModes').classList.add('hidden');
    document.getElementById('gameBoard').classList.remove('hidden');
    
    // Set player names for human mode
    document.getElementById('player1Name').textContent = 'Player 1';
    document.getElementById('player2Name').textContent = 'Player 2';
    
    initializeGame();
}

// Initialize the game
function initializeGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    
    // Clear all cells
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });
    
    updateTurnIndicator();
    updatePlayerHighlight();
    updateScoreDisplay();
}

// Function called when a cell is clicked
function makeMove(cellIndex) {
    // Check if move is valid
    if (!gameActive || gameBoard[cellIndex] !== '' || (gameMode === 'ai' && currentPlayer === 'O')) {
        return;
    }
    
    // Make the actual move
    placePiece(cellIndex, currentPlayer);
    
    // If it's AI's turn, make AI move
    if (gameMode === 'ai' && currentPlayer === 'O' && gameActive) {
        makeAIMove();
    }
}

// Function to actually place a piece on the board
function placePiece(cellIndex, player) {
    // Make the move
    gameBoard[cellIndex] = player;
    const cell = document.querySelectorAll('.cell')[cellIndex];
    cell.textContent = player === 'X' ? '❌' : '⭕';
    cell.classList.add(player.toLowerCase());
    
    // Check if game is over
    if (checkWinner()) {
        endGame('win');
        return;
    }
    
    if (checkDraw()) {
        endGame('draw');
        return;
    }
    
    // Switch players
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
    updatePlayerHighlight();
}

// AI makes its move
function makeAIMove() {
    if (!gameActive) return;
    
    // Show thinking animation
    document.getElementById('aiThinking').classList.remove('hidden');
    
    // Add delay to make it feel more natural
    setTimeout(() => {
        if (!gameActive) {
            document.getElementById('aiThinking').classList.add('hidden');
            return;
        }
        
        let moveIndex = -1;
        
        if (aiDifficulty === 'easy') {
            moveIndex = getRandomMove();
        } else if (aiDifficulty === 'medium') {
            moveIndex = getMediumMove();
        } else if (aiDifficulty === 'hard') {
            moveIndex = getHardMove();
        }
        
        // Hide thinking animation
        document.getElementById('aiThinking').classList.add('hidden');
        
        // Make the AI move
        if (moveIndex !== -1 && gameActive) {
            placePiece(moveIndex, 'O');
        }
    }, 1000); // 1 second delay
}

// Easy AI - just picks random empty spot
function getRandomMove() {
    const emptyCells = [];
    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            emptyCells.push(i);
        }
    }
    
    if (emptyCells.length > 0) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    return -1;
}

// Medium AI - tries to be smart sometimes
function getMediumMove() {
    // 70% chance to make smart move, 30% random
    if (Math.random() < 0.7) {
        // First try to win
        let winMove = findWinningMove('O');
        if (winMove !== -1) return winMove;
        
        // Then try to block player from winning
        let blockMove = findWinningMove('X');
        if (blockMove !== -1) return blockMove;
        
        // Take center if available
        if (gameBoard[4] === '') return 4;
        
        // Take a corner
        const corners = [0, 2, 6, 8];
        for (let corner of corners) {
            if (gameBoard[corner] === '') return corner;
        }
    }
    
    // Otherwise make random move
    return getRandomMove();
}

// Hard AI - uses minimax algorithm (unbeatable)
function getHardMove() {
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'O';
            let score = minimax(gameBoard, 0, false);
            gameBoard[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

// Minimax algorithm for unbeatable AI
function minimax(board, depth, isMaximizing) {
    let winner = checkWinnerForBoard(board);
    
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (board.every(cell => cell !== '')) return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Find if there's a winning move available
function findWinningMove(player) {
    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = player;
            if (checkWinnerForBoard(gameBoard) === player) {
                gameBoard[i] = '';
                return i;
            }
            gameBoard[i] = '';
        }
    }
    return -1;
}

// Check if current player won
function checkWinner() {
    return checkWinnerForBoard(gameBoard) !== null;
}

// Check winner for any board state
function checkWinnerForBoard(board) {
    for (let combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

// Check if game is a draw
function checkDraw() {
    return gameBoard.every(cell => cell !== '') && !checkWinner();
}

// End the game
function endGame(result) {
    gameActive = false;
    
    if (result === 'win') {
        // Highlight winning cells
        highlightWinningCells();
        
        // Update scores
        if (currentPlayer === 'X') {
            scores.player1++;
        } else {
            scores.player2++;
        }
        
        // Show result popup
        setTimeout(() => {
            showResultPopup(result);
        }, 1000);
        
    } else if (result === 'draw') {
        scores.draws++;
        setTimeout(() => {
            showResultPopup(result);
        }, 500);
    }
    
    updateScoreDisplay();
}

// Highlight the winning cells
function highlightWinningCells() {
    for (let combo of winningCombos) {
        const [a, b, c] = combo;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            const cells = document.querySelectorAll('.cell');
            cells[a].classList.add('winning');
            cells[b].classList.add('winning');
            cells[c].classList.add('winning');
            break;
        }
    }
}

// Show result popup
function showResultPopup(result) {
    const popup = document.getElementById('gamePopup');
    const emoji = document.getElementById('resultEmoji');
    const title = document.getElementById('resultTitle');
    const message = document.getElementById('resultMessage');
    
    if (result === 'win') {
        if (gameMode === 'ai') {
            if (currentPlayer === 'X') {
                emoji.textContent = '🎉';
                title.textContent = 'You Win!';
                message.textContent = 'Congratulations! You beat the AI!';
            } else {
                emoji.textContent = '😢';
                title.textContent = 'AI Wins!';
                message.textContent = 'Better luck next time!';
            }
        } else {
            emoji.textContent = '🏆';
            title.textContent = `Player ${currentPlayer === 'X' ? '1' : '2'} Wins!`;
            message.textContent = `Congratulations Player ${currentPlayer === 'X' ? '1' : '2'}!`;
        }
    } else {
        emoji.textContent = '🤝';
        title.textContent = "It's a Draw!";
        message.textContent = 'Good game! Nobody wins this time.';
    }
    
    popup.classList.remove('hidden');
}

// Update turn indicator
function updateTurnIndicator() {
    const indicator = document.getElementById('turnIndicator');
    
    if (gameMode === 'ai') {
        if (currentPlayer === 'X') {
            indicator.textContent = 'Your Turn';
        } else {
            indicator.textContent = 'AI is thinking...';
        }
    } else {
        indicator.textContent = `Player ${currentPlayer === 'X' ? '1' : '2'}'s Turn`;
    }
}

// Update player highlight
function updatePlayerHighlight() {
    const player1 = document.getElementById('player1');
    const player2 = document.getElementById('player2');
    
    if (currentPlayer === 'X') {
        player1.classList.add('active');
        player2.classList.remove('active');
    } else {
        player1.classList.remove('active');
        player2.classList.add('active');
    }
}

// Update score display
function updateScoreDisplay() {
    document.getElementById('score1').textContent = scores.player1;
    document.getElementById('score2').textContent = scores.player2;
    document.getElementById('scoreDraw').textContent = scores.draws;
}

// Restart current game
function restartGame() {
    initializeGame();
}

// Start completely new game (reset scores)
function newGame() {
    scores = { player1: 0, player2: 0, draws: 0 };
    initializeGame();
}

// Go back to difficulty selection
function goBackToModes() {
    document.getElementById('difficultyScreen').classList.add('hidden');
    document.getElementById('gameModes').classList.remove('hidden');
}

// Go back to main menu
function goHome() {
    document.getElementById('gameBoard').classList.add('hidden');
    document.getElementById('gamePopup').classList.add('hidden');
    document.getElementById('gameModes').classList.remove('hidden');
    
    // Reset everything
    gameMode = '';
    aiDifficulty = '';
    scores = { player1: 0, player2: 0, draws: 0 };
}

// Play again (from popup)
function playAgain() {
    document.getElementById('gamePopup').classList.add('hidden');
    initializeGame();
}

// Initialize the game when page loads
window.onload = function() {
    console.log('Tic Tac Toe game loaded!');
};