import { Button, DatePicker, Form, Input, InputNumber, Popconfirm, Select, Space, Tabs, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import {
  oaBizCreditService,
  oaBizDeliveryService,
  oaBizPriceService,
  oaBizProductionSequenceService,
  oaBizWorkshopDailyService,
} from '@/services/oaService';
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
  OA_BIZ_COORD_CLOSE_STATUS_LABEL,
  OA_BIZ_CREDIT_TYPE_LABEL,
  OA_BIZ_CREDIT_TYPE_OPTIONS,
  OA_BIZ_DAILY_REPORT_STATUS_LABEL,
  OA_BIZ_DAILY_REPORT_STATUS_OPTIONS,
  OA_BIZ_DATA_SOURCE_LABEL,
  OA_BIZ_DATA_SOURCE_OPTIONS,
  OA_BIZ_PLAN_SOURCE_LABEL,
  OA_BIZ_PLAN_SOURCE_OPTIONS,
  OA_BIZ_PRICE_CATEGORY_LABEL,
  OA_BIZ_PRICE_CATEGORY_OPTIONS,
  OA_BIZ_PRICE_CHANGE_TYPE_LABEL,
  OA_BIZ_PRICE_CHANGE_TYPE_OPTIONS,
  OA_BIZ_RISK_LEVEL_LABEL,
  OA_BIZ_RISK_LEVEL_OPTIONS,
  OA_BIZ_SEQ_STATUS_LABEL,
  OA_BIZ_SEQ_STATUS_OPTIONS,
  type OaBizCustomerCreditSaveParams,
  type OaBizDeliveryCoordinationSaveParams,
  type OaBizFlowItem,
  type OaBizPriceApprovalSaveParams,
  type OaBizProductionSequenceSaveParams,
  type OaBizWorkshopDailySaveParams,
} from '@/types/oa';

const { Text } = Typography;
const { Title } = Typography;

const SALES_LIST = 'oa:biz:sales:list';
const SALES_APPLY = 'oa:biz:sales:apply';
const SALES_MANAGE = 'oa:biz:sales:manage';

const seqStatusTag = bizStatusTag(OA_BIZ_SEQ_STATUS_LABEL);
const dailyStatusTag = bizStatusTag(OA_BIZ_DAILY_REPORT_STATUS_LABEL);

/* ---------------- 1. 客户授信（OA-DEV-062） ---------------- */

interface CreditFormValues extends BizSubmitValue {
  customerCode?: string;
  customerName?: string;
  creditType?: string;
  applyAmount?: number;
  creditLimit?: number;
  currency?: string;
  creditDays?: number;
  validFrom?: Dayjs;
  validTo?: Dayjs;
  riskLevel?: string;
  riskOpinion?: string;
  remark?: string;
}

