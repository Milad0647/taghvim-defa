<?php

namespace App\Console\Commands;

use App\Enums\Permission;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;

class EnsureAdminUser extends Command
{
    protected $signature = 'app:ensure-admin
                            {--username=admin : Admin username}
                            {--password=Admin@12345 : Admin password}';

    protected $description = 'Create or reset the default admin user';

    public function handle(): int
    {
        $username = strtolower(trim((string) $this->option('username')));
        $password = (string) $this->option('password');

        if ($username === '' || $password === '') {
            $this->error('Username and password are required.');

            return self::FAILURE;
        }

        $user = User::query()->updateOrCreate(
            ['username' => $username],
            [
                'name' => 'مدیر سیستم',
                'email' => 'admin@taghvim.local',
                'password' => $password,
                'role' => UserRole::SuperAdmin,
                'is_active' => true,
                'parent_id' => null,
                'permissions' => Permission::adminDefaults(),
                'agency_ids' => [],
            ],
        );

        // Always reset password/role so production recovers after bad seeds.
        $user->forceFill([
            'password' => $password,
            'role' => UserRole::SuperAdmin,
            'is_active' => true,
            'permissions' => Permission::adminDefaults(),
        ])->save();

        $this->info("Admin ready: username={$username}");

        return self::SUCCESS;
    }
}
