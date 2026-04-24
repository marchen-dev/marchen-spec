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

/**
 * 搜索管理器
 *
 * 封装 qmd SDK，提供语义搜索和索引管理接口。
 * 通过 dynamic import 加载 qmd，加载失败时优雅降级。
 */
export class SearchManager {
  private store: any = null
  private available: boolean | null = null

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

  /** 懒初始化 qmd store */
  private async getStore(): Promise<any> {
    if (this.store) return this.store
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
    return this.store
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
    return results.map((r: any) => ({
      path: r.displayPath ?? r.path ?? '',
      title: r.title ?? '',
      score: r.score ?? 0,
      snippet: r.snippet ?? '',
      context: r.context ?? undefined,
    }))
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
  }
}
