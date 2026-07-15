<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ContentPublishedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly string $kind,
        public readonly int $actionId,
        public readonly string $title,
        public readonly int $actorId,
        public readonly string $actorName,
        public readonly ?string $date = null,
    ) {
    }

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $category = $this->kind === 'enemy' ? 'enemy_action' : 'government_action';
        $kindLabel = $this->kind === 'enemy' ? 'اقدام دشمن' : 'اقدام دولت';

        return [
            'category' => $category,
            'kind' => $this->kind,
            'action_id' => $this->actionId,
            'title' => $this->title,
            'actor_id' => $this->actorId,
            'actor_name' => $this->actorName,
            'date' => $this->date,
            'message' => sprintf(
                '%s محتوای جدید ثبت کرد: «%s» (%s)',
                $this->actorName,
                $this->title,
                $kindLabel,
            ),
        ];
    }
}
