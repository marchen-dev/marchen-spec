import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { MarchenSpecError } from '@marchen-spec/shared'
import { createContext } from '../utils/context.js'

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

        if (error instanceof MarchenSpecError) {
          p.log.error(error.message)
        } else {
          p.log.error(`未知错误: ${error}`)
        }

        process.exit(1)
      }

      p.outro(`运行 marchen list 查看剩余变更`)
    })
}
