# 🌸 Tomo's Destiny Matcher 💖

An advanced, interactive single-page web application created for a university project showcase.

Tomo is a playful astrology-inspired story game, not a validated personality test or relationship-probability calculator. The main reveal requests a Gemini reading using a server-held key; players do not enter keys. A separate button opens the built-in story, which also serves as the AI fallback. Results show the source, model/cache status, and approximate chart limitations. See [the engine and Burmese-output audit](docs/TOMO_AUDIT.md) for findings, fixes, and evaluation steps.

The application allows users to analyze relationships in two modes: **Friends 👯‍♂️** (platonic loyalty & fun) or **Couple ❤️** (romantic chemistry & emotional connection).

Under the hood, pure JavaScript silently calculates **5 symbolic astrological and numerological influences** for both individuals:
1. **Western Solar Zodiac Sign** (Month & Day)
2. **Mahabote Day of the Week** (Sunday-Saturday based on exact birthdate)
3. **Chinese 12 Zodiac Animal** (approximate solar-year convention using February 4)
4. **Chinese 5 Elemental Energy** (Based on the last digit of the True Chinese Year)
5. **Name Numerology (Destiny Number)** (Pythagorean alphabet system reduced to single digit 1-9).

All 8 metrics + relationship mode are passed silently into the **Google Gemini 3.1 Flash Lite API**. The API acts as **"Tomo" (တိုမို)** — a friendly, sweet, and highly perceptive virtual girl delivering rich, multi-paragraph Burmese readings (မြန်မာဘာသာ).

---

## 🎀 Key Features

1. **Friends 👯‍♂️ vs Couple ❤️ Mode Toggle**:
   - Tailors personality insights, dynamic synergy, and advice specifically for friendships or romantic couples.

2. **5-Metric Silent Astrology & Numerology Engine (Pure JS)**:
   - **Western Solar Zodiac Sign**
   - **Simplified 7-House Burmese Mahabote Engine** (Calculates Myanmar Era planetary house: *Bhanga, Athan, Hsi-za, Puti, Chowda, Yaza, Marana*)
   - **Chinese 12 Zodiac Animal** (fixed February 4 solar-year convention)
   - **Chinese 5 Elemental Energy**
   - **Pythagorean Name Numerology** (with Unicode fallback for Burmese script)

3. **Tomo Persona Tone Selector**:
   - Choose Tomo's mood tone: **Sweet & Empathetic 🌸**, **Playful & Sassy 🎀**, or **Wise & Mystical 🔮**.

4. **Gemini 3.1 Flash Lite "Tomo" Persona**:
   - Model: `gemini-3.1-flash-lite`
   - **Structured JSON Mode**: `responseMimeType: "application/json"` with strict `responseSchema`.
   - Generates astrology-inspired Burmese entertainment stories covering deep character readings, dynamic insights, strengths, challenges, and secret destiny advice.

5. **Cancellable AI Loading & Score Count-Up**:
   - Existing Tomo mascot beside an SVG letter with gently animated ink lines, replacing the loading MP4. Reduced-motion settings show a still illustration. After 25 seconds, the message reassures users they can keep waiting or cancel; no estimated completion percentage is shown. Keyboard focus stays in the dialog, and Escape cancels the reading.
   - Animated score count-up gauge.

6. **Destiny Card Image Exporter (📸 Download PNG)**:
   - Built-in HTML5 Canvas generator exporting a stylized, shareable reading card (`Tomo_Destiny_Reading.png`).

7. **Offline Presentation Demo Mode (✨ Tomo Demo Reading)** & **LocalStorage API Key**:
   - Server-held Gemini key and pre-loaded local JSON data for offline presentation showcases.

---

## 📄 Expected JSON Schema Output

```json
{
  "tomo_deep_reading_p1": "string (in Burmese)",
  "tomo_deep_reading_p2": "string (in Burmese)",
  "chemistry_score": number,
  "relationship_title": "string (in Burmese)",
  "tomo_dynamic_insight": "string (in Burmese)",
  "tomo_strengths": ["string (in Burmese)"],
  "tomo_challenges": ["string (in Burmese)"],
  "tomo_secret_advice": "string (in Burmese)"
}
```

---

## Project installation and running - serving guide for OpenCode AI agents

