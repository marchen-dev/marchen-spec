import type {
  ApplyProgress,
  ApplyState,
  ArchiveOptions,
  ArchiveResult,
  ArtifactContentStatus,
  ArtifactStatusDetail,
  ChangeMetadata,
  ContextInfo,
  InstructionsResult,
  SchemaDefinition,
  StatusResult,
  TaskItem,
  WorkflowStatus,
} from '@marchen-spec/shared'
import type { Workspace } from './workspace.js'
import { join } from 'node:path'
import {
  APPLY_INSTRUCTION,
  DEFAULT_SCHEMA_NAME,
  getSchema,
} from '@marchen-spec/config'
import {
  appendFile,
  ensureDir,
  exists,
  listDir,
  moveDir,
  readFile,
  readYaml,
  writeFile,
  writeYaml,
} from '@marchen-spec/fs'
import {
  METADATA_FILE_NAME,
  StateError,
  ValidationError,
} from '@marchen-spec/shared'

/** kebab-case 校验正则 */
const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * 变更管理器
 *
 * 统一管理变更的创建、查询、列出等操作。
 * 通过构造函数接收 Workspace 实例获取路径上下文。
 */
export class ChangeManager {
  /**
   * @param workspace - 工作区实例，提供路径上下文
   */
  constructor(private readonly workspace: Workspace) {}

  /**
   * 校验变更名称是否为合法的 kebab-case 格式
   *
   * @param name - 变更名称
   * @returns 名称是否合法
   */
  static isValidName(name: string): boolean {
    return KEBAB_CASE_REGEX.test(name)
  }

  /**
   * 创建一个新的变更
   *
   * 在 marchen/changes/ 下创建变更目录，写入元数据和初始 artifact 文件。
   * 会依次校验：MarchenSpec 是否已初始化、名称格式、是否重名。
   *
   * @param name - 变更名称（kebab-case）
   * @param schemaName - schema 名称，默认 full
   * @throws {MarchenSpecError} 未初始化、名称格式错误或变更已存在时抛出
   */
  async create(name: string, schemaName?: string): Promise<void> {
    // 校验初始化状态
    await this.ensureInitialized()

    // 校验名称格式
    if (!ChangeManager.isValidName(name)) {
      throw new ValidationError(
        `变更名称 "${name}" 不合法，请使用 kebab-case 格式（如 add-dark-mode）`,
      )
    }

    // 校验是否重名
    const changeDir = join(this.workspace.changeDir, name)
    if (await exists(changeDir)) {
      throw new ValidationError(`变更 "${name}" 已存在`)
    }

    // 查找 schema 定义
    const resolvedSchemaName = schemaName ?? DEFAULT_SCHEMA_NAME
    const schema = getSchema(resolvedSchemaName)

    // 创建变更根目录
    await ensureDir(changeDir)

    // 根据 schema 的 artifacts 创建初始文件/目录
    for (const artifact of schema.artifacts) {
      if (artifact.generates.endsWith('/')) {
        // 目录类型（如 specs/）
        await ensureDir(join(changeDir, artifact.generates))
      }
    }

    // 写入元数据文件
    const metadata: ChangeMetadata = {
      name,
      schema: resolvedSchemaName,
      createdAt: new Date().toISOString(),
      status: 'open',
    }
    await writeYaml(join(changeDir, METADATA_FILE_NAME), metadata)
  }

