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
import { mesBatchTraceService as service } from '@/services/mesTraceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_BATCH_STATUS_LABEL,
  MES_BATCH_STATUS_OPTIONS,
  type MesBatchTrace,
  type MesBatchTraceQuery,
  type MesBatchTraceSaveRequest,
} from '@/types/mesTrace';

const { Title } = Typography;

const MANAGE = 'mes:trace:batch:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesBatchTraceSaveRequest, 'produceTime' | 'expireTime'> & {
  produceTime?: Dayjs;
  expireTime?: Dayjs;
};

export default function MesBatchTracePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesBatchTrace[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [batchStatus, setBatchStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = batchStatus) => {
      setLoading(true);
      try {
        const params: MesBatchTraceQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          batchStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, batchStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ batchStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: MesBatchTrace) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      produceTime: record.produceTime ? dayjs(record.produceTime) : undefined,
      expireTime: record.expireTime ? dayjs(record.expireTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesBatchTraceSaveRequest = {
        ...values,
        produceTime: values.produceTime ? values.produceTime.format(DATETIME_FORMAT) : undefined,
        expireTime: values.expireTime ? values.expireTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('批次追溯已创建');
      } else {
        await service.update(editId, payload);
        message.success('批次追溯已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('批次追溯已删除');
    void loadData();
  };

  const columns: ColumnsType<MesBatchTrace> = [
    { title: '批次号', dataIndex: 'batchNo', width: 190, fixed: 'left', render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '工单号', dataIndex: 'workOrderNo', width: 150, render: plain },
    { title: '数量', dataIndex: 'quantity', width: 110, render: plain },
    { title: '单位', dataIndex: 'unit', width: 90, render: plain },
    { title: '生产时间', dataIndex: 'produceTime', width: 170, render: formatDateTime },
    { title: '失效时间', dataIndex: 'expireTime', width: 170, render: formatDateTime },
    {
      title: '批次状态',
      dataIndex: 'batchStatus',
      width: 120,
      fixed: 'right',
      render: (v) => statusTag(MES_BATCH_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该批次追溯？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        批次追溯
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="批次状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={batchStatus}
              onChange={(v) => setBatchStatus(v)}
              options={[...MES_BATCH_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="批次号 / 物料编码 / 物料名称 / 工单号"
              allowClear
              style={{ width: 400 }}
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
                  void loadData(1, pageSize, keyword, batchStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBatchStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建批次追溯</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`批次追溯（共 ${total} 条）`}>
        <Table<MesBatchTrace>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1700 }}
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
        title={editId == null ? '新建批次追溯' : '编辑批次追溯'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="batchStatus" label="批次状态">
            <Select placeholder="为空默认 PENDING" options={[...MES_BATCH_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="workOrderNo" label="工单号">
            <Input placeholder="请输入工单号" />
          </Form.Item>
          <Form.Item name="quantity" label="数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入数量" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="produceTime" label="生产时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expireTime" label="失效时间">
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
