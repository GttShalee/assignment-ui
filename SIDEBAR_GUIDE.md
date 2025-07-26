# 子侧边栏配置指南

## 概述

本项目使用 UmiJS Max 框架，支持多级嵌套的侧边栏菜单。本文档介绍如何配置和使用子侧边栏功能。

## 路由配置结构

### 1. 基本结构

在 `.umirc.ts` 文件中，通过 `routes` 配置来定义菜单结构：

```typescript
routes: [
  {
    name: '父级菜单',
    path: '/parent',
    icon: 'IconOutlined',
    routes: [
      {
        name: '子菜单1',
        path: '/parent/child1',
        component: './Parent/Child1',
        icon: 'ChildIconOutlined',
      },
      {
        name: '子菜单2',
        path: '/parent/child2',
        component: './Parent/Child2',
        icon: 'ChildIconOutlined',
      },
    ],
  },
];
```

### 2. 当前项目配置

本项目已配置了以下菜单结构：

#### 首页

- 路径：`/home`
- 组件：`./Home`

#### 作业管理

- 作业列表：`/work/list`
- 发布作业：`/work/send`
- 作业历史：`/work/history`
- 作业统计：`/work/statistics`

#### 用户管理

- 用户信息：`/user/profile`
- 修改密码：`/user/change-password`

#### 系统管理

- 公告管理：`/system/announcement`
- 系统设置：`/system/settings`

## 配置选项说明

### 路由配置选项

| 选项         | 类型    | 说明                          |
| ------------ | ------- | ----------------------------- |
| `name`       | string  | 菜单显示名称                  |
| `path`       | string  | 路由路径                      |
| `component`  | string  | 组件路径                      |
| `icon`       | string  | 菜单图标（Ant Design 图标名） |
| `routes`     | array   | 子路由数组                    |
| `hideInMenu` | boolean | 是否在菜单中隐藏              |
| `layout`     | boolean | 是否使用布局                  |
| `access`     | string  | 权限控制                      |

### 布局配置选项

在 `src/app.ts` 中可以配置布局相关选项：

```typescript
export const layout = () => {
  return {
    siderWidth: 256, // 侧边栏宽度
    collapsed: false, // 是否折叠
    collapsedButtonRender: false, // 是否显示折叠按钮
    headerHeight: 64, // 头部高度
    menu: {
      locale: false, // 是否启用国际化
      collapsedShowTitle: false, // 折叠时是否显示标题
    },
  };
};
```

## 图标使用

### 1. 使用 Ant Design 图标

```typescript
import { HomeOutlined, UserOutlined } from '@ant-design/icons';

// 在路由配置中使用
{
  name: "首页",
  path: "/home",
  icon: "HomeOutlined",
}
```

### 2. 常用图标列表

- `HomeOutlined` - 首页
- `FileTextOutlined` - 文件/文档
- `UserOutlined` - 用户
- `SettingOutlined` - 设置
- `UnorderedListOutlined` - 列表
- `PlusOutlined` - 添加
- `HistoryOutlined` - 历史
- `BarChartOutlined` - 图表
- `LockOutlined` - 锁/安全
- `NotificationOutlined` - 通知
- `ToolOutlined` - 工具

## 自定义菜单组件

如果需要更复杂的菜单逻辑，可以使用自定义菜单组件：

```typescript
// src/components/CustomMenu/index.tsx
import React from 'react';
import { Menu } from 'antd';
import { useLocation, history } from '@umijs/max';

const CustomMenu: React.FC = () => {
  const location = useLocation();

  const handleMenuClick = ({ key }: { key: string }) => {
    history.push(key);
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      onClick={handleMenuClick}
    >
      {/* 菜单项 */}
    </Menu>
  );
};
```

## 权限控制

可以通过 `access` 属性控制菜单的显示权限：

```typescript
{
  name: "管理员功能",
  path: "/admin",
  component: "./Admin",
  access: "canAdmin", // 需要 canAdmin 权限
}
```

在 `src/access.ts` 中定义权限：

```typescript
export default function access(initialState: { currentUser?: any }) {
  const { currentUser } = initialState || {};
  return {
    canAdmin: currentUser?.role === 'admin',
    isStudier: currentUser?.role === 'studier',
  };
}
```

## 最佳实践

### 1. 文件组织

- 页面组件放在 `src/pages` 目录下
- 使用 `index.tsx` 作为页面入口文件
- 样式文件使用 `index.less`

### 2. 路由命名

- 使用小写字母和连字符
- 路径要有意义，便于理解
- 避免过深的嵌套（建议不超过 3 层）

### 3. 菜单结构

- 相关功能组织在同一父级菜单下
- 使用合适的图标增强可读性
- 控制菜单项数量，避免过长

### 4. 权限管理

- 合理使用权限控制
- 隐藏不需要的菜单项
- 提供友好的权限提示

## 注意事项

1. **路径一致性**：确保路由配置中的路径与实际文件路径一致
2. **组件导入**：确保所有引用的组件文件都存在
3. **图标导入**：确保使用的图标已正确导入
4. **权限配置**：权限控制需要配合后端接口实现
5. **样式兼容**：自定义样式需要考虑响应式设计

## 常见问题

### Q: 菜单不显示？

A: 检查路由配置是否正确，组件文件是否存在

### Q: 图标不显示？

A: 确认图标名称正确，且已正确导入

### Q: 子菜单无法展开？

A: 检查 `routes` 配置是否正确，确保有子路由

### Q: 权限控制不生效？

A: 检查 `access.ts` 配置和用户状态是否正确
