import { describe, expect, it } from 'vitest'
import { inspectFoundation } from '../src/index.js'

describe('inspectFoundation', () => {
  it('returns the initial package boundaries', () => {
    const foundation = inspectFoundation()

    expect(foundation.packageBoundaries.map(item => item.name)).toEqual([
      '@marchen-spec/shared',
      '@marchen-spec/config',
      '@marchen-spec/fs',
      '@marchen-spec/core',
    ])
  })
})
