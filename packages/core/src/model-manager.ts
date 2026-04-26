import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import {
  downloadFile,
  ensureDir,
  exists,
  getFileSize,
  removeFile,
  renameFile,
  sha256File,
} from '@marchen-spec/fs'
import { ValidationError } from '@marchen-spec/shared'

/** 默认 QMD 模型 manifest 地址 */
const DEFAULT_MANIFEST_URL = 'https://models.suemor.com/qmd/manifest.json'

/** 默认 QMD 模型目录 */
const DEFAULT_MODEL_DIR = join(homedir(), '.marchen', 'models', 'qmd')

/** QMD 模型类型 */
export type QmdModelKind = 'embed' | 'generate' | 'rerank'

/** 模型下载阶段 */
export type ModelDownloadStage =
  | 'checking'
  | 'downloading'
  | 'verifying'
  | 'ready'

/** QMD 模型 manifest 中的单个模型条目 */
export interface QmdModelManifestItem {
  readonly file: string
  readonly url: string
  readonly sha256: string
  readonly size: number
}

/** QMD 模型 manifest */
export interface QmdModelManifest {
  readonly version: string
  readonly models: Record<QmdModelKind, QmdModelManifestItem>
}

/** 本地 QMD 模型路径 */
export interface QmdModelPaths {
  readonly embed: string
  readonly generate: string
  readonly rerank: string
}

/** 模型下载进度 */
export interface ModelDownloadProgress {
  readonly model: QmdModelKind
  readonly file: string
  readonly stage: ModelDownloadStage
  readonly downloadedBytes?: number
  readonly totalBytes?: number | null
}

/** 确保模型就绪选项 */
export interface EnsureModelsOptions {
  readonly onProgress?: (progress: ModelDownloadProgress) => void
}

/**
 * QMD 模型管理器
 *
 * 从自定义 manifest 源获取模型元数据，下载缺失模型到用户级目录，
 * 校验完整性后通过环境变量引导 qmd 使用本地模型。
 */
export class ModelManager {
  /**
   * 确保 QMD 所需模型已下载并通过校验。
   *
   * 按 embed → generate → rerank 顺序串行处理。
   *
   * @param options - 选项
   * @returns 本地模型绝对路径
   */
  async ensureModels(options?: EnsureModelsOptions): Promise<QmdModelPaths> {
    const manifest = await this.fetchManifest()
    await ensureDir(DEFAULT_MODEL_DIR)

    const embed = await this.ensureModel(
      'embed',
      manifest.models.embed,
      options,
    )
    const generate = await this.ensureModel(
      'generate',
      manifest.models.generate,
      options,
    )
    const rerank = await this.ensureModel(
      'rerank',
      manifest.models.rerank,
      options,
    )

    return { embed, generate, rerank }
  }

  /**
   * 将模型路径写入 QMD 环境变量。
   *
   * @param paths - 本地模型路径
   */
  applyEnv(paths: QmdModelPaths): void {
    process.env.QMD_EMBED_MODEL = paths.embed
    process.env.QMD_GENERATE_MODEL = paths.generate
    process.env.QMD_RERANK_MODEL = paths.rerank
  }

  /** 获取远程模型 manifest */
  private async fetchManifest(): Promise<QmdModelManifest> {
    const response = await fetch(DEFAULT_MANIFEST_URL)
    if (!response.ok) {
      throw new ValidationError(
        `模型 manifest 下载失败: HTTP ${response.status}`,
      )
    }
    return (await response.json()) as QmdModelManifest
  }

  /** 确保单个模型存在且校验通过 */
  private async ensureModel(
    kind: QmdModelKind,
    item: QmdModelManifestItem,
    options?: EnsureModelsOptions,
  ): Promise<string> {
    const targetPath = resolve(DEFAULT_MODEL_DIR, item.file)

    options?.onProgress?.({ model: kind, file: item.file, stage: 'checking' })

    if (await this.isValidFile(targetPath, item)) {
      options?.onProgress?.({ model: kind, file: item.file, stage: 'ready' })
      return targetPath
    }

    const tempPath = `${targetPath}.part`
    await removeFile(tempPath)

    options?.onProgress?.({
      model: kind,
      file: item.file,
      stage: 'downloading',
      downloadedBytes: 0,
      totalBytes: item.size,
    })

    await downloadFile(item.url, tempPath, {
      onProgress: (progress) => {
        options?.onProgress?.({
          model: kind,
          file: item.file,
          stage: 'downloading',
          downloadedBytes: progress.downloadedBytes,
          totalBytes: progress.totalBytes ?? item.size,
        })
      },
    })

    options?.onProgress?.({ model: kind, file: item.file, stage: 'verifying' })

    if (!(await this.isValidFile(tempPath, item))) {
      await removeFile(tempPath)
      throw new ValidationError(`模型校验失败: ${item.file}`)
    }

    await renameFile(tempPath, targetPath)

    options?.onProgress?.({ model: kind, file: item.file, stage: 'ready' })

    return targetPath
  }

  /** 判断本地文件是否与 manifest 中的 size 和 sha256 匹配 */
  private async isValidFile(
    filePath: string,
    item: QmdModelManifestItem,
  ): Promise<boolean> {
    if (!(await exists(filePath))) return false

    const size = await getFileSize(filePath)
    if (size !== item.size) return false

    const hash = await sha256File(filePath)
    return hash === item.sha256
  }
}
