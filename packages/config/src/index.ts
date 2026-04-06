import { SPEC_DIRECTORY_NAME } from '@marchen-spec/shared'

export { COMMAND_TEMPLATES } from './commands.js'
export type { CommandTemplate } from './commands.js'
export { ARTIFACT_INSTRUCTIONS } from './instructions.js'
export { DEFAULT_SCHEMA } from './schema.js'
export { SKILL_TEMPLATES } from './skills.js'
export type { SkillTemplate } from './skills.js'
export {
  ARTIFACT_TEMPLATES,
  DESIGN_TEMPLATE,
  PROPOSAL_TEMPLATE,
  TASKS_TEMPLATE,
} from './templates.js'

export interface MarchenSpecConfig {
  readonly specDirectory: string
}

export const defaultConfig: MarchenSpecConfig = {
  specDirectory: SPEC_DIRECTORY_NAME,
}

export function defineMarchenSpecConfig(
  config: Partial<MarchenSpecConfig> = {},
): MarchenSpecConfig {
  return {
    ...defaultConfig,
    ...config,
  }
}
