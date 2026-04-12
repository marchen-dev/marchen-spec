# directory-naming

## 概述

根目录从 `marchenspec/` 改为 `marchen/`。

### 需求: SPEC_DIRECTORY_NAME SHALL 为 `'marchen'`

常量值 MUST 从 `'marchenspec'` 改为 `'marchen'`。

#### 场景: init 创建目录

WHEN 执行 `marchen init`
THEN 创建 `marchen/` 目录（而非 `marchenspec/`）
AND 目录结构不变（changes/、archive/ 等子目录）

#### 场景: 所有命令识别新目录

WHEN 在已 init 的项目中执行任何 marchen 命令
THEN 命令在 `marchen/` 目录下查找数据
AND 不再查找 `marchenspec/`

### 需求: 所有路径引用 SHALL 更新为 `marchen/`

模板、文档、测试中的 `marchenspec/` 路径 MUST 全部替换为 `marchen/`。

#### 场景: skill 模板中的路径

WHEN 查看生成的 skill 模板内容
THEN 所有路径示例使用 `marchen/` 而非 `marchenspec/`

#### 场景: 测试中的路径断言

WHEN 运行测试套件
THEN 所有路径相关断言使用 `marchen/` 目录名
AND 测试全部通过
