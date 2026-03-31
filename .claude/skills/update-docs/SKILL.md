---
name: update-docs
description: Update docs/roadmap.md by adding completed changes to the "Completed" section.
---

# update-docs

更新项目文档（docs/roadmap.md），在归档 change 后将其添加到"已完成"部分。

## 用法

```
/update-docs <change-name>
```

**参数:**
- `<change-name>`: 已归档的 change 名称（不含日期前缀）

**示例:**
```
/update-docs refactor-knowledge-to-docs
```

## 功能

1. 在 `openspec/changes/archive/` 中查找最新的 `<date>-<change-name>` 目录
2. 读取该 change 的 `proposal.md`，提取"Why"部分作为描述
3. 在 `docs/roadmap.md` 的"已完成 ✅"部分顶部插入新行
4. 格式：`- YYYY-MM-DD: [描述](../openspec/changes/archive/<date>-<change-name>/)`

## 步骤

1. **查找归档的 change**

   在 `openspec/changes/archive/` 中查找匹配 `*-<change-name>` 的目录。如果有多个（不太可能），选择日期最新的。

   如果找不到，报错并提示用户检查 change 名称。

2. **读取 proposal.md**

   读取 `openspec/changes/archive/<date>-<change-name>/proposal.md`，提取"## Why"部分的第一句话作为描述。

   如果"Why"部分为空或不存在，使用 change 名称作为描述。

3. **更新 roadmap.md**

   在 `docs/roadmap.md` 中找到"## 已完成 ✅"部分，在其下方第一行（列表开始处）插入新条目：

   ```markdown
   - YYYY-MM-DD: [描述](../openspec/changes/archive/<date>-<change-name>/)
   ```

   保持按日期倒序排列（最新的在最上面）。

4. **确认完成**

   显示添加的条目，提示用户检查 `docs/roadmap.md`。

## 注意事项

- 如果 roadmap.md 中已存在该 change 的条目，跳过并提示用户
- 描述会自动截断到第一个句号，保持简洁
