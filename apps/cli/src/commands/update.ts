import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { ModelManager } from '@marchen-spec/core'
import { StateError } from '@marchen-spec/shared'
import { createContext } from '../utils/context.js'
import { handleError } from '../utils/error.js'
import { formatModelProgress } from '../utils/model-progress.js'

/**
 * 注册 update 命令
 *
 * 更新 skill/command 文件到最新版本，并按 config.yaml 同步搜索模型状态
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
        } else {
          const prev = result.previousVersion ?? 'unknown'
          p.log.info(`版本: ${prev} → ${result.currentVersion}`)

          for (const name of result.providersUpdated) {
            p.log.success(`已更新 ${name} skills`)
          }

          p.log.success('config.yaml 版本已更新')
        }

        // 按 search.mode 同步模型状态
        const config = await workspace.readConfig()
        const searchMode =
          (config.search as Record<string, unknown>)?.mode ?? 'auto'

        if (searchMode === 'semantic') {
          const modelManager = new ModelManager()
          const hasModels = await modelManager.hasLocalModels()

          if (hasModels) {
            p.log.info('Hybrid Search 已就绪')
          } else {
            const spinner = p.spinner()
            spinner.start('下载搜索模型...')
            await modelManager.ensureModels({
              onProgress: (prog) => {
                spinner.message(formatModelProgress(prog))
              },
            })
            spinner.stop('Hybrid Search 已启用')
          }
        } else if (searchMode === 'auto') {
          const modelManager = new ModelManager()
          const hasModels = await modelManager.hasLocalModels()
          p.log.info(
            hasModels
              ? '搜索模式: Auto（Hybrid Search 可用）'
              : '搜索模式: Auto（BM25 全文检索）',
          )
        }

        p.outro('更新完成！')
      } catch (error) {
        handleError(error)
      }
    })
}
