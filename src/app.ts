// 运行时配置
import { getToken } from '@/services/auth';
import { history } from '@umijs/max';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string }> {
  return { name: 'WorkUpload' };
}

export const layout = () => {
  return {
    logo: 'https://raw.githubusercontent.com/GttShalee/Blog-pic/main/rainCat.gif',
    title: 'WorkUpload',
    menu: {
      locale: false,
      // 菜单配置
      collapsedShowTitle: false, // 折叠时不显示标题
      collapsedShowGroupTitle: false, // 折叠时不显示分组标题
    },
    // 侧边栏配置
    siderWidth: 256,
    collapsed: false,
    collapsedButtonRender: false, // 隐藏折叠按钮
    // 头部配置
    headerHeight: 64,
    // 面包屑配置
    breadcrumb: {
      // 可以自定义面包屑的渲染
    },
    // 页脚配置
    footerRender: false, // 隐藏页脚
  };
};

// 请求拦截器配置
export const request = {
  timeout: 10000,
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


