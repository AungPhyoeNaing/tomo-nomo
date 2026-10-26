# Tomo engine and Burmese-output audit

Audit date: 2026-10-25. Scope: Tomo calculations, offline stories, Gemini prompt/request/response handling, settings, source disclosure, cancellation, and PNG export. Nomo gameplay is outside this audit, but its regression suite remains part of verification.

## Conclusion

Tomo is computationally efficient for an entertainment game. It is not a validated personality instrument. Names and birthdays do not supply behavior evidence, and replacing the language model cannot turn the symbolic score into a measured relationship probability. Better Burmese, clearer personalization, and more useful conversation prompts are attainable; factual personality accuracy requires different input and evaluation.

No live Gemini request, account key lookup, billed model comparison, or user-data transmission was performed for this audit. Network tests use mocked responses. Burmese grammar and model-quality gains are not empirically established by these tests.

## Verified findings and implemented changes

| Priority | Finding | Change | Evidence/limit |
| --- | --- | --- | --- |
| High | Player order affected scores. | Average both Venus–Mars directions; make Moon-element and life-path pair matching symmetric. | Before: 424/1,260 sampled pair/mode cases differed when swapped. After: 0/1,260. Regression covers the same 36 deterministic synthetic people. |
| High | Same Chinese animal was intercepted by the trine branch, making the intended same-animal score unreachable. | Check same animal first; exclude identical animals from the synthesis trine description. | Rat/Rat now uses intended 85; Rat/Dragon retains 98. This repairs code consistency, not empirical validity of the weights. |
| High | Main play button generated an offline template, easily mistaken for AI. | Result shows built-in, Gemini model, cached AI, or fallback provenance. | Source metadata is kept with the immutable input snapshot. Primary built-in and optional AI actions remain explicit. |
| High | Old prompt claimed an elite psychologist could infer flaws, attachment and toxic reactions from chart data. | Replace with a compact symbolic-story prompt, everyday examples, uncertainty and no invented psychological/history claims. | Cannot prevent every unsupported inference; human review still needed. Legacy Sweet/Playful fallback templates remain more categorical than the new AI prompt. |
| High | Burmese instructions were mostly English and requested extensive prose with few language-specific examples. | Add Burmese tone instructions, a consistent spoken register, example sentence rewrites, four short profile sections, three unique strengths/challenges, natural punctuation, restrained emoji. | Examples are starting editorial guidance, not a native-speaker-reviewed style gold set. |
| High | Valid JSON could still be English, repetitive, wrongly structured or romantic in Friends mode. | Validate language ratio per field (excluding supplied names), four headed profile paragraphs, distinct profiles, short title, exactly three distinct list items, and Friends vocabulary. | Heuristics do not grade grammar, semantic repetition, encoding correctness or factuality. |
| Medium | Long reasoning output could occupy the first response part; truncated responses were not distinguished. | Ignore thought parts, join text parts, inspect finish/block reasons. | Truncated/blocked results fall back clearly rather than being accepted as complete. |
| Medium | No bounded quality repair, output cap, source metadata or cancellation. | One repair only for invalid JSON/quality; 8,192 output-token cap; 60-second overall deadline; caller abort signal and UI Cancel; attempt/token/duration metadata. | Repair can add one billed request. No automatic model upgrade or auth/quota retry. |
| Medium | API key was in request URL. | Use x-goog-api-key header; redact key from server error messages; omit raw birthdays from AI data. | BYOK remains browser-side and existing saved keys remain in local storage. Header auth does not make browser keys secret from that browser. |
| Medium | Identical AI requests re-ran generation. | Memory-only, 10-minute, eight-entry cache keyed by hashed credential, model, prompt version and complete prompt input. | No persisted readings. Switching key/model/mode/input isolates cache. Different tabs do not share it. |
| Medium | Model was hard-coded and sampling settings were changed by mood. | Default remains Gemini 3.1 Flash-Lite; optional comparison with Gemini 3.8 Flash in settings. Temperature 1; low thinking; tone expressed in prompt. | Newer model is an experiment, not a proven Burmese-quality improvement. Availability, cost and rate limits depend on the user's key. |
| Medium | Offline Mystic was effectively the same branch as Sweet. | Distinct Mystic profiles, title, insight, lists and note. | Offline output is still a deterministic story template. |
| Medium | Input names were trimmed for display but not consistently before scoring. | Normalize NFC, trim and collapse whitespace before metrics and AI data. | NFC is not Zawgyi-to-Unicode conversion. |
| Medium | PNG export wrapped advice by spaces/character count and did not measure long titles/names. | Wait for chosen fonts, wrap measured graphemes, bound lines and show ellipsis; also clear canvas paths per metric bar. | Font availability can still differ offline. Long text is intentionally abbreviated in the card; the full reading stays in the app. |
| Medium | Share card suggested a measured probability. | Label its number a symbolic game score and identify it as entertainment. | The result still uses a percentage-shaped game display, not a calibrated probability. |
| Medium | Modal background header/navigation remained keyboard-accessible. | Inert background controls and skip link while AI settings is open. | Additional mobile/screen-reader coverage remains useful. |
| Low | Offline mode added an artificial 1.5-second pause. | Removed. | Existing local compute is already fast. |

## Efficiency measurements

