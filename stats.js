// Global Statistics and Achievements System
class GlobalStats {
    constructor() {
        this.achievements = [
            {
                id: 'first_game',
                title: 'Getting Started',
                description: 'Play your first game',
                icon: '🎮',
                unlocked: false,
                check: () => this.getTotalGamesPlayed() >= 1
            },
            {
                id: 'game_master',
                title: 'Game Master',
                description: 'Play all 5 games',
                icon: '🏆',
                unlocked: false,
                check: () => this.getUniqueGamesPlayed() >= 5
            },
            {
                id: 'snake_pro',
                title: 'Snake Pro',
                description: 'Score 200+ points in Snake',
                icon: '🐍',
                unlocked: false,
                check: () => (parseInt(localStorage.getItem('snakeHighScore') || '0') >= 200)
            },
            {
                id: 'tic_tac_master',
                title: 'Tic Tac Master',
                description: 'Win 10 games of Tic Tac Toe',
                icon: '⭕',
                unlocked: false,
                check: () => {
                    const stats = JSON.parse(localStorage.getItem('tictactoeStats') || '{"playerWins": 0}');
                    return stats.playerWins >= 10;
                }
            },
            {
                id: 'memory_genius',
                title: 'Memory Genius',
                description: 'Complete Memory Match in under 60 seconds',
                icon: '🧠',
                unlocked: false,
                check: () => (parseInt(localStorage.getItem('memoryBestTime') || '999') < 60)
            },
            {
                id: 'puzzle_solver',
                title: 'Puzzle Solver',
                description: 'Solve a 4x4 puzzle in under 100 moves',
                icon: '🧩',
                unlocked: false,
                check: () => (parseInt(localStorage.getItem('puzzleBestMoves4x4') || '999') < 100)
            },
            {
                id: 'word_wizard',
                title: 'Word Wizard',
                description: 'Get a 5-game winning streak in Word Guess',
                icon: '📝',
                unlocked: false,
                check: () => {
                    const stats = JSON.parse(localStorage.getItem('wordGuessStats') || '{"maxStreak": 0}');
                    return stats.maxStreak >= 5;
                }
            },
            {
                id: 'time_master',
                title: 'Time Master',
                description: 'Play for more than 2 hours total',
                icon: '⏰',
                unlocked: false,
                check: () => this.getTotalTimeSpent() >= 120
            },
            {
                id: 'dedication',
                title: 'Dedication',
                description: 'Play 50 games total',
                icon: '💪',
                unlocked: false,
                check: () => this.getTotalGamesPlayed() >= 50
            },
            {
                id: 'perfectionist',
                title: 'Perfectionist',
                description: 'Win a Word Guess game without using hints',
                icon: '✨',
                unlocked: false,
                check: () => {
                    // This would be tracked separately in word.js
                    return localStorage.getItem('wordPerfectGame') === 'true';
                }
            }
        ];
        
        this.init();
    }

    init() {
        this.updateGlobalStats();
        this.updateAchievements();
        this.bindEvents();
    }

    bindEvents() {
        // Bind sync button if present
        const syncBtn = document.getElementById('syncDataBtn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.syncToDatabase());
        }
    }

    async syncToDatabase() {
        if (!window.dbClient) {
            alert('Database client not available');
            return;
        }

        const syncBtn = document.getElementById('syncDataBtn');
        if (syncBtn) {
            syncBtn.disabled = true;
            syncBtn.querySelector('.btn-text').textContent = 'Syncing...';
        }

        try {
            await window.dbClient.syncLocalDataToDatabase();
            alert('Data synced successfully!');
        } catch (error) {
            console.error('Sync failed:', error);
            alert('Sync failed. Please check your connection.');
        } finally {
            if (syncBtn) {
                syncBtn.disabled = false;
                syncBtn.querySelector('.btn-text').textContent = 'Sync Data';
            }
        }
    }

    getTotalGamesPlayed() {
        const snakePlays = parseInt(localStorage.getItem('snakePlays') || '0');
        const tictactoePlays = parseInt(localStorage.getItem('tictactoePlays') || '0');
        const memoryPlays = parseInt(localStorage.getItem('memoryPlays') || '0');
        const puzzlePlays = parseInt(localStorage.getItem('puzzlePlays') || '0');
        const wordPlays = parseInt(localStorage.getItem('wordPlays') || '0');
        
        return snakePlays + tictactoePlays + memoryPlays + puzzlePlays + wordPlays;
    }

    getUniqueGamesPlayed() {
        let unique = 0;
        if (parseInt(localStorage.getItem('snakePlays') || '0') > 0) unique++;
        if (parseInt(localStorage.getItem('tictactoePlays') || '0') > 0) unique++;
        if (parseInt(localStorage.getItem('memoryPlays') || '0') > 0) unique++;
        if (parseInt(localStorage.getItem('puzzlePlays') || '0') > 0) unique++;
        if (parseInt(localStorage.getItem('wordPlays') || '0') > 0) unique++;
        return unique;
    }

    getTotalTimeSpent() {
        // This would be tracked by each game - for now return estimated time
        return Math.floor(this.getTotalGamesPlayed() * 3); // Assume 3 minutes per game average
    }

