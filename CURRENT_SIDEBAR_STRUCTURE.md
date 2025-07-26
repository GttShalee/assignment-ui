# 当前侧边栏结构

## 菜单层级

基于你现有的路由配置，我创建了以下子侧边栏结构：

### 1. 首页

- **路径**: `/home`
- **组件**: `./Home`
- **图标**: `HomeOutlined`

### 2. 作业管理 (父级菜单)

- **路径**: `/work`
- **图标**: `FileTextOutlined`

#### 子菜单：

- **作业列表**

  - 路径: `/work/workList`
  - 组件: `./work/workList`
  - 图标: `UnorderedListOutlined`

- **发布作业**

  - 路径: `/work/workSend`
  - 组件: `./work/workSend`
  - 图标: `PlusOutlined`
  - 权限: `isStudier` (仅学委可访问)

- **作业历史**
  - 路径: `/work/workHistory`
  - 组件: `./work/workHistory`
  - 图标: `HistoryOutlined`

### 3. 系统管理 (父级菜单)

- **路径**: `/system`
- **图标**: `SettingOutlined`

#### 子菜单：

- **公告管理**
  - 路径: `/notify/announcement`
  - 组件: `./notify/announcement`
  - 图标: `NotificationOutlined`
  - 状态: 隐藏菜单项

### 4. 隐藏路由 (不在侧边栏显示)

- **注册**: `User/Register` → `./User/Register`
- **登录**: `User/Login` → `./User/Login`

## 配置特点

1. **保持原有路径**: 所有现有的路由路径都保持不变
2. **层级结构**: 将相关功能组织在父级菜单下
3. **图标支持**: 每个菜单项都配置了相应的图标
4. **权限控制**: 保留了原有的权限控制配置
5. **隐藏路由**: 登录和注册页面不在侧边栏显示

## 侧边栏配置

在 `.umirc.ts` 中配置了：

- 侧边栏宽度: 256px
- 默认不折叠
- 隐藏折叠按钮
- 添加了图标支持

在 `src/app.ts` 中配置了：

- 菜单行为设置
- 面包屑配置
- 水印设置
- 页脚隐藏

## 使用说明

1. 启动项目后，侧边栏会自动显示层级菜单
2. 点击父级菜单可以展开/折叠子菜单
3. 所有原有的路由功能保持不变
4. 图标会自动显示在菜单项前面
