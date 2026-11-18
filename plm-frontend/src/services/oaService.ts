import instance, { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  OaPositionItem,
  OaPositionQuery,
  OaPositionSaveParams,
  OaEmploymentItem,
  OaEmploymentQuery,
  OaEmploymentSaveParams,
  OaDelegationItem,
  OaDelegationQuery,
  OaDelegationSaveParams,
  OaApplicationItem,
  OaApplicationQuery,
  OaApplicationSaveParams,
  OaSsoClientItem,
  OaSsoClientQuery,
  OaSsoClientSaveParams,
  OaPortalHome,
  OaFormDefinitionItem,
  OaFormQuery,
  OaFormDetail,
  OaFormSaveParams,
  OaProcessDefinitionItem,
  OaProcessQuery,
  OaProcessDetail,
  OaProcessSaveParams,
  OaProcessInstanceItem,
  OaInstanceQuery,
  OaInstanceDetail,
  OaInstanceStartParams,
  OaTaskItem,
  OaTaskQuery,
  OaTaskApproveParams,
  MailFolderItem,
  MailFolderSaveParams,
  MailItem,
  MailDetail,
  MailQuery,
  MailSendParams,
  MailAttachmentItem,
  NotificationItem,
  NotificationQueryParams,
  NotificationBroadcastParams,
  NotifyTemplateItem,
  NotifyTemplateQueryParams,
  NotifyTemplateSaveParams,
  OaDocFolderItem,
  OaDocFolderSaveParams,
  OaDocFolderPermissionItem,
  OaDocFolderPermissionSaveParams,
  OaDocumentItem,
  OaDocQuery,
  OaDocSaveParams,
  OaDocVersionItem,
  OaDocCommentItem,
  OaDocCommentSaveParams,
  OaDocShareItem,
  OaDocShareSaveParams,
  OaDocSearchItem,
  OaDocSearchQuery,
  OaDocAccessLogItem,
  OaDocAccessLogQuery,
  OaDocDetail,
  OaHrFlowItem,
  OaHrFlowQuery,
  OaHrLeaveSaveParams,
  OaHrOvertimeSaveParams,
  OaHrResignationSaveParams,
  OaHrVisitorSaveParams,
  OaHrAttExceptionSaveParams,
  OaHrVehicleApplySaveParams,
  OaHrVehicleItem,
  OaHrVehicleQuery,
  OaHrVehicleSaveParams,
  OaMeetingRoomItem,
  OaMeetingRoomQuery,
  OaMeetingRoomSaveParams,
  OaMeetingBookingItem,
  OaMeetingBookingQuery,
  OaMeetingBookingSaveParams,
  OaScheduleItem,
  OaScheduleQuery,
  OaScheduleSaveParams,
  OaAnnouncementItem,
  OaAnnouncementQuery,
  OaAnnouncementSaveParams,
  OaVoteItem,
  OaVoteOptionItem,
  OaVoteQuery,
  OaVoteSaveParams,
  OaAlbumItem,
  OaAlbumPhotoItem,
  OaAlbumQuery,
  OaAlbumSaveParams,
  OaAlbumPhotoSaveParams,
  OaCollabTaskItem,
  OaCollabTaskQuery,
  OaCollabTaskSaveParams,
  OaCollabCommentItem,
  OaCollabCommentSaveParams,
  OaWorkReportItem,
  OaWorkReportQuery,
  OaWorkReportSaveParams,
  OaMobileConfigItem,
  OaMobileConfigQuery,
  OaMobileConfigSaveParams,
  OaMobileWorkbench,
  OaAddressBookItem,
  OaAddressBookQuery,
  OaBizFlowItem,
  OaBizFlowQuery,
  OaBizCustomerCreditSaveParams,
  OaBizPriceApprovalSaveParams,
  OaBizDeliveryCoordinationSaveParams,
  OaBizProductionSequenceSaveParams,
  OaBizOrderVoucherSaveParams,
  OaBizWorkshopDailySaveParams,
  OaBizSupplierEvaluationSaveParams,
  OaBizQualityMetricSaveParams,
  OaBizInspectionRequestSaveParams,
  OaBizFiveMChangeSaveParams,
  OaBizSampleIssueSaveParams,
  OaBizInternalAuditSaveParams,
  OaBizEcrRiskReviewSaveParams,
  OaBizChangeNoticeSaveParams,
  OaBizNoticeReceiptParams,
  OaBizMoldTrialSaveParams,
  OaAssetRepairSaveParams,
  OaAssetRepairDispatchParams,
  OaAssetRepairHandleParams,
  OaAssetRepairAcceptParams,
  OaAssetKnowledgeSaveParams,
  OaContractSaveParams,
  OaContractVersionSaveParams,
  OaOfficeSupplyItemSaveParams,
  OaOfficeSupplyRequestSaveParams,
  OaLibraryBookSaveParams,
  OaLibraryBorrowSaveParams,
  OaCustomerSaveParams,
  OaCustomerContactSaveParams,
  OaI18nLocaleSaveParams,
  OaI18nMessageSaveParams,
  OaFactoryParamSaveParams,
  OaSysLogSaveParams,
  OaIntegrationQuery,
  OaApiPolicyItem,
  OaApiCredentialItem,
  OaApiAccessLogItem,
  OaWebhookSubscriptionItem,
  OaWebhookDeliveryItem,
  OaMessageTaskItem,
  OaIntegrationConnectorItem,
  OaConnectorSyncLogItem,
  OaMasterDataMappingItem,
  OaEdiNoticeItem,
  OaApiPolicySaveParams,
  OaApiCredentialSaveParams,
  OaApiAccessLogSaveParams,
  OaWebhookSubscriptionSaveParams,
  OaWebhookDeliverySaveParams,
  OaMessageTaskSaveParams,
  OaIntegrationConnectorSaveParams,
  OaConnectorSyncLogSaveParams,
  OaMasterDataMappingSaveParams,
  OaEdiNoticeSaveParams,
  OaMigrationQuery,
  OaMigrationObjectItem,
  OaMigrationFieldMappingItem,
  OaMigrationBatchItem,
  OaMigrationCleanRuleItem,
  OaMigrationCleanLogItem,
  OaMigrationAttachmentItem,
  OaMigrationHistoryFlowItem,
  OaMigrationReconcileItem,
  OaMigrationDualRunItem,
  OaMigrationObjectSaveParams,
  OaMigrationFieldMappingSaveParams,
  OaMigrationBatchSaveParams,
  OaMigrationCleanRuleSaveParams,
  OaMigrationCleanLogSaveParams,
  OaMigrationAttachmentSaveParams,
  OaMigrationHistoryFlowSaveParams,
  OaMigrationReconcileSaveParams,
  OaMigrationDualRunSaveParams,
  OaTestQuery,
  OaTestCaseItem,
  OaPermissionTestItem,
  OaSecurityTestItem,
  OaPerfTestItem,
  OaCompatTestItem,
  OaBackupDrillItem,
  OaUatRecordItem,
  OaTrainingMaterialItem,
  OaCutoverPlanItem,
  OaTestCaseSaveParams,
  OaPermissionTestSaveParams,
  OaSecurityTestSaveParams,
  OaPerfTestSaveParams,
  OaCompatTestSaveParams,
  OaBackupDrillSaveParams,
  OaUatRecordSaveParams,
  OaTrainingMaterialSaveParams,
  OaCutoverPlanSaveParams,
  OaGoliveQuery,
  OaGoliveFreezeItem,
  OaGoliveFreezeSaveParams,
  OaFinalMigrationItem,
  OaFinalMigrationSaveParams,
  OaEntrySwitchItem,
  OaEntrySwitchSaveParams,
  OaGoliveWatchItem,
  OaGoliveWatchSaveParams,
  OaRollbackRecordItem,
  OaRollbackRecordSaveParams,
  OaLegacyArchiveItem,
  OaLegacyArchiveSaveParams,
  OaDecommissionRecordItem,
  OaDecommissionRecordSaveParams,
  OaOpsHandoverItem,
  OaOpsHandoverSaveParams,
} from '@/types/oa';

/** OA 门户首页 */
export const oaPortalService = {
  home: (): Promise<OaPortalHome> =>
    request<OaPortalHome>({ method: 'GET', url: '/oa/portal/home' }),
};

/** 岗位管理 */
export const oaPositionService = {
  page: (params: OaPositionQuery): Promise<PageResult<OaPositionItem>> =>
    request<PageResult<OaPositionItem>>({ method: 'GET', url: '/oa/positions', params }),

  enabled: (): Promise<OaPositionItem[]> =>
    request<OaPositionItem[]>({ method: 'GET', url: '/oa/positions/enabled' }),

  create: (data: OaPositionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/positions', data }),

  update: (positionId: number, data: OaPositionSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/positions/${positionId}`, data }),

  remove: (positionId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/positions/${positionId}` }),
};

/** 员工档案 */
export const oaEmploymentService = {
  page: (params: OaEmploymentQuery): Promise<PageResult<OaEmploymentItem>> =>
    request<PageResult<OaEmploymentItem>>({ method: 'GET', url: '/oa/employments', params }),

  create: (data: OaEmploymentSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/employments', data }),

  update: (employmentId: number, data: OaEmploymentSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/employments/${employmentId}`, data }),

  remove: (employmentId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/employments/${employmentId}` }),
};

/** 流程代理授权 */
export const oaDelegationService = {
  page: (params: OaDelegationQuery): Promise<PageResult<OaDelegationItem>> =>
    request<PageResult<OaDelegationItem>>({ method: 'GET', url: '/oa/delegations', params }),

  create: (data: OaDelegationSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/delegations', data }),

  update: (delegationId: number, data: OaDelegationSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/delegations/${delegationId}`, data }),

  revoke: (delegationId: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/delegations/${delegationId}/revoke` }),

  remove: (delegationId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/delegations/${delegationId}` }),
};

/** 应用中心 */
export const oaApplicationService = {
  page: (params: OaApplicationQuery): Promise<PageResult<OaApplicationItem>> =>
    request<PageResult<OaApplicationItem>>({ method: 'GET', url: '/oa/applications', params }),

  grantedRoleIds: (applicationId: number): Promise<number[]> =>
    request<number[]>({ method: 'GET', url: `/oa/applications/${applicationId}/roles` }),

  create: (data: OaApplicationSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/applications', data }),

  update: (applicationId: number, data: OaApplicationSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/applications/${applicationId}`, data }),

  grant: (applicationId: number, roleIds: number[]): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/applications/${applicationId}/grant`, data: { roleIds } }),

  remove: (applicationId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/applications/${applicationId}` }),
};

