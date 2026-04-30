import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { AGENT_PROVIDERS } from '@marchen-spec/config'
import { ModelManager } from '@marchen-spec/core'
import { createContext } from '../utils/context.js'
import { formatModelProgress } from '../utils/model-progress.js'

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

      // 选择 AI 工具
      const providerOptions = Object.values(AGENT_PROVIDERS).map(
        (provider) => ({
          value: provider.id,
          label: provider.name,
        }),
      )

      const selectedProviders = await p.multiselect({
        message: '选择要安装的 AI 工具集成',
        options: providerOptions,
        initialValues: ['claude-code'],
        required: true,
      })

      if (p.isCancel(selectedProviders)) {
        p.cancel('操作已取消')
        process.exit(0)
      }

      const version = program.version() as string

      // 是否启用搜索
      const searchEnabled = await p.confirm({
        message: '是否启用搜索？（需下载约 2GB 模型）',
        initialValue: false,
      })

      if (p.isCancel(searchEnabled)) {
        p.cancel('操作已取消')
        process.exit(0)
      }

      // 执行初始化
      await workspace.initialize({
        providers: selectedProviders,
        version,
        searchEnabled,
      })

      const names = (selectedProviders as string[])
        .map((id) => AGENT_PROVIDERS[id]?.name ?? id)
        .join(', ')
      p.log.success(`已为 ${names} 生成 skills 文件`)

      // 启用搜索时下载模型
      if (searchEnabled) {
        const modelManager = new ModelManager()
        const spinner = p.spinner()
        spinner.start('下载搜索模型...')
        await modelManager.ensureModels({
          onProgress: (prog) => {
            spinner.message(formatModelProgress(prog))
          },
        })
        spinner.stop('Hybrid Search 已启用')
      }

      p.outro('MarchenSpec 初始化成功！')
    })
}
