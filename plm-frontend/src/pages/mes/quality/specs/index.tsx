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
import { mesInspectionSpecService as service } from '@/services/mesQualityService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_INSPECTION_SPEC_STATUS_LABEL,
  MES_INSPECTION_SPEC_STATUS_OPTIONS,
  MES_INSPECTION_SPEC_TYPE_LABEL,
  MES_INSPECTION_SPEC_TYPE_OPTIONS,
  type MesInspectionSpec,
  type MesInspectionSpecQuery,
  type MesInspectionSpecSaveRequest,
} from '@/types/mesQuality';

const { Title } = Typography;

const MANAGE = 'mes:quality:spec:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesInspectionSpecSaveRequest, 'effectiveDate' | 'expireDate'> & {
  effectiveDate?: Dayjs;
  expireDate?: Dayjs;
};

export default function MesInspectionSpecPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesInspectionSpec[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [specType, setSpecType] = useState<string | undefined>(undefined);
  const [specStatus, setSpecStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, type = specType, status = specStatus) => {
      setLoading(true);
      try {
        const params: MesInspectionSpecQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          specType: type,
          specStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, specType, specStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ specType: 'INCOMING', specStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesInspectionSpec) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      expireDate: record.expireDate ? dayjs(record.expireDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesInspectionSpecSaveRequest = {
        ...values,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format(DATETIME_FORMAT) : undefined,
        expireDate: values.expireDate ? values.expireDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('检验规范已创建');
      } else {
        await service.update(editId, payload);
        message.success('检验规范已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('检验规范已删除');
    void loadData();
  };

  const columns: ColumnsType<MesInspectionSpec> = [
    { title: '规范编号', dataIndex: 'specNo', width: 190, fixed: 'left', render: plain },
    { title: '规范名称', dataIndex: 'specName', width: 200, render: plain },
    {
      title: '规范类型',
      dataIndex: 'specType',
      width: 130,
      render: (v) => statusTag(MES_INSPECTION_SPEC_TYPE_LABEL, v),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '工序编码', dataIndex: 'processCode', width: 120, render: plain },
    { title: '检验项目', dataIndex: 'inspectionItem', width: 150, render: plain },
    { title: '检验方法', dataIndex: 'inspectionMethod', width: 150, render: plain },
    { title: '标准值', dataIndex: 'standardValue', width: 130, render: plain },
    { title: '上限', dataIndex: 'upperLimit', width: 100, render: plain },
    { title: '下限', dataIndex: 'lowerLimit', width: 100, render: plain },
    { title: '抽样方案', dataIndex: 'samplePlan', width: 130, render: plain },
    { title: 'AQL', dataIndex: 'aql', width: 100, render: plain },
    { title: '规范版本', dataIndex: 'specVersion', width: 110, render: plain },
    { title: '生效日期', dataIndex: 'effectiveDate', width: 170, render: formatDateTime },
    { title: '失效日期', dataIndex: 'expireDate', width: 170, render: formatDateTime },
    { title: '责任人', dataIndex: 'owner', width: 110, render: plain },
    {
      title: '规范状态',
      dataIndex: 'specStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_INSPECTION_SPEC_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该检验规范？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        检验规范
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="规范类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={specType}
              onChange={(v) => setSpecType(v)}
              options={[...MES_INSPECTION_SPEC_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="规范状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={specStatus}
              onChange={(v) => setSpecStatus(v)}
              options={[...MES_INSPECTION_SPEC_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="规范编号 / 规范名称 / 物料编码 / 物料名称"
              allowClear
              style={{ width: 400 }}
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
                  void loadData(1, pageSize, keyword, specType, specStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSpecType(undefined);
                  setSpecStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建规范</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`检验规范（共 ${total} 条）`}>
        <Table<MesInspectionSpec>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2750 }}
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
        title={editId == null ? '新建规范' : '编辑规范'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="specNo" label="规范编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="specName" label="规范名称" rules={[{ required: true, message: '请输入规范名称' }]}>
            <Input placeholder="请输入规范名称" />
          </Form.Item>
          <Form.Item name="specType" label="规范类型">
            <Select placeholder="为空默认 INCOMING" options={[...MES_INSPECTION_SPEC_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="processCode" label="工序编码">
            <Input placeholder="请输入工序编码" />
          </Form.Item>
          <Form.Item name="inspectionItem" label="检验项目">
            <Input placeholder="请输入检验项目" />
          </Form.Item>
          <Form.Item name="inspectionMethod" label="检验方法">
            <Input placeholder="请输入检验方法" />
          </Form.Item>
          <Form.Item name="standardValue" label="标准值">
            <Input placeholder="请输入标准值" />
          </Form.Item>
          <Form.Item name="upperLimit" label="上限">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入上限" />
          </Form.Item>
          <Form.Item name="lowerLimit" label="下限">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入下限" />
          </Form.Item>
          <Form.Item name="samplePlan" label="抽样方案">
            <Input placeholder="请输入抽样方案" />
          </Form.Item>
          <Form.Item name="aql" label="AQL">
            <Input placeholder="请输入 AQL" />
          </Form.Item>
          <Form.Item name="specVersion" label="规范版本">
            <Input placeholder="请输入规范版本" />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expireDate" label="失效日期">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="owner" label="责任人">
            <Input placeholder="请输入责任人" />
          </Form.Item>
          <Form.Item name="specStatus" label="规范状态">
            <Select placeholder="为空默认 DRAFT" options={[...MES_INSPECTION_SPEC_STATUS_OPTIONS]} />
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
