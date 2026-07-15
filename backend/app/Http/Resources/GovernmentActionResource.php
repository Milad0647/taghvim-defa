<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\GovernmentAction */
class GovernmentActionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'agency' => $this->agency,
            'completed_at' => $this->completed_at?->toIso8601String(),
            'status' => $this->status?->value,
            'custom_fields' => $this->custom_fields ?? [],
            'tags' => $this->tags ?? [],
            'created_by' => $this->created_by,
            'agency_id' => $this->agency_id,
            'date' => $this->completed_at?->toDateString()
                ?? $this->calendarDay?->date?->toDateString(),
            'creator' => $this->whenLoaded('creator', fn () => $this->creator ? [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ] : null),
            'calendar_day' => $this->whenLoaded('calendarDay', fn () => $this->calendarDay ? [
                'id' => $this->calendarDay->id,
                'date' => $this->calendarDay->date?->toDateString(),
            ] : null),
            'response_to_id' => $this->response_to_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'media' => MediaResource::collection($this->whenLoaded('media')),
            'response_to' => new EnemyActionResource($this->whenLoaded('responseTo')),
        ];
    }
}
