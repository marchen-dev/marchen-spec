## 背景

Node.js 环境下 `better-sqlite3` 自带编译好的 SQLite 引擎，`sqlite-vec` 也通过 npm 提供预编译二进制，用户不需要手动安装系统级 SQLite。README 中关于 `brew install sqlite` 等安装说明是误导性的，需要移除。

## 1. 更新 README

- [x] 1.1 移除 README.md 中"语义搜索依赖 SQLite"段落及安装命令
- [x] 1.2 移除 README.en.md 中对应的 SQLite 安装段落
