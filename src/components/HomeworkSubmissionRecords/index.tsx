import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Avatar, 
  Tag, 
  Typography, 
  Space, 
  Pagination, 
  Empty, 
  Tooltip,
  message 
} from 'antd';
import { 
  TrophyOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  UserOutlined,
  FireOutlined
} from '@ant-design/icons';
import { 
  getHomeworkSubmissionRecords, 
  HomeworkSubmissionRecord 
} from '@/services/homework';
import { getFullAvatarUrl } from '@/utils/avatar';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface HomeworkSubmissionRecordsProps {
  pageSize?: number;
}

const HomeworkSubmissionRecords: React.FC<HomeworkSubmissionRecordsProps> = ({ 
  pageSize = 10 
}) => {
  const [records, setRecords] = useState<HomeworkSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 获取提交记录
  const fetchRecords = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await getHomeworkSubmissionRecords({
        page,
        pageSize,
      });
      setRecords(response.content || []);
      setTotal(response.totalElements || 0);
    } catch (error) {
      message.error('获取提交记录失败');
      console.error('获取提交记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(currentPage);
  }, [currentPage, pageSize]);

  // 获取提交状态标签
  const getSubmissionStatusTag = (record: HomeworkSubmissionRecord) => {
    if (record.is_first_submission) {
      return (
        <Tooltip title="首位提交，太棒了！">
          <Tag 
            icon={<TrophyOutlined />} 
            color="gold"
          >
            首位
          </Tag>
        </Tooltip>
      );
    }
    
    if (record.is_late_submission) {
      return (
        <Tag 
          icon={<ClockCircleOutlined />} 
          color="orange"
        >
          补交
        </Tag>
      );
    }
    
    return (
      <Tag 
        icon={<CheckCircleOutlined />} 
        color="green"
      >
        按时
      </Tag>
    );
  };

  // 格式化时间
  const formatTime = (time: string) => {
    return dayjs(time).format('MM-DD HH:mm');
  };

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card 
      title={
        <Space>
          <FireOutlined style={{ color: '#ff4d4f' }} />
          <span>作业提交动态</span>
        </Space>
      }
      extra={
        total > 0 && (
          <Text type="secondary" style={{ fontSize: 14 }}>
            共 {total} 条记录
          </Text>
        )
      }
      loading={loading}
      style={{ minHeight: 500 }}
    >
      {records.length === 0 ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 300 
        }}>
          <Empty 
            description="暂无提交记录" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <>
          <List
            dataSource={records}
            renderItem={(record) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      size={40}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: record.is_first_submission ? '#faad14' : '#1890ff' }}
                    >
                      {record.user_name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  }
                  title={
                    <Space>
                      <Text strong>{record.user_name}</Text>
                      {getSubmissionStatusTag(record)}
                      {record.is_first_submission && (
                        <Tooltip title="恭喜成为第一个提交的同学！">
                          <TrophyOutlined style={{ color: '#faad14', fontSize: 16 }} />
                        </Tooltip>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={2}>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        📚 {record.course_name} - {record.homework_title}
                      </Text>
                      <Space size={16}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          🎓 学号：{record.student_id}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          🕐 {formatTime(record.submission_time)}
                        </Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
          
          {/* 分页组件 */}
          {total > pageSize && (
            <div style={{ 
              marginTop: 16, 
              textAlign: 'center',
              paddingTop: 16,
              borderTop: '1px solid #f0f0f0'
            }}>
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) => 
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                }
                onChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default HomeworkSubmissionRecords;

