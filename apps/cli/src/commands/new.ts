import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { SCHEMAS } from '@marchen-spec/config'
import { createContext } from '../utils/context.js'
import { handleError } from '../utils/error.js'

/**
 * 注册 new 命令
 *
 * 创建一个新的变更，包含目录结构和元数据
 *
 * @param program - Commander 程序实例
 */
export function registerNewCommand(program: Command): void {
  program
    .command('new')
    .description('创建一个新的变更')
    .argument('<name>', '变更名称（kebab-case，如 add-dark-mode）')
    .option('--schema <name>', '工作流 schema', 'full')
    .action(async (name: string, options: { schema: string }) => {
      p.intro('MarchenSpec CLI')

      // 校验 schema 名称
      if (!SCHEMAS[options.schema]) {
        const available = Object.keys(SCHEMAS).join(', ')
        p.log.error(
          `Schema "${options.schema}" 不存在，可用的 schema: ${available}`,
        )
        process.exit(1)
      }

      const spinner = p.spinner()
      spinner.start(`正在创建变更 "${name}"...`)

      try {
        const { changes } = createContext()
        await changes.create(name, options.schema)
        spinner.stop(`变更 "${name}" 创建成功（schema: ${options.schema}）`)
      } catch (error) {
        spinner.stop('创建失败')
        handleError(error)
      }

      p.outro(`运行 marchen list 查看所有变更`)
    })
}