/** SSO 客户端 */
export const oaSsoClientService = {
  page: (params: OaSsoClientQuery): Promise<PageResult<OaSsoClientItem>> =>
    request<PageResult<OaSsoClientItem>>({ method: 'GET', url: '/oa/sso-clients', params }),

  create: (data: OaSsoClientSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/sso-clients', data }),

  update: (id: number, data: OaSsoClientSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/sso-clients/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/sso-clients/${id}` }),
};

/** 表单定义（低代码表单设计器） */
export const oaFormService = {
  page: (params: OaFormQuery): Promise<PageResult<OaFormDefinitionItem>> =>
    request<PageResult<OaFormDefinitionItem>>({ method: 'GET', url: '/oa/forms', params }),

  published: (): Promise<OaFormDefinitionItem[]> =>
    request<OaFormDefinitionItem[]>({ method: 'GET', url: '/oa/forms/published' }),

  detail: (formId: number): Promise<OaFormDetail> =>
    request<OaFormDetail>({ method: 'GET', url: `/oa/forms/${formId}` }),

  create: (data: OaFormSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/forms', data }),

  update: (formId: number, data: OaFormSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/forms/${formId}`, data }),

  remove: (formId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/forms/${formId}` }),

  publish: (formId: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/forms/${formId}/publish` }),
};

/** 流程定义（可视化流程设计器） */
export const oaProcessService = {
  page: (params: OaProcessQuery): Promise<PageResult<OaProcessDefinitionItem>> =>
    request<PageResult<OaProcessDefinitionItem>>({ method: 'GET', url: '/oa/processes', params }),

  published: (): Promise<OaProcessDefinitionItem[]> =>
    request<OaProcessDefinitionItem[]>({ method: 'GET', url: '/oa/processes/published' }),

  detail: (processId: number): Promise<OaProcessDetail> =>
    request<OaProcessDetail>({ method: 'GET', url: `/oa/processes/${processId}` }),

  create: (data: OaProcessSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/processes', data }),

  update: (processId: number, data: OaProcessSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/processes/${processId}`, data }),

  remove: (processId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/processes/${processId}` }),

  publish: (processId: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/processes/${processId}/publish` }),
};

/** 流程实例（我的申请、流程监控） */
export const oaInstanceService = {
  my: (params: OaInstanceQuery): Promise<PageResult<OaProcessInstanceItem>> =>
    request<PageResult<OaProcessInstanceItem>>({ method: 'GET', url: '/oa/instances/my', params }),

  monitor: (params: OaInstanceQuery): Promise<PageResult<OaProcessInstanceItem>> =>
    request<PageResult<OaProcessInstanceItem>>({ method: 'GET', url: '/oa/instances/monitor', params }),

  detail: (instanceId: number): Promise<OaInstanceDetail> =>
    request<OaInstanceDetail>({ method: 'GET', url: `/oa/instances/${instanceId}` }),

  start: (data: OaInstanceStartParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/instances/start', data }),

  cancel: (instanceId: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/instances/${instanceId}/cancel` }),
};

/** 审批任务（我的待办、我的已办） */
export const oaTaskService = {
  todo: (params: OaTaskQuery): Promise<PageResult<OaTaskItem>> =>
    request<PageResult<OaTaskItem>>({ method: 'GET', url: '/oa/tasks/todo', params }),

  done: (params: OaTaskQuery): Promise<PageResult<OaTaskItem>> =>
    request<PageResult<OaTaskItem>>({ method: 'GET', url: '/oa/tasks/done', params }),

  approve: (taskId: number, data: OaTaskApproveParams): Promise<void> =>
    request<void>({ method: 'POST', url: `/oa/tasks/${taskId}/approve`, data }),
};

/** 邮件文件夹（系统文件夹 + 自定义文件夹） */
export const oaMailFolderService = {
  list: (): Promise<MailFolderItem[]> =>
    request<MailFolderItem[]>({ method: 'GET', url: '/oa/mail-folders' }),

  create: (data: MailFolderSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/mail-folders', data }),

  update: (folderId: number, data: MailFolderSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/mail-folders/${folderId}`, data }),

  remove: (folderId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/mail-folders/${folderId}` }),
};

/** 内部邮件（收件箱、写信、回复转发、已读星标、移动与搜索） */
export const oaMailService = {
  page: (params: MailQuery): Promise<PageResult<MailItem>> =>
    request<PageResult<MailItem>>({ method: 'GET', url: '/oa/mails', params }),

  unreadCount: (): Promise<number> =>
    request<number>({ method: 'GET', url: '/oa/mails/unread-count' }),

  detail: (messageId: number): Promise<MailDetail> =>
    request<MailDetail>({ method: 'GET', url: `/oa/mails/${messageId}` }),

  send: (data: MailSendParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/mails', data }),

  markRead: (messageId: number, readFlag?: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/mails/${messageId}/read`, params: { readFlag } }),

  markStar: (messageId: number, starFlag?: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/mails/${messageId}/star`, params: { starFlag } }),

  move: (messageId: number, folderCode: string): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/mails/${messageId}/move`, data: { folderCode } }),

  remove: (messageId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/mails/${messageId}` }),
};

/** 邮件附件（上传、下载、删除） */
export const oaMailAttachmentService = {
  upload: (file: File): Promise<MailAttachmentItem> => {
    const formData = new FormData();
    formData.append('file', file);
    return request<MailAttachmentItem>({
      method: 'POST',
      url: '/oa/mail-attachments',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** 附件二进制（用于本地下载，需携带鉴权头故不能直接用 URL） */
  download: (attachmentId: number): Promise<Blob> =>
    instance
      .request({
        method: 'GET',
        url: `/oa/mail-attachments/${attachmentId}/download`,
        responseType: 'blob',
      })
      .then((resp) => resp.data as Blob),

  remove: (attachmentId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/mail-attachments/${attachmentId}` }),
};

/** 统一消息中心（站内通知） */
export const oaNotificationService = {
  page: (params: NotificationQueryParams): Promise<PageResult<NotificationItem>> =>
    request<PageResult<NotificationItem>>({ method: 'GET', url: '/oa/notifications', params }),

  unreadCount: (): Promise<number> =>
    request<number>({ method: 'GET', url: '/oa/notifications/unread-count' }),

  detail: (notificationId: number): Promise<NotificationItem> =>
    request<NotificationItem>({ method: 'GET', url: `/oa/notifications/${notificationId}` }),

  markRead: (notificationId: number, readFlag?: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/notifications/${notificationId}/read`, params: { readFlag } }),

  markAllRead: (): Promise<number> =>
    request<number>({ method: 'PUT', url: '/oa/notifications/read-all' }),

  archive: (notificationId: number, archivedFlag?: number): Promise<void> =>
    request<void>({
      method: 'PUT',
      url: `/oa/notifications/${notificationId}/archive`,
      params: { archivedFlag },
    }),

  broadcast: (data: NotificationBroadcastParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/notifications/broadcast', data }),
};

/** 通知模板（渠道与变量可配置） */
export const oaNotifyTemplateService = {
  page: (params: NotifyTemplateQueryParams): Promise<PageResult<NotifyTemplateItem>> =>
    request<PageResult<NotifyTemplateItem>>({ method: 'GET', url: '/oa/notify-templates', params }),

  enabled: (): Promise<NotifyTemplateItem[]> =>
    request<NotifyTemplateItem[]>({ method: 'GET', url: '/oa/notify-templates/enabled' }),

  detail: (templateId: number): Promise<NotifyTemplateItem> =>
    request<NotifyTemplateItem>({ method: 'GET', url: `/oa/notify-templates/${templateId}` }),

  create: (data: NotifyTemplateSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/notify-templates', data }),

  update: (templateId: number, data: NotifyTemplateSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/notify-templates/${templateId}`, data }),

  remove: (templateId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/notify-templates/${templateId}` }),
};

/* ---------------- 文档目录与目录权限（OA-N5）---------------- */

/** 文档目录（公共/部门/项目/个人/共享/流程归档/知识库） */
export const oaDocFolderService = {
  tree: (folderType?: string): Promise<OaDocFolderItem[]> =>
    request<OaDocFolderItem[]>({ method: 'GET', url: '/oa/doc-folders/tree', params: { folderType } }),

  list: (parentId?: number, folderType?: string): Promise<OaDocFolderItem[]> =>
    request<OaDocFolderItem[]>({ method: 'GET', url: '/oa/doc-folders', params: { parentId, folderType } }),

  detail: (folderId: number): Promise<OaDocFolderItem> =>
    request<OaDocFolderItem>({ method: 'GET', url: `/oa/doc-folders/${folderId}` }),

  create: (data: OaDocFolderSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/doc-folders', data }),

  update: (folderId: number, data: OaDocFolderSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/doc-folders/${folderId}`, data }),

  remove: (folderId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/doc-folders/${folderId}` }),

  permissions: (folderId: number): Promise<OaDocFolderPermissionItem[]> =>
    request<OaDocFolderPermissionItem[]>({ method: 'GET', url: `/oa/doc-folders/${folderId}/permissions` }),

  createPermission: (folderId: number, data: OaDocFolderPermissionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/oa/doc-folders/${folderId}/permissions`, data }),

  updatePermission: (permissionId: number, data: OaDocFolderPermissionSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/doc-folders/permissions/${permissionId}`, data }),

  deletePermission: (permissionId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/doc-folders/permissions/${permissionId}` }),
};

/* ---------------- 文档主数据与版本（OA-N5）---------------- */

function buildDocFormData(data: OaDocSaveParams, file?: File): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });
  if (file) {
    formData.append('file', file);
  }
  return formData;
}

/** 文档中心主数据、版本、发布归档与回收站 */
export const oaDocumentService = {
  page: (params: OaDocQuery): Promise<PageResult<OaDocumentItem>> =>
    request<PageResult<OaDocumentItem>>({ method: 'GET', url: '/oa/documents', params }),

  recyclePage: (pageNum?: number, pageSize?: number): Promise<PageResult<OaDocumentItem>> =>
    request<PageResult<OaDocumentItem>>({
      method: 'GET',
      url: '/oa/documents/recycle',
      params: { pageNum, pageSize },
    }),

  detail: (docId: number): Promise<OaDocDetail> =>
    request<OaDocDetail>({ method: 'GET', url: `/oa/documents/${docId}` }),

  create: (data: OaDocSaveParams, file: File): Promise<number> =>
    request<number>({
      method: 'POST',
      url: '/oa/documents',
      data: buildDocFormData(data, file),
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (docId: number, data: OaDocSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/documents/${docId}`, data }),

  remove: (docId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/documents/${docId}` }),

  uploadVersion: (docId: number, file: File, revisionNote?: string): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    if (revisionNote) {
      formData.append('revisionNote', revisionNote);
    }
    return request<void>({
      method: 'POST',
      url: `/oa/documents/${docId}/versions`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  versions: (docId: number): Promise<OaDocVersionItem[]> =>
    request<OaDocVersionItem[]>({ method: 'GET', url: `/oa/documents/${docId}/versions` }),

  restoreVersion: (docId: number, versionId: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/documents/${docId}/versions/${versionId}/restore` }),

  lockVersion: (versionId: number, lockFlag?: number): Promise<void> =>
    request<void>({
      method: 'PUT',
      url: `/oa/documents/versions/${versionId}/lock`,
      params: { lockFlag },
    }),

  /** 下载文档原文件（默认当前版本，可指定历史版本） */
  download: (docId: number, versionId?: number): Promise<Blob> =>
    instance
      .request({
        method: 'GET',
        url: `/oa/documents/${docId}/download`,
        params: { versionId },
        responseType: 'blob',
      })
      .then((resp) => resp.data as Blob),

  publish: (docId: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/documents/${docId}/publish` }),

  voidDocument: (docId: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/documents/${docId}/void` }),

  archive: (docId: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/documents/${docId}/archive` }),

  restore: (docId: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/documents/recycle/${docId}/restore` }),

  purge: (docId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/documents/recycle/${docId}` }),
};

/* ---------------- 文档评论与协作（OA-N5）---------------- */

export const oaDocCommentService = {
  list: (docId: number): Promise<OaDocCommentItem[]> =>
    request<OaDocCommentItem[]>({ method: 'GET', url: '/oa/doc-comments', params: { docId } }),

  create: (docId: number, data: OaDocCommentSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/doc-comments', params: { docId }, data }),

  remove: (commentId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/doc-comments/${commentId}` }),
};

