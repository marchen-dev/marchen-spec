// 此文件由 scripts/generate-templates.ts 自动生成，请勿手动修改

export const COMMAND_APPLY = `---
name: "Marchen: Apply"
description: 按变更的 tasks.md 逐个实现任务
category: Workflow
tags: [workflow, implementation]
---

按变更的 tasks.md 逐个实现任务，完成后勾选 checkbox。

---

**输入**：\`/marchen:apply\` 后面跟变更名称，或省略自动推断。

**流程**

1. **选择变更**

   有名称就用，没有则：
   - 从对话上下文推断
   - 只有一个 open 变更时自动选择
   - 多个变更时 \`marchen list --json\` + **AskUserQuestion** 让用户选

   显示："使用变更: \`<name>\`"

2. **获取实现指令**

   \`\`\`bash
   marchen instructions <name> apply --json
   \`\`\`

   返回 JSON 包含：
   - \`state\`：\`"ready"\` / \`"blocked"\` / \`"all_done"\`
   - \`progress\`：\`{ total, completed, remaining }\`
   - \`context\`：所有 artifact 的信息数组，每项包含 \`id\`、\`status\`、\`path\`、\`content\`
   - \`instruction\`：实现指引
   - \`changeDir\`：变更目录绝对路径

   根据 \`state\` 处理：
   - \`"blocked"\` → 提示先完成 artifacts（\`/marchen:propose\`）
   - \`"all_done"\` → 提示归档（\`/marchen:archive\`）
   - \`"ready"\` → 继续

3. **显示进度**

   从返回的 JSON 读取并显示：
   "变更: \`<name>\` | 进度: N/M | 下一个: <第一个未完成任务的描述>"

4. **逐个实现任务**

   从 \`context\` 中读取所有 artifact 内容作为上下文。

   对每个未完成任务：
   - 显示 "任务 N/M: <描述>"
   - 实现代码改动
   - 在 tasks.md 中勾选：\`- [ ]\` → \`- [x]\`
     文件路径：\`<changeDir>/tasks.md\`
   - 显示 "✓ 完成"
   - 继续下一个

   **暂停条件：**
   - 任务不清晰 → 询问用户
   - 发现设计问题 → 建议更新 artifact
   - 遇到错误或阻塞 → 报告并等待
   - 用户中断

5. **显示结果**

   全部完成时：
   "全部完成 (N/N)，可以用 \`/marchen:review\` 检查实现，或直接 \`/marchen:archive\` 归档。"

   暂停时：
   "暂停于任务 N/M: <原因>"

**护栏**

- 实现前必须读 context 中的 artifact 内容
- 每完成一个任务立即勾选 checkbox，不要攒着
- 改动最小化，只做任务要求的事
- 不确定就暂停问，不要猜
- 如果实现过程中遇到不确定的设计决策，可以用 \`marchen search "<关键词>" --json\` 搜索历史变更中的相关方案
- 使用 AskUserQuestion 时，选项不超过 4 个
- \`instruction\` 是给你的指引，不要原样复制到代码注释中
`

export const COMMAND_ARCHIVE = `---
name: "Marchen: Archive"
description: 归档已完成的变更
category: Workflow
tags: [workflow, archive]
---

归档已完成的变更，检查完成度后执行归档。

---

**输入**：用户的请求可包含变更名称（如 \`/marchen:archive add-auth\`），也可不带。

**流程**

1. **确定变更名称**

   有名称就用，没有则：
   - 从对话上下文推断
   - 只有一个 open 变更时自动选择
   - 多个变更时 \`marchen list --json\` + **AskUserQuestion** 让用户选

   **重要**：不要猜测或自动选择，必须让用户确认。

2. **检查完成度**

   \`\`\`bash
   marchen status <name> --json
   \`\`\`

   解析 JSON，检查：
   - \`artifacts\`：每个 artifact 的 \`status\` 是否为 \`filled\`
   - \`tasks.completed\` vs \`tasks.total\`（\`tasks\` 为 null 时视为无任务，跳过检查）

   **如果全部完成：** 直接进入下一步。

   **如果有未完成的 artifact 或 task：**
   - 显示警告，列出未完成项
   - 用 **AskUserQuestion** 确认是否继续
   - 用户确认后继续，不阻塞

3. **生成摘要**

   读取 \`marchen/changes/<name>/proposal.md\`，从中生成一句话中文摘要（≤50字），概括这次变更做了什么。摘要应包含关键语义词，便于后续 AI 检索。

4. **执行归档**

   \`\`\`bash
   marchen archive <name> --summary "<生成的摘要>" --json
   \`\`\`

   解析返回的 JSON 获取归档结果。

5. **显示结果**

   \`\`\`
   变更 "<name>" 已归档
   Schema: <schema>
   归档到: <archivedTo>
   \`\`\`

   如有警告（未完成项），一并显示。

**护栏**

- 未提供名称时必须用 AskUserQuestion 让用户选择
- 用 \`status --json\` 检查完成度，不要自己读文件判断
- 警告不阻塞归档，只提醒 + 确认
- 使用 AskUserQuestion 时，选项不超过 4 个
`

