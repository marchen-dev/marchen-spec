# MarchenSpec Specs 架构决策

> 日期: 2026-04-01
> 状态: 已决定

## 背景

OpenSpec 使用双层规范系统：
- `openspec/specs/` - 主规范，系统当前状态
- `openspec/changes/*/specs/` - Delta specs，变更增量

每次 archive 时，需要将 delta specs 合并到 main specs。

## 问题

通过调研 OpenSpec 和分析 MarchenSpec 现状，发现：

1. **合并复杂度高**
   - ADDED → 追加
   - MODIFIED → 替换
   - REMOVED → 删除
   - 需要实现非平凡的合并算法

2. **维护成本高**
   - 容易出现 main spec 和 delta spec 不一致
   - 需要手动清理标记
   - 合并质量难以保证

3. **内容重复**
   - main specs 和 archive delta specs 高度重复
   - 存储浪费

4. **OpenSpec 按需加载**
   - specs/ 不是全部注入上下文
   - AI 按需搜索和读取
   - 合并可以由 AI 自己完成

## 决策

**去掉 `marchenspec/specs/` 目录，archive 作为唯一真相来源**

### 具体方案

```
marchenspec/
└─ changes/
   ├─ my-feature/          (活跃变更)
   │  ├─ proposal.md
   │  ├─ design.md
   │  ├─ tasks.md
   │  └─ specs/
   │     └─ auth/spec.md   (delta spec)
   │
   └─ archive/             (唯一真相来源)
      ├─ 2026-03-29-xxx/
      │  └─ specs/
      └─ 2026-03-30-xxx/
         └─ specs/

(不再有 marchenspec/specs/ 目录)
```

### archive 命令简化

```
之前: archive = 移动文件 + sync delta specs → main specs
之后: archive = 移动文件，完事
```

## 理由

### 1. 单一真相来源
- archive 是唯一的历史记录
- 不会出现 main spec 和 delta spec 不一致
- 每个变更自包含，易于理解

### 2. 简化实现
- 不需要实现复杂的合并算法
- archive 命令只做文件移动
- 减少出错可能

### 3. 适合目标用户
- 目标: 小团队，中型项目
- 代码库不会太大 (< 10万行)
- archive 数量可控 (< 100个)
- 按需查询性能足够

### 4. AI 可以自己合并
- OpenSpec 的 specs/ 是按需加载，不是全部注入
- AI 足够聪明，可以读多个 delta specs 自己理解
- 不需要预先合并

## 权衡

### 优点
- ✓ 实现简单
- ✓ 维护成本低
- ✓ 不会出现不一致
- ✓ 单一真相来源

### 缺点
- ✗ 没有"一眼看到当前状态"的地方
- ✗ 查询时需要遍历 archive
- ✗ 偏离 OpenSpec 标准

## 未来扩展

如果项目规模增长，可以考虑：

1. **缓存机制**
   - 缓存最近查询的 capability
   - LRU 策略

2. **可选的 specs/ 生成**
   - `marchen specs build` 生成持久化的 specs/
   - 加入 .gitignore
   - 用于需要快速查看的场景

3. **索引文件**
   - 生成 capability 索引
   - 加速查询

## 影响范围

### 需要实现的命令
- `marchen archive` - 简化版，只移动文件
- `marchen specs list` - 列出所有 capability (可选)
- `marchen specs show <name>` - 显示 capability 的历史 (可选)

### 需要删除
- 当前的 `openspec/specs/` 目录
- sync 相关逻辑 (如果有)

### 不受影响
- `marchen init`
- `marchen new`
- `marchen list`
- archive 内的 delta specs 格式保持不变

## 参考

- OpenSpec concepts: https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md
- OpenSpec 按需加载策略
- OpenAI Harness Engineering 实践
