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
import { mesWorkReportService as service } from '@/services/mesReportService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_WORK_REPORT_STATUS_LABEL,
  MES_WORK_REPORT_STATUS_OPTIONS,
  MES_WORK_REPORT_TYPE_LABEL,
  MES_WORK_REPORT_TYPE_OPTIONS,
  type MesWorkReport,
  type MesWorkReportQuery,
  type MesWorkReportSaveRequest,
} from '@/types/mesReport';

const { Title } = Typography;

const MANAGE = 'mes:report:work:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesWorkReportSaveRequest, 'startTime' | 'endTime' | 'reportTime'> & {
  startTime?: Dayjs;
  endTime?: Dayjs;
  reportTime?: Dayjs;
};

export default function MesWorkReportPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesWorkReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [reportStatus, setReportStatus] = useState<string | undefined>(undefined);
  const [reportType, setReportType] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = reportStatus, type = reportType) => {
      setLoading(true);
      try {
        const params: MesWorkReportQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          reportStatus: status,
          reportType: type,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, reportStatus, reportType],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ reportType: 'START', reportStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesWorkReport) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      startTime: record.startTime ? dayjs(record.startTime) : undefined,
      endTime: record.endTime ? dayjs(record.endTime) : undefined,
      reportTime: record.reportTime ? dayjs(record.reportTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesWorkReportSaveRequest = {
        ...values,
        startTime: values.startTime ? values.startTime.format(DATETIME_FORMAT) : undefined,
        endTime: values.endTime ? values.endTime.format(DATETIME_FORMAT) : undefined,
        reportTime: values.reportTime ? values.reportTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('工序报工单已创建');
      } else {
        await service.update(editId, payload);
        message.success('工序报工单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('工序报工单已删除');
    void loadData();
  };

  const columns: ColumnsType<MesWorkReport> = [
    { title: '报工单号', dataIndex: 'reportNo', width: 190, fixed: 'left', render: plain },
    { title: '生产工单号', dataIndex: 'workOrderNo', width: 170, render: plain },
    { title: '派工单号', dataIndex: 'dispatchNo', width: 170, render: plain },
    { title: '工序编码', dataIndex: 'processCode', width: 120, render: plain },
    { title: '工序名称', dataIndex: 'processName', width: 150, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '设备编码', dataIndex: 'equipmentCode', width: 120, render: plain },
    { title: '产线编码', dataIndex: 'lineCode', width: 110, render: plain },
    { title: '操作工', dataIndex: 'operator', width: 110, render: plain },
    { title: '班次', dataIndex: 'shiftCode', width: 90, render: plain },
    {
      title: '报工类型',
      dataIndex: 'reportType',
      width: 110,
      render: (v) => statusTag(MES_WORK_REPORT_TYPE_LABEL, v),
    },
    { title: '良品数', dataIndex: 'goodQty', width: 100, render: plain },
    { title: '不良数', dataIndex: 'badQty', width: 100, render: plain },
    { title: '返工数', dataIndex: 'reworkQty', width: 100, render: plain },
    { title: '报工数量', dataIndex: 'reportQty', width: 110, render: plain },
    { title: '开工时间', dataIndex: 'startTime', width: 170, render: formatDateTime },
    { title: '完工时间', dataIndex: 'endTime', width: 170, render: formatDateTime },
    { title: '时长(分)', dataIndex: 'durationMinutes', width: 110, render: plain },
    { title: '工时(时)', dataIndex: 'workHours', width: 110, render: plain },
    {
      title: '报工状态',
      dataIndex: 'reportStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_WORK_REPORT_STATUS_LABEL, v),
    },
    { title: '报工时间', dataIndex: 'reportTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该工序报工单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        工序报工单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="报工状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={reportStatus}
              onChange={(v) => setReportStatus(v)}
              options={[...MES_WORK_REPORT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="报工类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={reportType}
              onChange={(v) => setReportType(v)}
              options={[...MES_WORK_REPORT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="报工单号 / 工单号 / 派工单号 / 工序编码 / 物料编码"
              allowClear
              style={{ width: 420 }}
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
                  void loadData(1, pageSize, keyword, reportStatus, reportType);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setReportStatus(undefined);
                  setReportType(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建工序报工单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`工序报工单（共 ${total} 条）`}>
        <Table<MesWorkReport>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 3000 }}
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
        title={editId == null ? '新建工序报工单' : '编辑工序报工单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="reportNo" label="报工单号">
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
          <Form.Item name="processName" label="工序名称">
            <Input placeholder="请输入工序名称" />
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
          <Form.Item name="equipmentCode" label="设备编码">
            <Input placeholder="请输入设备编码" />
          </Form.Item>
          <Form.Item name="lineCode" label="产线编码">
            <Input placeholder="请输入产线编码" />
          </Form.Item>
          <Form.Item name="operator" label="操作工">
            <Input placeholder="请输入操作工" />
          </Form.Item>
          <Form.Item name="shiftCode" label="班次">
            <Input placeholder="请输入班次编码" />
          </Form.Item>
          <Form.Item name="reportType" label="报工类型">
            <Select placeholder="为空默认 START" options={[...MES_WORK_REPORT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="goodQty" label="良品数">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入良品数" />
          </Form.Item>
          <Form.Item name="badQty" label="不良数">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入不良数" />
          </Form.Item>
          <Form.Item name="reworkQty" label="返工数">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入返工数" />
          </Form.Item>
          <Form.Item name="reportQty" label="报工数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入报工数量" />
          </Form.Item>
          <Form.Item name="startTime" label="开工时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endTime" label="完工时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="durationMinutes" label="时长(分钟)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入时长（分钟）" />
          </Form.Item>
          <Form.Item name="workHours" label="工时(小时)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入工时（小时）" />
          </Form.Item>
          <Form.Item name="reportStatus" label="报工状态">
            <Select placeholder="为空默认 DRAFT" options={[...MES_WORK_REPORT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="reportTime" label="报工时间">
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
