import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ProLayout } from '@ant-design/pro-components';
import { Dropdown } from 'antd';
import { LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';

const menuRoute = {
  path: '/',
  routes: [
    { path: '/dashboard', name: '工作台', icon: 'SmileOutlined' },
    {
      path: '/oa',
      name: 'OA 办公门户',
      icon: 'HomeOutlined',
      routes: [
        { path: '/oa/portal', name: '门户首页' },
        { path: '/oa/positions', name: '岗位管理' },
        { path: '/oa/employments', name: '员工档案' },
        { path: '/oa/delegations', name: '流程代理授权' },
        { path: '/oa/applications', name: '应用中心' },
        { path: '/oa/sso-clients', name: 'SSO 客户端' },
        { path: '/oa/forms', name: '表单设计器' },
        { path: '/oa/processes', name: '流程设计器' },
        { path: '/oa/my-applications', name: '我的申请' },
        { path: '/oa/tasks', name: '我的待办' },
        { path: '/oa/approvals', name: '审批查询' },
        { path: '/oa/monitor', name: '流程监控' },
        { path: '/oa/mails', name: '内部邮件' },
        { path: '/oa/notifications', name: '消息中心' },
        { path: '/oa/notify-templates', name: '通知模板' },
        { path: '/oa/documents', name: '文档中心' },
        { path: '/oa/knowledge', name: '知识库' },
        { path: '/oa/hr', name: '行政人事' },
        { path: '/oa/biz/sales', name: '销售生产流程' },
        { path: '/oa/biz/purchase', name: '采购流程' },
        { path: '/oa/biz/quality', name: '品质流程' },
        { path: '/oa/biz/rd', name: '研发技术流程' },
        { path: '/oa/meeting', name: '会议与日程' },
        { path: '/oa/collab', name: '协同办公' },
        { path: '/oa/address-book', name: '通讯录' },
        { path: '/oa/mobile-admin', name: '移动端配置' },
        { path: '/oa/asset/repair', name: '资产维修' },
        { path: '/oa/special/contract', name: '合同管理' },
        { path: '/oa/special/office-supply', name: '办公用品' },
        { path: '/oa/special/library', name: '图书管理' },
        { path: '/oa/special/customer', name: '客户管理' },
        { path: '/oa/system/i18n', name: '国际化与多工厂' },
        { path: '/oa/system/log-center', name: '日志中心与移动后台' },
        {
          path: '/oa/integration',
          name: '开放集成平台',
          routes: [
            { path: '/oa/integration/gateway', name: 'API 网关' },
            { path: '/oa/integration/webhook', name: 'Webhook 订阅' },
            { path: '/oa/integration/task', name: '消息任务队列' },
            { path: '/oa/integration/connector', name: '集成连接器' },
            { path: '/oa/integration/edi', name: 'EDI 状态通知' },
            { path: '/oa/integration/monitor', name: '接口监控台' },
          ],
        },
        {
          path: '/oa/migration',
          name: '历史数据迁移',
          routes: [
            { path: '/oa/migration/object', name: '迁移对象与映射' },
            { path: '/oa/migration/batch', name: '迁移批次与清洗' },
            { path: '/oa/migration/attachment', name: '附件迁移' },
            { path: '/oa/migration/history-flow', name: '历史流程查询' },
            { path: '/oa/migration/reconcile', name: '迁移对账' },
            { path: '/oa/migration/dual-run', name: '新旧双跑对照' },
          ],
        },
        {
          path: '/oa/test',
          name: '测试与验收',
          routes: [
            { path: '/oa/test/case', name: '测试用例' },
            { path: '/oa/test/permission', name: '权限测试' },
            { path: '/oa/test/security', name: '安全测试' },
            { path: '/oa/test/performance', name: '性能测试' },
            { path: '/oa/test/compatibility', name: '兼容测试' },
            { path: '/oa/test/backup-drill', name: '备份恢复演练' },
            { path: '/oa/test/uat', name: '用户验收' },
            { path: '/oa/test/training', name: '培训交付' },
            { path: '/oa/test/cutover', name: '切换与回退预案' },
          ],
        },
        {
          path: '/oa/golive',
          name: '正式切换与退役',
          routes: [
            { path: '/oa/golive/freeze', name: '切换冻结管理' },
            { path: '/oa/golive/final-migration', name: '最终数据迁移' },
            { path: '/oa/golive/entry-switch', name: '入口与身份切换' },
            { path: '/oa/golive/watch', name: '上线值守' },
            { path: '/oa/golive/rollback', name: '回退决策' },
            { path: '/oa/golive/legacy-archive', name: '旧系统只读封存' },
            { path: '/oa/golive/decommission', name: '授权与资源回收' },
            { path: '/oa/golive/handover', name: '运维交接' },
          ],
        },
        { path: '/m/workbench', name: '移动门户' },
      ],
    },
    { path: '/products', name: '产品型号', icon: 'AppstoreOutlined' },
    { path: '/suppliers', name: '供应商', icon: 'ShopOutlined' },
    { path: '/material', name: '物料管理', icon: 'DatabaseOutlined' },
    { path: '/bom', name: 'BOM 管理', icon: 'ApartmentOutlined' },
    { path: '/eco', name: '工程变更', icon: 'SwapOutlined' },
    { path: '/document', name: '文档图纸', icon: 'FileTextOutlined' },
    { path: '/cad', name: 'CAD 集成', icon: 'BlockOutlined' },
    { path: '/spec', name: '技术规格', icon: 'ProfileOutlined' },
    { path: '/harness', name: '线束端子', icon: 'BranchesOutlined' },
    { path: '/compliance', name: '环保合规', icon: 'SafetyCertificateOutlined' },
    { path: '/packaging', name: '包装标签', icon: 'TagsOutlined' },
    { path: '/process', name: '工艺路线', icon: 'NodeIndexOutlined' },
    { path: '/inspection', name: '检验规范', icon: 'SolutionOutlined' },
    { path: '/quality', name: '质量问题', icon: 'AlertOutlined' },
    { path: '/manufacturing', name: '制造协同', icon: 'ToolOutlined' },
    {
      path: '/label',
      name: '编码与标签',
      icon: 'QrcodeOutlined',
      routes: [
        { path: '/relabel', name: '扫码换标工作台' },
        { path: '/code-rule', name: '编码规则' },
        { path: '/code-dict', name: '统一码表' },
        { path: '/label-template', name: '标签模板' },
        { path: '/label-print', name: '标签打印' },
      ],
    },
    {
      path: '/edi',
      name: 'EDI 协同',
      icon: 'ApiOutlined',
      routes: [
        { path: '/edi/partner', name: 'EDI 伙伴与通道' },
        { path: '/edi/trans-set', name: '交易集配置' },
        { path: '/edi/message-map', name: '报文映射' },
        { path: '/edi/monitor', name: '报文监控台' },
        { path: '/edi/demand', name: '客户需求' },
        { path: '/edi/dispatch', name: '分发与回执' },
        { path: '/edi/asn', name: 'ASN 交付' },
        { path: '/edi/supplier-material', name: '供货关系' },
      ],
    },
    {
      path: '/wms',
      name: '物料供应与看板',
      icon: 'ControlOutlined',
      routes: [
        { path: '/wms/location', name: '库位与物料标识' },
        { path: '/wms/kanban', name: '电子看板' },
        { path: '/wms/delivery', name: '物料配送' },
        { path: '/wms/pick', name: '扫码领料' },
        { path: '/wms/fifo', name: 'FIFO 规则' },
        { path: '/wms/binding', name: '防混料绑定' },
        { path: '/wms/line-stock', name: '线边库存' },
        { path: '/wms/shortage', name: '缺料与欠料' },
        { path: '/wms/plan', name: '应急预案' },
      ],
    },
    {
      path: '/wms-base',
      name: 'WMS 仓储管理',
      icon: 'ClusterOutlined',
      routes: [
        { path: '/wms/base/warehouses', name: '仓库管理', icon: 'BankOutlined' },
        { path: '/wms/base/zones', name: '库区管理', icon: 'PartitionOutlined' },
        { path: '/wms/base/bins', name: '库位管理', icon: 'ClusterOutlined' },
        { path: '/wms/base/racks', name: '货架管理', icon: 'BuildOutlined' },
        { path: '/wms/base/containers', name: '容器管理', icon: 'InboxOutlined' },
        { path: '/wms/base/strategies', name: '作业策略', icon: 'ControlOutlined' },
      ],
    },
    {
      path: '/wms-inbound',
      name: '收货上架',
      icon: 'ImportOutlined',
      routes: [
        { path: '/wms/inbound/asns', name: '收货通知', icon: 'FileAddOutlined' },
        { path: '/wms/inbound/receipts', name: '收货单', icon: 'InboxOutlined' },
        { path: '/wms/inbound/putaways', name: '上架任务', icon: 'VerticalAlignTopOutlined' },
      ],
    },
    {
      path: '/wms-inventory',
      name: '库存控制',
      icon: 'DatabaseOutlined',
      routes: [
        { path: '/wms/inventory/batches', name: '库存批次', icon: 'DatabaseOutlined' },
        { path: '/wms/inventory/serials', name: '序列号', icon: 'NumberOutlined' },
        { path: '/wms/inventory/freezes', name: '库存冻结', icon: 'LockOutlined' },
      ],
    },
    {
      path: '/wms-pick',
      name: '拣选发料',
      icon: 'ScheduleOutlined',
      routes: [
        { path: '/wms/pick/tasks', name: '拣料单', icon: 'PullRequestOutlined' },
        { path: '/wms/pick/kittings', name: '齐套检查', icon: 'CheckSquareOutlined' },
        { path: '/wms/pick/line-stocks', name: '线边仓库存', icon: 'ShopOutlined' },
      ],
    },
    {
      path: '/wms-return',
      name: '生产退补料',
      icon: 'RollbackOutlined',
      routes: [
        { path: '/wms/return/returns', name: '生产退料', icon: 'RollbackOutlined' },
        { path: '/wms/return/replenishes', name: '生产补料', icon: 'PlusSquareOutlined' },
        { path: '/wms/return/diffs', name: '差异处理', icon: 'DiffOutlined' },
      ],
    },
    {
      path: '/wms-outbound',
      name: '成品与发运',
      icon: 'CarOutlined',
      routes: [
        { path: '/wms/outbound/finished-goods', name: '成品入库', icon: 'ImportOutlined' },
        { path: '/wms/outbound/waves', name: '出库波次', icon: 'DeploymentUnitOutlined' },
        { path: '/wms/outbound/shipments', name: '发运单', icon: 'SendOutlined' },
      ],
    },
    {
      path: '/wms-stocktake',
      name: '盘点与调拨',
      icon: 'AuditOutlined',
      routes: [
        { path: '/wms/stocktake/orders', name: '盘点单', icon: 'AuditOutlined' },
        { path: '/wms/stocktake/diffs', name: '盘点差异', icon: 'DiffOutlined' },
        { path: '/wms/stocktake/transfers', name: '调拨单', icon: 'SwapOutlined' },
      ],
    },
    {
      path: '/wms-vmi',
      name: 'VMI管理',
      icon: 'DatabaseOutlined',
      routes: [
        { path: '/wms/vmi/bins', name: 'VMI库位', icon: 'DatabaseOutlined' },
        { path: '/wms/vmi/scans', name: 'VMI扫码收发', icon: 'ScanOutlined' },
        { path: '/wms/vmi/warnings', name: '超容量预警', icon: 'AlertOutlined' },
      ],
    },
    {
      path: '/mes',
      name: 'MES 制造执行',
      icon: 'DeploymentUnitOutlined',
      routes: [
        {
          path: '/mes-plan',
          name: '生产计划执行',
          icon: 'ScheduleOutlined',
          routes: [
            { path: '/mes/plan/orders', name: '生产工单', icon: 'ProfileOutlined' },
            { path: '/mes/plan/schedules', name: '排产计划', icon: 'ScheduleOutlined' },
            { path: '/mes/plan/dispatches', name: '派工任务', icon: 'TeamOutlined' },
          ],
        },
        {
          path: '/mes-craft',
          name: '工艺与作业',
          icon: 'ExperimentOutlined',
          routes: [
            { path: '/mes/craft/versions', name: '工艺版本', icon: 'BranchesOutlined' },
            { path: '/mes/craft/sops', name: 'SOP作业指导书', icon: 'FileTextOutlined' },
            { path: '/mes/craft/recipes', name: '参数配方', icon: 'ExperimentOutlined' },
            { path: '/mes/craft/fais', name: '首件确认', icon: 'CheckCircleOutlined' },
            { path: '/mes/craft/changeovers', name: '换线换型', icon: 'SwapOutlined' },
          ],
        },
        {
          path: '/mes-report',
          name: '工序报工',
          icon: 'SolutionOutlined',
          routes: [
            { path: '/mes/report/works', name: '工序报工单', icon: 'SolutionOutlined' },
            { path: '/mes/report/replenishes', name: '补料记录', icon: 'PlusSquareOutlined' },
            { path: '/mes/report/labors', name: '工时记录', icon: 'FieldTimeOutlined' },
          ],
        },
        {
          path: '/mes-equipment',
          name: '设备与工装',
          icon: 'ToolOutlined',
          routes: [
            { path: '/mes/equipment/ledgers', name: '设备台账', icon: 'DatabaseOutlined' },
            { path: '/mes/equipment/statuses', name: '设备状态', icon: 'DashboardOutlined' },
            { path: '/mes/equipment/checks', name: '设备点检', icon: 'AuditOutlined' },
            { path: '/mes/equipment/maintenances', name: '设备保养', icon: 'ToolOutlined' },
            { path: '/mes/equipment/faults', name: '设备故障', icon: 'WarningOutlined' },
            { path: '/mes/equipment/tools', name: '工装寿命', icon: 'FieldTimeOutlined' },
          ],
        },
        {
          path: '/mes-quality',
          name: '质量检验',
          icon: 'SafetyCertificateOutlined',
          routes: [
            { path: '/mes/quality/specs', name: '检验规范', icon: 'FileProtectOutlined' },
            { path: '/mes/quality/incomings', name: '来料检验', icon: 'ImportOutlined' },
            { path: '/mes/quality/firsts', name: '首件检验', icon: 'CheckCircleOutlined' },
            { path: '/mes/quality/patrols', name: '巡检记录', icon: 'ScanOutlined' },
            { path: '/mes/quality/lasts', name: '末件检验', icon: 'CheckSquareOutlined' },
            { path: '/mes/quality/finals', name: '终检记录', icon: 'SafetyCertificateOutlined' },
            { path: '/mes/quality/judges', name: '检验判定', icon: 'AuditOutlined' },
            { path: '/mes/quality/quarantines', name: '隔离记录', icon: 'StopOutlined' },
          ],
        },
        {
          path: '/mes-trace',
          name: '产品追溯',
          icon: 'NodeIndexOutlined',
          routes: [
            { path: '/mes/trace/serials', name: '序列号台账', icon: 'NumberOutlined' },
            { path: '/mes/trace/batches', name: '批次追溯', icon: 'ClusterOutlined' },
            { path: '/mes/trace/codes', name: '追溯码', icon: 'QrcodeOutlined' },
            { path: '/mes/trace/links', name: '追溯关联', icon: 'DeploymentUnitOutlined' },
            { path: '/mes/trace/records', name: '追溯记录', icon: 'ProfileOutlined' },
          ],
        },
        {
          path: '/mes-kanban',
          name: '生产看板',
          icon: 'DashboardOutlined',
          routes: [
            { path: '/mes/kanban/plans', name: '计划达成', icon: 'AimOutlined' },
            { path: '/mes/kanban/outputs', name: '产量看板', icon: 'BarChartOutlined' },
            { path: '/mes/kanban/yields', name: '良率看板', icon: 'RiseOutlined' },
            { path: '/mes/kanban/downtimes', name: '停机看板', icon: 'FieldTimeOutlined' },
            { path: '/mes/kanban/wips', name: '在制品看板', icon: 'DatabaseOutlined' },
            { path: '/mes/kanban/andons', name: '异常安灯', icon: 'AlertOutlined' },
          ],
        },
        {
          path: '/mes-collect',
          name: '数据采集',
          icon: 'ApiOutlined',
          routes: [
            { path: '/mes/collect/devices', name: '采集设备', icon: 'ClusterOutlined' },
            { path: '/mes/collect/interfaces', name: '采集接口', icon: 'ApiOutlined' },
            { path: '/mes/collect/points', name: '采集数据点', icon: 'DotChartOutlined' },
            { path: '/mes/collect/rules', name: '校验规则', icon: 'FilterOutlined' },
            { path: '/mes/collect/records', name: '采集数据', icon: 'LineChartOutlined' },
          ],
        },
      ],
    },
    {
      path: '/intg',
      name: '系统集成',
      icon: 'ShareAltOutlined',
      routes: [
        {
          path: '/intg-plm-erp',
          name: 'PLM→ERP 集成',
          icon: 'SwapRightOutlined',
          routes: [
            { path: '/intg/plm-erp/interfaces', name: '集成接口', icon: 'ApiOutlined' },
            { path: '/intg/plm-erp/mappings', name: '字段映射', icon: 'PartitionOutlined' },
            { path: '/intg/plm-erp/batches', name: '同步批次', icon: 'SyncOutlined' },
            { path: '/intg/plm-erp/receipts', name: '接收回执', icon: 'AuditOutlined' },
            { path: '/intg/plm-erp/compensations', name: '异常补偿', icon: 'ToolOutlined' },
            { path: '/intg/plm-erp/reconciles', name: '对账', icon: 'BalanceOutlined' },
          ],
        },
        {
          path: '/intg-plm-mes',
          name: 'PLM→MES 集成',
          icon: 'SwapRightOutlined',
          routes: [
            { path: '/intg/plm-mes/interfaces', name: '集成接口', icon: 'ApiOutlined' },
            { path: '/intg/plm-mes/mappings', name: '字段映射', icon: 'PartitionOutlined' },
            { path: '/intg/plm-mes/batches', name: '同步批次', icon: 'SyncOutlined' },
            { path: '/intg/plm-mes/receipts', name: '接收回执', icon: 'AuditOutlined' },
            { path: '/intg/plm-mes/compensations', name: '异常补偿', icon: 'ToolOutlined' },
            { path: '/intg/plm-mes/reconciles', name: '对账', icon: 'BalanceOutlined' },
          ],
        },
        {
          path: '/intg-plm-srm',
          name: 'PLM→SRM 集成',
          icon: 'SwapRightOutlined',
          routes: [
            { path: '/intg/plm-srm/interfaces', name: '集成接口', icon: 'ApiOutlined' },
            { path: '/intg/plm-srm/mappings', name: '字段映射', icon: 'PartitionOutlined' },
            { path: '/intg/plm-srm/batches', name: '同步批次', icon: 'SyncOutlined' },
            { path: '/intg/plm-srm/receipts', name: '接收回执', icon: 'AuditOutlined' },
            { path: '/intg/plm-srm/compensations', name: '异常补偿', icon: 'ToolOutlined' },
            { path: '/intg/plm-srm/reconciles', name: '对账', icon: 'BalanceOutlined' },
          ],
        },
      ],
    },
    {
      path: '/mfg',
      name: '生产执行与追溯',
      icon: 'DeploymentUnitOutlined',
      routes: [
        { path: '/mfg/batch', name: '生产批次' },
        { path: '/mfg/operation', name: '工序过站' },
        { path: '/mfg/test', name: '测试数据' },
        { path: '/mfg/package', name: '包装与箱码' },
        { path: '/mfg/shipment', name: '出货与放行' },
        { path: '/mfg/trace', name: '追溯查询' },
        { path: '/mfg/recall', name: '召回与隔离' },
      ],
    },
    {
      path: '/int',
      name: '集成与交付',
      icon: 'ApiOutlined',
      routes: [
        { path: '/int/endpoint', name: '接口配置与监控' },
        { path: '/int/master-data', name: '主数据同步' },
        { path: '/int/qms', name: 'QMS 质量接口' },
        { path: '/int/migration', name: '数据迁移' },
        { path: '/int/export', name: '数据导出' },
        { path: '/int/test', name: '测试与性能' },
        { path: '/int/security', name: '安全与备份' },
        { path: '/int/golive', name: '上线与交付' },
        { path: '/int/defect', name: '缺陷与 SLA' },
      ],
    },
    {
      path: '/platform',
      name: '平台底座',
      icon: 'DeploymentUnitOutlined',
      routes: [
        { path: '/platform/integration/api-registry', name: '接口注册中心' },
        { path: '/platform/integration/event-topics', name: '事件主题' },
        { path: '/platform/integration/event-subscriptions', name: '事件订阅' },
        { path: '/platform/integration/event-messages', name: '事件消息' },
        { path: '/platform/integration/dead-letters', name: '死信处理' },
        { path: '/platform/integration/idempotent-records', name: '幂等记录' },
        { path: '/platform/integration/monitor', name: '集成监控' },
        {
          path: '/platform/report',
          name: '报表平台',
          routes: [
            { path: '/platform/report/indicators', name: '指标口径' },
            { path: '/platform/report/datasets', name: '数据集市' },
            { path: '/platform/report/definitions', name: '报表定义' },
            { path: '/platform/report/export-logs', name: '导出审计' },
            { path: '/platform/report/dashboards', name: '经营驾驶舱' },
          ],
        },
        {
          path: '/platform/file',
          name: '统一文件服务',
          routes: [
            { path: '/platform/file/attachments', name: '统一附件', icon: 'PaperClipOutlined' },
            { path: '/platform/file/versions', name: '文件版本', icon: 'HistoryOutlined' },
            { path: '/platform/file/preview-tasks', name: '预览转换', icon: 'FileSearchOutlined' },
            { path: '/platform/file/scan-records', name: '病毒扫描', icon: 'SafetyOutlined' },
            { path: '/platform/file/archives', name: '文件归档', icon: 'InboxOutlined' },
          ],
        },
        {
          path: '/platform/iam',
          name: '身份与权限',
          routes: [
            { path: '/platform/iam/mfa-bindings', name: '多因素认证', icon: 'SafetyCertificateOutlined' },
            { path: '/platform/iam/mfa-verify-logs', name: 'MFA 校验日志', icon: 'AuditOutlined' },
            { path: '/platform/iam/sso-providers', name: '单点登录', icon: 'KeyOutlined' },
            { path: '/platform/iam/field-permissions', name: '字段权限', icon: 'EyeInvisibleOutlined' },
            { path: '/platform/iam/sod-rules', name: '职责分离规则', icon: 'SolutionOutlined' },
            { path: '/platform/iam/sod-violations', name: '违规记录', icon: 'AlertOutlined' },
          ],
        },
        {
          path: '/platform/org',
          name: '多组织多工厂',
          routes: [
            { path: '/platform/org/legal-entities', name: '法人主体', icon: 'BankOutlined' },
            { path: '/platform/org/factories', name: '工厂管理', icon: 'ShopOutlined' },
            { path: '/platform/org/warehouses', name: '仓库管理', icon: 'HomeOutlined' },
            { path: '/platform/org/production-lines', name: '产线管理', icon: 'ClusterOutlined' },
            { path: '/platform/org/org-grants', name: '跨组织授权', icon: 'SafetyOutlined' },
          ],
        },
        {
          path: '/platform/finance',
          name: '多币种多税率',
          routes: [
            { path: '/platform/finance/currencies', name: '币种管理', icon: 'GlobalOutlined' },
            { path: '/platform/finance/exchange-rates', name: '汇率管理', icon: 'SwapOutlined' },
            { path: '/platform/finance/tax-rates', name: '税率管理', icon: 'PercentageOutlined' },
            { path: '/platform/finance/price-rules', name: '价格规则', icon: 'TagsOutlined' },
            { path: '/platform/finance/rounding-rules', name: '舍入规则', icon: 'RetweetOutlined' },
          ],
        },
        {
          path: '/platform/doc-state',
          name: '单据状态机',
          routes: [
            { path: '/platform/doc-state/state-defs', name: '单据状态定义', icon: 'NodeIndexOutlined' },
            { path: '/platform/doc-state/transitions', name: '状态流转规则', icon: 'BranchesOutlined' },
            { path: '/platform/doc-state/state-logs', name: '单据状态日志', icon: 'HistoryOutlined' },
          ],
        },
        {
          path: '/platform/approval',
          name: '可配置审批',
          routes: [
            { path: '/platform/approval/flows', name: '审批流定义', icon: 'AuditOutlined' },
            { path: '/platform/approval/conditions', name: '审批条件', icon: 'FilterOutlined' },
            { path: '/platform/approval/nodes', name: '审批节点', icon: 'ApartmentOutlined' },
            { path: '/platform/approval/instances', name: '审批实例', icon: 'ScheduleOutlined' },
            { path: '/platform/approval/tasks', name: '审批任务', icon: 'CheckCircleOutlined' },
          ],
        },
        {
          path: '/platform/biz-rule',
          name: '业务规则引擎',
          routes: [
            { path: '/platform/biz-rule/rules', name: '业务规则', icon: 'ControlOutlined' },
            { path: '/platform/biz-rule/params', name: '规则参数', icon: 'NumberOutlined' },
            { path: '/platform/biz-rule/logs', name: '规则执行日志', icon: 'ProfileOutlined' },
          ],
        },
        {
          path: '/platform/data-quality',
          name: '数据质量控制',
          routes: [
            { path: '/platform/data-quality/rules', name: '数据质量规则', icon: 'SafetyCertificateOutlined' },
            { path: '/platform/data-quality/exceptions', name: '数据异常队列', icon: 'ExceptionOutlined' },
            { path: '/platform/data-quality/code-rules', name: '编码规则', icon: 'BarcodeOutlined' },
          ],
        },
        {
          path: '/platform/mobile',
          name: '移动端与PDA',
          routes: [
            { path: '/platform/mobile/devices', name: 'PDA设备', icon: 'MobileOutlined' },
            { path: '/platform/mobile/scenes', name: '移动场景', icon: 'AppstoreOutlined' },
            { path: '/platform/mobile/scan-logs', name: '扫码日志', icon: 'QrcodeOutlined' },
            { path: '/platform/mobile/label-rules', name: '标签校验规则', icon: 'SafetyCertificateOutlined' },
            { path: '/platform/mobile/exceptions', name: '移动异常队列', icon: 'ExceptionOutlined' },
          ],
        },
        {
          path: '/platform/governance',
          name: '治理中心',
          icon: 'ProjectOutlined',
          routes: [
            { path: '/platform/governance/projects', name: '治理项目', icon: 'ProjectOutlined' },
            { path: '/platform/governance/milestones', name: '里程碑', icon: 'FlagOutlined' },
            { path: '/platform/governance/tasks', name: '治理任务', icon: 'CarryOutOutlined' },
            { path: '/platform/governance/risks', name: '风险台账', icon: 'WarningOutlined' },
            { path: '/platform/governance/asis-systems', name: '现状系统', icon: 'DatabaseOutlined' },
            { path: '/platform/governance/asis-findings', name: '现状问题', icon: 'FileSearchOutlined' },
            { path: '/platform/governance/processes', name: '业务流程', icon: 'PartitionOutlined' },
            { path: '/platform/governance/process-nodes', name: '流程节点', icon: 'NodeIndexOutlined' },
            { path: '/platform/governance/requirements', name: '需求条目', icon: 'FileTextOutlined' },
            { path: '/platform/governance/trace-links', name: '追溯关联', icon: 'LinkOutlined' },
            { path: '/platform/governance/arch-components', name: '架构组件', icon: 'BlockOutlined' },
            { path: '/platform/governance/arch-relations', name: '架构关系', icon: 'DeploymentUnitOutlined' },
          ],
        },
        {
          path: '/platform/devops',
          name: 'DevSecOps',
          icon: 'CloudServerOutlined',
          routes: [
            { path: '/platform/devops/repositories', name: '代码仓库', icon: 'BranchesOutlined' },
            { path: '/platform/devops/pipelines', name: 'CI/CD流水线', icon: 'BuildOutlined' },
            { path: '/platform/devops/environments', name: '部署环境', icon: 'ClusterOutlined' },
            { path: '/platform/devops/build-runs', name: '构建运行', icon: 'CloudServerOutlined' },
            { path: '/platform/devops/gates', name: '质量安全门禁', icon: 'SafetyOutlined' },
          ],
        },
        {
          path: '/platform/mdm',
          name: '主数据平台',
          icon: 'DatabaseOutlined',
          routes: [
            { path: '/platform/mdm/domains', name: '主数据域', icon: 'DatabaseOutlined' },
            { path: '/platform/mdm/sources', name: '权威源登记', icon: 'ApartmentOutlined' },
            { path: '/platform/mdm/code-standards', name: '编码标准', icon: 'BarcodeOutlined' },
            { path: '/platform/mdm/distributions', name: '主数据分发', icon: 'SendOutlined' },
            { path: '/platform/mdm/change-requests', name: '变更申请', icon: 'EditOutlined' },
            { path: '/platform/mdm/quality-checks', name: '数据质量校验', icon: 'SafetyCertificateOutlined' },
            { path: '/platform/mdm/sync-logs', name: '同步日志', icon: 'SyncOutlined' },
            { path: '/platform/mdm/code-issues', name: '编码发放', icon: 'NumberOutlined' },
          ],
        },
      ],
    },
    {
      path: '/erp',
      name: 'ERP 系统',
      icon: 'ShopOutlined',
      routes: [
        { path: '/erp/base/materials', name: '物料业务档案' },
        { path: '/erp/base/customers', name: '客户档案' },
        { path: '/erp/base/customer-contacts', name: '客户联系人' },
        { path: '/erp/base/suppliers', name: '供应商业务档案' },
        { path: '/erp/base/uoms', name: '计量单位' },
        { path: '/erp/base/uom-conversions', name: '单位换算' },
        { path: '/erp/base/projects', name: '项目档案' },
        {
          path: '/erp/sales',
          name: '销售管理',
          icon: 'ShoppingCartOutlined',
          routes: [
            { path: '/erp/sales/forecasts', name: '销售预测', icon: 'LineChartOutlined' },
            { path: '/erp/sales/orders', name: '销售订单', icon: 'ProfileOutlined' },
            { path: '/erp/sales/order-changes', name: '订单变更', icon: 'EditOutlined' },
            { path: '/erp/sales/delivery-reviews', name: '交期评审', icon: 'ClockCircleOutlined' },
            { path: '/erp/sales/deliveries', name: '发货单', icon: 'CarOutlined' },
            { path: '/erp/sales/outbounds', name: '销售出库', icon: 'ExportOutlined' },
            { path: '/erp/sales/returns', name: '销售退货', icon: 'RollbackOutlined' },
            { path: '/erp/sales/invoices', name: '销售发票', icon: 'FileTextOutlined' },
            { path: '/erp/sales/receivables', name: '应收账款', icon: 'AccountBookOutlined' },
          ],
        },
        {
          path: '/erp/purchase',
          name: '采购管理',
          icon: 'ShoppingOutlined',
          routes: [
            { path: '/erp/purchase/requisitions', name: '请购单', icon: 'FormOutlined' },
            { path: '/erp/purchase/inquiries', name: '询价单', icon: 'SearchOutlined' },
            { path: '/erp/purchase/orders', name: '采购订单', icon: 'ProfileOutlined' },
            { path: '/erp/purchase/receipts', name: '到货单', icon: 'InboxOutlined' },
            { path: '/erp/purchase/inspections', name: '采购报检', icon: 'SafetyCertificateOutlined' },
            { path: '/erp/purchase/inbounds', name: '采购入库', icon: 'ImportOutlined' },
            { path: '/erp/purchase/invoices', name: '采购发票', icon: 'FileTextOutlined' },
            { path: '/erp/purchase/returns', name: '采购退货', icon: 'RollbackOutlined' },
            { path: '/erp/purchase/settlements', name: '采购结算', icon: 'MoneyCollectOutlined' },
          ],
        },
        {
          path: '/erp/outsource',
          name: '委外管理',
          icon: 'BranchesOutlined',
          routes: [
            { path: '/erp/outsource/orders', name: '委外订单', icon: 'ProfileOutlined' },
            { path: '/erp/outsource/issues', name: '委外发料', icon: 'ExportOutlined' },
            { path: '/erp/outsource/receipts', name: '委外到货', icon: 'InboxOutlined' },
            { path: '/erp/outsource/inspections', name: '委外报检', icon: 'SafetyCertificateOutlined' },
            { path: '/erp/outsource/inbounds', name: '委外入库', icon: 'ImportOutlined' },
            { path: '/erp/outsource/invoices', name: '委外发票', icon: 'FileTextOutlined' },
            { path: '/erp/outsource/settlements', name: '委外结算', icon: 'MoneyCollectOutlined' },
            { path: '/erp/outsource/writeoffs', name: '委外核销', icon: 'ReconciliationOutlined' },
            { path: '/erp/outsource/returns', name: '委外退货', icon: 'RollbackOutlined' },
          ],
        },
        {
          path: '/erp/demand-plan',
          name: '需求计划',
          icon: 'FundProjectionScreenOutlined',
          routes: [
            { path: '/erp/demand-plan/plans', name: '需求计划单', icon: 'NodeIndexOutlined' },
            { path: '/erp/demand-plan/mrp-runs', name: 'MRP/LRP运算', icon: 'CalculatorOutlined' },
            { path: '/erp/demand-plan/net-requirements', name: '净需求', icon: 'FunnelPlotOutlined' },
            { path: '/erp/demand-plan/purchase-suggestions', name: '采购建议', icon: 'ContainerOutlined' },
            { path: '/erp/demand-plan/production-suggestions', name: '生产建议', icon: 'ToolOutlined' },
            { path: '/erp/demand-plan/plan-adjustments', name: '计划调整', icon: 'ScheduleOutlined' },
          ],
        },
        {
          path: '/erp/production',
          name: '生产管理',
          icon: 'BuildOutlined',
          routes: [
            { path: '/erp/production/orders', name: '生产订单', icon: 'ProfileOutlined' },
            { path: '/erp/production/splits', name: '订单拆分', icon: 'PartitionOutlined' },
            { path: '/erp/production/material-issues', name: '材料领用', icon: 'ExportOutlined' },
            { path: '/erp/production/material-additions', name: '生产补料', icon: 'ExperimentOutlined' },
            { path: '/erp/production/completion-receipts', name: '完工入库', icon: 'ImportOutlined' },
          ],
        },
        {
          path: '/erp/inventory',
          name: '库存核算',
          icon: 'DatabaseOutlined',
          routes: [
            { path: '/erp/inventory/balances', name: '库存余额', icon: 'NumberOutlined' },
            { path: '/erp/inventory/transactions', name: '库存流水', icon: 'SwapOutlined' },
            { path: '/erp/inventory/transfers', name: '库存调拨', icon: 'NodeExpandOutlined' },
            { path: '/erp/inventory/counts', name: '库存盘点', icon: 'AuditOutlined' },
            { path: '/erp/inventory/conversions', name: '形态转换', icon: 'RetweetOutlined' },
            { path: '/erp/inventory/scraps', name: '报废管理', icon: 'DeleteOutlined' },
            { path: '/erp/inventory/freezes', name: '库存冻结', icon: 'LockOutlined' },
            { path: '/erp/inventory/costs', name: '库存成本', icon: 'MoneyCollectOutlined' },
          ],
        },
        {
          path: '/erp/finance',
          name: '财务核算',
          icon: 'AccountBookOutlined',
          routes: [
            { path: '/erp/finance/accounts', name: '会计科目', icon: 'ProfileOutlined' },
            { path: '/erp/finance/periods', name: '会计期间', icon: 'CalendarOutlined' },
            { path: '/erp/finance/vouchers', name: '记账凭证', icon: 'FileTextOutlined' },
            { path: '/erp/finance/receivables', name: '应收单', icon: 'ImportOutlined' },
            { path: '/erp/finance/payables', name: '应付单', icon: 'ExportOutlined' },
            { path: '/erp/finance/payments', name: '收付款单', icon: 'TransactionOutlined' },
            { path: '/erp/finance/writeoffs', name: '核销单', icon: 'ReconciliationOutlined' },
            { path: '/erp/finance/invoices', name: '发票登记', icon: 'ContainerOutlined' },
            { path: '/erp/finance/bank-statements', name: '银行对账', icon: 'BankOutlined' },
            { path: '/erp/finance/cost-collections', name: '成本归集', icon: 'FundProjectionScreenOutlined' },
            { path: '/erp/finance/accruals', name: '暂估', icon: 'FieldTimeOutlined' },
          ],
        },
        {
          path: '/erp/trace',
          name: '业务单据追踪',
          icon: 'SearchOutlined',
          routes: [
            { path: '/erp/trace/docs', name: '单据追溯', icon: 'PartitionOutlined' },
            { path: '/erp/trace/events', name: '业务事件', icon: 'HistoryOutlined' },
          ],
        },
        {
          path: '/erp/barcode',
          name: '条码管理',
          icon: 'BarcodeOutlined',
          routes: [
            { path: '/erp/barcode/records', name: '条码生成', icon: 'QrcodeOutlined' },
            { path: '/erp/barcode/templates', name: '标签模板', icon: 'ProfileOutlined' },
            { path: '/erp/barcode/reprints', name: '补打记录', icon: 'RedoOutlined' },
            { path: '/erp/barcode/rules', name: '扫码规则', icon: 'ControlOutlined' },
            { path: '/erp/barcode/scans', name: '扫描校验', icon: 'ScanOutlined' },
          ],
        },
        {
          path: '/erp/process',
          name: '工艺资源',
          icon: 'ClusterOutlined',
          routes: [
            { path: '/erp/process/resources', name: '资源资料', icon: 'ToolOutlined' },
            { path: '/erp/process/standards', name: '标准工艺', icon: 'ProfileOutlined' },
            { path: '/erp/process/routes', name: '工艺路线', icon: 'NodeIndexOutlined' },
            { path: '/erp/process/plans', name: '工序计划', icon: 'ScheduleOutlined' },
            { path: '/erp/process/reports', name: '工序报工', icon: 'CarryOutOutlined' },
            { path: '/erp/process/labor-feedback', name: '工时反馈', icon: 'FieldTimeOutlined' },
          ],
        },
      ],
    },
    {
      path: '/srm',
      name: 'SRM 供应商协同',
      icon: 'ApartmentOutlined',
      routes: [
        {
          path: '/srm/supplier',
          name: '供应商全生命周期',
          icon: 'TeamOutlined',
          routes: [
            { path: '/srm/supplier/archives', name: '供应商主档', icon: 'DatabaseOutlined' },
            { path: '/srm/supplier/admissions', name: '供应商准入', icon: 'AuditOutlined' },
            { path: '/srm/supplier/qualifications', name: '供应商资质', icon: 'SafetyCertificateOutlined' },
            { path: '/srm/supplier/risks', name: '供应商风险', icon: 'WarningOutlined' },
            { path: '/srm/supplier/grades', name: '供应商分级', icon: 'StarOutlined' },
            { path: '/srm/supplier/blacklists', name: '供应商黑名单', icon: 'StopOutlined' },
            { path: '/srm/supplier/reviews', name: '年度复审', icon: 'ReconciliationOutlined' },
          ],
        },
        {
          path: '/srm/sourcing',
          name: '寻源与询报价',
          icon: 'ShoppingCartOutlined',
          routes: [
            { path: '/srm/sourcing/requests', name: '采购需求寻源', icon: 'FileSearchOutlined' },
            { path: '/srm/sourcing/rfqs', name: '询价单', icon: 'ProfileOutlined' },
            { path: '/srm/sourcing/rfq-suppliers', name: '询价邀请', icon: 'UsergroupAddOutlined' },
            { path: '/srm/sourcing/quotes', name: '供应商报价', icon: 'AccountBookOutlined' },
            { path: '/srm/sourcing/compares', name: '报价比价', icon: 'BarChartOutlined' },
            { path: '/srm/sourcing/awards', name: '定点定标', icon: 'TrophyOutlined' },
            { path: '/srm/sourcing/prices', name: '定点定价', icon: 'MoneyCollectOutlined' },
          ],
        },
        {
          path: '/srm/collab',
          name: '采购协同',
          icon: 'SwapOutlined',
          routes: [
            { path: '/srm/collab/po-confirms', name: '订单确认', icon: 'AuditOutlined' },
            { path: '/srm/collab/commitments', name: '交期承诺', icon: 'FieldTimeOutlined' },
            { path: '/srm/collab/changes', name: '变更确认', icon: 'DiffOutlined' },
            { path: '/srm/collab/appointments', name: '送货预约', icon: 'CalendarOutlined' },
            { path: '/srm/collab/asns', name: 'ASN发货通知', icon: 'CarOutlined' },
          ],
        },
        {
          path: '/srm/quality',
          name: '供应商质量',
          icon: 'ExperimentOutlined',
          routes: [
            { path: '/srm/quality/iqc', name: '来料质量', icon: 'FileProtectOutlined' },
            { path: '/srm/quality/assessments', name: '供应商考评', icon: 'RadarChartOutlined' },
            { path: '/srm/quality/eightd', name: '8D报告', icon: 'AlertOutlined' },
            { path: '/srm/quality/rectifications', name: '整改跟踪', icon: 'CheckSquareOutlined' },
          ],
        },
        {
          path: '/srm/portal',
          name: '供应商门户',
          icon: 'ShopOutlined',
          routes: [
            { path: '/srm/portal/accounts', name: '供应商账号', icon: 'UserSwitchOutlined' },
            { path: '/srm/portal/messages', name: '门户消息', icon: 'MessageOutlined' },
            { path: '/srm/portal/attachments', name: '门户附件', icon: 'PaperClipOutlined' },
          ],
        },
        {
          path: '/srm/edi',
          name: 'EDI协同',
          icon: 'ApiOutlined',
          routes: [
            { path: '/srm/edi/messages', name: 'EDI报文', icon: 'SendOutlined' },
            { path: '/srm/edi/receipts', name: 'EDI回执', icon: 'MailOutlined' },
            { path: '/srm/edi/reconciles', name: 'EDI对账', icon: 'ReconciliationOutlined' },
          ],
        },
      ],
    },
    {
      path: '/system',
      name: '系统管理',
      icon: 'SettingOutlined',
      routes: [
        { path: '/system/users', name: '用户管理' },
        { path: '/system/organizations', name: '组织管理' },
        { path: '/system/roles', name: '角色权限' },
        { path: '/system/dictionaries', name: '数据字典' },
        { path: '/system/configs', name: '配置项' },
        { path: '/system/audit-logs', name: '审计日志' },
      ],
    },
  ],
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, setCollapsed } = useAppStore();
  const { userInfo, logout } = useAuthStore();

  return (
    <ProLayout
      title="PLM 系统"
      logo={null}
      layout="mix"
      fixSiderbar
      fixedHeader
      collapsed={collapsed}
      onCollapse={setCollapsed}
      location={{ pathname: location.pathname }}
      route={menuRoute}
      menuItemRender={(item, dom) => (
        <div onClick={() => item.path && navigate(item.path)}>{dom}</div>
      )}
      avatarProps={{
        src: userInfo?.avatar,
        size: 'small',
        title: userInfo?.displayName || userInfo?.username || '用户',
        render: (_, dom) => (
          <Dropdown
            menu={{
              items: [
                { key: 'settings', icon: <SettingOutlined />, label: '个人设置' },
                { type: 'divider' as const },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: () => {
                    logout();
                    navigate('/login');
                  },
                },
              ],
            }}
          >
            {dom}
          </Dropdown>
        ),
      }}
      footerRender={() => (
        <div style={{ textAlign: 'center', padding: '8px 0', color: 'rgba(0,0,0,0.45)' }}>
          华为云团队交付版 · 制造业 PLM 系统 ©2024
        </div>
      )}
    >
      <Outlet />
    </ProLayout>
  );
}