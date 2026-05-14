export type NotificationType = 'Event' | 'Result' | 'Placement';

export interface INotification {
  _id: string;
  studentId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  priorityScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

/* External API Contract Interface */
export interface ExternalNotification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}
