# 第三轮开发进度

## 执行基线

- 日期：2026-11-20（UTC+08:00）
- 基线提交：`835ab22`（`main`）
- 依据：[第三轮详细开发计划与 WBS](../PLM2_第三轮详细开发计划_WBS任务明细.xlsx)及[第二轮实测成熟度报告](./99-final-report-v2.md)。
- 修改范围：覆盖 Gateway/本机 Redis 稳定性、JWT 与管理端点安全基线、本机 H2 测试账号初始化；未改写用户提供的 WBS 工作簿或第二轮历史测试结果。
- 测试目标限制：本地 Redis 固定绑定 loopback；未探测外网、未连接生产或未知 Redis。

## WBS 任务状态

### 执行顺序与验收约定

- 按业务闭环开发 WBS 顺序推进：D0 盘点 → D1 基础平台 → D2 OA → D3 PLM → D4 ERP 销售与计划 → D5 SRM → D6 WMS → D7 MES → D8 QMS → D9 财务 → D10 集成 → D11 看板 → D12 测试准备。
- 《PLM2 全流程闭环测试任务书》保留为最终验收规程，不作为当前第一项开发任务；只有对应阶段具备可验证依赖、数据和权限后，才按其用例执行，不以跳过前置或填充模拟数据制造 PASS。
- 阶段顺序不取消任务依赖门：例如 D1-02 PostgreSQL、D1-06 权限矩阵及外部服务拓扑阻塞的任务继续标记阻塞，不用后续阶段代码绕过。

### PLM2 业务闭环开发 WBS

| 任务 | 状态 | 实施与证据 |
|---|---|---|
| D0-01 服务拓扑盘点 | 部分完成/受阻 | 已新增[拓扑盘点报告](./D0-topology.md)，列出 3 个 Maven 模块、23 条指向 system 的路由及 6 个未纳入仓库的 `lb://` 目标。本机 system health 为 UP，Gateway 无响应，Redis/Nacos 默认端口未监听；由于没有注册中心可用证据，六个目标的运行时在线状态无法判定。 |
| D0-02 接口与前后端契约对照 | 路径级静态对齐完成，动态/字段验收待做 | 已新增[API 契约对照报告](./D0-contracts.md)：静态比对 533 个 Controller、3,244 条后端映射与 89 个前端 service 文件中的 3,229 个请求；发现的业务规则试算路径不一致已修正并复跑，实际 3,229 项路径匹配，仍有 15 个后端映射未在前端 service 找到同路径调用。尚未比对 DTO 字段、权限/状态或运行时行为，修复待动态验证。 |
| D0-03 数据库与持久化盘点 | 静态映射完成，PostgreSQL/持久化验收受阻 | 已新增[数据库盘点报告](./D0-database.md)：172 个 Flyway 版本连续至 V172，615 个迁移建表与 615 个显式实体表映射静态一致；H2 空库迁移及重复 migrate 的集成测试已通过。运行 dev 使用内存 H2；本机 PostgreSQL 默认端口不可用，缺少 PostgreSQL、重启保持、备份恢复及完整逐功能数据链验证。 |
| D0-04 页面分类 | 源码清点完成，逐页动态分类受阻 | 已新增[页面分类报告](./D0-pages.md)和 514 行页面清单、两张匿名态截图。497 个路由模块中 491 个源码引用 service，6 个为基础/静态壳；另有 17 个共享 TSX 辅助文件。新会话访问 `/bom` 重定向登录页；Gateway 无响应、没有登录态，故真实数据、403/白屏逐页动态验收尚未完成。 |
| D0-05 假实现扫描 | 主要静态扫描和两项修复完成，全量语义审计未完成 | 已新增[假实现扫描报告](./D0-fake-implementation.md)：删除未结业务导入窗口的硬编码示例业务记录，空输入拒绝；修正业务规则日志 JSON 序列化失败时静默返回 null。识别出 192 个可能正常的空值/空集合返回分支，仍待逐上下文审阅；前端 lint/build 及 system 后端集成测试已通过。 |
| D0-06 重复实现与复用分析 | 高层权威已确认，字段映射及路由冲突待审 | 用户确认 PLM 为工程物料主档权威、WMS 为实物库存权威、ERP 保留核算/计划视图；已记入[复用分析报告](./D0-duplicates.md)。字段/事件/对账映射与精确路由冲突检查仍未完成，不合并表。 |
| D0-07 开发启动与依赖边界 | 静态审查完成，未执行启动 | 已新增[启动评估报告](./D0-startup.md)：启动器具备测试目标检查、仅接受 loopback Redis、拒绝替换异常占用端口和健康检查；但运行会启动持久化 Redis/Gateway/前端，并可能留下后台进程，当前未执行以保护已有 H2 system 进程/数据。启动链使用 dev 内存 H2，不能作为持久化业务闭环环境。 |
| D0-08 第三轮 WBS 映射 | 已完成状态映射，原工作簿未改 | 已新增[PLM3-001–071状态映射](./D0-legacy-wbs-mapping.md)，逐项关联现存源码、测试和报告，并明确完整、部分、阻塞/未完成边界。原始工作簿状态列保留不变；当前无任何阶段门可据此宣布通过。 |
| D0-09 差距总表与工期修订 | 统计口径已复核，估算待评审 | 按用户提供同一工作簿“开发WBS”页逐项复核为全表 158 项、651 人天；D0 为 9 项/21 人天，D1–D12 为 149 项/630 人天。原 D1–D12 粗估区间 650–1,080 人天未获工期评审，不修改原 WBS、不宣告冻结。 |
| D1前置业务口径草案 | 已起草，待审批 | 用户选择“先起草候选供审核”，已新增[角色权限与 AF1000×500 口径草案](./D0-business-rules-draft.md)。未授予岗位角色权限；本轮仅按测试书通过本机 H2 system API 创建客户、供应商、产品、物料和草稿 BOM，BOM 行 API 返回 500，未创建销售订单或库存流水。高层物料/库存权威边界已确认。 |

