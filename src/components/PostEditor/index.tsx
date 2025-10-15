import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Upload } from 'antd';
import { EditOutlined, UploadOutlined, PaperClipOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const { TextArea } = Input;

interface PostEditorProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  isReply?: boolean;
  parentId?: number | null;
  replyToName?: string;
}

const PostEditor: React.FC<PostEditorProps> = ({
  visible,
  onCancel,
  onSuccess,
  isReply = false,
  parentId = null,
  replyToName,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const { createPost } = await import('@/services/forum');
      
      const postData: any = {
        content: values.content,
        parent_id: parentId,
      };

      // 主帖需要标题
      if (!isReply) {
        postData.title = values.title;
      }

      // 如果有附件
      if (fileList.length > 0) {
        // TODO: 实现文件上传逻辑
        // postData.attachment_url = uploadedUrl;
        // postData.attachment_name = fileList[0].name;
      }

      await createPost(postData);
      
      message.success(isReply ? '回复成功！' : '发帖成功！');
      form.resetFields();
      setFileList([]);
      onSuccess();
    } catch (error: any) {
      console.error('发帖失败:', error);
      message.error(error.message || '发帖失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EditOutlined />
          <span>{isReply ? `回复 ${replyToName || ''}` : '发布新帖'}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {!isReply && (
          <Form.Item
            label="标题"
            name="title"
            rules={[
              { required: true, message: '请输入帖子标题' },
              { min: 5, message: '标题至少5个字符' },
              { max: 100, message: '标题不能超过100个字符' },
            ]}
          >
            <Input
              placeholder="请输入帖子标题（5-100个字符）"
              size="large"
              maxLength={100}
              showCount
            />
          </Form.Item>
        )}

        <Form.Item
          label={isReply ? '回复内容' : '帖子内容'}
          name="content"
          rules={[
            { required: true, message: '请输入内容' },
            { min: 5, message: '内容至少5个字符' },
            { max: 5000, message: '内容不能超过5000个字符' },
          ]}
        >
          <TextArea
            rows={isReply ? 4 : 8}
            placeholder={isReply ? '说说你的想法...' : '详细描述你的想法...'}
            maxLength={5000}
            showCount
          />
        </Form.Item>

        <Form.Item label="附件（可选）">
          <Upload
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>
              <PaperClipOutlined /> 上传附件
            </Button>
          </Upload>
          <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
            支持图片、文档等格式，单个文件不超过10MB
          </div>
        </Form.Item>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel}>
            取消
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<EditOutlined />}
          >
            {isReply ? '发布回复' : '发布帖子'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default PostEditor;

