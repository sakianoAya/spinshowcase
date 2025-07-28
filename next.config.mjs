/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  
  // 確保靜態資源正確處理
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  
  // 優化配置
  experimental: {
    optimizeCss: true,
  },
  
  // 圖片優化配置
  images: {
    domains: ['raw.githubusercontent.com', 'blob.v0.dev'],
    unoptimized: true,
  },
  
  // Webpack 配置
  webpack: (config, { isServer }) => {
    // 確保客戶端和服務端構建一致性
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
  
  // 環境變量配置
  env: {
    CUSTOM_KEY: 'spineshowcase',
  },
  
  // ESLint 配置
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
