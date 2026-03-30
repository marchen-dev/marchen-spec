# @marchen-spec/config

## 包职责

配置层包，负责配置文件的加载、解析、验证和默认值管理。

## 依赖关系

```
@marchen-spec/shared
    ↑
@marchen-spec/config
```

只依赖 `@marchen-spec/shared`，被 `@marchen-spec/core` 依赖。

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

**核心导出**:
- `MarchenSpecConfig` - 配置接口 `{ specDirectory: string }`
- `defaultConfig` - 默认配置 `{ specDirectory: 'marchenspec' }`
- `defineMarchenSpecConfig(partial)` - 配置定义函数，合并用户配置与默认值
- `DEFAULT_SCHEMA` - 默认模式定义（spec-driven）
- `ARTIFACT_TEMPLATES` - 制品模板映射（proposal, design, tasks）
- `DESIGN_TEMPLATE` - 设计文档模板
- `PROPOSAL_TEMPLATE` - 提案文档模板
- `TASKS_TEMPLATE` - 任务清单模板

## 代码规范

### 配置定义函数
```typescript
/**
 * 定义 MarchenSpec 配置
 *
 * 合并用户提供的部分配置与默认值
 *
 * @param config - 部分配置对象
 * @returns 完整的配置对象
 */
export function defineMarchenSpecConfig(
  config?: Partial<MarchenSpecConfig>
): MarchenSpecConfig {
  return { ...defaultConfig, ...config }
}
```

## 注意事项

1. **配置集中**: 所有配置相关逻辑必须在此包，不要在其他包直接读取配置文件
2. **默认值**: 提供合理的默认值，减少用户配置负担
3. **验证完整**: 在配置加载时完成所有验证，避免运行时错误
