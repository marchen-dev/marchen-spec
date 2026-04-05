import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { createContext } from '../utils/context.js'
import { handleError } from '../utils/error.js'

/**
 * 注册 verify 命令
 *
 * 展示指定变更的 artifact 完整度和 task 完成情况
 *
 * @param program - Commander 程序实例
 */
export function registerVerifyCommand(program: Command): void {
  program
    .command('verify')
    .description('验证变更的 artifact 完整度和 task 完成情况')
    .argument('<name>', '变更名称')
    .option('--json', '输出 JSON 格式')
    .action(async (name: string, options: { json?: boolean }) => {
      try {
        const { changes } = createContext()
        const result = await changes.verify(name)

        // JSON 模式：直接输出结构化数据
        if (options.json) {
          console.log(JSON.stringify(result, null, 2))
          return
        }

        // 终端 UI 模式
        p.intro('MarchenSpec CLI')

        // Artifact 状态
        const artifactLines = result.artifacts.map((a) => {
          const icon = a.exists ? '✓' : '✗'
          let line = `${icon} ${a.id}`
          if (a.capabilities) {
            if (a.capabilities.length > 0) {
              line += ` (${a.capabilities.length} 个 capability)`
              for (const cap of a.capabilities) {
                line += `\n    · ${cap}`
              }
            } else {
              line += ` (空)`
            }
          }
          return line
        })
        p.log.info(`Artifacts\n${artifactLines.join('\n')}`)

        // Task 完成度
        if (result.tasks) {
          const { total, completed, items } = result.tasks
          const incomplete = items.filter((item) => !item.completed)

          let taskInfo = `Tasks: ${completed}/${total} 完成`
          if (incomplete.length > 0) {
            const lines = incomplete.map((item) => `☐ ${item.description}`)
            taskInfo += `\n${lines.join('\n')}`
          }
          p.log.info(taskInfo)
        } else {
          p.log.info('Tasks: 无 tasks 文件')
        }

        p.outro('验证完成')
      } catch (error) {
        handleError(error)
      }
    })
}
