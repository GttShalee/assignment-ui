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
      <div>
        <h1>班级广场</h1>
      </div>
    </PageContainer>
  );
};

export default SystemSettings; 