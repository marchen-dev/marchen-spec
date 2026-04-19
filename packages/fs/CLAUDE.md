# @marchen-spec/fs

## 包职责

文件系统层包，封装所有文件和目录操作。按职责拆分为 4 个模块。

## 依赖关系

```
@marchen-spec/shared
    ↑
@marchen-spec/fs
```

只依赖 `@marchen-spec/shared`（+ 外部依赖 `js-yaml`），被 `@marchen-spec/core` 依赖。

## 源码结构

```
src/
├── index.ts       # 统一 re-export
├── paths.ts       # 路径解析
├── directory.ts   # 目录操作
├── file.ts        # 文件读写
└── yaml.ts        # YAML 操作
```

## 核心导出

**路径解析** (`paths.ts`):
- `resolveWorkspaceRoot(fromPath?)` - 解析 workspace 根目录
- `getSpecDirectory(root?)` - 获取规范目录路径
- `getChangeDirectory(root?)` - 获取变更目录路径
- `getArchiveDirectory(root?)` - 获取归档目录路径
- `getPackageRoot(importMetaUrl)` - 获取包根目录

**目录操作** (`directory.ts`):
- `ensureDir(path)` - 递归创建目录（已存在时静默）
- `exists(path)` - 检查路径是否存在
- `moveDir(src, dest)` - 移动目录到新位置
- `listDir(path)` - 列出目录内容

**文件 I/O** (`file.ts`):
- `readFile(path)` - 读取文件（UTF-8）
- `writeFile(path, content)` - 写入文件（自动创建父目录）
- `appendFile(path, content)` - 追加内容到文件

**YAML 操作** (`yaml.ts`):
- `readYaml<T>(path)` - 读取并解析 YAML 文件
- `writeYaml(path, data)` - 写入 YAML 文件（2 空格缩进）

## 开发命令

```bash
pnpm build      # 构建
pnpm dev        # 开发模式
pnpm test       # 运行测试
pnpm typecheck  # 类型检查
```

## 注意事项

1. **统一入口**: 其他包不应直接使用 Node.js fs 模块，必须通过此包
2. **异步优先**: 所有操作使用 async API
3. **错误封装**: 文件系统错误转换为 `MarchenSpecError`
