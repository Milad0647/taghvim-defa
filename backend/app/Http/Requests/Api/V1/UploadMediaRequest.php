<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Validator;

class UploadMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // 50MB — video/audio; images are typically much smaller
            'file' => ['required', 'file', 'max:51200'],
            'alt' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var UploadedFile|null $file */
            $file = $this->file('file');
            if (! $file instanceof UploadedFile) {
                return;
            }

            $mime = (string) ($file->getMimeType() ?: '');
            $allowed = str_starts_with($mime, 'image/')
                || str_starts_with($mime, 'video/')
                || str_starts_with($mime, 'audio/');

            if (! $allowed) {
                $validator->errors()->add('file', 'Only image, video, or audio files are allowed.');
            }
        });
    }
}
