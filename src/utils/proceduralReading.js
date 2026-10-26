import { normalizePersonName } from './reading.js';
import {
  STORY_TOPICS, MOON_PROMPTS, SHARED_MOON_PROMPTS, NUMBER_PROMPTS, SCORE_STORIES,
  ELEMENT_PAIR_STORIES, CHINESE_ELEMENT_SCENES, ANIMAL_NAMES, DAY_NAMES, DAY_RITUALS
} from './readingStoryLibrary.js';

// Curated stories, not generated assessments. Each voice has two sets of
// profile openings so the two people do not receive the same introduction.
const VOICES = {
  Sweet: {
    title: 'နေ့စဉ်ဂရုစိုက်မှုလေးတွေထဲမှာ နွေးထွေးလာနိုင်တဲ့',
    opening: ['အနားမှာ သက်သောင့်သက်သာ ရှိနေရတာက အဖိုးတန်တဲ့ အတွေ့အကြုံတစ်ခု ဖြစ်နိုင်တယ်။', 'တစ်နေ့တာ အဆင်မပြေမှုတွေကို တစ်ယောက်တည်း ဖြေရှင်းဖို့ မလိုတဲ့အချိန်လည်း ရှိတတ်တယ်။', 'စကားပြောတဲ့အချိန် အဖြေထက် နားထောင်ပေးမှုကို ပိုလိုအပ်နိုင်တယ်။', 'သေးငယ်တဲ့ ဂရုစိုက်မှုတစ်ခုကလည်း ကိုယ့်ကို အလေးထားတယ်ဆိုတဲ့ ခံစားချက် ပေးနိုင်တယ်။', 'ကိုယ့်အကြိုက်ကို ရိုးရိုးသားသား ပြောခွင့်ရတဲ့နေရာကနေ ရင်းနှီးမှုတစ်ခု စနိုင်တယ်။', 'အားမရှိတဲ့နေ့မှာ နားဖို့ အချိန်တောင်းတာလည်း ကိုယ့်ကိုယ်ကို ဂရုစိုက်တဲ့နည်းတစ်ခုပါ။', 'ကိုယ့်စကားကို ဘယ်လိုနားထောင်ပေးစေချင်လဲ ပြောပြလို့ရတယ်။', 'စေတနာကို တစ်ဖက်လူ အဆင်ပြေတဲ့နည်းနဲ့ ဖော်ပြနိုင်ဖို့ ခဏမေးကြည့်ရအောင်။'],
    scenes: ['ပင်ပန်းတဲ့နေ့မှာ အေးအေးဆေးဆေး နားထောင်ပေးမယ့်အချိန် တစ်ခု ရွေးကြည့်ပါ။', 'ပျော်စရာသတင်းတစ်ခု ရလာရင် အလုပ်ရှုပ်နေတာ ခဏရပ်ပြီး အတူဝမ်းသာပေးကြည့်ပါ။', 'တစ်ဖက်လူ အဆင်မပြေတာကို သိရင် အကြံပေးစေချင်လား၊ နားထောင်ပေးစေချင်လား အရင်မေးနိုင်တယ်။'],
    strengths: ['ဂရုစိုက်မှုကို စကားလုံးအကြီးကြီးနဲ့ပဲ ဖော်ပြဖို့ မလိုပါဘူး။', 'ကိုယ့်အကြောင်း ပြောဖို့ အလှည့်ရသလို တစ်ဖက်လူအတွက်လည်း နေရာပေးနိုင်တယ်။', 'နှစ်ယောက်လုံး သက်သောင့်သက်သာ ရှိတဲ့အချိန်က အမှတ်တရကောင်းတစ်ခု ဖြစ်လာနိုင်တယ်။'],
    challenges: ['မပြောရသေးတဲ့ လိုအပ်ချက်ကို တစ်ဖက်လူ အလိုလို သိမယ်လို့ ယူဆမိနိုင်တယ်။', 'လက်ခံပေးလိုစိတ်နဲ့ ကိုယ့်အကြိုက်ကို အမြဲဖုံးထားဖို့ မလိုပါဘူး။', 'အလုပ်များတဲ့နေ့မှာ တုံ့ပြန်မှုနည်းတာကို ဂရုမစိုက်တော့ဘူးလို့ အဓိပ္ပာယ် မကောက်လိုက်ပါနဲ့။'],
    reflection: 'သတိရပေးတာ၊ အချိန်ပေးတာနဲ့ ပြောခဲ့တဲ့စကားတစ်ခုကို မှတ်မိပေးတာတွေက နွေးထွေးမှု ဖြစ်လာနိုင်တယ်။ ကြီးမားတဲ့ ကတိတစ်ခုထက် ဒီနေ့ လုပ်ပေးနိုင်တဲ့ အရာလေးတစ်ခုကို စဉ်းစားကြည့်ပါ။',
    question: 'ဒီအပတ် မင်းအတွက် ငါလုပ်ပေးနိုင်တဲ့ အကူအညီလေးတစ်ခုက ဘာလဲ။'
  },
  Playful: {
    title: 'အစီအစဉ်လွဲလည်း ရယ်စရာအမှတ်တရ ရှာတွေ့နိုင်တဲ့',
    opening: ['နှစ်ယောက်အကြောင်းကို ပျော်စရာ ဇာတ်လမ်းတစ်ပုဒ်လို စကြည့်ရအောင်။', 'အစီအစဉ်လွဲတဲ့နေ့မှာတောင် ပြန်ပြောရင် ရယ်ရမယ့် အခန်းတစ်ခန်း ရနိုင်သေးတယ်။', 'စကားပြောတာက အနိုင်ရသူ ဆုယူရတဲ့ ပြိုင်ပွဲတော့ မဟုတ်ပါဘူး။', 'တစ်ယောက်နဲ့တစ်ယောက် ပိုသိလာဖို့ စမ်းသပ်ပွဲလေးတစ်ခု ဖွင့်ကြည့်နိုင်တယ်။', 'ကိုယ့်ဇာတ်ကောင်ကို ကိုယ်ရွေးရတဲ့ ကစားပွဲတစ်ခုလို ဒီစာမျက်နှာကို ဖတ်ကြည့်ရအောင်။', 'အားကုန်တဲ့နေ့မှာတော့ ပျော်စရာအစီအစဉ်ကို ခဏရပ်တဲ့ခလုတ်လည်း ရှိဖို့လိုတယ်။', 'တစ်ဖက်လူရဲ့အတွေးကို ခန့်မှန်းရတဲ့ကစားပွဲထက် တိုက်ရိုက်မေးတာက အချိန်ကုန်သက်သာနိုင်တယ်။', 'အခုတစ်ခေါက် စမ်းသပ်ပွဲမှာ အနိုင်ရသူတစ်ယောက် ရွေးဖို့ မလိုပါဘူး။'],
    scenes: ['တစ်ယောက်ကို ရွေးချယ်ခွင့် သုံးခုစီပေးပြီး အကြိုက်တူတာကို ရှာတဲ့ ကစားပွဲ လုပ်ကြည့်ပါ။', 'အလှည့်ကျ စီစဉ်သူလုပ်ပြီး ပျော်စရာ အစီအစဉ်တစ်ခုစီ တင်ပြကြည့်ပါ။', 'ဘယ်သူ့အကြံလဲဆိုတာ မပြောဘဲ စာရွက်ပေါ်မှာ ရေးပြီး မဲဖောက်ကြည့်နိုင်တယ်။'],
    strengths: ['နှစ်ယောက်လုံး သဘောကျတဲ့ ဟာသတစ်ခုက နေ့တစ်နေ့ကို ပေါ့ပါးစေနိုင်တယ်။', 'အကြိုက်မတူတာက ရှုံးနိမ့်မှု မဟုတ်ဘဲ ရွေးချယ်စရာစာရင်း ပိုရှည်လာတာလို့ မြင်ကြည့်ပါ။', 'အတူလုပ်တဲ့ ကိစ္စတစ်ခုမှာ အားသာချက်တွေကို အလှည့်ကျ ထုတ်သုံးလို့ရနိုင်တယ်။'],
    challenges: ['စနောက်ဖို့ ရွေးလိုက်တဲ့အချိန်က တစ်ဖက်လူအတွက် အဆင်မပြေတဲ့အချိန် ဖြစ်နေနိုင်တယ်။', 'နှစ်ယောက်စလုံး စီစဉ်သူဖြစ်ချင်ရင် အစည်းအဝေးက လက်ဖက်ရည်အေးတဲ့အထိ ကြာနိုင်တယ်။', 'စာတိုအဖြေ မလာသေးတာကို စုံထောက်ဇာတ်လမ်းတစ်ပုဒ် စရေးဖို့တော့ မလိုသေးပါဘူး။'],
    reflection: 'နှစ်ယောက်ရဲ့ အမှတ်တရစာအုပ်မှာ အစီအစဉ်အောင်မြင်တဲ့နေ့တွေပဲ ပါဖို့ မလိုပါဘူး။ တစ်ယောက်ကိုတစ်ယောက် အဆင်ပြေရဲ့လား မေးဖို့ မမေ့ရင် အလွဲလေးတစ်ခုကလည်း ပြန်ပြောစရာ ဖြစ်နိုင်တယ်။',
    question: 'ဒီအပတ် ပျော်စရာအစီအစဉ်ကို မင်းစီစဉ်မလား၊ ငါ့ကို မဲဖောက်ရွေးခိုင်းမလား။'
  },
  Mystic: {
    title: 'မတူတဲ့အလင်းနှစ်စင်းက ဆုံမှတ်ရှာတွေ့နိုင်တဲ့',
    opening: ['လူတစ်ယောက်ရဲ့ ပုံရိပ်ကို အလင်းရောင်တစ်စင်းလို စိတ်ကူးကြည့်ရအောင်။', 'ညကောင်းကင်မှာ တိမ်ဖုံးနေသလို ကိုယ့်ခံစားချက်ကို မရှင်းလင်းသေးတဲ့အချိန် ရှိနိုင်တယ်။', 'အလင်းနှစ်စင်းကြားက နေရာလွတ်မှာ ပြောစရာစကားတစ်ခု ရှိနေနိုင်တယ်။', 'ခြေလှမ်းတစ်လှမ်းစီက ဘယ်လမ်းကို သွားချင်လဲဆိုတဲ့ မေးခွန်းကို ဖြေပေးနိုင်တယ်။', 'သစ်ပင်တစ်ပင်ရဲ့ အရိပ်လို ကိုယ့်အတွက် အေးချမ်းရာနေရာကို စဉ်းစားကြည့်ရအောင်။', 'ရေပြင်ငြိမ်မှ အောက်ခြေကို မြင်ရသလို ခံစားချက်တစ်ခုကို အချိန်ပေးကြည့်နိုင်တယ်။', 'စကားလုံးတစ်ခုက လမ်းညွှန်မီးအိမ်လို ကိုယ်သွားချင်ရာကို ပြနိုင်တယ်။', 'ရာသီတစ်ခု ပြောင်းသလို နေ့စဉ်အလေ့အထတစ်ခုကို ဖြည်းဖြည်း ပြောင်းကြည့်နိုင်တယ်။'],
    scenes: ['တိတ်ဆိတ်တဲ့အချိန်တစ်ခု ရွေးပြီး ဒီနေ့ ကိုယ့်စိတ်ကို ရာသီဥတုတစ်ခုနဲ့ နှိုင်းပြောကြည့်ပါ။', 'ကိုယ့်အတွက် အရေးပါတဲ့ အမှတ်တရနေရာတစ်ခုရဲ့ အကြောင်းကို အလှည့်ကျ ပြောပြနိုင်တယ်။', 'နောက်တစ်ပတ်မှာ ဘာကို အချိန်ပေးချင်လဲဆိုတာ မီးအိမ်တစ်လုံး ထွန်းသလို ရှင်းရှင်းလင်းလင်း ရွေးကြည့်ပါ။'],
    strengths: ['လမ်းနှစ်သွယ် ဆုံတဲ့နေရာမှာ တစ်ယောက်မမြင်ဖူးတဲ့ ရှုခင်းကို တွေ့နိုင်တယ်။', 'အလင်းရောင်တစ်မျိုးတည်းနဲ့ မမြင်ရတဲ့ အရောင်ကို နောက်အလင်းတစ်စင်းက ပြပေးနိုင်တယ်။', 'ရာသီတိုင်းမှာ ပန်းမပွင့်ပေမယ့် အမြစ်ကို ရေလောင်းပေးလို့ရတယ်။'],
    challenges: ['လှိုင်းတက်ချိန်နဲ့ လှိုင်းကျချိန် မတူသလို စကားပြောဖို့ အဆင်သင့်ဖြစ်ချိန် မတူနိုင်တယ်။', 'လမ်းဆုံမှာ တစ်ယောက်က အရှေ့ကိုကြည့်ပြီး တစ်ယောက်က အနောက်ကိုကြည့်နေနိုင်တယ်။', 'တိတ်ဆိတ်မှုက အဓိပ္ပာယ်အများကြီး ရှိနိုင်ပေမယ့် ဘယ်အဓိပ္ပာယ်လဲဆိုတာ ကြယ်တွေကို မေးလို့ မသိနိုင်ပါဘူး။'],
    reflection: 'ကြယ်ပုံတစ်ခု ဖြစ်လာဖို့ အလင်းစက်တွေက နေရာတစ်ခုတည်းမှာ ကပ်နေဖို့ မလိုပါဘူး။ အကွာအဝေးကို လေးစားရင်း ဆက်သွယ်ပေးတဲ့ မျဉ်းတစ်ကြောင်းကို နေ့စဉ်အပြုအမူတွေနဲ့ ဆွဲနိုင်တယ်။',
    question: 'လာမယ့်ရက်တွေမှာ မင်းရဲ့လမ်းကို ပိုလင်းစေဖို့ ငါ ဘယ်နေရာမှာ အတူရပ်ပေးနိုင်မလဲ။'
  }
};

