# PLM2 第二轮实测成熟度报告

## 摘要

- 本次实际执行范围：P0 本机隔离开发/测试实例只读发现、A1 源码接口与前端调用静态对照、白名单拒绝测试。
- 业务数据未创建、未修改、未删除；没有管理员凭据、业务账号或数据库只读凭据。S01 前置失败后，按任务书阻断规则没有执行 P1/A2–A5/P3–P5。
- 服务观察：system health HTTP 200/UP（H2）；Gateway 在 Redis 不可用时 HTTP 503/DOWN；用户同意的临时 loopback Redis 诊断令 Gateway 暂时恢复到 HTTP 200/UP，停止 Redis 后再次 DOWN。Gateway 进程没有重启；最终 Redis 已停止。前端根路径和 `/dashboard` 返回 HTTP 200 SPA 外壳。
- 暴露面观察：两个服务的 `/actuator` 根索引和 system Swagger UI/OpenAPI docs 在 loopback 上无需登录返回 HTTP 200；system OpenAPI 响应 2,633,853 字节。所有进程监听通配地址，但本轮未验证其他网卡/公网可达性，故列为需确认的风险而非已证实外网暴露。
- 安全配置观察：Gateway 默认配置含硬编码 JWT signing key，filter 直接使用该配置；是否被运行环境覆盖未知。没有生成或伪造 JWT，密钥值未写入报告，见[缺陷清单](./defects.md)。
- A1 静态盘点：3,244 个 Controller 路由记录、3,229 个前端 service URL 字面量。静态路径匹配不是在线功能证据。
- 在线管理员 GET 业务探测：1,274 项全部 BLOCKED，未发出管理员业务请求。另有两个匿名认证守卫 GET 纳入 API 冒烟。Playwright 全角色页面遍历未运行；没有 STUB 判定，因为没有做业务输入变异。
- 无凭据认证冒烟：API 7/7 PASS；真实 UI 2 PASS，S01–S20 20 BLOCKED。截图与脱敏请求/响应证据保存在本轮 evidence 目录；两项匿名受保护 API 返回 401。
- 成熟度：**本轮没有业务功能取得 L0–L6 的实测评级**。3,244 个静态路由候选均为未评级；未评级不等于 L0。

## 各业务域成熟度分布

见[成熟度矩阵](./15-maturity-matrix.md)：OA、PLM、ERP/销售、ERP/采购、SRM、WMS、MES、质量、制造、集成、迁移和平台全部为“未评级”。没有把 Controller/service 存在视为 L1 或 L2。

## 闭环断点

- 首个断点：S01（未创建组织/账号）。
- 20 个主链路步骤、9 个分支均 BLOCKED，详情见[闭环结果](./16-closed-loop-v2.md)。
- 分类：测试凭据/测试数据/只读 DB 访问缺失；Gateway 当前因 Redis 停止而 health DOWN，已观察到 Redis 可用时恢复，但没有配置稳定依赖。没有证据支持把业务失败归因为业务规则或假实现。
- 数量、金额、税额、库存、追溯等 5 类守恒均未计算；未把空数据当作通过。

## STUB、权限与对账

- **STUB：未判定**。没有在线业务响应或输入变异证据；静态扫描不能判定写死数据。
- **权限矩阵：未判定**，13 个岗位/对照账号均未登录，见[权限报告](./18-permission-matrix.md)。
- **强度/安全测试：** 并发、幂等、恢复、容量、性能、越权、运行时 JWT、注入/XSS均 BLOCKED；静态发现默认 JWT 密钥配置风险；只读观察了 Actuator 索引、health/info、Swagger/OpenAPI 的未认证响应，见[强度与安全报告](./17-strength-tests.md)。
- 首次 API 证据采集尝试曾因把空 401 响应误当 JSON 导致 2 个采集器用例失败；已改为记录空响应哈希并完整重跑 7/7 PASS。该次失败属于证据采集器问题，不是产品断言失败。

## 结果分类与分母

