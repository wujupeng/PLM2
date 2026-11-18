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
import { srmSupplierService } from '@/services/srmSupplierService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_SUPPLIER_GRADE_LEVEL_LABEL,
  SRM_SUPPLIER_GRADE_LEVEL_OPTIONS,
  SRM_SUPPLIER_SOURCE_OPTIONS,
  SRM_SUPPLIER_STATUS_LABEL,
  SRM_SUPPLIER_STATUS_OPTIONS,
  SRM_SUPPLIER_TYPE_LABEL,
  SRM_SUPPLIER_TYPE_OPTIONS,
  type SrmSupplier,
  type SrmSupplierQuery,
  type SrmSupplierSaveRequest,
} from '@/types/srmSupplier';

const { Title } = Typography;

const MANAGE = 'srm:supplier:archive:manage';

type FormValues = Omit<SrmSupplierSaveRequest, 'admissionDate'> & {
  admissionDate?: Dayjs;
};

export default function SrmSupplierArchivePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmSupplier[]>([]);
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
      type = supplierType,
      status = supplierStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmSupplierQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          supplierType: type,
          supplierStatus: status,
        };
        const res = await srmSupplierService.page(params);
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
    form.setFieldsValue({ supplierType: 'RAW', supplierStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: SrmSupplier) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      admissionDate: record.admissionDate ? dayjs(record.admissionDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmSupplierSaveRequest = {
        ...values,
        admissionDate: values.admissionDate ? values.admissionDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await srmSupplierService.create(payload);
        message.success('供应商主档已创建');
      } else {
        await srmSupplierService.update(editId, payload);
        message.success('供应商主档已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await srmSupplierService.remove(id);
    message.success('供应商主档已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmSupplier> = [
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, fixed: 'left', render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '简称', dataIndex: 'shortName', width: 120, render: plain },
    {
      title: '供应商类型',
      dataIndex: 'supplierType',
      width: 110,
      render: (v) => statusTag(SRM_SUPPLIER_TYPE_LABEL, v),
    },
    { title: '统一社会信用代码', dataIndex: 'unifiedSocialCode', width: 180, render: plain },
    { title: '联系人', dataIndex: 'contact', width: 100, render: plain },
    { title: '联系电话', dataIndex: 'phone', width: 130, render: plain },
    {
      title: '等级',
      dataIndex: 'gradeLevel',
      width: 100,
      render: (v) => statusTag(SRM_SUPPLIER_GRADE_LEVEL_LABEL, v),
    },
    { title: '准入日期', dataIndex: 'admissionDate', width: 120, render: formatDate },
    {
      title: '供应商状态',
      dataIndex: 'supplierStatus',
      width: 120,
      fixed: 'right',
      render: (v) => statusTag(SRM_SUPPLIER_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该供应商主档？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        供应商主档
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="供应商类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={supplierType}
              onChange={(v) => setSupplierType(v)}
              options={[...SRM_SUPPLIER_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="供应商状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={supplierStatus}
              onChange={(v) => setSupplierStatus(v)}
              options={[...SRM_SUPPLIER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="供应商编码 / 供应商名称 / 简称 / 联系人"
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
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建供应商主档</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`供应商主档（共 ${total} 条）`}>
        <Table<SrmSupplier>
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
        title={editId == null ? '新建供应商主档' : '编辑供应商主档'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="supplierCode"
            label="供应商编码"
            rules={[{ required: true, message: '请输入供应商编码' }]}
          >
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item
            name="supplierName"
            label="供应商名称"
            rules={[{ required: true, message: '请输入供应商名称' }]}
          >
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="shortName" label="简称">
            <Input placeholder="请输入简称" />
          </Form.Item>
          <Form.Item name="supplierType" label="供应商类型">
            <Select placeholder="为空默认 RAW" options={[...SRM_SUPPLIER_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="unifiedSocialCode" label="统一社会信用代码">
            <Input placeholder="请输入统一社会信用代码" />
          </Form.Item>
          <Form.Item name="legalPerson" label="法定代表人">
            <Input placeholder="请输入法定代表人" />
          </Form.Item>
          <Form.Item name="registeredCapital" label="注册资本">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入注册资本" />
          </Form.Item>
          <Form.Item name="businessScope" label="经营范围">
            <Input.TextArea rows={2} placeholder="请输入经营范围" />
          </Form.Item>
          <Form.Item name="region" label="所在地区">
            <Input placeholder="请输入所在地区" />
          </Form.Item>
          <Form.Item name="industry" label="所属行业">
            <Input placeholder="请输入所属行业" />
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
          <Form.Item name="address" label="联系地址">
            <Input placeholder="请输入联系地址" />
          </Form.Item>
          <Form.Item name="gradeLevel" label="等级">
            <Select placeholder="请选择等级" options={[...SRM_SUPPLIER_GRADE_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="supplierStatus" label="供应商状态">
            <Select placeholder="为空默认 PENDING" options={[...SRM_SUPPLIER_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="admissionDate" label="准入日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择准入日期" />
          </Form.Item>
          <Form.Item name="source" label="来源">
            <Select placeholder="请选择来源" options={[...SRM_SUPPLIER_SOURCE_OPTIONS]} />
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
