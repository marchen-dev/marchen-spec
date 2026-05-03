import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import {
  downloadFile,
  ensureDir,
  exists,
  getFileSize,
  readFile,
  removeFile,
  renameFile,
  sha256File,
  writeFile,
} from '@marchen-spec/fs'
import { StateError, ValidationError } from '@marchen-spec/shared'

/** 默认 QMD 模型 manifest 地址 */
const DEFAULT_MANIFEST_URL = 'https://models.suemor.com/qmd/manifest.json'

/** 默认 QMD 模型目录 */
const DEFAULT_MODEL_DIR = join(homedir(), '.marchen', 'models', 'qmd')

/** 本地 manifest 缓存路径 */
const LOCAL_MANIFEST_PATH = join(DEFAULT_MODEL_DIR, 'manifest.json')

/** 模型服务认证 headers */
const MODEL_AUTH_HEADERS = { 'X-Model-Token': 'suemor-qmd-2026' }

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
   * 检查本地是否已有 QMD 模型文件。
   *
   * 通过检查模型目录下是否存在 .gguf 文件判断。
   */
  async hasLocalModels(): Promise<boolean> {
    if (!(await exists(DEFAULT_MODEL_DIR))) return false
    const { readdir } = await import('node:fs/promises')
    const files = await readdir(DEFAULT_MODEL_DIR)
    return files.filter((f) => f.endsWith('.gguf')).length >= 3
  }

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

    await this.saveLocalManifest(manifest)

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

  /**
   * 从本地缓存的 manifest 解析模型路径。
   *
   * 仅检查文件存在性，不做 sha256 校验，适用于 search 等高频场景。
   * 本地 manifest 不存在时自动 fallback 到 ensureModels 生成。
   *
   * @returns 本地模型绝对路径
   */
  async resolveLocalModels(): Promise<QmdModelPaths> {
    if (!(await exists(LOCAL_MANIFEST_PATH))) {
      return this.ensureModels()
    }

    const raw = await readFile(LOCAL_MANIFEST_PATH)
    const manifest = JSON.parse(raw) as QmdModelManifest

    const kinds: QmdModelKind[] = ['embed', 'generate', 'rerank']
    const paths: Record<string, string> = {}

    for (const kind of kinds) {
      const item = manifest.models[kind]
      const filePath = resolve(DEFAULT_MODEL_DIR, item.file)
      if (!(await exists(filePath))) {
        throw new StateError(
          `模型文件缺失: ${item.file}`,
          '请运行 marchen update 下载模型',
        )
      }
      paths[kind] = filePath
    }

    return paths as unknown as QmdModelPaths
  }

  /** 获取远程模型 manifest */
  private async fetchManifest(): Promise<QmdModelManifest> {
    const response = await fetch(DEFAULT_MANIFEST_URL, {
      headers: MODEL_AUTH_HEADERS,
    })
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
      headers: MODEL_AUTH_HEADERS,
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

  /** 将 manifest 缓存到本地文件 */
  private async saveLocalManifest(manifest: QmdModelManifest): Promise<void> {
    await writeFile(LOCAL_MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  }
}
