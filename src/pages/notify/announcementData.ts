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
    id: 6,
    title: '解决了选课问题',
    summary: '整体更新很多api',
    updates: [
      { content: '更新', status: 'new' },
    ],
    date: '2025-10-11 17:54',
    type: 'success',
    version: 'v2.0.0',
    author: 'Shalee'
  },
  {
    id: 5,
    title: '添加邮箱提醒功能',
    summary: '在发布作业和截止前2小时通过邮箱发送提醒',
    updates: [
      { content: '更新邮箱', status: 'new' },
      { content: '邮箱提醒', status: 'new' },
      { content: '历史提交记录', status: 'new' },
      { content: '由于路径问题，用户不能下载自己的历史提交文件', status: 'fixed' },
    ],
    date: '2025-9-17 21:54',
    type: 'success',
    version: 'v1.2.0',
    author: 'Shalee'
  },
  {
    id: 4,
    title: '核心功能完成',
    summary: '用户上传作业功能基本闭环',
    updates: [
      { content: '上传作业到指定文件夹', status: 'new' },
      { content: '打包下载作业', status: 'new' },
      { content: '撤回作业', status: 'new' },
      { content: '自动修改为规范的作业名称', status: 'new' },
      { content: '查看未提交的用户', status: 'new' },
      { content: '打算明天添加一个给未提交用户发邮箱通知的功能', status: 'fixed' },
    ],
    date: '2025-8-1 16:37',
    type: 'success',
    version: 'v1.1.0',
    author: 'Shalee'
  },
  {
    id: 3,
    title: '一个大阶段完成',
    summary: '基本实现了学委用户的发作业功能',
    updates: [
      { content: '按照班级发作业', status: 'new' },
      { content: '删除作业', status: 'new' },
      { content: '编辑已经发布的作业', status: 'new' },
      { content: '做了一些可视化管理', status: 'new' },
      { content: '手机端侧边栏无法折叠', status: 'fixed' },
    ],
    date: '2025-07-26 21:22',
    type: 'success',
    version: 'v1.0.0',
    author: 'Shalee'
  },
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