export const COMMAND_EXPLORE = `---
name: "Marchen: Explore"
description: 进入探索模式 — 思考想法、调查问题、厘清需求
category: Workflow
tags: [workflow, explore, thinking]
---

进入探索模式。深入思考，自由可视化，跟随对话走向任何方向。

**重要：探索模式只用于思考，不用于实现。** 可以读文件、搜索代码、调查代码库，但绝不能写代码或实现功能。如果用户要求实现，提醒他们先退出探索模式并用 \`/marchen:propose\` 创建变更。可以创建 MarchenSpec artifact（proposal、design、spec）——那是捕获思考，不是实现。

**这是一种姿态，不是工作流。** 没有固定步骤、没有必须的顺序、没有强制输出。你是帮助用户探索的思考伙伴。

**输入**：\`/marchen:explore\` 后面可以跟任何内容：
- 模糊的想法："实时协作"
- 具体的问题："auth 系统越来越难维护了"
- 变更名称："add-dark-mode"（在该变更上下文中探索）
- 方案比较："postgres vs sqlite"
- 什么都不带也行

---

## 姿态

- **好奇，不武断** — 提出自然涌现的问题，不按脚本走
- **开放线索，不审问** — 展示多个有趣方向，让用户跟随感兴趣的。不要把他们引导到单一路径上
- **视觉化** — 大量使用 ASCII 图表来辅助思考
- **自适应** — 跟随有趣的线索，有新信息时及时转向
- **耐心** — 不急于下结论，让问题的形状自然浮现
- **接地气** — 在相关时探索实际代码库，不要空谈理论

---

## 你可以做什么

根据用户带来的内容，你可能会：

**探索问题空间**
- 提出从用户所说内容中自然涌现的澄清问题
- 挑战假设
- 重新框定问题
- 寻找类比

**调查代码库**
- 映射与讨论相关的现有架构
- 找到集成点
- 识别已有的模式
- 发现隐藏的复杂性

**比较方案**
- 头脑风暴多种方案
- 构建比较表
- 勾勒权衡
- 推荐路径（如果被问到）

**可视化**
\`\`\`
┌─────────────────────────────────────────┐
│     Use ASCII diagrams liberally        │
├─────────────────────────────────────────┤
│                                         │
│   ┌────────┐         ┌────────┐        │
│   │ State  │────────▶│ State  │        │
│   │   A    │         │   B    │        │
│   └────────┘         └────────┘        │
│                                         │
│   System diagrams, state machines,      │
│   data flows, architecture sketches,    │
│   dependency graphs, comparison tables  │
│                                         │
└─────────────────────────────────────────┘
\`\`\`

**发现风险和未知**
- 识别可能出错的地方
- 找到理解上的空白
- 建议 spike 或调查

---

## MarchenSpec 感知

你了解 MarchenSpec 系统。自然地使用它，不要强制。

### 检查上下文

开始时快速检查现有状态和历史：

1. 当前变更：
\`\`\`bash
marchen list --json
\`\`\`

2. 变更历史概览：
\`\`\`bash
cat marchen/changelog.md
\`\`\`
这是所有已归档变更的索引，每条包含日期、变更名和一句话摘要。先扫一遍找到与用户话题相关的条目。如果找到，直接读对应 archive 目录下的 proposal.md 或 design.md 了解详情。

3. 语义搜索：

这是 RAG 搜索，不是 grep——构造语义完整的短语，不要用单个泛词。

\`\`\`bash
marchen search "<语义完整的查询短语>" --json
\`\`\`

**查询构造指引：**
- 用描述性短语，不用单个词：
  "初始化适配多个 agent 客户端" → \`"multi-agent provider 初始化"\`
  "之前怎么处理错误的" → \`"错误处理 error handling 重构"\`
  "暗色模式的设计决策" → \`"dark mode 设计方案"\`
- 中英文混合效果更好（归档内容里中英都有）
- 如果结果不理想，换个角度重新构造查询

如果有匹配结果（score >= 0.4），读取对应 archive 目录下的 design.md 或 proposal.md 了解详细决策。

如果 \`marchen search\` 不可用（命令报错），回退到 changelog.md + 手动读 archive 目录。

这告诉你：
- 是否有进行中的变更
- 它们的名称、schema 和状态
- 项目过去做过哪些变更
- 用户可能在做什么

如果用户提到了特定变更名称，读取它的 artifact 作为上下文。

### 没有变更时

自由思考。当洞察结晶时，根据复杂度推荐下一步：

**判断标准：**
- \`/marchen:lite\` — bug 修复、小改动、单一任务组、不需要设计文档
- \`/marchen:propose\` — 新功能、多步骤、需要 design/specs、涉及多模块

**推荐方式：** 直接在回复中输出推荐，说明理由，让用户自行输入命令。示例：

> 想法差不多成型了。这个改动比较简单（只涉及一个文件的小调整），建议用 \`/marchen:lite\` 直接走轻量流程。
>
> 如果你觉得需要更完整的设计文档，也可以用 \`/marchen:propose\`。

根据讨论内容给出你的推荐和理由，但让用户自己决定输入哪个命令。

### 有变更时

如果用户提到了变更或你发现某个变更相关：

1. **读取已有 artifact 作为上下文**
   - \`marchen/changes/<name>/proposal.md\`
   - \`marchen/changes/<name>/design.md\`
   - \`marchen/changes/<name>/tasks.md\`
   - 等

2. **在对话中自然引用**
   - "你的 design 提到用 Redis，但我们刚发现 SQLite 更合适……"
   - "proposal 把范围限定在付费用户，但我们现在觉得应该面向所有人……"

3. **在做出决策时提议捕获**

   | 洞察类型 | 捕获到哪里 |
   |---------|-----------|
   | 发现新需求 | \`specs/<capability>/spec.md\` |
   | 需求变更 | \`specs/<capability>/spec.md\` |
   | 做出设计决策 | \`design.md\` |
   | 范围变更 | \`proposal.md\` |
   | 发现新工作 | \`tasks.md\` |
   | 假设被推翻 | 相关 artifact |

   示例：
   - "这是一个设计决策。要记录到 design.md 吗？"
   - "这是新需求。要加到 specs 里吗？"
   - "这改变了范围。要更新 proposal 吗？"

4. **用户决定** — 提议后继续。不施压，不自动捕获。

---

## 不必做的事

- 按脚本走
- 每次问同样的问题
- 产出特定 artifact
- 得出结论
- 如果有价值的岔路就不必守住话题
- 简短（这是思考时间）

---

## 结束探索

没有固定的结束方式。探索可能：

- **流向下一阶段**：用 **AskUserQuestion** 提供 \`/marchen:lite\` 和 \`/marchen:propose\` 选项，附带推荐理由
- **更新 artifact**："已将这些决策更新到 design.md"
- **只是提供清晰度**：用户得到了需要的，继续前进
- **稍后继续**："随时可以继续"

当想法结晶时，你可以提供总结——但不是必须的。有时候思考过程本身就是价值。

---

## 护栏

- **不实现** — 绝不写代码或实现功能。创建 MarchenSpec artifact 可以，写应用代码不行
- **不伪装理解** — 不清楚就深挖
- **不催促** — 探索是思考时间，不是任务时间
- **不强制结构** — 让模式自然浮现
- **不自动捕获** — 提议保存洞察，不要直接做
- **要可视化** — 一张好图胜过千言万语
- **要探索代码库** — 让讨论扎根于现实
- **要质疑假设** — 包括用户的和你自己的
`