/* ---------------- 文档分享（OA-N5）---------------- */

export const oaDocShareService = {
  list: (docId: number): Promise<OaDocShareItem[]> =>
    request<OaDocShareItem[]>({ method: 'GET', url: '/oa/doc-shares', params: { docId } }),

  create: (docId: number, data: OaDocShareSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/doc-shares', params: { docId }, data }),

  revoke: (shareId: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/doc-shares/${shareId}/revoke` }),
};

/* ---------------- 统一检索（OA-N5）---------------- */

export const oaDocSearchService = {
  search: (params: OaDocSearchQuery): Promise<PageResult<OaDocSearchItem>> =>
    request<PageResult<OaDocSearchItem>>({ method: 'GET', url: '/oa/doc-search', params }),

  reindex: (): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/doc-search/reindex' }),
};

/* ---------------- 文档访问审计（OA-N5）---------------- */

export const oaDocAccessLogService = {
  page: (params: OaDocAccessLogQuery): Promise<PageResult<OaDocAccessLogItem>> =>
    request<PageResult<OaDocAccessLogItem>>({ method: 'GET', url: '/oa/doc-access-logs', params }),
};

/* ---------------- 行政人事流程单（OA-N6）---------------- */

/** 请假申请 */
export const oaHrLeaveService = {
  page: (params: OaHrFlowQuery): Promise<PageResult<OaHrFlowItem>> =>
    request<PageResult<OaHrFlowItem>>({ method: 'GET', url: '/oa/hr/leaves', params }),

  detail: (id: number): Promise<OaHrFlowItem> =>
    request<OaHrFlowItem>({ method: 'GET', url: `/oa/hr/leaves/${id}` }),

  create: (data: OaHrLeaveSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/hr/leaves', data }),

  update: (id: number, data: OaHrLeaveSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/leaves/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/hr/leaves/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/leaves/${id}/cancel` }),
};

/** 加班申请 */
export const oaHrOvertimeService = {
  page: (params: OaHrFlowQuery): Promise<PageResult<OaHrFlowItem>> =>
    request<PageResult<OaHrFlowItem>>({ method: 'GET', url: '/oa/hr/overtimes', params }),

  detail: (id: number): Promise<OaHrFlowItem> =>
    request<OaHrFlowItem>({ method: 'GET', url: `/oa/hr/overtimes/${id}` }),

  create: (data: OaHrOvertimeSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/hr/overtimes', data }),

  update: (id: number, data: OaHrOvertimeSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/overtimes/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/hr/overtimes/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/overtimes/${id}/cancel` }),
};

/** 离职申请 */
export const oaHrResignationService = {
  page: (params: OaHrFlowQuery): Promise<PageResult<OaHrFlowItem>> =>
    request<PageResult<OaHrFlowItem>>({ method: 'GET', url: '/oa/hr/resignations', params }),

  detail: (id: number): Promise<OaHrFlowItem> =>
    request<OaHrFlowItem>({ method: 'GET', url: `/oa/hr/resignations/${id}` }),

  create: (data: OaHrResignationSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/hr/resignations', data }),

  update: (id: number, data: OaHrResignationSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/resignations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/hr/resignations/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/resignations/${id}/cancel` }),
};

/** 访客申请 */
export const oaHrVisitorService = {
  page: (params: OaHrFlowQuery): Promise<PageResult<OaHrFlowItem>> =>
    request<PageResult<OaHrFlowItem>>({ method: 'GET', url: '/oa/hr/visitors', params }),

  detail: (id: number): Promise<OaHrFlowItem> =>
    request<OaHrFlowItem>({ method: 'GET', url: `/oa/hr/visitors/${id}` }),

  create: (data: OaHrVisitorSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/hr/visitors', data }),

  update: (id: number, data: OaHrVisitorSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/visitors/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/hr/visitors/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/visitors/${id}/cancel` }),

  checkin: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/visitors/${id}/checkin` }),

  checkout: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/visitors/${id}/checkout` }),
};

/** 考勤异常处理 */
export const oaHrAttExceptionService = {
  page: (params: OaHrFlowQuery): Promise<PageResult<OaHrFlowItem>> =>
    request<PageResult<OaHrFlowItem>>({ method: 'GET', url: '/oa/hr/attendance-exceptions', params }),

  detail: (id: number): Promise<OaHrFlowItem> =>
    request<OaHrFlowItem>({ method: 'GET', url: `/oa/hr/attendance-exceptions/${id}` }),

  create: (data: OaHrAttExceptionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/hr/attendance-exceptions', data }),

  update: (id: number, data: OaHrAttExceptionSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/attendance-exceptions/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/hr/attendance-exceptions/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/attendance-exceptions/${id}/cancel` }),
};

/** 用车申请 */
export const oaHrVehicleApplyService = {
  page: (params: OaHrFlowQuery): Promise<PageResult<OaHrFlowItem>> =>
    request<PageResult<OaHrFlowItem>>({ method: 'GET', url: '/oa/hr/vehicle-applies', params }),

  detail: (id: number): Promise<OaHrFlowItem> =>
    request<OaHrFlowItem>({ method: 'GET', url: `/oa/hr/vehicle-applies/${id}` }),

  create: (data: OaHrVehicleApplySaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/hr/vehicle-applies', data }),

  update: (id: number, data: OaHrVehicleApplySaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/vehicle-applies/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/hr/vehicle-applies/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/vehicle-applies/${id}/cancel` }),
};

/* ---------------- 车辆档案（OA-N6）---------------- */

export const oaHrVehicleService = {
  page: (params: OaHrVehicleQuery): Promise<PageResult<OaHrVehicleItem>> =>
    request<PageResult<OaHrVehicleItem>>({ method: 'GET', url: '/oa/hr/vehicles', params }),

  listAll: (): Promise<OaHrVehicleItem[]> =>
    request<OaHrVehicleItem[]>({ method: 'GET', url: '/oa/hr/vehicles/all' }),

  create: (data: OaHrVehicleSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/hr/vehicles', data }),

  update: (id: number, data: OaHrVehicleSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/hr/vehicles/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/hr/vehicles/${id}` }),
};

/* ---------------- 会议室与会议室预约（OA-N6）---------------- */

export const oaMeetingRoomService = {
  page: (params: OaMeetingRoomQuery): Promise<PageResult<OaMeetingRoomItem>> =>
    request<PageResult<OaMeetingRoomItem>>({ method: 'GET', url: '/oa/meeting-rooms', params }),

  listAll: (): Promise<OaMeetingRoomItem[]> =>
    request<OaMeetingRoomItem[]>({ method: 'GET', url: '/oa/meeting-rooms/all' }),

  create: (data: OaMeetingRoomSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/meeting-rooms', data }),

  update: (id: number, data: OaMeetingRoomSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/meeting-rooms/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/meeting-rooms/${id}` }),
};

export const oaMeetingBookingService = {
  page: (params: OaMeetingBookingQuery): Promise<PageResult<OaMeetingBookingItem>> =>
    request<PageResult<OaMeetingBookingItem>>({ method: 'GET', url: '/oa/meeting-bookings', params }),

  create: (data: OaMeetingBookingSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/meeting-bookings', data }),

  update: (id: number, data: OaMeetingBookingSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/meeting-bookings/${id}`, data }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/meeting-bookings/${id}/cancel` }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/meeting-bookings/${id}` }),
};

/* ---------------- 日程（OA-N6）---------------- */

export const oaScheduleService = {
  page: (params: OaScheduleQuery): Promise<PageResult<OaScheduleItem>> =>
    request<PageResult<OaScheduleItem>>({ method: 'GET', url: '/oa/schedules', params }),

  create: (data: OaScheduleSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/schedules', data }),

  update: (id: number, data: OaScheduleSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/schedules/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/schedules/${id}` }),
};

/* ---------------- 公告与新闻（OA-N6）---------------- */

export const oaAnnouncementService = {
  page: (params: OaAnnouncementQuery): Promise<PageResult<OaAnnouncementItem>> =>
    request<PageResult<OaAnnouncementItem>>({ method: 'GET', url: '/oa/announcements', params }),

  detail: (id: number): Promise<OaAnnouncementItem> =>
    request<OaAnnouncementItem>({ method: 'GET', url: `/oa/announcements/${id}` }),

  create: (data: OaAnnouncementSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/announcements', data }),

  update: (id: number, data: OaAnnouncementSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/announcements/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/announcements/${id}` }),

  publish: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/announcements/${id}/publish` }),

  offline: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/announcements/${id}/offline` }),

  markRead: (id: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/oa/announcements/${id}/read` }),
};

/* ---------------- 投票调查（OA-N6）---------------- */

export const oaVoteService = {
  page: (params: OaVoteQuery): Promise<PageResult<OaVoteItem>> =>
    request<PageResult<OaVoteItem>>({ method: 'GET', url: '/oa/votes', params }),

  detail: (id: number): Promise<{ vote: OaVoteItem; options: OaVoteOptionItem[] }> =>
    request<{ vote: OaVoteItem; options: OaVoteOptionItem[] }>({ method: 'GET', url: `/oa/votes/${id}` }),

  create: (data: OaVoteSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/votes', data }),

  update: (id: number, data: OaVoteSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/votes/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/votes/${id}` }),

  publish: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/votes/${id}/publish` }),

  close: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/votes/${id}/close` }),

  castVote: (id: number, optionIds: number[]): Promise<void> =>
    request<void>({ method: 'POST', url: `/oa/votes/${id}/vote`, data: { optionIds } }),
};

/* ---------------- 相册（OA-N6）---------------- */

