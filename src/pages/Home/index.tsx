import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Tag } from 'antd';
import { history } from '@umijs/max';
import { NotificationOutlined } from '@ant-design/icons';
import styles from './index.less';
import { POEMS } from '@/constants/poem';
import { announcements, UpdateItem } from '../notify/announcementData';

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
  const { name, userInfo } = useModel('global');
  const [time, setTime] = useState<string>(new Date().toLocaleString());
  const [poem, setPoem] = useState<string>('');
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    setPoem(POEMS[Math.floor(Math.random() * POEMS.length)]);
    const timer = setInterval(() => {
      setTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 获取notify下存储的最新公告
    const mockLatestAnnouncement: Announcement = announcements[0];
    setLatestAnnouncement(mockLatestAnnouncement);
  }, []);

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
        <div style={{ fontSize: 16, fontStyle: 'italic', color: '#666', marginBottom: 32 }}>{poem}</div>
      </div>
    </PageContainer>
  );
};

export default HomePage;
