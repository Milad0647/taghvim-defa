# تقویم دفاعی

گزارش زنده روزبه‌روز: اقدامات دشمن در برابر اقدامات دولت، با تایم‌لاین عمودی، هیستوگرام شدت فعالیت، و پنل مدیریت.

## استک

| لایه | تکنولوژی |
|------|----------|
| Frontend | Next.js 16 + Tailwind + Framer Motion |
| Backend | Laravel 13 + Sanctum |
| DB | PostgreSQL 16 |
| Cache/Queue | Redis 7 |
| Deploy | Docker Compose → Coolify |

## اجرای محلی (بدون Docker)

### Backend

```bash
cd backend
cp .env.example .env   # سپس DB را روی pgsql تنظیم کنید
php ../composer.phar install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --port=8000
```

کاربران seed:

- `admin@taghvim.local` / `password`
- `editor@taghvim.local` / `password`

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

باز کردن: [http://localhost:3000](http://localhost:3000)

اگر API بالا نباشد، داده‌های نمونه نمایش داده می‌شود.

## اجرای با Docker / Coolify

1. فایل `.env` از روی `.env.example` بسازید و دامنه/رمزها را تنظیم کنید.
2. در Coolify یک **Docker Compose** resource بسازید و همین ریپو را وصل کنید.
3. متغیرهای مهم:

```env
DB_PASSWORD=...
APP_URL=https://api.your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
CORS_ALLOWED_ORIGINS=https://your-domain.com
APP_KEY=base64:...   # یک‌بار php artisan key:generate --show
```

4. پورت‌ها:
   - Frontend: `3000`
   - API: `8000`

یا لوکال:

```bash
cp .env.example .env
docker compose up -d --build
```

## APIهای اصلی

| Method | Path | توضیح |
|--------|------|--------|
| GET | `/api/v1/health` | سلامت سرویس |
| GET | `/api/v1/timeline` | تایم‌لاین عمومی |
| GET | `/api/v1/timeline/{date}` | جزئیات یک روز |
| GET | `/api/v1/timeline/stats` | آمار داشبورد |
| POST | `/api/v1/auth/login` | ورود (Bearer token) |
| POST | `/api/v1/days` | ایجاد روز (auth) |
| POST | `/api/v1/days/{id}/enemy-actions` | ثبت اقدام دشمن |
| POST | `/api/v1/days/{id}/government-actions` | ثبت اقدام دولت |
| POST | `/api/v1/days/{id}/media` | آپلود تصویر |

## ساختار

```
backend/     Laravel API
frontend/    Next.js UI (timeline)
docker-compose.yml
```

## تم

پس‌زمینه سرمه‌ای تیره + اکسنت بنفش/فوشیا برای تایم‌لاین، قرمز برای دشمن، سبز برای دولت، و هیستوگرام شدت فعالیت از آبی تا قرمز.
