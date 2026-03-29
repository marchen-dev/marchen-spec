import { fileURLToPath } from 'node:url'
import { Command } from 'commander'
import { registerInitCommand } from './commands/init.js'
import { registerNewCommand } from './commands/new.js'

export function buildCliProgram(): Command {
  const program = new Command()

  program
    .name('marchen')
    .description('OpenSpec-like spec workflow CLI')
    .version('0.1.0')

  registerInitCommand(program)
  registerNewCommand(program)

  return program
}

const entryFile = process.argv[1]
if (entryFile && fileURLToPath(import.meta.url) === entryFile) {
  const program = buildCliProgram()
  program.parse(process.argv)
}
