import { describe, expect, it } from 'vitest'
import { buildCliProgram } from '../src/index.js'

describe('buildCliProgram', () => {
  it('registers the info command', () => {
    const program = buildCliProgram()

    const commandNames = program.commands.map(command => command.name())

    expect(commandNames).toContain('info')
  })

  it('registers the init command', () => {
    const program = buildCliProgram()
    const initCommand = program.commands.find(cmd => cmd.name() === 'init')

    expect(initCommand).toBeDefined()
    expect(initCommand?.description()).toBe('初始化 MarchenSpec 目录结构')
  })
})
