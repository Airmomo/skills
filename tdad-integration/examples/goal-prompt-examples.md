# 目标驱动开发示例

各语言的 `/goal` 风格提示词示例，展示如何用自然语言描述开发目标触发 TDAD 工作流。

## Go 语言示例

### 示例 1：CLI 子命令

```
/goal 为 ctv-config 的 checklist 命令添加配置项差异对比功能。
支持三种差异状态：新增（added）、修改（modified）、删除（removed）。
输入是两个 map[string]string，输出是 map[string]DiffItem。
需要处理 nil 输入不 panic。
```

预期流程：
- RED：编写 TestDiffConfig_AddedItems、TestDiffConfig_ModifiedItems、TestDiffConfig_RemovedItems、TestDiffConfig_EmptyBaseline、TestDiffConfig_NilInput
- GREEN：实现 DiffConfig 函数
- REFACTOR：提取公共逻辑，添加 FileProvider 集成

### 示例 2：路径转换工具

```
/goal 实现远程路径转换函数，支持 UNC、MSYS、Linux 三种路径格式互转。
转换规则：
- UNC (\\server\share) → MSYS (/server/share)
- MSYS (/c/path) → Windows (C:\path)
- Linux (/home/user) → 保持不变
空输入返回空字符串，无效格式原样返回。
```

### 示例 3：并发扫描器

```
/goal 为 ctv-find 实现并发索引扫描器。
- 使用 worker pool 模式，最大 8 并发
- 支持上下文取消
- 收集所有文件路径并去重
- 通过 channel 传递结果
- 单元测试验证并发安全性（go test -race）
```

## Python 语言示例

### 示例 4：数据验证器

```
/goal 实现配置数据验证器。
验证规则：
- 必填字段不能为 None 或空字符串
- 数值字段必须在指定范围内
- 枚举字段必须是指定值之一
- 嵌套字段递归验证
返回 ValidationReport 包含所有错误（不提前返回）。
```

### 示例 5：日志解析器

```
/goal 编写日志解析器，从多行日志中提取结构化事件。
支持格式：JSON 日志、Apache Common Log Format、自定义格式。
输入是日志字符串，输出是 ParsedEvent 列表。
无法解析的行跳过并记录 warning。
```

## TypeScript 语言示例

### 示例 6：API 响应处理器

```
/goal 实现类型安全的 API 响应处理器。
功能：
- 验证响应结构是否符合 TypeScript 接口定义
- 支持嵌套对象和数组的深度验证
- 返回 ValidationResult<T> 包含 data 或 errors
- errors 包含字段路径和具体错误描述
```

### 示例 7：缓存管理器

```
/goal 实现带 TTL 的内存缓存管理器。
要求：
- 泛型支持 CacheManager<T>
- 设置时指定 TTL（秒），过期自动失效
- get 返回 T | undefined
- 最大容量限制，LRU 淘汰
- clear() 清除所有缓存
- size 属性返回当前缓存条目数
```

## 通用模式

### 好的目标描述特征

1. **明确输入输出**：指定函数签名、类型、返回值
2. **列出具体规则**：每个行为约束都有对应描述
3. **包含边界条件**：空输入、nil/null、极端值
4. **不涉及实现细节**：描述「做什么」而非「怎么做」

### 不适合 TDAD 的场景

- 「优化这个算法的性能」→ 没有明确的测试契约
- 「让 UI 看起来更好」→ 主观判断，难以测试
- 「探索这个 API 的用法」→ 探索性，无明确目标