const MODES = {
  Friends: {
    bond: 'သူငယ်ချင်း', frame: 'မိတ်ဆွေအပေါင်းအသင်းကြားက ကိုယ့်အခန်းကဏ္ဍ',
    ritual: 'သူငယ်ချင်းနဲ့ စမ်းလုပ်ပြီးရင် နောက်တစ်ခါ အတူလုပ်ချင်သေးလား ပြန်မေးကြည့်ပါ။ အခြားသူငယ်ချင်းတွေကိုပါ ဖိတ်ချင်သလား နှစ်ယောက် တိုင်ပင်နိုင်တယ်။'
  },
  Couple: {
    bond: 'ချစ်သူ', frame: 'အချစ်ရေးထဲမှာ ဖော်ပြချင်တဲ့ ဂရုစိုက်မှု',
    ritual: 'ချစ်သူနဲ့ နှစ်ယောက်တည်း စမ်းလုပ်ဖို့ အချိန်တိုတို ရွေးထားနိုင်တယ်။ တွေ့ပြီးရင် ဘယ်အပိုင်းကို ပိုသဘောကျလဲ တစ်ယောက်စီ ပြောကြည့်ပါ။'
  }
};
const ELEMENTS = {
  Fire: 'စိတ်ကူးရတာနဲ့ စမ်းလုပ်ကြည့်ချင်တဲ့ ပုံရိပ်',
  Earth: 'တစ်ဆင့်ချင်း စီစဉ်ပြီး တည်ငြိမ်မှု ရှာချင်တဲ့ ပုံရိပ်',
  Air: 'အတွေးအသစ်နဲ့ မတူတဲ့အမြင်တွေကို ဖလှယ်ချင်တဲ့ ပုံရိပ်',
  Water: 'ခံစားချက်နဲ့ ပတ်ဝန်းကျင်အခြေအနေကို အချိန်ပေးနားထောင်ချင်တဲ့ ပုံရိပ်'
};

