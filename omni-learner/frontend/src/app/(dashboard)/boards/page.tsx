'use client';

import { useState } from 'react';
import { useBoards } from '../../../hooks/use-boards';
import { BoardCard } from '../../../components/boards/board-card';
import { CreateBoardModal } from '../../../components/boards/create-board-modal';
import { Button } from '../../../components/ui/button';
import { Plus, Loader2, Search, Archive } from 'lucide-react';
import { Input } from '../../../components/ui/input';

export default function BoardsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const { data: boards, isLoading, error } = useBoards();

    const filteredBoards = boards?.filter((board) => {
        const matchesSearch = board.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesArchived = showArchived ? board.is_archived : !board.is_archived;
        return matchesSearch && matchesArchived;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Failed to load boards</p>
            </div>
        );
    }


    const archivedCount = boards?.filter((b) => b.is_archived).length || 0;

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {showArchived ? 'Archived Boards' : 'My Boards'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {showArchived
                                ? `${archivedCount} archived boards`
                                : `Manage your Kanban boards and track progress`}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant={showArchived ? 'default' : 'outline'}
                            onClick={() => setShowArchived(!showArchived)}
                        >
                            <Archive className="w-4 h-4 mr-2" />
                            {showArchived ? 'Show Active' : `Archived (${archivedCount})`}
                        </Button>
                        {!showArchived && (
                            <Button onClick={() => setShowCreateModal(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Board
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search boards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Boards Grid */}
                {filteredBoards && filteredBoards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBoards.map((board) => (
                            <BoardCard key={board.id} board={board} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
                        {showArchived ? (
                            <>
                                <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No archived boards</h3>
                                <p className="text-muted-foreground">
                                    Archived boards will appear here
                                </p>
                            </>
                        ) : (
                            <>
                                <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No boards yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first board to get started
                                </p>
                                <Button onClick={() => setShowCreateModal(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Board
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Create Board Modal */}
            {showCreateModal && (
                <CreateBoardModal onClose={() => setShowCreateModal(false)} />
            )}
        </>
    );
}
