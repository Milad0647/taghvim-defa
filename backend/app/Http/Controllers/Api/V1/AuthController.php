<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\SecurityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

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

        /** @var User|null $user */
        $user = User::query()
            ->where(function ($q) use ($login) {
                $q->where('username', $login)
                    ->orWhere('email', $login)
                    ->orWhere('name', $login);
            })
            ->first();

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

        $token = $user->createToken('api')->plainTextToken;

        SecurityLog::info('auth.login_success', [
            'user_id' => $user->id,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ]);
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
}
