## 背景

当前 `MarchenSpecError` 是唯一的业务错误类，所有 8 处 throw 都使用它。CLI 层只能 `instanceof MarchenSpecError` 统一处理，无法区分错误性质。三个命令（new、list、archive）各自重复几乎相同的 catch 代码。

## 目标与非目标

**目标：**
- 按错误性质分为三个子类，支持差异化处理
- 每个子类携带结构化数据（不只是 message 字符串）
- CLI 层抽取共享 `handleError()`，消除重复
- 保持 `instanceof MarchenSpecError` 向后兼容

**非目标：**
- 不做 i18n / 错误码体系
- 不改变错误的抛出时机和业务逻辑
- 不引入 Result 类型或 Either 模式

## 决策

### 1. 子类继承而非错误码

选择子类继承（方案 B）而非给基类加 `code` 字段（方案 A）。

理由：每个错误类型需要不同的附加字段 — `StateError` 有 `hint`，`FileSystemError` 有 `path` 和 `cause`。子类天然支持不同字段，错误码方案需要松散的 `details` 字段。

### 2. 三个子类的划分

```
MarchenSpecError (基类)
  ├── ValidationError    — 用户输入问题（名称不合法、变更已存在/不存在）
  ├── StateError         — 前置条件不满足（未初始化），可附带 hint
  └── FileSystemError    — IO 异常（文件/目录不存在、YAML 解析失败），携带 path 和 cause
```

划分依据是 CLI 层的处理方式不同：
- ValidationError → `p.log.warn(message)` — 用户操作问题，warn 级别
- StateError → `p.log.error(message)` + `p.log.info(hint)` — 引导用户下一步
- FileSystemError → `p.log.error(message: path)` — 展示路径信息

### 3. handleError 放在 CLI 层

`handleError()` 定义在 `apps/cli/src/utils/error.ts`，不放在 shared 包。因为它依赖 `@clack/prompts` 的 `p.log`，这是 CLI 特有的 UI 层。

### 4. 基类保留但不直接使用

`MarchenSpecError` 保留作为基类，新代码不再直接 `throw new MarchenSpecError()`。它的作用是 CLI 层兜底 `instanceof MarchenSpecError` 捕获所有业务错误。

## 风险与权衡

- [风险] 子类数量可能随功能增长膨胀 → 当前 3 个子类覆盖所有场景，未来按需新增即可，不预设
- [权衡] `FileSystemError` 的 `cause` 字段是可选的 → 只有 YAML 解析有原始错误，其他场景不需要
