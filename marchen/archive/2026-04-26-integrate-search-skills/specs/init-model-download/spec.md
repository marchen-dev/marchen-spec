### 需求: marchen init SHALL 提供模型下载选项

#### 场景: 用户选择下载模型

- GIVEN 用户执行 `marchen init`
- WHEN 交互到模型下载步骤
- THEN 显示选项："是否启用语义搜索？（需要下载约 2GB 模型）"
- AND 用户选择"是"
- THEN 调用 ModelManager.ensureModels 下载模型
- AND spinner 展示每个模型的下载进度
- AND 下载完成后提示"语义搜索已启用"

#### 场景: 用户跳过模型下载

- GIVEN 用户执行 `marchen init`
- WHEN 交互到模型下载步骤
- THEN 用户选择"跳过"
- AND 不下载模型
- AND 提示"使用基础关键词搜索，后续可通过 marchen search --rebuild 启用语义搜索"

#### 场景: 模型已存在时跳过询问

- GIVEN 本地模型已下载且校验通过
- WHEN 用户执行 `marchen init`
- THEN 不询问模型下载
- AND 提示"语义搜索已就绪"
