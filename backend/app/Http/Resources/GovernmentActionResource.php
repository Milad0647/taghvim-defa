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
            'response_to_id' => $this->response_to_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'media' => MediaResource::collection($this->whenLoaded('media')),
            'response_to' => new EnemyActionResource($this->whenLoaded('responseTo')),
        ];
    }
}
