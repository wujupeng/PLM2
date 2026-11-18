import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import AuthGuard from './AuthGuard';
import PermissionGuard from './PermissionGuard';

const Login = lazy(() => import('@/pages/login'));
const MainLayout = lazy(() => import('@/layouts/MainLayout'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const Products = lazy(() => import('@/pages/products'));
const Suppliers = lazy(() => import('@/pages/suppliers'));
const MaterialManagement = lazy(() => import('@/pages/material'));
const BomManagement = lazy(() => import('@/pages/bom'));
const EcoManagement = lazy(() => import('@/pages/eco'));
const DocumentManagement = lazy(() => import('@/pages/document'));
const CadIntegration = lazy(() => import('@/pages/cad'));
const TechSpec = lazy(() => import('@/pages/spec'));
const HarnessManagement = lazy(() => import('@/pages/harness'));
const ComplianceManagement = lazy(() => import('@/pages/compliance'));
const PackagingManagement = lazy(() => import('@/pages/packaging'));
const ProcessRoute = lazy(() => import('@/pages/process'));
const InspectionSpec = lazy(() => import('@/pages/inspection'));
const QualityIssue = lazy(() => import('@/pages/quality'));
const Manufacturing = lazy(() => import('@/pages/manufacturing'));
const CodeRule = lazy(() => import('@/pages/code-rule'));
const CodeDict = lazy(() => import('@/pages/code-dict'));
const LabelTemplate = lazy(() => import('@/pages/label-template'));
const Relabel = lazy(() => import('@/pages/relabel'));
const LabelPrint = lazy(() => import('@/pages/label-print'));
const EdiPartner = lazy(() => import('@/pages/edi/partner'));
const EdiTransSet = lazy(() => import('@/pages/edi/trans-set'));
const EdiMessageMap = lazy(() => import('@/pages/edi/message-map'));
const EdiMonitor = lazy(() => import('@/pages/edi/monitor'));
const EdiDemand = lazy(() => import('@/pages/edi/demand'));
const EdiDispatch = lazy(() => import('@/pages/edi/dispatch'));
const EdiAsn = lazy(() => import('@/pages/edi/asn'));
const EdiSupplierMaterial = lazy(() => import('@/pages/edi/supplier-material'));
const WmsLocation = lazy(() => import('@/pages/wms/location'));
const WmsKanban = lazy(() => import('@/pages/wms/kanban'));
const WmsDelivery = lazy(() => import('@/pages/wms/delivery'));
const WmsPick = lazy(() => import('@/pages/wms/pick'));
const WmsFifo = lazy(() => import('@/pages/wms/fifo'));
const WmsBinding = lazy(() => import('@/pages/wms/binding'));
const WmsLineStock = lazy(() => import('@/pages/wms/line-stock'));
const WmsShortage = lazy(() => import('@/pages/wms/shortage'));
const WmsPlan = lazy(() => import('@/pages/wms/plan'));
const MfgBatch = lazy(() => import('@/pages/mfg/batch'));
const MfgOperation = lazy(() => import('@/pages/mfg/operation'));
const MfgTest = lazy(() => import('@/pages/mfg/test'));
const MfgPackage = lazy(() => import('@/pages/mfg/package'));
const MfgShipment = lazy(() => import('@/pages/mfg/shipment'));
const MfgTrace = lazy(() => import('@/pages/mfg/trace'));
const MfgRecall = lazy(() => import('@/pages/mfg/recall'));
const IntEndpoint = lazy(() => import('@/pages/int/endpoint'));
const IntMasterData = lazy(() => import('@/pages/int/master-data'));
const IntQms = lazy(() => import('@/pages/int/qms'));
const IntMigration = lazy(() => import('@/pages/int/migration'));
const IntExport = lazy(() => import('@/pages/int/export'));
const IntTest = lazy(() => import('@/pages/int/test'));
const IntSecurity = lazy(() => import('@/pages/int/security'));
const IntGolive = lazy(() => import('@/pages/int/golive'));
const IntDefect = lazy(() => import('@/pages/int/defect'));
const SystemManagement = lazy(() => import('@/pages/system'));
const SystemUsers = lazy(() => import('@/pages/system/users'));
const SystemOrganizations = lazy(() => import('@/pages/system/organizations'));
const SystemRoles = lazy(() => import('@/pages/system/roles'));
const SystemDictionaries = lazy(() => import('@/pages/system/dictionaries'));
const SystemConfigs = lazy(() => import('@/pages/system/configs'));
const SystemAuditLogs = lazy(() => import('@/pages/system/audit-logs'));
const OaPortal = lazy(() => import('@/pages/oa/portal'));
const OaPosition = lazy(() => import('@/pages/oa/position'));
const OaEmployment = lazy(() => import('@/pages/oa/employment'));
const OaDelegation = lazy(() => import('@/pages/oa/delegation'));
const OaApplication = lazy(() => import('@/pages/oa/application'));
const OaSsoClient = lazy(() => import('@/pages/oa/sso-client'));
const OaFormDesigner = lazy(() => import('@/pages/oa/form'));
const OaProcessDesigner = lazy(() => import('@/pages/oa/process'));
const OaMyApplication = lazy(() => import('@/pages/oa/my-application'));
const OaTask = lazy(() => import('@/pages/oa/task'));
const OaApproval = lazy(() => import('@/pages/oa/approval'));
const OaProcessMonitor = lazy(() => import('@/pages/oa/monitor'));
const OaMail = lazy(() => import('@/pages/oa/mail'));
const OaNotification = lazy(() => import('@/pages/oa/notification'));
const OaNotifyTemplate = lazy(() => import('@/pages/oa/notify-template'));
const OaDocument = lazy(() => import('@/pages/oa/document'));
const OaKnowledge = lazy(() => import('@/pages/oa/knowledge'));
const OaHr = lazy(() => import('@/pages/oa/hr'));
const OaBizSales = lazy(() => import('@/pages/oa/biz/sales'));
const OaBizPurchase = lazy(() => import('@/pages/oa/biz/purchase'));
const OaBizQuality = lazy(() => import('@/pages/oa/biz/quality'));
const OaBizRd = lazy(() => import('@/pages/oa/biz/rd'));
const OaMeeting = lazy(() => import('@/pages/oa/meeting'));
const OaCollab = lazy(() => import('@/pages/oa/collab'));
const OaAddressBook = lazy(() => import('@/pages/oa/address-book'));
const OaMobileAdmin = lazy(() => import('@/pages/oa/mobile-admin'));
const OaAssetRepair = lazy(() => import('@/pages/oa/asset/repair'));
const OaContract = lazy(() => import('@/pages/oa/special/contract'));
const OaOfficeSupply = lazy(() => import('@/pages/oa/special/office-supply'));
const OaLibrary = lazy(() => import('@/pages/oa/special/library'));
const OaCustomer = lazy(() => import('@/pages/oa/special/customer'));
const OaI18nFactory = lazy(() => import('@/pages/oa/system/i18n'));
const OaLogCenter = lazy(() => import('@/pages/oa/system/log-center'));
const OaIntegrationGateway = lazy(() => import('@/pages/oa/integration/gateway'));
const OaIntegrationWebhook = lazy(() => import('@/pages/oa/integration/webhook'));
const OaIntegrationTask = lazy(() => import('@/pages/oa/integration/task'));
const OaIntegrationConnector = lazy(() => import('@/pages/oa/integration/connector'));
const OaIntegrationEdi = lazy(() => import('@/pages/oa/integration/edi'));
const OaIntegrationMonitor = lazy(() => import('@/pages/oa/integration/monitor'));
const OaMigrationObject = lazy(() => import('@/pages/oa/migration/object'));
const OaMigrationBatch = lazy(() => import('@/pages/oa/migration/batch'));
const OaMigrationAttachment = lazy(() => import('@/pages/oa/migration/attachment'));
const OaMigrationHistoryFlow = lazy(() => import('@/pages/oa/migration/history-flow'));
const OaMigrationReconcile = lazy(() => import('@/pages/oa/migration/reconcile'));
const OaMigrationDualRun = lazy(() => import('@/pages/oa/migration/dual-run'));
const OaTestTestCase = lazy(() => import('@/pages/oa/test/case'));
const OaTestPermission = lazy(() => import('@/pages/oa/test/permission'));
const OaTestSecurity = lazy(() => import('@/pages/oa/test/security'));
const OaTestPerformance = lazy(() => import('@/pages/oa/test/performance'));
const OaTestCompatibility = lazy(() => import('@/pages/oa/test/compatibility'));
const OaTestBackupDrill = lazy(() => import('@/pages/oa/test/backup-drill'));
const OaTestUat = lazy(() => import('@/pages/oa/test/uat'));
const OaTestTraining = lazy(() => import('@/pages/oa/test/training'));
const OaTestCutover = lazy(() => import('@/pages/oa/test/cutover'));
const OaGoliveFreeze = lazy(() => import('@/pages/oa/golive/freeze'));
const OaGoliveFinalMigration = lazy(() => import('@/pages/oa/golive/final-migration'));
const OaGoliveEntrySwitch = lazy(() => import('@/pages/oa/golive/entry-switch'));
const OaGoliveWatch = lazy(() => import('@/pages/oa/golive/watch'));
const OaGoliveRollback = lazy(() => import('@/pages/oa/golive/rollback'));
const OaGoliveLegacyArchive = lazy(() => import('@/pages/oa/golive/legacy-archive'));
const OaGoliveDecommission = lazy(() => import('@/pages/oa/golive/decommission'));
const OaGoliveHandover = lazy(() => import('@/pages/oa/golive/handover'));
const PlatformIntegrationApiRegistry = lazy(() => import('@/pages/platform/integration/api-registry'));
const PlatformIntegrationEventTopics = lazy(() => import('@/pages/platform/integration/event-topics'));
const PlatformIntegrationEventSubscriptions = lazy(() => import('@/pages/platform/integration/event-subscriptions'));
const PlatformIntegrationEventMessages = lazy(() => import('@/pages/platform/integration/event-messages'));
const PlatformIntegrationDeadLetters = lazy(() => import('@/pages/platform/integration/dead-letters'));
const PlatformIntegrationIdempotentRecords = lazy(() => import('@/pages/platform/integration/idempotent-records'));
const PlatformIntegrationMonitor = lazy(() => import('@/pages/platform/integration/monitor'));
const PlatformReportIndicators = lazy(() => import('@/pages/platform/report/indicators'));
const PlatformReportDatasets = lazy(() => import('@/pages/platform/report/datasets'));
const PlatformReportDefinitions = lazy(() => import('@/pages/platform/report/definitions'));
const PlatformReportExportLogs = lazy(() => import('@/pages/platform/report/export-logs'));
const PlatformReportDashboards = lazy(() => import('@/pages/platform/report/dashboards'));
const PlatformFileAttachments = lazy(() => import('@/pages/platform/file/attachments'));
const PlatformFileVersions = lazy(() => import('@/pages/platform/file/versions'));
const PlatformFilePreviewTasks = lazy(() => import('@/pages/platform/file/preview-tasks'));
const PlatformFileScanRecords = lazy(() => import('@/pages/platform/file/scan-records'));
const PlatformFileArchives = lazy(() => import('@/pages/platform/file/archives'));
const PlatformIamMfaBindings = lazy(() => import('@/pages/platform/iam/mfa-bindings'));
const PlatformIamMfaVerifyLogs = lazy(() => import('@/pages/platform/iam/mfa-verify-logs'));
const PlatformIamSsoProviders = lazy(() => import('@/pages/platform/iam/sso-providers'));
const PlatformIamFieldPermissions = lazy(() => import('@/pages/platform/iam/field-permissions'));
const PlatformIamSodRules = lazy(() => import('@/pages/platform/iam/sod-rules'));
const PlatformIamSodViolations = lazy(() => import('@/pages/platform/iam/sod-violations'));
const PlatformOrgLegalEntities = lazy(() => import('@/pages/platform/org/legal-entities'));
const PlatformOrgFactories = lazy(() => import('@/pages/platform/org/factories'));
const PlatformOrgWarehouses = lazy(() => import('@/pages/platform/org/warehouses'));
const PlatformOrgProductionLines = lazy(() => import('@/pages/platform/org/production-lines'));
const PlatformOrgOrgGrants = lazy(() => import('@/pages/platform/org/org-grants'));
const PlatformFinanceCurrencies = lazy(() => import('@/pages/platform/finance/currencies'));
const PlatformFinanceExchangeRates = lazy(() => import('@/pages/platform/finance/exchange-rates'));
const PlatformFinanceTaxRates = lazy(() => import('@/pages/platform/finance/tax-rates'));
const PlatformFinancePriceRules = lazy(() => import('@/pages/platform/finance/price-rules'));
const PlatformFinanceRoundingRules = lazy(() => import('@/pages/platform/finance/rounding-rules'));
const PlatformDocStateDefs = lazy(() => import('@/pages/platform/doc-state/state-defs'));
const PlatformDocStateTransitions = lazy(() => import('@/pages/platform/doc-state/transitions'));
const PlatformDocStateLogs = lazy(() => import('@/pages/platform/doc-state/state-logs'));
const PlatformApprovalFlows = lazy(() => import('@/pages/platform/approval/flows'));
const PlatformApprovalConditions = lazy(() => import('@/pages/platform/approval/conditions'));
const PlatformApprovalNodes = lazy(() => import('@/pages/platform/approval/nodes'));
const PlatformApprovalInstances = lazy(() => import('@/pages/platform/approval/instances'));
const PlatformApprovalTasks = lazy(() => import('@/pages/platform/approval/tasks'));
const PlatformBizRuleRules = lazy(() => import('@/pages/platform/biz-rule/rules'));
const PlatformBizRuleParams = lazy(() => import('@/pages/platform/biz-rule/params'));
const PlatformBizRuleLogs = lazy(() => import('@/pages/platform/biz-rule/logs'));
const PlatformDataQualityRules = lazy(() => import('@/pages/platform/data-quality/rules'));
const PlatformDataQualityExceptions = lazy(() => import('@/pages/platform/data-quality/exceptions'));
const PlatformDataQualityCodeRules = lazy(() => import('@/pages/platform/data-quality/code-rules'));
const PlatformMobileDevices = lazy(() => import('@/pages/platform/mobile/devices'));
const PlatformMobileScenes = lazy(() => import('@/pages/platform/mobile/scenes'));
const PlatformMobileScanLogs = lazy(() => import('@/pages/platform/mobile/scan-logs'));
const PlatformMobileLabelRules = lazy(() => import('@/pages/platform/mobile/label-rules'));
const PlatformMobileExceptions = lazy(() => import('@/pages/platform/mobile/exceptions'));
const PlatformGovProjects = lazy(() => import('@/pages/platform/governance/projects'));
const PlatformGovMilestones = lazy(() => import('@/pages/platform/governance/milestones'));
const PlatformGovTasks = lazy(() => import('@/pages/platform/governance/tasks'));
const PlatformGovRisks = lazy(() => import('@/pages/platform/governance/risks'));
const PlatformGovAsisSystems = lazy(() => import('@/pages/platform/governance/asis-systems'));
const PlatformGovAsisFindings = lazy(() => import('@/pages/platform/governance/asis-findings'));
const PlatformGovProcesses = lazy(() => import('@/pages/platform/governance/processes'));
const PlatformGovProcessNodes = lazy(() => import('@/pages/platform/governance/process-nodes'));
const PlatformGovRequirements = lazy(() => import('@/pages/platform/governance/requirements'));
const PlatformGovTraceLinks = lazy(() => import('@/pages/platform/governance/trace-links'));
const PlatformGovArchComponents = lazy(() => import('@/pages/platform/governance/arch-components'));
const PlatformGovArchRelations = lazy(() => import('@/pages/platform/governance/arch-relations'));
const PlatformDevopsRepositories = lazy(() => import('@/pages/platform/devops/repositories'));
const PlatformDevopsPipelines = lazy(() => import('@/pages/platform/devops/pipelines'));
const PlatformDevopsEnvironments = lazy(() => import('@/pages/platform/devops/environments'));
const PlatformDevopsBuildRuns = lazy(() => import('@/pages/platform/devops/build-runs'));
const PlatformDevopsGates = lazy(() => import('@/pages/platform/devops/gates'));
const PlatformMdmDomains = lazy(() => import('@/pages/platform/mdm/domains'));
const PlatformMdmSources = lazy(() => import('@/pages/platform/mdm/sources'));
const PlatformMdmCodeStandards = lazy(() => import('@/pages/platform/mdm/code-standards'));
const PlatformMdmDistributions = lazy(() => import('@/pages/platform/mdm/distributions'));
const PlatformMdmChangeRequests = lazy(() => import('@/pages/platform/mdm/change-requests'));
const PlatformMdmQualityChecks = lazy(() => import('@/pages/platform/mdm/quality-checks'));
const PlatformMdmSyncLogs = lazy(() => import('@/pages/platform/mdm/sync-logs'));
const PlatformMdmCodeIssues = lazy(() => import('@/pages/platform/mdm/code-issues'));
const ErpBaseMaterials = lazy(() => import('@/pages/erp/base/materials'));
const ErpBaseCustomers = lazy(() => import('@/pages/erp/base/customers'));
const ErpBaseCustomerContacts = lazy(() => import('@/pages/erp/base/customer-contacts'));
const ErpBaseSuppliers = lazy(() => import('@/pages/erp/base/suppliers'));
const ErpBaseUoms = lazy(() => import('@/pages/erp/base/uoms'));
const ErpBaseUomConversions = lazy(() => import('@/pages/erp/base/uom-conversions'));
const ErpBaseProjects = lazy(() => import('@/pages/erp/base/projects'));
const ErpSalesForecasts = lazy(() => import('@/pages/erp/sales/forecasts'));
const ErpSalesOrders = lazy(() => import('@/pages/erp/sales/orders'));
const ErpSalesOrderChanges = lazy(() => import('@/pages/erp/sales/order-changes'));
const ErpSalesDeliveryReviews = lazy(() => import('@/pages/erp/sales/delivery-reviews'));
const ErpSalesDeliveries = lazy(() => import('@/pages/erp/sales/deliveries'));
const ErpSalesOutbounds = lazy(() => import('@/pages/erp/sales/outbounds'));
const ErpSalesReturns = lazy(() => import('@/pages/erp/sales/returns'));
const ErpSalesInvoices = lazy(() => import('@/pages/erp/sales/invoices'));
const ErpSalesReceivables = lazy(() => import('@/pages/erp/sales/receivables'));
const ErpPurchaseRequisitions = lazy(() => import('@/pages/erp/purchase/requisitions'));
const ErpPurchaseInquiries = lazy(() => import('@/pages/erp/purchase/inquiries'));
const ErpPurchaseOrders = lazy(() => import('@/pages/erp/purchase/orders'));
const ErpGoodsReceipts = lazy(() => import('@/pages/erp/purchase/receipts'));
const ErpPurchaseInspections = lazy(() => import('@/pages/erp/purchase/inspections'));
const ErpPurchaseInbounds = lazy(() => import('@/pages/erp/purchase/inbounds'));
const ErpPurchaseInvoices = lazy(() => import('@/pages/erp/purchase/invoices'));
const ErpPurchaseReturns = lazy(() => import('@/pages/erp/purchase/returns'));
const ErpPurchaseSettlements = lazy(() => import('@/pages/erp/purchase/settlements'));
const ErpOutsourceOrders = lazy(() => import('@/pages/erp/outsource/orders'));
const ErpOutsourceIssues = lazy(() => import('@/pages/erp/outsource/issues'));
const ErpOutsourceReceipts = lazy(() => import('@/pages/erp/outsource/receipts'));
const ErpOutsourceInspections = lazy(() => import('@/pages/erp/outsource/inspections'));
const ErpOutsourceInbounds = lazy(() => import('@/pages/erp/outsource/inbounds'));
const ErpOutsourceInvoices = lazy(() => import('@/pages/erp/outsource/invoices'));
const ErpOutsourceSettlements = lazy(() => import('@/pages/erp/outsource/settlements'));
const ErpOutsourceWriteoffs = lazy(() => import('@/pages/erp/outsource/writeoffs'));
const ErpOutsourceReturns = lazy(() => import('@/pages/erp/outsource/returns'));
const ErpDemandPlans = lazy(() => import('@/pages/erp/demand-plan/plans'));
const ErpMrpRuns = lazy(() => import('@/pages/erp/demand-plan/mrp-runs'));
const ErpNetRequirements = lazy(() => import('@/pages/erp/demand-plan/net-requirements'));
const ErpPurchaseSuggestions = lazy(() => import('@/pages/erp/demand-plan/purchase-suggestions'));
const ErpProductionSuggestions = lazy(() => import('@/pages/erp/demand-plan/production-suggestions'));
const ErpPlanAdjustments = lazy(() => import('@/pages/erp/demand-plan/plan-adjustments'));
const ErpProductionOrders = lazy(() => import('@/pages/erp/production/orders'));
const ErpProductionOrderSplits = lazy(() => import('@/pages/erp/production/splits'));
const ErpMaterialIssues = lazy(() => import('@/pages/erp/production/material-issues'));
const ErpMaterialAdditions = lazy(() => import('@/pages/erp/production/material-additions'));
const ErpCompletionReceipts = lazy(() => import('@/pages/erp/production/completion-receipts'));
const ErpInventoryBalances = lazy(() => import('@/pages/erp/inventory/balances'));
const ErpInventoryTransactions = lazy(() => import('@/pages/erp/inventory/transactions'));
const ErpInventoryTransfers = lazy(() => import('@/pages/erp/inventory/transfers'));
const ErpInventoryCounts = lazy(() => import('@/pages/erp/inventory/counts'));
const ErpInventoryConversions = lazy(() => import('@/pages/erp/inventory/conversions'));
const ErpInventoryScraps = lazy(() => import('@/pages/erp/inventory/scraps'));
const ErpInventoryFreezes = lazy(() => import('@/pages/erp/inventory/freezes'));
const ErpInventoryCosts = lazy(() => import('@/pages/erp/inventory/costs'));
const ErpFinanceAccounts = lazy(() => import('@/pages/erp/finance/accounts'));
const ErpFinancePeriods = lazy(() => import('@/pages/erp/finance/periods'));
const ErpFinanceVouchers = lazy(() => import('@/pages/erp/finance/vouchers'));
const ErpFinanceReceivables = lazy(() => import('@/pages/erp/finance/receivables'));
const ErpFinancePayables = lazy(() => import('@/pages/erp/finance/payables'));
const ErpFinancePayments = lazy(() => import('@/pages/erp/finance/payments'));
const ErpFinanceWriteoffs = lazy(() => import('@/pages/erp/finance/writeoffs'));
const ErpFinanceInvoices = lazy(() => import('@/pages/erp/finance/invoices'));
const ErpFinanceBankStatements = lazy(() => import('@/pages/erp/finance/bank-statements'));
const ErpFinanceCostCollections = lazy(() => import('@/pages/erp/finance/cost-collections'));
const ErpFinanceAccruals = lazy(() => import('@/pages/erp/finance/accruals'));
const ErpTraceDocs = lazy(() => import('@/pages/erp/trace/docs'));
const ErpTraceEvents = lazy(() => import('@/pages/erp/trace/events'));
const ErpBarcodeRecords = lazy(() => import('@/pages/erp/barcode/records'));
const ErpBarcodeTemplates = lazy(() => import('@/pages/erp/barcode/templates'));
const ErpBarcodeReprints = lazy(() => import('@/pages/erp/barcode/reprints'));
const ErpBarcodeRules = lazy(() => import('@/pages/erp/barcode/rules'));
const ErpBarcodeScans = lazy(() => import('@/pages/erp/barcode/scans'));
const ErpProcessResources = lazy(() => import('@/pages/erp/process/resources'));
const ErpProcessStandards = lazy(() => import('@/pages/erp/process/standards'));
const ErpProcessRoutes = lazy(() => import('@/pages/erp/process/routes'));
const ErpProcessPlans = lazy(() => import('@/pages/erp/process/plans'));
const ErpProcessReports = lazy(() => import('@/pages/erp/process/reports'));
const ErpProcessLaborFeedback = lazy(() => import('@/pages/erp/process/labor-feedback'));
const SrmSupplierArchives = lazy(() => import('@/pages/srm/supplier/archives'));
const SrmSupplierAdmissions = lazy(() => import('@/pages/srm/supplier/admissions'));
const SrmSupplierQualifications = lazy(() => import('@/pages/srm/supplier/qualifications'));
const SrmSupplierRisks = lazy(() => import('@/pages/srm/supplier/risks'));
const SrmSupplierGrades = lazy(() => import('@/pages/srm/supplier/grades'));
const SrmSupplierBlacklists = lazy(() => import('@/pages/srm/supplier/blacklists'));
const SrmSupplierReviews = lazy(() => import('@/pages/srm/supplier/reviews'));
const SrmSourcingRequests = lazy(() => import('@/pages/srm/sourcing/requests'));
const SrmRfqs = lazy(() => import('@/pages/srm/sourcing/rfqs'));
const SrmRfqSuppliers = lazy(() => import('@/pages/srm/sourcing/rfq-suppliers'));
const SrmSupplierQuotes = lazy(() => import('@/pages/srm/sourcing/quotes'));
const SrmPriceCompares = lazy(() => import('@/pages/srm/sourcing/compares'));
const SrmAwards = lazy(() => import('@/pages/srm/sourcing/awards'));
const SrmPriceAgreements = lazy(() => import('@/pages/srm/sourcing/prices'));
const SrmPoConfirmations = lazy(() => import('@/pages/srm/collab/po-confirms'));
const SrmDeliveryCommitments = lazy(() => import('@/pages/srm/collab/commitments'));
const SrmPoChanges = lazy(() => import('@/pages/srm/collab/changes'));
const SrmDeliveryAppointments = lazy(() => import('@/pages/srm/collab/appointments'));
const SrmAsns = lazy(() => import('@/pages/srm/collab/asns'));
const SrmIncomingQualities = lazy(() => import('@/pages/srm/quality/iqc'));
const SrmSupplierAssessments = lazy(() => import('@/pages/srm/quality/assessments'));
const SrmEightDReports = lazy(() => import('@/pages/srm/quality/eightd'));
const SrmRectifications = lazy(() => import('@/pages/srm/quality/rectifications'));
const SrmPortalAccounts = lazy(() => import('@/pages/srm/portal/accounts'));
const SrmPortalMessages = lazy(() => import('@/pages/srm/portal/messages'));
const SrmPortalAttachments = lazy(() => import('@/pages/srm/portal/attachments'));
const SrmEdiMessages = lazy(() => import('@/pages/srm/edi/messages'));
const SrmEdiReceipts = lazy(() => import('@/pages/srm/edi/receipts'));
const SrmEdiReconciles = lazy(() => import('@/pages/srm/edi/reconciles'));
const WmsBaseWarehouses = lazy(() => import('@/pages/wms/base/warehouses'));
const WmsBaseZones = lazy(() => import('@/pages/wms/base/zones'));
const WmsBaseBins = lazy(() => import('@/pages/wms/base/bins'));
const WmsBaseRacks = lazy(() => import('@/pages/wms/base/racks'));
const WmsBaseContainers = lazy(() => import('@/pages/wms/base/containers'));
const WmsBaseStrategies = lazy(() => import('@/pages/wms/base/strategies'));
const WmsInboundAsns = lazy(() => import('@/pages/wms/inbound/asns'));
const WmsInboundReceipts = lazy(() => import('@/pages/wms/inbound/receipts'));
const WmsInboundPutaways = lazy(() => import('@/pages/wms/inbound/putaways'));
const WmsInventoryBatches = lazy(() => import('@/pages/wms/inventory/batches'));
const WmsInventorySerials = lazy(() => import('@/pages/wms/inventory/serials'));
const WmsInventoryFreezes = lazy(() => import('@/pages/wms/inventory/freezes'));
const WmsPickTasks = lazy(() => import('@/pages/wms/pick/tasks'));
const WmsPickKittings = lazy(() => import('@/pages/wms/pick/kittings'));
const WmsPickLineStocks = lazy(() => import('@/pages/wms/pick/line-stocks'));
const WmsReturnOrders = lazy(() => import('@/pages/wms/return/returns'));
const WmsReturnReplenishes = lazy(() => import('@/pages/wms/return/replenishes'));
const WmsReturnDiffs = lazy(() => import('@/pages/wms/return/diffs'));
const WmsFinishedGoods = lazy(() => import('@/pages/wms/outbound/finished-goods'));
const WmsOutboundWaves = lazy(() => import('@/pages/wms/outbound/waves'));
const WmsShipmentOrders = lazy(() => import('@/pages/wms/outbound/shipments'));
const WmsStocktakeOrders = lazy(() => import('@/pages/wms/stocktake/orders'));
const WmsStocktakeDiffs = lazy(() => import('@/pages/wms/stocktake/diffs'));
const WmsStocktakeTransfers = lazy(() => import('@/pages/wms/stocktake/transfers'));
const WmsVmiBins = lazy(() => import('@/pages/wms/vmi/bins'));
const WmsVmiScans = lazy(() => import('@/pages/wms/vmi/scans'));
const WmsVmiWarnings = lazy(() => import('@/pages/wms/vmi/warnings'));
const MesProdOrders = lazy(() => import('@/pages/mes/plan/orders'));
const MesSchedules = lazy(() => import('@/pages/mes/plan/schedules'));
const MesDispatches = lazy(() => import('@/pages/mes/plan/dispatches'));
const MesProcessVersions = lazy(() => import('@/pages/mes/craft/versions'));
const MesSops = lazy(() => import('@/pages/mes/craft/sops'));
const MesRecipes = lazy(() => import('@/pages/mes/craft/recipes'));
const MesFais = lazy(() => import('@/pages/mes/craft/fais'));
const MesChangeovers = lazy(() => import('@/pages/mes/craft/changeovers'));
const MesWorkReports = lazy(() => import('@/pages/mes/report/works'));
const MesReplenishes = lazy(() => import('@/pages/mes/report/replenishes'));
const MesLabors = lazy(() => import('@/pages/mes/report/labors'));
const MobileLayout = lazy(() => import('@/layouts/MobileLayout'));
const MobileWorkbench = lazy(() => import('@/pages/mobile/workbench'));
const MobileTasks = lazy(() => import('@/pages/mobile/tasks'));
const MobileApprovals = lazy(() => import('@/pages/mobile/approvals'));
const MobileMail = lazy(() => import('@/pages/mobile/mail'));
const MobileDocs = lazy(() => import('@/pages/mobile/docs'));
const MobileNotifications = lazy(() => import('@/pages/mobile/notifications'));
const MobileMore = lazy(() => import('@/pages/mobile/more'));
const NotFound = lazy(() => import('@/pages/404'));

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />}>
    {element}
  </Suspense>
);

