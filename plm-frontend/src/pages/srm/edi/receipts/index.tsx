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
import { srmEdiReceiptService as service } from '@/services/srmEdiService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_EDI_RECEIPT_STATUS_LABEL,
  SRM_EDI_RECEIPT_STATUS_OPTIONS,
  SRM_EDI_RECEIPT_TYPE_LABEL,
  SRM_EDI_RECEIPT_TYPE_OPTIONS,
  type SrmEdiReceipt,
  type SrmEdiReceiptQuery,
  type SrmEdiReceiptSaveRequest,
} from '@/types/srmEdi';

const { Title } = Typography;

const MANAGE = 'srm:edi:receipt:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** 表单值：时间字段放宽为 Dayjs。 */
type FormValues = Omit<SrmEdiReceiptSaveRequest, 'receivedTime'> & { receivedTime?: Dayjs };

export default function SrmEdiReceiptPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmEdiReceipt[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [receiptType, setReceiptType] = useState<string | undefined>(undefined);
  const [receiptStatus, setReceiptStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = receiptType,
      status = receiptStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmEdiReceiptQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          receiptType: type,
          receiptStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, receiptType, receiptStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ receiptType: 'ACK', receiptStatus: 'RECEIVED' });
    setOpen(true);
  };

  const openEdit = (record: SrmEdiReceipt) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      receivedTime: record.receivedTime ? dayjs(record.receivedTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmEdiReceiptSaveRequest = {
        ...values,
        receivedTime: values.receivedTime ? values.receivedTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('EDI回执已创建');
      } else {
        await service.update(editId, payload);
        message.success('EDI回执已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('EDI回执已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmEdiReceipt> = [
    { title: '回执编号', dataIndex: 'receiptNo', width: 170, fixed: 'left', render: plain },
    { title: '报文编号', dataIndex: 'ediNo', width: 170, render: plain },
    { title: '合作方编码', dataIndex: 'partnerCode', width: 140, render: plain },
    { title: '合作方名称', dataIndex: 'partnerName', width: 160, render: plain },
    {
      title: '回执类型',
      dataIndex: 'receiptType',
      width: 120,
      render: (v) => statusTag(SRM_EDI_RECEIPT_TYPE_LABEL, v),
    },
    { title: '回执代码', dataIndex: 'receiptCode', width: 120, render: plain },
    { title: '回执说明', dataIndex: 'receiptDesc', width: 200, render: plain },
    { title: '接收时间', dataIndex: 'receivedTime', width: 170, render: formatDateTime },
    {
      title: '回执状态',
      dataIndex: 'receiptStatus',
      width: 120,
      fixed: 'right',
      render: (v) => statusTag(SRM_EDI_RECEIPT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该EDI回执？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        EDI回执
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="回执类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={receiptType}
              onChange={(v) => setReceiptType(v)}
              options={[...SRM_EDI_RECEIPT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="回执状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={receiptStatus}
              onChange={(v) => setReceiptStatus(v)}
              options={[...SRM_EDI_RECEIPT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="回执编号 / 报文编号 / 合作方编码 / 合作方名称"
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
                  void loadData(1, pageSize, keyword, receiptType, receiptStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setReceiptType(undefined);
                  setReceiptStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建EDI回执</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`EDI回执（共 ${total} 条）`}>
        <Table<SrmEdiReceipt>
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
        title={editId == null ? '新建EDI回执' : '编辑EDI回执'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="receiptNo" label="回执编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item
            name="ediNo"
            label="报文编号"
            rules={[{ required: true, message: '请输入EDI报文编号' }]}
          >
            <Input placeholder="请输入EDI报文编号" />
          </Form.Item>
          <Form.Item name="partnerCode" label="合作方编码">
            <Input placeholder="请输入合作方编码" />
          </Form.Item>
          <Form.Item name="partnerName" label="合作方名称">
            <Input placeholder="请输入合作方名称" />
          </Form.Item>
          <Form.Item name="receiptType" label="回执类型">
            <Select placeholder="为空默认 ACK" options={[...SRM_EDI_RECEIPT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="receiptCode" label="回执代码">
            <Input placeholder="请输入回执代码" />
          </Form.Item>
          <Form.Item name="receiptDesc" label="回执说明">
            <Input.TextArea rows={2} placeholder="请输入回执说明" />
          </Form.Item>
          <Form.Item name="receivedTime" label="接收时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="receiptStatus" label="回执状态">
            <Select placeholder="为空默认 RECEIVED" options={[...SRM_EDI_RECEIPT_STATUS_OPTIONS]} />
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
