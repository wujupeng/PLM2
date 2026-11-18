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
import { wmsPutawayTaskService as service } from '@/services/wmsInboundService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_PUTAWAY_STATUS_LABEL,
  WMS_PUTAWAY_STATUS_OPTIONS,
  type WmsPutawayTask,
  type WmsPutawayTaskQuery,
  type WmsPutawayTaskSaveRequest,
} from '@/types/wmsInbound';

const { Title } = Typography;

const MANAGE = 'wms:inbound:putaway:manage';

const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<WmsPutawayTaskSaveRequest, 'putawayTime'> & {
  putawayTime?: Dayjs;
};

export default function WmsPutawayTaskPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsPutawayTask[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [putawayStatus, setPutawayStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = putawayStatus) => {
      setLoading(true);
      try {
        const params: WmsPutawayTaskQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          putawayStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, putawayStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ putawayStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: WmsPutawayTask) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      putawayTime: record.putawayTime ? dayjs(record.putawayTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsPutawayTaskSaveRequest = {
        ...values,
        putawayTime: values.putawayTime ? values.putawayTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('上架任务已创建');
      } else {
        await service.update(editId, payload);
        message.success('上架任务已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('上架任务已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsPutawayTask> = [
    { title: '任务号', dataIndex: 'taskNo', width: 190, fixed: 'left', render: plain },
    { title: '收货单号', dataIndex: 'receiptNo', width: 190, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 150, render: plain },
    { title: '数量', dataIndex: 'qty', width: 100, render: plain },
    { title: '源库位', dataIndex: 'fromBinCode', width: 140, render: plain },
    { title: '目标库位', dataIndex: 'toBinCode', width: 140, render: plain },
    { title: '策略编码', dataIndex: 'strategyCode', width: 140, render: plain },
    { title: '作业人', dataIndex: 'operator', width: 110, render: plain },
    { title: '上架时间', dataIndex: 'putawayTime', width: 170, render: formatDateTime },
    { title: '优先级', dataIndex: 'taskPriority', width: 90, render: plain },
    {
      title: '上架状态',
      dataIndex: 'putawayStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_PUTAWAY_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该上架任务？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        上架任务
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="上架状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={putawayStatus}
              onChange={(v) => setPutawayStatus(v)}
              options={[...WMS_PUTAWAY_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="任务号 / 收货单号 / 物料编码 / 批次号"
              allowClear
              style={{ width: 300 }}
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
                  void loadData(1, pageSize, keyword, putawayStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setPutawayStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建上架任务</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`上架任务（共 ${total} 条）`}>
        <Table<WmsPutawayTask>
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
        title={editId == null ? '新建上架任务' : '编辑上架任务'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="taskNo" label="任务号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="receiptNo" label="收货单号">
            <Input placeholder="请输入收货单号" />
          </Form.Item>
          <Form.Item
            name="materialCode"
            label="物料编码"
            rules={[{ required: true, message: '请输入物料编码' }]}
          >
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="qty" label="数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="fromBinCode" label="源库位">
            <Input placeholder="请输入源库位" />
          </Form.Item>
          <Form.Item name="toBinCode" label="目标库位">
            <Input placeholder="请输入目标库位" />
          </Form.Item>
          <Form.Item name="strategyCode" label="策略编码">
            <Input placeholder="请输入策略编码" />
          </Form.Item>
          <Form.Item name="operator" label="作业人">
            <Input placeholder="请输入作业人" />
          </Form.Item>
          <Form.Item name="putawayTime" label="上架时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="taskPriority" label="优先级">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="putawayStatus" label="上架状态">
            <Select placeholder="为空默认 PENDING" options={[...WMS_PUTAWAY_STATUS_OPTIONS]} />
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
