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
  Statistic,
  DatePicker
} from 'antd';
import { 
  UploadOutlined, 
  EyeOutlined, 
  RollbackOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getHomeworkList, deleteHomework, updateHomework, submitHomework, uploadHomeworkFile, SubmitHomeworkFormData, getHomeworkSubmissions, downloadHomeworkSubmissions } from '@/services/homework';
import { getToken } from '@/services/auth';
import { useModel } from '@umijs/max';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { TextArea } = Input;
const { Countdown } = Statistic;

// 导入后端接口类型
import { Homework, HomeworkSubmissionResponse } from '@/services/homework';

const WorkList: React.FC = () => {
  const { userInfo } = useModel('global');
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [currentSubmittingId, setCurrentSubmittingId] = useState<number | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [form] = Form.useForm();
  const [now, setNow] = useState(dayjs());
  
  // 编辑相关状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);

  // 提交作业相关状态
  const [currentHomework, setCurrentHomework] = useState<Homework | null>(null);
  const [fileNameValidation, setFileNameValidation] = useState<{
    isValid: boolean;
    message: string;
    correctedFileName?: string;
  } | null>(null);

  // 查看提交作业相关状态
  const [submissionsModalVisible, setSubmissionsModalVisible] = useState(false);
  const [currentViewingHomework, setCurrentViewingHomework] = useState<Homework | null>(null);
  const [submissions, setSubmissions] = useState<HomeworkSubmissionResponse[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // 每秒更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 分类作业数据
  const categorizedHomeworks = {
    // 正在进行中的作业（状态为1且未截止，且用户未提交）
    ongoing: homeworks.filter(homework => 
      homework.status === 1 && 
      now.isBefore(dayjs(homework.deadline)) &&
      homework.submission_status !== 1
    ),
    
    // 已提交作业（用户已提交的作业）
    submitted: homeworks.filter(homework => 
      homework.submission_status === 1
    ),
    
    // 未提交作业（状态为1但已截止，且用户未提交）
    overdue: homeworks.filter(homework => 
      homework.status === 1 && 
      now.isAfter(dayjs(homework.deadline)) &&
      homework.submission_status !== 1
    ),
    
    // 已截止作业（状态为2或3，或者已超过截止时间但未超过3天）
    expired: homeworks.filter(homework => 
      (homework.status === 2 || 
       homework.status === 3 || 
       now.isAfter(dayjs(homework.deadline))) &&
      now.isBefore(dayjs(homework.deadline).add(3, 'day'))
    ),
    
    // 归档作业（超过截止时间3天）
    archived: homeworks.filter(homework => 
      now.isAfter(dayjs(homework.deadline).add(3, 'day'))
    )
  };

  // 调试信息：打印分类结果
  console.log('分类结果:', {
    ongoing: categorizedHomeworks.ongoing.map(hw => ({ id: hw.id, title: hw.title, submission_status: hw.submission_status })),
    submitted: categorizedHomeworks.submitted.map(hw => ({ id: hw.id, title: hw.title, submission_status: hw.submission_status })),
    overdue: categorizedHomeworks.overdue.map(hw => ({ id: hw.id, title: hw.title, submission_status: hw.submission_status })),
    expired: categorizedHomeworks.expired.map(hw => ({ id: hw.id, title: hw.title, status: hw.status, deadline: hw.deadline })),
    archived: categorizedHomeworks.archived.map(hw => ({ id: hw.id, title: hw.title, status: hw.status, deadline: hw.deadline }))
  });

  // 获取作业列表
  const fetchHomeworks = async () => {
    setLoading(true);
    try {
      const response = await getHomeworkList();
      const homeworksList = response.content || [];
      
      // 调试信息：打印每个作业的提交状态
      console.log('作业列表数据:', homeworksList.map(hw => ({
        id: hw.id,
        title: hw.title,
        status: hw.status,
        submission_status: hw.submission_status,
        submission_status_type: typeof hw.submission_status,
        deadline: hw.deadline
      })));
      
      setHomeworks(homeworksList);
    } catch (error) {
      message.error('获取作业列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeworks();
  }, []);

  // 文件命名验证和转换
  const validateAndTransformFileName = (fileName: string, homework: Homework, userInfo: any) => {
    if (!homework.file_name || !userInfo) {
      return {
        isValid: false,
        message: '无法获取作业命名格式或用户信息',
      };
    }

    // 获取作业要求的命名格式
    const requiredFormat = homework.file_name;
    
    // 班级代码映射
    const classCodeMap: { [key: string]: string } = {
      '1234': '计科23-1',
      '2005': '计科23-2', 
      '1111': '计科23-3',
      '8888': '计科智能'
    };
    
    // 替换格式中的变量
    let expectedFileName = requiredFormat
      .replace(/【学号】/g, userInfo.studentId || '')
      .replace(/【班级】/g, classCodeMap[userInfo.classCode] || userInfo.classCode || '')
      .replace(/【姓名】/g, userInfo.realName || '');
    
    // 在变量之间添加分隔符
    // 先处理变量之间的分隔符
    expectedFileName = expectedFileName
      .replace(/(【学号】|【班级】|【姓名】)(【学号】|【班级】|【姓名】)/g, '$1-$2')
      .replace(/([^-\s])(【学号】|【班级】|【姓名】)/g, '$1-$2')
      .replace(/(【学号】|【班级】|【姓名】)([^-\s])/g, '$1-$2')
      // 清理多余的分隔符
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');

    // 移除文件扩展名进行比较
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const expectedFileNameWithoutExt = expectedFileName.replace(/\.[^/.]+$/, '');

    // 检查文件名是否匹配
    const isExactMatch = fileNameWithoutExt === expectedFileNameWithoutExt;
    
    if (isExactMatch) {
      return {
        isValid: true,
        message: '文件名格式正确',
        correctedFileName: fileName,
      };
    } else {
      // 获取文件扩展名
      const fileExtension = fileName.match(/\.[^/.]+$/)?.[0] || '';
      const correctedFileName = expectedFileName + fileExtension;
      
      return {
        isValid: false,
        message: `注意：你提交的作业不符合命名格式`,
        correctedFileName,
      };
    }
  };

  // 文件上传前检查
  const beforeUpload = (file: RcFile) => {
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error('文件大小不能超过20MB');
      return Upload.LIST_IGNORE;
    }

    // 如果当前有选中的作业，验证文件名
    if (currentHomework && userInfo) {
      const validation = validateAndTransformFileName(file.name, currentHomework, userInfo);
      setFileNameValidation(validation);
      
      // if (!validation.isValid) {
      //   message.warning(`文件名格式不正确，建议使用：${validation.correctedFileName}`);
      // }
    }

    // 返回 false 阻止自动上传，但允许文件添加到列表中
    return false;
  };

  // 打开提交模态框
  const openSubmitModal = (id: number) => {
    setCurrentSubmittingId(id);
    // 找到对应的作业信息
    const homework = homeworks.find(h => h.id === id);
    setCurrentHomework(homework || null);
    setSubmitModalVisible(true);
    form.resetFields();
    setFileList([]);
    setFileNameValidation(null);
  };

  // 提交作业
  const handleSubmit = async (values: { remark: string }) => {
    if (!currentSubmittingId || !currentHomework || !userInfo || fileList.length === 0) {
      message.error('提交信息不完整');
      return;
    }

    try {
      setLoading(true);
      
      // 获取上传的文件
      const file = fileList[0].originFileObj as File;
      if (!file) {
        message.error('请选择要提交的文件');
        return;
      }

      // 验证文件名格式
      const validation = validateAndTransformFileName(file.name, currentHomework, userInfo);
      
      // 直接提交作业（包含文件上传）
      const submitData: SubmitHomeworkFormData = {
        homework_id: currentSubmittingId,
        file: file,
        remarks: values.remark || undefined,
      };

      await submitHomework(submitData);

      // 根据文件名格式是否正确显示不同的提示信息
      if (validation.isValid) {
        message.success('谢谢你认真提交了作业');
      } else {
        message.success('成功提交作业');
      }

      setSubmitModalVisible(false);
      setFileList([]);
      setFileNameValidation(null);
      
      // 重新获取作业列表
      fetchHomeworks();
    } catch (error: any) {
      if (error.message?.includes('重复提交')) {
        message.error('您已经提交过该作业，不能重复提交');
      } else {
        message.error('提交失败，请稍后重试');
      }
      console.error('提交作业失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 查看作业详情
  const handleViewDetails = (homework: Homework) => {
    setSelectedHomework(homework);
    setModalVisible(true);
  };

  // 撤回作业
  const handleWithdraw = (id: number) => {
    confirm({
      title: '确认撤回作业?',
      icon: <ExclamationCircleOutlined />,
      content: '撤回后可以重新提交',
      onOk: async () => {
        try {
          // TODO: 调用撤回作业的API
          // await withdrawHomework(id);
          
          message.success('作业已撤回');
          fetchHomeworks();
        } catch (error) {
          message.error('撤回失败');
          console.error(error);
        }
      },
    });
  };

  // 检查是否有删除权限
  const canDeleteHomework = (homework: Homework) => {
    if (!userInfo) return false;
    
    // 管理员可以删除所有作业
    if (userInfo.roleType === 0) return true;
    
    // 学委只能删除本班级的作业
    if (userInfo.roleType === 2) {
      return homework.class_code === userInfo.classCode;
    }
    
    return false;
  };

  // 检查是否有编辑权限
  const canEditHomework = (homework: Homework) => {
    if (!userInfo) return false;
    
    // 管理员可以编辑所有作业
    if (userInfo.roleType === 0) return true;
    
    // 学委只能编辑本班级的作业
    if (userInfo.roleType === 2) {
      return homework.class_code === userInfo.classCode;
    }
    
    return false;
  };

  // 查看作业提交
  const handleViewSubmissions = async (homework: Homework) => {
    setCurrentViewingHomework(homework);
    setSubmissionsModalVisible(true);
    setSubmissionsLoading(true);
    
    try {
      const response = await getHomeworkSubmissions(homework.id);
      console.log('作业提交列表响应:', response);
      console.log('提交数据:', response.content);
      
      // 处理可能的字段名映射问题
      const processedSubmissions = (response.content || []).map(submission => {
        const anySubmission = submission as any; // 使用类型断言处理可能的字段名差异
        return {
          ...submission,
          // 处理可能的字段名差异
          studentId: submission.studentId || anySubmission.student_id,
          studentName: submission.studentName || anySubmission.student_name || anySubmission.realName || anySubmission.real_name,
          classCode: submission.classCode || anySubmission.class_code,
          submissionTime: submission.submissionTime || anySubmission.submission_time,
          submissionFileName: submission.submissionFileName || anySubmission.submission_file_name,
          submissionFileUrl: submission.submissionFileUrl || anySubmission.submission_file_url,
          submissionStatus: submission.submissionStatus || anySubmission.submission_status,
        };
      });
      
      console.log('处理后的提交数据:', processedSubmissions);
      setSubmissions(processedSubmissions);
    } catch (error) {
      message.error('获取作业提交列表失败');
      console.error('获取作业提交列表错误:', error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // 下载作业提交包
  const handleDownloadSubmissions = async (homeworkId: number) => {
    try {
      setSubmissionsLoading(true);
      const blob = await downloadHomeworkSubmissions(homeworkId);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `作业提交_${currentViewingHomework?.title || 'unknown'}.zip`;
      link.style.display = 'none';
      
      // 添加到DOM并触发点击
      document.body.appendChild(link);
      link.click();
      
      // 清理DOM和URL对象
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('开始下载作业提交包');
    } catch (error) {
      message.error('下载失败，请稍后重试');
      console.error('下载作业提交包失败:', error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // 下载附件
  const handleDownloadAttachment = async (attachmentUrl: string) => {
    if (!attachmentUrl) {
      message.error('附件链接不存在');
      return;
    }

    try {
      // 构建完整的下载链接
      const downloadUrl = `http://localhost:8888${attachmentUrl}`;
      
      // 从URL中提取文件名
      const fileName = attachmentUrl.split('/').pop() || 'attachment';
      
      // 使用fetch获取文件内容
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`, // 使用JWT令牌
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 获取文件内容作为Blob
      const blob = await response.blob();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      // 添加到DOM并触发点击
      document.body.appendChild(link);
      link.click();
      
      // 清理DOM和URL对象
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('开始下载附件');
    } catch (error) {
      message.error('下载失败，请稍后重试');
      console.error('下载附件失败:', error);
    }
  };

  // 删除作业
  const handleDeleteHomework = (homework: Homework) => {
    if (!canDeleteHomework(homework)) {
      message.error('您没有权限删除此作业');
      return;
    }

    confirm({
      title: '确认删除作业?',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除作业"${homework.title}"吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          setLoading(true);
          await deleteHomework(homework.id);
          message.success('作业删除成功');
          fetchHomeworks();
        } catch (error) {
          message.error('删除失败');
          console.error(error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 打开编辑模态框
  const openEditModal = (homework: Homework) => {
    if (!canEditHomework(homework)) {
      message.error('您没有权限编辑此作业');
      return;
    }

    setEditingHomework(homework);
    setEditModalVisible(true);
    editForm.setFieldsValue({
      title: homework.title,
      description: homework.description,
      deadline: dayjs(homework.deadline),
      file_name: homework.file_name,
    });
  };

  // 提交编辑
  const handleEditSubmit = async (values: {
    title: string;
    description: string;
    deadline: dayjs.Dayjs;
    file_name: string;
  }) => {
    if (!editingHomework) return;

    try {
      setEditLoading(true);
      
      const updateData = {
        title: values.title,
        description: values.description,
        deadline: values.deadline.format('YYYY-MM-DD HH:mm:ss'),
        file_name: values.file_name,
      };

      await updateHomework(editingHomework.id, updateData);
      message.success('作业更新成功');
      setEditModalVisible(false);
      fetchHomeworks();
    } catch (error) {
      message.error('更新失败');
      console.error(error);
    } finally {
      setEditLoading(false);
    }
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

  // 格式化归档时间显示
  const formatArchivedTime = (deadline: string) => {
    const deadlineTime = dayjs(deadline);
    const archivedTime = deadlineTime.add(3, 'day');
    const diff = now.diff(archivedTime);
    
    if (diff <= 0) {
      return '未归档';
    }
    
    const duration = dayjs.duration(diff);
    const days = duration.days();
    const months = duration.months();
    const years = duration.years();
    
    if (years > 0) {
      return `归档 ${years}年${months}个月${days}天`;
    } else if (months > 0) {
      return `归档 ${months}个月${days}天`;
    } else {
      return `归档 ${days}天`;
    }
  };

  // 获取状态标签
  const getStatusTag = (status: number, deadline: string) => {
    const isOverdue = now.isAfter(dayjs(deadline));
    const isArchived = now.isAfter(dayjs(deadline).add(3, 'day'));
    
    if (isArchived) {
      return <Tag color="gray">已归档</Tag>;
    }
    
    if (status === 1 && isOverdue) {
      return <Tag color="red">已逾期</Tag>;
    }
    
    switch (status) {
      case 1:
        return <Tag color="orange">进行中</Tag>;
      case 2:
        return <Tag color="blue">已截止</Tag>;
      case 3:
        return <Tag color="green">已批改</Tag>;
      default:
        return <Tag color="gray">未知</Tag>;
    }
  };

  const columns: ColumnsType<Homework> = [
    {
      title: '作业标题',
      dataIndex: 'title',
      key: 'title',
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
      title: '命名格式',
      dataIndex: 'file_name',
      key: 'file_name',
      render: (text, record) => (
        <div>
          <Tag color="red">{record.file_name}</Tag>
        </div>
      ),
    },
    {
      title: '详细信息',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <div>
          <div style={{ color: '#666', fontSize: 18 }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => getStatusTag(status, record.deadline),
    },
    {
      title: '提交状态',
      key: 'submissionStatus',
      width: 120,
      render: (_, record) => {
        if (record.submission_status === 1) {
          return <Tag color="green">已提交</Tag>;
        } else {
          return <Tag color="red">未提交</Tag>;
        }
      },
    },
    {
      title: '剩余时间',
      key: 'timeLeft',
      width: 180,
      render: (_, record) => {
        const deadline = dayjs(record.deadline);
        const isArchived = now.isAfter(deadline.add(3, 'day'));
        
        // 如果是归档的作业，显示归档时间
        if (isArchived) {
          return (
            <div style={{ color: '#8c8c8c' }}>
              <FileOutlined style={{ marginRight: 8 }} />
              {formatArchivedTime(record.deadline)}
            </div>
          );
        }
        
        // 如果作业已截止但未归档
        if (now.isAfter(deadline)) {
          return (
            <div style={{ color: '#ff4d4f' }}>
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              逾期 {deadline.fromNow(true)}
            </div>
          );
        }
        
        // 如果作业还在进行中
        if (record.status === 1) {
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
        }
        
        return '-';
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 400,
      render: (_, record) => {
        const isBeforeDeadline = now.isBefore(dayjs(record.deadline));
        const isOverdue = now.isAfter(dayjs(record.deadline));
        
        return (
          <Space>
                         <Button 
               type="primary" 
               icon={<UploadOutlined />}
               onClick={() => openSubmitModal(record.id)}
               disabled={
                 record.status !== 1 || 
                 record.submission_status === 1 || 
                 (isOverdue && now.isAfter(dayjs(record.deadline).add(1, 'day')))
               }
             >
               {record.submission_status === 1 ? '已提交' : '提交'}
             </Button>
            
            <Button 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            >
              查看详情
            </Button>
            
            {/* 下载附件按钮 - 当有附件时显示 */}
            {record.attachment_url && (
              <Button 
                type="default"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadAttachment(record.attachment_url!)}
                title="下载学委上传的附件"
              >
                下载附件
              </Button>
            )}
            
                         {record.submission_status === 1 && (
               <Button 
                 danger 
                 icon={<RollbackOutlined />}
                 onClick={() => handleWithdraw(record.id)}
               >
                 撤回
               </Button>
             )}
            
            {/* 编辑按钮 - 只有管理员或学委可以看到 */}
            {(userInfo?.roleType === 0 || userInfo?.roleType === 2) && (
              <Button 
                type="primary"
                ghost
                icon={<EditOutlined />}
                onClick={() => openEditModal(record)}
                disabled={!canEditHomework(record)}
                title={canEditHomework(record) ? '编辑作业' : '无权限编辑此作业'}
              >
                编辑
              </Button>
            )}
            
            {/* 删除按钮 - 只有管理员或学委可以看到 */}
            {(userInfo?.roleType === 0 || userInfo?.roleType === 2) && (
              <Button 
                danger 
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteHomework(record)}
                disabled={!canDeleteHomework(record)}
                title={canDeleteHomework(record) ? '删除作业' : '无权限删除此作业'}
              >
                删除
              </Button>
            )}
            
            {/* 查看提交作业按钮 - 只有管理员或学委可以看到，且作业已截止但未归档 */}
            {(userInfo?.roleType === 0 || userInfo?.roleType === 2) && 
             (record.status === 2 || record.status === 3 || now.isAfter(dayjs(record.deadline))) &&
             now.isBefore(dayjs(record.deadline).add(3, 'day')) && (
              <Button 
                type="default"
                icon={<EyeOutlined />}
                onClick={() => handleViewSubmissions(record)}
                title="查看学生提交的作业"
              >
                查看提交
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
              <div style={{ marginRight: '0px' }}>
                <Text type="secondary">总计:</Text> 
                <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>{homeworks.length}</span>
              </div>
              <Divider type="vertical" style={{ height: '24px' }} />
              <div style={{ margin: '0 0px' }}>
                <Text type="secondary">待提交:</Text> 
                <span style={{ marginLeft: '8px', fontWeight: 'bold', color: '#fa8c16' }}>
                  {categorizedHomeworks.ongoing.length + categorizedHomeworks.overdue.length}
                </span>
              </div>
              <Divider type="vertical" style={{ height: '24px' }} />
              <div style={{ margin: '0 0px' }}>
                <Text type="secondary">已提交:</Text> 
                <span style={{ marginLeft: '8px', fontWeight: 'bold', color: '#1890ff' }}>
                  {categorizedHomeworks.submitted.length}
                </span>
              </div>
              {/* 只有学委和管理员显示已截止和归档统计 */}
              {(userInfo?.roleType === 0 || userInfo?.roleType === 2) && (
                <>
                  <Divider type="vertical" style={{ height: '24px' }} />
                  <div style={{ margin: '0 0px' }}>
                    <Text type="secondary">已截止:</Text> 
                    <span style={{ marginLeft: '8px', fontWeight: 'bold', color: '#ff4d4f' }}>
                      {categorizedHomeworks.expired.length}
                    </span>
                  </div>
                  <Divider type="vertical" style={{ height: '24px' }} />
                  <div style={{ marginLeft: '0px' }}>
                    <Text type="secondary">归档:</Text> 
                    <span style={{ marginLeft: '8px', fontWeight: 'bold', color: '#8c8c8c' }}>
                      {categorizedHomeworks.archived.length}
                    </span>
                  </div>
                </>
              )}
            </div>
          }
        >
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                正在进行 ({categorizedHomeworks.ongoing.length})
              </span>
            }
            key="ongoing"
          >
            {categorizedHomeworks.ongoing.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', color: '#666' }}>当前没有进行中的作业</div>
              </div>
            ) : (
                             <Table
                 columns={columns}
                 dataSource={categorizedHomeworks.ongoing}
                 rowKey="id"
                 loading={loading}
                 pagination={{ pageSize: 10 }}
                 scroll={{ x: 1200 }}
               />
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                <CheckCircleOutlined />
                已提交 ({categorizedHomeworks.submitted.length})
              </span>
            }
            key="submitted"
          >
            {categorizedHomeworks.submitted.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <WarningOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', color: '#666' }}>暂无已提交的作业</div>
              </div>
            ) : (
                             <Table
                 columns={columns}
                 dataSource={categorizedHomeworks.submitted}
                 rowKey="id"
                 loading={loading}
                 pagination={{ pageSize: 10 }}
                 scroll={{ x: 1200 }}
               />
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                <WarningOutlined />
                未提交 ({categorizedHomeworks.overdue.length})
              </span>
            }
            key="overdue"
          >
            {categorizedHomeworks.overdue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', color: '#666' }}>没有逾期未提交的作业</div>
              </div>
            ) : (
                             <Table
                 columns={columns}
                 dataSource={categorizedHomeworks.overdue}
                 rowKey="id"
                 loading={loading}
                 pagination={{ pageSize: 10 }}
                 scroll={{ x: 1200 }}
               />
            )}
          </TabPane>

          {/* 已截止作业Tab - 只有学委和管理员可以看到 */}
          {(userInfo?.roleType === 0 || userInfo?.roleType === 2) && (
            <TabPane
              tab={
                <span>
                  <ClockCircleOutlined />
                  已截止 ({categorizedHomeworks.expired.length})
                </span>
              }
              key="expired"
            >
              {categorizedHomeworks.expired.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                  <div style={{ fontSize: '16px', color: '#666' }}>没有已截止的作业</div>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={categorizedHomeworks.expired}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                />
              )}
            </TabPane>
          )}

          {/* 归档作业Tab - 只有学委和管理员可以看到 */}
          {(userInfo?.roleType === 0 || userInfo?.roleType === 2) && (
            <TabPane
              tab={
                <span>
                  <FileOutlined />
                  归档 ({categorizedHomeworks.archived.length})
                </span>
              }
              key="archived"
            >
              {categorizedHomeworks.archived.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                  <div style={{ fontSize: '16px', color: '#666' }}>没有归档的作业</div>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={categorizedHomeworks.archived}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                />
              )}
            </TabPane>
          )}
        </Tabs>
      </Card>

      {/* 作业详情模态框 */}
      <Modal
        title={selectedHomework?.title || '作业详情'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedHomework && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="作业标题">
              {selectedHomework.title}
            </Descriptions.Item>
            <Descriptions.Item label="班级">
              {selectedHomework.class_code}
            </Descriptions.Item>
            <Descriptions.Item label="发布时间">
              {dayjs(selectedHomework.publish_time).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="截止时间">
              {dayjs(selectedHomework.deadline).format('YYYY-MM-DD HH:mm')}
              {now.isAfter(dayjs(selectedHomework.deadline)) && (
                <Tag color="red" style={{ marginLeft: '8px' }}>已截止</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="作业描述">
              <div style={{ whiteSpace: 'pre-wrap' }}>{selectedHomework.description}</div>
            </Descriptions.Item>
            <Descriptions.Item label="总分">
              {selectedHomework.total_score} 分
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge 
                status={
                  selectedHomework.status === 1 ? 'processing' : 
                  selectedHomework.status === 2 ? 'warning' : 
                  selectedHomework.status === 3 ? 'success' : 'default'
                } 
                text={
                  selectedHomework.status === 1 ? '进行中' :
                  selectedHomework.status === 2 ? '已截止' :
                  selectedHomework.status === 3 ? '已批改' : '未知'
                } 
              />
            </Descriptions.Item>
            {selectedHomework.attachment_url && (
              <Descriptions.Item label="附件">
                <div>
                  <FileOutlined style={{ marginRight: 8 }} />
                  <span style={{ color: '#666' }}>
                    学委已上传附件，可在操作栏中点击"下载附件"按钮进行下载
                  </span>
                </div>
              </Descriptions.Item>
            )}
            {selectedHomework.file_name && (
              <Descriptions.Item label="文件命名格式">
                {selectedHomework.file_name}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 编辑作业模态框 */}
      <Modal
        title="编辑作业"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="title"
            label="作业标题"
            rules={[
              { required: true, message: '请输入作业标题' },
              { max: 255, message: '标题不能超过255个字符' }
            ]}
          >
            <Input placeholder="请输入作业标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="作业描述"
            rules={[
              { required: true, message: '请输入作业描述' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述作业要求、提交方式、评分标准等..."
              showCount
              maxLength={2000}
            />
          </Form.Item>

          <Form.Item
            name="deadline"
            label="截止时间"
            rules={[
              { required: true, message: '请选择截止时间' }
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择截止时间"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="file_name"
            label="文件命名格式"
            rules={[
              { required: true, message: '请输入文件命名格式' },
              {
                pattern: /【学号】|【班级】|【姓名】/,
                message: '命名格式中必须包含【学号】【班级】【姓名】中的至少一个',
              },
            ]}
          >
            <Input
              placeholder="如：【学号】【班级】【姓名】计算机网络实验一"
              maxLength={255}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={editLoading}
              >
                确认更新
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
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
               multiple={false}
               fileList={fileList}
               beforeUpload={beforeUpload}
               onChange={({ fileList }) => setFileList(fileList)}
               accept=".doc,.docx,.ppt,.pptx,.pdf,.zip,.rar,.xls,.xlsx,.txt"
               customRequest={({ file, onSuccess }) => {
                 // 自定义上传逻辑，不立即上传，只是将文件添加到列表中
                 if (onSuccess) {
                   onSuccess('ok');
                 }
               }}
             >
               <Button icon={<UploadOutlined />}>选择文件</Button>
             </Upload>
             <Text type="secondary">支持Word、PPT、PDF等格式，单个文件不超过20MB。文件将在点击"确认提交"时上传。</Text>
            
            {/* 显示文件名验证结果 */}
            {fileNameValidation && (
              <Alert
                message={fileNameValidation.message}
                type={fileNameValidation.isValid ? 'success' : 'warning'}
                showIcon
                style={{ marginTop: 8 }}
                description={
                  !fileNameValidation.isValid && fileNameValidation.correctedFileName && (
                    <div>
                      <div>系统已经自动帮你修改为正确格式：<br></br> <strong>{fileNameValidation.correctedFileName}</strong></div>
                    </div>
                  )
                }
              />
            )}
            
            {fileList.length > 0 && !fileNameValidation && (
              <Alert
                message={`已选择文件：${fileList[0].name}`}
                type="info"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </Form.Item>

          <Form.Item
            name="remark"
            label="备注"
            rules={[{ max: 100, message: '备注不能超过500字' }]}
          >
            <TextArea
              rows={1}
              placeholder="可在此添加作业说明或备注信息（可选）"
              maxLength={100}
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

      {/* 查看作业提交模态框 */}
      <Modal
        title={`查看作业提交 - ${currentViewingHomework?.title || ''}`}
        visible={submissionsModalVisible}
        onCancel={() => setSubmissionsModalVisible(false)}
        footer={[
          <Button key="debug" onClick={() => {
            console.log('当前提交数据:', submissions);
            console.log('当前查看的作业:', currentViewingHomework);
          }}>
            调试数据
          </Button>,
          <Button key="download" type="primary" onClick={() => handleDownloadSubmissions(currentViewingHomework?.id || 0)} loading={submissionsLoading}>
            打包下载
          </Button>,
          <Button key="close" onClick={() => setSubmissionsModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={1000}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Text strong>作业标题：</Text>
            <Text>{currentViewingHomework?.title}</Text>
            <Divider type="vertical" />
            <Text strong>截止时间：</Text>
            <Text>{currentViewingHomework?.deadline ? dayjs(currentViewingHomework.deadline).format('YYYY-MM-DD HH:mm') : '-'}</Text>
            <Divider type="vertical" />
            <Text strong>提交数量：</Text>
            <Text type="success">{submissions.length} 份</Text>
          </Space>
        </div>
        
        <Table
          columns={[
            {
              title: '学号',
              dataIndex: 'studentId',
              key: 'studentId',
              width: 130,
              render: (text, record) => {
                console.log('渲染学号:', text, record);
                return text || '未知';
              },
            },
            {
              title: '姓名',
              dataIndex: 'studentName',
              key: 'studentName',
              width: 100,
              render: (text, record) => {
                console.log('渲染姓名:', text, record);
                return text || '未知';
              },
            },
            {
              title: '班级',
              dataIndex: 'classCode',
              key: 'classCode',
              width: 120,
              render: (text, record) => {
                console.log('渲染班级:', text, record);
                return text || '未知';
              },
            },
            {
              title: '提交时间',
              dataIndex: 'submissionTime',
              key: 'submissionTime',
              width: 180,
              render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
            },
            {
              title: '文件名',
              dataIndex: 'submissionFileName',
              key: 'submissionFileName',
              ellipsis: true,
              render: (text, record) => {
                console.log('渲染文件名:', text, record);
                return text || '未知文件';
              },
            },
            {
              title: '提交状态',
              dataIndex: 'submissionStatus',
              key: 'submissionStatus',
              width: 100,
              render: (status) => (
                <Tag color={status === 0 ? 'green' : 'orange'}>
                  {status === 0 ? '按时提交' : '补交'}
                </Tag>
              ),
            },
            {
              title: '备注',
              dataIndex: 'remarks',
              key: 'remarks',
              ellipsis: true,
              render: (text) => text || '-',
            },
            {
              title: '操作',
              key: 'action',
              width: 120,
              render: (_, record) => (
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleDownloadAttachment(record.submissionFileUrl)}
                >
                  下载
                </Button>
              ),
            },
          ]}
          dataSource={submissions}
          rowKey="id"
          loading={submissionsLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Modal>
    </div>
  );
};

export default WorkList;