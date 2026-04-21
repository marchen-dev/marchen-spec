## 背景

用户希望通过 `marchen -v` 查看版本号，而不是只能用 `marchen --version`。Commander 的 `.version()` 默认注册的短标志是 `-V`（大写），需要显式指定 `-v, --version` 来覆盖。

## 1. 修改版本标志

- [x] 1.1 在 program.ts 中为 `.version()` 添加第二个参数 `-v, --version`，使 `-v` 可用
