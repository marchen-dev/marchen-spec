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
    .action(async (name: string) => {
      p.intro('MarchenSpec CLI')

      const spinner = p.spinner()
      spinner.start(`正在归档变更 "${name}"...`)

      try {
        const { changes } = createContext()
        await changes.archive(name)
        spinner.stop(`变更 "${name}" 归档成功`)
      } catch (error) {
        spinner.stop('归档失败')
        handleError(error)
      }

      p.outro(`运行 marchen list 查看剩余变更`)
    })
}