export const COMMAND_LITE = `---
name: "Marchen: Lite"
description: 一键式轻量变更流程。创建 lite 变更、实现任务、询问归档，一气呵成
category: Workflow
tags: [workflow, lite]
---

一键式轻量变更 — 使用 lite schema 创建变更，自动实现任务，完成后询问归档。
适合 bug 修复、小改动、explore 之后的快速执行。

---

**输入**：\`/marchen:lite\` 后面跟变更名称（kebab-case）或变更描述。

**流程**

1. **确定变更名称**

   如果提供了输入，直接使用或从描述中提取 kebab-case 名称（如"修复登录 bug" → \`fix-login-bug\`）。

   如果没有输入，用 **AskUserQuestion** 工具询问：
   > "你想做什么变更？描述一下你要构建或修复的内容。"

   从回答中提取 kebab-case 名称。

   **重要**：必须理解用户想做什么才能继续。

2. **创建变更目录**

   \`\`\`bash
   marchen new <name> --schema lite
   \`\`\`

   创建 \`marchen/changes/<name>/\` 目录，包含 \`.metadata.yaml\` 和 \`tasks.md\` 骨架。

   如果同名变更已存在，用 **AskUserQuestion** 询问用户是继续已有变更还是换个名称。

3. **获取 tasks 指令**

   \`\`\`bash
   marchen status <name> --json
   \`\`\`

   确认变更创建成功，然后获取 tasks 的创建指令：

   \`\`\`bash
   marchen instructions <name> tasks --json
   \`\`\`

   返回 JSON 包含：
   - \`template\`：tasks.md 的骨架结构（含 \`## 背景\` 章节）
   - \`instruction\`：如何填充 tasks 的指导文本
   - \`outputPath\`：写入路径（\`tasks.md\`）
   - \`context\`：上下文信息（lite schema 下为空数组）

4. **填充 tasks.md**

   根据用户描述 + \`instruction\` 指引 + \`template\` 结构，填充 tasks.md：
   - \`## 背景\`：简要说明变更目的和方案
   - 任务列表：按组分类，checkbox 格式

   写入 \`marchen/changes/<name>/tasks.md\`。

   如果用户描述太模糊，用 **AskUserQuestion** 澄清关键信息。

5. **开始实现**

   获取实现指令：

   \`\`\`bash
   marchen instructions <name> apply --json
   \`\`\`

   返回 JSON 包含：
   - \`state\`：\`"ready"\` / \`"blocked"\` / \`"all_done"\`
   - \`progress\`：\`{ total, completed, remaining }\`
   - \`context\`：所有 artifact 的信息数组
   - \`instruction\`：实现指引
   - \`changeDir\`：变更目录绝对路径

   显示："变更: \`<name>\` | 任务: 0/N | 开始实现..."

   对每个未完成任务：
   - 显示 "任务 N/M: <描述>"
   - 实现代码改动
   - 在 tasks.md 中勾选：\`- [ ]\` → \`- [x]\`
     文件路径：\`<changeDir>/tasks.md\`
   - 显示 "✓ 完成"
   - 继续下一个

   **暂停条件：**
   - 任务不清晰 → 询问用户
   - 发现设计问题 → 建议更新 artifact
   - 遇到错误或阻塞 → 报告并等待
   - 用户中断

   暂停时显示："暂停于任务 N/M: <原因>"，流程结束。

6. **全部完成 → 询问归档**

   所有任务完成后，用 **AskUserQuestion** 询问：

   > "全部任务已完成 (N/N)，是否归档这个变更？"
   > - 归档
   > - 暂不归档

   **如果用户选择归档：**

   读取 \`marchen/changes/<name>/tasks.md\` 的背景段，生成一句话中文摘要（≤50字）。

   \`\`\`bash
   marchen archive <name> --summary "<摘要>" --json
   \`\`\`

   显示：
   \`\`\`
   变更 "<name>" 已归档
   归档到: <archivedTo>
   \`\`\`

   **如果用户选择暂不归档：**

   显示："好的，后续可以用 \`/marchen:archive <name>\` 归档。"

**护栏**

- 必须使用 \`--schema lite\` 创建变更
- tasks.md 的 \`## 背景\` 章节必须填写，不能留空
- 任务粒度要小到一个会话内能完成
- 如果上下文关键信息不清楚，询问用户；但小疑问优先做合理判断，保持节奏
- 已存在同名变更时必须询问用户，不要覆盖
- 实现前必须读 context 中的 artifact 内容
- 每完成一个任务立即勾选 checkbox，不要攒着
- 改动最小化，只做任务要求的事
- 不确定就暂停问，不要猜
- \`instruction\` 是给你的指引，不要把它原样复制到代码注释或 tasks.md 中
- 使用 AskUserQuestion 时，选项不超过 4 个
`

