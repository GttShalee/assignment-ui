// 全局共享数据
import { DEFAULT_NAME } from '@/constants';
import { useState, useEffect, useCallback, useRef } from 'react';
import { UserInfo, getCurrentUser, getToken } from '@/services/auth';

const useUser = () => {
  const [name, setName] = useState<string>(DEFAULT_NAME);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const initializedRef = useRef<boolean>(false);
  const fetchingRef = useRef<boolean>(false); // 防止重复请求

  // 获取用户信息
  const fetchUserInfo = useCallback(async (force: boolean = false) => {
    const token = getToken();
    if (!token) {
      setUserInfo(null);
      setName(DEFAULT_NAME);
      return;
    }

    // 防止重复请求
    if (fetchingRef.current && !force) {
      console.log('全局模型 - 已有请求在进行中，跳过');
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      const user = await getCurrentUser();
      console.log('全局模型 - getCurrentUser返回的用户信息:', user);
      
      if (user && user.realName) {
        // 使用函数式更新来保留现有的courses和nickname字段
        setUserInfo(prevUserInfo => {
          const finalUser = { ...user };
          
          // 如果API没有返回courses字段，尝试从之前的状态恢复
          if (user.courses === undefined || user.courses === null) {
            if (prevUserInfo?.courses !== undefined && prevUserInfo?.courses !== null) {
              console.log('全局模型 - 从之前的用户信息保留courses字段:', prevUserInfo.courses);
              finalUser.courses = prevUserInfo.courses;
            } else {
              // 从localStorage恢复
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
          
          // 如果API没有返回nickname字段（或返回空字符串），尝试从之前的状态或localStorage恢复
          if (!user.nickname || user.nickname.trim() === '') {
            if (prevUserInfo?.nickname && prevUserInfo.nickname.trim() !== '') {
              console.log('全局模型 - 从之前的用户信息保留nickname字段:', prevUserInfo.nickname);
              finalUser.nickname = prevUserInfo.nickname;
            } else {
              // 从localStorage恢复
              const savedNickname = localStorage.getItem('user_nickname');
              if (savedNickname && savedNickname.trim() !== '') {
                console.log('全局模型 - 从localStorage恢复nickname字段:', savedNickname);
                finalUser.nickname = savedNickname;
              }
            }
          } else {
            // 如果API返回了nickname，保存到localStorage
            localStorage.setItem('user_nickname', user.nickname);
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
      fetchingRef.current = false;
    }
  }, []); // 移除所有依赖，避免循环

  // 更新用户信息
  const updateUserInfo = useCallback((user: UserInfo) => {
    console.log('全局模型 - updateUserInfo被调用:', user);
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
    initializedRef.current = false;
  }, []);

  // 组件挂载时获取用户信息（只执行一次）
  useEffect(() => {
    if (!initializedRef.current) {
      const token = getToken();
      if (token) {
        console.log('全局模型 - 初始化，获取用户信息');
        fetchUserInfo();
        initializedRef.current = true;
      }
    }
  }, []); // 空依赖数组，只在挂载时执行一次

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