const SIGN_SCENES = {
  Aries: 'ကိုယ်က အရင်စတင်ချင်တဲ့ အစီအစဉ်တစ်ခုကို တစ်ဖက်လူပါ စိတ်ဝင်စားလား အရင်မေးကြည့်နိုင်တယ်။',
  Taurus: 'အကျွမ်းတဝင်ရှိတဲ့ နေရာတစ်ခုကိုပဲ သွားချင်သလား၊ အသစ်တစ်ခု စမ်းချင်သလား ရွေးချယ်ကြည့်နိုင်တယ်။',
  Gemini: 'ခေါင်းထဲမှာ စိတ်ကူးအများကြီးရှိတဲ့နေ့ဆိုရင် အတူစမ်းချင်ဆုံး တစ်ခုကိုပဲ အရင်ရွေးကြည့်နိုင်တယ်။',
  Cancer: 'သက်သောင့်သက်သာရှိတဲ့ နေရာမှာ အချိန်ဖြုန်းတာနဲ့ လူများတဲ့နေရာသွားတာ ဘယ်ဟာပိုအဆင်ပြေလဲ မေးကြည့်နိုင်တယ်။',
  Leo: 'ကိုယ်စီစဉ်ထားတဲ့ အစီအစဉ်တစ်ခုကို မျှဝေရင်း တစ်ဖက်လူရဲ့ စိတ်ကူးအတွက်လည်း နေရာချန်ထားနိုင်တယ်။',
  Virgo: 'ခရီးတိုတစ်ခုအတွက် အသေးစိတ်စာရင်းလုပ်ရင် မဖြစ်မနေလုပ်ရမယ့်အရာနဲ့ လွတ်လွတ်လပ်လပ်ရွေးလို့ရတာကို ခွဲထားနိုင်တယ်။',
  Libra: 'နှစ်ယောက်လုံး အဆင်ပြေဖို့ ကြိုးစားရင်း ကိုယ်တကယ်လိုချင်တာကို မပြောမိဘူးလား ပြန်စဉ်းစားကြည့်နိုင်တယ်။',
  Scorpio: 'အရေးကြီးတဲ့အကြောင်းအရာတစ်ခု မျှဝေဖို့ အဆင်သင့်ဖြစ်မဖြစ် ကိုယ့်ကိုယ်ကို အရင်မေးကြည့်နိုင်တယ်။',
  Sagittarius: 'မသွားဖူးတဲ့ နေရာတစ်ခု စမ်းချင်ရင် တစ်ဖက်လူရဲ့ အချိန်နဲ့ အဆင်ပြေမှုကိုပါ ထည့်တိုင်ပင်နိုင်တယ်။',
  Capricorn: 'ရည်ရွယ်ချက်တစ်ခုအတွက် အလုပ်လုပ်နေတဲ့အချိန် အတူနားဖို့ အချိန်လေးတစ်ခု ချန်ထားနိုင်တယ်။',
  Aquarius: 'ကိုယ့်အမြင်နဲ့ မတူတဲ့ စိတ်ကူးတစ်ခု ကြားရင် ဘာကြောင့် အဲဒီလိုစဉ်းစားလဲလို့ စိတ်ဝင်စားစွာ မေးကြည့်နိုင်တယ်။',
  Pisces: 'ပြောချင်တာကို စကားနဲ့ မဖော်ပြရသေးရင် ပုံတစ်ပုံ၊ သီချင်းတစ်ပုဒ် ဒါမှမဟုတ် မှတ်စုတစ်ခုကနေ စပြောကြည့်နိုင်တယ်။'
};

