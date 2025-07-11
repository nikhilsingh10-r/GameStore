// Database client for browser-side interactions
class DatabaseClient {
    constructor() {
        this.apiBase = window.location.origin + '/api';
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    async init() {
        // Check if user exists in localStorage, if not prompt for username
        if (!this.currentUser) {
            await this.promptForUser();
        }
    }

    getCurrentUser() {
        try {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    }

    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    async promptForUser() {
        const username = prompt('Enter your username to save your progress:');
        if (!username) return null;

        try {
            // Try to get existing user
            let user = await this.getUser(username);
            
            if (!user) {
                // Create new user
                user = await this.createUser(username);
            }

            this.setCurrentUser(user);
            return user;
        } catch (error) {
            console.error('Error with user setup:', error);
            return null;
        }
    }

    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call error:', error);
            // Fall back to localStorage if API is unavailable
            return this.fallbackToLocalStorage(endpoint, options);
        }
    }

    fallbackToLocalStorage(endpoint, options) {
        console.warn('API unavailable, using localStorage fallback');
        // Return empty data structures for now
        if (endpoint.includes('/stats/')) {
            return {
                gamesPlayed: 0,
                gamesWon: 0,
                bestScore: 0,
                currentStreak: 0,
                maxStreak: 0
            };
        }
        return {};
    }

    // User management
    async createUser(username, email = null) {
        return await this.apiCall('/users', {
            method: 'POST',
            body: JSON.stringify({ username, email })
        });
    }

    async getUser(username) {
        return await this.apiCall(`/users/${username}`);
    }

    async updateUser(updates) {
        if (!this.currentUser) return null;
        
        const updatedUser = await this.apiCall(`/users/${this.currentUser.id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });

        if (updatedUser) {
            this.setCurrentUser(updatedUser);
        }

        return updatedUser;
    }

    // Game statistics
    async getGameStats(gameType) {
        if (!this.currentUser) return this.getLocalStats(gameType);
        
        return await this.apiCall(`/users/${this.currentUser.id}/stats/${gameType}`);
    }

    async updateGameStats(gameType, stats) {
        if (!this.currentUser) return this.updateLocalStats(gameType, stats);
        
        return await this.apiCall(`/users/${this.currentUser.id}/stats/${gameType}`, {
            method: 'PUT',
            body: JSON.stringify(stats)
        });
    }

    // Game sessions
    async recordGameSession(gameType, sessionData) {
        if (!this.currentUser) return null;
        
        const session = {
            userId: this.currentUser.id,
            gameType,
            ...sessionData
        };

        return await this.apiCall('/game-sessions', {
            method: 'POST',
            body: JSON.stringify(session)
        });
    }

    // Leaderboards
    async getLeaderboard(gameType, category, limit = 10) {
        return await this.apiCall(`/leaderboards/${gameType}/${category}?limit=${limit}`);
    }

    async updateLeaderboard(gameType, category, value, difficulty = null) {
        if (!this.currentUser) return null;
        
        const entry = {
            userId: this.currentUser.id,
            gameType,
            category,
            value,
            difficulty
        };

        return await this.apiCall('/leaderboards', {
            method: 'POST',
            body: JSON.stringify(entry)
        });
    }

    // Global statistics
    async getGlobalStats() {
        return await this.apiCall('/global-stats');
    }

    // Local storage fallback methods
    getLocalStats(gameType) {
        const key = `${gameType}Stats`;
        try {
            const stats = localStorage.getItem(key);
            return stats ? JSON.parse(stats) : {
                gamesPlayed: 0,
                gamesWon: 0,
                bestScore: 0,
                currentStreak: 0,
                maxStreak: 0
            };
        } catch (e) {
            return {
                gamesPlayed: 0,
                gamesWon: 0,
                bestScore: 0,
                currentStreak: 0,
                maxStreak: 0
            };
        }
    }

    updateLocalStats(gameType, stats) {
        const key = `${gameType}Stats`;
        try {
            localStorage.setItem(key, JSON.stringify(stats));
            return stats;
        } catch (e) {
            console.warn('Could not save to localStorage');
            return stats;
        }
    }

    // Utility methods
    async syncLocalDataToDatabase() {
        if (!this.currentUser) return;

        // Sync game statistics
        const gameTypes = ['snake', 'tictactoe', 'memory', 'puzzle', 'word'];
        
        for (const gameType of gameTypes) {
            const localStats = this.getLocalStats(gameType);
            if (localStats.gamesPlayed > 0) {
                await this.updateGameStats(gameType, localStats);
            }
        }
    }
}

// Global instance
window.dbClient = new DatabaseClient();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseClient;
}