## search-manager

SearchManager 类封装 qmd SDK，提供语义搜索和索引管理接口。通过 dynamic import 加载 qmd，加载失败时优雅降级。

### 需求: SearchManager SHALL 通过 dynamic import 懒加载 qmd

#### 场景: qmd 可用时正常初始化

- WHEN SearchManager.isAvailable() 被调用
- AND `@tobilu/qmd` 可以被 import
- THEN 返回 `true`
- AND 后续 search/index 调用正常工作

#### 场景: qmd 不可用时优雅降级

- WHEN SearchManager.isAvailable() 被调用
- AND `@tobilu/qmd` import 失败（native binding 编译失败等）
- THEN 返回 `false`
- AND 不抛出异常

### 需求: SearchManager SHALL 提供语义搜索接口

#### 场景: 搜索返回结构化结果

- WHEN search(query, options) 被调用
- THEN 返回结果数组，每项包含 path、score、snippet、title
- AND 结果按 score 降序排列
- AND 默认返回 5 条，可通过 options.limit 调整
- AND 可通过 options.minScore 过滤低分结果

### 需求: SearchManager SHALL 懒初始化 qmd store

#### 场景: store 在首次调用时创建

- WHEN search() 或 index() 首次被调用
- THEN 创建 qmd store，dbPath 为 workspace.searchDbPath
- AND collection 指向 workspace.archiveDir，pattern 为 `**/*.md`
- AND 后续调用复用同一个 store 实例

### 需求: SearchManager SHALL 提供索引管理接口

#### 场景: 全量索引

- WHEN index() 被调用
- THEN 扫描 archive 目录所有 .md 文件
- AND 生成向量 embedding

#### 场景: 增量索引

- WHEN indexChange() 被调用
- THEN 更新索引并为新文档生成 embedding

### 需求: SearchManager SHALL 提供资源释放接口

#### 场景: 关闭 store

- WHEN close() 被调用
- THEN 释放 qmd store 资源
- AND 后续调用需要重新初始化
