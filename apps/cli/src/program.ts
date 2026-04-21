import { createRequire } from 'node:module'
import { Command } from 'commander'
import { registerArchiveCommand } from './commands/archive.js'
import { registerInitCommand } from './commands/init.js'
import { registerInstructionsCommand } from './commands/instructions.js'
import { registerListCommand } from './commands/list.js'
import { registerNewCommand } from './commands/new.js'
import { registerStatusCommand } from './commands/status.js'
import { registerUpdateCommand } from './commands/update.js'

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

/**
 * 构建 CLI 程序实例
 *
 * 注册所有命令并返回 Commander 程序实例
 */
export function buildCliProgram(): Command {
  const program = new Command()

  program
    .name('marchen')
    .description('Spec-driven development CLI')
    .version(version, '-v, --version')

  registerArchiveCommand(program)
  registerInitCommand(program)
  registerInstructionsCommand(program)
  registerListCommand(program)
  registerNewCommand(program)
  registerStatusCommand(program)
  registerUpdateCommand(program)

  return program
}
