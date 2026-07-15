<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\PublishStatus;
use App\Models\CalendarDay;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEnemyActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\EnemyAction::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'severity' => ['nullable', 'in:low,medium,high,critical'],
            'source' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'occurred_at' => ['nullable', 'date'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'status' => ['nullable', Rule::enum(PublishStatus::class)],
            'custom_fields' => ['nullable', 'array'],
        ];
    }
}