    getFavoriteGame() {
        const plays = {
            'Snake': parseInt(localStorage.getItem('snakePlays') || '0'),
            'Tic Tac Toe': parseInt(localStorage.getItem('tictactoePlays') || '0'),
            'Memory': parseInt(localStorage.getItem('memoryPlays') || '0'),
            'Puzzle': parseInt(localStorage.getItem('puzzlePlays') || '0'),
            'Word Guess': parseInt(localStorage.getItem('wordPlays') || '0')
        };
        
        const maxPlays = Math.max(...Object.values(plays));
        if (maxPlays === 0) return 'None';
        
        return Object.keys(plays).find(key => plays[key] === maxPlays) || 'None';
    }

    updateGlobalStats() {
        const totalGames = this.getTotalGamesPlayed();
        const totalTime = this.getTotalTimeSpent();
        const favorite = this.getFavoriteGame();
        
        // Update main page stats
        const totalGamesElement = document.getElementById('totalGamesPlayed');
        const totalTimeElement = document.getElementById('totalTimeSpent');
        const favoriteGameElement = document.getElementById('favoriteGame');
        
        if (totalGamesElement) totalGamesElement.textContent = totalGames;
        if (totalTimeElement) totalTimeElement.textContent = `${totalTime}m`;
        if (favoriteGameElement) favoriteGameElement.textContent = favorite;
        
        // Update individual game stats on home page
        this.updateGamePreviewStats();
    }

    updateGamePreviewStats() {
        // Snake stats
        const snakeHighScore = document.getElementById('snakeHighScore');
        const snakePlays = document.getElementById('snakePlays');
        if (snakeHighScore) snakeHighScore.textContent = localStorage.getItem('snakeHighScore') || '0';
        if (snakePlays) snakePlays.textContent = localStorage.getItem('snakePlays') || '0';
        
        // Tic Tac Toe stats
        const tictactoeWins = document.getElementById('tictactoeWins');
        const tictactoePlays = document.getElementById('tictactoePlays');
        if (tictactoeWins) {
            const stats = JSON.parse(localStorage.getItem('tictactoeStats') || '{"playerWins": 0}');
            tictactoeWins.textContent = stats.playerWins;
        }
        if (tictactoePlays) tictactoePlays.textContent = localStorage.getItem('tictactoePlays') || '0';
        
        // Memory stats
        const memoryBestTime = document.getElementById('memoryBestTime');
        const memoryPlays = document.getElementById('memoryPlays');
        if (memoryBestTime) {
            const bestTime = localStorage.getItem('memoryBestTime');
            if (bestTime) {
                const minutes = Math.floor(bestTime / 60);
                const seconds = bestTime % 60;
                memoryBestTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }
        if (memoryPlays) memoryPlays.textContent = localStorage.getItem('memoryPlays') || '0';
        
        // Puzzle stats
        const puzzleBestMoves = document.getElementById('puzzleBestMoves');
        const puzzlePlays = document.getElementById('puzzlePlays');
        if (puzzleBestMoves) {
            const best3x3 = localStorage.getItem('puzzleBestMoves3x3');
            const best4x4 = localStorage.getItem('puzzleBestMoves4x4');
            if (best3x3 || best4x4) {
                const bestOverall = Math.min(
                    parseInt(best3x3 || '999'),
                    parseInt(best4x4 || '999')
                );
                puzzleBestMoves.textContent = bestOverall === 999 ? '--' : bestOverall;
            }
        }
        if (puzzlePlays) puzzlePlays.textContent = localStorage.getItem('puzzlePlays') || '0';
        
        // Word Guess stats
        const wordStreak = document.getElementById('wordStreak');
        const wordPlays = document.getElementById('wordPlays');
        if (wordStreak) {
            const stats = JSON.parse(localStorage.getItem('wordGuessStats') || '{"currentStreak": 0}');
            wordStreak.textContent = stats.currentStreak;
        }
        if (wordPlays) wordPlays.textContent = localStorage.getItem('wordPlays') || '0';
    }

    updateAchievements() {
        const achievementsGrid = document.getElementById('achievementsGrid');
        if (!achievementsGrid) return;
        
        achievementsGrid.innerHTML = '';
        
        // Check and update achievement status
        this.achievements.forEach(achievement => {
            achievement.unlocked = achievement.check();
            
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h3 class="achievement-title">${achievement.title}</h3>
                    <p class="achievement-description">${achievement.description}</p>
                </div>
                ${achievement.unlocked ? '<div class="achievement-checkmark">✓</div>' : ''}
            `;
            
            achievementsGrid.appendChild(achievementElement);
        });
        
        // Show achievement notifications for newly unlocked achievements
        this.checkNewAchievements();
    }

    checkNewAchievements() {
        const unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
        const newlyUnlocked = [];
        
        this.achievements.forEach(achievement => {
            if (achievement.unlocked && !unlockedAchievements.includes(achievement.id)) {
                newlyUnlocked.push(achievement);
                unlockedAchievements.push(achievement.id);
            }
        });
        
        if (newlyUnlocked.length > 0) {
            localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
            this.showAchievementNotification(newlyUnlocked[0]);
        }
    }

    showAchievementNotification(achievement) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="notification-icon">${achievement.icon}</div>
            <div class="notification-content">
                <h4>Achievement Unlocked!</h4>
                <p>${achievement.title}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GlobalStats();
});

// Export for use in other files
window.GlobalStats = GlobalStats;