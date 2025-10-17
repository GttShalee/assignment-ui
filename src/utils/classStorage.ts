// 班级信息本地存储工具类

import type { ClassResponse } from '@/services/homework';

/**
 * 获取用户的班级列表
 * @returns 班级列表数组，如果没有则返回空数组
 */
export function getUserClassList(): ClassResponse[] {
  const classListStr = localStorage.getItem('user_class_list');
  if (!classListStr) {
    return [];
  }
  
  try {
    return JSON.parse(classListStr);
  } catch (error) {
    console.error('解析班级列表失败:', error);
    return [];
  }
}

/**
 * 保存用户的班级列表
 * @param classList 班级列表
 */
export function saveUserClassList(classList: ClassResponse[]): void {
  localStorage.setItem('user_class_list', JSON.stringify(classList));
}

/**
 * 获取用户的默认班级代码
 * @returns 默认班级代码，如果没有则返回 null
 */
export function getUserDefaultClassCode(): string | null {
  return localStorage.getItem('user_class_code');
}

/**
 * 设置用户的默认班级代码
 * @param classCode 班级代码
 */
export function saveUserDefaultClassCode(classCode: string): void {
  localStorage.setItem('user_class_code', classCode);
}

/**
 * 清除所有班级相关的本地存储
 */
export function clearClassStorage(): void {
  localStorage.removeItem('user_class_list');
  localStorage.removeItem('user_class_code');
}

/**
 * 根据班级代码获取班级名称
 * @param classCode 班级代码
 * @returns 班级名称，如果找不到则返回班级代码本身
 */
export function getClassNameByCode(classCode: string): string {
  const classList = getUserClassList();
  const classItem = classList.find(c => c.classCode === classCode);
  return classItem?.className || classCode;
}