export const oaAlbumService = {
  page: (params: OaAlbumQuery): Promise<PageResult<OaAlbumItem>> =>
    request<PageResult<OaAlbumItem>>({ method: 'GET', url: '/oa/albums', params }),

  create: (data: OaAlbumSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/albums', data }),

  update: (id: number, data: OaAlbumSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/albums/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/albums/${id}` }),

  photos: (albumId: number): Promise<OaAlbumPhotoItem[]> =>
    request<OaAlbumPhotoItem[]>({ method: 'GET', url: `/oa/albums/${albumId}/photos` }),

  addPhoto: (albumId: number, data: OaAlbumPhotoSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/oa/albums/${albumId}/photos`, data }),

  removePhoto: (photoId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/albums/photos/${photoId}` }),
};

/* ---------------- 协作任务、评论与工作汇报（OA-N6）---------------- */

export const oaCollabTaskService = {
  page: (params: OaCollabTaskQuery): Promise<PageResult<OaCollabTaskItem>> =>
    request<PageResult<OaCollabTaskItem>>({ method: 'GET', url: '/oa/collab-tasks', params }),

  create: (data: OaCollabTaskSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/collab-tasks', data }),

  update: (id: number, data: OaCollabTaskSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/collab-tasks/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/collab-tasks/${id}` }),
};

export const oaCollabCommentService = {
  list: (bizType: string, bizId: number): Promise<OaCollabCommentItem[]> =>
    request<OaCollabCommentItem[]>({ method: 'GET', url: '/oa/collab-comments', params: { bizType, bizId } }),

  create: (data: OaCollabCommentSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/collab-comments', data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/collab-comments/${id}` }),
};

export const oaWorkReportService = {
  page: (params: OaWorkReportQuery): Promise<PageResult<OaWorkReportItem>> =>
    request<PageResult<OaWorkReportItem>>({ method: 'GET', url: '/oa/work-reports', params }),

  create: (data: OaWorkReportSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/work-reports', data }),

  update: (id: number, data: OaWorkReportSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/work-reports/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/work-reports/${id}` }),

  markRead: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/work-reports/${id}/read` }),
};

/* ---------------- 移动端配置与通讯录（OA-N6）---------------- */

export const oaMobileConfigService = {
  page: (params: OaMobileConfigQuery): Promise<PageResult<OaMobileConfigItem>> =>
    request<PageResult<OaMobileConfigItem>>({ method: 'GET', url: '/oa/mobile/configs', params }),

  create: (data: OaMobileConfigSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/mobile/configs', data }),

  update: (id: number, data: OaMobileConfigSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/mobile/configs/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/mobile/configs/${id}` }),

  workbench: (): Promise<OaMobileWorkbench> =>
    request<OaMobileWorkbench>({ method: 'GET', url: '/oa/mobile/workbench' }),
};

export const oaAddressBookService = {
  page: (params: OaAddressBookQuery): Promise<PageResult<OaAddressBookItem>> =>
    request<PageResult<OaAddressBookItem>>({ method: 'GET', url: '/oa/address-book', params }),
};

/* ---------------- 销售采购生产品质研发流程（OA-N7）---------------- */

/** 客户授信（OA-DEV-062） */
export const oaBizCreditService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/credits', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/credits/${id}` }),

  create: (data: OaBizCustomerCreditSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/credits', data }),

  update: (id: number, data: OaBizCustomerCreditSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/credits/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/credits/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/credits/${id}/cancel` }),
};

/** 价格审批（OA-DEV-063/071） */
export const oaBizPriceService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/price-approvals', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/price-approvals/${id}` }),

  create: (data: OaBizPriceApprovalSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/price-approvals', data }),

  update: (id: number, data: OaBizPriceApprovalSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/price-approvals/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/price-approvals/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/price-approvals/${id}/cancel` }),
};

/** 交期延误协调单（OA-DEV-064） */
export const oaBizDeliveryService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/delivery-coordinations', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/delivery-coordinations/${id}` }),

  create: (data: OaBizDeliveryCoordinationSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/delivery-coordinations', data }),

  update: (id: number, data: OaBizDeliveryCoordinationSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/delivery-coordinations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/delivery-coordinations/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/delivery-coordinations/${id}/cancel` }),

  close: (id: number, correctiveAction?: string): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/delivery-coordinations/${id}/close`, params: { correctiveAction } }),
};

/** 生产顺序表（OA-DEV-065，无流程） */
export const oaBizProductionSequenceService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/production-sequences', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/production-sequences/${id}` }),

  listItems: (id: number): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: `/oa/biz/production-sequences/${id}/items` }),

  create: (data: OaBizProductionSequenceSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/production-sequences', data }),

  update: (id: number, data: OaBizProductionSequenceSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/production-sequences/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/production-sequences/${id}` }),

  publish: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/production-sequences/${id}/publish` }),

  close: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/production-sequences/${id}/close` }),
};

/** 订货传票（OA-DEV-066/071） */
export const oaBizOrderVoucherService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/order-vouchers', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/order-vouchers/${id}` }),

  create: (data: OaBizOrderVoucherSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/order-vouchers', data }),

  update: (id: number, data: OaBizOrderVoucherSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/order-vouchers/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/order-vouchers/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/order-vouchers/${id}/cancel` }),
};

/** 车间生产日报（OA-DEV-067，无流程） */
export const oaBizWorkshopDailyService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/workshop-dailies', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/workshop-dailies/${id}` }),

  create: (data: OaBizWorkshopDailySaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/workshop-dailies', data }),

  update: (id: number, data: OaBizWorkshopDailySaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/workshop-dailies/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/workshop-dailies/${id}` }),

  submit: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/workshop-dailies/${id}/submit` }),

  confirm: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/workshop-dailies/${id}/confirm` }),
};

/** 供方考评（OA-DEV-068） */
export const oaBizSupplierEvaluationService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/supplier-evaluations', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/supplier-evaluations/${id}` }),

  listItems: (id: number): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: `/oa/biz/supplier-evaluations/${id}/items` }),

  create: (data: OaBizSupplierEvaluationSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/supplier-evaluations', data }),

  update: (id: number, data: OaBizSupplierEvaluationSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/supplier-evaluations/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/supplier-evaluations/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/supplier-evaluations/${id}/cancel` }),
};

/** 质量报表与指标（OA-DEV-069，无流程） */
export const oaBizQualityMetricService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/quality-metrics', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/quality-metrics/${id}` }),

  create: (data: OaBizQualityMetricSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/quality-metrics', data }),

  update: (id: number, data: OaBizQualityMetricSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/quality-metrics/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/quality-metrics/${id}` }),

  publish: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/quality-metrics/${id}/publish` }),
};

/** 检测委托（OA-DEV-070） */
export const oaBizInspectionService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/inspection-requests', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/inspection-requests/${id}` }),

  create: (data: OaBizInspectionRequestSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/inspection-requests', data }),

  update: (id: number, data: OaBizInspectionRequestSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/inspection-requests/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/inspection-requests/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/inspection-requests/${id}/cancel` }),

  recordResult: (
    id: number,
    data: {
      resultStatus?: string;
      resultDesc?: string;
      reportAttachmentJson?: string;
      qmsRefNo?: string;
    },
  ): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/inspection-requests/${id}/result`, params: data }),
};

/** 5M 变更追踪（OA-DEV-072） */
export const oaBizFiveMChangeService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/five-m-changes', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/five-m-changes/${id}` }),

  create: (data: OaBizFiveMChangeSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/five-m-changes', data }),

  update: (id: number, data: OaBizFiveMChangeSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/five-m-changes/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/five-m-changes/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/five-m-changes/${id}/cancel` }),
};

/** 样品试制问题改善（OA-DEV-073） */
export const oaBizSampleIssueService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/sample-issues', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/sample-issues/${id}` }),

  create: (data: OaBizSampleIssueSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/sample-issues', data }),

  update: (id: number, data: OaBizSampleIssueSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/sample-issues/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/sample-issues/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/sample-issues/${id}/cancel` }),

  startVerify: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/sample-issues/${id}/start-verify` }),

  close: (id: number, verifyResult?: string): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/sample-issues/${id}/close`, params: { verifyResult } }),
};

/** 内部审核实施计划（OA-DEV-074） */
export const oaBizInternalAuditService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/internal-audits', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/internal-audits/${id}` }),

  listIssues: (id: number): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: `/oa/biz/internal-audits/${id}/issues` }),

  create: (data: OaBizInternalAuditSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/internal-audits', data }),

  update: (id: number, data: OaBizInternalAuditSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/internal-audits/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/internal-audits/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/internal-audits/${id}/cancel` }),

  report: (id: number, auditConclusion?: string): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/internal-audits/${id}/report`, params: { auditConclusion } }),

  close: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/internal-audits/${id}/close` }),
};

/** 设计工程变更风险评审 ECR（OA-DEV-075） */
export const oaBizEcrService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/ecr-risk-reviews', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/ecr-risk-reviews/${id}` }),

  create: (data: OaBizEcrRiskReviewSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/ecr-risk-reviews', data }),

  update: (id: number, data: OaBizEcrRiskReviewSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/ecr-risk-reviews/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/ecr-risk-reviews/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/ecr-risk-reviews/${id}/cancel` }),

  linkPlmChange: (id: number, plmChangeNo?: string, plmChangeStatus?: string): Promise<void> =>
    request<void>({
      method: 'PUT',
      url: `/oa/biz/ecr-risk-reviews/${id}/plm-change`,
      params: { plmChangeNo, plmChangeStatus },
    }),
};

/** 变更通知与图纸补发（OA-DEV-076） */
export const oaBizChangeNoticeService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/change-notices', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/change-notices/${id}` }),

  pageMyReceipt: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/change-notices/my-receipts', params }),

  listReceipts: (id: number): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: `/oa/biz/change-notices/${id}/receipts` }),

  create: (data: OaBizChangeNoticeSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/change-notices', data }),

  update: (id: number, data: OaBizChangeNoticeSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/change-notices/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/change-notices/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/change-notices/${id}/cancel` }),

  sign: (id: number, data: OaBizNoticeReceiptParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/change-notices/${id}/sign`, data }),
};

/** 新开模检查与零件试流（OA-DEV-077） */
export const oaBizMoldTrialService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/biz/mold-trials', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/biz/mold-trials/${id}` }),

  create: (data: OaBizMoldTrialSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/biz/mold-trials', data }),

  update: (id: number, data: OaBizMoldTrialSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/mold-trials/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/biz/mold-trials/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/biz/mold-trials/${id}/cancel` }),
};

/* ---------------- OA-N8 资产维修与专项业务应用 ---------------- */

/** 设备维修工单（OA-DEV-078） */
export const oaAssetRepairService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/asset/repairs', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/asset/repairs/${id}` }),

  create: (data: OaAssetRepairSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/asset/repairs', data }),

  update: (id: number, data: OaAssetRepairSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/asset/repairs/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/asset/repairs/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/asset/repairs/${id}/cancel` }),

  dispatch: (id: number, data: OaAssetRepairDispatchParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/asset/repairs/${id}/dispatch`, data }),

  handle: (id: number, data: OaAssetRepairHandleParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/asset/repairs/${id}/handle`, data }),

  accept: (id: number, data: OaAssetRepairAcceptParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/asset/repairs/${id}/accept`, data }),

  close: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/asset/repairs/${id}/close` }),
};

/** 维修知识库（OA-DEV-079，无流程） */
export const oaAssetKnowledgeService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/asset/knowledge', params }),

  search: (params: { assetCategory?: string; keyword?: string }): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: '/oa/asset/knowledge/search', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/asset/knowledge/${id}` }),

  create: (data: OaAssetKnowledgeSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/asset/knowledge', data }),

  update: (id: number, data: OaAssetKnowledgeSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/asset/knowledge/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/asset/knowledge/${id}` }),
};

/** 合同与合约评审（OA-DEV-080） */
export const oaContractService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/special/contracts', params }),

  expireAlert: (): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: '/oa/special/contracts/expire-alert' }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/special/contracts/${id}` }),

  listVersions: (id: number): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: `/oa/special/contracts/${id}/versions` }),

  create: (data: OaContractSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/special/contracts', data }),

  update: (id: number, data: OaContractSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/special/contracts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/special/contracts/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/special/contracts/${id}/cancel` }),

  addVersion: (id: number, data: OaContractVersionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/oa/special/contracts/${id}/versions`, data }),

  archive: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/special/contracts/${id}/archive` }),

  terminate: (id: number, reason?: string): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/special/contracts/${id}/terminate`, params: { reason } }),
};

