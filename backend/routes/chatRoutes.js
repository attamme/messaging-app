import { Router } from "express";
import crypto from "crypto";
import { pool } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

// GET /api/chat/channels
r.get("/channels", requireAuth, async (req, res) => {
  const [rows] = await pool.query("SELECT id, name FROM channels ORDER BY created_at ASC");
  res.json({ channels: rows });
});

// POST /api/chat/channels
r.post("/channels", requireAuth, async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "name required" });

  const id = crypto.randomUUID();
  await pool.query("INSERT INTO channels (id, name) VALUES (?, ?)", [id, name]);
  res.status(201).json({ channel: { id, name } });
});

// GET /api/chat/messages?channelId=...
r.get("/messages", requireAuth, async (req, res) => {
  const channelId = String(req.query.channelId || "");
  if (!channelId) return res.status(400).json({ error: "channelId required" });

  const [rows] = await pool.query(
    `SELECT m.id, m.content, m.created_at, u.id AS userId, u.username
     FROM messages m JOIN users u ON u.id = m.user_id
     WHERE m.channel_id = ?
     ORDER BY m.created_at DESC
     LIMIT 50`,
    [channelId]
  );

  res.json({ messages: rows });
});

export default r;
