import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { erpInventoryCostService } from '@/services/erpInventoryService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_INVENTORY_COST_METHOD_LABEL,
  ERP_INVENTORY_COST_METHOD_OPTIONS,
  ERP_INVENTORY_COST_STATUS_LABEL,
  ERP_INVENTORY_COST_STATUS_OPTIONS,
  type ErpInventoryCost,
  type ErpInventoryCostQuery,
  type ErpInventoryCostSaveRequest,
} from '@/types/erpInventory';

const { Title } = Typography;

const MANAGE = 'erp:inventory:cost:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpInventoryCostSaveRequest, 'costDate'> & {
  costDate?: Dayjs;
};

export default function ErpInventoryCostPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpInventoryCost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [costMethod, setCostMethod] = useState<string | undefined>(undefined);
  const [costStatus, setCostStatus] = useState<string | undefined>(undefined);
  const [period, setPeriod] = useState('');
  const [materialCode, setMaterialCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      method = costMethod,
      status = costStatus,
      pd = period,
      material = materialCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpInventoryCostQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          costMethod: method,
          costStatus: status,
          period: pd || undefined,
          materialCode: material || undefined,
        };
        const res = await erpInventoryCostService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, costMethod, costStatus, period, materialCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ costMethod: 'MOVING_AVG', costStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpInventoryCost) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      costDate: record.costDate ? dayjs(record.costDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpInventoryCostSaveRequest = {
        ...values,
        costDate: values.costDate ? values.costDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpInventoryCostService.create(payload);
        message.success('成本单已创建');
      } else {
        await erpInventoryCostService.update(editId, payload);
        message.success('成本单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpInventoryCostService.remove(id);
    message.success('成本单已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpInventoryCost> = [
    { title: '成本单号', dataIndex: 'costNo', width: 170, fixed: 'left', render: plain },
    {
      title: '成本方式',
      dataIndex: 'costMethod',
      width: 110,
      render: (v) => statusTag(ERP_INVENTORY_COST_METHOD_LABEL, v),
    },
    { title: '期间', dataIndex: 'period', width: 100, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 130, render: plain },
    { title: '期初数量', dataIndex: 'beginQty', width: 110, render: plain },
    { title: '期初金额', dataIndex: 'beginAmount', width: 120, render: plain },
    { title: '入库数量', dataIndex: 'inQty', width: 110, render: plain },
    { title: '入库金额', dataIndex: 'inAmount', width: 120, render: plain },
    { title: '出库数量', dataIndex: 'outQty', width: 110, render: plain },
    { title: '出库金额', dataIndex: 'outAmount', width: 120, render: plain },
    { title: '期末数量', dataIndex: 'endQty', width: 110, render: plain },
    { title: '期末金额', dataIndex: 'endAmount', width: 120, render: plain },
    { title: '平均成本', dataIndex: 'avgCost', width: 120, render: plain },
    { title: '核算人', dataIndex: 'costBy', width: 120, render: plain },
    { title: '核算日期', dataIndex: 'costDate', width: 170, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '成本状态',
      dataIndex: 'costStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_INVENTORY_COST_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该成本单？" onConfirm={() => record.id != null && void remove(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        库存成本
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="成本方式">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={costMethod}
              onChange={(v) => setCostMethod(v)}
              options={[...ERP_INVENTORY_COST_METHOD_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="成本状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={costStatus}
              onChange={(v) => setCostStatus(v)}
              options={[...ERP_INVENTORY_COST_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="期间">
            <Input
              placeholder="如 2026-11"
              allowClear
              style={{ width: 130 }}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="物料编码">
            <Input
              placeholder="请输入物料编码"
              allowClear
              style={{ width: 160 }}
              value={materialCode}
              onChange={(e) => setMaterialCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="成本单号 / 物料编码 / 物料名称"
              allowClear
              style={{ width: 240 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, costMethod, costStatus, period, materialCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setCostMethod(undefined);
                  setCostStatus(undefined);
                  setPeriod('');
                  setMaterialCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建成本单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`库存成本（共 ${total} 条）`}>
        <Table<ErpInventoryCost>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 3000 }}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, size) => {
              setPageNum(page);
              setPageSize(size);
              void loadData(page, size);
            },
          }}
        />
      </Card>

      <Modal
        title={editId == null ? '新建成本单' : '编辑成本单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="costNo" label="成本单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="costMethod" label="成本方式">
            <Select placeholder="为空默认 MOVING_AVG" options={[...ERP_INVENTORY_COST_METHOD_OPTIONS]} />
          </Form.Item>
          <Form.Item name="period" label="期间">
            <Input placeholder="如 2026-11" />
          </Form.Item>
          <Form.Item
            name="materialCode"
            label="物料编码"
            rules={[{ required: true, message: '请输入物料编码' }]}
          >
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="uom" label="单位">
            <Input placeholder="为空默认 PCS" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="beginQty" label="期初数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入期初数量" />
          </Form.Item>
          <Form.Item name="beginAmount" label="期初金额">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入期初金额" />
          </Form.Item>
          <Form.Item name="inQty" label="入库数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入入库数量" />
          </Form.Item>
          <Form.Item name="inAmount" label="入库金额">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入入库金额" />
          </Form.Item>
          <Form.Item name="outQty" label="出库数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入出库数量" />
          </Form.Item>
          <Form.Item name="outAmount" label="出库金额">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入出库金额" />
          </Form.Item>
          <Form.Item name="endQty" label="期末数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入期末数量" />
          </Form.Item>
          <Form.Item name="endAmount" label="期末金额">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入期末金额" />
          </Form.Item>
          <Form.Item name="avgCost" label="平均成本">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入平均成本" />
          </Form.Item>
          <Form.Item name="costBy" label="核算人">
            <Input placeholder="请输入核算人" />
          </Form.Item>
          <Form.Item name="costDate" label="核算日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择核算日期" />
          </Form.Item>
          <Form.Item name="costStatus" label="成本状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_INVENTORY_COST_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
