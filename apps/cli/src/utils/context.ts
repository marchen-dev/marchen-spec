import { ChangeManager, Workspace } from '@marchen-spec/core'

/**
 * 创建 CLI 上下文，包含 workspace 和 change manager 实例
 */
export function createContext(): {
  workspace: Workspace
  changes: ChangeManager
} {
  const workspace = new Workspace()
  const changes = new ChangeManager(workspace)
  return { workspace, changes }
}