This project has a Vite React client and a separate Socket.IO server for the Nomo multiplayer mode. Use Node.js 22 or newer.

### Installation

```bash
git clone https://github.com/AungPhyoeNaing/tomo-nomo.git
cd tomo-nomo
npm install
cd server
npm install
cd ..
```

The root install provides the Vite client. The second install provides the Express and Socket.IO server dependencies.

### Development serving

For Tomo, set `GEMINI_API_KEY` in the ignored root `.env` and run `npm run dev`. Vite serves `/api/reading` directly using the production reading handler; a separate backend process is not required for AI readings. Restart Vite after changing the key if it has not restarted automatically.

For Nomo multiplayer, also run the Socket.IO server in a separate terminal:

```bash
# Terminal 1 - frontend and Tomo AI endpoint
npm run dev

# Terminal 2 - Nomo Socket.IO server
cd server
npm start
```

Open `http://localhost:5180/`. The Nomo client connects to the server on port `3080` during development.

For a local-Wi-Fi game, serve the client on the LAN interface:

```bash
# Terminal 1
npm run dev -- --host 0.0.0.0

# Terminal 2
cd server
npm start
```

On each device, open `http://<HOST-LAN-IP>:5180/nomo`. Create a room on one device and join it from the other with the room code. Allow ports `5180` and `3080` through the host firewall on a trusted private network. Internet access is not required after dependencies have been installed; Nomo questions and game state are local.

### Production serving

Build the client, then let the Node server serve the generated `dist` directory and Socket.IO endpoint from the same origin:

```bash
npm run build
cd server
npm start
```

Open `http://localhost:3080/` (or `http://<HOST-LAN-IP>:3080/` on a private LAN). Do not open the source `index.html` directly; the Vite client and Socket.IO server must be running.

### OpenCode agent checks

After changing code, run:

```bash
npm run build
npm run lint
npm test
node --check server/index.js
```

Keep long-running client/server processes in separate terminals or managed background sessions. Stop them before starting another process on the same port.

### Configuration and offline behavior

Tomo calls the same-origin `/api/reading` endpoint. One `GEMINI_API_KEY` is kept on the server; players do not enter or receive the key. The server fixes the model to Gemini 3.1 Flash-Lite and computes chart data and scores itself. Raw birthdates reach your server but are not included in the Gemini prompt. Existing browser-saved keys are removed when Tomo opens.

#### Vercel setup (one key)

1. In your Vercel project, open **Settings → Environment Variables**.
2. Add `GEMINI_API_KEY` with your real Google AI Studio key for Production (and Preview if wanted). Mark it sensitive. Never add a `VITE_` prefix.
3. Redeploy. The `api/reading.js` Vercel Function handles requests alongside the static frontend. No separate multiplayer backend is needed for Tomo readings.
4. Keep the Google project on the free tier if you want no Gemini API spending. Model availability and quota still depend on that project. Hosting has its own plan limits and terms.

For local development, put `GEMINI_API_KEY=...` in the ignored root `.env` and run `npm run dev`. The Vite development middleware loads server-only environment values and serves the same reading handler directly, without proxying AI requests to port 3080. Missing keys and invalid requests return JSON diagnostics. Run `npm start --prefix server` separately only when using Nomo multiplayer. The Node entry point loads the root `.env` (Node 22+). If using the Node server to serve production `dist`, set the same environment variable on that host; the endpoint works there too.

The endpoint validates inputs, rejects cross-origin browser requests, and returns sanitized errors. Each reading permits at most two Google requests total: the initial generation and either one quality repair (invalid JSON, language, detail or structure) or one retry for a temporary Google HTTP 500/502/503/504. Any additional request uses the same overall deadline, requires enough time for a complete response, and reserves another request from the shared minute/day allowance. Transient retries use a jittered delay and respect Google's retry delay. Authentication, quota, transport failures, blocked/truncated responses and timeouts do not automatically repeat a POST. Gemini responses use a bounded, memory-only cache for 10 minutes. The default limits are five concurrent generations, ten upstream requests per minute (room for five initial calls plus one repair/retry each), and 100 upstream requests per rolling 24 hours **per server instance**. Completed cached readings are served before these checks, identical requests in progress share one generation, and failures release their own cooldown entries. The UI shows the server-provided retry countdown; upstream Gemini quota errors are identified separately. Override the minute/day limits with `TOMO_AI_REQUESTS_PER_MINUTE` and `TOMO_AI_REQUESTS_PER_DAY`, and concurrency with `TOMO_AI_MAX_CONCURRENT`. Existing deployment environment overrides still take precedence: update old values of 2 concurrent / 5 per minute if they were set explicitly. These are app defaults, not Google's published quotas.

