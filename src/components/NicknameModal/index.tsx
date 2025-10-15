import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface NicknameModalProps {
  visible: boolean;
  onCancel?: () => void;
  onSuccess: (nickname: string) => void;
  currentNickname?: string;
  required?: boolean; // 是否必填（班级广场强制设置时为true）
}

const NicknameModal: React.FC<NicknameModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  currentNickname,
  required = false,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { nickname: string }) => {
    setLoading(true);
    try {
      // 导入并调用更新昵称API
      const { updateNickname } = await import('@/services/auth');
      const result = await updateNickname({ nickname: values.nickname });
      
      console.log('昵称更新成功，后端返回:', result);
      
      // 调用成功回调，传递新昵称
      onSuccess(values.nickname);
      form.resetFields();
    } catch (error: any) {
      console.error('更新昵称失败:', error);
      message.error(error.message || '更新昵称失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (required) {
      message.warning('请先设置昵称后再继续');
      return;
    }
    form.resetFields();
    onCancel?.();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined />
          <span>{currentNickname ? '修改昵称' : '设置昵称'}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose
      closable={!required} // 如果是必填，则不显示关闭按钮
      maskClosable={!required} // 如果是必填，则点击遮罩不关闭
    >
      <Alert
        message={required ? '设置昵称' : '昵称设置'}
        description={
          required
            ? '欢迎来到班级广场！为了更好的社区体验，请先设置一个昵称，这将是您在广场上的显示名称。'
            : '您可以设置一个个性化的昵称，这将在班级广场等社交场景中显示。'
        }
        type={required ? 'warning' : 'info'}
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        initialValues={{ nickname: currentNickname }}
      >
        <Form.Item
          label="昵称"
          name="nickname"
          rules={[
            { required: true, message: '请输入昵称' },
            { min: 2, message: '昵称至少2个字符' },
            { max: 20, message: '昵称不能超过20个字符' },
            {
              pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/,
              message: '昵称只能包含中文、英文、数字和下划线',
            },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入昵称（2-20个字符）"
            size="large"
            maxLength={20}
            showCount
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          {!required && (
            <Button onClick={handleCancel}>
              取消
            </Button>
          )}
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<UserOutlined />}
          >
            {currentNickname ? '确认修改' : '立即设置'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default NicknameModal;