/** 办公用品目录（OA-DEV-081，无流程） */
export const oaOfficeSupplyItemService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/special/office-supply/items', params }),

  listEnabled: (): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: '/oa/special/office-supply/items/enabled' }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/special/office-supply/items/${id}` }),

  create: (data: OaOfficeSupplyItemSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/special/office-supply/items', data }),

  update: (id: number, data: OaOfficeSupplyItemSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/special/office-supply/items/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/special/office-supply/items/${id}` }),
};

/** 办公用品申请（OA-DEV-081） */
export const oaOfficeSupplyService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/special/office-supplies', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/special/office-supplies/${id}` }),

  listItems: (id: number): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: `/oa/special/office-supplies/${id}/items` }),

  create: (data: OaOfficeSupplyRequestSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/special/office-supplies', data }),

  update: (id: number, data: OaOfficeSupplyRequestSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/special/office-supplies/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/special/office-supplies/${id}` }),

  cancel: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/special/office-supplies/${id}/cancel` }),

  issue: (id: number, issueRemark?: string): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/special/office-supplies/${id}/issue`, params: { issueRemark } }),
};

/** 图书信息管理（OA-DEV-082，无流程） */
export const oaLibraryService = {
  pageBooks: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/special/library/books', params }),

  listAvailableBooks: (): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: '/oa/special/library/books/available' }),

  bookDetail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/special/library/books/${id}` }),

  createBook: (data: OaLibraryBookSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/special/library/books', data }),

  updateBook: (id: number, data: OaLibraryBookSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/special/library/books/${id}`, data }),

  removeBook: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/special/library/books/${id}` }),

  pageBorrows: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/special/library/borrows', params }),

  overdueList: (): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: '/oa/special/library/borrows/overdue' }),

  borrowDetail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/special/library/borrows/${id}` }),

  borrow: (data: OaLibraryBorrowSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/special/library/borrows', data }),

  returnBook: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/special/library/borrows/${id}/return` }),

  renew: (id: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/special/library/borrows/${id}/renew` }),
};

/** 客户管理轻量模块（OA-DEV-083，无流程） */
export const oaCustomerService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/special/customers', params }),

  detail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/special/customers/${id}` }),

  listContacts: (id: number): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: `/oa/special/customers/${id}/contacts` }),

  create: (data: OaCustomerSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/special/customers', data }),

  update: (id: number, data: OaCustomerSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/special/customers/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/special/customers/${id}` }),

  createContact: (id: number, data: OaCustomerContactSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/oa/special/customers/${id}/contacts`, data }),

  removeContact: (contactId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/special/customers/contacts/${contactId}` }),
};

/** 国际化与多工厂参数（OA-DEV-084，无流程） */
export const oaI18nService = {
  pageLocales: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/system/i18n/locales', params }),

  listEnabledLocales: (): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: '/oa/system/i18n/locales/enabled' }),

  createLocale: (data: OaI18nLocaleSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/system/i18n/locales', data }),

  updateLocale: (id: number, data: OaI18nLocaleSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/system/i18n/locales/${id}`, data }),

  removeLocale: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/system/i18n/locales/${id}` }),

  pageMessages: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/system/i18n/messages', params }),

  listMessagesByLocale: (localeCode?: string): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: '/oa/system/i18n/messages/by-locale', params: { localeCode } }),

  createMessage: (data: OaI18nMessageSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/system/i18n/messages', data }),

  updateMessage: (id: number, data: OaI18nMessageSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/system/i18n/messages/${id}`, data }),

  removeMessage: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/system/i18n/messages/${id}` }),
};

/** 工厂参数（OA-DEV-084，无流程） */
export const oaFactoryParamService = {
  page: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/system/i18n/factory-params', params }),

  listByFactory: (factoryCode?: string): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: '/oa/system/i18n/factory-params/by-factory', params: { factoryCode } }),

  create: (data: OaFactoryParamSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/system/i18n/factory-params', data }),

  update: (id: number, data: OaFactoryParamSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/system/i18n/factory-params/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/system/i18n/factory-params/${id}` }),
};

/** 日志中心（OA-DEV-085，无流程） */
export const oaLogCenterService = {
  pageLogs: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/system/log-center/logs', params }),

  logStats: (params: { startDate?: string; endDate?: string }): Promise<Record<string, number>> =>
    request<Record<string, number>>({ method: 'GET', url: '/oa/system/log-center/logs/stats', params }),

  logDetail: (id: number): Promise<OaBizFlowItem> =>
    request<OaBizFlowItem>({ method: 'GET', url: `/oa/system/log-center/logs/${id}` }),

  recordLog: (data: OaSysLogSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/system/log-center/logs', data }),

  handleAlert: (id: number, handleRemark?: string): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/system/log-center/logs/${id}/handle-alert`, params: { handleRemark } }),

  cleanupLogs: (): Promise<number> =>
    request<number>({ method: 'DELETE', url: '/oa/system/log-center/logs/cleanup' }),

  pageSessions: (params: OaBizFlowQuery): Promise<PageResult<OaBizFlowItem>> =>
    request<PageResult<OaBizFlowItem>>({ method: 'GET', url: '/oa/system/log-center/sessions', params }),

  activeSessions: (userId: number): Promise<OaBizFlowItem[]> =>
    request<OaBizFlowItem[]>({ method: 'GET', url: '/oa/system/log-center/sessions/active', params: { userId } }),

  revokeSession: (id: number, reason?: string): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/system/log-center/sessions/${id}/revoke`, params: { reason } }),

  expireSessions: (): Promise<number> =>
    request<number>({ method: 'DELETE', url: '/oa/system/log-center/sessions/expired' }),
};

/* ---------------- 开放集成平台与协同（OA-N9）---------------- */

/** 统一 API 网关（OA-DEV-086） */
export const oaApiGatewayService = {
  pagePolicies: (params: OaIntegrationQuery): Promise<PageResult<OaApiPolicyItem>> =>
    request<PageResult<OaApiPolicyItem>>({ method: 'GET', url: '/oa/integration/gateway/policies', params }),

  listEnabledPolicies: (): Promise<OaApiPolicyItem[]> =>
    request<OaApiPolicyItem[]>({ method: 'GET', url: '/oa/integration/gateway/policies/enabled' }),

  policyDetail: (id: number): Promise<OaApiPolicyItem> =>
    request<OaApiPolicyItem>({ method: 'GET', url: `/oa/integration/gateway/policies/${id}` }),

  createPolicy: (data: OaApiPolicySaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/integration/gateway/policies', data }),

  updatePolicy: (id: number, data: OaApiPolicySaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/integration/gateway/policies/${id}`, data }),

  removePolicy: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/integration/gateway/policies/${id}` }),

  pageCredentials: (params: OaIntegrationQuery): Promise<PageResult<OaApiCredentialItem>> =>
    request<PageResult<OaApiCredentialItem>>({ method: 'GET', url: '/oa/integration/gateway/credentials', params }),

  listExpiringCredentials: (): Promise<OaApiCredentialItem[]> =>
    request<OaApiCredentialItem[]>({ method: 'GET', url: '/oa/integration/gateway/credentials/expiring' }),

  credentialDetail: (id: number): Promise<OaApiCredentialItem> =>
    request<OaApiCredentialItem>({ method: 'GET', url: `/oa/integration/gateway/credentials/${id}` }),

  createCredential: (data: OaApiCredentialSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/integration/gateway/credentials', data }),

  updateCredential: (id: number, data: OaApiCredentialSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/integration/gateway/credentials/${id}`, data }),

  removeCredential: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/integration/gateway/credentials/${id}` }),

  pageAccessLogs: (params: OaIntegrationQuery): Promise<PageResult<OaApiAccessLogItem>> =>
    request<PageResult<OaApiAccessLogItem>>({ method: 'GET', url: '/oa/integration/gateway/access-logs', params }),

  accessLogStats: (params: OaIntegrationQuery): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/integration/gateway/access-logs/stats', params }),

  accessLogDetail: (id: number): Promise<OaApiAccessLogItem> =>
    request<OaApiAccessLogItem>({ method: 'GET', url: `/oa/integration/gateway/access-logs/${id}` }),

  recordAccessLog: (data: OaApiAccessLogSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/integration/gateway/access-logs', data }),

  removeAccessLog: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/integration/gateway/access-logs/${id}` }),

  overview: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/integration/gateway/overview' }),
};

/** Webhook 事件订阅（OA-DEV-087） */
export const oaWebhookService = {
  pageSubscriptions: (params: OaIntegrationQuery): Promise<PageResult<OaWebhookSubscriptionItem>> =>
    request<PageResult<OaWebhookSubscriptionItem>>({ method: 'GET', url: '/oa/integration/webhooks', params }),

  listEnabledSubscriptions: (): Promise<OaWebhookSubscriptionItem[]> =>
    request<OaWebhookSubscriptionItem[]>({ method: 'GET', url: '/oa/integration/webhooks/enabled' }),

  subscriptionDetail: (id: number): Promise<OaWebhookSubscriptionItem> =>
    request<OaWebhookSubscriptionItem>({ method: 'GET', url: `/oa/integration/webhooks/${id}` }),

  createSubscription: (data: OaWebhookSubscriptionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/integration/webhooks', data }),

  updateSubscription: (id: number, data: OaWebhookSubscriptionSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/integration/webhooks/${id}`, data }),

  removeSubscription: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/integration/webhooks/${id}` }),

  testDelivery: (id: number, params?: { eventId?: string; payload?: string }): Promise<number> =>
    request<number>({ method: 'POST', url: `/oa/integration/webhooks/${id}/test`, params }),

  pageDeliveries: (params: OaIntegrationQuery): Promise<PageResult<OaWebhookDeliveryItem>> =>
    request<PageResult<OaWebhookDeliveryItem>>({ method: 'GET', url: '/oa/integration/webhook-deliveries', params }),

  deliveryStats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/integration/webhook-deliveries/stats' }),

  deliveryDetail: (id: number): Promise<OaWebhookDeliveryItem> =>
    request<OaWebhookDeliveryItem>({ method: 'GET', url: `/oa/integration/webhook-deliveries/${id}` }),

  recordDelivery: (data: OaWebhookDeliverySaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/integration/webhook-deliveries', data }),

  retryDelivery: (id: number): Promise<number> =>
    request<number>({ method: 'POST', url: `/oa/integration/webhook-deliveries/${id}/retry` }),

  removeDelivery: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/integration/webhook-deliveries/${id}` }),
};

