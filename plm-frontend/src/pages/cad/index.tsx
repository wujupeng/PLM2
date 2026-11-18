import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BugOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { cadFileService, cadMappingService } from '@/services/cadService';
import type {
  CadAttrMappingItem,
  CadAttrValue,
  CadExtractErrorItem,
  CadExtractResult,
  CadFileItem,
  CadFileSaveParams,
} from '@/types/cad';
import {
  CAD_EXTRACT_ERROR_TYPE_TEXT,
  CAD_EXTRACT_STATUS_OPTIONS,
  CAD_EXTRACT_STATUS_TEXT,
  CAD_FILE_FORMAT_OPTIONS,
  CAD_FILE_FORMAT_TEXT,
} from '@/types/cad';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** 提取状态标签颜色 */
const EXTRACT_STATUS_COLOR: Record<string, string> = {
  pending: 'default',
  success: 'success',
  partial: 'warning',
  failed: 'error',
};

/** 是否选项（1 是 / 0 否） */
const FLAG_OPTIONS = [
  { value: 1, label: '是' },
  { value: 0, label: '否' },
];

/** 启用状态选项 */
const STATUS_OPTIONS = [
  { value: 1, label: '启用' },
  { value: 0, label: '停用' },
];

interface CadFileFormValues {
  cadNo?: string;
  fileName: string;
  filePath?: string;
  fileFormat?: string;
  cadSoftware?: string;
  softwareVersion?: string;
  compatRange?: string;
  fileSize?: number;
  docNo?: string;
  productCode?: string;
  materialCode?: string;
  remark?: string;
}

interface CadMappingFormValues {
  cadAttrName: string;
  cadAttrLabel?: string;
  plmFieldName: string;
  plmFieldLabel?: string;
  targetEntity?: string;
  requiredFlag?: number;
  transformRule?: string;
  defaultValue?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
}

interface FileSearchState {
  cadNo?: string;
  fileFormat?: string;
  materialCode?: string;
  extractStatus?: string;
}

interface MappingSearchState {
  targetEntity?: string;
  status?: number;
}

