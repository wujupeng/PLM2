# 第二轮 P0 环境发现

- 运行：PLM2-DEEP-20261120020412-25171
- 目标：隔离 localhost 测试环境；允许 origin 严格来自 [allowed-hosts.json](../test-data/allowed-hosts.json)。
- 用户给定前端入口：`http://localhost:3000/dashboard`；本次只读取 SPA、健康/版本和公开 API 文档入口，不登录、不写数据、不重启服务。
- 数据库：源码开发配置声明 H2 内存库（`DB_CLOSE_DELAY=-1`，仅进程生命周期内保持）；本轮未取得只读数据库账号，运行时表数及 Flyway 当前版本未做 SQL 核验。
- Flyway：源码迁移最高版本 V172；运行库当前迁移版本及实际表数未通过只读 SQL 核验。Node/Java/Maven 命令行版本及 Docker/systemctl 可用性见证据 JSON 的 `runtime` 字段；Maven 版本探测因 `JAVA_HOME` 配置不正确而失败，不能据此比较部署构建版本。
- 注册中心目标：网关源码含 `lb://plm-manufacturing`、`plm-integration`、`plm-auth-workflow`、`plm-admin`、`plm-notification`、`plm-search`；本机无注册中心访问配置，实例在线状态未验证。当前聚合工程不包含这些服务模块。
- 管理员：没有从开发记录取得管理员凭据；未尝试猜测/默认密码。登录及角色菜单验证阻塞。
- 中间件：未发现本地 Redis :6379 监听进程；本次发现阶段未启动 Redis、消息队列或其他服务。消息队列、附件存储、邮件/短信配置和生产版本无法仅凭本地进程清单确认。
- 本机三个服务端口均由通配地址监听（`*:3000`、`*:8080`、`*:8082`）；本轮只连 loopback，未验证局域网/公网可达性或防火墙策略。

## 监听服务与进程

| 进程 | PID | 监听地址 | 启动时间/命令 |
|---|---:|---|---|
| node | 6820 | *:3000 (LISTEN) | Thu Nov 19 13:20:03 2026     node $HOME/dev/PLM2/plm-frontend/node_modules/.bin/vite --host 0.0.0.0 |
| java | 9413 | *:8082 (LISTEN) | Thu Nov 19 13:22:11 2026     /usr/bin/java -jar target/plm-system-1.0.0-SNAPSHOT.jar |
| java | 10941 | *:8080 (LISTEN) | Thu Nov 19 13:23:02 2026     /usr/bin/java -jar target/plm-gateway-1.0.0-SNAPSHOT.jar |

ss、docker 和 systemd 清单工具在当前 macOS 环境不可用；使用 `lsof` 与 `ps` 记录进程。命令版本/可用性见同目录的 `evidence/PLM2-DEEP-20261120020412-25171/environment.json`。

## 网关服务发现目标

| lb:// 目标 | 聚合工程含对应模块 | 注册实例状态 |
|---|---|---|
| plm-manufacturing | 否 | 未验证（本机无注册中心访问配置） |
| plm-integration | 否 | 未验证（本机无注册中心访问配置） |
| plm-auth-workflow | 否 | 未验证（本机无注册中心访问配置） |
| plm-admin | 否 | 未验证（本机无注册中心访问配置） |
| plm-notification | 否 | 未验证（本机无注册中心访问配置） |
| plm-search | 否 | 未验证（本机无注册中心访问配置） |

“聚合工程不含”仅是本仓库构建范围，不代表部署环境不存在实例；未拿到服务注册中心凭据或访问地址，所以不将它们误记为离线。

## HTTP 只读探测

