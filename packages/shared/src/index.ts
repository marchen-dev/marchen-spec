export const SPEC_DIRECTORY_NAME = 'openspec'
export const CHANGE_DIRECTORY_NAME = 'changes'

export class MarchenSpecError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MarchenSpecError'
  }
}

export interface PackageBoundary {
  readonly name: string
  readonly dependsOn: readonly string[]
}
