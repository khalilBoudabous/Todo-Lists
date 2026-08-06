import axios from 'axios';
import type { LoginRequest, RegisterRequest, ApiResponse, UserListResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: RegisterRequest) => api.post('/register', data),
  login: (data: LoginRequest) => api.post('/login_check', data),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/profile'),
  updateProfile: (data: { firstName: string; lastName: string }) =>
    api.put('/profile', data),
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => api.put('/change-password', data),
};

export const userApi = {
  getAll: (params?: Record<string, string | boolean>) => api.get('/admin/users', { params }),
  getOne: (id: number) => api.get(`/admin/users/${id}`),
  create: (data: RegisterRequest) => api.post('/admin/users', data),
  update: (id: number, data: Partial<RegisterRequest>) => api.put(`/admin/users/${id}`, data),
  delete: (id: number) => api.delete(`/admin/users/${id}`),
  updateRole: (id: number, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),
  toggleStatus: (id: number, isEnabled: boolean) =>
    api.patch(`/admin/users/${id}/status`, { isEnabled }),
};

export const adminTodoListApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/admin/todolists', { params }),
  getByUser: (userId: number) => api.get(`/admin/todolists/user/${userId}`),
  createForUser: (userId: number, data: { title: string; description?: string }) =>
    api.post(`/admin/todolists/user/${userId}`, data),
  getOne: (id: number) => api.get(`/admin/todolists/${id}`),
  getTasks: (id: number, params?: Record<string, string | number>) =>
    api.get(`/admin/todolists/${id}/tasks`, { params }),
  createTask: (id: number, data: { title: string; description?: string; status: string; priority: string; dueDate?: string }) =>
    api.post(`/admin/todolists/${id}/tasks`, data),
  update: (id: number, data: { title: string; description?: string }) => api.put(`/admin/todolists/${id}`, data),
  delete: (id: number) => api.delete(`/admin/todolists/${id}`),
};

export const todoListApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/todolists', { params }),
  getOne: (id: number) => api.get(`/todolists/${id}`),
  create: (data: { title: string; description?: string }) => api.post('/todolists', data),
  update: (id: number, data: { title: string; description?: string }) => api.put(`/todolists/${id}`, data),
  delete: (id: number) => api.delete(`/todolists/${id}`),
};

export const taskApi = {
  getByTodoList: (todoListId: number, params?: Record<string, string | number>) =>
    api.get(`/todolists/${todoListId}/tasks`, { params }),
  getOne: (id: number) => api.get(`/tasks/${id}`),
  create: (todoListId: number, data: { title: string; description?: string; status: string; priority: string; dueDate?: string }) =>
    api.post(`/todolists/${todoListId}/tasks`, data),
  update: (id: number, data: { title?: string; description?: string; status?: string; priority?: string; dueDate?: string }) => api.put(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
  updateStatus: (id: number, status: string) =>
    api.patch(`/tasks/${id}/status`, { status }),
};

export const statsApi = {
  getDashboardStats: () => api.get('/dashboard/stats'),
};