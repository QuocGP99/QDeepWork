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
import { useUpdateBoard } from '../../hooks/use-boards';
import { X, Loader2, Settings } from 'lucide-react';
import type { Board } from '../../types';

interface BoardSettingsModalProps {
  board: Board;
  onClose: () => void;
}

export function BoardSettingsModal({ board, onClose }: BoardSettingsModalProps) {
  const [defaultColumns, setDefaultColumns] = useState<string[]>(
    board.default_columns || []
  );
  const [newColumn, setNewColumn] = useState('');

  const updateBoard = useUpdateBoard();

  const handleAddColumn = () => {
    if (newColumn.trim()) {
      setDefaultColumns([...defaultColumns, newColumn.trim()]);
      setNewColumn('');
    }
  };

  const handleRemoveColumn = (index: number) => {
    setDefaultColumns(defaultColumns.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateBoard.mutateAsync({
        id: board.id,
        data: { default_columns: defaultColumns },
      });
      onClose();
    } catch (error) {
      console.error('Failed to update board settings:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Board Settings</CardTitle>
                <CardDescription>{board.name}</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={updateBoard.isPending}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Default Columns Configuration */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Default Columns</h4>
                <p className="text-sm text-muted-foreground">
                  These columns will be created automatically when duplicating
                  this board
                </p>
              </div>

              {/* Column List */}
              <div className="space-y-2">
                {defaultColumns.map((column, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium">{column}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveColumn(index)}
                      disabled={updateBoard.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add New Column */}
              <div className="flex space-x-2">
                <Input
                  value={newColumn}
                  onChange={(e) => setNewColumn(e.target.value)}
                  placeholder="Column name"
                  disabled={updateBoard.isPending}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddColumn();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddColumn}
                  disabled={!newColumn.trim() || updateBoard.isPending}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Board Info */}
            <div className="pt-4 border-t space-y-2">
              <h4 className="text-sm font-semibold">Board Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{board.board_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {board.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Columns</p>
                  <p className="font-medium">{board.column_count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cards</p>
                  <p className="font-medium">{board.card_count}</p>
                </div>
              </div>
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
                'Save Settings'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
