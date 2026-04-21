# Claude Code 斜杠命令开发指南

这份指南详细介绍了 Claude Code 斜杠命令的开发规范和最佳实践。通过本指南，你将学习如何创建自定义命令来提升开发效率。内容涵盖命令的文件格式、参数处理、工具限制、文件引用、Bash 命令集成等核心开发要点。

## 命令标准规范

### 1. 文件格式

命令文件是标准的 Markdown 文件（`.md`），头部包含 YAML 格式的 `frontmatter`：

```markdown
---
description: 简短描述
argument-hint: [参数1] [参数2]
allowed-tools: Read, Bash(git:*)
model: sonnet
---

命令内容...
```

### 2. Frontmatter 标准字段

| 字段                       | 用途                          | 类型         | 必需 |
| -------------------------- | ----------------------------- | ------------ | ---- |
| `description`              | 在 `/help` 中显示的描述       | String       | 必选 |
| `argument-hint`            | 参数提示（可用于自动补全）    | String       | 可选 |
| `allowed-tools`            | 限制可用的工具                | String/Array | 可选 |
| `model`                    | 指定模型（sonnet/opus/haiku） | String       | 可选 |
| `disable-model-invocation` | 仅允许手动调用                | Boolean      | 可选 |

### 3. 动态参数

- `$ARGUMENTS` - 所有参数作为一个字符串
- `$1`, `$2`, `$3` - 位置参数

```markdown
Review pull request #$1 with priority $2
```

### 4. 文件引用

可使用 `@` 语法引用文件，示例：

```markdown
Review @src/api/users.ts for security issues
```

### 5. Bash 执行

可使用 `` !` `` 语法执行 bash 命令，示例：

```markdown
Current status: !`git status`
Recent commits: !`git log --oneline -5`
```

## 命令存放位置

### 项目命令

```
your-project/
└── .claude/
    └── commands/
        ├── review.md
        └── deploy.md
```

### 个人命令（全局可用）

```
~/.claude/
└── commands/
    ├── my-command.md
    └── another-command.md
```

### 插件命令（打包分发）

```
plugin-name/
├── commands/
│   ├── feature1.md
│   └── feature2.md
└── plugin.json
```

## 命令示例

### 简单命令

```markdown
---
description: Review code for security issues
---

Review this code for security vulnerabilities including:

- SQL injection
- XSS attacks
- Authentication bypass
```

### 带参数的命令

```markdown
---
description: Review PR with priority
argument-hint: [pr-number] [priority]
allowed-tools: Bash(gh:*), Read
---

Review pull request #$1 with priority level $2.
Fetch PR: !`gh pr view $1`
Analyze changes and provide feedback.
```

### 使用文件引用

```markdown
---
description: Document file
argument-hint: [file-path]
---

Generate documentation for @$1 including:

- Function/class descriptions
- Parameter documentation
- Return value descriptions
- Usage examples
```

### Bash 上下文注入

```markdown
---
description: Show Git status
allowed-tools: Bash(git:*)
---

Current status: !`git status`
Recent commits: !`git log --oneline -5`

Analyze the repository state and provide recommendations.
```

## 🔧 高级特性

### 插件特定功能

插件命令可以使用 `${CLAUDE_PLUGIN_ROOT}` 环境变量：

```markdown
---
description: Analyze using plugin script
allowed-tools: Bash(node:*)
---

Run analysis: !`node ${CLAUDE_PLUGIN_ROOT}/scripts/analyze.js $1`
Review results and report findings.
```

### 参数验证

```markdown
---
description: Deploy with validation
argument-hint: [environment]
---

Validate environment: !`echo "$1" | grep -E "^(dev|staging|prod)$" || echo "INVALID"`

If $1 is valid environment:
Deploy to $1
Otherwise:
Explain valid environments: dev, staging, prod
Show usage: /deploy [environment]
```

### 与其他组件集成

```markdown
---
description: Comprehensive review workflow
argument-hint: [file]
allowed-tools: Bash(node:*), Read
---

Target: @$1

Phase 1 - Static Analysis:
!`node ${CLAUDE_PLUGIN_ROOT}/scripts/lint.js $1`

Phase 2 - Deep Review:
Launch code-reviewer agent for detailed analysis.

Phase 3 - Standards Check:
Use coding-standards skill for validation.
```

## 最佳实践总结

1. **单一职责**：确保一个命令只做一件事
2. **清晰描述**：编写 `description` 让命令在 `/help` 中一目了然
3. **文档参数**：始终使用 `argument-hint`
4. **最小权限**：使用最严格的 `allowed-tools`，限制命令能使用的工具
5. **充分测试**：验证所有功能是否正常工作，持续优化
6. **添加注释**：解释复杂逻辑
7. **错误处理**：优雅地处理缺失的参数/文件

## 🔗 参考资料

### 官方文档

- [Claude Code GitHub Repository](https://github.com/anthropics/claude-code)
- [Command Development README](https://github.com/anthropics/claude-code/blob/master/plugins/plugin-dev/skills/command-development/README.md)
- [Command Development SKILL.md](https://github.com/anthropics/claude-code/blob/master/plugins/plugin-dev/skills/command-development/SKILL.md)
- [Plugin Architecture Documentation](https://github.com/anthropics/claude-code/tree/master/plugins/plugin-dev)

### 参考文档

- [Frontmatter Reference](https://github.com/anthropics/claude-code/blob/master/plugins/plugin-dev/skills/command-development/references/frontmatter-reference.md)
- [Plugin Features Reference](https://github.com/anthropics/claude-code/blob/master/plugins/plugin-dev/skills/command-development/references/plugin-features-reference.md)
- [Simple Commands Examples](https://github.com/anthropics/claude-code/blob/master/plugins/plugin-dev/skills/command-development/examples/simple-commands.md)
- [Plugin Commands Examples](https://github.com/anthropics/claude-code/blob/master/plugins/plugin-dev/skills/command-development/examples/plugin-commands.md)
