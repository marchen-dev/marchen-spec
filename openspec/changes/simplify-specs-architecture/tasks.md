## Tasks

### Task 1: 删除 workspace.ts 中 main specs 目录创建逻辑

修改 `packages/core/src/workspace.ts` 的 `initialize()` 方法：
- 删除 `ensureDir(join(this.specDir, 'specs'))`
- 删除 `writeFile(join(this.specDir, 'specs', '.gitkeep'), '')`
- 更新 JSDoc 注释

### Task 2: 更新 workspace 测试

修改 `packages/core/test/workspace.test.ts`：
- 移除对 `specs/` 目录创建的断言
- 确保其他断言不受影响

### Task 3: 实现 archive 方法

在 `packages/core/src/change-manager.ts` 中添加 `archive(name: string)` 方法：
- 检查变更是否存在
- 生成归档目录名 `YYYY-MM-DD-<name>`
- 移动目录到 `archive/`
- 更新 metadata（status → archived, 添加 archivedAt）

### Task 4: 在 fs 包中添加 move 操作

在 `packages/fs/src/directory.ts` 中添加 `moveDir(src, dest)` 方法：
- 使用 `fs.rename` 或 `fs-extra.move`
- 处理跨设备移动的情况

### Task 5: 实现 archive CLI 命令

创建 `apps/cli/src/commands/archive.ts`：
- 注册 `marchen archive <name>` 命令
- 调用 `changeManager.archive(name)`
- 显示成功/失败信息

### Task 6: 更新 CLAUDE.md

更新文档说明：
- 移除 `marchenspec/specs/` 的引用
- 说明 archive 作为唯一真相来源
- 添加 archive 命令说明

### Task 7: 删除现有的 openspec/specs/ 目录

- 删除 `openspec/specs/` 目录及所有内容
- 这是项目自身的 specs 目录清理
