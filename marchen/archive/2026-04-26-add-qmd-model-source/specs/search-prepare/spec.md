### 需求: SearchManager SHALL 提供显式 prepare 方法

`prepare(options?)` 分离模型准备和 store 初始化，是唯一接受进度回调的方法。

#### 场景: 显式调用 prepare 后搜索

- GIVEN qmd SDK 可用
- WHEN 依次调用 `prepare({ onModelProgress })` 然后 `search(query)`
- THEN prepare 阶段通过 ModelManager 确保模型就绪
- AND prepare 阶段初始化 qmd store
- AND onModelProgress 收到每个模型的进度回调
- AND search 正常返回结果

#### 场景: 未调用 prepare 时自动触发

- GIVEN qmd SDK 可用且未调用 prepare
- WHEN 直接调用 `search(query)`
- THEN 内部自动触发 prepare（无进度回调）
- AND search 正常返回结果

#### 场景: 重复调用 prepare 幂等

- GIVEN 已调用过 prepare
- WHEN 再次调用 `prepare()`
- THEN 立即返回，不重复初始化

### 需求: search 和 index 签名 SHALL 不包含进度参数

#### 场景: search 只接受查询和搜索选项

- WHEN 调用 `search(query, { limit, minScore })`
- THEN 参数中无进度回调相关字段

#### 场景: index 不接受任何参数

- WHEN 调用 `index()`
- THEN 方法签名无参数

### 需求: isAvailable SHALL 检测 qmd SDK 可用性

#### 场景: qmd 可导入时返回 true

- GIVEN `@tobilu/qmd` 可以被 dynamic import
- WHEN 调用 `isAvailable()`
- THEN 返回 true

#### 场景: qmd 不可导入时返回 false

- GIVEN `@tobilu/qmd` 的 dynamic import 抛出错误
- WHEN 调用 `isAvailable()`
- THEN 返回 false
- AND 不抛出错误
