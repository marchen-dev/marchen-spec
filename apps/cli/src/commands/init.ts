import type { ModelDownloadProgress } from '@marchen-spec/core'
import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { AGENT_PROVIDERS } from '@marchen-spec/config'
import { ModelManager } from '@marchen-spec/core'
import { createContext } from '../utils/context.js'

/** 模型类型显示名称 */
const MODEL_LABELS: Record<string, string> = {
  embed: 'Embedding',
  generate: 'Query Expansion',
  rerank: 'Reranker',
}

/** 格式化模型下载进度 */
function formatModelProgress(progress: ModelDownloadProgress): string {
  const name = MODEL_LABELS[progress.model] ?? progress.model

  switch (progress.stage) {
    case 'checking':
      return `检查模型 ${name}...`
    case 'downloading': {
      if (progress.downloadedBytes && progress.totalBytes) {
        const pct = Math.round(
          (progress.downloadedBytes / progress.totalBytes) * 100,
        )
        const mb = (progress.downloadedBytes / 1024 / 1024).toFixed(1)
        const total = (progress.totalBytes / 1024 / 1024).toFixed(0)
        return `下载模型 ${name}... ${mb}/${total} MB (${pct}%)`
      }
      return `下载模型 ${name}...`
    }
    case 'verifying':
      return `校验模型 ${name}...`
    case 'ready':
      return `模型 ${name} 就绪`
    default:
      return `准备模型 ${name}...`
  }
}

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

      // 执行初始化
      await workspace.initialize({ providers: selectedProviders, version })

      const names = (selectedProviders as string[])
        .map((id) => AGENT_PROVIDERS[id]?.name ?? id)
        .join(', ')
      p.log.success(`已为 ${names} 生成 skills 文件`)

      // 询问是否下载搜索模型
      const modelManager = new ModelManager()
      const hasModels = await modelManager.hasLocalModels()

      if (hasModels) {
        p.log.info('语义搜索已就绪')
      } else {
        const downloadModels = await p.confirm({
          message: '是否启用语义搜索？（需要下载约 2GB 模型）',
          initialValue: false,
        })

        if (!p.isCancel(downloadModels) && downloadModels) {
          const spinner = p.spinner()
          spinner.start('下载搜索模型...')
          await modelManager.ensureModels({
            onProgress: (prog) => {
              spinner.message(formatModelProgress(prog))
            },
          })
          spinner.stop('语义搜索已启用')
        } else {
          p.log.info(
            '使用基础关键词搜索，后续可通过 marchen search --rebuild 启用语义搜索',
          )
        }
      }

      p.outro('MarchenSpec 初始化成功！')
    })
}
