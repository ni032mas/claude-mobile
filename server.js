const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const os = require("os");
const path = require("path");
const pty = require("node-pty");

const PORT = process.env.PORT || 3033;
const SHELL = os.platform() === "win32" ? "powershell.exe" : "bash";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, "public")));

// ── Get local network IP ──────────────────────────────────────────────
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

// ── WebSocket → PTY bridge ────────────────────────────────────────────
wss.on("connection", (ws) => {
  console.log("[+] Client connected");

  // Spawn a PTY shell — claude will be launched inside it
  const ptyProcess = pty.spawn(SHELL, [], {
    name: "xterm-256color",
    cols: 80,
    rows: 24,
    cwd: process.env.HOME || process.env.USERPROFILE || ".",
    env: { ...process.env, TERM: "xterm-256color" },
  });

  // PTY → WebSocket (terminal output)
  ptyProcess.onData((data) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "output", data }));
    }
  });

  ptyProcess.onExit(({ exitCode }) => {
    console.log(`[~] PTY exited with code ${exitCode}`);
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "exit", code: exitCode }));
      ws.close();
    }
  });

  // WebSocket → PTY (user input & resize)
  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw);

      if (msg.type === "input") {
        ptyProcess.write(msg.data);
      } else if (msg.type === "resize") {
        ptyProcess.resize(msg.cols, msg.rows);
      }
    } catch {
      // raw text fallback
      ptyProcess.write(raw.toString());
    }
  });

  ws.on("close", () => {
    console.log("[-] Client disconnected");
    ptyProcess.kill();
  });
});

// ── Start ─────────────────────────────────────────────────────────────
server.listen(PORT, "0.0.0.0", () => {
  const ip = getLocalIP();
  console.log("");
  console.log("  ╔═══════════════════════════════════════════════╗");
  console.log("  ║     🚀  Claude Mobile Terminal  🚀            ║");
  console.log("  ╠═══════════════════════════════════════════════╣");
  console.log(`  ║  Local:   http://localhost:${PORT}              ║`);
  console.log(`  ║  Network: http://${ip}:${PORT}        ║`);
  console.log("  ╠═══════════════════════════════════════════════╣");
  console.log("  ║  Open the Network URL on your phone 📱       ║");
  console.log("  ║  Then type: claude                            ║");
  console.log("  ╚═══════════════════════════════════════════════╝");
  console.log("");
});
