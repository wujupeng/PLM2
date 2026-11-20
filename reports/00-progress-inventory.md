# P0 仓库进度盘点

## 执行信息

- 仓库：`wujupeng/PLM2`
- 分支/提交：`main` / `414e147`
- 盘点日期：2026-11-20（本机时区 UTC+08:00）
- 测试环境目标：仅本机 `127.0.0.1`
- 测试任务书：`PLM2_全流程闭环测试任务书_完善版.md`

## 结论

仓库有完整的前端页面集合和一个包含大量业务 Controller/迁移脚本的 `plm-system` 聚合服务，但这不等同于业务闭环已验收。后端聚合工程只声明 `plm-common`、`plm-gateway`、`plm-system` 三个模块；网关另有多个指向未包含在聚合工程中的服务发现路由。当前开发环境系统服务和前端可访问，网关健康检查为 DOWN。仓库没有 Java 测试源码、前端测试框架配置或 CI 工作流；本机也没有 Maven 可执行文件或 Maven wrapper。

因此，先建立不依赖模拟数据的本机冒烟测试。需用系统接口创建的组织、账号和业务数据尚未创建；未经验证的端到端业务步骤不应判 PASS。

## 计划功能与仓库现状

已读取根目录四份 Excel 计划（工作簿/工作表、里程碑、WBS、系统范围、集成、迁移和端到端场景），并与源码及模块聚合配置对照。原文件保持不变。

| 计划范围 | 代码证据与当前判断 |
|---|---|
| G0 现状盘点与业务基线 | 本任务书要求的验收内容多于仓库既有自动化测试；本报告建立首份代码盘点。 |
| G1 统一身份、组织、权限、审计 | 有 `plm-system`、`AuthController`、OA/平台 Controller 和数据库迁移；没有现成测试账号、测试源码或已验证的全岗位权限矩阵，判为部分实现、未验收。 |
| G2 PLM 产品、物料、BOM、文档、变更 | 存在 `/product-data`、`/bom`、`/document`、`/eco` 等控制器路由及对应前端页面；多级 BOM 发布到销售订单快照的端到端行为尚未验证，判为部分实现。 |
| G3 ERP 销售、采购、计划、生产、库存 | 有 `erp`、`srm`、`wms`、`mes`、`mfg` 控制器路径及前端页面；对应业务规则、数量守恒及跨域事务未经测试，判为部分实现。 |
| G4/G5 供应链、制造、质量、追溯 | 有供应链、MES、质量、条码等 Controller 和迁移文件；无经过验证的端到端领料、报工、检验、成品入库、发运、SN 追溯证据，判为部分实现。 |
| G9 数据迁移/未结业务 | 存在迁移批次、导入暂存及转正式相关代码和 V162–V172 迁移；导入字段映射表达式不由导入接口自动执行（运维手册第 5.5 节），尚无迁移数据验收，判为部分实现。 |
| 独立服务部署 | 根 POM 仅聚合三个模块，但网关还配置 `plm-manufacturing`、`plm-integration`、`plm-auth-workflow`、`plm-admin`、`plm-notification`、`plm-search` 等 `lb://` 目标；这些目标未在当前聚合工程定义，当前仓库无法单独构建/启动这些服务。 |

计划依据：根目录 `企业级一体化管理平台_六大系统全自研_华为云长任务开发计划.xlsx`、`制造业PLM详细开发计划_华为云团队交付版.xlsx`、`制造业研发供应链生产一体化系统_华为云长任务书与细化WBS.xlsx`、`自有OA2.0完整自研替换现有OA_华为云长任务开发计划.xlsx`，以及任务书第 3–16 节。工作簿含多张 WBS 和验收工作表；本轮仅记录与全局业务域和闭环有关的范围，不将计划条目误报为已交付功能。

## 后端模块、Controller、路由与迁移

### 模块构成

`plm-backend/pom.xml` 声明：

- `plm-common`
- `plm-gateway`
- `plm-system`

系统服务中有 **533 个 Controller 源文件**。按 Controller 根路径统计：`/oa` 91、`/intg` 84、`/platform` 78、`/erp` 77、`/mes` 41、`/wms` 38、`/mig` 30、`/srm` 29、`/int` 10、`/edi` 10、`/mfg` 8、`/system` 7、`/product-data` 5，其余包括 `/auth`、`/bom`、`/cad`、`/code`、`/compliance`、`/document`、`/eco`、`/harness`、`/inspection`、`/label`、`/packaging`、`/process`、`/quality`、`/relabel`、`/spec`。

路由定义位于 `plm-backend/plm-gateway/src/main/resources/application.yml`。系统服务控制器对应的 API 前缀大多路由至 `plm-system:8082`；`/api/manufacturing/**`、`/api/integration/**`、`/api/auth-workflow/**`、`/api/admin/**`、`/api/notification/**`、`/api/search/**` 路由到上述未聚合的服务发现目标。路由声明本身不能证明目标服务可达。

### 数据库迁移与表清单

