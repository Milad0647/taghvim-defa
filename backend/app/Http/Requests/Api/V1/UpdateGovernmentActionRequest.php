<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\PublishStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGovernmentActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var \App\Models\GovernmentAction $action */
        $action = $this->route('governmentAction');

        return $this->user()?->can('update', $action) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'agency' => ['nullable', 'string', 'max:255'],
            'completed_at' => ['nullable', 'date'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'response_to_id' => ['nullable', 'exists:enemy_actions,id'],
            'status' => ['nullable', Rule::enum(PublishStatus::class)],
            'custom_fields' => ['nullable', 'array'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:64'],
            'agency_id' => ['nullable', 'string', 'max:64'],
        ];
    }
}
