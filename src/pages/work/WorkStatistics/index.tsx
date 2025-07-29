import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { getHomeworkList } from '@/services/homework';
import dayjs from 'dayjs';

const WorkStatistics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    completed: 0,
    ongoing: 0,
    overdue: 0,
    completionRate: 0,
    overdueRate: 0
  });

  // 获取作业统计数据
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await getHomeworkList();
      const homeworks = response.content || [];
      
      const now = dayjs();
      
      // 计算统计数据
      const total = homeworks.length;
      const completed = homeworks.filter(hw => hw.status === 2 || hw.status === 3).length; // 已截止或已批改
      const ongoing = homeworks.filter(hw => hw.status === 1 && now.isBefore(dayjs(hw.deadline))).length; // 进行中且未截止
      const overdue = homeworks.filter(hw => hw.status === 1 && now.isAfter(dayjs(hw.deadline))).length; // 进行中但已截止
      
      const stats = {
        total,
        completed,
        ongoing,
        overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        overdueRate: total > 0 ? Math.round((overdue / total) * 100) : 0
      };
      
      setStatistics(stats);
    } catch (error) {
      message.error('获取统计数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return (
    <PageContainer>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        </div>
        
        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总作业数"
                  value={statistics.total}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="已完成"
                  value={statistics.completed}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="进行中"
                  value={statistics.ongoing}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="已逾期"
                  value={statistics.overdue}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>
        </Spin>

        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="完成率"
                value={statistics.completionRate}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="逾期率"
                value={statistics.overdueRate}
                suffix="%"
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <Card style={{ marginTop: '24px' }}>
          <h2>统计图表</h2>
          <p>这里可以添加图表组件，如 ECharts 或 Ant Design Charts</p>
        </Card>
      </div>
    </PageContainer>
  );
};

export default WorkStatistics; 