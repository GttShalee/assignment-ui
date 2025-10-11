import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Alert } from 'antd';
import { MailOutlined } from '@ant-design/icons';

interface EmailUpdateModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (newEmail: string) => void;
  currentEmail: string;
  studentId: string;
}

const EmailUpdateModal: React.FC<EmailUpdateModalProps> = ({
  open,
  onCancel,
  onSuccess,
  currentEmail,
  studentId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { newEmail: string }) => {
    setLoading(true);
    try {
      // 导入并调用更新邮箱API
      const { updateEmail } = await import('@/services/auth');
      const result = await updateEmail({ newEmail: values.newEmail });
      
      console.log('邮箱更新成功，后端返回:', result);
      
      // 调用成功回调，传递新邮箱
      onSuccess(values.newEmail);
      form.resetFields();
    } catch (error: any) {
      console.error('更新邮箱失败:', error);
      message.error(error.message || '更新邮箱失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MailOutlined />
          <span>更新邮箱地址</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Alert
        message="欢迎使用作业管理系统"
        description={`为了更好的使用体验和安全性，建议您设置一个常用的邮箱地址，这将用于接收系统通知和找回密码等功能。`}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="新邮箱地址"
          name="newEmail"
          rules={[
            { required: true, message: '请输入新的邮箱地址' },
            { type: 'email', message: '请输入有效的邮箱地址' },
            {
              validator: (_, value) => {
                if (value && value === studentId) {
                  return Promise.reject(new Error('新邮箱不能与学号相同'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="请输入新的邮箱地址"
            size="large"
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel}>
            稍后在个人设置中修改
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<MailOutlined />}
          >
            立即设置
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EmailUpdateModal;
