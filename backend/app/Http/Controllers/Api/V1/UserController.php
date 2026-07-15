<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\Permission;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreUserRequest;
use App\Http\Requests\Api\V1\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\SecurityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        /** @var User $actor */
        $actor = $request->user();

        $query = User::query()->orderBy('name');

        if (! $actor->isAdmin() && ! $actor->hasPermission(Permission::ManageUsers)) {
            $descendantIds = $actor->descendantIds();
            $query->whereIn('id', $descendantIds === [] ? [0] : $descendantIds);
        }

        $users = $query->get();

        return response()->json([
            'data' => UserResource::collection($users),
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        /** @var User $actor */
        $actor = $request->user();
        $data = $request->validated();

        $permissions = $data['permissions'] ?? [];
        $agencyIds = array_values(array_map('strval', $data['agency_ids'] ?? []));
        unset($data['permissions'], $data['agency_ids']);

        if (! $actor->canGrantPermissions($permissions)) {
            return response()->json(['message' => 'Cannot grant permissions you do not have.'], 422);
        }

        if ($actor->isAdmin() || $actor->hasPermission(Permission::ManageUsers)) {
            $parentId = $data['parent_id'] ?? null;
            $role = $data['role'] ?? UserRole::Editor->value;
        } else {
            $parentId = $actor->id;
            $role = UserRole::Editor->value;
            unset($data['role'], $data['parent_id']);
            // Sub-users can only receive agencies the parent has
            $parentAgencies = array_map('strval', $actor->agency_ids ?? []);
            if ($parentAgencies !== []) {
                $agencyIds = array_values(array_intersect($agencyIds, $parentAgencies));
            }
        }

        if ($parentId !== null) {
            $parent = User::query()->findOrFail($parentId);
            if (! $actor->isAdmin() && (int) $parent->id !== (int) $actor->id && ! $actor->canManageUser($parent)) {
                return response()->json(['message' => 'Invalid parent user.'], 422);
            }
        }

        $user = User::create([
            ...$data,
            'role' => $role,
            'parent_id' => $parentId,
            'permissions' => $permissions,
            'agency_ids' => $agencyIds,
            'is_active' => $data['is_active'] ?? true,
        ]);

        SecurityLog::info('user.created', [
            'actor_id' => $actor->id,
            'user_id' => $user->id,
            'permissions' => $permissions,
        ]);

        return response()->json([
            'data' => new UserResource($user),
        ], 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        /** @var User $actor */
        $actor = $request->user();
        $data = $request->validated();

        if (array_key_exists('permissions', $data)) {
            $permissions = $data['permissions'] ?? [];
            if (! $actor->canGrantPermissions($permissions)) {
                return response()->json(['message' => 'Cannot grant permissions you do not have.'], 422);
            }
            $data['permissions'] = $permissions;

            SecurityLog::info('user.permissions_updated', [
                'actor_id' => $actor->id,
                'user_id' => $user->id,
                'permissions' => $permissions,
            ]);
        }

        if (empty($data['password'])) {
            unset($data['password']);
        }

        if (array_key_exists('agency_ids', $data)) {
            $agencyIds = array_values(array_map('strval', $data['agency_ids'] ?? []));
            if (! $actor->isAdmin() && ! $actor->hasPermission(Permission::ManageUsers)) {
                $parentAgencies = array_map('strval', $actor->agency_ids ?? []);
                if ($parentAgencies !== []) {
                    $agencyIds = array_values(array_intersect($agencyIds, $parentAgencies));
                }
            }
            $data['agency_ids'] = $agencyIds;
        }

        if (! $actor->isAdmin() && ! $actor->hasPermission(Permission::ManageUsers)) {
            unset($data['role'], $data['parent_id']);
        }

        $user->update($data);

        return response()->json([
            'data' => new UserResource($user->fresh()),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        /** @var User $actor */
        $actor = $request->user();

        if ($actor->id === $user->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 422);
        }

        $user->deactivateDescendants();
        $user->is_active = false;
        $user->save();
        $user->tokens()->delete();
        $user->delete();

        SecurityLog::warning('user.deleted', [
            'actor_id' => $actor->id,
            'user_id' => $user->id,
        ]);

        return response()->json(['message' => 'Deleted']);
    }

    public function permissions(Request $request, User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return response()->json([
            'data' => [
                'permissions' => $user->permissionList(),
                'grantable' => $request->user()->permissionList(),
            ],
        ]);
    }
}
