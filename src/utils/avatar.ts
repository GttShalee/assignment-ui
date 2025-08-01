import { API_BASE_URL, AVATAR_CONFIG } from '@/constants/config';

/**
 * 构建完整的头像URL
 * @param avatarPath 头像路径（相对路径或完整URL）
 * @returns 完整的头像URL
 */
export const getFullAvatarUrl = (avatarPath?: string): string => {
  if (!avatarPath) return '';
  
  // 如果已经是完整URL，直接返回
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  
  // 如果是相对路径，添加后端基础URL
  const baseUrl = API_BASE_URL;
  
  // 处理URL编码问题，确保中文字符正确编码
  try {
    // 如果路径已经包含编码字符，直接使用
    if (avatarPath.includes('%')) {
      return `${baseUrl}${avatarPath}`;
    }
    
    // 否则进行URL编码
    const encodedPath = encodeURI(avatarPath);
    return `${baseUrl}${encodedPath}`;
  } catch (error) {
    console.error('头像URL编码失败:', error);
    return `${baseUrl}${avatarPath}`;
  }
};

/**
 * 获取头像显示组件
 * @param avatarPath 头像路径
 * @param size 头像大小
 * @param fallbackIcon 默认图标
 * @param fallbackText 默认文字
 * @returns Avatar组件
 */
export const getAvatarComponent = (
  avatarPath?: string,
  size: number = 32,
  fallbackIcon?: React.ReactNode,
  fallbackText?: string
) => {
  const fullUrl = getFullAvatarUrl(avatarPath);
  
  return {
    src: fullUrl || undefined,
    size,
    icon: fallbackIcon,
    children: fallbackText,
    onError: () => false, // 加载失败时不显示错误
  };
}; 