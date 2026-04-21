# Agent 开发指南

## 什么是 Agent

**Agent（代理）** 是 Claude Code 中的自主子进程，能够独立处理复杂的多步骤任务。与普通的命令或技能不同，Agent 拥有独立的系统提示词、工具访问权限和执行上下文，可以自主决策并完成端到端的工作流程。

## Agent vs Command vs Skill

| 特性         | Agent            | Command            | Skill                |
| ------------ | ---------------- | ------------------ | -------------------- |
| **触发方式** | 自动/主动触发    | 用户显式调用       | 显式调用或触发词触发 |
| **执行模式** | 自主执行多步骤   | 单次执行           | 按需加载知识上下文   |
| **独立性**   | 完全独立上下文   | 共享主对话上下文   | 增强主对话上下文     |
| **适用场景** | 复杂、多步骤任务 | 提示模版、快捷指令 | 知识密集型任务       |
| **工具访问** | 可限制或完全访问 | 继承主 Agent 权限  | 继承主 Agent 权限    |

## Agent 的核心特征

### 任务专业化

Agent 可以为特定任务类型设计专属的系统提示词，使其在该领域表现更专业：

```markdown
<!-- 代码审查 Agent：专注于代码质量分析 -->

You are an expert code reviewer specializing in:

- Code quality assessment
- Security vulnerability detection
- Performance optimization suggestions

<!-- 测试生成 Agent：专注于测试用例编写 -->

You are a test generation specialist focusing on:

- Unit test creation
- Edge case coverage
- Mock and fixture design
```

### 上下文隔离

Agent 拥有独立的执行上下文，避免主对话历史污染，提高执行效率：

```
主对话上下文（可能很长）
    │
    ├── 包含大量历史消息
    ├── 多个不相关的任务讨论
    └── 可能影响特定任务的判断

Agent 上下文（干净专注）
    │
    ├── 仅包含任务相关的系统提示词
    ├── 专注的执行环境
    └── 更准确的决策和输出
```

### 工具权限控制

通过 `tools` 字段限制 Agent 可访问的工具，实现最小权限原则：

```yaml
# 只读分析 Agent - 仅需要读取和搜索
tools: ["Read", "Grep", "Glob"]

# 代码生成 Agent - 需要读写能力
tools: ["Read", "Write", "Edit", "Grep"]

# 完全访问 Agent - 省略 tools 字段
# tools: 省略表示拥有所有工具权限
```

### 支持任务并行处理

多个 Agent 可以并行执行独立任务，提高整体效率：

```
                    ┌─────────────────┐
                    │   主 Agent      │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ 代码审查     │  │ 测试生成     │  │ 文档编写     │
   │   Agent      │  │   Agent      │  │   Agent      │
   └──────────────┘  └──────────────┘  └──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
      审查报告          测试代码           API 文档
```

### 可复用性

一次创建的 Agent 可以在多个项目中复用，通过 Plugin 机制分发：

```
Plugin 市场
    │
    ├── security-scanner-plugin
    │   └── agents/
    │       ├── vulnerability-scanner.md
    │       └── dependency-auditor.md
    │
    └── test-automation-plugin
        └── agents/
            ├── unit-test-gen.md
            └── integration-test-gen.md
```

## Agent 的文件结构

### 完整格式

在 Claude Code 中 Agent 使用 Markdown 文件定义，包含 YAML frontmatter 和系统提示词：

```markdown
---
name: agent-identifier
description: Use this agent when [触发条件]. Examples:

<example>
Context: [场景描述]
user: "[用户消息]"
assistant: "[助手响应]"
<commentary>
[为什么应该触发此 Agent]
</commentary>
</example>

model: inherit
color: blue
tools: ["Read", "Write", "Grep"]
---

You are [Agent 角色描述]...

**Your Core Responsibilities:**

1. [职责 1]
2. [职责 2]

**Analysis Process:**
[步骤流程]

**Output Format:**
[输出格式]
```

### Frontmatter 基础字段

