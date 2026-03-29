# @marchen-spec/fs

## 包职责

文件系统层包，封装所有文件和目录操作，提供仓库访问接口。

## 依赖关系

```
@marchen-spec/shared
    ↑
@marchen-spec/fs
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

**路径解析**:
- `resolveWorkspaceRoot(fromPath?)` - 解析 workspace 根目录
- `getSpecDirectory(root?)` - 获取规范目录路径
- `getChangeDirectory(root?)` - 获取变更目录路径
- `getPackageRoot(importMetaUrl)` - 获取包根目录

**目录操作**:
- `ensureDir(path)` - 递归创建目录（已存在时静默）
- `exists(path)` - 检查路径是否存在
- `listDir(path)` - 列出目录内容

**文件 I/O**:
- `readFile(path)` - 读取文件（UTF-8）
- `writeFile(path, content)` - 写入文件（自动创建父目录）

**YAML 操作**:
- `readYaml<T>(path)` - 读取并解析 YAML 文件
- `writeYaml(path, data)` - 写入 YAML 文件（2 空格缩进）

**外部依赖**: `js-yaml` (^4.1.0)

## 代码规范

### 文件操作函数
```typescript
/**
 * 读取文件内容
 *
 * @param filePath - 文件路径
 * @returns 文件内容（UTF-8）
 * @throws 文件不存在时抛出 ENOENT
 */
export async function readFile(filePath: string): Promise<string>

/**
 * 写入文件内容
 *
 * @param filePath - 文件路径
 * @param content - 文件内容
 * @throws 写入失败时抛出错误
 */
export async function writeFile(filePath: string, content: string): Promise<void>
```

## 注意事项

1. **统一入口**: 其他包不应直接使用 Node.js fs 模块，必须通过此包
2. **路径处理**: 统一使用 POSIX 风格路径，处理跨平台兼容性
3. **异步优先**: 优先使用异步 API，避免阻塞操作
4. **错误封装**: 将底层文件系统错误转换为业务错误
