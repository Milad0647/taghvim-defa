<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\CalendarDay */
class CalendarDayResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $enemyCount = $this->enemy_actions_count ?? $this->enemyActions->count();
        $govCount = $this->government_actions_count ?? $this->governmentActions->count();
        $activityScore = ($enemyCount * 2) + $govCount;

        return [
            'id' => $this->id,
            'date' => $this->date?->toDateString(),
            'title' => $this->title,
            'summary' => $this->summary,
            'status' => $this->status?->value,
            'is_featured' => $this->is_featured,
            'enemy_actions_count' => $enemyCount,
            'government_actions_count' => $govCount,
            'activity_score' => $activityScore,
            'media' => MediaResource::collection($this->whenLoaded('media')),
            'enemy_actions' => EnemyActionResource::collection($this->whenLoaded('enemyActions')),
            'government_actions' => GovernmentActionResource::collection($this->whenLoaded('governmentActions')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
