import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseLocalDate,
  getMahaboteInfo,
  getTrueChineseYear,
  getChineseElement,
  calculateDestinyNumber,
  calculateSecretMetrics,
  calculateDetailedMetricsBreakdown,
  calculateAlgorithmicScore,
  getAngularDistance,
  getAspectScore,
  getScoreResonanceTier,
  getCrossSystemSynthesisReport
} from '../src/utils/astrology.js';
import { generateDeepProceduralReading } from '../src/utils/gemini.js';

describe('Astrology & Numerology Engine Tests', () => {

  describe('1. Date Parsing & Western Zodiac', () => {
    it('parses local ISO date string correctly', () => {
      const d = parseLocalDate('1996-06-15');
      assert.equal(d.getFullYear(), 1996);
      assert.equal(d.getMonth(), 5); // 0-indexed: June is 5
      assert.equal(d.getDate(), 15);
    });

    it('calculates Gemini for June 15', () => {
      const secret = calculateSecretMetrics('Test User', '1996-06-15');
      assert.equal(secret.western, 'Gemini');
      assert.equal(secret.westernElement, 'Air');
    });

    it('calculates Capricorn for January 5 and December 25', () => {
      const jan = calculateSecretMetrics('Jan', '2000-01-05');
      assert.equal(jan.western, 'Capricorn');
      const dec = calculateSecretMetrics('Dec', '2000-12-25');
      assert.equal(dec.western, 'Capricorn');
    });
  });

  describe('2. Burmese Mahabote & 7 Houses System', () => {
    it('calculates correct Mahabote planetary day for Saturday (1996-06-15)', () => {
      const info = getMahaboteInfo('1996-06-15');
      assert.equal(info.dayName, 'Saturday');
      assert.equal(info.dayMm, 'စနေ');
      assert.ok(info.house.name);
    });

    it('calculates correct Mahabote planetary day for Sunday (1996-06-16)', () => {
      const info = getMahaboteInfo('1996-06-16');
      assert.equal(info.dayName, 'Sunday');
      assert.equal(info.dayMm, 'တနင်္ဂနွေ');
    });
  });

  describe('3. Chinese Zodiac Lichun (Feb 4) Boundary & 5 Elements', () => {
    it('shifts Chinese year back by 1 if born before Feb 4', () => {
      const jan = getTrueChineseYear('2024-01-20');
      assert.equal(jan, 2023); // Born before Lichun Feb 4 is Rabbit (2023)
      const feb5 = getTrueChineseYear('2024-02-05');
      assert.equal(feb5, 2024); // Born on/after Feb 4 is Dragon (2024)
    });

    it('determines Chinese element correctly from true year', () => {
      const metal = getChineseElement(2020);
      assert.equal(metal.key, 'Metal');
      const water = getChineseElement(2022);
      assert.equal(water.key, 'Water');
      const wood = getChineseElement(2024);
      assert.equal(wood.key, 'Wood');
      const fire = getChineseElement(2026);
      assert.equal(fire.key, 'Fire');
      const earth = getChineseElement(2028);
      assert.equal(earth.key, 'Earth');
    });
  });

  describe('4. Pythagorean Name Numerology & Life Path Number', () => {
    it('reduces English names to 1-9 single digit', () => {
      const num1 = calculateDestinyNumber('ALICE');
      assert.ok(num1 >= 1 && num1 <= 9);
      const num2 = calculateDestinyNumber('JOHN DOE');
      assert.ok(num2 >= 1 && num2 <= 9);
    });

    it('handles Burmese Unicode characters gracefully with charCode fallback', () => {
      const numMm = calculateDestinyNumber('သူရိန်');
      assert.ok(numMm >= 1 && numMm <= 9);
      const numMm2 = calculateDestinyNumber('သီရိ');
      assert.ok(numMm2 >= 1 && numMm2 <= 9);
    });

    it('calculates Life Path number correctly from birthdate', () => {
      const p1 = calculateSecretMetrics('သူရိန်', '1996-06-15');
      assert.equal(p1.lifePathNumber, 1); // 1+9+9+6+0+6+1+5 = 37 -> 10 -> 1
      assert.ok(p1.lifePathArchetype);

      const p2 = calculateSecretMetrics('သီရိ', '1996-10-08');
      assert.equal(p2.lifePathNumber, 7); // 1+9+9+6+1+0+0+8 = 34 -> 7
      assert.ok(p2.lifePathArchetype);
    });

    it('returns 1 on empty input', () => {
      assert.equal(calculateDestinyNumber(''), 1);
    });
  });

  describe('5. Astronomical Ephemeris Positions & Angular Aspects', () => {
    it('calculates Moon, Venus, and Mars positions accurately for 1996-06-15', () => {
      const p1 = calculateSecretMetrics('သူရိန်', '1996-06-15');
      assert.equal(p1.western, 'Gemini');
      assert.equal(p1.moonSign, 'Gemini');
      assert.equal(p1.venusSign, 'Gemini');
      assert.equal(p1.marsSign, 'Gemini');
      assert.ok(typeof p1.sunLon === 'number');
    });

    it('calculates Moon and Venus positions accurately for 1996-10-08', () => {
      const p2 = calculateSecretMetrics('သီရိ', '1996-10-08');
      assert.equal(p2.western, 'Libra');
      assert.equal(p2.moonSign, 'Leo');
      assert.equal(p2.venusSign, 'Virgo');
      assert.equal(p2.marsSign, 'Leo');
    });

    it('calculates angular distance and celestial aspects correctly', () => {
      const distTrine = getAngularDistance(0, 120);
      assert.equal(distTrine, 120);
      const aspectTrine = getAspectScore(distTrine);
      assert.equal(aspectTrine.score, 74);

      const distSquare = getAngularDistance(10, 100);
      assert.equal(distSquare, 90);
      const aspectSquare = getAspectScore(distSquare);
      assert.equal(aspectSquare.score, 26);
    });
  });

  describe('6. Match Resonance % Accuracy & Resonance Tiers', () => {
    it('maps scores accurately into 4 distinct Resonance Tiers', () => {
      const tier95 = getScoreResonanceTier(95);
      assert.equal(tier95.tier, 'SYMBOLIC_ALIGNMENT');

      const tier85 = getScoreResonanceTier(65);
      assert.equal(tier85.tier, 'SOME_ALIGNMENT');

      const tier75 = getScoreResonanceTier(50);
      assert.equal(tier75.tier, 'MIXED_SYMBOLS');

      const tier60 = getScoreResonanceTier(30);
      assert.equal(tier60.tier, 'CONTRASTING_SYMBOLS');
    });

    it('computes weighted score between 0 and 100', () => {
      const p1 = calculateSecretMetrics('သူရိန်', '1996-06-15');
      const p2 = calculateSecretMetrics('သီရိ', '1996-10-08');

      const friendsScore = calculateAlgorithmicScore(p1, p2, 'Friends');
      const coupleScore = calculateAlgorithmicScore(p1, p2, 'Couple');

      assert.ok(friendsScore >= 0 && friendsScore <= 100);
      assert.ok(coupleScore >= 0 && coupleScore <= 100);
    });

    it('generates 5 distinct breakdown categories', () => {
      const p1 = calculateSecretMetrics('သူရိန်', '1996-06-15');
      const p2 = calculateSecretMetrics('သီရိ', '1996-10-08');

      const breakdown = calculateDetailedMetricsBreakdown(p1, p2, 'Friends');
      assert.equal(breakdown.length, 5);
      breakdown.forEach(m => {
        assert.ok(m.label);
        assert.ok(m.score >= 0 && m.score <= 100);
      });
    });
  });

  describe('7. Friend Mode vs Couple Mode Distinct Dynamics', () => {
    const p1 = calculateSecretMetrics('သူရိန်', '1996-06-15');
    const p2 = calculateSecretMetrics('သီရိ', '1996-10-08');

    it('generates distinct breakdown labels for Friends and Couple mode', () => {
      const friendMetrics = calculateDetailedMetricsBreakdown(p1, p2, 'Friends');
      const coupleMetrics = calculateDetailedMetricsBreakdown(p1, p2, 'Couple');

      assert.ok(friendMetrics[0].label.includes('မိတ်ဆွေစစ်'));
      assert.ok(coupleMetrics[0].label.includes('အချစ်ရေး'));
      assert.notEqual(friendMetrics[0].label, coupleMetrics[0].label);
    });

    it('generates distinct procedural deep readings for Friends vs Couple mode', () => {
      const friendReading = generateDeepProceduralReading('သူရိန်', p1, 'သီရိ', p2, 'Friends', 'Sweet', 94);
      const coupleReading = generateDeepProceduralReading('သူရိန်', p1, 'သီရိ', p2, 'Couple', 'Sweet', 94);

      // Verify header sections are distinct
      assert.ok(friendReading.tomo_deep_reading_p1.includes('မိတ်ဆွေအပေါင်းအသင်း'));
      assert.ok(coupleReading.tomo_deep_reading_p1.includes('အချစ်ရေး'));

      // Verify relationship title and insight are distinct
      assert.ok(friendReading.relationship_title.includes('သူငယ်ချင်း'));
      assert.ok(coupleReading.relationship_title.includes('ချစ်သူ'));
      assert.notEqual(friendReading.tomo_dynamic_insight, coupleReading.tomo_dynamic_insight);
      assert.notEqual(friendReading.tomo_secret_advice, coupleReading.tomo_secret_advice);
    });
  });

  describe('8. Playful Mode Cute & Friendly Phrasing', () => {
    const p1 = calculateSecretMetrics('သူရိန်', '1996-06-15');
    const p2 = calculateSecretMetrics('သီရိ', '1996-10-08');

    it('generates warm, cute and endearing conversational phrasing in Playful mode', () => {
      const playfulCouple = generateDeepProceduralReading('သူရိန်', p1, 'သီရိ', p2, 'Couple', 'Playful', 94);
      const playfulFriend = generateDeepProceduralReading('သူရိန်', p1, 'သီရိ', p2, 'Friends', 'Playful', 94);

      // Humor comes from situations and activities, rather than repeated pet names.
      for (const reading of [playfulCouple, playfulFriend]) {
        assert.match(reading.tomo_deep_reading_p1, /ကစားပွဲ|ပြိုင်ပွဲ/);
        assert.match(reading.relationship_title, /ရယ်စရာ/);
        assert.match(reading.tomo_secret_advice, /မဲဖောက်/);
      }
      assert.match(playfulCouple.tomo_dynamic_insight, /ချစ်သူ/);
      assert.match(playfulFriend.tomo_dynamic_insight, /သူငယ်ချင်း/);
    });
  });

  describe('9. 5-Pillar Calculation Matrix & Commonality Synthesis', () => {
    const p1 = calculateSecretMetrics('သူရိန်', '1996-06-15');
    const p2 = calculateSecretMetrics('သီရိ', '1996-10-08');

    it('synthesizes sub-scores and commonalities across all 5 calculation pillars', () => {
      const synthesis = getCrossSystemSynthesisReport(p1, p2, 'Couple');

      // Verify all 5 pillar sub-scores exist and are calculated
      assert.ok(synthesis.breakdownScores.zodiacScore >= 0 && synthesis.breakdownScores.zodiacScore <= 100);
      assert.ok(synthesis.breakdownScores.mahaboteScore >= 0 && synthesis.breakdownScores.mahaboteScore <= 100);
      assert.ok(synthesis.breakdownScores.animalScore >= 0 && synthesis.breakdownScores.animalScore <= 100);
      assert.ok(synthesis.breakdownScores.elementScore >= 0 && synthesis.breakdownScores.elementScore <= 100);
      assert.ok(synthesis.breakdownScores.numScore >= 0 && synthesis.breakdownScores.numScore <= 100);

      // Verify cross-system commonalities are extracted
      assert.ok(synthesis.commonalitySynthesis.western.includes('Sun-Sun'));
      assert.ok(synthesis.commonalitySynthesis.mahabote.includes('မဟာဘုတ်'));
      assert.ok(synthesis.commonalitySynthesis.chineseZodiac);
      assert.ok(synthesis.commonalitySynthesis.fiveElements);
      assert.ok(synthesis.commonalitySynthesis.numerology.includes('Life Path'));

      // Verify overall resonance score is calculated
      assert.ok(synthesis.algorithmicScore >= 0 && synthesis.algorithmicScore <= 100);
      assert.ok(synthesis.scoreTier.tier);
    });
  });

});

