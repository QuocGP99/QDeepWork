import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardService } from '../services/boards';
import type { Board } from '../types';

export function useBoards() {
    return useQuery({
        queryKey: ['boards'],
        queryFn: boardService.getBoards,
    });
}

export function useBoard(id: number) {
    return useQuery({
        queryKey: ['boards', id],
        queryFn: () => boardService.getBoard(id),
        enabled: !!id,
    });
}

export function useCreateBoard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (board: Partial<Board>) => boardService.createBoard(board),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards'] });
        },
    });
}

export function useUpdateBoard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Board> }) =>
            boardService.updateBoard(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['boards'] });
            queryClient.invalidateQueries({ queryKey: ['boards', variables.id] });
        },
    });
}

export function useDeleteBoard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => boardService.deleteBoard(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards'] });
        },
    });
}

export function useBoardStatistics(id: number) {
    return useQuery({
        queryKey: ['boards', id, 'statistics'],
        queryFn: () => boardService.getBoardStatistics(id),
        enabled: !!id,
    });
}
