/**
 * 应用配置常量
 */

// 后端服务地址
// @ts-ignore
export const API_BASE_URL = API_BASE_URL || 'http://localhost:8080';

// 头像相关配置
export const AVATAR_CONFIG = {
  // 头像文件大小限制（5MB）
  MAX_SIZE: 5 * 1024 * 1024,
  // 支持的文件类型
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'],
  // 支持的文件扩展名
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
  // 建议的头像尺寸
  RECOMMENDED_SIZE: '200x200',
};

// 班级代码映射
export const CLASS_CODE_MAP: { [key: string]: string } = {
  '1234': '计科23-1 ·',
  '2005': '计科23-2 ·',
  '1111': '计科23-3 ·',
  '8888': '计科智能 ·',
};

// 角色类型映射
export const ROLE_TYPE_MAP: { [key: number]: string } = {
  0: '管理员',
  1: '学生',
  2: '学委',
};

// 分页配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['5', '10', '20', '50'],
}; 