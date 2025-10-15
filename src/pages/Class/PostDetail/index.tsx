import React, { useState, useEffect } from 'react';
import { useParams, history } from '@umijs/max';
import { 
  Card, 
  Button, 
  Space, 
  Divider, 
  Avatar, 
  Typography,
  message,
  Spin,
  Empty,
  Tag,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  LikeOutlined,
  LikeFilled,
  MessageOutlined,
  EyeOutlined,
  UserOutlined,
  PushpinFilled,
  FireOutlined,
  DeleteOutlined,
  PushpinOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { getPostDetail, getPostReplies, toggleLike, deletePost, toggleTop, ForumPost } from '@/services/forum';
import { getFullAvatarUrl } from '@/utils/avatar';
import PostEditor from '@/components/PostEditor';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text, Paragraph } = Typography;

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userInfo } = useModel('global');
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReplyEditor, setShowReplyEditor] = useState(false);

  // 获取帖子详情
  const fetchPostDetail = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [postData, repliesData] = await Promise.all([
        getPostDetail(Number(id)),
        getPostReplies(Number(id)),
      ]);
      
      setPost(postData);
      setReplies(repliesData || []);
    } catch (error) {
      message.error('获取帖子详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  // 点赞
  const handleLike = async (postId: number) => {
    try {
      const result = await toggleLike(postId);
      message.success(result.message);
      
      // 更新点赞状态
      if (post && post.id === postId) {
        setPost({
          ...post,
          is_liked: result.is_liked,
          like_count: result.is_liked ? post.like_count + 1 : post.like_count - 1,
        });
      } else {
        // 更新回复的点赞状态
        setReplies(replies.map(reply => 
          reply.id === postId 
            ? {
                ...reply,
                is_liked: result.is_liked,
                like_count: result.is_liked ? reply.like_count + 1 : reply.like_count - 1,
              }
            : reply
        ));
      }
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    }
  };

  // 删除帖子
  const handleDelete = async (postId: number) => {
    try {
      await deletePost(postId);
      message.success('删除成功');
      
      if (post && post.id === postId) {
        // 删除主帖，返回列表页
        history.push('/Class/ClassSquare');
      } else {
        // 删除回复，重新加载
        fetchPostDetail();
      }
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 置顶
  const handleTop = async () => {
    if (!post) return;
    
    try {
      await toggleTop(post.id);
      message.success(post.is_top ? '取消置顶成功' : '置顶成功');
      fetchPostDetail();
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    }
  };

  // 回复成功
  const handleReplySuccess = () => {
    setShowReplyEditor(false);
    fetchPostDetail();
  };

  // 判断是否可以删除
  const canDelete = (postItem: ForumPost) => {
    if (!userInfo) return false;
    // 管理员和学委可以删除任意帖子，作者可以删除自己的帖子
    return userInfo.roleType === 0 || userInfo.roleType === 2 || postItem.student_id === userInfo.studentId;
  };

  // 判断是否可以置顶
  const canTop = () => {
    if (!userInfo) return false;
    // 只有管理员和学委可以置顶
    return userInfo.roleType === 0 || userInfo.roleType === 2;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="帖子不存在" />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="primary" onClick={() => history.push('/Class/ClassSquare')}>
            返回论坛
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f5f5f5',
      padding: '24px 0',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
        {/* 返回按钮 */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/Class/ClassSquare')}
          style={{ marginBottom: 16 }}
        >
          返回论坛
        </Button>

        {/* 主帖内容 */}
        <Card
          style={{ 
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
          bodyStyle={{ padding: '32px 40px' }}
        >
          {/* 标题和标签 */}
          <div style={{ marginBottom: 24 }}>
            <Space size={8} style={{ marginBottom: 12 }}>
              {post.is_top && <Tag icon={<PushpinFilled />} color="blue" style={{ fontSize: 13 }}>置顶</Tag>}
              {post.is_hot && <Tag icon={<FireOutlined />} color="red" style={{ fontSize: 13 }}>热门</Tag>}
            </Space>
            
            <Title level={2} style={{ marginBottom: 0, fontSize: 28 }}>
              {post.title}
            </Title>
          </div>

          {/* 作者信息 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: 32,
            padding: '16px 0',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <Avatar
              size={56}
              src={getFullAvatarUrl(post.student_avatar)}
              icon={<UserOutlined />}
            />
            <div style={{ marginLeft: 16, flex: 1 }}>
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  {post.nickname || post.student_name}
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 14 }}>
                {dayjs(post.created_at).format('YYYY-MM-DD HH:mm')}
              </Text>
            </div>

            {/* 管理操作 */}
            <Space size={12}>
              {canTop() && (
                <Tooltip title={post.is_top ? '取消置顶' : '置顶'}>
                  <Button
                    type={post.is_top ? 'primary' : 'default'}
                    icon={post.is_top ? <PushpinFilled /> : <PushpinOutlined />}
                    onClick={handleTop}
                    size="large"
                  >
                    {post.is_top ? '取消置顶' : '置顶'}
                  </Button>
                </Tooltip>
              )}
              
              {canDelete(post) && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(post.id)}
                  size="large"
                >
                  删除
                </Button>
              )}
            </Space>
          </div>

          {/* 帖子内容 */}
          <div style={{ 
            minHeight: 200,
            marginBottom: 24,
          }}>
            <Paragraph style={{ 
              fontSize: 16, 
              lineHeight: 2, 
              whiteSpace: 'pre-wrap',
              color: '#262626',
              marginBottom: 0,
            }}>
              {post.content}
            </Paragraph>
          </div>

          {/* 附件 */}
          {post.attachment_name && (
            <div style={{ 
              marginBottom: 24,
              padding: '12px 16px',
              background: '#f5f5f5',
              borderRadius: 6,
            }}>
              <Tag icon={<PaperClipOutlined />} color="default" style={{ fontSize: 14 }}>
                {post.attachment_name}
              </Tag>
            </div>
          )}

          <Divider style={{ margin: '24px 0' }} />

          {/* 底部操作栏 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 0',
          }}>
            <Space size={32}>
              <Button
                type="text"
                size="large"
                icon={post.is_liked ? <LikeFilled style={{ color: '#1890ff' }} /> : <LikeOutlined />}
                onClick={() => handleLike(post.id)}
                style={{ 
                  color: post.is_liked ? '#1890ff' : undefined,
                  fontSize: 15,
                }}
              >
                {post.is_liked ? '已点赞' : '点赞'} ({post.like_count})
              </Button>

              <Space size={8} style={{ color: '#666', fontSize: 15 }}>
                <MessageOutlined />
                <span>{post.reply_count} 回复</span>
              </Space>

              <Space size={8} style={{ color: '#666', fontSize: 15 }}>
                <EyeOutlined />
                <span>{post.view_count} 浏览</span>
              </Space>
            </Space>

            <Button
              type="primary"
              size="large"
              icon={<MessageOutlined />}
              onClick={() => setShowReplyEditor(true)}
            >
              回复
            </Button>
          </div>
        </Card>

        {/* 回复列表 */}
        <div style={{ marginTop: 24 }}>
          <Card
            style={{ 
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
            bodyStyle={{ padding: '24px 32px' }}
          >
            <Title level={4} style={{ marginBottom: 20, fontSize: 20 }}>
              全部回复 ({replies.length})
            </Title>

            {replies.length === 0 ? (
              <div style={{ 
                padding: '60px 0',
                textAlign: 'center',
                background: '#fafafa',
                borderRadius: 8,
              }}>
                <Empty 
                  description="暂无回复，快来抢沙发吧！" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                {replies.map((reply, index) => (
                  <div 
                    key={reply.id} 
                    style={{ 
                      padding: '20px 0',
                      borderBottom: index < replies.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 16 }}>
                      <Avatar
                        size={48}
                        src={getFullAvatarUrl(reply.student_avatar)}
                        icon={<UserOutlined />}
                      />

                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 12,
                        }}>
                          <div>
                            <Text strong style={{ fontSize: 15 }}>
                              {reply.nickname || reply.student_name}
                            </Text>
                            <Text type="secondary" style={{ marginLeft: 12, fontSize: 13 }}>
                              {dayjs(reply.created_at).fromNow()}
                            </Text>
                          </div>

                          {canDelete(reply) && (
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete(reply.id)}
                            >
                              删除
                            </Button>
                          )}
                        </div>

                        <Paragraph style={{ 
                          marginBottom: 16, 
                          whiteSpace: 'pre-wrap',
                          fontSize: 15,
                          lineHeight: 1.8,
                          color: '#262626',
                        }}>
                          {reply.content}
                        </Paragraph>

                        <Button
                          type="text"
                          size="middle"
                          icon={reply.is_liked ? <LikeFilled style={{ color: '#1890ff' }} /> : <LikeOutlined />}
                          onClick={() => handleLike(reply.id)}
                          style={{ 
                            color: reply.is_liked ? '#1890ff' : undefined,
                            padding: '4px 12px',
                          }}
                        >
                          {reply.like_count > 0 ? reply.like_count : '点赞'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* 回复编辑器 */}
        <PostEditor
          visible={showReplyEditor}
          onCancel={() => setShowReplyEditor(false)}
          onSuccess={handleReplySuccess}
          isReply={true}
          parentId={post.id}
          replyToName={post.nickname || post.student_name}
        />
      </div>
    </div>
  );
};

export default PostDetail;

