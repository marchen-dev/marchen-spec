import type { Command } from 'commander'
import { getFoundationStatus } from '@marchen-spec/core'
import { showIntro, showOutro } from '../ui/log.js'

export function registerInfoCommand(program: Command): void {
  program
    .command('info')
    .description('Show the current workspace foundation status')
    .action(() => {
      showIntro()
      showOutro(getFoundationStatus())
    })
}
