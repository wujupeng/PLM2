import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { oaCustomerService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import BizFlowTab, {
  bizStatusTag,
  formatDateTime,
  plain,
  type BizSubmitValue,
} from '@/pages/oa/biz/BizFlowTab';
import UserSelect from '@/pages/oa/UserSelect';
import {
  OA_CUSTOMER_LEVEL_LABEL,
  OA_CUSTOMER_LEVEL_OPTIONS,
  OA_CUSTOMER_STATUS_COLOR,
  OA_CUSTOMER_STATUS_LABEL,
  OA_CUSTOMER_STATUS_OPTIONS,
  type OaBizFlowItem,
  type OaCustomerContactSaveParams,
  type OaCustomerSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const CUSTOMER_LIST = 'oa:customer:list';
const CUSTOMER_MANAGE = 'oa:customer:manage';

const customerStatusTag = bizStatusTag(OA_CUSTOMER_STATUS_LABEL, OA_CUSTOMER_STATUS_COLOR);

interface CustomerFormValues extends BizSubmitValue {
  customerCode?: string;
  customerName?: string;
  shortName?: string;
  customerLevel?: string;
  customerStatus?: string;
  industry?: string;
  region?: string;
  address?: string;
  creditCode?: string;
  taxNo?: string;
  salesOwnerUserId?: number;
  salesOwnerName?: string;
  erpRefNo?: string;
  remark?: string;
}

/* 联系人维护弹窗：客户下方一对多联系人。 */
interface ContactFormValues {
  contactName: string;
  position?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  isPrimary?: boolean;
  remark?: string;
}

interface ContactsModalProps {
  customer: OaBizFlowItem | null;
  open: boolean;
  onClose: () => void;
}

function ContactsModal({ customer, open, onClose }: ContactsModalProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ContactFormValues>();
  const [data, setData] = useState<OaBizFlowItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadContacts = useCallback(async (customerId: number) => {
    setLoading(true);
    try {
      const res = await oaCustomerService.listContacts(customerId);
      setData(res || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && customer) {
      form.resetFields();
      void loadContacts(customer.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customer]);

  const submit = async () => {
    if (!customer) return;
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaCustomerContactSaveParams = {
        contactName: values.contactName,
        position: values.position,
        phone: values.phone,
        mobile: values.mobile,
        email: values.email,
        isPrimary: values.isPrimary,
        remark: values.remark,
      };
      await oaCustomerService.createContact(customer.id, payload);
      message.success('联系人已新增');
      form.resetFields();
      void loadContacts(customer.id);
    } finally {
      setSaving(false);
    }
  };

  const removeContact = async (contactId: number) => {
    await oaCustomerService.removeContact(contactId);
    message.success('联系人已删除');
    if (customer) void loadContacts(customer.id);
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '姓名', dataIndex: 'contactName', width: 110, render: plain },
    { title: '职务', dataIndex: 'position', width: 120, render: plain },
    { title: '电话', dataIndex: 'phone', width: 130, render: plain },
    { title: '手机', dataIndex: 'mobile', width: 130, render: plain },
    { title: '邮箱', dataIndex: 'email', width: 180, render: plain },
    {
      title: '主联系人',
      dataIndex: 'isPrimary',
      width: 90,
      render: (v) => (Number(v) === 1 ? '是' : '否'),
    },
    { title: '备注', dataIndex: 'remark', render: plain },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_, record) =>
        hasPermission(CUSTOMER_MANAGE) && (
          <Popconfirm title="确认删除该联系人？" onConfirm={() => void removeContact(record.id)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        ),
    },
  ];

  return (
    <Modal
      title={`联系人维护${customer ? `（${customer.customerName || customer.customerCode || ''}）` : ''}`}
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>关闭</Button>}
      width={880}
      destroyOnClose
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {hasPermission(CUSTOMER_MANAGE) && (
          <Form form={form} layout="inline" onFinish={() => void submit()}>
            <Form.Item name="contactName" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="姓名" style={{ width: 110 }} />
            </Form.Item>
            <Form.Item name="position">
              <Input placeholder="职务" style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="phone">
              <Input placeholder="电话" style={{ width: 130 }} />
            </Form.Item>
            <Form.Item name="mobile">
              <Input placeholder="手机" style={{ width: 130 }} />
            </Form.Item>
            <Form.Item name="email">
              <Input placeholder="邮箱" style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="isPrimary" valuePropName="checked">
              <Checkbox>主联系人</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={saving}>
                新增
              </Button>
            </Form.Item>
          </Form>
        )}
        <Table<OaBizFlowItem>
          rowKey="id"
          size="small"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: 900 }}
        />
      </Space>
    </Modal>
  );
}

