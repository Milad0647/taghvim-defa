<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->when($request->query('type'), fn ($q, $type) => $q->where('type', $type))
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:enemy,government'],
            'color' => ['nullable', 'string', 'max:16'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:categories,slug'],
        ]);

        $category = Category::create([
            'name' => $data['name'],
            'type' => $data['type'],
            'color' => $data['color'] ?? '#7C3AED',
            'slug' => $data['slug'] ?? Str::slug($data['name']).'-'.Str::random(4),
        ]);

        return response()->json([
            'data' => new CategoryResource($category),
        ], 201);
    }
}