  /**
   * 归档一个已完成的变更
   *
   * 将变更目录从 marchenspec/changes/ 移动到 marchenspec/archive/，
   * 目标目录名格式为 YYYY-MM-DD-<name>。同时更新元数据的 status 和 archivedAt，
   * 并追加一行条目到 changelog.md。
   *
   * @param name - 变更名称
   * @param options - 归档选项（可选 summary）
   * @returns 归档结果
   * @throws {ValidationError} 变更不存在或目标目录已存在时抛出
   * @throws {StateError} 未初始化时抛出
   */
  async archive(
    name: string,
    options?: ArchiveOptions,
  ): Promise<ArchiveResult> {
    await this.ensureInitialized()

    const changeDir = join(this.workspace.changeDir, name)
    if (!(await exists(changeDir))) {
      throw new ValidationError(`变更 "${name}" 不存在`)
    }

    // 读取元数据
    const metadataPath = join(changeDir, METADATA_FILE_NAME)
    const metadata = await readYaml<ChangeMetadata>(metadataPath)
    const now = new Date()
    const archivedAt = now.toISOString()
    const datePrefix = archivedAt.slice(0, 10)
    const archiveDir = join(this.workspace.archiveDir, `${datePrefix}-${name}`)

    // 检查目标目录是否已存在
    if (await exists(archiveDir)) {
      throw new ValidationError(`归档目标 "${datePrefix}-${name}" 已存在`)
    }

    // 更新元数据
    await writeYaml(metadataPath, {
      ...metadata,
      status: 'archived' as const,
      archivedAt,
    })

    // 移动到 archive 目录
    await moveDir(changeDir, archiveDir)

    // 写入 changelog
    await this.appendChangelog(name, datePrefix, options?.summary)

    // 更新搜索索引
    await this.updateSearchIndex()

    return {
      name,
      schema: metadata.schema,
      archivedTo: archiveDir,
      archivedAt,
    }
  }

  /**
   * 追加一行条目到 changelog.md
   *
   * changelog.md 不存在时自动创建（兼容未 re-init 的旧项目）。
   * summary 写入前会 trim 并替换换行为空格。
   *
   * @param name - 变更名称
   * @param datePrefix - 日期前缀（YYYY-MM-DD）
   * @param summary - 可选摘要文本
   */
  private async appendChangelog(
    name: string,
    datePrefix: string,
    summary?: string,
  ): Promise<void> {
    const changelogPath = this.workspace.changelogPath

    // changelog.md 不存在时先创建
    if (!(await exists(changelogPath))) {
      await writeFile(changelogPath, '# 变更日志\n')
    }

    const link = `[${name}](./archive/${datePrefix}-${name}/)`
    const sanitizedSummary = summary?.trim().replace(/[\r\n]+/g, ' ')
    const entry = sanitizedSummary
      ? `- ${datePrefix}: ${link} — ${sanitizedSummary}`
      : `- ${datePrefix}: ${link}`

    await appendFile(changelogPath, `${entry}\n`)
  }

  /** 更新搜索索引（失败时静默） */
  private async updateSearchIndex(): Promise<void> {
    try {
      const { SearchManager } = await import('./search-manager.js')
      const search = new SearchManager(this.workspace)
      if (await search.isAvailable()) {
        await search.indexChange()
        await search.close()
      }
    } catch {
      // 索引失败不影响归档
    }
  }

  /**
   * 列出所有 open 状态的变更
   *
   * 扫描 marchenspec/changes/ 目录，读取各变更的元数据，
   * 返回按创建时间降序排列的列表。跳过缺失元数据的目录。
   *
   * @returns 变更元数据数组，按 createdAt 降序排列
   * @throws {MarchenSpecError} 未初始化时抛出
   */
  async list(): Promise<ChangeMetadata[]> {
    await this.ensureInitialized()

    const entries = await listDir(this.workspace.changeDir)

    const changes: ChangeMetadata[] = []

    // 读取每个变更的元数据
    for (const name of entries) {
      const metadataPath = join(
        this.workspace.changeDir,
        name,
        METADATA_FILE_NAME,
      )

      if (!(await exists(metadataPath))) {
        continue
      }

      try {
        const metadata = await readYaml<ChangeMetadata>(metadataPath)
        changes.push(metadata)
      } catch {
        continue
      }
    }

    // 按创建时间降序排列（最新的在前）
    changes.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return changes
  }

