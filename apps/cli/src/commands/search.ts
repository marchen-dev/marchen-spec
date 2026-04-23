import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { SearchManager, Workspace } from '@marchen-spec/core'
import pc from 'picocolors'
import { handleError } from '../utils/error.js'

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
        try {
          const workspace = new Workspace()
          const search = new SearchManager(workspace)

          if (!(await search.isAvailable())) {
            p.log.error('搜索功能不可用（qmd 加载失败）')
            process.exit(1)
          }

          if (options.rebuild) {
            if (!options.json) p.log.info('正在重建索引...')
            await search.index()
            if (!options.json) p.log.success('索引重建完成')
          }

          const results = await search.search(query, {
            limit: Number(options.limit),
            minScore: Number(options.minScore),
          })

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
          handleError(error)
        }
      },
    )
}
