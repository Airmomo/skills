---
name: tdad-integration
description: 此技能应在用户要求"TDAD"、"测试驱动代理开发"、"Test-Driven Agentic Development"、"自动编写测试"、"Red-Green-Refactor"、"测试先行"、"goal 目标驱动开发"、"让 AI 自主完成"、"无人工干预开发"、"代理隔离 TDD"时使用。提供 TDAD（Test-Driven Agentic Development，测试驱动代理开发）全闭环协调能力，通过子代理隔离执行 RED-GREEN-REFACTOR 循环。
---

# TDAD: 测试驱动代理开发

## 核心理念

TDAD（Test-Driven Agentic Development）通过子代理隔离实现 Red-Green-Refactor 闭环。开发者定义意图和验收标准，三个专用子代理在隔离上下文中自主完成编码全流程：

1. **RED** — 编写失败测试（`tdad-test-writer` 代理）
2. **GREEN** — 最小实现让测试通过（`tdad-implementer` 代理）
3. **REFACTOR** — 优化结构保持测试通过（`tdad-refactorer` 代理）

关键发现来自 TDAD 论文（`references/paper-summary.md`）：**上下文（检查哪些测试）优于流程（如何编排经典 TDD 步骤）**。简短精准的测试指引比冗长的流程指令效果更好——论文中简化 SKILL 从 107 行到 20 行，分辨率从 12% 提升到 50%。

## 触发与使用模式

### 模式一：目标驱动（/goal 风格）

当用户提供目标描述时，启动完整 TDAD 循环：

```
用户: "实现一个配置文件差异对比功能，支持新增、修改、删除三种状态"
→ 启动 tdad-test-writer → tdad-implementer → tdad-refactorer 全流程
```

### 模式二：单阶段触发

当用户只需某一阶段时，单独启动对应代理：

```
用户: "为这个函数写测试" → 启动 tdad-test-writer
用户: "让这些测试通过" → 启动 tdad-implementer
用户: "重构这段代码" → 启动 tdad-refactorer
```

### 模式三：验证修复

当代码已有测试但出现回归时：

```
用户: "这个改动破坏了测试，帮我修复"
→ 读取失败测试 → 启动 tdad-implementer 修复
```

## 测试框架检测

启动 TDAD 前先识别项目的测试基础设施：

| 语言 | 检测命令 | 测试文件模式 | 运行命令 |
|------|----------|-------------|----------|
| Go | `ls *_test.go` / `go test` | `*_test.go` | `go test ./...` |
| Python | `grep pytest pyproject.toml` / `ls test_*.py` | `test_*.py`, `*_test.py` | `pytest` |
| TypeScript/JS | `cat package.json \| grep jest` | `*.test.ts`, `*.spec.ts` | `npm test` |
| Rust | `ls tests/` / `cargo test` | `#[test]` in `src/` 或 `tests/` | `cargo test` |

检测流程：
1. 查找项目根目录的包管理文件（`go.mod`, `pyproject.toml`, `package.json`, `Cargo.toml`）
2. 搜索现有测试文件，确认测试框架和命名约定
3. 如果项目无任何测试基础设施，先建立最小测试配置再启动 TDAD

## 工作流执行

### 完整循环流程

收到目标描述后，按以下步骤执行：

**步骤 1：需求分析**
- 解析用户目标，识别核心功能需求
- 确定涉及的源文件和模块边界
- 识别编程语言、测试框架、运行命令

**步骤 2：RED 阶段**
- 启动 `tdad-test-writer` 代理
- 传入：需求描述、目标文件路径、现有接口信息、测试框架名称、测试运行命令
- 代理在隔离上下文中编写测试
- 等待代理返回测试文件和预期失败说明
- 运行测试确认全部失败（RED 状态确认）

**步骤 3：GREEN 阶段**
- 启动 `tdad-implementer` 代理
- 传入：测试文件路径、测试失败输出
- 代理在隔离上下文中编写最小实现
- 等待代理返回实现代码
- 运行测试确认全部通过（GREEN 状态确认）
- 如果测试未全部通过，将失败输出回传代理重试（最多 3 次）

**步骤 4：REFACTOR 阶段**
- 启动 `tdad-refactorer` 代理
- 传入：实现文件路径、通过的测试确认
- 代理在隔离上下文中优化代码结构
- 等待代理返回重构后的代码
- 运行测试确认全部通过
- 如果测试失败，回滚变更并重试（最多 2 次）

**步骤 5：结果汇总**
- 报告最终状态：测试通过率、代码变更摘要
- 列出测试覆盖率（如果工具链支持）
- 提示用户审查最终代码

### 子代理启动方式

使用 Agent 工具按以下模式启动子代理：

```json
{
  "subagent_type": "general-purpose",
  "description": "TDAD RED phase: write failing tests",
  "prompt": "启动 tdad-test-writer 代理。\n\n任务：[具体需求]\n目标文件：[文件路径]\n测试框架：[框架名称]\n运行命令：[test command]"
}
```

