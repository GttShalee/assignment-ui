// export default (initialState: API.UserInfo) => {
//   // 在这里按照初始化数据定义项目中的权限，统一管理
//   // 参考文档 https://umijs.org/docs/max/access
//   const canSeeAdmin = !!(
//     initialState && initialState.name !== 'dontHaveAccess'
//   );
//   return {
//     canSeeAdmin,
//   };
// };

// src/access.ts
export default function access(initialState: { currentUser?: any }) {
  const { currentUser } = initialState || {};
  return {
    isLoggedIn: !!currentUser, // 如果用户已登录返回 true，否则 false
  };
}
