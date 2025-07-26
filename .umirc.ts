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
      redirect: "/User/Login/index",
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
      name:"发布作业",
      path:"/work/workSend",
      component: "./work/workSend",
      // access: "isStudier", // 仅当为学委用户可以访问
    },
    {
      name: "作业列表",
      path: "/work/workList",
      component: "./work/workList",
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
    }
  ],

  npmClient: "pnpm",
  tailwindcss: {},

  // 配置代理
  proxy: {
    '/api': {
      target: 'http://localhost:8888', // 你的后端地址
      changeOrigin: true,
      // pathRewrite: { '^/api': '' },
    },
  },

});
