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
import { srmRfqSupplierService as service } from '@/services/srmSourcingService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_RFQ_SUPPLIER_STATUS_LABEL,
  SRM_RFQ_SUPPLIER_STATUS_OPTIONS,
  type SrmRfqSupplier,
  type SrmRfqSupplierQuery,
  type SrmRfqSupplierSaveRequest,
} from '@/types/srmSourcing';

const { Title } = Typography;

const MANAGE = 'srm:sourcing:rfq-supplier:manage';

type FormValues = Omit<SrmRfqSupplierSaveRequest, 'inviteDate' | 'respondDate'> & {
  inviteDate?: Dayjs;
  respondDate?: Dayjs;
};

export default function SrmRfqSupplierPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmRfqSupplier[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [inviteStatus, setInviteStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = inviteStatus) => {
      setLoading(true);
      try {
        const params: SrmRfqSupplierQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          inviteStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, inviteStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ inviteStatus: 'INVITED' });
    setOpen(true);
  };

  const openEdit = (record: SrmRfqSupplier) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      inviteDate: record.inviteDate ? dayjs(record.inviteDate) : undefined,
      respondDate: record.respondDate ? dayjs(record.respondDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmRfqSupplierSaveRequest = {
        ...values,
        inviteDate: values.inviteDate ? values.inviteDate.format(DATE_FORMAT) : undefined,
        respondDate: values.respondDate ? values.respondDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('询价邀请已创建');
      } else {
        await service.update(editId, payload);
        message.success('询价邀请已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('询价邀请已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmRfqSupplier> = [
    { title: '邀请单号', dataIndex: 'inviteNo', width: 170, fixed: 'left', render: plain },
    { title: '询价单号', dataIndex: 'rfqNo', width: 170, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '联系人', dataIndex: 'contact', width: 100, render: plain },
    { title: '联系电话', dataIndex: 'phone', width: 140, render: plain },
    { title: '联系邮箱', dataIndex: 'email', width: 200, render: plain },
    { title: '邀请日期', dataIndex: 'inviteDate', width: 120, render: formatDate },
    { title: '应答日期', dataIndex: 'respondDate', width: 120, render: formatDate },
    {
      title: '邀请状态',
      dataIndex: 'inviteStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_RFQ_SUPPLIER_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该询价邀请？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        询价邀请
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="邀请状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={inviteStatus}
              onChange={(v) => setInviteStatus(v)}
              options={[...SRM_RFQ_SUPPLIER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="邀请单号 / 询价单号 / 供应商编码 / 供应商名称"
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
                  void loadData(1, pageSize, keyword, inviteStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setInviteStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建询价邀请</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`询价邀请（共 ${total} 条）`}>
        <Table<SrmRfqSupplier>
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
        title={editId == null ? '新建询价邀请' : '编辑询价邀请'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="inviteNo" label="邀请单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="rfqNo" label="询价单号">
            <Input placeholder="请输入询价单号" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码" rules={[{ required: true, message: '请输入供应商编码' }]}>
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="contact" label="联系人">
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="email" label="联系邮箱">
            <Input placeholder="请输入联系邮箱" />
          </Form.Item>
          <Form.Item name="inviteDate" label="邀请日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择邀请日期" />
          </Form.Item>
          <Form.Item name="respondDate" label="应答日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择应答日期" />
          </Form.Item>
          <Form.Item name="inviteStatus" label="邀请状态">
            <Select placeholder="为空默认 INVITED" options={[...SRM_RFQ_SUPPLIER_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="declineReason" label="拒绝原因">
            <Input.TextArea rows={2} placeholder="请输入拒绝原因" />
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
