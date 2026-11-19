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
import { migPlmDocumentReconcileService as service } from '@/services/migPlmDocumentService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MIG_PLM_DOCUMENT_OBJECT_TYPE_LABEL,
  MIG_PLM_DOCUMENT_OBJECT_TYPE_OPTIONS,
  MIG_PLM_DOCUMENT_RECONCILE_STATUS_LABEL,
  MIG_PLM_DOCUMENT_RECONCILE_STATUS_OPTIONS,
  type MigPlmDocumentReconcile,
  type MigPlmDocumentReconcileQuery,
  type MigPlmDocumentReconcileSaveRequest,
} from '@/types/migPlmDocument';

const { Title } = Typography;

const MANAGE = 'mig:plm-document:reconcile:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MigPlmDocumentReconcileSaveRequest, 'reconcileDate'> & {
  reconcileDate?: Dayjs;
};

export default function MigPlmDocumentReconcilePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MigPlmDocumentReconcile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [objectType, setObjectType] = useState<string | undefined>(undefined);
  const [reconcileStatus, setReconcileStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = objectType,
      status = reconcileStatus,
    ) => {
      setLoading(true);
      try {
        const params: MigPlmDocumentReconcileQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          objectType: type,
          reconcileStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, objectType, reconcileStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ objectType: 'DRAWING', reconcileStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: MigPlmDocumentReconcile) => {
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
      const payload: MigPlmDocumentReconcileSaveRequest = {
        ...values,
        reconcileDate: values.reconcileDate ? values.reconcileDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('对账记录已创建');
      } else {
        await service.update(editId, payload);
        message.success('对账记录已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('对账记录已删除');
    void loadData();
  };

  const columns: ColumnsType<MigPlmDocumentReconcile> = [
    { title: '对账编号', dataIndex: 'reconcileNo', width: 190, fixed: 'left', render: plain },
    { title: '对账名称', dataIndex: 'reconcileName', width: 170, render: plain },
    { title: '接口编号', dataIndex: 'interfaceNo', width: 160, render: plain },
    {
      title: '集成对象',
      dataIndex: 'objectType',
      width: 120,
      render: (v) => statusTag(MIG_PLM_DOCUMENT_OBJECT_TYPE_LABEL, v),
    },
    { title: '源条数', dataIndex: 'sourceCount', width: 110, render: plain },
    { title: '目标条数', dataIndex: 'targetCount', width: 110, render: plain },
    { title: '差异条数', dataIndex: 'diffCount', width: 110, render: plain },
    { title: '对账日期', dataIndex: 'reconcileDate', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'reconcileStatus',
      width: 110,
      render: (v) => statusTag(MIG_PLM_DOCUMENT_RECONCILE_STATUS_LABEL, v),
    },
    { title: '结果说明', dataIndex: 'resultMessage', width: 240, render: plain },
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
            <Popconfirm title="确认删除该对账记录？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        对账
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
              options={[...MIG_PLM_DOCUMENT_OBJECT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="对账状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={reconcileStatus}
              onChange={(v) => setReconcileStatus(v)}
              options={[...MIG_PLM_DOCUMENT_RECONCILE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="对账编号 / 对账名称 / 结果说明"
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
                  void loadData(1, pageSize, keyword, objectType, reconcileStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setObjectType(undefined);
                  setReconcileStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建对账</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`对账（共 ${total} 条）`}>
        <Table<MigPlmDocumentReconcile>
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
        title={editId == null ? '新建对账' : '编辑对账'}
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
          <Form.Item name="reconcileName" label="对账名称" rules={[{ required: true, message: '请输入对账名称' }]}>
            <Input placeholder="请输入对账名称" />
          </Form.Item>
          <Form.Item name="interfaceNo" label="接口编号">
            <Input placeholder="请输入接口编号" />
          </Form.Item>
          <Form.Item name="objectType" label="集成对象">
            <Select placeholder="为空默认 DRAWING" options={[...MIG_PLM_DOCUMENT_OBJECT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourceCount" label="源条数">
            <InputNumber style={{ width: '100%' }} placeholder="请输入源条数" />
          </Form.Item>
          <Form.Item name="targetCount" label="目标条数">
            <InputNumber placeholder="请输入目标条数" />
          </Form.Item>
          <Form.Item name="diffCount" label="差异条数">
            <InputNumber placeholder="请输入差异条数" />
          </Form.Item>
          <Form.Item name="reconcileDate" label="对账日期">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reconcileStatus" label="对账状态">
            <Select placeholder="为空默认 PENDING" options={[...MIG_PLM_DOCUMENT_RECONCILE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="resultMessage" label="结果说明">
            <Input.TextArea rows={2} placeholder="请输入结果说明" />
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
