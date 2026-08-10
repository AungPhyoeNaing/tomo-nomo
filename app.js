/**
 * Tomo's Destiny Matcher - Logic Engine
 * Secretly calculates 5 metrics: Western Zodiac, Mahabote 7-House Planetary Position, True Chinese Animal, Chinese 5 Elements, & Numerology Destiny Number.
 * Features a deterministic compatibility engine for wildly diverse scores (62% - 98%).
 * Gemini responds as "Tomo" (တိုမို) in rich, detailed, massive, diverse, and casual/friendly Burmese!
 * Modern Full-Page Scroll Architecture with smooth section transitions, side dot indicators, scroll progress bar, and IntersectionObserver animations.
 */

// 1. Western Zodiac
const WESTERN_ZODIAC = [
    { key: 'capricorn', nameEn: 'Capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    { key: 'aquarius', nameEn: 'Aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { key: 'pisces', nameEn: 'Pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
    { key: 'aries', nameEn: 'Aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { key: 'taurus', nameEn: 'Taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { key: 'gemini', nameEn: 'Gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
    { key: 'cancer', nameEn: 'Cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
    { key: 'leo', nameEn: 'Leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { key: 'virgo', nameEn: 'Virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { key: 'libra', nameEn: 'Libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
    { key: 'scorpio', nameEn: 'Scorpio', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    { key: 'sagittarius', nameEn: 'Sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 }
];

// Helper: Parse date ISO string into Local Midnight
function parseLocalDate(dateString) {
    if (!dateString) return new Date();
    const parts = dateString.split('-').map(Number);
    if (parts.length < 3 || isNaN(parts[0])) return new Date();
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

// 2. Mahabote Day & True 7-House Calculation (Burmese Astrology)
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MAHABOTE_HOUSES = [
    { name: 'ဘင်္ဂ (Bhanga - Dynamic Transformation)', desc: 'Reinvention and dynamic energy' },
    { name: 'အထံ (Athan - Fame & Influence)', desc: 'Charisma, eloquence, and social magnet' },
    { name: 'သိုက် (Hsi-za - Treasure & Abundance)', desc: 'Warmth, generosity, and resourcefulness' },
    { name: 'ပုတိ (Puti - Impermanence & Intuition)', desc: 'Deep empathy, artistic soul, and sensitivity' },
    { name: 'အဓိပတိ (Chowda - Leadership & Power)', desc: 'Ambition, high standards, and protective drive' },
    { name: 'ရာဇ (Yaza - Royal Honor & Success)', desc: 'Dignity, natural wisdom, and leadership' },
    { name: 'မရဏ (Marana - Depth & Resilience)', desc: 'Secret intelligence, quiet endurance, and loyalty' }
];

function getMahaboteInfo(dateString) {
    const date = parseLocalDate(dateString);
    const year = date.getFullYear();
    const dayIndex = date.getDay();
    const dayName = DAYS_OF_WEEK[dayIndex];

    const meYear = year - 638;
    let houseIndex = (meYear - dayIndex) % 7;
    if (houseIndex < 0) houseIndex += 7;

    return {
        dayName,
        house: MAHABOTE_HOUSES[houseIndex]
    };
}

// 3. True Chinese Zodiac (Feb 4th Boundary Shift)
const CHINESE_ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
function getTrueChineseYear(dateString) {
    const date = parseLocalDate(dateString);
    let year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if (month === 1 || (month === 2 && day < 4)) {
        year -= 1;
    }
    return year;
}

// 4. Chinese 5 Elements
function getChineseElement(trueYear) {
    const d = Math.abs(trueYear) % 10;
    if (d === 0 || d === 1) return 'Metal Element';
    if (d === 2 || d === 3) return 'Water Element';
    if (d === 4 || d === 5) return 'Wood Element';
    if (d === 6 || d === 7) return 'Fire Element';
    return 'Earth Element';
}

// 5. Pythagorean Name Numerology
function calculateDestinyNumber(name) {
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

// Calculate All 5 Metrics
function calculateSecretMetrics(name, dateString) {
    if (!dateString) dateString = "1996-06-15";
    const date = parseLocalDate(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let western = WESTERN_ZODIAC[0].nameEn;
    for (const z of WESTERN_ZODIAC) {
        if (z.startMonth === z.endMonth) {
            if (month === z.startMonth && day >= z.startDay && day <= z.endDay) { western = z.nameEn; break; }
        } else if (z.startMonth > z.endMonth) {
            if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) { western = z.nameEn; break; }
        } else {
            if ((month === z.startMonth && day >= z.startDay) || (month === z.endMonth && day <= z.endDay)) { western = z.nameEn; break; }
        }
    }

    const mahaboteInfo = getMahaboteInfo(dateString);
    const trueYear = getTrueChineseYear(dateString);
    const animal = CHINESE_ANIMALS[Math.abs((trueYear - 4) % 12)];
    const element = getChineseElement(trueYear);
    const destinyNumber = calculateDestinyNumber(name);

    return {
        western,
        mahaboteDay: mahaboteInfo.dayName,
        mahaboteHouse: mahaboteInfo.house.name,
        animal,
        element,
        destinyNumber,
        dateString
    };
}

// Algorithmic Base Chemistry Score Engine
function calculateAlgorithmicScore(p1Secret, p2Secret, relType) {
    let score = 65;

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

    const a1 = p1Secret.animal;
    const a2 = p2Secret.animal;

    let isTrine = sanHeTrines.some(t => t.includes(a1) && t.includes(a2));
    let isHarmony = liuHePairs.some(p => (p[0] === a1 && p[1] === a2) || (p[0] === a2 && p[1] === a1));
    let isConflict = liuChongConflicts.some(p => (p[0] === a1 && p[1] === a2) || (p[0] === a2 && p[1] === a1));

    if (isHarmony) score += 12;
    else if (isTrine) score += 9;
    else if (isConflict) score -= 6;
    else score += 4;

    const e1 = p1Secret.element;
    const e2 = p2Secret.element;
    const generatingCycle = {
        'Wood Element': 'Fire Element',
        'Fire Element': 'Earth Element',
        'Earth Element': 'Metal Element',
        'Metal Element': 'Water Element',
        'Water Element': 'Wood Element'
    };

    if (e1 === e2) score += 7;
    else if (generatingCycle[e1] === e2 || generatingCycle[e2] === e1) score += 10;
    else score += 3;

    const d1 = p1Secret.destinyNumber;
    const d2 = p2Secret.destinyNumber;
    const dDiff = Math.abs(d1 - d2);

    if (d1 === d2) score += 8;
    else if (dDiff === 2 || dDiff === 4 || dDiff === 6) score += 6;
    else if (dDiff === 1 || dDiff === 3 || dDiff === 5) score += 4;
    else score += 2;

    if (p1Secret.mahaboteHouse === p2Secret.mahaboteHouse) score += 5;
    else score += 3;

    if (relType === 'Friends') score += 2;

    let seed = 0;
    const combinedStr = p1Secret.dateString + p2Secret.dateString;
    for (let i = 0; i < combinedStr.length; i++) {
        seed += combinedStr.charCodeAt(i);
    }
    const jitter = (seed % 9) - 4;
    score += jitter;

    return Math.min(98, Math.max(62, score));
}

// 5-Metric Breakdown Sub-scores
function calculateDetailedMetricsBreakdown(p1Secret, p2Secret, relType) {
    let zodiacScore = 75;
    const z1 = (p1Secret.western || '').toLowerCase();
    const z2 = (p2Secret.western || '').toLowerCase();
    if (z1 === z2) zodiacScore = 92;
    else zodiacScore = Math.min(98, 70 + ((calculateDestinyNumber(p1Secret.western + p2Secret.western) * 3) % 25));

    let mahaboteScore = 70;
    if (p1Secret.mahaboteHouse === p2Secret.mahaboteHouse) mahaboteScore = 94;
    else if (p1Secret.mahaboteDay === p2Secret.mahaboteDay) mahaboteScore = 88;
    else mahaboteScore = Math.min(98, 68 + ((p1Secret.destinyNumber + p2Secret.destinyNumber) * 4) % 28);

    let animalScore = 72;
    const a1 = p1Secret.animal;
    const a2 = p2Secret.animal;
    const trines = [['Rat','Dragon','Monkey'], ['Ox','Snake','Rooster'], ['Tiger','Horse','Dog'], ['Rabbit','Goat','Pig']];
    const isTrine = trines.some(t => t.includes(a1) && t.includes(a2));
    if (isTrine) animalScore = 96;
    else animalScore = Math.min(98, 65 + ((a1.length + a2.length) * 3) % 26);

    let elementScore = 78;
    if (p1Secret.element === p2Secret.element) elementScore = 88;
    else elementScore = Math.min(98, 72 + ((p1Secret.destinyNumber * 5) % 24));

    let numScore = 80;
    const dDiff = Math.abs(p1Secret.destinyNumber - p2Secret.destinyNumber);
    if (dDiff === 0) numScore = 98;
    else if (dDiff === 2 || dDiff === 4) numScore = 92;
    else numScore = Math.min(95, 68 + (9 - dDiff) * 3);

    return [
        { label: '✨ Western Zodiac Synergy', score: zodiacScore, color: 'from-pink-400 to-rose-500' },
        { label: '☀️ Mahabote Planetary Synergy', score: mahaboteScore, color: 'from-amber-400 to-orange-500' },
        { label: '🐉 Chinese Zodiac Trine (San He)', score: animalScore, color: 'from-purple-400 to-indigo-500' },
        { label: '🪵 5 Elements Cycle Balance', score: elementScore, color: 'from-emerald-400 to-teal-500' },
        { label: '🔢 Numerology Destiny Resonance', score: numScore, color: 'from-cyan-400 to-blue-500' }
    ];
}

// Standard Demo Results
const DEMO_RESULT = {
    tomo_deep_reading_p1: "Tomo ရဲ့ အသေးစိတ် ဇာတာနှင့် စိတ်ဓာတ်ပိုင်းဆိုင်ရာ သုံးသပ်ချက်အရ မင်းမင်း ဟာ ပြင်ပ ကမ္ဘာမှာ ပေါင်းသင်းဆက်ဆံရေး အလွန်ပြေပြစ်ပြီး တက်ကြွလှုပ်ရှားသော စွမ်းအင် (Dynamic Energy) ကို ပိုင်ဆိုင်ထားသူ ဖြစ်ပါတယ်နော်။ လူအများကြားမှာ ထင်ရှားပေါ်လွင်ပြီး၊ မည်သည့် အခြေအနေမဆို အဆင်ပြေအောင် ချက်ချင်း လိုက်လျောညီထွေ စကားပြောဆိုနိုင်စွမ်း ရှိတာကို Tomo အံ့ဩစွာ တွေ့ရှိရပါတယ် 🌸။ \n\nသို့သော်လည်း စိတ်၏ နက်ရှိုင်းသော အတွင်းပိုင်းမှာတော့ မင်းမင်း ဟာ အလွန် စနစ်တကျ စဉ်းစားတတ်သူ ဖြစ်ပြီး၊ မိမိ အားကိုးရသူများ သို့မဟုတ် ချစ်ခင်ရသူများ ရှေ့မှာသာ မိမိ၏ ရင်တွင်းဖြစ် ခံစားချက်အမှန်များနှင့် စိုးရိမ်မှုများကို ဖွင့်ဟပြသတတ်သူ ဖြစ်ပါတယ်။ မဟာဘုတ် ဓာတ်စက်နှင့် နာမည်ဂဏန်း တွဲဖက်မှုအရ ပရောဂျက်အသစ်များ၊ စိတ်ကူးဆန်းများကို စတင်ဖန်တီးရာမှာ ရဲရင့်သော ဦးဆောင်သူ ဖြစ်သလို၊ အမှန်တရားနှင့် သစ္စာတရားကို အလွန် တန်ဖိုးထားသူ ဖြစ်ပါတယ်။",
    
    tomo_deep_reading_p2: "အောင်အောင် ရဲ့ စရိုက်နက်ရှိုင်းမှုကို Tomo လေ့လာလိုက်တဲ့အခါ တည်ငြိမ်အေးဆေးပြီး အရာရာကို မြော်မြင်ဆင်ခြင်နိုင်သော စိတ်အေးချမ်းမှု (Inner Peace) ကို တွေ့ရပါတယ်နော်။ ပြင်ပမှ ကြည့်လျှင် စကားနည်းသူ သို့မဟုတ် အေးဆေးလွန်းသူဟု ထင်ရသော်လည်း၊ အမှန်တကယ်မှာ အရာရာကို အသေးစိတ် စေတနာထား စောင့်ကြည့်လေ့လာနေတတ်သော ပါးနပ် perceptive သော သဘာဝရှိသူ ဖြစ်ပါတယ် 🌸။ \n\nမဟာဘုတ် ရာဇ/သိုက် ဓာတ်စက်နှင့် တကယ့် တရုတ် ၅ ပါး ဓာတ်ပေါင်းစပ်မှုအရ အောင်အောင် ဟာ အခက်အခဲ ရင်ဆိုင်ရချိန်များမှာ စိတ်ဓာတ် တင်းမာစွာဖြင့် အေးဆေးစွာ ဖြေရှင်းနိုင်သော အခြေခံအုတ်မြစ် (Solid Foundation) ပိုင်ရှင် ဖြစ်ပါတယ်။",
    
    chemistry_score: 94,
    relationship_title: "တစ်ယောက်ရဲ့ အဆိုးကို တစ်ယောက်က အေးဆေး ညှိပေးနိုင်တဲ့ အံဝင်ခွင်ကျ ရင်းနှီးမှု 💖✨",
    
    tomo_dynamic_insight: "Tomo ရဲ့ နက်ရှိုင်းသော စွမ်းအင်ပေါင်းစပ်မှု သုံးသပ်ချက်အရ မင်းတို့ နှစ်ယောက်၏ ရေစက်ဟာ အလွန်ပင် ထူးခြားဆန်းကြယ်စွာ အံဝင်ခွင်ကျ ဖြစ်နေပါတယ်နော်။ မင်းမင်း ရဲ့ တက်ကြွဆန်းသစ်သော စွမ်းအင် (Active Energy) နှင့် အောင်အောင် ရဲ့ တည်ငြိမ်မျှတသော ဓာတ် (Grounded Energy) တို့ ပေါင်းစပ်သွားသည့်အခါ ယင်းသည် သဘာဝတ္ထအရ ရေနှင့် လေ၊ မြေနှင့် မိုးကဲ့သို့ တစ်ယောက်ကိုတစ်ယောက် အပြည့်အဝ ဖြည့်ဆည်းပေးသည့် ပေါင်းစပ်မှု ဖြစ်လာပါတယ် 🌸။",
    
    tomo_strengths: [
        "တစ်ယောက်နှင့်တစ်ယောက် အပြန်အလှန် ယုံကြည်မှု အပြည့်အဝဖြင့် ပွင့်ပွင့်လင်းလင်း တိုင်ပင်ဆွေးနွေးနိုင်ခြင်း",
        "မင်းမင်း ရဲ့ စိတ်ကူးသစ်များကို အောင်အောင် က အပြုသဘောဆောင်ကာ စနစ်တကျ ပံ့ပိုးပေးနိုင်ခြင်း",
        "ခက်ခဲသော စိန်ခေါ်မှုများတွင် တစ်ဦး၏ အားနည်းချက်ကို အခြားတစ်ဦးက ဖြည့်ဆည်းပေးနိုင်ခြင်း"
    ],
    tomo_challenges: [
        "စကားပြောဆိုရာတွင် တစ်ယောက်စိတ်ထဲ မကျေနပ်ချက်များ ရှိပါက ချက်ချင်း ပွင့်ပွင့်လင်းလင်း တိုင်ပင်ပါ",
        "အလုပ်များပြားချိန်တွင် တစ်ယောက်ကိုတစ်ယောက် ဂရုစိုက်မှု မလျော့ပါးစေရန် သီးသန့် အချိန်ပေးပါ"
    ],
    tomo_secret_advice: "Tomo ရဲ့ အထူး လျှို့ဝှက် အကြံပြုချက်ကတော့ မင်းတို့နှစ်ယောက်၏ ဆက်ဆံရေးဟာ အလွန်ပင် ရှားပါးလှသော စွမ်းအင် ညီညွတ်မှု ရှိနေပါတယ်နော် 🌸။ ဤနားလည်မှုနှင့် အပြန်အလှန် လေးစားမှုကို အစဉ်အမြဲ ထိန်းသိမ်းသွားပါက မင်းတို့နှစ်ယောက်၏ ဆက်ဆံရေးဟာ ထာဝရ ရွှင်လန်းခိုင်မြဲနေမှာပါ 👑💖"
};

const PLAYFUL_DEMO_RESULT = {
    tomo_deep_reading_p1: "ဟဲဟဲ 😜! မင်းမင်း ရဲ့ စရိုက်လေးကို တိုမို ကွန်ပျူတာထက်တောင် မြန်အောင် စစ်ဆေးလိုက်ပြီနော် 🌸! မင်းမင်း က အပြင်မှာ ကြည့်ရင် လူအများနဲ့ တကျက်ကျက် ရယ်မောပြီး ခေါင်းဆောင်လုပ်ရတာ ကြိုက်တဲ့ ပုံစံမျိုးပေမဲ့၊ တကယ်တော့ ရင်ထဲမှာ ကလေးလေးလိုပဲ အလိုက်သိတာ ခံချင်တာ တိုမို အကုန် ရိပ်မိတယ်နော် 🤭။",
    tomo_deep_reading_p2: "ကဲ... အောင်အောင် ရဲ့ အလှည့် ရောက်ပြီ 🌸! အောင်အောင် ကတော့ အေးဆေးတည်ငြိမ်တဲ့ 'ဆရာကြီး' ပုံစံလေးနဲ့ အနီးအနားကလူတွေကို စောင့်ကြည့်နေတတ်သူပေါ့ 😜။ စကားအများကြီး မပြောပေမဲ့ မင်းမင်း စိတ်ကူးယဉ်သမျှ အလွဲတွေကို နောက်ကနေ အေးဆေး ထိန်းပေးနေရတဲ့ မရှိမဖြစ် ငြိမ်သက်သူလေးပါ 💖။",
    chemistry_score: 94,
    relationship_title: "တစ်ယောက်က ပရမ်းပတာလုပ်ရင် အခြားတစ်ယောက်က အေးဆေး ထိန်းပေးမယ့် အမိုက်စား စုံတွဲ 😜💖",
    tomo_dynamic_insight: "တိုမို ကြည့်လိုက်တာနဲ့ နှစ်ယောက်သား ဓာတ်ကျပုံကတော့ တကယ်ကို ရယ်ချင်စရာကောင်းလောက်အောင် အံဝင်ခွင်ကျ ဖြစ်နေတာပဲ 🌸! မင်းမင်း က ရှေ့ကနေ မီးပွင့်မတတ် တက်ကြွနေချိန်မှာ အောင်အောင် က နောက်ကနေ 'အေးဆေးလုပ်ပါဦး' ဆိုပြီး ရေအေးအေးလေးနဲ့ ပက်ပေးသလို ပေါင်းစပ်သွားတာမျိုး ပေါ့ 🤭။",
    tomo_strengths: [
        "တစ်ယောက်စကား တစ်ယောက် ချက်ချင်း သဘောပေါက်ပြီး အူတက်အောင် ရယ်မောနိုင်ခြင်း 😜",
        "မင်းမင်း ရဲ့ စိတ်ကူးများကို အောင်အောင် က အေးဆေးစွာ အားပေးပံ့ပိုးပေးခြင်း 🌸"
    ],
    tomo_challenges: [
        "စကားပြောရင် အပြိုင်အဆိုင် အနိုင်လိုချင်စိတ်လေးတွေ လျှော့ပါနော် 🤭"
    ],
    tomo_secret_advice: "တိုမို ရဲ့ ချစ်စရာ အကြံပေးချက်ကတော့... နှစ်ယောက်သား အမြဲတမ်း ဤအတိုင်း ရယ်ရယ်မောမော စနောက်ရင်း ချစ်သွားကြပါနော် 🌸! 😜💖"
};

// Global Page Navigation Helper
function jumpToPage(pageId) {
    const targetElement = document.getElementById(pageId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
    }
}

// DOM Handler
document.addEventListener('DOMContentLoaded', () => {
    const p1NameInput = document.getElementById('p1Name');
    const p1DobInput = document.getElementById('p1Dob');
    const p2NameInput = document.getElementById('p2Name');
    const p2DobInput = document.getElementById('p2Dob');

    const relTypeSelect = document.getElementById('relTypeSelect');
    const tomoMoodSelect = document.getElementById('tomoMoodSelect');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    const apiKeyStatusNav = document.getElementById('apiKeyStatusNav');
    const calculateBtn = document.getElementById('calculateBtn');
    const demoBtn = document.getElementById('demoBtn');
    const downloadCardBtn = document.getElementById('downloadCardBtn');
    const toggleApiKeyVisibility = document.getElementById('toggleApiKeyVisibility');
    const presetDemoBtn = document.getElementById('presetDemoBtn');
    const presetResetBtn = document.getElementById('presetResetBtn');

    const loadingOverlay = document.getElementById('loadingOverlay');
    const mainScrollContainer = document.getElementById('mainScrollContainer');
    const topProgressBar = document.getElementById('topProgressBar');

    // Restrict Date pickers to today's date max
    const todayISO = new Date().toISOString().split('T')[0];
    if (p1DobInput) p1DobInput.max = todayISO;
    if (p2DobInput) p2DobInput.max = todayISO;

    // Default dates
    if (p1DobInput) p1DobInput.value = "1996-06-15";
    if (p2DobInput) p2DobInput.value = "1996-10-08";

    // 1. Cosmic Dark Mode Switcher
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeToggleIcon = document.getElementById('themeToggleIcon');
    const themeToggleText = document.getElementById('themeToggleText');

    function initTheme() {
        const savedTheme = localStorage.getItem('tomo_theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark');
            if (themeToggleIcon) themeToggleIcon.textContent = '☀️';
            if (themeToggleText) themeToggleText.textContent = 'Light Mode';
        } else {
            document.body.classList.remove('dark');
            if (themeToggleIcon) themeToggleIcon.textContent = '🌌';
            if (themeToggleText) themeToggleText.textContent = 'Cosmic Mode';
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            const isDark = document.body.classList.contains('dark');
            localStorage.setItem('tomo_theme', isDark ? 'dark' : 'light');
            if (themeToggleIcon) themeToggleIcon.textContent = isDark ? '☀️' : '🌌';
            if (themeToggleText) themeToggleText.textContent = isDark ? 'Light Mode' : 'Cosmic Mode';
            showToast(isDark ? '🌌 Switched to Cosmic Dark Mode' : '🌸 Switched to Soft Light Mode', 'info');
        });
    }
    initTheme();

    // 2. Full-Page Scroll Tracker & IntersectionObserver
    const pages = document.querySelectorAll('.page-section');
    const sideDots = document.querySelectorAll('.side-nav-dot');

    function updateActivePageDot(activeId) {
        const idIndexMap = {
            'page-hero': 0,
            'page-inputs': 1,
            'page-gauge': 2,
            'page-readings': 3,
            'page-synergy': 4
        };
        const activeIndex = idIndexMap[activeId] !== undefined ? idIndexMap[activeId] : 0;
        sideDots.forEach((dot, idx) => {
            if (idx === activeIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Scroll Progress Bar Tracker
    if (mainScrollContainer) {
        mainScrollContainer.addEventListener('scroll', () => {
            const scrollTop = mainScrollContainer.scrollTop;
            const scrollHeight = mainScrollContainer.scrollHeight - mainScrollContainer.clientHeight;
            const progress = (scrollTop / (scrollHeight || 1)) * 100;
            if (topProgressBar) topProgressBar.style.width = `${progress}%`;
        });
    }

    // IntersectionObserver for entrance reveal & side dots
    const observerOptions = {
        root: mainScrollContainer,
        threshold: 0.4
    };

    const pageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateActivePageDot(entry.target.id);
                const revealElems = entry.target.querySelectorAll('.reveal-on-scroll');
                revealElems.forEach(el => el.classList.add('revealed'));
            }
        });
    }, observerOptions);

    pages.forEach(page => pageObserver.observe(page));

    // 3. Real-Time Astrological Live Badges System
    function getWesternEmoji(signKey) {
        const emojis = {
            aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
            leo: '<ctrl42>', virgo: '♍', libra: '♎', scorpio: '♏',
            sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
        };
        return emojis[signKey] || '✨';
    }

    function getAnimalEmoji(animal) {
        const emojis = {
            Rat: '🐀', Ox: '🐂', Tiger: '🐅', Rabbit: '🐇',
            Dragon: '🐉', Snake: '🐍', Horse: '🐎', Goat: '🐐',
            Monkey: '🐒', Rooster: '🐓', Dog: '🐕', Pig: '🐖'
        };
        return emojis[animal] || '🐾';
    }

    function getElementEmoji(element) {
        if (element.includes('Wood')) return '🪵';
        if (element.includes('Fire')) return '🔥';
        if (element.includes('Earth')) return '⛰️';
        if (element.includes('Metal')) return '🪙';
        return '💧';
    }

    function updateLiveBadges() {
        const p1Name = p1NameInput ? p1NameInput.value.trim() || 'Person 1' : 'Person 1';
        const p1Dob = p1DobInput ? p1DobInput.value || '1996-06-15' : '1996-06-15';
        const p2Name = p2NameInput ? p2NameInput.value.trim() || 'Person 2' : 'Person 2';
        const p2Dob = p2DobInput ? p2DobInput.value || '1996-10-08' : '1996-10-08';

        const p1Secret = calculateSecretMetrics(p1Name, p1Dob);
        const p2Secret = calculateSecretMetrics(p2Name, p2Dob);

        renderBadges('p1LiveBadges', p1Secret);
        renderBadges('p2LiveBadges', p2Secret);
    }

    function renderBadges(containerId, secret) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const wSignKey = (secret.western || '').toLowerCase();
        const wEmoji = getWesternEmoji(wSignKey);
        const aEmoji = getAnimalEmoji(secret.animal);
        const eEmoji = getElementEmoji(secret.element);
        const houseShort = (secret.mahaboteHouse || '').split(' ')[0] || secret.mahaboteHouse;

        container.innerHTML = `
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100/90 dark:bg-slate-800 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-slate-700 flex items-center gap-1">
                ${wEmoji} ${secret.western}
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/90 dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-slate-700 flex items-center gap-1">
                ☀️ ${secret.mahaboteDay} (${houseShort})
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100/90 dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-slate-700 flex items-center gap-1">
                ${aEmoji} ${secret.animal} · ${eEmoji} ${secret.element.replace(' Element', '')}
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/90 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 flex items-center gap-1">
                🔢 Destiny #${secret.destinyNumber}
            </span>
        `;
    }

    [p1NameInput, p1DobInput, p2NameInput, p2DobInput].forEach(elem => {
        if (elem) {
            elem.addEventListener('input', updateLiveBadges);
            elem.addEventListener('change', updateLiveBadges);
        }
    });
    updateLiveBadges();

    // 4. Dynamic Tomo Hero Avatar Reactions
    function updateTomoAvatar(mood, score) {
        const tomoHeroImg = document.getElementById('tomoHeroImg');
        if (!tomoHeroImg) return;

        if (mood === 'Playful') {
            tomoHeroImg.src = 'tomo_3d_wave.jpg';
        } else if (mood === 'Mystic') {
            tomoHeroImg.src = 'tomo_3d_reading.jpg';
        } else if (score && score > 90) {
            tomoHeroImg.src = 'tomo_3d_avatar.jpg';
        } else {
            tomoHeroImg.src = 'tomo-girl.webp';
        }
    }

    // Segmented Pill Tabs for Relationship Mode
    const modeTabs = document.querySelectorAll('.mode-tab-btn');
    modeTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            modeTabs.forEach(t => {
                t.className = "mode-tab-btn py-2 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-pink-600 transition-all cursor-pointer";
            });
            btn.className = "mode-tab-btn tomo-chip-3d py-2 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-pink-700 dark:text-pink-300 transition-all cursor-pointer";
            if (relTypeSelect) relTypeSelect.value = btn.dataset.value;
        });
    });

    // Segmented Pill Tabs for Persona Mood
    const moodTabs = document.querySelectorAll('.mood-tab-btn');
    moodTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            moodTabs.forEach(t => {
                t.className = "mood-tab-btn py-1.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-purple-700 transition-all cursor-pointer";
            });
            btn.className = "mood-tab-btn tomo-chip-3d py-1.5 px-2 rounded-xl text-[11px] sm:text-xs font-extrabold text-purple-700 dark:text-purple-300 transition-all cursor-pointer";
            if (tomoMoodSelect) tomoMoodSelect.value = btn.dataset.value;
            updateTomoAvatar(btn.dataset.value);
        });
    });

    // Toggle API Key Password Visibility
    if (toggleApiKeyVisibility) {
        toggleApiKeyVisibility.addEventListener('click', () => {
            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                toggleApiKeyVisibility.textContent = '🙈';
            } else {
                apiKeyInput.type = 'password';
                toggleApiKeyVisibility.textContent = '👁️';
            }
        });
    }

    // Load API Key from LocalStorage
    const savedApiKey = localStorage.getItem('tomo_gemini_key');
    if (savedApiKey && apiKeyInput) {
        apiKeyInput.value = savedApiKey;
        updateKeyStatus(true);
    } else {
        updateKeyStatus(false);
    }

    // Save API key on change
    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', () => {
            const val = apiKeyInput.value.trim();
            if (val) {
                localStorage.setItem('tomo_gemini_key', val);
                updateKeyStatus(true);
            } else {
                localStorage.removeItem('tomo_gemini_key');
                updateKeyStatus(false);
            }
        });
    }

    function updateKeyStatus(isReady) {
        if (isReady) {
            if (apiKeyStatus) {
                apiKeyStatus.textContent = "🌸 အဆင်သင့်";
                apiKeyStatus.className = "text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 text-[10px]";
            }
            if (apiKeyStatusNav) {
                apiKeyStatusNav.textContent = "🌸 Key Ready";
                apiKeyStatusNav.className = "px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-extrabold";
            }
        } else {
            if (apiKeyStatus) {
                apiKeyStatus.textContent = "🔑 သော့ချက် လိုအပ်သည်";
                apiKeyStatus.className = "text-amber-600 font-bold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 text-[10px]";
            }
            if (apiKeyStatusNav) {
                apiKeyStatusNav.textContent = "🔑 Add Key";
                apiKeyStatusNav.className = "px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-700 text-xs font-extrabold";
            }
        }
    }

    // Preset Chips Handlers
    if (presetDemoBtn) {
        presetDemoBtn.addEventListener('click', () => {
            if (p1NameInput) p1NameInput.value = "မင်းမင်း 🎀";
            if (p2NameInput) p2NameInput.value = "အောင်အောင် 🌸";
            if (p1DobInput) p1DobInput.value = "1996-06-15";
            if (p2DobInput) p2DobInput.value = "1996-10-08";
            updateLiveBadges();
            showToast("🌸 Preset Filled: မင်းမင်း & အောင်အောင်", "info");
        });
    }

    if (presetResetBtn) {
        presetResetBtn.addEventListener('click', () => {
            if (p1NameInput) p1NameInput.value = "";
            if (p2NameInput) p2NameInput.value = "";
            updateLiveBadges();
            jumpToPage('page-hero');
            showToast("↺ Form reset to empty", "info");
        });
    }

    // Demo Button
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            const p1Name = p1NameInput ? p1NameInput.value.trim() || "မင်းမင်း 🎀" : "မင်းမင်း 🎀";
            const p2Name = p2NameInput ? p2NameInput.value.trim() || "အောင်အောင် 🌸" : "အောင်အောင် 🌸";
            if (p1NameInput) p1NameInput.value = p1Name;
            if (p2NameInput) p2NameInput.value = p2Name;
            updateLiveBadges();

            const p1Secret = calculateSecretMetrics(p1Name, p1DobInput ? p1DobInput.value || "1996-06-15" : "1996-06-15");
            const p2Secret = calculateSecretMetrics(p2Name, p2DobInput ? p2DobInput.value || "1996-10-08" : "1996-10-08");
            const relType = relTypeSelect ? relTypeSelect.value : 'Friends';
            const demoScore = calculateAlgorithmicScore(p1Secret, p2Secret, relType);
            
            const selectedMood = tomoMoodSelect ? tomoMoodSelect.value : 'Sweet';
            const baseDemo = selectedMood === 'Playful' ? PLAYFUL_DEMO_RESULT : DEMO_RESULT;
            const demoData = { ...baseDemo, chemistry_score: demoScore };

            triggerTomoLoading(() => {
                renderResults(demoData, p1Name, p2Name, relType, p1Secret, p2Secret);
                updateTomoAvatar(selectedMood, demoScore);
                jumpToPage('page-gauge');
                showToast("✨ Tomo Demo Reading generated!", "success");
            });
        });
    }

    // Ask Tomo Button
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            const p1Name = p1NameInput ? p1NameInput.value.trim() || "ပထမ လူသားလေး" : "ပထမ လူသားလေး";
            const p2Name = p2NameInput ? p2NameInput.value.trim() || "ဒုတိယ လူသားလေး" : "ဒုတိယ လူသားလေး";
            const p1Secret = calculateSecretMetrics(p1Name, p1DobInput ? p1DobInput.value : "1996-06-15");
            const p2Secret = calculateSecretMetrics(p2Name, p2DobInput ? p2DobInput.value : "1996-10-08");
            const relType = relTypeSelect ? relTypeSelect.value : 'Friends';
            const mood = tomoMoodSelect ? tomoMoodSelect.value : 'Sweet';
            const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';

            const algorithmicScore = calculateAlgorithmicScore(p1Secret, p2Secret, relType);

            if (!apiKey) {
                showToast("ကျေးဇူးပြု၍ GEMINI API Key ကို ထည့်သွင်းပေးပါ။ (Please enter your API Key)", "warning");
                if (apiKeyInput) apiKeyInput.focus();
                return;
            }

            triggerTomoLoading(async () => {
                try {
                    const data = await fetchTomoDestinyReading(p1Name, p1Secret, p2Name, p2Secret, relType, mood, algorithmicScore, apiKey);
                    renderResults(data, p1Name, p2Name, relType, p1Secret, p2Secret);
                    updateTomoAvatar(mood, data.chemistry_score || algorithmicScore);
                    jumpToPage('page-gauge');
                    showToast("🌸 Tomo's destiny reading complete!", "success");
                } catch (err) {
                    console.error(err);
                    showToast(`API Error: ${err.message}. Showing Demo Reading!`, "warning");
                    const baseDemo = mood === 'Playful' ? PLAYFUL_DEMO_RESULT : DEMO_RESULT;
                    const fallbackData = { ...baseDemo, chemistry_score: algorithmicScore };
                    renderResults(fallbackData, p1Name, p2Name, relType, p1Secret, p2Secret);
                    updateTomoAvatar(mood, algorithmicScore);
                    jumpToPage('page-gauge');
                }
            });
        });
    }

    // Download Card Button
    if (downloadCardBtn) {
        downloadCardBtn.addEventListener('click', () => {
            downloadDestinyCard();
            showToast("📸 Destiny Card downloaded!", "success");
        });
    }

    // Loading Overlay Trigger
    function triggerTomoLoading(callback) {
        if (!loadingOverlay) return;
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.classList.add('flex');

        setTimeout(async () => {
            if (callback) await callback();
            loadingOverlay.classList.add('hidden');
            loadingOverlay.classList.remove('flex');
        }, 3500);
    }

    // Call Gemini 3.1 Flash Lite API
    async function fetchTomoDestinyReading(p1Name, p1Secret, p2Name, p2Secret, relType, mood, algorithmicScore, apiKey) {
        const model = "gemini-3.1-flash-lite";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        let moodInstruction = "Speak in an extremely natural, sweet, bubbly, warm, casual, and friendly Burmese tone.";
        if (mood === 'Playful') {
            moodInstruction = "You are Tomo in your EXTREMELY FRIENDLY, CUTE, FUNNY, PLAYFUL, and SASSY mode in Burmese!";
        } else if (mood === 'Mystic') {
            moodInstruction = "Speak in a wise, deep, poetic yet approachable and casual Burmese tone.";
        }

        const promptText = `
        Inner Calculated Data: Mode ${relType}, Mood ${mood}, Score ${algorithmicScore}%
        Person 1 (${p1Name}): ${p1Secret.western}, ${p1Secret.mahaboteDay}, ${p1Secret.animal}, ${p1Secret.element}, Destiny #${p1Secret.destinyNumber}
        Person 2 (${p2Name}): ${p2Secret.western}, ${p2Secret.mahaboteDay}, ${p2Secret.animal}, ${p2Secret.element}, Destiny #${p2Secret.destinyNumber}

        Generate detailed relationship reading in Burmese JSON.
        `;

        const payload = {
            contents: [{ parts: [{ text: promptText }] }],
            systemInstruction: {
                parts: [{
                    text: `You are 'Tomo' (တိုမို), an AI virtual girl analyzing relationships in Burmese. ${moodInstruction}`
                }]
            },
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        tomo_deep_reading_p1: { type: "STRING" },
                        tomo_deep_reading_p2: { type: "STRING" },
                        chemistry_score: { type: "NUMBER" },
                        relationship_title: { type: "STRING" },
                        tomo_dynamic_insight: { type: "STRING" },
                        tomo_strengths: { type: "ARRAY", items: { type: "STRING" } },
                        tomo_challenges: { type: "ARRAY", items: { type: "STRING" } },
                        tomo_secret_advice: { type: "STRING" }
                    },
                    required: [
                        "tomo_deep_reading_p1", "tomo_deep_reading_p2", "chemistry_score",
                        "relationship_title", "tomo_dynamic_insight", "tomo_strengths",
                        "tomo_challenges", "tomo_secret_advice"
                    ]
                }
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorJson = await response.json().catch(() => ({}));
            throw new Error(errorJson.error?.message || `HTTP ${response.status}`);
        }

        const resData = await response.json();
        const jsonText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonText) throw new Error("No response received from Gemini API.");
        return JSON.parse(jsonText);
    }

    // Render results in DOM
    function renderResults(data, p1Name, p2Name, relType, p1Secret, p2Secret) {
        const score = Math.min(100, Math.max(0, Math.round(data.chemistry_score || 85)));
        animateScoreCounter(score);
        
        const titleElem = document.getElementById('tomoTitle');
        if (titleElem) titleElem.textContent = data.relationship_title || "တစ်ယောက်ရဲ့ အဆိုးကို တစ်ယောက်က အေးဆေး ညှိပေးနိုင်တဲ့ အံဝင်ခွင်ကျ ရင်းနှီးမှု 💖✨";

        const relBadge = document.getElementById('relBadge');
        if (relBadge) {
            if (relType === 'Couple') {
                relBadge.textContent = "❤️ Romantic Couple Mode";
                relBadge.className = "text-xs font-extrabold text-rose-700 uppercase tracking-widest bg-rose-100 border border-rose-300 px-4 py-1 rounded-full shadow-sm";
            } else {
                relBadge.textContent = "👯‍♂️ Best Friends Mode";
                relBadge.className = "text-xs font-extrabold text-pink-700 uppercase tracking-widest bg-pink-100 border border-pink-300 px-4 py-1 rounded-full shadow-sm";
            }
        }

        const circle = document.getElementById('scoreCircle');
        if (circle) {
            const circumference = 283;
            const offset = circumference - (score / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }

        if (p1Secret && p2Secret) {
            const breakdown = calculateDetailedMetricsBreakdown(p1Secret, p2Secret, relType);
            renderMetricBreakdown(breakdown);
        }

        const p1ResName = document.getElementById('p1ResName');
        const p1ReadingText = document.getElementById('p1ReadingText');
        if (p1ResName) p1ResName.textContent = p1Name;
        if (p1ReadingText) p1ReadingText.innerHTML = (data.tomo_deep_reading_p1 || "").replace(/\n/g, '<br><br>');

        const p2ResName = document.getElementById('p2ResName');
        const p2ReadingText = document.getElementById('p2ReadingText');
        if (p2ResName) p2ResName.textContent = p2Name;
        if (p2ReadingText) p2ReadingText.innerHTML = (data.tomo_deep_reading_p2 || "").replace(/\n/g, '<br><br>');

        const dynamicInsightText = document.getElementById('dynamicInsightText');
        if (dynamicInsightText) dynamicInsightText.innerHTML = (data.tomo_dynamic_insight || "").replace(/\n/g, '<br><br>');

        const strengthsList = document.getElementById('strengthsList');
        if (strengthsList) {
            strengthsList.innerHTML = '';
            (data.tomo_strengths || []).forEach(item => {
                const li = document.createElement('li');
                li.className = "flex items-start gap-2 text-pink-950 dark:text-pink-200 text-xs leading-relaxed bg-pink-50/90 dark:bg-slate-800/90 p-2.5 rounded-xl border border-pink-200 dark:border-slate-700";
                li.innerHTML = `<img src="icon_3d_p2.jpg" class="w-4 h-4 rounded-full object-cover mt-0.5"> <span>${item}</span>`;
                strengthsList.appendChild(li);
            });
        }

        const challengesList = document.getElementById('challengesList');
        if (challengesList) {
            challengesList.innerHTML = '';
            (data.tomo_challenges || []).forEach(item => {
                const li = document.createElement('li');
                li.className = "flex items-start gap-2 text-amber-950 dark:text-amber-200 text-xs leading-relaxed bg-amber-50/90 dark:bg-slate-800/90 p-2.5 rounded-xl border border-amber-200 dark:border-slate-700";
                li.innerHTML = `<img src="icon_3d_p1.jpg" class="w-4 h-4 rounded-full object-cover mt-0.5"> <span>${item}</span>`;
                challengesList.appendChild(li);
            });
        }

        const finalAdviceText = document.getElementById('finalAdviceText');
        if (finalAdviceText) finalAdviceText.innerHTML = (data.tomo_secret_advice || "").replace(/\n/g, '<br><br>');
    }

    // Render 5-Metric Breakdown Bars in DOM
    function renderMetricBreakdown(breakdownItems) {
        const container = document.getElementById('metricBreakdownContainer');
        if (!container) return;

        container.innerHTML = `
            <h4 class="text-[11px] font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>5-Metric Astrological Breakdown</span>
                <span>(အသေးစိတ် ၅ မျိုး ပေါင်းစပ်မှု)</span>
            </h4>
        ` + breakdownItems.map(item => `
            <div class="space-y-0.5">
                <div class="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200">
                    <span>${item.label}</span>
                    <span class="font-extrabold text-pink-600 dark:text-pink-400">${item.score}%</span>
                </div>
                <div class="w-full bg-pink-100/80 dark:bg-slate-900 rounded-full h-2 overflow-hidden p-0.5 border border-pink-200/60 dark:border-pink-500/40 shadow-inner">
                    <div class="bg-gradient-to-r ${item.color} h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(236,72,153,0.5)]" style="width: ${item.score}%"></div>
                </div>
            </div>
        `).join('');
    }

    // Animated Count-Up Score Counter
    function animateScoreCounter(targetScore) {
        const scoreElement = document.getElementById('scoreText');
        if (!scoreElement) return;
        let current = 0;
        const duration = 1200;
        const stepTime = Math.max(10, Math.floor(duration / (targetScore || 1)));

        const timer = setInterval(() => {
            current += 1;
            if (current >= targetScore) {
                current = targetScore;
                clearInterval(timer);
            }
            scoreElement.textContent = `${current}%`;
        }, stepTime);
    }

    // Generate and Download Canvas Destiny Card PNG
    function downloadDestinyCard() {
        const isDark = document.body.classList.contains('dark');
        const scale = 2;
        const canvas = document.createElement('canvas');
        canvas.width = 800 * scale;
        canvas.height = 1150 * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);

        const bgGrad = ctx.createLinearGradient(0, 0, 800, 1150);
        if (isDark) {
            bgGrad.addColorStop(0, '#0f172a');
            bgGrad.addColorStop(0.5, '#1e1b4b');
            bgGrad.addColorStop(1, '#311042');
        } else {
            bgGrad.addColorStop(0, '#fff0f5');
            bgGrad.addColorStop(0.5, '#fff7ed');
            bgGrad.addColorStop(1, '#f3e8ff');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 800, 1150);

        ctx.strokeStyle = isDark ? '#ec4899' : '#f472b6';
        ctx.lineWidth = 12;
        ctx.strokeRect(20, 20, 760, 1110);

        ctx.fillStyle = isDark ? '#f472b6' : '#ec4899';
        ctx.font = 'bold 36px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("🌸 Tomo's Destiny Matcher 💖", 400, 80);

        const relBadge = document.getElementById('relBadge');
        ctx.fillStyle = isDark ? '#c084fc' : '#9333ea';
        ctx.font = '20px Quicksand, sans-serif';
        ctx.fillText(relBadge ? relBadge.textContent : "Destiny Reading", 400, 120);

        ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.roundRect(220, 150, 360, 160, 24);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.stroke();

        const scoreText = document.getElementById('scoreText');
        ctx.fillStyle = isDark ? '#fbbf24' : '#d97706';
        ctx.font = 'bold 64px Fredoka, sans-serif';
        ctx.fillText(scoreText ? scoreText.textContent : '94%', 400, 230);
        ctx.font = 'bold 16px Quicksand, sans-serif';
        ctx.fillStyle = isDark ? '#f472b6' : '#ec4899';
        ctx.fillText("DESTINY CHEMISTRY SCORE", 400, 270);

        const tomoTitle = document.getElementById('tomoTitle');
        ctx.fillStyle = isDark ? '#f472b6' : '#be185d';
        ctx.font = 'bold 22px Fredoka, Padauk, sans-serif';
        ctx.fillText(tomoTitle ? tomoTitle.textContent : '', 400, 350);

        const p1ResName = document.getElementById('p1ResName');
        const p1ReadingText = document.getElementById('p1ReadingText');
        ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.roundRect(50, 390, 330, 250, 20);
        ctx.fill();
        ctx.fillStyle = isDark ? '#f472b6' : '#db2777';
        ctx.font = 'bold 20px Fredoka, Padauk, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`👧🏻 ${p1ResName ? p1ResName.textContent : 'P1'}`, 70, 425);
        ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
        ctx.font = '14px Padauk, sans-serif';
        wrapText(ctx, (p1ReadingText ? p1ReadingText.textContent : '').slice(0, 220) + '...', 70, 460, 290, 22);

        const p2ResName = document.getElementById('p2ResName');
        const p2ReadingText = document.getElementById('p2ReadingText');
        ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.roundRect(420, 390, 330, 250, 20);
        ctx.fill();
        ctx.fillStyle = isDark ? '#fbbf24' : '#d97706';
        ctx.font = 'bold 20px Fredoka, Padauk, sans-serif';
        ctx.fillText(`🌸 ${p2ResName ? p2ResName.textContent : 'P2'}`, 440, 425);
        ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
        ctx.font = '14px Padauk, sans-serif';
        wrapText(ctx, (p2ReadingText ? p2ReadingText.textContent : '').slice(0, 220) + '...', 440, 460, 290, 22);

        const dynamicInsightText = document.getElementById('dynamicInsightText');
        ctx.fillStyle = isDark ? 'rgba(35, 25, 55, 0.9)' : 'rgba(243, 232, 255, 0.9)';
        ctx.beginPath();
        ctx.roundRect(50, 670, 700, 200, 20);
        ctx.fill();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = isDark ? '#e9d5ff' : '#7e22ce';
        ctx.font = 'bold 18px Fredoka, Padauk, sans-serif';
        ctx.fillText("✨ Dynamic Synergy Insight", 70, 705);
        ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
        ctx.font = '14px Padauk, sans-serif';
        wrapText(ctx, (dynamicInsightText ? dynamicInsightText.textContent : '').slice(0, 320) + '...', 70, 740, 660, 24);

        const finalAdviceText = document.getElementById('finalAdviceText');
        ctx.fillStyle = isDark ? 'rgba(45, 35, 20, 0.95)' : 'rgba(254, 243, 199, 0.95)';
        ctx.beginPath();
        ctx.roundRect(50, 890, 700, 160, 20);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = isDark ? '#fef3c7' : '#b45309';
        ctx.font = 'bold 18px Fredoka, Padauk, sans-serif';
        ctx.fillText("👑 Tomo's Final Advice", 70, 925);
        ctx.fillStyle = isDark ? '#fde68a' : '#1e293b';
        ctx.font = 'bold 14px Padauk, sans-serif';
        wrapText(ctx, (finalAdviceText ? finalAdviceText.textContent : '').slice(0, 250) + '...', 70, 960, 660, 24);

        ctx.fillStyle = isDark ? '#f472b6' : '#ec4899';
        ctx.font = '12px Quicksand, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Generated by Tomo's Destiny Matcher · Powered by Gemini 3.1 Flash Lite 🌸", 400, 1105);

        const link = document.createElement('a');
        const name1 = p1ResName ? p1ResName.textContent : 'Person1';
        const name2 = p2ResName ? p2ResName.textContent : 'Person2';
        link.download = `Tomo_Destiny_${name1}_${name2}.png`.replace(/\s+/g, '_');
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }

    function showToast(msg, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `pointer-events-auto px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all duration-300 border transform translate-y-2 opacity-0 ${
            type === 'success' 
                ? 'bg-emerald-50/95 dark:bg-slate-800/95 border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200' 
                : type === 'warning' 
                ? 'bg-amber-50/95 dark:bg-slate-800/95 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200' 
                : 'bg-pink-50/95 dark:bg-slate-800/95 border-pink-300 dark:border-pink-600 text-pink-800 dark:text-pink-200'
        }`;
        
        const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠️' : '🌸';
        toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        }, 10);

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
});
