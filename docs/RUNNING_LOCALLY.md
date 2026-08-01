# Running everything locally (web + Telegram)

## 1. Backend

```
pip install -r requirements.txt --break-system-packages
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Set `CORS_ORIGINS` in `.env` to include wherever the frontend is
actually served from — the dev server origin locally
(`http://localhost:5173`), or the frontend's ngrok URL when testing
from a phone. Without this, the browser blocks every request to the
API before it even leaves the browser — this was missing entirely
until this pass and would silently break every login attempt.

## 2. Bot

```
python -m bot.main
```

Needs `BOT_TOKEN` in `.env`. Uses long polling, so no public URL is
needed just to receive messages.

## 3. Frontend

```
cd frontend/royal64-web
pnpm install
pnpm dev
```

## 4. Testing in a browser (no Telegram)

`Telegram.WebApp.initData` will be **empty** in a plain browser tab —
that's expected, not a bug. `/auth/telegram` will reject a missing
initData with 401, and the app shows "Open this app from the Royal64
Telegram bot to sign in." There's no browser-only login path by
design — for pure frontend UI work without Telegram, you'd want a
temporary dev-only bypass, which doesn't exist.

## 5. Testing for real, inside Telegram (including on a phone)

Needs a **public HTTPS URL** — a phone can't reach `127.0.0.1` on your
laptop.

1. **Tunnel your local servers**:
   ```
   ngrok http 5173     # frontend
   ngrok http 8000      # backend, separately
   ```
   Set `WEBAPP_URL` (backend `.env`) to the frontend's ngrok https URL.
   Set `VITE_API_URL` (`frontend/royal64-web/.env`) to the backend's
   ngrok https URL. Add the frontend's ngrok URL to `CORS_ORIGINS`.
   Restart `bot/main.py` (to re-set the menu button) and the frontend
   dev server after changing any of these.

2. **Deploy** frontend + backend somewhere with a real domain — the
   correct long-term answer, not needed just to start testing.

Open the bot in Telegram → tap the **menu button** (bottom-left, next
to the message box) or the "🚀 Open Royal64" button on `/start`.

## Troubleshooting: "Open this app from the Royal64 Telegram bot to
## sign in" appearing even when opened through Telegram

This exact symptom was hit and fixed in this pass. Three real bugs
were stacked here — if you're on an older copy of this project without
these fixes, this is why:

1. **`index.html` was missing the Telegram Web App SDK script**
   (`<script src="https://telegram.org/js/telegram-web-app.js">`).
   Without it, `window.Telegram.WebApp` doesn't exist **at all**,
   regardless of how the page was opened — so this exact error showed
   up identically in a plain browser and inside real Telegram, which
   was the giveaway. Now included.

2. **`webApp.ready()` was never called.** Telegram keeps its own
   loading spinner over the Mini App until the page calls `ready()` —
   this is very likely why it took 2-3 minutes inside Telegram
   specifically (way longer than the page itself takes to load) before
   the error finally appeared. `AuthProvider` now calls
   `ready()`/`expand()` as soon as the SDK is present.

3. **No CORS middleware on the backend.** Separate from the initData
   issue, but the very next thing that would have broken once initData
   worked — added in `app/main.py`, controlled by `CORS_ORIGINS`.

### If it's still slow/broken after those fixes, check next

- **ngrok's free-tier browser warning page**: by default ngrok shows
  an interstitial "visit site" page to browser requests instead of
  proxying them, which looks exactly like a broken/hanging backend.
  `shared/api/http.ts` now sends the `ngrok-skip-browser-warning`
  header on every API call to bypass this — but this can't be done for
  the **WebSocket** connection (`/ws/game/{id}`) from browser JS, since
  browsers don't allow custom headers on a WS handshake. If the game
  websocket specifically hangs through ngrok, that's why — a paid ngrok
  plan or an alternative tunnel (e.g. Cloudflare Tunnel) avoids the
  interstitial entirely.
- **Bundle load time over a phone's mobile connection through a
  tunnel** can itself take a while — the manualChunks split in
  `vite.config.ts` helps, but a slow tunnel is still a slow tunnel.
- **Stale `WEBAPP_URL`**: if you change the ngrok URL (it changes every
  time you restart ngrok on the free tier), the bot's menu button still
  points at the *old* URL until `bot/main.py` is restarted.
