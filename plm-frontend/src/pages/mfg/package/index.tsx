import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { mfgService } from '@/services/mfgService';
import {
  MFG_ENABLED_COLOR,
  MFG_ENABLED_LABEL,
  MFG_ENABLED_OPTIONS,
  MFG_PACKAGE_ITEM_STATUS_LABEL,
  MFG_PACKAGE_LEVEL_LABEL,
  MFG_PACKAGE_LEVEL_OPTIONS,
  MFG_PACKAGE_STATUS_COLOR,
  MFG_PACKAGE_STATUS_LABEL,
  MFG_PACKAGE_STATUS_OPTIONS,
  type MfgPackageDetailResponse,
  type MfgPackageItemModel,
  type MfgPackageQuery,
  type MfgPackageRuleItem,
  type MfgPackageRuleQuery,
  type MfgPackageRuleSaveParams,
  type MfgPackageSaveParams,
} from '@/types/mfg';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/* ================= 包装规则 ================= */

interface RuleFormValues {
  ruleNo?: string;
  productCode: string;
  packageLevel?: string;
  packageQty?: number;
  innerQtyPerBox?: number;
  boxPerPallet?: number;
  labelTemplateCode?: string;
  customerCode?: string;
  status?: string;
  remark?: string;
}

function PackageRuleTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<RuleFormValues>();
  const [data, setData] = useState<MfgPackageRuleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<{ productCode?: string; packageLevel?: string; status?: string }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MfgPackageRuleItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: MfgPackageRuleQuery = {
          pageNum: page,
          pageSize: size,
          productCode: cond.productCode || undefined,
          packageLevel: cond.packageLevel || undefined,
          status: cond.status || undefined,
        };
        const res = await mfgService.packageRulePage(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: { productCode?: string; packageLevel?: string; status?: string }) => {
    setSearch(values);
    setPageNum(1);
    void loadData(1, pageSize, values);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ packageLevel: 'INNER', status: 'enabled' });
    setModalOpen(true);
  };

  const openEdit = (record: MfgPackageRuleItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: MfgPackageRuleSaveParams = { ...values };
    setSubmitting(true);
    try {
      if (editing) {
        await mfgService.packageRuleUpdate(editing.ruleNo, payload);
        message.success('更新成功');
      } else {
        await mfgService.packageRuleCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: MfgPackageRuleItem) => {
    await mfgService.packageRuleRemove(record.ruleNo);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<MfgPackageRuleItem> = [
    { title: '规则编号', dataIndex: 'ruleNo', width: 180, fixed: 'left', render: (v) => v || '-' },
    { title: '产品编码', dataIndex: 'productCode', width: 140, render: (v) => v || '-' },
    {
      title: '包装层级',
      dataIndex: 'packageLevel',
      width: 110,
      render: (v?: string) => (v ? MFG_PACKAGE_LEVEL_LABEL[v] || v : '-'),
    },
    { title: '单包数量', dataIndex: 'packageQty', width: 100, render: (v) => (v ?? '-') },
    { title: '每箱内装', dataIndex: 'innerQtyPerBox', width: 100, render: (v) => (v ?? '-') },
    { title: '每托盘箱数', dataIndex: 'boxPerPallet', width: 110, render: (v) => (v ?? '-') },
    { title: '标签模板', dataIndex: 'labelTemplateCode', width: 150, render: (v) => v || '-' },
    { title: '客户编码', dataIndex: 'customerCode', width: 140, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v?: string) =>
        v ? <Tag color={MFG_ENABLED_COLOR[v]}>{MFG_ENABLED_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('mfg:package:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('mfg:package:save') && (
            <Popconfirm title="确认删除该包装规则？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="packageLevel" label="包装层级">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={MFG_PACKAGE_LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={MFG_ENABLED_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`包装规则（共 ${total} 条）`}
        extra={
          hasPermission('mfg:package:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增规则
            </Button>
          )
        }
      >
        <Table<MfgPackageRuleItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1400 }}
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
        title={editing ? '编辑包装规则' : '新增包装规则'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="ruleNo" label="规则编号" extra="留空将自动生成">
            <Input placeholder="请输入规则编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码" rules={[{ required: true, message: '请输入产品编码' }]}>
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="packageLevel" label="包装层级">
            <Select placeholder="请选择" options={MFG_PACKAGE_LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="packageQty" label="单包数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入单包数量" />
          </Form.Item>
          <Form.Item name="innerQtyPerBox" label="每箱内装数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入每箱内装数量" />
          </Form.Item>
          <Form.Item name="boxPerPallet" label="每托盘箱数">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入每托盘箱数" />
          </Form.Item>
          <Form.Item name="labelTemplateCode" label="标签模板编码">
            <Input placeholder="请输入标签模板编码" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={MFG_ENABLED_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ================= 包装与箱码 ================= */

interface PackageFormValues {
  packageNo?: string;
  packageCode?: string;
  packageLevel?: string;
  parentPackageNo?: string;
  productCode?: string;
  batchNo?: string;
  workOrderNo?: string;
  packageQty?: number;
  customerCode?: string;
  operator?: string;
  remark?: string;
}

interface PackByBatchValues {
  batchNo: string;
  productCode?: string;
  customerCode?: string;
  maxQty?: number;
  operator?: string;
}

function PackageBoxTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const username = useAuthStore((state) => state.userInfo?.username);
  const [form] = Form.useForm<PackageFormValues>();
  const [packForm] = Form.useForm<PackByBatchValues>();

  const [data, setData] = useState<MfgPackageItemModel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<{ packageCode?: string; batchNo?: string; packageStatus?: string }>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MfgPackageItemModel | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [packOpen, setPackOpen] = useState(false);
  const [packing, setPacking] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<MfgPackageDetailResponse | null>(null);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: MfgPackageQuery = {
          pageNum: page,
          pageSize: size,
          packageCode: cond.packageCode || undefined,
          batchNo: cond.batchNo || undefined,
          packageStatus: cond.packageStatus || undefined,
        };
        const res = await mfgService.packagePage(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: { packageCode?: string; batchNo?: string; packageStatus?: string }) => {
    setSearch(values);
    setPageNum(1);
    void loadData(1, pageSize, values);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ packageLevel: 'INNER', operator: username });
    setModalOpen(true);
  };

  const openEdit = (record: MfgPackageItemModel) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: MfgPackageSaveParams = { ...values };
    setSubmitting(true);
    try {
      if (editing) {
        await mfgService.packageUpdate(editing.packageNo, payload);
        message.success('更新成功');
      } else {
        await mfgService.packageCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: MfgPackageItemModel) => {
    await mfgService.packageRemove(record.packageNo);
    message.success('删除成功');
    void loadData();
  };

  const handleSeal = async (record: MfgPackageItemModel) => {
    await mfgService.packageSeal(record.packageNo, { operator: username });
    message.success('封箱成功');
    void loadData();
  };

  const openPack = () => {
    packForm.resetFields();
    packForm.setFieldsValue({ operator: username });
    setPackOpen(true);
  };

  const handlePack = async () => {
    const values = await packForm.validateFields();
    setPacking(true);
    try {
      await mfgService.packagePackByBatch(values);
      message.success('按批次装箱成功');
      setPackOpen(false);
      void loadData();
    } finally {
      setPacking(false);
    }
  };

  const openDetail = async (record: MfgPackageItemModel) => {
    const res = await mfgService.packageDetail(record.packageNo);
    setDetail(res);
    setDetailOpen(true);
  };

  const columns: ColumnsType<MfgPackageItemModel> = [
    { title: '包装编号', dataIndex: 'packageNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    { title: '箱码/托盘码', dataIndex: 'packageCode', width: 170, render: (v) => v || '-' },
    {
      title: '包装层级',
      dataIndex: 'packageLevel',
      width: 100,
      render: (v?: string) => (v ? MFG_PACKAGE_LEVEL_LABEL[v] || v : '-'),
    },
    { title: '产品编码', dataIndex: 'productCode', width: 120, render: (v) => v || '-' },
    { title: '生产批次号', dataIndex: 'batchNo', width: 150, render: (v) => v || '-' },
    { title: '包装数量', dataIndex: 'packageQty', width: 100, render: (v) => (v ?? '-') },
    { title: '客户编码', dataIndex: 'customerCode', width: 140, render: (v) => v || '-' },
    {
      title: '包装状态',
      dataIndex: 'packageStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={MFG_PACKAGE_STATUS_COLOR[v]}>{MFG_PACKAGE_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '操作人', dataIndex: 'operator', width: 100, render: (v) => v || '-' },
    {
      title: '封箱时间',
      dataIndex: 'packedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            明细
          </Button>
          {hasPermission('mfg:package:seal') && record.packageStatus === 'OPEN' && (
            <Popconfirm title="确认封箱？" onConfirm={() => handleSeal(record)}>
              <Button type="link" size="small">
                封箱
              </Button>
            </Popconfirm>
          )}
          {hasPermission('mfg:package:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('mfg:package:save') && (
            <Popconfirm title="确认删除该包装？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="packageCode" label="箱码/托盘码">
            <Input placeholder="请输入箱码" allowClear style={{ width: 170 }} />
          </Form.Item>
          <Form.Item name="batchNo" label="生产批次号">
            <Input placeholder="请输入批次号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="packageStatus" label="包装状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={MFG_PACKAGE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`包装箱列表（共 ${total} 条）`}
        extra={
          <Space wrap>
            {hasPermission('mfg:package:save') && (
              <Button onClick={openPack}>按批次装箱</Button>
            )}
            {hasPermission('mfg:package:save') && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                新增包装
              </Button>
            )}
          </Space>
        }
      >
        <Table<MfgPackageItemModel>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
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
        title={editing ? '编辑包装' : '新增包装'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="packageNo" label="包装编号" extra="留空将自动生成">
            <Input placeholder="请输入包装编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="packageCode" label="箱码/托盘码" extra="留空将自动生成">
            <Input placeholder="请输入箱码/托盘码" />
          </Form.Item>
          <Form.Item name="packageLevel" label="包装层级">
            <Select placeholder="请选择" options={MFG_PACKAGE_LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="parentPackageNo" label="上级包装编号">
            <Input placeholder="外箱/托盘编号" />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="batchNo" label="生产批次号">
            <Input placeholder="请输入生产批次号" />
          </Form.Item>
          <Form.Item name="workOrderNo" label="工单号">
            <Input placeholder="请输入工单号" />
          </Form.Item>
          <Form.Item name="packageQty" label="包装数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入包装数量" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="operator" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="按批次自动装箱"
        open={packOpen}
        onOk={handlePack}
        confirmLoading={packing}
        onCancel={() => setPackOpen(false)}
        destroyOnClose
        width={520}
      >
        <Form form={packForm} layout="vertical" preserve={false}>
          <Form.Item name="batchNo" label="生产批次号" rules={[{ required: true, message: '请输入生产批次号' }]}>
            <Input placeholder="请输入生产批次号" />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="maxQty" label="最大装箱数量" extra="留空按包装规则自动计算">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入最大装箱数量" />
          </Form.Item>
          <Form.Item name="operator" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`包装明细${detail?.pkg?.packageNo ? `：${detail.pkg.packageNo}` : ''}`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button type="primary" onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
      >
        {detail?.pkg && (
          <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="箱码">{detail.pkg.packageCode || '-'}</Descriptions.Item>
            <Descriptions.Item label="包装层级">
              {detail.pkg.packageLevel ? MFG_PACKAGE_LEVEL_LABEL[detail.pkg.packageLevel] || detail.pkg.packageLevel : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="产品编码">{detail.pkg.productCode || '-'}</Descriptions.Item>
            <Descriptions.Item label="生产批次号">{detail.pkg.batchNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="包装数量">{detail.pkg.packageQty ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="包装状态">
              {detail.pkg.packageStatus
                ? MFG_PACKAGE_STATUS_LABEL[detail.pkg.packageStatus] || detail.pkg.packageStatus
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
        <Table
          rowKey="id"
          size="small"
          dataSource={detail?.items || []}
          pagination={false}
          columns={[
            { title: '序列号', dataIndex: 'serialNo', render: (v) => v || '-' },
            { title: '追溯码', dataIndex: 'traceCode', render: (v) => v || '-' },
            { title: '物料编码', dataIndex: 'materialCode', render: (v) => v || '-' },
            { title: '物料批次号', dataIndex: 'materialBatchNo', render: (v) => v || '-' },
            { title: '数量', dataIndex: 'quantity', width: 80, render: (v) => (v ?? '-') },
            {
              title: '状态',
              dataIndex: 'itemStatus',
              width: 100,
              render: (v?: string) => (v ? MFG_PACKAGE_ITEM_STATUS_LABEL[v] || v : '-'),
            },
          ]}
        />
      </Modal>
    </Space>
  );
}

export default function MfgPackagePage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        包装与箱码
      </Title>
      <Tabs
        items={[
          { key: 'box', label: '包装箱', children: <PackageBoxTab /> },
          { key: 'rule', label: '包装规则', children: <PackageRuleTab /> },
        ]}
      />
    </Space>
  );
}
