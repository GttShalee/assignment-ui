import React, { useEffect, useRef } from 'react';

interface MobileSiderControllerProps {
  children: React.ReactNode;
}

const MobileSiderController: React.FC<MobileSiderControllerProps> = ({ children }) => {
  const isMobile = useRef(false);
  const clickListenerRef = useRef<((event: MouseEvent) => void) | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      isMobile.current = window.innerWidth <= 768;
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      if (clickListenerRef.current) {
        document.removeEventListener('click', clickListenerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMobile.current) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sider = document.querySelector('.ant-layout-sider');
      const header = document.querySelector('.ant-layout-header');
      const siderTrigger = document.querySelector('.ant-layout-sider-trigger');
      
      // 如果点击的是侧边栏、头部或折叠按钮，不处理
      if (sider?.contains(target) || header?.contains(target) || siderTrigger?.contains(target)) {
        return;
      }

      // 检查侧边栏是否展开
      const isSiderExpanded = sider && !sider.classList.contains('ant-layout-sider-collapsed');
      
      if (isSiderExpanded) {
        // 点击外部区域，折叠侧边栏
        const collapseBtn = document.querySelector('.ant-layout-sider-trigger');
        if (collapseBtn) {
          (collapseBtn as HTMLElement).click();
        }
      }
    };

    // 延迟添加事件监听器，避免立即触发
    const timer = setTimeout(() => {
      clickListenerRef.current = handleClickOutside;
      document.addEventListener('click', handleClickOutside);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (clickListenerRef.current) {
        document.removeEventListener('click', clickListenerRef.current);
        clickListenerRef.current = null;
      }
    };
  }, []);

  return <>{children}</>;
};

export default MobileSiderController; 