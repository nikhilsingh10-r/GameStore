// Memory Match Game Implementation
class MemoryGame {
    constructor() {
        this.board = document.getElementById('memoryBoard');
        this.movesElement = document.getElementById('moves');
        this.matchesElement = document.getElementById('matches');
        this.timerElement = document.getElementById('timer');
        this.gameStatus = document.getElementById('gameStatus');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.easyBtn = document.getElementById('easyBtn');
        this.hardBtn = document.getElementById('hardBtn');
        
        // Game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedCards = [];
        this.moves = 0;
        this.matches = 0;
        this.gameActive = false;
        this.timer = 0;
        this.timerInterval = null;
        this.difficulty = 'hard'; // 'easy' = 4x3, 'hard' = 4x4
        
        // Card symbols
        this.symbols = {
            easy: ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭'],
            hard: ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎸', '🎺']
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.createGame();
    }

    bindEvents() {
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.easyBtn.addEventListener('click', () => this.setDifficulty('easy'));
        this.hardBtn.addEventListener('click', () => this.setDifficulty('hard'));
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.updateDifficultyButtons();
        this.createGame();
    }

    updateDifficultyButtons() {
        this.easyBtn.style.background = this.difficulty === 'easy' ? 
            'var(--success-color)' : 'var(--primary-color)';
        this.hardBtn.style.background = this.difficulty === 'hard' ? 
            'var(--success-color)' : 'var(--primary-color)';
    }

    createGame() {
        this.stopTimer();
        this.resetGameState();
        this.generateCards();
        this.shuffleCards();
        this.createBoard();
        this.updateDisplay();
        this.updateStatus('Click on cards to find matching pairs!');
    }

    resetGameState() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedCards = [];
        this.moves = 0;
        this.matches = 0;
        this.timer = 0;
        this.gameActive = false;
    }

    generateCards() {
        const symbolSet = this.symbols[this.difficulty];
        const pairs = this.difficulty === 'easy' ? 6 : 8;
        
        for (let i = 0; i < pairs; i++) {
            const symbol = symbolSet[i];
            this.cards.push({ id: i * 2, symbol: symbol });
            this.cards.push({ id: i * 2 + 1, symbol: symbol });
        }
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    createBoard() {
        this.board.innerHTML = '';
        this.board.className = `memory-board ${this.difficulty}`;
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.index = index;
            cardElement.innerHTML = `
                <div class="card-back">?</div>
                <div class="card-front">${card.symbol}</div>
            `;
            
            cardElement.addEventListener('click', () => this.flipCard(index));
            this.board.appendChild(cardElement);
        });
    }

    flipCard(index) {
        if (!this.gameActive && this.moves === 0) {
            this.startGame();
        }

        const cardElement = this.board.children[index];
        
        // Check if card can be flipped
        if (cardElement.classList.contains('flipped') || 
            cardElement.classList.contains('matched') ||
            this.flippedCards.length >= 2) {
            return;
        }

        // Flip the card
        cardElement.classList.add('flipped');
        this.flippedCards.push(index);
        
        // Add flip animation
        animateElement(cardElement, 'pulse');

        // Check for matches when two cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            
            setTimeout(() => this.checkMatch(), 1000);
        }
    }

    checkMatch() {
        const [index1, index2] = this.flippedCards;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];
        const element1 = this.board.children[index1];
        const element2 = this.board.children[index2];

        if (card1.symbol === card2.symbol) {
            // Match found
            element1.classList.add('matched');
            element2.classList.add('matched');
            this.matchedCards.push(index1, index2);
            this.matches++;
            
            // Add match animation
            animateElement(element1, 'pulse');
            animateElement(element2, 'pulse');
            
            this.updateStatus(`Great! You found a match! ${this.matches} pairs found.`);
            
            // Check if game is won
            if (this.matchedCards.length === this.cards.length) {
                this.endGame();
            }
        } else {
            // No match - flip cards back
            element1.classList.remove('flipped');
            element2.classList.remove('flipped');
        }

        this.flippedCards = [];
        this.updateDisplay();
    }

    startGame() {
        this.gameActive = true;
        this.startTimer();
        this.updateStatus('Game started! Find all the matching pairs.');
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

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        this.timerElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    endGame() {
        this.gameActive = false;
        this.stopTimer();
        
        const totalPairs = this.difficulty === 'easy' ? 6 : 8;
        const efficiency = Math.round((totalPairs / this.moves) * 100);
        
        this.updateStatus(`🎉 Congratulations! You won in ${this.moves} moves and ${this.formatTime(this.timer)}!`);
        
        // Add winner animation
        this.gameStatus.classList.add('winner-announcement');
        setTimeout(() => {
            this.gameStatus.classList.remove('winner-announcement');
        }, 2000);
        
        // Update global stats
        this.updateGlobalStats();
        
        // Store best time if applicable
        this.saveBestTime();
        
        // Show detailed results
        setTimeout(() => {
            alert(`Game Complete!\n\nMoves: ${this.moves}\nTime: ${this.formatTime(this.timer)}\nEfficiency: ${efficiency}%`);
        }, 1000);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    newGame() {
        this.createGame();
    }

    updateDisplay() {
        this.movesElement.textContent = this.moves;
        this.matchesElement.textContent = this.matches;
        this.updateTimerDisplay();
    }

    updateStatus(message) {
        this.gameStatus.textContent = message;
    }

    updateGlobalStats() {
        try {
            const plays = parseInt(localStorage.getItem('memoryPlays') || '0') + 1;
            localStorage.setItem('memoryPlays', plays.toString());
        } catch (e) {
            console.warn('Could not update global stats');
        }
    }

    saveBestTime() {
        try {
            const currentBest = parseInt(localStorage.getItem('memoryBestTime') || '999');
            if (this.timer < currentBest) {
                localStorage.setItem('memoryBestTime', this.timer.toString());
            }
        } catch (e) {
            console.warn('Could not save best time');
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
