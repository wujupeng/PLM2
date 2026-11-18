import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
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
import { erpCustomerService } from '@/services/erpBaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_CUSTOMER_STATUS_LABEL,
  ERP_CUSTOMER_STATUS_OPTIONS,
  ERP_CUSTOMER_TYPE_LABEL,
  ERP_CUSTOMER_TYPE_OPTIONS,
  ERP_SETTLE_METHOD_LABEL,
  ERP_SETTLE_METHOD_OPTIONS,
  type ErpCustomer,
  type ErpCustomerSaveRequest,
} from '@/types/erpBase';

const { Title } = Typography;

const MANAGE = 'erp:base:customer:manage';

export default function ErpCustomerPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ErpCustomerSaveRequest>();
  const [data, setData] = useState<ErpCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [customerType, setCustomerType] = useState<string | undefined>(undefined);
  const [customerStatus, setCustomerStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      cType = customerType,
      cStatus = customerStatus,
    ) => {
      setLoading(true);
      try {
        const res = await erpCustomerService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          customerType: cType,
          customerStatus: cStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, customerType, customerStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ customerType: 'DIRECT', settleMethod: 'TRANSFER', customerStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: ErpCustomer) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editId == null) {
        await erpCustomerService.create(values);
        message.success('客户档案已创建');
      } else {
        await erpCustomerService.update(editId, values);
        message.success('客户档案已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpCustomerService.remove(id);
    message.success('客户档案已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpCustomer> = [
    { title: '客户编号', dataIndex: 'customerNo', width: 160, fixed: 'left', render: plain },
    { title: '客户编码', dataIndex: 'customerCode', width: 140, render: plain },
    { title: '客户名称', dataIndex: 'customerName', width: 200, render: plain },
    { title: '简称', dataIndex: 'shortName', width: 140, render: plain },
    {
      title: '客户类型',
      dataIndex: 'customerType',
      width: 110,
      render: (v) => statusTag(ERP_CUSTOMER_TYPE_LABEL, v),
    },
    { title: '客户分组', dataIndex: 'customerGroup', width: 120, render: plain },
    { title: '销售区域', dataIndex: 'salesRegion', width: 120, render: plain },
    { title: '信用额度', dataIndex: 'creditLimit', width: 110, render: plain },
    { title: '账期(天)', dataIndex: 'creditDays', width: 100, render: plain },
    {
      title: '结算方式',
      dataIndex: 'settleMethod',
      width: 110,
      render: (v) => statusTag(ERP_SETTLE_METHOD_LABEL, v),
    },
    { title: '联系人', dataIndex: 'contact', width: 120, render: plain },
    { title: '联系电话', dataIndex: 'phone', width: 140, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '客户状态',
      dataIndex: 'customerStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ERP_CUSTOMER_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该客户档案？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        客户档案
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="客户类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={customerType}
              onChange={(v) => setCustomerType(v)}
              options={[...ERP_CUSTOMER_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="客户状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={customerStatus}
              onChange={(v) => setCustomerStatus(v)}
              options={[...ERP_CUSTOMER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="客户编号 / 编码 / 名称"
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
                  void loadData(1, pageSize, keyword, customerType, customerStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setCustomerType(undefined);
                  setCustomerStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建客户档案</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`客户档案（共 ${total} 条）`}>
        <Table<ErpCustomer>
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
        title={editId == null ? '新建客户档案' : '编辑客户档案'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="customerNo" label="客户编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码" rules={[{ required: true, message: '请输入客户编码' }]}>
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]}>
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item name="shortName" label="简称">
            <Input placeholder="请输入简称" />
          </Form.Item>
          <Form.Item name="customerType" label="客户类型">
            <Select placeholder="为空默认 DIRECT" options={[...ERP_CUSTOMER_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="customerGroup" label="客户分组">
            <Input placeholder="请输入客户分组" />
          </Form.Item>
          <Form.Item name="salesRegion" label="销售区域">
            <Input placeholder="请输入销售区域" />
          </Form.Item>
          <Form.Item name="creditLimit" label="信用额度">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入信用额度" />
          </Form.Item>
          <Form.Item name="creditDays" label="账期(天)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入账期天数" />
          </Form.Item>
          <Form.Item name="settleMethod" label="结算方式">
            <Select placeholder="为空默认 TRANSFER" options={[...ERP_SETTLE_METHOD_OPTIONS]} />
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
          <Form.Item name="customerStatus" label="客户状态">
            <Select placeholder="为空默认 ACTIVE" options={[...ERP_CUSTOMER_STATUS_OPTIONS]} />
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