三个代理的协调遵循**流水线模式**——每个阶段必须在前一阶段完成后启动，阶段间通过文件系统传递中间结果。

### 失败处理

| 阶段 | 失败场景 | 处理策略 |
|------|----------|----------|
| RED | 测试文件语法错误 | 回传错误让代理修复，最多 3 次 |
| RED | 代理无法识别目标接口 | 报告给用户，请求补充接口信息 |
| GREEN | 实现后测试仍未通过 | 回传失败输出让代理重试，最多 3 次 |
| GREEN | 3 次重试后仍失败 | 报告给用户，建议简化需求或拆分任务 |
| REFACTOR | 重构导致测试失败 | 回滚变更，保留 GREEN 阶段代码 |
| REFACTOR | 2 次重试后仍失败 | 保留未重构的 GREEN 代码，报告给用户 |

## 语言适配要点

### Go
- 测试文件与源文件同目录（`foo.go` + `foo_test.go`）
- 表驱动测试是惯用模式：`[]struct{ name string; input; expected }`
- 使用 `t.Run`, `t.Parallel` 组织子测试
- 运行：`go test -v -count=1 ./path/to/package`

### Python
- 测试文件放在 `tests/` 目录或与源文件同目录
- pytest 是首选框架：fixture, parametrize, marks
- 使用 `assert` 语句而非 `self.assertEqual`
- 运行：`pytest -xvs path/to/test_file.py`

### TypeScript/JavaScript
- 测试文件通常在 `__tests__/` 或与源文件同目录
- Jest/Vitest 是主流：`describe`, `it`, `expect`
- Mock 外部依赖：`jest.mock()`, `vi.mock()`
- 运行：`npx jest --noCache` 或 `npx vitest run`

## 故障排查

| 症状 | 可能原因 | 解决方案 |
|------|----------|----------|
| 代理生成的测试语法错误 | 代理不了解项目测试框架 | 在 prompt 中明确指定框架和版本 |
| GREEN 阶段反复失败 | 需求过于复杂或模糊 | 拆分为多个子任务，逐个执行 TDAD |
| REFACTOR 总是回滚 | 测试与实现耦合过紧 | 跳过 REFACTOR，接受 GREEN 阶段代码 |
| 代理生成了多余功能 | prompt 包含了实现暗示 | 精简 prompt，只描述行为不描述实现 |
| 测试框架无法识别 | 项目无测试基础设施 | 先建立最小测试配置（如 `go.mod` + `go test`） |

## 子代理概述

三个代理各有严格的职责边界和约束（详见 `agents/` 目录）：

| 代理 | 阶段 | 职责 | 禁止行为 | 颜色 |
|------|------|------|----------|------|
| `tdad-test-writer` | RED | 编写失败测试 | 修改实现文件 | red |
| `tdad-implementer` | GREEN | 最小实现通过测试 | 修改测试文件 | green |
| `tdad-refactorer` | REFACTOR | 优化代码结构 | 添加新功能/修改测试 | magenta |

## 核心原则

1. **子代理隔离**：每个阶段在独立上下文中执行，避免测试编写思路渗透到实现阶段
2. **最小实现**：GREEN 阶段只写让测试通过的最小代码，不提前优化
3. **测试即规格**：测试用例是可执行的契约，精确定义「什么是正确的」
4. **简短指引**：给代理的指令保持简短精准，避免冗长流程描述占用上下文窗口

## 适用场景判断

| 场景 | 是否适用 TDAD | 替代方案 |
|------|--------------|----------|
| 纯函数/工具函数开发 | 适用 | — |
| API 端点实现 | 适用 | — |
| 配置解析/数据转换 | 适用 | — |
| Bug 修复（可精确定义） | 适用 | — |
| 重构已有代码 | 适用（仅 REFACTOR 阶段） | 直接重构 |
| 探索性原型 | 不适用 | Vibe Coding |
| UI 样式调整 | 不适用 | 直接编辑 |
| 跨多模块架构设计 | 不适用 | 先规划再分模块 TDAD |

## 附加资源

### 参考文件

- **`references/paper-summary.md`** — TDAD 论文核心发现：70% 回归降低、TDD 提示悖论（论文实验中的消融对照概念）、自动改进循环
- **`references/workflow-patterns.md`** — 详细工作流模式：回退修复、混合模式、渐进式采用路线图、Hooks 自动化、与 Vibe Coding 的关系
- **`references/test-impact-analysis.md`** — 基于图的测试影响分析：依赖图构建、影响分数计算、测试映射策略

### 示例文件

- **`examples/goal-prompt-examples.md`** — 各语言的目标驱动开发示例（Go、Python、TypeScript）

### 代理文件

- **`agents/tdad-test-writer.md`** — RED 阶段代理定义
- **`agents/tdad-implementer.md`** — GREEN 阶段代理定义
- **`agents/tdad-refactorer.md`** — REFACTOR 阶段代理定义
