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
  console.log('sendEmailCode函数被调用，邮箱:', email);
  
  try {
    const response = await request('/api/auth/send-code', {
      method: 'POST',
      data: { email },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('sendEmailCode响应:', response);
    return response;
  } catch (error: any) {
    console.error('sendEmailCode错误:', error);
    throw error;
  }
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
  const response = await request('/api/auth/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  // 转换响应数据，确保字段名一致
  return {
    id: response.id?.toString() || '',
    realName: response.realName,
    avatarUrl: response.avatarUrl || response.avatar_url || '', // 兼容两种字段名
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
    console.log('开始调用头像上传接口，文件信息:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    const response = await request('/api/auth/change_avatar', {
      method: 'POST',
      data: formData,
      // 对于 FormData，不设置 Content-Type，让浏览器自动设置
    });
    
    console.log('头像上传接口响应:', response);
    
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
    console.error('头像上传接口错误:', error);
    
    // 处理错误响应
    if (error.response) {
      console.error('错误响应详情:', error.response);
      const errorMessage = error.response.data?.message || error.response.data || error.response.statusText || '上传失败';
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
  email: string;
  newPassword: string;
  verificationCode: string;
}

export async function changePassword(data: ChangePasswordRequest): Promise<string> {
  console.log('changePassword函数被调用，参数:', data);
  
  try {
    const response = await request('/api/auth/change_passwd', {
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('changePassword响应:', response);
    return response;
  } catch (error: any) {
    console.error('changePassword错误:', error);
    throw error;
  }
}

// 更新邮箱接口
export interface UpdateEmailRequest {
  newEmail: string;
}

export async function updateEmail(data: UpdateEmailRequest): Promise<string> {
  console.log('updateEmail函数被调用，参数:', data);
  
  try {
    const response = await request('/api/auth/update-email', {
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('updateEmail响应:', response);
    return response;
  } catch (error: any) {
    console.error('updateEmail错误:', error);
    throw error;
  }
}

// Fuck You 接口（当用户提交作业时文件名不符合格式标准并使用了自动修改功能）
export async function fuckYou(): Promise<any> {
  console.log('fuckYou函数被调用');
  
  try {
    const response = await request('/api/homework-submission/fuck_you', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('fuckYou响应:', response);
    return response;
  } catch (error: any) {
    console.error('fuckYou错误:', error);
    throw error;
  }
}