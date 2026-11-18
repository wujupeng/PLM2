import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  IntEndpointItem,
  IntEndpointQuery,
  IntEndpointSaveParams,
  IntInterfaceLogItem,
  IntInterfaceLogQuery,
  IntInterfaceLogSaveParams,
  IntMasterDataSyncItem,
  IntMasterDataSyncQuery,
  IntMasterDataSyncSaveParams,
  IntMasterDataDiffItem,
  IntMasterDataDiffQuery,
  IntMasterDataDiffResolveParams,
  IntQmsRecordItem,
  IntQmsRecordQuery,
  IntQmsRecordSaveParams,
  IntMigrationTaskItem,
  IntMigrationTaskQuery,
  IntMigrationTaskSaveParams,
  IntMigrationExceptionItem,
  IntMigrationExceptionQuery,
  IntMigrationExceptionHandleParams,
  IntExportTaskItem,
  IntExportTaskQuery,
  IntExportTaskSaveParams,
  IntTestCaseItem,
  IntTestCaseQuery,
  IntTestCaseSaveParams,
  IntTestCaseRunParams,
  IntPerfTestItem,
  IntPerfTestQuery,
  IntPerfTestSaveParams,
  IntSecurityIssueItem,
  IntSecurityIssueQuery,
  IntSecurityIssueSaveParams,
  IntSecurityIssueFixParams,
  IntBackupRecordItem,
  IntBackupRecordQuery,
  IntBackupRecordSaveParams,
  IntTrainingRecordItem,
  IntTrainingRecordQuery,
  IntTrainingRecordSaveParams,
  IntGoliveRecordItem,
  IntGoliveRecordQuery,
  IntGoliveRecordSaveParams,
  IntGoliveExecuteParams,
  IntDeliveryItemModel,
  IntDeliveryItemQuery,
  IntDeliveryItemSaveParams,
  IntDefectItem,
  IntDefectQuery,
  IntDefectSaveParams,
  IntDefectAssignParams,
} from '@/types/int';

