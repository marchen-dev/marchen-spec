# @marchen-spec/shared

## 包职责

基础层包，提供整个项目的共享类型、常量和错误定义。**无任何依赖**，是依赖图的最底层。

**核心导出**:
- `SPEC_DIRECTORY_NAME = 'marchenspec'` - 规范目录名常量
- `CHANGE_DIRECTORY_NAME = 'changes'` - 变更目录名常量
- `MarchenSpecError` - 自定义错误类
- `PackageBoundary` - 包边界接口 `{ name: string, dependsOn: string[] }`

## 架构原则

- **零依赖**: 不依赖任何其他 workspace 包或外部库
- **纯类型**: 主要导出 TypeScript 类型定义和接口
- **基础工具**: 提供最基础的常量、枚举、错误类

## 开发命令

```bash
# 构建
pnpm build

# 开发模式
pnpm dev

# 类型检查
pnpm typecheck
```

## 代码规范

### 类型定义
所有导出的类型必须添加 JSDoc 注释：

```typescript
/**
 * 包边界信息
 *
 * 描述 workspace 中单个包的元数据
 */
export interface PackageBoundary {
  /** 包名（如 @marchen-spec/core） */
  name: string
  /** 包的绝对路径 */
  path: string
  /** 依赖的其他包名列表 */
  dependencies: string[]
}
```

### 错误类
自定义错误类需要继承 Error 并添加说明：

```typescript
/**
 * 配置验证失败错误
 */
export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigValidationError'
  }
}
```

## 注意事项

1. **不要添加依赖**: 此包必须保持零依赖，任何新增依赖都会破坏架构
2. **类型优先**: 优先使用 TypeScript 类型而非运行时代码
3. **通用性**: 只放置真正被多个包共享的定义，避免过度抽象
