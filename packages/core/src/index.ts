import type { PackageBoundary } from '@marchen-spec/shared'
import { defaultConfig } from '@marchen-spec/config'
import { getChangeDirectory, getSpecDirectory, resolveWorkspaceRoot } from '@marchen-spec/fs'

const packageBoundaries: PackageBoundary[] = [
  { name: '@marchen-spec/shared', dependsOn: [] },
  { name: '@marchen-spec/config', dependsOn: ['@marchen-spec/shared'] },
  { name: '@marchen-spec/fs', dependsOn: ['@marchen-spec/shared'] },
  {
    name: '@marchen-spec/core',
    dependsOn: ['@marchen-spec/config', '@marchen-spec/fs', '@marchen-spec/shared'],
  },
]

export interface FoundationStatus {
  readonly root: string
  readonly specDirectory: string
  readonly changeDirectory: string
  readonly packageBoundaries: readonly PackageBoundary[]
}

export function inspectFoundation(): FoundationStatus {
  const root = resolveWorkspaceRoot()

  return {
    root,
    specDirectory: getSpecDirectory(root),
    changeDirectory: getChangeDirectory(root),
    packageBoundaries,
  }
}

export function getFoundationStatus(): string {
  const foundation = inspectFoundation()

  return [
    'MarchenSpec foundation is ready.',
    `Workspace root: ${foundation.root}`,
    `Spec directory: ${defaultConfig.specDirectory}`,
    `Change directory: ${foundation.changeDirectory}`,
    `Packages: ${foundation.packageBoundaries.map(item => item.name).join(', ')}`,
  ].join('\n')
}

export { checkIfInitialized, initializeMarchenSpec } from './init.js'
