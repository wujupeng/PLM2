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
import { mesKanbanDowntimeService as service } from '@/services/mesKanbanService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_KANBAN_RECORD_STATUS_LABEL,
  MES_KANBAN_RECORD_STATUS_OPTIONS,
  MES_KANBAN_DOWNTIME_TYPE_LABEL,
  MES_KANBAN_DOWNTIME_TYPE_OPTIONS,
  type MesKanbanDowntime,
  type MesKanbanDowntimeQuery,
  type MesKanbanDowntimeSaveRequest,
} from '@/types/mesKanban';

const { Title } = Typography;

const MANAGE = 'mes:kanban:downtime:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesKanbanDowntimeSaveRequest, 'startTime' | 'endTime'> & {
  startTime?: Dayjs;
  endTime?: Dayjs;
};

export default function MesKanbanDowntimePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesKanbanDowntime[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [recordStatus, setRecordStatus] = useState<string | undefined>(undefined);
  const [downtimeType, setDowntimeType] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = recordStatus,
      type = downtimeType,
    ) => {
      setLoading(true);
      try {
        const params: MesKanbanDowntimeQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          recordStatus: status,
          downtimeType: type,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, recordStatus, downtimeType],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ downtimeType: 'EQUIPMENT', recordStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesKanbanDowntime) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      startTime: record.startTime ? dayjs(record.startTime) : undefined,
      endTime: record.endTime ? dayjs(record.endTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesKanbanDowntimeSaveRequest = {
        ...values,
        startTime: values.startTime ? values.startTime.format(DATETIME_FORMAT) : undefined,
        endTime: values.endTime ? values.endTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('停机看板已创建');
      } else {
        await service.update(editId, payload);
        message.success('停机看板已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('停机看板已删除');
    void loadData();
  };

  const columns: ColumnsType<MesKanbanDowntime> = [
    { title: '停机单号', dataIndex: 'downtimeNo', width: 190, fixed: 'left', render: plain },
    { title: '设备编码', dataIndex: 'equipmentCode', width: 150, render: plain },
    { title: '设备名称', dataIndex: 'equipmentName', width: 170, render: plain },
    { title: '产线编码', dataIndex: 'lineCode', width: 130, render: plain },
    {
      title: '停机类型',
      dataIndex: 'downtimeType',
      width: 120,
      render: (v) => statusTag(MES_KANBAN_DOWNTIME_TYPE_LABEL, v),
    },
    { title: '开始时间', dataIndex: 'startTime', width: 170, render: formatDateTime },
    { title: '结束时间', dataIndex: 'endTime', width: 170, render: formatDateTime },
    { title: '停机时长(分钟)', dataIndex: 'durationMinutes', width: 130, render: plain },
    { title: '停机原因', dataIndex: 'reason', width: 180, render: plain },
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
            <Popconfirm title="确认删除该停机看板记录？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        停机看板
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
          <Form.Item label="停机类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={downtimeType}
              onChange={(v) => setDowntimeType(v)}
              options={[...MES_KANBAN_DOWNTIME_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="停机单号 / 设备编码 / 设备名称 / 产线编码"
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
                  void loadData(1, pageSize, keyword, recordStatus, downtimeType);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRecordStatus(undefined);
                  setDowntimeType(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建停机看板</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`停机看板（共 ${total} 条）`}>
        <Table<MesKanbanDowntime>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1840 }}
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
        title={editId == null ? '新建停机看板' : '编辑停机看板'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="downtimeNo" label="停机单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="equipmentCode" label="设备编码" rules={[{ required: true, message: '请输入设备编码' }]}>
            <Input placeholder="请输入设备编码" />
          </Form.Item>
          <Form.Item name="equipmentName" label="设备名称">
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item name="lineCode" label="产线编码">
            <Input placeholder="请输入产线编码" />
          </Form.Item>
          <Form.Item name="downtimeType" label="停机类型">
            <Select placeholder="为空默认 EQUIPMENT" options={[...MES_KANBAN_DOWNTIME_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="startTime" label="开始时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endTime" label="结束时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="durationMinutes" label="停机时长(分钟)">
            <InputNumber style={{ width: '100%' }} placeholder="请输入停机时长" />
          </Form.Item>
          <Form.Item name="reason" label="停机原因">
            <Input placeholder="请输入停机原因" />
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
