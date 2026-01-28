'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../ui/card';
import { useCreateCard } from '../../hooks/use-cards';
import { X, Loader2 } from 'lucide-react';
import type { CardPriority } from '../../types';

interface CreateCardModalProps {
    columnId: number;
    onClose: () => void;
}

export function CreateCardModal({ columnId, onClose }: CreateCardModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium' as CardPriority,
        estimated_hours: 1,
        tags: '',
        due_date: '',
    });

    const createCard = useCreateCard();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCard.mutateAsync({
                column: columnId,
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                estimated_hours: formData.estimated_hours,
                tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
                due_date: formData.due_date || null,
            });
            onClose();
        } catch (error) {
            console.error('Failed to create card:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Create New Card</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            disabled={createCard.isPending}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <CardDescription>Add a new task to your board</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="e.g., Learn React Hooks"
                                required
                                disabled={createCard.isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Describe the task..."
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                disabled={createCard.isPending}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <select
                                    id="priority"
                                    value={formData.priority}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            priority: e.target.value as CardPriority,
                                        })
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    disabled={createCard.isPending}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estimated_hours">Estimated Hours</Label>
                                <Input
                                    id="estimated_hours"
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={formData.estimated_hours}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            estimated_hours: parseFloat(e.target.value),
                                        })
                                    }
                                    disabled={createCard.isPending}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="due_date">Due Date</Label>
                            <Input
                                id="due_date"
                                type="datetime-local"
                                value={formData.due_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, due_date: e.target.value })
                                }
                                disabled={createCard.isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input
                                id="tags"
                                value={formData.tags}
                                onChange={(e) =>
                                    setFormData({ ...formData, tags: e.target.value })
                                }
                                placeholder="e.g., react, frontend, learning"
                                disabled={createCard.isPending}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={createCard.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createCard.isPending}>
                            {createCard.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Card'
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
