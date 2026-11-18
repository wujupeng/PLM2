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
import { srmSupplierBlacklistService } from '@/services/srmSupplierService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_SUPPLIER_BLACKLIST_STATUS_LABEL,
  SRM_SUPPLIER_BLACKLIST_STATUS_OPTIONS,
  SRM_SUPPLIER_BLACKLIST_TYPE_LABEL,
  SRM_SUPPLIER_BLACKLIST_TYPE_OPTIONS,
  type SrmSupplierBlacklist,
  type SrmSupplierBlacklistQuery,
  type SrmSupplierBlacklistSaveRequest,
} from '@/types/srmSupplier';

const { Title } = Typography;

const MANAGE = 'srm:supplier:blacklist:manage';

type FormValues = Omit<SrmSupplierBlacklistSaveRequest, 'effectiveDate' | 'expireDate' | 'approveDate'> & {
  effectiveDate?: Dayjs;
  expireDate?: Dayjs;
  approveDate?: Dayjs;
};

export default function SrmSupplierBlacklistPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmSupplierBlacklist[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [blacklistType, setBlacklistType] = useState<string | undefined>(undefined);
  const [blacklistStatus, setBlacklistStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = blacklistType,
      status = blacklistStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmSupplierBlacklistQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          blacklistType: type,
          blacklistStatus: status,
        };
        const res = await srmSupplierBlacklistService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, blacklistType, blacklistStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ blacklistType: 'TEMPORARY', blacklistStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: SrmSupplierBlacklist) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      expireDate: record.expireDate ? dayjs(record.expireDate) : undefined,
      approveDate: record.approveDate ? dayjs(record.approveDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmSupplierBlacklistSaveRequest = {
        ...values,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format(DATE_FORMAT) : undefined,
        expireDate: values.expireDate ? values.expireDate.format(DATE_FORMAT) : undefined,
        approveDate: values.approveDate ? values.approveDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await srmSupplierBlacklistService.create(payload);
        message.success('供应商黑名单已创建');
      } else {
        await srmSupplierBlacklistService.update(editId, payload);
        message.success('供应商黑名单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await srmSupplierBlacklistService.remove(id);
    message.success('供应商黑名单已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmSupplierBlacklist> = [
    { title: '黑名单编号', dataIndex: 'blacklistNo', width: 170, fixed: 'left', render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    {
      title: '黑名单类型',
      dataIndex: 'blacklistType',
      width: 110,
      render: (v) => statusTag(SRM_SUPPLIER_BLACKLIST_TYPE_LABEL, v),
    },
    { title: '拉黑原因', dataIndex: 'blacklistReason', width: 200, ellipsis: true, render: plain },
    { title: '生效日期', dataIndex: 'effectiveDate', width: 120, render: formatDate },
    { title: '失效日期', dataIndex: 'expireDate', width: 120, render: formatDate },
    { title: '申请人', dataIndex: 'applyBy', width: 100, render: plain },
    { title: '审批人', dataIndex: 'approver', width: 100, render: plain },
    {
      title: '黑名单状态',
      dataIndex: 'blacklistStatus',
      width: 120,
      fixed: 'right',
      render: (v) => statusTag(SRM_SUPPLIER_BLACKLIST_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该供应商黑名单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        供应商黑名单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="黑名单类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={blacklistType}
              onChange={(v) => setBlacklistType(v)}
              options={[...SRM_SUPPLIER_BLACKLIST_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="黑名单状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={blacklistStatus}
              onChange={(v) => setBlacklistStatus(v)}
              options={[...SRM_SUPPLIER_BLACKLIST_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="黑名单编号 / 供应商编码 / 供应商名称 / 申请人"
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
                  void loadData(1, pageSize, keyword, blacklistType, blacklistStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBlacklistType(undefined);
                  setBlacklistStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建供应商黑名单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`供应商黑名单（共 ${total} 条）`}>
        <Table<SrmSupplierBlacklist>
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
        title={editId == null ? '新建供应商黑名单' : '编辑供应商黑名单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="blacklistNo" label="黑名单编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="blacklistType" label="黑名单类型">
            <Select
              placeholder="为空默认 TEMPORARY"
              options={[...SRM_SUPPLIER_BLACKLIST_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item name="blacklistReason" label="拉黑原因">
            <Input.TextArea rows={2} placeholder="请输入拉黑原因" />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择生效日期" />
          </Form.Item>
          <Form.Item name="expireDate" label="失效日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择失效日期" />
          </Form.Item>
          <Form.Item name="applyBy" label="申请人">
            <Input placeholder="请输入申请人" />
          </Form.Item>
          <Form.Item name="approver" label="审批人">
            <Input placeholder="请输入审批人" />
          </Form.Item>
          <Form.Item name="approveDate" label="审批日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择审批日期" />
          </Form.Item>
          <Form.Item name="releaseReason" label="解除原因">
            <Input.TextArea rows={2} placeholder="请输入解除原因" />
          </Form.Item>
          <Form.Item name="blacklistStatus" label="黑名单状态">
            <Select
              placeholder="为空默认 ACTIVE"
              options={[...SRM_SUPPLIER_BLACKLIST_STATUS_OPTIONS]}
            />
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
