---
name: update-knowledge
description: 更新项目知识库（knowledge/ 目录）。当用户说"更新知识库"、"写入知识库"、"记录到知识库"、"存到 knowledge"、"更新 overview"、"更新 roadmap"、"记录调研结论"、"记录技术决策"、或使用 /update-knowledge 时触发。也适用于完成技术调研后用户想保存结论、做出重大技术决策后想记录、或 change 归档后想更新进展的场景。
---

Update the project knowledge base at `knowledge/`.

**Input**: The argument after the trigger is what the user wants to update. Could be:
- A specific file: "overview", "roadmap", "progress"
- A new research entry: "调研结论: YAML 解析库选型"
- A new decision: "技术决策: 选择 ESM-first"
- General: "把刚才的调研存一下"
- Nothing (interactive — ask what to update)

---

## Knowledge Base Structure

```
knowledge/
├── overview.md              # 项目全景快照（始终保持最新，≤100 行）
├── progress.md              # 进展时间线（追加式）
├── roadmap.md               # 方向规划（短期/中期/长期）
├── research/                # 调研结论
│   ├── _index.md            # 索引（一行一条摘要）
│   └── *.md                 # 每个主题一个文件
├── decisions/               # 技术决策 (ADR)
│   ├── _index.md            # 索引
│   └── NNN-*.md             # 递增编号
└── _templates/              # 格式模板
    ├── research.md
    ├── decision.md
    └── progress-entry.md
```

## Steps

### 1. Determine what to update

If the user specified what to update, proceed. If not, ask:
> "想更新知识库的哪个部分？"
> - overview.md（项目全景）
> - progress.md（新增里程碑）
> - roadmap.md（方向规划）
> - research/（新调研结论）
> - decisions/（新技术决策）

### 2. Read the template (for new entries)

For new research or decision entries, read the corresponding template first:

| Type | Template |
|------|----------|
| Research | `knowledge/_templates/research.md` |
| Decision | `knowledge/_templates/decision.md` |
| Progress entry | `knowledge/_templates/progress-entry.md` |

For updating existing files (overview, roadmap, progress), read the current file content instead.

### 3. Write the content

Follow these rules strictly:

**For research entries:**
- Read `knowledge/_templates/research.md` first
- File name: kebab-case (e.g., `yaml-parsing.md`)
- Fill all template sections: 状态、结论、背景、选项对比、最终选择、参考
- After writing, update `knowledge/research/_index.md` with a one-line summary

**For decision entries:**
- Read `knowledge/_templates/decision.md` first
- File name: three-digit prefix + kebab-case (e.g., `001-monorepo-structure.md`)
- Check existing files to determine next number
- Fill all template sections: 状态、上下文、选项、决定、后果
- After writing, update `knowledge/decisions/_index.md` with a one-line summary

**For progress entries:**
- Read `knowledge/_templates/progress-entry.md` first
- Append to `knowledge/progress.md` following the template format
- Include date, description, and result

**For overview updates:**
- Read current `knowledge/overview.md`
- Update in-place (overwrite, not append) to reflect current project state
- Keep under 100 lines
- Update the "最后更新" date

**For roadmap updates:**
- Read current `knowledge/roadmap.md`
- Update in-place to reflect new priorities
- Keep the three-layer structure: 短期、中期、长期
- Update the "最后更新" date
- Update "当前位置" section

### 4. Confirm

After writing, briefly tell the user what was updated and where.

## Guardrails

- Always read the template before creating new entries — the template is the format's source of truth
- Never skip updating `_index.md` when adding to research/ or decisions/
- overview.md is a snapshot (overwrite), not a log (append)
- progress.md is a log (append), not a snapshot (overwrite)
- Content should capture non-obvious insights, not things derivable from code or git history
