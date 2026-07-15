<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FormDefinition;
use App\Models\FormField;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class FormSchemaController extends Controller
{
    public function show(): JsonResponse
    {
        $definition = FormDefinition::query()
            ->where('key', 'event_create')
            ->where('is_active', true)
            ->with(['fields' => fn ($q) => $q->orderBy('sort_order')])
            ->first();

        if (! $definition) {
            return response()->json(['data' => $this->fallbackSchema()]);
        }

        return response()->json([
            'data' => $this->serialize($definition),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'fields' => ['required', 'array', 'min:1'],
            'fields.*.key' => ['required', 'string', 'max:64'],
            'fields.*.label' => ['required', 'string', 'max:255'],
            'fields.*.type' => ['required', 'string', Rule::in(['text', 'textarea', 'select', 'date', 'number', 'boolean', 'file'])],
            'fields.*.options' => ['nullable', 'array'],
            'fields.*.required' => ['boolean'],
            'fields.*.sort_order' => ['integer', 'min:0'],
            'fields.*.section' => ['nullable', 'string', 'max:64'],
            'fields.*.is_system' => ['boolean'],
            'fields.*.is_active' => ['boolean'],
        ]);

        $definition = FormDefinition::query()->firstOrCreate(
            ['key' => 'event_create'],
            ['name' => 'ثبت رویداد', 'is_active' => true],
        );

        if (isset($data['name'])) {
            $definition->update(['name' => $data['name']]);
        }

        $existingSystemKeys = $definition->fields()->where('is_system', true)->pluck('key')->all();
        $incomingKeys = collect($data['fields'])->pluck('key')->all();

        foreach ($existingSystemKeys as $systemKey) {
            if (! in_array($systemKey, $incomingKeys, true)) {
                return response()->json([
                    'message' => "System field [{$systemKey}] cannot be removed.",
                ], 422);
            }
        }

        DB::transaction(function () use ($definition, $data) {
            $keepIds = [];

            foreach ($data['fields'] as $index => $fieldData) {
                $existing = $definition->fields()->where('key', $fieldData['key'])->first();

                if ($existing?->is_system) {
                    $existing->update([
                        'label' => $fieldData['label'],
                        'required' => $fieldData['required'] ?? $existing->required,
                        'sort_order' => $fieldData['sort_order'] ?? $index,
                        'section' => $fieldData['section'] ?? $existing->section,
                        'is_active' => $fieldData['is_active'] ?? true,
                        'options' => $fieldData['options'] ?? $existing->options,
                    ]);
                    $keepIds[] = $existing->id;
                    continue;
                }

                $field = FormField::query()->updateOrCreate(
                    [
                        'form_definition_id' => $definition->id,
                        'key' => $fieldData['key'],
                    ],
                    [
                        'label' => $fieldData['label'],
                        'type' => $fieldData['type'],
                        'options' => $fieldData['options'] ?? null,
                        'required' => $fieldData['required'] ?? false,
                        'sort_order' => $fieldData['sort_order'] ?? $index,
                        'section' => $fieldData['section'] ?? 'main',
                        'is_system' => false,
                        'is_active' => $fieldData['is_active'] ?? true,
                    ],
                );
                $keepIds[] = $field->id;
            }

            $definition->fields()
                ->where('is_system', false)
                ->whereNotIn('id', $keepIds)
                ->delete();
        });

        $definition->load(['fields' => fn ($q) => $q->orderBy('sort_order')]);

        return response()->json([
            'data' => $this->serialize($definition),
        ]);
    }

    private function serialize(FormDefinition $definition): array
    {
        return [
            'key' => $definition->key,
            'name' => $definition->name,
            'is_active' => $definition->is_active,
            'fields' => $definition->fields->map(fn (FormField $f) => [
                'id' => $f->id,
                'key' => $f->key,
                'label' => $f->label,
                'type' => $f->type,
                'options' => $f->options,
                'required' => $f->required,
                'sort_order' => $f->sort_order,
                'section' => $f->section,
                'is_system' => $f->is_system,
                'is_active' => $f->is_active,
            ])->values()->all(),
        ];
    }

    private function fallbackSchema(): array
    {
        return [
            'key' => 'event_create',
            'name' => 'ثبت رویداد',
            'is_active' => true,
            'fields' => [
                ['key' => 'eventType', 'label' => 'نوع رویداد', 'type' => 'select', 'options' => [['value' => 'enemy', 'label' => 'اقدام دشمن'], ['value' => 'government', 'label' => 'اقدام دولت']], 'required' => true, 'sort_order' => 0, 'section' => 'main', 'is_system' => true, 'is_active' => true],
                ['key' => 'title', 'label' => 'عنوان', 'type' => 'text', 'options' => null, 'required' => true, 'sort_order' => 1, 'section' => 'main', 'is_system' => true, 'is_active' => true],
                ['key' => 'summary', 'label' => 'خلاصه', 'type' => 'textarea', 'options' => null, 'required' => false, 'sort_order' => 2, 'section' => 'main', 'is_system' => true, 'is_active' => true],
                ['key' => 'date', 'label' => 'تاریخ', 'type' => 'date', 'options' => null, 'required' => true, 'sort_order' => 3, 'section' => 'main', 'is_system' => true, 'is_active' => true],
                ['key' => 'severity', 'label' => 'شدت', 'type' => 'select', 'options' => [['value' => 'low', 'label' => 'کم'], ['value' => 'medium', 'label' => 'متوسط'], ['value' => 'high', 'label' => 'بالا'], ['value' => 'critical', 'label' => 'بحرانی']], 'required' => true, 'sort_order' => 4, 'section' => 'main', 'is_system' => true, 'is_active' => true],
            ],
        ];
    }
}
