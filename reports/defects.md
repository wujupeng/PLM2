# 缺陷与测试阻塞报告

## BUG-001

- **严重度：阻塞**
- **模块：** 前端质量门禁
- **关联用例：** P1 / L0 lint
- **复现步骤：** 在 `plm-frontend/` 执行 `npm run lint`。
- **预期 / 实际：** 预期 ESLint 检查源码；实际 ESLint 9.39.4 报错找不到 `eslint.config.(js|mjs|cjs)` 并退出码 2。
- **证据：** 最终运行 `PLM2-20261120-085329-89211` 的 `frontend-lint.log`；`package.json` 调用 ESLint 9，仓库缺少 flat config。
- **处置：** 新增 `plm-frontend/eslint.config.js`，启用 TypeScript 推荐规则、React Hooks 和 Fast Refresh 检查；将共享 UI helper 模块明确排除在 Fast Refresh 边界规则之外。修复维修表单未使用参数和 relabel 页面失效的 disable 指令。
- **复测：** `npm --prefix plm-frontend run lint` 通过，0 warnings、0 errors；随后 `npm --prefix plm-frontend run build` 成功。
- **状态：** 已解决（2026-11-20）；依赖审计 BUG-002 仍独立未解决。

## BUG-002

- **严重度：严重**
- **模块：** 前端依赖
- **关联用例：** P1 / L0 依赖审计、任务书 §15 CI 门禁
- **复现步骤：** 在 `plm-frontend/` 执行 `npm audit --audit-level=moderate`。
- **预期 / 实际：** 预期依赖树无未评估高危公告；实际审计报告 13 项（4 high、9 moderate、0 critical），涉及 `@ant-design/pro-components`、`vite`、`react-router-dom` 等直接/传递依赖。
- **证据：** 2026-11-20 本机 `npm audit` 输出。
- **状态：** 未解决。本轮未自动执行可能引入主要版本变更的升级；需产品兼容评估后单独修复。
- **疑似位置：** `plm-frontend/package.json`、`plm-frontend/package-lock.json`。

## ENV-001（第二轮测试环境观察，已补齐持久化 Redis 配置）

- **严重度：一般**
- **模块：** API 网关 / Redis
- **关联用例：** P0 健康检查、`scripts/start-dev.sh`
- **现象：** 开始盘点时 8080 网关进程在监听但 health 为 HTTP 503 / DOWN；本机 Redis 6379 未监听。
- **处置与复测：** 第三轮已将启动方式改为经认证、启用 RDB/AOF 的独立 loopback Redis（默认 6381），并将 Gateway 配置外置。持久化停止/重启验证通过；Gateway 本轮未重启。
- **状态：** 配置和脚本已实现；Gateway 新配置下的 live health/故障恢复待经维护窗口启动后复测。生产 Redis/高可用未验收。

## 其他

本机 AF1000 真实 API 测试已开始；新增的接口缺陷和环境/权限阻塞见下列记录。主场景尚未完成，不将未执行用例判为通过或无缺陷。详细执行证据见[AF1000 本机真实 API 测试记录](./02-af1000-live-api-test.md)。

## 2026-11-20 本机管理员登录故障复测

- **现象：** 本机登录页填写 `admin` / `admin123` 无法登录。
- **凭据原因：** 当前 dev H2 的 `admin` 初始密码已由隔离初始化工具轮换；`PLM_PROVISIONER_PASSWORD` 保存在 Git 忽略、权限为 `0600` 的 `.env.local`。系统 API 使用该本地值认证成功；`admin123` 对当前账号返回应用层 401。没有修改或重置账号密码。
- **网关原因：** 登录页 `/api` 请求经 Vite 代理到 Gateway 8080。初始 Gateway health 为 503/DOWN，Redis 6381 未运行。启动隔离 loopback Redis 后，旧 Gateway 仍未恢复，获用户授权后仅重启 Gateway。
- **启动缺陷及修复：** `scripts/start-dev.sh` 原先对 Maven 聚合根执行 `spring-boot:run`，导致没有 main class；随后发现 Gateway `application.yml` 的 `management.endpoints.web.exposure.include` 缩进错误，阻止 Actuator 配置绑定。启动器现改为按模块打包后运行对应 JAR，并修正 YAML 缩进。
- **复测：** `scripts/start-dev.sh` 重用现存 system（未重启 H2）、确认前端/Redis ready、Gateway health HTTP 200/UP；通过 Gateway `/api/auth/login` 使用 `.env.local` 中本地保存的管理员凭据登录成功，响应账号为 `admin`。token/密码均未输出。H2 数据未清空，账号密码未更改。
- **处理建议：** 使用 `.env.local` 中 `PLM_PROVISIONER_PASSWORD` 对应的本机随机密码；不要恢复到公开/弱密码 `admin123`。该密码不得复制到聊天或提交。

