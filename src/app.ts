// 运行时配置
import React from 'react';
import { getToken, getCurrentUser } from '@/services/auth';
import { history } from '@umijs/max';
import MobileSiderController from '@/components/MobileSiderController';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string; currentUser?: any }> {
  const token = getToken();
  if (!token) {
    console.log('No token found, returning default state');
    return { name: 'WorkUpload' };
  }

  try {
    console.log('开始获取初始用户状态...');
    const currentUser = await getCurrentUser();
    console.log('Initial state loaded:', { 
      currentUser: {
        ...currentUser,
        // 隐藏敏感信息
        email: currentUser?.email ? '***' : undefined
      }
    });
    return { 
      name: 'WorkUpload',
      currentUser 
    };
  } catch (error) {
    console.error('获取初始用户信息失败:', error);
    // Token可能已过期，清除无效token
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as any).response;
      if (response?.status === 401 || response?.status === 403) {
        console.log('Token可能已过期，将在下次访问时重新登录');
        // 不在这里清除token，让用户在访问受保护页面时自然跳转到登录页
      }
    }
    return { name: 'WorkUpload' };
  }
}

export const layout = () => {
  return {
    logo: 'https://raw.githubusercontent.com/GttShalee/Blog-pic/main/rainCat.gif',
    title: 'WorkUpload',
    onMenuHeaderClick: () => {
      history.push('/home');
    },
    menu: {
      locale: false,
      // 菜单配置
      collapsedShowTitle: false, // 折叠时不显示标题
      collapsedShowGroupTitle: false, // 折叠时不显示分组标题
    },
    // 侧边栏配置
    siderWidth: 256,
    collapsed: false,
    // 显示默认的折叠按钮，移动端需要
    // 头部配置
    headerHeight: 64,
    // 面包屑配置
    breadcrumb: {
      // 可以自定义面包屑的渲染
    },
    // 页脚配置
    footerRender: false, // 隐藏页脚
    // 移动端配置
    breakpoint: 'lg', // 在lg断点以下自动折叠
    collapsedWidth: 0, // 移动端完全隐藏侧边栏
    // 移动端侧边栏配置
    mobileMenu: true, // 启用移动端菜单
    fixedHeader: true, // 固定头部
    fixedSider: false, // 移动端不固定侧边栏
    // 自定义侧边栏渲染
    siderMenuRender: (props: any) => {
      return props;
    },
  };
};

// 根容器配置，用于包装整个应用
export const rootContainer = (container: React.ReactElement) => {
  return React.createElement(MobileSiderController, { children: container });
};

// 请求拦截器配置
export const request = {
  timeout: 30000, // 增加超时时间，特别是文件上传
  
  // 开发环境使用代理，生产环境使用完整URL
  // @ts-ignore
  baseURL: process.env.NODE_ENV === 'production' ? API_BASE_URL : '',
  
  errorConfig: {
    errorHandler: (error: any) => {
      console.error('请求错误:', error);
    },
  },
  requestInterceptors: [
    (config: any) => {
      // 添加JWT令牌到请求头
      const token = getToken();
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        };
      }
      
      // 对于文件上传，不设置Content-Type，让浏览器自动设置
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
      
      return config;
    },
  ],
  responseInterceptors: [
    (response: any) => {
      return response;
    },
  ],
};

// 全局路由守卫
export function onRouteChange({ location }: { location: { pathname: string } }) {
  const token = getToken();
  const whiteList = ['/user/login', '/user/register', '/User/Login', '/User/Register'];
  const isWhite = whiteList.some((path) => location.pathname.toLowerCase().startsWith(path.toLowerCase()));
  if (!token && !isWhite) {
    sessionStorage.setItem('login_redirect', '1');
    history.replace('/user/login');
  }
}