export const COMMAND_PROPOSE = `---
name: "Marchen: Propose"
description: 提出新变更，创建并填充所有 artifact
category: Workflow
tags: [workflow, artifacts]
---

提出新变更 — 创建变更目录并按依赖顺序生成所有 artifact。

将创建以下 artifact：
- proposal.md（动机和变更内容）
- specs/（每个能力的需求规格）
- design.md（技术方案）
- tasks.md（实现任务清单）

完成后可用 /marchen:apply 开始实现。

---

**输入**：\`/marchen:propose\` 后面跟变更名称（kebab-case）或变更描述。

**流程**

1. **确定变更名称**

   如果提供了输入，直接使用或从描述中提取 kebab-case 名称（如"添加用户认证" → \`add-user-auth\`）。

   如果没有输入，用 **AskUserQuestion** 工具询问：
   > "你想做什么变更？描述一下你要构建或修复的内容。"

   从回答中提取 kebab-case 名称。

   **重要**：必须理解用户想做什么才能继续。

2. **创建变更目录**

   \`\`\`bash
   marchen new <name>
   \`\`\`

   创建 \`marchen/changes/<name>/\` 目录和 \`.metadata.yaml\`。

   如果同名变更已存在，用 **AskUserQuestion** 询问用户是继续已有变更还是换个名称。

3. **循环创建 artifact**

   用 **TaskCreate** 工具创建任务列表追踪进度。

   循环执行以下步骤：

   a. **查询当前状态**
      \`\`\`bash
      marchen status <name> --json
      \`\`\`
      返回 JSON 包含：
      - \`workflow.next\`：下一个应该创建的 artifact ID，全部完成时为 \`null\`
      - \`workflow.ready\`：当前可以创建的 artifact 列表
      - \`workflow.blocked\`：被阻塞的 artifact 列表
      - \`artifacts\`：每个 artifact 的状态详情（\`id\`、\`status\`、\`path\`）

      如果 \`workflow.next\` 为 \`null\` → 全部完成，跳到第 4 步。

   b. **获取创建指令**
      \`\`\`bash
      marchen instructions <name> <workflow.next> --json
      \`\`\`
      返回 JSON 包含：
      - \`template\`：artifact 的 markdown 骨架结构，用它作为输出文件的框架
      - \`instruction\`：如何填充该 artifact 的指导文本
      - \`outputPath\`：写入路径（相对于变更目录）
      - \`context\`：上下文 artifact 的信息数组，每项包含 \`id\`、\`status\`、\`content\`（已填充的内容直接在这里，不需要额外读文件）
      - \`unlocks\`：完成此 artifact 后解锁的 artifact 列表

   c. **创建 artifact**

      根据 artifact 类型处理：

      **普通 artifact（proposal / design / tasks）：**
      - 读取 \`context\` 中 \`status\` 为 \`filled\` 的 \`content\` 作为上下文
      - 按 \`instruction\` 指引 + \`template\` 结构生成内容
      - 写入 \`marchen/changes/<name>/<outputPath>\`
      - 写入后验证文件存在

      **specs（目录型 artifact，outputPath 为 \`specs/\`）：**
      - 读取 proposal 内容（在 \`context\` 中，\`id\` 为 \`proposal\` 的 \`content\`）
      - 从 proposal 的"能力"章节提取能力列表（kebab-case 名称）
      - 为每个能力：
        - 创建目录 \`marchen/changes/<name>/specs/<capability>/\`
        - 按 \`template\` 结构 + \`instruction\` 指引生成 spec 内容
        - 写入 \`specs/<capability>/spec.md\`
      - 写入后验证每个 spec 文件存在

      **如果 proposal 的上下文不够清晰**（用户描述太模糊）：
      - 用 **AskUserQuestion** 澄清关键信息
      - 然后继续创建

   d. 显示进度："已创建 \`<artifact-id>\`"，标记任务完成，回到步骤 a。

4. **显示最终状态**

   \`\`\`bash
   marchen status <name>
   \`\`\`

**输出**

完成后显示：
- 变更名称和目录位置
- 已创建的 artifact 列表及简要说明
- 提示："所有 artifact 已就绪，可以用 \`/marchen:apply\` 开始实现。"

**护栏**

- 按依赖顺序创建，不跳过 artifact
- 每次循环创建一个 artifact（specs 算一个，但包含多个文件）
- 写入后验证文件存在再继续下一个
- 如果上下文关键信息不清楚，询问用户；但小疑问优先做合理判断，保持节奏
- 已存在同名变更时必须询问用户，不要覆盖
- \`instruction\` 是给你的指引，不要把它原样复制到 artifact 文件中
- 使用 AskUserQuestion 时，选项不超过 4 个；需要更多选项时合并或分步询问
`

