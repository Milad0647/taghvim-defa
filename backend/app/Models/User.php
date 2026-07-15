<?php

namespace App\Models;

use App\Enums\Permission;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role', 'is_active', 'parent_id', 'permissions'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
            'permissions' => 'array',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(User::class, 'parent_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::SuperAdmin;
    }

    public function canEdit(): bool
    {
        return $this->hasPermission(Permission::ManageContent);
    }

    /**
     * @return list<string>
     */
    public function permissionList(): array
    {
        if ($this->isAdmin()) {
            return Permission::adminDefaults();
        }

        $stored = $this->permissions;

        if (! is_array($stored) || $stored === []) {
            return match ($this->role) {
                UserRole::Editor, UserRole::Reviewer => Permission::editorDefaults(),
                default => Permission::viewerDefaults(),
            };
        }

        return array_values(array_unique(array_filter(
            $stored,
            fn ($p) => is_string($p) && in_array($p, Permission::values(), true),
        )));
    }

    public function hasPermission(Permission|string $permission): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        $value = $permission instanceof Permission ? $permission->value : $permission;

        return in_array($value, $this->permissionList(), true);
    }

    /**
     * @param  list<string>  $requested
     */
    public function canGrantPermissions(array $requested): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        $allowed = $this->permissionList();

        foreach ($requested as $perm) {
            if (! in_array($perm, $allowed, true)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Self + all descendants. Null means no filter (admin sees all).
     *
     * @return list<int>|null
     */
    public function visibleCreatorIds(): ?array
    {
        if ($this->isAdmin() || $this->hasPermission(Permission::ViewAdminViews)) {
            return null;
        }

        return $this->descendantIdsIncludingSelf();
    }

    /**
     * @return list<int>
     */
    public function descendantIdsIncludingSelf(): array
    {
        $ids = [(int) $this->id];
        $frontier = [(int) $this->id];

        while ($frontier !== []) {
            $children = self::query()
                ->whereIn('parent_id', $frontier)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();

            $new = array_values(array_diff($children, $ids));
            $ids = [...$ids, ...$new];
            $frontier = $new;
        }

        return $ids;
    }

    /**
     * @return list<int>
     */
    public function descendantIds(): array
    {
        return array_values(array_diff($this->descendantIdsIncludingSelf(), [(int) $this->id]));
    }

    public function isAncestorOf(User $other): bool
    {
        $current = $other->parent;

        while ($current) {
            if ((int) $current->id === (int) $this->id) {
                return true;
            }
            $current = $current->parent;
        }

        return false;
    }

    public function canManageUser(User $target): bool
    {
        if ($this->isAdmin() || $this->hasPermission(Permission::ManageUsers)) {
            return true;
        }

        if (! $this->hasPermission(Permission::ManageSubusers)) {
            return false;
        }

        return in_array((int) $target->id, $this->descendantIds(), true);
    }

    public function canViewCreatedBy(?int $createdBy): bool
    {
        $visible = $this->visibleCreatorIds();

        if ($visible === null) {
            return true;
        }

        if ($createdBy === null) {
            return false;
        }

        return in_array((int) $createdBy, $visible, true);
    }

    public function deactivateDescendants(): void
    {
        $ids = $this->descendantIds();

        if ($ids === []) {
            return;
        }

        self::query()->whereIn('id', $ids)->update(['is_active' => false]);
    }
}
