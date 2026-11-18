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
import { srmSupplierQualificationService } from '@/services/srmSupplierService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_SUPPLIER_QUALIFICATION_STATUS_LABEL,
  SRM_SUPPLIER_QUALIFICATION_STATUS_OPTIONS,
  SRM_SUPPLIER_QUALIFICATION_TYPE_LABEL,
  SRM_SUPPLIER_QUALIFICATION_TYPE_OPTIONS,
  type SrmSupplierQualification,
  type SrmSupplierQualificationQuery,
  type SrmSupplierQualificationSaveRequest,
} from '@/types/srmSupplier';

const { Title } = Typography;

const MANAGE = 'srm:supplier:qualification:manage';

type FormValues = Omit<SrmSupplierQualificationSaveRequest, 'issueDate' | 'expireDate'> & {
  issueDate?: Dayjs;
  expireDate?: Dayjs;
};

export default function SrmSupplierQualificationPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmSupplierQualification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [qualificationType, setQualificationType] = useState<string | undefined>(undefined);
  const [qualificationStatus, setQualificationStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = qualificationType,
      status = qualificationStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmSupplierQualificationQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          qualificationType: type,
          qualificationStatus: status,
        };
        const res = await srmSupplierQualificationService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, qualificationType, qualificationStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ qualificationType: 'BUSINESS_LICENSE', qualificationStatus: 'VALID' });
    setOpen(true);
  };

  const openEdit = (record: SrmSupplierQualification) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      issueDate: record.issueDate ? dayjs(record.issueDate) : undefined,
      expireDate: record.expireDate ? dayjs(record.expireDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmSupplierQualificationSaveRequest = {
        ...values,
        issueDate: values.issueDate ? values.issueDate.format(DATE_FORMAT) : undefined,
        expireDate: values.expireDate ? values.expireDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await srmSupplierQualificationService.create(payload);
        message.success('供应商资质已创建');
      } else {
        await srmSupplierQualificationService.update(editId, payload);
        message.success('供应商资质已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await srmSupplierQualificationService.remove(id);
    message.success('供应商资质已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmSupplierQualification> = [
    { title: '资质编号', dataIndex: 'qualificationNo', width: 180, fixed: 'left', render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    {
      title: '资质类型',
      dataIndex: 'qualificationType',
      width: 140,
      render: (v) => statusTag(SRM_SUPPLIER_QUALIFICATION_TYPE_LABEL, v),
    },
    { title: '资质名称', dataIndex: 'qualificationName', width: 160, render: plain },
    { title: '证书号', dataIndex: 'certNo', width: 150, render: plain },
    { title: '发证机构', dataIndex: 'issueAuthority', width: 160, render: plain },
    { title: '发证日期', dataIndex: 'issueDate', width: 120, render: formatDate },
    { title: '到期日期', dataIndex: 'expireDate', width: 120, render: formatDate },
    {
      title: '资质状态',
      dataIndex: 'qualificationStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_SUPPLIER_QUALIFICATION_STATUS_LABEL, v),
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
              title="确认删除该供应商资质？"
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
        供应商资质
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="资质类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 160 }}
              value={qualificationType}
              onChange={(v) => setQualificationType(v)}
              options={[...SRM_SUPPLIER_QUALIFICATION_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="资质状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={qualificationStatus}
              onChange={(v) => setQualificationStatus(v)}
              options={[...SRM_SUPPLIER_QUALIFICATION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="资质编号 / 供应商编码 / 供应商名称 / 证书号"
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
                  void loadData(1, pageSize, keyword, qualificationType, qualificationStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setQualificationType(undefined);
                  setQualificationStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建供应商资质</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`供应商资质（共 ${total} 条）`}>
        <Table<SrmSupplierQualification>
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
        title={editId == null ? '新建供应商资质' : '编辑供应商资质'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="qualificationNo" label="资质编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="qualificationType" label="资质类型">
            <Select
              placeholder="为空默认 BUSINESS_LICENSE"
              options={[...SRM_SUPPLIER_QUALIFICATION_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item name="qualificationName" label="资质名称">
            <Input placeholder="请输入资质名称" />
          </Form.Item>
          <Form.Item name="certNo" label="证书号">
            <Input placeholder="请输入证书号" />
          </Form.Item>
          <Form.Item name="issueAuthority" label="发证机构">
            <Input placeholder="请输入发证机构" />
          </Form.Item>
          <Form.Item name="issueDate" label="发证日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择发证日期" />
          </Form.Item>
          <Form.Item name="expireDate" label="到期日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择到期日期" />
          </Form.Item>
          <Form.Item name="attachmentUrl" label="附件地址">
            <Input placeholder="请输入附件地址" />
          </Form.Item>
          <Form.Item name="qualificationStatus" label="资质状态">
            <Select
              placeholder="为空默认 VALID"
              options={[...SRM_SUPPLIER_QUALIFICATION_STATUS_OPTIONS]}
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
