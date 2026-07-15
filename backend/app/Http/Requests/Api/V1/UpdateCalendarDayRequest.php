<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\PublishStatus;
use App\Models\CalendarDay;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCalendarDayRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var CalendarDay $day */
        $day = $this->route('calendarDay');

        return $this->user()?->can('update', $day) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'summary' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', Rule::enum(PublishStatus::class)],
            'is_featured' => ['sometimes', 'boolean'],
        ];
    }
}
