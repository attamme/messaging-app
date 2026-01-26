import { verifyToken } from "../config/tokens.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
