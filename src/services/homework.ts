import { request } from '@umijs/max';
import { getToken } from './auth';

// 作业接口类型定义
export interface Homework {
  id: number;
  class_code: string;   // 班级代码
  course_name: string;  // 课程名称
  course_code?: number; // 课程代码（二进制位掩码）
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
  // 用户提交状态（由后端返回）
  submission_status?: number; // 0-未提交，1-已提交
}

export interface CreateHomeworkRequest {
  class_code: string;
  course_name: string;  // 课程名称
  course_code: number;  // 课程代码（二进制位掩码）
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

// 作业提交相关类型
export interface SubmitHomeworkRequest {
  homeworkId: number;
  submissionFileUrl: string;
  submissionFileName: string;
  remarks?: string;
}

export interface SubmitHomeworkFormData {
  homework_id: number;
  file?: File;
  remarks?: string;
}

export interface HomeworkSubmissionResponse {
  id: number;
  studentId: string;
  classCode: string;
  homeworkId: number;
  submissionTime: string;
  submissionFileUrl: string;
  submissionFileName: string;
  submissionStatus: number; // 0-按时提交，1-补交
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  // 可能包含的用户和作业信息
  studentName?: string;
  homeworkTitle?: string;
}

// 未提交成员类型
export interface UnsubmittedMember {
  id: number;
  student_id: string;
  real_name: string;
  class_code?: string;
  email?: string;
  role_type?: number;
  created_at?: string;
}

// 未提交成员列表响应类型
export interface UnsubmittedMembersResponse {
  content: UnsubmittedMember[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 作业提交列表响应类型
export interface HomeworkSubmissionsResponse {
  content: HomeworkSubmissionResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
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
  courses?: number; // 用户选择的课程（二进制位掩码）
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
  
  return request('/api/upload/homework-attachment', {
    method: 'POST',
    data: formData,
  });
}

// 获取作业提交列表
export async function getHomeworkSubmissions(homeworkId: number, params?: {
  page?: number;
  pageSize?: number;
}): Promise<HomeworkSubmissionsResponse> {
  return request(`/api/homework-submission/list/${homeworkId}`, {
    method: 'GET',
    params,
  });
}

// 下载作业提交文件包
export async function downloadHomeworkSubmissions(homeworkId: number): Promise<Blob> {
  return request(`/api/homework-submission/${homeworkId}/download`, {
    method: 'GET',
    responseType: 'blob',
  });
}

// 提交作业（包含文件上传）
export async function submitHomework(data: SubmitHomeworkFormData): Promise<HomeworkSubmissionResponse> {
  const formData = new FormData();
  formData.append('homework_id', data.homework_id.toString());
  
  if (data.file) {
    formData.append('file', data.file);
  }
  
  if (data.remarks) {
    formData.append('remarks', data.remarks);
  }
  
  return request('/api/homework-submission/submit', {
    method: 'POST',
    data: formData,
  });
}

// 上传学生作业文件（保留用于兼容性，但建议使用 submitHomework）
export async function uploadHomeworkFile(file: File, classCode: string, homeworkTitle: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  // 生成文件名：班级代码-作业名称-日期时间
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') + '_' +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  
  const fileName = `${classCode}-${homeworkTitle}-${dateStr}`;
  
  return request('/api/upload/homework-attachment', {
    method: 'POST',
    data: formData,
  });
}

// 获取未提交作业的成员列表
export async function getUnsubmittedMembers(homeworkId: number, params?: {
  page?: number;
  pageSize?: number;
}): Promise<UnsubmittedMembersResponse> {
  return request(`/api/homework-submission/homework/${homeworkId}/unsubmitted-members`, {
    method: 'GET',
    params,
  });
}

// 撤回作业提交
export async function withdrawHomework(homeworkId: number): Promise<void> {
  return request(`/api/homework-submission/homework/${homeworkId}/withdraw`, {
    method: 'DELETE',
  });
}

// 历史提交记录相关类型
export interface HistorySubmission {
  id: number;
  homework_id: number;
  homework_title: string;
  course_name: string;
  submission_time: string;
  submission_file_url: string;
  submission_file_name: string;
  download_url: string;
  submission_status: number; // 0-按时提交，1-补交
}

export interface HistorySubmissionsResponse {
  content: HistorySubmission[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// 获取我的历史提交记录
export async function getMySubmissionHistory(params?: {
  page?: number;
  pageSize?: number;
}): Promise<HistorySubmissionsResponse> {
  return request('/api/homework-submission/my/history', {
    method: 'GET',
    params,
  });
}

// 下载我的作业文件 - 直接调用API接口
export function downloadMyHomework(homeworkId: number): void {
  const downloadUrl = `/api/homework-submission/download/${homeworkId}`;
  
  // 直接在当前窗口打开下载链接
  window.location.href = downloadUrl;
}

// 为了向后兼容，保留原有函数但使用新接口实现
export function downloadFile(homeworkId: number): void {
  return downloadMyHomework(homeworkId);
}

// 作业提交记录类型
export interface HomeworkSubmissionRecord {
  id: number;
  student_id: string;
  user_name: string;
  homework_id: number;
  homework_title: string;
  submission_time: string;
  submission_status: number; // 0=按时提交，1=补交
  is_late_submission: boolean;
  is_first_submission: boolean;
  class_code: string;
  course_name: string;
}

export interface HomeworkSubmissionRecordsResponse {
  content: HomeworkSubmissionRecord[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  number: number;
  size: number;
  numberOfElements: number;
}

// 获取作业提交记录（用于班级空间展示）
export async function getHomeworkSubmissionRecords(params?: {
  page?: number;
  pageSize?: number;
}): Promise<HomeworkSubmissionRecordsResponse> {
  return request('/api/homework-submission/records', {
    method: 'GET',
    params,
  });
} 