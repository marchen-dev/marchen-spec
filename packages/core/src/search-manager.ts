import type { HybridQueryResult, QMDStore } from '@tobilu/qmd'
import type { ModelDownloadProgress } from './model-manager.js'
import type { Workspace } from './workspace.js'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

/** 搜索结果项 */
export interface SearchResult {
  readonly path: string
  readonly title: string
  readonly score: number
  readonly snippet: string
  readonly context?: string
}

/** 搜索选项 */
export interface SearchOptions {
  readonly limit?: number
  readonly minScore?: number
}

/** 准备选项 */
export interface PrepareOptions {
  /** 模型下载进度回调 */
  readonly onModelProgress?: (progress: ModelDownloadProgress) => void
}

/**
 * 搜索管理器
 *
 * 封装 qmd SDK，提供语义搜索和索引管理接口。
 * 通过 dynamic import 加载 qmd，加载失败时优雅降级。
 */
export class SearchManager {
  private store: QMDStore | null = null
  private available: boolean | null = null
  private prepared = false

  constructor(private readonly workspace: Workspace) {}

  /** 检测 qmd SDK 是否可用 */
  async isAvailable(): Promise<boolean> {
    if (this.available !== null) return this.available
    try {
      await import('@tobilu/qmd')
      this.available = true
    } catch {
      this.available = false
    }
    return this.available
  }

  /**
   * 准备搜索引擎（模型 + store 初始化）。
   *
   * 是唯一接受进度回调的方法。幂等，重复调用立即返回。
   * 如果未显式调用，search/index 会自动触发（无进度回调）。
   */
  async prepare(options?: PrepareOptions): Promise<void> {
    if (this.prepared) return

    const { ModelManager } = await import('./model-manager.js')
    const modelManager = new ModelManager()
    const paths = await modelManager.ensureModels(
      options?.onModelProgress
        ? { onProgress: options.onModelProgress }
        : undefined,
    )
    modelManager.applyEnv(paths)

    await this.initStore()
    this.prepared = true
  }

  /** 语义搜索归档内容 */
  async search(
    query: string,
    options?: SearchOptions,
  ): Promise<SearchResult[]> {
    const store = await this.getStore()
    const results = await store.search({
      query,
      limit: options?.limit ?? 5,
      minScore: options?.minScore ?? 0.3,
    })
    return results.map((r: HybridQueryResult) => {
      const result: SearchResult = {
        path: r.displayPath,
        title: r.title,
        score: r.score,
        snippet: r.bestChunk,
      }
      if (r.context) {
        return { ...result, context: r.context }
      }
      return result
    })
  }

  /** 全量索引（扫描 + embedding） */
  async index(): Promise<void> {
    const store = await this.getStore()
    await store.update({ collections: ['archive'] })
    await store.embed()
  }

  /** 增量索引（archive 后调用） */
  async indexChange(): Promise<void> {
    const store = await this.getStore()
    await store.update({ collections: ['archive'] })
    await store.embed()
  }

  /** 释放资源 */
  async close(): Promise<void> {
    await this.store?.close()
    this.store = null
    this.prepared = false
  }

  /** 确保 store 就绪，未 prepare 时自动触发 */
  private async getStore(): Promise<QMDStore> {
    if (!this.prepared) await this.prepare()
    return this.store!
  }

  /** 初始化 qmd store */
  private async initStore(): Promise<void> {
    const { createStore } = await import('@tobilu/qmd')
    await mkdir(dirname(this.workspace.searchDbPath), { recursive: true })
    this.store = await createStore({
      dbPath: this.workspace.searchDbPath,
      config: {
        collections: {
          archive: {
            path: this.workspace.archiveDir,
            pattern: '**/*.md',
          },
        },
      },
    })
    await this.store.addContext(
      'archive',
      '/',
      'MarchenSpec 变更历史归档，包含 proposal（动机）、design（设计决策）、specs（规格）、tasks（任务清单）',
    )
  }
}
