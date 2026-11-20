# D0-06 重复实现与复用分析

## 盘点方法

- 日期：2026-11-20
- 比较依据：Controller HTTP method/path、服务/实体/表边界及当前 Java 引用关系。
- D0-02 静态路由对照记录了 3,244 条后端 method/path 映射，但映射数量本身不证明不存在重复声明；本次没有另行运行跨 Controller 的重复路由冲突检查。
- 本次识别的是业务概念可能重叠、需要领域确认的候选；没有仅凭名称相似就合并表、API 或流程。

## 重叠候选与处理建议

| 业务概念 | 现有实现 | 当前证据 | 归并判断/建议 |
|---|---|---|---|
| 物料主数据 | PLM/主数据 `/product-data/materials` → `MaterialService` → `md_material`；ERP `/erp/base/materials` → `ErpMaterialService` → `erp_base_material` | 两套 CRUD/API、Service、Entity/Mapper 和数据库表均独立。全仓 `ErpMaterial` / `ErpMaterialMapper` 使用点仅有 ERP Controller、Service、Entity、Mapper；未发现与 `MdMaterial` 的代码级同步/复用 | **高优先级重复/主数据源风险，待业务负责人定主数据归属。** 先确认 PLM 是否为工程主数据权威、ERP 是否保留独立财务/计划属性及接口映射；避免继续新增第三套物料主档。未获口径前不合并数据库表，以免丢失 ERP 特有字段和既有 API 契约。 |
| 库存数量与流水 | WMS `wms_inventory_batch`、`wms_inventory_txn`、库位/批次服务；ERP `erp_inventory_balance`、`erp_inventory_transaction` 及成本/盘点/转换服务 | 两套库存实体和流水表分离；WMS 面向批次/仓储，ERP 有单独余额和财务事务记录。仓库另有 ERP↔WMS 集成模型 | **需明确唯一数量权威和同步对账。** 暂按 WMS 批次流水负责仓储实物、ERP 库存用于 ERP 业务核算理解；该边界尚未由业务流程和实时对账证明。不要另建第三个可写库存实现；先验证 ERP↔WMS 事件/幂等/补偿。 |
| BOM | `BomController`、`BomService`、`bom_header`/`bom_line`；另有 BOM 导入和迁移暂存 | 业务 CRUD 只有一组 `/bom/boms` 主路由；导入/迁移表是 staging/import 记录而非另一套 BOM 主档 | **保留当前 BOM 主档实现**；导入与迁移只作为暂存、验证、发布到正式 BOM 的入口，不新增并行 BOM CRUD。发布快照及工单快照仍需按 D3/D7 用例验收。 |
| 销售订单 | `ErpSalesOrderController/Service` → ERP sales order 表；另有迁移未结业务 staging | 当前 Controller 扫描未发现第二个 OA/销售订单 CRUD；迁移 staging 保存旧系统来源行 | **保留 ERP Sales Order 为正式订单实现**；迁移 staging 不作业务订单查询/写入的第二真源，只能经审核和正式业务 promote 转入。 |
| ERP 生产订单与 MES 工单 | ERP production order 与 MES manufacturing/work-order controllers/实体并存 | ERP 计划/订单与 MES 执行/报工属不同生命周期对象，跨模块映射需通过集成记录；不能用单一名称判断为重复 | **保持域分离、复用既有业务单据号关联**，需证明 ERP 下达工单→MES 执行→ERP 完工回写的 idempotency 和数量守恒。 |

## 复用决策

1. 已可确认：BOM 主档只有一条主要业务实现；迁移导入应复用正式 BOM/ERP 业务服务，而非另建正式数据写入链。
2. 用户已确认高层数据所有权：**PLM 是工程物料主档权威；WMS 是实物库存权威；ERP 保留核算/计划视图。** ERP 特有扩展字段可以保留，但必须关联 PLM 物料标识；ERP 库存视图不得成为独立可写的实物数量真源。具体字段、同步事件、异常补偿及对账口径仍需评审。
3. 需停止横向扩展：物料主档和库存余额/流水存在两套表及 API；后续开发必须落实以上所有权与接口映射，避免再创建平行 CRUD 或平行可写余额。
4. 暂不做破坏性合并：高层责任域已确认，但字段映射、主键/编码策略、既有历史数据迁移和 ERP 派生视图算法未审定；当前没有可用持久化 PostgreSQL/闭环数据验证，不能安全删除或重构现有表。
5. 下游需要复用时优先通过正式 service/事件，禁止直接跨表改写另一域数据；ERP库存视图须由 WMS 权威流水派生或对账校准，不能由 ERP 业务端独立增减。

## D0-06 结论

尚未运行 Controller 路由冲突扫描，故精确路由重复与否**未判定**。用户已确认物料主数据及库存的高层权威边界，消除了“由哪个域负责”的主要歧义；但字段映射、派生视图、迁移兼容及运行对账仍未验收。补路由重复扫描并完成数据映射评审前，D0-06 仍为**部分完成/需评审**。
