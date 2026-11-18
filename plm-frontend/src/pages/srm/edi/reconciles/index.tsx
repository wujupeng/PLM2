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
import { srmEdiReconcileService as service } from '@/services/srmEdiService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_EDI_MESSAGE_TYPE_LABEL,
  SRM_EDI_MESSAGE_TYPE_OPTIONS,
  SRM_EDI_RECONCILE_STATUS_LABEL,
  SRM_EDI_RECONCILE_STATUS_OPTIONS,
  type SrmEdiReconcile,
  type SrmEdiReconcileQuery,
  type SrmEdiReconcileSaveRequest,
} from '@/types/srmEdi';

const { Title } = Typography;

const MANAGE = 'srm:edi:reconcile:manage';

/** 表单值：日期字段放宽为 Dayjs。 */
type FormValues = Omit<SrmEdiReconcileSaveRequest, 'reconcileDate'> & { reconcileDate?: Dayjs };

export default function SrmEdiReconcilePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmEdiReconcile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [messageType, setMessageType] = useState<string | undefined>(undefined);
  const [reconcileStatus, setReconcileStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      msgType = messageType,
      status = reconcileStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmEdiReconcileQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          messageType: msgType,
          reconcileStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, messageType, reconcileStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ messageType: 'ORDER', sendCount: 0, reconcileStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: SrmEdiReconcile) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      reconcileDate: record.reconcileDate ? dayjs(record.reconcileDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmEdiReconcileSaveRequest = {
        ...values,
        reconcileDate: values.reconcileDate ? values.reconcileDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('EDI对账已创建');
      } else {
        await service.update(editId, payload);
        message.success('EDI对账已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('EDI对账已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmEdiReconcile> = [
    { title: '对账编号', dataIndex: 'reconcileNo', width: 170, fixed: 'left', render: plain },
    { title: '合作方编码', dataIndex: 'partnerCode', width: 140, render: plain },
    { title: '合作方名称', dataIndex: 'partnerName', width: 160, render: plain },
    { title: '对账周期', dataIndex: 'reconcilePeriod', width: 120, render: plain },
    {
      title: '报文类型',
      dataIndex: 'messageType',
      width: 120,
      render: (v) => statusTag(SRM_EDI_MESSAGE_TYPE_LABEL, v),
    },
    { title: '发送数', dataIndex: 'sendCount', width: 90, render: plain },
    { title: '回执数', dataIndex: 'ackCount', width: 90, render: plain },
    { title: '失败数', dataIndex: 'failCount', width: 90, render: plain },
    { title: '对账结果', dataIndex: 'reconcileResult', width: 200, render: plain },
    { title: '对账日期', dataIndex: 'reconcileDate', width: 120, render: formatDate },
    {
      title: '对账状态',
      dataIndex: 'reconcileStatus',
      width: 120,
      fixed: 'right',
      render: (v) => statusTag(SRM_EDI_RECONCILE_STATUS_LABEL, v),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: plain },
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
            <Popconfirm title="确认删除该EDI对账？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        EDI对账
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="报文类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={messageType}
              onChange={(v) => setMessageType(v)}
              options={[...SRM_EDI_MESSAGE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="对账状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={reconcileStatus}
              onChange={(v) => setReconcileStatus(v)}
              options={[...SRM_EDI_RECONCILE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="对账编号 / 合作方编码 / 合作方名称 / 对账周期"
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
                  void loadData(1, pageSize, keyword, messageType, reconcileStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setMessageType(undefined);
                  setReconcileStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建EDI对账</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`EDI对账（共 ${total} 条）`}>
        <Table<SrmEdiReconcile>
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
        title={editId == null ? '新建EDI对账' : '编辑EDI对账'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="reconcileNo" label="对账编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item
            name="partnerCode"
            label="合作方编码"
            rules={[{ required: true, message: '请输入合作方编码' }]}
          >
            <Input placeholder="请输入合作方编码" />
          </Form.Item>
          <Form.Item name="partnerName" label="合作方名称">
            <Input placeholder="请输入合作方名称" />
          </Form.Item>
          <Form.Item name="reconcilePeriod" label="对账周期">
            <Input placeholder="如 2026-11" />
          </Form.Item>
          <Form.Item name="messageType" label="报文类型">
            <Select placeholder="为空默认 ORDER" options={[...SRM_EDI_MESSAGE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sendCount" label="发送数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ackCount" label="回执数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="failCount" label="失败数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reconcileResult" label="对账结果">
            <Input.TextArea rows={2} placeholder="请输入对账结果" />
          </Form.Item>
          <Form.Item name="reconcileDate" label="对账日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reconcileStatus" label="对账状态">
            <Select placeholder="为空默认 PENDING" options={[...SRM_EDI_RECONCILE_STATUS_OPTIONS]} />
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