| 字段属性      | 作用                                                  | 是否必需 |
| ------------- | ----------------------------------------------------- | -------- |
| `name`        | Agent 的唯一标识符，用于调用和命名空间管理            | ✅ 必需  |
| `description` | 定义 Agent 的触发条件，通过此字段判断何时使用该 Agent | ✅ 必需  |
| `model`       | 指定 Agent 使用的模型（inherit/sonnet/opus/haiku）    | ✅ 必需  |
| `color`       | Agent 在 UI 中的视觉标识颜色                          | ✅ 必需  |
| `tools`       | 限制 Agent 可访问的工具集，遵循最小权限原则           | ⭕ 可选  |

#### name（必需）

Agent 的唯一标识符，用于调用和命名空间管理。

**命名规则：**

1. 必须以字母或数字开头和结尾
2. 只能包含小写字母、数字和连字符
3. 长度：3-50 个字符

**示例：**

```yaml
# ✅ 正确
name: code-reviewer
name: test-generator
name: api-docs-writer
name: security-analyzer-v2

# ❌ 错误
name: helper              # 太泛化
name: -agent-             # 以连字符开头/结尾
name: my_agent            # 使用下划线
name: ag                  # 太短（< 3 字符）
```

#### description（必需）

定义 Agent 的触发条件，通过此字段判断何时使用该 Agent。

**必需包含的内容：**

1. 触发条件（"Use this agent when..."）
2. 2-4 个 `<example>` 块展示使用场景
3. 每个示例包含 Context、user、assistant、commentary

**格式模板：**

```yaml
description: Use this agent when [触发条件]. Examples:

<example>
Context: [描述场景背景]
user: "[用户的请求]"
assistant: "[助手如何响应]"
<commentary>
[解释为什么应该触发此 Agent]
</commentary>
</example>

<example>
Context: [另一个场景]
user: "[不同的用户表述]"
assistant: "[相应的响应]"
<commentary>
[解释触发原因]
</commentary>
</example>
```

**最佳实践：**

- 覆盖同一意图的不同表述方式
- 包含主动触发和被动触发场景
- 在 commentary 中清晰解释触发逻辑
- 指明何时**不应该**使用该 Agent

#### model（必需）

指定 Agent 使用的模型。

**可选值：**

| 值        | 说明                        | 适用场景         |
| --------- | --------------------------- | ---------------- |
| `inherit` | 继承父 Agent 的模型（推荐） | 大多数场景       |
| `sonnet`  | Claude Sonnet               | 平衡性能和成本   |
| `opus`    | Claude Opus                 | 最强能力，高成本 |
| `haiku`   | Claude Haiku                | 快速响应，低成本 |

**推荐值：** 除非有特殊需求，否则默认使用 `inherit`。

#### color（必需）

Agent 在 UI 中的视觉标识颜色。

**可选值与含义：**

| 颜色            | 含义       | 适用 Agent 类型    |
| --------------- | ---------- | ------------------ |
| `blue` / `cyan` | 分析、审查 | 代码审查、质量分析 |
| `green`         | 生成、创建 | 代码生成、文档创建 |
| `yellow`        | 验证、警告 | 配置验证、合规检查 |
| `red`           | 关键、安全 | 安全扫描、漏洞检测 |
| `magenta`       | 转换、创意 | 重构、创意生成     |

**推荐值：** 为同一 Plugin/运行环境 中的不同 Agent 配置不同的颜色，便于区分。

#### tools（可选）

限制 Agent 可访问的工具集。

**安全建议：** 遵循最小权限原则，只授予必要的工具。

**可选工具列表：**

