'use client';

import { Button } from '../ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useDeleteBoard } from '../../hooks/use-boards';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import type { Board } from '../../types';
import { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface DeleteBoardModalProps {
    board: Board;
    onClose: () => void;
    onSuccess?: () => void;
}

export function DeleteBoardModal({
    board,
    onClose,
    onSuccess,
}: DeleteBoardModalProps) {
    const [confirmText, setConfirmText] = useState('');
    const deleteBoard = useDeleteBoard();

    const handleDelete = async () => {
        try {
            await deleteBoard.mutateAsync(board.id);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to delete board:', error);
        }
    };

    const isConfirmed = confirmText === board.name;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <CardTitle>Delete Board</CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            disabled={deleteBoard.isPending}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            This action cannot be undone. This will permanently delete the
                            board and all associated columns and cards.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            You are about to delete:
                        </p>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-semibold">{board.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {board.column_count} columns • {board.card_count} cards
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm">
                            Type <span className="font-mono font-bold">{board.name}</span> to
                            confirm
                        </Label>
                        <Input
                            id="confirm"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Enter board name"
                            disabled={deleteBoard.isPending}
                            className="font-mono"
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={deleteBoard.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={!isConfirmed || deleteBoard.isPending}
                    >
                        {deleteBoard.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete Board'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
