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
import { srmSupplierRiskService } from '@/services/srmSupplierService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_SUPPLIER_RISK_LEVEL_LABEL,
  SRM_SUPPLIER_RISK_LEVEL_OPTIONS,
  SRM_SUPPLIER_RISK_STATUS_LABEL,
  SRM_SUPPLIER_RISK_STATUS_OPTIONS,
  SRM_SUPPLIER_RISK_TYPE_LABEL,
  SRM_SUPPLIER_RISK_TYPE_OPTIONS,
  type SrmSupplierRisk,
  type SrmSupplierRiskQuery,
  type SrmSupplierRiskSaveRequest,
} from '@/types/srmSupplier';

const { Title } = Typography;

const MANAGE = 'srm:supplier:risk:manage';

type FormValues = Omit<SrmSupplierRiskSaveRequest, 'discoverDate' | 'handleDate'> & {
  discoverDate?: Dayjs;
  handleDate?: Dayjs;
};

export default function SrmSupplierRiskPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmSupplierRisk[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [riskType, setRiskType] = useState<string | undefined>(undefined);
  const [riskLevel, setRiskLevel] = useState<string | undefined>(undefined);
  const [riskStatus, setRiskStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = riskType,
      level = riskLevel,
      status = riskStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmSupplierRiskQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          riskType: type,
          riskLevel: level,
          riskStatus: status,
        };
        const res = await srmSupplierRiskService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, riskType, riskLevel, riskStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ riskType: 'QUALITY', riskLevel: 'LOW', riskStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: SrmSupplierRisk) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      discoverDate: record.discoverDate ? dayjs(record.discoverDate) : undefined,
      handleDate: record.handleDate ? dayjs(record.handleDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmSupplierRiskSaveRequest = {
        ...values,
        discoverDate: values.discoverDate ? values.discoverDate.format(DATE_FORMAT) : undefined,
        handleDate: values.handleDate ? values.handleDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await srmSupplierRiskService.create(payload);
        message.success('供应商风险已创建');
      } else {
        await srmSupplierRiskService.update(editId, payload);
        message.success('供应商风险已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await srmSupplierRiskService.remove(id);
    message.success('供应商风险已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmSupplierRisk> = [
    { title: '风险编号', dataIndex: 'riskNo', width: 170, fixed: 'left', render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    {
      title: '风险类型',
      dataIndex: 'riskType',
      width: 110,
      render: (v) => statusTag(SRM_SUPPLIER_RISK_TYPE_LABEL, v),
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      width: 100,
      render: (v) => statusTag(SRM_SUPPLIER_RISK_LEVEL_LABEL, v),
    },
    { title: '风险来源', dataIndex: 'riskSource', width: 140, render: plain },
    { title: '风险描述', dataIndex: 'riskDesc', width: 200, ellipsis: true, render: plain },
    { title: '发现日期', dataIndex: 'discoverDate', width: 120, render: formatDate },
    { title: '处理人', dataIndex: 'handler', width: 100, render: plain },
    { title: '处理日期', dataIndex: 'handleDate', width: 120, render: formatDate },
    {
      title: '风险状态',
      dataIndex: 'riskStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_SUPPLIER_RISK_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该供应商风险？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        供应商风险
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="风险类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={riskType}
              onChange={(v) => setRiskType(v)}
              options={[...SRM_SUPPLIER_RISK_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="风险等级">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={riskLevel}
              onChange={(v) => setRiskLevel(v)}
              options={[...SRM_SUPPLIER_RISK_LEVEL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="风险状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={riskStatus}
              onChange={(v) => setRiskStatus(v)}
              options={[...SRM_SUPPLIER_RISK_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="风险编号 / 供应商编码 / 供应商名称 / 风险来源"
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
                  void loadData(1, pageSize, keyword, riskType, riskLevel, riskStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRiskType(undefined);
                  setRiskLevel(undefined);
                  setRiskStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建供应商风险</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`供应商风险（共 ${total} 条）`}>
        <Table<SrmSupplierRisk>
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
        title={editId == null ? '新建供应商风险' : '编辑供应商风险'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="riskNo" label="风险编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="riskType" label="风险类型">
            <Select placeholder="为空默认 QUALITY" options={[...SRM_SUPPLIER_RISK_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="riskLevel" label="风险等级">
            <Select placeholder="为空默认 LOW" options={[...SRM_SUPPLIER_RISK_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="riskSource" label="风险来源">
            <Input placeholder="请输入风险来源" />
          </Form.Item>
          <Form.Item name="riskDesc" label="风险描述">
            <Input.TextArea rows={2} placeholder="请输入风险描述" />
          </Form.Item>
          <Form.Item name="discoverDate" label="发现日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择发现日期" />
          </Form.Item>
          <Form.Item name="handleMeasure" label="处理措施">
            <Input.TextArea rows={2} placeholder="请输入处理措施" />
          </Form.Item>
          <Form.Item name="handler" label="处理人">
            <Input placeholder="请输入处理人" />
          </Form.Item>
          <Form.Item name="handleDate" label="处理日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择处理日期" />
          </Form.Item>
          <Form.Item name="riskStatus" label="风险状态">
            <Select placeholder="为空默认 OPEN" options={[...SRM_SUPPLIER_RISK_STATUS_OPTIONS]} />
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
