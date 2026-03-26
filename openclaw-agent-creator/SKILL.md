---
name: openclaw-agent-creator
description: 此 Skill 应在用户要求"创建 OpenClaw Agent"、"添加新 Agent"、"配置 Agent 工作空间"、"初始化 Agent"、"设置 Agent 人格"、"配置 Agent 工具"、"绑定 Agent 消息平台"或提及"OpenClaw Agent 创建"、"AGENTS.md"、"SOUL.md"时使用。提供 OpenClaw Agent 的标准创建和配置指南。
---

# OpenClaw Agent Creator

## 关于 OpenClaw Agent

OpenClaw Agent 是运行在 OpenClaw 系统中的智能代理，是一个完全独立的大脑，每个 Agent 都有自己的工作空间、状态目录和会话存储。

## OpenClaw Agent 的工作空间（初始化阶段）

| 文件         | 用途                       |
| ------------ | -------------------------- |
| AGENTS.md    | 操作指令和记忆管理规则     |
| SOUL.md      | 人格、边界、语气           |
| TOOLS.md     | 工具使用笔记               |
| IDENTITY.md  | Agent 名称和风格           |
| USER.md      | 用户资料                   |
| HEARTBEAT.md | 心跳检查清单               |
| BOOTSTRAP.md | 首次运行引导（完成后删除） |

## 创建 OpenClaw Agent 的完整流程

### 步骤1. 收集 Agent 的基础信息，初始化 Agent 的工作空间

1. **在创建新的 Agent 前，需要提供以下表格向用户收集 Agent 的基础信息**

| 参数          | 作用                      | 是否必填 | 默认值                           |
| ------------- | ------------------------- | -------- | -------------------------------- |
| `<agent-id>`  | 设置 Agent 的工作空间名称 | 是       | /                                |
| `<workspace>` | 设置 Agent 的工作空间目录 | 否       | ~/.openclaw/workspace-{agent-id} |
| `<model>`     | 设置 Agent 使用的模型     | 否       | /                                |
| `<bind>`      | 绑定 Agent 的消息平台     | 否       | /                                |

2. **使用非交互式命令初始化 Agent**

非交互式命令：

```bash
openclaw agents add <agent-id> \
  --workspace <workspace> \
  --model {model} \
  --bind {bind} \
  --non-interactive \
  --json
```

完整命令示例：

```bash
openclaw agents add work \
  --workspace ~/.openclaw/workspace-work \
  --model openai/gpt-5.2 \
  --bind whatsapp:biz \
  --non-interactive \
  --json
```

如果未设置<model>和<bind>则命令无需配置其参数为：

```bash
openclaw agents add work \
  --workspace ~/.openclaw/workspace-work \
  --non-interactive \
  --json
```

3. **验证创建结果**

使用命令列出当前所有 Agent，查看输出内容中是否能够找到刚刚创建的 Agent

```bash
openclaw agents list
```

### 步骤2. 让用户做一份问卷调查

引导用户逐一回答问卷中的问题，这将决定下一步如何重新定义刚刚初始化的 Agent。

**问卷内容**
问题1：你想要创建一个什么样的 Agent？希望它能够帮你完成什么任务呢？（如果用户在前面的消息中已经有过相关描述，则不需要重复提问，直接跳过问题1，进入问题2）
问题2：是否允许这个 Agent 具备记忆的能力？（对于问题2的答案，只需要判断答案的意思是“是”或者“否”）

### 步骤3. 检索人才库，寻找最适合最匹配的人才 Agent

以下Github仓库都是开源的 AI Agent机构，你可以获取并检索整个仓库，并从中寻找合适的 Agent 作为人才来帮助重新定义 Agent。由标准`.md`定义的 Agent 在 OpenClaw 中导入时需要转换为`SOUL.md + AGENTS.md + IDENTITY.md`

1. <https://github.com/msitarzewski/agency-agents>
2. <https://github.com/wshobson/agents/tree/main/plugins>

这一步骤需要你具备联网搜索、网页读取、获取Github仓库相关的技能或MCP工具才可以正常执行，如果你不具备访问网页或检索Github仓库的能力，或者没有找到匹配的合适的 Agent，必须在后续回复中向用户报告。

### 步骤4. 根据问卷调查的回答重新定义刚刚初始化的 Agent