// A stable local shuffle gives each pair a reusable story without network,
// browser storage, timestamps or Math.random. Normalized names and explicit
// chart fields seed it.
function hashStory(value) {
  let hash = 2166136261;
  for (const symbol of value) hash = Math.imul(hash ^ symbol.codePointAt(0), 16777619);
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  return hash >>> 0;
}

function personKey(name, metrics = {}) {
  return JSON.stringify([name, ...[
    'western', 'westernElement', 'moonSign', 'moonElement', 'venusSign', 'marsSign',
    'dayIndex', 'mahaboteHouse', 'animal', 'elementKey', 'lifePathNumber', 'destinyNumber'
  ].map(key => metrics?.[key] ?? null)]);
}

const GENERIC_MOON = 'အတွင်းစိတ်အကြောင်း စဉ်းစားတဲ့အခါ ပင်ပန်းတဲ့နေ့မှာ ကိုယ်ဘာလိုအပ်လဲကနေ စနိုင်တယ်။ စကားပြောချင်တာနဲ့ တိတ်တိတ်နေချင်တာ ဘယ်ဟာပိုအဆင်ပြေလဲ ကိုယ့်အတွေ့အကြုံကို ပြန်ကြည့်ပါ။';
const GENERIC_MOON_SECOND = 'အားမရှိတဲ့အချိန်မှာ ကိုယ့်အတွက် ဘာအဆင်ပြေစေမလဲ စဉ်းစားကြည့်ပါ။ နေရာပြောင်းထိုင်တာ၊ စားစရာတစ်ခု ပြင်ဆင်တာနဲ့ တိတ်ဆိတ်တဲ့အချိန်ယူတာထဲက တစ်ခုကို ရွေးပြောကြည့်နိုင်တယ်။';
const GENERIC_NUMBER = 'ကိုယ့်အကြောင်း ပြောချင်တဲ့အချက်တစ်ခုကို ရွေးပြီး နမူနာတစ်ခုနဲ့ ရှင်းပြကြည့်ပါ။ တစ်ဖက်လူရဲ့အကြောင်းကိုလည်း အလားတူ မေးပြီး နားလည်ထားတာ မှန်မမှန် ပြန်စစ်နိုင်တယ်။';
const GENERIC_NUMBER_SECOND = 'နေ့တစ်နေ့အကြောင်း ပြန်ပြောတဲ့အခါ ကိုယ်အမှတ်မိဆုံးအပိုင်းကနေ စကြည့်ပါ။ တစ်ဖက်လူ ကြားချင်တဲ့အသေးစိတ်ကိုပါ မေးခွင့်ပေးရင် တစ်ယောက်နဲ့တစ်ယောက် စိတ်ဝင်စားပုံကို ပိုသိလာနိုင်တယ်။';

