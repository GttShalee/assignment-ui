export interface UpdateItem {
  content: string;
  status?: 'new' | 'fixed' | 'improved' | 'removed';
}

export interface Announcement {
  id: number;
  title: string;
  summary: string;
  updates: UpdateItem[];
  date: string;
  type: 'success' | 'warning' | 'info';
  version?: string;
  author?: string;
}

export const announcements: Announcement[] = [
  {
    id: 2,
    title: '前端继续添加页面 后端开始开发',
    summary: '初步实现注册和登录',
    updates: [
      { content: '添加了注册登录页面', status: 'new' },
      { content: '使用Javamail实现了邮箱验证的设计', status: 'new' },
      { content: '只在postman完成了理论接口，明天尝试前后端对接', status: 'fixed' }
    ],
    date: '2025-07-21 21:22',
    type: 'success',
    version: 'v1.0.0',
    author: 'Shalee'
  },
  {
    id: 1,
    title: '系统前端初步构建',
    summary: '初步使用react搭起框架',
    updates: [
      { content: '首页时间显示和诗词更新', status: 'new' },
      { content: '页面加载loading动画', status: 'new' },
      { content: '弄清楚了如何配置路由', status: 'new' },
      { content: '尝试添加了一些图表组件', status: 'new' }
    ],
    date: '2025-07-17 16:30',
    type: 'success',
    version: 'v1.0.0',
    author: 'Shalee'
  }
];