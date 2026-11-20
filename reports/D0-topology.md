# D0-01 服务拓扑盘点

## 盘点范围与证据

- 日期：2026-11-20
- 仓库：PLM2，分支 `main`
- 范围：本地仓库中的 Maven 聚合模块、Gateway 路由与配置，以及仅限已知 loopback 测试端口的只读状态检查。
- 未探测外网、未知主机或生产环境；未启动、停止或修改任何服务。
- 状态检查：`127.0.0.1:3000/` 返回 HTTP 200；`127.0.0.1:8082/actuator/health` 返回 `UP`；`127.0.0.1:8080/actuator/health` 无响应；Redis `127.0.0.1:6381` 和 Nacos 默认端口 `127.0.0.1:8848` 未监听。

## 仓库内服务与聚合工程

根聚合工程为 `plm-backend/pom.xml`，目前只聚合以下三个模块：

| Maven 模块 | 应用/用途 | 本机观察 |
|---|---|---|
| `plm-common` | 共享 API、认证和业务组件库，不是独立运行服务 | 不适用 |
| `plm-gateway` | `plm-gateway`，端口 8080 | 当前 loopback health 请求无响应 |
| `plm-system` | `plm-system`，端口 8082；承载系统、PLM、WMS、制造、集成及 OA 等多组控制器 | health 返回 `UP`；dev 配置使用内存 H2 |

前端独立运行于 3000 端口，根路径返回 HTTP 200。该结果只证明页面入口可响应，不代表登录后业务流程通过。

仓库没有 `plm-manufacturing`、`plm-integration`、`plm-auth-workflow`、`plm-admin`、`plm-notification` 或 `plm-search` 的 Maven 子工程/本地服务目录，也没有根级 Docker Compose 部署清单。

## Gateway 路由

Gateway `application.yml` 中有 23 条路由指向 `${PLM_SYSTEM_URI:http://localhost:8082}`，即部署默认把下列 API 路径转发到同一个 `plm-system` 进程，而不是独立服务：

| 路由 ID | API 路径 |
|---|---|
| `system-auth-service` | `/api/auth/**` |
| `system-service` | `/api/system/**` |
| `product-data-service` | `/api/product-data/**` |
| `bom-service` | `/api/bom/**` |
| `eco-service` | `/api/eco/**` |
| `document-service` | `/api/document/**` |
| `cad-integration-service` | `/api/cad/**` |
| `spec-service` | `/api/spec/**` |
| `harness-service` | `/api/harness/**` |
| `compliance-service` | `/api/compliance/**` |
| `packaging-service` | `/api/packaging/**` |
| `process-service` | `/api/process/**` |
| `inspection-service` | `/api/inspection/**` |
| `quality-service` | `/api/quality/**` |
| `code-service` | `/api/code/**` |
| `relabel-service` | `/api/relabel/**` |
| `label-service` | `/api/label/**` |
| `edi-service` | `/api/edi/**` |
| `wms-service` | `/api/wms/**` |
| `mfg-service` | `/api/mfg/**` |
| `int-service` | `/api/int/**` |
| `migration-service` | `/api/mig/**` |
| `oa-service` | `/api/oa/**` |

另有 6 条服务发现路由：

| 路由 ID | 目标 | 仓库检查 | 运行状态结论 |
|---|---|---|---|
| `manufacturing-service` | `lb://plm-manufacturing` | 本仓库没有对应服务模块 | 未知：没有可用注册中心证据，不能断言远端不存在 |
| `integration-service` | `lb://plm-integration` | 本仓库没有对应服务模块 | 未知：没有可用注册中心证据，不能断言远端不存在 |
| `auth-workflow-service` | `lb://plm-auth-workflow` | 本仓库没有对应服务模块 | 未知：没有可用注册中心证据，不能断言远端不存在 |
| `admin-service` | `lb://plm-admin` | 本仓库没有对应服务模块 | 未知：没有可用注册中心证据，不能断言远端不存在 |
| `notification-service` | `lb://plm-notification` | 本仓库没有对应服务模块 | 未知：没有可用注册中心证据，不能断言远端不存在 |
| `search-service` | `lb://plm-search` | 本仓库没有对应服务模块 | 未知：没有可用注册中心证据，不能断言远端不存在 |

## 服务发现判断与卡点

- Gateway 的 `bootstrap.yml` 写有 Nacos 地址/命名空间默认值，但 `plm-backend` 的 Maven POM 未声明 Nacos、Eureka 或其他注册发现客户端依赖。仅有配置文件不能证明服务注册发现功能已启用。
- 盘点时本机默认 Nacos 端口 8848 未监听；没有对其他主机做探测。因此六个 `lb://` 目标在本仓库中缺少实现，其运行时是在线、离线还是部署在外部环境，当前证据无法判断。
- 本机 Gateway 8080 未响应，Redis 6381 未监听。现阶段不能通过 Gateway 验证六条 `lb://` 路由或完成服务离线时的友好错误验收。
- 当前测试机观察到的 system 8082 运行在 dev 配置，使用内存 H2；这不是可用于持久化业务闭环验收的最终拓扑。

## D0-01 结论

仓库内聚合服务和全部 Gateway 路由已完成静态盘点；六个服务发现目标已确认不在当前聚合工程，运行时注册状态待部署/注册中心信息确认。按验收要求不能把“仓库中无模块”推断为“所有环境均不存在”，因此 D0-01 记为**部分完成/受阻**。

解除阻塞需要确认六个服务是否属于外部服务仓库或本版本范围，并提供测试环境的注册中心/服务清单访问方式；不需要也不应提供生产凭据。