- Flyway SQL：`plm-backend/plm-system/src/main/resources/db/migration/` 下 **172 个源迁移文件**，版本从 V1 至 V172。
- 使用静态扫描得到 **615 条 CREATE TABLE 声明**（含迁移中重复/条件创建语句时按声明计数；运行后实际表数需从数据库元数据复核）。
- G9 迁移相关文件：V162–V169、V170–V172；当前最高版本 V172。
- 每个迁移文件及各表定义均可在上述目录按版本检索。H2 实际启动成功，说明当前实例至少已完成其启动所需迁移；未将其等同于独立空库安装/升级路径验证。

## 前端路由、页面与 API

- `plm-frontend/src/router/index.tsx` 定义前端路由；静态扫描约 499 个 `path:` 声明（含嵌套路由）。
- `plm-frontend/src/pages/` 有 514 个 TSX/JSX 页面文件；`plm-frontend/src/services/` 有 89 个 API service 文件。
- 页面/服务域覆盖 OA、PLM、ERP、SRM、WMS、MES、质量、EDI、集成、迁移和平台管理等。
- 当前未建立前端 API 路径与全部 Controller 动词/参数契约的自动比对；应在后续 API 契约测试阶段补充。不能仅凭页面存在断言 API 功能完成。

## 业务域成熟度

| 业务域 | 判断 | 证据/说明 |
|---|---|---|
| OA / 系统 | 部分实现 | `/oa`、`/auth`、`/system` Controller 与迁移存在；组织、工作流、邮件和权限场景未完成任务书验收。 |
| PLM | 部分实现 | `/product-data`、`/bom`、`/document`、`/eco` Controller 与前端页面存在；发布、版本快照和工程变更联动未端到端验证。 |
| ERP 销售 | 部分实现 | `/erp` Controller 路径与页面存在；AF1000 订单、审批及数量/金额守恒未验证。 |
| SRM 采购 | 部分实现 | `/srm` Controller 与页面存在；询价、审批、到货和供应商隔离未闭环验证。 |
| WMS | 部分实现 | `/wms` Controller 与页面存在；批次、库位、库存流水和并发扣减未验收。 |
| MES | 部分实现 | `/mes`、`/mfg` Controller 与页面存在；工单、报工、SN 和追溯守恒未验收。 |
| 质量 | 部分实现 | `/quality`、`/inspection` Controller 与页面存在；待检隔离、让步/退货和成品放行未端到端验证。 |
| 集成/迁移 | 部分实现 | `/int`、`/intg`、`/edi`、`/mig` 路由与迁移实现存在；独立集成服务不可由当前聚合工程构建，历史数据对账未执行。 |

本轮未将业务域判为“已实现”，也未将存在 Controller 的域简单判为“仅前端壳”。

## 测试代码、CI 与覆盖率

- Java 测试源码：未发现 `src/test/java` 下测试类。
- 前端：`package.json` 只有 `dev`、`build`、`preview`、`lint`、`typecheck`，没有测试脚本；未发现 Vitest、Jest、Playwright 配置或测试文件。
- CI：未发现 `.github` 工作流文件。
- 覆盖率：没有测试报告或覆盖率配置，基线未知。

## 启动与健康验证

检查时间：2026-11-20 08:17（UTC+08:00）。系统服务、网关和 Vite 前端当时已由本机进程监听；本轮没有终止或重启这些既有进程。

| 服务 | 检查 | 结果 | 说明 |
|---|---|---|---|
| 系统服务 `:8082` | `GET /actuator/health` | **PASS**，HTTP 200，`status=UP`，DB 为 H2 | 仅代表当前 dev 实例健康。 |
| API 网关 `:8080` | `GET /actuator/health` | **FAIL**，HTTP 503，`status=DOWN` | 网关服务虽监听，但未达到任务书要求的 health=UP。 |
| 前端 `:3000` | `GET /` | HTTP 200，返回 Vite HTML | 可访问性检查通过，不等同于 UI 业务验收。 |
| 网关登录校验 | `POST /api/auth/login`，JSON `{}` | HTTP 200，业务 envelope `code=400`，中文提示用户名/密码不能为空 | 输入校验可达；未提供凭证，不尝试创建账号或绕过认证。 |
| Maven 启动/测试 | `mvn -pl plm-system -am spring-boot:run` / `mvn test` | **BLOCKED** | 本机 `mvn` 不存在，仓库无 Maven wrapper。Java 17 可用，当前默认 `java` 是 Java 25。 |

前端详细部署、H2 限制和 T079 运维方式见 `README.md` 与 `docs/运维手册.md`。测试阶段需恢复网关健康并准备仅限隔离 dev 环境的组织/用户数据后，才能执行真实岗位工作流。

## P0 退出条件

- [x] 已对照四份计划与实际模块、页面、控制器和迁移。
- [x] 已检查测试/CI 基线。
- [ ] 三个服务 health=UP：网关未通过。
- [ ] Maven 测试和任务书指定的 `spring-boot:run`：缺少 Maven。
- [ ] 测试账号和组织由系统接口/页面创建：尚未创建；不得写入硬编码假账号。
- [ ] AF1000 主业务端到端：未开始；按任务书须在下游依赖和前置数据可用后执行。
