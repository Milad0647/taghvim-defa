<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\PublishStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCalendarDayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\CalendarDay::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date', 'unique:calendar_days,date'],
            'title' => ['nullable', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'status' => ['nullable', Rule::enum(PublishStatus::class)],
            'is_featured' => ['boolean'],
        ];
    }
}
