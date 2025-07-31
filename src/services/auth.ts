// src/services/auth.ts
import { request } from '@umijs/max';

// 用户信息接口
export interface UserInfo {
  id: string;
  realName: string;
  avatarUrl?: string; // 统一头像字段
  studentId: string;
  email: string;
  classCode?: string;
  role?: string | number | null;
  roleType?: number;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 登录响应接口 - 匹配实际后端格式
export interface LoginResponse {
  token: string;
  studentId: string;
  avatarUrl: string;
  userId: number;
  email: string;
  realName: string;
  roleType: number;
  expireTime: string;
}

/**
 * 发送邮箱验证码
 * @param email 邮箱地址
 */
export async function sendEmailCode(email: string) {
  return request('/api/auth/send-code', {
    method: 'POST',
    data: { email },
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 注册用户
 * @param data 注册信息
 * @param data.realName 真实姓名
 * @param data.studentId 学号
 * @param data.email 邮箱地址
 * @param data.password 密码
 * @param data.verificationCode 验证码
 * @param data.classCode 班级代码
 * @return Promise
 */
export async function registerUser(data: {
  realName: string;
  studentId: string;
  email: string;
  password: string;
  verificationCode: string; 
  classCode: string;        
}) {
  return request('/api/auth/register', {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 学号登录
 * @param data 登录信息
 * @returns 登录响应
 */
export async function login(data: {
  studentId?: string;
  email?: string;
  password: string;
}): Promise<LoginResponse> {
  return request('/api/auth/login', {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 邮箱验证码登录
 * @param data 登录信息
 * @returns 登录响应
 */
export async function loginEmail(data: {
  email?: string;
  code?: string;
}): Promise<LoginResponse> {
  return request('/api/auth/loginEmail', {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export async function getCurrentUser(): Promise<UserInfo> {
  return request('/api/auth/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
}

/**
 * 保存JWT令牌到本地存储
 * @param token JWT令牌
 */
export function saveToken(token: string): void {
  localStorage.setItem('token', token);
}

/**
 * 从本地存储获取JWT令牌
 * @returns JWT令牌或null
 */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * 清除本地存储的令牌
 */
export function clearToken(): void {
  localStorage.removeItem('token');
}

/**
 * 检查是否已登录
 * @returns 是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getToken();
}

/**
 * 将登录响应转换为用户信息对象
 * @param response 登录响应
 * @returns 用户信息对象
 */
export function convertLoginResponseToUserInfo(response: any): UserInfo {
  return {
    id: response.userId?.toString() || response.id?.toString() || '',
    realName: response.realName,
    avatarUrl: response.avatarUrl || response.avatar_url || '',
    studentId: response.studentId,
    email: response.email,
    classCode: response.classCode,
    role: response.role,
    roleType: response.roleType,
    status: response.status,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  };
}

// 更换头像接口
export async function changeAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await request('/api/auth/change_avatar', {
      method: 'POST',
      data: formData,
    });
    
    // 如果返回的是字符串（头像URL），直接返回
    if (typeof response === 'string') {
      return response;
    }
    
    // 如果返回的是对象，可能包含错误信息
    if (response && typeof response === 'object') {
      throw new Error(response.message || '上传失败');
    }
    
    return response;
  } catch (error: any) {
    // 处理错误响应
    if (error.response) {
      const errorMessage = error.response.data || error.response.statusText || '上传失败';
      throw new Error(errorMessage);
    }
    
    // 处理网络错误
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error('网络错误，请检查网络连接');
  }
}

// 更新密码接口
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  verificationCode: string;
}

export async function changePassword(data: ChangePasswordRequest): Promise<string> {
  return request('/api/auth/change_passwd', {
    method: 'POST',
    data,
  });
}