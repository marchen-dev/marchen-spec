# @marchen-spec/shared

## 包职责

基础层包，提供整个项目的共享类型、常量和错误定义。**无任何依赖**，是依赖图的最底层。

## 源码结构

```
src/
├── index.ts       # 统一 re-export
├── types.ts       # 接口和类型定义
├── constants.ts   # 常量定义
└── errors.ts      # 错误类定义
```

## 核心导出

**常量** (`constants.ts`):
- `SPEC_DIRECTORY_NAME = 'marchenspec'` - 规范目录名
- `CHANGE_DIRECTORY_NAME = 'changes'` - 变更目录名
- `METADATA_FILE_NAME = '.metadata.yaml'` - 元数据文件名

**错误** (`errors.ts`):
- `MarchenSpecError` - 自定义业务错误类

**类型** (`types.ts`):
- `PackageBoundary` - 包边界接口 `{ name, dependsOn }`
- `ChangeMetadata` - 变更元数据 `{ name, schema, createdAt, status }`
- `ChangeStatus` - 变更状态 `'open' | 'archived'`
- `ArtifactDefinition` - 制品定义 `{ id, generates, requires }`
- `SchemaDefinition` - Schema 定义 `{ name, artifacts }`

## 开发命令

```bash
pnpm build      # 构建
pnpm dev        # 开发模式
pnpm typecheck  # 类型检查
```

## 注意事项

1. **零依赖**: 不依赖任何其他 workspace 包或外部库
2. **类型优先**: 优先使用 TypeScript 类型而非运行时代码
3. **通用性**: 只放置真正被多个包共享的定义
