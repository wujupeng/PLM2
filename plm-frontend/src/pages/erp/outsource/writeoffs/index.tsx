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
import { erpOutsourceWriteoffService } from '@/services/erpOutsourceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_OUTSOURCE_WRITEOFF_STATUS_LABEL,
  ERP_OUTSOURCE_WRITEOFF_STATUS_OPTIONS,
  type ErpOutsourceWriteoff,
  type ErpOutsourceWriteoffQuery,
  type ErpOutsourceWriteoffSaveRequest,
} from '@/types/erpOutsource';

const { Title } = Typography;

const MANAGE = 'erp:outsource:writeoff:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpOutsourceWriteoffSaveRequest, 'writeoffDate'> & {
  writeoffDate?: Dayjs;
};

export default function ErpOutsourceWriteoffPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpOutsourceWriteoff[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [writeoffStatus, setWriteoffStatus] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = writeoffStatus,
      no = orderNo,
      supplier = supplierCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpOutsourceWriteoffQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          writeoffStatus: status,
          orderNo: no || undefined,
          supplierCode: supplier || undefined,
        };
        const res = await erpOutsourceWriteoffService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, writeoffStatus, orderNo, supplierCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ writeoffStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: ErpOutsourceWriteoff) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      writeoffDate: record.writeoffDate ? dayjs(record.writeoffDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        writeoffDate: values.writeoffDate ? values.writeoffDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpOutsourceWriteoffService.create(payload);
        message.success('委外核销已创建');
      } else {
        await erpOutsourceWriteoffService.update(editId, payload);
        message.success('委外核销已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpOutsourceWriteoffService.remove(id);
    message.success('委外核销已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpOutsourceWriteoff> = [
    { title: '核销单号', dataIndex: 'writeoffNo', width: 160, fixed: 'left', render: plain },
    { title: '委外订单号', dataIndex: 'orderNo', width: 160, render: plain },
    { title: '结算单号', dataIndex: 'settlementNo', width: 160, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 130, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '累计发料数量', dataIndex: 'issuedQty', width: 130, render: plain },
    { title: '累计到货数量', dataIndex: 'receivedQty', width: 130, render: plain },
    { title: '损耗数量', dataIndex: 'lossQty', width: 120, render: plain },
    { title: '结存数量', dataIndex: 'balanceQty', width: 120, render: plain },
    { title: '核销日期', dataIndex: 'writeoffDate', width: 170, render: formatDateTime },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '核销状态',
      dataIndex: 'writeoffStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_OUTSOURCE_WRITEOFF_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该委外核销？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        委外核销
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="核销状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={writeoffStatus}
              onChange={(v) => setWriteoffStatus(v)}
              options={[...ERP_OUTSOURCE_WRITEOFF_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="委外订单号">
            <Input
              placeholder="请输入委外订单号"
              allowClear
              style={{ width: 160 }}
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="供应商编码">
            <Input
              placeholder="请输入供应商编码"
              allowClear
              style={{ width: 160 }}
              value={supplierCode}
              onChange={(e) => setSupplierCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="核销单号 / 供应商名称"
              allowClear
              style={{ width: 200 }}
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
                  void loadData(1, pageSize, keyword, writeoffStatus, orderNo, supplierCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setWriteoffStatus(undefined);
                  setOrderNo('');
                  setSupplierCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建核销</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`委外核销（共 ${total} 条）`}>
        <Table<ErpOutsourceWriteoff>
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
        title={editId == null ? '新建核销' : '编辑核销'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="writeoffNo" label="核销单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="orderNo" label="委外订单号">
            <Input placeholder="请输入委外订单号" />
          </Form.Item>
          <Form.Item name="settlementNo" label="结算单号">
            <Input placeholder="请输入结算单号" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码" rules={[{ required: true, message: '请输入供应商编码' }]}>
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="issuedQty" label="累计发料数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入累计发料数量" />
          </Form.Item>
          <Form.Item name="receivedQty" label="累计到货数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入累计到货数量" />
          </Form.Item>
          <Form.Item name="lossQty" label="损耗数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入损耗数量" />
          </Form.Item>
          <Form.Item name="balanceQty" label="结存数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入结存数量" />
          </Form.Item>
          <Form.Item name="writeoffDate" label="核销日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择核销日期" />
          </Form.Item>
          <Form.Item name="writeoffStatus" label="核销状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_OUTSOURCE_WRITEOFF_STATUS_OPTIONS]} />
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
