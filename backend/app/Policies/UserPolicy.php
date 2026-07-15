<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin()
            || $user->hasPermission(Permission::ManageUsers)
            || $user->hasPermission(Permission::ManageSubusers);
    }

    public function view(User $actor, User $target): bool
    {
        if ($actor->id === $target->id) {
            return true;
        }

        return $actor->canManageUser($target)
            || in_array((int) $target->id, $actor->descendantIdsIncludingSelf(), true);
    }

    public function create(User $user): bool
    {
        return $user->isAdmin()
            || $user->hasPermission(Permission::ManageUsers)
            || $user->hasPermission(Permission::ManageSubusers);
    }

    public function update(User $actor, User $target): bool
    {
        return $actor->canManageUser($target);
    }

    public function delete(User $actor, User $target): bool
    {
        if ($actor->id === $target->id) {
            return false;
        }

        return $actor->canManageUser($target);
    }
}
