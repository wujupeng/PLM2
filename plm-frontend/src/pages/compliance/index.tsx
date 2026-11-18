import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
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
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { complianceService } from '@/services/complianceService';
import type {
  ComplianceCheckResult,
  ComplianceItem,
  ComplianceSaveParams,
} from '@/types/compliance';
import {
  COMPLIANCE_RISK_LABEL,
  COMPLIANCE_RISK_OPTIONS,
  COMPLIANCE_STATUS_LABEL,
  COMPLIANCE_STATUS_OPTIONS,
  COMPLIANCE_TYPE_LABEL,
  COMPLIANCE_TYPE_OPTIONS,
} from '@/types/compliance';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** 合规状态标签颜色 */
const COMPLIANCE_STATUS_COLOR: Record<string, string> = {
  pending: 'default',
  valid: 'success',
  expired: 'error',
  missing: 'warning',
};

/** 风险等级标签颜色 */
const COMPLIANCE_RISK_COLOR: Record<string, string> = {
  low: 'blue',
  middle: 'orange',
  high: 'red',
};

interface ComplianceFormValues {
  complianceCode: string;
  materialCode?: string;
  materialName?: string;
  requirementType?: string;
  riskLevel?: string;
  supplierCode?: string;
  declarationNo?: string;
  declarationFile?: string;
  effectiveDate?: Dayjs;
  expireDate?: Dayjs;
  status?: string;
  remark?: string;
}

interface SearchState {
  keyword?: string;
  complianceCode?: string;
  materialCode?: string;
  requirementType?: string;
  riskLevel?: string;
  status?: string;
}

