import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
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
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { srmPortalAccountService as service } from '@/services/srmPortalService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_PORTAL_ACCOUNT_STATUS_LABEL,
  SRM_PORTAL_ACCOUNT_STATUS_OPTIONS,
  SRM_PORTAL_ROLE_LABEL,
  SRM_PORTAL_ROLE_OPTIONS,
  type SrmPortalAccount,
  type SrmPortalAccountQuery,
  type SrmPortalAccountSaveRequest,
} from '@/types/srmPortal';

const { Title } = Typography;

const MANAGE = 'srm:portal:account:manage';

type FormValues = Omit<SrmPortalAccountSaveRequest, 'validFrom' | 'validTo'> & {
  validFrom?: Dayjs;
  validTo?: Dayjs;
};

export default function SrmPortalAccountPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmPortalAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [portalRole, setPortalRole] = useState<string | undefined>(undefined);
  const [accountStatus, setAccountStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, role = portalRole, status = accountStatus) => {
      setLoading(true);
      try {
        const params: SrmPortalAccountQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          portalRole: role,
          accountStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, portalRole, accountStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ portalRole: 'VIEWER', accountStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: SrmPortalAccount) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      validFrom: record.validFrom ? dayjs(record.validFrom) : undefined,
      validTo: record.validTo ? dayjs(record.validTo) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmPortalAccountSaveRequest = {
        ...values,
        validFrom: values.validFrom ? values.validFrom.format(DATE_FORMAT) : undefined,
        validTo: values.validTo ? values.validTo.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('供应商账号已创建');
      } else {
        await service.update(editId, payload);
        message.success('供应商账号已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('供应商账号已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmPortalAccount> = [
    { title: '账号编号', dataIndex: 'accountNo', width: 170, fixed: 'left', render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '登录名', dataIndex: 'loginName', width: 140, render: plain },
    { title: '联系人', dataIndex: 'contactName', width: 110, render: plain },
    { title: '联系电话', dataIndex: 'contactPhone', width: 130, render: plain },
    { title: '联系邮箱', dataIndex: 'contactEmail', width: 180, render: plain },
    {
      title: '门户角色',
      dataIndex: 'portalRole',
      width: 110,
      render: (v) => statusTag(SRM_PORTAL_ROLE_LABEL, v),
    },
    { title: '协同范围', dataIndex: 'collabScope', width: 180, render: plain },
    { title: '生效日期', dataIndex: 'validFrom', width: 120, render: formatDate },
    { title: '失效日期', dataIndex: 'validTo', width: 120, render: formatDate },
    {
      title: '账号状态',
      dataIndex: 'accountStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_PORTAL_ACCOUNT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该供应商账号？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        供应商账号
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="门户角色">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={portalRole}
              onChange={(v) => setPortalRole(v)}
              options={[...SRM_PORTAL_ROLE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="账号状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={accountStatus}
              onChange={(v) => setAccountStatus(v)}
              options={[...SRM_PORTAL_ACCOUNT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="账号编号 / 供应商编码 / 供应商名称 / 登录名"
              allowClear
              style={{ width: 280 }}
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
                  void loadData(1, pageSize, keyword, portalRole, accountStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setPortalRole(undefined);
                  setAccountStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建供应商账号</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`供应商账号（共 ${total} 条）`}>
        <Table<SrmPortalAccount>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2400 }}
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
        title={editId == null ? '新建供应商账号' : '编辑供应商账号'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="accountNo" label="账号编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="loginName" label="登录名">
            <Input placeholder="请输入登录名" />
          </Form.Item>
          <Form.Item name="contactName" label="联系人">
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item name="contactPhone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="contactEmail" label="联系邮箱">
            <Input placeholder="请输入联系邮箱" />
          </Form.Item>
          <Form.Item name="portalRole" label="门户角色">
            <Select placeholder="为空默认 VIEWER" options={[...SRM_PORTAL_ROLE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="collabScope" label="协同范围">
            <Input placeholder="如 ORDER,DELIVERY,QUALITY,ASN" />
          </Form.Item>
          <Form.Item name="validFrom" label="生效日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="validTo" label="失效日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="accountStatus" label="账号状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_PORTAL_ACCOUNT_STATUS_OPTIONS]} />
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
