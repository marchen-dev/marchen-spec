import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { MarchenSpecError } from '@marchen-spec/shared'
import { createContext } from '../utils/context.js'

/**
 * 注册 new 命令
 *
 * 创建一个新的变更，包含目录结构和初始 artifact 文件
 *
 * @param program - Commander 程序实例
 */
export function registerNewCommand(program: Command): void {
  program
    .command('new')
    .description('创建一个新的变更')
    .argument('<name>', '变更名称（kebab-case，如 add-dark-mode）')
    .action(async (name: string) => {
      p.intro('MarchenSpec CLI')

      const spinner = p.spinner()
      spinner.start(`正在创建变更 "${name}"...`)

      try {
        const { changes } = createContext()
        await changes.create(name)
        spinner.stop(`变更 "${name}" 创建成功`)
      } catch (error) {
        spinner.stop('创建失败')

        if (error instanceof MarchenSpecError) {
          p.log.error(error.message)
        } else {
          p.log.error(`未知错误: ${error}`)
        }

        process.exit(1)
      }

      p.outro(`运行 marchen list 查看所有变更`)
    })
}