## 第二轮实测观察

### ROUND2-ENV-001：API 网关健康状态 DOWN

- **严重度：阻塞测试环境**
- **证据：** 2026-11-20 第二轮白名单探测，`GET http://localhost:8080/actuator/health` 返回 HTTP 503，响应 `{"status":"DOWN"}`；同轮 system health 为 HTTP 200/UP。
- **影响：** 登录、角色 API 和业务接口不能按任务书验收；健康组件细节不可匿名读取。
- **初步线索：** Gateway 配置 Redis 为 `localhost:6379`，本机无监听进程；限流 filter 有 Redis 故障降级逻辑，不能据此认定唯一根因。见 [P0 环境发现](./10-env-discovery.md)。
- **受控验证：** 用户授权启动无持久化 loopback Redis 后，Gateway health 从 HTTP 503 恢复到 200；停止该 PID 后再次变为 503。Gateway 没有重启，Redis 当前已停止。
- **复测：** 2026-11-20 11:21 的 API smoke 中，Gateway health 再次为 HTTP 503/DOWN；专用 Redis 6381 未运行。匿名认证守卫接口仍返回 401，业务功能不能据此判定可用。
- **状态：** 已确认 Gateway 健康检查依赖 Redis 可用。第三轮代码默认使用 127.0.0.1:6381；目前未替换或重启既有 Gateway 进程，其健康状态需在使用新配置启动后复核。

### ROUND2-SEC-001：Actuator/OpenAPI 在测试主机 loopback 未认证可读

- **严重度：待环境负责人确认（潜在中风险）**
- **证据：** system 与 gateway 的 `/actuator` 返回 HTTP 200；system Swagger UI 和 `/v3/api-docs` 返回 HTTP 200。system OpenAPI 响应大小 2,633,853 字节。进程监听 `*:3000`、`*:8080`、`*:8082`。
- **边界：** 仅从 `localhost` 探测，没有验证其他网卡、防火墙或公网访问；不能断言外部暴露。Gateway 对应 Swagger UI/OpenAPI 路径返回 404。
- **建议：** 环境负责人确认测试网络隔离策略；非必要时限制 Actuator/Swagger 仅本机或授权网段访问。不要在未授权情况下从其他网络探测。
- **状态：** 本轮已将源码配置收紧：system 与 Gateway 仅暴露 health/info，健康详情设为 `when-authorized`，docs 默认关闭，JWT filter 不匿名放行 Actuator 索引/敏感端点、文档及 H2 console。现有服务进程未重启，运行时安全状态仍待维护窗口复测；服务绑定/网络隔离未更改。

### ROUND2-SEC-002：Gateway 默认 JWT 签名密钥硬编码

