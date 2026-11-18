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
import { erpFinanceWriteoffService } from '@/services/erpFinanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_FINANCE_WRITEOFF_STATUS_LABEL,
  ERP_FINANCE_WRITEOFF_STATUS_OPTIONS,
  ERP_FINANCE_WRITEOFF_TYPE_LABEL,
  ERP_FINANCE_WRITEOFF_TYPE_OPTIONS,
  type ErpFinanceWriteoff,
  type ErpFinanceWriteoffQuery,
  type ErpFinanceWriteoffSaveRequest,
} from '@/types/erpFinance';

const { Title } = Typography;

const MANAGE = 'erp:finance:writeoff:manage';

/** 日期提交格式。 */
const DATE_FORMAT = 'YYYY-MM-DD';

type FormValues = Omit<ErpFinanceWriteoffSaveRequest, 'writeoffDate'> & {
  writeoffDate?: Dayjs;
};

export default function ErpFinanceWriteoffPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpFinanceWriteoff[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [writeoffType, setWriteoffType] = useState<string | undefined>(undefined);
  const [writeoffStatus, setWriteoffStatus] = useState<string | undefined>(undefined);
  const [partyCode, setPartyCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = writeoffType,
      status = writeoffStatus,
      party = partyCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpFinanceWriteoffQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          writeoffType: type,
          writeoffStatus: status,
          partyCode: party || undefined,
        };
        const res = await erpFinanceWriteoffService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, writeoffType, writeoffStatus, partyCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ writeoffType: 'AR', currencyCode: 'CNY', writeoffStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpFinanceWriteoff) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      writeoffDate: record.writeoffDate ? dayjs(record.writeoffDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpFinanceWriteoffSaveRequest = {
        ...values,
        writeoffDate: values.writeoffDate ? values.writeoffDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpFinanceWriteoffService.create(payload);
        message.success('核销单已创建');
      } else {
        await erpFinanceWriteoffService.update(editId, payload);
        message.success('核销单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpFinanceWriteoffService.remove(id);
    message.success('核销单已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpFinanceWriteoff> = [
    { title: '核销单号', dataIndex: 'writeoffNo', width: 170, fixed: 'left', render: plain },
    {
      title: '核销类型',
      dataIndex: 'writeoffType',
      width: 110,
      render: (v) => statusTag(ERP_FINANCE_WRITEOFF_TYPE_LABEL, v),
    },
    { title: '往来单位编码', dataIndex: 'partyCode', width: 130, render: plain },
    { title: '往来单位名称', dataIndex: 'partyName', width: 160, render: plain },
    { title: '来源单据号', dataIndex: 'sourceNo', width: 150, render: plain },
    { title: '目标单据号', dataIndex: 'targetNo', width: 150, render: plain },
    { title: '核销金额', dataIndex: 'writeoffAmount', width: 110, render: plain },
    { title: '币种', dataIndex: 'currencyCode', width: 90, render: plain },
    { title: '核销日期', dataIndex: 'writeoffDate', width: 120, render: plain },
    {
      title: '核销状态',
      dataIndex: 'writeoffStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_FINANCE_WRITEOFF_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该核销单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        核销单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="核销类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={writeoffType}
              onChange={(v) => setWriteoffType(v)}
              options={[...ERP_FINANCE_WRITEOFF_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="核销状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={writeoffStatus}
              onChange={(v) => setWriteoffStatus(v)}
              options={[...ERP_FINANCE_WRITEOFF_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="往来单位编码">
            <Input
              placeholder="请输入往来单位编码"
              allowClear
              style={{ width: 160 }}
              value={partyCode}
              onChange={(e) => setPartyCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="核销单号 / 来源单号 / 目标单号"
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
                  void loadData(1, pageSize, keyword, writeoffType, writeoffStatus, partyCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setWriteoffType(undefined);
                  setWriteoffStatus(undefined);
                  setPartyCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建核销单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`核销单（共 ${total} 条）`}>
        <Table<ErpFinanceWriteoff>
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
        title={editId == null ? '新建核销单' : '编辑核销单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="writeoffNo" label="核销单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="writeoffType" label="核销类型">
            <Select placeholder="为空默认 AR" options={[...ERP_FINANCE_WRITEOFF_TYPE_OPTIONS]} />
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
          <Form.Item name="sourceNo" label="来源单据号">
            <Input placeholder="请输入来源单据号" />
          </Form.Item>
          <Form.Item name="targetNo" label="目标单据号">
            <Input placeholder="请输入目标单据号" />
          </Form.Item>
          <Form.Item name="writeoffAmount" label="核销金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入核销金额" />
          </Form.Item>
          <Form.Item name="currencyCode" label="币种">
            <Input placeholder="为空默认 CNY" />
          </Form.Item>
          <Form.Item name="writeoffDate" label="核销日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择核销日期" />
          </Form.Item>
          <Form.Item name="writeoffStatus" label="核销状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_FINANCE_WRITEOFF_STATUS_OPTIONS]} />
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
