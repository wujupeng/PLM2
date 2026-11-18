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
import { wmsStockFreezeService as service } from '@/services/wmsInventoryService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_FREEZE_STATUS_LABEL,
  WMS_FREEZE_STATUS_OPTIONS,
  WMS_FREEZE_TYPE_LABEL,
  WMS_FREEZE_TYPE_OPTIONS,
  type WmsStockFreeze,
  type WmsStockFreezeQuery,
  type WmsStockFreezeSaveRequest,
} from '@/types/wmsInventory';

const { Title } = Typography;

const MANAGE = 'wms:inventory:freeze:manage';

const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<WmsStockFreezeSaveRequest, 'applyTime' | 'releaseTime'> & {
  applyTime?: Dayjs;
  releaseTime?: Dayjs;
};

export default function WmsStockFreezePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsStockFreeze[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [freezeType, setFreezeType] = useState<string | undefined>(undefined);
  const [freezeStatus, setFreezeStatus] = useState<string | undefined>(undefined);
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
    ) => {
      setLoading(true);
      try {
        const params: WmsStockFreezeQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          freezeType: type,
          freezeStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, freezeType, freezeStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ freezeType: 'FREEZE', freezeStatus: 'FROZEN' });
    setOpen(true);
  };

  const openEdit = (record: WmsStockFreeze) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      applyTime: record.applyTime ? dayjs(record.applyTime) : undefined,
      releaseTime: record.releaseTime ? dayjs(record.releaseTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsStockFreezeSaveRequest = {
        ...values,
        applyTime: values.applyTime ? values.applyTime.format(DATETIME_FORMAT) : undefined,
        releaseTime: values.releaseTime ? values.releaseTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('库存冻结单已创建');
      } else {
        await service.update(editId, payload);
        message.success('库存冻结单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('库存冻结单已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsStockFreeze> = [
    { title: '冻结单号', dataIndex: 'freezeNo', width: 190, fixed: 'left', render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 150, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '库位', dataIndex: 'binCode', width: 130, render: plain },
    { title: '冻结数量', dataIndex: 'freezeQty', width: 100, render: plain },
    {
      title: '冻结类型',
      dataIndex: 'freezeType',
      width: 110,
      render: (v) => statusTag(WMS_FREEZE_TYPE_LABEL, v),
    },
    { title: '冻结原因', dataIndex: 'freezeReason', width: 160, render: plain },
    { title: '申请人', dataIndex: 'applyBy', width: 110, render: plain },
    { title: '申请时间', dataIndex: 'applyTime', width: 170, render: formatDateTime },
    { title: '解冻人', dataIndex: 'releaseBy', width: 110, render: plain },
    { title: '解冻时间', dataIndex: 'releaseTime', width: 170, render: formatDateTime },
    {
      title: '冻结状态',
      dataIndex: 'freezeStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_FREEZE_STATUS_LABEL, v),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该库存冻结单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
              style={{ width: 140 }}
              value={freezeType}
              onChange={(v) => setFreezeType(v)}
              options={[...WMS_FREEZE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="冻结状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={freezeStatus}
              onChange={(v) => setFreezeStatus(v)}
              options={[...WMS_FREEZE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="冻结单号 / 物料编码 / 物料名称 / 批次号"
              allowClear
              style={{ width: 300 }}
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
                  void loadData(1, pageSize, keyword, freezeType, freezeStatus);
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
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建库存冻结</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`库存冻结（共 ${total} 条）`}>
        <Table<WmsStockFreeze>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2200 }}
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
        title={editId == null ? '新建库存冻结' : '编辑库存冻结'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="freezeNo" label="冻结单号">
            <Input placeholder="为空自动生成" />
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
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="binCode" label="库位编码">
            <Input placeholder="请输入库位编码" />
          </Form.Item>
          <Form.Item name="freezeQty" label="冻结数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="freezeType" label="冻结类型">
            <Select placeholder="为空默认 FREEZE" options={[...WMS_FREEZE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="freezeReason" label="冻结原因">
            <Input placeholder="请输入冻结原因" />
          </Form.Item>
          <Form.Item name="applyBy" label="申请人">
            <Input placeholder="请输入申请人" />
          </Form.Item>
          <Form.Item name="applyTime" label="申请时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="releaseBy" label="解冻人">
            <Input placeholder="请输入解冻人" />
          </Form.Item>
          <Form.Item name="releaseTime" label="解冻时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="freezeStatus" label="冻结状态">
            <Select placeholder="为空默认 FROZEN" options={[...WMS_FREEZE_STATUS_OPTIONS]} />
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
