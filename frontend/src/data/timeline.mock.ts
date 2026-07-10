import type { TimelineDay, TimelineEvent } from "@/types/timeline";

/**
 * Seed events based on publicly reported June 2025 Iran–Israel–US escalation
 * (12-day conflict). Framed for the defense calendar: enemy actions vs Iranian responses.
 * Sources summarized from major international reporting (Al Jazeera, Economist, etc.).
 */

function persianParts(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`);
  const weekday = new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(
    date,
  );
  const persianDate = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
  return { weekday, persianDate };
}

function eventBase(
  partial: Omit<TimelineEvent, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): TimelineEvent {
  const iso = `${partial.date}T${partial.time}:00Z`;
  return {
    ...partial,
    createdAt: partial.createdAt ?? iso,
    updatedAt: partial.updatedAt ?? iso,
  };
}

const IMG = {
  strike:
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=480&fit=crop",
  missile:
    "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&h=480&fit=crop",
  radar:
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=480&fit=crop",
  diplomacy:
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=480&fit=crop",
  base: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=480&fit=crop",
  city: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=480&fit=crop",
} as const;

/** Flat list of curated conflict events (Gregorian dates). */
export const conflictSeedEvents: TimelineEvent[] = [
  eventBase({
    id: "e-20250613-rising-lion",
    eventType: "enemy",
    title: "آغاز عملیات Rising Lion؛ حمله گسترده به تأسیسات هسته‌ای و نظامی",
    summary:
      "رژیم صهیونیستی با موج گسترده حملات هوایی به تأسیسات هسته‌ای نطنز و اصفهان و مراکز فرماندهی، جنگ ۱۲روزه را آغاز کرد.",
    description:
      "طبق گزارش‌های بین‌المللی، بیش از ۲۰۰ جنگنده در موج اول به بیش از ۱۰۰ هدف نظامی و هسته‌ای در ایران حمله کردند. فرماندهان ارشد و دانشمندان هسته‌ای نیز هدف قرار گرفتند.",
    impact: "افزایش سطح آماده‌باش ملی؛ آسیب به زیرساخت‌های حساس؛ تلفات انسانی.",
    date: "2025-06-13",
    time: "03:30",
    severity: "critical",
    verificationStatus: "verified",
    category: "حمله هوایی",
    location: { province: "اصفهان", city: "نطنز" },
    source: "رصد رسانه‌های بین‌المللی / Al Jazeera",
    imageUrl: IMG.strike,
    media: [
      {
        id: "e-20250613-rising-lion-m1",
        type: "image",
        url: IMG.strike,
        thumbnailUrl: IMG.strike,
        title: "تصویر نمادین صحنه درگیری",
      },
    ],
    tags: ["اسرائیل", "نطنز", "اصفهان", "Rising Lion"],
    relatedEventIds: [],
    relatedResponseIds: ["g-20250613-air-defense", "g-20250613-retaliation-start"],
    commentsCount: 12,
  }),
  eventBase({
    id: "g-20250613-air-defense",
    eventType: "government",
    title: "فعال‌سازی کامل شبکه پدافند هوایی و اعلام وضعیت ویژه",
    summary:
      "نیروهای پدافند هوایی و ستادهای عملیاتی برای مقابله با موج حملات دشمن در حالت آماده‌باش کامل قرار گرفتند.",
    description:
      "سامانه‌های پدافندی در استان‌های مرکزی و غربی فعال شد و هشدارهای مردمی برای پناهگیری صادر گردید.",
    date: "2025-06-13",
    time: "04:15",
    severity: "critical",
    verificationStatus: "published",
    actionStatus: "in_progress",
    category: "پدافند هوایی",
    location: { province: "تهران", city: "تهران" },
    organization: "نیروی پدافند هوایی",
    source: "سخنگوی پدافند",
    imageUrl: IMG.radar,
    tags: ["پدافند", "آماده‌باش"],
    relatedEventIds: ["e-20250613-rising-lion"],
    relatedResponseIds: [],
    responseTimeMinutes: 45,
    commentsCount: 8,
  }),
  eventBase({
    id: "g-20250613-retaliation-start",
    eventType: "government",
    title: "آغاز پاسخ موشکی و پهپادی به اهداف در سرزمین‌های اشغالی",
    summary:
      "ایران موج اول پاسخ را با پرتاب موشک‌های بالستیک و پهپاد به سمت اهداف نظامی و شهری در اسرائیل آغاز کرد.",
    description:
      "گزارش‌ها از شلیک صدها پهپاد و موشک در روزهای نخست حکایت دارد؛ بخش عمده‌ای با کمک آمریکا رهگیری شد اما برخی به مناطق مسکونی اصابت کرد.",
    date: "2025-06-13",
    time: "18:40",
    severity: "high",
    verificationStatus: "published",
    actionStatus: "completed",
    category: "پاسخ موشکی",
    location: { province: "کرمانشاه", city: "کرمانشاه" },
    organization: "نیروی هوافضای سپاه",
    source: "رصد میدانی / گزارش‌های بین‌المللی",
    imageUrl: IMG.missile,
    tags: ["پاسخ", "موشک", "پهپاد"],
    relatedEventIds: ["e-20250613-rising-lion"],
    relatedResponseIds: [],
    responseTimeMinutes: 910,
    commentsCount: 15,
  }),
  eventBase({
    id: "e-20250614-continued-strikes",
    eventType: "enemy",
    title: "ادامه حملات به پایگاه‌های موشکی و پدافندی غرب کشور",
    summary:
      "اسرائیل حملات خود را به انبارهای موشکی، رادارها و پایگاه‌های پرتاب در غرب ایران گسترش داد.",
    description:
      "هدف اعلام‌شده تضعیف توان پرتاب موشک بالستیک و شبکه پدافند هوایی بود. گزارش‌ها از آسیب به زیرساخت‌های نظامی در چند استان غربی حکایت دارد.",
    date: "2025-06-14",
    time: "02:10",
    severity: "critical",
    verificationStatus: "verified",
    category: "حمله هوایی",
    location: { province: "کرمانشاه", city: "قصرشیرین" },
    source: "ACLED / گزارش‌های میدانی",
    imageUrl: IMG.strike,
    tags: ["اسرائیل", "موشک", "غرب کشور"],
    relatedEventIds: [],
    relatedResponseIds: ["g-20250614-civil-defense"],
    commentsCount: 6,
  }),
  eventBase({
    id: "g-20250614-civil-defense",
    eventType: "government",
    title: "فعال‌سازی ستادهای بحران و پناهگاه‌های شهری",
    summary:
      "ستاد مدیریت بحران برای کاهش تلفات غیرنظامی، پناهگاه‌ها و هشدارهای عمومی را فعال کرد.",
    date: "2025-06-14",
    time: "07:30",
    severity: "high",
    verificationStatus: "published",
    actionStatus: "in_progress",
    category: "حمایت مردمی",
    location: { province: "تهران", city: "تهران" },
    organization: "ستاد بحران",
    source: "وزارت کشور",
    imageUrl: IMG.city,
    tags: ["بحران", "پناهگاه"],
    relatedEventIds: ["e-20250614-continued-strikes"],
    relatedResponseIds: [],
    responseTimeMinutes: 320,
    commentsCount: 4,
  }),
  eventBase({
    id: "e-20250615-energy-infra",
    eventType: "enemy",
    title: "حمله به زیرساخت انرژی و تأسیسات نفت و گاز",
    summary:
      "حملات دشمن به بخشی از زیرساخت‌های انرژی و تأسیسات مرتبط با صنعت نفت و گاز گزارش شد.",
    description:
      "هدف‌گیری زیرساخت انرژی در ادامه کارزار تضعیف توان نظامی و اقتصادی ایران ارزیابی شده است.",
    date: "2025-06-15",
    time: "01:45",
    severity: "high",
    verificationStatus: "verified",
    category: "حمله به زیرساخت",
    location: { province: "بوشهر", city: "بوشهر" },
    source: "رصد اقتصادی / گزارش‌های بین‌المللی",
    imageUrl: IMG.base,
    tags: ["انرژی", "نفت", "اسرائیل"],
    relatedEventIds: [],
    relatedResponseIds: ["g-20250615-energy-secure"],
    commentsCount: 5,
  }),
  eventBase({
    id: "g-20250615-energy-secure",
    eventType: "government",
    title: "تأمین اضطراری انرژی و حفاظت از تأسیسات حیاتی",
    summary:
      "تیم‌های فنی و امنیتی برای پایدارسازی شبکه انرژی و حفاظت از تأسیسات حیاتی مستقر شدند.",
    date: "2025-06-15",
    time: "09:20",
    severity: "medium",
    verificationStatus: "published",
    actionStatus: "in_progress",
    category: "امنیت زیرساخت",
    location: { province: "بوشهر", city: "بوشهر" },
    organization: "وزارت نفت / نیروهای امنیتی",
    source: "روابط عمومی وزارت نفت",
    tags: ["انرژی", "پایداری"],
    relatedEventIds: ["e-20250615-energy-infra"],
    relatedResponseIds: [],
    responseTimeMinutes: 455,
    commentsCount: 3,
  }),
  eventBase({
    id: "g-20250616-missile-wave",
    eventType: "government",
    title: "موج جدید موشکی به سمت تل‌آویو و حیفا",
    summary:
      "ایران موج‌های بعدی موشک بالستیک را به سمت مناطق مرکزی و شمالی سرزمین‌های اشغالی شلیک کرد.",
    description:
      "بر اساس گزارش‌ها، اهدافی مانند مراکز نظامی، زیرساخت علمی و مناطق شهری در تل‌آویو و حیفا مورد اصابت یا آسیب قرار گرفتند؛ بخش زیادی رهگیری شد.",
    date: "2025-06-16",
    time: "22:05",
    severity: "high",
    verificationStatus: "published",
    actionStatus: "completed",
    category: "پاسخ موشکی",
    location: { province: "ایلام", city: "مهران" },
    organization: "نیروی هوافضای سپاه",
    source: "رصد بین‌المللی",
    imageUrl: IMG.missile,
    tags: ["تل‌آویو", "حیفا", "موشک"],
    relatedEventIds: [],
    relatedResponseIds: [],
    commentsCount: 9,
  }),
  eventBase({
    id: "e-20250617-command-nodes",
    eventType: "enemy",
    title: "حمله به مراکز فرماندهی و کنترل و سامانه‌های راداری",
    summary:
      "ادامه حملات دقیق به گره‌های فرماندهی، رادار و سامانه‌های پدافندی برای تضعیف شبکه دفاع هوایی.",
    date: "2025-06-17",
    time: "03:55",
    severity: "high",
    verificationStatus: "verified",
    category: "حمله هوایی",
    location: { province: "خوزستان", city: "اهواز" },
    source: "تحلیل نظامی",
    imageUrl: IMG.radar,
    tags: ["رادار", "فرماندهی"],
    relatedEventIds: [],
    relatedResponseIds: ["g-20250617-radar-repair"],
    commentsCount: 4,
  }),
  eventBase({
    id: "g-20250617-radar-repair",
    eventType: "government",
    title: "بازسازی اضطراری شبکه راداری و جابه‌جایی سامانه‌ها",
    summary:
      "واحدهای فنی پدافند برای بازیابی پوشش راداری و جابه‌جایی سامانه‌های آسیب‌دیده وارد عمل شدند.",
    date: "2025-06-17",
    time: "11:10",
    severity: "medium",
    verificationStatus: "published",
    actionStatus: "in_progress",
    category: "پدافند هوایی",
    location: { province: "خوزستان", city: "اهواز" },
    organization: "نیروی پدافند هوایی",
    source: "سخنگوی پدافند",
    tags: ["رادار", "بازسازی"],
    relatedEventIds: ["e-20250617-command-nodes"],
    relatedResponseIds: [],
    responseTimeMinutes: 435,
    commentsCount: 2,
  }),
  eventBase({
    id: "e-20250618-iaea-context",
    eventType: "enemy",
    title: "فشار دیپلماتیک و روایت‌سازی علیه برنامه هسته‌ای ایران",
    summary:
      "همزمان با درگیری نظامی، موج فشار رسانه‌ای و دیپلماتیک درباره برنامه هسته‌ای ایران تشدید شد.",
    description:
      "پیش از آغاز جنگ، قطعنامه سرزنش آژانس با حمایت آمریکا و شرکای اروپایی تصویب شده بود؛ در روزهای جنگ این روایت برای توجیه حملات استفاده شد.",
    date: "2025-06-18",
    time: "14:00",
    severity: "medium",
    verificationStatus: "verified",
    category: "عملیات اطلاعاتی",
    location: { province: "تهران", city: "تهران" },
    source: "رصد دیپلماسی",
    imageUrl: IMG.diplomacy,
    tags: ["آژانس", "دیپلماسی", "رسانه"],
    relatedEventIds: [],
    relatedResponseIds: ["g-20250618-mfa"],
    commentsCount: 7,
  }),
  eventBase({
    id: "g-20250618-mfa",
    eventType: "government",
    title: "بیانیه وزارت امور خارجه و رایزنی با شرکای منطقه‌ای",
    summary:
      "وزارت امور خارجه حق دفاع مشروع را یادآوری و رایزنی با کشورهای منطقه برای جلوگیری از گسترش جنگ را آغاز کرد.",
    date: "2025-06-18",
    time: "16:30",
    severity: "medium",
    verificationStatus: "published",
    actionStatus: "completed",
    category: "دیپلماسی",
    location: { province: "تهران", city: "تهران" },
    organization: "وزارت امور خارجه",
    source: "سخنگوی وزارت امور خارجه",
    imageUrl: IMG.diplomacy,
    tags: ["دیپلماسی", "منطقه"],
    relatedEventIds: ["e-20250618-iaea-context"],
    relatedResponseIds: [],
    responseTimeMinutes: 150,
    commentsCount: 5,
  }),
  eventBase({
    id: "e-20250619-urban-damage",
    eventType: "enemy",
    title: "اصابت به مناطق مسکونی و افزایش تلفات غیرنظامی",
    summary:
      "ادامه تبادل آتش منجر به آسیب به محلات مسکونی و افزایش تلفات و مجروحان غیرنظامی در دو طرف شد.",
    description:
      "گزارش‌های میدانی از آسیب به ساختمان‌های مسکونی و زیرساخت شهری حکایت دارد. آمار تلفات در منابع مختلف متفاوت اعلام شده است.",
    date: "2025-06-19",
    time: "20:15",
    severity: "critical",
    verificationStatus: "verified",
    category: "حمله به مناطق شهری",
    location: { province: "تهران", city: "تهران" },
    source: "رصد حقوق بشری / گزارش‌های محلی",
    imageUrl: IMG.city,
    tags: ["غیرنظامی", "شهری"],
    relatedEventIds: [],
    relatedResponseIds: ["g-20250619-medical"],
    commentsCount: 11,
  }),
  eventBase({
    id: "g-20250619-medical",
    eventType: "government",
    title: "اعزام تیم‌های امدادی و تقویت ظرفیت بیمارستانی",
    summary:
      "هلال‌احمر و وزارت بهداشت ظرفیت درمانی و امدادی را برای مصدومان حملات افزایش دادند.",
    date: "2025-06-19",
    time: "21:40",
    severity: "high",
    verificationStatus: "published",
    actionStatus: "in_progress",
    category: "حمایت مردمی",
    location: { province: "تهران", city: "تهران" },
    organization: "هلال‌احمر / وزارت بهداشت",
    source: "وزارت بهداشت",
    tags: ["امداد", "درمان"],
    relatedEventIds: ["e-20250619-urban-damage"],
    relatedResponseIds: [],
    responseTimeMinutes: 85,
    commentsCount: 6,
  }),
  eventBase({
    id: "e-20250621-midnight-hammer",
    eventType: "enemy",
    title: "ورود مستقیم آمریکا؛ عملیات Midnight Hammer علیه فردو، نطنز و اصفهان",
    summary:
      "ایالات متحده با بمب‌افکن‌های B-2 و بمب‌های سنگرشکن به تأسیسات هسته‌ای فردو، نطنز و اصفهان حمله کرد.",
    description:
      "عملیات با هدف آسیب به تأسیسات زیرزمینی فردو انجام شد. آمریکا همچنین سایت‌های نطنز و اصفهان را هدف قرار داد. این اقدام جنگ را به سطح رویارویی مستقیم ایران–آمریکا کشاند.",
    impact: "تشدید بحران منطقه‌ای؛ تهدید گسترش جنگ به پایگاه‌های آمریکایی.",
    date: "2025-06-21",
    time: "02:30",
    severity: "critical",
    verificationStatus: "verified",
    category: "حمله آمریکا",
    location: { province: "قم", city: "فردو" },
    source: "The Economist / گزارش‌های پنتاگون",
    imageUrl: IMG.strike,
    media: [
      {
        id: "e-20250621-midnight-hammer-m1",
        type: "image",
        url: IMG.missile,
        thumbnailUrl: IMG.missile,
      },
    ],
    tags: ["آمریکا", "فردو", "B-2", "Midnight Hammer"],
    relatedEventIds: [],
    relatedResponseIds: ["g-20250622-missile-israel", "g-20250623-aludeid"],
    commentsCount: 22,
  }),
  eventBase({
    id: "g-20250622-missile-israel",
    eventType: "government",
    title: "پاسخ موشکی جدید به اهداف در اسرائیل پس از حمله آمریکا",
    summary:
      "پس از حمله آمریکا، ایران موج‌های تازه موشکی به سمت اهداف در سرزمین‌های اشغالی شلیک کرد.",
    description:
      "گزارش‌ها از شلیک ده‌ها موشک بالستیک در چند موج جداگانه حکایت دارد.",
    date: "2025-06-22",
    time: "19:50",
    severity: "high",
    verificationStatus: "published",
    actionStatus: "completed",
    category: "پاسخ موشکی",
    location: { province: "اصفهان", city: "اصفهان" },
    organization: "نیروی هوافضای سپاه",
    source: "رصد بین‌المللی",
    imageUrl: IMG.missile,
    tags: ["پاسخ", "آمریکا", "اسرائیل"],
    relatedEventIds: ["e-20250621-midnight-hammer"],
    relatedResponseIds: [],
    responseTimeMinutes: 2480,
    commentsCount: 10,
  }),
  eventBase({
    id: "g-20250623-aludeid",
    eventType: "government",
    title: "عملیات بشارت فتح؛ حمله موشکی به پایگاه العدید قطر",
    summary:
      "ایران موشک‌های بالستیک به سمت پایگاه هوایی العدید (بزرگ‌ترین پایگاه آمریکا در منطقه) شلیک کرد.",
    description:
      "حمله عمدتاً نمادین ارزیابی شد و موشک‌ها رهگیری شدند؛ خسارت جدی یا تلفات گزارش نشد، اما فضای هوایی منطقه مختل و فشار برای آتش‌بس افزایش یافت.",
    date: "2025-06-23",
    time: "19:20",
    severity: "high",
    verificationStatus: "published",
    actionStatus: "completed",
    category: "پاسخ به آمریکا",
    location: { province: "هرمزگان", city: "بندرعباس" },
    organization: "نیروهای مسلح",
    source: "گزارش‌های منطقه‌ای / Al Jazeera",
    imageUrl: IMG.base,
    tags: ["العدید", "قطر", "آمریکا"],
    relatedEventIds: ["e-20250621-midnight-hammer"],
    relatedResponseIds: [],
    responseTimeMinutes: 3880,
    commentsCount: 18,
  }),
  eventBase({
    id: "e-20250624-ceasefire",
    eventType: "enemy",
    title: "اعلام آتش‌بس با میانجیگری آمریکا پس از ۱۲ روز جنگ",
    summary:
      "پس از حمله به العدید، آمریکا آتش‌بس میان ایران و اسرائیل را اعلام کرد؛ درگیری مستقیم ۱۲روزه متوقف شد.",
    description:
      "آتش‌بس شکننده بود و اختلاف‌ها درباره برنامه هسته‌ای و امنیت منطقه‌ای حل‌نشده باقی ماند. برخی طرف‌ها ادعاهایی درباره نقض آتش‌بس مطرح کردند.",
    date: "2025-06-24",
    time: "08:00",
    severity: "medium",
    verificationStatus: "verified",
    category: "دیپلماسی / آتش‌بس",
    location: { province: "تهران", city: "تهران" },
    source: "کاخ سفید / رسانه‌های بین‌المللی",
    imageUrl: IMG.diplomacy,
    tags: ["آتش‌بس", "ترامپ", "دیپلماسی"],
    relatedEventIds: [],
    relatedResponseIds: ["g-20250624-monitor"],
    commentsCount: 14,
  }),
  eventBase({
    id: "g-20250624-monitor",
    eventType: "government",
    title: "پایش آتش‌بس و حفظ آماده‌باش پدافندی",
    summary:
      "نیروهای مسلح ضمن پذیرش توقف درگیری، آماده‌باش پدافندی و رصد نقض احتمالی آتش‌بس را ادامه دادند.",
    date: "2025-06-24",
    time: "10:30",
    severity: "medium",
    verificationStatus: "published",
    actionStatus: "in_progress",
    category: "پدافند هوایی",
    location: { province: "تهران", city: "تهران" },
    organization: "ستاد کل نیروهای مسلح",
    source: "سخنگوی نیروهای مسلح",
    tags: ["آتش‌بس", "پایش"],
    relatedEventIds: ["e-20250624-ceasefire"],
    relatedResponseIds: [],
    responseTimeMinutes: 150,
    commentsCount: 4,
  }),
];

export function buildDaysFromEvents(events: TimelineEvent[]): TimelineDay[] {
  const byDate = new Map<string, TimelineEvent[]>();

  for (const event of events) {
    const list = byDate.get(event.date) ?? [];
    list.push(event);
    byDate.set(event.date, list);
  }

  const days: TimelineDay[] = [...byDate.entries()].map(([date, dayEvents]) => {
    const { weekday, persianDate } = persianParts(date);
    const sorted = [...dayEvents].sort((a, b) => b.time.localeCompare(a.time));
    const enemyActionsCount = sorted.filter((e) => e.eventType === "enemy").length;
    const governmentActionsCount = sorted.filter(
      (e) => e.eventType === "government",
    ).length;
    const totalEvents = sorted.length;
    const hasCritical = sorted.some((e) => e.severity === "critical");
    const intensity = Math.min(
      100,
      Math.round(
        totalEvents * 12 +
          enemyActionsCount * 10 +
          (hasCritical ? 25 : 0) +
          (sorted.some((e) => e.severity === "high") ? 10 : 0),
      ),
    );

    return {
      date,
      persianDate,
      weekday,
      totalEvents,
      enemyActionsCount,
      governmentActionsCount,
      intensity,
      isCritical: intensity >= 85 || hasCritical,
      events: sorted,
    };
  });

  return days.sort((a, b) => b.date.localeCompare(a.date));
}

export const conflictSeedDays: TimelineDay[] =
  buildDaysFromEvents(conflictSeedEvents);

/** @deprecated use conflictSeedDays — kept for import compatibility */
export const timelineMockDays = conflictSeedDays;

export function getAllEvents(days: TimelineDay[] = conflictSeedDays): TimelineEvent[] {
  return days.flatMap((day) => day.events);
}

export function findEventById(
  id: string,
  days: TimelineDay[] = conflictSeedDays,
): TimelineEvent | undefined {
  return getAllEvents(days).find((event) => event.id === id);
}

export function computeSummary(days: TimelineDay[]) {
  const enemy = days.reduce((s, d) => s + d.enemyActionsCount, 0);
  const government = days.reduce((s, d) => s + d.governmentActionsCount, 0);
  const total = enemy + government;
  const responseRatio =
    enemy === 0
      ? government > 0
        ? 100
        : 0
      : Math.round((government / enemy) * 100);

  const responseTimes = getAllEvents(days)
    .map((e) => e.responseTimeMinutes)
    .filter((m): m is number => typeof m === "number" && m > 0);
  const avgResponseMinutes =
    responseTimes.length === 0
      ? 0
      : Math.round(
          responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        );

  return {
    totalEvents: total,
    enemy,
    government,
    responseRatio,
    avgResponseMinutes,
    activeUsers: 128,
    criticalDays: days.filter((d) => d.isCritical || d.intensity >= 85).length,
  };
}
