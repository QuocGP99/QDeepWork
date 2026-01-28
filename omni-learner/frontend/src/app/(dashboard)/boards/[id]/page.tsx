'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useBoard } from '../../../../hooks/use-boards';
import { useCards, useMoveCard } from '../../../../hooks/use-cards';
import { KanbanColumn } from '../../../../components/kanban/kanban-column';
import { CreateCardModal } from '../../../../components/kanban/create-card-modal';
import { CardDetailModal } from '../../../../components/kanban/card-detail-modal';
import { Button } from '../../../../components/ui/button';
import { Loader2, ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import type { Card as CardType } from '../../../../types';

export default function BoardDetailPage() {
    const params = useParams();
    const boardId = parseInt(params.id as string);

    const { data: board, isLoading: boardLoading } = useBoard(boardId);
    const { data: cards, isLoading: cardsLoading } = useCards(boardId);
    const moveCard = useMoveCard();

    const [activeCard, setActiveCard] = useState<CardType | null>(null);
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
    const [createCardColumnId, setCreateCardColumnId] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const card = active.data.current?.card as CardType;
        setActiveCard(card);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);

        if (!over) return;

        const activeCard = active.data.current?.card as CardType;
        const overColumn = over.data.current?.column;

        if (!activeCard || !overColumn) return;

        // If dropped on a different column
        if (activeCard.column !== overColumn.id) {
            try {
                await moveCard.mutateAsync({
                    id: activeCard.id,
                    targetColumnId: overColumn.id,
                    position: 0,
                });
            } catch (error) {
                console.error('Failed to move card:', error);
            }
        }
    };

    if (boardLoading || cardsLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!board) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Board not found</p>
            </div>
        );
    }

    const columns = board.columns || [];
    console.log('DEBUG CARDS:', cards);
    const allCards = Array.isArray(cards) ? cards : [];

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/boards">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
                            <p className="text-muted-foreground mt-1">{board.description}</p>
                        </div>
                    </div>

                    <Link href={`/boards/${boardId}/statistics`}>
                        <Button variant="outline">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Statistics
                        </Button>
                    </Link>
                </div>

                {/* Kanban Board */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex space-x-4 overflow-x-auto pb-4">
                        {columns.map((column) => {
                            const columnCards = allCards.filter((card) => card.column === column.id);
                            return (
                                <KanbanColumn
                                    key={column.id}
                                    column={column}
                                    cards={columnCards}
                                    onAddCard={() => setCreateCardColumnId(column.id)}
                                    onCardClick={(card) => setSelectedCardId(card.id)}
                                />
                            );
                        })}
                    </div>

                    <DragOverlay>
                        {activeCard ? (
                            <div className="w-80 opacity-90">
                                <div className="bg-white rounded-lg border shadow-lg p-4">
                                    <h4 className="font-medium text-sm">{activeCard.title}</h4>
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Modals */}
            {createCardColumnId && (
                <CreateCardModal
                    columnId={createCardColumnId}
                    onClose={() => setCreateCardColumnId(null)}
                />
            )}

            {selectedCardId && (
                <CardDetailModal
                    cardId={selectedCardId}
                    onClose={() => setSelectedCardId(null)}
                />
            )}
        </>
    );
}
