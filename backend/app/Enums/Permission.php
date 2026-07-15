<?php

namespace App\Enums;

enum Permission: string
{
    case ViewAdminViews = 'view_admin_views';
    case ManageContent = 'manage_content';
    case Publish = 'publish';
    case ManageSubusers = 'manage_subusers';
    case ManageUsers = 'manage_users';
    case ManageSettings = 'manage_settings';
    case ManageAgencies = 'manage_agencies';
    case ManageFormSchema = 'manage_form_schema';
    case ViewArchive = 'view_archive';
    case ForceDelete = 'force_delete';
    case RunBackup = 'run_backup';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * @return list<string>
     */
    public static function adminDefaults(): array
    {
        return self::values();
    }

    /**
     * @return list<string>
     */
    public static function editorDefaults(): array
    {
        return [
            self::ManageContent->value,
            self::Publish->value,
            self::ManageSubusers->value,
            self::ViewArchive->value,
        ];
    }

    /**
     * @return list<string>
     */
    public static function viewerDefaults(): array
    {
        return [];
    }
}