| 工具名称          | 类别       | 功能描述                                      |
| ----------------- | ---------- | --------------------------------------------- |
| `Read`            | 文件操作   | 读取文件内容，支持图片、PDF、Jupyter Notebook |
| `Write`           | 文件操作   | 创建或完全覆盖文件                            |
| `Edit`            | 文件操作   | 精确字符串替换编辑文件                        |
| `Glob`            | 文件操作   | 按模式匹配搜索文件路径                        |
| `Grep`            | 文件操作   | 基于正则表达式搜索文件内容                    |
| `Bash`            | 执行操作   | 执行 Shell 命令                               |
| `Agent`           | Agent 操作 | 启动子 Agent（SubAgent）执行任务              |
| `Task`            | 任务管理   | 管理后台任务和异步操作                        |
| `WebFetch`        | 网络操作   | 获取网页内容                                  |
| `WebSearch`       | 网络操作   | 执行网络搜索                                  |
| `NotebookRead`    | Notebook   | 读取 Jupyter Notebook 文件                    |
| `NotebookEdit`    | Notebook   | 编辑 Jupyter Notebook 单元格                  |
| `TodoWrite`       | 任务管理   | 创建和更新任务列表                            |
| `AskUserQuestion` | 交互       | 向用户提问获取输入                            |
| `CronCreate`      | 调度       | 创建定时任务                                  |
| `CronDelete`      | 调度       | 删除定时任务                                  |
| `CronList`        | 调度       | 列出所有定时任务                              |
| `RemoteTrigger`   | 远程触发   | 调用远程触发器 API                            |
| `Skill`           | 技能       | 执行预定义的技能                              |
| `EnterPlanMode`   | 模式切换   | 进入规划模式                                  |
| `ExitPlanMode`    | 模式切换   | 退出规划模式                                  |
| `EnterWorktree`   | Git        | 进入 Git Worktree                             |
| `ExitWorktree`    | Git        | 退出 Git Worktree                             |
| `*`               | 通配符     | 表示所有工具（省略 tools 字段等效）           |

**示例：**

```yaml
# 只读分析
tools: ["Read", "Grep", "Glob"]

# 代码生成
tools: ["Read", "Write", "Edit", "Grep"]

# 测试执行
tools: ["Read", "Bash", "Grep", "Glob"]

# Git 操作
tools: ["Read", "Bash", "Write"]

# 完全访问（省略字段）
# tools: 省略
```

**MCP 工具引用：**

当 Agent 需要使用 MCP（Model Context Protocol）服务器提供的工具时，需要使用特定的命名格式：

**工具命名格式：** `mcp__<server-name>__<tool-name>`

**命名格式解析：**

| 组成部分        | 说明                    | 示例           |
| --------------- | ----------------------- | -------------- |
| `mcp__`         | 固定前缀，标识 MCP 工具 | `mcp__`        |
| `<server-name>` | MCP 服务器名称          | `github`       |
| `__`            | 分隔符                  | `__`           |
| `<tool-name>`   | 工具名称                | `create_issue` |

**示例：**

```yaml
# 引用单个 MCP 工具
tools: ["Read", "mcp__github__create_issue"]

# 引用多个 MCP 工具
tools: [
  "Read",
  "mcp__github__create_issue",
  "mcp__github__search_repositories"
]

# 使用通配符引用某个 MCP 服务器的所有工具
tools: ["Read", "mcp__github__*"]

# 多个不同 MCP 服务器的工具
tools: [
  "Read",
  "mcp__github__create_issue",
  "mcp__slack__send_message",
  "mcp__database__query"
]
```

### Agent 的系统提示词

#### 提示词编写规范

**✅ 正确的写法：**

- 使用第二人称（"You are..."，"You will..."）
- 职责描述具体明确
- 提供完整的事务处理流程，精确到每一个步骤
- 包含质量标准和对应的检测方法
- 处理错误与边界情况
- 定义输出格式
- 控制在 10,000 字符以内

**❌ 错误的写法：**

- 使用第一人称（"I am..."，"I will..."）
- 职责描述模糊泛化
- 缺少具体的执行流程
- 忽略质量标准
- 不处理错误情况
- 输出格式不明确

#### 提示词模版

