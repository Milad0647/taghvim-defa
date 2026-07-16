<?php

namespace Database\Seeders;

use App\Enums\Permission;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\FormDefinition;
use App\Models\FormField;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'مدیر سیستم',
                'email' => 'admin@taghvim.local',
                'password' => 'Admin@12345',
                'role' => UserRole::SuperAdmin,
                'is_active' => true,
                'parent_id' => null,
                'permissions' => Permission::adminDefaults(),
            ],
        );

        User::query()->updateOrCreate(
            ['username' => 'editor'],
            [
                'name' => 'کارشناس رصد',
                'email' => 'editor@taghvim.local',
                'password' => 'Admin@12345',
                'role' => UserRole::Editor,
                'is_active' => true,
                'parent_id' => User::query()->where('username', 'admin')->value('id'),
                'permissions' => Permission::editorDefaults(),
                'agency_ids' => ['agency-defense', 'agency-mfa'],
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

        $this->call(DemoContentSeeder::class);
        $this->call(ConflictMediaSeeder::class);
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