function CreditTab() {
  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '授信单号', dataIndex: 'creditNo', width: 150, fixed: 'left', render: plain },
    { title: '客户名称', dataIndex: 'customerName', width: 180, render: plain },
    { title: '授信类型', dataIndex: 'creditType', width: 110, render: (v) => enumLabel(OA_BIZ_CREDIT_TYPE_LABEL, v) },
    { title: '申请额度', dataIndex: 'applyAmount', width: 120, render: plain },
    { title: '授信额度', dataIndex: 'creditLimit', width: 120, render: plain },
    { title: '币种', dataIndex: 'currency', width: 80, render: plain },
    { title: '账期(天)', dataIndex: 'creditDays', width: 90, render: plain },
    { title: '风险等级', dataIndex: 'riskLevel', width: 100, render: (v) => enumLabel(OA_BIZ_RISK_LEVEL_LABEL, v) },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaBizCustomerCreditSaveParams, CreditFormValues>
      title="客户授信"
      service={oaBizCreditService}
      columns={columns}
      listPerm={SALES_LIST}
      applyPerm={SALES_APPLY}
      initialValues={{ creditType: 'NEW', currency: 'CNY' }}
      detailFields={[
        { label: '授信单号', key: 'creditNo' },
        { label: '客户编码', key: 'customerCode' },
        { label: '客户名称', key: 'customerName' },
        { label: '授信类型', key: 'creditType', render: (v) => enumLabel(OA_BIZ_CREDIT_TYPE_LABEL, v) },
        { label: '申请额度', key: 'applyAmount' },
        { label: '授信额度', key: 'creditLimit' },
        { label: '币种', key: 'currency' },
        { label: '账期(天)', key: 'creditDays' },
        { label: '有效期起', key: 'validFrom' },
        { label: '有效期止', key: 'validTo' },
        { label: '风险等级', key: 'riskLevel', render: (v) => enumLabel(OA_BIZ_RISK_LEVEL_LABEL, v) },
        { label: '风险意见', key: 'riskOpinion' },
        { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={() => (
        <>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]}>
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item name="creditType" label="授信类型" rules={[{ required: true, message: '请选择授信类型' }]}>
            <Select placeholder="请选择" options={[...OA_BIZ_CREDIT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="applyAmount" label="申请额度">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入申请额度" />
          </Form.Item>
          <Form.Item name="creditLimit" label="授信额度">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入授信额度" />
          </Form.Item>
          <Form.Item name="currency" label="币种">
            <Input placeholder="如 CNY" />
          </Form.Item>
          <Form.Item name="creditDays" label="账期(天)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入账期" />
          </Form.Item>
          <Form.Item name="validFrom" label="有效期起">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="validTo" label="有效期止">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="riskLevel" label="风险等级">
            <Select placeholder="请选择" allowClear options={[...OA_BIZ_RISK_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="riskOpinion" label="风险意见">
            <Input.TextArea rows={2} placeholder="请输入风险意见" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        customerCode: r.customerCode,
        customerName: r.customerName,
        creditType: r.creditType,
        applyAmount: r.applyAmount,
        creditLimit: r.creditLimit,
        currency: r.currency,
        creditDays: r.creditDays,
        validFrom: r.validFrom ? dayjs(r.validFrom) : undefined,
        validTo: r.validTo ? dayjs(r.validTo) : undefined,
        riskLevel: r.riskLevel,
        riskOpinion: r.riskOpinion,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        customerCode: v.customerCode,
        customerName: v.customerName,
        creditType: v.creditType,
        applyAmount: v.applyAmount,
        creditLimit: v.creditLimit,
        currency: v.currency,
        creditDays: v.creditDays,
        validFrom: v.validFrom ? v.validFrom.format(DATE_FORMAT) : undefined,
        validTo: v.validTo ? v.validTo.format(DATE_FORMAT) : undefined,
        riskLevel: v.riskLevel,
        riskOpinion: v.riskOpinion,
        remark: v.remark,
        submit: v.submit,
      })}
    />
  );
}

/* ---------------- 2. 价格审批（OA-DEV-063/071） ---------------- */

interface PriceFormValues extends BizSubmitValue {
  priceCategory?: string;
  changeType?: string;
  materialCode?: string;
  materialName?: string;
  customerCode?: string;
  customerName?: string;
  supplierCode?: string;
  supplierName?: string;
  priceAmount?: number;
  oldPrice?: number;
  currency?: string;
  priceUnit?: string;
  effectiveFrom?: Dayjs;
  effectiveTo?: Dayjs;
  costBasis?: string;
  remark?: string;
}

function PriceTab() {
  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '价格单号', dataIndex: 'priceNo', width: 150, fixed: 'left', render: plain },
    { title: '价格类别', dataIndex: 'priceCategory', width: 110, render: (v) => enumLabel(OA_BIZ_PRICE_CATEGORY_LABEL, v) },
    { title: '变更类型', dataIndex: 'changeType', width: 100, render: (v) => enumLabel(OA_BIZ_PRICE_CHANGE_TYPE_LABEL, v) },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '供应商', dataIndex: 'supplierName', width: 150, render: plain },
    { title: '客户', dataIndex: 'customerName', width: 150, render: plain },
    { title: '新价格', dataIndex: 'priceAmount', width: 110, render: plain },
    { title: '原价格', dataIndex: 'oldPrice', width: 110, render: plain },
    { title: '生效起', dataIndex: 'effectiveFrom', width: 120, render: plain },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaBizPriceApprovalSaveParams, PriceFormValues>
      title="价格审批"
      service={oaBizPriceService}
      columns={columns}
      listPerm={SALES_LIST}
      applyPerm={SALES_APPLY}
      initialValues={{ priceCategory: 'PART', changeType: 'NEW', currency: 'CNY' }}
      detailFields={[
        { label: '价格单号', key: 'priceNo' },
        { label: '价格类别', key: 'priceCategory', render: (v) => enumLabel(OA_BIZ_PRICE_CATEGORY_LABEL, v) },
        { label: '变更类型', key: 'changeType', render: (v) => enumLabel(OA_BIZ_PRICE_CHANGE_TYPE_LABEL, v) },
        { label: '物料编码', key: 'materialCode' },
        { label: '物料名称', key: 'materialName' },
        { label: '客户', key: 'customerName' },
        { label: '供应商', key: 'supplierName' },
        { label: '新价格', key: 'priceAmount' },
        { label: '原价格', key: 'oldPrice' },
        { label: '币种', key: 'currency' },
        { label: '计价单位', key: 'priceUnit' },
        { label: '生效起', key: 'effectiveFrom' },
        { label: '生效止', key: 'effectiveTo' },
        { label: '成本依据', key: 'costBasis' },
        { label: '审批意见', key: 'approvalOpinion' },
        { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={() => (
        <>
          <Form.Item name="priceCategory" label="价格类别" rules={[{ required: true, message: '请选择价格类别' }]}>
            <Select placeholder="请选择" options={[...OA_BIZ_PRICE_CATEGORY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="changeType" label="变更类型" rules={[{ required: true, message: '请选择变更类型' }]}>
            <Select placeholder="请选择" options={[...OA_BIZ_PRICE_CHANGE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称">
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="priceAmount" label="新价格">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入新价格" />
          </Form.Item>
          <Form.Item name="oldPrice" label="原价格">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入原价格" />
          </Form.Item>
          <Form.Item name="currency" label="币种">
            <Input placeholder="如 CNY" />
          </Form.Item>
          <Form.Item name="priceUnit" label="计价单位">
            <Input placeholder="如 元/件" />
          </Form.Item>
          <Form.Item name="effectiveFrom" label="生效起">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="effectiveTo" label="生效止">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="costBasis" label="成本依据">
            <Input.TextArea rows={2} placeholder="请输入成本依据" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        priceCategory: r.priceCategory,
        changeType: r.changeType,
        materialCode: r.materialCode,
        materialName: r.materialName,
        customerCode: r.customerCode,
        customerName: r.customerName,
        supplierCode: r.supplierCode,
        supplierName: r.supplierName,
        priceAmount: r.priceAmount,
        oldPrice: r.oldPrice,
        currency: r.currency,
        priceUnit: r.priceUnit,
        effectiveFrom: r.effectiveFrom ? dayjs(r.effectiveFrom) : undefined,
        effectiveTo: r.effectiveTo ? dayjs(r.effectiveTo) : undefined,
        costBasis: r.costBasis,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        priceCategory: v.priceCategory,
        changeType: v.changeType,
        materialCode: v.materialCode,
        materialName: v.materialName,
        customerCode: v.customerCode,
        customerName: v.customerName,
        supplierCode: v.supplierCode,
        supplierName: v.supplierName,
        priceAmount: v.priceAmount,
        oldPrice: v.oldPrice,
        currency: v.currency,
        priceUnit: v.priceUnit,
        effectiveFrom: v.effectiveFrom ? v.effectiveFrom.format(DATE_FORMAT) : undefined,
        effectiveTo: v.effectiveTo ? v.effectiveTo.format(DATE_FORMAT) : undefined,
        costBasis: v.costBasis,
        remark: v.remark,
        submit: v.submit,
      })}
    />
  );
}

/* ---------------- 3. 交期延误协调（OA-DEV-064） ---------------- */

interface DeliveryFormValues extends BizSubmitValue {
  orderNo?: string;
  customerCode?: string;
  customerName?: string;
  materialCode?: string;
  materialName?: string;
  demandQty?: number;
  originalDelivery?: Dayjs;
  promisedDelivery?: Dayjs;
  delayReason?: string;
  capacityNote?: string;
  shortageReason?: string;
  responsibleDept?: string;
  responsibleUserId?: number;
  correctiveAction?: string;
  remark?: string;
}

function DeliveryTab() {
  const handleClose = async (record: OaBizFlowItem, reload: () => void) => {
    await oaBizDeliveryService.close(record.id, record.correctiveAction);
    message.success('已闭环');
    reload();
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '协调单号', dataIndex: 'coordNo', width: 150, fixed: 'left', render: plain },
    { title: '订单号', dataIndex: 'orderNo', width: 150, render: plain },
    { title: '客户', dataIndex: 'customerName', width: 150, render: plain },
    { title: '需求数量', dataIndex: 'demandQty', width: 100, render: plain },
    { title: '原交期', dataIndex: 'originalDelivery', width: 120, render: plain },
    { title: '承诺交期', dataIndex: 'promisedDelivery', width: 120, render: plain },
    { title: '延期天数', dataIndex: 'delayDays', width: 100, render: plain },
    { title: '闭环状态', dataIndex: 'closeStatus', width: 110, render: (v) => enumLabel(OA_BIZ_COORD_CLOSE_STATUS_LABEL, v) },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaBizDeliveryCoordinationSaveParams, DeliveryFormValues>
      title="交期延误协调"
      service={oaBizDeliveryService}
      columns={columns}
      listPerm={SALES_LIST}
      applyPerm={SALES_APPLY}
      managePerm={SALES_MANAGE}
      extraActions={(record, reload) =>
        record.closeStatus !== 'CLOSED' ? (
          <Popconfirm title="确认将该协调单闭环？" onConfirm={() => void handleClose(record, reload)}>
            <Button type="link" size="small">
              闭环
            </Button>
          </Popconfirm>
        ) : null
      }
      detailFields={[
        { label: '协调单号', key: 'coordNo' },
        { label: '订单号', key: 'orderNo' },
        { label: '客户', key: 'customerName' },
        { label: '物料编码', key: 'materialCode' },
        { label: '物料名称', key: 'materialName' },
        { label: '需求数量', key: 'demandQty' },
        { label: '原交期', key: 'originalDelivery' },
        { label: '承诺交期', key: 'promisedDelivery' },
        { label: '延期天数', key: 'delayDays' },
        { label: '延期原因', key: 'delayReason' },
        { label: '产能说明', key: 'capacityNote' },
        { label: '缺料原因', key: 'shortageReason' },
        { label: '责任部门', key: 'responsibleDept' },
        { label: '责任人', key: 'responsibleName' },
        { label: '纠正措施', key: 'correctiveAction' },
        { label: '闭环状态', key: 'closeStatus', render: (v) => enumLabel(OA_BIZ_COORD_CLOSE_STATUS_LABEL, v) },
        { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={(_form, editing) => (
        <>
          <Form.Item name="orderNo" label="订单号">
            <Input placeholder="请输入订单号" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称">
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="demandQty" label="需求数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入需求数量" />
          </Form.Item>
          <Form.Item name="originalDelivery" label="原交期">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="promisedDelivery" label="承诺交期">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="delayReason" label="延期原因">
            <Input.TextArea rows={2} placeholder="请输入延期原因" />
          </Form.Item>
          <Form.Item name="capacityNote" label="产能说明">
            <Input.TextArea rows={2} placeholder="请输入产能说明" />
          </Form.Item>
          <Form.Item name="shortageReason" label="缺料原因">
            <Input.TextArea rows={2} placeholder="请输入缺料原因" />
          </Form.Item>
          <Form.Item name="responsibleDept" label="责任部门">
            <Input placeholder="请输入责任部门" />
          </Form.Item>
          <Form.Item name="responsibleUserId" label="责任人">
            <UserSelect style={{ width: '100%' }} fallbackLabel={editing?.responsibleName} />
          </Form.Item>
          <Form.Item name="correctiveAction" label="纠正措施">
            <Input.TextArea rows={2} placeholder="请输入纠正措施" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        orderNo: r.orderNo,
        customerCode: r.customerCode,
        customerName: r.customerName,
        materialCode: r.materialCode,
        materialName: r.materialName,
        demandQty: r.demandQty,
        originalDelivery: r.originalDelivery ? dayjs(r.originalDelivery) : undefined,
        promisedDelivery: r.promisedDelivery ? dayjs(r.promisedDelivery) : undefined,
        delayReason: r.delayReason,
        capacityNote: r.capacityNote,
        shortageReason: r.shortageReason,
        responsibleDept: r.responsibleDept,
        responsibleUserId: r.responsibleUserId,
        correctiveAction: r.correctiveAction,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        orderNo: v.orderNo,
        customerCode: v.customerCode,
        customerName: v.customerName,
        materialCode: v.materialCode,
        materialName: v.materialName,
        demandQty: v.demandQty,
        originalDelivery: v.originalDelivery ? v.originalDelivery.format(DATE_FORMAT) : undefined,
        promisedDelivery: v.promisedDelivery ? v.promisedDelivery.format(DATE_FORMAT) : undefined,
        delayReason: v.delayReason,
        capacityNote: v.capacityNote,
        shortageReason: v.shortageReason,
        responsibleDept: v.responsibleDept,
        responsibleUserId: v.responsibleUserId,
        correctiveAction: v.correctiveAction,
        remark: v.remark,
        submit: v.submit,
      })}
    />
  );
}

/* ---------------- 4. 生产顺序表（OA-DEV-065，无流程） ---------------- */

interface SequenceItemValues {
  orderNo?: string;
  materialCode?: string;
  materialName?: string;
  planQty?: number;
  planStart?: Dayjs;
  planEnd?: Dayjs;
  workstation?: string;
  priorityNo?: number;
  remark?: string;
}

interface SequenceFormValues extends BizSubmitValue {
  sequenceName?: string;
  sequenceVersion?: number;
  planPeriod?: string;
  workshop?: string;
  planSource?: string;
  ownerUserId?: number;
  remark?: string;
  items?: SequenceItemValues[];
}

function ProductionSequenceTab() {
  const handlePublish = async (id: number, reload: () => void) => {
    await oaBizProductionSequenceService.publish(id);
    message.success('已发布');
    reload();
  };
  const handleClose = async (id: number, reload: () => void) => {
    await oaBizProductionSequenceService.close(id);
    message.success('已关闭');
    reload();
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '顺序表单号', dataIndex: 'sequenceNo', width: 150, fixed: 'left', render: plain },
    { title: '顺序表名称', dataIndex: 'sequenceName', width: 180, render: plain },
    { title: '版本', dataIndex: 'sequenceVersion', width: 80, render: plain },
    { title: '计划期间', dataIndex: 'planPeriod', width: 120, render: plain },
    { title: '车间', dataIndex: 'workshop', width: 120, render: plain },
    { title: '计划来源', dataIndex: 'planSource', width: 110, render: (v) => enumLabel(OA_BIZ_PLAN_SOURCE_LABEL, v) },
    { title: '明细行数', dataIndex: 'itemCount', width: 100, render: plain },
    { title: '状态', dataIndex: 'seqStatus', width: 100, render: seqStatusTag },
    { title: '发布时间', dataIndex: 'publishTime', width: 160, render: formatDateTime },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaBizProductionSequenceSaveParams, SequenceFormValues>
      title="生产顺序表"
      service={oaBizProductionSequenceService}
      columns={columns}
      listPerm={SALES_LIST}
      applyPerm={SALES_APPLY}
      managePerm={SALES_MANAGE}
      noFlow
      statusLabel="状态"
      statusOptions={OA_BIZ_SEQ_STATUS_OPTIONS}
      formWidth={960}
      initialValues={{ planSource: 'OA' }}
      extraActions={(record, reload) => (
        <>
          {record.seqStatus === 'DRAFT' && (
            <Popconfirm title="确认发布该生产顺序表？" onConfirm={() => void handlePublish(record.id, reload)}>
              <Button type="link" size="small">
                发布
              </Button>
            </Popconfirm>
          )}
          {record.seqStatus === 'PUBLISHED' && (
            <Popconfirm title="确认关闭该生产顺序表？" onConfirm={() => void handleClose(record.id, reload)}>
              <Button type="link" size="small">
                关闭
              </Button>
            </Popconfirm>
          )}
        </>
      )}
      loadEditExtras={async (record) => {
        const items = await oaBizProductionSequenceService.listItems(record.id);
        return {
          items: (items || []).map((it) => ({
            orderNo: it.orderNo,
            materialCode: it.materialCode,
            materialName: it.materialName,
            planQty: it.planQty,
            planStart: it.planStart ? dayjs(it.planStart) : undefined,
            planEnd: it.planEnd ? dayjs(it.planEnd) : undefined,
            workstation: it.workstation,
            priorityNo: it.priorityNo,
            remark: it.remark,
          })),
        };
      }}
      detailFields={[
        { label: '顺序表单号', key: 'sequenceNo' },
        { label: '顺序表名称', key: 'sequenceName' },
        { label: '版本', key: 'sequenceVersion' },
        { label: '计划期间', key: 'planPeriod' },
        { label: '车间', key: 'workshop' },
        { label: '计划来源', key: 'planSource', render: (v) => enumLabel(OA_BIZ_PLAN_SOURCE_LABEL, v) },
        { label: '明细行数', key: 'itemCount' },
        { label: '状态', key: 'seqStatus', render: (v) => seqStatusTag(v) },
        { label: '负责人', key: 'ownerName' },
        { label: '发布时间', key: 'publishTime', render: (v) => formatDateTime(v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={(_form, editing) => (
        <>
          <Text type="secondary">
            生产顺序表承载 OA 侧排产编排，排产权威归属以计划来源为准（默认 OA 维护）。
          </Text>
          <Form.Item
            name="sequenceName"
            label="顺序表名称"
            rules={[{ required: true, message: '请输入顺序表名称' }]}
            style={{ marginTop: 12 }}
          >
            <Input placeholder="请输入顺序表名称" />
          </Form.Item>
          <Form.Item name="sequenceVersion" label="版本">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入版本号" />
          </Form.Item>
          <Form.Item name="planPeriod" label="计划期间">
            <Input placeholder="如 2026-01" />
          </Form.Item>
          <Form.Item name="workshop" label="车间">
            <Input placeholder="请输入车间" />
          </Form.Item>
          <Form.Item name="planSource" label="计划来源">
            <Select placeholder="请选择" options={[...OA_BIZ_PLAN_SOURCE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ownerUserId" label="负责人">
            <UserSelect style={{ width: '100%' }} fallbackLabel={editing?.ownerName} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div>
                <Text strong>明细行</Text>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" wrap style={{ display: 'flex', marginTop: 8 }}>
                    <Form.Item name={[field.name, 'orderNo']}>
                      <Input placeholder="订单号" style={{ width: 130 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'materialCode']}>
                      <Input placeholder="物料编码" style={{ width: 130 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'materialName']}>
                      <Input placeholder="物料名称" style={{ width: 140 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'planQty']}>
                      <InputNumber min={0} placeholder="计划数量" style={{ width: 110 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'planStart']}>
                      <DatePicker placeholder="计划开始" format={DATE_FORMAT} style={{ width: 140 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'planEnd']}>
                      <DatePicker placeholder="计划结束" format={DATE_FORMAT} style={{ width: 140 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'workstation']}>
                      <Input placeholder="工位" style={{ width: 110 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'priorityNo']}>
                      <InputNumber min={0} placeholder="优先级" style={{ width: 90 }} />
                    </Form.Item>
                    <Button type="link" danger onClick={() => remove(field.name)}>
                      删除
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()} style={{ marginTop: 8 }}>
                  添加明细行
                </Button>
              </div>
            )}
          </Form.List>
        </>
      )}
      buildEditValues={(r) => ({
        sequenceName: r.sequenceName,
        sequenceVersion: r.sequenceVersion,
        planPeriod: r.planPeriod,
        workshop: r.workshop,
        planSource: r.planSource,
        ownerUserId: r.ownerUserId,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        sequenceName: v.sequenceName,
        sequenceVersion: v.sequenceVersion,
        planPeriod: v.planPeriod,
        workshop: v.workshop,
        planSource: v.planSource,
        ownerUserId: v.ownerUserId,
        remark: v.remark,
        items: (v.items || []).map((it) => ({
          orderNo: it.orderNo,
          materialCode: it.materialCode,
          materialName: it.materialName,
          planQty: it.planQty,
          planStart: it.planStart ? it.planStart.format(DATE_FORMAT) : undefined,
          planEnd: it.planEnd ? it.planEnd.format(DATE_FORMAT) : undefined,
          workstation: it.workstation,
          priorityNo: it.priorityNo,
          remark: it.remark,
        })),
      })}
    />
  );
}

/* ---------------- 5. 车间生产日报（OA-DEV-067，无流程） ---------------- */

interface DailyFormValues extends BizSubmitValue {
  reportDate?: Dayjs;
  workshop?: string;
  shiftCode?: string;
  deptId?: number;
  deptName?: string;
  planQty?: number;
  outputQty?: number;
  qualifiedQty?: number;
  defectQty?: number;
  downtimeMinutes?: number;
  abnormalDesc?: string;
  dataSource?: string;
  reporterUserId?: number;
  remark?: string;
}

function WorkshopDailyTab() {
  const handleSubmitDaily = async (id: number, reload: () => void) => {
    await oaBizWorkshopDailyService.submit(id);
    message.success('已提交');
    reload();
  };
  const handleConfirm = async (id: number, reload: () => void) => {
    await oaBizWorkshopDailyService.confirm(id);
    message.success('已确认');
    reload();
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '日报单号', dataIndex: 'reportNo', width: 150, fixed: 'left', render: plain },
    { title: '日报日期', dataIndex: 'reportDate', width: 120, render: plain },
    { title: '车间', dataIndex: 'workshop', width: 120, render: plain },
    { title: '班次', dataIndex: 'shiftCode', width: 90, render: plain },
    { title: '计划数量', dataIndex: 'planQty', width: 100, render: plain },
    { title: '产出数量', dataIndex: 'outputQty', width: 100, render: plain },
    { title: '合格数量', dataIndex: 'qualifiedQty', width: 100, render: plain },
    { title: '不良数量', dataIndex: 'defectQty', width: 100, render: plain },
    { title: '数据来源', dataIndex: 'dataSource', width: 110, render: (v) => enumLabel(OA_BIZ_DATA_SOURCE_LABEL, v) },
    { title: '状态', dataIndex: 'reportStatus', width: 100, render: dailyStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaBizWorkshopDailySaveParams, DailyFormValues>
      title="车间生产日报"
      service={oaBizWorkshopDailyService}
      columns={columns}
      listPerm={SALES_LIST}
      applyPerm={SALES_APPLY}
      managePerm={SALES_MANAGE}
      noFlow
      statusLabel="状态"
      statusOptions={OA_BIZ_DAILY_REPORT_STATUS_OPTIONS}
      initialValues={{ dataSource: 'MANUAL' }}
      extraActions={(record, reload) => (
        <>
          {record.reportStatus === 'DRAFT' && (
            <Popconfirm title="确认提交该日报？" onConfirm={() => void handleSubmitDaily(record.id, reload)}>
              <Button type="link" size="small">
                提交
              </Button>
            </Popconfirm>
          )}
          {record.reportStatus === 'SUBMITTED' && (
            <Popconfirm title="确认该日报数据无误？" onConfirm={() => void handleConfirm(record.id, reload)}>
              <Button type="link" size="small">
                确认
              </Button>
            </Popconfirm>
          )}
        </>
      )}
      detailFields={[
        { label: '日报单号', key: 'reportNo' },
        { label: '日报日期', key: 'reportDate' },
        { label: '车间', key: 'workshop' },
        { label: '班次', key: 'shiftCode' },
        { label: '计划数量', key: 'planQty' },
        { label: '产出数量', key: 'outputQty' },
        { label: '合格数量', key: 'qualifiedQty' },
        { label: '不良数量', key: 'defectQty' },
        { label: '达成率', key: 'completeRate' },
        { label: '停机分钟', key: 'downtimeMinutes' },
        { label: '异常说明', key: 'abnormalDesc' },
        { label: '数据来源', key: 'dataSource', render: (v) => enumLabel(OA_BIZ_DATA_SOURCE_LABEL, v) },
        { label: '状态', key: 'reportStatus', render: (v) => dailyStatusTag(v) },
        { label: '填报人', key: 'reporterName' },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={() => (
        <>
          <Text type="secondary">
            本模块登记车间日报并与 MES 生产实绩对账，不篡改 MES 实绩数据。
          </Text>
          <Form.Item
            name="reportDate"
            label="日报日期"
            rules={[{ required: true, message: '请选择日报日期' }]}
            style={{ marginTop: 12 }}
          >
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="workshop" label="车间">
            <Input placeholder="请输入车间" />
          </Form.Item>
          <Form.Item name="shiftCode" label="班次">
            <Input placeholder="如 DAY / NIGHT" />
          </Form.Item>
          <Form.Item name="deptName" label="部门">
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item name="planQty" label="计划数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入计划数量" />
          </Form.Item>
          <Form.Item name="outputQty" label="产出数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入产出数量" />
          </Form.Item>
          <Form.Item name="qualifiedQty" label="合格数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入合格数量" />
          </Form.Item>
          <Form.Item name="defectQty" label="不良数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入不良数量" />
          </Form.Item>
          <Form.Item name="downtimeMinutes" label="停机分钟">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入停机分钟" />
          </Form.Item>
          <Form.Item name="abnormalDesc" label="异常说明">
            <Input.TextArea rows={2} placeholder="请输入异常说明" />
          </Form.Item>
          <Form.Item name="dataSource" label="数据来源">
            <Select placeholder="请选择" options={[...OA_BIZ_DATA_SOURCE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        reportDate: r.reportDate ? dayjs(r.reportDate) : undefined,
        workshop: r.workshop,
        shiftCode: r.shiftCode,
        deptId: r.deptId,
        deptName: r.deptName,
        planQty: r.planQty,
        outputQty: r.outputQty,
        qualifiedQty: r.qualifiedQty,
        defectQty: r.defectQty,
        downtimeMinutes: r.downtimeMinutes,
        abnormalDesc: r.abnormalDesc,
        dataSource: r.dataSource,
        reporterUserId: r.reporterUserId,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        reportDate: v.reportDate ? v.reportDate.format(DATE_FORMAT) : undefined,
        workshop: v.workshop,
        shiftCode: v.shiftCode,
        deptId: v.deptId,
        deptName: v.deptName,
        planQty: v.planQty,
        outputQty: v.outputQty,
        qualifiedQty: v.qualifiedQty,
        defectQty: v.defectQty,
        downtimeMinutes: v.downtimeMinutes,
        abnormalDesc: v.abnormalDesc,
        dataSource: v.dataSource,
        reporterUserId: v.reporterUserId,
        remark: v.remark,
      })}
    />
  );
}

export default function OaBizSalesPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        销售生产流程
      </Title>

      <Tabs
        items={[
          { key: 'credit', label: '客户授信', children: <CreditTab /> },
          { key: 'price', label: '价格审批', children: <PriceTab /> },
          { key: 'delivery', label: '交期延误协调', children: <DeliveryTab /> },
          { key: 'sequence', label: '生产顺序表', children: <ProductionSequenceTab /> },
          { key: 'daily', label: '车间生产日报', children: <WorkshopDailyTab /> },
        ]}
      />
    </Space>
  );
}