function storyNumber(metrics) {
  return [metrics?.lifePathNumber, metrics?.destinyNumber].find(number => Number.isInteger(number) && Object.hasOwn(NUMBER_PROMPTS, number));
}

function numberPrompt(metrics, other, rank) {
  const number = storyNumber(metrics);
  if (!number) return rank ? GENERIC_NUMBER_SECOND : GENERIC_NUMBER;
  if (rank && number === storyNumber(other)) {
    return 'ဇာတ်လမ်းထဲက ဂဏန်းတူနေပေမယ့် နှစ်ယောက်ရဲ့အတွေ့အကြုံ တူဖို့မလိုပါဘူး။ တစ်ဖက်လူ ပြောပြီးရင် ကိုယ့်အတွက် အလားတူဖြစ်ခဲ့တဲ့နေ့တစ်နေ့ကို မျှဝေကြည့်ပါ။ ဘယ်အပိုင်းက တူပြီး ဘယ်အပိုင်းက မတူလဲဆိုတာကို အတူစဉ်းစားနိုင်တယ်။';
  }
  const label = number === metrics?.lifePathNumber ? 'ဘဝလမ်းကြောင်းဂဏန်း' : 'နာမည်ဂဏန်း';
  return rank
    ? `ဒီ${label}ကို စရိုက်သတ်မှတ်ချက်အစား စမ်းကြည့်စရာတစ်ခု ရွေးဖို့ သုံးထားတယ်။ ${NUMBER_PROMPTS[number]}`
    : `${label}ကို စကားစတစ်ခုအဖြစ်ပဲ သုံးကြည့်ရအောင်။ ${NUMBER_PROMPTS[number]}`;
}

