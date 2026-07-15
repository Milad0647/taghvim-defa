<?php

namespace Tests\Feature;

use App\Enums\Permission;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_timeline_requires_authentication(): void
    {
        $this->getJson('/api/v1/timeline')->assertUnauthorized();
    }

    public function test_admin_can_access_timeline(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SuperAdmin,
            'permissions' => Permission::adminDefaults(),
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/v1/timeline')->assertOk();
    }

    public function test_regular_user_cannot_access_admin_views(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Editor,
            'permissions' => Permission::editorDefaults(),
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/timeline')->assertForbidden();
        $this->getJson('/api/v1/my-content')->assertOk();
    }

    public function test_parent_cannot_grant_permissions_they_lack(): void
    {
        $parent = User::factory()->create([
            'role' => UserRole::Editor,
            'permissions' => [Permission::ManageContent->value, Permission::ManageSubusers->value],
            'is_active' => true,
        ]);

        Sanctum::actingAs($parent);

        $this->postJson('/api/v1/users', [
            'name' => 'Child',
            'email' => 'child@example.com',
            'password' => 'password123',
            'permissions' => [Permission::ManageSettings->value],
        ])->assertStatus(422);
    }

    public function test_inactive_user_is_blocked(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::SuperAdmin,
            'is_active' => false,
            'permissions' => Permission::adminDefaults(),
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/timeline')->assertForbidden();
    }
}