```markdown
You are [角色定位] specializing in [专业领域]。

**Your Core Responsibilities:**

1. [核心职责 1]
2. [核心职责 2]
3. [核心职责 3]

**Analysis/Execution Process:**

1. [步骤 1]
2. [步骤 2]
3. [步骤 3]
   - [子步骤 a]
   - [子步骤 b]

**Quality Standards:**

- [标准 1]
- [标准 2]
- [标准 3]

**Output Format:**
[定义输出结构和格式要求]

**Edge Cases:**

- [边界情况 1]: [处理方式]
- [边界情况 2]: [处理方式]
```

## 如何创建标准 Agent

### 方法一：AI 辅助生成

先使用结构化提示词让 AI 生成 Agent 配置：

```markdown
Create an agent configuration based on this request: "[描述 Agent 功能]"

Requirements:

1. Extract core intent and responsibilities
2. Design expert persona for the domain
3. Create comprehensive system prompt with:
   - Clear behavioral boundaries
   - Specific methodologies
   - Edge case handling
   - Output format
4. Create identifier (lowercase, hyphens, 3-50 chars)
5. Write description with triggering conditions
6. Include 2-3 <example> blocks showing when to use

Return JSON with:
{
"identifier": "agent-name",
"whenToUse": "Use this agent when... Examples: <example>...</example>",
"systemPrompt": "You are..."
}
```

然后将 JSON 转换为 Markdown 格式：

```markdown
---
name: [identifier]
description: [whenToUse 内容]
model: inherit
color: [选择颜色]
tools: ["Tool1", "Tool2"]
---

[systemPrompt 内容]
```

### 方法二：手动创建

**步骤 1：设计 Agent 的标识符**

```yaml
name: api-endpoint-generator
```

**步骤 2：编写触发描述，包含场景示例**

```yaml
description: Use this agent when the user asks to create API endpoints, generate REST APIs, build API routes, or needs API scaffolding. Examples:

<example>
Context: User is building a new feature
user: "Create a REST API for user management"
assistant: "I'll use the api-endpoint-generator agent to scaffold the API."
<commentary>
User needs API endpoint generation, trigger the specialized agent.
</commentary>
</example>

<example>
Context: User describes API requirements
user: "I need CRUD endpoints for my Product model"
assistant: "I'll use the api-endpoint-generator agent to create the CRUD API."
<commentary>
CRUD API request matches this agent's capabilities.
</commentary>
</example>
```

**步骤 3：配置 Agent 的模型、颜色并限制工具范围**

```yaml
model: inherit
color: green
tools: ["Read", "Write", "Grep", "Glob"]
```

**步骤 4：编写系统提示词**

```markdown
You are an expert API developer specializing in RESTful API design and implementation.

**Your Core Responsibilities:**

1. Design clean, consistent API endpoints following REST principles
2. Generate production-ready code with proper error handling
3. Ensure security best practices (input validation, authentication)
4. Create comprehensive API documentation

**Development Process:**

1. Analyze requirements and identify resources
2. Design endpoint structure (routes, methods, parameters)
3. Implement request/response handling
4. Add validation and error handling
5. Generate API documentation

**Quality Standards:**

- Follow REST naming conventions
- Include proper HTTP status codes
- Validate all inputs
- Handle edge cases gracefully
- Document all endpoints

**Output Format:**
For each API endpoint, provide:

- Route definition
- Request/response schemas
- Error handling logic
- Usage examples

**Edge Cases:**

- Invalid input: Return 400 with specific error messages
- Not found: Return 404 with resource identifier
- Unauthorized: Return 401 with authentication guidance
- Rate limiting: Return 429 with retry guidance
```

**步骤 5：保存文件**

```
~/.claude/agents/api-endpoint-generator.md
```

## Agent 目录组织

```
.claude/
└── agents/
    ├── code-reviewer.md        # 代码审查
    ├── test-generator.md       # 测试生成
    ├── api-endpoint-gen.md     # API 生成
    └── security/               # 子目录分类
        ├── vulnerability-scanner.md
        └── dependency-auditor.md
```

