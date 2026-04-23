## archive-indexing

archive 操作完成后自动更新搜索索引，保持索引与 archive 内容同步。

### 需求: archive() SHALL 在归档后更新搜索索引

#### 场景: 正常更新索引

- WHEN ChangeManager.archive() 成功完成文件移动和 changelog 写入
- AND SearchManager.isAvailable() 返回 true
- THEN 调用 SearchManager.indexChange() 更新索引
- AND 归档结果正常返回

#### 场景: 索引更新失败不影响归档

- WHEN ChangeManager.archive() 成功完成文件移动和 changelog 写入
- AND SearchManager.indexChange() 抛出异常
- THEN 异常被捕获，不向上传播
- AND 归档结果正常返回

#### 场景: qmd 不可用时跳过索引

- WHEN ChangeManager.archive() 执行
- AND SearchManager.isAvailable() 返回 false
- THEN 跳过索引更新
- AND 归档流程正常完成

### 需求: Workspace SHALL 提供搜索索引路径

#### 场景: searchDbPath 指向 .search 目录

- WHEN Workspace 实例化
- THEN searchDbPath 为 `<specDir>/.search/index.sqlite`

#### 场景: init 时创建 .search 目录

- WHEN workspace.initialize() 执行
- THEN 创建 `<specDir>/.search/` 目录
