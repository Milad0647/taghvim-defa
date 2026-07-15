<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\Permission;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', User::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email') && trim((string) $this->input('email')) === '') {
            $this->merge(['email' => null]);
        }

        if ($this->has('username')) {
            $this->merge([
                'username' => mb_strtolower(trim((string) $this->input('username'))),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'min:3',
                'max:64',
                'regex:/^[a-zA-Z0-9._-]+$/',
                'unique:users,username',
            ],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::defaults()],
            'role' => ['sometimes', Rule::enum(UserRole::class)],
            'is_active' => ['boolean'],
            'parent_id' => ['nullable', 'exists:users,id'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in(Permission::values())],
            'agency_ids' => ['nullable', 'array'],
            'agency_ids.*' => ['string', 'max:64'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.required' => 'نام کاربری الزامی است.',
            'username.regex' => 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، نقطه، خط تیره و زیرخط باشد.',
            'username.unique' => 'این نام کاربری قبلاً استفاده شده است.',
            'password.min' => 'رمز عبور باید حداقل ۱۰ کاراکتر باشد.',
            'password.mixed' => 'رمز عبور باید شامل حروف بزرگ و کوچک باشد.',
            'password.letters' => 'رمز عبور باید شامل حروف باشد.',
            'password.numbers' => 'رمز عبور باید شامل عدد باشد.',
            'password.symbols' => 'رمز عبور باید شامل نماد (!@#$…) باشد.',
        ];
    }
}
