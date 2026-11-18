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
import { mesKanbanAndonService as service } from '@/services/mesKanbanService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_KANBAN_ANDON_TYPE_LABEL,
  MES_KANBAN_ANDON_TYPE_OPTIONS,
  MES_KANBAN_ANDON_LEVEL_LABEL,
  MES_KANBAN_ANDON_LEVEL_OPTIONS,
  MES_KANBAN_ANDON_STATUS_LABEL,
  MES_KANBAN_ANDON_STATUS_OPTIONS,
  type MesKanbanAndon,
  type MesKanbanAndonQuery,
  type MesKanbanAndonSaveRequest,
} from '@/types/mesKanban';

const { Title } = Typography;

const MANAGE = 'mes:kanban:andon:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesKanbanAndonSaveRequest, 'triggerTime' | 'responseTime' | 'closeTime'> & {
  triggerTime?: Dayjs;
  responseTime?: Dayjs;
  closeTime?: Dayjs;
};

export default function MesKanbanAndonPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesKanbanAndon[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [andonStatus, setAndonStatus] = useState<string | undefined>(undefined);
  const [andonType, setAndonType] = useState<string | undefined>(undefined);
  const [andonLevel, setAndonLevel] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = andonStatus,
      type = andonType,
      level = andonLevel,
    ) => {
      setLoading(true);
      try {
        const params: MesKanbanAndonQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          andonStatus: status,
          andonType: type,
          andonLevel: level,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, andonStatus, andonType, andonLevel],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ andonType: 'EQUIPMENT', andonLevel: 'MEDIUM', andonStatus: 'TRIGGERED' });
    setOpen(true);
  };

  const openEdit = (record: MesKanbanAndon) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      triggerTime: record.triggerTime ? dayjs(record.triggerTime) : undefined,
      responseTime: record.responseTime ? dayjs(record.responseTime) : undefined,
      closeTime: record.closeTime ? dayjs(record.closeTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesKanbanAndonSaveRequest = {
        ...values,
        triggerTime: values.triggerTime ? values.triggerTime.format(DATETIME_FORMAT) : undefined,
        responseTime: values.responseTime ? values.responseTime.format(DATETIME_FORMAT) : undefined,
        closeTime: values.closeTime ? values.closeTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('异常安灯已创建');
      } else {
        await service.update(editId, payload);
        message.success('异常安灯已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('异常安灯已删除');
    void loadData();
  };

  const columns: ColumnsType<MesKanbanAndon> = [
    { title: '安灯单号', dataIndex: 'andonNo', width: 190, fixed: 'left', render: plain },
    { title: '产线编码', dataIndex: 'lineCode', width: 130, render: plain },
    { title: '工位编码', dataIndex: 'stationCode', width: 130, render: plain },
    {
      title: '安灯类型',
      dataIndex: 'andonType',
      width: 120,
      render: (v) => statusTag(MES_KANBAN_ANDON_TYPE_LABEL, v),
    },
    {
      title: '安灯等级',
      dataIndex: 'andonLevel',
      width: 110,
      render: (v) => statusTag(MES_KANBAN_ANDON_LEVEL_LABEL, v),
    },
    {
      title: '安灯状态',
      dataIndex: 'andonStatus',
      width: 120,
      render: (v) => statusTag(MES_KANBAN_ANDON_STATUS_LABEL, v),
    },
    { title: '触发时间', dataIndex: 'triggerTime', width: 170, render: formatDateTime },
    { title: '响应时间', dataIndex: 'responseTime', width: 170, render: formatDateTime },
    { title: '关闭时间', dataIndex: 'closeTime', width: 170, render: formatDateTime },
    { title: '触发人', dataIndex: 'triggerBy', width: 120, render: plain },
    { title: '处理人', dataIndex: 'handler', width: 120, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, fixed: 'right', render: formatDateTime },
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
            <Popconfirm title="确认删除该异常安灯记录？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        异常安灯
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="安灯状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={andonStatus}
              onChange={(v) => setAndonStatus(v)}
              options={[...MES_KANBAN_ANDON_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="安灯类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={andonType}
              onChange={(v) => setAndonType(v)}
              options={[...MES_KANBAN_ANDON_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="安灯等级">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={andonLevel}
              onChange={(v) => setAndonLevel(v)}
              options={[...MES_KANBAN_ANDON_LEVEL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="安灯单号 / 产线编码 / 工位编码 / 触发人"
              allowClear
              style={{ width: 360 }}
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
                  void loadData(1, pageSize, keyword, andonStatus, andonType, andonLevel);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setAndonStatus(undefined);
                  setAndonType(undefined);
                  setAndonLevel(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建异常安灯</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`异常安灯（共 ${total} 条）`}>
        <Table<MesKanbanAndon>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1860 }}
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
        title={editId == null ? '新建异常安灯' : '编辑异常安灯'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="andonNo" label="安灯单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="lineCode" label="产线编码" rules={[{ required: true, message: '请输入产线编码' }]}>
            <Input placeholder="请输入产线编码" />
          </Form.Item>
          <Form.Item name="stationCode" label="工位编码">
            <Input placeholder="请输入工位编码" />
          </Form.Item>
          <Form.Item name="andonType" label="安灯类型">
            <Select placeholder="为空默认 EQUIPMENT" options={[...MES_KANBAN_ANDON_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="andonLevel" label="安灯等级">
            <Select placeholder="为空默认 MEDIUM" options={[...MES_KANBAN_ANDON_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="andonStatus" label="安灯状态">
            <Select placeholder="为空默认 TRIGGERED" options={[...MES_KANBAN_ANDON_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="triggerTime" label="触发时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="responseTime" label="响应时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="closeTime" label="关闭时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="triggerBy" label="触发人">
            <Input placeholder="请输入触发人" />
          </Form.Item>
          <Form.Item name="handler" label="处理人">
            <Input placeholder="请输入处理人" />
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
