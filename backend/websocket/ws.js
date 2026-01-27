import { WebSocketServer } from "ws";
import { verifyToken } from "../config/tokens.js";
import { pool } from "../config/db.js";

const rooms = new Map(); // channelId -> Set(ws)

function send(ws, data) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(data));
}

export function attachWs(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    if (!req.url?.startsWith("/ws")) return;
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
  });

  wss.on("connection", (ws, req) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get("token");
      const payload = verifyToken(token);
      ws.userId = payload.sub; // this is user_id (int)
    } catch {
      ws.close(1008, "Unauthorized");
      return;
    }

    ws.channels = new Set();

    ws.on("message", async (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      if (msg.type === "join") {
        const channelId = String(msg.channelId || "");
        if (!channelId) return;

        ws.channels.add(channelId);
        if (!rooms.has(channelId)) rooms.set(channelId, new Set());
        rooms.get(channelId).add(ws);

        return send(ws, { type: "joined", channelId });
      }

      if (msg.type === "message") {
        const channelId = String(msg.channelId || "");
        const content = String(msg.content || "").slice(0, 2000);
        if (!channelId || !content) return;

        const [result] = await pool.query(
          "INSERT INTO messages (content, channels_fk, users_fk) VALUES (?, ?, ?)",
          [content, channelId, ws.userId]
        );

        const [u] = await pool.query(
          "SELECT username FROM users WHERE user_id = ? LIMIT 1",
          [ws.userId]
        );

        const payload = {
          type: "message:new",
          message: {
            id: result.insertId,
            channelId: Number(channelId),
            content,
            userId: ws.userId,
            username: u[0]?.username || "unknown",
            createdAt: new Date().toISOString()
          }
        };

        for (const client of rooms.get(channelId) || []) send(client, payload);
      }
    });

    ws.on("close", () => {
      for (const channelId of ws.channels) {
        rooms.get(channelId)?.delete(ws);
        if (rooms.get(channelId)?.size === 0) rooms.delete(channelId);
      }
    });
  });
}