function chineseStory(first, second) {
  const animals = [first?.animal, second?.animal].map(animal => Object.hasOwn(ANIMAL_NAMES, animal) ? ANIMAL_NAMES[animal] : null);
  const animalStory = animals.every(Boolean)
    ? `တရုတ်နှစ်သင်္ကေတထဲက ${animals[0]}နဲ့ ${animals[1]}ကို ဇာတ်လမ်းထဲက ခရီးဖော်နှစ်ဦးလို စိတ်ကူးကြည့်နိုင်တယ်။`
    : 'ဇာတ်လမ်းထဲမှာ နှစ်ယောက်စလုံး စိတ်ကူးတစ်ခုစီ ထည့်ပေးဖို့ နေရာရှိတယ်။';
  const elements = [...new Set([first?.elementKey, second?.elementKey])].sort();
  const scenes = elements.filter(element => Object.hasOwn(CHINESE_ELEMENT_SCENES, element)).map(element => CHINESE_ELEMENT_SCENES[element]);
  return [animalStory, ...scenes].join(' ');
}

export function generateDeepProceduralReading(p1Name, p1Secret, p2Name, p2Secret, relType, mood, score) {
  const names = [normalizePersonName(p1Name), normalizePersonName(p2Name)];
  const modeKey = Object.hasOwn(MODES, relType) ? relType : 'Friends';
  const voiceKey = Object.hasOwn(VOICES, mood) ? mood : 'Sweet';
  const mode = MODES[modeKey], voice = VOICES[voiceKey];
  const metrics = [p1Secret, p2Secret];
  const keys = names.map((name, index) => personKey(name, metrics[index]));
  const pairSeed = JSON.stringify([modeKey, voiceKey, [...keys].sort()]);
  const topics = [...STORY_TOPICS].sort((a, b) => hashStory(pairSeed + a.id) - hashStory(pairSeed + b.id) || (a.id < b.id ? -1 : 1));
  const scoreStory = SCORE_STORIES.find(story => Number.isFinite(score) && score >= story.minimum) || SCORE_STORIES[1];
  const join = (...parts) => parts.filter(Boolean).join(' ');
  const headings = ['ပင်ကိုစတိုင်', 'အဆင်မပြေတတ်တဲ့အချိန်', 'စကားပြောပုံ', 'စမ်းကြည့်နိုင်တဲ့အရာ'];
  const profile = (person, index) => {
    const name = names[index], other = names[1 - index];
    const otherMetrics = metrics[1 - index];
    // Assign openings by identity rather than input position, except when both
    // identities are exactly identical and still need two different profiles.
    const rank = keys[0] <= keys[1] ? index : 1 - index;
    const opening = voice.opening.slice(rank * 4, rank * 4 + 4);
    const symbol = Object.hasOwn(ELEMENTS, person?.westernElement) ? ELEMENTS[person.westernElement] : 'ကိုယ်နှစ်သက်တဲ့အရာကို ပြန်ရှာကြည့်တဲ့ ပုံရိပ်';
    const knownSign = Object.hasOwn(SIGN_SCENES, person?.western);
    const sign = rank && knownSign && person.western === otherMetrics?.western
      ? 'ရာသီသင်္ကေတချင်း တူနေပေမယ့် အကြိုက်ချင်း တူမယ်လို့ ကြိုယူဆဖို့ မလိုပါဘူး။ နောက်ဆုံရင် လုပ်ချင်တဲ့အရာတစ်ခုစီ ရွေးပြီး ဘာကြောင့်ကြိုက်လဲ ပြောကြည့်နိုင်တယ်။'
      : knownSign ? SIGN_SCENES[person.western] : rank
        ? 'ကိုယ်နှစ်သက်တဲ့အရာတစ်ခုကို ဘာကြောင့်ကြိုက်လဲ ရှင်းပြပြီး တစ်ဖက်လူ ဘယ်လိုမြင်လဲ မေးကြည့်နိုင်တယ်။'
        : 'အစီအစဉ်တစ်ခုမှာ ကိုယ်ရွေးချင်တာကို ရှင်းပြပြီး တစ်ဖက်လူကိုလည်း ရွေးခွင့်ပေးကြည့်နိုင်တယ်။';
    const knownMoon = Object.hasOwn(MOON_PROMPTS, person?.moonElement);
    const moon = knownMoon
      ? (rank && person.moonElement === otherMetrics?.moonElement ? SHARED_MOON_PROMPTS : MOON_PROMPTS)[person.moonElement]
      : rank ? GENERIC_MOON_SECOND : GENERIC_MOON;
    const day = person?.dayIndex;
    const knownDay = Number.isInteger(day) && day >= 0 && day < DAY_NAMES.length;
    const ritual = rank && knownDay && day === otherMetrics?.dayIndex
      ? join(`မဟာဘုတ်ထဲက ${DAY_NAMES[day]}မွေးနေ့သင်္ကေတ နှစ်ယောက်တူနေရင်လည်း မတူတဲ့အခန်းကဏ္ဍကနေ စမ်းကြည့်လို့ရတယ်။`, topics[6].action)
      : knownDay ? `မဟာဘုတ်ထဲက ${DAY_NAMES[day]}မွေးနေ့သင်္ကေတကို လှုပ်ရှားမှုတစ်ခု ရွေးဖို့ သုံးကြည့်ပါ။ ${DAY_RITUALS[day]}`
        : rank ? 'တစ်ခါတည်း အများကြီး မလုပ်ဘဲ အတူစမ်းပြီးမှ နောက်တစ်ဆင့် ရွေးနိုင်တယ်။'
          : 'လုပ်ကြည့်ချင်တဲ့အရာတစ်ခုအတွက် နှစ်ယောက်လုံး အားတဲ့အချိန်ကို ကြိုရွေးထားနိုင်တယ်။';
    const blocks = [
      join(opening[0], `${name} အတွက် ${mode.frame}ကို စဉ်းစားတဲ့အခါ ${symbol}ကို ဇာတ်လမ်းရဲ့ အစအဖြစ် သုံးကြည့်နိုင်တယ်။`, sign),
      join(opening[1], moon, `${other} ကို အဆင်ပြေနေသလို ပြဖို့ မလိုဘဲ ဒီနေ့ ဘာလိုအပ်လဲဆိုတာ တစ်ခုတည်းကနေ စပြောကြည့်နိုင်တယ်။`),
      join(opening[2], numberPrompt(person, otherMetrics, rank), `${name} ပြောချင်တာနဲ့ ${other} နားလည်ထားတာ တူမတူ နမူနာတစ်ခု မေးကြည့်ရင် စကားဝိုင်းက ပိုရှင်းလာနိုင်တယ်။`),
      join(opening[3], ritual, topics[rank].scene[modeKey])
    ];
    return blocks.map((block, i) => `[${headings[i]}]\n${block}`).join('\n\n');
  };
  const elementPair = [p1Secret?.westernElement, p2Secret?.westernElement].sort().join('/');
  const sharedRhythm = Object.hasOwn(ELEMENT_PAIR_STORIES, elementPair)
    ? ELEMENT_PAIR_STORIES[elementPair]
    : 'နှစ်ယောက်ရဲ့အကြိုက်တူတဲ့အရာတစ်ခုနဲ့ မတူတဲ့အရာတစ်ခုစီ ပြောကြည့်ပါ။ အတူလုပ်မယ့်ကိစ္စမှာ ဘယ်အပိုင်းကို တစ်ယောက်စီ ရွေးချင်လဲ တိုင်ပင်နိုင်တယ်။';
  return {
    chemistry_score: score,
    relationship_title: `${voice.title} ${mode.bond}နှစ်ဦး — ${topics[0].label}`,
    tomo_deep_reading_p1: profile(p1Secret, 0),
    tomo_deep_reading_p2: profile(p2Secret, 1),
    tomo_dynamic_insight: [
      join(`${names[0]} နဲ့ ${names[1]} တို့ရဲ့ ${mode.bond}ဇာတ်လမ်းမှာ သင်္ကေတတွေကို စကားစအဖြစ်ပဲ သုံးထားတယ်။`, scoreStory.opening, sharedRhythm),
      join(voice.scenes[0], chineseStory(p1Secret, p2Secret), topics[2].scene[modeKey]),
      join(voice.scenes[1], topics[3].scene[modeKey], topics[4].question)
    ].join('\n\n'),
    tomo_strengths: topics.slice(5).map((topic, i) => join(voice.strengths[i], topic.strength[modeKey])),
    tomo_challenges: topics.slice(5).map((topic, i) => join(voice.challenges[i], topic.challenge[modeKey])),
    tomo_secret_advice: [
      join(`${names[0]} နဲ့ ${names[1]} တို့ရဲ့ ${mode.bond}ဆက်ဆံရေးအတွက် ဒီစာထဲက ကိုက်ညီတဲ့အပိုင်းကိုပဲ ယူနိုင်တယ်။`, voice.reflection, scoreStory.advice),
      join(topics[7].action, mode.ritual, voice.question)
    ].join('\n\n')
  };
}
