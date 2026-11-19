import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
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
import { intgDocumentChainReceiptService as service } from '@/services/intgDocumentChainService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  INTG_DOCUMENT_CHAIN_OBJECT_TYPE_LABEL,
  INTG_DOCUMENT_CHAIN_OBJECT_TYPE_OPTIONS,
  INTG_DOCUMENT_CHAIN_RECEIPT_STATUS_LABEL,
  INTG_DOCUMENT_CHAIN_RECEIPT_STATUS_OPTIONS,
  type IntgDocumentChainReceipt,
  type IntgDocumentChainReceiptQuery,
  type IntgDocumentChainReceiptSaveRequest,
} from '@/types/intgDocumentChain';

const { Title } = Typography;

const MANAGE = 'intg:document-chain:receipt:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<IntgDocumentChainReceiptSaveRequest, 'receiptTime'> & {
  receiptTime?: Dayjs;
};

export default function IntgDocumentChainReceiptPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<IntgDocumentChainReceipt[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [objectType, setObjectType] = useState<string | undefined>(undefined);
  const [receiptStatus, setReceiptStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = objectType,
      status = receiptStatus,
    ) => {
      setLoading(true);
      try {
        const params: IntgDocumentChainReceiptQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          objectType: type,
          receiptStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, objectType, receiptStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ objectType: 'SALES_ORDER', receiptStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: IntgDocumentChainReceipt) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      receiptTime: record.receiptTime ? dayjs(record.receiptTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: IntgDocumentChainReceiptSaveRequest = {
        ...values,
        receiptTime: values.receiptTime ? values.receiptTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('接收回执已创建');
      } else {
        await service.update(editId, payload);
        message.success('接收回执已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('接收回执已删除');
    void loadData();
  };

  const columns: ColumnsType<IntgDocumentChainReceipt> = [
    { title: '回执编号', dataIndex: 'receiptNo', width: 190, fixed: 'left', render: plain },
    { title: '批次编号', dataIndex: 'batchNo', width: 160, render: plain },
    { title: '接口编号', dataIndex: 'interfaceNo', width: 160, render: plain },
    {
      title: '集成对象',
      dataIndex: 'objectType',
      width: 120,
      render: (v) => statusTag(INTG_DOCUMENT_CHAIN_OBJECT_TYPE_LABEL, v),
    },
    { title: '对象编号', dataIndex: 'objectNo', width: 170, render: plain },
    { title: '对象版本', dataIndex: 'objectVersion', width: 120, render: plain },
    { title: '链路对象ID', dataIndex: 'chainObjectId', width: 160, render: plain },
    {
      title: '状态',
      dataIndex: 'receiptStatus',
      width: 110,
      render: (v) => statusTag(INTG_DOCUMENT_CHAIN_RECEIPT_STATUS_LABEL, v),
    },
    { title: '校验消息', dataIndex: 'checkMessage', width: 220, render: plain },
    { title: '回执时间', dataIndex: 'receiptTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该接收回执？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        接收回执
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="集成对象">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={objectType}
              onChange={(v) => setObjectType(v)}
              options={[...INTG_DOCUMENT_CHAIN_OBJECT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="回执状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={receiptStatus}
              onChange={(v) => setReceiptStatus(v)}
              options={[...INTG_DOCUMENT_CHAIN_RECEIPT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="回执编号 / 对象编号 / 链路对象ID"
              allowClear
              style={{ width: 380 }}
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
                  void loadData(1, pageSize, keyword, objectType, receiptStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setObjectType(undefined);
                  setReceiptStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建接收回执</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`接收回执（共 ${total} 条）`}>
        <Table<IntgDocumentChainReceipt>
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
        title={editId == null ? '新建接收回执' : '编辑接收回执'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="receiptNo" label="回执编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次编号">
            <Input placeholder="请输入批次编号" />
          </Form.Item>
          <Form.Item name="interfaceNo" label="接口编号">
            <Input placeholder="请输入接口编号" />
          </Form.Item>
          <Form.Item name="objectType" label="集成对象">
            <Select placeholder="为空默认 SALES_ORDER" options={[...INTG_DOCUMENT_CHAIN_OBJECT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="objectNo" label="对象编号" rules={[{ required: true, message: '请输入对象编号' }]}>
            <Input placeholder="请输入对象编号" />
          </Form.Item>
          <Form.Item name="objectVersion" label="对象版本">
            <Input placeholder="请输入对象版本" />
          </Form.Item>
          <Form.Item name="chainObjectId" label="链路对象ID">
            <Input placeholder="请输入链路对象ID" />
          </Form.Item>
          <Form.Item name="receiptStatus" label="回执状态">
            <Select placeholder="为空默认 PENDING" options={[...INTG_DOCUMENT_CHAIN_RECEIPT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="checkMessage" label="校验消息">
            <Input.TextArea rows={2} placeholder="请输入校验消息" />
          </Form.Item>
          <Form.Item name="receiptTime" label="回执时间">
            <DatePicker showTime style={{ width: '100%' }} />
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
