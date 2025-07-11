// Sliding Puzzle Game Implementation
class SlidingPuzzle {
    constructor() {
        this.board = document.getElementById('puzzleBoard');
        this.movesElement = document.getElementById('moves');
        this.timerElement = document.getElementById('timer');
        this.bestMovesElement = document.getElementById('bestMoves');
        this.gameStatus = document.getElementById('gameStatus');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.solveBtn = document.getElementById('solveBtn');
        this.resetStatsBtn = document.getElementById('resetStatsBtn');
        this.easy3x3Btn = document.getElementById('easy3x3');
        this.hard4x4Btn = document.getElementById('hard4x4');
        
        // Game state
        this.size = 3; // 3x3 or 4x4
        this.tiles = [];
        this.emptyIndex = 0;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameActive = false;
        this.solving = false;
        
        this.init();
    }

    init() {
        this.loadBestMoves();
        this.updateDifficultyButtons();
        this.bindEvents();
        this.createSolvedPuzzle();
        this.renderBoard();
    }

    bindEvents() {
        this.shuffleBtn.addEventListener('click', () => this.shufflePuzzle());
        this.solveBtn.addEventListener('click', () => this.autoSolve());
        this.resetStatsBtn.addEventListener('click', () => this.resetStats());
        this.easy3x3Btn.addEventListener('click', () => this.setDifficulty(3));
        this.hard4x4Btn.addEventListener('click', () => this.setDifficulty(4));
    }

    setDifficulty(size) {
        this.size = size;
        this.stopTimer();
        this.resetGame();
        this.createSolvedPuzzle();
        this.renderBoard();
        this.updateDifficultyButtons();
        this.updateStatus('Click "Shuffle" to start a new puzzle!');
    }

    updateDifficultyButtons() {
        this.easy3x3Btn.style.background = this.size === 3 ? 
            'var(--success-color)' : 'var(--primary-color)';
        this.hard4x4Btn.style.background = this.size === 4 ? 
            'var(--success-color)' : 'var(--primary-color)';
    }

    createSolvedPuzzle() {
        const totalTiles = this.size * this.size;
        this.tiles = Array.from({length: totalTiles}, (_, i) => i);
        this.emptyIndex = totalTiles - 1;
    }

    shufflePuzzle() {
        this.createSolvedPuzzle();
        
        // Perform random valid moves to ensure solvability
        for (let i = 0; i < 1000; i++) {
            const neighbors = this.getNeighbors(this.emptyIndex);
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.swapTiles(this.emptyIndex, randomNeighbor);
            this.emptyIndex = randomNeighbor;
        }
        
        this.resetGame();
        this.gameActive = true;
        this.startTimer();
        this.renderBoard();
        this.updateStatus('Arrange the tiles in order! Click tiles adjacent to the empty space.');
    }

    getNeighbors(index) {
        const neighbors = [];
        const row = Math.floor(index / this.size);
        const col = index % this.size;
        
        // Up
        if (row > 0) neighbors.push(index - this.size);
        // Down
        if (row < this.size - 1) neighbors.push(index + this.size);
        // Left
        if (col > 0) neighbors.push(index - 1);
        // Right
        if (col < this.size - 1) neighbors.push(index + 1);
        
        return neighbors;
    }

    swapTiles(index1, index2) {
        [this.tiles[index1], this.tiles[index2]] = [this.tiles[index2], this.tiles[index1]];
    }

    renderBoard() {
        this.board.innerHTML = '';
        this.board.className = `puzzle-board size-${this.size}`;
        
        this.tiles.forEach((tile, index) => {
            const tileElement = document.createElement('div');
            tileElement.className = 'puzzle-tile';
            
            if (tile === this.size * this.size - 1) {
                // Empty tile
                tileElement.classList.add('empty');
            } else {
                tileElement.textContent = tile + 1;
                tileElement.addEventListener('click', () => this.handleTileClick(index));
            }
            
            this.board.appendChild(tileElement);
        });
    }

    handleTileClick(index) {
        if (!this.gameActive || this.solving) return;
        
        const neighbors = this.getNeighbors(this.emptyIndex);
        if (neighbors.includes(index)) {
            this.swapTiles(this.emptyIndex, index);
            this.emptyIndex = index;
            this.moves++;
            this.updateDisplay();
            this.renderBoard();
            
            // Add click animation
            const clickedTile = this.board.children[this.emptyIndex];
            animateElement(clickedTile, 'pulse');
            
            if (this.isSolved()) {
                this.gameWon();
            }
        }
    }

    isSolved() {
        for (let i = 0; i < this.tiles.length - 1; i++) {
            if (this.tiles[i] !== i) return false;
        }
        return this.tiles[this.tiles.length - 1] === this.tiles.length - 1;
    }

