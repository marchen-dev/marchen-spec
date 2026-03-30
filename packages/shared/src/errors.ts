/**
 * MarchenSpec 统一错误类
 *
 * 用于所有业务逻辑错误的抛出和捕获
 */
export class MarchenSpecError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MarchenSpecError'
  }
}
