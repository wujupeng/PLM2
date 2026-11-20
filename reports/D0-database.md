# D0-03 数据库与持久化盘点

## 盘点范围

- 日期：2026-11-20
- 服务范围：`plm-system`。
- 迁移范围：`src/main/resources/db/migration/V*__*.sql`。
- 实体范围：`src/main/java` 下显式声明 MyBatis-Plus `@TableName` 的实体。
- 数据库状态检查仅使用已知本机服务 health 和 `127.0.0.1:5432` TCP 可达性；没有尝试使用任何数据库凭据或连接生产环境。

## 数据库配置与运行形态

| 配置/环境 | 证据 | 结论 |
|---|---|---|
| 本地 `dev` | `application-dev.yml` 使用 `jdbc:h2:mem:plm_system`，PostgreSQL 兼容模式 | 内存数据库，服务进程生命周期之外不保证数据保留；不适合作为业务持久化验收环境 |
| `prod` profile | `application-prod.yml` 使用环境变量 `PLM_DB_URL/USERNAME/PASSWORD`，默认 URL 指向 loopback PostgreSQL；Hikari pool；Flyway `clean-disabled: true` | 已有 PostgreSQL 连接配置，但不能据此证明测试机已有数据库或迁移成功 |
| 本机运行实例 | `127.0.0.1:8082/actuator/health` 返回 `UP`，上一轮 health 组件显示 H2 | 当前可观察到的 system 运行实例使用 H2 |
| 本机 PostgreSQL | `127.0.0.1:5432` 和 `5433` 无 TCP listener | 未发现可用的本地 PostgreSQL 测试实例；没有探测其他主机 |

## Flyway 迁移清点

- 共找到 **172 个**版本化迁移文件，版本连续覆盖 `V1` 至 `V172`，没有版本号缺口。
- SQL 静态扫描提取出 **615 个唯一 `CREATE TABLE` 表声明**。
- 当前集成测试 `AuthControllerIntegrationTest.allMigrationsApplyToEmptyH2AndRepeatedMigrationIsIdempotent` 以全新 H2 运行 Flyway，断言迁移版本达到 `172`，再次 migrate 后成功数不增加。此前定向集成测试运行通过。
- 这些证据说明迁移链可在 H2 测试中执行并可重复调用；不等于 PostgreSQL 实库已从空库迁移，也不证明并发、锁、备份恢复和生产数据兼容已验收。

## 表与实体静态对应

- `@TableName` 显式映射实体共 **615 个**，涉及 **615 个唯一表名**。
- 与迁移中的 615 个唯一建表名称进行静态对照：迁移有表但找不到 `@TableName` 的 **0**；实体映射无对应建表 SQL 的 **0**；重复 `@TableName` 映射 **0**。
- 这是注解与 SQL 名称的静态一致性检查，不覆盖动态 SQL、Flowable 自建表、视图/序列、第三方库表、SQL 字符串拼接或业务逻辑是否真正读写这些表。

## 持久化风险与功能缺口

1. **P0：当前 dev 业务数据易因重启丢失。** H2 `mem` 不能作为持久化业务闭环验收基线。
2. **P0：没有可用 PostgreSQL 集成环境。** 本机默认 PostgreSQL 端口未监听，其他测试主机的连接信息和最小权限账号未提供。
3. **P1：PostgreSQL 兼容性尚未验证。** 当前测试主要在 H2 PostgreSQL mode 执行；真实 PostgreSQL 的 SQL 方言、索引约束、锁与 Flyway 行为仍待验证。
4. **P1：备份/恢复与重启保持性尚无有效证据。** 缺少持久化测试库上的备份、恢复、故障恢复、数据对账演练。
5. **盘点限制：** 对 533 个 Controller 的功能逐项追踪 service、mapper、SQL 与表关系尚未完成；因此不能把“615 个实体均有建表”解释为“所有功能都有正确表支撑”。

## D0-03 结论

迁移文件、表声明和显式实体映射的静态对照已完成，且全新 H2 迁移测试证据通过。数据库持久化盘点整体记为**部分完成/受阻**：缺少可用 PostgreSQL 测试实例、运行数据持久化证明及按功能的完整 service/mapper 数据链追踪。

解除阻塞：提供可重建的隔离 PostgreSQL 测试环境与最小权限凭据传递方式（凭据不得放入仓库或报告），执行全量迁移、重启数据保持、备份恢复及关键业务数据核对。
