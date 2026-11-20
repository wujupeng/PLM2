# D0-07 开发启动脚本与依赖边界评估

## 审查对象

- `scripts/start-dev.sh`
- `scripts/test-redis.sh`
- `scripts/validate-test-targets.mjs`
- `tests/helpers/allowed-target.cjs`
- `test-data/allowed-hosts.json`
- `scripts/bootstrap-dev-admin.mjs`

## 启动行为和保护机制

1. `start-dev.sh` 先运行测试目标白名单检查，只接受配置内的 HTTP loopback origin（3000、8080、8082）。
2. Redis 被限制在 `127.0.0.1` 或 `localhost`，默认端口 6381；启动前拒绝使用/替换非本脚本管理的占用端口。
3. `test-redis.sh` 在仓库 `.local/redis-test/` 维护认证文件、配置、RDB/AOF 和日志；目录/凭据文件权限受限，密码由 OpenSSL 随机生成且 Git 忽略。
4. `start-dev.sh` 会复用已健康的 system、Gateway、frontend；端口已占用但健康检查失败时拒绝替换。新启动的后端使用 `SPRING_PROFILES_ACTIVE=dev`，通过 Maven 在后台运行；前端绑定 `127.0.0.1`。
5. 管理员初始化脚本另行要求显式的 `PLM_TEST_BOOTSTRAP_CONFIRM=isolated-dev-h2`、确认 system health 为 UP 且数据库为 H2，并拒绝写入非 `localhost:8082` 目标。

## 依赖与边界

- 最小开发运行依赖：Java 17/Maven（system/Gateway 未运行时）、Node/npm、curl、nc、Redis server/redis-cli 和 OpenSSL；后端 Gateway 还依赖可用 Redis。
- dev profile 的 system 使用内存 H2。启动器不建立 PostgreSQL、测试只读账号、备份恢复、外部 Nacos 服务发现或生产等价数据环境；不满足 WBS 持久化业务验收条件。
- `validate-test-targets.mjs` 限制 HTTP service origin，不验证 JDBC URL/数据库名称/数据库账号。Redis host 限制也不等价于完整测试数据环境隔离；PLM3-006 所要求的通用生产数据库拒绝策略仍未完成。
- 启动器启动后台 Maven/frontend 进程，没有统一的 PID 生命周期管理和失败回滚；若后续依赖未能就绪，已成功启动的 Redis/服务可能留在本机运行。停服应逐项确认由本脚本管理，不可按端口盲目杀进程。

## 执行决定与验证

- 未运行 `start-dev.sh`：当前已有 `127.0.0.1:8082` 的 system 进程使用内存 H2；执行启动链会持久化创建/启动本机 Redis，并可能启动 Gateway/frontend 后台进程。为避免给共享开发机增加常驻进程或影响现有 H2 会话，本次仅做静态审查。
- 本次没有重启/停止现有 system，没有启动/停止 Redis、Gateway 或前端，没有访问生产或外部主机。
- 静态审查不能证明整条启动链可运行，故 D0-07 为**部分完成/需隔离窗口动态验证**。动态验收需在专用测试环境、明确允许启动和停止的窗口中执行，并确认启动/失败清理行为、health、持久化数据边界。
