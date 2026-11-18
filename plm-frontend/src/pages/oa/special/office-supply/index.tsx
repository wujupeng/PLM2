import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Tabs,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { oaOfficeSupplyItemService, oaOfficeSupplyService } from '@/services/oaService';
import BizFlowTab, {
  DATE_FORMAT,
  bizFlowStatusTag,
  bizStatusTag,
  enumLabel,
  formatDate,
  formatDateTime,
  plain,
  yesNoLabel,
  type BizSubmitValue,
} from '@/pages/oa/biz/BizFlowTab';
import {
  OA_SUPPLY_ISSUE_STATUS_COLOR,
  OA_SUPPLY_ISSUE_STATUS_LABEL,
  OA_STATUS_OPTIONS,
  type OaBizFlowItem,
  type OaOfficeSupplyItemSaveParams,
  type OaOfficeSupplyRequestItemParams,
  type OaOfficeSupplyRequestSaveParams,
} from '@/types/oa';

const { Text } = Typography;
const { Title } = Typography;

const SUPPLY_LIST = 'oa:supply:list';
const SUPPLY_APPLY = 'oa:supply:apply';
const SUPPLY_MANAGE = 'oa:supply:manage';

const issueStatusTag = bizStatusTag(OA_SUPPLY_ISSUE_STATUS_LABEL, OA_SUPPLY_ISSUE_STATUS_COLOR);

/* ---------------- 1. 办公用品目录（OA-DEV-081，无流程） ---------------- */

interface SupplyItemFormValues extends BizSubmitValue {
  itemCode?: string;
  itemName?: string;
  category?: string;
  specification?: string;
  unit?: string;
  unitPrice?: number;
  stockQty?: number;
  safetyStock?: number;
  needStock?: boolean;
  status?: number;
  remark?: string;
}

