import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Descriptions, Avatar, Button, Space } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';

const UserProfile: React.FC = () => {
  return (
    <PageContainer>
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <Avatar size={64} icon={<UserOutlined />} style={{ marginRight: '16px' }} />
            <div>
              <h2 style={{ margin: 0 }}>张三</h2>
              <p style={{ margin: 0, color: '#666' }}>计算机科学与技术 2021级</p>
            </div>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              style={{ marginLeft: 'auto' }}
            >
              编辑信息
            </Button>
          </div>

          <Descriptions title="基本信息" bordered>
            <Descriptions.Item label="学号">2021001001</Descriptions.Item>
            <Descriptions.Item label="姓名">张三</Descriptions.Item>
            <Descriptions.Item label="班级">计算机2101班</Descriptions.Item>
            <Descriptions.Item label="邮箱">zhangsan@example.com</Descriptions.Item>
            <Descriptions.Item label="手机号">138****1234</Descriptions.Item>
            <Descriptions.Item label="注册时间">2024-01-15</Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </PageContainer>
  );
};

export default UserProfile; 