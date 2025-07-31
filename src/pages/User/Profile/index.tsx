import React, { ReactNode, useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { 
  Card, 
  Table, 
  Avatar, 
  Button, 
  Tag, 
  Spin, 
  message, 
  Row, 
  Col, 
  Divider, 
  Statistic, 
  Space,
  Modal,
  Typography,
  Upload,
  Form,
  Input,
  UploadFile,
  UploadProps
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  ReloadOutlined, 
  LogoutOutlined,
  IdcardOutlined,
  MailOutlined,
  TeamOutlined,
  CalendarOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  LockOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { changeAvatar, changePassword, ChangePasswordRequest } from '@/services/auth';
import styles from './index.less';

const { Title, Text } = Typography;
const { Password } = Input;

// 登出函数
const logout = async (): Promise<void> => {
  try {
    // 这里可以调用后端登出接口
    // await request('/api/auth/logout', { method: 'POST' });
    
    // 清除本地存储
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('loginTime');
    
    // 跳转到登录页
    window.location.href = '/login';
    
  } catch (error) {
    console.error('登出失败:', error);
    // 即使登出失败，也要清除本地token
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.location.href = '/login';
  }
};

const UserProfile: React.FC = () => {
  const { userInfo, loading, fetchUserInfo } = useModel('global');
  const [avatarError, setAvatarError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [passwordForm] = Form.useForm();

  // 强制刷新用户信息
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserInfo();
      message.success('用户信息已刷新');
    } catch (error) {
      message.error('刷新失败，请重试');
    } finally {
      setRefreshing(false);
    }
  };

  // 处理退出登录
  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  // 确认退出登录
  const confirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  // 处理更换头像
  const handleChangeAvatar = () => {
    setAvatarModalVisible(true);
    setFileList([]);
  };

  // 处理更新密码
  const handleChangePassword = () => {
    setPasswordModalVisible(true);
    passwordForm.resetFields();
  };

  // 上传头像
  const handleAvatarUpload = async () => {
    if (fileList.length === 0) {
      message.error('请选择头像文件');
      return;
    }

    const file = fileList[0].originFileObj;
    if (!file) {
      message.error('文件上传失败');
      return;
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      message.error('只能上传图片文件');
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      message.error('头像文件大小不能超过5MB');
      return;
    }

    setUploading(true);
    try {
      console.log('开始上传头像文件:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const avatarUrl = await changeAvatar(file);
      
      console.log('头像上传成功，返回URL:', avatarUrl);
      
      message.success('头像更换成功');
      setAvatarModalVisible(false);
      setFileList([]);
      
      // 刷新用户信息以获取新头像
      await fetchUserInfo();
    } catch (error: any) {
      console.error('头像上传失败:', error);
      
      // 显示具体的错误信息
      const errorMessage = error.message || '头像更换失败，请重试';
      message.error(errorMessage);
      
      // 如果是认证相关错误，可能需要重新登录
      if (errorMessage.includes('未登录') || errorMessage.includes('401')) {
        message.error('登录状态已过期，请重新登录');
        setTimeout(() => {
          logout();
        }, 2000);
      }
    } finally {
      setUploading(false);
    }
  };

  // 更新密码
  const handlePasswordSubmit = async (values: any) => {
    setChangingPassword(true);
    try {
      const data: ChangePasswordRequest = {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        verificationCode: values.verificationCode,
      };
      
      await changePassword(data);
      message.success('密码更新成功');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error('密码更新失败，请重试');
    } finally {
      setChangingPassword(false);
    }
  };

  // 文件上传配置
  const uploadProps: UploadProps = {
    fileList,
    beforeUpload: (file) => {
      console.log('文件验证:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        message.error('只能上传图片文件');
        return false;
      }
      
      // 验证文件大小
      if (file.size > 5 * 1024 * 1024) {
        message.error('头像文件大小不能超过5MB');
        return false;
      }
      
      // 验证文件扩展名
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedExtensions.includes(fileExtension)) {
        message.error('不支持的文件格式，请选择 JPG、PNG、GIF 等图片格式');
        return false;
      }
      
      setFileList([file]);
      return false; // 阻止自动上传
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  // 组件挂载时强制刷新用户信息
  useEffect(() => {
    handleRefresh();
  }, []);

  // 获取头像URL（兼容avatar_url和avatarUrl）
  const avatarUrl = userInfo?.avatarUrl || (userInfo as any)?.avatar_url;

  // 角色标注
  const getRoleTag = (roleType?: number) => {
    switch (roleType) {
      case 0:
        return <Tag color="red" icon={<SafetyOutlined />}>管理员</Tag>;
      case 2:
        return <Tag color="blue" icon={<TeamOutlined />}>学委</Tag>;
      case 1:
      default:
        return <Tag color="green" icon={<UserOutlined />}>学生</Tag>;
    }
  };

  // 班级代码转中文
  const getClassName = (classCode?: string) => {
    const classMap: { [key: string]: string } = {
      '1234': '计科23-1班',
      '2005': '计科23-2班',
      '1111': '计科23-3班',
      '8888': '计科智能班'
    };
    return classMap[classCode || ''] || classCode || '未知班级';
  };

  // 头像渲染逻辑
  let avatarNode: ReactNode = <Avatar size={100} icon={<UserOutlined />} className={styles.avatar} />;
  if (userInfo && avatarUrl && !avatarError) {
    avatarNode = <Avatar size={100} src={avatarUrl} className={styles.avatar} alt="头像" onError={() => { setAvatarError(true); return false; }} />;
  } else if (userInfo?.realName) {
    avatarNode = <Avatar size={100} className={styles.avatar}>{userInfo.realName.charAt(0)}</Avatar>;
  }

  // 如果正在加载，显示加载状态
  if (loading || refreshing || !userInfo) {
    return (
      <PageContainer>
        <div className={styles.profileWrap}>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#666' }}>正在加载用户信息...</div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className={styles.profileWrap}>
        {/* 顶部用户信息卡片 */}
        <Card className={styles.headerCard}>
          <Row gutter={24} align="middle">
            <Col xs={24} sm={8} md={6}>
              <div className={styles.avatarSection}>
                {avatarNode}
                <div className={styles.avatarActions}>
                  <Button 
                    size="small" 
                    icon={<EditOutlined />} 
                    onClick={handleChangeAvatar}
                  >
                    更换头像
                  </Button>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={16} md={12}>
              <div className={styles.userInfoSection}>
                <Title level={3} className={styles.userName}>
                  {userInfo?.realName || '未登录'}
                </Title>
                <Space size={16} wrap>
                  {getRoleTag(userInfo?.roleType)}
                  <Text type="secondary">
                    <IdcardOutlined /> {userInfo?.studentId || '-'}
                  </Text>
                </Space>
                <div className={styles.userMeta}>
                  <Text type="secondary">
                    <TeamOutlined /> {getClassName(userInfo?.classCode)}
                  </Text>
                  {userInfo?.email && (
                    <Text type="secondary">
                      <MailOutlined /> {userInfo.email}
                    </Text>
                  )}
                </div>
              </div>
            </Col>
            <Col xs={24} sm={24} md={6}>
              <div className={styles.actionSection}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={refreshing}
                    block
                  >
                    刷新信息
                  </Button>
                  <Button 
                    icon={<KeyOutlined />}
                    onClick={handleChangePassword}
                    block
                  >
                    修改密码
                  </Button>
                  <Button 
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    block
                  >
                    退出登录
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 详细信息区域 */}
        <Row gutter={24} style={{ marginTop: 24 }}>
          {/* 基本信息卡片 */}
          <Col xs={24} lg={16}>
            <Card 
              title={
                <Space>
                  <UserOutlined />
                  基本信息
                </Space>
              }
              className={styles.infoCard}
            >
              <Table
                dataSource={[
                  { key: 'realName', label: '姓名', value: userInfo?.realName || '-', icon: <UserOutlined /> },
                  { key: 'studentId', label: '学号', value: userInfo?.studentId || '-', icon: <IdcardOutlined /> },
                  { key: 'email', label: '邮箱', value: userInfo?.email || '-', icon: <MailOutlined /> },
                  { key: 'classCode', label: '班级', value: getClassName(userInfo?.classCode), icon: <TeamOutlined /> },
                  { key: 'roleType', label: '角色', value: getRoleTag(userInfo?.roleType), icon: <SafetyOutlined /> },
                  { key: 'createdAt', label: '注册时间', value: userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleString() : '-', icon: <CalendarOutlined /> },
                ]}
                columns={[
                  { 
                    title: '字段', 
                    dataIndex: 'label', 
                    key: 'label', 
                    width: 120,
                    render: (text, record) => (
                      <Space>
                        {record.icon}
                        {text}
                      </Space>
                    )
                  },
                  { title: '内容', dataIndex: 'value', key: 'value' },
                ]}
                pagination={false}
                rowKey="key"
                bordered
                size="middle"
                className={styles.infoTable}
              />
            </Card>
          </Col>

          {/* 统计信息卡片 */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <Space>
                  <CalendarOutlined />
                  账户统计
                </Space>
              }
              className={styles.statsCard}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={24}>
                <Statistic
                  title="账户状态"
                  value="正常"
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<SafetyOutlined />}
                />
                <Divider />
                <Statistic
                  title="注册天数"
                  value={userInfo?.createdAt ? Math.floor((Date.now() - new Date(userInfo.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  suffix="天"
                  prefix={<CalendarOutlined />}
                />
                <Divider />
                <Statistic
                  title="用户类型"
                  value={userInfo?.roleType === 0 ? '管理员' : userInfo?.roleType === 2 ? '学委' : '学生'}
                  prefix={<UserOutlined />}
                />
              </Space>
            </Card>
          </Col>
        </Row>

        {/* 退出登录确认弹窗 */}
        <Modal
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: '#faad14' }} />
              确认退出登录
            </Space>
          }
          open={logoutModalVisible}
          onOk={confirmLogout}
          onCancel={() => setLogoutModalVisible(false)}
          okText="确认退出"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <p>您确定要退出登录吗？退出后需要重新登录才能访问系统。</p>
        </Modal>

        {/* 更换头像弹窗 */}
        <Modal
          title={
            <Space>
              <UploadOutlined />
              更换头像
            </Space>
          }
          open={avatarModalVisible}
          onOk={handleAvatarUpload}
          onCancel={() => {
            setAvatarModalVisible(false);
            setFileList([]);
          }}
          okText="上传头像"
          cancelText="取消"
          confirmLoading={uploading}
          okButtonProps={{ disabled: fileList.length === 0 }}
          width={500}
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Upload {...uploadProps} listType="picture-card" maxCount={1}>
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>选择图片</div>
              </div>
            </Upload>
            <div style={{ marginTop: 16, color: '#666', fontSize: 12 }}>
              <p>支持格式：JPG、PNG、GIF、BMP、WebP等图片格式</p>
              <p>文件大小：不超过5MB</p>
              <p>建议尺寸：200x200像素或更大</p>
            </div>
            
            {/* 调试信息 */}
            {fileList.length > 0 && (
              <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 6, textAlign: 'left' }}>
                <Text strong>文件信息：</Text>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  <p>文件名：{fileList[0].name}</p>
                  <p>文件大小：{((fileList[0].size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                  <p>文件类型：{fileList[0].type}</p>
                </div>
                <Button 
                  size="small" 
                  type="link" 
                  onClick={() => {
                    console.log('当前用户信息:', userInfo);
                    console.log('当前token:', localStorage.getItem('token'));
                    console.log('文件列表:', fileList);
                  }}
                  style={{ marginTop: 8 }}
                >
                  调试信息
                </Button>
              </div>
            )}
          </div>
        </Modal>

        {/* 修改密码弹窗 */}
        <Modal
          title={
            <Space>
              <LockOutlined />
              修改密码
            </Space>
          }
          open={passwordModalVisible}
          onCancel={() => {
            setPasswordModalVisible(false);
            passwordForm.resetFields();
          }}
          footer={null}
          width={400}
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordSubmit}
            autoComplete="off"
          >
            <Form.Item
              name="oldPassword"
              label="当前密码"
              rules={[
                { required: true, message: '请输入当前密码' },
                { min: 6, message: '密码长度至少6位' }
              ]}
            >
              <Password 
                placeholder="请输入当前密码"
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码长度至少6位' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('oldPassword') !== value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('新密码不能与当前密码相同'));
                  },
                }),
              ]}
            >
              <Password 
                placeholder="请输入新密码"
                prefix={<KeyOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Password 
                placeholder="请再次输入新密码"
                prefix={<KeyOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="verificationCode"
              label="邮箱验证码"
              rules={[
                { required: true, message: '请输入邮箱验证码' },
                { len: 6, message: '验证码长度为6位' }
              ]}
            >
              <Input 
                placeholder="请输入6位验证码"
                prefix={<MailOutlined />}
                maxLength={6}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setPasswordModalVisible(false);
                  passwordForm.resetFields();
                }}>
                  取消
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={changingPassword}
                >
                  确认修改
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </PageContainer>
  );
};

export default UserProfile; 