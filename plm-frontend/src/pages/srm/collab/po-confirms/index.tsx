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
import { srmPoConfirmationService as service } from '@/services/srmCollabService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_PO_CONFIRM_STATUS_LABEL,
  SRM_PO_CONFIRM_STATUS_OPTIONS,
  type SrmPoConfirmation,
  type SrmPoConfirmationQuery,
  type SrmPoConfirmationSaveRequest,
} from '@/types/srmCollab';

const { Title } = Typography;

const MANAGE = 'srm:collab:po-confirm:manage';

type FormValues = Omit<SrmPoConfirmationSaveRequest, 'poDate' | 'requireDate'> & {
  poDate?: Dayjs;
  requireDate?: Dayjs;
};

export default function SrmPoConfirmationPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmPoConfirmation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [confirmStatus, setConfirmStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = confirmStatus) => {
      setLoading(true);
      try {
        const params: SrmPoConfirmationQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          confirmStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, confirmStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ confirmStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: SrmPoConfirmation) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      poDate: record.poDate ? dayjs(record.poDate) : undefined,
      requireDate: record.requireDate ? dayjs(record.requireDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmPoConfirmationSaveRequest = {
        ...values,
        poDate: values.poDate ? values.poDate.format(DATE_FORMAT) : undefined,
        requireDate: values.requireDate ? values.requireDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('订单确认已创建');
      } else {
        await service.update(editId, payload);
        message.success('订单确认已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('订单确认已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmPoConfirmation> = [
    { title: '确认编号', dataIndex: 'confirmNo', width: 170, fixed: 'left', render: plain },
    { title: '采购订单号', dataIndex: 'poNo', width: 150, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '订单数量', dataIndex: 'poQty', width: 100, render: plain },
    { title: '单位', dataIndex: 'unit', width: 80, render: plain },
    { title: '单价', dataIndex: 'unitPrice', width: 100, render: plain },
    { title: '总金额', dataIndex: 'totalAmount', width: 110, render: plain },
    { title: '币种', dataIndex: 'currency', width: 90, render: plain },
    { title: '订单日期', dataIndex: 'poDate', width: 120, render: formatDate },
    { title: '需求日期', dataIndex: 'requireDate', width: 120, render: formatDate },
    { title: '确认人', dataIndex: 'confirmBy', width: 100, render: plain },
    { title: '确认日期', dataIndex: 'confirmDate', width: 120, render: formatDate },
    {
      title: '确认状态',
      dataIndex: 'confirmStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_PO_CONFIRM_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该订单确认？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        订单确认
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="确认状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={confirmStatus}
              onChange={(v) => setConfirmStatus(v)}
              options={[...SRM_PO_CONFIRM_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="确认编号 / 采购订单号 / 供应商编码 / 供应商名称"
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
                  void loadData(1, pageSize, keyword, confirmStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setConfirmStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建订单确认</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`订单确认（共 ${total} 条）`}>
        <Table<SrmPoConfirmation>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2400 }}
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
        title={editId == null ? '新建订单确认' : '编辑订单确认'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="confirmNo" label="确认编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="poNo" label="采购订单号">
            <Input placeholder="请输入采购订单号" />
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
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="poQty" label="订单数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="unitPrice" label="单价">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="totalAmount" label="总金额">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="currency" label="币种">
            <Input placeholder="为空默认 CNY" />
          </Form.Item>
          <Form.Item name="poDate" label="订单日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="requireDate" label="需求日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="confirmBy" label="确认人">
            <Input placeholder="请输入确认人" />
          </Form.Item>
          <Form.Item name="confirmDate" label="确认日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="confirmStatus" label="确认状态">
            <Select placeholder="为空默认 PENDING" options={[...SRM_PO_CONFIRM_STATUS_OPTIONS]} />
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
