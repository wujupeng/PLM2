import type { PageQuery } from './common';

/* ---------------- 通用枚举 ---------------- */

/** 图文档类型 */
export type DocType =
  | '2d_drawing'
  | '3d_model'
  | 'tech_spec'
  | 'inspection_spec'
  | 'process_doc'
  | 'customer_doc';

/** 图文档状态 */
export type DocStatus = 'draft' | 'in_review' | 'approved' | 'released' | 'obsolete';

/** 签审节点 */
export type DocReviewNode = 'prepare' | 'proofread' | 'review' | 'approve';

/** 签审判定结果 */
export type DocReviewDecision = 'pending' | 'approved' | 'rejected';

/** 关联对象类型 */
export type DocRelationType = 'product' | 'material' | 'bom';

/** 分发接收方类型 */
export type DocDistributionRecipient = 'org' | 'user' | 'supplier' | 'customer';

/** 图文档类型选项 */
export const DOC_TYPE_OPTIONS: { value: DocType; label: string }[] = [
  { value: '2d_drawing', label: '二维图纸' },
  { value: '3d_model', label: '三维模型' },
  { value: 'tech_spec', label: '技术规范' },
  { value: 'inspection_spec', label: '检验规范' },
  { value: 'process_doc', label: '工艺文件' },
  { value: 'customer_doc', label: '客户文件' },
];

/** 图文档状态选项 */
export const DOC_STATUS_OPTIONS: { value: DocStatus; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'in_review', label: '审批中' },
  { value: 'approved', label: '已批准' },
  { value: 'released', label: '已发布' },
  { value: 'obsolete', label: '已作废' },
];

/** 签审节点选项 */
export const DOC_REVIEW_NODE_OPTIONS: { value: DocReviewNode; label: string }[] = [
  { value: 'prepare', label: '编制' },
  { value: 'proofread', label: '校对' },
  { value: 'review', label: '审核' },
  { value: 'approve', label: '批准' },
];

/** 签审判定结果选项 */
export const DOC_REVIEW_DECISION_OPTIONS: { value: DocReviewDecision; label: string }[] = [
  { value: 'pending', label: '待处理' },
  { value: 'approved', label: '通过' },
  { value: 'rejected', label: '驳回' },
];

/** 关联对象类型选项 */
export const DOC_RELATION_TYPE_OPTIONS: { value: DocRelationType; label: string }[] = [
  { value: 'product', label: '产品型号' },
  { value: 'material', label: '物料' },
  { value: 'bom', label: 'BOM' },
];

/** 分发接收方类型选项 */
export const DOC_DISTRIBUTION_RECIPIENT_OPTIONS: { value: DocDistributionRecipient; label: string }[] = [
  { value: 'org', label: '组织' },
  { value: 'user', label: '用户' },
  { value: 'supplier', label: '供应商' },
  { value: 'customer', label: '客户' },
];

/** 图文档类型文案映射 */
export const DOC_TYPE_TEXT: Record<string, string> = {
  '2d_drawing': '二维图纸',
  '3d_model': '三维模型',
  tech_spec: '技术规范',
  inspection_spec: '检验规范',
  process_doc: '工艺文件',
  customer_doc: '客户文件',
};

/** 图文档状态文案映射 */
export const DOC_STATUS_TEXT: Record<string, string> = {
  draft: '草稿',
  in_review: '审批中',
  approved: '已批准',
  released: '已发布',
  obsolete: '已作废',
};

/** 签审节点文案映射 */
export const DOC_REVIEW_NODE_TEXT: Record<string, string> = {
  prepare: '编制',
  proofread: '校对',
  review: '审核',
  approve: '批准',
};

/** 签审判定结果文案映射 */
export const DOC_REVIEW_DECISION_TEXT: Record<string, string> = {
  pending: '待处理',
  approved: '通过',
  rejected: '驳回',
};

/** 关联对象类型文案映射 */
export const DOC_RELATION_TYPE_TEXT: Record<string, string> = {
  product: '产品型号',
  material: '物料',
  bom: 'BOM',
};

/** 分发接收方类型文案映射 */
export const DOC_DISTRIBUTION_RECIPIENT_TEXT: Record<string, string> = {
  org: '组织',
  user: '用户',
  supplier: '供应商',
  customer: '客户',
};

/* ---------------- 文档分类 ---------------- */

