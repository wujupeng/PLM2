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
import { intgEdiGatewayBatchService as service } from '@/services/intgEdiGatewayService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  INTG_EDI_GATEWAY_BATCH_STATUS_LABEL,
  INTG_EDI_GATEWAY_BATCH_STATUS_OPTIONS,
  INTG_EDI_GATEWAY_OBJECT_TYPE_LABEL,
  INTG_EDI_GATEWAY_OBJECT_TYPE_OPTIONS,
  INTG_EDI_GATEWAY_TRIGGER_TYPE_LABEL,
  INTG_EDI_GATEWAY_TRIGGER_TYPE_OPTIONS,
  type IntgEdiGatewayBatch,
  type IntgEdiGatewayBatchQuery,
  type IntgEdiGatewayBatchSaveRequest,
} from '@/types/intgEdiGateway';

const { Title } = Typography;

const MANAGE = 'intg:edi-gateway:batch:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<IntgEdiGatewayBatchSaveRequest, 'startTime' | 'endTime'> & {
  startTime?: Dayjs;
  endTime?: Dayjs;
};

export default function IntgEdiGatewayBatchPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<IntgEdiGatewayBatch[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [objectType, setObjectType] = useState<string | undefined>(undefined);
  const [batchStatus, setBatchStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = objectType,
      status = batchStatus,
    ) => {
      setLoading(true);
      try {
        const params: IntgEdiGatewayBatchQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          objectType: type,
          batchStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, objectType, batchStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      direction: 'EDI_INBOUND',
      objectType: 'EDI_PURCHASE_ORDER',
      triggerType: 'MANUAL',
      batchStatus: 'PENDING',
    });
    setOpen(true);
  };

  const openEdit = (record: IntgEdiGatewayBatch) => {
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
      const payload: IntgEdiGatewayBatchSaveRequest = {
        ...values,
        startTime: values.startTime ? values.startTime.format(DATETIME_FORMAT) : undefined,
        endTime: values.endTime ? values.endTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('同步批次已创建');
      } else {
        await service.update(editId, payload);
        message.success('同步批次已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('同步批次已删除');
    void loadData();
  };

  const columns: ColumnsType<IntgEdiGatewayBatch> = [
    { title: '批次编号', dataIndex: 'batchNo', width: 200, fixed: 'left', render: plain },
    { title: '批次名称', dataIndex: 'batchName', width: 180, render: plain },
    { title: '接口编号', dataIndex: 'interfaceNo', width: 200, render: plain },
    { title: '集成方向', dataIndex: 'direction', width: 130, render: plain },
    {
      title: '集成对象',
      dataIndex: 'objectType',
      width: 120,
      render: (v) => statusTag(INTG_EDI_GATEWAY_OBJECT_TYPE_LABEL, v),
    },
    {
      title: '触发方式',
      dataIndex: 'triggerType',
      width: 120,
      render: (v) => statusTag(INTG_EDI_GATEWAY_TRIGGER_TYPE_LABEL, v),
    },
    { title: '总数', dataIndex: 'totalCount', width: 90, render: plain },
    { title: '成功数', dataIndex: 'successCount', width: 90, render: plain },
    { title: '失败数', dataIndex: 'failCount', width: 90, render: plain },
    { title: '开始时间', dataIndex: 'startTime', width: 170, render: formatDateTime },
    { title: '结束时间', dataIndex: 'endTime', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'batchStatus',
      width: 110,
      render: (v) => statusTag(INTG_EDI_GATEWAY_BATCH_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该同步批次？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        同步批次
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
              options={[...INTG_EDI_GATEWAY_OBJECT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="批次状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={batchStatus}
              onChange={(v) => setBatchStatus(v)}
              options={[...INTG_EDI_GATEWAY_BATCH_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="批次编号 / 批次名称 / 消息"
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
                  void loadData(1, pageSize, keyword, objectType, batchStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setObjectType(undefined);
                  setBatchStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建同步批次</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`同步批次（共 ${total} 条）`}>
        <Table<IntgEdiGatewayBatch>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2300 }}
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
        title={editId == null ? '新建同步批次' : '编辑同步批次'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="batchNo" label="批次编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item
            name="batchName"
            label="批次名称"
            rules={[{ required: true, message: '请输入批次名称' }]}
          >
            <Input placeholder="请输入批次名称" />
          </Form.Item>
          <Form.Item name="interfaceNo" label="接口编号">
            <Input placeholder="请输入接口编号" />
          </Form.Item>
          <Form.Item name="direction" label="集成方向">
            <Input placeholder="请输入集成方向" />
          </Form.Item>
          <Form.Item name="objectType" label="集成对象">
            <Select placeholder="为空默认 EDI_PURCHASE_ORDER" options={[...INTG_EDI_GATEWAY_OBJECT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="triggerType" label="触发方式">
            <Select placeholder="为空默认 MANUAL" options={[...INTG_EDI_GATEWAY_TRIGGER_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="totalCount" label="总数">
            <InputNumber style={{ width: '100%' }} placeholder="请输入总数" />
          </Form.Item>
          <Form.Item name="successCount" label="成功数">
            <InputNumber style={{ width: '100%' }} placeholder="请输入成功数" />
          </Form.Item>
          <Form.Item name="failCount" label="失败数">
            <InputNumber style={{ width: '100%' }} placeholder="请输入失败数" />
          </Form.Item>
          <Form.Item name="startTime" label="开始时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endTime" label="结束时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="batchStatus" label="状态">
            <Select placeholder="为空默认 PENDING" options={[...INTG_EDI_GATEWAY_BATCH_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="message" label="消息">
            <Input.TextArea rows={2} placeholder="请输入消息" />
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
