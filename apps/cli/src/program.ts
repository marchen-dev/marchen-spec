import { Command } from 'commander'
import { registerArchiveCommand } from './commands/archive.js'
import { registerInitCommand } from './commands/init.js'
import { registerListCommand } from './commands/list.js'
import { registerNewCommand } from './commands/new.js'

/**
 * 构建 CLI 程序实例
 *
 * 注册所有命令并返回 Commander 程序实例
 */
export function buildCliProgram(): Command {
  const program = new Command()

  program
    .name('marchen')
    .description('OpenSpec-like spec workflow CLI')
    .version('0.1.0')

  registerArchiveCommand(program)
  registerInitCommand(program)
  registerListCommand(program)
  registerNewCommand(program)

  return program
}
