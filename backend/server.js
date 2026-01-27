import "dotenv/config";
import http from "http";
import express from "express";
import routes from "./routes/index.js";
import { attachWs } from "./websocket/ws.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("Backend is running. Try /health or /api/..."));
app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/api", (req, res) => res.json({ ok: true, hint: "Use /api/auth/* or /api/chat/*" }));
app.use("/api", routes);

const server = http.createServer(app);
attachWs(server);

server.listen(process.env.PORT || 5000, () => {
  console.log("API+WS running");
});
