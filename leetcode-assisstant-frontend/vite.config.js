import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build:{
    outDir:"dist",
    rollupOptions:{
      input:{
        main:resolve(__dirname,"index.html"),
        "content_script":resolve(__dirname,"src/content-script/problemDetector.js"),
        "service_worker":resolve(__dirname,"src/service-worker.js")
      },
      output:{
        entryFileNames:"[name].js",
        chunkFileNames:"assets/[name]-[hash].js",
        assetFileNames:"assets/[name]-[hash].[ext]"
      }
    }
  }
})
