import { request } from '@umijs/max';

// 作业接口类型定义
export interface Homework {
  id: number;
  class_code: string;   // 班级代码
  title: string;
  description: string;
  attachment_url: string | null;   // 附件
  publish_time: string;
  deadline: string;
  file_name: string | null;   // 要求作业命名格式
  total_score: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface CreateHomeworkRequest {
  class_code: string;
  title: string;
  description: string;
  file_name?: string;
  attachment_url?: string;
  publish_time: string;
  deadline: string;
  total_score: number;
  status: number;
}

// 班级响应类型
export interface ClassResponse {
  classCode: string;
  className: string;
  // 如果后端返回的字段名不同，请使用以下字段名
  // class_code?: string;
  // class_name?: string;
}

// 文件上传响应类型
export interface UploadResponse {
  url: string;
  filename: string;
}

// 发布作业
export async function publishHomework(data: CreateHomeworkRequest): Promise<Homework> {
  return request('/api/homework', {
    method: 'POST',
    data,
  });
}

// 获取作业列表
export async function getHomeworkList(params?: {
  classCode?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}): Promise<{
  content: Homework[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  empty: boolean;
}> {
  return request('/api/homework', {
    method: 'GET',
    params,
  });
}

// 获取单个作业详情
export async function getHomeworkDetail(id: number): Promise<Homework> {
  return request(`/api/homework/${id}`, {
    method: 'GET',
  });
}

// 更新作业
export async function updateHomework(id: number, data: Partial<Homework>): Promise<Homework> {
  return request(`/api/homework/${id}`, {
    method: 'PUT',
    data,
  });
}

// 删除作业
export async function deleteHomework(id: number): Promise<void> {
  return request(`/api/homework/${id}`, {
    method: 'DELETE',
  });
}

// 获取班级列表（用于下拉选择）
export async function getClassList(): Promise<ClassResponse[]> {
  return request('/api/class', {
    method: 'GET',
  });
}

// 上传文件
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  return request('/api/upload', {
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
} 