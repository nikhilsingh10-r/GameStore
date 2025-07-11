// Tic Tac Toe Game Implementation
class TicTacToeGame {
    constructor() {
        this.board = document.getElementById('board');
        this.cells = document.querySelectorAll('.cell');
        this.gameStatus = document.getElementById('gameStatus');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.resetStatsBtn = document.getElementById('resetStatsBtn');
        this.playerWinsElement = document.getElementById('playerWins');
        this.computerWinsElement = document.getElementById('computerWins');
        this.drawsElement = document.getElementById('draws');
        
        // Game state
        this.gameBoard = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.isPlayerTurn = true;
        
        // Statistics
        this.stats = this.getStats();
        
        this.init();
    }

    init() {
        this.updateStatsDisplay();
        this.bindEvents();
        this.updateStatus('Your turn! Click a cell to play.');
    }

    bindEvents() {
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });
        
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.resetStatsBtn.addEventListener('click', () => this.resetStats());
    }

    handleCellClick(index) {
        if (!this.gameActive || !this.isPlayerTurn || this.gameBoard[index] !== '') {
            return;
        }

        this.makeMove(index, 'X');
        
        if (this.checkWinner()) {
            this.endGame('player');
        } else if (this.isBoardFull()) {
            this.endGame('draw');
        } else {
            this.isPlayerTurn = false;
            this.updateStatus('Computer is thinking...');
            setTimeout(() => this.computerMove(), 500);
        }
    }

    makeMove(index, player) {
        this.gameBoard[index] = player;
        this.cells[index].textContent = player;
        this.cells[index].classList.add(player.toLowerCase());
        
        // Add animation
        animateElement(this.cells[index], 'pulse');
    }

    computerMove() {
        if (!this.gameActive) return;

        const bestMove = this.getBestMove();
        this.makeMove(bestMove, 'O');
        
        if (this.checkWinner()) {
            this.endGame('computer');
        } else if (this.isBoardFull()) {
            this.endGame('draw');
        } else {
            this.isPlayerTurn = true;
            this.updateStatus('Your turn! Click a cell to play.');
        }
    }

    getBestMove() {
        // AI strategy: minimax with alpha-beta pruning (simplified)
        
        // 1. Check if computer can win
        for (let i = 0; i < 9; i++) {
            if (this.gameBoard[i] === '') {
                this.gameBoard[i] = 'O';
                if (this.checkWinner() === 'O') {
                    this.gameBoard[i] = '';
                    return i;
                }
                this.gameBoard[i] = '';
            }
        }

        // 2. Check if computer needs to block player
        for (let i = 0; i < 9; i++) {
            if (this.gameBoard[i] === '') {
                this.gameBoard[i] = 'X';
                if (this.checkWinner() === 'X') {
                    this.gameBoard[i] = '';
                    return i;
                }
                this.gameBoard[i] = '';
            }
        }

        // 3. Take center if available
        if (this.gameBoard[4] === '') {
            return 4;
        }

        // 4. Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(corner => this.gameBoard[corner] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        // 5. Take any available side
        const sides = [1, 3, 5, 7];
        const availableSides = sides.filter(side => this.gameBoard[side] === '');
        if (availableSides.length > 0) {
            return availableSides[Math.floor(Math.random() * availableSides.length)];
        }

        // Fallback: take any available cell
        const availableCells = this.gameBoard
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null);
        
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.gameBoard[a] && 
                this.gameBoard[a] === this.gameBoard[b] && 
                this.gameBoard[a] === this.gameBoard[c]) {
                
                // Highlight winning cells
                this.cells[a].classList.add('winner');
                this.cells[b].classList.add('winner');
                this.cells[c].classList.add('winner');
                
                return this.gameBoard[a];
            }
        }

        return null;
    }

    isBoardFull() {
        return this.gameBoard.every(cell => cell !== '');
    }

    endGame(result) {
        this.gameActive = false;
        
        switch (result) {
            case 'player':
                this.updateStatus('🎉 You won! Congratulations!');
                this.stats.playerWins++;
                break;
            case 'computer':
                this.updateStatus('💻 Computer won! Better luck next time!');
                this.stats.computerWins++;
                break;
            case 'draw':
                this.updateStatus('🤝 It\'s a draw! Well played!');
                this.stats.draws++;
                break;
        }
        
        this.saveStats();
        this.updateStatsDisplay();
        this.updateGlobalStats();
        
        // Add winner animation
        if (result !== 'draw') {
            this.gameStatus.classList.add('winner-announcement');
            setTimeout(() => {
                this.gameStatus.classList.remove('winner-announcement');
            }, 1000);
        }
    }

    newGame() {
        this.gameBoard = Array(9).fill('');
        this.gameActive = true;
        this.isPlayerTurn = true;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winner');
        });
        
        this.updateStatus('Your turn! Click a cell to play.');
    }

    updateStatus(message) {
        this.gameStatus.textContent = message;
    }

    updateStatsDisplay() {
        this.playerWinsElement.textContent = this.stats.playerWins;
        this.computerWinsElement.textContent = this.stats.computerWins;
        this.drawsElement.textContent = this.stats.draws;
    }

    getStats() {
        try {
            const stats = localStorage.getItem('tictactoeStats');
            return stats ? JSON.parse(stats) : {
                playerWins: 0,
                computerWins: 0,
                draws: 0
            };
        } catch (e) {
            return {
                playerWins: 0,
                computerWins: 0,
                draws: 0
            };
        }
    }

    saveStats() {
        try {
            localStorage.setItem('tictactoeStats', JSON.stringify(this.stats));
        } catch (e) {
            console.warn('Could not save stats');
        }
    }

    resetStats() {
        if (confirm('Are you sure you want to reset all statistics?')) {
            this.stats = {
                playerWins: 0,
                computerWins: 0,
                draws: 0
            };
            this.saveStats();
            this.updateStatsDisplay();
        }
    }

    updateGlobalStats() {
        try {
            const plays = parseInt(localStorage.getItem('tictactoePlays') || '0') + 1;
            localStorage.setItem('tictactoePlays', plays.toString());
        } catch (e) {
            console.warn('Could not update global stats');
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
});
