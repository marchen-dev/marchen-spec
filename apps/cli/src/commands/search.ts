import type { ModelDownloadProgress } from '@marchen-spec/core'
import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { SearchManager, Workspace } from '@marchen-spec/core'
import pc from 'picocolors'
import { handleError } from '../utils/error.js'

/** 模型类型显示名称 */
const MODEL_LABELS: Record<string, string> = {
  embed: 'Embedding',
  generate: 'Query Expansion',
  rerank: 'Reranker',
}

/** 格式化模型下载进度 */
function formatModelProgress(progress: ModelDownloadProgress): string {
  const name = MODEL_LABELS[progress.model] ?? progress.model

  switch (progress.stage) {
    case 'checking':
      return `检查模型 ${name}...`
    case 'downloading': {
      if (progress.downloadedBytes && progress.totalBytes) {
        const pct = Math.round(
          (progress.downloadedBytes / progress.totalBytes) * 100,
        )
        const mb = (progress.downloadedBytes / 1024 / 1024).toFixed(1)
        const total = (progress.totalBytes / 1024 / 1024).toFixed(0)
        return `下载模型 ${name}... ${mb}/${total} MB (${pct}%)`
      }
      return `下载模型 ${name}...`
    }
    case 'verifying':
      return `校验模型 ${name}...`
    case 'ready':
      return `模型 ${name} 就绪`
    default:
      return `准备模型 ${name}...`
  }
}

/**
 * 注册 search 命令
 *
 * 语义搜索归档变更历史
 *
 * @param program - Commander 程序实例
 */
export function registerSearchCommand(program: Command): void {
  program
    .command('search <query>')
    .description('语义搜索归档变更历史')
    .option('-n, --limit <number>', '结果数量', '5')
    .option('--min-score <number>', '最低分数阈值', '0.3')
    .option('--json', '输出 JSON 格式')
    .option('--rebuild', '重建索引后搜索')
    .action(
      async (
        query: string,
        options: {
          limit?: string
          minScore?: string
          json?: boolean
          rebuild?: boolean
        },
      ) => {
        const workspace = new Workspace()
        const search = new SearchManager(workspace)
        const spinner = options.json ? null : p.spinner()

        try {
          if (!(await search.isAvailable())) {
            p.log.error('搜索功能不可用（qmd 加载失败）')
            process.exit(1)
          }

          spinner?.start('准备搜索引擎...')
          await search.prepare({
            onModelProgress: (prog) => {
              spinner?.message(formatModelProgress(prog))
            },
            downloadIfMissing: false,
          })
          spinner?.stop('搜索引擎就绪')

          if (options.rebuild) {
            spinner?.start('正在重建索引...')
            await search.index()
            spinner?.stop('索引重建完成')
          }

          spinner?.start('搜索中...')

          const results = await search.search(query, {
            limit: Number(options.limit),
            minScore: Number(options.minScore),
          })

          spinner?.stop('搜索完成')

          if (options.json) {
            console.log(JSON.stringify(results, null, 2))
            await search.close()
            return
          }

          if (results.length === 0) {
            p.log.info('未找到匹配结果')
            await search.close()
            return
          }

          for (const r of results) {
            const score = Math.round(r.score * 100)
            const scoreColor =
              score >= 70
                ? pc.green(`${score}%`)
                : score >= 40
                  ? pc.yellow(`${score}%`)
                  : pc.dim(`${score}%`)
            p.log.info(`${pc.bold(r.path)}  ${scoreColor}`)
            if (r.snippet) {
              p.log.message(pc.dim(r.snippet.slice(0, 200)))
            }
          }

          await search.close()
        } catch (error) {
          spinner?.stop('搜索失败')
          handleError(error)
        }
      },
    )
}
