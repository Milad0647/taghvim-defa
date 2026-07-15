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

        try {
            $this->ensureIsNotRateLimited($request, $login);

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

            $passwordHash = is_string($user?->getRawOriginal('password'))
                ? $user->getRawOriginal('password')
                : '';

            if (! $user || $passwordHash === '' || ! Hash::check($credentials['password'], $passwordHash)) {
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

            $token = $user->createToken('api')->plainTextToken;

            SecurityLog::info('auth.login_success', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => (new UserResource($user))->resolve(),
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            SecurityLog::warning('auth.login_exception', [
                'error' => $e->getMessage(),
                'type' => $e::class,
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'ورود موقتاً در دسترس نیست.',
                'error_type' => class_basename($e),
            ], 503);
        }
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
        $key = 'login:'.sha1($request->ip().'|'.strtolower($login));

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
            SecurityLog::warning('auth.rate_limit_unavailable', [
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
            ]);
        }
    }
}