function CustomerTab() {
  const [contactsOpen, setContactsOpen] = useState(false);
  const [current, setCurrent] = useState<OaBizFlowItem | null>(null);

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '客户编码', dataIndex: 'customerCode', width: 150, fixed: 'left', render: plain },
    { title: '客户名称', dataIndex: 'customerName', width: 200, render: plain },
    { title: '简称', dataIndex: 'shortName', width: 120, render: plain },
    {
      title: '客户等级',
      dataIndex: 'customerLevel',
      width: 110,
      render: (v) => OA_CUSTOMER_LEVEL_LABEL[String(v)] || plain(v),
    },
    { title: '客户状态', dataIndex: 'customerStatus', width: 100, render: customerStatusTag },
    { title: '所属行业', dataIndex: 'industry', width: 120, render: plain },
    { title: '所属区域', dataIndex: 'region', width: 120, render: plain },
    { title: '销售负责人', dataIndex: 'salesOwnerName', width: 110, render: plain },
    { title: '联系人数', dataIndex: 'contactCount', width: 90, render: plain },
    { title: 'ERP关联单号', dataIndex: 'erpRefNo', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <>
      <BizFlowTab<OaCustomerSaveParams, CustomerFormValues>
        title="客户"
        service={oaCustomerService}
        columns={columns}
        listPerm={CUSTOMER_LIST}
        applyPerm={CUSTOMER_MANAGE}
        noFlow
        statusOptions={[]}
        initialValues={{ customerStatus: 'ACTIVE', customerLevel: 'NORMAL' }}
        detailFields={[
          { label: '客户编码', key: 'customerCode' },
          { label: '客户名称', key: 'customerName' },
          { label: '客户简称', key: 'shortName' },
          { label: '客户等级', key: 'customerLevel', render: (v) => OA_CUSTOMER_LEVEL_LABEL[String(v)] || plain(v) },
          { label: '客户状态', key: 'customerStatus', render: (v) => OA_CUSTOMER_STATUS_LABEL[String(v)] || plain(v) },
          { label: '所属行业', key: 'industry' },
          { label: '所属区域', key: 'region' },
          { label: '地址', key: 'address' },
          { label: '统一社会信用代码', key: 'creditCode' },
          { label: '税号', key: 'taxNo' },
          { label: '销售负责人', key: 'salesOwnerName' },
          { label: 'ERP关联单号', key: 'erpRefNo' },
          { label: '备注', key: 'remark' },
        ]}
        renderFields={() => (
          <>
            <Form.Item name="customerCode" label="客户编码">
              <Input placeholder="留空自动生成" />
            </Form.Item>
            <Form.Item name="customerName" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]}>
              <Input placeholder="请输入客户名称" />
            </Form.Item>
            <Form.Item name="shortName" label="客户简称">
              <Input placeholder="请输入客户简称" />
            </Form.Item>
            <Form.Item name="customerLevel" label="客户等级">
              <Select placeholder="请选择" options={[...OA_CUSTOMER_LEVEL_OPTIONS]} />
            </Form.Item>
            <Form.Item name="customerStatus" label="客户状态">
              <Select placeholder="请选择" options={[...OA_CUSTOMER_STATUS_OPTIONS]} />
            </Form.Item>
            <Form.Item name="industry" label="所属行业">
              <Input placeholder="请输入所属行业" />
            </Form.Item>
            <Form.Item name="region" label="所属区域">
              <Input placeholder="请输入所属区域" />
            </Form.Item>
            <Form.Item name="address" label="地址">
              <Input placeholder="请输入地址" />
            </Form.Item>
            <Form.Item name="creditCode" label="统一社会信用代码">
              <Input placeholder="请输入统一社会信用代码" />
            </Form.Item>
            <Form.Item name="taxNo" label="税号">
              <Input placeholder="请输入税号" />
            </Form.Item>
            <Form.Item name="salesOwnerUserId" label="销售负责人">
              <UserSelect placeholder="请选择销售负责人" />
            </Form.Item>
            <Form.Item name="salesOwnerName" label="销售负责人姓名">
              <Input placeholder="请输入销售负责人姓名" />
            </Form.Item>
            <Form.Item name="erpRefNo" label="ERP关联单号">
              <Input placeholder="请输入 ERP 关联单号" />
            </Form.Item>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={2} placeholder="请输入备注" />
            </Form.Item>
          </>
        )}
        buildEditValues={(r) => ({
          customerCode: r.customerCode,
          customerName: r.customerName,
          shortName: r.shortName,
          customerLevel: r.customerLevel,
          customerStatus: r.customerStatus,
          industry: r.industry,
          region: r.region,
          address: r.address,
          creditCode: r.creditCode,
          taxNo: r.taxNo,
          salesOwnerUserId: r.salesOwnerUserId,
          salesOwnerName: r.salesOwnerName,
          erpRefNo: r.erpRefNo,
          remark: r.remark,
        })}
        buildPayload={(v) => ({
          customerCode: v.customerCode,
          customerName: v.customerName,
          shortName: v.shortName,
          customerLevel: v.customerLevel,
          customerStatus: v.customerStatus,
          industry: v.industry,
          region: v.region,
          address: v.address,
          creditCode: v.creditCode,
          taxNo: v.taxNo,
          salesOwnerUserId: v.salesOwnerUserId,
          salesOwnerName: v.salesOwnerName,
          erpRefNo: v.erpRefNo,
          remark: v.remark,
        })}
        extraActions={(record) => (
          <Button
            type="link"
            size="small"
            onClick={() => {
              setCurrent(record);
              setContactsOpen(true);
            }}
          >
            联系人
          </Button>
        )}
      />

      <ContactsModal
        customer={current}
        open={contactsOpen}
        onClose={() => setContactsOpen(false)}
      />
    </>
  );
}

export default function OaCustomerPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        客户管理
      </Title>

      <Tabs items={[{ key: 'customers', label: '客户档案', children: <CustomerTab /> }]} />
    </Space>
  );
}