/** 消息总线与任务队列（OA-DEV-088） */
export const oaMessageTaskService = {
  page: (params: OaIntegrationQuery): Promise<PageResult<OaMessageTaskItem>> =>
    request<PageResult<OaMessageTaskItem>>({ method: 'GET', url: '/oa/integration/tasks', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/integration/tasks/stats' }),

  detail: (id: number): Promise<OaMessageTaskItem> =>
    request<OaMessageTaskItem>({ method: 'GET', url: `/oa/integration/tasks/${id}` }),

  create: (data: OaMessageTaskSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/integration/tasks', data }),

  update: (id: number, data: OaMessageTaskSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/integration/tasks/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/integration/tasks/${id}` }),

  execute: (id: number, success = true): Promise<OaMessageTaskItem> =>
    request<OaMessageTaskItem>({ method: 'POST', url: `/oa/integration/tasks/${id}/execute`, params: { success } }),

  retry: (id: number): Promise<OaMessageTaskItem> =>
    request<OaMessageTaskItem>({ method: 'POST', url: `/oa/integration/tasks/${id}/retry` }),
};

/** 集成连接器与主数据映射（OA-DEV-089 ~ OA-DEV-093） */
export const oaIntegrationConnectorService = {
  pageConnectors: (params: OaIntegrationQuery): Promise<PageResult<OaIntegrationConnectorItem>> =>
    request<PageResult<OaIntegrationConnectorItem>>({ method: 'GET', url: '/oa/integration/connectors', params }),

  listEnabledConnectors: (): Promise<OaIntegrationConnectorItem[]> =>
    request<OaIntegrationConnectorItem[]>({ method: 'GET', url: '/oa/integration/connectors/enabled' }),

  connectorDetail: (id: number): Promise<OaIntegrationConnectorItem> =>
    request<OaIntegrationConnectorItem>({ method: 'GET', url: `/oa/integration/connectors/${id}` }),

  createConnector: (data: OaIntegrationConnectorSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/integration/connectors', data }),

  updateConnector: (id: number, data: OaIntegrationConnectorSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/integration/connectors/${id}`, data }),

  removeConnector: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/integration/connectors/${id}` }),

  sync: (id: number, data: OaConnectorSyncLogSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/oa/integration/connectors/${id}/sync`, data }),

  pageSyncLogs: (params: OaIntegrationQuery): Promise<PageResult<OaConnectorSyncLogItem>> =>
    request<PageResult<OaConnectorSyncLogItem>>({ method: 'GET', url: '/oa/integration/sync-logs', params }),

  syncLogDetail: (id: number): Promise<OaConnectorSyncLogItem> =>
    request<OaConnectorSyncLogItem>({ method: 'GET', url: `/oa/integration/sync-logs/${id}` }),

  recordSyncLog: (data: OaConnectorSyncLogSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/integration/sync-logs', data }),

  removeSyncLog: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/integration/sync-logs/${id}` }),

  pageMappings: (params: OaIntegrationQuery): Promise<PageResult<OaMasterDataMappingItem>> =>
    request<PageResult<OaMasterDataMappingItem>>({ method: 'GET', url: '/oa/integration/mappings', params }),

  mappingDetail: (id: number): Promise<OaMasterDataMappingItem> =>
    request<OaMasterDataMappingItem>({ method: 'GET', url: `/oa/integration/mappings/${id}` }),

  createMapping: (data: OaMasterDataMappingSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/integration/mappings', data }),

  updateMapping: (id: number, data: OaMasterDataMappingSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/integration/mappings/${id}`, data }),

  removeMapping: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/integration/mappings/${id}` }),
};

/** EDI 状态通知（OA-DEV-093） */
export const oaEdiNoticeService = {
  page: (params: OaIntegrationQuery): Promise<PageResult<OaEdiNoticeItem>> =>
    request<PageResult<OaEdiNoticeItem>>({ method: 'GET', url: '/oa/integration/edi-notices', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/integration/edi-notices/stats' }),

  detail: (id: number): Promise<OaEdiNoticeItem> =>
    request<OaEdiNoticeItem>({ method: 'GET', url: `/oa/integration/edi-notices/${id}` }),

  create: (data: OaEdiNoticeSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/integration/edi-notices', data }),

  handle: (id: number, handleRemark?: string): Promise<OaEdiNoticeItem> =>
    request<OaEdiNoticeItem>({ method: 'POST', url: `/oa/integration/edi-notices/${id}/handle`, params: { handleRemark } }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/integration/edi-notices/${id}` }),
};

/** 接口监控台（OA-DEV-094） */
export const oaIntegrationMonitorService = {
  overview: (params?: Partial<OaIntegrationQuery>): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/integration/monitor/overview', params }),
};

/* ---------------- 历史数据迁移（OA-N10）---------------- */

/** 迁移对象目录与字段映射（OA-DEV-095/096） */
export const oaMigrationObjectService = {
  pageObjects: (params: OaMigrationQuery): Promise<PageResult<OaMigrationObjectItem>> =>
    request<PageResult<OaMigrationObjectItem>>({ method: 'GET', url: '/oa/migration/objects', params }),

  listAllObjects: (): Promise<OaMigrationObjectItem[]> =>
    request<OaMigrationObjectItem[]>({ method: 'GET', url: '/oa/migration/objects/all' }),

  overview: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/migration/objects/overview' }),

  objectDetail: (id: number): Promise<OaMigrationObjectItem> =>
    request<OaMigrationObjectItem>({ method: 'GET', url: `/oa/migration/objects/${id}` }),

  createObject: (data: OaMigrationObjectSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/migration/objects', data }),

  updateObject: (id: number, data: OaMigrationObjectSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/migration/objects/${id}`, data }),

  markObjectMigrated: (id: number, migratedCount?: number, status?: string): Promise<OaMigrationObjectItem> =>
    request<OaMigrationObjectItem>({
      method: 'POST',
      url: `/oa/migration/objects/${id}/mark-migrated`,
      params: { migratedCount, status },
    }),

  removeObject: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/migration/objects/${id}` }),

  pageMappings: (params: OaMigrationQuery): Promise<PageResult<OaMigrationFieldMappingItem>> =>
    request<PageResult<OaMigrationFieldMappingItem>>({
      method: 'GET',
      url: '/oa/migration/objects/field-mappings',
      params,
    }),

  mappingDetail: (id: number): Promise<OaMigrationFieldMappingItem> =>
    request<OaMigrationFieldMappingItem>({ method: 'GET', url: `/oa/migration/objects/field-mappings/${id}` }),

  createMapping: (data: OaMigrationFieldMappingSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/migration/objects/field-mappings', data }),

  updateMapping: (id: number, data: OaMigrationFieldMappingSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/migration/objects/field-mappings/${id}`, data }),

  removeMapping: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/migration/objects/field-mappings/${id}` }),
};

/** 迁移批次、清洗规则与清洗日志（OA-DEV-097/098/100/101） */
export const oaMigrationBatchService = {
  pageBatches: (params: OaMigrationQuery): Promise<PageResult<OaMigrationBatchItem>> =>
    request<PageResult<OaMigrationBatchItem>>({ method: 'GET', url: '/oa/migration/batches', params }),

  batchStats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/migration/batches/stats' }),

  batchDetail: (id: number): Promise<OaMigrationBatchItem> =>
    request<OaMigrationBatchItem>({ method: 'GET', url: `/oa/migration/batches/${id}` }),

  createBatch: (data: OaMigrationBatchSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/migration/batches', data }),

  updateBatch: (id: number, data: OaMigrationBatchSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/migration/batches/${id}`, data }),

  executeBatch: (id: number): Promise<OaMigrationBatchItem> =>
    request<OaMigrationBatchItem>({ method: 'POST', url: `/oa/migration/batches/${id}/execute` }),

  removeBatch: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/migration/batches/${id}` }),

  pageCleanRules: (params: OaMigrationQuery): Promise<PageResult<OaMigrationCleanRuleItem>> =>
    request<PageResult<OaMigrationCleanRuleItem>>({ method: 'GET', url: '/oa/migration/batches/clean-rules', params }),

  cleanRuleDetail: (id: number): Promise<OaMigrationCleanRuleItem> =>
    request<OaMigrationCleanRuleItem>({ method: 'GET', url: `/oa/migration/batches/clean-rules/${id}` }),

  createCleanRule: (data: OaMigrationCleanRuleSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/migration/batches/clean-rules', data }),

  updateCleanRule: (id: number, data: OaMigrationCleanRuleSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/migration/batches/clean-rules/${id}`, data }),

  removeCleanRule: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/migration/batches/clean-rules/${id}` }),

  pageCleanLogs: (params: OaMigrationQuery): Promise<PageResult<OaMigrationCleanLogItem>> =>
    request<PageResult<OaMigrationCleanLogItem>>({ method: 'GET', url: '/oa/migration/batches/clean-logs', params }),

  cleanLogDetail: (id: number): Promise<OaMigrationCleanLogItem> =>
    request<OaMigrationCleanLogItem>({ method: 'GET', url: `/oa/migration/batches/clean-logs/${id}` }),

  recordCleanLog: (data: OaMigrationCleanLogSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/migration/batches/clean-logs', data }),

  removeCleanLog: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/migration/batches/clean-logs/${id}` }),
};

/** 附件迁移（OA-DEV-099） */
export const oaMigrationAttachmentService = {
  page: (params: OaMigrationQuery): Promise<PageResult<OaMigrationAttachmentItem>> =>
    request<PageResult<OaMigrationAttachmentItem>>({ method: 'GET', url: '/oa/migration/attachments', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/migration/attachments/stats' }),

  detail: (id: number): Promise<OaMigrationAttachmentItem> =>
    request<OaMigrationAttachmentItem>({ method: 'GET', url: `/oa/migration/attachments/${id}` }),

  create: (data: OaMigrationAttachmentSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/migration/attachments', data }),

  update: (id: number, data: OaMigrationAttachmentSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/migration/attachments/${id}`, data }),

  advanceChunk: (id: number): Promise<OaMigrationAttachmentItem> =>
    request<OaMigrationAttachmentItem>({ method: 'POST', url: `/oa/migration/attachments/${id}/advance-chunk` }),

  verify: (id: number, targetHash?: string): Promise<OaMigrationAttachmentItem> =>
    request<OaMigrationAttachmentItem>({
      method: 'POST',
      url: `/oa/migration/attachments/${id}/verify`,
      params: { targetHash },
    }),

  retry: (id: number): Promise<OaMigrationAttachmentItem> =>
    request<OaMigrationAttachmentItem>({ method: 'POST', url: `/oa/migration/attachments/${id}/retry` }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/migration/attachments/${id}` }),
};

/** 历史流程只读档案（OA-DEV-102） */
export const oaMigrationHistoryFlowService = {
  page: (params: OaMigrationQuery): Promise<PageResult<OaMigrationHistoryFlowItem>> =>
    request<PageResult<OaMigrationHistoryFlowItem>>({ method: 'GET', url: '/oa/migration/history-flows', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/migration/history-flows/stats' }),

  bySourceNo: (sourceInstanceNo: string): Promise<OaMigrationHistoryFlowItem[]> =>
    request<OaMigrationHistoryFlowItem[]>({
      method: 'GET',
      url: '/oa/migration/history-flows/by-source-no',
      params: { sourceInstanceNo },
    }),

  detail: (id: number): Promise<OaMigrationHistoryFlowItem> =>
    request<OaMigrationHistoryFlowItem>({ method: 'GET', url: `/oa/migration/history-flows/${id}` }),

  create: (data: OaMigrationHistoryFlowSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/migration/history-flows', data }),

  update: (id: number, data: OaMigrationHistoryFlowSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/migration/history-flows/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/migration/history-flows/${id}` }),
};

