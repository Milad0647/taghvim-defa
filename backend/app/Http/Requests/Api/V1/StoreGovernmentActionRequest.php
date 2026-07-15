<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\PublishStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGovernmentActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\GovernmentAction::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'agency' => ['nullable', 'string', 'max:255'],
            'completed_at' => ['nullable', 'date'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'response_to_id' => ['nullable', 'exists:enemy_actions,id'],
            'status' => ['nullable', Rule::enum(PublishStatus::class)],
            'custom_fields' => ['nullable', 'array'],
        ];
    }
}