| 范围 | PASS | FAIL | BLOCKED | STUB | NOT-APPLICABLE | 分母/口径 |
|---|---:|---:|---:|---:|---:|---|
| P0 健康/SPA 检查（无 Redis 基线） | 2 | 1 | 1 | 0 | 0 | 4 项：system health、gateway health、frontend root、dashboard（仅 SPA shell；未完成登录态页面验证，故 BLOCKED）；Gateway 随 Redis 切换另行记录 |
| P0 版本元数据 | 0 | 0 | 2 | 0 | 0 | 2 个 `/actuator/info` 返回 `{}`，没有部署版本信息 |
| P0 暴露面观察 | 不作功能 PASS/FAIL | 0 | 0 | 0 | 0 | 6 项只读观察：Actuator root ×2、Swagger/OpenAPI ×4；状态见 [环境报告](./10-env-discovery.md)，loopback 限定 |
| Gateway Redis 依赖诊断 | 不计功能 PASS/FAIL | 0 | 0 | 0 | 0 | 无 Redis 时 503 → 临时 loopback Redis 时 200 → 停止后 503；无持久化且已清理 |
| API auth smoke | 7 | 0 | 0 | 0 | 0 | 7 项；测试无效/空凭据和匿名保护，不创建用户/业务数据 |
| Playwright 登录 UI | 2 | 0 | 20 | 0 | 0 | 22 项；2 项真实登录界面/错误提示通过，20 个业务步骤阻塞 |
| A1 接口静态对照 | 不计功能 PASS | 0 | 0 | 0 | 0 | 3,244 后端路由记录 + 3,229 前端 URL 字面量；静态证据，不属于运行验收 |
| A2 管理员 GET 业务接口探测 | 0 | 0 | 1,274 | 0 | 0 | 每条静态 GET 路由一行；无管理员凭据，未发送管理员探测。两个匿名保护 GET 另计入 API auth smoke |
| S01–S20 主链路 | 0 | 0 | 20 | 0 | 0 | 20 个步骤 |
| 9 个业务分支 | 0 | 0 | 9 | 0 | 0 | 9 个分支场景 |

## 缺陷、缺口与最短路径

- 环境缺陷：Gateway health 当前 DOWN（HTTP 503）；已确认其健康状态随 Redis 可用性变化，但具体健康组件详情不可见，且稳定 Redis 测试依赖未配置。
- 门禁/依赖问题沿用[缺陷清单](./defects.md)；按闭环阻塞度排序的待办见[缺口清单](./gaps.md)。
- 到达可实测 L2 的最短路径：先为隔离测试环境提供稳定 Redis 并确认 Gateway health 恢复；在本机为 localhost 测试环境配置 `.env.local` 管理员凭据；按系统 API/UI 建立隔离组织/账号；准备数据库只读账号及有效测试数据；然后逐接口探测并执行变化输入对照。只有上述证据齐备，才继续状态机、CRUD、业务闭环和强度测试。

## 证据与复现

- [P0 环境发现](./10-env-discovery.md)
- [后端端点](./11-endpoints.csv) / [前端调用对照](./12-frontend-calls.csv) / [A2 阻断明细](./13-endpoint-probe.csv)
- [页面遍历阻断记录](./14-page-crawl.csv)
- [API 冒烟请求/响应证据](./evidence/PLM2-DEEP-AUTH-20261120T0221/api-smoke.json)、[登录页截图](./evidence/PLM2-DEEP-AUTH-20261120T0221/login-screen.png)、[无效登录提示截图](./evidence/PLM2-DEEP-AUTH-20261120T0221/invalid-login-rejection.png)
- 原始只读探测及运行信息：`evidence/PLM2-DEEP-20261120020412-25171/environment.json`
- Redis 切换诊断与健康响应：`evidence/PLM2-DEEP-20261120020412-25171/gateway-redis-diagnostic.json`
- 重跑白名单内静态盘点与 P0 只读探测：`node scripts/deep-test-scan.mjs`
- 任何目标 URL 都必须命中 `test-data/allowed-hosts.json`；拒绝未列入白名单的地址。脚本没有读取或输出 `.env.local`。

> 第二轮报告保留当时实测基线。后续 WBS 开发状态和持久化 Redis 实施/验证见[第三轮开发进度](./00-development-progress.md)。
