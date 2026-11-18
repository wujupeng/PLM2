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
import { wmsPickTaskService as service } from '@/services/wmsPickingService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_PICK_STATUS_LABEL,
  WMS_PICK_STATUS_OPTIONS,
  WMS_PICK_STRATEGY_LABEL,
  WMS_PICK_STRATEGY_OPTIONS,
  WMS_PICK_TYPE_LABEL,
  WMS_PICK_TYPE_OPTIONS,
  type WmsPickTask,
  type WmsPickTaskQuery,
  type WmsPickTaskSaveRequest,
} from '@/types/wmsPicking';

const { Title } = Typography;

const MANAGE = 'wms:pick:task:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<WmsPickTaskSaveRequest, 'pickTime'> & {
  pickTime?: Dayjs;
};

export default function WmsPickTaskPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsPickTask[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [pickStatus, setPickStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = pickStatus) => {
      setLoading(true);
      try {
        const params: WmsPickTaskQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          pickStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, pickStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ pickType: 'PRODUCTION', pickStrategy: 'FIFO', pickStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: WmsPickTask) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      pickTime: record.pickTime ? dayjs(record.pickTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsPickTaskSaveRequest = {
        ...values,
        pickTime: values.pickTime ? values.pickTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('拣料单已创建');
      } else {
        await service.update(editId, payload);
        message.success('拣料单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('拣料单已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsPickTask> = [
    { title: '拣料单号', dataIndex: 'pickNo', width: 190, fixed: 'left', render: plain },
    {
      title: '拣料类型',
      dataIndex: 'pickType',
      width: 110,
      render: (v) => statusTag(WMS_PICK_TYPE_LABEL, v),
    },
    { title: '生产工单号', dataIndex: 'workOrderNo', width: 170, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 160, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '源库位', dataIndex: 'fromBinCode', width: 130, render: plain },
    { title: '目标库位', dataIndex: 'toBinCode', width: 130, render: plain },
    { title: '需求数量', dataIndex: 'requiredQty', width: 100, render: plain },
    { title: '已拣数量', dataIndex: 'pickedQty', width: 100, render: plain },
    {
      title: '拣选策略',
      dataIndex: 'pickStrategy',
      width: 110,
      render: (v) => statusTag(WMS_PICK_STRATEGY_LABEL, v),
    },
    { title: '优先级', dataIndex: 'taskPriority', width: 90, render: plain },
    { title: '作业人', dataIndex: 'operator', width: 120, render: plain },
    { title: '拣料时间', dataIndex: 'pickTime', width: 170, render: formatDateTime },
    {
      title: '拣料状态',
      dataIndex: 'pickStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_PICK_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该拣料单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        拣料单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="拣料状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={pickStatus}
              onChange={(v) => setPickStatus(v)}
              options={[...WMS_PICK_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="拣料单号 / 物料编码 / 物料名称 / 批次号"
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
                  void loadData(1, pageSize, keyword, pickStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setPickStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建拣料单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`拣料单（共 ${total} 条）`}>
        <Table<WmsPickTask>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2600 }}
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
        title={editId == null ? '新建拣料单' : '编辑拣料单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="pickNo" label="拣料单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="pickType" label="拣料类型">
            <Select placeholder="为空默认 PRODUCTION" options={[...WMS_PICK_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="workOrderNo" label="生产工单号">
            <Input placeholder="请输入生产工单号" />
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
          <Form.Item name="spec" label="规格">
            <Input placeholder="请输入规格" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="fromBinCode" label="源库位">
            <Input placeholder="请输入源库位" />
          </Form.Item>
          <Form.Item name="toBinCode" label="目标库位">
            <Input placeholder="请输入目标库位" />
          </Form.Item>
          <Form.Item name="requiredQty" label="需求数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="pickedQty" label="已拣数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="pickStrategy" label="拣选策略">
            <Select placeholder="为空默认 FIFO" options={[...WMS_PICK_STRATEGY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="taskPriority" label="任务优先级">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="operator" label="作业人">
            <Input placeholder="请输入作业人" />
          </Form.Item>
          <Form.Item name="pickTime" label="拣料时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="pickStatus" label="拣料状态">
            <Select placeholder="为空默认 PENDING" options={[...WMS_PICK_STATUS_OPTIONS]} />
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
