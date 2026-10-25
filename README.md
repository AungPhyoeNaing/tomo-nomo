# 🌸 Tomo's Destiny Matcher 💖

An advanced, interactive single-page web application created for a university project showcase.

Tomo is a playful astrology-inspired story game, not a validated personality test or relationship-probability calculator. The main reveal uses built-in templates; optional Gemini readings require your key. Results show the source, model/cache status, and approximate chart limitations. See [the engine and Burmese-output audit](docs/TOMO_AUDIT.md) for findings, fixes, and evaluation steps.

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
   - Animated Tomo avatar overlay with text (*"Tomo က နှစ်ယောက်လုံးရဲ့ စိတ်နေစိတ်ထားတွေကို အသေးစိတ် လေ့လာနေပါတယ်နော်..."*).
   - Animated score count-up gauge.

6. **Destiny Card Image Exporter (📸 Download PNG)**:
   - Built-in HTML5 Canvas generator exporting a stylized, shareable reading card (`Tomo_Destiny_Reading.png`).

7. **Offline Presentation Demo Mode (✨ Tomo Demo Reading)** & **LocalStorage API Key**:
   - LocalStorage persistence for user API key and pre-loaded local JSON data for offline presentation showcases.

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

Run the client and multiplayer server in separate terminals:

```bash
# Terminal 1 - client
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

Open AI settings in Tomo’s header to choose between two saved Gemini key slots and enter your own key. Values are kept in the browser's local storage; when storage is blocked, the key works for the current page session. Clearing a migrated key also removes the old stored key. Build-time `VITE_GEMINI_API_KEY` is no longer used, so deployment secrets cannot accidentally enter the JavaScript bundle through that setting. Keys entered in the browser remain visible to that browser and are sent directly to Gemini.

The local demo/procedural reading does not require Gemini or Internet access. Google Fonts may fall back to system fonts offline. Nomo multiplayer does not use Gemini; it requires the Socket.IO server.

Nomo reconnects using a private player token held in the tab's session storage. A refresh or Wi-Fi interruption can resume the same player within two minutes. Submitted selections and completed quizzes restore their waiting screens; an unfinished quiz can be restarted after a full page refresh. If browser storage is disabled, reconnection works in the current page but a full refresh loses the token. Player tokens and answers are excluded from room broadcasts; answers are revealed after both players finish. Explicitly leaving resets the match for the remaining player.

For static hosting such as Vercel, deploy `server/` to a host that supports a persistent Node process and Socket.IO. Set `VITE_NOMO_SERVER_URL` to that backend's HTTPS origin before building the frontend. On the backend, set `CLIENT_ORIGIN` to the frontend origin (or comma-separated allowed origins). Without `VITE_NOMO_SERVER_URL`, production connects to the same origin; Vercel's SPA rewrite alone does not run the multiplayer server.

Rooms remain in memory and are lost on server restart. Use one server instance; multiple replicas require shared room storage and a Socket.IO adapter. Idle rooms expire after 45 minutes and results after 10 minutes.

The test suite includes real Socket.IO integration tests and requires permission to connect to a local loopback test server. Run `npm test` from the root after installing both client and server dependencies; `npm test --prefix server` runs only the multiplayer tests. Gemini failure tests use mocked responses and do not call the paid API.


### Tomo AI writing and quality controls

AI settings keep Gemini 3.1 Flash-Lite as the default and offer Gemini 3.8 Flash for comparison. The prompt requests natural spoken Burmese with short structured sections, and application checks reject wrong-language fields, malformed profiles, repeated list items, and romantic wording in Friends mode. There is at most one quality repair; auth/quota/truncation errors do not trigger a repair. A single overall 60-second deadline and Cancel button bound the request. Actual Burmese quality requires native-speaker evaluation; no live/billed model benchmark is included.

AI requests use header authentication and derived chart summaries instead of raw birthdates. Validated results are cached only in memory for 10 minutes, with eight entries maximum and isolation by hashed key, model, and prompt input/version. Readings are not written to local storage. PNG exports wrap measured Burmese graphemes and identify the score as symbolic.
