## MODIFIED Requirements

### Requirement: fs 包拆分为多文件模块
`@marchen-spec/fs` SHALL 将单文件拆分为 `paths.ts`、`directory.ts`、`file.ts`、`yaml.ts` 四个模块，通过 `index.ts` 统一 re-export。公共 API 保持不变。

#### Scenario: 拆分后 API 兼容
- **WHEN** 其他包通过 `import { ... } from '@marchen-spec/fs'` 导入
- **THEN** 所有现有函数（resolveWorkspaceRoot、getSpecDirectory、getChangeDirectory、ensureDir、exists、listDir、readFile、writeFile、readYaml、writeYaml）SHALL 保持可用且行为不变
