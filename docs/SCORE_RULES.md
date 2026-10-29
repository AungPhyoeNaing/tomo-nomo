# Tomo game scoring: neutral-50-v1

This is an authored entertainment game, not a calibrated model of relationship outcomes. The numbers describe how chart symbols match the rules below. More varied scores do not establish predictive accuracy.

Every component starts at 50. Unmatched or missing inputs add zero. Applied rules include a fixed explanation. The final score is the weighted average of the five component scores, rounded to an integer and bounded to 0–100. There is no 45-point floor, automatic Friends bonus, random adjustment, or distribution-based stretching. Intermediate weighted contributions retain three decimals so the displayed arithmetic can be reproduced.

| Component | Friends weight | Couple weight | Rule changes from 50 |
| --- | ---: | ---: | --- |
| Western | 20/100 | 28/100 | Sun trine +24, conjunction +16, sextile +18, opposition −12, semi-sextile +4, inconjunct −10, square −24. Where no aspect applies, same element +12, complementary +16, contrasting −16, otherwise 0. Moon uses the same rules at 0.4 scale. Couple mode adds both Venus–Mars directions at 0.2 scale each. Friends excludes these romance adjustments. |
| Mahabote | 22/100 | 22/100 | Existing weekday alliance pairs +24; contrasting pairs −24; same weekday +10; other pairs 0. Same nonempty approximate house +6. |
| Chinese animal | 24/100 | 18/100 | Distinct animals in a trine group +30; paired allies +24; opposing pairs −30; other contrasting pairs −20; same animal +10; unlisted pairs 0. |
| Five elements | 18/100 | 18/100 | Generating pairs +25; same element +10; controlling pairs −25; missing/unknown elements 0. |
| Numerology | 16/100 | 14/100 | Same life-path number +16; listed harmonic pairs +18; contrasting pairs −18; other pairs 0. Same valid name-game number +4, or different numbers in the same triad +3. Master numbers receive no automatic bonus. Name scoring remains a game convention, including the non-Latin character-code hash. |

Aspect orbs remain 8° for trine, conjunction and opposition, 6° for sextile, 4° for semi-sextile and inconjunct, and 7° for square. The complete pair tables and executable rules are in `src/utils/pairScoring.js`. Labels and ordinal bands describe symbols, not measured personality or future relationship quality. Bands are 0–39 contrasting, 40–59 mixed/neutral, 60–74 some alignment, and 75–100 stronger symbolic alignment. Built-in story thresholds use 40 and 75 so 50 receives the middle story.

Run `node scripts/analyze-scores.mjs` to reproduce the audit. It uses 400 synthetic people, birth years 1960–2009, sampled months and days 1–28, a fixed random seed of 123456789, and 5,000 sampled pairs per mode. It is a regression check of game behavior, not a representative population study or empirical calibration.

| Mode | Previous mean | New mean | New observed range |
| --- | ---: | ---: | ---: |
| Friends | 81.55 | 53.01 | 27–74 |
| Couple | 80.64 | 53.19 | 26–75 |

The theoretical 0–100 bounds do not promise that every score is reachable or equally frequent. Averaging several components naturally concentrates results near the middle. High scores require several rules to align; low scores require several contrasting rules. Existing planet/time/calendar approximations still apply. The prompt and calculation versions changed so older high-baseline readings are not reused from cache.