/** 系统集成、迁移、性能安全与上线交付（N9） */
export const intService = {
  /* ---------- 接口配置（DEV-096） ---------- */
  endpointPage: (params: IntEndpointQuery) =>
    request<PageResult<IntEndpointItem>>({ method: 'GET', url: '/int/endpoints', params }),
  endpointListEnabled: () =>
    request<IntEndpointItem[]>({ method: 'GET', url: '/int/endpoints/enabled' }),
  endpointDetail: (endpointCode: string) =>
    request<IntEndpointItem>({ method: 'GET', url: `/int/endpoints/${endpointCode}` }),
  endpointCreate: (data: IntEndpointSaveParams) =>
    request<string>({ method: 'POST', url: '/int/endpoints', data }),
  endpointUpdate: (endpointCode: string, data: IntEndpointSaveParams) =>
    request<void>({ method: 'PUT', url: `/int/endpoints/${endpointCode}`, data }),
  endpointRemove: (endpointCode: string) =>
    request<void>({ method: 'DELETE', url: `/int/endpoints/${endpointCode}` }),

  /* ---------- 接口调用日志（DEV-096） ---------- */
  logPage: (params: IntInterfaceLogQuery) =>
    request<PageResult<IntInterfaceLogItem>>({ method: 'GET', url: '/int/logs', params }),
  logDetail: (logNo: string) =>
    request<IntInterfaceLogItem>({ method: 'GET', url: `/int/logs/${logNo}` }),
  logRecord: (data: IntInterfaceLogSaveParams) =>
    request<IntInterfaceLogItem>({ method: 'POST', url: '/int/logs/record', data }),
  logRetry: (logNo: string) =>
    request<IntInterfaceLogItem>({ method: 'POST', url: `/int/logs/${logNo}/retry` }),
  logCompensate: (logNo: string) =>
    request<IntInterfaceLogItem>({ method: 'POST', url: `/int/logs/${logNo}/compensate` }),

  /* ---------- 主数据同步（DEV-095） ---------- */
  syncPage: (params: IntMasterDataSyncQuery) =>
    request<PageResult<IntMasterDataSyncItem>>({ method: 'GET', url: '/int/master-data', params }),
  syncDetail: (syncNo: string) =>
    request<IntMasterDataSyncItem>({ method: 'GET', url: `/int/master-data/${syncNo}` }),
  syncCreate: (data: IntMasterDataSyncSaveParams) =>
    request<string>({ method: 'POST', url: '/int/master-data', data }),
  syncUpdate: (syncNo: string, data: IntMasterDataSyncSaveParams) =>
    request<void>({ method: 'PUT', url: `/int/master-data/${syncNo}`, data }),
  syncRemove: (syncNo: string) =>
    request<void>({ method: 'DELETE', url: `/int/master-data/${syncNo}` }),
  syncRun: (syncNo: string) =>
    request<IntMasterDataSyncItem>({ method: 'POST', url: `/int/master-data/${syncNo}/sync` }),

  /* ---------- 主数据差异（DEV-095） ---------- */
  diffPage: (params: IntMasterDataDiffQuery) =>
    request<PageResult<IntMasterDataDiffItem>>({ method: 'GET', url: '/int/master-data/diffs', params }),
  diffResolve: (id: number, data: IntMasterDataDiffResolveParams) =>
    request<IntMasterDataDiffItem>({ method: 'POST', url: `/int/master-data/diffs/${id}/resolve`, data }),

  /* ---------- QMS 质量记录（DEV-097） ---------- */
  qmsPage: (params: IntQmsRecordQuery) =>
    request<PageResult<IntQmsRecordItem>>({ method: 'GET', url: '/int/qms-records', params }),
  qmsDetail: (recordNo: string) =>
    request<IntQmsRecordItem>({ method: 'GET', url: `/int/qms-records/${recordNo}` }),
  qmsCreate: (data: IntQmsRecordSaveParams) =>
    request<string>({ method: 'POST', url: '/int/qms-records', data }),
  qmsUpdate: (recordNo: string, data: IntQmsRecordSaveParams) =>
    request<void>({ method: 'PUT', url: `/int/qms-records/${recordNo}`, data }),
  qmsRemove: (recordNo: string) =>
    request<void>({ method: 'DELETE', url: `/int/qms-records/${recordNo}` }),
  qmsReceive: (data: IntQmsRecordSaveParams) =>
    request<IntQmsRecordItem>({ method: 'POST', url: '/int/qms-records/receive', data }),

  /* ---------- 数据迁移（DEV-098） ---------- */
  migrationPage: (params: IntMigrationTaskQuery) =>
    request<PageResult<IntMigrationTaskItem>>({ method: 'GET', url: '/int/migrations', params }),
  migrationDetail: (taskNo: string) =>
    request<IntMigrationTaskItem>({ method: 'GET', url: `/int/migrations/${taskNo}` }),
  migrationCreate: (data: IntMigrationTaskSaveParams) =>
    request<string>({ method: 'POST', url: '/int/migrations', data }),
  migrationUpdate: (taskNo: string, data: IntMigrationTaskSaveParams) =>
    request<void>({ method: 'PUT', url: `/int/migrations/${taskNo}`, data }),
  migrationRemove: (taskNo: string) =>
    request<void>({ method: 'DELETE', url: `/int/migrations/${taskNo}` }),
  migrationRun: (taskNo: string) =>
    request<IntMigrationTaskItem>({ method: 'POST', url: `/int/migrations/${taskNo}/run` }),
  migrationVerify: (taskNo: string) =>
    request<IntMigrationTaskItem>({ method: 'POST', url: `/int/migrations/${taskNo}/verify` }),

  /* ---------- 迁移异常（DEV-098） ---------- */
  migrationExceptionPage: (params: IntMigrationExceptionQuery) =>
    request<PageResult<IntMigrationExceptionItem>>({ method: 'GET', url: '/int/migrations/exceptions', params }),
  migrationExceptionHandle: (id: number, data: IntMigrationExceptionHandleParams) =>
    request<IntMigrationExceptionItem>({ method: 'POST', url: `/int/migrations/exceptions/${id}/handle`, data }),

  /* ---------- 数据导出（DEV-099） ---------- */
  exportPage: (params: IntExportTaskQuery) =>
    request<PageResult<IntExportTaskItem>>({ method: 'GET', url: '/int/export-tasks', params }),
  exportDetail: (taskNo: string) =>
    request<IntExportTaskItem>({ method: 'GET', url: `/int/export-tasks/${taskNo}` }),
  exportCreate: (data: IntExportTaskSaveParams) =>
    request<string>({ method: 'POST', url: '/int/export-tasks', data }),
  exportUpdate: (taskNo: string, data: IntExportTaskSaveParams) =>
    request<void>({ method: 'PUT', url: `/int/export-tasks/${taskNo}`, data }),
  exportRemove: (taskNo: string) =>
    request<void>({ method: 'DELETE', url: `/int/export-tasks/${taskNo}` }),
  exportRun: (taskNo: string) =>
    request<IntExportTaskItem>({ method: 'POST', url: `/int/export-tasks/${taskNo}/run` }),

  /* ---------- 测试用例（DEV-100） ---------- */
  testCasePage: (params: IntTestCaseQuery) =>
    request<PageResult<IntTestCaseItem>>({ method: 'GET', url: '/int/test-cases', params }),
  testCaseDetail: (caseNo: string) =>
    request<IntTestCaseItem>({ method: 'GET', url: `/int/test-cases/${caseNo}` }),
  testCaseCreate: (data: IntTestCaseSaveParams) =>
    request<string>({ method: 'POST', url: '/int/test-cases', data }),
  testCaseUpdate: (caseNo: string, data: IntTestCaseSaveParams) =>
    request<void>({ method: 'PUT', url: `/int/test-cases/${caseNo}`, data }),
  testCaseRemove: (caseNo: string) =>
    request<void>({ method: 'DELETE', url: `/int/test-cases/${caseNo}` }),
  testCaseRun: (caseNo: string, data: IntTestCaseRunParams) =>
    request<IntTestCaseItem>({ method: 'POST', url: `/int/test-cases/${caseNo}/run`, data }),

  /* ---------- 性能测试（DEV-101） ---------- */
  perfPage: (params: IntPerfTestQuery) =>
    request<PageResult<IntPerfTestItem>>({ method: 'GET', url: '/int/perf-tests', params }),
  perfDetail: (testNo: string) =>
    request<IntPerfTestItem>({ method: 'GET', url: `/int/perf-tests/${testNo}` }),
  perfCreate: (data: IntPerfTestSaveParams) =>
    request<string>({ method: 'POST', url: '/int/perf-tests', data }),
  perfUpdate: (testNo: string, data: IntPerfTestSaveParams) =>
    request<void>({ method: 'PUT', url: `/int/perf-tests/${testNo}`, data }),
  perfRemove: (testNo: string) =>
    request<void>({ method: 'DELETE', url: `/int/perf-tests/${testNo}` }),
  perfEvaluate: (testNo: string) =>
    request<IntPerfTestItem>({ method: 'POST', url: `/int/perf-tests/${testNo}/evaluate` }),

  /* ---------- 安全问题（DEV-102） ---------- */
  securityPage: (params: IntSecurityIssueQuery) =>
    request<PageResult<IntSecurityIssueItem>>({ method: 'GET', url: '/int/security-issues', params }),
  securityDetail: (issueNo: string) =>
    request<IntSecurityIssueItem>({ method: 'GET', url: `/int/security-issues/${issueNo}` }),
  securityCreate: (data: IntSecurityIssueSaveParams) =>
    request<string>({ method: 'POST', url: '/int/security-issues', data }),
  securityUpdate: (issueNo: string, data: IntSecurityIssueSaveParams) =>
    request<void>({ method: 'PUT', url: `/int/security-issues/${issueNo}`, data }),
  securityRemove: (issueNo: string) =>
    request<void>({ method: 'DELETE', url: `/int/security-issues/${issueNo}` }),
  securityFix: (issueNo: string, data: IntSecurityIssueFixParams) =>
    request<IntSecurityIssueItem>({ method: 'POST', url: `/int/security-issues/${issueNo}/fix`, data }),
  securityVerify: (issueNo: string) =>
    request<IntSecurityIssueItem>({ method: 'POST', url: `/int/security-issues/${issueNo}/verify` }),

  /* ---------- 备份恢复（DEV-103） ---------- */
  backupPage: (params: IntBackupRecordQuery) =>
    request<PageResult<IntBackupRecordItem>>({ method: 'GET', url: '/int/backups', params }),
  backupDetail: (recordNo: string) =>
    request<IntBackupRecordItem>({ method: 'GET', url: `/int/backups/${recordNo}` }),
  backupCreate: (data: IntBackupRecordSaveParams) =>
    request<string>({ method: 'POST', url: '/int/backups', data }),
  backupUpdate: (recordNo: string, data: IntBackupRecordSaveParams) =>
    request<void>({ method: 'PUT', url: `/int/backups/${recordNo}`, data }),
  backupRemove: (recordNo: string) =>
    request<void>({ method: 'DELETE', url: `/int/backups/${recordNo}` }),
  backupVerify: (recordNo: string) =>
    request<IntBackupRecordItem>({ method: 'POST', url: `/int/backups/${recordNo}/verify` }),

  /* ---------- 培训记录（DEV-104） ---------- */
  trainingPage: (params: IntTrainingRecordQuery) =>
    request<PageResult<IntTrainingRecordItem>>({ method: 'GET', url: '/int/trainings', params }),
  trainingDetail: (trainingNo: string) =>
    request<IntTrainingRecordItem>({ method: 'GET', url: `/int/trainings/${trainingNo}` }),
  trainingCreate: (data: IntTrainingRecordSaveParams) =>
    request<string>({ method: 'POST', url: '/int/trainings', data }),
  trainingUpdate: (trainingNo: string, data: IntTrainingRecordSaveParams) =>
    request<void>({ method: 'PUT', url: `/int/trainings/${trainingNo}`, data }),
  trainingRemove: (trainingNo: string) =>
    request<void>({ method: 'DELETE', url: `/int/trainings/${trainingNo}` }),

  /* ---------- 上线切换（DEV-104） ---------- */
  golivePage: (params: IntGoliveRecordQuery) =>
    request<PageResult<IntGoliveRecordItem>>({ method: 'GET', url: '/int/golive', params }),
  goliveDetail: (goliveNo: string) =>
    request<IntGoliveRecordItem>({ method: 'GET', url: `/int/golive/${goliveNo}` }),
  goliveCreate: (data: IntGoliveRecordSaveParams) =>
    request<string>({ method: 'POST', url: '/int/golive', data }),
  goliveUpdate: (goliveNo: string, data: IntGoliveRecordSaveParams) =>
    request<void>({ method: 'PUT', url: `/int/golive/${goliveNo}`, data }),
  goliveRemove: (goliveNo: string) =>
    request<void>({ method: 'DELETE', url: `/int/golive/${goliveNo}` }),
  goliveExecute: (goliveNo: string, data: IntGoliveExecuteParams) =>
    request<IntGoliveRecordItem>({ method: 'POST', url: `/int/golive/${goliveNo}/execute`, data }),

  /* ---------- 交付物（DEV-105） ---------- */
  deliveryPage: (params: IntDeliveryItemQuery) =>
    request<PageResult<IntDeliveryItemModel>>({ method: 'GET', url: '/int/deliveries', params }),
  deliveryDetail: (itemNo: string) =>
    request<IntDeliveryItemModel>({ method: 'GET', url: `/int/deliveries/${itemNo}` }),
  deliveryCreate: (data: IntDeliveryItemSaveParams) =>
    request<string>({ method: 'POST', url: '/int/deliveries', data }),
  deliveryUpdate: (itemNo: string, data: IntDeliveryItemSaveParams) =>
    request<void>({ method: 'PUT', url: `/int/deliveries/${itemNo}`, data }),
  deliveryRemove: (itemNo: string) =>
    request<void>({ method: 'DELETE', url: `/int/deliveries/${itemNo}` }),
  deliveryVerify: (itemNo: string) =>
    request<IntDeliveryItemModel>({ method: 'POST', url: `/int/deliveries/${itemNo}/verify` }),

  /* ---------- 缺陷 SLA（DEV-106） ---------- */
  defectPage: (params: IntDefectQuery) =>
    request<PageResult<IntDefectItem>>({ method: 'GET', url: '/int/defects', params }),
  defectDetail: (defectNo: string) =>
    request<IntDefectItem>({ method: 'GET', url: `/int/defects/${defectNo}` }),
  defectCreate: (data: IntDefectSaveParams) =>
    request<string>({ method: 'POST', url: '/int/defects', data }),
  defectUpdate: (defectNo: string, data: IntDefectSaveParams) =>
    request<void>({ method: 'PUT', url: `/int/defects/${defectNo}`, data }),
  defectRemove: (defectNo: string) =>
    request<void>({ method: 'DELETE', url: `/int/defects/${defectNo}` }),
  defectAssign: (defectNo: string, data: IntDefectAssignParams) =>
    request<IntDefectItem>({ method: 'POST', url: `/int/defects/${defectNo}/assign`, data }),
  defectClose: (defectNo: string) =>
    request<IntDefectItem>({ method: 'POST', url: `/int/defects/${defectNo}/close` }),
  defectEscalate: (defectNo: string) =>
    request<IntDefectItem>({ method: 'POST', url: `/int/defects/${defectNo}/escalate` }),
};
