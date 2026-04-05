import { buildCliProgram } from './program.js'

export { buildCliProgram } from './program.js'

const program = buildCliProgram()
program.parse(process.argv)
