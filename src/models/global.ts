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
      if (user && user.realName) {
        setUserInfo(user);
        setName(user.realName);
      } else {
        console.warn('获取到的用户信息不完整:', user);
        setUserInfo(null);
        setName(DEFAULT_NAME);
      }
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
    if (user && user.realName) {
      setUserInfo(user);
      setName(user.realName);
    }
  }, []);

  // 清除用户信息
  const clearUserInfo = useCallback(() => {
    setUserInfo(null);
    setName(DEFAULT_NAME);
  }, []);

  // 组件挂载时获取用户信息
  useEffect(() => {
    if (!initialized) {
      fetchUserInfo();
      setInitialized(true);
    }
  }, [fetchUserInfo, initialized]);

  // 监听token变化，token存在时自动刷新用户信息
  useEffect(() => {
    const token = getToken();
    if (token && initialized && !userInfo) {
      console.log('检测到token存在但用户信息为空，自动刷新用户信息');
      fetchUserInfo();
    }
  }, [initialized, userInfo, fetchUserInfo]);

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