function SupplyItemTab() {
  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '用品编码', dataIndex: 'itemCode', width: 150, fixed: 'left', render: plain },
    { title: '用品名称', dataIndex: 'itemName', width: 180, render: plain },
    { title: '分类', dataIndex: 'category', width: 120, render: plain },
    { title: '规格', dataIndex: 'specification', width: 150, render: plain },
    { title: '单位', dataIndex: 'unit', width: 80, render: plain },
    { title: '单价', dataIndex: 'unitPrice', width: 100, render: plain },
    { title: '库存数量', dataIndex: 'stockQty', width: 100, render: plain },
    { title: '安全库存', dataIndex: 'safetyStock', width: 100, render: plain },
    { title: '需库存管理', dataIndex: 'needStock', width: 110, render: (v) => yesNoLabel(v) },
    { title: '状态', dataIndex: 'status', width: 90, render: (v) => enumLabel({ '1': '启用', '0': '停用' }, v) },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaOfficeSupplyItemSaveParams, SupplyItemFormValues>
      title="办公用品"
      service={oaOfficeSupplyItemService}
      columns={columns}
      listPerm={SUPPLY_LIST}
      applyPerm={SUPPLY_MANAGE}
      noFlow
      statusOptions={[]}
      initialValues={{ status: 1, needStock: true }}
      detailFields={[
        { label: '用品编码', key: 'itemCode' },
        { label: '用品名称', key: 'itemName' },
        { label: '分类', key: 'category' },
        { label: '规格', key: 'specification' },
        { label: '单位', key: 'unit' },
        { label: '单价', key: 'unitPrice' },
        { label: '库存数量', key: 'stockQty' },
        { label: '安全库存', key: 'safetyStock' },
        { label: '需库存管理', key: 'needStock', render: (v) => yesNoLabel(v) },
        { label: '状态', key: 'status', render: (v) => enumLabel({ '1': '启用', '0': '停用' }, v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={() => (
        <>
          <Form.Item name="itemCode" label="用品编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="itemName" label="用品名称" rules={[{ required: true, message: '请输入用品名称' }]}>
            <Input placeholder="请输入用品名称" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input placeholder="请输入分类" />
          </Form.Item>
          <Form.Item name="specification" label="规格">
            <Input placeholder="请输入规格" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="如 个 / 盒" />
          </Form.Item>
          <Form.Item name="unitPrice" label="单价">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入单价" />
          </Form.Item>
          <Form.Item name="stockQty" label="库存数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入库存数量" />
          </Form.Item>
          <Form.Item name="safetyStock" label="安全库存">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入安全库存" />
          </Form.Item>
          <Form.Item name="needStock" label="需库存管理" valuePropName="checked">
            <Checkbox>需库存管理</Checkbox>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[...OA_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        itemCode: r.itemCode,
        itemName: r.itemName,
        category: r.category,
        specification: r.specification,
        unit: r.unit,
        unitPrice: r.unitPrice,
        stockQty: r.stockQty,
        safetyStock: r.safetyStock,
        needStock: r.needStock === 1,
        status: r.status,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        itemCode: v.itemCode,
        itemName: v.itemName,
        category: v.category,
        specification: v.specification,
        unit: v.unit,
        unitPrice: v.unitPrice,
        stockQty: v.stockQty,
        safetyStock: v.safetyStock,
        needStock: v.needStock,
        status: v.status,
        remark: v.remark,
      })}
    />
  );
}

/* ---------------- 2. 办公用品申请（OA-DEV-081） ---------------- */

interface SupplyItemRow {
  itemId?: number;
  itemCode?: string;
  itemName?: string;
  unit?: string;
  requestQty?: number;
}

interface SupplyFormValues extends BizSubmitValue {
  requireDate?: Dayjs;
  purpose?: string;
  receiverName?: string;
  remark?: string;
  items?: SupplyItemRow[];
}

function SupplyRequestTab() {
  const [itemOptions, setItemOptions] = useState<OaBizFlowItem[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await oaOfficeSupplyItemService.listEnabled();
      setItemOptions(res || []);
    })();
  }, []);

  const handleIssue = async (id: number, reload: () => void) => {
    await oaOfficeSupplyService.issue(id);
    message.success('已发放');
    reload();
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '申请单号', dataIndex: 'requestNo', width: 150, fixed: 'left', render: plain },
    { title: '用途', dataIndex: 'purpose', width: 200, ellipsis: true, render: plain },
    { title: '需求日期', dataIndex: 'requireDate', width: 120, render: formatDate },
    { title: '领用人', dataIndex: 'receiverName', width: 110, render: plain },
    { title: '明细行数', dataIndex: 'itemCount', width: 100, render: plain },
    { title: '总数量', dataIndex: 'totalQty', width: 100, render: plain },
    { title: '发放状态', dataIndex: 'issueStatus', width: 110, render: issueStatusTag },
    { title: '发放时间', dataIndex: 'issueTime', width: 160, render: formatDateTime },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaOfficeSupplyRequestSaveParams, SupplyFormValues>
      title="办公用品申请"
      service={oaOfficeSupplyService}
      columns={columns}
      listPerm={SUPPLY_LIST}
      applyPerm={SUPPLY_APPLY}
      managePerm={SUPPLY_MANAGE}
      formWidth={900}
      extraActions={(record, reload) =>
        record.issueStatus !== 'ISSUED' && record.flowStatus === 'APPROVED' ? (
          <Popconfirm title="确认发放该申请单？将按明细扣减库存。" onConfirm={() => void handleIssue(record.id, reload)}>
            <Button type="link" size="small">
              发放
            </Button>
          </Popconfirm>
        ) : null
      }
      loadEditExtras={async (record) => {
        const items = await oaOfficeSupplyService.listItems(record.id);
        return {
          items: (items || []).map((it) => ({
            itemId: it.itemId,
            itemCode: it.itemCode,
            itemName: it.itemName,
            unit: it.unit,
            requestQty: it.requestQty ?? it.issueQty,
          })),
        };
      }}
      detailFields={[
        { label: '申请单号', key: 'requestNo' },
        { label: '用途', key: 'purpose' },
        { label: '需求日期', key: 'requireDate', render: (v) => formatDate(v) },
        { label: '领用人', key: 'receiverName' },
        { label: '明细行数', key: 'itemCount' },
        { label: '总数量', key: 'totalQty' },
        { label: '发放状态', key: 'issueStatus', render: (v) => issueStatusTag(v) },
        { label: '发放时间', key: 'issueTime', render: (v) => formatDateTime(v) },
        { label: '发放说明', key: 'issueRemark' },
        { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={(form) => (
        <>
          <Text type="secondary">申请审批通过后由管理岗按明细发放并扣减库存台账。</Text>
          <Form.Item name="purpose" label="用途" rules={[{ required: true, message: '请输入用途' }]} style={{ marginTop: 12 }}>
            <Input placeholder="请输入用途" />
          </Form.Item>
          <Form.Item name="requireDate" label="需求日期">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="receiverName" label="领用人">
            <Input placeholder="请输入领用人" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div>
                <Space style={{ marginBottom: 8 }}>
                  <Text strong>申请明细</Text>
                  <Button size="small" onClick={() => add({ requestQty: 1 })}>
                    添加明细
                  </Button>
                </Space>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" wrap style={{ display: 'flex', marginTop: 8 }}>
                    <Form.Item
                      name={[field.name, 'itemId']}
                      rules={[{ required: true, message: '请选择用品' }]}
                    >
                      <Select
                        style={{ width: 240 }}
                        placeholder="选择用品"
                        showSearch
                        optionFilterProp="label"
                        options={itemOptions.map((it) => ({
                          label: `${it.itemName}（${it.itemCode}）`,
                          value: it.id,
                        }))}
                        onChange={(id) => {
                          const it = itemOptions.find((x) => x.id === id);
                          form.setFieldValue(['items', field.name, 'itemCode'], it?.itemCode);
                          form.setFieldValue(['items', field.name, 'itemName'], it?.itemName);
                          form.setFieldValue(['items', field.name, 'unit'], it?.unit);
                        }}
                      />
                    </Form.Item>
                    <Form.Item name={[field.name, 'itemCode']} hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name={[field.name, 'itemName']} hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name={[field.name, 'unit']} hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, 'requestQty']}
                      rules={[{ required: true, message: '请输入数量' }]}
                    >
                      <InputNumber min={1} placeholder="数量" style={{ width: 120 }} />
                    </Form.Item>
                    <Button type="link" size="small" danger onClick={() => remove(field.name)}>
                      移除
                    </Button>
                  </Space>
                ))}
              </div>
            )}
          </Form.List>
        </>
      )}
      buildEditValues={(r) => ({
        requireDate: r.requireDate ? dayjs(r.requireDate) : undefined,
        purpose: r.purpose,
        receiverName: r.receiverName,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        requireDate: v.requireDate ? v.requireDate.format(DATE_FORMAT) : undefined,
        purpose: v.purpose,
        receiverName: v.receiverName,
        remark: v.remark,
        items: (v.items || []).map<OaOfficeSupplyRequestItemParams>((it) => ({
          itemId: it.itemId,
          itemCode: it.itemCode,
          itemName: it.itemName,
          unit: it.unit,
          requestQty: it.requestQty,
        })),
        submit: v.submit,
      })}
    />
  );
}

export default function OaOfficeSupplyPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        办公用品
      </Title>

      <Tabs
        items={[
          { key: 'items', label: '用品目录', children: <SupplyItemTab /> },
          { key: 'requests', label: '用品申请', children: <SupplyRequestTab /> },
        ]}
      />
    </Space>
  );
}
