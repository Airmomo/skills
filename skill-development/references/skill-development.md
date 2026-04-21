# Skill 开发指南

本指南旨在帮助你快速了解如何创建一个标准、优秀的 Skill。涵盖 Skill 的核心概念、文件结构规范、SKILL.md 编写最佳实践、渐进式加载原则以及常见问题的优化方案。

## 什么是 Skill

Skill 是模块化、自包含的功能包，通过提供专业知识、工作流程和工具来扩展 Agent的能力。可以将 Skill 视为特定领域或任务的"操作指南"——它们能将通用 Agent 转变为具备特定流程知识的专业 Agent。

## 一个成熟的 Skill 应具备什么能力

1. **专业化工作流程**：针对特定领域或具体事务的多步骤流程
2. **工具集成**：处理特定文件格式或 API 的指令
3. **领域专业知识** - 特定领域的知识、模式、业务逻辑
4. **打包资源** - 用于复杂和重复任务的脚本、参考资料和资产

## Skill 的文件结构

每个 Skill 由一个必需的 SKILL.md 文件和可选的打包资源组成：

```
skill-name/
├── SKILL.md (必需)
│   ├── YAML frontmatter 元数据 (必需)
│   │   ├── name: (必需)
│   │   └── description: (必需)
│   └── Markdown 指令 (必需)
└── 打包资源 (可选)
    ├── assets/           - 静态资源（配置文件、图像等）
    ├── examples/         - 代码、模版等示例文件
    ├── outputs/          - Skill 最终输出的资源
    ├── references/       - 文档等参考资料
    └── scripts/          - 可执行脚本（Python/Bash等）
```

## Skill 的资源目录

**⚠️ 资源文件应该是存在且经过验证的，不要包含损坏或不完整的示例，也不要存在未被引用的资源。**

