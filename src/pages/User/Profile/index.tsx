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
  KeyOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { changeAvatar, changePassword, ChangePasswordRequest, sendEmailCode, updateEmail, updateUserCourses } from '@/services/auth';
import { getFullAvatarUrl } from '@/utils/avatar';
import { AVATAR_CONFIG, CLASS_CODE_MAP, ROLE_TYPE_MAP } from '@/constants/config';
import { COURSE_OPTIONS, getCourseByCode } from '@/constants/course';
import CourseSelectionModal from '@/components/CourseSelectionModal';
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
  const [sendingCode, setSendingCode] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [fileValidationStatus, setFileValidationStatus] = useState<'valid' | 'invalid' | 'none'>('none');
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [emailForm] = Form.useForm();

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
    console.log('头像上传开始，文件列表:', fileList);
    console.log('文件列表详情:', fileList.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      uid: f.uid,
      originFileObj: !!f.originFileObj
    })));
    
    if (fileList.length === 0) {
      message.error('请选择头像文件');
      return;
    }

    const file = fileList[0].originFileObj;
    if (!file) {
      console.error('文件对象为空，fileList[0]:', fileList[0]);
      message.error('文件上传失败');
      return;
    }

    console.log('准备上传的文件:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // 前端验证（与后端保持一致）
    if (!file.type.startsWith('image/')) {
      message.error('只能上传图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('头像文件大小不能超过5MB');
      return;
    }

    setUploading(true);
    try {
      console.log('开始调用changeAvatar函数');
      
      // 测试网络连接
      const networkOk = await testNetworkConnection();
      if (!networkOk) {
        message.error('网络连接失败，请检查网络设置');
        return;
      }

      const avatarUrl = await changeAvatar(file);
      
      console.log('头像上传成功，返回URL:', avatarUrl);
      
      message.success('头像更换成功');
      setAvatarModalVisible(false);
      setFileList([]);
      
      // 刷新用户信息以获取新头像
      await fetchUserInfo();
    } catch (error: any) {
      console.error('头像上传失败:', error);
      
      // 根据后端错误代码显示具体错误信息
      let errorMessage = '头像更换失败，请重试';
      
      if (error.message) {
        if (error.message.includes('AVATAR-001')) {
          errorMessage = '请选择头像文件';
        } else if (error.message.includes('AVATAR-002')) {
          errorMessage = '只能上传图片文件';
        } else if (error.message.includes('AVATAR-003')) {
          errorMessage = '头像文件大小不能超过5MB';
        } else if (error.message.includes('AVATAR-004')) {
          errorMessage = '保存头像文件失败，请重试';
        } else {
          errorMessage = error.message;
        }
      }
      
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

  // 测试网络连接
  const testNetworkConnection = async () => {
    try {
      console.log('测试网络连接...');
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('网络连接测试响应:', response.status, response.statusText);
      return response.ok;
    } catch (error) {
      console.error('网络连接测试失败:', error);
      return false;
    }
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (!userInfo?.email) {
      message.error('用户邮箱信息缺失');
      return;
    }
    
    console.log('开始发送验证码到邮箱:', userInfo.email);
    
    setSendingCode(true);
    try {
      await sendEmailCode(userInfo.email);
      message.success('验证码已发送至您的邮箱');
    } catch (error: any) {
      console.error('发送验证码失败:', error);
      const errorMessage = error.message || '发送验证码失败，请重试';
      message.error(errorMessage);
    } finally {
      setSendingCode(false);
    }
  };

  // 更新密码
  const handlePasswordSubmit = async (values: any) => {
    console.log('密码修改表单提交值:', values);
    console.log('当前用户信息:', userInfo);
    
    setChangingPassword(true);
    try {
      const data: ChangePasswordRequest = {
        email: userInfo?.email || '',
        newPassword: values.newPassword,
        verificationCode: values.verificationCode,
      };
      
      console.log('发送给后端的数据:', data);
      
      await changePassword(data);
      message.success('密码更新成功');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error: any) {
      console.error('密码更新失败:', error);
      
      // 根据后端错误代码显示具体错误信息
      let errorMessage = '密码更新失败，请重试';
      
      if (error.message) {
        if (error.message.includes('AUTH-001')) {
          errorMessage = '用户不存在';
        } else if (error.message.includes('AUTH-003')) {
          errorMessage = '新密码长度不能少于6位';
        } else if (error.message.includes('AUTH-004')) {
          errorMessage = '验证码错误或已过期';
        } else {
          errorMessage = error.message;
        }
      }
      
      message.error(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  // 打开邮箱修改弹窗
  const handleEmailEdit = () => {
    setEmailModalVisible(true);
    emailForm.setFieldsValue({ newEmail: '' });
  };

  // 更新邮箱
  const handleEmailSubmit = async (values: any) => {
    console.log('邮箱修改表单提交值:', values);
    
    setUpdatingEmail(true);
    try {
      await updateEmail({ newEmail: values.newEmail });
      message.success('邮箱更新成功');
      
      setEmailModalVisible(false);
      emailForm.resetFields();
      
      // 刷新用户信息以确保数据同步
      await handleRefresh();
    } catch (error: any) {
      console.error('邮箱更新失败:', error);
      const errorMessage = error.message || '邮箱更新失败，请重试';
      message.error(errorMessage);
    } finally {
      setUpdatingEmail(false);
    }
  };

  // 打开课程编辑弹窗
  const handleCourseEdit = () => {
    setCourseModalVisible(true);
  };

  // 处理课程选择成功
  const handleCourseSelectionSuccess = async (selectedCourses: number) => {
    setCourseModalVisible(false);
    
    try {
      message.success('课程更新成功！');
      
      // 延迟一下再刷新页面，让用户看到成功提示
      setTimeout(() => {
        console.log('课程修改成功，刷新页面以使修改生效');
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('课程更新处理失败:', error);
    }
  };

  // 获取用户选择的课程列表
  const getUserCourses = () => {
    if (!userInfo?.courses) return [];
    
    const selectedCourses = [];
    for (const course of COURSE_OPTIONS) {
      if (userInfo.courses & course.code) {
        selectedCourses.push(course);
      }
    }
    return selectedCourses;
  };

  // 渲染课程标签
  const renderCourseTags = () => {
    const courses = getUserCourses();
    if (courses.length === 0) {
      return <Text type="secondary">未选择课程</Text>;
    }
    
    return (
      <Space wrap>
        {courses.map(course => (
          <Tag key={course.value} color="blue">
            {course.label}
          </Tag>
        ))}
      </Space>
    );
  };

  // 文件上传配置
  const uploadProps: UploadProps = {
    fileList,
    maxCount: 1, // 限制只能上传一张图片
    beforeUpload: (file) => {
      console.log('文件验证:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // 验证文件类型（与后端保持一致）
      if (!file.type.startsWith('image/')) {
        setFileValidationStatus('invalid');
        message.error('只能上传图片文件');
        return Upload.LIST_IGNORE;
      }
      
      // 验证文件大小（与后端保持一致）
      if (file.size > AVATAR_CONFIG.MAX_SIZE) {
        setFileValidationStatus('invalid');
        message.error(`头像文件大小不能超过${AVATAR_CONFIG.MAX_SIZE / 1024 / 1024}MB`);
        return Upload.LIST_IGNORE;
      }
      
      // 验证文件扩展名
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!AVATAR_CONFIG.ALLOWED_EXTENSIONS.includes(fileExtension)) {
        setFileValidationStatus('invalid');
        message.error('不支持的文件格式，请选择 JPG、PNG、GIF 等图片格式');
        return Upload.LIST_IGNORE;
      }
      
      setFileValidationStatus('valid');
      console.log('文件验证通过，添加到列表');
      return false; // 阻止自动上传，但允许文件添加到列表
    },
    onRemove: () => {
      console.log('移除文件');
      setFileList([]);
      setFileValidationStatus('none');
    },
    onChange: (info) => {
      console.log('Upload onChange:', info);
      console.log('文件列表状态:', info.fileList);
      
      // 确保只保留最新的一张图片
      if (info.fileList.length > 1) {
        const latestFile = info.fileList[info.fileList.length - 1];
        const previousFile = info.fileList[info.fileList.length - 2];
        setFileList([latestFile]);
        message.info(`已替换头像：${previousFile.name} → ${latestFile.name}`);
      } else {
        setFileList(info.fileList);
      }
    },
    // 自定义上传按钮文本
    itemRender: (originNode, file, fileList) => {
      return (
        <div style={{ position: 'relative' }}>
          {originNode}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            background: 'rgba(0,0,0,0.6)', 
            color: 'white', 
            padding: '2px 6px', 
            fontSize: '12px',
            borderRadius: '0 0 0 4px'
          }}>
            头像
          </div>
        </div>
      );
    },
  };

  // 组件挂载时强制刷新用户信息
  useEffect(() => {
    handleRefresh();
    
    // 测试网络连接
    console.log('当前token:', localStorage.getItem('token'));
    console.log('当前用户信息:', userInfo);
  }, []);



  // 获取头像URL（兼容avatar_url和avatarUrl）
  const avatarUrl = getFullAvatarUrl(userInfo?.avatarUrl || (userInfo as any)?.avatar_url);

  // 角色标注
  const getRoleTag = (roleType?: number) => {
    switch (roleType) {
      case 0:
        return <Tag color="red" icon={<SafetyOutlined />}>{ROLE_TYPE_MAP[0]}</Tag>;
      case 2:
        return <Tag color="blue" icon={<TeamOutlined />}>{ROLE_TYPE_MAP[2]}</Tag>;
      case 1:
      default:
        return <Tag color="green" icon={<UserOutlined />}>{ROLE_TYPE_MAP[1]}</Tag>;
    }
  };

  // 班级代码转中文
  const getClassName = (classCode?: string) => {
    return CLASS_CODE_MAP[classCode || ''] || classCode || '未知班级';
  };

  // 头像渲染逻辑
  let avatarNode: ReactNode = <Avatar size={100} icon={<UserOutlined />} className={styles.avatar} />;
  
  console.log('头像渲染逻辑:', {
    hasUserInfo: !!userInfo,
    hasAvatarUrl: !!avatarUrl,
    avatarError,
    avatarUrl,
    userInfoRealName: userInfo?.realName
  });
  
  if (userInfo && avatarUrl && !avatarError) {
    console.log('渲染头像图片:', avatarUrl);
    avatarNode = <Avatar size={100} src={avatarUrl} className={styles.avatar} alt="头像" onError={() => { 
      console.error('头像加载失败:', avatarUrl);
      setAvatarError(true); 
      return false; 
    }} />;
  } else if (userInfo?.realName) {
    console.log('渲染文字头像:', userInfo.realName.charAt(0));
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
                  {/* <Button 
                    icon={<KeyOutlined />}
                    onClick={handleChangePassword}
                    block
                  >
                    修改密码
                  </Button> */}
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
                  { key: 'courses', label: '选修课程', value: renderCourseTags(), icon: <BookOutlined /> },
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
                  {
                    title: '操作',
                    key: 'action',
                    width: 100,
                    render: (text, record) => {
                      if (record.key === 'email') {
                        return (
                          <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={handleEmailEdit}
                          >
                            修改
                          </Button>
                        );
                      }
                      if (record.key === 'courses') {
                        return (
                          <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={handleCourseEdit}
                          >
                            修改
                          </Button>
                        );
                      }
                      return null;
                    }
                  }
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
            setAvatarError(false); // 重置头像错误状态
            setFileValidationStatus('none'); // 重置文件验证状态
          }}
          okText="上传头像"
          cancelText="取消"
          confirmLoading={uploading}
          okButtonProps={{ 
            disabled: fileList.length === 0,
            title: fileList.length === 0 ? '请先选择头像文件' : '点击上传头像'
          }}
          width={600}
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            {/* 当前头像预览 */}
            <div style={{ marginBottom: 24 }}>
              <Text strong>当前头像：</Text>
              <div style={{ marginTop: 8 }}>
                {userInfo && (userInfo.avatarUrl || (userInfo as any)?.avatar_url) ? (
                  <Avatar 
                    size={80} 
                    src={getFullAvatarUrl(userInfo.avatarUrl || (userInfo as any)?.avatar_url)} 
                    alt="当前头像"
                    onError={() => { setAvatarError(true); return false; }}
                  />
                ) : (
                  <Avatar size={80} icon={<UserOutlined />} />
                )}
              </div>
            </div>

            {/* 上传区域 */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>选择新头像：</Text>
              <div style={{ marginTop: 8 }}>
                <Upload {...uploadProps} listType="picture-card" maxCount={1}>
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>选择图片</div>
                  </div>
                </Upload>
              </div>
            </div>

            {/* 上传说明 */}
            <div style={{ marginTop: 16, color: '#666', fontSize: 12, textAlign: 'left', maxWidth: 400, margin: '16px auto' }}>
              <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 6 }}>
                <Text strong style={{ color: '#1890ff' }}>上传要求：</Text>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: 16 }}>
                  <li>支持格式：{AVATAR_CONFIG.ALLOWED_EXTENSIONS.join('、').replace(/\./g, '').toUpperCase()}</li>
                  <li>文件大小：不超过{AVATAR_CONFIG.MAX_SIZE / 1024 / 1024}MB</li>
                  <li>建议尺寸：{AVATAR_CONFIG.RECOMMENDED_SIZE}像素或更大</li>
                  <li>一次只能上传一张图片，重复选择会替换当前图片</li>
                </ul>
              </div>
            </div>
            
            {/* 文件信息预览 */}
            {fileList.length > 0 && (
              <div style={{ 
                marginTop: 16, 
                padding: 12, 
                background: fileValidationStatus === 'valid' ? '#f6ffed' : fileValidationStatus === 'invalid' ? '#fff2f0' : '#f0f9ff', 
                border: fileValidationStatus === 'valid' ? '1px solid #b7eb8f' : fileValidationStatus === 'invalid' ? '1px solid #ffccc7' : '1px solid #91d5ff',
                borderRadius: 6, 
                textAlign: 'left' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ 
                    color: fileValidationStatus === 'valid' ? '#52c41a' : fileValidationStatus === 'invalid' ? '#ff4d4f' : '#1890ff' 
                  }}>
                    已选择文件：
                  </Text>
                  {fileValidationStatus === 'valid' && (
                    <span style={{ marginLeft: 8, color: '#52c41a', fontSize: 12 }}>
                      ✓ 文件格式正确
                    </span>
                  )}
                  {fileValidationStatus === 'invalid' && (
                    <span style={{ marginLeft: 8, color: '#ff4d4f', fontSize: 12 }}>
                      ✗ 文件格式有误
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  <p><Text strong>文件名：</Text>{fileList[0].name}</p>
                  <p><Text strong>文件大小：</Text>{((fileList[0].size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                  <p><Text strong>文件类型：</Text>{fileList[0].type}</p>
                </div>
                <Button 
                  size="small" 
                  type="link" 
                  onClick={() => {
                    console.log('当前用户信息:', userInfo);
                    console.log('当前token:', localStorage.getItem('token'));
                    console.log('文件列表:', fileList);
                  }}
                  style={{ marginTop: 8, padding: 0 }}
                >
                  查看调试信息
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
          <div style={{ marginBottom: 16, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
            <Text type="secondary">
              <MailOutlined /> 验证码将发送到：<Text strong>{userInfo?.email || '未知邮箱'}</Text>
            </Text>
          </div>
          
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordSubmit}
            autoComplete="off"
          >
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码长度至少6位' }
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
                suffix={
                  <Button 
                    type="link"
                    loading={sendingCode}
                    onClick={handleSendCode}
                    style={{ padding: 0, height: 'auto' }}
                  >
                    发送验证码
                  </Button>
                }
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

        {/* 修改邮箱弹窗 */}
        <Modal
          title={
            <Space>
              <MailOutlined />
              修改邮箱
            </Space>
          }
          open={emailModalVisible}
          onCancel={() => {
            setEmailModalVisible(false);
            emailForm.resetFields();
          }}
          footer={null}
          width={400}
        >
          <Form
            form={emailForm}
            layout="vertical"
            onFinish={handleEmailSubmit}
            autoComplete="off"
          >
            <Form.Item
              name="newEmail"
              label="新邮箱地址"
              rules={[
                { required: true, message: '请输入新的邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' },
                {
                  validator: (_, value) => {
                    if (value && userInfo && value === userInfo.studentId) {
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

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setEmailModalVisible(false);
                  emailForm.resetFields();
                }}>
                  取消
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={updatingEmail}
                  icon={<MailOutlined />}
                >
                  确认修改
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 课程选择弹窗 */}
        <CourseSelectionModal
          open={courseModalVisible}
          onSuccess={handleCourseSelectionSuccess}
          initialCourses={userInfo?.courses || undefined}
        />
      </div>
    </PageContainer>
  );
};

export default UserProfile; 