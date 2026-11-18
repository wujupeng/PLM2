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
import { mesScheduleService as service } from '@/services/mesPlanService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_SCHEDULE_STATUS_LABEL,
  MES_SCHEDULE_STATUS_OPTIONS,
  type MesSchedule,
  type MesScheduleQuery,
  type MesScheduleSaveRequest,
} from '@/types/mesPlan';

const { Title } = Typography;

const MANAGE = 'mes:plan:schedule:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesScheduleSaveRequest, 'scheduleStartTime' | 'scheduleEndTime' | 'scheduleTime'> & {
  scheduleStartTime?: Dayjs;
  scheduleEndTime?: Dayjs;
  scheduleTime?: Dayjs;
};

export default function MesSchedulePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesSchedule[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [scheduleStatus, setScheduleStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = scheduleStatus) => {
      setLoading(true);
      try {
        const params: MesScheduleQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          scheduleStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, scheduleStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ scheduleStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesSchedule) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      scheduleStartTime: record.scheduleStartTime ? dayjs(record.scheduleStartTime) : undefined,
      scheduleEndTime: record.scheduleEndTime ? dayjs(record.scheduleEndTime) : undefined,
      scheduleTime: record.scheduleTime ? dayjs(record.scheduleTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesScheduleSaveRequest = {
        ...values,
        scheduleStartTime: values.scheduleStartTime
          ? values.scheduleStartTime.format(DATETIME_FORMAT)
          : undefined,
        scheduleEndTime: values.scheduleEndTime ? values.scheduleEndTime.format(DATETIME_FORMAT) : undefined,
        scheduleTime: values.scheduleTime ? values.scheduleTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('排产计划已创建');
      } else {
        await service.update(editId, payload);
        message.success('排产计划已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('排产计划已删除');
    void loadData();
  };

  const columns: ColumnsType<MesSchedule> = [
    { title: '排产单号', dataIndex: 'scheduleNo', width: 190, fixed: 'left', render: plain },
    { title: '工单号', dataIndex: 'workOrderNo', width: 170, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '产线编码', dataIndex: 'lineCode', width: 110, render: plain },
    { title: '计划数量', dataIndex: 'planQty', width: 110, render: plain },
    { title: '已排产数量', dataIndex: 'scheduledQty', width: 120, render: plain },
    { title: '排产开始时间', dataIndex: 'scheduleStartTime', width: 170, render: formatDateTime },
    { title: '排产结束时间', dataIndex: 'scheduleEndTime', width: 170, render: formatDateTime },
    {
      title: '排产状态',
      dataIndex: 'scheduleStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_SCHEDULE_STATUS_LABEL, v),
    },
    { title: '排产人', dataIndex: 'scheduler', width: 120, render: plain },
    { title: '排产时间', dataIndex: 'scheduleTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该排产计划？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        排产计划
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="排产状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={scheduleStatus}
              onChange={(v) => setScheduleStatus(v)}
              options={[...MES_SCHEDULE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="排产单号 / 工单号 / 物料编码 / 物料名称"
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
                  void loadData(1, pageSize, keyword, scheduleStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setScheduleStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建排产计划</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`排产计划（共 ${total} 条）`}>
        <Table<MesSchedule>
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
        title={editId == null ? '新建排产计划' : '编辑排产计划'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="scheduleNo" label="排产单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="workOrderNo" label="工单号">
            <Input placeholder="请输入工单号" />
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
          <Form.Item name="lineCode" label="产线编码">
            <Input placeholder="请输入产线编码" />
          </Form.Item>
          <Form.Item name="planQty" label="计划数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="scheduledQty" label="已排产数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="scheduleStartTime" label="排产开始时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="scheduleEndTime" label="排产结束时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="scheduleStatus" label="排产状态">
            <Select placeholder="为空默认 DRAFT" options={[...MES_SCHEDULE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="scheduler" label="排产人">
            <Input placeholder="请输入排产人" />
          </Form.Item>
          <Form.Item name="scheduleTime" label="排产时间">
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
