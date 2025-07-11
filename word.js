// Word Guess Game Implementation (like Wordle)
class WordGuess {
    constructor() {
        this.wordGrid = document.getElementById('wordGrid');
        this.keyboard = document.getElementById('keyboard');
        this.gameStatus = document.getElementById('gameStatus');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.hintBtn = document.getElementById('hintBtn');
        this.resetStatsBtn = document.getElementById('resetStatsBtn');
        this.streakElement = document.getElementById('streak');
        this.playedElement = document.getElementById('played');
        this.wonElement = document.getElementById('won');
        
        // Game state
        this.wordList = [
            'APPLE', 'BRAIN', 'CHAIR', 'DANCE', 'EARLY', 'FLAME', 'GRACE', 'HEART',
            'IMAGE', 'JOINT', 'KNIFE', 'LIGHT', 'MAGIC', 'NIGHT', 'OCEAN', 'PEACE',
            'QUICK', 'RIVER', 'SMILE', 'TOWER', 'UNDER', 'VOICE', 'WATER', 'YOUTH',
            'BRAVE', 'CLOUD', 'DREAM', 'EARTH', 'FRESH', 'GIANT', 'HAPPY', 'IDEAL',
            'LUCKY', 'MUSIC', 'NOBLE', 'POWER', 'QUIET', 'ROYAL', 'SMART', 'TRUST',
            'UNITY', 'VITAL', 'WORTH', 'YOUNG', 'BEACH', 'CLEAN', 'DRIVE', 'ENJOY',
            'FAITH', 'GREAT', 'HONOR', 'JOKER', 'KNOWN', 'LASER', 'MATCH', 'NEVER',
            'OFFER', 'PLANT', 'QUEEN', 'REACH', 'SPACE', 'THEME', 'URBAN', 'VALUE'
        ];
        
        this.currentWord = '';
        this.currentGuess = '';
        this.currentRow = 0;
        this.gameActive = false;
        this.gameWon = false;
        this.maxGuesses = 6;
        this.wordLength = 5;
        this.hintsUsed = 0;
        
        // Statistics
        this.stats = this.getStats();
        
        this.init();
    }

    init() {
        this.updateStatsDisplay();
        this.bindEvents();
        this.createGrid();
        this.createKeyboard();
        this.newGame();
    }

    bindEvents() {
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.hintBtn.addEventListener('click', () => this.giveHint());
        this.resetStatsBtn.addEventListener('click', () => this.resetStats());
        
        // Physical keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    createGrid() {
        this.wordGrid.innerHTML = '';
        for (let row = 0; row < this.maxGuesses; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'word-row';
            
            for (let col = 0; col < this.wordLength; col++) {
                const cellElement = document.createElement('div');
                cellElement.className = 'word-cell';
                cellElement.dataset.row = row;
                cellElement.dataset.col = col;
                rowElement.appendChild(cellElement);
            }
            
            this.wordGrid.appendChild(rowElement);
        }
    }

    createKeyboard() {
        const rows = [
            'QWERTYUIOP',
            'ASDFGHJKL',
            'ZXCVBNM'
        ];
        
        this.keyboard.innerHTML = '';
        
        rows.forEach((row, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'keyboard-row';
            
            if (rowIndex === 2) {
                // Add Enter key
                const enterKey = document.createElement('button');
                enterKey.className = 'key special-key';
                enterKey.textContent = 'ENTER';
                enterKey.addEventListener('click', () => this.submitGuess());
                rowElement.appendChild(enterKey);
            }
            
            for (let letter of row) {
                const keyElement = document.createElement('button');
                keyElement.className = 'key';
                keyElement.textContent = letter;
                keyElement.addEventListener('click', () => this.addLetter(letter));
                rowElement.appendChild(keyElement);
            }
            
            if (rowIndex === 2) {
                // Add Backspace key
                const backspaceKey = document.createElement('button');
                backspaceKey.className = 'key special-key';
                backspaceKey.textContent = '⌫';
                backspaceKey.addEventListener('click', () => this.deleteLetter());
                rowElement.appendChild(backspaceKey);
            }
            
            this.keyboard.appendChild(rowElement);
        });
    }

    newGame() {
        this.currentWord = this.wordList[Math.floor(Math.random() * this.wordList.length)];
        this.currentGuess = '';
        this.currentRow = 0;
        this.gameActive = true;
        this.gameWon = false;
        this.hintsUsed = 0;
        
        // Clear grid
        const cells = this.wordGrid.querySelectorAll('.word-cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'word-cell';
        });
        
