import { api } from '../lib/api';
import type { Card } from '../types';

export const cardService = {
  async getCards(boardId?: number): Promise<Card[]> {
    const params = boardId ? { board_id: boardId } : {};
    const { data } = await api.get<any>('/api/kanban/cards/', { params });

    if (data.results && Array.isArray(data.results)) {
      return data.results;
    }
    return Array.isArray(data) ? data : [];
  },

  async getCard(id: number): Promise<Card> {
    const { data } = await api.get<Card>(`/api/kanban/cards/${id}/`);
    return data;
  },

  async createCard(card: Partial<Card>): Promise<Card> {
    const { data } = await api.post<Card>('/api/kanban/cards/', card);
    return data;
  },

  async updateCard(id: number, card: Partial<Card>): Promise<Card> {
    const { data } = await api.patch<Card>(`/api/kanban/cards/${id}/`, card);
    return data;
  },

  async deleteCard(id: number): Promise<void> {
    await api.delete(`/api/kanban/cards/${id}/`);
  },

  async moveCard(id: number, targetColumnId: number, position: number): Promise<Card> {
    const { data } = await api.post<Card>(`/api/kanban/cards/${id}/move/`, {
      target_column_id: targetColumnId,
      position,
    });
    return data;
  },

  async startCard(id: number): Promise<Card> {
    const { data } = await api.post<Card>(`/api/kanban/cards/${id}/start/`);
    return data;
  },

  async completeCard(id: number): Promise<Card> {
    const { data } = await api.post<Card>(`/api/kanban/cards/${id}/complete/`);
    return data;
  },
};
