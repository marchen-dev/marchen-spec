## 背景

将项目中"语义搜索""关键词搜索"等模糊用语统一为专业术语：Hybrid Search（BM25 + Vector + Reranking）和 BM25。涉及 CLI 命令文案、JSDoc 注释、错误信息和 README。

## 1. CLI 命令文案

- [x] 1.1 init.ts：选项 label/hint 和日志信息改用专业术语
- [x] 1.2 update.ts：日志信息改用专业术语
- [x] 1.3 search.ts：命令 description 和 JSDoc 改用专业术语

## 2. Core 层注释和错误信息

- [x] 2.1 search-manager.ts：JSDoc 注释和错误信息改用专业术语

## 3. README

- [x] 3.1 README.md：搜索章节标题和正文改用专业术语
- [x] 3.2 README.en.md：搜索章节标题和正文改用专业术语

## 4. 验证

- [x] 4.1 运行 pnpm check 确保通过
