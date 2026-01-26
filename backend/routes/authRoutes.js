import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { pool } from "../config/db.js";
import { signToken } from "../config/tokens.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

// POST /api/auth/register
r.post("/register", async (req, res) => {
  const { email, username, password } = req.body || {};
  if (!email || !username || !password) return res.status(400).json({ error: "Missing fields" });

  const [exists] = await pool.query(
    "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
    [email, username]
  );
  if (exists.length) return res.status(409).json({ error: "Email/username taken" });

  const id = crypto.randomUUID();
  const password_hash = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users (id, email, username, password_hash) VALUES (?, ?, ?, ?)",
    [id, email, username, password_hash]
  );

  res.status(201).json({ token: signToken(id), user: { id, email, username } });
});

// POST /api/auth/login
r.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const [rows] = await pool.query(
    "SELECT id, email, username, password_hash FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

  const user = rows[0];
  if (!user.password_hash) return res.status(401).json({ error: "Use OAuth login" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  res.json({ token: signToken(user.id), user: { id: user.id, email: user.email, username: user.username } });
});

// GET /api/auth/me
r.get("/me", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, email, username FROM users WHERE id = ? LIMIT 1",
    [req.user.id]
  );
  res.json({ user: rows[0] || null });
});

export default r;
