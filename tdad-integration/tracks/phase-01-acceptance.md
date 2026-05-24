# Acceptance checklist (locked in phase 1)

> TDAD 技能优化验收清单。Inner loop 不可删除项目；范围变更需回 Phase 1。

## Structure / machine-checkable

- [x] SKILL.md frontmatter 无孤立字符（第 5 行 `ƒ` 已删除）
- [x] SKILL.md 正文字数 ≥ 1,500 词（实际 1,932 词：中文 1,695 + 英文 237）
- [x] 三个代理系统提示词均 ≤ 3,000 字符（2,503 / 2,393 / 2,326）
- [x] `grep -rn 'tdd-' **/*.md` 返回 0（无 tdd- 残留）
- [x] 所有交叉引用路径指向实际存在的文件

## Content quality

- [x] SKILL.md description 使用第三人称 + 具体触发短语
- [x] SKILL.md 正文使用祈使句/不定式形式（非第二人称）
- [x] 三个代理 description 各含 3 个 example 块
- [x] references/ 与 SKILL.md 内容互补，无显著重复
- [x] 代理 tools 列表与 constraints 不矛盾（tdad-test-writer 已添加 Read 作用域说明）

## Behavior / manual

- [x] SKILL.md 引用全部 bundled resources（references, examples, agents）
- [x] 全文 TDAD 术语统一（Agentic Development，非 Autonomous）
- [x] examples/ 覆盖 3 种编程语言（Go、Python、TypeScript）
