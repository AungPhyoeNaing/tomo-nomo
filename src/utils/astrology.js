// =========================================================
// 1. WESTERN ZODIAC WITH ELEMENTS & MODALITIES
// =========================================================
export const WESTERN_ZODIAC = [
  { key: 'capricorn', nameEn: 'Capricorn', nameMm: 'မကာရရာသီ (Capricorn)', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { key: 'aquarius', nameEn: 'Aquarius', nameMm: 'ကုမ်ရာသီ (Aquarius)', element: 'Air', modality: 'Fixed', ruler: 'Uranus', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { key: 'pisces', nameEn: 'Pisces', nameMm: 'မိန်ရာသီ (Pisces)', element: 'Water', modality: 'Mutable', ruler: 'Neptune', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  { key: 'aries', nameEn: 'Aries', nameMm: 'မိဿရာသီ (Aries)', element: 'Fire', modality: 'Cardinal', ruler: 'Mars', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { key: 'taurus', nameEn: 'Taurus', nameMm: 'ပြိဿရာသီ (Taurus)', element: 'Earth', modality: 'Fixed', ruler: 'Venus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { key: 'gemini', nameEn: 'Gemini', nameMm: 'မေထုန်ရာသီ (Gemini)', element: 'Air', modality: 'Mutable', ruler: 'Mercury', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { key: 'cancer', nameEn: 'Cancer', nameMm: 'ကရကဋ်ရာသီ (Cancer)', element: 'Water', modality: 'Cardinal', ruler: 'Moon', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { key: 'leo', nameEn: 'Leo', nameMm: 'သိဟ်ရာသီ (Leo)', element: 'Fire', modality: 'Fixed', ruler: 'Sun', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { key: 'virgo', nameEn: 'Virgo', nameMm: 'ကန်ရာသီ (Virgo)', element: 'Earth', modality: 'Mutable', ruler: 'Mercury', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { key: 'libra', nameEn: 'Libra', nameMm: 'တူရာသီ (Libra)', element: 'Air', modality: 'Cardinal', ruler: 'Venus', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { key: 'scorpio', nameEn: 'Scorpio', nameMm: 'ဗြိစ္ဆာရာသီ (Scorpio)', element: 'Water', modality: 'Fixed', ruler: 'Pluto', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { key: 'sagittarius', nameEn: 'Sagittarius', nameMm: 'ဓနုရာသီ (Sagittarius)', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 }
];

// Helper: Parse date ISO string into Local Midnight
export function parseLocalDate(dateString) {
  if (!dateString) return new Date();
  const parts = dateString.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return new Date();
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// =========================================================
// 2. MAHABOTE & BURMESE PLANETARY SYSTEM (7 HOUSES & PLANETS)
// =========================================================
export const BURMESE_DAY_PLANETS = [
  { dayIndex: 0, dayEn: 'Sunday', dayMm: 'တနင်္ဂနွေ', planet: 'တနင်္ဂနွေဂြိုဟ် (Sun)', symbol: 'ဂဠုန် (Garuda)', element: 'မီးဓာတ် (Fire)', direction: 'အရှေ့မြောက် (North-East)', digit: 1 },
  { dayIndex: 1, dayEn: 'Monday', dayMm: 'တနင်္လာ', planet: 'တနင်္လာဂြိုဟ် (Moon)', symbol: 'ကျား (Tiger)', element: 'မြေဓာတ် (Earth)', direction: 'အရှေ့ (East)', digit: 2 },
  { dayIndex: 2, dayEn: 'Tuesday', dayMm: 'အင်္ဂါ', planet: 'အင်္ဂါဂြိုဟ် (Mars)', symbol: 'ခြင်္သေ့ (Lion)', element: 'မီးဓာတ် (Fire)', direction: 'အရှေ့တောင် (South-East)', digit: 3 },
  { dayIndex: 3, dayEn: 'Wednesday', dayMm: 'ဗုဒ္ဓဟူး', planet: 'ဗုဒ္ဓဟူးဂြိုဟ် (Mercury)', symbol: 'ဆင် (Elephant)', element: 'ရေဓာတ် (Water)', direction: 'တောင် (South)', digit: 4 },
  { dayIndex: 4, dayEn: 'Thursday', dayMm: 'ကြာသပတေး', planet: 'ကြာသပတေးဂြိုဟ် (Jupiter)', symbol: 'ကြွက် (Rat)', element: 'မြေဓာတ် (Earth)', direction: 'အနောက် (West)', digit: 5 },
  { dayIndex: 5, dayEn: 'Friday', dayMm: 'သောကြာ', planet: 'သောကြာဂြိုဟ် (Venus)', symbol: 'ပူး (Guinea Pig)', element: 'ရေဓာတ် (Water)', direction: 'မြောက် (North)', digit: 6 },
  { dayIndex: 6, dayEn: 'Saturday', dayMm: 'စနေ', planet: 'စနေဂြိုဟ် (Saturn)', symbol: 'နဂါး (Dragon)', element: 'မီးဓာတ် (Fire)', direction: 'အနောက်တောင် (South-West)', digit: 0 }
];

export const MAHABOTE_HOUSES = [
  { 
    name: 'ဘင်္ဂ (Bhanga - Dynamic Reinvention)', 
    meaning: 'ဘင်္ဂဌာန - ပြောင်းလဲတိုးတက်ခြင်းနှင့် လျင်မြန်သော စိတ်ကူးဉာဏ်',
    desc: 'အခြေအနေသစ်များကို ချက်ချင်း လိုက်လျောညီထွေ တုံ့ပြန်နိုင်ပြီး ပင်ကိုဉာဏ် ထက်မြက်သူ။ မရိုးအီနိုင်သော စိတ်ကူးဆန်းများဖြင့် ဘဝကို အမြဲဆန်းသစ်နေစေသူ။' 
  },
  { 
    name: 'အထံ (Athan - Social Magnetism & Voice)', 
    meaning: 'အထံဌာန - နှုတ်မှုပညာ၊ ဆွဲဆောင်မှုနှင့် လူမှုဆက်ဆံရေး ကျော်ကြားမှု',
    desc: 'စကားပြော ချိုသာပြေပြစ်ပြီး သူတစ်ပါး စိတ်ကို အလွယ်တကူ ဆွဲဆောင်သိမ်းသွင်းနိုင်သူ။ လူအများ၏ အားပေးထောက်ခံမှုကို သဘာဝအတိုင်း ရရှိတတ်သူ။' 
  },
  { 
    name: 'သိုက် (Hsi-za - Abundance & Generosity)', 
    meaning: 'သိုက်ဌာန - စည်းစိမ်ဥစ္စာ၊ ရက်ရောမှုနှင့် နွေးထွေးသော မေတ္တာအခြေခံ',
    desc: 'စိတ်နှလုံး နူးညံ့ပြီး မိတ်ဆွေအပေါင်းအသင်းများကို ရက်ရက်ရောရော ကူညီဖေးမတတ်သူ။ ရုပ်ဝတ္ထုနှင့် စိတ်ဓာတ်ပိုင်းဆိုင်ရာ ပြည့်စုံကြွယ်ဝမှုကို ဆောင်ကျဉ်းပေးနိုင်သူ။' 
  },
  { 
    name: 'ပုတိ (Puti - Intuition & Artistic Soul)', 
    meaning: 'ပုတိဌာန - စိတ်ခံစားမှု နက်နဲခြင်း၊ ထိုးထွင်းဉာဏ်နှင့် အနုပညာရသ',
    desc: 'အခြားသူများ မမြင်နိုင်သော အတွင်းသဘောကို ကြိုတင် ခံစားသိရှိနိုင်သော နူးညံ့သည့် စိတ်ဝိညာဉ်ပိုင်ရှင်။ အနုပညာနှင့် အတွေးအခေါ် နက်ရှိုင်းသူ။' 
  },
  { 
    name: 'အဓိပတိ (Chowda/Adhipati - Leadership & Principle)', 
    meaning: 'အဓိပတိဌာန - ခေါင်းဆောင်မှုစွမ်းရည်၊ မာနသိက္ခာနှင့် အကာအကွယ်ပေးလိုစိတ်',
    desc: 'ရည်မှန်းချက် ကြီးမားပြီး မိမိကိုယ်မိမိ ယုံကြည်မှု အပြည့်ရှိသူ။ မိမိ ချစ်ခင်ရသူများကို ရဲဝံ့ပြတ်သားစွာ ကာကွယ်စောင့်ရှောက်ပေးတတ်သော ဦးဆောင်သူ။' 
  },
  { 
    name: 'ရာဇ (Yaza - Royal Dignity & Wisdom)', 
    meaning: 'ရာဇဌာန - မြင့်မြတ်သော ဂုဏ်သိက္ခာ၊ ဉာဏ်ပညာနှင့် တည်ကြည်မှု',
    desc: 'အေးဆေးတည်ငြိမ်ပြီး အရာရာကို ရင့်ကျက်စွာ ဆင်ခြင်ဆုံးဖြတ်နိုင်သူ။ လူအများ၏ လေးစားယုံကြည်မှုကို အလွယ်တကူ ရရှိပြီး သြဇာတိက္ကမ ကြီးမားသူ။' 
  },
  { 
    name: 'မရဏ (Marana - Resilience & Inner Mystery)', 
    meaning: 'မရဏဌာန - ကြံ့ကြံ့ခံနိုင်စွမ်း၊ နက်ရှိုင်းသော စိတ်ဓာတ်နှင့် လျှို့ဝှက်သစ္စာ',
    desc: 'မည်သည့် အခက်အခဲနှင့် ကြုံတွေ့ရစေကာမူ စိတ်ဓာတ်မကျဘဲ နောက်ဆုံးအထိ ရင်ဆိုင်ကျော်လွှားနိုင်သူ။ သစ္စာတရားကို အသက်တမျှ တန်ဖိုးထားသော မိတ်ဆွေစစ်။' 
  }
];

export function getMahaboteInfo(dateString) {
  const date = parseLocalDate(dateString);
  const year = date.getFullYear();
  const dayIndex = date.getDay();
  const planetInfo = BURMESE_DAY_PLANETS[dayIndex] || BURMESE_DAY_PLANETS[0];

  const meYear = year - 638;
  let houseIndex = (meYear - dayIndex) % 7;
  if (houseIndex < 0) houseIndex += 7;

  return {
    dayIndex,
    dayName: planetInfo.dayEn,
    dayMm: planetInfo.dayMm,
    planet: planetInfo.planet,
    symbol: planetInfo.symbol,
    element: planetInfo.element,
    direction: planetInfo.direction,
    house: MAHABOTE_HOUSES[houseIndex]
  };
}

// =========================================================
// 3. CHINESE ZODIAC (Solar Term Lichun Feb 4 Boundary)
// =========================================================
export const CHINESE_ANIMALS = [
  { animal: 'Rat', animalMm: 'ကြွက် (Rat)', trineGroup: 'Water Trine', trait: 'ဉာဏ်ရည်ထက်မြက်၊ လျင်မြန်ပါးနပ်' },
  { animal: 'Ox', animalMm: 'နွား (Ox)', trineGroup: 'Metal Trine', trait: 'တည်ကြည်ခိုင်မာ၊ စိတ်ချရသော အားကိုးရာ' },
  { animal: 'Tiger', animalMm: 'ကျား (Tiger)', trineGroup: 'Fire Trine', trait: 'ရဲရင့်ပြတ်သား၊ စွန့်စားတီထွင်' },
  { animal: 'Rabbit', animalMm: 'ယုန် (Rabbit)', trineGroup: 'Wood Trine', trait: 'နူးညံ့သိမ်မွေ့၊ သံတမန်ဆန်' },
  { animal: 'Dragon', animalMm: 'နဂါး (Dragon)', trineGroup: 'Water Trine', trait: 'သြဇာတိက္ကမကြီးမား၊ ရည်မှန်းချက်မြင့်' },
  { animal: 'Snake', animalMm: 'မြွေ (Snake)', trineGroup: 'Metal Trine', trait: 'နက်နဲသိမ်မွေ့၊ ထိုးထွင်းဉာဏ်ကောင်း' },
  { animal: 'Horse', animalMm: 'မြင်း (Horse)', trineGroup: 'Fire Trine', trait: 'လွတ်လပ်တက်ကြွ၊ ခရီးသွားဝါသနာထုံ' },
  { animal: 'Goat', animalMm: 'ဆိတ် (Goat)', trineGroup: 'Wood Trine', trait: 'ကြင်နာသနားတတ်၊ အနုပညာဝါသနာပါ' },
  { animal: 'Monkey', animalMm: 'မျောက် (Monkey)', trineGroup: 'Water Trine', trait: 'ဖန်တီးနိုင်စွမ်းမြင့်၊ ဟာသဉာဏ်ရွှင်' },
  { animal: 'Rooster', animalMm: 'ကြက် (Rooster)', trineGroup: 'Metal Trine', trait: 'စေ့စပ်တိကျ၊ စည်းကမ်းကြီး' },
  { animal: 'Dog', animalMm: 'ခွေး (Dog)', trineGroup: 'Fire Trine', trait: 'သစ္စာစောင့်သိ၊ တရားမျှတမှုမြတ်နိုး' },
  { animal: 'Pig', animalMm: 'ဝက် (Pig)', trineGroup: 'Wood Trine', trait: 'ရိုးသားဖြောင့်မတ်၊ မေတ္တာစေတနာကြီး' }
];

export function getTrueChineseYear(dateString) {
  const date = parseLocalDate(dateString);
  let year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (month === 1 || (month === 2 && day < 4)) {
    year -= 1;
  }
  return year;
}

// 4. Chinese 5 Elements (Heavenly Stem Cycles)
export function getChineseElement(trueYear) {
  const d = Math.abs(trueYear) % 10;
  if (d === 0 || d === 1) return { key: 'Metal', en: 'Metal Element', mm: 'ရွှေ/သတ္တုဓာတ် (Metal)', nature: 'ပြတ်သား၊ ခိုင်မာ၊ တိကျ' };
  if (d === 2 || d === 3) return { key: 'Water', en: 'Water Element', mm: 'ရေဓာတ် (Water)', nature: 'နူးညံ့၊ ဉာဏ်ရည်မြင့်၊ လိုက်လျောညီထွေ' };
  if (d === 4 || d === 5) return { key: 'Wood', en: 'Wood Element', mm: 'သစ်သားဓာတ် (Wood)', nature: 'တိုးတက်၊ စိတ်ကူးသစ်ဖန်တီး၊ နွေးထွေး' };
  if (d === 6 || d === 7) return { key: 'Fire', en: 'Fire Element', mm: 'မီးဓာတ် (Fire)', nature: 'တက်ကြွ၊ စိတ်အားထက်သန်၊ တောက်ပ' };
  return { key: 'Earth', en: 'Earth Element', mm: 'မြေဓာတ် (Earth)', nature: 'တည်ငြိမ်၊ စိတ်ချရ၊ အခြေခံခိုင်မြဲ' };
}

// 5. Pythagorean Name Numerology
export function calculateDestinyNumber(name) {
  if (!name) return 1;
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');

  if (!cleanName) {
    let charSum = 0;
    for (let i = 0; i < name.length; i++) {
      charSum += name.charCodeAt(i);
    }
    const digit = charSum % 9;
    return digit === 0 ? 9 : digit;
  }

  let sum = 0;
  for (const char of cleanName) {
    let val = (char.charCodeAt(0) - 64) % 9;
    if (val === 0) val = 9;
    sum += val;
  }

  while (sum > 9) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

export const NUMEROLOGY_VIBRATIONS = {
  1: { archetype: 'The Pioneer (ခေါင်းဆောင်ရှေ့ပြေး)', triad: 'mind', trait: 'လွတ်လပ်ခြင်း၊ မူရင်းတီထွင်မှုနှင့် ခေါင်းဆောင်မှု' },
  2: { archetype: 'The Peacemaker (သဟဇာတဖန်တီးသူ)', triad: 'foundation', trait: 'သံတမန်ဆန်မှု၊ နားလည်စာနာမှုနှင့် ပူးပေါင်းဆောင်ရွက်မှု' },
  3: { archetype: 'The Creator (ဖန်တီးရှင်နှင့် ပျော်ရွှင်သူ)', triad: 'creation', trait: 'ဟာသဉာဏ်၊ အနုပညာဖော်ပြချက်နှင့် တောက်ပသော ဆွဲဆောင်မှု' },
  4: { archetype: 'The Builder (ခိုင်မာသောအုတ်မြစ်တည်ဆောက်သူ)', triad: 'foundation', trait: 'စည်းကမ်း၊ စနစ်တကျရှိမှုနှင့် သစ္စာရှိသော အလုပ်ကြိုးစားမှု' },
  5: { archetype: 'The Free Spirit (လွတ်လပ်သော ခရီးသည်)', triad: 'mind', trait: 'စွန့်စားမှု၊ လိုက်လျောညီထွေမှုနှင့် အပြောင်းအလဲကို ချစ်မြတ်နိုးမှု' },
  6: { archetype: 'The Nurturer (မေတ္တာဖြင့် ဂရုစိုက်သူ)', triad: 'creation', trait: 'မိသားစုတာဝန်၊ နွေးထွေးသော စောင့်ရှောက်မှုနှင့် အလှတရား' },
  7: { archetype: 'The Seeker of Truth (အမှန်တရားရှာဖွေသူ)', triad: 'mind', trait: 'နက်နဲသော ဉာဏ်ပညာ၊ အတွေးအခေါ်နှင့် ဝိညာဉ်ရေးရာ စူးစမ်းမှု' },
  8: { archetype: 'The Visionary Executive (သြဇာအာဏာနှင့် အောင်မြင်မှု)', triad: 'foundation', trait: 'စီမံခန့်ခွဲမှု၊ စီးပွားရေးအမြင်နှင့် ကြီးမားသော ပန်းတိုင်' },
  9: { archetype: 'The Humanitarian (လူသားဝါဒီ မေတ္တာရှင်)', triad: 'creation', trait: 'လောကကောင်းကျိုး၊ အနစ်နာခံမှုနှင့် မြင့်မြတ်သော ခွင့်လွှတ်ခြင်း' }
};

// Calculate All 5 Secret Metrics Comprehensive Object
export function calculateSecretMetrics(name, dateString) {
  if (!dateString) dateString = "1996-06-15";
  const date = parseLocalDate(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let westernObj = WESTERN_ZODIAC[0];
  for (const z of WESTERN_ZODIAC) {
    if (z.startMonth === z.endMonth) {
      if (month === z.startMonth && day >= z.startDay && day <= z.endDay) { westernObj = z; break; }
    } else if (z.startMonth > z.endMonth) {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) { westernObj = z; break; }
    } else {
      if ((month === z.startMonth && day >= z.startDay) || (month === z.endMonth && day <= z.endDay)) { westernObj = z; break; }
    }
  }

  const mahaboteInfo = getMahaboteInfo(dateString);
  const trueYear = getTrueChineseYear(dateString);
  const animalIdx = Math.abs((trueYear - 4) % 12);
  const animalObj = CHINESE_ANIMALS[animalIdx] || CHINESE_ANIMALS[0];
  const elementObj = getChineseElement(trueYear);
  const destinyNumber = calculateDestinyNumber(name);
  const destinyInfo = NUMEROLOGY_VIBRATIONS[destinyNumber] || NUMEROLOGY_VIBRATIONS[1];

  return {
    western: westernObj.nameEn,
    westernMm: westernObj.nameMm,
    westernElement: westernObj.element,
    westernModality: westernObj.modality,
    westernRuler: westernObj.ruler,

    dayIndex: mahaboteInfo.dayIndex,
    mahaboteDay: mahaboteInfo.dayName,
    mahaboteDayMm: mahaboteInfo.dayMm,
    mahabotePlanet: mahaboteInfo.planet,
    mahaboteSymbol: mahaboteInfo.symbol,
    mahaboteElement: mahaboteInfo.element,
    mahaboteDirection: mahaboteInfo.direction,
    mahaboteHouse: mahaboteInfo.house.name,
    mahaboteHouseDesc: mahaboteInfo.house.desc,

    animal: animalObj.animal,
    animalMm: animalObj.animalMm,
    animalTrine: animalObj.trineGroup,
    animalTrait: animalObj.trait,

    elementKey: elementObj.key,
    element: elementObj.en,
    elementMm: elementObj.mm,
    elementNature: elementObj.nature,

    destinyNumber,
    destinyArchetype: destinyInfo.archetype,
    destinyTriad: destinyInfo.triad,
    destinyTrait: destinyInfo.trait,
    dateString
  };
}

// =========================================================
// PRECISE 5-PILLAR ASTROLOGICAL SCORING ENGINE
// =========================================================

// 1. Western Zodiac Sub-score (20% weight)
export function getWesternSynergyScore(p1, p2) {
  const e1 = p1.westernElement;
  const e2 = p2.westernElement;
  let score = 78;

  // Elemental synergies
  if (e1 === e2) score = 91; // Same element: natural empathy
  else if ((e1 === 'Fire' && e2 === 'Air') || (e1 === 'Air' && e2 === 'Fire')) score = 96; // Passion & inspiration
  else if ((e1 === 'Earth' && e2 === 'Water') || (e1 === 'Water' && e2 === 'Earth')) score = 95; // Nourishing growth
  else if ((e1 === 'Fire' && e2 === 'Water') || (e1 === 'Water' && e2 === 'Fire')) score = 70; // Steamy friction
  else if ((e1 === 'Earth' && e2 === 'Air') || (e1 === 'Air' && e2 === 'Earth')) score = 74; // Practical vs idea clash
  else score = 80;

  // Modality balance
  if (p1.westernModality !== p2.westernModality) score += 3;
  return Math.min(98, Math.max(65, score));
}

// 2. Burmese Mahabote & Planetary Synergy Sub-score (25% weight)
export function getMahaboteSynergyScore(p1, p2) {
  const d1 = p1.dayIndex;
  const d2 = p2.dayIndex;
  let score = 78;

  // Traditional Myanmar Planetary Alliances (မဟာဘုတ် မိတ်ဖက်များ)
  // တနင်္ဂနွေ (0) + အင်္ဂါ (2) -> အိုဃ်းပုဒ် မိတ်
  // တနင်္လာ (1) + ဗုဒ္ဓဟူး (3) -> မင်္ဂလာ မိတ်
  // သောကြာ (5) + စနေ (6) -> သုသာန် မိတ်
  // ကြာသပတေး (4) + ရာဟု -> ဝေဒ မိတ်
  const isBestFriendPair = 
    (d1 === 0 && d2 === 2) || (d1 === 2 && d2 === 0) ||
    (d1 === 1 && d2 === 3) || (d1 === 3 && d2 === 1) ||
    (d1 === 5 && d2 === 6) || (d1 === 6 && d2 === 5);

  // Traditional Myanmar Planetary Enmities (မဟာဘုတ် ရန်ဘက်များ)
  // တနင်္ဂနွေ (0) + ကြာသပတေး (4) ရန်
  // တနင်္လာ (1) + သောကြာ (5) ရန်
  // အင်္ဂါ (2) + စနေ (6) ရန်
  const isEnmityPair = 
    (d1 === 0 && d2 === 4) || (d1 === 4 && d2 === 0) ||
    (d1 === 1 && d2 === 5) || (d1 === 5 && d2 === 1) ||
    (d1 === 2 && d2 === 6) || (d1 === 6 && d2 === 2);

  if (isBestFriendPair) score = 96;
  else if (isEnmityPair) score = 66;
  else if (d1 === d2) score = 88; // Same birthday
  else score = 82;

  // House alignment
  if (p1.mahaboteHouse === p2.mahaboteHouse) score += 3;
  return Math.min(98, Math.max(62, score));
}

// 3. Chinese Zodiac San He / Liu He Sub-score (20% weight)
export function getChineseAnimalSynergyScore(p1, p2) {
  const sanHeTrines = [
    ['Rat', 'Dragon', 'Monkey'],
    ['Ox', 'Snake', 'Rooster'],
    ['Tiger', 'Horse', 'Dog'],
    ['Rabbit', 'Goat', 'Pig']
  ];
  const liuHePairs = [
    ['Rat', 'Ox'], ['Tiger', 'Pig'], ['Rabbit', 'Dog'],
    ['Dragon', 'Rooster'], ['Snake', 'Monkey'], ['Horse', 'Goat']
  ];
  const liuChongConflicts = [
    ['Rat', 'Horse'], ['Ox', 'Goat'], ['Tiger', 'Monkey'],
    ['Rabbit', 'Rooster'], ['Dragon', 'Dog'], ['Snake', 'Pig']
  ];

  const a1 = p1.animal;
  const a2 = p2.animal;

  const isTrine = sanHeTrines.some(t => t.includes(a1) && t.includes(a2));
  const isLiuHe = liuHePairs.some(p => (p[0] === a1 && p[1] === a2) || (p[0] === a2 && p[1] === a1));
  const isChong = liuChongConflicts.some(p => (p[0] === a1 && p[1] === a2) || (p[0] === a2 && p[1] === a1));

  if (isTrine) return 98; // San He Trine
  if (isLiuHe) return 94; // Liu He Secret Friend
  if (isChong) return 64; // Liu Chong Direct Clash
  if (a1 === a2) return 86; // Same Animal
  return 80;
}

// 4. Chinese 5 Elements Cycle Sub-score (20% weight)
export function getFiveElementsSynergyScore(p1, p2) {
  const e1 = p1.elementKey || 'Wood';
  const e2 = p2.elementKey || 'Wood';

  // Generating Cycle (Sheng / အပြန်အလှန် ဖြစ်ထွန်းစေသောဓာတ်)
  const generatingPairs = [
    ['Wood', 'Fire'], ['Fire', 'Earth'], ['Earth', 'Metal'],
    ['Metal', 'Water'], ['Water', 'Wood']
  ];

  // Overcoming Cycle (Ke / အပြန်အလှန် ထိန်းချုပ်/ဖျက်ဆီးသောဓာတ်)
  const overcomingPairs = [
    ['Wood', 'Earth'], ['Earth', 'Water'], ['Water', 'Fire'],
    ['Fire', 'Metal'], ['Metal', 'Wood']
  ];

  const isGenerating = generatingPairs.some(p => (p[0] === e1 && p[1] === e2) || (p[0] === e2 && p[1] === e1));
  const isOvercoming = overcomingPairs.some(p => (p[0] === e1 && p[1] === e2) || (p[0] === e2 && p[1] === e1));

  if (isGenerating) return 96;
  if (e1 === e2) return 88;
  if (isOvercoming) return 68;
  return 82;
}

// 5. Pythagorean Destiny Numerology Sub-score (15% weight)
export function getNumerologySynergyScore(p1, p2) {
  const t1 = p1.destinyTriad || 'mind';
  const t2 = p2.destinyTriad || 'mind';
  const d1 = p1.destinyNumber;
  const d2 = p2.destinyNumber;

  if (t1 === t2 && d1 !== d2) return 96; // Same harmonic triad (1-5-7, 2-4-8, 3-6-9)
  if (d1 === d2) return 91; // Same destiny number
  const diff = Math.abs(d1 - d2);
  if (diff === 2 || diff === 4) return 86;
  if (diff === 1 || diff === 3) return 82;
  return 74;
}

// Combined Transparent Breakdown Metrics
export function calculateDetailedMetricsBreakdown(p1Secret, p2Secret, relType) {
  const zodiacScore = getWesternSynergyScore(p1Secret, p2Secret);
  const mahaboteScore = getMahaboteSynergyScore(p1Secret, p2Secret);
  const animalScore = getChineseAnimalSynergyScore(p1Secret, p2Secret);
  const elementScore = getFiveElementsSynergyScore(p1Secret, p2Secret);
  const numScore = getNumerologySynergyScore(p1Secret, p2Secret);

  return [
    { label: '✨ Western Zodiac Synergy (ရာသီခွင် ဓာတ်သဘော)', score: zodiacScore, color: 'from-rose-500 to-amber-500' },
    { label: '☀️ Mahabote Planetary Synergy (မဟာဘုတ် ၇ ဌာန စွမ်းအင်)', score: mahaboteScore, color: 'from-amber-500 to-orange-500' },
    { label: '🐉 Chinese Zodiac Trine (တရုတ် ၁၂ ရာသီ သဟဇာတ)', score: animalScore, color: 'from-red-500 to-rose-600' },
    { label: '🪵 5 Elements Cycle Balance (တရုတ် ၅ ပါး ဓာတ်သံသရာ)', score: elementScore, color: 'from-emerald-500 to-teal-500' },
    { label: '🔢 Numerology Destiny Resonance (ဂဏန်းဗေဒ အသံတုန်ခါမှု)', score: numScore, color: 'from-sky-500 to-indigo-600' }
  ];
}

// True Weighted Mathematical Chemistry Score Engine
export function calculateAlgorithmicScore(p1Secret, p2Secret, relType) {
  const zodiacScore = getWesternSynergyScore(p1Secret, p2Secret);
  const mahaboteScore = getMahaboteSynergyScore(p1Secret, p2Secret);
  const animalScore = getChineseAnimalSynergyScore(p1Secret, p2Secret);
  const elementScore = getFiveElementsSynergyScore(p1Secret, p2Secret);
  const numScore = getNumerologySynergyScore(p1Secret, p2Secret);

  // Exact weighted average
  let total = (zodiacScore * 0.20) + (mahaboteScore * 0.25) + (animalScore * 0.20) + (elementScore * 0.20) + (numScore * 0.15);

  if (relType === 'Friends') total += 1;
  return Math.min(99, Math.max(60, Math.round(total)));
}
