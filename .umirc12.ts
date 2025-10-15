import { defineConfig } from "@umijs/max";

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: "WorkUpload",
  },
  routes: [
    {
      path: "/",
      redirect: "/User/Login/",
    },
    {
      name: "注册",
      path: "User/Register",
      component: "./User/Register",
      hideInMenu: true,
      layout:false
    },
    {
      name: "登录",
      path: "User/Login",
      component: "./User/Login",
      hideInMenu: true,
      layout:false
    },
    {
      name: "首页",
      path: "/home",
      component: "./Home",
    },
    {
      name: "公告",
      path: "/notify/announcement",
      component: "./notify/announcement",
      hideInMenu: true,
    },
    {
      name:"我的作业",
      path:"/work",
      icon: "FileTextOutlined",
      routes: [
        {
          name:"发布作业",
          path:"/work/WorkSend",
          component: "./work/WorkSend",
          access: "isStudier", // 仅当为学委用户可以访问
        },
        {
          name: "作业列表",
          path: "/work/WorkList",
          component: "./work/WorkList",
        },
        {
          name: "历史提交",
          path: "/work/WorkHistory",
          component:"./work/WorkHistory",
        }
      ]
    },
    {
      name:"我的班级",
      path:"/Class",
      routes: [
        {
          name: "班级空间",
          path:"/Class/ClassRoom",
          component:"./Class/ClassRoom",
        },
        {
          name: "班级论坛",
          path:"/Class/ClassSquare",
          component:"./Class/ClassSquare",
        },
        {
          name: "帖子详情",
          path:"/Class/PostDetail/:id",
          component:"./Class/PostDetail",
          hideInMenu: true,
        },
      ]
    },
    {
      name: "个人主页",
      path: "User/Profile",
      component: "./User/Profile"
    }
  ],

  npmClient: "pnpm",
  tailwindcss: {},

  // 配置代理
  proxy: {
    '/api': {
      target: 'http://localhost:8080', // 后端地址
      // target: 'localhost:8080',
      changeOrigin: true,
      // pathRewrite: { '^/api': '' },
    },
  },

});
