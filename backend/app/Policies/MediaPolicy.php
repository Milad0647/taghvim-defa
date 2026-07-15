<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Media;
use App\Models\User;

class MediaPolicy
{
    public function create(User $user): bool
    {
        return $user->hasPermission(Permission::ManageContent);
    }

    public function delete(User $user, Media $media): bool
    {
        $attachable = $media->attachable;

        if (! $attachable || ! isset($attachable->created_by)) {
            return $user->isAdmin();
        }

        return $user->hasPermission(Permission::ManageContent)
            && $user->canViewCreatedBy($attachable->created_by);
    }
}
