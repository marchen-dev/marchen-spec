import { defineConfig, mergeConfig } from 'vitest/config'
import { sharedVitestConfig } from '../../vitest.config.js'

export default mergeConfig(
  sharedVitestConfig,
  defineConfig({
    test: {
      include: ['test/**/*.test.ts'],
    },
  }),
)
