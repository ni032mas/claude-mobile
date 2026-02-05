# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Mobile Terminal is a web-based terminal that allows access to Claude Code from mobile devices over WiFi. It spawns a PTY shell session and bridges it to a browser via WebSocket.

## Commands

```bash
npm install     # Install dependencies (requires build tools for node-pty)
npm start       # Start server on port 3033 (or PORT env var)
```

**Windows prerequisite**: Visual Studio Build Tools with "Desktop development with C++" for node-pty compilation.

## Architecture

```
┌──────────────────┐     WebSocket      ┌──────────────────┐
│  Mobile Browser  │◄──────────────────►│    server.js     │
│  (xterm.js)      │   JSON messages    │  Express + ws    │
└──────────────────┘                    └────────┬─────────┘
                                                 │
                                                 │ node-pty
                                                 ▼
                                        ┌──────────────────┐
                                        │   Shell (PTY)    │
                                        │ powershell/bash  │
                                        └──────────────────┘
```

### Server (`server.js`)
- Express serves static files from `public/`
- WebSocketServer manages terminal connections
- Each WebSocket connection spawns a node-pty process
- Messages are JSON with `type` field: `input`, `output`, `resize`, `exit`

### Frontend (`public/index.html`)
- Single HTML file with embedded CSS/JS
- xterm.js for terminal rendering (loaded from CDN)
- FitAddon for auto-sizing, WebLinksAddon for clickable URLs
- Quick-key toolbar for mobile-friendly special keys (Ctrl+C, Esc, Tab, arrows)
- Auto-reconnect overlay on connection loss

### WebSocket Protocol
```javascript
// Client → Server
{ type: "input", data: "ls -la\r" }
{ type: "resize", cols: 80, rows: 24 }

// Server → Client
{ type: "output", data: "terminal output..." }
{ type: "exit", code: 0 }
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT`   | `3033`  | Server port |

## Code Style

- Write code comments in English
- Use `const` over `let`; avoid `var`
- Use meaningful variable names

## Git

### Protected Branches

- **NEVER commit directly to `dev` or `main`** — always use feature branches
- `dev` is the default integration branch
- `main` is for stable releases

### Branch Workflow

1. Update dev: `git checkout dev && git pull --rebase`
2. Create feature branch: `git checkout -b feature/name`
3. After work: rebase onto dev (`git rebase dev`)
4. Create Pull Request, merge with squash

### Commit Rules

- Commit messages in English
- Conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:`
- No co-authors in commit messages
