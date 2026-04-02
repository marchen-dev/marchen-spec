import * as p from '@clack/prompts'
import {
  FileSystemError,
  MarchenSpecError,
  StateError,
  ValidationError,
} from '@marchen-spec/shared'

/**
 * 统一错误处理，按错误类型差异化展示
 */
export function handleError(error: unknown): never {
  if (error instanceof StateError) {
    p.log.error(error.message)
    if (error.hint) p.log.info(error.hint)
  } else if (error instanceof ValidationError) {
    p.log.warn(error.message)
  } else if (error instanceof FileSystemError) {
    p.log.error(`${error.message}: ${error.path}`)
  } else if (error instanceof MarchenSpecError) {
    p.log.error(error.message)
  } else {
    p.log.error(`未知错误: ${error}`)
  }
  process.exit(1)
}
