/**
 * 包边界信息
 *
 * 描述 workspace 中单个包的元数据和依赖关系
 */
export interface PackageBoundary {
  readonly name: string
  readonly dependsOn: readonly string[]
}

/** 变更状态 */
export type ChangeStatus = 'open' | 'archived'

/**
 * 变更元数据
 *
 * 记录变更的基本信息，存储在 .metadata.yaml 中
 */
export interface ChangeMetadata {
  /** 变更名称（kebab-case） */
  readonly name: string
  /** 使用的 schema 名称 */
  readonly schema: string
  /** 创建时间（ISO 8601） */
  readonly createdAt: string
  /** 当前状态 */
  readonly status: ChangeStatus
}

/**
 * Artifact 定义
 *
 * 描述 schema 中单个制品的结构
 */
export interface ArtifactDefinition {
  /** 制品标识符（如 'proposal'、'design'） */
  readonly id: string
  /** 生成的文件路径（如 'proposal.md'、'specs/'） */
  readonly generates: string
  /** 依赖的其他 artifact ID 列表 */
  readonly requires: readonly string[]
}

/**
 * Schema 定义
 *
 * 描述一个工作流 schema 包含的所有 artifact 及其关系
 */
export interface SchemaDefinition {
  /** Schema 名称 */
  readonly name: string
  /** 包含的 artifact 定义列表 */
  readonly artifacts: readonly ArtifactDefinition[]
}
