import type {
  HybridQueryResult,
  SearchResult as QmdSearchResult,
  QMDStore,
} from '@tobilu/qmd'
import type { ModelDownloadProgress } from './model-manager.js'
import type { SearchMode, Workspace } from './workspace.js'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { StateError } from '@marchen-spec/shared'

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
  /** 搜索模式，从 config.yaml 读取后传入 */
  readonly mode?: SearchMode
}

/**
 * 搜索管理器
 *
 * 封装 qmd SDK，提供 Hybrid Search 和索引管理接口。
 * 模型存在时使用 Hybrid Search（BM25 + Vector + Reranking），不存在时降级为 BM25。
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
   * 根据 mode 决定搜索策略：
   * - bm25：跳过模型，直接使用 BM25 全文检索
   * - semantic：加载模型，使用 Hybrid Search，模型不存在时抛出错误
   * - auto/undefined：检测本地模型，有则 Hybrid Search，无则 BM25
   *
   * 幂等，重复调用立即返回。
   */
  async prepare(options?: PrepareOptions): Promise<void> {
    if (this.prepared) return

    const mode = options?.mode

    if (mode === 'bm25') {
      await this.initStore()
      this.prepared = true
      return
    }

    const { ModelManager } = await import('./model-manager.js')
    const modelManager = new ModelManager()

    if (mode === 'semantic') {
      const ensureOpts = options?.onModelProgress
        ? { onProgress: options.onModelProgress }
        : undefined
      try {
        const paths = await modelManager.ensureModels(ensureOpts)
        modelManager.applyEnv(paths)
        this.modelsReady = true
      } catch {
        throw new StateError(
          '搜索模型未安装',
          '请运行 marchen update 下载模型，或将 config.yaml 中 search.mode 改为 auto 或 bm25',
        )
      }
    } else {
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
    }

    await this.initStore()
    this.prepared = true
  }

  /** 搜索归档内容，无模型时降级为 BM25 */
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

  /** Hybrid Search（BM25 + Vector + Reranking） */
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

  /** BM25 全文检索（降级模式） */
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
