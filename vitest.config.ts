import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'
import vue from '@vitejs/plugin-vue'

export default mergeConfig(
  viteConfig,
  defineConfig({
//    plugins: [
//      {
//        ...vue(),
//        apply: (config) => {
//          return config.mode === "test";
//        },
//      },
//    ],
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      globals: true,
      coverage: {
        provider: 'istanbul' // or 'v8'
      },
    },
  }),
)
