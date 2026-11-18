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
import { srmSupplierAdmissionService } from '@/services/srmSupplierService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_SUPPLIER_ADMISSION_STATUS_LABEL,
  SRM_SUPPLIER_ADMISSION_STATUS_OPTIONS,
  SRM_SUPPLIER_ADMISSION_TYPE_LABEL,
  SRM_SUPPLIER_ADMISSION_TYPE_OPTIONS,
  SRM_SUPPLIER_SOURCE_LABEL,
  SRM_SUPPLIER_SOURCE_OPTIONS,
  type SrmSupplierAdmission,
  type SrmSupplierAdmissionQuery,
  type SrmSupplierAdmissionSaveRequest,
} from '@/types/srmSupplier';

const { Title } = Typography;

const MANAGE = 'srm:supplier:admission:manage';

type FormValues = Omit<SrmSupplierAdmissionSaveRequest, 'applyDate' | 'approveDate'> & {
  applyDate?: Dayjs;
  approveDate?: Dayjs;
};

export default function SrmSupplierAdmissionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmSupplierAdmission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [admissionType, setAdmissionType] = useState<string | undefined>(undefined);
  const [admissionStatus, setAdmissionStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = admissionType,
      status = admissionStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmSupplierAdmissionQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          admissionType: type,
          admissionStatus: status,
        };
        const res = await srmSupplierAdmissionService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, admissionType, admissionStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ admissionType: 'NEW', admissionStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: SrmSupplierAdmission) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      applyDate: record.applyDate ? dayjs(record.applyDate) : undefined,
      approveDate: record.approveDate ? dayjs(record.approveDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmSupplierAdmissionSaveRequest = {
        ...values,
        applyDate: values.applyDate ? values.applyDate.format(DATE_FORMAT) : undefined,
        approveDate: values.approveDate ? values.approveDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await srmSupplierAdmissionService.create(payload);
        message.success('供应商准入已创建');
      } else {
        await srmSupplierAdmissionService.update(editId, payload);
        message.success('供应商准入已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await srmSupplierAdmissionService.remove(id);
    message.success('供应商准入已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmSupplierAdmission> = [
    { title: '准入单号', dataIndex: 'admissionNo', width: 180, fixed: 'left', render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    {
      title: '准入类型',
      dataIndex: 'admissionType',
      width: 110,
      render: (v) => statusTag(SRM_SUPPLIER_ADMISSION_TYPE_LABEL, v),
    },
    {
      title: '来源',
      dataIndex: 'source',
      width: 110,
      render: (v) => statusTag(SRM_SUPPLIER_SOURCE_LABEL, v),
    },
    { title: '申请人', dataIndex: 'applyBy', width: 100, render: plain },
    { title: '申请日期', dataIndex: 'applyDate', width: 120, render: formatDate },
    { title: '评估得分', dataIndex: 'assessScore', width: 100, render: plain },
    { title: '审批人', dataIndex: 'approver', width: 100, render: plain },
    {
      title: '准入状态',
      dataIndex: 'admissionStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_SUPPLIER_ADMISSION_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该供应商准入？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        供应商准入
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="准入类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={admissionType}
              onChange={(v) => setAdmissionType(v)}
              options={[...SRM_SUPPLIER_ADMISSION_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="准入状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={admissionStatus}
              onChange={(v) => setAdmissionStatus(v)}
              options={[...SRM_SUPPLIER_ADMISSION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="准入单号 / 供应商编码 / 供应商名称 / 申请人"
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
                  void loadData(1, pageSize, keyword, admissionType, admissionStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setAdmissionType(undefined);
                  setAdmissionStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建供应商准入</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`供应商准入（共 ${total} 条）`}>
        <Table<SrmSupplierAdmission>
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
        title={editId == null ? '新建供应商准入' : '编辑供应商准入'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="admissionNo" label="准入单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="admissionType" label="准入类型">
            <Select placeholder="为空默认 NEW" options={[...SRM_SUPPLIER_ADMISSION_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="source" label="来源">
            <Select placeholder="请选择" options={[...SRM_SUPPLIER_SOURCE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="applyBy" label="申请人">
            <Input placeholder="请输入申请人" />
          </Form.Item>
          <Form.Item name="applyDate" label="申请日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择申请日期" />
          </Form.Item>
          <Form.Item name="assessScore" label="评估得分">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入评估得分" />
          </Form.Item>
          <Form.Item name="assessConclusion" label="评估结论">
            <Input.TextArea rows={2} placeholder="请输入评估结论" />
          </Form.Item>
          <Form.Item name="approver" label="审批人">
            <Input placeholder="请输入审批人" />
          </Form.Item>
          <Form.Item name="approveDate" label="审批日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择审批日期" />
          </Form.Item>
          <Form.Item name="admissionStatus" label="准入状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_SUPPLIER_ADMISSION_STATUS_OPTIONS]} />
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
