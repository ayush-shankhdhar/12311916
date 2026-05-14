import axios from 'axios';
import { clientLog } from './logger';
import { INotification, ApiResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

/* Inject client logging wrappers across request lifecycle */
apiClient.interceptors.request.use((config) => {
  clientLog('debug', 'api', `[HTTP Request] -> ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    clientLog('info', 'api', `[HTTP Response] <- ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    clientLog('error', 'api', `[HTTP Failure] !! ${error.message} at ${error.config?.url}`);
    return Promise.reject(error);
  }
);

export const notificationApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    notification_type?: string;
    studentId?: string;
    isRead?: boolean;
  }) => {
    clientLog('info', 'api', `Fetching notifications (Page=${params.page}, Type=${params.notification_type})`);
    const { data } = await apiClient.get<ApiResponse<INotification[]>>('/notifications', { params });
    return data;
  },

  getPriority: async (limit = 10) => {
    clientLog('info', 'api', `Fetching top priority notifications (Limit=${limit})`);
    const { data } = await apiClient.get<ApiResponse<INotification[]>>('/notifications/priority', {
      params: { limit }
    });
    return data;
  },

  markAsRead: async (id: string) => {
    clientLog('info', 'api', `PATCH marking notification ${id} read`);
    const { data } = await apiClient.patch<ApiResponse<INotification>>(`/notifications/${id}/read`);
    return data;
  },

  create: async (payload: { studentId: string; type: string; message: string }) => {
    clientLog('info', 'api', `POST creating notification`);
    const { data } = await apiClient.post<ApiResponse<INotification>>('/notifications', payload);
    return data;
  }
};
