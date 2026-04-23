## search-command

新增 `marchen search` CLI 命令，支持语义搜索归档变更历史。

### 需求: CLI SHALL 注册 search 命令

#### 场景: 基本搜索

- WHEN 用户执行 `marchen search "异常处理"`
- THEN 调用 SearchManager.search() 执行语义搜索
- AND 在终端格式化输出结果（路径、分数、摘要片段）

#### 场景: qmd 不可用时提示

- WHEN 用户执行 `marchen search "query"`
- AND SearchManager.isAvailable() 返回 false
- THEN 输出错误提示"搜索功能不可用"
- AND 退出码非零

### 需求: search 命令 SHALL 支持 --json 输出

#### 场景: JSON 格式输出

- WHEN 用户执行 `marchen search "query" --json`
- THEN 输出 JSON 数组，每项包含 path、score、snippet、title

### 需求: search 命令 SHALL 支持结果过滤选项

#### 场景: 限制结果数量

- WHEN 用户执行 `marchen search "query" -n 10`
- THEN 最多返回 10 条结果

#### 场景: 最低分数过滤

- WHEN 用户执行 `marchen search "query" --min-score 0.4`
- THEN 只返回 score >= 0.4 的结果

### 需求: search 命令 SHALL 支持索引重建

#### 场景: 重建索引

- WHEN 用户执行 `marchen search --rebuild "query"`
- THEN 先调用 SearchManager.index() 全量重建索引
- AND 然后执行搜索
