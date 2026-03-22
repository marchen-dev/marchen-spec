import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CHANGE_DIRECTORY_NAME, SPEC_DIRECTORY_NAME } from '@marchen-spec/shared'

export function resolveWorkspaceRoot(fromPath = process.cwd()): string {
  return resolve(fromPath)
}

export function getSpecDirectory(root = process.cwd()): string {
  return resolve(root, SPEC_DIRECTORY_NAME)
}

export function getChangeDirectory(root = process.cwd()): string {
  return resolve(getSpecDirectory(root), CHANGE_DIRECTORY_NAME)
}

export function getPackageRoot(importMetaUrl: string): string {
  return dirname(fileURLToPath(importMetaUrl))
}
