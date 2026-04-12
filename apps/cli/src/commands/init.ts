import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { createContext } from '../utils/context.js'

/**
 * 注册 init 命令
 *
 * 初始化 MarchenSpec 目录结构，创建 marchen/ 目录及默认配置
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

      const { workspace } = createContext()

      // 检查是否已初始化
      const alreadyExists = await workspace.isInitialized()
      if (alreadyExists && !options.force) {
        const confirm = await p.confirm({
          message: 'MarchenSpec 目录已存在，是否覆盖？',
        })

        if (p.isCancel(confirm) || !confirm) {
          p.cancel('操作已取消')
          process.exit(0)
        }
      }

      // 执行初始化
      await workspace.initialize()

      p.log.success('已生成 .claude/skills/ 和 .claude/commands/ 文件')
      p.outro('MarchenSpec 初始化成功！')
    })
}
