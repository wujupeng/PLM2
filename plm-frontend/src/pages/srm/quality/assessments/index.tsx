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
import { srmSupplierAssessmentService as service } from '@/services/srmQualityService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_ASSESSMENT_GRADE_LABEL,
  SRM_ASSESSMENT_GRADE_OPTIONS,
  SRM_ASSESSMENT_STATUS_LABEL,
  SRM_ASSESSMENT_STATUS_OPTIONS,
  SRM_ASSESSMENT_TYPE_LABEL,
  SRM_ASSESSMENT_TYPE_OPTIONS,
  type SrmSupplierAssessment,
  type SrmSupplierAssessmentQuery,
  type SrmSupplierAssessmentSaveRequest,
} from '@/types/srmQuality';

const { Title } = Typography;

const MANAGE = 'srm:quality:assessment:manage';

type FormValues = Omit<SrmSupplierAssessmentSaveRequest, 'assessDate'> & {
  assessDate?: Dayjs;
};

export default function SrmSupplierAssessmentPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmSupplierAssessment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [assessmentType, setAssessmentType] = useState<string | undefined>(undefined);
  const [assessmentStatus, setAssessmentStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = assessmentType,
      status = assessmentStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmSupplierAssessmentQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          assessmentType: type,
          assessmentStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, assessmentType, assessmentStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ assessmentType: 'MONTHLY', assessmentStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: SrmSupplierAssessment) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      assessDate: record.assessDate ? dayjs(record.assessDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmSupplierAssessmentSaveRequest = {
        ...values,
        assessDate: values.assessDate ? values.assessDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('供应商考评已创建');
      } else {
        await service.update(editId, payload);
        message.success('供应商考评已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('供应商考评已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmSupplierAssessment> = [
    { title: '考评单号', dataIndex: 'assessmentNo', width: 170, fixed: 'left', render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '考评周期', dataIndex: 'assessmentPeriod', width: 130, render: plain },
    {
      title: '考评类型',
      dataIndex: 'assessmentType',
      width: 120,
      render: (v) => statusTag(SRM_ASSESSMENT_TYPE_LABEL, v),
    },
    { title: '质量得分', dataIndex: 'qualityScore', width: 100, render: plain },
    { title: '交期得分', dataIndex: 'deliveryScore', width: 100, render: plain },
    { title: '价格得分', dataIndex: 'priceScore', width: 100, render: plain },
    { title: '服务得分', dataIndex: 'serviceScore', width: 100, render: plain },
    { title: '综合得分', dataIndex: 'totalScore', width: 100, render: plain },
    {
      title: '等级评定',
      dataIndex: 'gradeLevel',
      width: 100,
      render: (v) => statusTag(SRM_ASSESSMENT_GRADE_LABEL, v),
    },
    { title: '考评结论', dataIndex: 'assessmentResult', width: 180, render: plain },
    { title: '考评人', dataIndex: 'assessor', width: 100, render: plain },
    { title: '考评日期', dataIndex: 'assessDate', width: 120, render: formatDate },
    {
      title: '考评状态',
      dataIndex: 'assessmentStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_ASSESSMENT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该供应商考评？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        供应商考评
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="考评类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={assessmentType}
              onChange={(v) => setAssessmentType(v)}
              options={[...SRM_ASSESSMENT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="考评状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={assessmentStatus}
              onChange={(v) => setAssessmentStatus(v)}
              options={[...SRM_ASSESSMENT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="考评单号 / 供应商编码 / 供应商名称 / 考评周期"
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
                  void loadData(1, pageSize, keyword, assessmentType, assessmentStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setAssessmentType(undefined);
                  setAssessmentStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建供应商考评</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`供应商考评（共 ${total} 条）`}>
        <Table<SrmSupplierAssessment>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2600 }}
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
        title={editId == null ? '新建供应商考评' : '编辑供应商考评'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="assessmentNo" label="考评单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="assessmentPeriod" label="考评周期">
            <Input placeholder="如 2026-11 或 2026Q4" />
          </Form.Item>
          <Form.Item name="assessmentType" label="考评类型">
            <Select placeholder="为空默认 MONTHLY" options={[...SRM_ASSESSMENT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="qualityScore" label="质量得分">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="deliveryScore" label="交期得分">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="priceScore" label="价格得分">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="serviceScore" label="服务得分">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="totalScore" label="综合得分">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="gradeLevel" label="等级评定">
            <Select placeholder="请选择" options={[...SRM_ASSESSMENT_GRADE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="assessmentResult" label="考评结论">
            <Input.TextArea rows={2} placeholder="请输入考评结论" />
          </Form.Item>
          <Form.Item name="assessor" label="考评人">
            <Input placeholder="请输入考评人" />
          </Form.Item>
          <Form.Item name="assessDate" label="考评日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="assessmentStatus" label="考评状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_ASSESSMENT_STATUS_OPTIONS]} />
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
