import { describe, expect, it } from 'vitest'
import { buildCliProgram } from '../src/index.js'

describe('buildCliProgram', () => {
  it('registers the info command', () => {
    const program = buildCliProgram()

    const commandNames = program.commands.map(command => command.name())

    expect(commandNames).toContain('info')
  })
})
