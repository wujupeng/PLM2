import { Button, DatePicker, Form, Input, InputNumber, Popconfirm, Select, Space, Tabs, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { oaBizInspectionService, oaBizInternalAuditService, oaBizQualityMetricService } from '@/services/oaService';
import UserSelect from '@/pages/oa/UserSelect';
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
  OA_BIZ_AUDIT_STATUS_LABEL,
  OA_BIZ_DATA_SOURCE_LABEL,
  OA_BIZ_DATA_SOURCE_OPTIONS,
  OA_BIZ_INSPECTION_RESULT_LABEL,
  OA_BIZ_INSPECTION_RESULT_OPTIONS,
  OA_BIZ_ISSUE_LEVEL_OPTIONS,
  OA_BIZ_QUALITY_METRIC_TYPE_LABEL,
  OA_BIZ_QUALITY_METRIC_TYPE_OPTIONS,
  type OaBizFlowItem,
  type OaBizInspectionRequestSaveParams,
  type OaBizInternalAuditSaveParams,
  type OaBizQualityMetricSaveParams,
} from '@/types/oa';

const { Text } = Typography;
const { Title } = Typography;

const QUALITY_LIST = 'oa:biz:quality:list';
const QUALITY_APPLY = 'oa:biz:quality:apply';
const QUALITY_MANAGE = 'oa:biz:quality:manage';

const METRIC_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
] as const;

const METRIC_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
};

const metricStatusTag = bizStatusTag(METRIC_STATUS_LABEL);
const auditStatusTag = bizStatusTag(OA_BIZ_AUDIT_STATUS_LABEL);

/* ---------------- 1. 质量报表与指标（OA-DEV-069，无流程） ---------------- */

interface QualityMetricFormValues extends BizSubmitValue {
  metricType?: string;
  metricCode?: string;
  metricName?: string;
  metricPeriod?: string;
  deptName?: string;
  targetValue?: number;
  actualValue?: number;
  unit?: string;
  calcFormula?: string;
  dataSource?: string;
  sourceRef?: string;
  ownerUserId?: number;
  remark?: string;
}