### D1 统一基础平台

| 任务 | 状态 | 实施与证据 |
|---|---|---|
| D1-01 服务注册发现与网关路由统一 | 阻塞/部分 | 本机 23 条 system 路由可经 Gateway 使用；6 条 `lb://` 目标缺服务/注册环境证据，不能宣称全部路由可达，见[D0拓扑报告](./D0-topology.md)。 |
| D1-02 数据库持久化 | 阻塞 | 运行 system 使用内存 H2；本机已知 PostgreSQL 5432/5433 无 listener，用户选择不安装数据库。 |
| D1-03 Redis 与网关依赖 | 本机故障/恢复验证通过 | 已新增[环境稳定性报告](./01-environment-stability.md)：停止 Redis 时 Gateway health HTTP 503/DOWN，匿名认证守卫仍返回 401；Redis 恢复后 Gateway 自动回到 UP；RateLimit/JWT 定向测试 7/7 通过。共享/生产 Redis 未验收。 |
| D1-04 统一身份认证 | 部分/阻塞 | 管理员 Gateway 登录可返回 JWT，但本轮实测该 HS384 token 与本地 Gateway 密钥不匹配，后续受保护 API 返回 401；system 直连登录及受保护读取成功。连续失败锁定、密码策略和服务间鉴权仍未完成，详见[AF1000真实 API 测试](./02-af1000-live-api-test.md)。 |
| D1-05 组织架构 | 部分 | dev H2 上公司、11 部门、14 个账号已由系统 API 创建，14 个账号均登录通过；岗位主数据、调动/停用/引用约束及持久化未完成。 |
| D1-06 角色与权限 | 阻塞/部分 | 485 路由源码使用 `withPermission`；实测研发测试账号权限为空，产品、物料、BOM 查询返回 403。按用户授权，通过 system API 新增隔离的最高权限测试账号 `admin_max_11200315fb906044`（内置 `ADMIN`、全数据范围），其组织/产品/物料/BOM读取已验证。普通岗位角色仍无新增授权；菜单/按钮/API/数据四层岗位矩阵待业务批准，最高权限账号不能替代职责分离测试。原测试角色一次临时全量授权已回滚，详见[真实 API 测试及权限变更记录](./02-af1000-live-api-test.md)。 |
| D1-07 工作分离规则 | 阻塞 | 角色矩阵、审批流规则和审计证据未就绪；不能把候选矩阵误报为已配置。 |
| D1-08–D1-16 | 未验收/部分 | 审计、单号、字典、附件、事件、事务、可观测和重启续传均需逐任务对照 D1 WBS 验收；D1-16 现有本机启动脚本可启动服务但不证明自动重启/未完成事件续传。 |
| D1-17 管理员与账号初始化 | 部分 | dev H2 管理员密码轮换、公司/11部门/14账号 provisioning 已记录；隔离测试密码保存本机，不进入 Git；岗位权限未授权。 |

