import React, { useEffect, useState } from 'react';

const Loading: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 500); // 固定加载
    return () => clearTimeout(timer);
  }, []);

  if (!show) return children ?? null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(120deg, #dbeafe 0%, #60a5fa 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景动态光圈 */}
      <div
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'rgba(96,165,250,0.12)',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(24px)',
          animation: 'pulse 2s infinite alternate',
          zIndex: 0,
        }}
      />
      {/* 现代化旋转加载器 */}
      <div
        style={{
          width: 64,
          height: 64,
          border: '6px solid #60a5fa',
          borderTop: '6px solid #2563eb',
          borderRight: '6px solid #dbeafe',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 32,
          boxShadow: '0 4px 24px rgba(96,165,250,0.18)',
          zIndex: 1,
        }}
      />
      {/* 跳动文字 */}
      <div
        style={{
          fontSize: 22,
          color: '#2563eb',
          fontWeight: 'bold',
          letterSpacing: 2,
          zIndex: 1,
          animation: 'fadeIn 1.2s infinite alternate',
        }}
      >
        加载中，请稍候...
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
          @keyframes pulse {
            0% { opacity: 0.7; transform: scale(1);}
            100% { opacity: 1; transform: scale(1.15);}
          }
          @keyframes fadeIn {
            0% { opacity: 0.7; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default Loading;