**自动发现：** `agents/` 目录下的所有 `.md` 文件会被自动加载。

**命名空间：**

- 单文件：`agent-name`
- 子目录：`subdir:agent-name`

## 如何调用 Agent

### 方法一：自动触发

当用户的请求匹配 Agent 的 `description` 中的触发条件时会自动调用 Agent：

```
用户: "帮我审查这段代码的安全性"

AI: [分析请求] → 匹配 security-scanner Agent 的触发条件
      → 使用 Agent 工具启动 security-scanner Agent
      → Agent 独立执行安全分析
      → 返回分析结果
```

### 方法二：主动触发（显式调用）

通过 Agent 工具直接调用：

```markdown
<!-- 在命令或对话中 -->

Use the code-reviewer agent to analyze the authentication module.

<!-- 或使用 Agent 工具 -->

{
"subagent_type": "general-purpose",
"description": "Review authentication code",
"prompt": "Launch the code-reviewer agent to analyze src/auth/"
}
```

#### 后台（异步）执行 Agent

使用 `run_in_background` 参数后台（异步）执行，适用于需要长时间运行的、不需要立即得到结果的任务：

```json
{
  "subagent_type": "general-purpose",
  "description": "Long-running analysis",
  "prompt": "Perform comprehensive codebase analysis...",
  "run_in_background": true
}
```

#### 隔离（沙盒）执行 Agent

使用 `isolation: "worktree"` 在隔离环境（沙盒）中执行，为 Agent 创建完全隔离的执行环境，适用于需要独立操作的、实验性操作的或临时的任务：

```json
{
  "subagent_type": "general-purpose",
  "description": "Safe experimentation",
  "prompt": "Experiment with refactoring...",
  "isolation": "worktree"
}
```

### 方法三：使用命令触发

创建一个用于快速调用 Agent 的命令，在命令中触发 Agent：

```markdown
---
name: review
description: Review code quality using the code-reviewer agent
argument-hint: [file-or-directory]
---

Use the code-reviewer agent to perform a comprehensive review of @$1.

The agent will analyze:

- Code quality and maintainability
- Security vulnerabilities
- Performance issues
- Best practices adherence
```

## 如何监控 Agent 执行

Agent 执行时会显示在 UI 中，能够看到以下内容：

- Agent 的名称和颜色标识
- 当前执行状态
- 进度指示器
- 完成任务后显示结果摘要

## SubAgent 子代理

### 什么是 SubAgent

**SubAgent** 是由主 Agent 或其他 Agent 通过 `Agent` 工具创建的子代理。

### 启动 SubAgent

在命令或对话中可使用 Agent 工具启动 SubAgent ，示例如下：

```json
{
  "subagent_type": "general-purpose",
  "description": "Analyze code patterns",
  "prompt": "You are analyzing code to find design patterns.\n\nRead files in src/ and identify:\n1. Design patterns used\n2. Architectural patterns\n3. Code organization patterns\n\nReturn a structured report with:\n- Pattern name\n- Location (file:line)\n- Usage context"
}
```

### SubAgent 类型

| 类型              | 用途           | 特点                   |
| ----------------- | -------------- | ---------------------- |
| `general-purpose` | 通用任务       | 完整的工具访问权限     |
| `Explore`         | 检索代码库     | 快速搜索，只读不写     |
| `Plan`            | 任务拆解与规划 | 专注规划设计，不写代码 |

### 利用 SubAgent 构建多样化的协作模式

#### 模式一：流水线模式

```
主 Agent
    │
    ├── Step 1: 启动 requirements-analyzer Agent
    │           ↓ 返回需求分析报告
    │
    ├── Step 2: 启动 architecture-designer Agent
    │           ↓ 返回架构设计
    │
    ├── Step 3: 启动 code-generator Agent
    │           ↓ 返回生成的代码
    │
    └── Step 4: 启动 test-generator Agent
                ↓ 返回测试代码
```

#### 模式二：并行模式

