import type { ArtifactContentStatus } from '@marchen-spec/shared'
import type { Command } from 'commander'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { createContext } from '../utils/context.js'
import { handleError } from '../utils/error.js'

/** 各内容状态对应的 emoji 图标 */
const STATUS_ICONS: Record<ArtifactContentStatus, string> = {
  filled: '✅',
  empty: '⬜',
  missing: '⬜',
  'no-content': '⬜',
}

/** 为状态文字上色 */
function colorizeStatus(status: string): string {
  switch (status) {
    case 'filled':
      return pc.green(status)
    case 'empty':
      return pc.yellow(status)
    case 'blocked':
      return pc.red(status)
    default:
      return pc.dim(status)
  }
}

/** 为进度数字上色，附带进度条：全部完成绿色、部分完成黄色、零完成灰色 */
function colorizeProgress(completed: number, total: number): string {
  const barWidth = 10
  const filled = total > 0 ? Math.round((completed / total) * barWidth) : 0
  const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled)
  const text = `[${bar}] ${completed}/${total} 完成`
  if (completed === total) return pc.green(text)
  if (completed > 0) return pc.yellow(text)
  return pc.dim(text)
}

/**
 * 注册 status 命令
 *
 * 展示指定变更的 artifact 内容状态、工作流建议和 task 进度。
 * 支持两种输出模式：
 * - 默认：人类友好的终端 UI（emoji + 格式化文本）
 * - --json：结构化 JSON（给 Skill 消费）
 *
 * @param program - Commander 程序实例
 */
export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('查看变更的 artifact 状态和工作流建议')
    .argument('<name>', '变更名称')
    .option('--json', '输出 JSON 格式')
    .action(async (name: string, options: { json?: boolean }) => {
      try {
        const { changes } = createContext()
        const result = await changes.status(name)

        // JSON 模式：直接输出结构化数据，供 Skill 消费
        if (options.json) {
          console.log(JSON.stringify(result, null, 2))
          return
        }

        // ── 以下为人类友好的终端 UI 输出 ──

        p.intro('MarchenSpec CLI')

        // 展示变更基本信息（名称加粗 + schema 灰色，一行展示）
        p.log.info(`${pc.bold(result.name)} · ${pc.dim(result.schema)}`)

        // 构建 artifact 状态列表，每行格式：<图标> <名称> <状态> [附加信息]
        // 示例输出：
        //   ✅ proposal     filled
        //   🔒 specs        no-content (等待 proposal)
        //   ⬜ design       empty
        //   🔒 tasks        empty (等待 specs, design)
        const artifactLines = result.artifacts.map((a) => {
          // 被阻塞的 artifact 用 🔒 图标，否则根据内容状态选择图标
          const isBlocked = result.workflow.blocked.includes(a.id)
          const icon = isBlocked ? '🔒' : STATUS_ICONS[a.status]
          const statusText = isBlocked ? 'blocked' : a.status
          let line = `${icon} ${a.id.padEnd(12)} ${colorizeStatus(statusText)}`

          // specs 类型额外展示 capability 数量
          if (a.capabilities) {
            line += ` (${a.capabilities.length} capabilities)`
          }

          // 被阻塞时，追加提示：具体在等待哪些依赖完成
          if (isBlocked) {
            const deps = getDependencies(a.id)
            const missingDeps = deps.filter(
              (d) =>
                result.artifacts.find((art) => art.id === d)?.status !==
                'filled',
            )
            if (missingDeps.length > 0) {
              line += ` (等待 ${missingDeps.join(', ')})`
            }
          }
          return line
        })
        p.log.info(`Artifacts\n${artifactLines.join('\n')}`)

        // 展示 Artifacts + Tasks 总进度汇总
        const filledCount = result.artifacts.filter(
          (a) => a.status === 'filled',
        ).length
        const totalArtifacts = result.artifacts.length
        let progressLine = `Artifacts: ${colorizeProgress(filledCount, totalArtifacts)}`
        if (result.tasks) {
          progressLine += `\nTasks:     ${colorizeProgress(result.tasks.completed, result.tasks.total)}`
        }
        p.log.info(progressLine)

        // 展示下一步建议，引导用户继续工作流
        if (result.workflow.next) {
          p.outro(`下一步: ${pc.cyan(result.workflow.next)}`)
        } else {
          p.outro('所有 artifact 已就绪')
        }
      } catch (error) {
        handleError(error)
      }
    })
}

/**
 * 获取 artifact 的依赖列表
 *
 * 硬编码 full schema 的依赖关系，用于人类友好输出中
 * 展示被阻塞 artifact 等待的依赖名称。
 *
 * @param id - artifact 标识符
 * @returns 依赖的 artifact id 列表
 */
function getDependencies(id: string): string[] {
  const deps: Record<string, string[]> = {
    proposal: [],
    specs: ['proposal'],
    design: ['proposal'],
    tasks: ['specs', 'design'],
  }
  return deps[id] ?? []
}