  /**
   * 查看变更的 artifact 状态和工作流建议
   *
   * 检测各 artifact 的内容状态（不只是文件存在性），
   * 计算工作流建议（ready/blocked/next），解析 tasks 进度。
   *
   * @param name - 变更名称
   * @returns 状态结果
   * @throws {MarchenSpecError} 未初始化或变更不存在时抛出
   */
  async status(name: string): Promise<StatusResult> {
    await this.ensureInitialized()

    const changeDir = join(this.workspace.changeDir, name)
    if (!(await exists(changeDir))) {
      throw new ValidationError(`变更 "${name}" 不存在`)
    }

    // 读取元数据获取 schema
    const metadataPath = join(changeDir, METADATA_FILE_NAME)
    const metadata = await readYaml<ChangeMetadata>(metadataPath)
    const schema = getSchema(metadata.schema)

    // 逐个检测 artifact 的内容状态
    // specs 是目录类型，需要特殊处理；其余为单文件类型
    const artifacts: ArtifactStatusDetail[] = []
    for (const artifact of schema.artifacts) {
      const artifactPath = join(changeDir, artifact.generates)

      if (artifact.id === 'specs') {
        const result = await this.detectSpecsStatus(artifactPath)
        artifacts.push({ id: artifact.id, path: artifact.generates, ...result })
      } else {
        const status = await this.detectContentStatus(artifactPath)
        artifacts.push({ id: artifact.id, status, path: artifact.generates })
      }
    }

    // 根据各 artifact 的内容状态，计算工作流建议（哪些可以开始、哪些被阻塞）
    const statusMap = new Map(artifacts.map((a) => [a.id, a.status]))
    const workflow = this.computeWorkflow(schema, statusMap)

    // tasks 进度独立于 artifact 状态：只要 tasks.md 有实质内容就解析 checkbox
    // 这样 artifact status 只反映"有没有内容"，进度信息放在 tasks 字段
    const tasksArtifact = artifacts.find((a) => a.id === 'tasks')
    let tasks: StatusResult['tasks'] = null
    if (tasksArtifact && tasksArtifact.status === 'filled') {
      const tasksPath = join(changeDir, 'tasks.md')
      const content = await readFile(tasksPath)
      const items = this.parseTaskItems(content)
      tasks = {
        total: items.length,
        completed: items.filter((item) => item.completed).length,
        items,
      }
    }

    return { name, schema: metadata.schema, artifacts, workflow, tasks }
  }

  /**
   * 获取指定 artifact 的创建指令
   *
   * 返回模板、指导文本、依赖 artifacts 的内容和完成后解锁的 artifacts。
   *
   * @param name - 变更名称
   * @param artifactId - artifact 标识符
   * @returns 指令结果
   * @throws {MarchenSpecError} 未初始化、变更不存在或 artifact 不存在时抛出
   */
  async getInstructions(
    name: string,
    artifactId: string,
  ): Promise<InstructionsResult> {
    await this.ensureInitialized()

    const changeDir = join(this.workspace.changeDir, name)
    if (!(await exists(changeDir))) {
      throw new ValidationError(`变更 "${name}" 不存在`)
    }

    // 查找 artifact 定义，校验 artifactId 合法性
    const metadataPath = join(changeDir, METADATA_FILE_NAME)
    const metadata = await readYaml<ChangeMetadata>(metadataPath)
    const schema = getSchema(metadata.schema)

    const artifactDef = schema.artifacts.find((a) => a.id === artifactId)
    if (!artifactDef) {
      throw new ValidationError(
        `Artifact "${artifactId}" 不存在，可用的 artifact: ${schema.artifacts.map((a) => a.id).join(', ')}`,
      )
    }

    // 从 artifact 定义获取模板和指导文本
    const template = artifactDef.template ?? ''
    const instruction = artifactDef.instruction

    // 构建上下文信息：读取每个依赖 artifact 的状态和内容
    // specs 目录需要拼接所有 spec 文件内容；单文件直接读取
    const context: ContextInfo[] = []
    for (const depId of artifactDef.requires) {
      const depDef = schema.artifacts.find((a) => a.id === depId)
      if (!depDef) continue

      const depPath = join(changeDir, depDef.generates)

      if (depId === 'specs') {
        const specsResult = await this.detectSpecsStatus(depPath)
        const content =
          specsResult.status === 'filled'
            ? await this.readSpecsContent(depPath)
            : null
        context.push({
          id: depId,
          status: specsResult.status,
          path: depDef.generates,
          content,
        })
      } else {
        const status = await this.detectContentStatus(depPath)
        const content = status === 'filled' ? await readFile(depPath) : null
        context.push({ id: depId, status, path: depDef.generates, content })
      }
    }

    // 计算 unlocks（谁把当前 artifact 列为依赖）
    const unlocks = schema.artifacts
      .filter((a) => a.requires.includes(artifactId))
      .map((a) => a.id)

    return {
      changeName: name,
      artifactId,
      schemaName: metadata.schema,
      changeDir,
      outputPath: artifactDef.generates,
      template,
      instruction,
      context,
      unlocks,
      state: null,
      progress: null,
    }
  }