/** 页面级权限包装：无对应权限码时展示 403 */
const withPermission = (permission: string, element: React.ReactNode) =>
  withSuspense(<PermissionGuard permission={permission}>{element}</PermissionGuard>);

const routes: RouteObject[] = [
  {
    path: '/login',
    element: withSuspense(<Login />),
  },
  {
    path: '/',
    element: <AuthGuard>{withSuspense(<MainLayout />)}</AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(<Dashboard />) },
      { path: 'products', element: withPermission('product:list', <Products />) },
      { path: 'suppliers', element: withPermission('supplier:list', <Suppliers />) },
      { path: 'material', element: withPermission('material:list', <MaterialManagement />) },
      { path: 'bom', element: withPermission('bom:list', <BomManagement />) },
      { path: 'eco', element: withPermission('eco:list', <EcoManagement />) },
      { path: 'document', element: withPermission('doc:list', <DocumentManagement />) },
      { path: 'cad', element: withPermission('cad:list', <CadIntegration />) },
      { path: 'spec', element: withPermission('spec:list', <TechSpec />) },
      { path: 'harness', element: withPermission('harness:list', <HarnessManagement />) },
      { path: 'compliance', element: withPermission('compliance:list', <ComplianceManagement />) },
      { path: 'packaging', element: withPermission('packaging:list', <PackagingManagement />) },
      { path: 'process', element: withPermission('process:list', <ProcessRoute />) },
      { path: 'inspection', element: withPermission('inspection:list', <InspectionSpec />) },
      { path: 'quality', element: withPermission('quality:list', <QualityIssue />) },
      { path: 'manufacturing', element: withSuspense(<Manufacturing />) },
      { path: 'relabel', element: withPermission('relabel:workbench', <Relabel />) },
      { path: 'code-rule', element: withPermission('code:rule:list', <CodeRule />) },
      { path: 'code-dict', element: withPermission('code:dict:list', <CodeDict />) },
      { path: 'label-template', element: withPermission('label:template:list', <LabelTemplate />) },
      { path: 'label-print', element: withPermission('label:print:log', <LabelPrint />) },
      { path: 'edi/partner', element: withPermission('edi:partner:list', <EdiPartner />) },
      { path: 'edi/trans-set', element: withPermission('edi:transset:list', <EdiTransSet />) },
      { path: 'edi/message-map', element: withPermission('edi:map:list', <EdiMessageMap />) },
      { path: 'edi/monitor', element: withPermission('edi:monitor:list', <EdiMonitor />) },
      { path: 'edi/demand', element: withPermission('edi:demand:list', <EdiDemand />) },
      { path: 'edi/dispatch', element: withPermission('edi:dispatch:list', <EdiDispatch />) },
      { path: 'edi/asn', element: withPermission('edi:asn:list', <EdiAsn />) },
      { path: 'edi/supplier-material', element: withPermission('edi:suppliermaterial:list', <EdiSupplierMaterial />) },
      { path: 'wms/location', element: withPermission('wms:location:list', <WmsLocation />) },
      { path: 'wms/kanban', element: withPermission('wms:kanban:list', <WmsKanban />) },
      { path: 'wms/delivery', element: withPermission('wms:delivery:list', <WmsDelivery />) },
      { path: 'wms/pick', element: withPermission('wms:pick:list', <WmsPick />) },
      { path: 'wms/fifo', element: withPermission('wms:fifo:list', <WmsFifo />) },
      { path: 'wms/binding', element: withPermission('wms:binding:list', <WmsBinding />) },
      { path: 'wms/line-stock', element: withPermission('wms:linestock:list', <WmsLineStock />) },
      { path: 'wms/shortage', element: withPermission('wms:shortage:list', <WmsShortage />) },
      { path: 'wms/plan', element: withPermission('wms:plan:list', <WmsPlan />) },
      { path: 'mfg/batch', element: withPermission('mfg:batch:list', <MfgBatch />) },
      { path: 'mfg/operation', element: withPermission('mfg:operation:list', <MfgOperation />) },
      { path: 'mfg/test', element: withPermission('mfg:test:list', <MfgTest />) },
      { path: 'mfg/package', element: withPermission('mfg:package:list', <MfgPackage />) },
      { path: 'mfg/shipment', element: withPermission('mfg:shipment:list', <MfgShipment />) },
      { path: 'mfg/trace', element: withPermission('mfg:trace:list', <MfgTrace />) },
      { path: 'mfg/recall', element: withPermission('mfg:recall:list', <MfgRecall />) },
      { path: 'int/endpoint', element: withPermission('int:endpoint:list', <IntEndpoint />) },
      { path: 'int/master-data', element: withPermission('int:mds:list', <IntMasterData />) },
      { path: 'int/qms', element: withPermission('int:qms:list', <IntQms />) },
      { path: 'int/migration', element: withPermission('int:migration:list', <IntMigration />) },
      { path: 'int/export', element: withPermission('int:export:list', <IntExport />) },
      { path: 'int/test', element: withPermission('int:test:list', <IntTest />) },
      { path: 'int/security', element: withPermission('int:security:list', <IntSecurity />) },
      { path: 'int/golive', element: withPermission('int:golive:list', <IntGolive />) },
      { path: 'int/defect', element: withPermission('int:defect:list', <IntDefect />) },
      {
        path: 'platform/integration/api-registry',
        element: withPermission('platform:integration:api:list', <PlatformIntegrationApiRegistry />),
      },
      {
        path: 'platform/integration/event-topics',
        element: withPermission('platform:integration:topic:list', <PlatformIntegrationEventTopics />),
      },
      {
        path: 'platform/integration/event-subscriptions',
        element: withPermission('platform:integration:subscription:list', <PlatformIntegrationEventSubscriptions />),
      },
      {
        path: 'platform/integration/event-messages',
        element: withPermission('platform:integration:message:list', <PlatformIntegrationEventMessages />),
      },
      {
        path: 'platform/integration/dead-letters',
        element: withPermission('platform:integration:deadletter:list', <PlatformIntegrationDeadLetters />),
      },
      {
        path: 'platform/integration/idempotent-records',
        element: withPermission('platform:integration:idempotent:list', <PlatformIntegrationIdempotentRecords />),
      },
      {
        path: 'platform/integration/monitor',
        element: withPermission('platform:integration:monitor:list', <PlatformIntegrationMonitor />),
      },
      {
        path: 'platform/report/indicators',
        element: withPermission('platform:report:indicator:list', <PlatformReportIndicators />),
      },
      {
        path: 'platform/report/datasets',
        element: withPermission('platform:report:dataset:list', <PlatformReportDatasets />),
      },
      {
        path: 'platform/report/definitions',
        element: withPermission('platform:report:definition:list', <PlatformReportDefinitions />),
      },
      {
        path: 'platform/report/export-logs',
        element: withPermission('platform:report:exportlog:list', <PlatformReportExportLogs />),
      },
      {
        path: 'platform/report/dashboards',
        element: withPermission('platform:report:dashboard:list', <PlatformReportDashboards />),
      },
      {
        path: 'platform/file/attachments',
        element: withPermission('platform:file:attachment:list', <PlatformFileAttachments />),
      },
      {
        path: 'platform/file/versions',
        element: withPermission('platform:file:version:list', <PlatformFileVersions />),
      },
      {
        path: 'platform/file/preview-tasks',
        element: withPermission('platform:file:preview:list', <PlatformFilePreviewTasks />),
      },
      {
        path: 'platform/file/scan-records',
        element: withPermission('platform:file:scan:list', <PlatformFileScanRecords />),
      },
      {
        path: 'platform/file/archives',
        element: withPermission('platform:file:archive:list', <PlatformFileArchives />),
      },
      {
        path: 'platform/iam/mfa-bindings',
        element: withPermission('platform:iam:mfa:list', <PlatformIamMfaBindings />),
      },
      {
        path: 'platform/iam/mfa-verify-logs',
        element: withPermission('platform:iam:mfaverify:list', <PlatformIamMfaVerifyLogs />),
      },
      {
        path: 'platform/iam/sso-providers',
        element: withPermission('platform:iam:ssoprovider:list', <PlatformIamSsoProviders />),
      },
      {
        path: 'platform/iam/field-permissions',
        element: withPermission('platform:iam:fieldperm:list', <PlatformIamFieldPermissions />),
      },
      {
        path: 'platform/iam/sod-rules',
        element: withPermission('platform:iam:sodrule:list', <PlatformIamSodRules />),
      },
      {
        path: 'platform/iam/sod-violations',
        element: withPermission('platform:iam:sodviolation:list', <PlatformIamSodViolations />),
      },
      {
        path: 'platform/org/legal-entities',
        element: withPermission('platform:org:legalentity:list', <PlatformOrgLegalEntities />),
      },
      {
        path: 'platform/org/factories',
        element: withPermission('platform:org:factory:list', <PlatformOrgFactories />),
      },
      {
        path: 'platform/org/warehouses',
        element: withPermission('platform:org:warehouse:list', <PlatformOrgWarehouses />),
      },
      {
        path: 'platform/org/production-lines',
        element: withPermission('platform:org:productionline:list', <PlatformOrgProductionLines />),
      },
      {
        path: 'platform/org/org-grants',
        element: withPermission('platform:org:orggrant:list', <PlatformOrgOrgGrants />),
      },
      {
        path: 'platform/finance/currencies',
        element: withPermission('platform:finance:currency:list', <PlatformFinanceCurrencies />),
      },
      {
        path: 'platform/finance/exchange-rates',
        element: withPermission('platform:finance:exchangerate:list', <PlatformFinanceExchangeRates />),
      },
      {
        path: 'platform/finance/tax-rates',
        element: withPermission('platform:finance:taxrate:list', <PlatformFinanceTaxRates />),
      },
      {
        path: 'platform/finance/price-rules',
        element: withPermission('platform:finance:pricerule:list', <PlatformFinancePriceRules />),
      },
      {
        path: 'platform/finance/rounding-rules',
        element: withPermission('platform:finance:roundingrule:list', <PlatformFinanceRoundingRules />),
      },
      {
        path: 'platform/doc-state/state-defs',
        element: withPermission('platform:docstate:docstate:list', <PlatformDocStateDefs />),
      },
      {
        path: 'platform/doc-state/transitions',
        element: withPermission('platform:docstate:transition:list', <PlatformDocStateTransitions />),
      },
      {
        path: 'platform/doc-state/state-logs',
        element: withPermission('platform:docstate:statelog:list', <PlatformDocStateLogs />),
      },
      {
        path: 'platform/approval/flows',
        element: withPermission('platform:approval:flow:list', <PlatformApprovalFlows />),
      },
      {
        path: 'platform/approval/conditions',
        element: withPermission('platform:approval:condition:list', <PlatformApprovalConditions />),
      },
      {
        path: 'platform/approval/nodes',
        element: withPermission('platform:approval:node:list', <PlatformApprovalNodes />),
      },
      {
        path: 'platform/approval/instances',
        element: withPermission('platform:approval:instance:list', <PlatformApprovalInstances />),
      },
      {
        path: 'platform/approval/tasks',
        element: withPermission('platform:approval:task:list', <PlatformApprovalTasks />),
      },
      {
        path: 'platform/biz-rule/rules',
        element: withPermission('platform:bizrule:rule:list', <PlatformBizRuleRules />),
      },
      {
        path: 'platform/biz-rule/params',
        element: withPermission('platform:bizrule:param:list', <PlatformBizRuleParams />),
      },
      {
        path: 'platform/biz-rule/logs',
        element: withPermission('platform:bizrule:log:list', <PlatformBizRuleLogs />),
      },
      {
        path: 'platform/data-quality/rules',
        element: withPermission('platform:dq:rule:list', <PlatformDataQualityRules />),
      },
      {
        path: 'platform/data-quality/exceptions',
        element: withPermission('platform:dq:exception:list', <PlatformDataQualityExceptions />),
      },
      {
        path: 'platform/data-quality/code-rules',
        element: withPermission('platform:dq:coderule:list', <PlatformDataQualityCodeRules />),
      },
      {
        path: 'platform/mobile/devices',
        element: withPermission('platform:mobile:device:list', <PlatformMobileDevices />),
      },
      {
        path: 'platform/mobile/scenes',
        element: withPermission('platform:mobile:scene:list', <PlatformMobileScenes />),
      },
      {
        path: 'platform/mobile/scan-logs',
        element: withPermission('platform:mobile:scanlog:list', <PlatformMobileScanLogs />),
      },
      {
        path: 'platform/mobile/label-rules',
        element: withPermission('platform:mobile:labelrule:list', <PlatformMobileLabelRules />),
      },
      {
        path: 'platform/mobile/exceptions',
        element: withPermission('platform:mobile:exception:list', <PlatformMobileExceptions />),
      },
      {
        path: 'platform/governance/projects',
        element: withPermission('platform:gov:project:list', <PlatformGovProjects />),
      },
      {
        path: 'platform/governance/milestones',
        element: withPermission('platform:gov:milestone:list', <PlatformGovMilestones />),
      },
      {
        path: 'platform/governance/tasks',
        element: withPermission('platform:gov:task:list', <PlatformGovTasks />),
      },
      {
        path: 'platform/governance/risks',
        element: withPermission('platform:gov:risk:list', <PlatformGovRisks />),
      },
      {
        path: 'platform/governance/asis-systems',
        element: withPermission('platform:gov:asissystem:list', <PlatformGovAsisSystems />),
      },
      {
        path: 'platform/governance/asis-findings',
        element: withPermission('platform:gov:asisfinding:list', <PlatformGovAsisFindings />),
      },
      {
        path: 'platform/governance/processes',
        element: withPermission('platform:gov:process:list', <PlatformGovProcesses />),
      },
      {
        path: 'platform/governance/process-nodes',
        element: withPermission('platform:gov:processnode:list', <PlatformGovProcessNodes />),
      },
      {
        path: 'platform/governance/requirements',
        element: withPermission('platform:gov:requirement:list', <PlatformGovRequirements />),
      },
      {
        path: 'platform/governance/trace-links',
        element: withPermission('platform:gov:tracelink:list', <PlatformGovTraceLinks />),
      },
      {
        path: 'platform/governance/arch-components',
        element: withPermission('platform:gov:archcomponent:list', <PlatformGovArchComponents />),
      },
      {
        path: 'platform/governance/arch-relations',
        element: withPermission('platform:gov:archrelation:list', <PlatformGovArchRelations />),
      },
      {
        path: 'platform/devops/repositories',
        element: withPermission('platform:devops:repository:list', <PlatformDevopsRepositories />),
      },
      {
        path: 'platform/devops/pipelines',
        element: withPermission('platform:devops:pipeline:list', <PlatformDevopsPipelines />),
      },
      {
        path: 'platform/devops/environments',
        element: withPermission('platform:devops:environment:list', <PlatformDevopsEnvironments />),
      },
      {
        path: 'platform/devops/build-runs',
        element: withPermission('platform:devops:buildrun:list', <PlatformDevopsBuildRuns />),
      },
      {
        path: 'platform/devops/gates',
        element: withPermission('platform:devops:gate:list', <PlatformDevopsGates />),
      },
      {
        path: 'platform/mdm/domains',
        element: withPermission('platform:mdm:domain:list', <PlatformMdmDomains />),
      },
      {
        path: 'platform/mdm/sources',
        element: withPermission('platform:mdm:source:list', <PlatformMdmSources />),
      },
      {
        path: 'platform/mdm/code-standards',
        element: withPermission('platform:mdm:codestandard:list', <PlatformMdmCodeStandards />),
      },
      {
        path: 'platform/mdm/distributions',
        element: withPermission('platform:mdm:distribution:list', <PlatformMdmDistributions />),
      },
      {
        path: 'platform/mdm/change-requests',
        element: withPermission('platform:mdm:changerequest:list', <PlatformMdmChangeRequests />),
      },
      {
        path: 'platform/mdm/quality-checks',
        element: withPermission('platform:mdm:qualitycheck:list', <PlatformMdmQualityChecks />),
      },
      {
        path: 'platform/mdm/sync-logs',
        element: withPermission('platform:mdm:synclog:list', <PlatformMdmSyncLogs />),
      },
      {
        path: 'platform/mdm/code-issues',
        element: withPermission('platform:mdm:codeissue:list', <PlatformMdmCodeIssues />),
      },
      {
        path: 'erp/base/materials',
        element: withPermission('erp:base:material:list', <ErpBaseMaterials />),
      },
      {
        path: 'erp/base/customers',
        element: withPermission('erp:base:customer:list', <ErpBaseCustomers />),
      },
      {
        path: 'erp/base/customer-contacts',
        element: withPermission('erp:base:customercontact:list', <ErpBaseCustomerContacts />),
      },
      {
        path: 'erp/base/suppliers',
        element: withPermission('erp:base:supplier:list', <ErpBaseSuppliers />),
      },
      {
        path: 'erp/base/uoms',
        element: withPermission('erp:base:uom:list', <ErpBaseUoms />),
      },
      {
        path: 'erp/base/uom-conversions',
        element: withPermission('erp:base:uomconversion:list', <ErpBaseUomConversions />),
      },
      {
        path: 'erp/base/projects',
        element: withPermission('erp:base:project:list', <ErpBaseProjects />),
      },
      {
        path: 'erp/sales/forecasts',
        element: withPermission('erp:sales:forecast:list', <ErpSalesForecasts />),
      },
      {
        path: 'erp/sales/orders',
        element: withPermission('erp:sales:order:list', <ErpSalesOrders />),
      },
      {
        path: 'erp/sales/order-changes',
        element: withPermission('erp:sales:orderchange:list', <ErpSalesOrderChanges />),
      },
      {
        path: 'erp/sales/delivery-reviews',
        element: withPermission('erp:sales:deliveryreview:list', <ErpSalesDeliveryReviews />),
      },
      {
        path: 'erp/sales/deliveries',
        element: withPermission('erp:sales:delivery:list', <ErpSalesDeliveries />),
      },
      {
        path: 'erp/sales/outbounds',
        element: withPermission('erp:sales:outbound:list', <ErpSalesOutbounds />),
      },
      {
        path: 'erp/sales/returns',
        element: withPermission('erp:sales:return:list', <ErpSalesReturns />),
      },
      {
        path: 'erp/sales/invoices',
        element: withPermission('erp:sales:invoice:list', <ErpSalesInvoices />),
      },
      {
        path: 'erp/sales/receivables',
        element: withPermission('erp:sales:receivable:list', <ErpSalesReceivables />),
      },
      {
        path: 'erp/purchase/requisitions',
        element: withPermission('erp:purchase:requisition:list', <ErpPurchaseRequisitions />),
      },
      {
        path: 'erp/purchase/inquiries',
        element: withPermission('erp:purchase:inquiry:list', <ErpPurchaseInquiries />),
      },
      {
        path: 'erp/purchase/orders',
        element: withPermission('erp:purchase:order:list', <ErpPurchaseOrders />),
      },
      {
        path: 'erp/purchase/receipts',
        element: withPermission('erp:purchase:receipt:list', <ErpGoodsReceipts />),
      },
      {
        path: 'erp/purchase/inspections',
        element: withPermission('erp:purchase:inspection:list', <ErpPurchaseInspections />),
      },
      {
        path: 'erp/purchase/inbounds',
        element: withPermission('erp:purchase:inbound:list', <ErpPurchaseInbounds />),
      },
      {
        path: 'erp/purchase/invoices',
        element: withPermission('erp:purchase:invoice:list', <ErpPurchaseInvoices />),
      },
      {
        path: 'erp/purchase/returns',
        element: withPermission('erp:purchase:return:list', <ErpPurchaseReturns />),
      },
      {
        path: 'erp/purchase/settlements',
        element: withPermission('erp:purchase:settlement:list', <ErpPurchaseSettlements />),
      },
      {
        path: 'erp/outsource/orders',
        element: withPermission('erp:outsource:order:list', <ErpOutsourceOrders />),
      },
      {
        path: 'erp/outsource/issues',
        element: withPermission('erp:outsource:issue:list', <ErpOutsourceIssues />),
      },
      {
        path: 'erp/outsource/receipts',
        element: withPermission('erp:outsource:receipt:list', <ErpOutsourceReceipts />),
      },
      {
        path: 'erp/outsource/inspections',
        element: withPermission('erp:outsource:inspection:list', <ErpOutsourceInspections />),
      },
      {
        path: 'erp/outsource/inbounds',
        element: withPermission('erp:outsource:inbound:list', <ErpOutsourceInbounds />),
      },
      {
        path: 'erp/outsource/invoices',
        element: withPermission('erp:outsource:invoice:list', <ErpOutsourceInvoices />),
      },
      {
        path: 'erp/outsource/settlements',
        element: withPermission('erp:outsource:settlement:list', <ErpOutsourceSettlements />),
      },
      {
        path: 'erp/outsource/writeoffs',
        element: withPermission('erp:outsource:writeoff:list', <ErpOutsourceWriteoffs />),
      },
      {
        path: 'erp/outsource/returns',
        element: withPermission('erp:outsource:return:list', <ErpOutsourceReturns />),
      },
      {
        path: 'erp/demand-plan/plans',
        element: withPermission('erp:demand-plan:plan:list', <ErpDemandPlans />),
      },
      {
        path: 'erp/demand-plan/mrp-runs',
        element: withPermission('erp:demand-plan:mrprun:list', <ErpMrpRuns />),
      },
      {
        path: 'erp/demand-plan/net-requirements',
        element: withPermission('erp:demand-plan:netreq:list', <ErpNetRequirements />),
      },
      {
        path: 'erp/demand-plan/purchase-suggestions',
        element: withPermission('erp:demand-plan:purchasesuggestion:list', <ErpPurchaseSuggestions />),
      },
      {
        path: 'erp/demand-plan/production-suggestions',
        element: withPermission('erp:demand-plan:productionsuggestion:list', <ErpProductionSuggestions />),
      },
      {
        path: 'erp/demand-plan/plan-adjustments',
        element: withPermission('erp:demand-plan:adjustment:list', <ErpPlanAdjustments />),
      },
      {
        path: 'erp/production/orders',
        element: withPermission('erp:production:order:list', <ErpProductionOrders />),
      },
      {
        path: 'erp/production/splits',
        element: withPermission('erp:production:split:list', <ErpProductionOrderSplits />),
      },
      {
        path: 'erp/production/material-issues',
        element: withPermission('erp:production:issue:list', <ErpMaterialIssues />),
      },
      {
        path: 'erp/production/material-additions',
        element: withPermission('erp:production:addition:list', <ErpMaterialAdditions />),
      },
      {
        path: 'erp/production/completion-receipts',
        element: withPermission('erp:production:receipt:list', <ErpCompletionReceipts />),
      },
      {
        path: 'erp/inventory/balances',
        element: withPermission('erp:inventory:balance:list', <ErpInventoryBalances />),
      },
      {
        path: 'erp/inventory/transactions',
        element: withPermission('erp:inventory:transaction:list', <ErpInventoryTransactions />),
      },
      {
        path: 'erp/inventory/transfers',
        element: withPermission('erp:inventory:transfer:list', <ErpInventoryTransfers />),
      },
      {
        path: 'erp/inventory/counts',
        element: withPermission('erp:inventory:count:list', <ErpInventoryCounts />),
      },
      {
        path: 'erp/inventory/conversions',
        element: withPermission('erp:inventory:conversion:list', <ErpInventoryConversions />),
      },
      {
        path: 'erp/inventory/scraps',
        element: withPermission('erp:inventory:scrap:list', <ErpInventoryScraps />),
      },
      {
        path: 'erp/inventory/freezes',
        element: withPermission('erp:inventory:freeze:list', <ErpInventoryFreezes />),
      },
      {
        path: 'erp/inventory/costs',
        element: withPermission('erp:inventory:cost:list', <ErpInventoryCosts />),
      },
      {
        path: 'erp/finance/accounts',
        element: withPermission('erp:finance:account:list', <ErpFinanceAccounts />),
      },
      {
        path: 'erp/finance/periods',
        element: withPermission('erp:finance:period:list', <ErpFinancePeriods />),
      },
      {
        path: 'erp/finance/vouchers',
        element: withPermission('erp:finance:voucher:list', <ErpFinanceVouchers />),
      },
      {
        path: 'erp/finance/receivables',
        element: withPermission('erp:finance:receivable:list', <ErpFinanceReceivables />),
      },
      {
        path: 'erp/finance/payables',
        element: withPermission('erp:finance:payable:list', <ErpFinancePayables />),
      },
      {
        path: 'erp/finance/payments',
        element: withPermission('erp:finance:payment:list', <ErpFinancePayments />),
      },
      {
        path: 'erp/finance/writeoffs',
        element: withPermission('erp:finance:writeoff:list', <ErpFinanceWriteoffs />),
      },
      {
        path: 'erp/finance/invoices',
        element: withPermission('erp:finance:invoice:list', <ErpFinanceInvoices />),
      },
      {
        path: 'erp/finance/bank-statements',
        element: withPermission('erp:finance:bank-statement:list', <ErpFinanceBankStatements />),
      },
      {
        path: 'erp/finance/cost-collections',
        element: withPermission('erp:finance:cost-collection:list', <ErpFinanceCostCollections />),
      },
      {
        path: 'erp/finance/accruals',
        element: withPermission('erp:finance:accrual:list', <ErpFinanceAccruals />),
      },
      {
        path: 'erp/trace/docs',
        element: withPermission('erp:trace:doc:list', <ErpTraceDocs />),
      },
      {
        path: 'erp/trace/events',
        element: withPermission('erp:trace:event:list', <ErpTraceEvents />),
      },
      {
        path: 'erp/barcode/records',
        element: withPermission('erp:barcode:record:list', <ErpBarcodeRecords />),
      },
      {
        path: 'erp/barcode/templates',
        element: withPermission('erp:barcode:template:list', <ErpBarcodeTemplates />),
      },
      {
        path: 'erp/barcode/reprints',
        element: withPermission('erp:barcode:reprint:list', <ErpBarcodeReprints />),
      },
      {
        path: 'erp/barcode/rules',
        element: withPermission('erp:barcode:rule:list', <ErpBarcodeRules />),
      },
      {
        path: 'erp/barcode/scans',
        element: withPermission('erp:barcode:scan:list', <ErpBarcodeScans />),
      },
      {
        path: 'erp/process/resources',
        element: withPermission('erp:process:resource:list', <ErpProcessResources />),
      },
      {
        path: 'erp/process/standards',
        element: withPermission('erp:process:standard:list', <ErpProcessStandards />),
      },
      {
        path: 'erp/process/routes',
        element: withPermission('erp:process:route:list', <ErpProcessRoutes />),
      },
      {
        path: 'erp/process/plans',
        element: withPermission('erp:process:plan:list', <ErpProcessPlans />),
      },
      {
        path: 'erp/process/reports',
        element: withPermission('erp:process:report:list', <ErpProcessReports />),
      },
      {
        path: 'erp/process/labor-feedback',
        element: withPermission('erp:process:labor:list', <ErpProcessLaborFeedback />),
      },
      {
        path: 'srm/supplier/archives',
        element: withPermission('srm:supplier:archive:list', <SrmSupplierArchives />),
      },
      {
        path: 'srm/supplier/admissions',
        element: withPermission('srm:supplier:admission:list', <SrmSupplierAdmissions />),
      },
      {
        path: 'srm/supplier/qualifications',
        element: withPermission('srm:supplier:qualification:list', <SrmSupplierQualifications />),
      },
      {
        path: 'srm/supplier/risks',
        element: withPermission('srm:supplier:risk:list', <SrmSupplierRisks />),
      },
      {
        path: 'srm/supplier/grades',
        element: withPermission('srm:supplier:grade:list', <SrmSupplierGrades />),
      },
      {
        path: 'srm/supplier/blacklists',
        element: withPermission('srm:supplier:blacklist:list', <SrmSupplierBlacklists />),
      },
      {
        path: 'srm/supplier/reviews',
        element: withPermission('srm:supplier:review:list', <SrmSupplierReviews />),
      },
      {
        path: 'srm/sourcing/requests',
        element: withPermission('srm:sourcing:request:list', <SrmSourcingRequests />),
      },
      {
        path: 'srm/sourcing/rfqs',
        element: withPermission('srm:sourcing:rfq:list', <SrmRfqs />),
      },
      {
        path: 'srm/sourcing/rfq-suppliers',
        element: withPermission('srm:sourcing:rfq-supplier:list', <SrmRfqSuppliers />),
      },
      {
        path: 'srm/sourcing/quotes',
        element: withPermission('srm:sourcing:quote:list', <SrmSupplierQuotes />),
      },
      {
        path: 'srm/sourcing/compares',
        element: withPermission('srm:sourcing:compare:list', <SrmPriceCompares />),
      },
      {
        path: 'srm/sourcing/awards',
        element: withPermission('srm:sourcing:award:list', <SrmAwards />),
      },
      {
        path: 'srm/sourcing/prices',
        element: withPermission('srm:sourcing:price:list', <SrmPriceAgreements />),
      },
      {
        path: 'srm/collab/po-confirms',
        element: withPermission('srm:collab:po-confirm:list', <SrmPoConfirmations />),
      },
      {
        path: 'srm/collab/commitments',
        element: withPermission('srm:collab:commitment:list', <SrmDeliveryCommitments />),
      },
      {
        path: 'srm/collab/changes',
        element: withPermission('srm:collab:change:list', <SrmPoChanges />),
      },
      {
        path: 'srm/collab/appointments',
        element: withPermission('srm:collab:appointment:list', <SrmDeliveryAppointments />),
      },
      {
        path: 'srm/collab/asns',
        element: withPermission('srm:collab:asn:list', <SrmAsns />),
      },
      {
        path: 'srm/quality/iqc',
        element: withPermission('srm:quality:iqc:list', <SrmIncomingQualities />),
      },
      {
        path: 'srm/quality/assessments',
        element: withPermission('srm:quality:assessment:list', <SrmSupplierAssessments />),
      },
      {
        path: 'srm/quality/eightd',
        element: withPermission('srm:quality:eightd:list', <SrmEightDReports />),
      },
      {
        path: 'srm/quality/rectifications',
        element: withPermission('srm:quality:rectification:list', <SrmRectifications />),
      },
      {
        path: 'srm/portal/accounts',
        element: withPermission('srm:portal:account:list', <SrmPortalAccounts />),
      },
      {
        path: 'srm/portal/messages',
        element: withPermission('srm:portal:message:list', <SrmPortalMessages />),
      },
      {
        path: 'srm/portal/attachments',
        element: withPermission('srm:portal:attachment:list', <SrmPortalAttachments />),
      },
      {
        path: 'srm/edi/messages',
        element: withPermission('srm:edi:message:list', <SrmEdiMessages />),
      },
      {
        path: 'srm/edi/receipts',
        element: withPermission('srm:edi:receipt:list', <SrmEdiReceipts />),
      },
      {
        path: 'srm/edi/reconciles',
        element: withPermission('srm:edi:reconcile:list', <SrmEdiReconciles />),
      },
      {
        path: 'wms/base/warehouses',
        element: withPermission('wms:base:warehouse:list', <WmsBaseWarehouses />),
      },
      {
        path: 'wms/base/zones',
        element: withPermission('wms:base:zone:list', <WmsBaseZones />),
      },
      {
        path: 'wms/base/bins',
        element: withPermission('wms:base:bin:list', <WmsBaseBins />),
      },
      {
        path: 'wms/base/racks',
        element: withPermission('wms:base:rack:list', <WmsBaseRacks />),
      },
      {
        path: 'wms/base/containers',
        element: withPermission('wms:base:container:list', <WmsBaseContainers />),
      },
      {
        path: 'wms/base/strategies',
        element: withPermission('wms:base:strategy:list', <WmsBaseStrategies />),
      },
      {
        path: 'wms/inbound/asns',
        element: withPermission('wms:inbound:asn:list', <WmsInboundAsns />),
      },
      {
        path: 'wms/inbound/receipts',
        element: withPermission('wms:inbound:receipt:list', <WmsInboundReceipts />),
      },
      {
        path: 'wms/inbound/putaways',
        element: withPermission('wms:inbound:putaway:list', <WmsInboundPutaways />),
      },
      {
        path: 'wms/inventory/batches',
        element: withPermission('wms:inventory:batch:list', <WmsInventoryBatches />),
      },
      {
        path: 'wms/inventory/serials',
        element: withPermission('wms:inventory:serial:list', <WmsInventorySerials />),
      },
      {
        path: 'wms/inventory/freezes',
        element: withPermission('wms:inventory:freeze:list', <WmsInventoryFreezes />),
      },
      {
        path: 'wms/pick/tasks',
        element: withPermission('wms:pick:task:list', <WmsPickTasks />),
      },
      {
        path: 'wms/pick/kittings',
        element: withPermission('wms:pick:kitting:list', <WmsPickKittings />),
      },
      {
        path: 'wms/pick/line-stocks',
        element: withPermission('wms:pick:linestock:list', <WmsPickLineStocks />),
      },
      {
        path: 'wms/return/returns',
        element: withPermission('wms:return:return:list', <WmsReturnOrders />),
      },
      {
        path: 'wms/return/replenishes',
        element: withPermission('wms:return:replenish:list', <WmsReturnReplenishes />),
      },
      {
        path: 'wms/return/diffs',
        element: withPermission('wms:return:diff:list', <WmsReturnDiffs />),
      },
      {
        path: 'wms/outbound/finished-goods',
        element: withPermission('wms:outbound:finished:list', <WmsFinishedGoods />),
      },
      {
        path: 'wms/outbound/waves',
        element: withPermission('wms:outbound:wave:list', <WmsOutboundWaves />),
      },
      {
        path: 'wms/outbound/shipments',
        element: withPermission('wms:outbound:shipment:list', <WmsShipmentOrders />),
      },
      {
        path: 'wms/stocktake/orders',
        element: withPermission('wms:stocktake:order:list', <WmsStocktakeOrders />),
      },
      {
        path: 'wms/stocktake/diffs',
        element: withPermission('wms:stocktake:diff:list', <WmsStocktakeDiffs />),
      },
      {
        path: 'wms/stocktake/transfers',
        element: withPermission('wms:stocktake:transfer:list', <WmsStocktakeTransfers />),
      },
      {
        path: 'wms/vmi/bins',
        element: withPermission('wms:vmi:bin:list', <WmsVmiBins />),
      },
      {
        path: 'wms/vmi/scans',
        element: withPermission('wms:vmi:scan:list', <WmsVmiScans />),
      },
      {
        path: 'wms/vmi/warnings',
        element: withPermission('wms:vmi:warning:list', <WmsVmiWarnings />),
      },
      {
        path: 'mes/plan/orders',
        element: withPermission('mes:plan:order:list', <MesProdOrders />),
      },
      {
        path: 'mes/plan/schedules',
        element: withPermission('mes:plan:schedule:list', <MesSchedules />),
      },
      {
        path: 'mes/plan/dispatches',
        element: withPermission('mes:plan:dispatch:list', <MesDispatches />),
      },
      {
        path: 'mes/craft/versions',
        element: withPermission('mes:craft:version:list', <MesProcessVersions />),
      },
      {
        path: 'mes/craft/sops',
        element: withPermission('mes:craft:sop:list', <MesSops />),
      },
      {
        path: 'mes/craft/recipes',
        element: withPermission('mes:craft:recipe:list', <MesRecipes />),
      },
      {
        path: 'mes/craft/fais',
        element: withPermission('mes:craft:fai:list', <MesFais />),
      },
      {
        path: 'mes/craft/changeovers',
        element: withPermission('mes:craft:changeover:list', <MesChangeovers />),
      },
      {
        path: 'mes/report/works',
        element: withPermission('mes:report:work:list', <MesWorkReports />),
      },
      {
        path: 'mes/report/replenishes',
        element: withPermission('mes:report:replenish:list', <MesReplenishes />),
      },
      {
        path: 'mes/report/labors',
        element: withPermission('mes:report:labor:list', <MesLabors />),
      },
      { path: 'oa/portal', element: withPermission('oa:portal:view', <OaPortal />) },
      { path: 'oa/positions', element: withPermission('oa:position:list', <OaPosition />) },
      { path: 'oa/employments', element: withPermission('oa:employment:list', <OaEmployment />) },
      { path: 'oa/delegations', element: withPermission('oa:delegation:list', <OaDelegation />) },
      { path: 'oa/applications', element: withPermission('oa:application:list', <OaApplication />) },
      { path: 'oa/sso-clients', element: withPermission('oa:sso:list', <OaSsoClient />) },
      { path: 'oa/forms', element: withPermission('oa:form:list', <OaFormDesigner />) },
      { path: 'oa/processes', element: withPermission('oa:process:list', <OaProcessDesigner />) },
      { path: 'oa/my-applications', element: withPermission('oa:instance:start', <OaMyApplication />) },
      { path: 'oa/tasks', element: withPermission('oa:task:list', <OaTask />) },
      { path: 'oa/approvals', element: withPermission('oa:instance:list', <OaApproval />) },
      { path: 'oa/monitor', element: withPermission('oa:instance:list', <OaProcessMonitor />) },
      { path: 'oa/mails', element: withPermission('oa-mail', <OaMail />) },
      { path: 'oa/notifications', element: withPermission('oa-notification', <OaNotification />) },
      { path: 'oa/notify-templates', element: withPermission('oa-notify-template', <OaNotifyTemplate />) },
      { path: 'oa/documents', element: withPermission('oa-document', <OaDocument />) },
      { path: 'oa/knowledge', element: withPermission('oa-knowledge', <OaKnowledge />) },
      { path: 'oa/hr', element: withPermission('oa-hr', <OaHr />) },
      { path: 'oa/biz/sales', element: withPermission('oa-biz-sales', <OaBizSales />) },
      { path: 'oa/biz/purchase', element: withPermission('oa-biz-purchase', <OaBizPurchase />) },
      { path: 'oa/biz/quality', element: withPermission('oa-biz-quality', <OaBizQuality />) },
      { path: 'oa/biz/rd', element: withPermission('oa-biz-rd', <OaBizRd />) },
      { path: 'oa/meeting', element: withPermission('oa-meeting', <OaMeeting />) },
      { path: 'oa/collab', element: withPermission('oa-collab', <OaCollab />) },
      { path: 'oa/address-book', element: withPermission('oa-address-book', <OaAddressBook />) },
      { path: 'oa/mobile-admin', element: withPermission('oa-mobile-admin', <OaMobileAdmin />) },
      { path: 'oa/asset/repair', element: withPermission('oa-asset-repair', <OaAssetRepair />) },
      { path: 'oa/special/contract', element: withPermission('oa-contract', <OaContract />) },
      { path: 'oa/special/office-supply', element: withPermission('oa-office-supply', <OaOfficeSupply />) },
      { path: 'oa/special/library', element: withPermission('oa-library', <OaLibrary />) },
      { path: 'oa/special/customer', element: withPermission('oa-customer', <OaCustomer />) },
      { path: 'oa/system/i18n', element: withPermission('oa-i18n-factory', <OaI18nFactory />) },
      { path: 'oa/system/log-center', element: withPermission('oa-log-center', <OaLogCenter />) },
      { path: 'oa/integration/gateway', element: withPermission('oa:integration:api:list', <OaIntegrationGateway />) },
      { path: 'oa/integration/webhook', element: withPermission('oa:integration:webhook:list', <OaIntegrationWebhook />) },
      { path: 'oa/integration/task', element: withPermission('oa:integration:task:list', <OaIntegrationTask />) },
      { path: 'oa/integration/connector', element: withPermission('oa:integration:connector:list', <OaIntegrationConnector />) },
      { path: 'oa/integration/edi', element: withPermission('oa:integration:edi:list', <OaIntegrationEdi />) },
      { path: 'oa/integration/monitor', element: withPermission('oa:integration:monitor:list', <OaIntegrationMonitor />) },
      { path: 'oa/migration/object', element: withPermission('oa:migration:object:list', <OaMigrationObject />) },
      { path: 'oa/migration/batch', element: withPermission('oa:migration:batch:list', <OaMigrationBatch />) },
      { path: 'oa/migration/attachment', element: withPermission('oa:migration:attachment:list', <OaMigrationAttachment />) },
      { path: 'oa/migration/history-flow', element: withPermission('oa:migration:history:list', <OaMigrationHistoryFlow />) },
      { path: 'oa/migration/reconcile', element: withPermission('oa:migration:reconcile:list', <OaMigrationReconcile />) },
      { path: 'oa/migration/dual-run', element: withPermission('oa:migration:dual:list', <OaMigrationDualRun />) },
      { path: 'oa/test/case', element: withPermission('oa:test:case:list', <OaTestTestCase />) },
      { path: 'oa/test/permission', element: withPermission('oa:test:permission:list', <OaTestPermission />) },
      { path: 'oa/test/security', element: withPermission('oa:test:security:list', <OaTestSecurity />) },
      { path: 'oa/test/performance', element: withPermission('oa:test:perf:list', <OaTestPerformance />) },
      { path: 'oa/test/compatibility', element: withPermission('oa:test:compat:list', <OaTestCompatibility />) },
      { path: 'oa/test/backup-drill', element: withPermission('oa:test:backup:list', <OaTestBackupDrill />) },
      { path: 'oa/test/uat', element: withPermission('oa:test:uat:list', <OaTestUat />) },
      { path: 'oa/test/training', element: withPermission('oa:test:training:list', <OaTestTraining />) },
      { path: 'oa/test/cutover', element: withPermission('oa:test:cutover:list', <OaTestCutover />) },
      { path: 'oa/golive/freeze', element: withPermission('oa:golive:freeze:list', <OaGoliveFreeze />) },
      { path: 'oa/golive/final-migration', element: withPermission('oa:golive:migration:list', <OaGoliveFinalMigration />) },
      { path: 'oa/golive/entry-switch', element: withPermission('oa:golive:entry:list', <OaGoliveEntrySwitch />) },
      { path: 'oa/golive/watch', element: withPermission('oa:golive:watch:list', <OaGoliveWatch />) },
      { path: 'oa/golive/rollback', element: withPermission('oa:golive:rollback:list', <OaGoliveRollback />) },
      { path: 'oa/golive/legacy-archive', element: withPermission('oa:golive:archive:list', <OaGoliveLegacyArchive />) },
      { path: 'oa/golive/decommission', element: withPermission('oa:golive:decommission:list', <OaGoliveDecommission />) },
      { path: 'oa/golive/handover', element: withPermission('oa:golive:handover:list', <OaGoliveHandover />) },
      {
        path: 'system',
        element: withSuspense(<SystemManagement />),
        children: [
          { index: true, element: <Navigate to="/system/users" replace /> },
          { path: 'users', element: withPermission('system:user:list', <SystemUsers />) },
          { path: 'organizations', element: withPermission('system:org:list', <SystemOrganizations />) },
          { path: 'roles', element: withPermission('system:role:list', <SystemRoles />) },
          { path: 'dictionaries', element: withPermission('system:dict:list', <SystemDictionaries />) },
          { path: 'configs', element: withPermission('system:config:list', <SystemConfigs />) },
          { path: 'audit-logs', element: withPermission('system:audit:list', <SystemAuditLogs />) },
        ],
      },
    ],
  },
  {
    path: '/m',
    element: <AuthGuard>{withSuspense(<MobileLayout />)}</AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/m/workbench" replace /> },
      { path: 'workbench', element: withSuspense(<MobileWorkbench />) },
      { path: 'tasks', element: withSuspense(<MobileTasks />) },
      { path: 'approvals', element: withSuspense(<MobileApprovals />) },
      { path: 'mail', element: withSuspense(<MobileMail />) },
      { path: 'docs', element: withSuspense(<MobileDocs />) },
      { path: 'notifications', element: withSuspense(<MobileNotifications />) },
      { path: 'more', element: withSuspense(<MobileMore />) },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFound />),
  },
];

export const router = createBrowserRouter(routes);
