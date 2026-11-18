import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
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
import { wmsStrategyService as service } from '@/services/wmsBaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_STRATEGY_STATUS_LABEL,
  WMS_STRATEGY_STATUS_OPTIONS,
  WMS_STRATEGY_TYPE_LABEL,
  WMS_STRATEGY_TYPE_OPTIONS,
  type WmsStrategy,
  type WmsStrategyQuery,
  type WmsStrategySaveRequest,
} from '@/types/wmsBase';

const { Title } = Typography;

const MANAGE = 'wms:base:strategy:manage';

type FormValues = WmsStrategySaveRequest;

export default function WmsStrategyPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsStrategy[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [strategyType, setStrategyType] = useState<string | undefined>(undefined);
  const [strategyStatus, setStrategyStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = strategyType,
      status = strategyStatus,
    ) => {
      setLoading(true);
      try {
        const params: WmsStrategyQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          strategyType: type,
          strategyStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, strategyType, strategyStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ strategyType: 'PUTAWAY', strategyStatus: 'DRAFT', priority: 0, fifoFlag: 0 });
    setOpen(true);
  };

  const openEdit = (record: WmsStrategy) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsStrategySaveRequest = { ...values };
      if (editId == null) {
        await service.create(payload);
        message.success('作业策略已创建');
      } else {
        await service.update(editId, payload);
        message.success('作业策略已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('作业策略已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsStrategy> = [
    { title: '策略编码', dataIndex: 'strategyCode', width: 160, fixed: 'left', render: plain },
    { title: '策略名称', dataIndex: 'strategyName', width: 180, render: plain },
    {
      title: '策略类型',
      dataIndex: 'strategyType',
      width: 120,
      render: (v) => statusTag(WMS_STRATEGY_TYPE_LABEL, v),
    },
    { title: '优先级', dataIndex: 'priority', width: 90, render: plain },
    { title: 'FIFO', dataIndex: 'fifoFlag', width: 80, render: plain },
    { title: '规则内容', dataIndex: 'ruleContent', width: 260, render: plain },
    {
      title: '策略状态',
      dataIndex: 'strategyStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_STRATEGY_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该作业策略？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        作业策略
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="策略类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={strategyType}
              onChange={(v) => setStrategyType(v)}
              options={[...WMS_STRATEGY_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="策略状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={strategyStatus}
              onChange={(v) => setStrategyStatus(v)}
              options={[...WMS_STRATEGY_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="策略编码 / 名称"
              allowClear
              style={{ width: 240 }}
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
                  void loadData(1, pageSize, keyword, strategyType, strategyStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setStrategyType(undefined);
                  setStrategyStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建作业策略</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`作业策略（共 ${total} 条）`}>
        <Table<WmsStrategy>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1500 }}
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
        title={editId == null ? '新建作业策略' : '编辑作业策略'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="strategyCode"
            label="策略编码"
            rules={[{ required: true, message: '请输入作业策略编码' }]}
          >
            <Input placeholder="请输入策略编码" />
          </Form.Item>
          <Form.Item name="strategyName" label="策略名称">
            <Input placeholder="请输入策略名称" />
          </Form.Item>
          <Form.Item name="strategyType" label="策略类型">
            <Select placeholder="为空默认 PUTAWAY" options={[...WMS_STRATEGY_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="fifoFlag" label="先进先出标识">
            <InputNumber min={0} max={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ruleContent" label="规则内容">
            <Input.TextArea rows={3} placeholder="请输入规则内容" />
          </Form.Item>
          <Form.Item name="strategyStatus" label="策略状态">
            <Select placeholder="为空默认 DRAFT" options={[...WMS_STRATEGY_STATUS_OPTIONS]} />
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
