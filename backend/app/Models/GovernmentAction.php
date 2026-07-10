<?php

namespace App\Models;

use App\Enums\PublishStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GovernmentAction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'calendar_day_id',
        'category_id',
        'response_to_id',
        'title',
        'description',
        'agency',
        'completed_at',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => PublishStatus::class,
            'completed_at' => 'datetime',
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

    public function responseTo(): BelongsTo
    {
        return $this->belongsTo(EnemyAction::class, 'response_to_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'attachable')->orderBy('sort_order');
    }
}
