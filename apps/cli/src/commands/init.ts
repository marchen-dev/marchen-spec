import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { checkIfInitialized, initializeMarchenSpec } from '@marchen-spec/core'

/**
 * 注册 init 命令
 *
 * 初始化 MarchenSpec 目录结构，创建 openspec/ 目录及默认配置
 *
 * @param program - Commander 程序实例
 */
export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('初始化 MarchenSpec 目录结构')
    .option('--force', '强制覆盖已存在的目录')
    .action(async (options) => {
      p.intro('MarchenSpec CLI')

      // 检查是否已初始化
      const alreadyExists = await checkIfInitialized()
      if (alreadyExists && !options.force) {
        // 目录已存在且未使用 --force，询问用户确认
        const confirm = await p.confirm({
          message: 'MarchenSpec 目录已存在，是否覆盖？',
        })

        if (p.isCancel(confirm) || !confirm) {
          p.cancel('操作已取消')
          process.exit(0)
        }
      }

      // 执行初始化
      await initializeMarchenSpec()

      p.outro('MarchenSpec 初始化成功！')
    })
}