```
                    主 Agent
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   ┌─────────┐    ┌─────────┐    ┌─────────┐
   │ Agent A │    │ Agent B │    │ Agent C │
   │ 安全扫描 │    │ 性能分析 │    │ 代码审查 │
   └────┬────┘    └────┬────┘    └────┬────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
                        ▼
                   汇总报告
```

**实现示例：**

````markdown
You are a code review coordinator.

When analyzing code, launch three specialized agents in parallel:

1. Security Agent:

```json
{
  "subagent_type": "general-purpose",
  "description": "Security analysis",
  "prompt": "Analyze code for security vulnerabilities...",
  "run_in_background": true
}
```

2. Performance Agent:

```json
{
  "subagent_type": "general-purpose",
  "description": "Performance analysis",
  "prompt": "Analyze code for performance issues...",
  "run_in_background": true
}
```

3. Quality Agent:

```json
{
  "subagent_type": "general-purpose",
  "description": "Quality analysis",
  "prompt": "Analyze code for quality issues...",
  "run_in_background": true
}
```

Wait for all agents to complete, then synthesize results.
````

#### 模式三：协调者模式

```

              ┌─────────────────┐
              │  Coordinator    │
              │     Agent       │
              └────────┬────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │ Worker  │   │ Worker  │   │ Worker  │
    │ Agent 1 │   │ Agent 2 │   │ Agent 3 │
    └─────────┘   └─────────┘   └─────────┘
         │             │             │
         └─────────────┼─────────────┘
                       │
                       ▼
              协调者汇总结果

```

## Agent 间的通信方式

### 方式一：通过 Agent 工具返回结果

当 SubAgent 执行完成后，得到的结果会自动返回给调用者：

```json
// 主 Agent 收到 SubAgent 的返回结果
{
  "task_id": "agent-123",
  "status": "completed",
  "result": "Analysis complete. Found 5 issues..."
}
```

> **注意：** 这里的 "task_id" 是 Agent 执行任务的唯一标识，用于追踪异步任务状态。`Task` 是一个独立的任务管理工具（见工具列表），但 Agent 间通信主要依赖 `Agent` 工具的内置机制，而非 `Task` 工具。

### 方式二：通过文件系统

Agent 间可以通过读写文件进行通信：

```markdown
<!-- Agent A 写入中间结果 -->

Write analysis-temp.json with intermediate findings.

<!-- Agent B 读取并继续处理 -->

Read analysis-temp.json and generate final report.
```

### 方式三：通过环境变量

通过 Bash 工具设置和读取环境变量获取 Agent 的运行状态：

```bash
# Agent A 设置
export ANALYSIS_STATUS="in_progress"

# Agent B 读取
echo $ANALYSIS_STATUS
```

## 高级用法示例

### 自主代码审查系统

````markdown
---
name: autonomous-code-reviewer
description: Use this agent when comprehensive autonomous code review is needed. Examples:

<example>
Context: Pre-commit review needed
user: "Review all changes before commit"
assistant: "I'll launch the autonomous-code-reviewer for comprehensive review."
<commentary>
Full autonomous review requested, trigger this agent.
</commentary>
</example>

model: sonnet
color: cyan
tools: ["Read", "Grep", "Glob", "Agent"]
---

You are an autonomous code review orchestrator.

**Your Core Responsibilities:**

1. Coordinate multiple specialized review agents
2. Aggregate findings from parallel analyses
3. Prioritize issues by severity
4. Generate actionable recommendations

**Review Process:**

1. **Discovery Phase:**
   - Identify all changed files
   - Categorize by type (frontend, backend, config, etc.)

2. **Parallel Analysis:**

Launch specialized agents in parallel:

a) Security Scanner:

```json
{
  "subagent_type": "general-purpose",
  "description": "Security scan",
  "prompt": "Scan for: SQL injection, XSS, CSRF, auth issues...",
  "run_in_background": true
}
```

b) Performance Analyzer:

```json
{
  "subagent_type": "general-purpose",
  "description": "Performance analysis",
  "prompt": "Check for: N+1 queries, memory leaks, slow algorithms...",
  "run_in_background": true
}
```