Browsers attach a random session ID, held in session storage when available and otherwise in memory. The server combines it with a hashed IP for a three-second browser cooldown, so five devices on shared Wi-Fi can start distinct readings simultaneously. A separate IP burst limit allows at most five new generations per three seconds even if clients change session IDs; requests without a valid ID retain the IP-only cooldown. Session IDs are not authentication and contain no reading inputs. A sixth simultaneous generation receives `APP_BUSY` (or `APP_COOLDOWN` if that network has already used its burst); there is no queue.

When Google returns HTTP 429, the instance pauses new uncached generations and new retry reservations until Google's retry delay expires (60 seconds when absent). Cached results and identical requests already in progress remain available. Already-sent Google requests continue. This reduces repeated quota errors; it cannot discover your project's RPM/input-token/day allowance or guarantee that five requests fit it. Set app limits to your project's active model quota in AI Studio. No extra keys, automatic key rotation, or billing changes are used.

When diagnosing failures, check the code and support reference returned by `/api/reading`. `APP_MINUTE_LIMIT`, `APP_DAILY_LIMIT`, `APP_COOLDOWN` and `APP_BUSY` originate in Tomo and will not appear as exhausted quotas in AI Studio. `GEMINI_RATE_LIMIT` identifies an actual Google 429. `AI_KEY_CONFIGURATION` means the server key needs checking, including invalid/expired keys rejected with HTTP 400. Replace that key in the host's environment and redeploy (or update the local `.env` and restart the server). Failure logs include the reference, fixed provider code, key reason, validation check, duration and attempt counts when available; they exclude credentials, names, birthdates and generated text. The fallback result keeps the failure explanation and support reference visible after the toast disappears.

**Serverless limit:** memory counters and cache reset on restart and are not shared across Vercel instances. These controls reduce casual overuse but do not provide a deployment-wide budget or prevent determined abuse. Google project quotas remain the upstream limit. A strict shared cap requires a durable counter/rate-limit store; none is configured here. Origin checking is an additional browser check, not authentication. AI failure or quota exhaustion automatically shows the built-in reading. No billing or key rotation is enabled.

The local demo/procedural reading does not require Gemini or Internet access. Google Fonts may fall back to system fonts offline. Nomo multiplayer does not use Gemini; it requires the Socket.IO server.

Built-in readings combine eight curated everyday story topics with separate Friends/Couple situations and Sweet/Playful/Mystic narration. The pair's chart symbols select a stable mix of topics; Moon elements, life-path numbers, Mahabote weekdays, Chinese animals and five-element symbols supply conversation prompts. Three game-score bands change the shared story and closing advice. Matching symbols receive alternate profile passages to avoid repeating the same sentences. The same normalized inputs produce the same reading, entirely locally. These are fictional story cues for reflection and entertainment.

Nomo reconnects using a private player token held in the tab's session storage. A refresh or Wi-Fi interruption can resume the same player within two minutes. Submitted selections and completed quizzes restore their waiting screens; an unfinished quiz can be restarted after a full page refresh. If browser storage is disabled, reconnection works in the current page but a full refresh loses the token. Player tokens and answers are excluded from room broadcasts; answers are revealed after both players finish. Explicitly leaving resets the match for the remaining player.

For static hosting such as Vercel, deploy `server/` to a host that supports a persistent Node process and Socket.IO. Set `VITE_NOMO_SERVER_URL` to that backend's HTTPS origin before building the frontend. On the backend, set `CLIENT_ORIGIN` to the frontend origin (or comma-separated allowed origins). Without `VITE_NOMO_SERVER_URL`, production connects to the same origin; Vercel's SPA rewrite alone does not run the multiplayer server.

Rooms remain in memory and are lost on server restart. Use one server instance; multiple replicas require shared room storage and a Socket.IO adapter. Idle rooms expire after 45 minutes and results after 10 minutes.

