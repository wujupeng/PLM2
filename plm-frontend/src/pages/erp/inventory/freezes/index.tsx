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
import { erpInventoryFreezeService } from '@/services/erpInventoryService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_INVENTORY_FREEZE_STATUS_LABEL,
  ERP_INVENTORY_FREEZE_STATUS_OPTIONS,
  ERP_INVENTORY_FREEZE_TYPE_LABEL,
  ERP_INVENTORY_FREEZE_TYPE_OPTIONS,
  type ErpInventoryFreeze,
  type ErpInventoryFreezeQuery,
  type ErpInventoryFreezeSaveRequest,
} from '@/types/erpInventory';

const { Title } = Typography;

const MANAGE = 'erp:inventory:freeze:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpInventoryFreezeSaveRequest, 'freezeDate' | 'unfreezeDate'> & {
  freezeDate?: Dayjs;
  unfreezeDate?: Dayjs;
};

export default function ErpInventoryFreezePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpInventoryFreeze[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [freezeType, setFreezeType] = useState<string | undefined>(undefined);
  const [freezeStatus, setFreezeStatus] = useState<string | undefined>(undefined);
  const [warehouseCode, setWarehouseCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = freezeType,
      status = freezeStatus,
      warehouse = warehouseCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpInventoryFreezeQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          freezeType: type,
          freezeStatus: status,
          warehouseCode: warehouse || undefined,
        };
        const res = await erpInventoryFreezeService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, freezeType, freezeStatus, warehouseCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ freezeType: 'MANUAL', freezeStatus: 'FROZEN' });
    setOpen(true);
  };

  const openEdit = (record: ErpInventoryFreeze) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      freezeDate: record.freezeDate ? dayjs(record.freezeDate) : undefined,
      unfreezeDate: record.unfreezeDate ? dayjs(record.unfreezeDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpInventoryFreezeSaveRequest = {
        ...values,
        freezeDate: values.freezeDate ? values.freezeDate.format(DATETIME_FORMAT) : undefined,
        unfreezeDate: values.unfreezeDate ? values.unfreezeDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpInventoryFreezeService.create(payload);
        message.success('冻结单已创建');
      } else {
        await erpInventoryFreezeService.update(editId, payload);
        message.success('冻结单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpInventoryFreezeService.remove(id);
    message.success('冻结单已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpInventoryFreeze> = [
    { title: '冻结单号', dataIndex: 'freezeNo', width: 170, fixed: 'left', render: plain },
    {
      title: '冻结类型',
      dataIndex: 'freezeType',
      width: 110,
      render: (v) => statusTag(ERP_INVENTORY_FREEZE_TYPE_LABEL, v),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 130, render: plain },
    { title: '库位', dataIndex: 'locationCode', width: 120, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 140, render: plain },
    { title: '冻结数量', dataIndex: 'freezeQty', width: 110, render: plain },
    { title: '冻结原因', dataIndex: 'freezeReason', width: 180, ellipsis: true, render: plain },
    { title: '冻结人', dataIndex: 'freezeBy', width: 120, render: plain },
    { title: '冻结日期', dataIndex: 'freezeDate', width: 170, render: formatDateTime },
    { title: '解冻日期', dataIndex: 'unfreezeDate', width: 170, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '冻结状态',
      dataIndex: 'freezeStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_INVENTORY_FREEZE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该冻结单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        库存冻结
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="冻结类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={freezeType}
              onChange={(v) => setFreezeType(v)}
              options={[...ERP_INVENTORY_FREEZE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="冻结状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={freezeStatus}
              onChange={(v) => setFreezeStatus(v)}
              options={[...ERP_INVENTORY_FREEZE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="仓库编码">
            <Input
              placeholder="请输入仓库编码"
              allowClear
              style={{ width: 160 }}
              value={warehouseCode}
              onChange={(e) => setWarehouseCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="冻结单号 / 物料编码 / 物料名称"
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
                  void loadData(1, pageSize, keyword, freezeType, freezeStatus, warehouseCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setFreezeType(undefined);
                  setFreezeStatus(undefined);
                  setWarehouseCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建冻结单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`库存冻结（共 ${total} 条）`}>
        <Table<ErpInventoryFreeze>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2800 }}
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
        title={editId == null ? '新建冻结单' : '编辑冻结单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="freezeNo" label="冻结单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="freezeType" label="冻结类型">
            <Select placeholder="为空默认 MANUAL" options={[...ERP_INVENTORY_FREEZE_TYPE_OPTIONS]} />
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
          <Form.Item name="locationCode" label="库位">
            <Input placeholder="请输入库位" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="freezeQty" label="冻结数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入冻结数量" />
          </Form.Item>
          <Form.Item name="freezeReason" label="冻结原因">
            <Input.TextArea rows={2} placeholder="请输入冻结原因" />
          </Form.Item>
          <Form.Item name="freezeBy" label="冻结人">
            <Input placeholder="请输入冻结人" />
          </Form.Item>
          <Form.Item name="freezeDate" label="冻结日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择冻结日期" />
          </Form.Item>
          <Form.Item name="unfreezeDate" label="解冻日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择解冻日期" />
          </Form.Item>
          <Form.Item name="freezeStatus" label="冻结状态">
            <Select placeholder="为空默认 FROZEN" options={[...ERP_INVENTORY_FREEZE_STATUS_OPTIONS]} />
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
