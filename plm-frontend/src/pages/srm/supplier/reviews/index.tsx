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
import { srmSupplierReviewService } from '@/services/srmSupplierService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_SUPPLIER_GRADE_LEVEL_LABEL,
  SRM_SUPPLIER_GRADE_LEVEL_OPTIONS,
  SRM_SUPPLIER_REVIEW_RESULT_LABEL,
  SRM_SUPPLIER_REVIEW_RESULT_OPTIONS,
  SRM_SUPPLIER_REVIEW_STATUS_LABEL,
  SRM_SUPPLIER_REVIEW_STATUS_OPTIONS,
  SRM_SUPPLIER_REVIEW_TYPE_LABEL,
  SRM_SUPPLIER_REVIEW_TYPE_OPTIONS,
  type SrmSupplierReview,
  type SrmSupplierReviewQuery,
  type SrmSupplierReviewSaveRequest,
} from '@/types/srmSupplier';

const { Title } = Typography;

const MANAGE = 'srm:supplier:review:manage';

type FormValues = Omit<SrmSupplierReviewSaveRequest, 'reviewDate' | 'nextReviewDate'> & {
  reviewDate?: Dayjs;
  nextReviewDate?: Dayjs;
};

export default function SrmSupplierReviewPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmSupplierReview[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [reviewType, setReviewType] = useState<string | undefined>(undefined);
  const [reviewStatus, setReviewStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = reviewType,
      status = reviewStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmSupplierReviewQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          reviewType: type,
          reviewStatus: status,
        };
        const res = await srmSupplierReviewService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, reviewType, reviewStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ reviewType: 'ANNUAL', reviewStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: SrmSupplierReview) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      reviewDate: record.reviewDate ? dayjs(record.reviewDate) : undefined,
      nextReviewDate: record.nextReviewDate ? dayjs(record.nextReviewDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmSupplierReviewSaveRequest = {
        ...values,
        reviewDate: values.reviewDate ? values.reviewDate.format(DATE_FORMAT) : undefined,
        nextReviewDate: values.nextReviewDate ? values.nextReviewDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await srmSupplierReviewService.create(payload);
        message.success('年度复审已创建');
      } else {
        await srmSupplierReviewService.update(editId, payload);
        message.success('年度复审已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await srmSupplierReviewService.remove(id);
    message.success('年度复审已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmSupplierReview> = [
    { title: '复审编号', dataIndex: 'reviewNo', width: 170, fixed: 'left', render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '复审周期', dataIndex: 'reviewPeriod', width: 120, render: plain },
    {
      title: '复审类型',
      dataIndex: 'reviewType',
      width: 110,
      render: (v) => statusTag(SRM_SUPPLIER_REVIEW_TYPE_LABEL, v),
    },
    {
      title: '当前等级',
      dataIndex: 'currentGrade',
      width: 110,
      render: (v) => statusTag(SRM_SUPPLIER_GRADE_LEVEL_LABEL, v),
    },
    { title: '复审得分', dataIndex: 'reviewScore', width: 100, render: plain },
    {
      title: '复审结果',
      dataIndex: 'reviewResult',
      width: 110,
      render: (v) => statusTag(SRM_SUPPLIER_REVIEW_RESULT_LABEL, v),
    },
    { title: '复审人', dataIndex: 'reviewer', width: 100, render: plain },
    { title: '复审日期', dataIndex: 'reviewDate', width: 120, render: formatDate },
    {
      title: '复审状态',
      dataIndex: 'reviewStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_SUPPLIER_REVIEW_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该年度复审？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        年度复审
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="复审类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={reviewType}
              onChange={(v) => setReviewType(v)}
              options={[...SRM_SUPPLIER_REVIEW_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="复审状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={reviewStatus}
              onChange={(v) => setReviewStatus(v)}
              options={[...SRM_SUPPLIER_REVIEW_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="复审编号 / 供应商编码 / 供应商名称 / 复审人"
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
                  void loadData(1, pageSize, keyword, reviewType, reviewStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setReviewType(undefined);
                  setReviewStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建年度复审</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`年度复审（共 ${total} 条）`}>
        <Table<SrmSupplierReview>
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
        title={editId == null ? '新建年度复审' : '编辑年度复审'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="reviewNo" label="复审编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="reviewPeriod" label="复审周期">
            <Input placeholder="请输入复审周期" />
          </Form.Item>
          <Form.Item name="reviewType" label="复审类型">
            <Select placeholder="为空默认 ANNUAL" options={[...SRM_SUPPLIER_REVIEW_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="currentGrade" label="当前等级">
            <Select placeholder="请选择" options={[...SRM_SUPPLIER_GRADE_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="reviewScore" label="复审得分">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入复审得分" />
          </Form.Item>
          <Form.Item name="reviewResult" label="复审结果">
            <Select placeholder="请选择" options={[...SRM_SUPPLIER_REVIEW_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="reviewer" label="复审人">
            <Input placeholder="请输入复审人" />
          </Form.Item>
          <Form.Item name="reviewDate" label="复审日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择复审日期" />
          </Form.Item>
          <Form.Item name="nextReviewDate" label="下次复审日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择下次复审日期" />
          </Form.Item>
          <Form.Item name="reviewStatus" label="复审状态">
            <Select placeholder="为空默认 PENDING" options={[...SRM_SUPPLIER_REVIEW_STATUS_OPTIONS]} />
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
