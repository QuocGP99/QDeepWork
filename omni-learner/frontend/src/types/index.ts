// User types
export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  wallet_balance: number;
  penalty_per_miss: number;
}

// Board types
export interface Board {
  id: number;
  name: string;
  description: string;
  board_type: 'personal' | 'project' | 'sprint';
  is_active: boolean;
  is_archived: boolean;
  owner: number;
  owner_email: string;
  column_count: number;
  card_count: number;
  created_at: string;
  updated_at: string;
  columns?: Column[];
  default_columns?: string[];
}

// Column types
export interface Column {
  id: number;
  board: number;
  name: string;
  position: number;
  wip_limit: number | null;
  color: string;
  card_count: number;
  is_wip_limit_reached: boolean;
  cards?: Card[];
  created_at: string;
  updated_at: string;
}

// Card types
export type CardPriority = 'low' | 'medium' | 'high' | 'urgent';
export type CardStatus = 'normal' | 'at_risk' | 'blocked' | 'overdue';

export interface Card {
  id: number;
  column: number;
  title: string;
  description: string;
  assigned_to: number | null;
  assigned_to_email?: string;
  position: number;
  estimated_hours: number;
  actual_hours: number;
  priority: CardPriority;
  status: CardStatus;
  tags: string[];
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  is_overdue: boolean;
  completion_percentage: number;
  comment_count: number;
  attachment_count: number;
  created_at: string;
  updated_at: string;
}

// Sprint types
export interface Sprint {
  id: number;
  board: number;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_completed: boolean;
  planned_hours: number;
  actual_hours: number;
  planned_story_points: number;
  completed_story_points: number;
  duration_days: number;
  velocity: number;
  completion_rate: number;
  cards_summary: {
    total: number;
    completed: number;
    in_progress: number;
  };
  created_at: string;
  updated_at: string;
}

// Comment types
export interface Comment {
  id: number;
  card: number;
  author: number;
  author_email: string;
  author_name: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// API types
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}
