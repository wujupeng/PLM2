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
import { mesKanbanYieldService as service } from '@/services/mesKanbanService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_KANBAN_RECORD_STATUS_LABEL,
  MES_KANBAN_RECORD_STATUS_OPTIONS,
  type MesKanbanYield,
  type MesKanbanYieldQuery,
  type MesKanbanYieldSaveRequest,
} from '@/types/mesKanban';

const { Title } = Typography;

const MANAGE = 'mes:kanban:yield:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesKanbanYieldSaveRequest, 'statDate'> & {
  statDate?: Dayjs;
};

export default function MesKanbanYieldPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesKanbanYield[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [recordStatus, setRecordStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = recordStatus) => {
      setLoading(true);
      try {
        const params: MesKanbanYieldQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          recordStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, recordStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ recordStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesKanbanYield) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      statDate: record.statDate ? dayjs(record.statDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesKanbanYieldSaveRequest = {
        ...values,
        statDate: values.statDate ? values.statDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('良率看板已创建');
      } else {
        await service.update(editId, payload);
        message.success('良率看板已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('良率看板已删除');
    void loadData();
  };

  const columns: ColumnsType<MesKanbanYield> = [
    { title: '良率单号', dataIndex: 'yieldNo', width: 190, fixed: 'left', render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '产线编码', dataIndex: 'lineCode', width: 130, render: plain },
    { title: '班次编码', dataIndex: 'shiftCode', width: 100, render: plain },
    { title: '投入数量', dataIndex: 'inputQty', width: 110, render: plain },
    { title: '合格数量', dataIndex: 'qualifiedQty', width: 120, render: plain },
    { title: '不合格数量', dataIndex: 'unqualifiedQty', width: 120, render: plain },
    { title: '良率', dataIndex: 'yieldRate', width: 110, render: plain },
    { title: '统计日期', dataIndex: 'statDate', width: 170, render: formatDateTime },
    {
      title: '记录状态',
      dataIndex: 'recordStatus',
      width: 120,
      fixed: 'right',
      render: (v) => statusTag(MES_KANBAN_RECORD_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该良率看板记录？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        良率看板
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="记录状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={recordStatus}
              onChange={(v) => setRecordStatus(v)}
              options={[...MES_KANBAN_RECORD_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="良率单号 / 物料编码 / 物料名称 / 产线编码"
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
                  void loadData(1, pageSize, keyword, recordStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRecordStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建良率看板</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`良率看板（共 ${total} 条）`}>
        <Table<MesKanbanYield>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1800 }}
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
        title={editId == null ? '新建良率看板' : '编辑良率看板'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="yieldNo" label="良率单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="lineCode" label="产线编码">
            <Input placeholder="请输入产线编码" />
          </Form.Item>
          <Form.Item name="shiftCode" label="班次编码">
            <Input placeholder="请输入班次编码" />
          </Form.Item>
          <Form.Item name="inputQty" label="投入数量">
            <InputNumber style={{ width: '100%' }} placeholder="请输入投入数量" />
          </Form.Item>
          <Form.Item name="qualifiedQty" label="合格数量">
            <InputNumber style={{ width: '100%' }} placeholder="请输入合格数量" />
          </Form.Item>
          <Form.Item name="unqualifiedQty" label="不合格数量">
            <InputNumber style={{ width: '100%' }} placeholder="请输入不合格数量" />
          </Form.Item>
          <Form.Item name="yieldRate" label="良率">
            <InputNumber style={{ width: '100%' }} placeholder="请输入良率" />
          </Form.Item>
          <Form.Item name="statDate" label="统计日期">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="recordStatus" label="记录状态">
            <Select placeholder="为空默认 DRAFT" options={[...MES_KANBAN_RECORD_STATUS_OPTIONS]} />
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
