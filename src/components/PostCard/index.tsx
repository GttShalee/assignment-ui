import React from 'react';
import { Card, Avatar, Space, Tag, Typography, Button, Tooltip, Popconfirm } from 'antd';
import {
  UserOutlined,
  LikeOutlined,
  LikeFilled,
  MessageOutlined,
  EyeOutlined,
  DeleteOutlined,
  PushpinOutlined,
  PushpinFilled,
  FireOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { ForumPost } from '@/services/forum';
import { getFullAvatarUrl } from '@/utils/avatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text, Paragraph } = Typography;

interface PostCardProps {
  post: ForumPost;
  onLike: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onTop?: (postId: number) => void;
  onClick: (postId: number) => void;
  showActions?: boolean;
  canDelete?: boolean;
  canTop?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onDelete,
  onTop,
  onClick,
  showActions = true,
  canDelete = false,
  canTop = false,
}) => {
  return (
    <Card
      hoverable
      onClick={() => onClick(post.id)}
      style={{
        marginBottom: 16,
        cursor: 'pointer',
        borderLeft: post.is_top ? '4px solid #1890ff' : undefined,
      }}
      bodyStyle={{ padding: '16px 20px' }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        {/* 用户头像 */}
        <Avatar
          size={48}
          src={getFullAvatarUrl(post.student_avatar)}
          icon={<UserOutlined />}
          style={{ flexShrink: 0 }}
        />

        {/* 帖子内容 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 顶部信息 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
            <Text strong style={{ fontSize: 15 }}>
              {post.nickname || post.student_name}
            </Text>
            
            {post.is_top && (
              <Tag icon={<PushpinFilled />} color="blue">置顶</Tag>
            )}
            
            {post.is_hot && (
              <Tag icon={<FireOutlined />} color="red">热门</Tag>
            )}
            
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
              {dayjs(post.created_at).fromNow()}
            </Text>
          </div>

          {/* 标题 */}
          {post.title && (
            <div style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 500, color: '#1f1f1f' }}>
                {post.title}
              </Text>
            </div>
          )}

          {/* 内容预览 */}
          <Paragraph
            ellipsis={{ rows: 2 }}
            style={{ 
              marginBottom: 12, 
              color: '#666',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {post.content}
          </Paragraph>

          {/* 附件 */}
          {post.attachment_name && (
            <div style={{ marginBottom: 12 }}>
              <Tag icon={<PaperClipOutlined />} color="default">
                {post.attachment_name}
              </Tag>
            </div>
          )}

          {/* 底部统计和操作 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space size={16}>
              {/* 点赞 */}
              <Button
                type="text"
                size="small"
                icon={post.is_liked ? <LikeFilled style={{ color: '#1890ff' }} /> : <LikeOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(post.id);
                }}
                style={{ 
                  padding: '0 8px',
                  color: post.is_liked ? '#1890ff' : undefined,
                }}
              >
                {post.like_count > 0 ? post.like_count : '点赞'}
              </Button>

              {/* 回复 */}
              <Tooltip title="查看回复">
                <Space size={4} style={{ color: '#666', fontSize: 13 }}>
                  <MessageOutlined />
                  <span>{post.reply_count}</span>
                </Space>
              </Tooltip>

              {/* 浏览 */}
              <Tooltip title="浏览次数">
                <Space size={4} style={{ color: '#666', fontSize: 13 }}>
                  <EyeOutlined />
                  <span>{post.view_count}</span>
                </Space>
              </Tooltip>
            </Space>

            {/* 管理操作 */}
            {showActions && (
              <Space size={8} onClick={(e) => e.stopPropagation()}>
                {canTop && onTop && (
                  <Tooltip title={post.is_top ? '取消置顶' : '置顶'}>
                    <Button
                      type="text"
                      size="small"
                      icon={post.is_top ? <PushpinFilled /> : <PushpinOutlined />}
                      onClick={() => onTop(post.id)}
                    />
                  </Tooltip>
                )}

                {canDelete && onDelete && (
                  <Popconfirm
                    title="确认删除"
                    description="删除后无法恢复，确定要删除这个帖子吗？"
                    onConfirm={() => onDelete(post.id)}
                    okText="确认"
                    cancelText="取消"
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                )}
              </Space>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;

