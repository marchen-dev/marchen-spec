import type {
  HybridQueryResult,
  SearchResult as QmdSearchResult,
  QMDStore,
} from '@tobilu/qmd'
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
  /** 本地无模型时是否触发下载，默认 false（降级为 BM25） */
  readonly downloadIfMissing?: boolean
}

/**
 * 搜索管理器
 *
 * 封装 qmd SDK，提供语义搜索和索引管理接口。
 * 模型存在时使用完整语义搜索，不存在时自动降级为 BM25 关键词搜索。
 */
export class SearchManager {
  private store: QMDStore | null = null
  private available: boolean | null = null
  private prepared = false
  private modelsReady = false

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
   * 准备搜索引擎。
   *
   * 有 onModelProgress 回调时正常下载模型；无回调且模型不存在时跳过模型，降级为 FTS。
   * 幂等，重复调用立即返回。
   */
  async prepare(options?: PrepareOptions): Promise<void> {
    if (this.prepared) return

    const { ModelManager } = await import('./model-manager.js')
    const modelManager = new ModelManager()

    const shouldLoad =
      options?.downloadIfMissing || (await modelManager.hasLocalModels())

    if (shouldLoad) {
      const ensureOpts = options?.onModelProgress
        ? { onProgress: options.onModelProgress }
        : undefined
      const paths = await modelManager.ensureModels(ensureOpts)
      modelManager.applyEnv(paths)
      this.modelsReady = true
    }

    await this.initStore()
    this.prepared = true
  }

  /** 语义搜索归档内容，无模型时自动降级为 BM25 */
  async search(
    query: string,
    options?: SearchOptions,
  ): Promise<SearchResult[]> {
    const store = await this.getStore()
    await this.ensureIndexed(store)
    const limit = options?.limit ?? 5
    const minScore = options?.minScore ?? 0.3

    if (this.modelsReady) {
      return this.hybridSearch(store, query, limit, minScore)
    }
    return this.ftsSearch(store, query, limit)
  }

  /** 全量索引（扫描 + embedding），无模型时跳过 embed */
  async index(): Promise<void> {
    const store = await this.getStore()
    await store.update({ collections: ['archive'] })
    if (this.modelsReady) {
      await store.embed()
    }
  }

  /** 增量索引（archive 后调用），无模型时跳过 embed */
  async indexChange(): Promise<void> {
    const store = await this.getStore()
    await store.update({ collections: ['archive'] })
    if (this.modelsReady) {
      await store.embed()
    }
  }

  /** 释放资源 */
  async close(): Promise<void> {
    await this.store?.close()
    this.store = null
    this.prepared = false
    this.modelsReady = false
  }

  /** 索引为空时自动触发首次扫描 */
  private async ensureIndexed(store: QMDStore): Promise<void> {
    const status = await store.getStatus()
    if (status.totalDocuments === 0) {
      await store.update({ collections: ['archive'] })
      if (this.modelsReady) {
        await store.embed()
      }
    }
  }

  /** 完整语义搜索（BM25 + vector + reranking） */
  private async hybridSearch(
    store: QMDStore,
    query: string,
    limit: number,
    minScore: number,
  ): Promise<SearchResult[]> {
    const results = await store.search({ query, limit, minScore })
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

  /** BM25 关键词搜索（降级模式） */
  private async ftsSearch(
    store: QMDStore,
    query: string,
    limit: number,
  ): Promise<SearchResult[]> {
    const results = await store.searchLex(query, { limit })
    return results.map((r: QmdSearchResult) => {
      const snippet = r.body?.slice(0, 200) ?? ''
      const result: SearchResult = {
        path: r.displayPath,
        title: r.title,
        score: r.score,
        snippet,
      }
      if (r.context) {
        return { ...result, context: r.context }
      }
      return result
    })
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
