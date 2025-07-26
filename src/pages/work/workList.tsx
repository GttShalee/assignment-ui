import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Card, 
  Tag, 
  message, 
  Modal,
  Descriptions,
  Badge,
  Typography,
  Form,
  Input,
  Upload,
  Alert,
  Tabs,
  Divider,
  Statistic
} from 'antd';
import { 
  UploadOutlined, 
  EyeOutlined, 
  RollbackOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { TextArea } = Input;
const { Countdown } = Statistic;

interface Assignment {
  id: string;
  name: string;
  deadline: string;
  requirements: string;
  status: 'pending' | 'submitted' | 'overdue';
  submitTime?: string;
  submittedFiles?: string[];
  remark?: string;
}

// 模拟数据 - 故意打乱顺序
const mockAssignments: Assignment[] = [
  {
    id: '3',
    name: '英语论文 - 人工智能伦理',
    deadline: dayjs().add(5, 'day').toISOString(),
    requirements: '撰写一篇关于人工智能伦理的英文论文，不少于2000字，引用至少5篇学术文献。',
    status: 'pending',
  },
  {
    id: '1',
    name: '数学作业 - 线性代数习题',
    deadline: dayjs().add(23, 'hour').add(59, 'minute').add(30, 'second').toISOString(), // 即将截止
    requirements: '完成教材第5章所有习题，要求手写并拍照上传，每题需有详细解题过程。',
    status: 'pending',
  },
  {
    id: '4',
    name: '物理实验报告 - 光的折射',
    deadline: dayjs().add(7, 'day').toISOString(),
    requirements: '根据实验数据完成实验报告，包括实验目的、步骤、数据分析和结论，需附上实验数据表格和图表。',
    status: 'pending',
  },
  {
    id: '2',
    name: '编程作业 - React电商网站',
    deadline: dayjs().add(3, 'day').toISOString(),
    requirements: '使用React和Ant Design实现一个简易电商网站，包含商品列表、购物车和结算功能。代码需上传至GitHub并提交仓库链接。',
    status: 'submitted',
    submitTime: dayjs().subtract(1, 'day').toISOString(),
    submittedFiles: ['项目文档.docx', '源代码.zip'],
    remark: '已上传项目文档和完整源代码'
  },
  {
    id: '5',
    name: '数据结构作业 - 二叉树遍历',
    deadline: dayjs().subtract(2, 'day').toISOString(), // 已逾期超过1天
    requirements: '实现二叉树的三种遍历算法（前序、中序、后序），并用C++编写测试代码。',
    status: 'overdue',
  },
  {
    id: '6',
    name: '化学实验 - 酸碱中和',
    deadline: dayjs().add(12, 'hour').toISOString(), // 24小时内
    requirements: '完成酸碱中和实验并记录实验数据，计算中和点。',
    status: 'pending',
  },
];

const WorkList: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [currentSubmittingId, setCurrentSubmittingId] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [form] = Form.useForm();
  const [now, setNow] = useState(dayjs());

  // 每秒更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 分类作业数据
  const categorizedAssignments = {
    // 正在进行中的作业（逾期1天以内，待提交的作业）
    ongoing: assignments.filter(assignment => 
      assignment.status === 'pending' && 
      now.isBefore(dayjs(assignment.deadline).add(1, 'day'))
    ),
    
    // 已提交作业
    submitted: assignments.filter(assignment => 
      assignment.status === 'submitted'
    ),
    
    // 未提交作业（逾期超过1天）
    overdue: assignments.filter(assignment => 
      assignment.status === 'pending' && 
      now.isAfter(dayjs(assignment.deadline).add(1, 'day'))
    )
  };

  // 模拟API获取数据并按截止时间排序
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 获取数据后按截止时间升序排序
      const sortedData = [...mockAssignments].sort((a, b) => 
        dayjs(a.deadline).unix() - dayjs(b.deadline).unix()
      );
      
      setAssignments(sortedData);
    } catch (error) {
      message.error('获取作业列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // 文件上传前检查
  const beforeUpload = (file: RcFile) => {
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error('文件大小不能超过20MB');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  // 打开提交模态框
  const openSubmitModal = (id: string) => {
    setCurrentSubmittingId(id);
    setSubmitModalVisible(true);
    form.resetFields();
    setFileList([]);
  };

  // 提交作业
  const handleSubmit = async (values: { remark: string }) => {
    if (!currentSubmittingId) return;
    
    try {
      setLoading(true);
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新状态并重新排序
      setAssignments(prev => {
        const updated = prev.map(item => 
          item.id === currentSubmittingId 
            ? { 
                ...item, 
                status: 'submitted', 
                submitTime: new Date().toISOString(),
                submittedFiles: fileList.map(file => file.name),
                remark: values.remark
              } 
            : item
        );
        return updated.sort((a, b) => dayjs(a.deadline).unix() - dayjs(b.deadline).unix());
      });
      
      message.success('作业提交成功');
      setSubmitModalVisible(false);
    } catch (error) {
      message.error('提交失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 查看作业详情
  const handleViewDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setModalVisible(true);
  };

  // 撤回作业
  const handleWithdraw = (id: string) => {
    confirm({
      title: '确认撤回作业?',
      icon: <ExclamationCircleOutlined />,
      content: '撤回后可以重新提交',
      onOk: async () => {
        try {
          // 模拟API调用延迟
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // 更新状态并重新排序
          setAssignments(prev => {
            const updated = prev.map(item => 
              item.id === id 
                ? { 
                    ...item, 
                    status: 'pending', 
                    submitTime: undefined,
                    submittedFiles: undefined,
                    remark: undefined
                  } 
                : item
            );
            return updated.sort((a, b) => dayjs(a.deadline).unix() - dayjs(b.deadline).unix());
          });
          
          message.success('作业已撤回');
        } catch (error) {
          message.error('撤回失败');
          console.error(error);
        }
      },
    });
  };

  // 格式化剩余时间显示
  const formatRemainingTime = (deadline: string) => {
    const deadlineTime = dayjs(deadline);
    const diff = deadlineTime.diff(now);
    
    if (diff <= 0) {
      return '已截止';
    }
    
    const duration = dayjs.duration(diff);
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    
    // 24小时内的显示精确到秒
    if (days === 0 && hours < 24) {
      return `${hours}小时 ${minutes}分 ${seconds}秒`;
    }
    
    // 超过24小时的显示天和小时
    return `${days}天 ${hours}小时`;
  };

  const columns: ColumnsType<Assignment> = [
    {
      title: '作业名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ color: '#666', fontSize: 12 }}>
            截止: {dayjs(record.deadline).format('YYYY-MM-DD HH:mm')}
            {now.isAfter(dayjs(record.deadline)) && (
              <Tag color="red" style={{ marginLeft: '8px' }}>已截止</Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => {
        const isOverdue = now.isAfter(dayjs(record.deadline));
        
        if (status === 'pending' && isOverdue) {
          return <Tag color="red">已逾期</Tag>;
        }
        
        let color = '';
        let text = '';
        switch (status) {
          case 'pending':
            color = 'orange';
            text = '待提交';
            break;
          case 'submitted':
            color = 'blue';
            text = '已提交';
            break;
          case 'overdue':
            color = 'red';
            text = '已逾期';
            break;
          default:
            color = 'gray';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '剩余时间',
      key: 'timeLeft',
      width: 180,
      render: (_, record) => {
        if (record.status !== 'pending') return '-';
        
        const deadline = dayjs(record.deadline);
        
        if (now.isAfter(deadline)) {
          return `逾期 ${deadline.fromNow(true)}`;
        }
        
        const diff = deadline.diff(now);
        const duration = dayjs.duration(diff);
        const days = duration.days();
        const hours = duration.hours();
        
        // 24小时内的显示精确到秒
        if (days === 0 && hours < 24) {
          return (
            <div style={{ color: '#faad14' }}>
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              {formatRemainingTime(record.deadline)}
            </div>
          );
        }
        
        // 超过24小时的显示天和小时
        return (
          <div style={{ color: '#52c41a' }}>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            {formatRemainingTime(record.deadline)}
          </div>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 350,
      render: (_, record) => {
        const isBeforeDeadline = now.isBefore(dayjs(record.deadline));
        const isOverdue = now.isAfter(dayjs(record.deadline));
        
        return (
          <Space>
            <Button 
              type="primary" 
              icon={<UploadOutlined />}
              onClick={() => openSubmitModal(record.id)}
              disabled={record.status !== 'pending' || (isOverdue && now.isAfter(dayjs(record.deadline).add(1, 'day')))}
            >
              提交
            </Button>
            
            <Button 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            >
              查看详情
            </Button>
            
            {record.status === 'submitted' && isBeforeDeadline && (
              <Button 
                danger 
                icon={<RollbackOutlined />}
                onClick={() => handleWithdraw(record.id)}
              >
                撤回
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="work-list-page" style={{ padding: '24px' }}>
      <Title level={3} style={{ marginBottom: '24px' }}>我的作业</Title>
      
      {/* 顶部分类导航栏 */}
      <Card 
        bordered={false} 
        style={{ marginBottom: '24px', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)' }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ marginBottom: 0 }}
          tabBarExtraContent={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ marginRight: '24px' }}>
                <Text type="secondary">总计:</Text> 
                <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>{assignments.length}</span>
              </div>
              <Divider type="vertical" style={{ height: '24px' }} />
              <div style={{ margin: '0 24px' }}>
                <Text type="secondary">待提交:</Text> 
                <span style={{ marginLeft: '8px', fontWeight: 'bold', color: '#fa8c16' }}>
                  {categorizedAssignments.ongoing.length + categorizedAssignments.overdue.length}
                </span>
              </div>
              <Divider type="vertical" style={{ height: '24px' }} />
              <div style={{ marginLeft: '24px' }}>
                <Text type="secondary">已提交:</Text> 
                <span style={{ marginLeft: '8px', fontWeight: 'bold', color: '#1890ff' }}>
                  {categorizedAssignments.submitted.length}
                </span>
              </div>
            </div>
          }
        >
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                正在进行 ({categorizedAssignments.ongoing.length})
              </span>
            }
            key="ongoing"
          >
            {categorizedAssignments.ongoing.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', color: '#666' }}>当前没有进行中的作业</div>
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={categorizedAssignments.ongoing}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
              />
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                <CheckCircleOutlined />
                已提交 ({categorizedAssignments.submitted.length})
              </span>
            }
            key="submitted"
          >
            {categorizedAssignments.submitted.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <WarningOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', color: '#666' }}>暂无已提交的作业</div>
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={categorizedAssignments.submitted}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
              />
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                <WarningOutlined />
                未提交 ({categorizedAssignments.overdue.length})
              </span>
            }
            key="overdue"
          >
            {categorizedAssignments.overdue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', color: '#666' }}>没有逾期未提交的作业</div>
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={categorizedAssignments.overdue}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
              />
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* 作业详情模态框 */}
      <Modal
        title={selectedAssignment?.name || '作业详情'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedAssignment && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="作业名称">
              {selectedAssignment.name}
            </Descriptions.Item>
            <Descriptions.Item label="截止时间">
              {dayjs(selectedAssignment.deadline).format('YYYY-MM-DD HH:mm')}
              {now.isAfter(dayjs(selectedAssignment.deadline)) && (
                <Tag color="red" style={{ marginLeft: '8px' }}>已截止</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="作业要求">
              <div style={{ whiteSpace: 'pre-wrap' }}>{selectedAssignment.requirements}</div>
            </Descriptions.Item>
            <Descriptions.Item label="提交状态">
              <Badge 
                status={selectedAssignment.status === 'submitted' ? 'success' : 'error'} 
                text={
                  selectedAssignment.status === 'submitted' 
                    ? `已提交 (${dayjs(selectedAssignment.submitTime).format('YYYY-MM-DD HH:mm')})`
                    : selectedAssignment.status === 'overdue'
                      ? '已逾期'
                      : '未提交'
                } 
              />
            </Descriptions.Item>
            {selectedAssignment.status === 'submitted' && (
              <>
                <Descriptions.Item label="提交文件">
                  {selectedAssignment.submittedFiles?.map(file => (
                    <div key={file} style={{ marginBottom: 8 }}>
                      <FileOutlined style={{ marginRight: 8 }} />
                      {file}
                    </div>
                  )) || '无'}
                </Descriptions.Item>
                <Descriptions.Item label="备注">
                  {selectedAssignment.remark || '无'}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 提交作业模态框 */}
      <Modal
        title="提交作业"
        visible={submitModalVisible}
        onCancel={() => setSubmitModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item label="上传作业文件" required>
            <Upload
              multiple
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={({ fileList }) => setFileList(fileList)}
              accept=".doc,.docx,.ppt,.pptx,.pdf,.zip,.rar,.xls,.xlsx,.txt"
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
            <Text type="secondary">支持Word、PPT、PDF等格式，单个文件不超过20MB</Text>
            {fileList.length > 0 && (
              <Alert
                message={`已选择 ${fileList.length} 个文件`}
                type="info"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </Form.Item>

          <Form.Item
            name="remark"
            label="备注"
            rules={[{ max: 500, message: '备注不能超过500字' }]}
          >
            <TextArea
              rows={4}
              placeholder="可在此添加作业说明或备注信息（可选）"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                disabled={fileList.length === 0}
              >
                确认提交
              </Button>
              <Button onClick={() => setSubmitModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkList;