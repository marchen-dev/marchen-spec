import type { Command } from 'commander'
import { createContext } from '../utils/context.js'
import { handleError } from '../utils/error.js'

/**
 * 注册 instructions 命令
 *
 * 返回指定 artifact 的创建指令，包含模板、指导文本、依赖 artifact 的内容
 * 和完成后解锁的 artifact 列表。
 *
 * 默认输出 JSON 格式（--json 标志可选但行为一致），主要给 Skill 消费。
 * 人类直接使用的场景较少。
 *
 * @param program - Commander 程序实例
 */
export function registerInstructionsCommand(program: Command): void {
  program
    .command('instructions')
    .description('获取 artifact 的创建指令')
    .argument('<name>', '变更名称')
    .argument('<artifact-id>', 'artifact 标识符 (proposal/specs/design/tasks)')
    .option('--json', '输出 JSON 格式（默认行为）')
    .action(async (name: string, artifactId: string) => {
      try {
        const { changes } = createContext()
        const result = await changes.getInstructions(name, artifactId)
        console.log(JSON.stringify(result, null, 2))
      } catch (error) {
        handleError(error)
      }
    })
}