function QualityMetricTab() {
  const handlePublish = async (id: number, reload: () => void) => {
    await oaBizQualityMetricService.publish(id);
    message.success('已发布');
    reload();
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '指标单号', dataIndex: 'metricNo', width: 150, fixed: 'left', render: plain },
    { title: '指标类型', dataIndex: 'metricType', width: 130, render: (v) => enumLabel(OA_BIZ_QUALITY_METRIC_TYPE_LABEL, v) },
    { title: '指标编码', dataIndex: 'metricCode', width: 130, render: plain },
    { title: '指标名称', dataIndex: 'metricName', width: 170, render: plain },
    { title: '期间', dataIndex: 'metricPeriod', width: 120, render: plain },
    { title: '目标值', dataIndex: 'targetValue', width: 100, render: plain },
    { title: '实际值', dataIndex: 'actualValue', width: 100, render: plain },
    { title: '达成率', dataIndex: 'achieveRate', width: 100, render: plain },
    { title: '数据来源', dataIndex: 'dataSource', width: 110, render: (v) => enumLabel(OA_BIZ_DATA_SOURCE_LABEL, v) },
    { title: '状态', dataIndex: 'metricStatus', width: 100, render: metricStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaBizQualityMetricSaveParams, QualityMetricFormValues>
      title="质量报表与指标"
      service={oaBizQualityMetricService}
      columns={columns}
      listPerm={QUALITY_LIST}
      applyPerm={QUALITY_APPLY}
      managePerm={QUALITY_MANAGE}
      noFlow
      statusLabel="状态"
      statusOptions={METRIC_STATUS_OPTIONS}
      initialValues={{ metricType: 'TARGET', dataSource: 'QMS' }}
      extraActions={(record, reload) =>
        record.metricStatus === 'DRAFT' ? (
          <Popconfirm title="确认发布该质量指标？" onConfirm={() => void handlePublish(record.id, reload)}>
            <Button type="link" size="small">
              发布
            </Button>
          </Popconfirm>
        ) : null
      }
      detailFields={[
        { label: '指标单号', key: 'metricNo' },
        { label: '指标类型', key: 'metricType', render: (v) => enumLabel(OA_BIZ_QUALITY_METRIC_TYPE_LABEL, v) },
        { label: '指标编码', key: 'metricCode' },
        { label: '指标名称', key: 'metricName' },
        { label: '期间', key: 'metricPeriod' },
        { label: '部门', key: 'deptName' },
        { label: '目标值', key: 'targetValue' },
        { label: '实际值', key: 'actualValue' },
        { label: '达成率', key: 'achieveRate' },
        { label: '计算公式', key: 'calcFormula' },
        { label: '数据来源', key: 'dataSource', render: (v) => enumLabel(OA_BIZ_DATA_SOURCE_LABEL, v) },
        { label: '来源引用', key: 'sourceRef' },
        { label: '负责人', key: 'ownerName' },
        { label: '状态', key: 'metricStatus', render: (v) => metricStatusTag(v) },
        { label: '刷新时间', key: 'refreshTime', render: (v) => formatDateTime(v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={(_form, editing) => (
        <>
          <Text type="secondary">质量台账权威在 QMS，OA 仅承载报表口径配置与展示。</Text>
          <Form.Item
            name="metricType"
            label="指标类型"
            rules={[{ required: true, message: '请选择指标类型' }]}
            style={{ marginTop: 12 }}
          >
            <Select placeholder="请选择" options={[...OA_BIZ_QUALITY_METRIC_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="metricCode" label="指标编码">
            <Input placeholder="请输入指标编码" />
          </Form.Item>
          <Form.Item name="metricName" label="指标名称" rules={[{ required: true, message: '请输入指标名称' }]}>
            <Input placeholder="请输入指标名称" />
          </Form.Item>
          <Form.Item name="metricPeriod" label="期间">
            <Input placeholder="如 2026-01" />
          </Form.Item>
          <Form.Item name="deptName" label="部门">
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item name="targetValue" label="目标值">
            <InputNumber style={{ width: '100%' }} placeholder="请输入目标值" />
          </Form.Item>
          <Form.Item name="actualValue" label="实际值">
            <InputNumber style={{ width: '100%' }} placeholder="请输入实际值" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="如 %" />
          </Form.Item>
          <Form.Item name="calcFormula" label="计算公式">
            <Input placeholder="请输入计算公式" />
          </Form.Item>
          <Form.Item name="dataSource" label="数据来源">
            <Select placeholder="请选择" options={[...OA_BIZ_DATA_SOURCE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourceRef" label="来源引用">
            <Input placeholder="请输入来源引用" />
          </Form.Item>
          <Form.Item name="ownerUserId" label="负责人">
            <UserSelect style={{ width: '100%' }} fallbackLabel={editing?.ownerName} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        metricType: r.metricType,
        metricCode: r.metricCode,
        metricName: r.metricName,
        metricPeriod: r.metricPeriod,
        deptName: r.deptName,
        targetValue: r.targetValue,
        actualValue: r.actualValue,
        unit: r.unit,
        calcFormula: r.calcFormula,
        dataSource: r.dataSource,
        sourceRef: r.sourceRef,
        ownerUserId: r.ownerUserId,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        metricType: v.metricType,
        metricCode: v.metricCode,
        metricName: v.metricName,
        metricPeriod: v.metricPeriod,
        deptName: v.deptName,
        targetValue: v.targetValue,
        actualValue: v.actualValue,
        unit: v.unit,
        calcFormula: v.calcFormula,
        dataSource: v.dataSource,
        sourceRef: v.sourceRef,
        ownerUserId: v.ownerUserId,
        remark: v.remark,
      })}
    />
  );
}

/* ---------------- 2. 检测委托（OA-DEV-070） ---------------- */

interface InspectionFormValues extends BizSubmitValue {
  requestDeptName?: string;
  materialCode?: string;
  materialName?: string;
  batchNo?: string;
  sampleQty?: number;
  inspectionItems?: string;
  requireDate?: Dayjs;
  labName?: string;
  resultStatus?: string;
  resultDesc?: string;
  qmsRefNo?: string;
  remark?: string;
}

function InspectionTab() {
  const handleResult = async (record: OaBizFlowItem, status: string, reload: () => void) => {
    await oaBizInspectionService.recordResult(record.id, {
      resultStatus: status,
      resultDesc: record.resultDesc,
      reportAttachmentJson: record.reportAttachmentJson,
      qmsRefNo: record.qmsRefNo,
    });
    message.success('已登记检测结果');
    reload();
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '委托单号', dataIndex: 'requestNo', width: 150, fixed: 'left', render: plain },
    { title: '委托部门', dataIndex: 'requestDeptName', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: plain },
    { title: '样品数量', dataIndex: 'sampleQty', width: 100, render: plain },
    { title: '要求日期', dataIndex: 'requireDate', width: 120, render: plain },
    { title: '实验室', dataIndex: 'labName', width: 140, render: plain },
    { title: '检测结果', dataIndex: 'resultStatus', width: 110, render: (v) => enumLabel(OA_BIZ_INSPECTION_RESULT_LABEL, v) },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaBizInspectionRequestSaveParams, InspectionFormValues>
      title="检测委托"
      service={oaBizInspectionService}
      columns={columns}
      listPerm={QUALITY_LIST}
      applyPerm={QUALITY_APPLY}
      managePerm={QUALITY_MANAGE}
      initialValues={{ resultStatus: 'PENDING' }}
      extraActions={(record, reload) =>
        record.resultStatus === 'PENDING' ? (
          <>
            <Popconfirm title="确认判定为合格？" onConfirm={() => void handleResult(record, 'PASS', reload)}>
              <Button type="link" size="small">
                合格
              </Button>
            </Popconfirm>
            <Popconfirm title="确认判定为不合格？" onConfirm={() => void handleResult(record, 'FAIL', reload)}>
              <Button type="link" size="small">
                不合格
              </Button>
            </Popconfirm>
          </>
        ) : null
      }
      detailFields={[
        { label: '委托单号', key: 'requestNo' },
        { label: '委托部门', key: 'requestDeptName' },
        { label: '委托人', key: 'requesterName' },
        { label: '物料编码', key: 'materialCode' },
        { label: '物料名称', key: 'materialName' },
        { label: '批次号', key: 'batchNo' },
        { label: '样品数量', key: 'sampleQty' },
        { label: '检测项目', key: 'inspectionItems' },
        { label: '要求日期', key: 'requireDate' },
        { label: '实验室', key: 'labName' },
        { label: '检测结果', key: 'resultStatus', render: (v) => enumLabel(OA_BIZ_INSPECTION_RESULT_LABEL, v) },
        { label: '结果说明', key: 'resultDesc' },
        { label: 'QMS 引用号', key: 'qmsRefNo' },
        { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={() => (
        <>
          <Form.Item name="requestDeptName" label="委托部门">
            <Input placeholder="请输入委托部门" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称" rules={[{ required: true, message: '请输入物料名称' }]}>
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="sampleQty" label="样品数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入样品数量" />
          </Form.Item>
          <Form.Item name="inspectionItems" label="检测项目">
            <Input.TextArea rows={2} placeholder="请输入检测项目" />
          </Form.Item>
          <Form.Item name="requireDate" label="要求日期">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="labName" label="实验室">
            <Input placeholder="请输入实验室名称" />
          </Form.Item>
          <Form.Item name="resultStatus" label="检测结果">
            <Select placeholder="请选择" options={[...OA_BIZ_INSPECTION_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="resultDesc" label="结果说明">
            <Input.TextArea rows={2} placeholder="请输入结果说明" />
          </Form.Item>
          <Form.Item name="qmsRefNo" label="QMS 引用号">
            <Input placeholder="请输入 QMS 引用号" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        requestDeptName: r.requestDeptName,
        materialCode: r.materialCode,
        materialName: r.materialName,
        batchNo: r.batchNo,
        sampleQty: r.sampleQty,
        inspectionItems: r.inspectionItems,
        requireDate: r.requireDate ? dayjs(r.requireDate) : undefined,
        labName: r.labName,
        resultStatus: r.resultStatus,
        resultDesc: r.resultDesc,
        qmsRefNo: r.qmsRefNo,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        requestDeptName: v.requestDeptName,
        materialCode: v.materialCode,
        materialName: v.materialName,
        batchNo: v.batchNo,
        sampleQty: v.sampleQty,
        inspectionItems: v.inspectionItems,
        requireDate: v.requireDate ? v.requireDate.format(DATE_FORMAT) : undefined,
        labName: v.labName,
        resultStatus: v.resultStatus,
        resultDesc: v.resultDesc,
        qmsRefNo: v.qmsRefNo,
        remark: v.remark,
        submit: v.submit,
      })}
    />
  );
}

/* ---------------- 3. 内部审核（OA-DEV-074） ---------------- */

interface AuditIssueValues {
  issueDesc?: string;
  issueLevel?: string;
  responsibleUserId?: number;
  dueDate?: Dayjs;
  correctAction?: string;
  verifyResult?: string;
  remark?: string;
}

interface InternalAuditFormValues extends BizSubmitValue {
  auditPlanName?: string;
  auditScope?: string;
  auditStandard?: string;
  planStart?: Dayjs;
  planEnd?: Dayjs;
  auditorNames?: string;
  auditedDeptName?: string;
  auditConclusion?: string;
  remark?: string;
  issues?: AuditIssueValues[];
}

function InternalAuditTab() {
  const handleReport = async (id: number, conclusion: string | undefined, reload: () => void) => {
    await oaBizInternalAuditService.report(id, conclusion);
    message.success('已进入报告编制');
    reload();
  };
  const handleClose = async (id: number, reload: () => void) => {
    await oaBizInternalAuditService.close(id);
    message.success('已关闭');
    reload();
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '审核单号', dataIndex: 'auditNo', width: 150, fixed: 'left', render: plain },
    { title: '审核计划', dataIndex: 'auditPlanName', width: 180, render: plain },
    { title: '审核范围', dataIndex: 'auditScope', width: 160, render: plain },
    { title: '审核依据', dataIndex: 'auditStandard', width: 150, render: plain },
    { title: '不符合项', dataIndex: 'issueCount', width: 100, render: plain },
    { title: '审核状态', dataIndex: 'auditStatus', width: 110, render: auditStatusTag },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaBizInternalAuditSaveParams, InternalAuditFormValues>
      title="内部审核"
      service={oaBizInternalAuditService}
      columns={columns}
      listPerm={QUALITY_LIST}
      applyPerm={QUALITY_APPLY}
      managePerm={QUALITY_MANAGE}
      formWidth={960}
      loadEditExtras={async (record) => {
        const issues = await oaBizInternalAuditService.listIssues(record.id);
        return {
          issues: (issues || []).map((it) => ({
            issueDesc: it.issueDesc,
            issueLevel: it.issueLevel,
            responsibleUserId: it.responsibleUserId,
            dueDate: it.dueDate ? dayjs(it.dueDate) : undefined,
            correctAction: it.correctAction,
            verifyResult: it.verifyResult,
            remark: it.remark,
          })),
        };
      }}
      extraActions={(record, reload) => (
        <>
          {record.auditStatus !== 'REPORTING' && record.auditStatus !== 'CLOSED' && (
            <Popconfirm
              title="确认进入报告编制阶段？"
              onConfirm={() => void handleReport(record.id, record.auditConclusion, reload)}
            >
              <Button type="link" size="small">
                编制报告
              </Button>
            </Popconfirm>
          )}
          {record.auditStatus === 'REPORTING' && (
            <Popconfirm title="确认关闭该审核计划？" onConfirm={() => void handleClose(record.id, reload)}>
              <Button type="link" size="small">
                关闭
              </Button>
            </Popconfirm>
          )}
        </>
      )}
      detailFields={[
        { label: '审核单号', key: 'auditNo' },
        { label: '审核计划', key: 'auditPlanName' },
        { label: '审核范围', key: 'auditScope' },
        { label: '审核依据', key: 'auditStandard' },
        { label: '计划开始', key: 'planStart' },
        { label: '计划结束', key: 'planEnd' },
        { label: '审核员', key: 'auditorNames' },
        { label: '受审核部门', key: 'auditedDeptName' },
        { label: '不符合项数', key: 'issueCount' },
        { label: '审核结论', key: 'auditConclusion' },
        { label: '审核状态', key: 'auditStatus', render: (v) => auditStatusTag(v) },
        { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={() => (
        <>
          <Form.Item name="auditPlanName" label="审核计划名称" rules={[{ required: true, message: '请输入审核计划名称' }]}>
            <Input placeholder="请输入审核计划名称" />
          </Form.Item>
          <Form.Item name="auditScope" label="审核范围">
            <Input placeholder="请输入审核范围" />
          </Form.Item>
          <Form.Item name="auditStandard" label="审核依据">
            <Input placeholder="如 ISO9001" />
          </Form.Item>
          <Form.Item name="planStart" label="计划开始">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="planEnd" label="计划结束">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="auditorNames" label="审核员">
            <Input placeholder="多个审核员请用逗号分隔" />
          </Form.Item>
          <Form.Item name="auditedDeptName" label="受审核部门">
            <Input placeholder="请输入受审核部门" />
          </Form.Item>
          <Form.Item name="auditConclusion" label="审核结论">
            <Input.TextArea rows={2} placeholder="请输入审核结论" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
          <Form.List name="issues">
            {(fields, { add, remove }) => (
              <div>
                <Text strong>不符合项</Text>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" wrap style={{ display: 'flex', marginTop: 8 }}>
                    <Form.Item name={[field.name, 'issueDesc']}>
                      <Input placeholder="不符合项描述" style={{ width: 180 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'issueLevel']}>
                      <Select
                        placeholder="级别"
                        style={{ width: 110 }}
                        options={[...OA_BIZ_ISSUE_LEVEL_OPTIONS]}
                      />
                    </Form.Item>
                    <Form.Item name={[field.name, 'responsibleUserId']}>
                      <UserSelect style={{ width: 180 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'dueDate']}>
                      <DatePicker placeholder="整改期限" format={DATE_FORMAT} style={{ width: 140 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'correctAction']}>
                      <Input placeholder="纠正措施" style={{ width: 180 }} />
                    </Form.Item>
                    <Button type="link" danger onClick={() => remove(field.name)}>
                      删除
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()} style={{ marginTop: 8 }}>
                  添加不符合项
                </Button>
              </div>
            )}
          </Form.List>
        </>
      )}
      buildEditValues={(r) => ({
        auditPlanName: r.auditPlanName,
        auditScope: r.auditScope,
        auditStandard: r.auditStandard,
        planStart: r.planStart ? dayjs(r.planStart) : undefined,
        planEnd: r.planEnd ? dayjs(r.planEnd) : undefined,
        auditorNames: r.auditorNames,
        auditedDeptName: r.auditedDeptName,
        auditConclusion: r.auditConclusion,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        auditPlanName: v.auditPlanName,
        auditScope: v.auditScope,
        auditStandard: v.auditStandard,
        planStart: v.planStart ? v.planStart.format(DATE_FORMAT) : undefined,
        planEnd: v.planEnd ? v.planEnd.format(DATE_FORMAT) : undefined,
        auditorNames: v.auditorNames,
        auditedDeptName: v.auditedDeptName,
        auditConclusion: v.auditConclusion,
        remark: v.remark,
        issues: (v.issues || []).map((it) => ({
          issueDesc: it.issueDesc,
          issueLevel: it.issueLevel,
          responsibleUserId: it.responsibleUserId,
          dueDate: it.dueDate ? it.dueDate.format(DATE_FORMAT) : undefined,
          correctAction: it.correctAction,
          verifyResult: it.verifyResult,
          remark: it.remark,
        })),
        submit: v.submit,
      })}
    />
  );
}

export default function OaBizQualityPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        品质流程
      </Title>

      <Tabs
        items={[
          { key: 'metric', label: '质量报表与指标', children: <QualityMetricTab /> },
          { key: 'inspection', label: '检测委托', children: <InspectionTab /> },
          { key: 'audit', label: '内部审核', children: <InternalAuditTab /> },
        ]}
      />
    </Space>
  );
}
