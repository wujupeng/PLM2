# 第二轮强度与安全测试

本轮只发起 P0 只读观察和少量认证负向冒烟请求；未创建业务单据或发起负载。未加 `--allow-destructive`，没有重启服务、并发压测、导入大数据、上传附件或发送破坏性载荷。

| 类别 | 结果 | 证据/阻塞 |
|---|---|---|
| 并发库存/订单号/审批 | BLOCKED | 无业务账号和种子数据；未执行并发请求 |
| 幂等与重放 | BLOCKED | 无待验证请求/单据及关联审计记录 |
| 事务、崩溃恢复、持久性 | BLOCKED | 未启用破坏性测试；开发配置使用 H2 内存库，不能代表持久化环境 |
| 500 SN / 2,000 库存流水 / 1,000 物料 | BLOCKED | 无管理员凭据；未生成测试数据 |
| 附件大小/类型/路径探测 | BLOCKED | 未登录、未上传任何文件 |
| 性能基线 | NOT-APPLICABLE | 未获准发送负载；任务书中的阈值仍为待确认假设，不判 PASS/FAIL |
| 未认证暴露面 | 已观察，外网可达性未知 | system/gateway `/actuator` 根索引均 HTTP 200；system `/swagger-ui/index.html` HTTP 200、`/v3/api-docs` HTTP 200（2,633,853 字节）；gateway 对应 Swagger/OpenAPI 路径均 404。`/actuator/info` 两者均 HTTP 200 且为空对象。均只从 loopback 访问 |
| 匿名认证守卫 | PASS（7 项 API 冒烟中的 4 项认证断言） | `/api/auth/me` 与 `/api/system/users` 匿名 GET 返回 401；空登录返回业务 code=400 且中文必填提示；未知身份登录返回业务 code=401 和通用错误。脱敏请求/响应见 `reports/evidence/PLM2-DEEP-AUTH-20261120T0221/api-smoke.json` |
| 越权角色、运行时 JWT、注入/XSS | BLOCKED | 缺业务账号/凭据；没有进行认证绕过或载荷测试。另见缺陷清单中的 JWT 默认密钥静态配置风险 |
| 日志凭据扫描 | BLOCKED | 没有访问服务日志；未收集可能含凭据的日志内容 |

Gateway 在临时 Redis 不可用时健康检查为 DOWN（HTTP 503）；短暂提供 loopback 临时 Redis 后恢复为 UP，停止后再次 DOWN。system 健康为 UP 且声明 H2。未以性能/安全测试结果掩盖此环境故障。

三个服务进程监听在通配地址；本机未验证防火墙或其他网络接口的可达性。Actuator 索引和 system Swagger/OpenAPI 文档无需登录即可由 loopback 读取，是否为预期需环境负责人确认；不得据此宣称公网暴露，也不得将其当作已安全。

静态源码检查发现 Gateway 默认 JWT 密钥是字面量配置，报告未包含其值；这不是令牌伪造测试结果，必须确认部署时是否覆盖。
