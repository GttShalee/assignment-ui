import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { 
  Button, 
  Space, 
  Segmented, 
  Input,
  message,
  Spin,
  Empty,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  FireOutlined,
  ClockCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useModel, history } from '@umijs/max';
import { getCurrentUser } from '@/services/auth';
import { getPosts, toggleLike, deletePost, toggleTop, ForumPost } from '@/services/forum';
import NicknameModal from '@/components/NicknameModal';
import PostEditor from '@/components/PostEditor';
import PostCard from '@/components/PostCard';

const { Search } = Input;
const { Title } = Typography;

const ClassSquare: React.FC = () => {
  const { userInfo, updateUserInfo } = useModel('global');
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortType, setSortType] = useState<'default' | 'hot'>('default');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 检查昵称 - 当用户信息加载后检查
  useEffect(() => {
    if (!userInfo || nicknameChecked) {
      return;
    }

    console.log('ClassSquare - 检查昵称，用户信息:', userInfo);
    
    // 如果用户没有昵称，显示设置弹窗
    if (!userInfo.nickname || userInfo.nickname.trim() === '') {
      console.log('ClassSquare - 用户未设置昵称，显示设置弹窗');
      setShowNicknameModal(true);
    } else {
      console.log('ClassSquare - 用户已设置昵称:', userInfo.nickname);
    }
    
    setNicknameChecked(true);
  }, [userInfo, nicknameChecked]);

  // 处理昵称设置成功
  const handleNicknameSuccess = async (nickname: string) => {
    setShowNicknameModal(false);
    
    try {
      message.success('昵称设置成功！');
      
      // 重新获取最新的用户信息
      const latestUserInfo = await getCurrentUser();
      
      // 更新全局用户信息
      updateUserInfo({ ...latestUserInfo, nickname });
      
      console.log('ClassSquare - 用户昵称已更新:', nickname);
      
      // 设置昵称后加载帖子列表
      fetchPosts();
    } catch (error) {
      console.error('ClassSquare - 获取最新用户信息失败:', error);
      // 如果获取失败，至少更新昵称字段
      if (userInfo) {
        const updatedUserInfo = { ...userInfo, nickname };
        updateUserInfo(updatedUserInfo);
      }
    }
  };

  // 获取帖子列表
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await getPosts({
        page: 1,
        pageSize: 20,
        sortType,
      });
      setPosts(response.content || []);
    } catch (error) {
      message.error('获取帖子列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 当用户信息加载完成且有昵称时，获取帖子列表
  useEffect(() => {
    if (userInfo?.nickname && nicknameChecked) {
      fetchPosts();
    }
  }, [userInfo?.nickname, nicknameChecked, sortType]);

  // 点赞
  const handleLike = async (postId: number) => {
    try {
      const result = await toggleLike(postId);
      
      // 更新帖子列表中的点赞状态
      setPosts(posts.map(post => 
        post.id === postId 
          ? {
              ...post,
              is_liked: result.is_liked,
              like_count: result.is_liked ? post.like_count + 1 : post.like_count - 1,
            }
          : post
      ));
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
      fetchPosts();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 置顶
  const handleTop = async (postId: number) => {
    try {
      await toggleTop(postId);
      const post = posts.find(p => p.id === postId);
      message.success(post?.is_top ? '取消置顶成功' : '置顶成功');
      fetchPosts();
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    }
  };

  // 查看帖子详情
  const handleViewPost = (postId: number) => {
    history.push(`/Class/PostDetail/${postId}`);
  };

  // 发帖成功
  const handlePostSuccess = () => {
    setShowPostEditor(false);
    fetchPosts();
  };

  // 判断是否可以删除
  const canDelete = (post: ForumPost) => {
    if (!userInfo) return false;
    return userInfo.roleType === 0 || userInfo.roleType === 2 || post.student_id === userInfo.studentId;
  };

  // 判断是否可以置顶
  const canTop = () => {
    if (!userInfo) return false;
    return userInfo.roleType === 0 || userInfo.roleType === 2;
  };

  // 过滤帖子
  const filteredPosts = searchKeyword 
    ? posts.filter(post => 
        post.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        post.content.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : posts;

  return (
    <PageContainer>
      <div style={{ 
        maxWidth: 1400, 
        margin: '0 auto',
        padding: '0 24px',
      }}>
        {/* 顶部操作栏 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <Title level={2} style={{ margin: 0, fontSize: 28 }}>
            班级论坛
          </Title>

          <Space size={12}>
            <Segmented
              value={sortType}
              onChange={(value) => setSortType(value as 'default' | 'hot')}
              options={[
                {
                  label: (
                    <Space size={4}>
                      <ClockCircleOutlined />
                      <span>最新</span>
                    </Space>
                  ),
                  value: 'default',
                },
                {
                  label: (
                    <Space size={4}>
                      <FireOutlined />
                      <span>热门</span>
                    </Space>
                  ),
                  value: 'hot',
                },
              ]}
            />

            <Search
              placeholder="搜索帖子..."
              allowClear
              style={{ width: 200 }}
              onChange={(e) => setSearchKeyword(e.target.value)}
              prefix={<SearchOutlined />}
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowPostEditor(true)}
              disabled={!userInfo?.nickname}
            >
              发布帖子
            </Button>
          </Space>
        </div>

        {/* 帖子列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" tip="加载中..." />
          </div>
        ) : filteredPosts.length === 0 ? (
          <Empty
            description={searchKeyword ? '没有找到相关帖子' : '暂无帖子，快来发布第一条吧！'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {!searchKeyword && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowPostEditor(true)}
                disabled={!userInfo?.nickname}
              >
                发布第一条帖子
              </Button>
            )}
          </Empty>
        ) : (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
              onTop={handleTop}
              onClick={handleViewPost}
              canDelete={canDelete(post)}
              canTop={canTop()}
            />
          ))
        )}
      </div>

      {/* 昵称设置弹窗 */}
      <NicknameModal
        visible={showNicknameModal}
        onSuccess={handleNicknameSuccess}
        currentNickname={userInfo?.nickname}
        required={true}
      />

      {/* 发帖编辑器 */}
      <PostEditor
        visible={showPostEditor}
        onCancel={() => setShowPostEditor(false)}
        onSuccess={handlePostSuccess}
        isReply={false}
      />
    </PageContainer>
  );
};

export default ClassSquare; 