The test suite includes real Socket.IO integration tests and requires permission to connect to a local loopback test server. Run `npm test` from the root after installing both client and server dependencies; `npm test --prefix server` runs only the multiplayer tests. Gemini and reading-endpoint tests use mocked responses and do not call the live API.


### Tomo AI writing and quality controls

Sun labels, elements, modalities and astronomical scoring now use the same computed noon-UTC Sun position. With no birth time or time zone supplied, chart notes mark all planetary signs as estimates and show sampled alternatives where appropriate. Alternatives are sampled every six hours across the possible UTC window of the local birthdate (UTC+14 through UTC-12), including the window end; this is not an exact sign-ingress search. A bounded 64-date in-memory cache reuses astronomical calculations without storing names. The AI prompt receives the possible signs and instructions not to treat uncertain placements as definite. The prompt version prevents reuse of readings generated under the previous calculation rules.

The Chinese-year calculation still uses its documented approximate February 4 solar-year cutoff, and Mahabote houses still use Gregorian year minus 638. These conventions are labeled in chart notes. Boundary tests cover the January 2020 Sun-sign regression, leap days, year changes, February 3/4 and consistent results across UTC, Myanmar, UTC+14 and Alaska time zones. Scores and component scores display as points out of 100, with the label “Tomo ဂိမ်းအမှတ်” on the main score and exported card, rather than as a compatibility percentage.

Scoring now starts each component at a neutral 50, applies documented positive/negative rule points, then combines the five components using the selected mode's weights. Unmatched/missing symbols remain neutral; the old 45-point minimum and Friends bonus were removed. Friends excludes Venus–Mars romance adjustments. The expanded score breakdown shows every rule, component weight, and the arithmetic behind the final rounded score. Built-in stories and AI prompts treat 50 as mixed/neutral. See [the scoring rules and synthetic distribution audit](docs/SCORE_RULES.md); run `node scripts/analyze-scores.mjs` to reproduce the audit. These are transparent game rules, not empirical relationship predictions.

The server uses Gemini 3.1 Flash-Lite. The expanded prompt gives Sweet, Playful and Mystic separate writing directions, and Friends/Couple separate situations and relationship needs in every section. It requests four detailed blocks per profile, three shared-insight paragraphs, three substantial strengths and challenges each, and a two-paragraph closing note. Generation is bounded to 16,384 output tokens, and application checks reject wrong-language fields, malformed profiles, repeated list items, and romantic wording in Friends mode. A prompt-version change prevents reuse of older short readings. Length checks reject abbreviated results. Each endpoint request has an 80-second overall upstream deadline and at most two upstream requests, subject to the same quota allowance. The browser waits up to 85 seconds and offers Cancel; Vercel allows 90 seconds so application diagnostics can return before the host terminates the function. Actual Burmese quality requires native-speaker evaluation; no live/billed model benchmark is included.

AI requests use header authentication and derived chart summaries instead of raw birthdates. Validated results are cached only in memory for 10 minutes, with eight entries maximum and isolation by hashed key, model, and prompt input/version. Readings are not written to local storage. PNG exports wrap measured Burmese graphemes and identify the score as symbolic.

### Saved cards, music and mobile

Save our card opens a preview using the current charcoal/ember design. The PNG includes the reading's names, selected mode/tone, actual score and influences, source label, and full closing note at its normal length. Its height adapts to the text; unusually large notes become a labelled excerpt to bound image memory. PNG generation uses Blob URLs, reuses the prepared image, and releases it when the reading changes. The preview offers download, an image link, and native file sharing when supported. Birthdates and keys are excluded.

Music attempts playback when Tomo or Nomo opens. If the browser blocks audible autoplay, it starts on the first normal tap/click/key interaction. Pause, mute and volume preferences are respected across navigation and reloads. Volume controls are available by tapping the music-note button. Browser autoplay permission remains outside the app's control.

Phone layouts reserve space for the bottom navigation and safe areas, use 16px form fields to avoid focus zoom, keep long readings in normal text flow, and provide touch-sized actions. Responsive checks cover 320–1280px; the card preview also works on narrow phones.

AI failure responses distinguish upstream availability, transport, empty/unreadable provider responses, configuration, quota and output limits. Server logs contain only an opaque reference, a fixed error code and an allowlisted network cause; no API keys, names, birthdates, generated content or raw upstream error bodies are logged.
