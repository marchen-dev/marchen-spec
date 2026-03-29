# @marchen-spec/core

## 包职责

核心业务逻辑层，实现 OpenSpec 工作流的用例、领域规则和业务逻辑。

## 依赖关系

```
@marchen-spec/shared
    ↑
    ├── @marchen-spec/config
    │       ↑
    │       └── @marchen-spec/core
    │
    └── @marchen-spec/fs
            ↑
            └── @marchen-spec/core
```

依赖 `@marchen-spec/shared`、`@marchen-spec/config`、`@marchen-spec/fs`，被 `@marchen-spec/cli` 依赖。

## 开发命令

```bash
# 构建
pnpm build

# 开发模式
pnpm dev

# 运行测试
pnpm test

# 类型检查
pnpm typecheck
```

## 核心功能

**基础检查**:
- `inspectFoundation()` - 检查项目基础结构，返回包边界信息
- `getFoundationStatus()` - 获取基础状态的格式化字符串

**初始化**:
- `checkIfInitialized()` - 检查是否已初始化 MarchenSpec
- `initializeMarchenSpec()` - 初始化目录结构（marchenspec/specs/, marchenspec/changes/, marchenspec/changes/archive/）和配置文件

**返回类型**:
- `FoundationStatus` - `{ root, specDirectory, changeDirectory, packageBoundaries }`

## 代码规范

### 用例函数
每个用例函数代表一个完整的业务操作：

```typescript
/**
 * 检查项目基础结构
 *
 * 返回 workspace 根目录、规范目录、变更目录和包边界信息
 *
 * @returns 基础结构状态
 */
export function inspectFoundation(): FoundationStatus

/**
 * 初始化 MarchenSpec 目录结构
 *
 * 创建必要的目录和配置文件
 */
export async function initializeMarchenSpec(): Promise<void>
```

## 注意事项

1. **纯业务逻辑**: 不包含 UI 交互代码，UI 由 CLI 层处理
2. **可测试性**: 所有核心逻辑必须有单元测试覆盖
3. **错误传播**: 使用明确的业务错误类型，便于上层处理
4. **依赖注入**: 考虑使用依赖注入提高可测试性
