import { api } from '../lib/api';
import type { Board, Column, PaginatedResponse } from '../types';

export const boardService = {
  // Boards
  async getBoards(): Promise<Board[]> {
    const { data } = await api.get<PaginatedResponse<Board> | Board[]>('/api/kanban/boards/');
    // Handle pagination (Django Rest Framework returns { results: [], count: ... })
    if ('results' in data && Array.isArray(data.results)) {
      return data.results;
    }
    return Array.isArray(data) ? data : [];
  },

  async getBoard(id: number): Promise<Board> {
    const { data } = await api.get<Board>(`/api/kanban/boards/${id}/`);
    return data;
  },

  async createBoard(board: Partial<Board>): Promise<Board> {
    const { data } = await api.post<Board>('/api/kanban/boards/', board);
    return data;
  },

  async updateBoard(id: number, board: Partial<Board>): Promise<Board> {
    const { data } = await api.patch<Board>(`/api/kanban/boards/${id}/`, board);
    return data;
  },

  async deleteBoard(id: number): Promise<void> {
    await api.delete(`/api/kanban/boards/${id}/`);
  },

  async getBoardStatistics(id: number): Promise<unknown> {
    const { data } = await api.get<unknown>(`/api/kanban/boards/${id}/statistics/`);
    return data;
  },

  // Columns
  async getColumns(boardId: number): Promise<Column[]> {
    const { data } = await api.get<PaginatedResponse<Column> | Column[]>(`/api/kanban/columns/?board=${boardId}`);
    if ('results' in data && Array.isArray(data.results)) {
      return data.results;
    }
    return Array.isArray(data) ? data : [];
  },

  async createColumn(column: Partial<Column>): Promise<Column> {
    const { data } = await api.post<Column>('/api/kanban/columns/', column);
    return data;
  },

  async updateColumn(id: number, column: Partial<Column>): Promise<Column> {
    const { data } = await api.patch<Column>(`/api/kanban/columns/${id}/`, column);
    return data;
  },

  async deleteColumn(id: number): Promise<void> {
    await api.delete(`/api/kanban/columns/${id}/`);
  },

  async duplicateBoard(id: number): Promise<Board> {
    const { data } = await api.post<Board>(`/api/kanban/boards/${id}/duplicate/`);
    return data;
  },
};
