<?php

namespace App\Models;

use App\Enums\PublishStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CalendarDay extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'date',
        'title',
        'summary',
        'status',
        'is_featured',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_featured' => 'boolean',
            'status' => PublishStatus::class,
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function enemyActions(): HasMany
    {
        return $this->hasMany(EnemyAction::class);
    }

    public function governmentActions(): HasMany
    {
        return $this->hasMany(GovernmentAction::class);
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'attachable')->orderBy('sort_order');
    }

    public function activityScore(): int
    {
        $enemyCount = $this->enemy_actions_count ?? $this->enemyActions()->count();
        $govCount = $this->government_actions_count ?? $this->governmentActions()->count();

        return ($enemyCount * 2) + $govCount;
    }
}