/** 迁移对账与双跑对照（OA-DEV-103/104） */
export const oaMigrationReconcileService = {
  page: (params: OaMigrationQuery): Promise<PageResult<OaMigrationReconcileItem>> =>
    request<PageResult<OaMigrationReconcileItem>>({ method: 'GET', url: '/oa/migration/reconciles', params }),

  report: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/migration/reconciles/report' }),

  detail: (id: number): Promise<OaMigrationReconcileItem> =>
    request<OaMigrationReconcileItem>({ method: 'GET', url: `/oa/migration/reconciles/${id}` }),

  create: (data: OaMigrationReconcileSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/migration/reconciles', data }),

  update: (id: number, data: OaMigrationReconcileSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/migration/reconciles/${id}`, data }),

  confirm: (id: number, conclusion?: string): Promise<OaMigrationReconcileItem> =>
    request<OaMigrationReconcileItem>({
      method: 'POST',
      url: `/oa/migration/reconciles/${id}/confirm`,
      params: { conclusion },
    }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/migration/reconciles/${id}` }),

  pageDualRuns: (params: OaMigrationQuery): Promise<PageResult<OaMigrationDualRunItem>> =>
    request<PageResult<OaMigrationDualRunItem>>({ method: 'GET', url: '/oa/migration/reconciles/dual-runs', params }),

  dualRunSummary: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/migration/reconciles/dual-runs/summary' }),

  dualRunDetail: (id: number): Promise<OaMigrationDualRunItem> =>
    request<OaMigrationDualRunItem>({ method: 'GET', url: `/oa/migration/reconciles/dual-runs/${id}` }),

  createDualRun: (data: OaMigrationDualRunSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/migration/reconciles/dual-runs', data }),

  updateDualRun: (id: number, data: OaMigrationDualRunSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/migration/reconciles/dual-runs/${id}`, data }),

  compareDualRun: (id: number): Promise<OaMigrationDualRunItem> =>
    request<OaMigrationDualRunItem>({ method: 'POST', url: `/oa/migration/reconciles/dual-runs/${id}/compare` }),

  removeDualRun: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/migration/reconciles/dual-runs/${id}` }),
};

/* ---------------- 安全性能测试与用户验收（OA-N11）---------------- */

