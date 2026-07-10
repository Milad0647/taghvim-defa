import type {
  GovernmentActionStatus,
  Severity,
  TimelineDay,
  TimelineEvent,
  VerificationStatus,
} from "@/types/timeline";

const PROVINCES = [
  { province: "تهران", city: "تهران" },
  { province: "اصفهان", city: "اصفهان" },
  { province: "کرمانشاه", city: "قصرشیرین" },
  { province: "ایلام", city: "مهران" },
  { province: "بوشهر", city: "بوشهر" },
  { province: "هرمزگان", city: "بندرعباس" },
  { province: "خوزستان", city: "اهواز" },
  { province: "آذربایجان غربی", city: "ارومیه" },
] as const;

const ENEMY_CATEGORIES = [
  "حمله پهپادی",
  "حملات سایبری",
  "عملیات اطلاعاتی",
  "تحریم و فشار",
] as const;

const GOV_CATEGORIES = [
  "پدافند هوایی",
  "امنیت سایبری",
  "دیپلماسی",
  "حمایت مردمی",
] as const;

const ORGS = [
  "نیروی پدافند هوایی",
  "نیروی هوافضا",
  "پلیس فتا",
  "مرکز ملی فضای مجازی",
  "وزارت امور خارجه",
  "ستاد بحران",
  "شورای عالی امنیت ملی",
] as const;

const SOURCES = [
  "مرکز رصد",
  "مرکز پایش سایبری",
  "سخنگوی پدافند",
  "رصد فضای مجازی",
  "نیروی دریایی",
] as const;

const IMAGES = [
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=360&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=360&fit=crop",
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=360&fit=crop",
  "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=600&h=360&fit=crop",
  "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=360&fit=crop",
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=360&fit=crop",
];

const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];
const WEEKDAYS = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateString(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function persianParts(date: Date) {
  const weekday = new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(date);
  const persianDate = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
  return { weekday, persianDate };
}

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]!;
}

function makeEnemy(
  day: string,
  index: number,
  seed: number,
): TimelineEvent {
  const loc = pick(PROVINCES, seed + index);
  const severity = pick(SEVERITIES, seed + index * 2);
  const hour = 5 + ((seed + index * 3) % 14);
  const minute = (seed * 7 + index * 11) % 60;
  const time = `${pad(hour)}:${pad(minute)}`;
  const id = `e-${day.replaceAll("-", "")}-${index}`;
  const hasImage = (seed + index) % 3 !== 0;

  return {
    id,
    eventType: "enemy",
    title: [
      "شناسایی پهپادهای ناشناس",
      "حمله سایبری به زیرساخت حیاتی",
      "کمپین سیاه‌نمایی سازمان‌یافته",
      "اختلال در سرویس‌های بانکی",
      "تهدید تحریم هدفمند",
      "حرکت مشکوک شناورهای ناشناس",
      "اسکن پورت‌های حساس دولتی",
    ][(seed + index) % 7]!,
    summary:
      "رصد و تحلیل این اقدام در سامانه ثبت شده و نیازمند پایش مستمر است.",
    description:
      "جزئیات فنی و عملیاتی این رخداد توسط مراکز رصد بررسی و مستندسازی شده است. مسیر تهدید، دامنه اثر و سطح ریسک در گزارش تکمیلی آمده است.",
    impact: "افزایش سطح آماده‌باش و نیاز به پاسخ هماهنگ دستگاه‌ها.",
    date: day,
    time,
    severity,
    verificationStatus: pick(
      ["verified", "pending", "published", "draft"] as VerificationStatus[],
      seed + index,
    ),
    category: pick(ENEMY_CATEGORIES, seed + index),
    location: { ...loc },
    source: pick(SOURCES, seed + index),
    imageUrl: hasImage ? pick(IMAGES, seed + index) : undefined,
    media: hasImage
      ? [
          {
            id: `${id}-m1`,
            type: "image",
            url: pick(IMAGES, seed + index),
            thumbnailUrl: pick(IMAGES, seed + index),
          },
        ]
      : [],
    tags: ["رصد", pick(ENEMY_CATEGORIES, seed), loc.province],
    relatedEventIds: [],
    relatedResponseIds: [],
    commentsCount: (seed + index) % 9,
    createdAt: `${day}T${time}:00Z`,
    updatedAt: `${day}T${time}:00Z`,
  };
}

