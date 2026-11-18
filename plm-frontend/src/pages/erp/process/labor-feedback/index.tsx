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
import { erpProcessLaborService } from '@/services/erpProcessService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PROCESS_LABOR_STATUS_LABEL,
  ERP_PROCESS_LABOR_STATUS_OPTIONS,
  ERP_PROCESS_LABOR_TYPE_LABEL,
  ERP_PROCESS_LABOR_TYPE_OPTIONS,
  type ErpProcessLabor,
  type ErpProcessLaborQuery,
  type ErpProcessLaborSaveRequest,
} from '@/types/erpProcess';

const { Title } = Typography;

const MANAGE = 'erp:process:labor:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpProcessLaborSaveRequest, 'startTime' | 'endTime'> & {
  startTime?: Dayjs;
  endTime?: Dayjs;
};

export default function ErpProcessLaborPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpProcessLabor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [laborType, setLaborType] = useState<string | undefined>(undefined);
  const [laborStatus, setLaborStatus] = useState<string | undefined>(undefined);
  const [planNo, setPlanNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = laborType,
      status = laborStatus,
      plan = planNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpProcessLaborQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          laborType: type,
          laborStatus: status,
          planNo: plan || undefined,
        };
        const res = await erpProcessLaborService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, laborType, laborStatus, planNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ laborType: 'RUN', laborStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpProcessLabor) => {
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
      const payload: ErpProcessLaborSaveRequest = {
        ...values,
        startTime: values.startTime ? values.startTime.format(DATETIME_FORMAT) : undefined,
        endTime: values.endTime ? values.endTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpProcessLaborService.create(payload);
        message.success('工时反馈已创建');
      } else {
        await erpProcessLaborService.update(editId, payload);
        message.success('工时反馈已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpProcessLaborService.remove(id);
    message.success('工时反馈已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpProcessLabor> = [
    { title: '反馈单号', dataIndex: 'feedbackNo', width: 170, fixed: 'left', render: plain },
    { title: '计划单号', dataIndex: 'planNo', width: 150, render: plain },
    { title: '报工单号', dataIndex: 'reportNo', width: 150, render: plain },
    { title: '资源编码', dataIndex: 'resourceCode', width: 140, render: plain },
    { title: '操作工', dataIndex: 'operatorName', width: 120, render: plain },
    {
      title: '工时类型',
      dataIndex: 'laborType',
      width: 110,
      render: (v) => statusTag(ERP_PROCESS_LABOR_TYPE_LABEL, v),
    },
    { title: '标准工时', dataIndex: 'standardHours', width: 110, render: plain },
    { title: '实际工时', dataIndex: 'actualHours', width: 110, render: plain },
    { title: '开始时间', dataIndex: 'startTime', width: 170, render: formatDateTime },
    { title: '结束时间', dataIndex: 'endTime', width: 170, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '工时状态',
      dataIndex: 'laborStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_PROCESS_LABOR_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该工时反馈？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        工时反馈
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="工时类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={laborType}
              onChange={(v) => setLaborType(v)}
              options={[...ERP_PROCESS_LABOR_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="工时状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={laborStatus}
              onChange={(v) => setLaborStatus(v)}
              options={[...ERP_PROCESS_LABOR_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="计划单号">
            <Input
              placeholder="请输入计划单号"
              allowClear
              style={{ width: 160 }}
              value={planNo}
              onChange={(e) => setPlanNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="反馈单号 / 计划单号 / 报工单号 / 资源编码 / 操作工"
              allowClear
              style={{ width: 320 }}
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
                  void loadData(1, pageSize, keyword, laborType, laborStatus, planNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setLaborType(undefined);
                  setLaborStatus(undefined);
                  setPlanNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建工时反馈</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`工时反馈（共 ${total} 条）`}>
        <Table<ErpProcessLabor>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2400 }}
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
        title={editId == null ? '新建工时反馈' : '编辑工时反馈'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="feedbackNo" label="反馈单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="planNo" label="计划单号">
            <Input placeholder="请输入计划单号" />
          </Form.Item>
          <Form.Item name="reportNo" label="报工单号">
            <Input placeholder="请输入报工单号" />
          </Form.Item>
          <Form.Item name="resourceCode" label="资源编码">
            <Input placeholder="请输入资源编码" />
          </Form.Item>
          <Form.Item name="operatorName" label="操作工">
            <Input placeholder="请输入操作工" />
          </Form.Item>
          <Form.Item name="laborType" label="工时类型">
            <Select placeholder="为空默认 RUN" options={[...ERP_PROCESS_LABOR_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="standardHours" label="标准工时">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入标准工时" />
          </Form.Item>
          <Form.Item name="actualHours" label="实际工时">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入实际工时" />
          </Form.Item>
          <Form.Item name="startTime" label="开始时间">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择开始时间" />
          </Form.Item>
          <Form.Item name="endTime" label="结束时间">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择结束时间" />
          </Form.Item>
          <Form.Item name="laborStatus" label="工时状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_PROCESS_LABOR_STATUS_OPTIONS]} />
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
