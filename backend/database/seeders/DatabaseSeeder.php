<?php

namespace Database\Seeders;

use App\Enums\ActionSeverity;
use App\Enums\Permission;
use App\Enums\PublishStatus;
use App\Enums\UserRole;
use App\Models\CalendarDay;
use App\Models\Category;
use App\Models\EnemyAction;
use App\Models\FormDefinition;
use App\Models\FormField;
use App\Models\GovernmentAction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@taghvim.local'],
            [
                'name' => 'مدیر سیستم',
                'password' => 'password',
                'role' => UserRole::SuperAdmin,
                'is_active' => true,
                'parent_id' => null,
                'permissions' => Permission::adminDefaults(),
            ],
        );

        $editor = User::query()->updateOrCreate(
            ['email' => 'editor@taghvim.local'],
            [
                'name' => 'کارشناس رصد',
                'password' => 'password',
                'role' => UserRole::Editor,
                'is_active' => true,
                'parent_id' => $admin->id,
                'permissions' => Permission::editorDefaults(),
            ],
        );

        $this->seedFormSchema();

        $enemyCategories = [
            ['name' => 'حمله پهپادی', 'slug' => 'drone-attack', 'color' => '#EF4444', 'type' => 'enemy'],
            ['name' => 'حملات سایبری', 'slug' => 'cyber-attack', 'color' => '#F97316', 'type' => 'enemy'],
            ['name' => 'تحریم و فشار', 'slug' => 'sanctions', 'color' => '#EAB308', 'type' => 'enemy'],
            ['name' => 'عملیات اطلاعاتی', 'slug' => 'intel-ops', 'color' => '#DC2626', 'type' => 'enemy'],
        ];

        $govCategories = [
            ['name' => 'پدافند هوایی', 'slug' => 'air-defense', 'color' => '#10B981', 'type' => 'government'],
            ['name' => 'امنیت سایبری', 'slug' => 'cyber-defense', 'color' => '#14B8A6', 'type' => 'government'],
            ['name' => 'دیپلماسی', 'slug' => 'diplomacy', 'color' => '#3B82F6', 'type' => 'government'],
            ['name' => 'حمایت مردمی', 'slug' => 'public-support', 'color' => '#8B5CF6', 'type' => 'government'],
        ];

        foreach ([...$enemyCategories, ...$govCategories] as $category) {
            Category::query()->updateOrCreate(['slug' => $category['slug']], $category);
        }

        $enemyBySlug = Category::query()->where('type', 'enemy')->get()->keyBy('slug');
        $govBySlug = Category::query()->where('type', 'government')->get()->keyBy('slug');

        $days = [
            [
                'offset' => 0,
                'title' => 'آغاز موج جدید تهدیدات',
                'summary' => 'ثبت نخستین نشانه‌های افزایش فعالیت دشمن در مرزهای غربی و فضای سایبری.',
                'enemy' => [
                    ['title' => 'شناسایی پهپادهای ناشناس در غرب کشور', 'severity' => ActionSeverity::High, 'category' => 'drone-attack', 'location' => 'مرز غربی'],
                    ['title' => 'تلاش برای نفوذ به زیرساخت ارتباطی', 'severity' => ActionSeverity::Medium, 'category' => 'cyber-attack'],
                ],
                'government' => [
                    ['title' => 'افزایش آماده‌باش پدافند هوایی', 'agency' => 'نیروی پدافند هوایی', 'category' => 'air-defense'],
                    ['title' => 'فعال‌سازی مرکز پایش سایبری', 'agency' => 'مرکز ملی فضای مجازی', 'category' => 'cyber-defense'],
                ],
            ],
            [
                'offset' => 1,
                'title' => 'اوج حملات پهپادی',
                'summary' => 'روز پرتنش با چندین اقدام خصمانه و پاسخ سریع نیروهای دفاعی.',
                'enemy' => [
                    ['title' => 'حمله پهپادی به تأسیسات مرزی', 'severity' => ActionSeverity::Critical, 'category' => 'drone-attack', 'location' => 'غرب کشور'],
                    ['title' => 'انتشار اخبار جعلی در شبکه‌های اجتماعی', 'severity' => ActionSeverity::Medium, 'category' => 'intel-ops'],
                    ['title' => 'اختلال موقت در سرویس‌های بانکی', 'severity' => ActionSeverity::High, 'category' => 'cyber-attack'],
                    ['title' => 'تهدید جدید تحریم‌های هدفمند', 'severity' => ActionSeverity::Medium, 'category' => 'sanctions'],
                ],
                'government' => [
                    ['title' => 'سرنگونی پهپادهای مهاجم', 'agency' => 'نیروی هوافضا', 'category' => 'air-defense'],
                    ['title' => 'خنثی‌سازی حمله سایبری بانکی', 'agency' => 'پلیس فتا', 'category' => 'cyber-defense'],
                    ['title' => 'اطلاع‌رسانی رسمی و شفاف‌سازی', 'agency' => 'وزارت امور خارجه', 'category' => 'diplomacy'],
                ],
            ],
            [
                'offset' => 2,
                'title' => 'تثبیت وضعیت و بازسازی',
                'summary' => 'کاهش نسبی تهدیدات و تمرکز بر بازسازی زیرساخت‌ها و حمایت از مردم.',
                'enemy' => [
                    ['title' => 'ادامه فشار رسانه‌ای خارجی', 'severity' => ActionSeverity::Low, 'category' => 'intel-ops'],
                ],
                'government' => [
                    ['title' => 'بازدید میدانی از مناطق آسیب‌دیده', 'agency' => 'ستاد بحران', 'category' => 'public-support'],
                    ['title' => 'تقویت سامانه‌های پدافندی', 'agency' => 'نیروی پدافند هوایی', 'category' => 'air-defense'],
                    ['title' => 'هماهنگی دیپلماتیک با شرکای منطقه‌ای', 'agency' => 'وزارت امور خارجه', 'category' => 'diplomacy'],
                ],
            ],
            [
                'offset' => 3,
                'title' => 'رصد مستمر و آمادگی',
                'summary' => 'وضعیت پایدار با پایش مداوم و آمادگی عملیاتی.',
                'enemy' => [
                    ['title' => 'حرکت مشکوک شناورهای ناشناس', 'severity' => ActionSeverity::Medium, 'category' => 'intel-ops', 'location' => 'خلیج فارس'],
                    ['title' => 'اسکن پورت‌های حساس دولتی', 'severity' => ActionSeverity::Low, 'category' => 'cyber-attack'],
                ],
                'government' => [
                    ['title' => 'گشت دریایی تقویت‌شده', 'agency' => 'نیروی دریایی', 'category' => 'air-defense'],
                    ['title' => 'به‌روزرسانی دیوار آتش ملی', 'agency' => 'مرکز ملی فضای مجازی', 'category' => 'cyber-defense'],
                ],
            ],
            [
                'offset' => 4,
                'title' => 'روز آرام با پایش فعال',
                'summary' => 'فعالیت دشمن در سطح پایین؛ تمرکز بر آمادگی و اطلاع‌رسانی.',
                'enemy' => [
                    ['title' => 'شایعات جدید در فضای مجازی', 'severity' => ActionSeverity::Low, 'category' => 'intel-ops'],
                ],
                'government' => [
                    ['title' => 'برگزاری رزمایش دفاع شهری', 'agency' => 'سازمان پدافند غیرعامل', 'category' => 'public-support'],
                ],
            ],
            [
                'offset' => 5,
                'title' => 'موج دوم فشار ترکیبی',
                'summary' => 'ترکیب تهدید سایبری، رسانه‌ای و نظامی در یک روز.',
                'enemy' => [
                    ['title' => 'حمله DDoS به پورتال‌های دولتی', 'severity' => ActionSeverity::High, 'category' => 'cyber-attack'],
                    ['title' => 'پهپادهای شناسایی در جنوب', 'severity' => ActionSeverity::High, 'category' => 'drone-attack', 'location' => 'جنوب کشور'],
                    ['title' => 'کمپین سیاه‌نمایی بین‌المللی', 'severity' => ActionSeverity::Medium, 'category' => 'intel-ops'],
                ],
                'government' => [
                    ['title' => 'مقابله با حمله DDoS', 'agency' => 'پلیس فتا', 'category' => 'cyber-defense'],
                    ['title' => 'رهگیری و انهدام پهپاد شناسایی', 'agency' => 'نیروی هوافضا', 'category' => 'air-defense'],
                    ['title' => 'انتشار گزارش مستند برای افکار عمومی', 'agency' => 'شورای عالی امنیت ملی', 'category' => 'public-support'],
                    ['title' => 'بیانیه دیپلماتیک رسمی', 'agency' => 'وزارت امور خارجه', 'category' => 'diplomacy'],
                ],
            ],
            [
                'offset' => 6,
                'title' => 'جمع‌بندی هفته اول',
                'summary' => 'مرور اقدامات هفته و آماده‌سازی برای مرحله بعد.',
                'enemy' => [
                    ['title' => 'کاهش محسوس فعالیت میدانی دشمن', 'severity' => ActionSeverity::Low, 'category' => 'intel-ops'],
                ],
                'government' => [
                    ['title' => 'گزارش هفتگی به مردم', 'agency' => 'سخنگوی دولت', 'category' => 'public-support'],
                    ['title' => 'تحلیل پس از اقدام و به‌روزرسانی دکترین', 'agency' => 'ستاد کل نیروهای مسلح', 'category' => 'air-defense'],
                ],
            ],
        ];

        $start = Carbon::now()->subDays(6)->startOfDay();

        foreach ($days as $dayData) {
            $date = $start->copy()->addDays($dayData['offset']);

            $day = CalendarDay::query()->updateOrCreate(
                ['date' => $date->toDateString()],
                [
                    'title' => $dayData['title'],
                    'summary' => $dayData['summary'],
                    'status' => PublishStatus::Published,
                    'is_featured' => $dayData['offset'] === 1 || $dayData['offset'] === 5,
                    'created_by' => $editor->id,
                ],
            );

            $day->enemyActions()->forceDelete();
            $day->governmentActions()->forceDelete();

            $createdEnemy = [];

            foreach ($dayData['enemy'] as $index => $enemy) {
                $createdEnemy[] = EnemyAction::query()->create([
                    'calendar_day_id' => $day->id,
                    'category_id' => $enemyBySlug[$enemy['category']]->id ?? null,
                    'title' => $enemy['title'],
                    'description' => 'جزئیات رصد و تحلیل این اقدام در سامانه ثبت شده است.',
                    'severity' => $enemy['severity'],
                    'source' => 'مرکز رصد',
                    'location' => $enemy['location'] ?? null,
                    'occurred_at' => $date->copy()->addHours(8 + $index),
                    'status' => PublishStatus::Published,
                    'created_by' => $editor->id,
                ]);
            }

            foreach ($dayData['government'] as $index => $gov) {
                GovernmentAction::query()->create([
                    'calendar_day_id' => $day->id,
                    'category_id' => $govBySlug[$gov['category']]->id ?? null,
                    'response_to_id' => $createdEnemy[$index % max(1, count($createdEnemy))]->id ?? null,
                    'title' => $gov['title'],
                    'description' => 'اقدام اجرایی انجام‌شده برای مقابله یا مدیریت پیامدهای تهدید.',
                    'agency' => $gov['agency'],
                    'completed_at' => $date->copy()->addHours(10 + $index),
                    'status' => PublishStatus::Published,
                    'created_by' => $admin->id,
                ]);
            }
        }
    }

    private function seedFormSchema(): void
    {
        $definition = FormDefinition::query()->updateOrCreate(
            ['key' => 'event_create'],
            ['name' => 'ثبت رویداد', 'is_active' => true],
        );

        $fields = [
            ['key' => 'eventType', 'label' => 'نوع رویداد', 'type' => 'select', 'options' => [['value' => 'enemy', 'label' => 'اقدام دشمن'], ['value' => 'government', 'label' => 'اقدام دولت']], 'required' => true, 'sort_order' => 0, 'section' => 'main', 'is_system' => true],
            ['key' => 'title', 'label' => 'عنوان', 'type' => 'text', 'options' => null, 'required' => true, 'sort_order' => 1, 'section' => 'main', 'is_system' => true],
            ['key' => 'summary', 'label' => 'خلاصه', 'type' => 'textarea', 'options' => null, 'required' => false, 'sort_order' => 2, 'section' => 'main', 'is_system' => true],
            ['key' => 'date', 'label' => 'تاریخ', 'type' => 'date', 'options' => null, 'required' => true, 'sort_order' => 3, 'section' => 'main', 'is_system' => true],
            ['key' => 'severity', 'label' => 'شدت', 'type' => 'select', 'options' => [['value' => 'low', 'label' => 'کم'], ['value' => 'medium', 'label' => 'متوسط'], ['value' => 'high', 'label' => 'بالا'], ['value' => 'critical', 'label' => 'بحرانی']], 'required' => true, 'sort_order' => 4, 'section' => 'main', 'is_system' => true],
            ['key' => 'description', 'label' => 'توضیحات', 'type' => 'textarea', 'options' => null, 'required' => false, 'sort_order' => 5, 'section' => 'details', 'is_system' => false],
            ['key' => 'location', 'label' => 'مکان', 'type' => 'text', 'options' => null, 'required' => false, 'sort_order' => 6, 'section' => 'details', 'is_system' => false],
            ['key' => 'source', 'label' => 'منبع', 'type' => 'text', 'options' => null, 'required' => false, 'sort_order' => 7, 'section' => 'details', 'is_system' => false],
        ];

        foreach ($fields as $field) {
            FormField::query()->updateOrCreate(
                [
                    'form_definition_id' => $definition->id,
                    'key' => $field['key'],
                ],
                [
                    ...$field,
                    'is_active' => true,
                ],
            );
        }
    }
}
