// src/access.ts
import { getToken } from '@/services/auth';

export default function access(initialState: { currentUser?: any }) {
  const { currentUser } = initialState || {};
  
  // 检查用户是否已登录
  const isLoggedIn = !!currentUser && !!getToken();
  
  // 检查用户是否为学委（roleType: 2）
  const isStudier = isLoggedIn && currentUser?.roleType === 2;
  
  // 检查用户是否为学生（roleType: 1）
  const isStudent = isLoggedIn && currentUser?.roleType === 1;
  
  return {
    isLoggedIn,
    isStudier,
    isStudent,
  };
}
