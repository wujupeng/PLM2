# 缺陷与测试阻塞报告

## BUG-001

- **严重度：阻塞**
- **模块：** 前端质量门禁
- **关联用例：** P1 / L0 lint
- **复现步骤：** 在 `plm-frontend/` 执行 `npm run lint`。
- **预期 / 实际：** 预期 ESLint 检查源码；实际 ESLint 9.39.4 报错找不到 `eslint.config.(js|mjs|cjs)` 并退出码 2。
- **证据：** 最终运行 `PLM2-20261120-085329-89211` 的 `frontend-lint.log`；`package.json` 调用 ESLint 9，仓库缺少 flat config。
- **状态：** 未解决。没有添加空规则配置或绕过 lint。
- **疑似位置：** `plm-frontend/package.json`；尚无 ESLint flat config 文件。

## BUG-002

- **严重度：严重**
- **模块：** 前端依赖
- **关联用例：** P1 / L0 依赖审计、任务书 §15 CI 门禁
- **复现步骤：** 在 `plm-frontend/` 执行 `npm audit --audit-level=moderate`。
- **预期 / 实际：** 预期依赖树无未评估高危公告；实际审计报告 13 项（4 high、9 moderate、0 critical），涉及 `@ant-design/pro-components`、`vite`、`react-router-dom` 等直接/传递依赖。
- **证据：** 2026-11-20 本机 `npm audit` 输出。
- **状态：** 未解决。本轮未自动执行可能引入主要版本变更的升级；需产品兼容评估后单独修复。
- **疑似位置：** `plm-frontend/package.json`、`plm-frontend/package-lock.json`。

## ENV-001（测试环境观察，已由启动脚本规避）

- **严重度：一般**
- **模块：** API 网关 / Redis
- **关联用例：** P0 健康检查、`scripts/start-dev.sh`
- **现象：** 开始盘点时 8080 网关进程在监听但 health 为 HTTP 503 / DOWN；本机 Redis 6379 未监听。
- **处置与复测：** 启动脚本现在仅在 Redis 未运行时启动 loopback、禁用持久化的临时 Redis。最终运行三个服务 health 均为 ready；脚本不会杀掉/替换已运行的进程。
- **状态：** 测试运行时已规避；不代表生产 Redis/高可用配置已验收。测试后临时 Redis 已停止；后续本机测试再次运行启动脚本会重新提供临时 Redis。

## 其他

除上述质量门禁与依赖审计外，没有在真实业务流程中确认应用业务缺陷；原因是 S01 测试数据 provisioning 未完成，后续业务步骤 BLOCKED，不能将“未测”归为无缺陷。

## 第二轮实测观察

### ROUND2-ENV-001：API 网关健康状态 DOWN

- **严重度：阻塞测试环境**
- **证据：** 2026-11-20 第二轮白名单探测，`GET http://localhost:8080/actuator/health` 返回 HTTP 503，响应 `{"status":"DOWN"}`；同轮 system health 为 HTTP 200/UP。
- **影响：** 登录、角色 API 和业务接口不能按任务书验收；健康组件细节不可匿名读取。
- **初步线索：** Gateway 配置 Redis 为 `localhost:6379`，本机无监听进程；限流 filter 有 Redis 故障降级逻辑，不能据此认定唯一根因。见 [P0 环境发现](./10-env-discovery.md)。
- **受控验证：** 用户授权启动无持久化 loopback Redis 后，Gateway health 从 HTTP 503 恢复到 200；停止该 PID 后再次变为 503。Gateway 没有重启，Redis 当前已停止。
- **状态：** 已确认 Gateway 健康检查依赖 Redis 可用；测试环境在 Redis 关闭时仍 DOWN。没有替换既有服务。

### ROUND2-SEC-001：Actuator/OpenAPI 在测试主机 loopback 未认证可读

- **严重度：待环境负责人确认（潜在中风险）**
- **证据：** system 与 gateway 的 `/actuator` 返回 HTTP 200；system Swagger UI 和 `/v3/api-docs` 返回 HTTP 200。system OpenAPI 响应大小 2,633,853 字节。进程监听 `*:3000`、`*:8080`、`*:8082`。
- **边界：** 仅从 `localhost` 探测，没有验证其他网卡、防火墙或公网访问；不能断言外部暴露。Gateway 对应 Swagger UI/OpenAPI 路径返回 404。
- **建议：** 环境负责人确认测试网络隔离策略；非必要时限制 Actuator/Swagger 仅本机或授权网段访问。不要在未授权情况下从其他网络探测。
- **状态：** 观察项，待确认；本轮未更改服务绑定或安全配置。

### ROUND2-SEC-002：Gateway 默认 JWT 签名密钥硬编码

- **严重度：高（运行时覆盖情况待确认）**
- **证据：** [Gateway application.yml](../plm-backend/plm-gateway/src/main/resources/application.yml#L215) 将 `plm.jwt.secret` 配成源码字面量；[JwtAuthenticationFilter](../plm-backend/plm-gateway/src/main/java/com/huaweicloud/plm/gateway/filter/JwtAuthenticationFilter.java#L37) 直接读取该属性用于签名密钥。仓库中未发现 Gateway 专用 profile 配置文件；进程环境是否覆盖该属性未检查。
- **影响：** 若部署没有显式覆盖默认值，JWT 信任边界依赖于仓库内可见的固定密钥。
- **处置建议：** 通过部署密钥管理注入高熵密钥，轮换任何可能被使用的现有密钥，并评估使旧令牌失效。
- **边界：** 未尝试生成/伪造令牌；未复制密钥值到报告；运行时最终取值尚未确认。
