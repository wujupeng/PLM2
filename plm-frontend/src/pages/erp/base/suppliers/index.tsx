import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
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
import { erpSupplierService } from '@/services/erpBaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PAYMENT_TERM_LABEL,
  ERP_PAYMENT_TERM_OPTIONS,
  ERP_SETTLE_METHOD_LABEL,
  ERP_SETTLE_METHOD_OPTIONS,
  ERP_SUPPLIER_STATUS_LABEL,
  ERP_SUPPLIER_STATUS_OPTIONS,
  ERP_SUPPLIER_TYPE_LABEL,
  ERP_SUPPLIER_TYPE_OPTIONS,
  type ErpSupplier,
  type ErpSupplierSaveRequest,
} from '@/types/erpBase';

const { Title } = Typography;

const MANAGE = 'erp:base:supplier:manage';

export default function ErpSupplierPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ErpSupplierSaveRequest>();
  const [data, setData] = useState<ErpSupplier[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [supplierType, setSupplierType] = useState<string | undefined>(undefined);
  const [supplierStatus, setSupplierStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      sType = supplierType,
      sStatus = supplierStatus,
    ) => {
      setLoading(true);
      try {
        const res = await erpSupplierService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          supplierType: sType,
          supplierStatus: sStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, supplierType, supplierStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ supplierType: 'RAW', settleMethod: 'TRANSFER', paymentTerm: 'NET30', supplierStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: ErpSupplier) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editId == null) {
        await erpSupplierService.create(values);
        message.success('供应商业务档案已创建');
      } else {
        await erpSupplierService.update(editId, values);
        message.success('供应商业务档案已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpSupplierService.remove(id);
    message.success('供应商业务档案已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpSupplier> = [
    { title: '供应商编号', dataIndex: 'supplierNo', width: 160, fixed: 'left', render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 140, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 200, render: plain },
    { title: '简称', dataIndex: 'shortName', width: 140, render: plain },
    {
      title: '供应商类型',
      dataIndex: 'supplierType',
      width: 110,
      render: (v) => statusTag(ERP_SUPPLIER_TYPE_LABEL, v),
    },
    { title: '采购组', dataIndex: 'purchaseGroup', width: 120, render: plain },
    { title: '采购员', dataIndex: 'buyerName', width: 120, render: plain },
    {
      title: '结算方式',
      dataIndex: 'settleMethod',
      width: 110,
      render: (v) => statusTag(ERP_SETTLE_METHOD_LABEL, v),
    },
    {
      title: '付款条件',
      dataIndex: 'paymentTerm',
      width: 120,
      render: (v) => statusTag(ERP_PAYMENT_TERM_LABEL, v),
    },
    { title: '联系人', dataIndex: 'contact', width: 120, render: plain },
    { title: '联系电话', dataIndex: 'phone', width: 140, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '供应商状态',
      dataIndex: 'supplierStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_SUPPLIER_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该供应商业务档案？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        供应商业务档案
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="供应商类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={supplierType}
              onChange={(v) => setSupplierType(v)}
              options={[...ERP_SUPPLIER_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="供应商状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={supplierStatus}
              onChange={(v) => setSupplierStatus(v)}
              options={[...ERP_SUPPLIER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="供应商编号 / 编码 / 名称"
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
                  void loadData(1, pageSize, keyword, supplierType, supplierStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSupplierType(undefined);
                  setSupplierStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建供应商业务档案</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`供应商业务档案（共 ${total} 条）`}>
        <Table<ErpSupplier>
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
        title={editId == null ? '新建供应商业务档案' : '编辑供应商业务档案'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="supplierNo" label="供应商编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码" rules={[{ required: true, message: '请输入供应商编码' }]}>
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称" rules={[{ required: true, message: '请输入供应商名称' }]}>
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="shortName" label="简称">
            <Input placeholder="请输入简称" />
          </Form.Item>
          <Form.Item name="supplierType" label="供应商类型">
            <Select placeholder="为空默认 RAW" options={[...ERP_SUPPLIER_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="purchaseGroup" label="采购组">
            <Input placeholder="请输入采购组" />
          </Form.Item>
          <Form.Item name="buyerName" label="采购员">
            <Input placeholder="请输入采购员" />
          </Form.Item>
          <Form.Item name="settleMethod" label="结算方式">
            <Select placeholder="为空默认 TRANSFER" options={[...ERP_SETTLE_METHOD_OPTIONS]} />
          </Form.Item>
          <Form.Item name="paymentTerm" label="付款条件">
            <Select placeholder="为空默认 NET30" options={[...ERP_PAYMENT_TERM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="taxCode" label="税码">
            <Input placeholder="请输入税码" />
          </Form.Item>
          <Form.Item name="contact" label="联系人">
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item name="supplierStatus" label="供应商状态">
            <Select placeholder="为空默认 ACTIVE" options={[...ERP_SUPPLIER_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
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
