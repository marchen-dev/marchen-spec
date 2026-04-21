## ADDED Requirements

### 需求: 状态文字彩色显示
status 命令的终端输出中，artifact 状态文字 SHALL 根据状态类型显示不同颜色。`--json` 模式 SHALL 不受影响。

#### 场景: filled 状态显示绿色
- **WHEN** artifact 内容状态为 `filled`
- **THEN** 状态文字以绿色显示

#### 场景: empty 状态显示黄色
- **WHEN** artifact 内容状态为 `empty`
- **THEN** 状态文字以黄色显示

#### 场景: missing 或 no-content 状态显示灰色
- **WHEN** artifact 内容状态为 `missing` 或 `no-content`
- **THEN** 状态文字以灰色（dim）显示

#### 场景: blocked 状态显示红色
- **WHEN** artifact 被工作流阻塞
- **THEN** 状态文字显示为 `blocked`（替代原始内容状态），以红色显示

### 需求: 变更信息行紧凑显示
变更名称和 schema 信息 SHALL 合并为一行显示，名称加粗、schema 灰色。

#### 场景: 变更信息单行展示
- **WHEN** 用户运行 `marchen status <name>`
- **THEN** 显示格式为 `<bold:name> · <dim:schema>`，占一行

### 需求: 总进度汇总行
status 输出 SHALL 包含 Artifacts 完成进度汇总。当 tasks 有内容时，Tasks 进度与 Artifacts 进度合并展示。

#### 场景: 显示 artifact 完成进度
- **WHEN** 用户运行 `marchen status <name>`
- **THEN** 显示 `Artifacts: N/M 完成`，N 为 filled 数量，M 为总数

#### 场景: 显示 tasks 完成进度
- **WHEN** tasks.md 有实质内容
- **THEN** 在 Artifacts 进度行下方显示 `Tasks: N/M 完成`

#### 场景: 无 tasks 时不显示 tasks 进度
- **WHEN** tasks.md 无实质内容或不存在
- **THEN** 不显示 Tasks 进度行

### 需求: 进度数字颜色
进度数字 SHALL 根据完成度显示不同颜色。

#### 场景: 全部完成显示绿色
- **WHEN** 进度为 N/N（全部完成）
- **THEN** 进度文字以绿色显示

#### 场景: 部分完成显示黄色
- **WHEN** 进度为 N/M 且 0 < N < M
- **THEN** 进度文字以黄色显示

#### 场景: 零完成显示灰色
- **WHEN** 进度为 0/M
- **THEN** 进度文字以灰色（dim）显示

### 需求: 下一步提示高亮
下一步建议中的 artifact 名称 SHALL 以 cyan 颜色高亮显示。

#### 场景: 有下一步时高亮名称
- **WHEN** 工作流有建议的下一步 artifact
- **THEN** artifact 名称以 cyan 显示

#### 场景: 所有 artifact 就绪
- **WHEN** 所有 artifact 已 filled
- **THEN** 显示「所有 artifact 已就绪」
