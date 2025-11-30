import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // DataTables core
          'vendor-datatables': [
            'datatables.net',
            'datatables.net-dt',
            'datatables.net-react',
            'datatables.net-buttons-dt',
            'datatables.net-buttons',
          ],
          // Export libraries (large)
          'vendor-export': ['jszip', 'pdfmake'],
          // UI libraries
          'vendor-ui': ['@headlessui/react'],
          // Markdown rendering
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
})
