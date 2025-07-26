import React from 'react';
import { Menu } from 'antd';
import { useLocation, history } from '@umijs/max';
import {
  HomeOutlined,
  FileTextOutlined,
  UserOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LockOutlined,
  NotificationOutlined,
  ToolOutlined,
} from '@ant-design/icons';

const { SubMenu } = Menu;

const CustomMenu: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/work',
      icon: <FileTextOutlined />,
      label: '作业管理',
      children: [
        {
          key: '/work/list',
          icon: <UnorderedListOutlined />,
          label: '作业列表',
        },
        {
          key: '/work/send',
          icon: <PlusOutlined />,
          label: '发布作业',
        },
        {
          key: '/work/history',
          icon: <HistoryOutlined />,
          label: '作业历史',
        },
        {
          key: '/work/statistics',
          icon: <BarChartOutlined />,
          label: '作业统计',
        },
      ],
    },
    {
      key: '/user',
      icon: <UserOutlined />,
      label: '用户管理',
      children: [
        {
          key: '/user/profile',
          icon: <UserOutlined />,
          label: '用户信息',
        },
        {
          key: '/user/change-password',
          icon: <LockOutlined />,
          label: '修改密码',
        },
      ],
    },
    {
      key: '/system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        {
          key: '/system/announcement',
          icon: <NotificationOutlined />,
          label: '公告管理',
        },
        {
          key: '/system/settings',
          icon: <ToolOutlined />,
          label: '系统设置',
        },
      ],
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    history.push(key);
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      defaultOpenKeys={['/work', '/user', '/system']}
      style={{ height: '100%', borderRight: 0 }}
      onClick={handleMenuClick}
      theme="light"
    >
      {menuItems.map((item) => {
        if (item.children) {
          return (
            <SubMenu
              key={item.key}
              icon={item.icon}
              title={item.label}
            >
              {item.children.map((child) => (
                <Menu.Item key={child.key} icon={child.icon}>
                  {child.label}
                </Menu.Item>
              ))}
            </SubMenu>
          );
        }
        return (
          <Menu.Item key={item.key} icon={item.icon}>
            {item.label}
          </Menu.Item>
        );
      })}
    </Menu>
  );
};

export default CustomMenu; 