### 第三轮开发计划 WBS

| 任务 | 状态 | 实施与证据 |
|---|---|---|
| PLM3-006 环境隔离 | 部分落实 | 保留既有 HTTP origin 白名单；`start-dev.sh` 限制 Redis 主机为 loopback；管理员 bootstrap 与 seed provisioning 检查 loopback/H2。通用生产数据库 URL 拒绝机制及完整审计尚未完成。 |
| PLM3-007 持久化测试 Redis | 已实现并验证 | `scripts/test-redis.sh` 使用独立 `127.0.0.1:6381`、requirepass、RDB 和 AOF；生成的密码、配置、日志、数据位于 Git 忽略的 `.local/redis-test/`。验证了认证写入并在干净停止/重启后读回，再删除测试键并停止服务。 |
| PLM3-008 Gateway Redis 外部配置 | 已实现 | `PLM_REDIS_HOST/PORT/PASSWORD/DATABASE/TIMEOUT/CONNECT_TIMEOUT` 和池容量/等待参数外置；默认指向独立本机测试实例。未将凭据写入源码。 |
| PLM3-009 断线恢复与健康检查 | 代码和单测完成，运行环境复测待做 | Lettuce 开启自动重连及指数退避；Redis 健康由 Spring health indicator 反映，detail 配置为 `when-authorized`，具体授权读取尚未实测。限流降级日志不输出异常消息，并标识认证/超时/拒绝连接类别；Redis 恢复后回到 Redis 计数。 |
| PLM3-010 Gateway 故障恢复验证 | 部分验证 | `RateLimitFilterTest` 覆盖 Redis 故障降级、恢复后重新执行 Redis 限流以及下游失败不被误判为 Redis 故障；Gateway 现有进程未重启，故尚无新配置 Gateway 的端到端停止/恢复证据。 |
| PLM3-011 后端版本元数据 | 已实现并验证打包产物 | Spring Boot `build-info` 为 system/Gateway 制品生成应用名、版本、构建时间和 Git commit；在隔离 H2 临时端口启动打包后的 system JAR，并通过 `/actuator/info` 验证非空元数据，不含密钥。 |
| PLM3-012 前端构建版本 | 已实现并验证构建产物 | Vite 构建时注入 package 版本、Git commit 与构建时间，并在登录后的主布局页脚展示；dirty 工作区显式标记 `-dirty`。 |
| PLM3-050 ESLint 9 flat config | 已实现并验证 | 增加 TypeScript、React Hooks、Fast Refresh flat config；修复 2 处无用参数/失效禁用指令；`npm run lint` 以 0 warning/0 error 退出。 |
| PLM3-013–018 JWT/Actuator/API 文档基线 | 源码配置与自动化测试完成，运行进程切换待做 | 移除源码 JWT 默认密钥，要求注入至少 32 UTF-8 字节的 `PLM_JWT_SECRET`；Actuator 限制为 health/info 且健康详情仅授权可见；Swagger/OpenAPI 默认关闭；Gateway 与 system 过滤器不再匿名放行 Actuator 索引、敏感端点、文档或 H2 console。PLM3-015 已覆盖 Gateway 对有效、格式错误、过期及错误签名令牌的处理，以及 system 刷新令牌类型校验、刷新和已认证登出接口。当前登出仍是无状态实现，不撤销已签发令牌；如需即时失效，仍须实现并配置 Redis 黑名单或等效机制。 |
| S01 隔离测试账号初始化 | 已完成并验证（仅 dev H2） | 已轮换本机 H2 管理员密码，通过正式系统 API 建立 1 个测试公司、11 个部门、测试角色及 14 个测试账号；14/14 登录验证通过。权限矩阵未提供，角色未授予细粒度权限。运行 ID：`PLM2-202611200315-fb906044`。 |

## 代码和文档

