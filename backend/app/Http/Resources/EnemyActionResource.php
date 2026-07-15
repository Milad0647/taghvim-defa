<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\EnemyAction */
class EnemyActionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'severity' => $this->severity?->value,
            'source' => $this->source,
            'location' => $this->location,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'occurred_at' => $this->occurred_at?->toIso8601String(),
            'status' => $this->status?->value,
            'custom_fields' => $this->custom_fields ?? [],
            'created_by' => $this->created_by,
            'agency_id' => $this->agency_id,
            'date' => $this->occurred_at?->toDateString()
                ?? $this->calendarDay?->date?->toDateString(),
            'creator' => $this->whenLoaded('creator', fn () => $this->creator ? [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ] : null),
            'calendar_day' => $this->whenLoaded('calendarDay', fn () => $this->calendarDay ? [
                'id' => $this->calendarDay->id,
                'date' => $this->calendarDay->date?->toDateString(),
            ] : null),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'media' => MediaResource::collection($this->whenLoaded('media')),
            'responses_count' => $this->whenCounted('responses'),
        ];
    }
}