        // Reset keyboard
        const keys = this.keyboard.querySelectorAll('.key');
        keys.forEach(key => {
            key.className = key.classList.contains('special-key') ? 'key special-key' : 'key';
        });
        
        this.updateStatus('Guess the 5-letter word! You have 6 tries.');
        this.hintBtn.disabled = false;
        console.log('New word:', this.currentWord); // For debugging
    }

    handleKeyPress(e) {
        if (!this.gameActive) return;
        
        const key = e.key.toUpperCase();
        
        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === 'BACKSPACE') {
            this.deleteLetter();
        } else if (key.match(/[A-Z]/) && key.length === 1) {
            this.addLetter(key);
        }
    }

    addLetter(letter) {
        if (!this.gameActive || this.currentGuess.length >= this.wordLength) return;
        
        this.currentGuess += letter;
        this.updateCurrentRow();
        
        // Add animation
        const cell = this.wordGrid.querySelector(`[data-row="${this.currentRow}"][data-col="${this.currentGuess.length - 1}"]`);
        animateElement(cell, 'pulse');
    }

    deleteLetter() {
        if (!this.gameActive || this.currentGuess.length === 0) return;
        
        this.currentGuess = this.currentGuess.slice(0, -1);
        this.updateCurrentRow();
    }

    updateCurrentRow() {
        for (let i = 0; i < this.wordLength; i++) {
            const cell = this.wordGrid.querySelector(`[data-row="${this.currentRow}"][data-col="${i}"]`);
            cell.textContent = this.currentGuess[i] || '';
        }
    }

    submitGuess() {
        if (!this.gameActive || this.currentGuess.length !== this.wordLength) {
            this.updateStatus('Please enter a complete 5-letter word!');
            return;
        }
        
        this.evaluateGuess();
        this.currentGuess = '';
        this.currentRow++;
        
        if (this.gameWon) {
            this.endGame(true);
        } else if (this.currentRow >= this.maxGuesses) {
            this.endGame(false);
        } else {
            this.updateStatus(`${this.maxGuesses - this.currentRow} tries remaining.`);
        }
    }

    evaluateGuess() {
        const guess = this.currentGuess;
        const word = this.currentWord;
        const letterCount = {};
        
        // Count letters in the word
        for (let letter of word) {
            letterCount[letter] = (letterCount[letter] || 0) + 1;
        }
        
        // First pass: mark correct positions
        const results = new Array(this.wordLength).fill('absent');
        for (let i = 0; i < this.wordLength; i++) {
            if (guess[i] === word[i]) {
                results[i] = 'correct';
                letterCount[guess[i]]--;
            }
        }
        
        // Second pass: mark present letters
        for (let i = 0; i < this.wordLength; i++) {
            if (results[i] !== 'correct' && letterCount[guess[i]] > 0) {
                results[i] = 'present';
                letterCount[guess[i]]--;
            }
        }
        
        // Update grid
        for (let i = 0; i < this.wordLength; i++) {
            const cell = this.wordGrid.querySelector(`[data-row="${this.currentRow}"][data-col="${i}"]`);
            cell.classList.add(results[i]);
            
            // Animate cell
            setTimeout(() => {
                cell.style.transform = 'rotateX(180deg)';
                setTimeout(() => {
                    cell.style.transform = 'rotateX(0deg)';
                }, 300);
            }, i * 100);
        }
        
        // Update keyboard
        for (let i = 0; i < this.wordLength; i++) {
            const letter = guess[i];
            const keyElement = this.keyboard.querySelector(`[data-letter="${letter}"]`) || 
                              Array.from(this.keyboard.querySelectorAll('.key')).find(k => k.textContent === letter);
            
            if (keyElement) {
                keyElement.dataset.letter = letter;
                if (results[i] === 'correct') {
                    keyElement.classList.add('correct');
                } else if (results[i] === 'present' && !keyElement.classList.contains('correct')) {
                    keyElement.classList.add('present');
                } else if (results[i] === 'absent' && !keyElement.classList.contains('correct') && !keyElement.classList.contains('present')) {
                    keyElement.classList.add('absent');
                }
            }
        }
        
        // Check if word is guessed
        if (guess === word) {
            this.gameWon = true;
        }
    }

    giveHint() {
        if (!this.gameActive || this.hintsUsed >= 2) {
            this.updateStatus('No more hints available!');
            return;
        }
        
        this.hintsUsed++;
        
        if (this.hintsUsed === 1) {
            // First hint: reveal first letter
            const firstLetter = this.currentWord[0];
            this.updateStatus(`Hint: The word starts with "${firstLetter}"`);
        } else if (this.hintsUsed === 2) {
            // Second hint: reveal word length and a category
            const categories = {
                'APPLE': 'fruit', 'BRAIN': 'body part', 'CHAIR': 'furniture', 'DANCE': 'activity',
                'EARLY': 'time', 'FLAME': 'fire', 'GRACE': 'quality', 'HEART': 'body part',
                'IMAGE': 'picture', 'JOINT': 'connection', 'KNIFE': 'tool', 'LIGHT': 'illumination',
                'MAGIC': 'supernatural', 'NIGHT': 'time', 'OCEAN': 'water body', 'PEACE': 'state',
                'QUICK': 'speed', 'RIVER': 'water body', 'SMILE': 'expression', 'TOWER': 'structure',
                'UNDER': 'position', 'VOICE': 'sound', 'WATER': 'liquid', 'YOUTH': 'age',
                'BRAVE': 'quality', 'CLOUD': 'weather', 'DREAM': 'sleep', 'EARTH': 'planet',
                'FRESH': 'quality', 'GIANT': 'size', 'HAPPY': 'emotion', 'IDEAL': 'perfect',
                'LUCKY': 'fortune', 'MUSIC': 'sound', 'NOBLE': 'quality', 'POWER': 'strength',
                'QUIET': 'sound', 'ROYAL': 'monarchy', 'SMART': 'intelligence', 'TRUST': 'faith',
                'UNITY': 'togetherness', 'VITAL': 'important', 'WORTH': 'value', 'YOUNG': 'age',
                'BEACH': 'location', 'CLEAN': 'cleanliness', 'DRIVE': 'action', 'ENJOY': 'pleasure',
                'FAITH': 'belief', 'GREAT': 'size', 'HONOR': 'respect', 'JOKER': 'card',
                'KNOWN': 'knowledge', 'LASER': 'light', 'MATCH': 'game', 'NEVER': 'time',
                'OFFER': 'proposal', 'PLANT': 'nature', 'QUEEN': 'royalty', 'REACH': 'distance',
                'SPACE': 'area', 'THEME': 'topic', 'URBAN': 'city', 'VALUE': 'worth'
            };
            
            const category = categories[this.currentWord] || 'common word';
            this.updateStatus(`Hint: It's a ${category} (${this.hintsUsed}/2 hints used)`);
            this.hintBtn.disabled = true;
        }
    }

    endGame(won) {
        this.gameActive = false;
        this.stats.played++;
        
        if (won) {
            this.stats.won++;
            this.stats.currentStreak++;
            this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.currentStreak);
            
            const efficiency = this.hintsUsed === 0 ? 'Perfect!' : `${this.hintsUsed} hints used`;
            this.updateStatus(`🎉 Congratulations! You guessed "${this.currentWord}" in ${this.currentRow + 1} tries! ${efficiency}`);
            
            // Add winner animation
            this.gameStatus.classList.add('winner-announcement');
            setTimeout(() => {
                this.gameStatus.classList.remove('winner-announcement');
            }, 2000);
        } else {
            this.stats.currentStreak = 0;
            this.updateStatus(`Game over! The word was "${this.currentWord}". Better luck next time!`);
        }
        
        this.saveStats();
        this.updateStatsDisplay();
        this.updateGlobalStats();
    }

    updateStatus(message) {
        this.gameStatus.textContent = message;
    }

    updateStatsDisplay() {
        this.streakElement.textContent = this.stats.currentStreak;
        this.playedElement.textContent = this.stats.played;
        this.wonElement.textContent = this.stats.won;
    }

    getStats() {
        try {
            const stats = localStorage.getItem('wordGuessStats');
            return stats ? JSON.parse(stats) : {
                played: 0,
                won: 0,
                currentStreak: 0,
                maxStreak: 0
            };
        } catch (e) {
            return {
                played: 0,
                won: 0,
                currentStreak: 0,
                maxStreak: 0
            };
        }
    }

    saveStats() {
        try {
            localStorage.setItem('wordGuessStats', JSON.stringify(this.stats));
        } catch (e) {
            console.warn('Could not save stats');
        }
    }

    resetStats() {
        if (confirm('Are you sure you want to reset all statistics?')) {
            this.stats = {
                played: 0,
                won: 0,
                currentStreak: 0,
                maxStreak: 0
            };
            this.saveStats();
            this.updateStatsDisplay();
            this.updateStatus('Statistics reset successfully!');
        }
    }

    updateGlobalStats() {
        try {
            const plays = parseInt(localStorage.getItem('wordPlays') || '0') + 1;
            localStorage.setItem('wordPlays', plays.toString());
        } catch (e) {
            console.warn('Could not update global stats');
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WordGuess();
});