# 功能缺口与验收阻塞清单

按对 AF1000 × 500 闭环的阻塞程度排序。区分“代码/部署缺失”与“存在代码但未验收”；页面或 Controller 存在不等于业务通过。

| 优先级 | 缺口 | 证据 / 关联任务 | 对闭环影响 | 建议补齐顺序 |
|---|---|---|---|---|
| P0 | 尚无可用的隔离测试管理员凭据，也未通过系统接口建立测试公司、11 个部门、14 个用户 | 任务书 S01；`tests/seed/provision-dev.mjs`；`reports/02-seed-data.md` | 首个阻断点，后续所有真实岗位流程无法开始 | 在仅本机 dev H2 配置管理员/测试密码环境变量，执行种子脚本并逐个验证登录；不提交密码。 |
| P0 | 角色细粒度授权矩阵未提供；新建用户接口 DTO 没有独立岗位字段 | 任务书 §3.2/S01；`UserSaveRequest.java`；`RoleSaveRequest.java` | 账号可登录但不能证明岗位权限或工作分离；岗位名只能临时写备注 | 业务负责人给出角色-权限矩阵；明确岗位主数据是否纳入当前版本；再授权并执行越权测试。 |
| P0 | AF1000 所需客户、物料、多级 BOM、供应商、期初库存和测试业务数据未建立；订单到生产、发运及追溯没有真实运行记录 | 任务书 S02–S20、TC-ERP/PLM/WMS/MES/QMS | S02 后续无法准备，数量/金额/状态/追溯守恒无法核对 | 按 S01 建好岗位后通过真实 UI/API 逐阶段创建，前置失败即阻断，不跳步补造数据。 |
| P1 | 多个网关服务发现目标不在聚合工程中 | `plm-backend/pom.xml` 只包含 common/gateway/system；gateway 另有 `lb://plm-manufacturing`、`plm-integration`、`plm-auth-workflow`、`plm-admin`、`plm-notification`、`plm-search` | 制造、集成及部分跨服务 E2E 在当前仓库无法独立启动/验收 | 确认对应服务仓库/部署拓扑，接入可构建服务或明确本版本范围；验证服务发现、消息幂等和补偿。关联任务书 §11.2 E2E-02/07/08/09。 |
| P1 | 页面与 533 个 Controller 的 API 契约尚无自动对照；业务验收矩阵 38 项只有认证/健康子检查，完整模块用例均阻塞 | `plm-frontend/src/router/index.tsx`、`plm-frontend/src/services/`、`plm-system/.../controller/`；任务书 §5 | 不能证明页面实际 API 路径、字段、权限、状态和业务流水一致 | 拿到环境数据后按 TC-PLM/ERP/SRM/WMS/MES/QMS/INT 逐域执行契约及数据库/流水对账。 |
| P1 | WBS T079 的自定义字段映射规则未由导入 API 自动执行；历史旧系统样例/映射校验和未提供 | `企业级一体化管理平台_六大系统全自研_华为云长任务开发计划.xlsx`「开发任务WBS」第 80 行 T079、「数据迁移」第 5 行；任务书 E2E-10 | 未结业务迁移需上传前先转换为标准 DTO，无法用映射配置直接复现旧数据迁移 | 获取脱敏旧系统样例，确认映射规则后实现/验收转换、幂等、金额数量及关系全量对账。 |
| P2 | 只有 dev H2 内存库；没有持久化 test/it 数据库、并发库存、备份恢复和崩溃事务测试 | `application-dev.yml`；任务书 §13.1、§13.3、§13.4、§14.1 | 并发、长期数据、备份/恢复结论均不可得；H2 重启数据丢失不能作为通过 | 建立与目标部署相近的隔离持久化集成环境，再进行库存并发、恢复和重试补偿测试。 |
| P2 | ESLint 9 未配置 flat config；总测命令因此非零退出 | `reports/defects.md` BUG-001；任务书 §15.2 | 无法完成 L0 lint 门禁 | 明确规则后补齐 eslint.config 并治理 lint 结果，不使用空配置或跳过。 |
| P2 | 前端依赖审计有 4 high、9 moderate 公告 | `reports/defects.md` BUG-002；任务书 §15.2 | 发布安全门禁未通过，升级可能影响 Ant Design Pro、Vite 和 React Router 兼容性 | 逐项评估升级范围、回归 UI/构建后再修复。 |
| P3 | 性能基线目标尚未由项目负责人确认 | 任务书 §13.3 | 无法判定性能达标；不得自行设阈值 | 业务/IT 确认吞吐、延迟、数据规模和资源预算后建立 baseline，再压测。 |

业务计划证据来源还包括：根目录制造业 PLM、OA、供应链/生产集成开发计划工作簿；主闭环步骤及额外 E2E-01–10 以测试任务书第 4、5、6、11–16 节为准。

## 第二轮补充阻塞

| 优先级 | 缺口 | 第二轮证据 | 后续条件 |
|---|---|---|---|
| P0 | Gateway 依赖 Redis 健康；当前 Redis 停止时 health 为 DOWN | `reports/10-env-discovery.md`：Redis 暂时启动时 Gateway 恢复 UP，停止后再次 DOWN | 为深度测试提供获批的稳定 Redis 测试依赖；确认不是一次性临时实例后再开始业务流程 |
| P0 | 管理员及 14 个测试账号未配置 | `.env.local` 不存在；`reports/16-closed-loop-v2.md` S01–S20 全阻塞 | 在隔离测试环境本地配置 `PLM_PROVISIONER_USERNAME`、`PLM_PROVISIONER_PASSWORD`、`PLM_TEST_DEFAULT_PASSWORD` 及各账号密码环境变量 |
| P0 | 只读数据库账号、注册中心/服务部署访问未提供 | `reports/10-env-discovery.md` | 提供最小权限 SELECT 账号和测试机服务发现/日志读取方式；不在会话中提交凭据 |
| P1 | 业务 API、页面角色遍历、CRUD、状态机、并发和恢复尚未实测 | A2 1,274 GET 探测全部 BLOCKED；A3–A5 及 P3–P5 被前置阻断 | 满足 Gateway、账号、数据和只读核对前提后逐阶段执行 |
| P0 | Gateway 默认 JWT signing key 为硬编码字面量，运行时覆盖未知 | `reports/defects.md` ROUND2-SEC-002；Gateway filter 读取该配置 | 由安全/部署负责人确认实际取值，改用密钥管理并评估轮换；本轮未进行令牌伪造测试 |
