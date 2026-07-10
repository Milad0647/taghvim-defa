<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'color',
        'type',
    ];

    public function enemyActions(): HasMany
    {
        return $this->hasMany(EnemyAction::class);
    }

    public function governmentActions(): HasMany
    {
        return $this->hasMany(GovernmentAction::class);
    }
}
