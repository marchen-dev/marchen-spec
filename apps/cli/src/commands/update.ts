import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { StateError } from '@marchen-spec/shared'
import { createContext } from '../utils/context.js'
import { handleError } from '../utils/error.js'

/**
 * 注册 update 命令
 *
 * 更新 skill/command 文件到最新版本
 *
 * @param program - Commander 程序实例
 */
export function registerUpdateCommand(program: Command): void {
  program
    .command('update')
    .description('更新 skill/command 文件到最新版本')
    .action(async () => {
      p.intro('MarchenSpec CLI')

      try {
        const { workspace } = createContext()
        const version = program.version() as string

        if (!(await workspace.isInitialized())) {
          throw new StateError(
            'MarchenSpec 尚未初始化',
            '请先运行 marchen init',
          )
        }

        const result = await workspace.update({ version })

        if (result.providersUpdated.length === 0) {
          p.log.info(`已是最新版本 (${result.currentVersion})`)
          p.outro('无需更新')
          return
        }

        const prev = result.previousVersion ?? 'unknown'
        p.log.info(`版本: ${prev} → ${result.currentVersion}`)

        for (const name of result.providersUpdated) {
          p.log.success(`已更新 ${name} skills`)
        }

        p.log.success('config.yaml 版本已更新')
        p.outro('更新完成！')
      } catch (error) {
        handleError(error)
      }
    })
}
