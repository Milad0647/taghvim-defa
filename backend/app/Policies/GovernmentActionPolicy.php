<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\GovernmentAction;
use App\Models\User;

class GovernmentActionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, GovernmentAction $governmentAction): bool
    {
        return $user->canViewCreatedBy($governmentAction->created_by);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission(Permission::ManageContent);
    }

    public function update(User $user, GovernmentAction $governmentAction): bool
    {
        return $user->hasPermission(Permission::ManageContent)
            && $user->canViewCreatedBy($governmentAction->created_by);
    }

    public function delete(User $user, GovernmentAction $governmentAction): bool
    {
        return $user->hasPermission(Permission::ManageContent)
            && $user->canViewCreatedBy($governmentAction->created_by);
    }

    public function restore(User $user, GovernmentAction $governmentAction): bool
    {
        return $user->hasPermission(Permission::ViewArchive)
            && $user->canViewCreatedBy($governmentAction->created_by);
    }

    public function forceDelete(User $user, GovernmentAction $governmentAction): bool
    {
        return $user->hasPermission(Permission::ForceDelete)
            && $user->canViewCreatedBy($governmentAction->created_by);
    }
}
