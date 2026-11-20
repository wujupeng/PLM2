# P3/P4 API 与 UI 测试结果

## 执行元数据

- 运行 ID：`PLM2-20261120-084104-76174`
- 源码提交基线：`557bac9`，测试改动见后续 phase-3 commit
- 后端：Java 17；Spring Boot dev profile；独立 H2 测试库（PostgreSQL 兼容模式）
- 前端：Node.js 25.8.1；Playwright 1.65.1 / Chromium
- 数据：仅本机既有 H2 与 HTTP 健康/认证端点；未创建业务单据或测试用户

## 实际自动化检查

### Node API 冒烟：6 PASS / 0 FAIL

| 检查 | 结果 | 断言 |
|---|---|---|
| 系统服务 health | PASS | HTTP 200、服务 `UP`、H2 DB `UP`。 |
| 网关 health | PASS | 临时 Redis 就绪期间 HTTP 200、服务 `UP`。 |
| 前端 shell | PASS | HTTP 200、`lang=zh-CN`、React root 节点存在。 |
| 未认证身份接口 | PASS | `GET /api/auth/me` 返回 HTTP 401。 |
| 未认证用户列表 | PASS | `GET /api/system/users` 返回 HTTP 401。 |
| 空登录字段 | PASS | HTTP 200 业务 envelope `code=400`，中文提示用户名和密码必填。 |

### Java Spring/H2 集成测试：2 PASS / 0 FAIL

`AuthControllerIntegrationTest` 直接运行真实 Spring 上下文、MockMvc、安全过滤器及 H2；没有 Mock/假造业务服务。

1. `emptyLoginReturnsChineseValidationErrors`：空 JSON 返回业务校验码 400，包含两条中文必填错误。
2. `anonymousIdentityAndUserListRequestsAreRejected`：身份读取和用户列表接口均返回 HTTP 401。

验证命令：`JAVA_HOME=<Java 17> mvn -o -pl plm-system -am test`。本轮在完成 Surefire 运行器依赖缓存后离线复验通过，共 2 项测试。

### Playwright UI：1 PASS / 20 BLOCKED

- PASS：真实浏览器访问登录页，确认中文标题、用户名、密码和登录按钮可见。
- BLOCKED：S01–S20 在 Playwright HTML 报告中逐项显示为 skipped，原因是尚无系统创建的测试用户/角色权限和业务前置单据。未调用测试桩，也未继续伪造下游数据。
- 失败截图、视频、trace 与 HTML 输出配置已开启；最新运行全量报告位于 `reports/playwright/html/index.html`（本机生成、Git 忽略）。

## 任务书第 5 节 API 用例矩阵

本矩阵共 38 个完整验收用例；当前没有可确认的完整业务用例 PASS。认证/授权冒烟只证明对应单个子断言，不将整组业务验收提前判 PASS。

| 模块/用例 | 结果 | 阻塞原因 |
|---|---|---|
| OA/系统 TC-OA-01 | BLOCKED（部分校验子项 PASS） | 未配置测试账号，无法验证成功登录、错误密码、锁定和过期 JWT。 |
| OA/系统 TC-OA-02–08 | BLOCKED | 需要管理员/岗位账号、部门/员工数据及真实 OA 工作流/邮件/附件。 |
| PLM TC-PLM-01–04 | BLOCKED | 无研发账号和物料/BOM/文档/变更数据；未执行保存、发布及版本关系断言。 |
| ERP/SRM TC-ERP-01–05、TC-SRM-01–03 | BLOCKED | 无登录账号和真实客户、订单、采购、供应商及财务业务单据。 |
| WMS/MES/QMS TC-WMS-01–04、TC-MES-01–04、TC-QMS-01–04 | BLOCKED | 无真实库存流水、批次、工单、报工、检验数据及持久化并发测试环境。 |
| 集成/迁移 TC-INT-01–02 | BLOCKED | 未创建外部接口/迁移批次与核对数据；只读迁移实现不等同于业务验收。 |
| NFR TC-NFR-01–04 | BLOCKED | 未验证未知目标路由错误契约、生产 Actuator 配置、注入/XSS 边界或 1000 条数据性能。 |

## P3/P4 结论

登录参数校验、匿名身份/用户访问控制、当前 H2 与服务健康以及登录页 UI 冒烟有真实测试结果。业务模块与 AF1000 主流程仍需完成 P2 数据创建和岗位授权后重跑。
