import { SPEC_DIRECTORY_NAME } from '@marchen-spec/shared'

export { COMMAND_TEMPLATES } from './commands.js'
export type { CommandTemplate } from './commands.js'
export {
  APPLY_INSTRUCTION,
  DEFAULT_SCHEMA_NAME,
  getSchema,
  SCHEMAS,
} from './schema.js'
export { SKILL_TEMPLATES } from './skills.js'
export type { SkillTemplate } from './skills.js'
export {
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
