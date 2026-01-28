'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { KanbanCard } from './kanban-card';
import type { Column, Card as CardType } from '../../types';
import { Plus, AlertCircle } from 'lucide-react';

interface KanbanColumnProps {
    column: Column;
    cards: CardType[];
    onAddCard: () => void;
    onCardClick: (card: CardType) => void;
}

export function KanbanColumn({
    column,
    cards,
    onAddCard,
    onCardClick,
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: {
            type: 'column',
            column,
        },
    });

    const sortedCards = [...cards].sort((a, b) => a.position - b.position);
    const cardIds = sortedCards.map((card) => card.id);

    const isWipLimitReached =
        column.wip_limit !== null && cards.length >= column.wip_limit;

    return (
        <div className="flex-shrink-0 w-80">
            <Card
                className={`h-full flex flex-col ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
            >
                <CardHeader className="pb-3" style={{ backgroundColor: `${column.color}10` }}>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold flex items-center space-x-2">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: column.color }}
                            />
                            <span>{column.name}</span>
                            <span className="text-sm font-normal text-muted-foreground">
                                {cards.length}
                                {column.wip_limit && ` / ${column.wip_limit}`}
                            </span>
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onAddCard}
                            className="h-8 w-8"
                            disabled={isWipLimitReached}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* WIP Limit Warning */}
                    {isWipLimitReached && (
                        <div className="flex items-center space-x-2 text-xs text-orange-600 mt-2">
                            <AlertCircle className="w-3 h-3" />
                            <span>WIP limit reached</span>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-3" ref={setNodeRef}>
                    <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                            {sortedCards.map((card) => (
                                <KanbanCard
                                    key={card.id}
                                    card={card}
                                    onClick={() => onCardClick(card)}
                                />
                            ))}

                            {cards.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    <p>No cards yet</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onAddCard}
                                        className="mt-2"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add card
                                    </Button>
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </CardContent>
            </Card>
        </div>
    );
}