- Gateway Redis 连接参数及 Lettuce 池配置：`plm-backend/plm-gateway/src/main/resources/application.yml`
- 版本化构建入口：`scripts/build-versioned.sh`；后端 Maven build-info 与前端 Vite metadata 由同一 Git commit/build timestamp 注入。
- Lettuce 自动重连及退避配置：`plm-backend/plm-gateway/src/main/java/com/huaweicloud/plm/gateway/config/RedisClientConfig.java`
- Redis 故障隔离、本地限流窗口和恢复处理：`plm-backend/plm-gateway/src/main/java/com/huaweicloud/plm/gateway/filter/RateLimitFilter.java`
- 持久化 Redis 生命周期脚本：`scripts/test-redis.sh`；本地开发启动器不再创建无持久化 Redis。
- 本机 H2 管理员轮换：`scripts/bootstrap-dev-admin.mjs`；账号、组织与角色通过 `tests/seed/provision-dev.mjs` 所用系统 API 创建。修正 JSON 长整型 ID 解码，避免 Java `Long` 被 Node.js `Number` 精度舍入。
- 启动说明及 loopback/H2 初始化步骤：[README](../README.md)和[运维手册](../docs/运维手册.md)。

## 验证结果与边界

- `mvn -f plm-backend/pom.xml -pl plm-gateway,plm-system -am '-Dtest=JwtAuthenticationFilterTest,AuthControllerIntegrationTest' -Dsurefire.failIfNoSpecifiedTests=false test`：BUILD SUCCESS，Gateway JWT 4 项、system 集成 5 项测试通过。覆盖 Gateway allowlist、短密钥、格式错误/过期/错误签名及有效令牌身份和角色透传；system 刷新请求的空值/格式错误/访问令牌类型拒绝、有效刷新令牌签发、登出认证及 Actuator/docs/H2 console 访问控制。既有 `RateLimitFilterTest` 另覆盖 Redis 降级、恢复及下游失败隔离 3 项。
- `BUILD_TIME=2026-11-20T03:30:00Z bash scripts/build-versioned.sh`（Java 17）：后端 Gateway/system 打包测试通过、前端 TypeScript 与生产构建成功；两个后端 `META-INF/build-info.properties` 均包含非空 application name、version、build time、commit，前端 bundle 已包含构建版本数据。此次工作区未提交，正确显示 `-dirty`。
- 打包后的 system JAR 在独立 `127.0.0.1:18082`、隔离 H2 上启动成功；`/actuator/info` 实际返回 `build.application.name`、`build.version`、`build.time` 和 `build.git.commit`，核验后已停止该临时进程，现存 8082 服务未受影响。
- 前端 ESLint 9 flat-config：`npm --prefix plm-frontend run lint` 成功，0 warnings/errors；`npm --prefix plm-frontend run build` 成功（Vite 提示既有 vendor/antd circular chunk warning，未作为本任务改动范围）。
- 持久化 Redis 验证：受认证的写入成功；停止并重启后数据仍可读；测试键已删除，Redis 已停止。
- `bash -n scripts/start-dev.sh scripts/test-redis.sh`、`git diff --check`、测试目标白名单验证通过。
- 本机配置文件 `.env.local` 权限为 `0600` 且被 Git 忽略；包含管理员、测试账号及 JWT 随机凭据，不在报告中记录其值。H2 health 曾核验为 `UP`/`H2`，数据 provisioning 仅通过 `localhost:8082` API 完成。
- 本轮账号登录验证不等于岗位权限、工作分离或业务闭环验收；S02–S20、角色细粒度授权矩阵及业务数据流程仍 BLOCKED。H2 为内存库，进程停止后本轮数据丢失。
- 当前本机运行中的 Gateway 不是由本轮构建启动；没有停止、替换或重启它。新 Redis 配置需要在 Gateway 正常重启后才能对现有运行进程生效。
- system/Gateway 当前运行进程亦未按本轮 JWT key 与访问控制源码配置重启；不要将源码测试结果误认为运行中实例已完成安全切换。只读数据库凭据未提供。

## 下一步

1. 在可丢弃的隔离 H2 测试窗口按 `.env.local` 启动新 system/Gateway；重启会清空已创建的测试数据，需重跑 bootstrap/seed，再验证配置生效。确认新 Gateway 连接持久化 Redis后，补齐 Redis 中断/恢复和 health 的端到端证据。
2. 继续 PLM3-013–018 的运行时切换与验收；明确登出仍不撤销已签发 JWT，若 WBS 验收要求强制失效，再实现 Redis 黑名单或等效方案并补充跨实例验证。并完成未覆盖的通用生产数据库隔离审计。
3. 业务负责人提供角色-权限矩阵后，再做权限配置、工作分离及 S02–S20/九个分支业务验证；当前登录验证不可替代这些验收。
