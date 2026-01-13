import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Required polyfills for Solana/LazorKit SDK
    // The SDK relies on Node.js globals like Buffer
    nodePolyfills(),
  ],
  // Enable better error handling in development
  server: {
    port: 3000,
    open: true,
  },
  // Optimize build
  build: {
    target: 'esnext',
    sourcemap: true,
  },
});