export default function CadIntegration() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [fileForm] = Form.useForm<CadFileFormValues>();
  const [mappingForm] = Form.useForm<CadMappingFormValues>();

  const [activeTab, setActiveTab] = useState('files');

  // CAD 文件列表
  const [data, setData] = useState<CadFileItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<FileSearchState>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CadFileItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 属性提取
  const [extractOpen, setExtractOpen] = useState(false);
  const [extractTarget, setExtractTarget] = useState<CadFileItem | null>(null);
  const [extractAttrs, setExtractAttrs] = useState<CadAttrValue[]>([]);
  const [extractResult, setExtractResult] = useState<CadExtractResult | null>(null);
  const [extracting, setExtracting] = useState(false);

  // 异常报告
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorTarget, setErrorTarget] = useState<CadFileItem | null>(null);
  const [errorList, setErrorList] = useState<CadExtractErrorItem[]>([]);
  const [errorLoading, setErrorLoading] = useState(false);

  // 属性映射列表
  const [mData, setMData] = useState<CadAttrMappingItem[]>([]);
  const [mTotal, setMTotal] = useState(0);
  const [mLoading, setMLoading] = useState(false);
  const [mPageNum, setMPageNum] = useState(1);
  const [mPageSize, setMPageSize] = useState(10);
  const [mSearch, setMSearch] = useState<MappingSearchState>({});
  const [mModalOpen, setMModalOpen] = useState(false);
  const [mEditing, setMEditing] = useState<CadAttrMappingItem | null>(null);
  const [mSubmitting, setMSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await cadFileService.page({
          pageNum: page,
          pageSize: size,
          cadNo: cond.cadNo || undefined,
          fileFormat: cond.fileFormat || undefined,
          materialCode: cond.materialCode || undefined,
          extractStatus: cond.extractStatus || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  const loadMappings = useCallback(
    async (page = mPageNum, size = mPageSize, cond = mSearch) => {
      setMLoading(true);
      try {
        const res = await cadMappingService.page({
          pageNum: page,
          pageSize: size,
          targetEntity: cond.targetEntity || undefined,
          status: cond.status,
        });
        setMData(res.list || []);
        setMTotal(res.total || 0);
      } finally {
        setMLoading(false);
      }
    },
    [mPageNum, mPageSize, mSearch],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    void loadMappings(1, mPageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: FileSearchState) => {
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
    fileForm.resetFields();
    fileForm.setFieldsValue({ fileFormat: 'dwg' });
    setModalOpen(true);
  };

  const openEdit = (record: CadFileItem) => {
    setEditing(record);
    fileForm.resetFields();
    fileForm.setFieldsValue({
      cadNo: record.cadNo,
      fileName: record.fileName,
      filePath: record.filePath,
      fileFormat: record.fileFormat,
      cadSoftware: record.cadSoftware,
      softwareVersion: record.softwareVersion,
      compatRange: record.compatRange,
      fileSize: record.fileSize,
      docNo: record.docNo,
      productCode: record.productCode,
      materialCode: record.materialCode,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await fileForm.validateFields();
    const payload: CadFileSaveParams = {
      cadNo: values.cadNo,
      fileName: values.fileName,
      filePath: values.filePath,
      fileFormat: values.fileFormat,
      cadSoftware: values.cadSoftware,
      softwareVersion: values.softwareVersion,
      compatRange: values.compatRange,
      fileSize: values.fileSize,
      docNo: values.docNo,
      productCode: values.productCode,
      materialCode: values.materialCode,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await cadFileService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await cadFileService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: CadFileItem) => {
    await cadFileService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  // 属性提取
  const openExtract = (record: CadFileItem) => {
    setExtractTarget(record);
    setExtractResult(null);
    setExtractAttrs([{ name: '', value: '' }]);
    setExtractOpen(true);
  };

  const updateExtractAttr = (index: number, field: keyof CadAttrValue, value: string) => {
    setExtractAttrs((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr)),
    );
  };

  const addExtractAttr = () => {
    setExtractAttrs((prev) => [...prev, { name: '', value: '' }]);
  };

  const removeExtractAttr = (index: number) => {
    setExtractAttrs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExtract = async () => {
    if (!extractTarget) return;
    const attributes = extractAttrs
      .map((attr) => ({ name: attr.name.trim(), value: attr.value }))
      .filter((attr) => attr.name);
    setExtracting(true);
    try {
      const res = await cadFileService.extract(extractTarget.id, { attributes });
      setExtractResult(res);
      message.success('属性提取完成');
      void loadData();
    } finally {
      setExtracting(false);
    }
  };

  // 异常报告
  const openErrors = async (record: CadFileItem) => {
    setErrorTarget(record);
    setErrorOpen(true);
    setErrorLoading(true);
    try {
      const res = await cadFileService.errors(record.id);
      setErrorList(res || []);
    } finally {
      setErrorLoading(false);
    }
  };

  // 属性映射
  const onMappingSearch = () => {
    setMPageNum(1);
    void loadMappings(1, mPageSize, mSearch);
  };

  const onMappingReset = () => {
    setMSearch({});
    setMPageNum(1);
    void loadMappings(1, mPageSize, {});
  };

  const openMappingCreate = () => {
    setMEditing(null);
    mappingForm.resetFields();
    mappingForm.setFieldsValue({ targetEntity: 'document', requiredFlag: 0, status: 1, sortNo: 0 });
    setMModalOpen(true);
  };

  const openMappingEdit = (record: CadAttrMappingItem) => {
    setMEditing(record);
    mappingForm.resetFields();
    mappingForm.setFieldsValue({
      cadAttrName: record.cadAttrName,
      cadAttrLabel: record.cadAttrLabel,
      plmFieldName: record.plmFieldName,
      plmFieldLabel: record.plmFieldLabel,
      targetEntity: record.targetEntity,
      requiredFlag: record.requiredFlag,
      transformRule: record.transformRule,
      defaultValue: record.defaultValue,
      sortNo: record.sortNo,
      status: record.status,
      remark: record.remark,
    });
    setMModalOpen(true);
  };

  const handleMappingSubmit = async () => {
    const values = await mappingForm.validateFields();
    setMSubmitting(true);
    try {
      if (mEditing) {
        await cadMappingService.update(mEditing.id, values);
        message.success('更新成功');
      } else {
        await cadMappingService.create(values);
        message.success('新增成功');
      }
      setMModalOpen(false);
      void loadMappings();
    } finally {
      setMSubmitting(false);
    }
  };

  const handleMappingDelete = async (record: CadAttrMappingItem) => {
    await cadMappingService.remove(record.id);
    message.success('删除成功');
    void loadMappings();
  };

  const fileColumns: ColumnsType<CadFileItem> = [
    { title: 'CAD 编号', dataIndex: 'cadNo', width: 150, render: (v) => v || '-' },
    { title: '文件名', dataIndex: 'fileName', width: 200 },
    {
      title: '格式',
      dataIndex: 'fileFormat',
      width: 120,
      render: (v?: string) => (v ? CAD_FILE_FORMAT_TEXT[v] || v : '-'),
    },
    { title: 'CAD 软件', dataIndex: 'cadSoftware', width: 120, render: (v) => v || '-' },
    { title: '软件版本', dataIndex: 'softwareVersion', width: 110, render: (v) => v || '-' },
    { title: '版本兼容范围', dataIndex: 'compatRange', width: 150, render: (v) => v || '-' },
    { title: '关联图号', dataIndex: 'docNo', width: 130, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 130, render: (v) => v || '-' },
    {
      title: '提取状态',
      dataIndex: 'extractStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={EXTRACT_STATUS_COLOR[v] || 'default'}>{CAD_EXTRACT_STATUS_TEXT[v] || v}</Tag> : '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('cad:update') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('cad:extract') && (
            <Button type="link" size="small" onClick={() => openExtract(record)}>
              属性提取
            </Button>
          )}
          <Button type="link" size="small" icon={<BugOutlined />} onClick={() => openErrors(record)}>
            异常报告
          </Button>
          {hasPermission('cad:delete') && (
            <Popconfirm title="确认删除该 CAD 文件？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const mappingColumns: ColumnsType<CadAttrMappingItem> = [
    { title: 'CAD 属性名', dataIndex: 'cadAttrName', width: 150 },
    { title: 'CAD 属性显示名', dataIndex: 'cadAttrLabel', width: 150, render: (v) => v || '-' },
    { title: 'PLM 字段名', dataIndex: 'plmFieldName', width: 150 },
    { title: 'PLM 字段显示名', dataIndex: 'plmFieldLabel', width: 150, render: (v) => v || '-' },
    { title: '目标实体', dataIndex: 'targetEntity', width: 120, render: (v) => v || 'document' },
    {
      title: '是否必填',
      dataIndex: 'requiredFlag',
      width: 100,
      render: (v?: number) => (v === 1 ? <Tag color="red">是</Tag> : <Tag>否</Tag>),
    },
    { title: '转换规则', dataIndex: 'transformRule', width: 160, render: (v) => v || '-' },
    { title: '默认值', dataIndex: 'defaultValue', width: 120, render: (v) => v || '-' },
    { title: '排序号', dataIndex: 'sortNo', width: 90, render: (v) => (v ?? '-') },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: number) => (v === 1 ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>),
    },
    { title: '备注', dataIndex: 'remark', width: 160, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        hasPermission('cad:mapping:save') && (
          <Space size="small">
            <Button type="link" size="small" onClick={() => openMappingEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该属性映射？" onConfirm={() => handleMappingDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  const errorColumns: ColumnsType<CadExtractErrorItem> = [
    { title: '属性名', dataIndex: 'attrName', width: 160, render: (v) => v || '-' },
    {
      title: '异常类型',
      dataIndex: 'errorType',
      width: 130,
      render: (v?: string) =>
        v ? <Tag color="warning">{CAD_EXTRACT_ERROR_TYPE_TEXT[v] || v}</Tag> : '-',
    },
    { title: '异常说明', dataIndex: 'errorMessage', width: 260, render: (v) => v || '-' },
    { title: '原始值', dataIndex: 'rawValue', render: (v) => v || '-' },
  ];

  const matchedList = Object.entries(extractResult?.matched || {}).map(([field, value]) => ({
    field,
    value,
  }));

  const extractAlertType: 'success' | 'warning' | 'error' | 'info' =
    extractResult?.extractStatus === 'success'
      ? 'success'
      : extractResult?.extractStatus === 'partial'
        ? 'warning'
        : extractResult?.extractStatus === 'failed'
          ? 'error'
          : 'info';

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        CAD 集成
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'files', label: 'CAD 文件' },
          { key: 'mappings', label: '属性映射' },
        ]}
      />

      {activeTab === 'files' && (
        <>
          <Card>
            <Form layout="inline" onFinish={onSearch}>
              <Form.Item name="cadNo" label="关键字">
                <Input placeholder="CAD 编号" allowClear style={{ width: 180 }} />
              </Form.Item>
              <Form.Item name="fileFormat" label="文件格式">
                <Select
                  placeholder="请选择"
                  allowClear
                  style={{ width: 170 }}
                  options={CAD_FILE_FORMAT_OPTIONS}
                />
              </Form.Item>
              <Form.Item name="materialCode" label="物料编码">
                <Input placeholder="物料编码" allowClear style={{ width: 160 }} />
              </Form.Item>
              <Form.Item name="extractStatus" label="提取状态">
                <Select
                  placeholder="请选择"
                  allowClear
                  style={{ width: 140 }}
                  options={CAD_EXTRACT_STATUS_OPTIONS}
                />
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
            title={`CAD 文件（共 ${total} 条）`}
            extra={
              hasPermission('cad:create') && (
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                  新增 CAD 文件
                </Button>
              )
            }
          >
            <Table<CadFileItem>
              rowKey="id"
              loading={loading}
              columns={fileColumns}
              dataSource={data}
              scroll={{ x: 1700 }}
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
        </>
      )}

      {activeTab === 'mappings' && (
        <>
          <Card>
            <Space wrap>
              <Input
                placeholder="目标实体"
                allowClear
                style={{ width: 160 }}
                value={mSearch.targetEntity}
                onChange={(e) => setMSearch((prev) => ({ ...prev, targetEntity: e.target.value }))}
              />
              <Select
                placeholder="状态"
                allowClear
                style={{ width: 140 }}
                value={mSearch.status}
                onChange={(v) => setMSearch((prev) => ({ ...prev, status: v }))}
                options={STATUS_OPTIONS}
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={onMappingSearch}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onMappingReset}>
                重置
              </Button>
            </Space>
          </Card>

          <Card
            title={`属性映射（共 ${mTotal} 条）`}
            extra={
              hasPermission('cad:mapping:save') && (
                <Button type="primary" icon={<PlusOutlined />} onClick={openMappingCreate}>
                  新增映射
                </Button>
              )
            }
          >
            <Table<CadAttrMappingItem>
              rowKey="id"
              loading={mLoading}
              columns={mappingColumns}
              dataSource={mData}
              scroll={{ x: 1500 }}
              pagination={{
                current: mPageNum,
                pageSize: mPageSize,
                total: mTotal,
                showSizeChanger: true,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (page, size) => {
                  setMPageNum(page);
                  setMPageSize(size);
                  void loadMappings(page, size);
                },
              }}
            />
          </Card>
        </>
      )}

      {/* 新增/编辑 CAD 文件 */}
      <Modal
        title={editing ? '编辑 CAD 文件' : '新增 CAD 文件'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={fileForm} layout="vertical" preserve={false}>
          <Form.Item name="cadNo" label="CAD 编号">
            <Input placeholder="留空由系统自动生成" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="fileName" label="文件名" rules={[{ required: true, message: '请输入文件名' }]}>
            <Input placeholder="请输入文件名" />
          </Form.Item>
          <Form.Item name="fileFormat" label="文件格式">
            <Select placeholder="请选择" allowClear options={CAD_FILE_FORMAT_OPTIONS} />
          </Form.Item>
          <Form.Item name="cadSoftware" label="CAD 软件">
            <Input placeholder="如 AutoCAD / SolidWorks" />
          </Form.Item>
          <Form.Item name="softwareVersion" label="软件版本">
            <Input placeholder="请输入软件版本" />
          </Form.Item>
          <Form.Item name="compatRange" label="版本兼容范围">
            <Input placeholder="如 2018~2024" />
          </Form.Item>
          <Form.Item name="fileSize" label="文件大小（字节）">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入文件大小" />
          </Form.Item>
          <Form.Item name="filePath" label="文件路径">
            <Input placeholder="请输入文件存储路径" />
          </Form.Item>
          <Form.Item name="docNo" label="关联图号">
            <Input placeholder="关联图文档编号" />
          </Form.Item>
          <Form.Item name="productCode" label="关联产品编码">
            <Input placeholder="关联产品编码" />
          </Form.Item>
          <Form.Item name="materialCode" label="关联物料编码">
            <Input placeholder="关联物料编码" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 属性提取 */}
      <Modal
        title={`属性提取 - ${extractTarget?.fileName || ''}`}
        open={extractOpen}
        onOk={handleExtract}
        confirmLoading={extracting}
        onCancel={() => setExtractOpen(false)}
        width={720}
        okText="提交提取"
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message="属性提取当前提供无 CAD 解析服务时的落地方案，实际联调时按后台映射表与真实解析服务对接。"
          />
          <div>
            <Space style={{ marginBottom: 8 }}>
              <Button icon={<PlusOutlined />} onClick={addExtractAttr}>
                添加属性
              </Button>
            </Space>
            {extractAttrs.map((attr, index) => (
              <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Input
                  placeholder="属性名"
                  value={attr.name}
                  style={{ width: 220 }}
                  onChange={(e) => updateExtractAttr(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="属性值"
                  value={attr.value}
                  style={{ width: 260 }}
                  onChange={(e) => updateExtractAttr(index, 'value', e.target.value)}
                />
                <Button type="link" danger onClick={() => removeExtractAttr(index)}>
                  删除
                </Button>
              </Space>
            ))}
          </div>

          {extractResult && (
            <>
              <Alert
                type={extractAlertType}
                showIcon
                message={extractResult.message || '属性提取完成'}
              />
              <Table
                rowKey="field"
                size="small"
                pagination={false}
                dataSource={matchedList}
                columns={[
                  { title: 'PLM 字段', dataIndex: 'field', width: 220 },
                  { title: '值', dataIndex: 'value' },
                ]}
              />
              {extractResult.errors && extractResult.errors.length > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  message="异常明细"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {extractResult.errors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  }
                />
              )}
            </>
          )}
        </Space>
      </Modal>

      {/* 异常报告 */}
      <Drawer
        title={`异常报告 - ${errorTarget?.fileName || ''}`}
        width={760}
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        destroyOnClose
      >
        <Table<CadExtractErrorItem>
          rowKey="id"
          loading={errorLoading}
          columns={errorColumns}
          dataSource={errorList}
          size="small"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Drawer>

      {/* 新增/编辑属性映射 */}
      <Modal
        title={mEditing ? '编辑属性映射' : '新增属性映射'}
        open={mModalOpen}
        onOk={handleMappingSubmit}
        confirmLoading={mSubmitting}
        onCancel={() => setMModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={mappingForm} layout="vertical" preserve={false}>
          <Form.Item
            name="cadAttrName"
            label="CAD 属性名"
            rules={[{ required: true, message: '请输入 CAD 属性名' }]}
          >
            <Input placeholder="请输入 CAD 属性名" />
          </Form.Item>
          <Form.Item name="cadAttrLabel" label="CAD 属性显示名">
            <Input placeholder="请输入 CAD 属性显示名" />
          </Form.Item>
          <Form.Item
            name="plmFieldName"
            label="PLM 字段名"
            rules={[{ required: true, message: '请输入 PLM 字段名' }]}
          >
            <Input placeholder="请输入 PLM 字段名" />
          </Form.Item>
          <Form.Item name="plmFieldLabel" label="PLM 字段显示名">
            <Input placeholder="请输入 PLM 字段显示名" />
          </Form.Item>
          <Form.Item name="targetEntity" label="目标实体">
            <Input placeholder="为空时按 document 处理" />
          </Form.Item>
          <Form.Item name="requiredFlag" label="是否必填">
            <Select placeholder="请选择" options={FLAG_OPTIONS} />
          </Form.Item>
          <Form.Item name="transformRule" label="转换规则">
            <Input placeholder="请输入转换规则" />
          </Form.Item>
          <Form.Item name="defaultValue" label="默认值">
            <Input placeholder="请输入默认值" />
          </Form.Item>
          <Form.Item name="sortNo" label="排序号">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入排序号" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