c) Style Checker:

```json
{
  "subagent_type": "general-purpose",
  "description": "Style check",
  "prompt": "Verify: Naming conventions, formatting, documentation...",
  "run_in_background": true
}
```

3. **Aggregation Phase:**
   - Collect results from all agents
   - Deduplicate findings
   - Categorize by severity (Critical, Major, Minor)

4. **Report Generation:**
   - Executive summary
   - Detailed findings with locations
   - Specific fix recommendations
   - Priority order for addressing issues

**Output Format:**

## Code Review Report

### Summary

- Files reviewed: X
- Critical issues: Y
- Major issues: Z
- Minor issues: W

### Critical Issues

1. [File:Line] Description - Fix: [Recommendation]

### Recommendations

[Priority-ordered action items]
````

## Agent 验证清单

创建 Agent 后，使用此清单验证：

```
□ 标识符规范
  □ 3-50 字符
  □ 小写字母、数字、连字符
  □ 以字母/数字开头和结尾

□ 描述完整
  □ 包含 "Use this agent when..." 语句
  □ 至少 2 个 <example> 块
  □ 每个示例有 Context, user, assistant, commentary
  □ 覆盖不同的触发表述

□ 配置正确
  □ model 有效 (inherit/sonnet/opus/haiku)
  □ color 有效 (blue/cyan/green/yellow/magenta/red)
  □ tools 列表合理（遵循最小权限）

□ 系统提示词质量
  □ 使用第二人称
  □ 职责明确
  □ 流程清晰
  □ 输出格式定义
  □ 包含边界情况处理
  □ 长度适当 (10,000 字符以内)

□ 文件组织
  □ 保存在 agents/ 目录
  □ 文件名与 name 一致
  □ Markdown 格式正确
```

## 常见问题及解决方案

### 9.1 Agent 未触发

**问题：** 用户发送了应该触发 Agent 的消息，但 Agent 没有启动。

**可能原因与解决方案：**

| 原因                         | 解决方案                          |
| ---------------------------- | --------------------------------- |
| description 触发条件不够具体 | 添加更多 `<example>` 覆盖不同表述 |
| 示例与实际请求不匹配         | 扩展示例覆盖更多场景              |
| 文件位置不正确               | 确保在 `agents/` 目录下           |
| Frontmatter 格式错误         | 检查 YAML 语法                    |

### 9.2 Agent 执行失败

**问题：** Agent 启动后执行失败。

**可能原因与解决方案：**

| 原因                | 解决方案                        |
| ------------------- | ------------------------------- |
| 工具权限不足        | 检查 `tools` 字段，添加必要工具 |
| 系统提示词不清晰    | 优化提示词，提供更明确的指导    |
| 任务超出 Agent 能力 | 重新设计 Agent 或分解任务       |
| 资源访问问题        | 检查文件路径和权限              |

### 9.3 SubAgent 通信问题

**问题：** 主 Agent 无法获取 SubAgent 返回的结果。

**可能原因与解决方案：**

| 原因           | 解决方案                    |
| -------------- | --------------------------- |
| 后台任务未完成 | 使用 `block: true` 等待完成 |
| 结果解析错误   | 检查 SubAgent 的输出格式    |
| 超时           | 增加 `timeout` 参数         |

### 9.4 性能问题

**问题：** Agent 执行缓慢。

**解决方案：**

1. 限制工具访问范围
2. 使用更轻量的模型（`haiku`）
3. 分解复杂任务
4. 使用后台执行并行处理

---

## 参考资料

- [Claude Code Agent Development Skill](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/skills/agent-development/SKILL.md)
- [Agent Creator Agent](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/agents/agent-creator.md)
- [Plugin Validator Agent](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/agents/plugin-validator.md)
- [Skill Reviewer Agent](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/agents/skill-reviewer.md)
- [Claude Code Repository](https://github.com/anthropics/claude-code)
