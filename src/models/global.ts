// 全局共享数据
import { DEFAULT_NAME } from '@/constants';
import { useState, useEffect, useCallback } from 'react';
import { UserInfo, getCurrentUser, getToken } from '@/services/auth';

const useUser = () => {
  const [name, setName] = useState<string>(DEFAULT_NAME);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  // 获取用户信息
  const fetchUserInfo = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUserInfo(null);
      setName(DEFAULT_NAME);
      return;
    }

    try {
      setLoading(true);
      const user = await getCurrentUser();
      setUserInfo(user);
      setName(user.realName);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setUserInfo(null);
      setName(DEFAULT_NAME);
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新用户信息
  const updateUserInfo = useCallback((user: UserInfo) => {
    setUserInfo(user);
    setName(user.realName);
  }, []);

  // 清除用户信息
  const clearUserInfo = useCallback(() => {
    setUserInfo(null);
    setName(DEFAULT_NAME);
  }, []);

  // 组件挂载时只获取一次用户信息
  useEffect(() => {
    if (!initialized) {
      fetchUserInfo();
      setInitialized(true);
    }
  }, [fetchUserInfo, initialized]);

  return {
    name,
    setName,
    userInfo,
    loading,
    fetchUserInfo,
    updateUserInfo,
    clearUserInfo,
  };
};

export default useUser;