A single Node run computed 36 synthetic profiles and compared 630 unordered pairs in both Friends/Couple modes, each in both player orders. Original run: about 18 ms; corrected run: about 21 ms. Both are small relative to network/model latency. These are one local sample, not a p95 benchmark. Scores in this synthetic sample ranged from 64 to 99; it is not a population distribution and should not be used to calibrate thresholds.

Optimization priority is output length, API latency, cache hit rate and failed-generation rate, not micro-optimizing the local formulas. The pipeline now avoids duplicating long English interpretations and does not ask the model to regenerate a score that the app already owns.

## Remaining limitations, in priority order

1. **Real personalization needs self-report.** Add optional responses about social energy, planning vs spontaneity, conflict handling, communication preferences, support needs and boundaries. Both people should supply their own answers. Keep observations separate from astrological story cues. Never describe a custom mini-quiz as a validated Big Five instrument without validation; use appropriately licensed, translated and evaluated items if pursuing that direction.
2. **Native Burmese editorial evaluation is still essential.** Review the prompt examples and curated offline stories with a Burmese editor. Built-in readings now combine eight everyday topics, three score-based story paths and chart-symbol conversation prompts, with alternate passages for matching symbols. Tests check language, structure, variety and repeated sentences; they cannot judge idiomatic phrasing or replace native-speaker review. Personal observations still require self-report inputs.
3. **Calendar/astrology approximations remain.** Planet positions assume 12:00 UTC without birth time/location; lunar sign can change during a day. Myanmar year uses Gregorian year minus 638 without a Myanmar New Year boundary calculation. The Chinese solar-year cutoff is a fixed February 4 rather than the actual solar-term instant, and is a different convention from lunar New Year. These were disclosed rather than silently replaced with an unverified calendar algorithm. Wednesday morning/evening Rahu distinction is not available without birth time. These omissions matter for astrological fidelity, not scientific personality accuracy.
4. **Name numerology is not culturally validated.** Non-Latin names use a Unicode-code-unit game hash; mixed Latin/Myanmar names use only the Latin part. Cosmetic spelling, transliteration and encoding can change results. Do not call that a real Burmese naming/numerology system. Consider removing its scoring weight or making the story number visibly optional after deciding product direction.
5. **Scoring is hand-authored and correlated.** Weights, clamps, friendship bonus and tier cutoffs are not learned or calibrated. Multiple systems reuse birthdate/year, so they are not five independent confirmations. Western zodiac tables and computed solar longitude can disagree near a boundary. Avoid precision/accuracy claims.
6. **Public deployment needs a separate key architecture decision.** Current BYOK behavior is intentional and functional. For a shared production key, use a backend with secret storage, authentication, rate limits and spend controls. Do not ship a shared key in Vite environment variables or JS. No backend proxy was introduced in this audit.
7. **Encoding should be an explicit user choice.** The app expects Myanmar Unicode. A short name cannot safely be assumed to be Zawgyi from a homemade regex. If needed, use a tested detector/converter with user-visible confirmation rather than silently mutating names.
8. **Quality monitoring is not enabled.** Collect only opt-in, redacted feedback; avoid saving names, birthdates, keys or private readings in logs. Track fallback rate, language failures, repairs, latency and token use. No telemetry was added.
9. **CSS/asset upkeep.** Design overrides are split across legacy and newer stylesheets. Consolidating tokens/selectors would reduce cascade regressions and unused CSS, but is separate from improving the reading engine. Generated source PNGs live in design/; runtime portraits are optimized WebP.

## Burmese A/B evaluation before changing the default model

Create 12 fixed, consented or synthetic cases: all six relationship/tone combinations across two clearly different input pairs. Include Burmese-only names, English names, short names, a name that contains a relationship word, and prompt-injection-like name input. Verify Friends output remains platonic and each tone is distinguishable.

Compare both available models with identical inputs and the same prompt version. Use blinded native-speaker review, scoring each 1–5 on naturalness, spelling/grammar, register consistency, mode/tone fit, practical specificity, repetition and unsupported claims. Track successful outputs and fallback/repair rates, wall-clock latency and total tokens. Reject wrong-language or fabricated-history outputs regardless of their fluency.

Do not judge improvement from one flattering output. Twelve cases x two models is 24 initial calls; repeating three times is 72 initial calls, plus at most one repair per call. Agree a spend limit before running this externally. No such live comparison was run here.

## Sources checked

- [Gemini model catalog](https://ai.google.dev/gemini-api/docs/models): current model IDs, not proof of Burmese quality.
- [Gemini 3.1 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite): efficient model positioning and structured-output/thinking support.
- [Gemini 3.8 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash): optional comparison model and low thinking support.
- [Gemini 3 guidance](https://ai.google.dev/gemini-api/docs/gemini-3): default temperature recommendation. This guide is deprecated; revisit configuration when changing model families.
- [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output): descriptions, item constraints, and application-side value validation.
- [API key handling](https://ai.google.dev/gemini-api/docs/api-key): header authentication and key security considerations.
- [IPIP Big-Five factor markers](https://ipip.ori.org/newBigFive5broadKey.htm): an example of behavioral self-report items; not a validation of a custom Burmese adaptation.
- [Myanmar Tools](https://github.com/google/myanmar-tools): encoding detection/conversion and short-input ambiguity.
