import React, { useState, useEffect } from 'react';
import Loading from '../../loading';
import { Timeline, Card, Tag, List, Typography } from 'antd';
import { 
  ClockCircleOutlined, 
  NotificationOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { announcements, Announcement, UpdateItem } from './announcementData';

const { Title, Text } = Typography;

const AnnouncementPage: React.FC = () => {
  const [displayAnnouncements, setDisplayAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    // 根据id降序排序，保证新公告在前面
    const sortedData = [...announcements].sort((a, b) => b.id - a.id);
    setDisplayAnnouncements(sortedData);
  }, []);

  const getStatusTag = (status?: string) => {
    switch(status) {
      case 'new':
        return <Tag color="green">新增</Tag>;
      case 'fixed':
        return <Tag color="blue">修复</Tag>;
      case 'improved':
        return <Tag color="purple">优化</Tag>;
      case 'removed':
        return <Tag color="red">移除</Tag>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'info':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <NotificationOutlined />;
    }
  };

  return (
    <Loading>
      <div 
        style={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          backgroundAttachment: 'fixed',
          position: 'relative',
        }}
      >
        {/* 顶部装饰渐变 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '200px',
            background: 'linear-gradient(180deg, rgba(0,118,255,0.05) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          }}
        />
        
        <div style={{ 
          padding: '24px',
          maxWidth: '1000px', 
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <NotificationOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <Title level={4} style={{ margin: 0 }}>系统公告</Title>
              </div>
            }
            bordered={false}
            style={{ 
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
            }}
          >
            <Timeline>
              {displayAnnouncements.map(item => (
                <Timeline.Item 
                  key={item.id}
                  color={item.type === 'success' ? 'green' : item.type === 'warning' ? 'gold' : 'blue'}
                  dot={getTypeIcon(item.type)}
                >
                  <Card
                    size="small"
                    bordered={false}
                    className="announcement-card"
                    style={{ 
                      background: 'rgba(250,250,250,0.8)',
                      marginBottom: '24px',
                      backdropFilter: 'blur(5px)',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <Title level={5} style={{ margin: 0 }}>{item.title}</Title>
                        <div>
                          {item.version && <Tag color="blue">{item.version}</Tag>}
                          <Text type="secondary" style={{ marginLeft: '8px' }}>{item.date}</Text>
                        </div>
                      </div>
                      <Text type="secondary">{item.summary}</Text>
                    </div>
                    
                    <List
                      size="small"
                      dataSource={item.updates}
                      renderItem={(update, index) => (
                        <List.Item style={{ padding: '8px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text strong>{`${index + 1}.`}</Text>
                            {getStatusTag(update.status)}
                            <Text>{update.content}</Text>
                          </div>
                        </List.Item>
                      )}
                    />
                    
                    {item.author && (
                      <div style={{ marginTop: '16px', textAlign: 'right' }}>
                        <Text type="secondary">发布人：{item.author}</Text>
                      </div>
                    )}
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </div>
      </div>
    </Loading>
  );
};

export default AnnouncementPage;