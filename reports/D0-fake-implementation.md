# D0-05 假实现与硬编码数据静态扫描

## 扫描范围

- 日期：2026-11-20
- 源码：`plm-system/src/main/java` 与前端 `src/pages`、`src/services`。
- 扫描信号：TODO/FIXME/HACK/XXX、mock/fake/fixture 词项、静态数组/固定页面指标、可疑空返回、固定 JSON 示例。
- 该扫描用于发现人工复核候选，不把关键词或 `return null` 单独当作假实现结论。

## 扫描结果与分流

| 信号 | 结果 | 复核结论 |
|---|---:|---|
| `TODO` 词项 | 47 处 | 命中以业务状态值 `TODO`、集成对象 `UNIFIED_TODO` 和对应标签/默认值为主，不是同义词可直接删；需把业务状态与实现 TODO 分开管理。 |
| `FIXME/HACK/XXX` | 0 处 | 在本次指定 Java/TS/TSX 生产源码范围内未命中。 |
| mock/fake/fixture 词项 | 命中集中在 `fixtureTooling` 工装夹具业务字段 | 未发现 `mockData/fakeData` 命名的前端生产数据源；关键词扫描不能证明整个系统没有行为级假实现。 |
| service 中空值/空集合返回候选 | 192 处，分布于 87 个 Java service 文件 | 很多是“未找到/可选字段”正常分支；未逐一审阅全部调用上下文，不能据此判定为 no-op，也不能宣称已全部清零。 |
| 固定 UI 数据 | Dashboard 四个统计值固定为 0、阶段和 Gateway 状态为固定文案；Manufacturing 页为静态提示 | 确认为静态壳内容，而非实时业务指标；在[页面盘点](./D0-pages.md)已列出。 |
| 未结业务导入固定示例 JSON | `MigOpenBusinessBatchPage.sampleRecord` 预填 `MAT-001`、10 件、示例订单/供应商等伪造记录 | 属于真实数据导入窗口中的危险演示默认值，用户可能未替换即导入。已删除示例记录生成器；打开导入对话框现在为空，必须粘贴真实来源记录才能提交。 |

## 已处理

1. 移除未结业务迁移页面的固定示例源记录与样例业务编号；阻止空文本提交，并提示仅提交真实来源数据。页面仍允许用户粘贴真实 JSON，后端仍按现有暂存、审核、转正式单据流程处理。
2. `SysBizRuleService` 执行日志 JSON 序列化原先捕获任意 `Exception` 后静默返回 `null`。现在仅捕获 Jackson `JsonProcessingException` 并向上抛出带原因的 `IllegalStateException`，避免执行日志序列化失败被伪装成成功且缺失日志。

## 未决候选与边界

- 192 个空返回候选需要按调用语义逐模块人工审查，再决定保留、改为明确 NOT_FOUND/错误响应或补实现；这不是 192 个已确认缺陷。
- 未逐一验证所有 service 是否真实持久化、所有页面是否调用真实接口，也未执行全仓行为级 mutation 测试。D0-04 仅对页面 API 引用做静态信号，运行时由 Gateway/身份依赖阻塞。
- SQL migration 中的初始化/演示数据与运行时代码中的假响应分开处理；当前报告未把受控 dev seed 误报为 mock API。

## 验证

- 前端：`npm --prefix plm-frontend run lint` 和 `npm --prefix plm-frontend run build` 均通过；Vite 显示既有 vendor/antd circular chunk warning 和 chunk-size 提示。
- 后端：`mvn -f plm-backend/pom.xml -pl plm-system -am test` BUILD SUCCESS，`AuthControllerIntegrationTest` 5/5 通过。
- D0-05 结论：**已完成主要关键词和明显固定数据扫描并修复两个确认问题；全量 192 个候选和行为级假实现审计尚未完成，整体部分完成/受阻。**
