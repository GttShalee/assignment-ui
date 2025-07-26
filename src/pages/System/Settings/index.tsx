import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Form, Switch, Select, InputNumber, Button, message, Divider, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const { Option } = Select;

const SystemSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 这里调用保存设置的API
      console.log('保存设置:', values);
      message.success('设置保存成功');
    } catch (error) {
      message.error('设置保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div style={{ padding: '24px' }}>
        <Card title="系统设置" icon={<SettingOutlined />}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              emailNotification: true,
              theme: 'light',
              language: 'zh-CN',
              pageSize: 10,
              autoSave: true,
            }}
          >
            <h3>通知设置</h3>
            <Form.Item
              name="emailNotification"
              label="邮件通知"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="browserNotification"
              label="浏览器通知"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Divider />

            <h3>界面设置</h3>
            <Form.Item
              name="theme"
              label="主题模式"
            >
              <Select>
                <Option value="light">浅色主题</Option>
                <Option value="dark">深色主题</Option>
                <Option value="auto">跟随系统</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="language"
              label="语言设置"
            >
              <Select>
                <Option value="zh-CN">简体中文</Option>
                <Option value="en-US">English</Option>
              </Select>
            </Form.Item>

            <Divider />

            <h3>功能设置</h3>
            <Form.Item
              name="pageSize"
              label="每页显示数量"
            >
              <InputNumber min={5} max={50} />
            </Form.Item>

            <Form.Item
              name="autoSave"
              label="自动保存"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="autoLogout"
              label="自动登出时间（分钟）"
            >
              <InputNumber min={5} max={480} />
            </Form.Item>

            <Divider />

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存设置
                </Button>
                <Button onClick={() => form.resetFields()}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </PageContainer>
  );
};

export default SystemSettings; 