  /**
   * 检测单文件 artifact 的内容状态
   *
   * 判断逻辑：去掉 HTML 注释、空行、纯 markdown 标题行后，
   * 剩余内容超过 20 字符算 filled，否则算 empty（模板骨架）。
   *
   * 阈值 20 字符是粗粒度信号，Skill 会读文件内容自己做精确判断。
   *
   * @param filePath - 文件绝对路径
   * @returns 内容状态：missing / empty / filled
   */
  private async detectContentStatus(
    filePath: string,
  ): Promise<ArtifactContentStatus> {
    if (!(await exists(filePath))) {
      return 'missing'
    }

    const content = await readFile(filePath)
    const stripped = content
      .replace(/<!--[\s\S]*?-->/g, '') // 去掉 HTML 注释
      .split('\n')
      .filter((line) => line.trim() !== '') // 去掉空行
      .filter((line) => !/^#{1,6}\s/.test(line.trim())) // 去掉纯标题行
      .join('\n')
      .trim()

    return stripped.length > 20 ? 'filled' : 'empty'
  }

  /**
   * 检测 specs 目录的内容状态和 capabilities 列表
   *
   * specs 是目录类型 artifact，状态判断规则：
   * - 目录不存在 → missing
   * - 目录存在但无子目录 → no-content
   * - 有子目录但存在未填充的 spec.md → no-content（返回 capabilities 列表）
   * - 所有子目录的 spec.md 都有实质内容 → filled
   *
   * @param specsPath - specs 目录绝对路径
   * @returns 状态和 capabilities（子目录名列表）
   */
  private async detectSpecsStatus(specsPath: string): Promise<{
    status: ArtifactContentStatus
    capabilities: string[]
  }> {
    if (!(await exists(specsPath))) {
      return { status: 'missing', capabilities: [] }
    }

    const entries = await listDir(specsPath)
    if (entries.length === 0) {
      return { status: 'no-content', capabilities: [] }
    }

    // 检查所有 spec 文件的内容状态
    // 只有全部 spec.md 都是 filled 才算 filled，否则算 no-content
    let allFilled = true
    for (const entry of entries) {
      const specFile = join(specsPath, entry, 'spec.md')
      if (!(await exists(specFile))) {
        allFilled = false
        continue
      }
      const status = await this.detectContentStatus(specFile)
      if (status !== 'filled') {
        allFilled = false
      }
    }

    return {
      status: allFilled ? 'filled' : 'no-content',
      capabilities: entries,
    }
  }

  /**
   * 读取 specs 目录下所有 spec 文件内容并拼接
   *
   * 每个文件以 `--- specs/<name>/spec.md ---` 作为分隔标记，
   * 方便 LLM 识别各 spec 的边界。
   *
   * @param specsPath - specs 目录绝对路径
   * @returns 拼接后的完整内容
   */
  private async readSpecsContent(specsPath: string): Promise<string> {
    const entries = await listDir(specsPath)
    const parts: string[] = []

    for (const entry of entries) {
      const specFile = join(specsPath, entry, 'spec.md')
      if (await exists(specFile)) {
        const content = await readFile(specFile)
        parts.push(`--- specs/${entry}/spec.md ---\n${content}`)
      }
    }

    return parts.join('\n\n')
  }

  /**
   * 根据 schema 的依赖关系计算工作流状态
   *
   * 通用实现：遍历 schema 的所有 artifacts，
   * 根据 requires 字段判断每个 artifact 是 ready 还是 blocked。
   *
   * @param schema - schema 定义
   * @param statuses - artifact id → 内容状态的映射
   * @returns 工作流状态（next / ready / blocked）
   */
  private computeWorkflow(
    schema: SchemaDefinition,
    statuses: Map<string, ArtifactContentStatus>,
  ): WorkflowStatus {
    const isFilled = (id: string): boolean => statuses.get(id) === 'filled'

    const ready: string[] = []
    const blocked: string[] = []

    for (const artifact of schema.artifacts) {
      if (isFilled(artifact.id)) continue

      const depsReady = artifact.requires.every(isFilled)
      if (depsReady) {
        ready.push(artifact.id)
      } else {
        blocked.push(artifact.id)
      }
    }

    return { next: ready[0] ?? null, ready, blocked }
  }

  /**
   * 解析 tasks.md 内容中的 checkbox 条目
   */
  private parseTaskItems(content: string): TaskItem[] {
    return [...content.matchAll(/^- \[([ x])\] (.+)$/gm)].map((match) => ({
      description: match[2]!,
      completed: match[1] === 'x',
    }))
  }

  /**
   * 从 tasks.md 内容计算任务进度
   */
  private parseTaskProgress(content: string): ApplyProgress {
    const items = this.parseTaskItems(content)
    const completed = items.filter((i) => i.completed).length
    return {
      total: items.length,
      completed,
      remaining: items.length - completed,
    }
  }

  /**
   * 获取 apply 阶段的指令
   *
   * 收集所有 artifact 的内容作为上下文，计算任务进度和状态。
   *
   * @param name - 变更名称
   * @returns 指令结果（state/progress 有值，outputPath/template/unlocks 为 null）
   */
  async getApplyInstructions(name: string): Promise<InstructionsResult> {
    await this.ensureInitialized()

    const changeDir = join(this.workspace.changeDir, name)
    if (!(await exists(changeDir))) {
      throw new ValidationError(`变更 "${name}" 不存在`)
    }

    const metadataPath = join(changeDir, METADATA_FILE_NAME)
    const metadata = await readYaml<ChangeMetadata>(metadataPath)
    const schema = getSchema(metadata.schema)

    // 收集所有 artifact 的上下文
    const context: ContextInfo[] = []
    for (const artifact of schema.artifacts) {
      const artifactPath = join(changeDir, artifact.generates)

      if (artifact.id === 'specs') {
        const specsResult = await this.detectSpecsStatus(artifactPath)
        const content =
          specsResult.status === 'filled'
            ? await this.readSpecsContent(artifactPath)
            : null
        context.push({
          id: artifact.id,
          status: specsResult.status,
          path: artifact.generates,
          content,
        })
      } else {
        const status = await this.detectContentStatus(artifactPath)
        const content =
          status === 'filled' ? await readFile(artifactPath) : null
        context.push({
          id: artifact.id,
          status,
          path: artifact.generates,
          content,
        })
      }
    }

    // 计算 state 和 progress
    const tasksContext = context.find((c) => c.id === 'tasks')
    let state: ApplyState
    let progress: ApplyProgress

    if (
      !tasksContext ||
      !tasksContext.content ||
      tasksContext.status !== 'filled'
    ) {
      state = 'blocked'
      progress = { total: 0, completed: 0, remaining: 0 }
    } else {
      progress = this.parseTaskProgress(tasksContext.content)
      state = progress.remaining === 0 ? 'all_done' : 'ready'
    }

    const instruction = APPLY_INSTRUCTION

    return {
      changeName: name,
      artifactId: 'apply',
      schemaName: metadata.schema,
      changeDir,
      outputPath: null,
      template: null,
      instruction,
      context,
      unlocks: null,
      state,
      progress,
    }
  }

  /**
   * 确保 MarchenSpec 已初始化，否则抛出错误
   */
  private async ensureInitialized(): Promise<void> {
    const initialized = await this.workspace.isInitialized()
    if (!initialized) {
      throw new StateError('MarchenSpec 尚未初始化', '运行 marchen init 初始化')
    }
  }
}
