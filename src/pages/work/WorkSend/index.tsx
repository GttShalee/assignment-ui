import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  DatePicker, 
  InputNumber, 
  Button, 
  Upload, 
  message, 
  Alert,
  Select,
  Space,
  Divider,
  Typography,
  Row,
  Col
} from 'antd';
import { 
  UploadOutlined, 
  SaveOutlined, 
  ClearOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import dayjs from 'dayjs';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { publishHomework, getClassList, uploadFile, CreateHomeworkRequest, ClassResponse } from '@/services/homework';
import { getCourseSelectOptions, getCourseLabel } from '@/constants/course';

const { TextArea } = Input;
const { Title, Text } = Typography;
import { history } from '@umijs/max';

interface HomeworkFormData {
  class_code: string;
  course_name: string;
  title: string;
  description: string;
  attachment_url?: string;
  publish_time: dayjs.Dayjs;
  deadline: dayjs.Dayjs;
  total_score: number;
  status: number;
}

const WorkSend: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [classOptions, setClassOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const { userInfo } = useModel('global');
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<any>(null);

  // 获取班级列表
  useEffect(() => {
    fetchClassList();
  }, []);

  const fetchClassList = async () => {
    try {
      const classes: any[] = await getClassList();
      console.log('获取到的班级数据:', classes);
      
      let options = classes.map(cls => {
        console.log('处理班级:', cls);
        
        // 支持多种字段名格式
        const className = cls.className || cls.class_name || cls.name || '未知班级';
        const classCode = cls.classCode || cls.class_code || cls.code || '';
        
        return {
          label: className,
          value: classCode
        };
      });

      // 只允许学委选择自己班级
      if (userInfo?.roleType === 2 && userInfo.classCode) {
        options = options.filter(opt => opt.value === userInfo.classCode);
      }
      
      console.log('生成的选项:', options);
      setClassOptions(options);
    } catch (error) {
      console.error('获取班级列表失败:', error);
      message.error('获取班级列表失败，请刷新页面重试');
    }
  };

  // 文件上传配置
  const uploadProps: UploadProps = {
    fileList,
    beforeUpload: async (file) => {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过10MB!');
        return false;
      }

      // 上传文件
      setUploading(true);
      try {
        const result = await uploadFile(file);
        message.success(`${file.name} 上传成功`);
        
        // 更新文件列表
        const newFileList = [...fileList];
        const fileIndex = newFileList.findIndex(f => f.uid === file.uid);
        if (fileIndex > -1) {
          newFileList[fileIndex] = {
            ...newFileList[fileIndex],
            status: 'done',
            url: result.url,
          };
        }
        setFileList(newFileList);
        
        // 设置表单中的附件URL
        form.setFieldsValue({ attachment_url: result.url });
      } catch (error) {
        message.error(`${file.name} 上传失败`);
        console.error('文件上传失败:', error);
      } finally {
        setUploading(false);
      }
      
      return false; // 阻止自动上传
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
      
      // 清空表单中的附件URL
      if (newFileList.length === 0) {
        form.setFieldsValue({ attachment_url: undefined });
      }
    },
  };

  // 提交表单
  const handleSubmit = async (values: HomeworkFormData & { file_name: string }) => {
    setLoading(true);
    try {
      // 处理时间格式
      const formData: CreateHomeworkRequest & { file_name: string } = {
        class_code: values.class_code,
        course_name: values.course_name,
        title: values.title,
        description: values.description,
        attachment_url: values.attachment_url,
        publish_time: values.publish_time.format('YYYY-MM-DD HH:mm:ss'),
        deadline: values.deadline.format('YYYY-MM-DD HH:mm:ss'),
        total_score: values.total_score,
        status: 1, // 默认状态为进行中
        file_name: values.file_name,
      };

      console.log('提交的作业数据:', formData);
      
      // 调用后端API发布作业
      const response = await publishHomework(formData);
      
      message.success('作业发布成功！');
      form.resetFields();
      setFileList([]);
      
      history.push('/work/WorkList');
      
    } catch (error: any) {
      console.error('发布作业失败:', error);
      const errorMsg = error?.response?.data?.message || '发布失败，请重试';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 清空表单
  const handleClear = () => {
    form.resetFields();
    setFileList([]);
    message.info('表单已清空');
  };

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1600px', 
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      <Title level={3} style={{ marginBottom: '24px', textAlign: 'center' }}>
        <BookOutlined style={{ marginRight: '8px' }} />
        发布作业
      </Title>

      {/* 主要内容卡片 */}
      <Card 
        style={{ 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0'
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 1,
            total_score: 100,
            publish_time: dayjs(), // 默认发布时间为当前时间
          }}
        >
          {/* 基本信息 */}
          <div style={{ marginBottom: '32px' }}>
            <Title level={4} style={{ marginBottom: '24px' }}>
              <FileTextOutlined style={{ marginRight: '8px' }} />
              基本信息
            </Title>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="class_code"
                  label="选择班级"
                  rules={[{ required: true, message: '请选择班级' }]}
                >
                  <Select
                    placeholder="请选择要发布作业的班级"
                    options={classOptions}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    loading={classOptions.length === 0}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="course_name"
                  label="课程名称"
                  rules={[
                    { required: true, message: '请选择课程名称' }
                  ]}
                >
                  <Select
                    placeholder="请选择课程名称"
                    options={getCourseSelectOptions()}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="total_score"
                  label="作业总分"
                  rules={[
                    { required: true, message: '请输入作业总分' },
                    { type: 'number', min: 1, max: 1000, message: '总分必须在1-1000之间' }
                  ]}
                >
                  <InputNumber 
                    min={1} 
                    max={1000} 
                    placeholder="请输入作业总分"
                    style={{ width: '100%' }}
                    addonAfter="分"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                {/* 预留位置，可以后续添加其他字段 */}
              </Col>
            </Row>

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
                rows={3} 
                placeholder="请详细描述作业要求、提交方式、评分标准等..."
                showCount
                maxLength={200}
              />
            </Form.Item>
          </div>

          {/* 时间设置 */}
          <div style={{ marginBottom: '32px' }}>
            <Title level={4} style={{ marginBottom: '24px' }}>
              <ClockCircleOutlined style={{ marginRight: '8px' }} />
              时间设置
            </Title>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="publish_time"
                  label="发布时间"
                  rules={[{ required: true, message: '请选择发布时间' }]}
                >
                  <DatePicker 
                    showTime 
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="选择发布时间"
                    style={{ width: '100%' }}
                    disabled // 禁用发布时间选择，默认为当前时间
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="deadline"
                  label="截止时间"
                  rules={[
                    { required: true, message: '请选择截止时间' },
                    ({ getFieldValue }: any) => ({
                      validator(_: any, value: any) {
                        const publishTime = getFieldValue('publish_time');
                        if (!value || !publishTime || value.isAfter(publishTime)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('截止时间必须晚于发布时间'));
                      },
                    }),
                  ]}
                >
                  <DatePicker 
                    showTime 
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="选择截止时间"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* 附件上传 */}
          <div style={{ marginBottom: '32px' }}>
            <Title level={4} style={{ marginBottom: '24px' }}>
              <UploadOutlined style={{ marginRight: '8px' }} />
              附件上传
            </Title>

            <Form.Item
              name="attachment_url"
              label="作业附件"
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />} loading={uploading}>
                  选择文件
                </Button>
              </Upload>
              <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
                支持格式：PDF、Word、Excel、PPT、图片等，单个文件不超过10MB
              </Text>
            </Form.Item>
          </div>

          {/* 文件命名格式 */}
          <div style={{ marginBottom: '32px' }}>
            <Title level={4} style={{ marginBottom: '24px' }}>
              <FileTextOutlined style={{ marginRight: '8px' }} />
              文件命名格式
            </Title>
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
              <>
                <div style={{ marginBottom: 8 }}>
                  <Button size="small" onClick={() => {
                    const input = inputRef.current?.input;
                    if (!input) return;
                    const start = input.selectionStart;
                    const end = input.selectionEnd;
                    const value = '【学号】';
                    const newValue = fileName.slice(0, start) + value + fileName.slice(end);
                    setFileName(newValue);
                    setTimeout(() => {
                      input.focus();
                      input.setSelectionRange(start + value.length, start + value.length);
                    }, 0);
                  }}>【学号】</Button>
                  <Button size="small" onClick={() => {
                    const input = inputRef.current?.input;
                    if (!input) return;
                    const start = input.selectionStart;
                    const end = input.selectionEnd;
                    const value = '【班级】';
                    const newValue = fileName.slice(0, start) + value + fileName.slice(end);
                    setFileName(newValue);
                    setTimeout(() => {
                      input.focus();
                      input.setSelectionRange(start + value.length, start + value.length);
                    }, 0);
                  }} style={{ marginLeft: 8 }}>【班级】</Button>
                  <Button size="small" onClick={() => {
                    const input = inputRef.current?.input;
                    if (!input) return;
                    const start = input.selectionStart;
                    const end = input.selectionEnd;
                    const value = '【姓名】';
                    const newValue = fileName.slice(0, start) + value + fileName.slice(end);
                    setFileName(newValue);
                    setTimeout(() => {
                      input.focus();
                      input.setSelectionRange(start + value.length, start + value.length);
                    }, 0);
                  }} style={{ marginLeft: 8 }}>【姓名】</Button>
                  <span style={{ color: '#888', fontSize: 12, marginLeft: 16 }}>
                    可用变量，点击可插入
                  </span>
                </div>
                <Input
                  ref={inputRef}
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  onBlur={() => form.setFieldsValue({ file_name: fileName })}
                  placeholder="如：【学号】【班级】【姓名】计算机网络实验一"
                  maxLength={255}
                  autoComplete="off"
                />
                <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                  可用变量：【学号】【班级】【姓名】，其余为自定义内容
                </div>
              </>
            </Form.Item>
          </div>

          {/* 操作按钮 */}
          <Divider />
          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
              >
                发布作业
              </Button>
              <Button 
                onClick={handleClear}
                icon={<ClearOutlined />}
                size="large"
              >
                清空表单
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

      {/* 发布者信息 */}
      <Card 
        bordered={false} 
        style={{ 
          marginTop: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)',
          background: '#f8f9fa'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ fontSize: '24px', marginRight: '16px', color: '#1890ff' }} />
          <div>
            <Text strong style={{ fontSize: '16px' }}>{userInfo?.realName || '未知用户'}</Text>
            <br />
            <Text type="secondary">
              学号：{userInfo?.studentId || '-'} | 角色：{userInfo?.roleType === 2 ? '学委' : userInfo?.roleType === 0 ? '管理员' : '-'}
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkSend;