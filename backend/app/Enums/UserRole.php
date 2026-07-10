<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Editor = 'editor';
    case Reviewer = 'reviewer';
    case Viewer = 'viewer';
}
