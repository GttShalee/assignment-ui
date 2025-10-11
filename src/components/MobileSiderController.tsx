import React, { useEffect, useState } from 'react';

interface MobileSiderControllerProps {
  children: React.ReactNode;
}

const MobileSiderController: React.FC<MobileSiderControllerProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSiderOpen, setIsSiderOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 992;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // 监听侧边栏状态变化
  useEffect(() => {
    if (!isMobile) {
      setIsSiderOpen(false);
      return;
    }

    const checkSiderStatus = () => {
      const sider = document.querySelector('.ant-layout-sider');
      if (sider) {
        const isCollapsed = sider.classList.contains('ant-layout-sider-collapsed');
        setIsSiderOpen(!isCollapsed);
      } else {
        setIsSiderOpen(false);
      }
    };

    // 延迟初始化，确保DOM已经渲染
    const initTimer = setTimeout(() => {
      checkSiderStatus();
    }, 200);

    // 使用MutationObserver监听class变化
    const observer = new MutationObserver(() => {
      checkSiderStatus();
    });

    const sider = document.querySelector('.ant-layout-sider');
    if (sider) {
      observer.observe(sider, { attributes: true, attributeFilter: ['class'] });
    }

    return () => {
      clearTimeout(initTimer);
      observer.disconnect();
    };
  }, [isMobile]);

  // 处理遮罩层点击
  const handleMaskClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('尝试查找折叠触发器...');
    
    // 尝试所有可能的选择器
    const selectors = [
      '.ant-layout-sider-trigger',
      '.ant-pro-sider-menu-logo-trigger',
      '[class*="trigger"]',
      '[class*="Trigger"]',
      '.ant-pro-layout-apps-icon',
      'span[role="img"][aria-label*="menu"]',
      'span[aria-label*="menu"]',
      '[class*="collapsed-button"]',
      '[class*="sider"] [role="button"]',
      '.anticon-menu-fold',
      '.anticon-menu-unfold',
    ];
    
    let triggerElement: HTMLElement | null = null;
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        triggerElement = elements[0] as HTMLElement;
        console.log('找到触发器:', selector, triggerElement);
        break;
      }
    }
    
    if (!triggerElement) {
      console.log('使用选择器未找到，尝试查找所有可点击元素');
      // 打印页面结构帮助调试
      const sider = document.querySelector('.ant-layout-sider');
      console.log('侧边栏元素:', sider);
      console.log('侧边栏HTML:', sider?.outerHTML.substring(0, 500));
      
      // 查找所有可能的触发元素
      const allClickable = document.querySelectorAll('[onclick], [role="button"], .ant-pro-layout *');
      console.log('所有可点击元素:', allClickable);
      
      // 直接操作侧边栏状态
      console.log('尝试直接折叠侧边栏');
      if (sider) {
        sider.classList.add('ant-layout-sider-collapsed');
        setIsSiderOpen(false);
      }
      return;
    }
    
    console.log('点击触发器');
    triggerElement.click();
    
    // 检查是否成功
    setTimeout(() => {
      const sider = document.querySelector('.ant-layout-sider');
      const isStillOpen = sider && !sider.classList.contains('ant-layout-sider-collapsed');
      if (isStillOpen) {
        console.log('点击无效，尝试其他方法');
        // 尝试触发各种事件
        ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'].forEach(eventType => {
          const event = new MouseEvent(eventType, {
            view: window,
            bubbles: true,
            cancelable: true
          });
          triggerElement?.dispatchEvent(event);
        });
        
        // 最后手段：直接修改DOM
        setTimeout(() => {
          const sider = document.querySelector('.ant-layout-sider');
          if (sider && !sider.classList.contains('ant-layout-sider-collapsed')) {
            console.log('所有方法都无效，直接修改DOM');
            sider.classList.add('ant-layout-sider-collapsed');
            setIsSiderOpen(false);
          }
        }, 100);
      }
    }, 100);
  };

  // 为Pro Layout自带的遮罩层添加点击事件
  useEffect(() => {
    if (!isMobile || !isSiderOpen) return;

    const handleProLayoutMaskClick = () => {
      const collapseBtn = document.querySelector('.ant-layout-sider-trigger') as HTMLElement;
      if (collapseBtn) {
        collapseBtn.click();
      }
    };

    // 查找Pro Layout的遮罩层元素
    const findAndAttachMaskListener = () => {
      // 常见的Pro Layout遮罩层class名称
      const maskSelectors = [
        '.ant-pro-sider-menu-mask',
        '.ant-drawer-mask',
        '.ant-layout-sider-mask',
        '[class*="mask"]'
      ];

      for (const selector of maskSelectors) {
        const masks = document.querySelectorAll(selector);
        masks.forEach(mask => {
          if (mask instanceof HTMLElement) {
            mask.addEventListener('click', handleProLayoutMaskClick);
            mask.addEventListener('touchend', handleProLayoutMaskClick);
            console.log('已为Pro Layout遮罩层添加点击事件:', selector);
          }
        });
      }
    };

    // 延迟查找，确保遮罩层已渲染
    const timer = setTimeout(findAndAttachMaskListener, 100);

    return () => {
      clearTimeout(timer);
      // 清理事件监听
      const maskSelectors = [
        '.ant-pro-sider-menu-mask',
        '.ant-drawer-mask',
        '.ant-layout-sider-mask',
        '[class*="mask"]'
      ];
      
      maskSelectors.forEach(selector => {
        const masks = document.querySelectorAll(selector);
        masks.forEach(mask => {
          if (mask instanceof HTMLElement) {
            mask.removeEventListener('click', handleProLayoutMaskClick);
            mask.removeEventListener('touchend', handleProLayoutMaskClick);
          }
        });
      });
    };
  }, [isMobile, isSiderOpen]);

  // ESC键支持
  useEffect(() => {
    if (!isMobile || !isSiderOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const collapseBtn = document.querySelector('.ant-layout-sider-trigger') as HTMLElement;
        if (collapseBtn) {
          collapseBtn.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobile, isSiderOpen]);

  return (
    <>
      {children}
      {/* 移动端遮罩层 - 只在移动端且侧边栏展开时显示 */}
      {isMobile && isSiderOpen && (
        <div
          onMouseDown={(e) => {
            console.log('遮罩层 mousedown 事件触发');
            handleMaskClick(e);
          }}
          onTouchStart={(e) => {
            console.log('遮罩层 touchstart 事件触发');
            handleMaskClick(e);
          }}
          onClick={(e) => {
            console.log('遮罩层 click 事件触发');
            handleMaskClick(e);
          }}
          onTouchEnd={(e) => {
            console.log('遮罩层 touchend 事件触发');
            handleMaskClick(e);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.45)',
            zIndex: 1001,
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
        />
      )}
    </>
  );
};

export default MobileSiderController; 