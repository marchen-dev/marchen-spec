import { fileURLToPath } from 'node:url'
import { Command } from 'commander'
import { registerInfoCommand } from './commands/info.js'
import { registerInitCommand } from './commands/init.js'

export function buildCliProgram(): Command {
  const program = new Command()

  program
    .name('marchenspec')
    .description('OpenSpec-like spec workflow CLI')
    .version('0.1.0')

  registerInfoCommand(program)
  registerInitCommand(program)

  return program
}

const entryFile = process.argv[1]
if (entryFile && fileURLToPath(import.meta.url) === entryFile) {
  const program = buildCliProgram()
  program.parse(process.argv)
}
