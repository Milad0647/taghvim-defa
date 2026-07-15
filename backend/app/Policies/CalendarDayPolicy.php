<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\CalendarDay;
use App\Models\User;

class CalendarDayPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CalendarDay $calendarDay): bool
    {
        return $user->canViewCreatedBy($calendarDay->created_by);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission(Permission::ManageContent);
    }

    public function update(User $user, CalendarDay $calendarDay): bool
    {
        return $user->hasPermission(Permission::ManageContent)
            && $user->canViewCreatedBy($calendarDay->created_by);
    }

    public function delete(User $user, CalendarDay $calendarDay): bool
    {
        return $user->hasPermission(Permission::ManageContent)
            && $user->canViewCreatedBy($calendarDay->created_by);
    }

    public function restore(User $user, CalendarDay $calendarDay): bool
    {
        return $user->hasPermission(Permission::ViewArchive)
            && $user->canViewCreatedBy($calendarDay->created_by);
    }

    public function forceDelete(User $user, CalendarDay $calendarDay): bool
    {
        return $user->hasPermission(Permission::ForceDelete)
            && $user->canViewCreatedBy($calendarDay->created_by);
    }
}
