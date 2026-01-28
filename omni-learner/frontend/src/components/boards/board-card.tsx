'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import type { Board } from '../../types';
import { Trello, MoreVertical, Users, ListTodo } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface BoardCardProps {
    board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
    const boardTypeColors = {
        personal: 'bg-blue-500',
        project: 'bg-purple-500',
        sprint: 'bg-green-500',
    };

    return (
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.preventDefault();
                                // Handle menu
                            }}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
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
    );
}
