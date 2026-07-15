<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\EnemyAction;
use App\Models\User;

class EnemyActionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, EnemyAction $enemyAction): bool
    {
        return $user->canViewCreatedBy($enemyAction->created_by);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission(Permission::ManageContent);
    }

    public function update(User $user, EnemyAction $enemyAction): bool
    {
        return $user->hasPermission(Permission::ManageContent)
            && $user->canViewCreatedBy($enemyAction->created_by);
    }

    public function delete(User $user, EnemyAction $enemyAction): bool
    {
        return $user->hasPermission(Permission::ManageContent)
            && $user->canViewCreatedBy($enemyAction->created_by);
    }

    public function restore(User $user, EnemyAction $enemyAction): bool
    {
        return $user->hasPermission(Permission::ViewArchive)
            && $user->canViewCreatedBy($enemyAction->created_by);
    }

    public function forceDelete(User $user, EnemyAction $enemyAction): bool
    {
        return $user->hasPermission(Permission::ForceDelete)
            && $user->canViewCreatedBy($enemyAction->created_by);
    }
}