function makeGov(
  day: string,
  index: number,
  seed: number,
  responseTo?: string,
  responseMinutes?: number,
): TimelineEvent {
  const loc = pick(PROVINCES, seed + index + 1);
  const hour = 7 + ((seed + index * 2) % 12);
  const minute = (seed * 5 + index * 13) % 60;
  const time = `${pad(hour)}:${pad(minute)}`;
  const id = `g-${day.replaceAll("-", "")}-${index}`;
  const statuses: GovernmentActionStatus[] = [
    "planned",
    "in_progress",
    "completed",
    "successful",
    "needs_follow_up",
  ];

  return {
    id,
    eventType: "government",
    title: [
      "افزایش آماده‌باش پدافند هوایی",
      "خنثی‌سازی حمله سایبری",
      "فعال‌سازی مرکز واکنش سریع",
      "اطلاع‌رسانی رسمی و شفاف‌سازی",
      "گشت دریایی تقویت‌شده",
      "بازدید میدانی از مناطق آسیب‌دیده",
      "بیانیه دیپلماتیک رسمی",
    ][(seed + index) % 7]!,
    summary: "اقدام اجرایی برای مدیریت پیامدها و مقابله با تهدید ثبت شد.",
    description:
      "دستگاه مسئول با هماهنگی ستاد مربوطه اقدام عملیاتی را اجرا و نتیجه را در سامانه ثبت کرده است.",
    impact: "کاهش اثر تهدید و بازیابی نسبی پایداری خدمات.",
    date: day,
    time,
    severity: pick(SEVERITIES, seed + index + 1),
    verificationStatus: "published",
    actionStatus: pick(statuses, seed + index),
    category: pick(GOV_CATEGORIES, seed + index),
    location: { ...loc },
    organization: pick(ORGS, seed + index),
    source: pick(SOURCES, seed + index + 2),
    imageUrl: (seed + index) % 2 === 0 ? pick(IMAGES, seed + index + 2) : undefined,
    media: [],
    tags: ["پاسخ", pick(GOV_CATEGORIES, seed)],
    relatedEventIds: responseTo ? [responseTo] : [],
    relatedResponseIds: [],
    responseTimeMinutes: responseMinutes,
    commentsCount: (seed + index) % 5,
    createdAt: `${day}T${time}:00Z`,
    updatedAt: `${day}T${time}:00Z`,
  };
}

function buildDay(offsetFromToday: number): TimelineDay {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - offsetFromToday);
  const dateStr = toDateString(date);
  const { weekday, persianDate } = persianParts(date);
  const seed = offsetFromToday * 17 + date.getDate();

  const enemyCount = 1 + (seed % 5);
  const govCount = 1 + ((seed + 3) % 5);
  const events: TimelineEvent[] = [];

  for (let i = 0; i < enemyCount; i++) {
    events.push(makeEnemy(dateStr, i, seed));
  }

  for (let i = 0; i < govCount; i++) {
    const enemy = events[i % Math.max(1, enemyCount)];
    const link = i < enemyCount && (seed + i) % 4 !== 0;
    const minutes = 20 + ((seed + i * 9) % 160);
    const gov = makeGov(
      dateStr,
      i,
      seed,
      link ? enemy?.id : undefined,
      link ? minutes : undefined,
    );
    events.push(gov);
    if (link && enemy) {
      enemy.relatedEventIds = [...(enemy.relatedEventIds ?? []), gov.id];
      enemy.relatedResponseIds = [...(enemy.relatedResponseIds ?? []), gov.id];
      enemy.responseTimeMinutes = minutes;
    }
  }

  // Ensure at least one unanswered enemy every few days
  if (offsetFromToday % 5 === 0) {
    const lonely = makeEnemy(dateStr, 99, seed + 99);
    lonely.relatedEventIds = [];
    lonely.relatedResponseIds = [];
    lonely.responseTimeMinutes = undefined;
    events.push(lonely);
  }

  const enemyActionsCount = events.filter((e) => e.eventType === "enemy").length;
  const governmentActionsCount = events.filter(
    (e) => e.eventType === "government",
  ).length;
  const totalEvents = events.length;
  const intensity = Math.min(
    100,
    Math.round((totalEvents / 12) * 70 + (enemyActionsCount / 6) * 30),
  );

  return {
    date: dateStr,
    persianDate,
    weekday: weekday || WEEKDAYS[date.getDay()] || "روز",
    totalEvents,
    enemyActionsCount,
    governmentActionsCount,
    intensity,
    isCritical: intensity >= 85,
    events: events.sort((a, b) => b.time.localeCompare(a.time)),
  };
}

/** Newest day first */
export const timelineMockDays: TimelineDay[] = Array.from({ length: 30 }, (_, i) =>
  buildDay(i),
);

export function getAllEvents(days: TimelineDay[] = timelineMockDays): TimelineEvent[] {
  return days.flatMap((day) => day.events);
}

export function findEventById(
  id: string,
  days: TimelineDay[] = timelineMockDays,
): TimelineEvent | undefined {
  return getAllEvents(days).find((event) => event.id === id);
}

export function computeSummary(days: TimelineDay[]) {
  const enemy = days.reduce((s, d) => s + d.enemyActionsCount, 0);
  const government = days.reduce((s, d) => s + d.governmentActionsCount, 0);
  const total = enemy + government;
  const responseRatio =
    enemy === 0 ? (government > 0 ? 100 : 0) : Math.round((government / enemy) * 100);

  const responseTimes = getAllEvents(days)
    .map((e) => e.responseTimeMinutes)
    .filter((m): m is number => typeof m === "number");
  const avgResponse =
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
    avgResponseMinutes: avgResponse,
    criticalDays: days.filter((d) => d.isCritical).length,
    activeUsers: 12,
  };
}
