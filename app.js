/**
 * Tomo's Destiny Matcher - Logic Engine
 * Secretly calculates 5 metrics: Western Zodiac, Mahabote 7-House Planetary Position, True Chinese Animal, Chinese 5 Elements, & Numerology Destiny Number.
 * Features a deterministic compatibility engine for wildly diverse scores (62% - 98%).
 * Gemini responds as "Tomo" (တိုမို) in rich, detailed, massive, diverse, and casual/friendly Burmese!
 * Production UI handlers: Toast notifications, password toggle, segment tabs, navbar sync, and preset chips.
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

// Helper: Parse date ISO string into Local Midnight (Fixes UTC timezone shift bug)
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

    // Myanmar Era (ME) = Gregorian Year - 638
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

// 5. Pythagorean Name Numerology (Supports Non-Latin / Burmese Unicode Fallback)
function calculateDestinyNumber(name) {
    if (!name) return 1;
    const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');

    // Fallback for Burmese / non-Latin characters
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

// Algorithmic Base Chemistry Score Engine (Dynamically varies from 62% to 98%)
function calculateAlgorithmicScore(p1Secret, p2Secret, relType) {
    let score = 65;

    // 1. Chinese Zodiac San He (Trines) & Liu He (Harmonies)
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

    // 2. Chinese 5 Elements Compatibility
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

    // 3. Numerology Destiny Number Resonance
    const d1 = p1Secret.destinyNumber;
    const d2 = p2Secret.destinyNumber;
    const dDiff = Math.abs(d1 - d2);

    if (d1 === d2) score += 8;
    else if (dDiff === 2 || dDiff === 4 || dDiff === 6) score += 6;
    else if (dDiff === 1 || dDiff === 3 || dDiff === 5) score += 4;
    else score += 2;

    // 4. Mahabote Day & House Synergy
    if (p1Secret.mahaboteHouse === p2Secret.mahaboteHouse) score += 5;
    else score += 3;

    // 5. Mode Adjustment
    if (relType === 'Friends') score += 2;

    // Pseudo-random deterministic hash based on date strings
    let seed = 0;
    const combinedStr = p1Secret.dateString + p2Secret.dateString;
    for (let i = 0; i < combinedStr.length; i++) {
        seed += combinedStr.charCodeAt(i);
    }
    const jitter = (seed % 9) - 4;
    score += jitter;

    return Math.min(98, Math.max(62, score));
}

// Standard Demo Result
const DEMO_RESULT = {
    tomo_deep_reading_p1: "Tomo ရဲ့ အသေးစိတ် ဇာတာနှင့် စိတ်ဓာတ်ပိုင်းဆိုင်ရာ သုံးသပ်ချက်အရ မင်းမင်း ဟာ ပြင်ပ ကမ္ဘာမှာ ပေါင်းသင်းဆက်ဆံရေး အလွန်ပြေပြစ်ပြီး တက်ကြွလှုပ်ရှားသော စွမ်းအင် (Dynamic Energy) ကို ပိုင်ဆိုင်ထားသူ ဖြစ်ပါတယ်နော်။ လူအများကြားမှာ ထင်ရှားပေါ်လွင်ပြီး၊ မည်သည့် အခြေအနေမဆို အဆင်ပြေအောင် ချက်ချင်း လိုက်လျောညီထွေ စကားပြောဆိုနိုင်စွမ်း ရှိတာကို Tomo အံ့ဩစွာ တွေ့ရှိရပါတယ် 🌸။ \n\nသို့သော်လည်း စိတ်၏ နက်ရှိုင်းသော အတွင်းပိုင်းမှာတော့ မင်းမင်း ဟာ အလွန် စနစ်တကျ စဉ်းစားတတ်သူ ဖြစ်ပြီး၊ မိမိ အားကိုးရသူများ သို့မဟုတ် ချစ်ခင်ရသူများ ရှေ့မှာသာ မိမိ၏ ရင်တွင်းဖြစ် ခံစားချက်အမှန်များနှင့် စိုးရိမ်မှုများကို ဖွင့်ဟပြသတတ်သူ ဖြစ်ပါတယ်။ မဟာဘုတ် ဓာတ်စက်နှင့် နာမည်ဂဏန်း တွဲဖက်မှုအရ ပရောဂျက်အသစ်များ၊ စိတ်ကူးဆန်းများကို စတင်ဖန်တီးရာမှာ ရဲရင့်သော ဦးဆောင်သူ ဖြစ်သလို၊ အမှန်တရားနှင့် သစ္စာတရားကို အလွန် တန်ဖိုးထားသူ ဖြစ်ပါတယ်။ \n\nချစ်ခြင်းမေတ္တာ သို့မဟုတ် သူငယ်ချင်း သံယောဇဉ်မှာ မင်းမင်း ဟာ မိမိထက် အခြားသူ၏ လိုအပ်ချက်ကို ဦးစားပေး ကူညီတတ်သူ ဖြစ်ပြီး၊ တစ်ခါတစ်ရံ စိတ်ဖိစီးမှုများကို မိမိတစ်ယောက်တည်း ကြိတ်မှိတ် ကြံ့ကြံ့ခံတတ်သော ကြင်နာတတ်သည့် နှလုံးသားပိုင်ရှင် ဖြစ်ပါတယ်နော် ✨...",
    
    tomo_deep_reading_p2: "အောင်အောင် ရဲ့ စရိုက်နက်ရှိုင်းမှုကို Tomo လေ့လာလိုက်တဲ့အခါ တည်ငြိမ်အေးဆေးပြီး အရာရာကို မြော်မြင်ဆင်ခြင်နိုင်သော စိတ်အေးချမ်းမှု (Inner Peace) ကို တွေ့ရပါတယ်နော်။ ပြင်ပမှ ကြည့်လျှင် စကားနည်းသူ သို့မဟုတ် အေးဆေးလွန်းသူဟု ထင်ရသော်လည်း၊ အမှန်တကယ်မှာ အရာရာကို အသေးစိတ် စေတနာထား စောင့်ကြည့်လေ့လာနေတတ်သော ပါးနပ် perceptive သော သဘာဝရှိသူ ဖြစ်ပါတယ် 🌸။ \n\nမဟာဘုတ် ရာဇ/သိုက် ဓာတ်စက်နှင့် တကယ့် တရုတ် ၅ ပါး ဓာတ်ပေါင်းစပ်မှုအရ အောင်အောင် ဟာ အခက်အခဲ ရင်ဆိုင်ရချိန်များမှာ စိတ်ဓာတ် တင်းမာစွာဖြင့် အေးဆေးစွာ ဖြေရှင်းနိုင်သော အခြေခံအုတ်မြစ် (Solid Foundation) ပိုင်ရှင် ဖြစ်ပါတယ်။ စိတ်လိုက်မာန်ပါ မလုပ်တတ်ဘဲ၊ အခြေအနေတစ်ခုချင်းစီ၏ ကောင်းကျိုးဆိုးပြစ်ကို မျှတစွာ ချိန်ဆပြီးမှ ဆုံးဖြတ်ချက် ချတတ်သူ ဖြစ်ပါတယ်။ \n\nသံယောဇဉ် ပေါင်းသင်းဆက်ဆံရေးမှာ အောင်အောင် ဟာ စကားကြီးစကားကျယ် မပြောဘဲ၊ လိုအပ်သည့်အချိန်တိုင်းမှာ နောက်ကွယ်မှ အဆင်သင့် ကူညီပံ့ပိုးပေးမယ့် သစ္စာရှိလှသော အကာအကွယ်ပေးသူ (Silent Protector) တစ်ဦး ဖြစ်ကြောင်း Tomo အာမခံပါတယ်နော် 💖...",
    
    chemistry_score: 94,
    relationship_title: "တစ်ယောက်ရဲ့ အဆိုးကို တစ်ယောက်က အေးဆေး ညှိပေးနိုင်တဲ့ အံဝင်ခွင်ကျ ရင်းနှီးမှု 💖✨",
    
    tomo_dynamic_insight: "Tomo ရဲ့ နက်ရှိုင်းသော စွမ်းအင်ပေါင်းစပ်မှု သုံးသပ်ချက်အရ မင်းတို့ နှစ်ယောက်၏ ရေစက်ဟာ အလွန်ပင် ထူးခြားဆန်းကြယ်စွာ အံဝင်ခွင်ကျ ဖြစ်နေပါတယ်နော်။ မင်းမင်း ရဲ့ တက်ကြွဆန်းသစ်သော စွမ်းအင် (Active Energy) နှင့် အောင်အောင် ရဲ့ တည်ငြိမ်မျှတသော ဓာတ် (Grounded Energy) တို့ ပေါင်းစပ်သွားသည့်အခါ ယင်းသည် သဘာဝတ္ထအရ ရေနှင့် လေ၊ မြေနှင့် မိုးကဲ့သို့ တစ်ယောက်ကိုတစ်ယောက် အပြည့်အဝ ဖြည့်ဆည်းပေးသည့် ပေါင်းစပ်မှု ဖြစ်လာပါတယ် 🌸။ \n\nမင်းမင်း က စိတ်ကူးသစ်များ၊ စူးစမ်းလိုစိတ်များနှင့် ရှေ့သို့ တိုးရန် လမ်းပြပေးချိန်တွင်၊ အောင်အောင် က ထိုစနစ်များကို ခိုင်မာအောင် အေးဆေးစွာ ထိန်းကျောင်းပေးနိုင်ပါသည်။ တစ်ယောက်၏ အားနည်းချက် သို့မဟုတ် စိတ်လှုပ်ရှားမှုများကို အခြားတစ်ယောက်က ငြိမ်သက်စွာ နားလည်ပေးနိုင်သဖြင့် အပြန်အလှန် ယုံကြည်မှုမှာ နှစ်ကာလ ကြာမြင့်သည်နှင့်အမျှ ပိုမို ခိုင်မာလာမည် ဖြစ်ပါတယ် 💖။ \n\nအထူးသဖြင့် စကားပြောဆို ဆက်ဆံရာတွင် မင်းမင်း ၏ ပွင့်လင်းမှုနှင့် အောင်အောင် ၏ စိတ်ရှည်စွာ နားထောင်ပေးနိုင်မှုတို့ကြောင့် သဘောထားကွဲလွဲမှုများ ရှိလာပါကလည်း ရန်ပွဲသို့ မရောက်ဘဲ လျှင်မြန်စွာ နားလည်မှု ရယူနိုင်သော အတုယူဖွယ် ဆက်ဆံရေး ပုံစံ ဖြစ်ပါတယ်နော် ✨...",
    
    tomo_strengths: [
        "တစ်ယောက်နှင့်တစ်ယောက် အပြန်အလှန် ယုံကြည်မှု အပြည့်အဝဖြင့် ရင်တွင်းဖြစ်များကို ကွယ်ဝှက်မထားဘဲ ပွင့်ပွင့်လင်းလင်း တိုင်ပင်ဆွေးနွေးနိုင်ခြင်း",
        "မင်းမင်း ရဲ့ စိတ်ကူးသစ်များကို အောင်အောင် က ငြင်းပယ်ခြင်းမရှိဘဲ အပြုသဘောဆောင်ကာ စနစ်တကျ ပံ့ပိုးပေးနိုင်ခြင်း",
        "ခက်ခဲသော စိန်ခေါ်မှုများနှင့် ကြုံတွေ့ရချိန်တွင် တစ်ဦး၏ အားနည်းချက်ကို အခြားတစ်ဦးက အချိုးကျကျ ဖြည့်ဆည်းပေးနိုင်ခြင်း",
        "တစ်ယောက်၏ ကိုယ်ပိုင်လွတ်လပ်ခွင့်နှင့် ကိုယ်ပိုင်ရည်မှန်းချက်များကို အပြန်အလှန် လေးစားပြီး ဂုဏ်ယူပေးနိုင်ခြင်း",
        "အချိန်ကြာမြင့်စွာ ခွဲခွာနေရသော်လည်း သစ္စာတရားနှင့် ရင်းနှီးမှု သံယောဇဉ် လျော့ပါးမသွားဘဲ ပိုမို ခိုင်မြဲလာခြင်း"
    ],
    tomo_challenges: [
        "အသေးအဖွဲ စိတ်သဘောထား ကွဲလွဲမှုများတွင် မင်းမင်း က စိတ်မြန်လက်မြန် ပြောဆိုမိပါက အောင်အောင် ၏ စိတ်ထိခိုက်မှုကို သတိပြုပါနော်",
        "အောင်အောင် ဘက်မှ စိတ်ထဲတွင် မကျေနပ်ချက်များ ရှိပါက ချက်ချင်း မပြောဘဲ ကြိတ်မှိတ် မျိုသိပ်ထားတတ်သဖြင့် ပွင့်ပွင့်လင်းလင်း မေးမြန်းပေးပါ",
        "အလုပ် သို့မဟုတ် ကိုယ်ပိုင် တာဝန်များပြားချိန်တွင် တစ်ယောက်ကိုတစ်ယောက် ဂရုစိုက်မှု မလျော့ပါးစေရန် သီးသန့် အချိန်ပေးပါနော်",
        "ပြင်ပလူများ၏ သွေးထိုးစကား သို့မဟုတ် ဝေဖန်မှုများကို မယုံကြည်ဘဲ နှစ်ယောက်တည်း တိုက်ရိုက် မေးမြန်း ဆွေးနွေးပါ"
    ],
    tomo_secret_advice: "Tomo ရဲ့ အထူး လျှို့ဝှက် အကြံပြုချက်ကတော့ မင်းတို့နှစ်ယောက်၏ ဆက်ဆံရေးဟာ အလွန်ပင် ရှားပါးလှသော စွမ်းအင် ညီညွတ်မှု ရှိနေပါတယ်နော် 🌸။ \n\nမည်သည့် အခြေအနေမှာမဆို တစ်ယောက်၏ စိတ်ခံစားချက်ကို မဆန်းစစ်ဘဲ ကြိုတင် မตัดสินပါနှင့်။ တစ်ယောက်နှင့်တစ်ယောက် စိတ်ကောက်ခြင်း သို့မဟုတ် စိတ်ဆိုးခြင်းများ ရှိပါက နေဝင်မီးငြိမ်း မတိုင်မီ ပွင့်ပွင့်လင်းလင်း ရယ်ရယ်မောမော စကားပြောဆိုကာ ဖြေရှင်းလိုက်ပါနော်။ ဤနားလည်မှုနှင့် အပြန်အလှန် လေးစားမှုကို အစဉ်အမြဲ ထိန်းသိမ်းသွားပါက မင်းတို့နှစ်ယောက်၏ ဆက်ဆံရေးဟာ ထာဝရ ရွှင်လန်းခိုင်မြဲနေမှာပါ 👑💖"
};

// Playful & Sassy Cute Funny Demo Result
const PLAYFUL_DEMO_RESULT = {
    tomo_deep_reading_p1: "ဟဲဟဲ 😜! မင်းမင်း ရဲ့ စရိုက်လေးကို တိုမို ကွန်ပျူတာထက်တောင် မြန်အောင် စစ်ဆေးလိုက်ပြီနော် 🌸! မင်းမင်း က အပြင်မှာ ကြည့်ရင် လူအများနဲ့ တကျက်ကျက် ရယ်မောပြီး ခေါင်းဆောင်လုပ်ရတာ ကြိုက်တဲ့ ပုံစံမျိုးပေမဲ့၊ တကယ်တော့ ရင်ထဲမှာ ကလေးလေးလိုပဲ အလိုက်သိတာ ခံချင်တာ တိုမို အကုန် ရိပ်မိတယ်နော် 🤭။ \n\nစပ်စုချင်စိတ်လည်း တအားများပြီး ပရောဂျက်အသစ်တွေ လုပ်မယ်ဆို ရှေ့ဆုံးကပဲ 🚀! ဒါပေမဲ့ စိတ်တိုလာရင်တော့ ခဏလေး မျက်နှာဆူပုပ်သွားတတ်ပေမဲ့ ငါးမိနစ်အတွင်း ပြန်ပြုံးပြတတ်တဲ့ ချစ်စရာ့ စရိုက်လေးပါပဲနော် 🎀...",

    tomo_deep_reading_p2: "ကဲ... အောင်အောင် ရဲ့ အလှည့် ရောက်ပြီ 🌸! အောင်အောင် ကတော့ အေးဆေးတည်ငြိမ်တဲ့ 'ဆရာကြီး' ပုံစံလေးနဲ့ အနီးအနားကလူတွေကို စောင့်ကြည့်နေတတ်သူပေါ့ 😜။ စကားအများကြီး မပြောပေမဲ့ မင်းမင်း စိတ်ကူးယဉ်သမျှ အလွဲတွေကို နောက်ကနေ အေးဆေး ထိန်းပေးနေရတဲ့ မရှိမဖြစ် ငြိမ်သက်သူလေးပါ 💖။ \n\nစိတ်ထားကတော့ နူးညံ့လွန်းလို့ ဘေးလူတွေ ဒုက္ခရောက်ရင် မနေနိုင်ဘဲ ကူညီတတ်ပေမဲ့၊ တစ်ခါတစ်ရံ စိတ်ထဲမကျေနပ်ရင် နှုတ်ခမ်းစူပြီး အေးဆေး ငြိမ်နေတတ်တာလေးကတော့ အောင်အောင် ရဲ့ ချစ်စရာ သတိထားရမယ့် လျှို့ဝှက်ချက်ပေါ့ 🤭...",

    chemistry_score: 94,
    relationship_title: "တစ်ယောက်က ပရမ်းပတာလုပ်ရင် အခြားတစ်ယောက်က အေးဆေး ထိန်းပေးမယ့် အမိုက်စား စုံတွဲ 😜💖",

    tomo_dynamic_insight: "တိုမို ကြည့်လိုက်တာနဲ့ နှစ်ယောက်သား ဓာတ်ကျပုံကတော့ တကယ်ကို ရယ်ချင်စရာကောင်းလောက်အောင် အံဝင်ခွင်ကျ ဖြစ်နေတာပဲ 🌸! မင်းမင်း က ရှေ့ကနေ မီးပွင့်မတတ် တက်ကြွပြီး မြောက်ကြွမြောက်ကြွ လုပ်နေချိန်မှာ အောင်အောင် က နောက်ကနေ 'အေးဆေးလုပ်ပါဦး' ဆိုပြီး ရေအေးအေးလေးနဲ့ ပက်ပေးသလို ပေါင်းစပ်သွားတာမျိုး ပေါ့ 🤭။ \n\nတစ်ယောက်ရဲ့ အဆိုးကို တစ်ယောက်က ကောင်းကောင်းသိလို့ ရန်ဖြစ်ရင်လည်း ခဏလေးနဲ့ ပြန်စနောက်နိုင်ကြပြီး၊ အတူတူရှိရင် တစ်ချိန်လုံး ရယ်မောစရာတွေ ချည်းဖြစ်နေမယ့် အလွန် ချစ်စရာကောင်းတဲ့ ရေစက်လေးပါပဲနော် 💖✨...",

    tomo_strengths: [
        "တစ်ယောက်စကား တစ်ယောက် ချက်ချင်း သဘောပေါက်ပြီး အူတက်အောင် အတူတူ ရယ်မောနိုင်ခြင်း 😜",
        "မင်းမင်း ရဲ့ ရူးရူးမိုက်မိုက် စိတ်ကူးတွေကို အောင်အောင် က အေးဆေးစွာ အားပေးပံ့ပိုးပေးခြင်း 🌸",
        "စိတ်ကောက်ရင်လည်း ကြာကြာ မကောက်နိုင်ဘဲ မုန့်ကျွေးလိုက်ရင် ချက်ချင်း ပြန်ပြုံးသွားခြင်း 🍩",
        "အချင်းချင်း အားနည်းချက်တွေကို မလှောင်ပြောင်ဘဲ ချစ်စဖွယ် စနောက်ကာ ကာကွယ်ပေးခြင်း 💖"
    ],
    tomo_challenges: [
        "စကားပြောရင် အပြိုင်အဆိုင် အနိုင်လိုချင်စိတ်လေးတွေ လျှော့ပါနော် ဟဲဟဲ 🤭",
        "အောင်အောင် က စိတ်ကောက်ရင် နှုတ်ခမ်းစူမနေဘဲ ပွင့်ပွင့်လင်းလင်း ပြောပြပါနော် 🎀",
        "အလုပ်များလို့ မဆုံနိုင်ရင်လည်း စိတ်မကောက်ကြနဲ့နော် 🌸"
    ],
    tomo_secret_advice: "တိုမို ရဲ့ ချစ်စရာ အကြံပေးချက်ကတော့... နှစ်ယောက်သား အမြဲတမ်း ဤအတိုင်း ရယ်ရယ်မောမော စနောက်ရင်း ချစ်သွားကြပါနော် 🌸! စိတ်ကောက်စရာရှိရင်လည်း တိုမို တိုင်တန်းလိုက်မှာမို့လို့ ချက်ချင်း ပြန်စကားပြောလိုက်ကြပါနော် 😜💖"
};

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
    const resultsSection = document.getElementById('resultsSection');

    // Restrict Date pickers to today's date max
    const todayISO = new Date().toISOString().split('T')[0];
    p1DobInput.max = todayISO;
    p2DobInput.max = todayISO;

    // Default dates
    p1DobInput.value = "1996-06-15";
    p2DobInput.value = "1996-10-08";



    // Setup Segmented Pill Tabs for Relationship Mode
    const modeTabs = document.querySelectorAll('.mode-tab-btn');
    modeTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            modeTabs.forEach(t => {
                t.className = "mode-tab-btn py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-pink-600 transition-all cursor-pointer";
            });
            btn.className = "mode-tab-btn tomo-chip-3d py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-pink-700 transition-all cursor-pointer";
            relTypeSelect.value = btn.dataset.value;
        });
    });

    // Setup Segmented Pill Tabs for Persona Mood
    const moodTabs = document.querySelectorAll('.mood-tab-btn');
    moodTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            moodTabs.forEach(t => {
                t.className = "mood-tab-btn py-2 px-2 rounded-xl text-[11px] sm:text-xs font-bold text-slate-600 hover:text-purple-700 transition-all cursor-pointer";
            });
            btn.className = "mood-tab-btn tomo-chip-3d py-2 px-2 rounded-xl text-[11px] sm:text-xs font-extrabold text-purple-700 transition-all cursor-pointer";
            tomoMoodSelect.value = btn.dataset.value;
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
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        updateKeyStatus(true);
    } else {
        updateKeyStatus(false);
    }

    // Save API key on change
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

    function updateKeyStatus(isReady) {
        if (isReady) {
            if (apiKeyStatus) {
                apiKeyStatus.textContent = "🌸 အဆင်သင့်";
                apiKeyStatus.className = "text-emerald-600 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300";
            }
            if (apiKeyStatusNav) {
                apiKeyStatusNav.textContent = "🌸 Key Ready";
                apiKeyStatusNav.className = "px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-extrabold";
            }
        } else {
            if (apiKeyStatus) {
                apiKeyStatus.textContent = "🔑 သော့ချက် လိုအပ်သည်";
                apiKeyStatus.className = "text-amber-600 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300";
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
            p1NameInput.value = "မင်းမင်း 🎀";
            p2NameInput.value = "အောင်အောင် 🌸";
            p1DobInput.value = "1996-06-15";
            p2DobInput.value = "1996-10-08";
            showToast("🌸 Preset Filled: မင်းမင်း & အောင်အောင်", "info");
        });
    }

    if (presetResetBtn) {
        presetResetBtn.addEventListener('click', () => {
            p1NameInput.value = "";
            p2NameInput.value = "";
            resultsSection.classList.add('hidden');
            showToast("↺ Form reset to empty", "info");
        });
    }

    // Demo Button
    demoBtn.addEventListener('click', () => {
        p1NameInput.value = p1NameInput.value.trim() || "မင်းမင်း 🎀";
        p2NameInput.value = p2NameInput.value.trim() || "အောင်အောင် 🌸";

        const p1Secret = calculateSecretMetrics(p1NameInput.value, p1DobInput.value || "1996-06-15");
        const p2Secret = calculateSecretMetrics(p2NameInput.value, p2DobInput.value || "1996-10-08");
        const demoScore = calculateAlgorithmicScore(p1Secret, p2Secret, relTypeSelect.value);
        
        const selectedMood = tomoMoodSelect ? tomoMoodSelect.value : 'Sweet';
        const baseDemo = selectedMood === 'Playful' ? PLAYFUL_DEMO_RESULT : DEMO_RESULT;
        const demoData = { ...baseDemo, chemistry_score: demoScore };

        triggerTomoLoading(() => {
            renderResults(demoData, p1NameInput.value, p2NameInput.value, relTypeSelect.value);
            showToast("✨ Tomo Demo Reading generated!", "success");
        });
    });

    // Ask Tomo Button
    calculateBtn.addEventListener('click', () => {
        const p1Name = p1NameInput.value.trim() || "ပထမ လူသားလေး";
        const p2Name = p2NameInput.value.trim() || "ဒုတိယ လူသားလေး";
        const p1Secret = calculateSecretMetrics(p1Name, p1DobInput.value);
        const p2Secret = calculateSecretMetrics(p2Name, p2DobInput.value);
        const relType = relTypeSelect.value;
        const mood = tomoMoodSelect ? tomoMoodSelect.value : 'Sweet';
        const apiKey = apiKeyInput.value.trim();

        const algorithmicScore = calculateAlgorithmicScore(p1Secret, p2Secret, relType);

        if (!apiKey) {
            showToast("ကျေးဇူးပြု၍ GEMINI API Key ကို ထည့်သွင်းပေးပါ။ (Please enter your API Key)", "warning");
            apiKeyInput.focus();
            return;
        }

        triggerTomoLoading(async () => {
            try {
                const data = await fetchTomoDestinyReading(p1Name, p1Secret, p2Name, p2Secret, relType, mood, algorithmicScore, apiKey);
                renderResults(data, p1Name, p2Name, relType);
                showToast("🌸 Tomo's destiny reading complete!", "success");
            } catch (err) {
                console.error(err);
                showToast(`API Error: ${err.message}. Showing Demo Reading!`, "warning");
                const baseDemo = mood === 'Playful' ? PLAYFUL_DEMO_RESULT : DEMO_RESULT;
                const fallbackData = { ...baseDemo, chemistry_score: algorithmicScore };
                renderResults(fallbackData, p1Name, p2Name, relType);
            }
        });
    });

    // Download Card Button
    if (downloadCardBtn) {
        downloadCardBtn.addEventListener('click', () => {
            downloadDestinyCard();
            showToast("📸 Destiny Card downloaded!", "success");
        });
    }

    // 4-Second Cute Tomo Loading Overlay
    function triggerTomoLoading(callback) {
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.classList.add('flex');

        setTimeout(async () => {
            if (callback) await callback();
            loadingOverlay.classList.add('hidden');
            loadingOverlay.classList.remove('flex');
        }, 4000);
    }

    // Call Gemini 3.1 Flash Lite as "Tomo" for Playful, Cute, Funny & Friendly Banter
    async function fetchTomoDestinyReading(p1Name, p1Secret, p2Name, p2Secret, relType, mood, algorithmicScore, apiKey) {
        const model = "gemini-3.1-flash-lite";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        let moodInstruction = "Speak in an extremely natural, sweet, bubbly, warm, casual, and friendly Burmese tone.";
        if (mood === 'Playful') {
            moodInstruction = `You are Tomo in your EXTREMELY FRIENDLY, CUTE, FUNNY, PLAYFUL, and SASSY mode! 
            - Speak in a super sweet, bubbly, hilariously witty, adorable, and friendly Burmese tone (မြန်မာဘာသာ).
            - Use cute sound words, adorable emojis, and cheerful banter (e.g. 'ဟဲဟဲ 😜', 'အဲဒီတော့လေ 🌸', 'တိုမို ကြည့်လိုက်တာနဲ့ အကုန်သိတယ်နော် 🎀', 'ခါးခါးသီးသီး မငြင်းနဲ့နော် 🤭').
            - Playfully tease their cute quirks, habits, and relationship dynamics in a warm, funny, and deeply affectionate way that makes the user smile and laugh out loud!
            - Keep everything super friendly, cute, upbeat, and hilarious while remaining perceptive!`;
        } else if (mood === 'Mystic') {
            moodInstruction = "Speak in a wise, deep, poetic yet approachable and casual Burmese tone, focusing on soul connections.";
        }

        const promptText = `
        Inner Calculated Astrological & Numerological Data (FOR TOMO'S SILENT ANALYSIS ONLY):
        Relationship Mode: ${relType} (${relType === 'Couple' ? 'Romantic Couple (ချစ်သူစုံတွဲ)' : 'Platonic Best Friends (သူငယ်ချင်း ချစ်ကြည်ရေး)'})
        Tomo's Selected Persona Mood: ${mood}
        Calculated Base Compatibility Score: ${algorithmicScore}%
        
        PERSON 1 (${p1Name}): 
        - Birthdate: ${p1Secret.dateString}
        - Western Sign: ${p1Secret.western}
        - Mahabote Day & House: ${p1Secret.mahaboteDay} (${p1Secret.mahaboteHouse})
        - True Chinese Animal: ${p1Secret.animal}
        - Chinese 5 Element: ${p1Secret.element}
        - Pythagorean Destiny Number: ${p1Secret.destinyNumber}

        PERSON 2 (${p2Name}): 
        - Birthdate: ${p2Secret.dateString}
        - Western Sign: ${p2Secret.western}
        - Mahabote Day & House: ${p2Secret.mahaboteDay} (${p2Secret.mahaboteHouse})
        - True Chinese Animal: ${p2Secret.animal}
        - Chinese 5 Element: ${p2Secret.element}
        - Pythagorean Destiny Number: ${p2Secret.destinyNumber}

        YOUR TASK AS "TOMO" (တိုမို):
        Generate a MASSIVE, ACCURATE, SUPER FRIENDLY, CUTE, AND FUNNY relationship reading in natural Burmese (မြန်မာဘာသာ).

        MANDATORY PLAYFUL & SASSY RULES (when mood is Playful):
        1. ALWAYS refer to yourself as "Tomo" (တိုမို).
        2. Set "chemistry_score" to exactly ${algorithmicScore} (or within +/- 2 points of ${algorithmicScore}).
        3. ${moodInstruction}
        4. CASUAL & FUNNY TITLES: Write "relationship_title" in a cute, funny, friendly, and cause-and-effect explanatory style (e.g. 'တစ်ယောက်က ပရမ်းပတာလုပ်ရင် အခြားတစ်ယောက်က အေးဆေး ထိန်းပေးမယ့် အမိုက်စား စုံတွဲ 😜💖' or 'အတူရှိရင် တစ်ချိန်လုံး အူတက်အောင် ရယ်နေရမယ့် ချစ်စရာ ရေစက်လေး 🌸').
        5. READINGS STRUCTURE:
           - "tomo_deep_reading_p1": Provide AT LEAST 3 LONG, CUTE, AND FUNNY PARAGRAPHS teasing ${p1Name}'s quirks, inner habits, and vulnerabilities.
           - "tomo_deep_reading_p2": Provide AT LEAST 3 LONG, CUTE, AND FUNNY PARAGRAPHS teasing ${p2Name}'s quirks, inner habits, and vulnerabilities.
           - "tomo_dynamic_insight": Provide AT LEAST 3-4 EXTENSIVE PARAGRAPHS explaining their hilarious chemistry, energy synergy, and funny moments together.
           - "tomo_strengths": Provide 4-5 cute, specific strengths with fun emojis in Burmese.
           - "tomo_challenges": Provide 4-5 friendly, humorous warning points in Burmese.
           - "tomo_secret_advice": Provide a heartwarming, funny, and affectionate final advice section from Tomo.
        6. DIVERSITY: Use rich, casual, hilarious Burmese vocabulary (မြန်မာဘာသာ ချစ်စရာ စကားပြောပုံစံ သဘာဝကျကျ).
        `;

        const payload = {
            contents: [{ parts: [{ text: promptText }] }],
            systemInstruction: {
                parts: [{
                    text: `You are 'Tomo' (တိုမို), an extraordinarily sweet, friendly, cute, sassy, and funny AI virtual girl who analyzes relationships with hilarious banter and warm affection in Burmese. ALWAYS refer to yourself as 'Tomo'. Set 'chemistry_score' around ${algorithmicScore}%. ${moodInstruction}`
                }]
            },
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        tomo_deep_reading_p1: { type: "STRING", description: "Person 1 ၏ စရိုက်ကို ဒေတာ ၅ ချက်လုံး ပေါင်းစပ်၍ အသေးစိတ် သုံးသပ်ထားသော စာပိုဒ်ရှည် ၃ ပိုဒ် in cute funny Burmese" },
                        tomo_deep_reading_p2: { type: "STRING", description: "Person 2 ၏ စရိုက်ကို ဒေတာ ၅ ချက်လုံး ပေါင်းစပ်၍ အသေးစိတ် သုံးသပ်ထားသော စာပိုဒ်ရှည် ၃ ပိုဒ် in cute funny Burmese" },
                        chemistry_score: { type: "NUMBER", description: "Compatibility chemistry percentage score calculated around benchmark" },
                        relationship_title: { type: "STRING", description: "Cute, funny, catchy, cause-and-effect explanatory title for their bond in Burmese" },
                        tomo_dynamic_insight: { type: "STRING", description: "နှစ်ယောက် ဓာတ်ပေါင်းစပ်မှုနှင့် ဆက်ဆံရေး အနာဂတ် အသေးစိတ် သုံးသပ်ချက် ၃-၄ ပိုဒ် in cute funny Burmese" },
                        tomo_strengths: {
                            type: "ARRAY",
                            items: { type: "STRING" },
                            description: "4-5 specific cute strengths in Burmese"
                        },
                        tomo_challenges: {
                            type: "ARRAY",
                            items: { type: "STRING" },
                            description: "4-5 specific friendly challenges in Burmese"
                        },
                        tomo_secret_advice: { type: "STRING", description: "Tomo မှ အနာဂတ်အတွက် လျှို့ဝှက် ချစ်စရာ အကြံပြုချက် စာပိုဒ်ရှည် in cute funny Burmese" }
                    },
                    required: [
                        "tomo_deep_reading_p1",
                        "tomo_deep_reading_p2",
                        "chemistry_score",
                        "relationship_title",
                        "tomo_dynamic_insight",
                        "tomo_strengths",
                        "tomo_challenges",
                        "tomo_secret_advice"
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
    function renderResults(data, p1Name, p2Name, relType) {
        resultsSection.classList.remove('hidden');

        // Score Gauge & Animation
        const score = Math.min(100, Math.max(0, Math.round(data.chemistry_score || 85)));
        animateScoreCounter(score);
        document.getElementById('tomoTitle').textContent = data.relationship_title || "တစ်ယောက်ရဲ့ အဆိုးကို တစ်ယောက်က အေးဆေး ညှိပေးနိုင်တဲ့ အံဝင်ခွင်ကျ ရင်းနှီးမှု 💖✨";

        // Relationship mode badge pill
        const relBadge = document.getElementById('relBadge');
        if (relType === 'Couple') {
            relBadge.textContent = "❤️ Romantic Couple Mode";
            relBadge.className = "text-xs font-extrabold text-rose-700 uppercase tracking-widest bg-rose-100 border border-rose-300 px-4 py-1 rounded-full shadow-sm";
        } else {
            relBadge.textContent = "👯‍♂️ Best Friends Mode";
            relBadge.className = "text-xs font-extrabold text-pink-700 uppercase tracking-widest bg-pink-100 border border-pink-300 px-4 py-1 rounded-full shadow-sm";
        }

        const circle = document.getElementById('scoreCircle');
        const circumference = 283;
        const offset = circumference - (score / 100) * circumference;
        circle.style.strokeDashoffset = offset;

        // Tomo's Deep Readings
        document.getElementById('p1ResName').textContent = p1Name;
        document.getElementById('p1ReadingText').innerHTML = (data.tomo_deep_reading_p1 || "").replace(/\n/g, '<br><br>');

        document.getElementById('p2ResName').textContent = p2Name;
        document.getElementById('p2ReadingText').innerHTML = (data.tomo_deep_reading_p2 || "").replace(/\n/g, '<br><br>');

        // Dynamic Insight
        document.getElementById('dynamicInsightText').innerHTML = (data.tomo_dynamic_insight || "").replace(/\n/g, '<br><br>');

        // Strengths
        const strengthsList = document.getElementById('strengthsList');
        strengthsList.innerHTML = '';
        (data.tomo_strengths || []).forEach(item => {
            const li = document.createElement('li');
            li.className = "flex items-start gap-2.5 text-pink-950 text-sm leading-relaxed bg-pink-50/90 p-3.5 rounded-2xl border border-pink-200 shadow-sm";
            li.innerHTML = `<img src="icon_3d_p2.jpg" class="w-5 h-5 rounded-full object-cover mt-0.5 shadow-2xs"> <span>${item}</span>`;
            strengthsList.appendChild(li);
        });

        // Challenges
        const challengesList = document.getElementById('challengesList');
        challengesList.innerHTML = '';
        (data.tomo_challenges || []).forEach(item => {
            const li = document.createElement('li');
            li.className = "flex items-start gap-2.5 text-amber-950 text-sm leading-relaxed bg-amber-50/90 p-3.5 rounded-2xl border border-amber-200 shadow-sm";
            li.innerHTML = `<img src="icon_3d_p1.jpg" class="w-5 h-5 rounded-full object-cover mt-0.5 shadow-2xs"> <span>${item}</span>`;
            challengesList.appendChild(li);
        });

        // Secret Advice
        document.getElementById('finalAdviceText').innerHTML = (data.tomo_secret_advice || "").replace(/\n/g, '<br><br>');

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Animated Count-Up Score Counter
    function animateScoreCounter(targetScore) {
        const scoreElement = document.getElementById('scoreText');
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
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1150;
        const ctx = canvas.getContext('2d');

        // Background Gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 800, 1150);
        bgGrad.addColorStop(0, '#fff0f5');
        bgGrad.addColorStop(0.5, '#fff7ed');
        bgGrad.addColorStop(1, '#f3e8ff');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 800, 1150);

        // Border
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 12;
        ctx.strokeRect(20, 20, 760, 1110);

        // Header Title
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 36px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("🌸 Tomo's Destiny Matcher 💖", 400, 80);

        // Subtitle
        ctx.fillStyle = '#9333ea';
        ctx.font = '20px Quicksand, sans-serif';
        ctx.fillText(document.getElementById('relBadge').textContent || "Destiny Reading", 400, 120);

        // Chemistry Score Badge Box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.roundRect(220, 150, 360, 160, 24);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#d97706';
        ctx.font = 'bold 64px Fredoka, sans-serif';
        ctx.fillText(document.getElementById('scoreText').textContent, 400, 230);
        ctx.font = 'bold 16px Quicksand, sans-serif';
        ctx.fillStyle = '#ec4899';
        ctx.fillText("DESTINY CHEMISTRY SCORE", 400, 270);

        // Title Box
        ctx.fillStyle = '#be185d';
        ctx.font = 'bold 22px Fredoka, Padauk, sans-serif';
        ctx.fillText(document.getElementById('tomoTitle').textContent, 400, 350);

        // Person 1 Box
        const p1Name = document.getElementById('p1ResName').textContent;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.roundRect(50, 390, 330, 250, 20);
        ctx.fill();
        ctx.fillStyle = '#db2777';
        ctx.font = 'bold 20px Fredoka, Padauk, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`👧🏻 ${p1Name}`, 70, 425);
        ctx.fillStyle = '#334155';
        ctx.font = '14px Padauk, sans-serif';
        wrapText(ctx, document.getElementById('p1ReadingText').textContent.slice(0, 220) + '...', 70, 460, 290, 22);

        // Person 2 Box
        const p2Name = document.getElementById('p2ResName').textContent;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.roundRect(420, 390, 330, 250, 20);
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.font = 'bold 20px Fredoka, Padauk, sans-serif';
        ctx.fillText(`🌸 ${p2Name}`, 440, 425);
        ctx.fillStyle = '#334155';
        ctx.font = '14px Padauk, sans-serif';
        wrapText(ctx, document.getElementById('p2ReadingText').textContent.slice(0, 220) + '...', 440, 460, 290, 22);

        // Dynamic Insight Box
        ctx.fillStyle = 'rgba(243, 232, 255, 0.9)';
        ctx.beginPath();
        ctx.roundRect(50, 670, 700, 200, 20);
        ctx.fill();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#7e22ce';
        ctx.font = 'bold 18px Fredoka, Padauk, sans-serif';
        ctx.fillText("✨ Dynamic Synergy Insight", 70, 705);
        ctx.fillStyle = '#334155';
        ctx.font = '14px Padauk, sans-serif';
        wrapText(ctx, document.getElementById('dynamicInsightText').textContent.slice(0, 320) + '...', 70, 740, 660, 24);

        // Final Advice Box
        ctx.fillStyle = 'rgba(254, 243, 199, 0.95)';
        ctx.beginPath();
        ctx.roundRect(50, 890, 700, 160, 20);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 18px Fredoka, Padauk, sans-serif';
        ctx.fillText("👑 Tomo's Final Advice", 70, 925);
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 14px Padauk, sans-serif';
        wrapText(ctx, document.getElementById('finalAdviceText').textContent.slice(0, 250) + '...', 70, 960, 660, 24);

        // Footer
        ctx.fillStyle = '#ec4899';
        ctx.font = '12px Quicksand, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Generated by Tomo's Destiny Matcher · Powered by Gemini 3.1 Flash Lite 🌸", 400, 1105);

        // Trigger Download
        const link = document.createElement('a');
        link.download = `Tomo_Destiny_${p1Name}_${p2Name}.png`.replace(/\s+/g, '_');
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // Canvas Text Wrapping Helper
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

    // Toast Notification System
    function showToast(msg, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `pointer-events-auto px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all duration-300 border transform translate-y-2 opacity-0 ${
            type === 'success' 
                ? 'bg-emerald-50/95 border-emerald-300 text-emerald-800' 
                : type === 'warning' 
                ? 'bg-amber-50/95 border-amber-300 text-amber-800' 
                : 'bg-pink-50/95 border-pink-300 text-pink-800'
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

    function showError(msg) {
        showToast(msg, 'warning');
    }

    function hideError() {
        // Handled by toast
    }
});