export const COMMAND_REVIEW = `---
name: "Marchen: Review"
description: 对照变更意图检查代码实现
category: Workflow
tags: [workflow, review]
---

对照变更的 artifact 检查代码改动，报告遗漏和偏差。

---

**输入**：\`/marchen:review\` 后面跟变更名称，或省略自动推断。

**流程**

1. **选择变更**

   有名称就用，没有则：
   - 从对话上下文推断
   - 只有一个 open 变更时自动选择
   - 多个变更时 \`marchen list --json\` + **AskUserQuestion** 让用户选

   显示："Review 变更: \`<name>\`"

2. **Spawn sub-agent 执行 review**

   spawn 一个 sub-agent，传入以下 prompt：

   \`\`\`
   你是 reviewer，负责检查变更 "<name>" 的代码改动是否完整实现了变更意图。

   ## 第一步：获取变更意图

   执行以下命令获取变更的所有 artifact 内容：

   marchen instructions <name> apply --json

   从返回的 JSON 中读取 \`context\` 数组，其中每个 \`status\` 为 "filled" 的项
   就是一个 artifact，包含 \`id\` 和 \`content\` 字段。这些就是变更意图。

   ## 第二步：获取代码改动

   执行 \`git diff HEAD\` 获取代码改动。
   如果 diff 为空，尝试 \`git diff HEAD~1\`。
   如果仍为空，报告 "未检测到代码改动" 并结束。

   ## 第三步：对照检查

   逐条对照变更意图和代码改动：

   **任务完成度** — 检查 tasks 中每个任务是否有对应的代码改动：
   - ✅ 任务 1: <描述> — 已实现
   - ❌ 任务 2: <描述> — 未找到对应改动

   **一致性检查** — 检查实现是否符合 design 中的设计决策：
   - ✅ <决策> — 已遵守
   - ⚠️ <决策> — 实现有偏差：<说明>

   **需求覆盖** — 检查 specs 中的需求是否都被覆盖：
   - ✅ <需求> — 已覆盖
   - ❌ <需求> — 未覆盖

   **发现的问题（如有）**
   - <文件:行号> <问题描述>

   全部通过时输出：
   "✅ Review 通过，实现与变更意图一致。"

   ## 约束

   - 重点检查完整性和一致性，不做风格审查
   - 不报告缺少注释
   - 不要修改任何代码，只报告
   \`\`\`

3. **展示报告**

   将 sub-agent 返回的 review 报告展示给用户。

   全部通过时：
   "可以用 \`/marchen:archive\` 归档。"

   有问题时：
   提示用户修复后可以再次 \`/marchen:review\`。

**护栏**

- 必须使用 sub-agent 执行 review，不要在主会话中读 diff
- 不要修改任何代码，只报告
- 使用 AskUserQuestion 时，选项不超过 4 个
`

/** Command 模板定义 */
export interface CommandTemplate {
  readonly fileName: string
  readonly content: string
}

/** 所有 command 模板 */
export const COMMAND_TEMPLATES: Record<string, CommandTemplate> = {
  apply: { fileName: 'apply.md', content: COMMAND_APPLY },
  archive: { fileName: 'archive.md', content: COMMAND_ARCHIVE },
  explore: { fileName: 'explore.md', content: COMMAND_EXPLORE },
  lite: { fileName: 'lite.md', content: COMMAND_LITE },
  propose: { fileName: 'propose.md', content: COMMAND_PROPOSE },
  review: { fileName: 'review.md', content: COMMAND_REVIEW },
}
