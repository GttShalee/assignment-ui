import { API_BASE_URL, AVATAR_CONFIG } from '@/constants/config';

/**
 * 构建完整的头像URL
 * @param avatarPath 头像路径（相对路径或完整URL）
 * @returns 完整的头像URL
 */
export const getFullAvatarUrl = (avatarPath?: string): string => {
  if (!avatarPath) return '';

  // 若为绝对 URL，处理 localhost 替换为后端对外地址
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    try {
      const absoluteUrl = new URL(avatarPath);
      const isLocalhost =
        absoluteUrl.hostname === 'localhost' || absoluteUrl.hostname === '127.0.0.1';

      if (isLocalhost) {
        const api = new URL(API_BASE_URL);
        // 使用 API_BASE_URL 的协议+主机+端口，保留原来的路径和查询
        return `${api.origin}${absoluteUrl.pathname}${absoluteUrl.search}`;
      }

      return avatarPath;
    } catch (e) {
      // 解析失败则回退到相对路径拼接逻辑
    }
  }

  // 相对路径：与 API_BASE_URL 进行拼接
  const baseUrl = API_BASE_URL;
  try {
    const normalizedPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
    if (normalizedPath.includes('%')) {
      return `${baseUrl}${normalizedPath}`;
    }
    const encodedPath = encodeURI(normalizedPath);
    return `${baseUrl}${encodedPath}`;
  } catch (error) {
    console.error('头像URL编码失败:', error);
    const normalizedPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
    return `${baseUrl}${normalizedPath}`;
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