    gameWon() {
        this.gameActive = false;
        this.stopTimer();
        
        const bestMoves = this.getBestMoves();
        if (bestMoves === null || this.moves < bestMoves) {
            this.saveBestMoves(this.moves);
            this.loadBestMoves();
            this.updateStatus(`🎉 New record! Solved in ${this.moves} moves and ${this.formatTime(this.timer)}!`);
        } else {
            this.updateStatus(`🎉 Puzzle solved in ${this.moves} moves and ${this.formatTime(this.timer)}!`);
        }
        
        // Add winner animation
        this.gameStatus.classList.add('winner-announcement');
        setTimeout(() => {
            this.gameStatus.classList.remove('winner-announcement');
        }, 2000);
        
        // Update global stats
        this.updateGlobalStats();
    }

    autoSolve() {
        if (!this.gameActive || this.solving) return;
        
        this.solving = true;
        this.solveBtn.disabled = true;
        this.solveBtn.textContent = 'Solving...';
        this.updateStatus('Auto-solving puzzle...');
        
        const solution = this.findSolution();
        if (solution) {
            this.animateSolution(solution);
        } else {
            this.solving = false;
            this.solveBtn.disabled = false;
            this.solveBtn.textContent = 'Auto Solve';
            this.updateStatus('Could not find solution. Try shuffling again.');
        }
    }

    findSolution() {
        // Simple A* pathfinding implementation
        const start = this.tiles.slice();
        const goal = Array.from({length: this.size * this.size}, (_, i) => i);
        
        const queue = [{state: start, path: [], moves: 0, emptyIndex: this.emptyIndex}];
        const visited = new Set();
        visited.add(start.join(','));
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (this.arraysEqual(current.state, goal)) {
                return current.path;
            }
            
            if (current.moves > 50) continue; // Limit search depth
            
            const neighbors = this.getNeighbors(current.emptyIndex);
            for (let neighborIndex of neighbors) {
                const newState = current.state.slice();
                [newState[current.emptyIndex], newState[neighborIndex]] = 
                [newState[neighborIndex], newState[current.emptyIndex]];
                
                const stateKey = newState.join(',');
                if (!visited.has(stateKey)) {
                    visited.add(stateKey);
                    queue.push({
                        state: newState,
                        path: [...current.path, neighborIndex],
                        moves: current.moves + 1,
                        emptyIndex: neighborIndex
                    });
                }
            }
        }
        
        return null;
    }

    arraysEqual(a, b) {
        return a.length === b.length && a.every((val, i) => val === b[i]);
    }

    animateSolution(solution) {
        if (solution.length === 0) {
            this.solving = false;
            this.solveBtn.disabled = false;
            this.solveBtn.textContent = 'Auto Solve';
            this.gameWon();
            return;
        }
        
        const nextMove = solution.shift();
        this.handleTileClick(nextMove);
        
        setTimeout(() => {
            this.animateSolution(solution);
        }, 300);
    }

    resetGame() {
        this.moves = 0;
        this.timer = 0;
        this.gameActive = false;
        this.solving = false;
        this.solveBtn.disabled = false;
        this.solveBtn.textContent = 'Auto Solve';
        this.stopTimer();
        this.updateDisplay();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateDisplay() {
        this.movesElement.textContent = this.moves;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        this.timerElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updateStatus(message) {
        this.gameStatus.textContent = message;
    }

    getBestMoves() {
        try {
            const key = `puzzleBestMoves${this.size}x${this.size}`;
            const best = localStorage.getItem(key);
            return best ? parseInt(best) : null;
        } catch (e) {
            return null;
        }
    }

    saveBestMoves(moves) {
        try {
            const key = `puzzleBestMoves${this.size}x${this.size}`;
            localStorage.setItem(key, moves.toString());
        } catch (e) {
            console.warn('Could not save best moves');
        }
    }

    loadBestMoves() {
        const best = this.getBestMoves();
        this.bestMovesElement.textContent = best ? best.toString() : '--';
    }

    resetStats() {
        if (confirm('Are you sure you want to reset all statistics?')) {
            try {
                localStorage.removeItem(`puzzleBestMoves${this.size}x${this.size}`);
                localStorage.removeItem(`puzzlePlays`);
                this.loadBestMoves();
                this.updateStatus('Statistics reset successfully!');
            } catch (e) {
                console.warn('Could not reset stats');
            }
        }
    }

    updateGlobalStats() {
        try {
            const plays = parseInt(localStorage.getItem('puzzlePlays') || '0') + 1;
            localStorage.setItem('puzzlePlays', plays.toString());
        } catch (e) {
            console.warn('Could not update global stats');
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SlidingPuzzle();
});