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
import { mesLaborHourService as service } from '@/services/mesReportService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_LABOR_STATUS_LABEL,
  MES_LABOR_STATUS_OPTIONS,
  type MesLaborHour,
  type MesLaborHourQuery,
  type MesLaborHourSaveRequest,
} from '@/types/mesReport';

const { Title } = Typography;

const MANAGE = 'mes:report:labor:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesLaborHourSaveRequest, 'workDate' | 'confirmTime'> & {
  workDate?: Dayjs;
  confirmTime?: Dayjs;
};

export default function MesLaborHourPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesLaborHour[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [laborStatus, setLaborStatus] = useState<string | undefined>(undefined);
  const [worker, setWorker] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = laborStatus, wk = worker) => {
      setLoading(true);
      try {
        const params: MesLaborHourQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          laborStatus: status,
          worker: wk || undefined,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, laborStatus, worker],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ laborStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesLaborHour) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      workDate: record.workDate ? dayjs(record.workDate) : undefined,
      confirmTime: record.confirmTime ? dayjs(record.confirmTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesLaborHourSaveRequest = {
        ...values,
        workDate: values.workDate ? values.workDate.format(DATETIME_FORMAT) : undefined,
        confirmTime: values.confirmTime ? values.confirmTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('工时记录已创建');
      } else {
        await service.update(editId, payload);
        message.success('工时记录已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('工时记录已删除');
    void loadData();
  };

  const columns: ColumnsType<MesLaborHour> = [
    { title: '工时单号', dataIndex: 'laborNo', width: 190, fixed: 'left', render: plain },
    { title: '生产工单号', dataIndex: 'workOrderNo', width: 170, render: plain },
    { title: '派工单号', dataIndex: 'dispatchNo', width: 170, render: plain },
    { title: '工序编码', dataIndex: 'processCode', width: 120, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '操作工', dataIndex: 'worker', width: 110, render: plain },
    { title: '班次', dataIndex: 'shiftCode', width: 90, render: plain },
    { title: '工作日期', dataIndex: 'workDate', width: 170, render: formatDateTime },
    { title: '正常工时', dataIndex: 'normalHours', width: 110, render: plain },
    { title: '加班工时', dataIndex: 'overtimeHours', width: 110, render: plain },
    { title: '总工时', dataIndex: 'totalHours', width: 110, render: plain },
    {
      title: '工时状态',
      dataIndex: 'laborStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_LABOR_STATUS_LABEL, v),
    },
    { title: '确认时间', dataIndex: 'confirmTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该工时记录？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        工时记录
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="工时状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={laborStatus}
              onChange={(v) => setLaborStatus(v)}
              options={[...MES_LABOR_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="操作工">
            <Input
              placeholder="请输入操作工"
              allowClear
              style={{ width: 160 }}
              value={worker}
              onChange={(e) => setWorker(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="工时单号 / 工单号 / 操作工 / 物料编码 / 物料名称"
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
                  void loadData(1, pageSize, keyword, laborStatus, worker);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setLaborStatus(undefined);
                  setWorker('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建工时记录</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`工时记录（共 ${total} 条）`}>
        <Table<MesLaborHour>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2200 }}
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
        title={editId == null ? '新建工时记录' : '编辑工时记录'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="laborNo" label="工时单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="workOrderNo" label="生产工单号">
            <Input placeholder="请输入生产工单号" />
          </Form.Item>
          <Form.Item name="dispatchNo" label="派工单号">
            <Input placeholder="请输入派工单号" />
          </Form.Item>
          <Form.Item name="processCode" label="工序编码">
            <Input placeholder="请输入工序编码" />
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
          <Form.Item name="worker" label="操作工">
            <Input placeholder="请输入操作工" />
          </Form.Item>
          <Form.Item name="shiftCode" label="班次">
            <Input placeholder="请输入班次编码" />
          </Form.Item>
          <Form.Item name="workDate" label="工作日期">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="normalHours" label="正常工时">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入正常工时" />
          </Form.Item>
          <Form.Item name="overtimeHours" label="加班工时">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入加班工时" />
          </Form.Item>
          <Form.Item name="totalHours" label="总工时">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入总工时" />
          </Form.Item>
          <Form.Item name="laborStatus" label="工时状态">
            <Select placeholder="为空默认 DRAFT" options={[...MES_LABOR_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="confirmTime" label="确认时间">
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
