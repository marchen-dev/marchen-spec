## extract-model-progress-utils

提取重复的模型进度格式化代码到共享 utils。

### 需求: 模型进度格式化 SHALL 提取为共享模块

`MODEL_LABELS` 常量和 `formatModelProgress()` 函数 SHALL 从 `init.ts` 和 `search.ts` 中提取到 `apps/cli/src/utils/model-progress.ts`，由 init、update、search 三个命令共用。

#### 场景: init 命令使用共享模块

WHEN init 命令下载模型时
THEN SHALL 使用 `model-progress.ts` 中的 `formatModelProgress()` 格式化进度

#### 场景: search 命令使用共享模块

WHEN search 命令准备搜索引擎时
THEN SHALL 使用 `model-progress.ts` 中的 `formatModelProgress()` 格式化进度

#### 场景: update 命令使用共享模块

WHEN update 命令下载模型时
THEN SHALL 使用 `model-progress.ts` 中的 `formatModelProgress()` 格式化进度
