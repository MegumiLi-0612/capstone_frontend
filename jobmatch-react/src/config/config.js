// src/config/config.js
// 环境配置管理

const config = {
  // 开发环境 - 使用生产环境API避免跨域问题
  development: {
    API_BASE_URL: 'https://backend-production-1d95.up.railway.app/api/v1',
    UPLOAD_BASE_URL: 'https://backend-production-1d95.up.railway.app',
    FRONTEND_URL: 'http://localhost:3000'
  },
  
  // 生产环境
  production: {
    API_BASE_URL: 'https://backend-production-1d95.up.railway.app/api/v1',
    UPLOAD_BASE_URL: 'https://backend-production-1d95.up.railway.app',
    FRONTEND_URL: 'https://capstonefrontend-production-4fdf.up.railway.app'
  }
};

// 获取当前环境
const getCurrentEnvironment = () => {
  // 检查是否在开发环境
  if (process.env.NODE_ENV === 'development' || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  return 'production';
};

// 导出当前环境的配置
export const currentConfig = config[getCurrentEnvironment()];

// 导出所有配置（用于调试）
export const allConfigs = config;

// 导出环境信息
export const isDevelopment = getCurrentEnvironment() === 'development';
export const isProduction = getCurrentEnvironment() === 'production';

export default currentConfig;
