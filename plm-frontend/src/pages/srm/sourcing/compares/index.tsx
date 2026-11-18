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
import { srmPriceCompareService as service } from '@/services/srmSourcingService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_PRICE_COMPARE_STATUS_LABEL,
  SRM_PRICE_COMPARE_STATUS_OPTIONS,
  type SrmPriceCompare,
  type SrmPriceCompareQuery,
  type SrmPriceCompareSaveRequest,
} from '@/types/srmSourcing';

const { Title } = Typography;

const MANAGE = 'srm:sourcing:compare:manage';

type FormValues = Omit<SrmPriceCompareSaveRequest, 'compareDate'> & {
  compareDate?: Dayjs;
};

export default function SrmPriceComparePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmPriceCompare[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [compareStatus, setCompareStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = compareStatus) => {
      setLoading(true);
      try {
        const params: SrmPriceCompareQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          compareStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, compareStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ compareStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: SrmPriceCompare) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      compareDate: record.compareDate ? dayjs(record.compareDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmPriceCompareSaveRequest = {
        ...values,
        compareDate: values.compareDate ? values.compareDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('报价比价已创建');
      } else {
        await service.update(editId, payload);
        message.success('报价比价已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('报价比价已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmPriceCompare> = [
    { title: '比价单号', dataIndex: 'compareNo', width: 170, fixed: 'left', render: plain },
    { title: '询价单号', dataIndex: 'rfqNo', width: 170, render: plain },
    { title: '比价标题', dataIndex: 'compareTitle', width: 200, render: plain },
    { title: '参与供应商数', dataIndex: 'supplierCount', width: 130, render: plain },
    { title: '最低报价', dataIndex: 'lowestPrice', width: 120, render: plain },
    { title: '最高报价', dataIndex: 'highestPrice', width: 120, render: plain },
    { title: '平均报价', dataIndex: 'avgPrice', width: 120, render: plain },
    { title: '推荐供应商编码', dataIndex: 'recommendSupplierCode', width: 170, render: plain },
    { title: '推荐供应商名称', dataIndex: 'recommendSupplierName', width: 170, render: plain },
    { title: '比价规则', dataIndex: 'compareRule', width: 140, render: plain },
    { title: '比价人', dataIndex: 'compareBy', width: 100, render: plain },
    { title: '比价日期', dataIndex: 'compareDate', width: 120, render: formatDate },
    {
      title: '比价状态',
      dataIndex: 'compareStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_PRICE_COMPARE_STATUS_LABEL, v),
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
            <Popconfirm
              title="确认删除该报价比价？"
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
        报价比价
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="比价状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={compareStatus}
              onChange={(v) => setCompareStatus(v)}
              options={[...SRM_PRICE_COMPARE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="比价单号 / 询价单号 / 推荐供应商编码 / 推荐供应商名称 / 比价人"
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
                  void loadData(1, pageSize, keyword, compareStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setCompareStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建报价比价</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`报价比价（共 ${total} 条）`}>
        <Table<SrmPriceCompare>
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
        title={editId == null ? '新建报价比价' : '编辑报价比价'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="compareNo" label="比价单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="rfqNo" label="询价单号" rules={[{ required: true, message: '请输入询价单号' }]}>
            <Input placeholder="请输入询价单号" />
          </Form.Item>
          <Form.Item name="compareTitle" label="比价标题">
            <Input placeholder="请输入比价标题" />
          </Form.Item>
          <Form.Item name="supplierCount" label="参与供应商数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入参与供应商数" />
          </Form.Item>
          <Form.Item name="lowestPrice" label="最低报价">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入最低报价" />
          </Form.Item>
          <Form.Item name="highestPrice" label="最高报价">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入最高报价" />
          </Form.Item>
          <Form.Item name="avgPrice" label="平均报价">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入平均报价" />
          </Form.Item>
          <Form.Item name="recommendSupplierCode" label="推荐供应商编码">
            <Input placeholder="请输入推荐供应商编码" />
          </Form.Item>
          <Form.Item name="recommendSupplierName" label="推荐供应商名称">
            <Input placeholder="请输入推荐供应商名称" />
          </Form.Item>
          <Form.Item name="compareRule" label="比价规则">
            <Input placeholder="为空默认 LOWEST_PRICE" />
          </Form.Item>
          <Form.Item name="compareConclusion" label="比价结论">
            <Input.TextArea rows={2} placeholder="请输入比价结论" />
          </Form.Item>
          <Form.Item name="compareBy" label="比价人">
            <Input placeholder="请输入比价人" />
          </Form.Item>
          <Form.Item name="compareDate" label="比价日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择比价日期" />
          </Form.Item>
          <Form.Item name="compareStatus" label="比价状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_PRICE_COMPARE_STATUS_OPTIONS]} />
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
