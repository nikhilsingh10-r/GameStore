// Snake Game Implementation
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameStartTime = null;
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Game state
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.snake = [{x: 10, y: 10}];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = this.getHighScore();
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.init();
    }

    init() {
        this.generateFood();
        this.updateDisplay();
        this.bindEvents();
        this.draw();
    }

    bindEvents() {
        // Game controls
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetGame());

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Mobile controls
        const directionBtns = document.querySelectorAll('.direction-btn');
        directionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const direction = btn.dataset.direction;
                this.setDirection(direction);
            });
        });
    }

    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) return;

        const key = e.key.toLowerCase();
        
        switch (key) {
            case 'arrowup':
            case 'w':
                this.setDirection('up');
                break;
            case 'arrowdown':
            case 's':
                this.setDirection('down');
                break;
            case 'arrowleft':
            case 'a':
                this.setDirection('left');
                break;
            case 'arrowright':
            case 'd':
                this.setDirection('right');
                break;
        }
    }

    setDirection(direction) {
        switch (direction) {
            case 'up':
                if (this.dy === 0) { this.dx = 0; this.dy = -1; }
                break;
            case 'down':
                if (this.dy === 0) { this.dx = 0; this.dy = 1; }
                break;
            case 'left':
                if (this.dx === 0) { this.dx = -1; this.dy = 0; }
                break;
            case 'right':
                if (this.dx === 0) { this.dx = 1; this.dy = 0; }
                break;
        }
    }

    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameStartTime = Date.now();
            this.dx = 1;
            this.dy = 0;
            this.gameLoop();
            this.updateButtons();
        }
    }

    togglePause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            if (!this.gamePaused) {
                this.gameLoop();
            }
            this.updateButtons();
        }
    }

    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.generateFood();
        this.updateDisplay();
        this.updateButtons();
        this.draw();
    }

    updateButtons() {
        this.startBtn.disabled = this.gameRunning;
        this.pauseBtn.disabled = !this.gameRunning;
        this.pauseBtn.textContent = this.gamePaused ? 'Resume' : 'Pause';
    }

    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;

        this.update();
        this.draw();

        setTimeout(() => this.gameLoop(), 150);
    }

    update() {
        // Move snake head
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }

        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.generateFood();
            this.updateDisplay();
        } else {
            this.snake.pop();
        }
    }

    generateFood() {
        let foodPosition;
        do {
            foodPosition = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => 
            segment.x === foodPosition.x && segment.y === foodPosition.y));
        
        this.food = foodPosition;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--surface-color');
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--success-color');
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            this.ctx.fillRect(
                segment.x * this.gridSize, 
                segment.y * this.gridSize, 
                this.gridSize - 2, 
                this.gridSize - 2
            );
        }

        // Draw food
        this.ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--error-color');
        this.ctx.fillRect(
            this.food.x * this.gridSize, 
            this.food.y * this.gridSize, 
            this.gridSize - 2, 
            this.gridSize - 2
        );
    }

    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        this.updateDisplay();
        this.updateButtons();
        this.updateGlobalStats();
        
        alert(`Game Over! Your score: ${this.score}`);
    }

    async updateGlobalStats() {
        try {
            const plays = parseInt(localStorage.getItem('snakePlays') || '0') + 1;
            localStorage.setItem('snakePlays', plays.toString());
            
            // Update database if available
            if (window.dbClient && window.dbClient.currentUser) {
                try {
                    // Record game session
                    await window.dbClient.recordGameSession('snake', {
                        score: this.score,
                        duration: Math.floor((Date.now() - this.gameStartTime) / 1000),
                        completed: this.gameRunning === false
                    });

                    // Update game stats
                    const currentStats = await window.dbClient.getGameStats('snake');
                    const newStats = {
                        gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
                        gamesWon: currentStats.gamesWon || 0,
                        bestScore: Math.max(currentStats.bestScore || 0, this.score),
                        totalScore: (currentStats.totalScore || 0) + this.score
                    };
                    await window.dbClient.updateGameStats('snake', newStats);

                    // Update leaderboard if new high score
                    if (this.score > (currentStats.bestScore || 0)) {
                        await window.dbClient.updateLeaderboard('snake', 'high_score', this.score);
                    }
                } catch (error) {
                    console.warn('Database update failed:', error);
                }
            }
        } catch (e) {
            console.warn('Could not update global stats');
        }
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.highScoreElement.textContent = this.highScore;
    }

    getHighScore() {
        try {
            return parseInt(localStorage.getItem('snakeHighScore') || '0');
        } catch (e) {
            return 0;
        }
    }

    saveHighScore() {
        try {
            localStorage.setItem('snakeHighScore', this.highScore.toString());
        } catch (e) {
            console.warn('Could not save high score');
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
