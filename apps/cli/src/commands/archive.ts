import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { createContext } from '../utils/context.js'
import { handleError } from '../utils/error.js'

/**
 * 注册 archive 命令
 *
 * 归档一个已完成的变更，将其移动到 archive 目录
 *
 * @param program - Commander 程序实例
 */
export function registerArchiveCommand(program: Command): void {
  program
    .command('archive')
    .description('归档一个已完成的变更')
    .argument('<name>', '变更名称')
    .option('--json', '输出 JSON 格式')
    .action(async (name: string, options: { json?: boolean }) => {
      try {
        const { changes } = createContext()
        const result = await changes.archive(name)

        if (options.json) {
          console.log(JSON.stringify(result, null, 2))
          return
        }

        p.intro('MarchenSpec CLI')
        p.log.success(`变更 "${name}" 归档成功`)
        p.outro(`运行 marchen list 查看剩余变更`)
      } catch (error) {
        handleError(error)
      }
    })
}