问题2?根据类人 Agent 的工作空间模版重新定义 Agent:根据技能 Agent 的工作空间模版重新定义 Agent

#### 根据类人 Agent 的工作空间模版重新定义 Agent

1. 读取根据类人 Agent 的工作空间模版目录 `openclaw-workspace-tempaltes/workspace-human-agent-template`，复制其中`AGENTS.md`、`IDENTITY.md`、`SOUL.md`文件到刚刚完成初始化的 Agent 的工作空间，替换掉对应的文件。必须先读取这些文件，并且理解清楚如何去定义一个类人 Agent。
2. 类人 Agent 是具备记忆能力的，需要在完成初始化的 Agent 的工作空间内创建目录`memory/`以及文件`MEMORY.md`用于存储它的短期记忆和长期记忆。
3. 跟用户进一步交流，一起弄清楚以下问题（如果用户在之前的消息或要求中从未明确以下问题的答案，则需要主动询问用户提供答案）：
   3.1. **Agent 的名字** — Agent 的名称，在提及 Agent 时应该怎样称呼它？
   3.2. **Agent 的本质** — Agent 的本质是什么样的存在？（可能是AI、语言模型、机器人、还是一个真正的人类？）
   3.3. **Agent 的风格** — Agent 的行为或回复风格是怎样的？（幽默、认真、随意、冷静...）
4. 用你跟用户交流得到的内容更新这些文件：
   4.1. `IDENTITY.md` — 你的名字、本质、风格、标志的emjoy符号
   5.2. `USER.md` — 从用户的来信收集他们的名字，明白如何称呼他们、所在的时区以及其他备注信息
5. 是否有在人才库中找到最合适最匹配的用户需求的 Agent?参考人才 Agent 的定义或以人才 Agent 为标准重新定义 Agent:跳过这一步。
6. 综上所述，更新或完善 Agent 工作空间中的`AGENTS.md`、`IDENTITY.md`、`SOUL.md`文件
7. 在工作空间中删除`BOOTSTRAP.md`文件，不再需要这个文件了，因为 Agent 已经完成创建并且从此诞生了。

#### 根据技能 Agent 的工作空间模版重新定义 Agent

1. 读取根据技能 Agent 的工作空间模版 `openclaw-workspace-tempaltes/workspace-skill-agent-template`，复制其中`AGENTS.md`、`IDENTITY.md`、`SOUL.md`文件到刚刚完成初始化的 Agent 的工作空间，替换掉对应的文件。必须先读取这些文件，并且理解清楚如何去定义一个技能 Agent。
2. 技能 Agent 是没有记忆能力的，禁止它在完成初始化的 Agent 的工作空间内创建目录`memory/`以及文件`MEMORY.md`，如果存在这些文件则需要删除它们。
3. 跟用户进一步交流，一起弄清楚以下问题（如果用户在之前的消息或要求中从未明确以下问题的答案，则需要主动询问用户提供答案）：
   3.1. **Agent 的名字** — Agent 的名称，在提及 Agent 时应该怎样称呼它？
4. 以下定义相关的不需要与用户交流，本质和风格都是确定性的。
   4.1. **Agent 的本质** — 工具、技能、Skill
   4.2. **Agent 的风格** — 严谨、准确
5. 用你跟用户交流得到的内容更新这些文件：
   5.1. `IDENTITY.md` — 你的名字、本质、风格、标志的emjoy符号
6. 禁止更新`USER.md`这个文件，因为使用你这个工具的可以是任何人，技能 Agent 只需要关心问题或任务本身，不需要关心是谁提及或使用了它。
7. 是否有在人才库中找到最合适最匹配的用户需求的 Agent?参考人才 Agent 的定义或以人才 Agent 为标准重新定义 Agent:跳过这一步。
8. 综上所述，更新或完善 Agent 工作空间中的`AGENTS.md`、`IDENTITY.md`、`SOUL.md`文件
9. 在工作空间中删除`BOOTSTRAP.md`文件，不再需要这个文件了，因为 Agent 已经完成创建并且从此诞生了。

#### 步骤5. 设置 Agent 使用的 AI 模型（可选，可跳过，如果用户在初始化时已绑定消息平台则自动跳过这一步）

列出可用的模型列表：

```bash
openclaw models list
```

