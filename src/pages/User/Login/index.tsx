
import React, { useState, useEffect } from 'react';
import {
  IdcardOutlined,
  MailOutlined,
  LockOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import {
  ProForm,
  ProFormText,
  ProFormCaptcha
} from '@ant-design/pro-components';
import {
  Button,
  Card,
  Divider,
  Form,
  message,
  Typography,
  Alert,
  Tabs
} from 'antd';
import { history } from '@umijs/max';
import { useModel } from '@umijs/max';
import styles from './index.less';
import { login, loginEmail, sendEmailCode, saveToken, convertLoginResponseToUserInfo } from '@/services/auth';

const { Title, Link } = Typography;
const { TabPane } = Tabs;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'studentId' | 'email'>('studentId');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { updateUserInfo } = useModel('global');

  useEffect(() => {
    if (sessionStorage.getItem('login_redirect') === '1') {
      message.info('请先登录');
      sessionStorage.removeItem('login_redirect');
    }
  }, []);

  // 切换登录方式
  const handleTabChange = (key: string) => {
    setLoginType(key as 'studentId' | 'email');
    setErrorMsg(null);
    form.resetFields();
  };

  // 发送验证码
  const handleSendCode = async () => {
    try {
      const email = form.getFieldValue('email');
      if (!email || !/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email)) {
        message.error('请输入有效的邮箱地址');
        return;
      }
      setLoading(true);
      await sendEmailCode(email);
      message.success('验证码已发送至您的邮箱');
    } catch (error: any) {
      const msg = error?.response?.data?.message || '发送验证码失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 提交登录
  const handleSubmit = async (values: any) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      let response;
      if (loginType === 'studentId') {
        response = await login(values);
      } else {
        response = await loginEmail(values);
      }
      
      // 保存JWT令牌
      if (response.token) {
        saveToken(response.token);
      }
      
      // 转换并更新用户信息
      const userInfo = convertLoginResponseToUserInfo(response);
      updateUserInfo(userInfo);
      
      message.success('登录成功');
      history.push('/home');
    } catch (error: any) {
      // 优先展示后端返回的 message
      const msg = error?.response?.data?.message || '登录失败';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card} hoverable>
        <div className={styles.logo}>
          <Title level={3} className={styles.title}>
            用户登录
          </Title>
        </div>

        <Alert
          message="请使用学号或邮箱登录系统"
          type="info"
          showIcon
          className={styles.alert}
        />

        <Tabs
          activeKey={loginType}
          onChange={handleTabChange}
          centered
          className={styles.tabs}
        >
          <TabPane tab="学号登录" key="studentId" />
          <TabPane tab="邮箱登录" key="email" />
        </Tabs>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <ProForm
          form={form}
          onFinish={handleSubmit}
          submitter={false}
          style={{ marginTop: 16 }}
        >
          {loginType === 'studentId' && (
            <>
              <ProFormText
                name="studentId"
                fieldProps={{
                  size: 'large',
                  prefix: <IdcardOutlined className={styles.prefixIcon} />,
                }}
                placeholder="请输入学号"
                rules={[
                  { required: true, message: '请输入学号!' },
                  { pattern: /^[A-Za-z0-9]{8,20}$/, message: '学号为8-20位字母或数字' },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder="请输入密码"
                rules={[
                  { required: true, message: '请输入密码!' },
                  { min: 8, max: 20, message: '密码长度为8-20个字符' },
                ]}
              />
            </>
          )}

          {loginType === 'email' && (
            <>
              <ProFormText
                name="email"
                fieldProps={{
                  size: 'large',
                  prefix: <MailOutlined className={styles.prefixIcon} />,
                }}
                placeholder="请输入邮箱"
                rules={[
                  { required: true, message: '请输入邮箱!' },
                  { type: 'email', message: '邮箱格式不正确' },
                ]}
              />
              <ProFormCaptcha
                name="verificationCode"
                fieldProps={{
                  size: 'large',
                  prefix: <SafetyOutlined className={styles.prefixIcon} />,
                }}
                placeholder="请输入验证码"
                captchaTextRender={(timing, count) => (timing ? `${count}秒后重试` : '获取验证码')}
                rules={[
                  { required: true, message: '请输入验证码!' },
                  { pattern: /^\d{6}$/, message: '验证码为6位数字' },
                ]}
                onGetCaptcha={handleSendCode}
              />
            </>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className={styles.submitButton}
            >
              登 录
            </Button>
          </Form.Item>
        </ProForm>

        <div className={styles.actions}>
          <Link onClick={() => history.push('/user/forgot-password')}>
            忘记密码
          </Link>
          <Divider type="vertical" />
          <Link onClick={() => history.push('/user/register')}>
            注册账号
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;