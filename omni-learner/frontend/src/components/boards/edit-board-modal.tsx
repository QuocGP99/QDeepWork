'use client';

import { useState, useEffect } from 'react';
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
import { useUpdateBoard } from '../../hooks/use-boards';
import { X, Loader2 } from 'lucide-react';
import type { Board } from '../../types';

interface EditBoardModalProps {
  board: Board;
  onClose: () => void;
}

export function EditBoardModal({ board, onClose }: EditBoardModalProps) {
  const [formData, setFormData] = useState({
    name: board.name,
    description: board.description,
    board_type: board.board_type,
    is_active: board.is_active,
  });

  const updateBoard = useUpdateBoard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateBoard.mutateAsync({
        id: board.id,
        data: formData,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update board:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit Board</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={updateBoard.isPending}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>Update board information</CardDescription>
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
                disabled={updateBoard.isPending}
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
                disabled={updateBoard.isPending}
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
                disabled={updateBoard.isPending}
              >
                <option value="personal">Personal Learning</option>
                <option value="project">Project-based</option>
                <option value="sprint">Sprint Planning</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={updateBoard.isPending}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active board
              </Label>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateBoard.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateBoard.isPending}>
              {updateBoard.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