**assets/**：存放 Skill 需要使用的静态资源文件，这些文件可按需被加载到上下文中。
**examples/**：存放模版文件、完整的代码示例、脚本使用示例等示例文件
**outputs/**：存放 Skill 最终输出的文件，这些文件不会被加载到上下文中。

**references/**：存放文档等参考资料，用于在需要时加载到上下文中，为 Agent 提供指导。

> [!NOTE] references/ 最佳实践
>
> 1. 如果文件很大（>10k 字），应在 SKILL.md 中包含 grep 搜索模式
> 2. **避免重复**：相同的信息应该只存在于 SKILL.md 或 references/ 的文件中，不要两者都有
> 3. 保持 SKILL.md 精简，将详细的参考资料移至 references/

**scripts/**：存放可执行脚本，适用于需要确定性、可靠性或需要重复编写的复杂任务。

> [!NOTE] scripts/ 最佳实践
>
> 1. 脚本文件应该是可执行的，且包含完善的错误处理
> 2. 在 scripts/ 创建 README.md，用于说明脚本文件的使用场景和方法

## SKILL.md

### Frontmatter 基础字段

- **name** (必需) - Skill 名称，**只能包含小写字母、数字和连字符**（`[a-z0-9-]`），推荐与目录名保持一致
- **description** (必需) - Skill 描述

### name 字段编写规范

`name` 字段只能包含小写字母（`a-z`）、数字（`0-9`）和连字符（`-`），不允许大写字母、空格、下划线或其他特殊字符。推荐 `name` 与 Skill 目录名保持一致。

✅ **正确示例：**

```yaml
name: hook-development
name: mcp-integration
```

❌ **错误示例：**

```
name: Hook Development
name: MCP Integration
name: hook_development
```

### description 字段编写规范

`description`必须使用**第三人称**描述并包含**具体的触发短语**，是保证 Skill 正确触发的前提：

✅ **正确示例：**

```yaml
description: 此 Skill 应在用户要求"创建 hook"、"添加 PreToolUse hook"、"验证工具使用"、"实现基于 prompt 的 hook"或提及 hook 事件（PreToolUse、PostToolUse、Stop）时使用。提供全面的 hooks API 指导。
```

❌ **错误示例：**

```yaml
description: 当你想要创建 X 时使用此 Skill...
description: 当用户要求...时加载此 Skill
```

### SKILL.md 主体编写规范

#### 1. 保持 SKILL.md 内容精简

✅ **正确示例（渐进式信息展示，详细内容仅在需要时加载）：**

```markdown
skill-name/
├── SKILL.md (1,800 字 - 核心要素)
└── references/
├── patterns.md (2,500 字)
└── advanced.md (3,700 字)
```

❌ **错误示例（Skill 加载时会使上下文膨胀，详细内容始终被加载）：**

```markdown
skill-name/
└── SKILL.md (8,000 字 - 所有内容在一个文件中)
```

#### 2. 使用祈使句/不定式形式

整个 Skill 应使用**动词优先**的指令，专注于要做什么，而不是谁应该做：

✅ **正确示例（使用祈使句）：**

```markdown
创建 hook 时，定义事件类型。
使用身份验证配置 MCP 服务器。
在使用前验证设置。
```

❌ **错误示例（使用第二人称）：**

```markdown
你应该通过定义事件类型来创建 hook。
你需要配置 MCP 服务器。
你必须在使用前验证设置。
```

#### 3. 显式资源引用

❌ **错误示例（在 SKILL.md 未提及参考资源信息，Agent 不会知道 references/ 存在）：**

```markdown
# SKILL.md

[核心内容]

[末尾没有提及 references/ 或 examples/]
```

✅ **正确示例（在 SKILL.md 末尾添加参考资源信息）：**

```markdown
# SKILL.md

[核心内容]

## 附加资源

### 参考文件

- **`references/patterns.md`** - 详细模式
- **`references/advanced.md`** - 高级技术

### 示例

- **`examples/script.sh`** - 工作示例
```

#### 4. 禁止在 SKILL.md 中使用 `!`` 执行语法

Claude Code 的权限检查器在加载 Skill 时会**静态扫描**所有 `!`` 语法。当命令中包含 `${CLAUDE_PLUGIN_ROOT}` 或 `${CLAUDE_SKILL_DIR}` 等变量展开时，权限检查器无法在静态分析阶段确定展开后的值是否安全，会直接拒绝执行，导致**整个 Skill 加载失败**。

**规则：SKILL.md 中的所有示例代码必须使用普通代码块（` ```bash `）展示，不得使用 `!`` 执行语法。**

✅ **正确示例（普通代码块，纯文本展示，不会被拦截）**

````markdown
Files changed: ```bash
git diff --name-only
````

❌ **错误示例（!` 执行语法，会被权限检查器拦截）**

```markdown
Files changed: !`git diff --name-only`
```

**区别说明：**

- `!`` 语法 = 运行时实际执行命令，会被权限检查器静态拦截
- ` ```bash ` 代码块 = 纯文本展示，不会被拦截

如果 Skill 确实需要在运行时执行 bash 命令，应将 `${CLAUDE_PLUGIN_ROOT}` 等变量替换为硬编码路径，或在 `allowed-tools` 中显式声明允许的命令模式。

### SKILL.md 模板

```markdown
---
name: skill-name
description: "此 Skill 应在用户要求'功能1'、'功能2'或提及'关键词'时使用。提供详细的描述和指导。"
---

# Skill Name

Skill 的核心描述和目的。

## 何时使用

说明何时应该使用此 Skill（主要触发信息应包含在 description 中）。

## 如何使用

详细的使用说明 Agent 应该如何使用此 Skill？所有可重用 Skill 内容或资源都应该被引用，以便 Agent 知道如何使用它们。

## 附加资源

- **`references/advanced.md`** - 高级用法
- **`scripts/helper.sh`** - 辅助脚本
- **`assets/template.json`** - 配置模板
```

## Skill 的渐进式加载原则

Skill 使用三级加载系统来高效管理上下文：

### 1. 元数据

**内容**：SKILL.md 头部的 Frontmatter 字段（name + description）
**大小**：~100 字
**何时加载**：始终在上下文中

### 2. SKILL.md 主体

**内容**：核心描述、目的、指令和工作流程
**大小**：保持在 3,000 字以下，理想为 1,500-2,000 字
**何时加载**：Skill 被触发时

### 3. 资源

**内容**： assets/、examples/、outputs/、references/、scripts/, ...
**大小**：无限制，因为脚本执行无需加载到上下文中
**何时加载**：Agent 按需加载

## 如何优化 Skill

在使用 Skill 后用户可能会要求改进，主要通过更新 Skill 现有的上下文来进行优化。

**迭代工作流程：**

1. 在实际任务中使用 Skill
2. 注意困难或低效之处
3. 确定 SKILL.md 或打包资源应如何更新
4. 实施更改并再次测试

**常见问题及改进方案：**

1. Skill 没有在预期的用户查询上触发，或被错误地触发
   **改进方式：** 加强 description 中的触发短语，使其更具体和准确

2. SKILL.md 内容过长（超过 3,000 字），导致上下文膨胀或加载缓慢
   **改进方式：** 将长段落从 SKILL.md 移至 references/，保持 SKILL.md 精简（目标 1,500-2,000 字）

3. 在使用过程中发现某些重复性操作需要手动编写相同代码，或某些任务缺少必要的工具支持
   **改进方式：** 发现并添加缺失的脚本到 scripts/ 中，确保脚本可执行且有文档说明

4. Agent 在执行任务时对指令理解有偏差，或参数使用不正确，导致结果不符合预期
   **改进方式：** 完善指令及参数说明，增加具体示例和最佳实践

5. 在特殊场景或异常情况下 Skill 表现不佳，或缺少错误处理导致任务失败
   **改进方式：** 添加边缘情况及处理方案，增强 Skill 的健壮性和容错能力

## 参考资料

- [Claude Code Plugin 开发文档](https://github.com/anthropics/claude-code/tree/main/plugins/plugin-dev)
- [Skill Development 官方指南](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/skills/skill-development/SKILL.md)
- [AgentSkills 官方网站](https://agentskills.io)