export default function CompliancePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ComplianceFormValues>();

  const [data, setData] = useState<ComplianceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ComplianceItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 物料合规校验
  const [checkMaterialCode, setCheckMaterialCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<ComplianceCheckResult | null>(null);

  // 即将到期
  const [expiringOpen, setExpiringOpen] = useState(false);
  const [expiringDays, setExpiringDays] = useState<number | undefined>(30);
  const [expiringLoading, setExpiringLoading] = useState(false);
  const [expiringData, setExpiringData] = useState<ComplianceItem[]>([]);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await complianceService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          complianceCode: cond.complianceCode || undefined,
          materialCode: cond.materialCode || undefined,
          requirementType: cond.requirementType || undefined,
          riskLevel: cond.riskLevel || undefined,
          status: cond.status || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: SearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'pending' });
    setModalOpen(true);
  };

  const openEdit = (record: ComplianceItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      complianceCode: record.complianceCode,
      materialCode: record.materialCode,
      materialName: record.materialName,
      requirementType: record.requirementType,
      riskLevel: record.riskLevel,
      supplierCode: record.supplierCode,
      declarationNo: record.declarationNo,
      declarationFile: record.declarationFile,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      expireDate: record.expireDate ? dayjs(record.expireDate) : undefined,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: ComplianceSaveParams = {
      complianceCode: values.complianceCode,
      materialCode: values.materialCode,
      materialName: values.materialName,
      requirementType: values.requirementType,
      riskLevel: values.riskLevel,
      supplierCode: values.supplierCode,
      declarationNo: values.declarationNo,
      declarationFile: values.declarationFile,
      effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
      expireDate: values.expireDate ? values.expireDate.format('YYYY-MM-DD') : undefined,
      status: values.status,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await complianceService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await complianceService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: ComplianceItem) => {
    await complianceService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const handleCheck = async (record: ComplianceItem) => {
    await complianceService.check(record.id);
    message.success('检查完成，状态已刷新');
    void loadData();
  };

  const handleMaterialCheck = async () => {
    if (!checkMaterialCode.trim()) {
      message.warning('请输入物料编码');
      return;
    }
    setChecking(true);
    try {
      const res = await complianceService.checkMaterial(checkMaterialCode.trim());
      setCheckResult(res);
    } finally {
      setChecking(false);
    }
  };

  const openExpiring = async () => {
    setExpiringOpen(true);
    setExpiringLoading(true);
    try {
      const res = await complianceService.expiring(expiringDays);
      setExpiringData(res || []);
    } finally {
      setExpiringLoading(false);
    }
  };

  const columns: ColumnsType<ComplianceItem> = [
    { title: '合规编码', dataIndex: 'complianceCode', width: 160 },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: (v) => v || '-' },
    { title: '物料名称', dataIndex: 'materialName', width: 150, render: (v) => v || '-' },
    {
      title: '要求类型',
      dataIndex: 'requirementType',
      width: 110,
      render: (v?: string) => (v ? COMPLIANCE_TYPE_LABEL[v] || v : '-'),
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={COMPLIANCE_RISK_COLOR[v] || 'default'}>{COMPLIANCE_RISK_LABEL[v] || v}</Tag> : '-',
    },
    { title: '声明编号', dataIndex: 'declarationNo', width: 150, render: (v) => v || '-' },
    {
      title: '失效日期',
      dataIndex: 'expireDate',
      width: 130,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={COMPLIANCE_STATUS_COLOR[v] || 'default'}>{COMPLIANCE_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '最近校验',
      dataIndex: 'checkedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('compliance:update') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('compliance:update') && (
            <Popconfirm title="确认对该记录执行检查？" onConfirm={() => handleCheck(record)}>
              <Button type="link" size="small">
                检查
              </Button>
            </Popconfirm>
          )}
          {hasPermission('compliance:delete') && (
            <Popconfirm title="确认删除该合规记录？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const expiringColumns: ColumnsType<ComplianceItem> = [
    { title: '合规编码', dataIndex: 'complianceCode', width: 160 },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: (v) => v || '-' },
    {
      title: '要求类型',
      dataIndex: 'requirementType',
      width: 110,
      render: (v?: string) => (v ? COMPLIANCE_TYPE_LABEL[v] || v : '-'),
    },
    { title: '声明编号', dataIndex: 'declarationNo', width: 150, render: (v) => v || '-' },
    {
      title: '失效日期',
      dataIndex: 'expireDate',
      width: 130,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={COMPLIANCE_STATUS_COLOR[v] || 'default'}>{COMPLIANCE_STATUS_LABEL[v] || v}</Tag> : '-',
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        环保合规
      </Title>

      <Card title="物料合规校验">
        <Space wrap align="baseline">
          <Input
            placeholder="请输入物料编码"
            allowClear
            style={{ width: 240 }}
            value={checkMaterialCode}
            onChange={(e) => setCheckMaterialCode(e.target.value)}
          />
          <Button type="primary" loading={checking} onClick={handleMaterialCheck}>
            校验
          </Button>
          <Button icon={<ReloadOutlined />} onClick={openExpiring}>
            即将到期
          </Button>
        </Space>
        {checkResult && (
          <div style={{ marginTop: 12 }}>
            <Alert
              type={checkResult.passed ? 'success' : 'warning'}
              showIcon
              message={checkResult.passed ? '校验通过' : '校验未通过'}
              description={
                <div>
                  <div>{checkResult.message}</div>
                  <div style={{ marginTop: 4 }}>
                    缺失类型：
                    {checkResult.missingTypes?.length
                      ? checkResult.missingTypes
                          .map((t) => COMPLIANCE_TYPE_LABEL[t] || t)
                          .join('、')
                      : '无'}
                  </div>
                  <div>
                    已过期类型：
                    {checkResult.expiredTypes?.length
                      ? checkResult.expiredTypes
                          .map((t) => COMPLIANCE_TYPE_LABEL[t] || t)
                          .join('、')
                      : '无'}
                  </div>
                </div>
              }
            />
          </div>
        )}
      </Card>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="编码 / 物料编码 / 物料名称" allowClear style={{ width: 220 }} />
          </Form.Item>
          <Form.Item name="complianceCode" label="合规编码">
            <Input placeholder="合规编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="物料编码" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="requirementType" label="要求类型">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={COMPLIANCE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="riskLevel" label="风险等级">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={COMPLIANCE_RISK_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={COMPLIANCE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`合规记录（共 ${total} 条）`}
        extra={
          hasPermission('compliance:create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增合规记录
            </Button>
          )
        }
      >
        <Table<ComplianceItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
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

      {/* 新增/编辑合规记录 */}
      <Modal
        title={editing ? '编辑合规记录' : '新增合规记录'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="complianceCode"
            label="合规编码"
            rules={[{ required: true, message: '请输入合规编码' }]}
          >
            <Input placeholder="请输入合规编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="requirementType" label="要求类型">
            <Select placeholder="请选择" allowClear options={COMPLIANCE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="riskLevel" label="风险等级">
            <Select placeholder="请选择" allowClear options={COMPLIANCE_RISK_OPTIONS} />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="declarationNo" label="声明编号">
            <Input placeholder="请输入声明编号" />
          </Form.Item>
          <Form.Item name="declarationFile" label="声明文件">
            <Input placeholder="请输入声明文件地址" />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expireDate" label="失效日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear options={COMPLIANCE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 即将到期 */}
      <Modal
        title="即将到期的合规记录"
        open={expiringOpen}
        onCancel={() => setExpiringOpen(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Space style={{ marginBottom: 12 }}>
          <span>预警天数</span>
          <InputNumber
            min={0}
            value={expiringDays}
            onChange={(val) => setExpiringDays(val ?? undefined)}
          />
          <Button
            type="primary"
            loading={expiringLoading}
            onClick={() => {
              setExpiringLoading(true);
              complianceService
                .expiring(expiringDays)
                .then((res) => setExpiringData(res || []))
                .finally(() => setExpiringLoading(false));
            }}
          >
            刷新
          </Button>
        </Space>
        <Table<ComplianceItem>
          rowKey="id"
          loading={expiringLoading}
          columns={expiringColumns}
          dataSource={expiringData}
          size="small"
          pagination={false}
          scroll={{ x: 900 }}
        />
      </Modal>
    </Space>
  );
}
