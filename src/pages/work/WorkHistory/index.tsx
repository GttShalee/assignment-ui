import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Typography,
  Tag,
  Button,
  Space,
  message,
  Empty,
  Statistic,
  Row,
  Col,
  Input,
  DatePicker,
  Select
} from 'antd';
import {
  HistoryOutlined,
  DownloadOutlined,
  FileOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SearchOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getMySubmissionHistory, HistorySubmission, downloadMyHomework } from '@/services/homework';
import { getCourseLabel } from '@/constants/course';
import { API_BASE_URL } from '@/constants/config';
import { getToken } from '@/services/auth';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

const WorkHistory: React.FC = () => {
  const [allSubmissions, setAllSubmissions] = useState<HistorySubmission[]>([]); // 存储所有数据
  const [filteredSubmissions, setFilteredSubmissions] = useState<HistorySubmission[]>([]); // 存储筛选后的数据
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
  });

  // 搜索和筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // 获取历史提交记录
  const fetchSubmissionHistory = async () => {
    setLoading(true);
    try {
      // 获取所有数据（或者根据后端API调整分页大小）
      const response = await getMySubmissionHistory({
        page: 0,
        pageSize: 1000, // 获取较大数量的数据，实际项目中可能需要分批获取
      });

      console.log('历史提交记录响应:', response);

      const historyList = response.content || [];
      setAllSubmissions(historyList);
      setFilteredSubmissions(historyList); // 初始时显示所有数据
      
      setPagination(prev => ({
        ...prev,
        current: 1,
        total: historyList.length,
      }));
    } catch (error) {
      message.error('获取历史提交记录失败');
      console.error('获取历史提交记录错误:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionHistory();
  }, []);

  // 筛选逻辑
  const applyFilters = () => {
    let filtered = [...allSubmissions];

    // 按作业标题搜索
    if (searchKeyword.trim()) {
      filtered = filtered.filter(item =>
        item.homework_title.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // 按课程筛选
    if (selectedCourse) {
      filtered = filtered.filter(item => item.course_name === selectedCourse);
    }

    // 按提交状态筛选
    if (selectedStatus !== undefined) {
      filtered = filtered.filter(item => item.submission_status === selectedStatus);
    }

    // 按日期范围筛选
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(item => {
        const submissionTime = dayjs(item.submission_time);
        return submissionTime.isAfter(dateRange[0].startOf('day')) && 
               submissionTime.isBefore(dateRange[1].endOf('day'));
      });
    }

    setFilteredSubmissions(filtered);
    setPagination(prev => ({
      ...prev,
      current: 1,
      total: filtered.length,
    }));
  };

  // 当筛选条件变化时应用筛选
  useEffect(() => {
    applyFilters();
  }, [searchKeyword, selectedCourse, selectedStatus, dateRange, allSubmissions]);

  // 下载文件 - 使用简化的后端接口
  const handleDownload = (homeworkId: number, fileName: string) => {
    if (!homeworkId) {
      message.error('作业ID不存在');
      return;
    }

    try {
      console.log('下载文件:', {
        homeworkId: homeworkId,
        fileName: fileName
      });
      
      // 使用iframe下载，避免重定向问题
      downloadMyHomework(homeworkId);
      message.success('开始下载文件');
    } catch (error: any) {
      message.error(error.message || '下载失败，请稍后重试');
      console.error('下载文件失败:', error);
    }
  };

  // 表格列定义
  const columns: ColumnsType<HistorySubmission> = [
    {
      title: '作业信息',
      key: 'homework_info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
            {record.homework_title}
          </div>
          <div style={{ color: '#1890ff', fontSize: 13 }}>
            课程：{getCourseLabel(record.course_name)}
          </div>
        </div>
      ),
    },
    {
      title: '提交文件',
      dataIndex: 'submission_file_name',
      key: 'submission_file_name',
      render: (fileName, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FileOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{fileName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              点击下载按钮获取文件
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'submission_time',
      key: 'submission_time',
      width: 180,
      render: (time) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ClockCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          <div>
            <div>{dayjs(time).format('YYYY-MM-DD')}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(time).format('HH:mm:ss')}
            </Text>
          </div>
        </div>
      ),
      sorter: (a, b) => dayjs(a.submission_time).unix() - dayjs(b.submission_time).unix(),
    },
    {
      title: '提交状态',
      dataIndex: 'submission_status',
      key: 'submission_status',
      width: 120,
      render: (status) => {
        if (status === 0) {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              按时提交
            </Tag>
          );
        } else {
          return (
            <Tag icon={<WarningOutlined />} color="warning">
              补交
            </Tag>
          );
        }
      },
      filters: [
        { text: '按时提交', value: 0 },
        { text: '补交', value: 1 },
      ],
      onFilter: (value, record) => record.submission_status === value,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => handleDownload(record.homework_id, record.submission_file_name)}
          size="small"
        >
          下载
        </Button>
      ),
    },
  ];

  // 统计数据（基于当前筛选结果）
  const totalSubmissions = filteredSubmissions.length;
  const onTimeSubmissions = filteredSubmissions.filter(s => s.submission_status === 0).length;
  const lateSubmissions = filteredSubmissions.filter(s => s.submission_status === 1).length;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3} style={{ marginBottom: '24px' }}>
        <HistoryOutlined style={{ marginRight: '8px' }} />
        历史提交记录
      </Title>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总提交数"
              value={pagination.total}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="按时提交"
              value={onTimeSubmissions}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="补交作业"
              value={lateSubmissions}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容卡片 */}
      <Card
        title={
          <Space>
            <CalendarOutlined />
            <span>提交记录列表</span>
            <Text type="secondary">({pagination.total} 条记录)</Text>
          </Space>
        }
        bordered={false}
        style={{
          borderRadius: '8px',
          boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)',
        }}
      >
        {/* 搜索和筛选工具栏 */}
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Search
                placeholder="搜索作业标题"
                allowClear
                enterButton={<SearchOutlined />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={(value) => setSearchKeyword(value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="选择课程"
                allowClear
                style={{ width: '100%' }}
                value={selectedCourse}
                onChange={setSelectedCourse}
                options={[
                  { label: '软件工程', value: 'software_engineering' },
                  { label: '微机接口', value: 'microcomputer_interface' },
                  { label: '操作系统', value: 'operating_system' },
                  { label: '人工智能导论', value: 'ai_introduction' },
                  { label: '组成原理', value: 'computer_organization' },
                  { label: '神经网络', value: 'neural_network' },
                  { label: '大数据分析', value: 'big_data_analysis' },
                ]}
              />
            </Col>
            <Col span={5}>
              <Select
                placeholder="提交状态"
                allowClear
                style={{ width: '100%' }}
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={[
                  { label: '按时提交', value: 0 },
                  { label: '补交', value: 1 },
                ]}
              />
            </Col>
            <Col span={3}>
              <Button
                type="default"
                onClick={() => {
                  setSearchKeyword('');
                  setSelectedCourse(undefined);
                  setSelectedStatus(undefined);
                  setDateRange(null);
                }}
                style={{ width: '100%' }}
              >
                重置筛选
              </Button>
            </Col>
          </Row>
          
          {/* 日期范围筛选 */}
          <Row gutter={16} style={{ marginTop: '12px' }}>
            <Col span={8}>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                  } else {
                    setDateRange(null);
                  }
                }}
                format="YYYY-MM-DD"
              />
            </Col>
            <Col span={16}>
              <Text type="secondary" style={{ lineHeight: '32px' }}>
                选择日期范围可按提交时间筛选记录
              </Text>
            </Col>
          </Row>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={filteredSubmissions}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || 10,
              }));
            },
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <div style={{ marginBottom: '8px' }}>
                      {searchKeyword || selectedCourse || selectedStatus !== undefined || dateRange
                        ? '没有符合筛选条件的记录'
                        : '暂无提交记录'
                      }
                    </div>
                    <Text type="secondary">
                      {searchKeyword || selectedCourse || selectedStatus !== undefined || dateRange
                        ? '请尝试调整筛选条件'
                        : '您还没有提交过任何作业'
                      }
                    </Text>
                  </div>
                }
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default WorkHistory;