- **严重度：高（运行时覆盖情况待确认）**
- **证据：** [Gateway application.yml](../plm-backend/plm-gateway/src/main/resources/application.yml#L215) 将 `plm.jwt.secret` 配成源码字面量；[JwtAuthenticationFilter](../plm-backend/plm-gateway/src/main/java/com/huaweicloud/plm/gateway/filter/JwtAuthenticationFilter.java#L37) 直接读取该属性用于签名密钥。仓库中未发现 Gateway 专用 profile 配置文件；进程环境是否覆盖该属性未检查。
- **影响：** 若部署没有显式覆盖默认值，JWT 信任边界依赖于仓库内可见的固定密钥。
- **处置与复测：** 已移除 system/Gateway 源码 JWT 默认值，要求注入至少 32 UTF-8 字节的 `PLM_JWT_SECRET`，并增加 system 集成及 Gateway filter 测试。现有进程未重启，无法确认运行时密钥是否切换；部署仍须通过可信密钥源注入一致密钥，并安排旧令牌失效/重新登录策略。
- **边界：** 未尝试生成/伪造令牌；未复制密钥值到报告；运行时最终取值尚未确认。

### RETEST-SEC-001：正在运行的 system 实例仍可匿名访问管理/调试端点

- **严重度：严重（该进程监听通配地址；其他网卡/网络实际可达性未验证）**
- **关联用例：** 任务书 §5.5 TC-NFR-02、§13.2 安全测试。
- **复测时间与范围：** 2026-11-20 11:22；仅对本机 `127.0.0.1:8082` 发出无凭据 GET；响应体直接丢弃，没有读取或保存端点内容。
- **证据：** `/actuator`、`/actuator/health`、`/actuator/info`、`/actuator/env`、`/doc.html`、`/h2-console/` 均返回 HTTP 200；`/v3/api-docs` 在 5 秒内未取得 HTTP 响应（curl 状态 000）。system health 包含数据库组件细节。当前 system 进程监听 `*:8082`。
- **预期 / 实际：** 本轮源码与集成测试要求管理根路径、env、Swagger 和 H2 console 不可匿名访问；现存运行进程对多项路径仍返回 200。源码整改尚未作用到该进程。
- **影响：** 测试实例可能暴露管理/调试界面及运行环境信息；无法仅凭 loopback 结果断言外部网络可达性。
- **处置：** 不在已有测试数据的 H2 实例上直接重启，避免内存数据丢失。应在维护窗口确认备份/重建计划后，使用新源码、随机 `PLM_JWT_SECRET` 与受限网络配置重启；随后从授权测试客户端复验所有路径均拒绝匿名访问。确认网络隔离策略前不得将该实例用于外部共享。

## 2026-11-20 AF1000 本机真实 API 测试

### LIVE-API-001：新增 BOM 行返回 API 500

- **严重度：阻塞业务闭环**
- **模块：** PLM / BOM
- **复现：** 在 dev H2 创建 `AF1000 / EBOM / V1` 草稿头后，通过 system API `POST /bom/boms/{headerId}/lines` 添加必填字段完整的行；再以仅含父件、子件、用量和单位的请求复现。
- **预期 / 实际：** 预期新增行并可读回；两次均为 HTTP 200、API code 500、“系统内部错误，请联系管理员”。随后回读 BOM，行数为 0。
- **影响：** BOM 校验、展开、发布、MRP 及依赖该 BOM 的销售生产闭环不能继续。未使用导入、SQL 或其他通道绕过。
- **根因 / 状态：** 当前响应未暴露根因；需查看 system 异常堆栈后定位。未解决。

### LIVE-API-002：Gateway 登录签发的 JWT 无法访问受保护 API

- **严重度：阻塞经 Gateway 的真实测试**
- **模块：** Gateway / 统一认证
- **证据：** `POST /api/auth/login` 返回 HTTP/API 200；返回 JWT 的 HS384 签名与本地 Gateway 配置的密钥不匹配。使用该 JWT 调用 `/api/system/organizations/tree` 返回 401；通过 system 直连登录并调用同一受保护 API 则成功。
- **影响：** 前端经 Gateway 登录后无法访问受保护业务接口；直接 system API 验证仅用于本机受控测试，不能作为 Gateway 集成通过证据。
- **状态：** 未解决。需保留 H2 内存数据并核对 system/Gateway 运行时密钥来源；本轮未重启服务。

### LIVE-API-003：业务测试岗位尚无模块权限

- **严重度：阻塞岗位流程测试**
- **模块：** IAM / 测试数据
- **证据：** 已有 14 个测试账号均可登录；工程账号 `qianqi` 的权限列表为空，读取产品、物料和 BOM API 均返回 403。管理员权限为 `*`。
- **影响：** 不能以研发/销售/采购等岗位身份创建或审批业务单据。
- **状态：** 岗位流程仍阻塞，权限矩阵待业务负责人批准；本轮未将候选权限矩阵授予任何岗位角色，也未以管理员账号冒充岗位执行。

### LIVE-API-004：BOM 行故障在专用最高权限账号下仍可复现

- **严重度：阻塞业务闭环**
- **模块：** PLM / BOM
- **证据：** 2026-11-20 14:54 使用本轮新增的内置 `ADMIN` 专用测试账号，经 system API 重试 `POST /bom/boms/{headerId}/lines`；HTTP 200、API code 500，读回 BOM 行数仍为 0。
- **结论：** 已排除普通研发账号缺少权限这一单一原因；尚不能据此判定服务实现根因。运行实例异常堆栈暂不可读取，需在不丢失 H2 数据的前提下取得日志后定位。
- **状态：** 未解决。没有尝试改数据库或通过其他入口绕过。

### LIVE-API-005：为测试授予过宽权限导致 JWT 请求头超过可用限制

- **严重度：测试配置观察，已回滚**
- **模块：** IAM / 测试环境
- **证据：** 将 1,681 项活动权限直接赋给原测试管理员角色并设置全数据范围后，该账号登录 token 过大，system 受保护接口返回无响应体的 HTTP 400。
- **处置：** 已将原测试角色恢复到变更前的 `dataScope=org`、0 权限；原账号关联未改变。另经 system 用户 API 创建隔离账号 `admin_max_11200315fb906044`，只分配内置 `ADMIN` 角色，无需逐项扩展权限。新账号登录含 `ADMIN` 与 `*` 权限声明；JWT 长度 321 字符，组织、产品、物料、BOM读取均返回 HTTP/API 200。
- **影响范围：** 只涉及本机 dev H2；未修改内置 `ADMIN` 角色、其他测试账号权限或应用代码。新建账号为临时全权账号，测试结束应通过系统 API 删除。
