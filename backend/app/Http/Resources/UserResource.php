<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $agencyIds = $this->agency_ids;
        if (! is_array($agencyIds)) {
            $agencyIds = [];
        }

        $role = $this->role;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $role instanceof \BackedEnum ? $role->value : (is_string($role) ? $role : null),
            'is_active' => $this->is_active,
            'parent_id' => $this->parent_id,
            'permissions' => $this->permissionList(),
            'agency_ids' => array_values(array_map('strval', $agencyIds)),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
