export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoList {
  id: number;
  title: string;
  description: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  todoListId: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface DashboardStats {
  todoLists: number;
  tasks: {
    total: number;
    completed: number;
    completionRate: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
  };
}

export interface UserListResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}