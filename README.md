# Skills

技能（Agent Skills）是一种轻量级、开放的开发格式，用于通过专业知识和工作流程扩展 Agent 的能力。

其核心是一个包含`SKILL.md`文件的文件夹。`SKILL.md`文件包含了元数据（至少包括`name`和`description`）以及指示 Agent 如何执行特定任务的说明。技能还可以捆绑脚本、模板和参考资料。

本项目整理了我在日常开发中收集、创建和使用的技能，实用性和可靠性上都经过了验证。

## Skill 的工作机制

技能使用**渐进式加载**来高效利用上下文：

1. **发现**：启动时，Agent 仅加载每个可用技能的元数据（`name`和`description`），简单了解技能和触发条件。
2. **激活**：当任务与技能描述匹配时，Agent 会将完整的`SKILL.md`读入上下文。
3. **执行**：Agent 遵循`SKILL.md`中的说明，根据需要加载引用的文件或执行代码。

这种按需加载更多上下文的方式能够使 Agent 始终保持高效运行，并且保证更高的准确性和可靠性。

## 安装技能

本项目下的所有技能原生支持在 [Claude Code](https://github.com/anthropics/claude-code) 中使用，直接安装：

```bash
git clone https://github.com/Airmomo/skills.git && cp -r skills/* ~/.claude/skills/ && rm -rf skills
```

## 技能列表

| 技能                                                              | 简述                                                           |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| [agent-development](./agent-development/SKILL.md)                 | Claude Code Agent 开发辅助                                     |
| [command-development](./command-development/SKILL.md)             | Claude Code Command 开发辅助                                   |
| [skill-development](./skill-development/SKILL.md)                 | Claude Code Skill 开发辅助                                     |
| [hook-development](./hook-development/SKILL.md)                   | Claude Code Hook 开发指南                                      |
| [mcp-integration](./mcp-integration/SKILL.md)                     | Claude Code MCP 服务器集成                                     |
| [plugin-settings](./plugin-settings/SKILL.md)                     | Claude Code 插件设置模式辅助                                   |
| [plugin-structure](./plugin-structure/SKILL.md)                   | Claude Code 插件结构和组织辅助                                 |
| [openclaw-agent-creator](./openclaw-agent-creator/SKILL.md)       | OpenClaw Agent 创建和配置辅助                                  |
| [openclaw-cmd](./openclaw-cmd/SKILL.md)                           | OpenClaw CLI 命令行辅助                                        |
| [dev-roadmap-generator](./dev-roadmap-generator/SKILL.md)         | 基于参考项目或需求生成完整的开发文档与实施计划                 |
| [tdad-integration](./tdad-integration/SKILL.md)                   | 测试驱动代理开发（TDAD），子代理隔离执行 Red-Green-Refactor 循环 |
| [quick-guide-builder](./quick-guide-builder/SKILL.md)             | 基于 MCP 文档工具和源码交叉验证的指南文档构建                  |
| [docling-document-intelligence](./docling-document-intelligence/SKILL.md) | 基于 Docling 解析、转换、分块和分析文档（PDF/DOCX/PPTX/HTML/图片） |
| [html-doc](./html-doc/SKILL.md)                                   | 生成自包含的富 HTML 文档（报告、幻灯片、看板等）               |
| [wails3-dev](./wails3-dev/SKILL.md)                               | 基于 Wails v3 的跨平台桌面应用开发（Go 后端 + Web 前端）       |

## 如何创建一个优秀的 Skill

我总结了一个笔记[《Agent Skill 开发指南》](docs/skill-development.md)帮你快速了解如何创建一个标准且优秀的 Skill。
