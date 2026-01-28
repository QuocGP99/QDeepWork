import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardService } from '../services/cards';
import type { Card } from '../types';

export function useCards(boardId?: number) {
    return useQuery({
        queryKey: ['cards', boardId],
        queryFn: () => cardService.getCards(boardId),
        enabled: !!boardId,
    });
}

export function useCard(id: number) {
    return useQuery({
        queryKey: ['cards', id],
        queryFn: () => cardService.getCard(id),
        enabled: !!id,
    });
}

export function useCreateCard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (card: Partial<Card>) => cardService.createCard(card),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['cards', variables.column] });
            queryClient.invalidateQueries({ queryKey: ['boards'] });
        },
    });
}

export function useUpdateCard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Card> }) =>
            cardService.updateCard(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            queryClient.invalidateQueries({ queryKey: ['cards', data.id] });
        },
    });
}

export function useMoveCard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            targetColumnId,
            position,
        }: {
            id: number;
            targetColumnId: number;
            position: number;
        }) => cardService.moveCard(id, targetColumnId, position),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            queryClient.invalidateQueries({ queryKey: ['boards'] });
        },
    });
}

export function useDeleteCard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => cardService.deleteCard(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            queryClient.invalidateQueries({ queryKey: ['boards'] });
        },
    });
}

export function useStartCard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => cardService.startCard(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards'] });
        },
    });
}

export function useCompleteCard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => cardService.completeCard(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards'] });
        },
    });
}
