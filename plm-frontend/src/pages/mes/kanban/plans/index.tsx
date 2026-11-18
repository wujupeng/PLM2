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
import { mesKanbanPlanService as service } from '@/services/mesKanbanService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_KANBAN_RECORD_STATUS_LABEL,
  MES_KANBAN_RECORD_STATUS_OPTIONS,
  type MesKanbanPlan,
  type MesKanbanPlanQuery,
  type MesKanbanPlanSaveRequest,
} from '@/types/mesKanban';

const { Title } = Typography;

const MANAGE = 'mes:kanban:plan:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesKanbanPlanSaveRequest, 'planDate'> & {
  planDate?: Dayjs;
};

export default function MesKanbanPlanPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesKanbanPlan[]>([]);
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
        const params: MesKanbanPlanQuery = {
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

  const openEdit = (record: MesKanbanPlan) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      planDate: record.planDate ? dayjs(record.planDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesKanbanPlanSaveRequest = {
        ...values,
        planDate: values.planDate ? values.planDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('计划达成已创建');
      } else {
        await service.update(editId, payload);
        message.success('计划达成已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('计划达成已删除');
    void loadData();
  };

  const columns: ColumnsType<MesKanbanPlan> = [
    { title: '计划单号', dataIndex: 'planNo', width: 190, fixed: 'left', render: plain },
    { title: '工单号', dataIndex: 'workOrderNo', width: 150, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '计划数量', dataIndex: 'planQty', width: 110, render: plain },
    { title: '完工数量', dataIndex: 'finishQty', width: 110, render: plain },
    { title: '达成率', dataIndex: 'achieveRate', width: 110, render: plain },
    { title: '计划日期', dataIndex: 'planDate', width: 170, render: formatDateTime },
    { title: '产线编码', dataIndex: 'lineCode', width: 130, render: plain },
    { title: '班次编码', dataIndex: 'shiftCode', width: 100, render: plain },
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
            <Popconfirm title="确认删除该计划达成记录？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        计划达成
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
              placeholder="计划单号 / 工单号 / 物料编码 / 物料名称"
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
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建计划达成</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`计划达成（共 ${total} 条）`}>
        <Table<MesKanbanPlan>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1820 }}
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
        title={editId == null ? '新建计划达成' : '编辑计划达成'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="planNo" label="计划单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="workOrderNo" label="工单号">
            <Input placeholder="请输入工单号" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="planQty" label="计划数量">
            <InputNumber style={{ width: '100%' }} placeholder="请输入计划数量" />
          </Form.Item>
          <Form.Item name="finishQty" label="完工数量">
            <InputNumber style={{ width: '100%' }} placeholder="请输入完工数量" />
          </Form.Item>
          <Form.Item name="achieveRate" label="达成率">
            <InputNumber style={{ width: '100%' }} placeholder="请输入达成率" />
          </Form.Item>
          <Form.Item name="planDate" label="计划日期">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="lineCode" label="产线编码">
            <Input placeholder="请输入产线编码" />
          </Form.Item>
          <Form.Item name="shiftCode" label="班次编码">
            <Input placeholder="请输入班次编码" />
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
