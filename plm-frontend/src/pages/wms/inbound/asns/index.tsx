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
import { wmsAsnService as service } from '@/services/wmsInboundService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_ASN_STATUS_LABEL,
  WMS_ASN_STATUS_OPTIONS,
  WMS_ASN_TYPE_LABEL,
  WMS_ASN_TYPE_OPTIONS,
  type WmsAsn,
  type WmsAsnQuery,
  type WmsAsnSaveRequest,
} from '@/types/wmsInbound';

const { Title } = Typography;

const MANAGE = 'wms:inbound:asn:manage';

type FormValues = Omit<WmsAsnSaveRequest, 'expectedArrivalDate'> & {
  expectedArrivalDate?: Dayjs;
};

export default function WmsAsnPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsAsn[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [asnType, setAsnType] = useState<string | undefined>(undefined);
  const [asnStatus, setAsnStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = asnType,
      status = asnStatus,
    ) => {
      setLoading(true);
      try {
        const params: WmsAsnQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          asnType: type,
          asnStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, asnType, asnStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ asnType: 'PURCHASE', asnStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: WmsAsn) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      expectedArrivalDate: record.expectedArrivalDate ? dayjs(record.expectedArrivalDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsAsnSaveRequest = {
        ...values,
        expectedArrivalDate: values.expectedArrivalDate
          ? values.expectedArrivalDate.format(DATE_FORMAT)
          : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('收货通知已创建');
      } else {
        await service.update(editId, payload);
        message.success('收货通知已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('收货通知已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsAsn> = [
    { title: 'ASN 单号', dataIndex: 'asnNo', width: 190, fixed: 'left', render: plain },
    {
      title: 'ASN 类型',
      dataIndex: 'asnType',
      width: 110,
      render: (v) => statusTag(WMS_ASN_TYPE_LABEL, v),
    },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 170, render: plain },
    { title: '采购/委外单号', dataIndex: 'poNo', width: 160, render: plain },
    { title: '预计到货', dataIndex: 'expectedArrivalDate', width: 120, render: formatDate },
    { title: '承运商', dataIndex: 'carrier', width: 120, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 130, render: plain },
    { title: '通知数量', dataIndex: 'totalQty', width: 100, render: plain },
    { title: '已收数量', dataIndex: 'receivedQty', width: 100, render: plain },
    {
      title: 'ASN 状态',
      dataIndex: 'asnStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_ASN_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该收货通知？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        收货通知
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="ASN 类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={asnType}
              onChange={(v) => setAsnType(v)}
              options={[...WMS_ASN_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="ASN 状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={asnStatus}
              onChange={(v) => setAsnStatus(v)}
              options={[...WMS_ASN_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="ASN 单号 / 供应商 / 采购单号"
              allowClear
              style={{ width: 280 }}
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
                  void loadData(1, pageSize, keyword, asnType, asnStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setAsnType(undefined);
                  setAsnStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建收货通知</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`收货通知（共 ${total} 条）`}>
        <Table<WmsAsn>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2000 }}
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
        title={editId == null ? '新建收货通知' : '编辑收货通知'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="asnNo" label="ASN 单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="asnType" label="ASN 类型">
            <Select placeholder="为空默认 PURCHASE" options={[...WMS_ASN_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item
            name="supplierCode"
            label="供应商编码"
            rules={[{ required: true, message: '请输入供应商编码' }]}
          >
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="poNo" label="采购/委外单号">
            <Input placeholder="请输入采购/委外单号" />
          </Form.Item>
          <Form.Item name="expectedArrivalDate" label="预计到货日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="carrier" label="承运商">
            <Input placeholder="请输入承运商" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="totalQty" label="通知数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="receivedQty" label="已收数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="asnStatus" label="ASN 状态">
            <Select placeholder="为空默认 DRAFT" options={[...WMS_ASN_STATUS_OPTIONS]} />
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
