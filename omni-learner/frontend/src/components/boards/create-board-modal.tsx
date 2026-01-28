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
import { useCreateBoard } from '../../hooks/use-boards';
import { X, Loader2 } from 'lucide-react';

interface CreateBoardModalProps {
    onClose: () => void;
}

export function CreateBoardModal({ onClose }: CreateBoardModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        board_type: 'personal' as 'personal' | 'project' | 'sprint',
    });

    const createBoard = useCreateBoard();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createBoard.mutateAsync(formData);
            onClose();
        } catch (error) {
            console.error('Failed to create board:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Create New Board</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            disabled={createBoard.isPending}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <CardDescription>
                        Create a new Kanban board to organize your tasks
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Board Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="e.g., My Learning Journey"
                                required
                                disabled={createBoard.isPending}
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
                                placeholder="Brief description of this board..."
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={createBoard.isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Board Type</Label>
                            <select
                                id="type"
                                value={formData.board_type}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        board_type: e.target.value as any,
                                    })
                                }
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                disabled={createBoard.isPending}
                            >
                                <option value="personal">Personal Learning</option>
                                <option value="project">Project-based</option>
                                <option value="sprint">Sprint Planning</option>
                            </select>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={createBoard.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createBoard.isPending}>
                            {createBoard.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Board'
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
