import type { EventDayMock } from "@/types/event-day";

export const eventDayMock: EventDayMock = {
  dayTitle: "چهارشنبه ۱۵ اردیبهشت ۱۴۰۳",
  eventCountLabel: "۲۴ رویداد",
  events: [
    {
      id: "enemy-1",
      type: "enemy",
      title: "حمله سایبری به زیرساخت بانکی",
      description:
        "گروه هکری مرتبط با دشمن اقدام به حمله DDoS علیه زیرساخت‌های بانکداری کشور نمودند که خوشبختانه با هوشیاری تیم‌های امنیتی دفع شد.",
      time: "10:30",
      image:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=480&q=80",
      status: "شدید",
      statusColor: "red",
      tags: ["زیرساخت", "سایبری"],
    },
    {
      id: "enemy-2",
      type: "enemy",
      title: "پروپاگاندای رسانه‌ای",
      description:
        "شبکه‌های معاند اقدام به انتشار اخبار جعلی و تحریف واقعیت در خصوص وضعیت اقتصادی کشور نمودند.",
      time: "14:15",
      image:
        "https://images.unsplash.com/photo-1504711434719-321ad7915fe0?auto=format&fit=crop&w=480&q=80",
      status: "متوسط",
      statusColor: "orange",
      tags: ["روانی", "رسانه‌ای"],
    },
    {
      id: "gov-1",
      type: "government",
      title: "افتتاح فاز جدید پالایشگاه ستاره خلیج فارس",
      description:
        "فاز جدید پالایشگاه با ظرفیت ۳۴۰ هزار بشکه در روز با حضور رئیس جمهور افتتاح و به بهره‌برداری رسید.",
      time: "09:00",
      image:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=480&q=80",
      status: "موفق",
      statusColor: "green",
      tags: ["اقتصادی", "زیرساخت"],
    },
    {
      id: "gov-2",
      type: "government",
      title: "جلسه ستاد اقتصادی دولت",
      description:
        "برگزاری جلسه فوق‌العاده ستاد اقتصادی برای بررسی و تصمیم‌گیری در خصوص اقدامات مقابله‌ای.",
      time: "16:45",
      image:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=480&q=80",
      status: "اطلاع‌رسانی",
      statusColor: "blue",
      tags: ["سیاسی", "مدیریتی"],
    },
  ],
  details: {
    "enemy-1": {
      eventId: "enemy-1",
      panelTitle: "جزئیات اقدام دشمن",
      dateLabel: "۱۵ اردیبهشت ۱۴۰۳",
      category: "سایبری",
      timeLabel: "۱۰:۳۰",
      source: "گزارش تیم امنیتی",
      summary:
        "گروه هکری مرتبط با کشورهای متخاصم اقدام به حمله DDoS گسترده علیه زیرساخت‌های بانکداری کشور نمودند. حجم حمله بیش از ۲ ترابیت بر ثانیه بود که با آمادگی تیم‌های امنیتی دفع شد.",
      evidenceImages: [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80",
      ],
      evidenceExtraCount: 3,
      impacts: [
        "اختلال موقت در دسترسی به برخی خدمات بانکی (۱۵ دقیقه)",
        "عدم دسترسی به اطلاعات حساس کاربران",
        "شناسایی و مسدودسازی ۱۲۳ IP مهاجم",
      ],
      tags: ["سایبری", "حمله DDoS", "زیرساخت", "بانکداری"],
      commentsCount: 12,
    },
  },
};
