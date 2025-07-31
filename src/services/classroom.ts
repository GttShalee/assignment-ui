import { request } from '@umijs/max';

// 班级成员接口类型定义
export interface ClassMember {
  id: number;
  studentId: string;
  realName: string;
  email?: string;
  roleType: number; // 0-管理员, 1-学生, 2-学委
  avatarUrl?: string;
  // status: number; // 0-离线, 1-在线
}

// 班级成员列表响应类型
export interface ClassMembersResponse {
  content: ClassMember[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 获取班级成员列表
export async function getClassMembers(classCode: string, params?: {
  page?: number;
  pageSize?: number;
}): Promise<ClassMembersResponse> {
  return request(`/api/class/${classCode}/members`, {
    method: 'GET',
    params,
  });
}

// 获取班级信息
export async function getClassInfo(classCode: string) {
  return request(`/api/class/${classCode}`, {
    method: 'GET',
  });
}
