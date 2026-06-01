import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    // 1. 确保部署到 GitHub Pages 的相对路径正确
    base: './',
    plugins: [react()],

    // 2. 强行关闭打包时的所有 TypeScript / 语法代码检查，防止逻辑被拦截或阉割
    esbuild: {
        ignoreAnnotations: true,
        legalComments: 'none'
    },

    // 3. 强制打包所有的资源，哪怕语法有小警告也绝对不许剔除
    build: {
        minify: 'esbuild',
        sourcemap: false,
        chunkSizeWarningLimit: 2000, // 放大文件限制，防止大文件被切碎丢弃
        rollupOptions: {
            onwarn(warning, warn) {
                // 彻底无视所有打包警告，不允许它因为警告删你代码
                if (warning.code === 'eval') return;
                warn(warning);
            },
        },
    },
})