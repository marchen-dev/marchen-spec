# MarchenSpec

MarchenSpec 是一个 OpenSpec-like 的 spec workflow CLI，目前处于项目基础设施建设阶段。

## Workspace Layout

- `apps/cli`: 面向用户的 CLI app
- `packages/core`: workflow use case 与领域层
- `packages/fs`: 仓库与 artifact 文件访问
- `packages/config`: 配置加载与校验
- `packages/shared`: 共享 types、errors、constants

## Development

安装依赖后，可以使用以下命令：

```bash
pnpm build
pnpm dev
pnpm lint
pnpm format
pnpm test
pnpm typecheck
```

CLI app 是主要发布产物。基础版本号提升流程使用：

```bash
pnpm release:version
```
