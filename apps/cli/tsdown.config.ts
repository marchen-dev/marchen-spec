import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  deps: {
    alwaysBundle: [/^@marchen-spec\//],
    neverBundle: ['@tobilu/qmd', 'node-llama-cpp'],
  },
  platform: 'node',
  format: ['esm'],
  dts: true,
  sourcemap: true,
  minify: true,
  clean: true,
  target: ['node20.19'],
  banner: {
    js: '#!/usr/bin/env node',
  },
})
