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
import { erpFinanceAccrualService } from '@/services/erpFinanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_FINANCE_ACCRUAL_STATUS_LABEL,
  ERP_FINANCE_ACCRUAL_STATUS_OPTIONS,
  ERP_FINANCE_ACCRUAL_TYPE_LABEL,
  ERP_FINANCE_ACCRUAL_TYPE_OPTIONS,
  type ErpFinanceAccrual,
  type ErpFinanceAccrualQuery,
  type ErpFinanceAccrualSaveRequest,
} from '@/types/erpFinance';

const { Title } = Typography;

const MANAGE = 'erp:finance:accrual:manage';

/** 日期提交格式。 */
const DATE_FORMAT = 'YYYY-MM-DD';

type FormValues = Omit<ErpFinanceAccrualSaveRequest, 'accrualDate'> & {
  accrualDate?: Dayjs;
};

export default function ErpFinanceAccrualPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpFinanceAccrual[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [accrualType, setAccrualType] = useState<string | undefined>(undefined);
  const [accrualStatus, setAccrualStatus] = useState<string | undefined>(undefined);
  const [partyCode, setPartyCode] = useState('');
  const [periodCode, setPeriodCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = accrualType,
      status = accrualStatus,
      party = partyCode,
      period = periodCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpFinanceAccrualQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          accrualType: type,
          accrualStatus: status,
          partyCode: party || undefined,
          periodCode: period || undefined,
        };
        const res = await erpFinanceAccrualService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, accrualType, accrualStatus, partyCode, periodCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      accrualType: 'AP',
      currencyCode: 'CNY',
      reversed: 0,
      accrualStatus: 'DRAFT',
    });
    setOpen(true);
  };

  const openEdit = (record: ErpFinanceAccrual) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      accrualDate: record.accrualDate ? dayjs(record.accrualDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpFinanceAccrualSaveRequest = {
        ...values,
        accrualDate: values.accrualDate ? values.accrualDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpFinanceAccrualService.create(payload);
        message.success('暂估已创建');
      } else {
        await erpFinanceAccrualService.update(editId, payload);
        message.success('暂估已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpFinanceAccrualService.remove(id);
    message.success('暂估已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpFinanceAccrual> = [
    { title: '暂估单号', dataIndex: 'accrualNo', width: 170, fixed: 'left', render: plain },
    {
      title: '暂估类型',
      dataIndex: 'accrualType',
      width: 110,
      render: (v) => statusTag(ERP_FINANCE_ACCRUAL_TYPE_LABEL, v),
    },
    { title: '往来单位编码', dataIndex: 'partyCode', width: 130, render: plain },
    { title: '往来单位名称', dataIndex: 'partyName', width: 160, render: plain },
    { title: '来源单号', dataIndex: 'sourceNo', width: 150, render: plain },
    { title: '会计期间编码', dataIndex: 'periodCode', width: 130, render: plain },
    { title: '暂估金额', dataIndex: 'amount', width: 110, render: plain },
    { title: '税额', dataIndex: 'taxAmount', width: 100, render: plain },
    { title: '币种', dataIndex: 'currencyCode', width: 90, render: plain },
    { title: '暂估日期', dataIndex: 'accrualDate', width: 120, render: plain },
    { title: '是否已冲回', dataIndex: 'reversed', width: 110, render: plain },
    {
      title: '暂估状态',
      dataIndex: 'accrualStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_FINANCE_ACCRUAL_STATUS_LABEL, v),
    },
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
            <Popconfirm title="确认删除该暂估？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        暂估
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="暂估类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={accrualType}
              onChange={(v) => setAccrualType(v)}
              options={[...ERP_FINANCE_ACCRUAL_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="暂估状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={accrualStatus}
              onChange={(v) => setAccrualStatus(v)}
              options={[...ERP_FINANCE_ACCRUAL_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="往来单位编码">
            <Input
              placeholder="请输入往来单位编码"
              allowClear
              style={{ width: 170 }}
              value={partyCode}
              onChange={(e) => setPartyCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="会计期间编码">
            <Input
              placeholder="请输入会计期间编码"
              allowClear
              style={{ width: 170 }}
              value={periodCode}
              onChange={(e) => setPeriodCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="暂估单号 / 来源单号 / 往来单位名称"
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
                  void loadData(1, pageSize, keyword, accrualType, accrualStatus, partyCode, periodCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setAccrualType(undefined);
                  setAccrualStatus(undefined);
                  setPartyCode('');
                  setPeriodCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建暂估</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`暂估（共 ${total} 条）`}>
        <Table<ErpFinanceAccrual>
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
        title={editId == null ? '新建暂估' : '编辑暂估'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="accrualNo" label="暂估单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="accrualType" label="暂估类型">
            <Select placeholder="为空默认 AP" options={[...ERP_FINANCE_ACCRUAL_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item
            name="partyCode"
            label="往来单位编码"
            rules={[{ required: true, message: '请输入往来单位编码' }]}
          >
            <Input placeholder="请输入往来单位编码" />
          </Form.Item>
          <Form.Item name="partyName" label="往来单位名称">
            <Input placeholder="请输入往来单位名称" />
          </Form.Item>
          <Form.Item name="sourceNo" label="来源单号">
            <Input placeholder="请输入来源单号" />
          </Form.Item>
          <Form.Item name="periodCode" label="会计期间编码">
            <Input placeholder="请输入会计期间编码" />
          </Form.Item>
          <Form.Item name="amount" label="暂估金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入暂估金额" />
          </Form.Item>
          <Form.Item name="taxAmount" label="税额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入税额" />
          </Form.Item>
          <Form.Item name="currencyCode" label="币种">
            <Input placeholder="为空默认 CNY" />
          </Form.Item>
          <Form.Item name="accrualDate" label="暂估日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择暂估日期" />
          </Form.Item>
          <Form.Item name="reversed" label="是否已冲回">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入是否已冲回" />
          </Form.Item>
          <Form.Item name="accrualStatus" label="暂估状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_FINANCE_ACCRUAL_STATUS_OPTIONS]} />
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