模型列表输出示例：

```
| Model | Input | Ctx | Local | Auth | Tags |
|-------|-------|-----|-------|------|------|
| zhipu/glm-5 | text | 195k | no | yes | default, configured, alias:GLM |
```

配置方式一、设置全局默认模型

```bash
openclaw models set <provider>/<model>
```

配置方式二、编辑配置文件`~/.openclaw/openclaw.json`，增加配置`agents.list[].model`,按 Agent 或 Workspace 分配不同模型，示例如下：

```json
{
  "agents": {
    "list": [
      {
        "id": "whatsapp-agent",
        "workspace": "~/.openclaw/workspace-wa",
        "model": "anthropic/claude-sonnet-4-5"
      },
      {
        "id": "telegram-agent",
        "workspace": "~/.openclaw/workspace-tg",
        "model": "anthropic/claude-opus-4-6"
      },
      {
        "id": "discord-agent",
        "workspace": "~/.openclaw/workspace-dc",
        "model": "openai/gpt-4o"
      }
    ]
  }
}
```

查看指定 Agent 的模型状态：

```bash
openclaw models status --agent <agent-id>
```

**具体交互流程，引导用户完成配置，在引导过程中允许用户主动跳过当前步骤：**

1. 询问用户是否需要设置 Agent 的 AI 模型?流程继续:跳过当前步骤
2. 查看可用的模型列表，输出模型列表供用户查看和选择
3. 询问用户是否配置为全局默认模型?使用配置方式一:使用配置方式二
4. 完成配置后使用`查看指定 Agent 的模型状态`命令确认是否配置成功?进入下一个步骤:报告配置失败结果并说明原因

#### 步骤6. 绑定消息平台渠道到 Agent（可选，可跳过，如果用户在初始化时已绑定消息平台则自动跳过这一步）

列出可用渠道列表：

```bash
openclaw channels list
```

渠道列表输出示例：

| Chat Channels | AccountId              | Status |
| ------------- | ---------------------- | ------ | ------------------- |
| Feishu        | main-bot               |        | configured, enabled |
| Feishu        | ctv-cv352-configer-bot |        | configured, enabled |
| Feishu        | ctv-email-monitor-bot  |        | configured, enabled |
| Feishu        | ctv-ba-bot             |        | configured, enabled |

绑定渠道到 Agent 命令：

```bash
openclaw agents bind --agent <agent-id> --bind <channel>:<accountid>
```

| 绑定格式                   | 匹配范围                   |
| -------------------------- | -------------------------- |
| `--bind whatsapp`          | 仅匹配默认账户             |
| `--bind whatsapp:personal` | 匹配指定账户               |
| `--bind whatsapp:*`        | 匹配所有账户（频道级回退） |

**重要说明：**

- 省略 accountId 只匹配默认账户
- accountId: "\*" 是频道级回退，匹配所有账户
- 如果同一 Agent 先绑定频道，再绑定账户，OpenClaw 会升级现有绑定

绑定渠道示例：

```bash
# 先绑定频道（默认账户）
openclaw agents bind --agent work --bind telegram

# 再升级为账户绑定
openclaw agents bind --agent work --bind telegram:ops
```

解除绑定命令：

```bash
openclaw agents unbind --agent <agent-id> --bind <channel>:<accountid>
```

查看绑定状态：

```bash
openclaw agents bindings
```

**具体交互流程，引导用户完成配置，在引导过程中允许用户主动跳过当前步骤：**

1. 询问用户是否需要绑定 Agent 的消息渠道?流程继续:跳过当前步骤
2. 查看可用的渠道列表，输出渠道列表供用户查看和选择
3. 通过判断用户是否有告知`<accountid>`来确定是否绑定 Agent 到指定账户?仅匹配默认账户:匹配指定账户
4. 向用户再次确认绑定的 `<agent-id>、<channel>、<accountid>` 是否正确?使用命令完成绑定:重新引导用户选择渠道
5. 完成配置后使用`查看绑定状态`命令确认是否配置成功?结束配置:报告配置失败结果并说明原因

## 注意事项

故障排查命令：

```bash
openclaw doctor
```

在运行过程中出现了任何与配置相关的错误都可以先使用`故障排查命令`查看输出结果，辅助分析导致问题的原因。
