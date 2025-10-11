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
      console.log('全局模型 - getCurrentUser返回的用户信息:', user);
      console.log('全局模型 - courses字段:', user?.courses);
      
      if (user && user.realName) {
        // 使用函数式更新来保留现有的courses字段
        setUserInfo(prevUserInfo => {
          const finalUser = { ...user };
          
          // 如果API没有返回courses字段，尝试从localStorage恢复
          if (user.courses === undefined || user.courses === null) {
            // 首先尝试从之前的用户信息中获取
            if (prevUserInfo?.courses !== undefined && prevUserInfo?.courses !== null) {
              console.log('全局模型 - 从之前的用户信息保留courses字段:', prevUserInfo.courses);
              finalUser.courses = prevUserInfo.courses;
            } else {
              // 如果之前的用户信息也没有，从localStorage恢复
              const savedCourses = localStorage.getItem('user_courses');
              if (savedCourses) {
                const coursesValue = parseInt(savedCourses, 10);
                if (!isNaN(coursesValue)) {
                  console.log('全局模型 - 从localStorage恢复courses字段:', coursesValue);
                  finalUser.courses = coursesValue;
                }
              }
            }
          }
          
          console.log('全局模型 - 用户信息已更新:', finalUser);
          return finalUser;
        });
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
    console.log('全局模型 - updateUserInfo被调用:', user);
    console.log('全局模型 - updateUserInfo courses字段:', user?.courses);
    if (user && user.realName) {
      setUserInfo(user);
      setName(user.realName);
      console.log('全局模型 - 用户信息已通过updateUserInfo更新:', user);
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
