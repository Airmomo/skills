# 大规模 Skill 组织指南

当 Plugin 的 Skill 数量从十几个增长到几十、上百个时，平铺式组织会导致路由失败——明明存在对应 Skill 却不被调用，或调用了错误的 Skill。本指南提供分类原则、分层实现方式和索引文件模板，帮助在大规模场景下保持 Skill 路由的准确性。

## 为什么需要分层组织

Skill 路由本质上是**语义检索问题**：模型根据用户查询与 Skill description 的语义相似度选择 Skill。搜索空间越大，命中正确 Skill 的难度越高，原因有二：

1. **相似 Skill 互相干扰**：多个 Skill 描述相似时，模型难以区分
2. **注意力分散**：上下文中存在大量候选项时，模型对每个候选项的判断精度下降

### 数量阈值建议

| Skill 数量 | 推荐策略 | 说明 |
|---|---|---|
| ≤ 15 | 平铺即可 | 模型可轻松处理，无需额外组织 |
| 16 - 30 | 引入场景化描述 + 负样本 | 单 Skill 层面优化即可，不一定需要分层 |
| > 30 | 必须分层 | 平铺方案的命中率会显著下降 |

阈值仅供参考，实际触发点取决于 Skill 之间的语义距离。如果 Skill 之间天然区分度高（如"PDF 处理"和"邮件发送"），即使 40 个也可暂不分层；如果 Skill 之间语义接近（如多种代码生成 Skill），20 个就应考虑分层。

## 分类原则

选择分类维度时，应让同一类内的 Skill 语义尽量接近，不同类之间的 Skill 语义尽量远离。

### 三种常见维度

#### 维度一：按业务领域

适用于跨职能团队、企业级 Plugin。

```
skills/
├── dev/         # 研发
├── ops/         # 运维
├── marketing/   # 市场
├── finance/     # 财务
└── hr/          # 人力
```

**优点**：边界清晰，业务人员易于理解
**缺点**：跨领域任务（如"开发运维自动化脚本"）归类困难

#### 维度二：按用户角色

适用于角色分工明确的场景。

```
skills/
├── developer/   # 开发者
├── designer/    # 设计师
├── pm/          # 产品经理
└── data/        # 数据分析师
```

**优点**：角色内 Skill 高度内聚
**缺点**：一个人多角色时会重复查找

#### 维度三：按任务类型

适用于工作流清晰的场景。

```
skills/
├── create/      # 创建类（生成代码、生成文档、生成图表）
├── review/      # 评审类（代码评审、文档评审）
├── test/        # 测试类（单元测试、E2E 测试）
└── deploy/      # 部署类（CI/CD、发布）
```

**优点**：与用户意图对齐，触发链路短
**缺点**：同一对象的不同操作分散（如"创建 PDF"和"评审 PDF"分属不同类）

### 选型决策树

1. 团队是否按业务领域划分？→ 是 → 用**业务领域**
2. 用户是否以单一角色使用 Agent？→ 是 → 用**用户角色**
3. 工作流是否是创建-评审-测试-部署的流水线？→ 是 → 用**任务类型**
4. 都不符合 → 用混合维度，主分类用业务领域，次分类用任务类型

## Skill Tree 实现方式

### 方式 A：物理目录分层

将 Skill 按分类放入子目录：

```
my-plugin/
└── skills/
    ├── dev/
    │   ├── code-generator/
    │   │   └── SKILL.md
    │   ├── code-reviewer/
    │   │   └── SKILL.md
    │   └── test-writer/
    │       └── SKILL.md
    └── ops/
        ├── deploy-helper/
        │   └── SKILL.md
        └── log-analyzer/
            └── SKILL.md
```

**注意**：Claude Code 当前对子目录的自动发现能力取决于版本。在使用前需验证所用版本是否支持嵌套 skills 目录。若不支持，请改用方式 B 或方式 C。

### 方式 B：单层目录 + 索引文件

保持 `skills/` 平铺，但额外维护一份 `INDEX.md` 描述分类：

```
my-plugin/
└── skills/
    ├── INDEX.md              # 分类索引（人为维护）
    ├── dev-code-generator/
    │   └── SKILL.md
    ├── dev-code-reviewer/
    │   └── SKILL.md
    ├── ops-deploy-helper/
    │   └── SKILL.md
    └── ops-log-analyzer/
        └── SKILL.md
```

`INDEX.md` 通过命名约定（前缀）+ 主动索引结合实现分类。适用于不支持嵌套发现的版本。

**INDEX.md 模板：**

```markdown
# Skill 分类索引

## 研发类（dev-）
- `dev-code-generator` - 生成业务代码骨架
- `dev-code-reviewer` - 代码评审与改进建议
- `dev-test-writer` - 自动编写单元测试

## 运维类（ops-）
- `ops-deploy-helper` - 部署流程辅助
- `ops-log-analyzer` - 日志分析与异常定位

## 何时查阅此索引

当不确定某个任务应使用哪个 Skill 时，先按任务所属领域（dev / ops / ...）定位，再在该类下查找具体 Skill。
```

### 方式 C：description 前缀约定

不改目录结构，在 description 开头加入分类标签：

