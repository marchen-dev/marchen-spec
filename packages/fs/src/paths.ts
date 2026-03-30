import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CHANGE_DIRECTORY_NAME,
  SPEC_DIRECTORY_NAME,
} from '@marchen-spec/shared'

// ============================================================
// 路径解析
// ============================================================

/**
 * 解析 workspace 根目录路径
 */
export function resolveWorkspaceRoot(fromPath = process.cwd()): string {
  return resolve(fromPath)
}

/**
 * 获取规范目录路径
 */
export function getSpecDirectory(root = process.cwd()): string {
  return resolve(root, SPEC_DIRECTORY_NAME)
}

/**
 * 获取变更目录路径
 */
export function getChangeDirectory(root = process.cwd()): string {
  return resolve(getSpecDirectory(root), CHANGE_DIRECTORY_NAME)
}

/**
 * 获取包根目录路径（基于 import.meta.url）
 */
export function getPackageRoot(importMetaUrl: string): string {
  return dirname(fileURLToPath(importMetaUrl))
}
