'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../ui/card';
import {
    useCard,
    useUpdateCard,
    useDeleteCard,
    useStartCard,
    useCompleteCard,
} from '../../hooks/use-cards';
import {
    X,
    Loader2,
    Calendar,
    Clock,
    Play,
    CheckCircle,
    Trash2,
    Edit,
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

interface CardDetailModalProps {
    cardId: number;
    onClose: () => void;
}

export function CardDetailModal({ cardId, onClose }: CardDetailModalProps) {
    const { data: card, isLoading } = useCard(cardId);
    const deleteCard = useDeleteCard();
    const startCard = useStartCard();
    const completeCard = useCompleteCard();

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this card?')) {
            await deleteCard.mutateAsync(cardId);
            onClose();
        }
    };

    const handleStart = async () => {
        await startCard.mutateAsync(cardId);
    };

    const handleComplete = async () => {
        await completeCard.mutateAsync(cardId);
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-2xl">
                    <CardContent className="p-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!card) return null;

    const priorityColors = {
        low: 'bg-gray-100 text-gray-700',
        medium: 'bg-blue-100 text-blue-700',
        high: 'bg-orange-100 text-orange-700',
        urgent: 'bg-red-100 text-red-700',
    };

    const statusColors = {
        normal: 'bg-green-100 text-green-700',
        at_risk: 'bg-yellow-100 text-yellow-700',
        blocked: 'bg-red-100 text-red-700',
        overdue: 'bg-red-200 text-red-800',
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-2xl mb-2">{card.title}</CardTitle>
                            <div className="flex items-center space-x-2">
                                <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[card.priority]
                                        }`}
                                >
                                    {card.priority}
                                </span>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[card.status]
                                        }`}
                                >
                                    {card.status}
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Description */}
                    <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">
                            {card.description || 'No description provided'}
                        </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                Due Date
                            </p>
                            <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    {card.due_date ? formatDateTime(card.due_date) : 'Not set'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                Time Tracking
                            </p>
                            <div className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>
                                    {card.actual_hours}h / {card.estimated_hours}h
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                Started At
                            </p>
                            <p className="text-sm">
                                {card.started_at ? formatDateTime(card.started_at) : 'Not started'}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                Completed At
                            </p>
                            <p className="text-sm">
                                {card.completed_at
                                    ? formatDateTime(card.completed_at)
                                    : 'Not completed'}
                            </p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">Progress</p>
                            <span className="text-sm text-muted-foreground">
                                {Math.round(card.completion_percentage)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${card.completion_percentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    {card.tags && card.tags.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {card.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleteCard.isPending}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>

                    <div className="flex space-x-2">
                        {!card.started_at && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleStart}
                                disabled={startCard.isPending}
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Start
                            </Button>
                        )}

                        {card.started_at && !card.completed_at && (
                            <Button
                                size="sm"
                                onClick={handleComplete}
                                disabled={completeCard.isPending}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Complete
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
