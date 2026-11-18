/** G3-N6 ERP 财务核算（T028）会计期间页面。 */
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
import { erpFinancePeriodService } from '@/services/erpFinanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_FINANCE_PERIOD_STATUS_LABEL,
  ERP_FINANCE_PERIOD_STATUS_OPTIONS,
  type ErpFinancePeriod,
  type ErpFinancePeriodQuery,
  type ErpFinancePeriodSaveRequest,
} from '@/types/erpFinance';

const { Title } = Typography;

const MANAGE = 'erp:finance:period:manage';

/** 日期提交格式。 */
const DATE_FORMAT = 'YYYY-MM-DD';

type FormValues = Omit<ErpFinancePeriodSaveRequest, 'startDate' | 'endDate'> & {
  startDate?: Dayjs;
  endDate?: Dayjs;
};

export default function ErpFinancePeriodPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpFinancePeriod[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [periodStatus, setPeriodStatus] = useState<string | undefined>(undefined);
  const [periodYear, setPeriodYear] = useState<number | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = periodStatus,
      year = periodYear,
    ) => {
      setLoading(true);
      try {
        const params: ErpFinancePeriodQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          periodStatus: status,
          periodYear: year,
        };
        const res = await erpFinancePeriodService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, periodStatus, periodYear],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ periodStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: ErpFinancePeriod) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : undefined,
      endDate: record.endDate ? dayjs(record.endDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpFinancePeriodSaveRequest = {
        ...values,
        startDate: values.startDate ? values.startDate.format(DATE_FORMAT) : undefined,
        endDate: values.endDate ? values.endDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpFinancePeriodService.create(payload);
        message.success('会计期间已创建');
      } else {
        await erpFinancePeriodService.update(editId, payload);
        message.success('会计期间已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpFinancePeriodService.remove(id);
    message.success('会计期间已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpFinancePeriod> = [
    { title: '期间编码', dataIndex: 'periodCode', width: 150, fixed: 'left', render: plain },
    { title: '期间年度', dataIndex: 'periodYear', width: 100, render: plain },
    { title: '期间月份', dataIndex: 'periodMonth', width: 100, render: plain },
    { title: '开始日期', dataIndex: 'startDate', width: 120, render: plain },
    { title: '结束日期', dataIndex: 'endDate', width: 120, render: plain },
    {
      title: '期间状态',
      dataIndex: 'periodStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_FINANCE_PERIOD_STATUS_LABEL, v),
    },
    { title: '关账时间', dataIndex: 'closedAt', width: 170, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
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
            <Popconfirm title="确认删除该会计期间？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        会计期间
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="期间状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={periodStatus}
              onChange={(v) => setPeriodStatus(v)}
              options={[...ERP_FINANCE_PERIOD_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="期间年度">
            <InputNumber
              min={2000}
              max={2999}
              precision={0}
              style={{ width: 140 }}
              placeholder="请输入年度"
              value={periodYear}
              onChange={(v) => setPeriodYear(v ?? undefined)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="期间编码"
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
                  void loadData(1, pageSize, keyword, periodStatus, periodYear);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setPeriodStatus(undefined);
                  setPeriodYear(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建会计期间</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`会计期间（共 ${total} 条）`}>
        <Table<ErpFinancePeriod>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1700 }}
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
        title={editId == null ? '新建会计期间' : '编辑会计期间'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="periodCode"
            label="期间编码"
            rules={[{ required: true, message: '请输入期间编码' }]}
          >
            <Input placeholder="请输入期间编码" />
          </Form.Item>
          <Form.Item name="periodYear" label="期间年度">
            <InputNumber min={2000} max={2999} precision={0} style={{ width: '100%' }} placeholder="请输入期间年度" />
          </Form.Item>
          <Form.Item name="periodMonth" label="期间月份">
            <InputNumber min={1} max={12} precision={0} style={{ width: '100%' }} placeholder="请输入期间月份" />
          </Form.Item>
          <Form.Item name="startDate" label="开始日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择开始日期" />
          </Form.Item>
          <Form.Item name="endDate" label="结束日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择结束日期" />
          </Form.Item>
          <Form.Item name="periodStatus" label="期间状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_FINANCE_PERIOD_STATUS_OPTIONS]} />
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
