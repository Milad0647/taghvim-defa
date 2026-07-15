<?php

namespace App\Models;

use App\Enums\ActionSeverity;
use App\Enums\PublishStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class EnemyAction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'calendar_day_id',
        'category_id',
        'title',
        'description',
        'severity',
        'source',
        'location',
        'latitude',
        'longitude',
        'occurred_at',
        'status',
        'custom_fields',
        'created_by',
        'agency_id',
    ];

    protected function casts(): array
    {
        return [
            'severity' => ActionSeverity::class,
            'status' => PublishStatus::class,
            'occurred_at' => 'datetime',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'custom_fields' => 'array',
        ];
    }

    public function calendarDay(): BelongsTo
    {
        return $this->belongsTo(CalendarDay::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(GovernmentAction::class, 'response_to_id');
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'attachable')->orderBy('sort_order');
    }
}
