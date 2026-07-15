<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\SecurityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Throwable;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'username' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        $login = trim((string) ($credentials['username'] ?? $credentials['email'] ?? ''));
        if ($login === '') {
            throw ValidationException::withMessages([
                'username' => ['نام کاربری الزامی است.'],
            ]);
        }

        $this->ensureIsNotRateLimited($request, $login);

        try {
            $hasUsername = Schema::hasColumn('users', 'username');

            /** @var User|null $user */
            $user = User::query()
                ->where(function ($q) use ($login, $hasUsername) {
                    $q->where('email', $login)->orWhere('name', $login);
                    if ($hasUsername) {
                        $q->orWhere('username', $login);
                    }
                })
                ->first();
        } catch (Throwable $e) {
            SecurityLog::warning('auth.login_query_failed', [
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'ورود موقتاً در دسترس نیست. پیکربندی پایگاه‌داده را بررسی کنید.',
            ], 503);
        }

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            SecurityLog::warning('auth.login_failed', [
                'username' => $login,
                'ip' => $request->ip(),
            ]);

            throw ValidationException::withMessages([
                'username' => ['Invalid credentials.'],
            ]);
        }

        if (! $user->is_active) {
            SecurityLog::warning('auth.login_inactive', [
                'username' => $login,
                'ip' => $request->ip(),
            ]);

            throw ValidationException::withMessages([
                'username' => ['This account is inactive.'],
            ]);
        }

        try {
            $token = $user->createToken('api')->plainTextToken;
        } catch (Throwable $e) {
            SecurityLog::warning('auth.login_token_failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'ورود موقتاً در دسترس نیست. جدول توکن‌ها را بررسی کنید.',
            ], 503);
        }

        SecurityLog::info('auth.login_success', [
            'user_id' => $user->id,
            'ip' => $request->ip(),
        ]);

        try {
            $payload = [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => (new UserResource($user))->resolve(),
            ];
        } catch (Throwable $e) {
            SecurityLog::warning('auth.login_serialize_failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'ورود موقتاً در دسترس نیست. داده کاربر ناقص است.',
            ], 503);
        }

        return response()->json($payload);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out']);
    }

    private function ensureIsNotRateLimited(Request $request, string $login): void
    {
        $key = 'login:'.sha1($request->ip().'|'.mb_strtolower($login));

        try {
            if (RateLimiter::tooManyAttempts($key, 5)) {
                throw ValidationException::withMessages([
                    'username' => ['تعداد تلاش بیش از حد است. یک دقیقه صبر کنید.'],
                ]);
            }

            RateLimiter::hit($key, 60);
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            // Fail open if cache/redis is down — do not block login with 500.
            SecurityLog::warning('auth.rate_limit_unavailable', [
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
            ]);
        }
    }
}