/** 功能与回归测试用例（OA-DEV-105） */
export const oaTestCaseService = {
  page: (params: OaTestQuery): Promise<PageResult<OaTestCaseItem>> =>
    request<PageResult<OaTestCaseItem>>({ method: 'GET', url: '/oa/test/cases', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/test/cases/stats' }),

  detail: (id: number): Promise<OaTestCaseItem> =>
    request<OaTestCaseItem>({ method: 'GET', url: `/oa/test/cases/${id}` }),

  create: (data: OaTestCaseSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/test/cases', data }),

  update: (id: number, data: OaTestCaseSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/test/cases/${id}`, data }),

  execute: (id: number, execStatus?: string, testResult?: string, tester?: string): Promise<OaTestCaseItem> =>
    request<OaTestCaseItem>({
      method: 'POST',
      url: `/oa/test/cases/${id}/execute`,
      params: { execStatus, testResult, tester },
    }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/test/cases/${id}` }),
};

/** 角色与数据隔离测试（OA-DEV-106） */
export const oaPermissionTestService = {
  page: (params: OaTestQuery): Promise<PageResult<OaPermissionTestItem>> =>
    request<PageResult<OaPermissionTestItem>>({ method: 'GET', url: '/oa/test/permission-tests', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/test/permission-tests/stats' }),

  detail: (id: number): Promise<OaPermissionTestItem> =>
    request<OaPermissionTestItem>({ method: 'GET', url: `/oa/test/permission-tests/${id}` }),

  create: (data: OaPermissionTestSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/test/permission-tests', data }),

  update: (id: number, data: OaPermissionTestSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/test/permission-tests/${id}`, data }),

  evaluate: (id: number, result?: string, isolationPass?: boolean): Promise<OaPermissionTestItem> =>
    request<OaPermissionTestItem>({
      method: 'POST',
      url: `/oa/test/permission-tests/${id}/evaluate`,
      params: { result, isolationPass },
    }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/test/permission-tests/${id}` }),
};

/** 安全测试（OA-DEV-107） */
export const oaSecurityTestService = {
  page: (params: OaTestQuery): Promise<PageResult<OaSecurityTestItem>> =>
    request<PageResult<OaSecurityTestItem>>({ method: 'GET', url: '/oa/test/security-tests', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/test/security-tests/stats' }),

  detail: (id: number): Promise<OaSecurityTestItem> =>
    request<OaSecurityTestItem>({ method: 'GET', url: `/oa/test/security-tests/${id}` }),

  create: (data: OaSecurityTestSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/test/security-tests', data }),

  update: (id: number, data: OaSecurityTestSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/test/security-tests/${id}`, data }),

  fix: (id: number, fixStatus?: string, verifyResult?: string): Promise<OaSecurityTestItem> =>
    request<OaSecurityTestItem>({
      method: 'POST',
      url: `/oa/test/security-tests/${id}/fix`,
      params: { fixStatus, verifyResult },
    }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/test/security-tests/${id}` }),
};

/** 性能与容量测试（OA-DEV-108） */
export const oaPerfTestService = {
  page: (params: OaTestQuery): Promise<PageResult<OaPerfTestItem>> =>
    request<PageResult<OaPerfTestItem>>({ method: 'GET', url: '/oa/test/perf-tests', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/test/perf-tests/stats' }),

  detail: (id: number): Promise<OaPerfTestItem> =>
    request<OaPerfTestItem>({ method: 'GET', url: `/oa/test/perf-tests/${id}` }),

  create: (data: OaPerfTestSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/test/perf-tests', data }),

  update: (id: number, data: OaPerfTestSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/test/perf-tests/${id}`, data }),

  conclude: (id: number): Promise<OaPerfTestItem> =>
    request<OaPerfTestItem>({ method: 'POST', url: `/oa/test/perf-tests/${id}/conclude` }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/test/perf-tests/${id}` }),
};

/** 兼容性测试（OA-DEV-109） */
export const oaCompatTestService = {
  page: (params: OaTestQuery): Promise<PageResult<OaCompatTestItem>> =>
    request<PageResult<OaCompatTestItem>>({ method: 'GET', url: '/oa/test/compat-tests', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/test/compat-tests/stats' }),

  detail: (id: number): Promise<OaCompatTestItem> =>
    request<OaCompatTestItem>({ method: 'GET', url: `/oa/test/compat-tests/${id}` }),

  create: (data: OaCompatTestSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/test/compat-tests', data }),

  update: (id: number, data: OaCompatTestSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/test/compat-tests/${id}`, data }),

  evaluate: (id: number, result?: string): Promise<OaCompatTestItem> =>
    request<OaCompatTestItem>({
      method: 'POST',
      url: `/oa/test/compat-tests/${id}/evaluate`,
      params: { result },
    }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/test/compat-tests/${id}` }),
};

/** 备份恢复演练（OA-DEV-110） */
export const oaBackupDrillService = {
  page: (params: OaTestQuery): Promise<PageResult<OaBackupDrillItem>> =>
    request<PageResult<OaBackupDrillItem>>({ method: 'GET', url: '/oa/test/backup-drills', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/test/backup-drills/stats' }),

  detail: (id: number): Promise<OaBackupDrillItem> =>
    request<OaBackupDrillItem>({ method: 'GET', url: `/oa/test/backup-drills/${id}` }),

  create: (data: OaBackupDrillSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/test/backup-drills', data }),

  update: (id: number, data: OaBackupDrillSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/test/backup-drills/${id}`, data }),

  restore: (id: number): Promise<OaBackupDrillItem> =>
    request<OaBackupDrillItem>({ method: 'POST', url: `/oa/test/backup-drills/${id}/restore` }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/test/backup-drills/${id}` }),
};

/** 用户验收（UAT）记录（OA-DEV-111） */
export const oaUatRecordService = {
  page: (params: OaTestQuery): Promise<PageResult<OaUatRecordItem>> =>
    request<PageResult<OaUatRecordItem>>({ method: 'GET', url: '/oa/test/uat-records', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/test/uat-records/stats' }),

  detail: (id: number): Promise<OaUatRecordItem> =>
    request<OaUatRecordItem>({ method: 'GET', url: `/oa/test/uat-records/${id}` }),

  create: (data: OaUatRecordSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/test/uat-records', data }),

  update: (id: number, data: OaUatRecordSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/test/uat-records/${id}`, data }),

  conclude: (id: number, uatStatus?: string, conclusion?: string): Promise<OaUatRecordItem> =>
    request<OaUatRecordItem>({
      method: 'POST',
      url: `/oa/test/uat-records/${id}/conclude`,
      params: { uatStatus, conclusion },
    }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/test/uat-records/${id}` }),
};

/** 培训交付材料（OA-DEV-112） */
export const oaTrainingMaterialService = {
  page: (params: OaTestQuery): Promise<PageResult<OaTrainingMaterialItem>> =>
    request<PageResult<OaTrainingMaterialItem>>({ method: 'GET', url: '/oa/test/training-materials', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/test/training-materials/stats' }),

  detail: (id: number): Promise<OaTrainingMaterialItem> =>
    request<OaTrainingMaterialItem>({ method: 'GET', url: `/oa/test/training-materials/${id}` }),

  create: (data: OaTrainingMaterialSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/test/training-materials', data }),

  update: (id: number, data: OaTrainingMaterialSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/test/training-materials/${id}`, data }),

  sign: (id: number): Promise<OaTrainingMaterialItem> =>
    request<OaTrainingMaterialItem>({ method: 'POST', url: `/oa/test/training-materials/${id}/sign` }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/test/training-materials/${id}` }),
};

/** 上线切换与回退预案（OA-DEV-113） */
export const oaCutoverPlanService = {
  page: (params: OaTestQuery): Promise<PageResult<OaCutoverPlanItem>> =>
    request<PageResult<OaCutoverPlanItem>>({ method: 'GET', url: '/oa/test/cutover-plans', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/test/cutover-plans/stats' }),

  detail: (id: number): Promise<OaCutoverPlanItem> =>
    request<OaCutoverPlanItem>({ method: 'GET', url: `/oa/test/cutover-plans/${id}` }),

  create: (data: OaCutoverPlanSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/test/cutover-plans', data }),

  update: (id: number, data: OaCutoverPlanSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/test/cutover-plans/${id}`, data }),

  rehearse: (id: number, rehearsalResult?: string): Promise<OaCutoverPlanItem> =>
    request<OaCutoverPlanItem>({
      method: 'POST',
      url: `/oa/test/cutover-plans/${id}/rehearse`,
      params: { rehearsalResult },
    }),

  approve: (id: number, approver?: string): Promise<OaCutoverPlanItem> =>
    request<OaCutoverPlanItem>({
      method: 'POST',
      url: `/oa/test/cutover-plans/${id}/approve`,
      params: { approver },
    }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/test/cutover-plans/${id}` }),
};

/** 冻结旧OA关键写入（OA-DEV-114） */
export const oaGoliveFreezeService = {
  page: (params: OaGoliveQuery): Promise<PageResult<OaGoliveFreezeItem>> =>
    request<PageResult<OaGoliveFreezeItem>>({ method: 'GET', url: '/oa/golive/freezes', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/golive/freezes/stats' }),

  detail: (id: number): Promise<OaGoliveFreezeItem> =>
    request<OaGoliveFreezeItem>({ method: 'GET', url: `/oa/golive/freezes/${id}` }),

  create: (data: OaGoliveFreezeSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/golive/freezes', data }),

  update: (id: number, data: OaGoliveFreezeSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/golive/freezes/${id}`, data }),

  activate: (id: number): Promise<OaGoliveFreezeItem> =>
    request<OaGoliveFreezeItem>({ method: 'POST', url: `/oa/golive/freezes/${id}/activate` }),

  release: (id: number): Promise<OaGoliveFreezeItem> =>
    request<OaGoliveFreezeItem>({ method: 'POST', url: `/oa/golive/freezes/${id}/release` }),

  notice: (id: number): Promise<OaGoliveFreezeItem> =>
    request<OaGoliveFreezeItem>({ method: 'POST', url: `/oa/golive/freezes/${id}/notice` }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/golive/freezes/${id}` }),
};

/** 执行最终全量及增量迁移（OA-DEV-115） */
export const oaFinalMigrationService = {
  page: (params: OaGoliveQuery): Promise<PageResult<OaFinalMigrationItem>> =>
    request<PageResult<OaFinalMigrationItem>>({ method: 'GET', url: '/oa/golive/final-migrations', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/golive/final-migrations/stats' }),

  detail: (id: number): Promise<OaFinalMigrationItem> =>
    request<OaFinalMigrationItem>({ method: 'GET', url: `/oa/golive/final-migrations/${id}` }),

  create: (data: OaFinalMigrationSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/golive/final-migrations', data }),

  update: (id: number, data: OaFinalMigrationSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/golive/final-migrations/${id}`, data }),

  execute: (id: number): Promise<OaFinalMigrationItem> =>
    request<OaFinalMigrationItem>({ method: 'POST', url: `/oa/golive/final-migrations/${id}/execute` }),

  verify: (id: number, verifyPass?: number, verifyStatus?: string): Promise<OaFinalMigrationItem> =>
    request<OaFinalMigrationItem>({
      method: 'POST',
      url: `/oa/golive/final-migrations/${id}/verify`,
      params: { verifyPass, verifyStatus },
    }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/golive/final-migrations/${id}` }),
};

/** 切换门户入口与身份（OA-DEV-116） */
export const oaEntrySwitchService = {
  page: (params: OaGoliveQuery): Promise<PageResult<OaEntrySwitchItem>> =>
    request<PageResult<OaEntrySwitchItem>>({ method: 'GET', url: '/oa/golive/entry-switches', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/golive/entry-switches/stats' }),

  detail: (id: number): Promise<OaEntrySwitchItem> =>
    request<OaEntrySwitchItem>({ method: 'GET', url: `/oa/golive/entry-switches/${id}` }),

  create: (data: OaEntrySwitchSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/golive/entry-switches', data }),

  update: (id: number, data: OaEntrySwitchSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/golive/entry-switches/${id}`, data }),

  cutover: (id: number): Promise<OaEntrySwitchItem> =>
    request<OaEntrySwitchItem>({ method: 'POST', url: `/oa/golive/entry-switches/${id}/cutover` }),

  rollback: (id: number): Promise<OaEntrySwitchItem> =>
    request<OaEntrySwitchItem>({ method: 'POST', url: `/oa/golive/entry-switches/${id}/rollback` }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/golive/entry-switches/${id}` }),
};

/** 上线值守与问题响应（OA-DEV-117） */
export const oaGoliveWatchService = {
  page: (params: OaGoliveQuery): Promise<PageResult<OaGoliveWatchItem>> =>
    request<PageResult<OaGoliveWatchItem>>({ method: 'GET', url: '/oa/golive/watches', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/golive/watches/stats' }),

  detail: (id: number): Promise<OaGoliveWatchItem> =>
    request<OaGoliveWatchItem>({ method: 'GET', url: `/oa/golive/watches/${id}` }),

  create: (data: OaGoliveWatchSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/golive/watches', data }),

  update: (id: number, data: OaGoliveWatchSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/golive/watches/${id}`, data }),

  close: (id: number, reportSummary?: string): Promise<OaGoliveWatchItem> =>
    request<OaGoliveWatchItem>({
      method: 'POST',
      url: `/oa/golive/watches/${id}/close`,
      params: { reportSummary },
    }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/golive/watches/${id}` }),
};

/** 回退决策和演练（OA-DEV-118） */
export const oaRollbackRecordService = {
  page: (params: OaGoliveQuery): Promise<PageResult<OaRollbackRecordItem>> =>
    request<PageResult<OaRollbackRecordItem>>({ method: 'GET', url: '/oa/golive/rollback-records', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/golive/rollback-records/stats' }),

  detail: (id: number): Promise<OaRollbackRecordItem> =>
    request<OaRollbackRecordItem>({ method: 'GET', url: `/oa/golive/rollback-records/${id}` }),

  create: (data: OaRollbackRecordSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/golive/rollback-records', data }),

  update: (id: number, data: OaRollbackRecordSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/golive/rollback-records/${id}`, data }),

  decide: (id: number, decisionResult?: string): Promise<OaRollbackRecordItem> =>
    request<OaRollbackRecordItem>({
      method: 'POST',
      url: `/oa/golive/rollback-records/${id}/decide`,
      params: { decisionResult },
    }),

  drill: (id: number, drillResult?: string): Promise<OaRollbackRecordItem> =>
    request<OaRollbackRecordItem>({
      method: 'POST',
      url: `/oa/golive/rollback-records/${id}/drill`,
      params: { drillResult },
    }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/golive/rollback-records/${id}` }),
};

/** 现有OA只读封存（OA-DEV-119） */
export const oaLegacyArchiveService = {
  page: (params: OaGoliveQuery): Promise<PageResult<OaLegacyArchiveItem>> =>
    request<PageResult<OaLegacyArchiveItem>>({ method: 'GET', url: '/oa/golive/legacy-archives', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/golive/legacy-archives/stats' }),

  detail: (id: number): Promise<OaLegacyArchiveItem> =>
    request<OaLegacyArchiveItem>({ method: 'GET', url: `/oa/golive/legacy-archives/${id}` }),

  create: (data: OaLegacyArchiveSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/golive/legacy-archives', data }),

  update: (id: number, data: OaLegacyArchiveSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/golive/legacy-archives/${id}`, data }),

  archive: (id: number): Promise<OaLegacyArchiveItem> =>
    request<OaLegacyArchiveItem>({ method: 'POST', url: `/oa/golive/legacy-archives/${id}/archive` }),

  verify: (id: number): Promise<OaLegacyArchiveItem> =>
    request<OaLegacyArchiveItem>({ method: 'POST', url: `/oa/golive/legacy-archives/${id}/verify` }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/golive/legacy-archives/${id}` }),
};

/** 完成授权和资源回收（OA-DEV-120） */
export const oaDecommissionRecordService = {
  page: (params: OaGoliveQuery): Promise<PageResult<OaDecommissionRecordItem>> =>
    request<PageResult<OaDecommissionRecordItem>>({ method: 'GET', url: '/oa/golive/decommissions', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/golive/decommissions/stats' }),

  detail: (id: number): Promise<OaDecommissionRecordItem> =>
    request<OaDecommissionRecordItem>({ method: 'GET', url: `/oa/golive/decommissions/${id}` }),

  create: (data: OaDecommissionRecordSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/golive/decommissions', data }),

  update: (id: number, data: OaDecommissionRecordSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/golive/decommissions/${id}`, data }),

  approve: (id: number, approver?: string): Promise<OaDecommissionRecordItem> =>
    request<OaDecommissionRecordItem>({
      method: 'POST',
      url: `/oa/golive/decommissions/${id}/approve`,
      params: { approver },
    }),

  execute: (id: number): Promise<OaDecommissionRecordItem> =>
    request<OaDecommissionRecordItem>({ method: 'POST', url: `/oa/golive/decommissions/${id}/execute` }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/golive/decommissions/${id}` }),
};

/** 完成知识转移和质保（OA-DEV-121） */
export const oaOpsHandoverService = {
  page: (params: OaGoliveQuery): Promise<PageResult<OaOpsHandoverItem>> =>
    request<PageResult<OaOpsHandoverItem>>({ method: 'GET', url: '/oa/golive/handovers', params }),

  stats: (): Promise<Record<string, unknown>> =>
    request<Record<string, unknown>>({ method: 'GET', url: '/oa/golive/handovers/stats' }),

  detail: (id: number): Promise<OaOpsHandoverItem> =>
    request<OaOpsHandoverItem>({ method: 'GET', url: `/oa/golive/handovers/${id}` }),

  create: (data: OaOpsHandoverSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/oa/golive/handovers', data }),

  update: (id: number, data: OaOpsHandoverSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/oa/golive/handovers/${id}`, data }),

  deliver: (id: number, receiver?: string): Promise<OaOpsHandoverItem> =>
    request<OaOpsHandoverItem>({
      method: 'POST',
      url: `/oa/golive/handovers/${id}/deliver`,
      params: { receiver },
    }),

  confirm: (id: number): Promise<OaOpsHandoverItem> =>
    request<OaOpsHandoverItem>({ method: 'POST', url: `/oa/golive/handovers/${id}/confirm` }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/oa/golive/handovers/${id}` }),
};
