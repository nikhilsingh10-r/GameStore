
# Mini Games Hub

A comprehensive gaming website featuring 5 engaging mini-games with user authentication, statistics tracking, leaderboards, and a robust backend API.

## 🎮 Games Included

- **🐍 Snake** - Classic snake game with canvas-based rendering
- **⭕ Tic Tac Toe** - Strategic game with AI opponent
- **🧠 Memory Match** - Card matching game with multiple difficulty levels
- **🧩 Sliding Puzzle** - Number puzzle with 3x3 and 4x4 grids
- **📝 Word Guess** - Wordle-style word guessing game

## ✨ Features

### Frontend
- **Responsive Design** - Mobile-first approach with touch-friendly controls
- **Theme System** - Light/dark mode toggle with persistent preferences
- **Statistics Tracking** - Comprehensive game statistics and progress tracking
- **Achievement System** - 10 unlockable achievements across all games
- **Local Storage Fallback** - Works offline with localStorage persistence

### Backend
- **User Management** - Registration, authentication, and profile management
- **Database Integration** - PostgreSQL database with Drizzle ORM
- **Game Statistics API** - Persistent statistics tracking across sessions
- **Leaderboards** - Global leaderboards for all games
- **Game Sessions** - Detailed session tracking and analytics

## 🚀 Quick Start

### Running the Application

1. **Frontend Server** runs on port 5000 (main website)
2. **API Server** runs on port 3001 (backend services)
3. **Access the game** through the webview URL

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Vanilla HTML, CSS, JavaScript (ES6+)
- **Backend**: Node.js with TypeScript, Express.js
- **Database**: PostgreSQL with Drizzle ORM

### File Structure
```
├── client/
│   └── db-client.js          # Frontend database client
├── server/
│   ├── api.ts               # Express API server
│   ├── db.ts                # Database connection
│   └── storage.ts           # Database operations
├── shared/
│   └── schema.ts            # Database schema definitions
├── *.html                   # Game pages
├── *.js                     # Game implementations
├── styles.css               # Global styles
└── stats.js                 # Statistics system
```

## 🎯 Game Features

### Snake Game
- Canvas-based rendering with smooth animations
- Collision detection and boundary checking
- High score persistence and statistics

### Tic Tac Toe
- Strategic AI opponent with intelligent move selection
- Win/loss/draw statistics tracking
- Responsive grid layout

### Memory Match
- Multiple difficulty levels (4x3 and 4x4 grids)
- Timer and move counter with best time tracking
- Emoji-based card designs

### Sliding Puzzle
- 3x3 and 4x4 grid options
- Auto-solve feature with pathfinding algorithms
- Move optimization and best move tracking

### Word Guess
- Wordle-style gameplay with 5-letter words
- Virtual keyboard with color-coded feedback
- Hint system and streak tracking

## 📊 Database Schema

### Tables
- **Users** - User profiles and global statistics
- **Game Stats** - Per-game statistics for each user
- **Game Sessions** - Individual game session records
- **Leaderboards** - Global leaderboard entries


## 🎨 Theming

The application features a comprehensive theming system with:
- CSS custom properties for consistent styling
- Light and dark mode support
- Smooth transitions between themes
- Persistent theme selection

## 🏆 Achievements

10 progressive achievements covering:
- Game mastery across all 5 games
- Streak achievements
- Perfect game completions
- Global milestones

## 📱 Mobile Support

- Touch-friendly controls for all games
- Responsive design adapting to screen sizes
- Mobile-optimized virtual keyboards
- Swipe gestures where appropriate


```

## 📄 License

MIT