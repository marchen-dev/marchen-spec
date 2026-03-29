---
name: update-claude-md
description: Update CLAUDE.md documentation files across a monorepo when architecture, dependencies, or project structure changes. Use this skill when packages are added/removed, dependencies change, build configs are modified, or when the user explicitly asks to update or refresh CLAUDE.md files. Also trigger when reviewing project documentation completeness.
---

# 更新 CLAUDE.md 文档

## 技能目标

当 monorepo 项目的架构、依赖关系或配置发生变化时，自动更新所有 CLAUDE.md 文件，确保文档与代码库实际状态保持同步。

## 触发时机

- 新增或删除 workspace 包
- 包之间的依赖关系发生变化
- 构建工具、测试框架或配置文件更新
- 开发命令或脚本发生变化
- 用户明确要求更新或刷新 CLAUDE.md
- 检查项目文档完整性时

## 工作流程

### 第一步：扫描项目结构

首先全面了解项目当前状态：

1. **识别所有包**
   - 读取 `pnpm-workspace.yaml` 或 `package.json` workspaces 配置
   - 列出 apps/ 和 packages/ 下的所有子目录
   - 确认每个包的 package.json 存在

2. **分析依赖关系**
   - 读取每个包的 package.json
   - 提取 dependencies 中的 workspace 依赖（如 `workspace:*`）
   - 构建完整的依赖关系图

3. **检查配置文件**
   - 根目录：tsconfig.base.json, turbo.json, eslint.config.mjs, vitest.config.ts
   - 每个包：tsconfig.json, tsdown.config.ts, vitest.config.ts, package.json scripts

### 第二步：更新根目录 CLAUDE.md

根目录的 CLAUDE.md 是项目的总览文档，需要包含：

1. **项目概述** - 简要说明项目用途和架构类型
2. **核心架构** - 完整的依赖关系图和包职责说明
3. **开发命令** - 从根 package.json 提取所有 scripts
4. **技术栈约定** - TypeScript、构建工具、测试框架的配置说明
5. **代码注释规范** - 强调必须添加适当注释
6. **OpenSpec 工作流** - 如果项目使用 OpenSpec
7. **文件组织约定** - 包结构模板和命令组织方式
8. **重要注意事项** - 架构原则和最佳实践

**依赖关系图格式示例**：
```
@marchen-spec/shared (基础层，无依赖)
    ↑
    ├── @marchen-spec/config
    │       ↑
    │       └── @marchen-spec/core ←─┐
    │                                 │
    └── @marchen-spec/fs ─────────────┤
                                      │
@marchen-spec/cli ───────────────────┘
```

使用 ASCII 图清晰展示包之间的依赖流向。

### 第三步：更新各子包的 CLAUDE.md

为每个包（apps/cli, packages/*）创建或更新专属的 CLAUDE.md，内容应包含：

1. **包职责** - 该包的核心功能和职责边界
2. **依赖关系** - 该包在依赖图中的位置（只显示相关部分）
3. **开发命令** - 从该包的 package.json 提取 scripts
4. **核心功能** - 列出主要导出的函数、类、类型
5. **代码规范** - 该包特有的编码约定和示例
6. **注意事项** - 该包的架构约束和最佳实践

**重要原则**：
- 每个包的 CLAUDE.md 应该独立可读，不依赖根目录文档
- 强调该包在整体架构中的定位和职责边界
- 提供具体的代码示例，展示该包的典型用法

### 第四步：验证一致性

更新完成后，检查所有 CLAUDE.md 的一致性：

1. **依赖关系一致** - 所有文档中的依赖图应该一致
2. **命令准确** - 确保所有命令与 package.json 匹配
3. **架构原则统一** - 所有文档强调相同的架构约束
4. **注释规范一致** - 代码注释要求在所有文档中保持一致

## 文档模板参考

### 根目录 CLAUDE.md 结构
```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述
[项目简介]

## 核心架构
### 包依赖关系图
[ASCII 依赖图]

### 包职责划分
[各包职责列表]

## 开发命令
[所有开发命令]

## 技术栈约定
[TypeScript、构建、测试配置]

## 代码注释规范
[注释要求和示例]

## 文件组织约定
[包结构和命令组织]

## 重要注意事项
[架构原则]
```

### 子包 CLAUDE.md 结构
```markdown
# @package-name

## 包职责
[该包的核心功能]

## 依赖关系
[该包在依赖图中的位置]

## 开发命令
[该包的 scripts]

## 核心功能
[主要导出内容]

## 代码规范
[该包特有的约定]

## 注意事项
[该包的约束]
```

## 实用技巧

### 构建依赖关系图

使用以下方法构建准确的依赖图：

1. 读取每个包的 package.json
2. 提取 dependencies 中以 `workspace:` 开头的依赖
3. 按依赖层级排序（无依赖的在最底层）
4. 使用 ASCII 字符绘制依赖箭头

**示例代码逻辑**：
```typescript
// 伪代码示例
const packages = await readAllPackages()
const graph = buildDependencyGraph(packages)
const sorted = topologicalSort(graph) // 从底层到顶层
```

### 提取开发命令

从 package.json 的 scripts 字段提取命令时：
- 只包含用户常用的命令（build, dev, test, lint 等）
- 忽略内部脚本（如 preinstall, postbuild）
- 为每个命令添加简短说明

### 保持文档简洁

- 避免重复信息：根目录文档提供全局视图，子包文档聚焦具体细节
- 使用示例代码：展示实际用法比长篇描述更有效
- 强调约束：明确说明"必须做什么"和"不能做什么"
