import { SPEC_DIRECTORY_NAME } from '@marchen-spec/shared'

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
