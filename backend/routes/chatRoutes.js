import { Router } from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

// GET /api/chat/channels
r.get("/channels", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT channel_id AS id, channel_name AS name FROM channels ORDER BY created_at ASC"
  );
  res.json({ channels: rows });
});

// POST /api/chat/channels
r.post("/channels", requireAuth, async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "name required" });

  const [result] = await pool.query(
    "INSERT INTO channels (channel_name) VALUES (?)",
    [name]
  );

  res.status(201).json({ channel: { id: result.insertId, name } });
});

// GET /api/chat/messages?channelId=...
r.get("/messages", requireAuth, async (req, res) => {
  const channelId = String(req.query.channelId || "");
  if (!channelId) return res.status(400).json({ error: "channelId required" });

  const [rows] = await pool.query(
    `SELECT 
        m.message_id AS id,
        m.content,
        m.created_at,
        u.user_id AS userId,
        u.username
     FROM messages m
     JOIN users u ON u.user_id = m.users_fk
     WHERE m.channels_fk = ?
     ORDER BY m.created_at DESC
     LIMIT 50`,
    [channelId]
  );

  res.json({ messages: rows });
});

export default r;
