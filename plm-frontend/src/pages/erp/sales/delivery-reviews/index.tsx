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
import { erpDeliveryReviewService } from '@/services/erpSalesService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_REVIEW_RECORD_STATUS_LABEL,
  ERP_REVIEW_RECORD_STATUS_OPTIONS,
  ERP_REVIEW_RESULT_LABEL,
  ERP_REVIEW_RESULT_OPTIONS,
  type ErpDeliveryReview,
  type ErpDeliveryReviewSaveRequest,
} from '@/types/erpSales';

const { Title } = Typography;

const MANAGE = 'erp:sales:deliveryreview:manage';

type FormValues = Omit<
  ErpDeliveryReviewSaveRequest,
  'customerRequestDate' | 'promisedDate' | 'reviewDate'
> & {
  customerRequestDate?: Dayjs;
  promisedDate?: Dayjs;
  reviewDate?: Dayjs;
};

export default function ErpDeliveryReviewPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpDeliveryReview[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [reviewStatus, setReviewStatus] = useState<string | undefined>(undefined);
  const [reviewResult, setReviewResult] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = reviewStatus,
      result = reviewResult,
      no = orderNo,
    ) => {
      setLoading(true);
      try {
        const res = await erpDeliveryReviewService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          reviewStatus: status,
          reviewResult: result,
          orderNo: no || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, reviewStatus, reviewResult, orderNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ reviewResult: 'PENDING', reviewStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: ErpDeliveryReview) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      customerRequestDate: record.customerRequestDate ? dayjs(record.customerRequestDate) : undefined,
      promisedDate: record.promisedDate ? dayjs(record.promisedDate) : undefined,
      reviewDate: record.reviewDate ? dayjs(record.reviewDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        customerRequestDate: values.customerRequestDate
          ? values.customerRequestDate.format('YYYY-MM-DDTHH:mm:ss')
          : undefined,
        promisedDate: values.promisedDate ? values.promisedDate.format('YYYY-MM-DDTHH:mm:ss') : undefined,
        reviewDate: values.reviewDate ? values.reviewDate.format('YYYY-MM-DDTHH:mm:ss') : undefined,
      };
      if (editId == null) {
        await erpDeliveryReviewService.create(payload);
        message.success('交期评审已创建');
      } else {
        await erpDeliveryReviewService.update(editId, payload);
        message.success('交期评审已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpDeliveryReviewService.remove(id);
    message.success('交期评审已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpDeliveryReview> = [
    { title: '评审单号', dataIndex: 'reviewNo', width: 160, fixed: 'left', render: plain },
    { title: '订单号', dataIndex: 'orderNo', width: 160, render: plain },
    { title: '订单行号', dataIndex: 'orderLineNo', width: 100, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '客户需求日期', dataIndex: 'customerRequestDate', width: 130, render: formatDateTime },
    { title: '承诺日期', dataIndex: 'promisedDate', width: 130, render: formatDateTime },
    {
      title: '评审结果',
      dataIndex: 'reviewResult',
      width: 110,
      render: (v) => statusTag(ERP_REVIEW_RESULT_LABEL, v),
    },
    { title: '评审意见', dataIndex: 'reviewOpinion', width: 180, ellipsis: true, render: plain },
    { title: '评审人', dataIndex: 'reviewer', width: 120, render: plain },
    { title: '评审日期', dataIndex: 'reviewDate', width: 130, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '评审状态',
      dataIndex: 'reviewStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ERP_REVIEW_RECORD_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该交期评审？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        交期评审
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="评审状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={reviewStatus}
              onChange={(v) => setReviewStatus(v)}
              options={[...ERP_REVIEW_RECORD_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="评审结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={reviewResult}
              onChange={(v) => setReviewResult(v)}
              options={[...ERP_REVIEW_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="订单号">
            <Input
              placeholder="请输入订单号"
              allowClear
              style={{ width: 180 }}
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="评审单号 / 物料名称"
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
                  void loadData(1, pageSize, keyword, reviewStatus, reviewResult, orderNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setReviewStatus(undefined);
                  setReviewResult(undefined);
                  setOrderNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建交期评审</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`交期评审（共 ${total} 条）`}>
        <Table<ErpDeliveryReview>
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
        title={editId == null ? '新建交期评审' : '编辑交期评审'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="orderNo" label="订单号" rules={[{ required: true, message: '请输入订单号' }]}>
            <Input placeholder="请输入订单号" />
          </Form.Item>
          <Form.Item name="orderLineNo" label="订单行号">
            <InputNumber style={{ width: '100%' }} placeholder="请输入订单行号" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="customerRequestDate" label="客户需求日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择客户需求日期" />
          </Form.Item>
          <Form.Item name="promisedDate" label="承诺日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择承诺日期" />
          </Form.Item>
          <Form.Item name="reviewResult" label="评审结果">
            <Select placeholder="为空默认 PENDING" options={[...ERP_REVIEW_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="reviewOpinion" label="评审意见">
            <Input.TextArea rows={2} placeholder="请输入评审意见" />
          </Form.Item>
          <Form.Item name="reviewer" label="评审人">
            <Input placeholder="请输入评审人" />
          </Form.Item>
          <Form.Item name="reviewDate" label="评审日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择评审日期" />
          </Form.Item>
          <Form.Item name="reviewStatus" label="评审状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_REVIEW_RECORD_STATUS_OPTIONS]} />
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
