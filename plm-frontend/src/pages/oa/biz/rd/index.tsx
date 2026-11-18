import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import {
  oaBizChangeNoticeService,
  oaBizEcrService,
  oaBizFiveMChangeService,
  oaBizMoldTrialService,
  oaBizSampleIssueService,
} from '@/services/oaService';
import UserSelect from '@/pages/oa/UserSelect';
import { useAuthStore } from '@/stores/authStore';
import BizFlowTab, {
  DATE_FORMAT,
  bizFlowStatusTag,
  bizStatusTag,
  enumLabel,
  formatDateTime,
  plain,
  type BizSubmitValue,
} from '@/pages/oa/biz/BizFlowTab';
import {
  OA_BIZ_CHANGE_NOTICE_TYPE_LABEL,
  OA_BIZ_CHANGE_NOTICE_TYPE_OPTIONS,
  OA_BIZ_ECR_CHANGE_TYPE_LABEL,
  OA_BIZ_ECR_CHANGE_TYPE_OPTIONS,
  OA_BIZ_FIVE_M_CATEGORY_LABEL,
  OA_BIZ_FIVE_M_CATEGORY_OPTIONS,
  OA_BIZ_ISSUE_LEVEL_LABEL,
  OA_BIZ_ISSUE_LEVEL_OPTIONS,
  OA_BIZ_MOLD_TRIAL_TYPE_LABEL,
  OA_BIZ_MOLD_TRIAL_TYPE_OPTIONS,
  OA_BIZ_RECEIPT_STATUS_LABEL,
  OA_BIZ_RISK_LEVEL_LABEL,
  OA_BIZ_RISK_LEVEL_OPTIONS,
  OA_BIZ_SAMPLE_ISSUE_STATUS_LABEL,
  OA_YES_NO_OPTIONS,
  type OaBizChangeNoticeSaveParams,
  type OaBizEcrRiskReviewSaveParams,
  type OaBizFiveMChangeSaveParams,
  type OaBizFlowItem,
  type OaBizMoldTrialSaveParams,
  type OaBizSampleIssueSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const RD_LIST = 'oa:biz:rd:list';
const RD_APPLY = 'oa:biz:rd:apply';
const RD_MANAGE = 'oa:biz:rd:manage';
const NOTICE_RECEIPT = 'oa:biz:notice:receipt';

const sampleStatusTag = bizStatusTag(OA_BIZ_SAMPLE_ISSUE_STATUS_LABEL);
const receiptStatusTag = bizStatusTag(OA_BIZ_RECEIPT_STATUS_LABEL);

const yesNoText = (v: unknown): string =>
  v === null || v === undefined ? '-' : Number(v) === 1 ? '是' : '否';

/* ---------------- 1. 5M 变更追踪（OA-DEV-072） ---------------- */

interface FiveMFormValues extends BizSubmitValue {
  changeCategory?: string;
  changeTitle?: string;
  productCode?: string;
  productName?: string;
  partCode?: string;
  changeDesc?: string;
  riskAnalysis?: string;
  riskLevel?: string;
  verificationPlan?: string;
  verificationResult?: string;
  effectiveDate?: Dayjs;
  closeCondition?: string;
  remark?: string;
}

function FiveMChangeTab() {
  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '变更单号', dataIndex: 'changeNo', width: 150, fixed: 'left', render: plain },
    { title: '变更类别', dataIndex: 'changeCategory', width: 130, render: (v) => enumLabel(OA_BIZ_FIVE_M_CATEGORY_LABEL, v) },
    { title: '变更标题', dataIndex: 'changeTitle', width: 180, render: plain },
    { title: '产品编码', dataIndex: 'productCode', width: 130, render: plain },
    { title: '产品名称', dataIndex: 'productName', width: 160, render: plain },
    { title: '零件编码', dataIndex: 'partCode', width: 130, render: plain },
    { title: '风险等级', dataIndex: 'riskLevel', width: 100, render: (v) => enumLabel(OA_BIZ_RISK_LEVEL_LABEL, v) },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaBizFiveMChangeSaveParams, FiveMFormValues>
      title="5M变更追踪"
      service={oaBizFiveMChangeService}
      columns={columns}
      listPerm={RD_LIST}
      applyPerm={RD_APPLY}
      managePerm={RD_MANAGE}
      initialValues={{ changeCategory: 'MAN', riskLevel: 'LOW' }}
      detailFields={[
        { label: '变更单号', key: 'changeNo' },
        { label: '变更类别', key: 'changeCategory', render: (v) => enumLabel(OA_BIZ_FIVE_M_CATEGORY_LABEL, v) },
        { label: '变更标题', key: 'changeTitle' },
        { label: '产品编码', key: 'productCode' },
        { label: '产品名称', key: 'productName' },
        { label: '零件编码', key: 'partCode' },
        { label: '零件名称', key: 'partName' },
        { label: '变更描述', key: 'changeDesc' },
        { label: '风险分析', key: 'riskAnalysis' },
        { label: '风险等级', key: 'riskLevel', render: (v) => enumLabel(OA_BIZ_RISK_LEVEL_LABEL, v) },
        { label: '验证方案', key: 'verificationPlan' },
        { label: '验证结果', key: 'verificationResult' },
        { label: '生效日期', key: 'effectiveDate' },
        { label: '关闭条件', key: 'closeCondition' },
        { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={() => (
        <>
          <Form.Item
            name="changeCategory"
            label="变更类别"
            rules={[{ required: true, message: '请选择变更类别' }]}
          >
            <Select placeholder="请选择" options={[...OA_BIZ_FIVE_M_CATEGORY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="changeTitle" label="变更标题" rules={[{ required: true, message: '请输入变更标题' }]}>
            <Input placeholder="请输入变更标题" />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="productName" label="产品名称">
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          <Form.Item name="partCode" label="零件编码">
            <Input placeholder="请输入零件编码" />
          </Form.Item>
          <Form.Item name="changeDesc" label="变更描述" rules={[{ required: true, message: '请输入变更描述' }]}>
            <Input.TextArea rows={2} placeholder="请描述变更内容" />
          </Form.Item>
          <Form.Item name="riskAnalysis" label="风险分析">
            <Input.TextArea rows={2} placeholder="请输入风险分析" />
          </Form.Item>
          <Form.Item name="riskLevel" label="风险等级">
            <Select placeholder="请选择" options={[...OA_BIZ_RISK_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="verificationPlan" label="验证方案">
            <Input.TextArea rows={2} placeholder="请填写验证方案" />
          </Form.Item>
          <Form.Item name="verificationResult" label="验证结果">
            <Input.TextArea rows={2} placeholder="请填写验证结果" />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="closeCondition" label="关闭条件">
            <Input.TextArea rows={2} placeholder="请填写关闭条件" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        changeCategory: r.changeCategory,
        changeTitle: r.changeTitle,
        productCode: r.productCode,
        productName: r.productName,
        partCode: r.partCode,
        changeDesc: r.changeDesc,
        riskAnalysis: r.riskAnalysis,
        riskLevel: r.riskLevel,
        verificationPlan: r.verificationPlan,
        verificationResult: r.verificationResult,
        effectiveDate: r.effectiveDate ? dayjs(r.effectiveDate) : undefined,
        closeCondition: r.closeCondition,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        changeCategory: v.changeCategory,
        changeTitle: v.changeTitle,
        productCode: v.productCode,
        productName: v.productName,
        partCode: v.partCode,
        changeDesc: v.changeDesc,
        riskAnalysis: v.riskAnalysis,
        riskLevel: v.riskLevel,
        verificationPlan: v.verificationPlan,
        verificationResult: v.verificationResult,
        effectiveDate: v.effectiveDate ? v.effectiveDate.format(DATE_FORMAT) : undefined,
        closeCondition: v.closeCondition,
        remark: v.remark,
        submit: v.submit,
      })}
    />
  );
}

/* ---------------- 2. 样品试制问题改善（OA-DEV-073） ---------------- */

interface SampleIssueFormValues extends BizSubmitValue {
  projectCode?: string;
  projectName?: string;
  productCode?: string;
  bomCode?: string;
  partCode?: string;
  partName?: string;
  issueType?: string;
  issueDesc?: string;
  severity?: string;
  responsibleUserId?: number;
  dueDate?: Dayjs;
  measure?: string;
  verifyResult?: string;
  plmRefNo?: string;
  remark?: string;
}

function SampleIssueTab() {
  const handleStartVerify = async (id: number, reload: () => void) => {
    await oaBizSampleIssueService.startVerify(id);
    message.success('已进入验证阶段');
    reload();
  };
  const handleClose = async (id: number, verifyResult: string | undefined, reload: () => void) => {
    await oaBizSampleIssueService.close(id, verifyResult);
    message.success('已关闭');
    reload();
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '问题单号', dataIndex: 'issueNo', width: 150, fixed: 'left', render: plain },
    { title: '项目名称', dataIndex: 'projectName', width: 160, render: plain },
    { title: '零件编码', dataIndex: 'partCode', width: 130, render: plain },
    { title: '零件名称', dataIndex: 'partName', width: 150, render: plain },
    { title: '问题类型', dataIndex: 'issueType', width: 120, render: plain },
    { title: '严重程度', dataIndex: 'severity', width: 100, render: (v) => enumLabel(OA_BIZ_ISSUE_LEVEL_LABEL, v) },
    { title: '问题状态', dataIndex: 'issueStatus', width: 110, render: sampleStatusTag },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaBizSampleIssueSaveParams, SampleIssueFormValues>
      title="样品试制问题改善"
      service={oaBizSampleIssueService}
      columns={columns}
      listPerm={RD_LIST}
      applyPerm={RD_APPLY}
      managePerm={RD_MANAGE}
      initialValues={{ severity: 'MINOR' }}
      extraActions={(record, reload) => (
        <>
          {(record.issueStatus === 'OPEN' || record.issueStatus === 'PROCESSING') && (
            <Popconfirm title="确认进入验证阶段？" onConfirm={() => void handleStartVerify(record.id, reload)}>
              <Button type="link" size="small">
                进入验证
              </Button>
            </Popconfirm>
          )}
          {record.issueStatus === 'VERIFYING' && (
            <Popconfirm
              title="确认关闭该问题？"
              onConfirm={() => void handleClose(record.id, record.verifyResult, reload)}
            >
              <Button type="link" size="small">
                关闭
              </Button>
            </Popconfirm>
          )}
        </>
      )}
      detailFields={[
        { label: '问题单号', key: 'issueNo' },
        { label: '项目编号', key: 'projectCode' },
        { label: '项目名称', key: 'projectName' },
        { label: '产品编码', key: 'productCode' },
        { label: 'BOM 编码', key: 'bomCode' },
        { label: '零件编码', key: 'partCode' },
        { label: '零件名称', key: 'partName' },
        { label: '问题类型', key: 'issueType' },
        { label: '问题描述', key: 'issueDesc' },
        { label: '严重程度', key: 'severity', render: (v) => enumLabel(OA_BIZ_ISSUE_LEVEL_LABEL, v) },
        { label: '责任人', key: 'responsibleName' },
        { label: '要求完成日期', key: 'dueDate' },
        { label: '改善措施', key: 'measure' },
        { label: '验证结果', key: 'verifyResult' },
        { label: '问题状态', key: 'issueStatus', render: (v) => sampleStatusTag(v) },
        { label: 'PLM 引用号', key: 'plmRefNo' },
        { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={(_form, editing) => (
        <>
          <Form.Item name="projectCode" label="项目编号">
            <Input placeholder="请输入项目编号" />
          </Form.Item>
          <Form.Item name="projectName" label="项目名称">
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="bomCode" label="BOM 编码">
            <Input placeholder="请输入 BOM 编码" />
          </Form.Item>
          <Form.Item name="partCode" label="零件编码">
            <Input placeholder="请输入零件编码" />
          </Form.Item>
          <Form.Item name="partName" label="零件名称">
            <Input placeholder="请输入零件名称" />
          </Form.Item>
          <Form.Item name="issueType" label="问题类型">
            <Input placeholder="请输入问题类型" />
          </Form.Item>
          <Form.Item name="issueDesc" label="问题描述" rules={[{ required: true, message: '请输入问题描述' }]}>
            <Input.TextArea rows={2} placeholder="请描述试制问题" />
          </Form.Item>
          <Form.Item name="severity" label="严重程度">
            <Select placeholder="请选择" options={[...OA_BIZ_ISSUE_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="responsibleUserId" label="责任人">
            <UserSelect style={{ width: '100%' }} fallbackLabel={editing?.responsibleName} />
          </Form.Item>
          <Form.Item name="dueDate" label="要求完成日期">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="measure" label="改善措施">
            <Input.TextArea rows={2} placeholder="请填写改善措施" />
          </Form.Item>
          <Form.Item name="verifyResult" label="验证结果">
            <Input.TextArea rows={2} placeholder="请填写验证结果" />
          </Form.Item>
          <Form.Item name="plmRefNo" label="PLM 引用号">
            <Input placeholder="请输入 PLM 引用号" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        projectCode: r.projectCode,
        projectName: r.projectName,
        productCode: r.productCode,
        bomCode: r.bomCode,
        partCode: r.partCode,
        partName: r.partName,
        issueType: r.issueType,
        issueDesc: r.issueDesc,
        severity: r.severity,
        responsibleUserId: r.responsibleUserId,
        dueDate: r.dueDate ? dayjs(r.dueDate) : undefined,
        measure: r.measure,
        verifyResult: r.verifyResult,
        plmRefNo: r.plmRefNo,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        projectCode: v.projectCode,
        projectName: v.projectName,
        productCode: v.productCode,
        bomCode: v.bomCode,
        partCode: v.partCode,
        partName: v.partName,
        issueType: v.issueType,
        issueDesc: v.issueDesc,
        severity: v.severity,
        responsibleUserId: v.responsibleUserId,
        dueDate: v.dueDate ? v.dueDate.format(DATE_FORMAT) : undefined,
        measure: v.measure,
        verifyResult: v.verifyResult,
        plmRefNo: v.plmRefNo,
        remark: v.remark,
        submit: v.submit,
      })}
    />
  );
}

/* ---------------- 3. ECR 风险评审（OA-DEV-075） ---------------- */

interface EcrFormValues extends BizSubmitValue {
  ecrTitle?: string;
  changeType?: string;
  productCode?: string;
  productName?: string;
  materialCode?: string;
  materialName?: string;
  changeReason?: string;
  riskDesc?: string;
  impactAnalysis?: string;
  countermeasure?: string;
  reviewConclusion?: string;
  plmChangeNo?: string;
  plmChangeStatus?: string;
  remark?: string;
}

interface LinkPlmValues {
  plmChangeNo?: string;
  plmChangeStatus?: string;
}

function EcrTab() {
  const [linkForm] = Form.useForm<LinkPlmValues>();
  const [linkTarget, setLinkTarget] = useState<OaBizFlowItem | null>(null);
  const reloadRef = useRef<() => void>(() => {});

  const handleLink = async () => {
    if (!linkTarget) return;
    const values = await linkForm.validateFields();
    await oaBizEcrService.linkPlmChange(linkTarget.id, values.plmChangeNo, values.plmChangeStatus);
    message.success('已关联 PLM 变更');
    setLinkTarget(null);
    reloadRef.current();
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '评审单号', dataIndex: 'ecrNo', width: 150, fixed: 'left', render: plain },
    { title: '评审标题', dataIndex: 'ecrTitle', width: 180, render: plain },
    { title: '变更类型', dataIndex: 'changeType', width: 130, render: (v) => enumLabel(OA_BIZ_ECR_CHANGE_TYPE_LABEL, v) },
    { title: '产品编码', dataIndex: 'productCode', width: 130, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 130, render: plain },
    { title: 'PLM 变更单号', dataIndex: 'plmChangeNo', width: 150, render: plain },
    { title: 'PLM 变更状态', dataIndex: 'plmChangeStatus', width: 130, render: plain },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <>
      <BizFlowTab<OaBizEcrRiskReviewSaveParams, EcrFormValues>
        title="ECR风险评审"
        service={oaBizEcrService}
        columns={columns}
        listPerm={RD_LIST}
        applyPerm={RD_APPLY}
        managePerm={RD_MANAGE}
        initialValues={{ changeType: 'ECR' }}
        extraActions={(record, reload) => (
          <Button
            type="link"
            size="small"
            onClick={() => {
              reloadRef.current = reload;
              linkForm.setFieldsValue({
                plmChangeNo: record.plmChangeNo,
                plmChangeStatus: record.plmChangeStatus,
              });
              setLinkTarget(record);
            }}
          >
            关联PLM变更
          </Button>
        )}
        detailFields={[
          { label: '评审单号', key: 'ecrNo' },
          { label: '评审标题', key: 'ecrTitle' },
          { label: '变更类型', key: 'changeType', render: (v) => enumLabel(OA_BIZ_ECR_CHANGE_TYPE_LABEL, v) },
          { label: '产品编码', key: 'productCode' },
          { label: '产品名称', key: 'productName' },
          { label: '物料编码', key: 'materialCode' },
          { label: '物料名称', key: 'materialName' },
          { label: '变更原因', key: 'changeReason' },
          { label: '风险描述', key: 'riskDesc' },
          { label: '影响分析', key: 'impactAnalysis' },
          { label: '应对措施', key: 'countermeasure' },
          { label: '评审结论', key: 'reviewConclusion' },
          { label: 'PLM 变更单号', key: 'plmChangeNo' },
          { label: 'PLM 变更状态', key: 'plmChangeStatus' },
          { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
          { label: '备注', key: 'remark' },
        ]}
        renderFields={() => (
          <>
            <Form.Item name="ecrTitle" label="评审标题" rules={[{ required: true, message: '请输入评审标题' }]}>
              <Input placeholder="请输入评审标题" />
            </Form.Item>
            <Form.Item name="changeType" label="变更类型" rules={[{ required: true, message: '请选择变更类型' }]}>
              <Select placeholder="请选择" options={[...OA_BIZ_ECR_CHANGE_TYPE_OPTIONS]} />
            </Form.Item>
            <Form.Item name="productCode" label="产品编码">
              <Input placeholder="请输入产品编码" />
            </Form.Item>
            <Form.Item name="productName" label="产品名称">
              <Input placeholder="请输入产品名称" />
            </Form.Item>
            <Form.Item name="materialCode" label="物料编码">
              <Input placeholder="请输入物料编码" />
            </Form.Item>
            <Form.Item name="materialName" label="物料名称">
              <Input placeholder="请输入物料名称" />
            </Form.Item>
            <Form.Item name="changeReason" label="变更原因">
              <Input.TextArea rows={2} placeholder="请说明变更原因" />
            </Form.Item>
            <Form.Item name="riskDesc" label="风险描述">
              <Input.TextArea rows={2} placeholder="请描述变更风险" />
            </Form.Item>
            <Form.Item name="impactAnalysis" label="影响分析">
              <Input.TextArea rows={2} placeholder="请填写影响分析" />
            </Form.Item>
            <Form.Item name="countermeasure" label="应对措施">
              <Input.TextArea rows={2} placeholder="请填写应对措施" />
            </Form.Item>
            <Form.Item name="reviewConclusion" label="评审结论">
              <Input.TextArea rows={2} placeholder="请填写评审结论" />
            </Form.Item>
            <Form.Item name="plmChangeNo" label="PLM 变更单号">
              <Input placeholder="请输入 PLM 变更单号" />
            </Form.Item>
            <Form.Item name="plmChangeStatus" label="PLM 变更状态">
              <Input placeholder="请输入 PLM 变更状态" />
            </Form.Item>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={2} placeholder="请输入备注" />
            </Form.Item>
          </>
        )}
        buildEditValues={(r) => ({
          ecrTitle: r.ecrTitle,
          changeType: r.changeType,
          productCode: r.productCode,
          productName: r.productName,
          materialCode: r.materialCode,
          materialName: r.materialName,
          changeReason: r.changeReason,
          riskDesc: r.riskDesc,
          impactAnalysis: r.impactAnalysis,
          countermeasure: r.countermeasure,
          reviewConclusion: r.reviewConclusion,
          plmChangeNo: r.plmChangeNo,
          plmChangeStatus: r.plmChangeStatus,
          remark: r.remark,
        })}
        buildPayload={(v) => ({
          ecrTitle: v.ecrTitle,
          changeType: v.changeType,
          productCode: v.productCode,
          productName: v.productName,
          materialCode: v.materialCode,
          materialName: v.materialName,
          changeReason: v.changeReason,
          riskDesc: v.riskDesc,
          impactAnalysis: v.impactAnalysis,
          countermeasure: v.countermeasure,
          reviewConclusion: v.reviewConclusion,
          plmChangeNo: v.plmChangeNo,
          plmChangeStatus: v.plmChangeStatus,
          remark: v.remark,
          submit: v.submit,
        })}
      />

      <Modal
        title="关联 PLM 变更"
        open={linkTarget !== null}
        onOk={handleLink}
        onCancel={() => setLinkTarget(null)}
        destroyOnClose
      >
        <Form form={linkForm} layout="vertical" preserve={false}>
          <Form.Item name="plmChangeNo" label="PLM 变更单号">
            <Input placeholder="请输入 PLM 变更单号" />
          </Form.Item>
          <Form.Item name="plmChangeStatus" label="PLM 变更状态">
            <Input placeholder="请输入 PLM 变更状态" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

/* ---------------- 4. 变更通知与图纸补发（OA-DEV-076） ---------------- */

interface ChangeNoticeFormValues extends BizSubmitValue {
  noticeType?: string;
  changeSource?: string;
  sourceRefNo?: string;
  materialCode?: string;
  materialName?: string;
  docCode?: string;
  docName?: string;
  docVersion?: string;
  noticeTitle?: string;
  noticeContent?: string;
  effectiveDate?: Dayjs;
  receiverUserIds?: string;
  receiverNames?: string;
  needReceipt?: number;
  remark?: string;
}

/** 我的待签收变更通知（oa:biz:notice:receipt）。 */
function MyReceiptList() {
  const [data, setData] = useState<OaBizFlowItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = useCallback(
    async (page = pageNum, size = pageSize) => {
      setLoading(true);
      try {
        const res = await oaBizChangeNoticeService.pageMyReceipt({ pageNum: page, pageSize: size });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize],
  );

  useEffect(() => {
    void load(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSign = async (record: OaBizFlowItem) => {
    await oaBizChangeNoticeService.sign(record.id, {});
    message.success('已签收');
    void load();
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '通知单号', dataIndex: 'noticeNo', width: 150, fixed: 'left', render: plain },
    { title: '通知类型', dataIndex: 'noticeType', width: 110, render: (v) => enumLabel(OA_BIZ_CHANGE_NOTICE_TYPE_LABEL, v) },
    { title: '通知标题', dataIndex: 'noticeTitle', width: 180, render: plain },
    { title: '图纸/文档编号', dataIndex: 'docCode', width: 150, render: plain },
    { title: '接收人', dataIndex: 'receiverNames', width: 160, render: plain },
    { title: '生效日期', dataIndex: 'effectiveDate', width: 120, render: plain },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm title="确认签收该变更通知？" onConfirm={() => void handleSign(record)}>
          <Button type="link" size="small">
            签收
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table<OaBizFlowItem>
      rowKey="id"
      loading={loading}
      columns={columns}
      dataSource={data}
      scroll={{ x: 1200 }}
      pagination={{
        current: pageNum,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (t) => `共 ${t} 条`,
        onChange: (page, size) => {
          setPageNum(page);
          setPageSize(size);
          void load(page, size);
        },
      }}
    />
  );
}

function ChangeNoticeTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canReceipt = hasPermission(NOTICE_RECEIPT);
  const [mode, setMode] = useState<'all' | 'receipt'>('all');
  const [receiptTarget, setReceiptTarget] = useState<OaBizFlowItem | null>(null);
  const [receipts, setReceipts] = useState<OaBizFlowItem[]>([]);
  const [receiptLoading, setReceiptLoading] = useState(false);

  const openReceipts = async (record: OaBizFlowItem) => {
    setReceiptTarget(record);
    setReceiptLoading(true);
    try {
      const res = await oaBizChangeNoticeService.listReceipts(record.id);
      setReceipts(res || []);
    } finally {
      setReceiptLoading(false);
    }
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '通知单号', dataIndex: 'noticeNo', width: 150, fixed: 'left', render: plain },
    { title: '通知类型', dataIndex: 'noticeType', width: 110, render: (v) => enumLabel(OA_BIZ_CHANGE_NOTICE_TYPE_LABEL, v) },
    { title: '通知标题', dataIndex: 'noticeTitle', width: 180, render: plain },
    { title: '图纸/文档编号', dataIndex: 'docCode', width: 150, render: plain },
    { title: '文档版本', dataIndex: 'docVersion', width: 100, render: plain },
    { title: '接收人', dataIndex: 'receiverNames', width: 160, render: plain },
    { title: '需签收', dataIndex: 'needReceipt', width: 90, render: yesNoText },
    { title: '已签收数', dataIndex: 'receiptCount', width: 100, render: plain },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Segmented
        value={mode}
        onChange={(value) => setMode(value as 'all' | 'receipt')}
        options={
          canReceipt
            ? [
                { label: '全部通知', value: 'all' },
                { label: '我的待签收', value: 'receipt' },
              ]
            : [{ label: '全部通知', value: 'all' }]
        }
      />

      {mode === 'all' ? (
        <BizFlowTab<OaBizChangeNoticeSaveParams, ChangeNoticeFormValues>
          title="变更通知与图纸补发"
          service={oaBizChangeNoticeService}
          columns={columns}
          listPerm={RD_LIST}
          applyPerm={RD_APPLY}
          managePerm={RD_MANAGE}
          initialValues={{ noticeType: 'NOTICE', needReceipt: 1 }}
          extraActions={(record) => (
            <Button type="link" size="small" onClick={() => void openReceipts(record)}>
              签收记录
            </Button>
          )}
          detailFields={[
            { label: '通知单号', key: 'noticeNo' },
            { label: '通知类型', key: 'noticeType', render: (v) => enumLabel(OA_BIZ_CHANGE_NOTICE_TYPE_LABEL, v) },
            { label: '变更来源', key: 'changeSource' },
            { label: '来源单号', key: 'sourceRefNo' },
            { label: '物料编码', key: 'materialCode' },
            { label: '物料名称', key: 'materialName' },
            { label: '图纸/文档编号', key: 'docCode' },
            { label: '文档名称', key: 'docName' },
            { label: '文档版本', key: 'docVersion' },
            { label: '通知标题', key: 'noticeTitle' },
            { label: '通知内容', key: 'noticeContent' },
            { label: '生效日期', key: 'effectiveDate' },
            { label: '接收人', key: 'receiverNames' },
            { label: '需签收', key: 'needReceipt', render: (v) => yesNoText(v) },
            { label: '已签收数', key: 'receiptCount' },
            { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
            { label: '备注', key: 'remark' },
          ]}
          renderFields={() => (
            <>
              <Form.Item name="noticeType" label="通知类型" rules={[{ required: true, message: '请选择通知类型' }]}>
                <Select placeholder="请选择" options={[...OA_BIZ_CHANGE_NOTICE_TYPE_OPTIONS]} />
              </Form.Item>
              <Form.Item name="changeSource" label="变更来源">
                <Input placeholder="如 OA / ECR" />
              </Form.Item>
              <Form.Item name="sourceRefNo" label="来源单号">
                <Input placeholder="请输入来源单号" />
              </Form.Item>
              <Form.Item name="materialCode" label="物料编码">
                <Input placeholder="请输入物料编码" />
              </Form.Item>
              <Form.Item name="materialName" label="物料名称">
                <Input placeholder="请输入物料名称" />
              </Form.Item>
              <Form.Item name="docCode" label="图纸/文档编号">
                <Input placeholder="请输入图纸或文档编号" />
              </Form.Item>
              <Form.Item name="docName" label="文档名称">
                <Input placeholder="请输入文档名称" />
              </Form.Item>
              <Form.Item name="docVersion" label="文档版本">
                <Input placeholder="请输入文档版本" />
              </Form.Item>
              <Form.Item name="noticeTitle" label="通知标题" rules={[{ required: true, message: '请输入通知标题' }]}>
                <Input placeholder="请输入通知标题" />
              </Form.Item>
              <Form.Item name="noticeContent" label="通知内容">
                <Input.TextArea rows={2} placeholder="请输入通知内容" />
              </Form.Item>
              <Form.Item name="effectiveDate" label="生效日期">
                <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
              </Form.Item>
              <Form.Item name="receiverUserIds" label="接收人用户 ID">
                <Input placeholder="多个用户 ID 以逗号分隔" />
              </Form.Item>
              <Form.Item name="receiverNames" label="接收人姓名">
                <Input placeholder="多个姓名以逗号分隔，与用户 ID 顺序一致" />
              </Form.Item>
              <Form.Item name="needReceipt" label="是否需签收">
                <Select placeholder="请选择" options={[...OA_YES_NO_OPTIONS]} />
              </Form.Item>
              <Form.Item name="remark" label="备注">
                <Input.TextArea rows={2} placeholder="请输入备注" />
              </Form.Item>
            </>
          )}
          buildEditValues={(r) => ({
            noticeType: r.noticeType,
            changeSource: r.changeSource,
            sourceRefNo: r.sourceRefNo,
            materialCode: r.materialCode,
            materialName: r.materialName,
            docCode: r.docCode,
            docName: r.docName,
            docVersion: r.docVersion,
            noticeTitle: r.noticeTitle,
            noticeContent: r.noticeContent,
            effectiveDate: r.effectiveDate ? dayjs(r.effectiveDate) : undefined,
            receiverUserIds: r.receiverUserIds,
            receiverNames: r.receiverNames,
            needReceipt: r.needReceipt,
            remark: r.remark,
          })}
          buildPayload={(v) => ({
            noticeType: v.noticeType,
            changeSource: v.changeSource,
            sourceRefNo: v.sourceRefNo,
            materialCode: v.materialCode,
            materialName: v.materialName,
            docCode: v.docCode,
            docName: v.docName,
            docVersion: v.docVersion,
            noticeTitle: v.noticeTitle,
            noticeContent: v.noticeContent,
            effectiveDate: v.effectiveDate ? v.effectiveDate.format(DATE_FORMAT) : undefined,
            receiverUserIds: v.receiverUserIds,
            receiverNames: v.receiverNames,
            needReceipt: v.needReceipt,
            remark: v.remark,
            submit: v.submit,
          })}
        />
      ) : (
        <MyReceiptList />
      )}

      <Modal
        title={`签收记录 - ${receiptTarget?.noticeNo || ''}`}
        open={receiptTarget !== null}
        onCancel={() => setReceiptTarget(null)}
        footer={<Button onClick={() => setReceiptTarget(null)}>关闭</Button>}
        width={640}
        destroyOnClose
      >
        <Table<OaBizFlowItem>
          rowKey="id"
          loading={receiptLoading}
          dataSource={receipts}
          pagination={false}
          columns={[
            { title: '接收人', dataIndex: 'receiverName', render: plain },
            { title: '签收状态', dataIndex: 'receiptStatus', width: 110, render: (v) => receiptStatusTag(v) },
            { title: '签收时间', dataIndex: 'receiptTime', width: 170, render: formatDateTime },
            { title: '签收备注', dataIndex: 'receiptRemark', render: plain },
          ]}
        />
      </Modal>
    </Space>
  );
}

/* ---------------- 5. 新开模检查与零件试流（OA-DEV-077） ---------------- */

interface MoldTrialFormValues extends BizSubmitValue {
  trialType?: string;
  moldCode?: string;
  moldName?: string;
  partCode?: string;
  partName?: string;
  materialCode?: string;
  materialName?: string;
  supplierCode?: string;
  supplierName?: string;
  checkItems?: string;
  checkResult?: string;
  trialQty?: number;
  trialResult?: string;
  trialIssue?: string;
  verifyConclusion?: string;
  plmRefNo?: string;
  trialDate?: Dayjs;
  remark?: string;
}

function MoldTrialTab() {
  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '试流单号', dataIndex: 'trialNo', width: 150, fixed: 'left', render: plain },
    { title: '试流类型', dataIndex: 'trialType', width: 130, render: (v) => enumLabel(OA_BIZ_MOLD_TRIAL_TYPE_LABEL, v) },
    { title: '模具编码', dataIndex: 'moldCode', width: 130, render: plain },
    { title: '零件编码', dataIndex: 'partCode', width: 130, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 130, render: plain },
    { title: '试流数量', dataIndex: 'trialQty', width: 100, render: plain },
    { title: '验证结论', dataIndex: 'verifyConclusion', width: 160, render: plain },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaBizMoldTrialSaveParams, MoldTrialFormValues>
      title="新开模检查与零件试流"
      service={oaBizMoldTrialService}
      columns={columns}
      listPerm={RD_LIST}
      applyPerm={RD_APPLY}
      managePerm={RD_MANAGE}
      initialValues={{ trialType: 'MOLD_CHECK' }}
      detailFields={[
        { label: '试流单号', key: 'trialNo' },
        { label: '试流类型', key: 'trialType', render: (v) => enumLabel(OA_BIZ_MOLD_TRIAL_TYPE_LABEL, v) },
        { label: '模具编码', key: 'moldCode' },
        { label: '模具名称', key: 'moldName' },
        { label: '零件编码', key: 'partCode' },
        { label: '零件名称', key: 'partName' },
        { label: '物料编码', key: 'materialCode' },
        { label: '物料名称', key: 'materialName' },
        { label: '供应商编码', key: 'supplierCode' },
        { label: '供应商名称', key: 'supplierName' },
        { label: '检查项目', key: 'checkItems' },
        { label: '检查结果', key: 'checkResult' },
        { label: '试流数量', key: 'trialQty' },
        { label: '试流结论', key: 'trialResult' },
        { label: '试流问题', key: 'trialIssue' },
        { label: '验证结论', key: 'verifyConclusion' },
        { label: 'PLM 引用号', key: 'plmRefNo' },
        { label: '试流日期', key: 'trialDate' },
        { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={() => (
        <>
          <Form.Item name="trialType" label="试流类型" rules={[{ required: true, message: '请选择试流类型' }]}>
            <Select placeholder="请选择" options={[...OA_BIZ_MOLD_TRIAL_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="moldCode" label="模具编码">
            <Input placeholder="请输入模具编码" />
          </Form.Item>
          <Form.Item name="moldName" label="模具名称">
            <Input placeholder="请输入模具名称" />
          </Form.Item>
          <Form.Item name="partCode" label="零件编码">
            <Input placeholder="请输入零件编码" />
          </Form.Item>
          <Form.Item name="partName" label="零件名称">
            <Input placeholder="请输入零件名称" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="checkItems" label="检查项目">
            <Input.TextArea rows={2} placeholder="请填写检查项目" />
          </Form.Item>
          <Form.Item name="checkResult" label="检查结果">
            <Input.TextArea rows={2} placeholder="请填写检查结果" />
          </Form.Item>
          <Form.Item name="trialQty" label="试流数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入试流数量" />
          </Form.Item>
          <Form.Item name="trialResult" label="试流结论">
            <Input.TextArea rows={2} placeholder="请填写试流结论" />
          </Form.Item>
          <Form.Item name="trialIssue" label="试流问题">
            <Input.TextArea rows={2} placeholder="请填写试流问题" />
          </Form.Item>
          <Form.Item name="verifyConclusion" label="验证结论">
            <Input.TextArea rows={2} placeholder="请填写验证结论" />
          </Form.Item>
          <Form.Item name="plmRefNo" label="PLM 引用号">
            <Input placeholder="请输入 PLM 引用号" />
          </Form.Item>
          <Form.Item name="trialDate" label="试流日期">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        trialType: r.trialType,
        moldCode: r.moldCode,
        moldName: r.moldName,
        partCode: r.partCode,
        partName: r.partName,
        materialCode: r.materialCode,
        materialName: r.materialName,
        supplierCode: r.supplierCode,
        supplierName: r.supplierName,
        checkItems: r.checkItems,
        checkResult: r.checkResult,
        trialQty: r.trialQty,
        trialResult: r.trialResult,
        trialIssue: r.trialIssue,
        verifyConclusion: r.verifyConclusion,
        plmRefNo: r.plmRefNo,
        trialDate: r.trialDate ? dayjs(r.trialDate) : undefined,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        trialType: v.trialType,
        moldCode: v.moldCode,
        moldName: v.moldName,
        partCode: v.partCode,
        partName: v.partName,
        materialCode: v.materialCode,
        materialName: v.materialName,
        supplierCode: v.supplierCode,
        supplierName: v.supplierName,
        checkItems: v.checkItems,
        checkResult: v.checkResult,
        trialQty: v.trialQty,
        trialResult: v.trialResult,
        trialIssue: v.trialIssue,
        verifyConclusion: v.verifyConclusion,
        plmRefNo: v.plmRefNo,
        trialDate: v.trialDate ? v.trialDate.format(DATE_FORMAT) : undefined,
        remark: v.remark,
        submit: v.submit,
      })}
    />
  );
}

/* ---------------- 页面 ---------------- */

export default function OaBizRdPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        研发技术流程
      </Title>

      <Tabs
        items={[
          { key: 'fiveM', label: '5M变更追踪', children: <FiveMChangeTab /> },
          { key: 'sample', label: '样品试制问题改善', children: <SampleIssueTab /> },
          { key: 'ecr', label: 'ECR风险评审', children: <EcrTab /> },
          { key: 'notice', label: '变更通知与图纸补发', children: <ChangeNoticeTab /> },
          { key: 'mold', label: '新开模检查与零件试流', children: <MoldTrialTab /> },
        ]}
      />
    </Space>
  );
}
