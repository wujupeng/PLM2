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
import { erpFinanceCostCollectionService } from '@/services/erpFinanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_FINANCE_COST_COLLECTION_STATUS_LABEL,
  ERP_FINANCE_COST_COLLECTION_STATUS_OPTIONS,
  ERP_FINANCE_COST_ELEMENT_LABEL,
  ERP_FINANCE_COST_ELEMENT_OPTIONS,
  ERP_FINANCE_COST_OBJECT_TYPE_LABEL,
  ERP_FINANCE_COST_OBJECT_TYPE_OPTIONS,
  type ErpFinanceCostCollection,
  type ErpFinanceCostCollectionQuery,
  type ErpFinanceCostCollectionSaveRequest,
} from '@/types/erpFinance';

const { Title } = Typography;

const MANAGE = 'erp:finance:cost-collection:manage';

/** 日期提交格式。 */
const DATE_FORMAT = 'YYYY-MM-DD';

type FormValues = Omit<ErpFinanceCostCollectionSaveRequest, 'collectionDate'> & {
  collectionDate?: Dayjs;
};

export default function ErpFinanceCostCollectionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpFinanceCostCollection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [objectType, setObjectType] = useState<string | undefined>(undefined);
  const [costElement, setCostElement] = useState<string | undefined>(undefined);
  const [collectionStatus, setCollectionStatus] = useState<string | undefined>(undefined);
  const [periodCode, setPeriodCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      objType = objectType,
      element = costElement,
      status = collectionStatus,
      period = periodCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpFinanceCostCollectionQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          objectType: objType,
          costElement: element,
          collectionStatus: status,
          periodCode: period || undefined,
        };
        const res = await erpFinanceCostCollectionService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, objectType, costElement, collectionStatus, periodCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      objectType: 'PRODUCT',
      costElement: 'MATERIAL',
      currencyCode: 'CNY',
      collectionStatus: 'DRAFT',
    });
    setOpen(true);
  };

  const openEdit = (record: ErpFinanceCostCollection) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      collectionDate: record.collectionDate ? dayjs(record.collectionDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpFinanceCostCollectionSaveRequest = {
        ...values,
        collectionDate: values.collectionDate ? values.collectionDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpFinanceCostCollectionService.create(payload);
        message.success('成本归集已创建');
      } else {
        await erpFinanceCostCollectionService.update(editId, payload);
        message.success('成本归集已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpFinanceCostCollectionService.remove(id);
    message.success('成本归集已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpFinanceCostCollection> = [
    { title: '归集单号', dataIndex: 'collectionNo', width: 170, fixed: 'left', render: plain },
    { title: '会计期间编码', dataIndex: 'periodCode', width: 130, render: plain },
    {
      title: '归集对象类型',
      dataIndex: 'objectType',
      width: 120,
      render: (v) => statusTag(ERP_FINANCE_COST_OBJECT_TYPE_LABEL, v),
    },
    { title: '归集对象编码', dataIndex: 'objectCode', width: 140, render: plain },
    { title: '归集对象名称', dataIndex: 'objectName', width: 160, render: plain },
    {
      title: '成本要素',
      dataIndex: 'costElement',
      width: 110,
      render: (v) => statusTag(ERP_FINANCE_COST_ELEMENT_LABEL, v),
    },
    { title: '归集金额', dataIndex: 'amount', width: 110, render: plain },
    { title: '币种', dataIndex: 'currencyCode', width: 90, render: plain },
    { title: '归集日期', dataIndex: 'collectionDate', width: 120, render: plain },
    {
      title: '归集状态',
      dataIndex: 'collectionStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_FINANCE_COST_COLLECTION_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该成本归集？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        成本归集
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="归集对象类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={objectType}
              onChange={(v) => setObjectType(v)}
              options={[...ERP_FINANCE_COST_OBJECT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="成本要素">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={costElement}
              onChange={(v) => setCostElement(v)}
              options={[...ERP_FINANCE_COST_ELEMENT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="归集状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={collectionStatus}
              onChange={(v) => setCollectionStatus(v)}
              options={[...ERP_FINANCE_COST_COLLECTION_STATUS_OPTIONS]}
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
              placeholder="归集单号 / 归集对象编码 / 归集对象名称"
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
                  void loadData(1, pageSize, keyword, objectType, costElement, collectionStatus, periodCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setObjectType(undefined);
                  setCostElement(undefined);
                  setCollectionStatus(undefined);
                  setPeriodCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建成本归集</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`成本归集（共 ${total} 条）`}>
        <Table<ErpFinanceCostCollection>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2100 }}
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
        title={editId == null ? '新建成本归集' : '编辑成本归集'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="collectionNo" label="归集单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="periodCode" label="会计期间编码">
            <Input placeholder="请输入会计期间编码" />
          </Form.Item>
          <Form.Item name="objectType" label="归集对象类型">
            <Select placeholder="为空默认 PRODUCT" options={[...ERP_FINANCE_COST_OBJECT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item
            name="objectCode"
            label="归集对象编码"
            rules={[{ required: true, message: '请输入归集对象编码' }]}
          >
            <Input placeholder="请输入归集对象编码" />
          </Form.Item>
          <Form.Item name="objectName" label="归集对象名称">
            <Input placeholder="请输入归集对象名称" />
          </Form.Item>
          <Form.Item name="costElement" label="成本要素">
            <Select placeholder="为空默认 MATERIAL" options={[...ERP_FINANCE_COST_ELEMENT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="amount" label="归集金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入归集金额" />
          </Form.Item>
          <Form.Item name="currencyCode" label="币种">
            <Input placeholder="为空默认 CNY" />
          </Form.Item>
          <Form.Item name="collectionDate" label="归集日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择归集日期" />
          </Form.Item>
          <Form.Item name="collectionStatus" label="归集状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_FINANCE_COST_COLLECTION_STATUS_OPTIONS]} />
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
