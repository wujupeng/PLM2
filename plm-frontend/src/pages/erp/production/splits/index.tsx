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
import { erpProductionOrderSplitService } from '@/services/erpProductionService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PRODUCTION_SPLIT_STATUS_LABEL,
  ERP_PRODUCTION_SPLIT_STATUS_OPTIONS,
  ERP_PRODUCTION_SPLIT_TYPE_LABEL,
  ERP_PRODUCTION_SPLIT_TYPE_OPTIONS,
  type ErpProductionOrderSplit,
  type ErpProductionOrderSplitQuery,
  type ErpProductionOrderSplitSaveRequest,
} from '@/types/erpProduction';

const { Title } = Typography;

const MANAGE = 'erp:production:split:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpProductionOrderSplitSaveRequest, 'splitDate'> & {
  splitDate?: Dayjs;
};

export default function ErpProductionOrderSplitPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpProductionOrderSplit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [splitStatus, setSplitStatus] = useState<string | undefined>(undefined);
  const [splitType, setSplitType] = useState<string | undefined>(undefined);
  const [sourceOrderNo, setSourceOrderNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = splitStatus,
      type = splitType,
      source = sourceOrderNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpProductionOrderSplitQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          splitStatus: status,
          splitType: type,
          sourceOrderNo: source || undefined,
        };
        const res = await erpProductionOrderSplitService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, splitStatus, splitType, sourceOrderNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ splitType: 'QTY', splitStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpProductionOrderSplit) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      splitDate: record.splitDate ? dayjs(record.splitDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpProductionOrderSplitSaveRequest = {
        ...values,
        splitDate: values.splitDate ? values.splitDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpProductionOrderSplitService.create(payload);
        message.success('订单拆分单已创建');
      } else {
        await erpProductionOrderSplitService.update(editId, payload);
        message.success('订单拆分单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpProductionOrderSplitService.remove(id);
    message.success('订单拆分单已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpProductionOrderSplit> = [
    { title: '拆分单号', dataIndex: 'splitNo', width: 170, fixed: 'left', render: plain },
    { title: '源生产订单ID', dataIndex: 'sourceOrderId', width: 130, render: plain },
    { title: '源生产订单号', dataIndex: 'sourceOrderNo', width: 160, render: plain },
    { title: '目标订单ID', dataIndex: 'targetOrderId', width: 120, render: plain },
    { title: '目标订单号', dataIndex: 'targetOrderNo', width: 160, render: plain },
    { title: '拆分数量', dataIndex: 'splitQty', width: 110, render: plain },
    {
      title: '拆分类型',
      dataIndex: 'splitType',
      width: 120,
      render: (v) => statusTag(ERP_PRODUCTION_SPLIT_TYPE_LABEL, v),
    },
    { title: '拆分原因', dataIndex: 'splitReason', width: 160, ellipsis: true, render: plain },
    { title: '拆分人', dataIndex: 'splitBy', width: 120, render: plain },
    { title: '拆分日期', dataIndex: 'splitDate', width: 170, render: formatDateTime },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '拆分状态',
      dataIndex: 'splitStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_PRODUCTION_SPLIT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该订单拆分单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        订单拆分
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="拆分状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={splitStatus}
              onChange={(v) => setSplitStatus(v)}
              options={[...ERP_PRODUCTION_SPLIT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="拆分类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={splitType}
              onChange={(v) => setSplitType(v)}
              options={[...ERP_PRODUCTION_SPLIT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="源生产订单号">
            <Input
              placeholder="请输入源生产订单号"
              allowClear
              style={{ width: 160 }}
              value={sourceOrderNo}
              onChange={(e) => setSourceOrderNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="拆分单号 / 目标订单号"
              allowClear
              style={{ width: 200 }}
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
                  void loadData(1, pageSize, keyword, splitStatus, splitType, sourceOrderNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSplitStatus(undefined);
                  setSplitType(undefined);
                  setSourceOrderNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建订单拆分</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`订单拆分（共 ${total} 条）`}>
        <Table<ErpProductionOrderSplit>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1900 }}
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
        title={editId == null ? '新建订单拆分' : '编辑订单拆分'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="splitNo" label="拆分单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="sourceOrderId" label="源生产订单ID">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入源生产订单ID" />
          </Form.Item>
          <Form.Item name="sourceOrderNo" label="源生产订单号">
            <Input placeholder="请输入源生产订单号" />
          </Form.Item>
          <Form.Item name="targetOrderId" label="目标订单ID">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入目标订单ID" />
          </Form.Item>
          <Form.Item name="targetOrderNo" label="目标订单号">
            <Input placeholder="请输入目标订单号" />
          </Form.Item>
          <Form.Item name="splitQty" label="拆分数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入拆分数量" />
          </Form.Item>
          <Form.Item name="splitType" label="拆分类型">
            <Select placeholder="为空默认 QTY" options={[...ERP_PRODUCTION_SPLIT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="splitReason" label="拆分原因">
            <Input.TextArea rows={2} placeholder="请输入拆分原因" />
          </Form.Item>
          <Form.Item name="splitBy" label="拆分人">
            <Input placeholder="请输入拆分人" />
          </Form.Item>
          <Form.Item name="splitDate" label="拆分日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择拆分日期" />
          </Form.Item>
          <Form.Item name="splitStatus" label="拆分状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_PRODUCTION_SPLIT_STATUS_OPTIONS]} />
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
