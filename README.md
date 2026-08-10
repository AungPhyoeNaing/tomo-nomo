# 🌸 Tomo's Destiny Matcher 💖

An advanced, interactive single-page web application created for a university project showcase.

The application allows users to analyze relationships in two modes: **Friends 👯‍♂️** (platonic loyalty & fun) or **Couple ❤️** (romantic chemistry & emotional connection).

Under the hood, pure JavaScript silently calculates **5 Ultra-Precise Astrological & Numerological metrics** for both individuals:
1. **Western Solar Zodiac Sign** (Month & Day)
2. **Mahabote Day of the Week** (Sunday-Saturday based on exact birthdate)
3. **True Chinese 12 Zodiac Animal** (Year - shifting precisely on Feb 4th)
4. **Chinese 5 Elemental Energy** (Based on the last digit of the True Chinese Year)
5. **Name Numerology (Destiny Number)** (Pythagorean alphabet system reduced to single digit 1-9).

All 8 metrics + relationship mode are passed silently into the **Google Gemini 3.1 Flash Lite API**. The API acts as **"Tomo" (တိုမို)** — a friendly, sweet, and highly perceptive virtual girl delivering rich, multi-paragraph Burmese readings (မြန်မာဘာသာ).

---

## 🎀 Key Features

1. **Friends 👯‍♂️ vs Couple ❤️ Mode Toggle**:
   - Tailors personality insights, dynamic synergy, and advice specifically for friendships or romantic couples.

2. **5-Metric Silent Astrology & Numerology Engine (Pure JS)**:
   - **Western Solar Zodiac Sign**
   - **True 7-House Burmese Mahabote Engine** (Calculates Myanmar Era planetary house: *Bhanga, Athan, Hsi-za, Puti, Chowda, Yaza, Marana*)
   - **True Chinese 12 Zodiac Animal** (Shifting on Feb 4th)
   - **Chinese 5 Elemental Energy**
   - **Pythagorean Name Numerology** (with Unicode fallback for Burmese script)

3. **Tomo Persona Tone Selector**:
   - Choose Tomo's mood tone: **Sweet & Empathetic 🌸**, **Playful & Sassy 🎀**, or **Wise & Mystical 🔮**.

4. **Gemini 3.1 Flash Lite "Tomo" Persona**:
   - Model: `gemini-3.1-flash-lite`
   - **Structured JSON Mode**: `responseMimeType: "application/json"` with strict `responseSchema`.
   - Generates long, shockingly accurate, multi-paragraph Burmese responses covering deep character readings, dynamic insights, strengths, challenges, and secret destiny advice.

5. **4-Second Cute Loading Animation & Score Count-Up**:
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

## 🚀 Quick Setup

1. Configure `GEMINI_API_KEY` in `.env` or in the API Key input box.
2. Open `index.html` in your browser!
