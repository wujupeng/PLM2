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
import { erpProcessReportService } from '@/services/erpProcessService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PROCESS_REPORT_STATUS_LABEL,
  ERP_PROCESS_REPORT_STATUS_OPTIONS,
  type ErpProcessReport,
  type ErpProcessReportQuery,
  type ErpProcessReportSaveRequest,
} from '@/types/erpProcess';

const { Title } = Typography;

const MANAGE = 'erp:process:report:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpProcessReportSaveRequest, 'reportTime'> & {
  reportTime?: Dayjs;
};

export default function ErpProcessReportPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpProcessReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [reportStatus, setReportStatus] = useState<string | undefined>(undefined);
  const [planNo, setPlanNo] = useState('');
  const [productionOrderNo, setProductionOrderNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = reportStatus,
      plan = planNo,
      order = productionOrderNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpProcessReportQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          reportStatus: status,
          planNo: plan || undefined,
          productionOrderNo: order || undefined,
        };
        const res = await erpProcessReportService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, reportStatus, planNo, productionOrderNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ reportStatus: 'SUBMITTED' });
    setOpen(true);
  };

  const openEdit = (record: ErpProcessReport) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      reportTime: record.reportTime ? dayjs(record.reportTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpProcessReportSaveRequest = {
        ...values,
        reportTime: values.reportTime ? values.reportTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpProcessReportService.create(payload);
        message.success('工序报工已创建');
      } else {
        await erpProcessReportService.update(editId, payload);
        message.success('工序报工已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpProcessReportService.remove(id);
    message.success('工序报工已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpProcessReport> = [
    { title: '报工单号', dataIndex: 'reportNo', width: 170, fixed: 'left', render: plain },
    { title: '计划单号', dataIndex: 'planNo', width: 160, render: plain },
    { title: '生产订单号', dataIndex: 'productionOrderNo', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '工序号', dataIndex: 'operationNo', width: 100, render: plain },
    { title: '合格数量', dataIndex: 'qualifiedQty', width: 110, render: plain },
    { title: '不合格数量', dataIndex: 'unqualifiedQty', width: 120, render: plain },
    { title: '报废数量', dataIndex: 'scrapQty', width: 110, render: plain },
    { title: '报工人', dataIndex: 'reporter', width: 120, render: plain },
    { title: '报工时间', dataIndex: 'reportTime', width: 170, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '报工状态',
      dataIndex: 'reportStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_PROCESS_REPORT_STATUS_LABEL, v),
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
            <Popconfirm
              title="确认删除该工序报工？"
              onConfirm={() => record.id != null && void remove(record.id)}
            >
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
        工序报工
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="报工状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={reportStatus}
              onChange={(v) => setReportStatus(v)}
              options={[...ERP_PROCESS_REPORT_STATUS_OPTIONS]}
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
          <Form.Item label="生产订单号">
            <Input
              placeholder="请输入生产订单号"
              allowClear
              style={{ width: 160 }}
              value={productionOrderNo}
              onChange={(e) => setProductionOrderNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="报工单号 / 计划单号 / 生产订单号 / 物料编码 / 报工人"
              allowClear
              style={{ width: 280 }}
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
                  void loadData(1, pageSize, keyword, reportStatus, planNo, productionOrderNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setReportStatus(undefined);
                  setPlanNo('');
                  setProductionOrderNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建工序报工</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`工序报工（共 ${total} 条）`}>
        <Table<ErpProcessReport>
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
        title={editId == null ? '新建工序报工' : '编辑工序报工'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="reportNo" label="报工单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="planNo" label="计划单号">
            <Input placeholder="请输入计划单号" />
          </Form.Item>
          <Form.Item name="productionOrderNo" label="生产订单号">
            <Input placeholder="请输入生产订单号" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="operationNo" label="工序号">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入工序号" />
          </Form.Item>
          <Form.Item name="qualifiedQty" label="合格数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入合格数量" />
          </Form.Item>
          <Form.Item name="unqualifiedQty" label="不合格数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入不合格数量" />
          </Form.Item>
          <Form.Item name="scrapQty" label="报废数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入报废数量" />
          </Form.Item>
          <Form.Item name="reporter" label="报工人">
            <Input placeholder="请输入报工人" />
          </Form.Item>
          <Form.Item name="reportTime" label="报工时间">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择报工时间" />
          </Form.Item>
          <Form.Item name="reportStatus" label="报工状态">
            <Select placeholder="为空默认 SUBMITTED" options={[...ERP_PROCESS_REPORT_STATUS_OPTIONS]} />
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
