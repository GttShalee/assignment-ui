// 认证工具函数
import { saveToken, getToken, clearToken, getCurrentUser, convertLoginResponseToUserInfo } from '@/services/auth';
import { UserInfo, LoginResponse } from '@/services/auth';

/**
 * 处理登录成功后的操作
 * @param response 登录响应
 * @param updateUserInfo 更新用户信息的函数
 */
export const handleLoginSuccess = (
  response: LoginResponse, 
  updateUserInfo: (user: UserInfo) => void
) => {
  // 保存JWT令牌
  if (response.token) {
    saveToken(response.token);
  }
  
  // 将登录响应转换为用户信息并更新
  const userInfo = convertLoginResponseToUserInfo(response);
  updateUserInfo(userInfo);
};

/**
 * 处理登出操作
 * @param clearUserInfo 清除用户信息的函数
 */
export const handleLogout = (clearUserInfo: () => void) => {
  // 清除令牌
  clearToken();
  
  // 清除用户信息
  clearUserInfo();
};

/**
 * 检查用户是否已登录
 * @returns 是否已登录
 */
export const checkAuthStatus = (): boolean => {
  return !!getToken();
};

/**
 * 获取当前用户信息
 * @returns 用户信息或null
 */
export const getCurrentUserInfo = async (): Promise<UserInfo | null> => {
  try {
    const token = getToken();
    if (!token) {
      return null;
    }
    
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}; 