| 探测 | URL | HTTP | 耗时(ms) | 响应字节 | 结果摘要 |
|---|---|---:|---:|---:|---|
| system-health | http://localhost:8082/actuator/health | 200 | 94 | 304 | {"status":"UP","components":{"db":{"status":"UP","details":{"database":"H2","validationQuery":"isValid()"}},"diskSpace":{"status":"UP","details":{"total":1000240963584,"free":348214898688,"threshold":10485760,"path":"$HOME/dev/PLM2/plm-backend/plm-system/.","exists":true}},"ping":{"status":"UP"}}} |
| gateway-health | http://localhost:8080/actuator/health | 503 | 3036 | 17 | {"status":"DOWN"} |
| system-info | http://localhost:8082/actuator/info | 200 | 4 | 2 | {"keys":[]} |
| gateway-info | http://localhost:8080/actuator/info | 200 | 4 | 2 | {"keys":[]} |
| system-actuator-root | http://localhost:8082/actuator | 200 | 3 | 315 | Response received; body not retained |
| gateway-actuator-root | http://localhost:8080/actuator | 200 | 5 | 315 | Response received; body not retained |
| system-swagger-ui | http://localhost:8082/swagger-ui/index.html | 200 | 7 | 734 | Response received; body not retained |
| system-openapi-docs | http://localhost:8082/v3/api-docs | 200 | 94 | 2633853 | Response received; body not retained |
| gateway-swagger-ui | http://localhost:8080/swagger-ui/index.html | 404 | 5 | 137 | Response received; body not retained |
| gateway-openapi-docs | http://localhost:8080/v3/api-docs | 404 | 6 | 127 | Response received; body not retained |
| frontend-root | http://localhost:3000/ | 200 | 3 | 1114 | Chinese SPA shell |
| frontend-dashboard | http://localhost:3000/dashboard | 200 | 4 | 1114 | Chinese SPA shell |

所有 HTTP 访问均为健康、版本、Actuator 根索引、Swagger/OpenAPI 暴露面和 SPA shell 的只读 GET；没有调用业务 API。Actuator 版本端点不可用时，不以源码版本代替部署版本；当前无镜像标签/部署包提交号可比对。

## A1 静态接口对照（候选，不是功能通过）

Controller 方法映射与前端 service literal URL 对照如下。路径/方法匹配只代表源码候选关系，不能证明目标服务在线、请求成功、返回非桩数据或业务可用。

| 业务域 | Controller 路由 | GET 路由 | 前端调用 | 静态匹配 | 前端无后端静态匹配 | 后端无前端静态匹配 |
|---|---:|---:|---:|---:|---:|---:|
| ERP | 322 | 118 | 322 | 322 | 0 | 0 |
| ERP Purchase | 54 | 18 | 54 | 54 | 0 | 0 |
| ERP Sales | 51 | 18 | 51 | 51 | 0 | 0 |
| Integration | 561 | 226 | 560 | 560 | 0 | 1 |
| MES | 205 | 82 | 205 | 205 | 0 | 0 |
| Manufacturing | 60 | 27 | 60 | 60 | 0 | 0 |
| Migration | 154 | 61 | 154 | 154 | 0 | 0 |
| OA | 660 | 258 | 648 | 648 | 0 | 12 |
| PLM | 215 | 93 | 213 | 213 | 0 | 2 |
| Platform | 582 | 220 | 582 | 581 | 1 | 1 |
| Quality | 29 | 11 | 29 | 29 | 0 | 0 |
| SRM | 145 | 58 | 145 | 145 | 0 | 0 |
| WMS | 206 | 84 | 206 | 206 | 0 | 0 |

- 详细清单：[Controller 端点](./11-endpoints.csv)、[前端调用](./12-frontend-calls.csv)。
- [在线 GET 探测](./13-endpoint-probe.csv) 中所有业务接口均为 BLOCKED；没有管理员凭据和有效记录 ID，因此没有请求业务 API。
- 静态解析结果不覆盖动态拼接 URL、Gateway 转换、服务发现在线性等运行行为；匹配结果不能提升至 L2。
- [成熟度矩阵](./15-maturity-matrix.md)按证据门槛将所有静态候选点列为未评级，没有用代码数量虚报业务成熟度。

## P0 结论与阻塞

- 当前运行基线仅能识别本机监听进程；不能代表外部测试机/生产部署。
- H2 内存库意味着重启持久性和跨进程数据对账无法通过本轮只读探测判定；本轮未重启。
- 注册中心、最近错误日志、数据库元数据/只读账号及部署 commit 均未取证。
- P1 数据创建、A2 在线业务接口探测、A3 页面遍历、A4/A5、闭环与强度测试均 BLOCKED：缺少管理员/业务角色账号、只读数据库凭据和业务授权。只能在本地 `.env.local` 配置凭据后再继续，并保持白名单限制。
