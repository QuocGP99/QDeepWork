'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import type { Board } from '../../types';
import {
    Trello,
    MoreVertical,
    Users,
    ListTodo,
    Edit,
    Copy,
    Settings,
    Archive,
    Trash2,
    Undo2,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { EditBoardModal } from './edit-board-modal';
import { DeleteBoardModal } from './delete-board-modal';
import { BoardSettingsModal } from './board-settings-modal';
import { ArchiveBoardModal } from './archive-board-modal';
import { UnarchiveBoardModal } from './unarchive-board-modal';
import { useDuplicateBoard } from '../../hooks/use-boards';

interface BoardCardProps {
    board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);

    const duplicateBoard = useDuplicateBoard();

    const boardTypeColors = {
        personal: 'bg-blue-500',
        project: 'bg-purple-500',
        sprint: 'bg-green-500',
    };

    const handleDuplicate = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await duplicateBoard.mutateAsync(board.id);
            setShowMenu(false);
        } catch (error) {
            console.error('Failed to duplicate board:', error);
        }
    };

    return (
        <>
            <div className="relative">
                <Link href={`/boards/${board.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-2">
                                    <div
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${boardTypeColors[board.board_type]
                                            }`}
                                    >
                                        <Trello className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                            {board.name}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {board.board_type.charAt(0).toUpperCase() +
                                                board.board_type.slice(1)}
                                        </p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowMenu(!showMenu);
                                        }}
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>

                                    {/* Dropdown Menu */}
                                    {showMenu && (
                                        <div
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        >
                                            <div className="py-1">
                                                <button
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setShowEditModal(true);
                                                        setShowMenu(false);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    <span>Edit</span>
                                                </button>

                                                <button
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setShowSettingsModal(true);
                                                        setShowMenu(false);
                                                    }}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    <span>Settings</span>
                                                </button>

                                                <button
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                                                    onClick={handleDuplicate}
                                                    disabled={duplicateBoard.isPending}
                                                >
                                                    <Copy className="w-4 h-4" />
                                                    <span>
                                                        {duplicateBoard.isPending ? 'Duplicating...' : 'Duplicate'}
                                                    </span>
                                                </button>

                                                <hr className="my-1" />

                                                {board.is_archived ? (
                                                    <button
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 text-green-600 flex items-center space-x-2"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setShowUnarchiveModal(true);
                                                            setShowMenu(false);
                                                        }}
                                                    >
                                                        <Undo2 className="w-4 h-4" />
                                                        <span>Restore</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setShowArchiveModal(true);
                                                            setShowMenu(false);
                                                        }}
                                                    >
                                                        <Archive className="w-4 h-4" />
                                                        <span>Archive</span>
                                                    </button>
                                                )}

                                                <button
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setShowDeleteModal(true);
                                                        setShowMenu(false);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {board.description || 'No description'}
                            </p>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-4 text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                        <ListTodo className="w-4 h-4" />
                                        <span>{board.column_count} columns</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Users className="w-4 h-4" />
                                        <span>{board.card_count} cards</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                                Updated {formatDate(board.updated_at)}
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Close menu when clicking outside */}
                {showMenu && (
                    <div
                        className="fixed inset-0 z-0"
                        onClick={() => setShowMenu(false)}
                    />
                )}
            </div>

            {/* Modals */}
            {showEditModal && (
                <EditBoardModal board={board} onClose={() => setShowEditModal(false)} />
            )}

            {showDeleteModal && (
                <DeleteBoardModal
                    board={board}
                    onClose={() => setShowDeleteModal(false)}
                />
            )}

            {showSettingsModal && (
                <BoardSettingsModal
                    board={board}
                    onClose={() => setShowSettingsModal(false)}
                />
            )}

            {showArchiveModal && (
                <ArchiveBoardModal
                    board={board}
                    onClose={() => setShowArchiveModal(false)}
                />
            )}

            {showUnarchiveModal && (
                <UnarchiveBoardModal
                    board={board}
                    onClose={() => setShowUnarchiveModal(false)}
                />
            )}
        </>
    );
}
