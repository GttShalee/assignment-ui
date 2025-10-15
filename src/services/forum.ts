import { request } from '@umijs/max';

// 帖子接口类型
export interface ForumPost {
  id: number;
  student_id: string;
  student_name: string;
  student_avatar?: string;
  nick_name?: string; // 后端返回的昵称字段
  nickname?: string; // 前端兼容字段
  class_code: string;
  parent_id: number | null;
  title?: string;
  content: string;
  attachment_url?: string;
  attachment_name?: string;
  like_count: number;
  reply_count: number;
  view_count: number;
  is_top: boolean;
  is_hot: boolean;
  is_liked: boolean;
  status: number;
  created_at: string;
  updated_at: string;
}

// 发布帖子请求
export interface CreatePostRequest {
  title?: string;
  content: string;
  parent_id?: number | null;
  nick_name?: string; // 后端需要的昵称字段
  attachment_url?: string;
  attachment_name?: string;
}

// 帖子列表响应
export interface PostsResponse {
  content: ForumPost[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// 发布帖子（主帖或回复）
export async function createPost(data: CreatePostRequest): Promise<ForumPost> {
  return request('/api/forum/post', {
    method: 'POST',
    data,
  });
}

// 获取班级帖子列表
export async function getPosts(params?: {
  page?: number;
  pageSize?: number;
  sortType?: 'default' | 'hot';
}): Promise<PostsResponse> {
  return request('/api/forum/posts', {
    method: 'GET',
    params: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
      sortType: params?.sortType || 'default',
    },
  });
}

// 获取帖子详情
export async function getPostDetail(postId: number): Promise<ForumPost> {
  return request(`/api/forum/post/${postId}`, {
    method: 'GET',
  });
}

// 获取帖子的所有回复
export async function getPostReplies(postId: number): Promise<ForumPost[]> {
  return request(`/api/forum/post/${postId}/replies`, {
    method: 'GET',
  });
}

// 点赞/取消点赞
export async function toggleLike(postId: number): Promise<{
  message: string;
  is_liked: boolean;
}> {
  return request(`/api/forum/post/${postId}/like`, {
    method: 'POST',
  });
}

// 删除帖子
export async function deletePost(postId: number): Promise<{
  message: string;
}> {
  return request(`/api/forum/post/${postId}`, {
    method: 'DELETE',
  });
}

// 置顶/取消置顶
export async function toggleTop(postId: number): Promise<{
  message: string;
}> {
  return request(`/api/forum/post/${postId}/top`, {
    method: 'POST',
  });
}

// 获取我的帖子
export async function getMyPosts(params?: {
  page?: number;
  pageSize?: number;
}): Promise<PostsResponse> {
  return request('/api/forum/my-posts', {
    method: 'GET',
    params: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
    },
  });
}

