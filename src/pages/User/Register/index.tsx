import React, { useState } from 'react';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined,
  IdcardOutlined,
  BookOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { 
  ProForm, 
  ProFormText,
  ProFormCaptcha,
  ProFormDependency
} from '@ant-design/pro-components';
import { 
  Button, 
  Card, 
  Divider, 
  Form, 
  message, 
  Space, 
  Typography,
  Progress,
  Alert
} from 'antd';
import { history } from '@umijs/max';
import styles from './index.less';
// send and verify the email addr|code
import { sendEmailCode, registerUser } from '@/services/auth';

const { Title, Text, Link } = Typography;

const passwordStatusMap = {
  ok: (
    <div style={{ color: 'green' }}>
      <span>强度：强</span>
    </div>
  ),
  pass: (
    <div style={{ color: 'orange' }}>
      <span>强度：中</span>
    </div>
  ),
  poor: (
    <div style={{ color: 'red' }}>
      <span>强度：弱</span>
    </div>
  ),
};

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'ok' | 'pass' | 'poor'>('poor');

  // 检查密码强度
  const checkPassword = (value: string) => {
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(value);
    const length = value.length;

    if (length >= 10 && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) {
      return 'ok';
    }
    if (length >= 8 && ((hasUpperCase && hasLowerCase) || hasNumber)) {
      return 'pass';
    }
    return 'poor';
  };

// register.tsx
const handleSendCode = async () => {
  try {
    const email = form.getFieldValue('email');
    if (!email || !/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email)) {
      message.error('请输入有效的邮箱地址');
      return;
    }
    
    setLoading(true);
    await sendEmailCode(email); // 直接传字符串
    message.success('验证码已发送至您的邮箱');
  } catch (error) {
    message.error('发送验证码失败');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.container}>
      <Card className={styles.card} hoverable>
        <Title level={3} className={styles.title}>
          新用户注册
        </Title>
        
        <Alert
          message="请填写真实信息完成注册"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <ProForm
          form={form}
          onFinish={async (values: any) => {
            try {
              setLoading(true);
              // 不要把 confirmPassword 传给后端
              const { confirmPassword, ...submitValues } = values;
              await registerUser(submitValues);
              message.success('注册成功');
              history.push('/user/login');
            } catch (error:any) {
              const msg = error?.response?.data?.message || error?.response?.data || '注册失败';
              message.error(msg);
            } finally {
              setLoading(false);
            }
          }}
          submitter={{
            render: (_, dom) => (
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                立即注册
              </Button>
            ),
          }}
        >
          <ProFormText
            name="realName"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder="请输入真实姓名"
            rules={[
              {
                required: true,
                message: '请输入真实姓名!',
              },
              {
                pattern: /^[\u4e00-\u9fa5]{2,10}$/,
                message: '请输入2-10个中文字符',
              },
            ]}
          />

          <ProFormText
            name="studentId"
            fieldProps={{
              size: 'large',
              prefix: <IdcardOutlined />,
            }}
            placeholder="请输入学号"
            rules={[
              {
                required: true,
                message: '请输入学号!',
              },
              {
                pattern: /^[A-Za-z0-9]{8,20}$/,
                message: '学号为8-20位字母或数字',
              },
            ]}
          />

          <ProFormText
            name="classCode"
            fieldProps={{
              size: 'large',
              prefix: <BookOutlined />,
            }}
            placeholder="请输入班级代码"
            rules={[
              {
                required: true,
                message: '请输入班级代码!',
              },
              {
                pattern: /^[A-Za-z0-9]{4,10}$/,
                message: '班级代码为4-10位字母或数字',
              },
            ]}
          />

          <ProFormText
            name="email"
            fieldProps={{
              size: 'large',
              prefix: <MailOutlined />,
            }}
            placeholder="请输入邮箱"
            rules={[
              {
                required: true,
                message: '请输入邮箱!',
              },
              {
                type: 'email',
                message: '邮箱格式不正确',
              },
            ]}
          />

          <ProFormCaptcha
            name="verificationCode"
            fieldProps={{
              size: 'large',
              prefix: <SafetyOutlined />,
            }}
            placeholder="请输入验证码"
            captchaTextRender={(timing, count) => {
              if (timing) {
                return `${count}秒后重新获取`;
              }
              return '获取验证码';
            }}
            rules={[
              {
                required: true,
                message: '请输入验证码!',
              },
              {
                pattern: /^\d{6}$/,
                message: '验证码为6位数字',
              },
            ]}
            onGetCaptcha={handleSendCode}
          />

          <ProFormDependency name={['password']}>
            {({ password }) => (
              <>
                <ProFormText.Password
                  name="password"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined />,
                    onChange: (e) => {
                      setPasswordStatus(checkPassword(e.target.value));
                    },
                  }}
                  placeholder="请输入密码（8-20位，包含大小写字母和数字）"
                  rules={[
                    {
                      required: true,
                      message: '请输入密码!',
                    },
                    {
                      min: 8,
                      max: 20,
                      message: '密码长度为8-20个字符',
                    },
                    {
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                      message: '必须包含大小写字母和数字',
                    },
                  ]}
                />
                <div style={{ marginBottom: 16 }}>
                  <Progress
                    percent={
                      passwordStatus === 'ok' ? 100 : passwordStatus === 'pass' ? 66 : 33
                    }
                    status={passwordStatus === 'poor' ? 'exception' : 'normal'}
                    showInfo={false}
                    strokeColor={
                      passwordStatus === 'ok'
                        ? 'green'
                        : passwordStatus === 'pass'
                        ? 'orange'
                        : 'red'
                    }
                  />
                  {password && passwordStatusMap[passwordStatus]}
                </div>
              </>
            )}
          </ProFormDependency>

          <ProFormText.Password
            name="confirmPassword"
            fieldProps={{
              size: 'large',
              prefix: <SafetyOutlined />,
            }}
            placeholder="请确认密码"
            rules={[
              {
                required: true,
                message: '请确认密码!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
            ]}
          />
        </ProForm>

        <Divider />

        <Space className={styles.footer}>
          <Text>已有账号?</Text>
          <Link href="/user/login">立即登录</Link>
        </Space>
      </Card>
    </div>
  );
};
export default Register;
