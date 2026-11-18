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
import { srmSupplierGradeService } from '@/services/srmSupplierService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_SUPPLIER_GRADE_LEVEL_LABEL,
  SRM_SUPPLIER_GRADE_LEVEL_OPTIONS,
  SRM_SUPPLIER_GRADE_STATUS_LABEL,
  SRM_SUPPLIER_GRADE_STATUS_OPTIONS,
  type SrmSupplierGrade,
  type SrmSupplierGradeQuery,
  type SrmSupplierGradeSaveRequest,
} from '@/types/srmSupplier';

const { Title } = Typography;

const MANAGE = 'srm:supplier:grade:manage';

type FormValues = Omit<SrmSupplierGradeSaveRequest, 'gradeDate'> & {
  gradeDate?: Dayjs;
};

export default function SrmSupplierGradePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmSupplierGrade[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [gradeLevel, setGradeLevel] = useState<string | undefined>(undefined);
  const [gradeStatus, setGradeStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      level = gradeLevel,
      status = gradeStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmSupplierGradeQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          gradeLevel: level,
          gradeStatus: status,
        };
        const res = await srmSupplierGradeService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, gradeLevel, gradeStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ gradeLevel: 'C', gradeStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: SrmSupplierGrade) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      gradeDate: record.gradeDate ? dayjs(record.gradeDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmSupplierGradeSaveRequest = {
        ...values,
        gradeDate: values.gradeDate ? values.gradeDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await srmSupplierGradeService.create(payload);
        message.success('供应商分级已创建');
      } else {
        await srmSupplierGradeService.update(editId, payload);
        message.success('供应商分级已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await srmSupplierGradeService.remove(id);
    message.success('供应商分级已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmSupplierGrade> = [
    { title: '分级编号', dataIndex: 'gradeNo', width: 170, fixed: 'left', render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    {
      title: '分级级别',
      dataIndex: 'gradeLevel',
      width: 110,
      render: (v) => statusTag(SRM_SUPPLIER_GRADE_LEVEL_LABEL, v),
    },
    { title: '分级周期', dataIndex: 'gradePeriod', width: 120, render: plain },
    { title: '分级得分', dataIndex: 'gradeScore', width: 100, render: plain },
    { title: '评估人', dataIndex: 'evaluator', width: 100, render: plain },
    { title: '评估日期', dataIndex: 'gradeDate', width: 120, render: formatDate },
    {
      title: '分级状态',
      dataIndex: 'gradeStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_SUPPLIER_GRADE_STATUS_LABEL, v),
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
              title="确认删除该供应商分级？"
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
        供应商分级
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="分级级别">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={gradeLevel}
              onChange={(v) => setGradeLevel(v)}
              options={[...SRM_SUPPLIER_GRADE_LEVEL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="分级状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={gradeStatus}
              onChange={(v) => setGradeStatus(v)}
              options={[...SRM_SUPPLIER_GRADE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="分级编号 / 供应商编码 / 供应商名称 / 评估人"
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
                  void loadData(1, pageSize, keyword, gradeLevel, gradeStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setGradeLevel(undefined);
                  setGradeStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建供应商分级</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`供应商分级（共 ${total} 条）`}>
        <Table<SrmSupplierGrade>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1800 }}
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
        title={editId == null ? '新建供应商分级' : '编辑供应商分级'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="gradeNo" label="分级编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="gradeLevel" label="分级级别">
            <Select placeholder="为空默认 C" options={[...SRM_SUPPLIER_GRADE_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="gradePeriod" label="分级周期">
            <Input placeholder="请输入分级周期" />
          </Form.Item>
          <Form.Item name="gradeScore" label="分级得分">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入分级得分" />
          </Form.Item>
          <Form.Item name="gradeBasis" label="分级依据">
            <Input.TextArea rows={2} placeholder="请输入分级依据" />
          </Form.Item>
          <Form.Item name="evaluator" label="评估人">
            <Input placeholder="请输入评估人" />
          </Form.Item>
          <Form.Item name="gradeDate" label="评估日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择评估日期" />
          </Form.Item>
          <Form.Item name="gradeStatus" label="分级状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_SUPPLIER_GRADE_STATUS_OPTIONS]} />
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
