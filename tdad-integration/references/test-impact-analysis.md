# 基于图的测试影响分析

基于 TDAD 论文中的图分析方法，用于识别代码变更影响的测试。

## 核心概念

TDAD 构建代码-测试依赖图（Code-Test Dependency Graph），在代理提交补丁前识别应验证的测试。

### 图结构

四种节点类型：

| 节点类型 | 实体 | 关键属性 |
|----------|------|----------|
| File | Python 源文件 | path, content_hash |
| Function | 顶层函数 | name, file, lines, signature |
| Class | 类定义 | name, file, bases |
| Test | 测试函数/方法 | name, file, is_test |

五种边类型：

| 边类型 | 方向 | 含义 |
|--------|------|------|
| CONTAINS | File → Function/Class | 结构包含 |
| CALLS | Function → Function | 静态调用解析 |
| IMPORTS | File → File | import 追踪 |
| TESTS | Test → Function/Class | 测试-代码关联 |
| INHERITS | Class → Class | 继承关系 |

### 影响分析策略

四种并行策略，带权重合并：

**评分公式**：
```
score = (1 - cw) × w_strategy + cw × confidence
```
其中 `cw = 0.3`（置信度权重）。

| 策略 | 权重 | 置信度 | 描述 |
|------|------|--------|------|
| Direct | 0.95 | 1.0 | 直接测试变更代码 |
| Transitive | 0.70 | 0.56 | 1-3 跳调用链 |
| Coverage | 0.80 | 0.5 | 文件级依赖 |
| Imports | 0.50 | 0.45 | import 变更文件 |

测试选择三级阈值：
- 高（≥ 0.8）：必须验证
- 中（0.5-0.8）：建议验证
- 低（< 0.5）：可选验证

## 在 TDAD 技能中的应用

### 简化版：手动测试映射

无需完整图数据库，可通过以下方式实现轻量级影响分析：

1. **命名约定映射**：`test_foo.py` → `foo.py`
2. **import 分析**：`grep` 测试文件中的 import 语句
3. **目录邻近度**：测试文件与源文件的距离

生成 `test_map.txt` 格式：
```
src/module/foo.py → tests/test_foo.py
src/module/bar.py → tests/test_bar.py, tests/integration/test_bar_integration.py
```

代理使用 `grep test_map.txt` 查找相关测试。

### 完整版：TDAD 工具集成

安装 TDAD 工具进行完整图分析：

```bash
pip install tdad
tdad index /path/to/repo
tdad analyze --changed file1.py file2.py
```

输出：受影响测试的排序列表，按影响分数排序。

## 关键设计原则

### 1. 上下文优于流程

TDAD 论文的核心发现：告知代理「检查哪些测试」比告知「如何编排经典 TDD 步骤」更有效。

设计代理指令时：
- 提供具体的测试文件路径和函数名
- 不要描述冗长的经典 TDD 工作流程
- 简短精准的指引 > 详细的流程描述

### 2. 静态文件传递

代理运行时只需：
- `test_map.txt`：源文件到测试文件的映射（可 grep）
- `SKILL.md`：20 行精简技能定义

无需 MCP 服务器、图数据库或 API 调用。

### 3. 置信度分级

不同来源的测试关联有不同可信度：
- 直接 TESTS 边（测试明确标注）：最高
- 调用链推导：中等
- import 关系：较低
- 目录邻近度：最低

在建议验证优先级时参考此分级。
