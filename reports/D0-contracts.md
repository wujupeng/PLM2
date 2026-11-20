# D0-02 前后端 API 契约静态对照

## 盘点范围

- 日期：2026-11-20
- 后端范围：`plm-system` 下 533 个 `*Controller.java` 文件及 Spring MVC 方法映射。
- 前端范围：`plm-frontend/src/services/` 下 89 个 TypeScript 服务文件。
- 方法与路径抽取：读取 Spring Controller 类级/方法级映射和前端 request 配置；前端默认 `/api` 前缀剥离后与后端路径比较；模板路径变量归一为 `{}`；按 HTTP method + URL path 精确匹配。
- 本次是**静态路径级检查**，未调用业务写接口，未比较请求/响应 DTO 字段、鉴权策略、状态机、副作用或数据库行为。Gateway 当前无响应，不能进行经网关动态契约验证。

## 汇总

| 类别 | 数量 | 说明 |
|---|---:|---|
| 后端 Controller 文件 | 533 | `plm-system` |
| 后端方法映射 | 3,244 | 按 HTTP method + path 计 |
| 前端服务文件 | 89 | `src/services/` |
| 前端服务请求 | 3,229 | 按 method/url 调用计 |
| 前后端路径匹配（修复后） | 3,229 | method、路径及归一化变量均匹配 |
| 前端调用未匹配后端（修复前） | 1 | 业务规则试算 URL 已调整为 `/platform/biz-rule/rules/evaluate` |
| 后端映射未匹配前端服务（修复后） | 15 | 另 15 条静态未匹配端点见下表；不等于已证明无外部消费者 |

## 前端调用未匹配后端

| 前端调用 | 对应后端检查 | 判断 |
|---|---|---|
| `POST /platform/biz-rule/evaluate`（修复前；[bizRuleService.ts](../plm-frontend/src/services/bizRuleService.ts#L31)） | [SysBizRuleController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/SysBizRuleController.java#L30) 的基路径为 `/platform/biz-rule/rules`，求值方法映射为 `POST /evaluate`（最终路径 `/platform/biz-rule/rules/evaluate`） | 已将前端 URL 修正为 `/platform/biz-rule/rules/evaluate`。由于 Gateway 当前无响应，修复仅完成静态契约对齐；HTTP 集成行为待环境恢复后验证。 |

## 后端映射未匹配前端服务

以下路由在当前 `src/services/` 静态调用中没有找到相同 HTTP method + path。它们不一定完全无消费者（可能由其他代码或外部系统调用），应结合页面/外部集成实际使用情况确认后再决定新增服务、保留或下线。

| 方法 | 后端映射 | Controller |
|---|---|---|
| GET | `/bom/boms/{id}/where-used` | [BomController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/BomController.java#L79) |
| GET | `/oa/address-book/orgs` | [OaAddressBookController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/OaAddressBookController.java#L34) |
| GET | `/oa/albums/{id}` | [OaAlbumController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/OaAlbumController.java#L41) |
| GET | `/oa/collab-tasks/{id}` | [OaCollabTaskController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/OaCollabTaskController.java#L38) |
| GET | `/oa/meeting-bookings/{id}` | [OaMeetingBookingController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/OaMeetingBookingController.java#L38) |
| GET | `/oa/meeting-rooms/{id}` | [OaMeetingRoomController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/OaMeetingRoomController.java#L46) |
| GET | `/oa/schedules/{id}` | [OaScheduleController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/OaScheduleController.java#L38) |
| GET | `/oa/system/log-center/sessions/{id}` | [OaLogCenterController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/OaLogCenterController.java#L98) |
| GET | `/oa/work-reports/{id}` | [OaWorkReportController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/OaWorkReportController.java#L38) |
| POST | `/edi/dispatches/dispatch` | [EdiDispatchController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/EdiDispatchController.java#L49) |
| POST | `/label/barcode/matrix/batch` | [BarcodeController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/BarcodeController.java#L64) |
| POST | `/oa/sso-clients/token` | [SsoClientController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/SsoClientController.java#L60) |
| POST | `/platform/biz-rule/rules/evaluate` | [SysBizRuleController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/SysBizRuleController.java#L49) |
| PUT | `/oa/albums/{id}/archive` | [OaAlbumController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/OaAlbumController.java#L74) |
| PUT | `/oa/albums/{id}/publish` | [OaAlbumController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/OaAlbumController.java#L67) |
| PUT | `/oa/schedules/{id}/cancel` | [OaScheduleController.java](../plm-backend/plm-system/src/main/java/com/huaweicloud/plm/system/controller/OaScheduleController.java#L58) |

## D0-02 结论与后续

- 路径级自动对照已完成。修复前 3,228 项匹配；修正业务规则试算前端路径后再次运行对照，实际为 3,229 项匹配、0 项前端调用未匹配、15 项后端映射未在前端 service 找到同路径调用。
- 业务规则试算路径修复仍需在 Gateway/system 可用时补动态集成验证。
- 逐项核实 16 个后端端点是否由页面、后台任务或外部系统消费，不以“服务层未匹配”直接判定废弃。
- 下一轮需补充请求/响应 DTO、权限注解、错误码、分页字段和业务状态契约；并在 Gateway 可用、测试身份和数据就绪后执行动态 smoke。