/** 文档分类项（reviewRequired/status：1 是/启用 0 否/停用） */
export interface DocCategoryItem {
  id: number;
  categoryCode: string;
  categoryName: string;
  parentId?: number | null;
  docType?: string;
  fileTypes?: string;
  requiredMetadata?: string;
  reviewRequired?: number;
  reviewNodes?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 文档分类分页查询入参 */
export interface DocCategoryQuery extends PageQuery {
  categoryCode?: string;
  docType?: string;
  status?: number;
}

/** 文档分类新增/编辑入参 */
export interface DocCategorySaveParams {
  categoryCode: string;
  categoryName: string;
  parentId?: number | null;
  docType?: string;
  fileTypes?: string;
  requiredMetadata?: string;
  reviewRequired?: number;
  reviewNodes?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
}

/* ---------------- 图文档 ---------------- */

/** 图文档列表项 */
export interface DocDocumentItem {
  id: number;
  docNo: string;
  docName: string;
  categoryId?: number;
  categoryCode?: string;
  docType?: string;
  productCode?: string;
  materialCode?: string;
  bomHeaderId?: number;
  bomCode?: string;
  fileName?: string;
  currentVersionNo?: string;
  status?: string;
  distributionControlled?: number;
  ownerId?: number;
  ownerName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 图文档分页查询入参 */
export interface DocDocumentQuery extends PageQuery {
  categoryCode?: string;
  docType?: string;
  productCode?: string;
  materialCode?: string;
  status?: string;
}

/** 图文档新增/编辑入参 */
export interface DocDocumentSaveParams {
  docNo: string;
  docName: string;
  categoryId?: number;
  categoryCode?: string;
  docType?: string;
  productCode?: string;
  materialCode?: string;
  bomHeaderId?: number;
  bomCode?: string;
  fileName?: string;
  ownerName?: string;
  distributionControlled?: number;
  description?: string;
  remark?: string;
}

/** 图文档版本项 */
export interface DocVersionItem {
  id: number;
  documentId?: number;
  docNo?: string;
  versionNo?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  fileType?: string;
  fileHash?: string;
  metadataJson?: string;
  changeNote?: string;
  status?: string;
  releasedAt?: string;
  releasedBy?: number;
  createdAt?: string;
}

/** 图文档版本新增入参 */
export interface DocVersionSaveParams {
  versionNo?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  fileType?: string;
  fileHash?: string;
  metadataJson?: string;
  changeNote?: string;
  activate?: boolean;
}

/** 图文档评审任务项 */
export interface DocReviewTaskItem {
  id: number;
  documentId?: number;
  docNo?: string;
  versionNo?: string;
  nodeCode?: string;
  nodeName?: string;
  seqNo?: number;
  assigneeId?: number;
  assigneeName?: string;
  decision?: string;
  comment?: string;
  decidedAt?: string;
}

/** 评审节点分配人 */
export interface DocReviewAssignee {
  nodeCode: string;
  nodeName?: string;
  assigneeId?: number;
  assigneeName?: string;
}

/** 提交签审入参 */
export interface DocSubmitParams {
  versionNo?: string;
  reviewNodes?: string;
  assignees: DocReviewAssignee[];
}

/** 评审判定入参 */
export interface DocReviewDecideParams {
  decision: string;
  comment?: string;
}

/** 图文档审批留痕项 */
export interface DocApprovalLogItem {
  id: number;
  documentId?: number;
  docNo?: string;
  versionNo?: string;
  action?: string;
  operatorId?: number;
  operatorName?: string;
  comment?: string;
  createdAt?: string;
}

/** 图文档关联关系项 */
export interface DocRelationItem {
  id: number;
  documentId?: number;
  docNo?: string;
  relationType?: string;
  targetId?: number;
  targetCode?: string;
  targetName?: string;
  relationRole?: string;
  remark?: string;
}

/** 图文档关联关系新增入参 */
export interface DocRelationSaveParams {
  relationType: string;
  targetId?: number;
  targetCode?: string;
  targetName?: string;
  relationRole?: string;
  remark?: string;
}

/** 受控分发记录项 */
export interface DocDistributionItem {
  id: number;
  documentId?: number;
  docNo?: string;
  versionNo?: string;
  recipientType?: string;
  recipientCode?: string;
  recipientName?: string;
  distributedAt?: string;
  status?: string;
  remark?: string;
}

/** 受控分发新增入参 */
export interface DocDistributionSaveParams {
  versionNo: string;
  recipientType: string;
  recipientCode?: string;
  recipientName?: string;
  remark?: string;
}

/** 版本比较差异字段 */
export interface DocVersionFieldDiff {
  field?: string;
  fieldLabel?: string;
  leftValue?: string;
  rightValue?: string;
  changed?: boolean;
}

/** 版本比较结果 */
export interface DocVersionCompareResponse {
  leftVersionNo?: string;
  rightVersionNo?: string;
  diffs: DocVersionFieldDiff[];
}

/** 图文档详情组合 */
export interface DocDocumentDetail {
  document: DocDocumentItem;
  category?: DocCategoryItem;
  currentVersion?: DocVersionItem;
  relations: DocRelationItem[];
  reviewTasks: DocReviewTaskItem[];
  approvalLogs: DocApprovalLogItem[];
}
