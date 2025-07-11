// Leaderboard Management
class LeaderboardManager {
    constructor() {
        this.gameSelect = document.getElementById('gameSelect');
        this.categorySelect = document.getElementById('categorySelect');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.leaderboardList = document.getElementById('leaderboardList');
        this.globalStatsDisplay = document.getElementById('globalStatsDisplay');
        this.totalUsersElement = document.getElementById('totalUsers');
        this.totalGamesElement = document.getElementById('totalGames');
        this.activeTodayElement = document.getElementById('activeToday');
        
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadLeaderboard();
        await this.loadGlobalStats();
    }

    bindEvents() {
        this.gameSelect.addEventListener('change', () => this.loadLeaderboard());
        this.categorySelect.addEventListener('change', () => this.loadLeaderboard());
        this.refreshBtn.addEventListener('click', () => this.refreshData());
    }

    async refreshData() {
        this.refreshBtn.disabled = true;
        this.refreshBtn.textContent = 'Refreshing...';
        
        await Promise.all([
            this.loadLeaderboard(),
            this.loadGlobalStats()
        ]);
        
        this.refreshBtn.disabled = false;
        this.refreshBtn.textContent = 'Refresh';
    }

    async loadLeaderboard() {
        const gameType = this.gameSelect.value;
        const category = this.categorySelect.value;
        
        try {
            this.leaderboardList.innerHTML = '<div class="loading">Loading leaderboard...</div>';
            
            const leaderboard = await window.dbClient.getLeaderboard(gameType, category, 10);
            this.renderLeaderboard(leaderboard);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.leaderboardList.innerHTML = '<div class="error">Unable to load leaderboard. Using local data.</div>';
            this.renderLocalLeaderboard(gameType, category);
        }
    }

    renderLeaderboard(leaderboard) {
        if (!leaderboard || leaderboard.length === 0) {
            this.leaderboardList.innerHTML = '<div class="empty">No scores yet. Be the first to play!</div>';
            return;
        }

        const html = leaderboard.map((entry, index) => `
            <div class="leaderboard-entry ${index === 0 ? 'first-place' : index === 1 ? 'second-place' : index === 2 ? 'third-place' : ''}">
                <div class="rank">${this.getRankDisplay(index + 1)}</div>
                <div class="player-info">
                    <span class="username">${entry.username || 'Anonymous'}</span>
                    <span class="game-info">${entry.difficulty ? `(${entry.difficulty})` : ''}</span>
                </div>
                <div class="score">${this.formatScore(entry.value, entry.category)}</div>
                <div class="date">${new Date(entry.achievedAt).toLocaleDateString()}</div>
            </div>
        `).join('');

        this.leaderboardList.innerHTML = html;
    }

    renderLocalLeaderboard(gameType, category) {
        // Fallback to local storage data
        const localStats = this.getLocalLeaderboardData(gameType, category);
        
        if (localStats.length === 0) {
            this.leaderboardList.innerHTML = '<div class="empty">No local scores available.</div>';
            return;
        }

        const html = localStats.map((entry, index) => `
            <div class="leaderboard-entry">
                <div class="rank">${index + 1}</div>
                <div class="player-info">
                    <span class="username">You</span>
                </div>
                <div class="score">${this.formatScore(entry.value, category)}</div>
                <div class="date">Local</div>
            </div>
        `).join('');

        this.leaderboardList.innerHTML = html;
    }

    getLocalLeaderboardData(gameType, category) {
        const localData = [];
        
        try {
            switch (gameType) {
                case 'snake':
                    const snakeScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
                    if (snakeScore > 0) localData.push({ value: snakeScore });
                    break;
                case 'tictactoe':
                    const tttStats = JSON.parse(localStorage.getItem('tictactoeStats') || '{}');
                    if (tttStats.playerWins > 0) localData.push({ value: tttStats.playerWins });
                    break;
                case 'memory':
                    const memoryTime = parseInt(localStorage.getItem('memoryBestTime') || '0');
                    if (memoryTime > 0) localData.push({ value: memoryTime });
                    break;
                case 'puzzle':
                    const puzzleMoves = parseInt(localStorage.getItem('puzzleBestMoves3x3') || '0');
                    if (puzzleMoves > 0) localData.push({ value: puzzleMoves });
                    break;
                case 'word':
                    const wordStats = JSON.parse(localStorage.getItem('wordGuessStats') || '{}');
                    if (wordStats.maxStreak > 0) localData.push({ value: wordStats.maxStreak });
                    break;
            }
        } catch (e) {
            console.warn('Error reading local data:', e);
        }

        return localData;
    }

    getRankDisplay(rank) {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    }

    formatScore(value, category) {
        switch (category) {
            case 'best_time':
                const minutes = Math.floor(value / 60);
                const seconds = Math.floor(value % 60);
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            case 'high_score':
                return value.toLocaleString();
            case 'win_streak':
                return `${value} wins`;
            default:
                return value.toString();
        }
    }

    async loadGlobalStats() {
        try {
            const stats = await window.dbClient.getGlobalStats();
            this.renderGlobalStats(stats);
        } catch (error) {
            console.error('Error loading global stats:', error);
            this.renderLocalGlobalStats();
        }
    }

    renderGlobalStats(stats) {
        this.totalUsersElement.textContent = stats.totalUsers || 0;
        this.totalGamesElement.textContent = stats.totalGames || 0;
        this.activeTodayElement.textContent = stats.activeToday || 0;
    }

    renderLocalGlobalStats() {
        // Calculate from local storage
        const localGames = this.calculateLocalTotalGames();
        
        this.totalUsersElement.textContent = '1';
        this.totalGamesElement.textContent = localGames;
        this.activeTodayElement.textContent = '1';
    }

    calculateLocalTotalGames() {
        let total = 0;
        try {
            total += parseInt(localStorage.getItem('snakePlays') || '0');
            total += parseInt(localStorage.getItem('tictactoePlays') || '0');
            total += parseInt(localStorage.getItem('memoryPlays') || '0');
            total += parseInt(localStorage.getItem('puzzlePlays') || '0');
            total += parseInt(localStorage.getItem('wordPlays') || '0');
        } catch (e) {
            console.warn('Error calculating local games:', e);
        }
        return total;
    }
}

// Initialize leaderboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LeaderboardManager();
});