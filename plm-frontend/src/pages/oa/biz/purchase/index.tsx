import { Button, DatePicker, Form, Input, InputNumber, Radio, Select, Space, Tabs, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { oaBizOrderVoucherService, oaBizSupplierEvaluationService } from '@/services/oaService';
import BizFlowTab, {
  DATE_FORMAT,
  bizFlowStatusTag,
  enumLabel,
  formatDateTime,
  plain,
  type BizSubmitValue,
} from '@/pages/oa/biz/BizFlowTab';
import {
  OA_BIZ_EVAL_PERIOD_LABEL,
  OA_BIZ_EVAL_PERIOD_OPTIONS,
  OA_BIZ_SUPPLIER_GRADE_LABEL,
  OA_BIZ_VOUCHER_TYPE_LABEL,
  OA_BIZ_VOUCHER_TYPE_OPTIONS,
  OA_YES_NO_OPTIONS,
  type OaBizFlowItem,
  type OaBizOrderVoucherSaveParams,
  type OaBizSupplierEvaluationSaveParams,
} from '@/types/oa';

const { Text } = Typography;
const { Title } = Typography;

const PURCHASE_LIST = 'oa:biz:purchase:list';
const PURCHASE_APPLY = 'oa:biz:purchase:apply';

/* ---------------- 1. 订货传票（OA-DEV-066/071） ---------------- */

interface VoucherFormValues extends BizSubmitValue {
  voucherType?: string;
  importFlag?: number;
  orderNo?: string;
  erpOrderNo?: string;
  customerCode?: string;
  customerName?: string;
  supplierCode?: string;
  supplierName?: string;
  materialCode?: string;
  materialName?: string;
  qty?: number;
  unit?: string;
  deliveryDate?: Dayjs;
  currency?: string;
  amount?: number;
  tradeTerms?: string;
  remark?: string;
}

function OrderVoucherTab() {
  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '传票单号', dataIndex: 'voucherNo', width: 150, fixed: 'left', render: plain },
    { title: '传票类型', dataIndex: 'voucherType', width: 110, render: (v) => enumLabel(OA_BIZ_VOUCHER_TYPE_LABEL, v) },
    { title: '是否导入', dataIndex: 'importFlag', width: 90, render: (v) => (v === null || v === undefined ? '-' : Number(v) === 1 ? '是' : '否') },
    { title: '订单号', dataIndex: 'orderNo', width: 140, render: plain },
    { title: 'ERP 单号', dataIndex: 'erpOrderNo', width: 140, render: plain },
    { title: '客户', dataIndex: 'customerName', width: 140, render: plain },
    { title: '供应商', dataIndex: 'supplierName', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 150, render: plain },
    { title: '数量', dataIndex: 'qty', width: 90, render: plain },
    { title: '交货日期', dataIndex: 'deliveryDate', width: 120, render: plain },
    { title: '金额', dataIndex: 'amount', width: 110, render: plain },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaBizOrderVoucherSaveParams, VoucherFormValues>
      title="订货传票"
      service={oaBizOrderVoucherService}
      columns={columns}
      listPerm={PURCHASE_LIST}
      applyPerm={PURCHASE_APPLY}
      initialValues={{ voucherType: 'PURCHASE', importFlag: 0, currency: 'CNY' }}
      detailFields={[
        { label: '传票单号', key: 'voucherNo' },
        { label: '传票类型', key: 'voucherType', render: (v) => enumLabel(OA_BIZ_VOUCHER_TYPE_LABEL, v) },
        { label: '是否导入', key: 'importFlag', render: (v) => (v === null || v === undefined ? '-' : Number(v) === 1 ? '是' : '否') },
        { label: '订单号', key: 'orderNo' },
        { label: 'ERP 单号', key: 'erpOrderNo' },
        { label: '客户', key: 'customerName' },
        { label: '供应商', key: 'supplierName' },
        { label: '物料编码', key: 'materialCode' },
        { label: '物料名称', key: 'materialName' },
        { label: '数量', key: 'qty' },
        { label: '单位', key: 'unit' },
        { label: '交货日期', key: 'deliveryDate' },
        { label: '币种', key: 'currency' },
        { label: '金额', key: 'amount' },
        { label: '贸易条款', key: 'tradeTerms' },
        { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={() => (
        <>
          <Form.Item name="voucherType" label="传票类型" rules={[{ required: true, message: '请选择传票类型' }]}>
            <Select placeholder="请选择" options={[...OA_BIZ_VOUCHER_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="importFlag" label="是否导入">
            <Radio.Group options={OA_YES_NO_OPTIONS} />
          </Form.Item>
          <Form.Item name="orderNo" label="订单号">
            <Input placeholder="请输入订单号" />
          </Form.Item>
          <Form.Item name="erpOrderNo" label="ERP 单号">
            <Input placeholder="请输入 ERP 单号" />
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
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="qty" label="数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入数量" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="如 件" />
          </Form.Item>
          <Form.Item name="deliveryDate" label="交货日期">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="currency" label="币种">
            <Input placeholder="如 CNY" />
          </Form.Item>
          <Form.Item name="amount" label="金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入金额" />
          </Form.Item>
          <Form.Item name="tradeTerms" label="贸易条款">
            <Input placeholder="请输入贸易条款" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        voucherType: r.voucherType,
        importFlag: r.importFlag,
        orderNo: r.orderNo,
        erpOrderNo: r.erpOrderNo,
        customerCode: r.customerCode,
        customerName: r.customerName,
        supplierCode: r.supplierCode,
        supplierName: r.supplierName,
        materialCode: r.materialCode,
        materialName: r.materialName,
        qty: r.qty,
        unit: r.unit,
        deliveryDate: r.deliveryDate ? dayjs(r.deliveryDate) : undefined,
        currency: r.currency,
        amount: r.amount,
        tradeTerms: r.tradeTerms,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        voucherType: v.voucherType,
        importFlag: v.importFlag,
        orderNo: v.orderNo,
        erpOrderNo: v.erpOrderNo,
        customerCode: v.customerCode,
        customerName: v.customerName,
        supplierCode: v.supplierCode,
        supplierName: v.supplierName,
        materialCode: v.materialCode,
        materialName: v.materialName,
        qty: v.qty,
        unit: v.unit,
        deliveryDate: v.deliveryDate ? v.deliveryDate.format(DATE_FORMAT) : undefined,
        currency: v.currency,
        amount: v.amount,
        tradeTerms: v.tradeTerms,
        remark: v.remark,
        submit: v.submit,
      })}
    />
  );
}

/* ---------------- 2. 供方考评（OA-DEV-068） ---------------- */

interface EvalItemValues {
  itemCode?: string;
  itemName?: string;
  weight?: number;
  maxScore?: number;
  score?: number;
  scoreBasis?: string;
  remark?: string;
}

interface SupplierEvalFormValues extends BizSubmitValue {
  evalPeriod?: string;
  evalYear?: number;
  evalQuarter?: number;
  evalMonth?: number;
  supplierCode?: string;
  supplierName?: string;
  evalBasis?: string;
  evalOpinion?: string;
  remark?: string;
  items?: EvalItemValues[];
}

function SupplierEvaluationTab() {
  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '考评单号', dataIndex: 'evalNo', width: 150, fixed: 'left', render: plain },
    { title: '供应商', dataIndex: 'supplierName', width: 170, render: plain },
    { title: '考评周期', dataIndex: 'evalPeriod', width: 110, render: (v) => enumLabel(OA_BIZ_EVAL_PERIOD_LABEL, v) },
    { title: '考评年份', dataIndex: 'evalYear', width: 100, render: plain },
    { title: '季度', dataIndex: 'evalQuarter', width: 80, render: plain },
    { title: '月份', dataIndex: 'evalMonth', width: 80, render: plain },
    { title: '总得分', dataIndex: 'totalScore', width: 100, render: plain },
    { title: '等级', dataIndex: 'grade', width: 80, render: (v) => enumLabel(OA_BIZ_SUPPLIER_GRADE_LABEL, v) },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaBizSupplierEvaluationSaveParams, SupplierEvalFormValues>
      title="供方考评"
      service={oaBizSupplierEvaluationService}
      columns={columns}
      listPerm={PURCHASE_LIST}
      applyPerm={PURCHASE_APPLY}
      formWidth={960}
      initialValues={{ evalPeriod: 'QUARTER' }}
      loadEditExtras={async (record) => {
        const items = await oaBizSupplierEvaluationService.listItems(record.id);
        return {
          items: (items || []).map((it) => ({
            itemCode: it.itemCode,
            itemName: it.itemName,
            weight: it.weight,
            maxScore: it.maxScore,
            score: it.score,
            scoreBasis: it.scoreBasis,
            remark: it.remark,
          })),
        };
      }}
      detailFields={[
        { label: '考评单号', key: 'evalNo' },
        { label: '供应商编码', key: 'supplierCode' },
        { label: '供应商', key: 'supplierName' },
        { label: '考评周期', key: 'evalPeriod', render: (v) => enumLabel(OA_BIZ_EVAL_PERIOD_LABEL, v) },
        { label: '考评年份', key: 'evalYear' },
        { label: '季度', key: 'evalQuarter' },
        { label: '月份', key: 'evalMonth' },
        { label: '评分项数', key: 'evalItemCount' },
        { label: '总得分', key: 'totalScore' },
        { label: '等级', key: 'grade', render: (v) => enumLabel(OA_BIZ_SUPPLIER_GRADE_LABEL, v) },
        { label: '考评依据', key: 'evalBasis' },
        { label: '考评意见', key: 'evalOpinion' },
        { label: '考评人', key: 'evaluatorName' },
        { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={() => (
        <>
          <Form.Item name="evalPeriod" label="考评周期" rules={[{ required: true, message: '请选择考评周期' }]}>
            <Select placeholder="请选择" options={[...OA_BIZ_EVAL_PERIOD_OPTIONS]} />
          </Form.Item>
          <Form.Item name="evalYear" label="考评年份">
            <InputNumber min={2000} max={2100} style={{ width: '100%' }} placeholder="如 2026" />
          </Form.Item>
          <Form.Item name="evalQuarter" label="季度">
            <InputNumber min={1} max={4} style={{ width: '100%' }} placeholder="1-4" />
          </Form.Item>
          <Form.Item name="evalMonth" label="月份">
            <InputNumber min={1} max={12} style={{ width: '100%' }} placeholder="1-12" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称" rules={[{ required: true, message: '请输入供应商名称' }]}>
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="evalBasis" label="考评依据">
            <Input.TextArea rows={2} placeholder="请输入考评依据" />
          </Form.Item>
          <Form.Item name="evalOpinion" label="考评意见">
            <Input.TextArea rows={2} placeholder="请输入考评意见" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div>
                <Text strong>评分项</Text>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" wrap style={{ display: 'flex', marginTop: 8 }}>
                    <Form.Item name={[field.name, 'itemCode']}>
                      <Input placeholder="评分项编码" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'itemName']}>
                      <Input placeholder="评分项名称" style={{ width: 150 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'weight']}>
                      <InputNumber min={0} placeholder="权重" style={{ width: 100 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'maxScore']}>
                      <InputNumber min={0} placeholder="满分" style={{ width: 100 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'score']}>
                      <InputNumber min={0} placeholder="得分" style={{ width: 100 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'scoreBasis']}>
                      <Input placeholder="评分依据" style={{ width: 150 }} />
                    </Form.Item>
                    <Button type="link" danger onClick={() => remove(field.name)}>
                      删除
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()} style={{ marginTop: 8 }}>
                  添加评分项
                </Button>
              </div>
            )}
          </Form.List>
        </>
      )}
      buildEditValues={(r) => ({
        evalPeriod: r.evalPeriod,
        evalYear: r.evalYear,
        evalQuarter: r.evalQuarter,
        evalMonth: r.evalMonth,
        supplierCode: r.supplierCode,
        supplierName: r.supplierName,
        evalBasis: r.evalBasis,
        evalOpinion: r.evalOpinion,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        evalPeriod: v.evalPeriod,
        evalYear: v.evalYear,
        evalQuarter: v.evalQuarter,
        evalMonth: v.evalMonth,
        supplierCode: v.supplierCode,
        supplierName: v.supplierName,
        evalBasis: v.evalBasis,
        evalOpinion: v.evalOpinion,
        remark: v.remark,
        items: (v.items || []).map((it) => ({
          itemCode: it.itemCode,
          itemName: it.itemName,
          weight: it.weight,
          maxScore: it.maxScore,
          score: it.score,
          scoreBasis: it.scoreBasis,
          remark: it.remark,
        })),
        submit: v.submit,
      })}
    />
  );
}

export default function OaBizPurchasePage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        采购流程
      </Title>

      <Tabs
        items={[
          { key: 'voucher', label: '订货传票', children: <OrderVoucherTab /> },
          { key: 'evaluation', label: '供方考评', children: <SupplierEvaluationTab /> },
        ]}
      />
    </Space>
  );
}
