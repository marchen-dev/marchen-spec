## 背景

将 openspec/changes/archive/ 下的 21 个归档变更迁移到 marchen/archive/，转换元数据格式（.openspec.yaml → .metadata.yaml），并生成带摘要的 changelog.md。openspec/ 目录保留不动。

## 1. 复制归档目录

- [x] 1.1 将 openspec/changes/archive/ 下全部 21 个目录复制到 marchen/archive/

## 2. 转换元数据

- [x] 2.1 遍历 marchen/archive/ 每个目录，读取 .openspec.yaml 的 created 字段
- [x] 2.2 从目录名提取变更名称（去掉日期前缀，如 2026-03-22-bootstrap-monorepo-foundation → bootstrap-monorepo-foundation）
- [x] 2.3 写入 .metadata.yaml（name, schema: full, createdAt: <date>T00:00:00.000Z, status: archived）
- [x] 2.4 删除每个目录中的 .openspec.yaml

## 3. 生成 changelog.md

- [x] 3.1 按日期排序，写入 marchen/changelog.md，每条包含日期、链接和 ≤50 字中文摘要：
  - 2025-07-14: implement-marchen-propose-skill — 实现 propose skill 和 codegen 模板机制，init 时自动生成 .claude/skills 和 commands 文件
  - 2026-03-22: bootstrap-monorepo-foundation — 搭建 pnpm + Turborepo monorepo，配置 tsdown 构建、vitest 测试、ESLint + Prettier 工具链
  - 2026-03-29: add-knowledge-base — 新增结构化知识库目录，持久化项目全局认知、技术决策和后续方向
  - 2026-03-29: implement-fs-and-init-command — 实现 fs 包的文件 I/O 操作和 marchen init 命令，创建规范目录结构
  - 2026-03-29: implement-new-command — 实现 marchen new 命令，创建变更目录并根据 schema 生成初始 artifact 文件
  - 2026-03-30: implement-list-command — 实现 marchen list 命令，扫描变更目录读取元数据并按时间排序展示
  - 2026-03-30: refactor-to-class-architecture — 重构为 Class 架构，引入 Workspace 和 ChangeManager 类收归领域操作
  - 2026-03-31: refactor-knowledge-to-docs — 重构 knowledge 为 docs 结构，以 archive 作为唯一历史记录来源
  - 2026-04-03: refactor-error-handling — 引入分层错误体系：ValidationError、StateError、FileSystemError 三级分类
  - 2026-04-03: setup-cli-release — 建立 @marchen-spec/cli 的 npm 发布流程，配置 bumpp 版本管理和 bundle 策略
  - 2026-04-03: simplify-specs-architecture — 移除 OpenSpec 双层规范系统（main + delta），简化为 archive 单一真相源
  - 2026-04-05: implement-status-and-instructions — 实现 status 和 instructions 命令，为 AI skill 层提供 JSON API 驱动工作流
  - 2026-04-05: implement-verify-command — 实现 verify 命令，检查变更 artifact 完整度和 task checkbox 完成进度
  - 2026-04-07: add-apply-command — instructions 支持 apply artifactId，一次返回实现阶段所需的全部上下文和进度
  - 2026-04-09: enhance-status-output — status 命令增加 ANSI 彩色输出、状态图标和总进度汇总显示
  - 2026-04-10: add-explore-skill — 新增 explore skill，提供动手前的结构化思考伙伴模式，支持代码库调查
  - 2026-04-12: add-archive-skill — 新增 archive skill/command 模板，CLI archive 命令增加 --json 输出支持
  - 2026-04-12: add-rapid-schema-and-rename — 新增 rapid schema 支持轻量变更流程，规范目录从 marchenspec 重命名为 marchen
  - 2026-04-12: rename-schemas-and-add-propose-lite — schema 重命名为 full/lite 统一语义维度，新增 propose-lite skill 入口
  - 2026-04-19: add-changelog — archive 时自动追加 changelog.md 摘要索引，便于 explore 快速定位历史决策
  - 2026-04-19: replace-propose-lite-with-lite-workflow — lite 工作流改为一键式：创建 tasks → 自动实现 → 询问归档，减少手动衔接
