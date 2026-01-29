'use client';

import { Button } from '../../components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../../components/ui/card';
import { X, Loader2, Archive } from 'lucide-react';
import type { Board } from '../../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface ArchiveBoardModalProps {
    board: Board;
    onClose: () => void;
}

export function ArchiveBoardModal({ board, onClose }: ArchiveBoardModalProps) {
    const queryClient = useQueryClient();

    const archiveBoard = useMutation({
        mutationFn: (id: number) => api.post(`/api/kanban/boards/${id}/archive/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards'] });
            onClose();
        },
    });

    const handleArchive = async () => {
        await archiveBoard.mutateAsync(board.id);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Archive className="w-5 h-5 text-orange-600" />
                            </div>
                            <CardTitle>Archive Board</CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            disabled={archiveBoard.isPending}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <CardDescription>
                        Archiving this board will hide it from your active boards list. You
                        can restore it later from the archived boards section.
                    </CardDescription>

                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold">{board.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {board.column_count} columns • {board.card_count} cards
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                            💡 <strong>Tip:</strong> Archived boards can be restored at any
                            time without losing data.
                        </p>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={archiveBoard.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleArchive}
                        disabled={archiveBoard.isPending}
                    >
                        {archiveBoard.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Archiving...
                            </>
                        ) : (
                            <>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive Board
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
