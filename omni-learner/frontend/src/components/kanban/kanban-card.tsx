'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '../ui/card';
import type { Card as CardType } from '../../types';
import {
    Calendar,
    Clock,
    MessageSquare,
    Paperclip,
    GripVertical,
    AlertCircle,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface KanbanCardProps {
    card: CardType;
    onClick: () => void;
}

export function KanbanCard({ card, onClick }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id,
        data: {
            type: 'card',
            card,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const priorityColors = {
        low: 'bg-gray-100 text-gray-700',
        medium: 'bg-blue-100 text-blue-700',
        high: 'bg-orange-100 text-orange-700',
        urgent: 'bg-red-100 text-red-700',
    };

    const statusColors = {
        normal: 'border-l-green-500',
        at_risk: 'border-l-yellow-500',
        blocked: 'border-l-red-500',
        overdue: 'border-l-red-700',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <Card
                className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${statusColors[card.status]
                    } ${isDragging ? 'shadow-xl' : ''}`}
                onClick={onClick}
            >
                <CardContent className="p-4 space-y-3">
                    {/* Drag Handle & Priority */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 flex-1">
                            <button
                                {...listeners}
                                className="cursor-grab active:cursor-grabbing mt-1 text-gray-400 hover:text-gray-600"
                            >
                                <GripVertical className="w-4 h-4" />
                            </button>
                            <div className="flex-1">
                                <h4 className="font-medium text-sm leading-tight">
                                    {card.title}
                                </h4>
                            </div>
                        </div>
                        <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[card.priority]
                                }`}
                        >
                            {card.priority}
                        </span>
                    </div>

                    {/* Description */}
                    {card.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {card.description}
                        </p>
                    )}

                    {/* Tags */}
                    {card.tags && card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {card.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                                >
                                    {tag}
                                </span>
                            ))}
                            {card.tags.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                    +{card.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-3">
                            {/* Due Date */}
                            {card.due_date && (
                                <div
                                    className={`flex items-center space-x-1 ${card.is_overdue ? 'text-red-500 font-medium' : ''
                                        }`}
                                >
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(card.due_date)}</span>
                                    {card.is_overdue && <AlertCircle className="w-3 h-3" />}
                                </div>
                            )}

                            {/* Time Estimate */}
                            <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                    {card.actual_hours}/{card.estimated_hours}h
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Comments */}
                            {card.comment_count > 0 && (
                                <div className="flex items-center space-x-1">
                                    <MessageSquare className="w-3 h-3" />
                                    <span>{card.comment_count}</span>
                                </div>
                            )}

                            {/* Attachments */}
                            {card.attachment_count > 0 && (
                                <div className="flex items-center space-x-1">
                                    <Paperclip className="w-3 h-3" />
                                    <span>{card.attachment_count}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {card.completion_percentage > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-primary h-1.5 rounded-full transition-all"
                                style={{ width: `${card.completion_percentage}%` }}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
