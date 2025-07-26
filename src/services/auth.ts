// src/services/auth.ts
import { request } from '@umijs/max';

/**
 * 发送邮箱验证码
 * @param email 邮箱地址
 */
// src/services/auth.ts
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
 * 
 * @param data Use the email or studentId to login in
 * @returns POST request
 */
export async function login(data: {
  studentId?: string;
  email?: string;
  password: string;
}) {
  return request('/api/auth/login', {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function loginEmail(data: {
  email?: string;
  code?: string
}) {
  return request('/api/auth/loginEmail', {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}