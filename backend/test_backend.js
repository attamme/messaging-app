// backend/test_backend.js
// Run: node test_backend.js
// Assumes your backend is already running (node server.js)

import WebSocket from "ws";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:5000";
const WS_URL = process.env.TEST_WS_URL || "ws://localhost:5000/ws";

function now() {
  return new Date().toISOString();
}

async function readJsonSafe(res) {
  const text = await res.text();
  try {
    return { ok: true, json: JSON.parse(text) };
  } catch {
    return { ok: false, text };
  }
}

async function httpCheck(path, opts = {}) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, opts);
    const parsed = await readJsonSafe(res);
    return { url, status: res.status, parsed };
  } catch (e) {
    return { url, status: null, error: e?.message || String(e) };
  }
}

function logStep(title) {
  console.log(`\n[${now()}] ${title}`);
}

function logResult(label, result) {
  console.log(`- ${label}`);
  if (result.error) {
    console.log(`  ❌ ERROR: ${result.error}`);
    return;
  }
  console.log(`  Status: ${result.status}`);
  if (result.parsed?.ok) console.log(`  Body:`, result.parsed.json);
  else if (result.parsed) console.log(`  Body (non-JSON):`, result.parsed.text);
}

async function main() {
  console.log(`Testing backend at: ${BASE_URL}`);
  console.log(`Testing websocket at: ${WS_URL}`);

  // 1) Health + Root
  logStep("1) Basic routes");
  const health = await httpCheck("/health");
  logResult("GET /health", health);

  const root = await httpCheck("/");
  logResult("GET / (this is expected to be 404 unless you add app.get('/'))", root);

  if (health.status !== 200) {
    console.log("\nStopping: /health failed. Fix server startup/port first.");
    process.exit(1);
  }

  // 2) Auth register + login
  logStep("2) Auth (register/login/me)");
  const rand = Math.floor(Math.random() * 1e9);
  const email = `test${rand}@example.com`;
  const username = `testuser${rand}`;
  const password = `TestPass_${rand}!`;

  // Try register
  const reg = await httpCheck("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  });
  logResult("POST /api/auth/register", reg);

  // If register route doesn't exist, the rest will fail; explain clearly:
  if (reg.status === 404) {
    console.log(
      "\n❌ Your auth routes are not mounted or path differs.\n" +
        "Expected: app.use('/api', routes) AND routes include '/auth/register'.\n" +
        "Check: backend/routes/index.js and backend/routes/authRoutes.js"
    );
    process.exit(1);
  }

  // Login
  const login = await httpCheck("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  logResult("POST /api/auth/login", login);

  const token =
    login.parsed?.ok && login.parsed.json?.token
      ? login.parsed.json.token
      : reg.parsed?.ok && reg.parsed.json?.token
      ? reg.parsed.json.token
      : null;

  if (!token) {
    console.log(
      "\n❌ Could not obtain JWT token from register/login.\n" +
        "Expected response shape: { token: '...', user: {...} }"
    );
    process.exit(1);
  }

  // Me
  const me = await httpCheck("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  logResult("GET /api/auth/me", me);

  // 3) Channels
  logStep("3) Channels (list/create/list)");
  const listChannels1 = await httpCheck("/api/chat/channels", {
    headers: { Authorization: `Bearer ${token}` },
  });
  logResult("GET /api/chat/channels", listChannels1);

  // Create channel (if endpoint exists)
  const channelName = `test-channel-${rand}`;
  const createChannel = await httpCheck("/api/chat/channels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: channelName }),
  });
  logResult("POST /api/chat/channels", createChannel);

  let channelId =
    createChannel.parsed?.ok && createChannel.parsed.json?.channel?.id
      ? createChannel.parsed.json.channel.id
      : null;

  // Some implementations return { channels: [...] } only; if so pick first
  if (!channelId && listChannels1.parsed?.ok) {
    const first = listChannels1.parsed.json?.channels?.[0];
    if (first?.id) channelId = first.id;
  }

  if (!channelId) {
    console.log(
      "\n⚠️ Could not determine a channelId.\n" +
        "If your API uses different paths, update them in test_backend.js.\n" +
        "Expected:\n" +
        "- GET  /api/chat/channels -> { channels: [{id,...}] }\n" +
        "- POST /api/chat/channels -> { channel: {id,...} }"
    );
  }

  // 4) Messages (REST)
  logStep("4) Messages (REST list)");
  if (channelId) {
    const listMessages = await httpCheck(
      `/api/chat/messages?channelId=${encodeURIComponent(channelId)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    logResult("GET /api/chat/messages?channelId=...", listMessages);
  } else {
    console.log("- Skipping message REST tests (no channelId available)");
  }

  // 5) WebSocket send/receive
  logStep("5) WebSocket realtime (join + send + receive)");
  if (!channelId) {
    console.log("- Skipping WS tests (no channelId available)");
    process.exit(0);
  }

  const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);

  const wsResult = await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ ok: false, error: "Timed out waiting for WS messages" });
      try { ws.close(); } catch {}
    }, 6000);

    ws.on("open", () => {
      ws.send(JSON.stringify({ type: "join", channelId }));
      ws.send(JSON.stringify({ type: "message", channelId, content: `hello from test ${rand}` }));
    });

    ws.on("message", (data) => {
      let msg;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        msg = { raw: data.toString() };
      }

      // We consider success if we see message:new for our channel
      if (msg?.type === "message:new" && msg?.message?.channelId === channelId) {
        clearTimeout(timeout);
        resolve({ ok: true, received: msg });
        try { ws.close(); } catch {}
      }
    });

    ws.on("error", (e) => {
      clearTimeout(timeout);
      resolve({ ok: false, error: e?.message || String(e) });
      try { ws.close(); } catch {}
    });
  });

  if (wsResult.ok) {
    console.log("✅ WS OK. Received:", wsResult.received);
  } else {
    console.log("❌ WS FAILED:", wsResult.error);
    console.log(
      "Common causes:\n" +
        "- WS server not attached to the same HTTP server\n" +
        "- Wrong WS path (/ws)\n" +
        "- Token verification failing (JWT_SECRET mismatch)\n" +
        "- You’re not using ws-style auth (?token=...) in your server"
    );
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("Fatal test error:", e);
  process.exit(1);
});
