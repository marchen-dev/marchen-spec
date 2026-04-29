import type { ModelDownloadProgress } from '@marchen-spec/core'

/** 模型类型显示名称 */
export const MODEL_LABELS: Record<string, string> = {
  embed: 'Embedding',
  generate: 'Query Expansion',
  rerank: 'Reranker',
}

/** 格式化模型下载进度 */
export function formatModelProgress(progress: ModelDownloadProgress): string {
  const name = MODEL_LABELS[progress.model] ?? progress.model

  switch (progress.stage) {
    case 'checking':
      return `检查模型 ${name}...`
    case 'downloading': {
      if (progress.downloadedBytes && progress.totalBytes) {
        const pct = Math.round(
          (progress.downloadedBytes / progress.totalBytes) * 100,
        )
        const mb = (progress.downloadedBytes / 1024 / 1024).toFixed(1)
        const total = (progress.totalBytes / 1024 / 1024).toFixed(0)
        return `下载模型 ${name}... ${mb}/${total} MB (${pct}%)`
      }
      return `下载模型 ${name}...`
    }
    case 'verifying':
      return `校验模型 ${name}...`
    case 'ready':
      return `模型 ${name} 就绪`
    default:
      return `准备模型 ${name}...`
  }
}
