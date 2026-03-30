import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { listChanges } from '@marchen-spec/core'
import { MarchenSpecError } from '@marchen-spec/shared'

/**
 * 将 ISO 时间字符串转换为相对时间描述
 *
 * @param isoDate - ISO 8601 格式的日期字符串
 * @returns 相对时间描述（如「刚刚」「3 小时前」「5 天前」）
 */
export function timeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)

  if (seconds < 60) return '刚刚'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前`
  return `${Math.floor(seconds / 86400)} 天前`
}

/**
 * 注册 list 命令
 *
 * 列出所有 open 状态的变更，展示名称、schema 和创建时间
 *
 * @param program - Commander 程序实例
 */
export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('列出所有 open 状态的变更')
    .action(async () => {
      p.intro('MarchenSpec CLI')

      try {
        const changes = await listChanges()

        if (changes.length === 0) {
          p.log.info('暂无 open 状态的变更')
          p.outro('运行 marchen new <name> 创建一个变更')
          return
        }

        // 计算各列最大宽度，用于对齐
        const nameWidth = Math.max(4, ...changes.map((c) => c.name.length))
        const schemaWidth = Math.max(6, ...changes.map((c) => c.schema.length))

        // 表头
        const header = `${'名称'.padEnd(nameWidth - 2)}  ${'Schema'.padEnd(schemaWidth)}  创建时间`
        const separator = '─'.repeat(header.length + 4)

        p.log.info(`共 ${changes.length} 个 open 变更：\n`)
        p.log.message(header)
        p.log.message(separator)

        // 逐行输出变更信息
        for (const change of changes) {
          const row = `${change.name.padEnd(nameWidth)}  ${change.schema.padEnd(schemaWidth)}  ${timeAgo(change.createdAt)}`
          p.log.message(row)
        }

        p.outro('运行 marchen status <name> 查看变更详情')
      } catch (error) {
        if (error instanceof MarchenSpecError) {
          p.log.error(error.message)
        } else {
          p.log.error(`未知错误: ${error}`)
        }

        process.exit(1)
      }
    })
}
