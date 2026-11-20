# 第三轮开发进度

## 执行基线

- 日期：2026-11-20（UTC+08:00）
- 基线提交：`835ab22`（`main`）
- 依据：[第三轮详细开发计划与 WBS](../PLM2_第三轮详细开发计划_WBS任务明细.xlsx)及[第二轮实测成熟度报告](./99-final-report-v2.md)。
- 修改范围：覆盖 Gateway/本机 Redis 稳定性、JWT 与管理端点安全基线、本机 H2 测试账号初始化；未改写用户提供的 WBS 工作簿或第二轮历史测试结果。
- 测试目标限制：本地 Redis 固定绑定 loopback；未探测外网、未连接生产或未知 Redis。

## WBS 任务状态

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
| PLM3-013–018 JWT/Actuator/API 文档基线 | 源码配置与测试完成，现有进程切换待做 | 移除源码 JWT 默认密钥，要求注入至少 32 UTF-8 字节的 `PLM_JWT_SECRET`；Actuator 限制为 health/info 且健康详情仅授权可见；Swagger/OpenAPI 默认关闭；Gateway 与 system 过滤器不再匿名放行 Actuator 索引、敏感端点、文档或 H2 console。 |
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

- `mvn -f plm-backend/pom.xml -pl plm-gateway -am test`：BUILD SUCCESS，5 项 Gateway 单元测试通过（JWT allowlist/key 长度 2 项；Redis 降级、恢复及下游失败隔离 3 项）。
- `mvn -f plm-backend/pom.xml -pl plm-system -am test`：BUILD SUCCESS，4 项 system `AuthControllerIntegrationTest` 通过，覆盖登录校验和 Actuator/docs/H2 console 访问控制。
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
2. 继续 PLM3-011 版本元数据及未完成的通用生产数据库隔离审计。
3. 业务负责人提供角色-权限矩阵后，再做权限配置、工作分离及 S02–S20/九个分支业务验证；当前登录验证不可替代这些验收。