```yaml
---
name: code-generator
description: "[dev] This skill should be used when the user asks to 'generate boilerplate code', 'scaffold a new module'. Do NOT use for code review or test generation."
---
```

```yaml
---
name: deploy-helper
description: "[ops] This skill should be used when the user asks to 'deploy to production', 'roll out new version'. Do NOT use for development tasks."
---
```

**优点**：零结构改动，模型能从 description 直接读到分类
**缺点**：依赖模型自觉读取前缀，无强制约束

### 三种方式对比

| 维度 | 方式 A（物理分层） | 方式 B（索引文件） | 方式 C（前缀约定） |
|---|---|---|---|
| 实现复杂度 | 中（需版本支持） | 低 | 极低 |
| 模型友好度 | 高 | 中 | 中 |
| 维护成本 | 中（移 Skill 需改路径） | 高（INDEX.md 需同步） | 低 |
| 推荐场景 | Claude Code 支持嵌套 | 大规模 + 旧版本兼容 | 快速试验、规模中等 |

## 分层路由工作原理

分层组织后，模型的检索过程从"一次匹配 N 个 Skill"变为"两次匹配 √N 个 Skill"：

```
用户查询："帮我写一个用户登录的单元测试"
         │
         ▼
第一层：识别大类
         │  匹配 "dev" 类（研发类）
         ▼
第二层：在大类内精细匹配
         │  匹配 dev-test-writer（而非 dev-code-generator）
         ▼
命中：dev-test-writer
```

这种"先粗后细"的检索方式显著降低单次决策的搜索空间，从而提高命中率。

实际效果取决于 description 质量——如果分类前缀或 INDEX.md 写得不好，第一层就可能出错。因此分层组织**必须**与"场景化 description"和"负样本描述"配合使用。

## INDEX.md 完整模板

```markdown
# {Plugin 名称} Skill 分类索引

> 本索引用于在 Skill 数量较多时辅助路由。当不确定任务归属时，先按大类定位，再在类内查找。

## {大类 1}（{前缀-1}）

简短描述本类覆盖的任务范围。

- `{skill-id-1}` - 一句话场景化描述
- `{skill-id-2}` - 一句话场景化描述

**类内边界**：本类 Skill 不处理 {相邻领域}——那属于 {其他大类}。

## {大类 2}（{前缀-2}）

简短描述本类覆盖的任务范围。

- `{skill-id-3}` - 一句话场景化描述
- `{skill-id-4}` - 一句话场景化描述

## 维护规则

1. 新增 Skill 时同步更新对应大类
2. Skill 删除时同步移除索引条目
3. 大类调整（拆分/合并）时通知所有 Skill 维护者
4. 每季度复审一次分类是否仍然合理
```

## 案例对比

### 反例：50 个 Skill 平铺

某 Plugin 包含 50 个 Skill，全部放在 `skills/` 下，description 仅写功能：

```yaml
# 反例 description
description: PDF processing skill.
description: SQL generator.
description: Email sender.
description: Slide maker.
# ... 50 个类似的"功能型"description
```

**结果**：
- 用户问"帮我做一份季度汇报"，模型在 50 个候选中犹豫，最终选错或不用 Skill
- 用户问"生成查询用户表的 SQL"，模型可能选到"PDF processing"等无关 Skill
- 命中率随 Skill 数量增加而下降

### 正例：分层 + 场景化 + 负样本

同样的 50 个 Skill，按业务领域分为 5 大类（dev/ops/data/docs/comms），每类约 10 个 Skill：

```yaml
# 正例 description（含前缀 + 场景 + 负样本）
name: dev-sql-writer
description: "[dev] This skill should be used when the user asks to 'write SELECT query', 'generate SQL for user table'. Do NOT use for schema design or performance tuning—those belong to dev-schema-designer and dev-db-optimizer."
```

配合 `INDEX.md` 列出 5 大类及其 Skill。

**结果**：
- 用户问"帮我做一份季度汇报"→ 第一层定位到 docs 类 → 第二层命中 docs-slide-maker
- 用户问"生成查询用户表的 SQL"→ 第一层定位到 dev 类 → 第二层命中 dev-sql-writer
- 命中率随分层深度增加而提升

## 何时回归平铺

如果 Skill 数量因功能下线而回落到 15 个以下，可考虑取消分层以简化维护。判断标准：

- 分层带来的命中率提升已不显著（< 5%）
- 维护 INDEX.md 或前缀约定的成本超过收益
- 大类内只剩 1-2 个 Skill，分层意义不大

取消分层时同步：
1. 移除 description 中的分类前缀
2. 删除 INDEX.md
3. 如使用物理分层，将 Skill 移回 `skills/` 根目录

## 配套措施

分层组织不是孤立手段，必须与以下措施配合：

1. **场景化 description**：见 SKILL.md 中的"Scene-based Triggers"小节
2. **负样本描述**：见 SKILL.md 中的"Negative Sample Description"小节
3. **定期复审**：每季度审视分类是否仍合理、Skill 是否仍被使用
4. **测试验证**：维护一组典型查询，验证分层后命中率有提升

## 参考资料

- SKILL.md 中的 `## Organizing Large Skill Collections` 章节
- Claude Code Plugin 开发文档：https://github.com/anthropics/claude-code/tree/main/plugins/plugin-dev
