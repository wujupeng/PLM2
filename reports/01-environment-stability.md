# D1 本机环境稳定性与 Redis/Gateway 验证

## 执行范围

- 日期：2026-11-20（UTC+08:00）
- 范围：仅本机 loopback 开发环境；未探测外部网络或生产环境。
- 未重启 system `8082`，以保留其内存 H2 数据；经用户授权重启 Gateway `8080`。
- 启动由仓库脚本管理的测试 Redis `127.0.0.1:6381`；未接管或修改其他 Redis 服务。

## 问题与修复

1. 起始时 Redis 未运行，Gateway health 为 HTTP 503/DOWN。
2. Redis 启动后旧 Gateway 未自动恢复连接；用户授权重启 Gateway 后，首次启动因两项源码问题失败：
   - `scripts/start-dev.sh` 对 Maven 聚合根执行 `spring-boot:run`，插件找不到 main class。
   - Gateway `application.yml` 中 Actuator `exposure.include` 缩进错误，导致 `WebEndpointProperties` 绑定失败。
3. 已将启动器改为按目标模块执行 `mvn -pl <module> -am package` 后运行可执行 JAR，并修正 Gateway YAML 缩进。
4. 再次运行启动器成功：system 和前端均复用现存健康进程，Gateway 按模块构建并启动；Gateway health HTTP 200/UP。

## Redis/Gateway 故障与恢复验证

| 场景 | 操作/检查 | 结果 |
|---|---|---|
| Redis 正常 | `scripts/test-redis.sh status`；读取 Gateway health | Redis 认证通过，Gateway HTTP 200/UP |
| Redis 停止 | 仅通过仓库脚本停止其管理的 Redis；读取 Gateway health | HTTP 503，health `DOWN` |
| Redis 停止时请求 | 对 `/api/auth/me` 发出单次匿名只读 GET | HTTP 401；网关仍响应，认证守卫工作（未把此结果当业务授权通过） |
| Redis 恢复 | 用脚本启动同一 loopback Redis，不重启 Gateway | Gateway 自动恢复为 HTTP 200/UP |
| 限流降级单测 | `RateLimitFilterTest` | 3/3 通过，覆盖 Redis 故障降级、恢复后使用 Redis、下游异常不误判为 Redis 故障 |
| Gateway JWT 单测 | `JwtAuthenticationFilterTest` | 4/4 通过 |
| 持久化 | 脚本认证写入、停止/重启后读回的既有验证 | 已有本机证据；测试数据、Redis 配置和密码均在 Git 忽略目录 |

本次真实故障窗口中，Gateway 的健康状态随 Redis 停止/恢复变化；Redis 恢复后无需重启 Gateway 即恢复 UP。Redis 不可用期间仍能得到认证层 401，而非连接堆栈或进程退出。

## 当前状态与边界

- Redis 为本机 loopback 持久化测试实例；此验证不证明共享测试环境、高可用 Redis 或生产容量。
- Gateway 的本地降级单测通过；本次 live outage 请求只验证匿名认证守卫响应，不等于对限流阈值、吞吐或所有路由的故障注入验收。
- 当前 `system` 仍使用 dev 内存 H2；未重启 system，且没有 PostgreSQL 测试服务。D1-02 持久化、备份恢复仍 BLOCKED。
- 六条 `lb://` 服务发现目标仍无本仓库模块/可用注册证据，D1-01 全部业务路由可达仍 BLOCKED。
- 一键启动脚本能启动/reuse 当前三个本机进程，但无统一 PID 生命周期/失败回滚；D1-16 的重启续传与事件恢复仍未验收。
- 本次处理细节已更新到[缺陷报告](./defects.md)，脚本和配置变更已提交并推送。

## D1-03 判定

本机范围内 Redis 启动/持久化、Gateway 降级、health 指示及 Redis 恢复均已实测，且 Gateway Redis/JWT 7 项定向单测通过；D1-03 记为**本机验证通过，非生产/共享测试环境验收**。D1-01、D1-02、D1-16 仍各自按上述证据保持部分/阻塞状态。
