import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Tag, message } from 'antd';
import { history } from '@umijs/max';
import { NotificationOutlined } from '@ant-design/icons';
import styles from './index.less';
import { POEMS } from '@/constants/poem';
import { announcements, UpdateItem } from '../notify/announcementData';
import EmailUpdateModal from '@/components/EmailUpdateModal';
import CourseSelectionModal from '@/components/CourseSelectionModal';
import { updateEmail, getCurrentUser } from '@/services/auth';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  if (hour < 21) return '傍晚好';
  return '晚上好';
}

interface Announcement {
  id: number;
  title: string;
  summary: string;
  date: string;
  type: 'success' | 'warning' | 'info';
}

const HomePage: React.FC = () => {
  const { name, userInfo, updateUserInfo, fetchUserInfo, loading } = useModel('global');
  const { refresh } = useModel('@@initialState');
  const [time, setTime] = useState<string>(new Date().toLocaleString());
  const [poem, setPoem] = useState<string>('');
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  useEffect(() => {
    setPoem(POEMS[Math.floor(Math.random() * POEMS.length)]);
    const timer = setInterval(() => {
      setTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 获取最新公告
  useEffect(() => {
    const mockLatestAnnouncement: Announcement = announcements[0];
    setLatestAnnouncement(mockLatestAnnouncement);
  }, []);

  // 检查邮箱是否与学号相同
  const checkEmailAndStudentId = () => {
    if (!userInfo) return false;
    const { email, studentId } = userInfo;
    return email === studentId;
  };

  // 课程选择和邮箱检查逻辑 - 当userInfo就绪后检查
  useEffect(() => {
    if (!userInfo) {
      console.log('首页 - 用户信息为空，跳过检查');
      return;
    }

    console.log('首页 - 用户信息已加载:', userInfo);
    
    // 先检查课程选择
    if (userInfo.courses === null || userInfo.courses === undefined || userInfo.courses === 0) {
      console.log('首页 - 用户未选择课程，显示课程选择弹窗');
      setShowCourseModal(true);
    } else {
      console.log('首页 - 用户已选择课程:', userInfo.courses);
      // 课程已选择，检查邮箱
      if (checkEmailAndStudentId()) {
        setShowEmailModal(true);
      }
    }
  }, [userInfo]);

  // 处理邮箱更新成功
  const handleEmailUpdateSuccess = async (newEmail: string) => {
    setShowEmailModal(false);
    
    try {
      // 重新获取最新的用户信息
      const latestUserInfo = await getCurrentUser();
      
      // 更新全局用户信息（global model）
      updateUserInfo(latestUserInfo);
      
      // 刷新UmiJS的初始状态
      await refresh();
      
      console.log('用户信息已更新:', latestUserInfo);
      message.success('邮箱更新成功！');
    } catch (error) {
      console.error('获取最新用户信息失败:', error);
      // 如果获取失败，至少更新邮箱字段
      if (userInfo) {
        const updatedUserInfo = { ...userInfo, email: newEmail };
        updateUserInfo(updatedUserInfo);
        await refresh();
      }
      message.success('邮箱更新成功！');
    }
  };

  // 处理邮箱更新取消
  const handleEmailUpdateCancel = () => {
    setShowEmailModal(false);
    message.info('您可以稍后在个人设置中修改邮箱');
  };

  // 处理课程选择成功
  const handleCourseSelectionSuccess = async (selectedCourses: number) => {
    setShowCourseModal(false);
    
    try {
      // 重新获取最新的用户信息
      const latestUserInfo = await getCurrentUser();
      
      // 更新全局用户信息（global model）
      updateUserInfo({ ...latestUserInfo, courses: selectedCourses });
      
      // 刷新UmiJS的初始状态
      await refresh();
      
      console.log('用户课程信息已更新:', { ...latestUserInfo, courses: selectedCourses });
      
      // 课程选择完成后，检查是否需要显示邮箱更新弹窗
      setTimeout(() => {
        if (checkEmailAndStudentId()) {
          setShowEmailModal(true);
        }
      }, 500);
    } catch (error) {
      console.error('获取最新用户信息失败:', error);
      // 如果获取失败，至少更新课程字段
      if (userInfo) {
        const updatedUserInfo = { ...userInfo, courses: selectedCourses };
        updateUserInfo(updatedUserInfo);
        await refresh();
      }
    }
  };

  // 获取公告类型对应的颜色
  const getAnnouncementColor = (type: string) => {
    switch(type) {
      case 'success': return '#52c41a';
      case 'warning': return '#faad14';
      case 'info': return '#1890ff';
      default: return '#1890ff';
    }
  };



  return (
    <PageContainer ghost>
      <div className={styles.container}>
        {/* 广告横幅 */}
        {latestAnnouncement && (
          <div
            className={styles.announcement}
            onClick={() => history.push('/notify/announcement')}
            style={{
              marginTop: -80,
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f5ff 100%)',
              border: '1px solid #e6f0ff',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* 装饰条 */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                background: getAnnouncementColor(latestAnnouncement.type),
              }}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <NotificationOutlined style={{ 
                color: getAnnouncementColor(latestAnnouncement.type),
                fontSize: '18px' 
              }} />
              <h2 style={{ 
                margin: 0,
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1f1f1f'
              }}>
                最新公告
              </h2>
              <Tag color={latestAnnouncement.type === 'warning' ? 'warning' : 'processing'}>
                NEW
              </Tag>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'baseline' 
            }}>
              <p style={{ 
                margin: 0,
                color: '#333',
                fontSize: '14px',
                flex: 1,
                paddingRight: '16px'
              }}>
                {latestAnnouncement.title} - {latestAnnouncement.summary}
              </p>
              <span style={{ 
                fontSize: '12px',
                color: '#888',
                whiteSpace: 'nowrap'
              }}>
                {latestAnnouncement.date}
              </span>
            </div>
          </div>
        )}
        
        <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 0, paddingTop: 0 }}>
          {getGreeting()}，{name}！
        </div>
        <div style={{ fontSize: 18, color: '#888', marginBottom: 16 }}>
          当前时间：{time}
        </div>
        <br />

        
        <div style={{ width: '230px', height: '20px', backgroundColor: 'lightblue' }}> 为什么今天第一次旷课就被逮捕了  :(</div>
        <br />

        
        <div style={{ fontSize: 16, fontStyle: 'italic', color: '#666', marginBottom: 32 }}>{poem}</div>
      </div>

      {/* 课程选择弹窗 */}
      <CourseSelectionModal
        visible={showCourseModal}
        onSuccess={handleCourseSelectionSuccess}
      />

      {/* 邮箱更新弹窗 */}
      <EmailUpdateModal
        visible={showEmailModal}
        onCancel={handleEmailUpdateCancel}
        onSuccess={handleEmailUpdateSuccess}
        currentEmail={userInfo?.email || ''}
        studentId={userInfo?.studentId || ''}
      />
    </PageContainer>
  );
};

export default HomePage;
