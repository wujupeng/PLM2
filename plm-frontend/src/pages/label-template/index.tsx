import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
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
import dayjs from 'dayjs';
import { labelService } from '@/services/labelService';
import {
  BARCODE_TYPE_LABEL,
  BARCODE_TYPE_OPTIONS,
  LABEL_TEMPLATE_STATUS_COLOR,
  LABEL_TEMPLATE_STATUS_LABEL,
  LABEL_TEMPLATE_STATUS_OPTIONS,
  LABEL_TYPE_LABEL,
  LABEL_TYPE_OPTIONS,
  type LabelRenderElement,
  type LabelRenderResult,
  type LabelTemplateItem,
  type LabelTemplateSaveParams,
} from '@/types/label';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/**
 * 预览渲染元素清单（来源：plm-backend/plm-system/src/main/resources/db/migration/V10__n5_label_coding_init.sql
 * 中标签模板 LBL-STD-24（id=7201）与 LBL-STD-14（id=7202）的 element_json 字段）：
 * - LBL-STD-24：supplierName 供应商、projectName 项目、productionDate 生产日期、serialNo 流水号、partNo 零件号、barcode（Data Matrix）
 * - LBL-STD-14：partNo 零件号、versionNo 版本、barcode（Data Matrix）
 * 下方按 key 去重后作为预览表单输入项；barcode 元素由「条码内容」统一渲染，不单独作为输入项。
 */
const LABEL_PREVIEW_FIELDS: { key: string; label: string }[] = [
  { key: 'supplierName', label: '供应商' },
  { key: 'projectName', label: '项目' },
  { key: 'productionDate', label: '生产日期' },
  { key: 'serialNo', label: '流水号' },
  { key: 'partNo', label: '零件号' },
  { key: 'versionNo', label: '版本' },
];

interface LabelTemplateFormValues {
  templateCode: string;
  templateName: string;
  templateVersion?: string;
  labelType: string;
  paperWidth?: number;
  paperHeight?: number;
  unit?: string;
  dpi?: number;
  barcodeType?: string;
  dmSymbolSize?: string;
  dmEccLevel?: string;
  moduleSize?: number;
  elementJson?: string;
  layoutJson?: string;
  status?: string;
  remark?: string;
}

/** 预览表单：barcodeContent 为条码内容，其余为动态元素字段 */
interface LabelPreviewFormValues {
  barcodeContent: string;
  [key: string]: string;
}

interface SearchState {
  keyword?: string;
  templateCode?: string;
  labelType?: string;
  status?: string;
}

/** 格式化 JSON 文本，解析失败时直接返回原文 */
const formatJson = (text?: string): string => {
  if (!text) return '-';
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
};

export default function LabelTemplatePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<LabelTemplateFormValues>();
  const [previewForm] = Form.useForm<LabelPreviewFormValues>();

  const [data, setData] = useState<LabelTemplateItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LabelTemplateItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 预览渲染
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<LabelTemplateItem | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<LabelRenderResult | null>(null);

  // 模板详情
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<LabelTemplateItem | null>(null);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await labelService.templatePage({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          templateCode: cond.templateCode || undefined,
          labelType: cond.labelType || undefined,
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
    form.setFieldsValue({
      templateVersion: 'V1',
      unit: 'mm',
      dpi: 300,
      dmEccLevel: 'ECC200',
      moduleSize: 0.4,
      status: 'draft',
    });
    setModalOpen(true);
  };

  const openEdit = (record: LabelTemplateItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      templateCode: record.templateCode,
      templateName: record.templateName,
      templateVersion: record.templateVersion,
      labelType: record.labelType,
      paperWidth: record.paperWidth,
      paperHeight: record.paperHeight,
      unit: record.unit,
      dpi: record.dpi,
      barcodeType: record.barcodeType,
      dmSymbolSize: record.dmSymbolSize,
      dmEccLevel: record.dmEccLevel,
      moduleSize: record.moduleSize,
      elementJson: record.elementJson,
      layoutJson: record.layoutJson,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: LabelTemplateSaveParams = {
      templateCode: values.templateCode,
      templateName: values.templateName,
      templateVersion: values.templateVersion,
      labelType: values.labelType,
      paperWidth: values.paperWidth,
      paperHeight: values.paperHeight,
      unit: values.unit,
      dpi: values.dpi,
      barcodeType: values.barcodeType,
      dmSymbolSize: values.dmSymbolSize,
      dmEccLevel: values.dmEccLevel,
      moduleSize: values.moduleSize,
      elementJson: values.elementJson,
      layoutJson: values.layoutJson,
      status: values.status,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await labelService.templateUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await labelService.templateCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: LabelTemplateItem) => {
    await labelService.templateRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const handleRelease = async (record: LabelTemplateItem) => {
    await labelService.templateRelease(record.id);
    message.success('已发布');
    void loadData();
  };

  const handleDisable = async (record: LabelTemplateItem) => {
    await labelService.templateDisable(record.id);
    message.success('已停用');
    void loadData();
  };

  const openPreview = (record: LabelTemplateItem) => {
    setPreviewTemplate(record);
    setPreviewResult(null);
    previewForm.resetFields();
    setPreviewOpen(true);
  };

  const handleRender = async () => {
    const values = await previewForm.validateFields();
    const fieldValues: Record<string, string> = {};
    LABEL_PREVIEW_FIELDS.forEach((field) => {
      const raw = values[field.key];
      if (raw) fieldValues[field.key] = raw;
    });
    setPreviewLoading(true);
    try {
      const res = await labelService.render({
        templateCode: previewTemplate?.templateCode,
        labelType: previewTemplate?.labelType,
        barcodeContent: values.barcodeContent,
        fieldValues,
      });
      setPreviewResult(res);
    } finally {
      setPreviewLoading(false);
    }
  };

  const openDetail = async (record: LabelTemplateItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await labelService.templateDetail(record.id);
      setDetail(res || record);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: ColumnsType<LabelTemplateItem> = [
    { title: '模板编码', dataIndex: 'templateCode', width: 170, render: (v) => v || '-' },
    { title: '模板名称', dataIndex: 'templateName', width: 170, render: (v) => v || '-' },
    { title: '版本', dataIndex: 'templateVersion', width: 80, render: (v) => v || '-' },
    {
      title: '标签类型',
      dataIndex: 'labelType',
      width: 140,
      render: (v?: string) => (v ? LABEL_TYPE_LABEL[v] || v : '-'),
    },
    {
      title: '纸张尺寸',
      key: 'paperSize',
      width: 130,
      render: (_, record) =>
        record.paperWidth != null && record.paperHeight != null
          ? `${record.paperWidth} × ${record.paperHeight} ${record.unit || ''}`.trim()
          : '-',
    },
    { title: 'DPI', dataIndex: 'dpi', width: 80, render: (v) => (v ?? '-') },
    {
      title: '条码类型',
      dataIndex: 'barcodeType',
      width: 130,
      render: (v?: string) => (v ? BARCODE_TYPE_LABEL[v] || v : '-'),
    },
    { title: 'DM 纠错等级', dataIndex: 'dmEccLevel', width: 120, render: (v) => v || '-' },
    { title: '模块尺寸', dataIndex: 'moduleSize', width: 100, render: (v) => (v ?? '-') },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? (
          <Tag color={LABEL_TEMPLATE_STATUS_COLOR[v] || 'default'}>{LABEL_TEMPLATE_STATUS_LABEL[v] || v}</Tag>
        ) : (
          '-'
        ),
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
      width: 330,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
          {hasPermission('label:template:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('label:template:save') && (
            <Popconfirm title="确认发布该模板？" onConfirm={() => handleRelease(record)}>
              <Button type="link" size="small" disabled={record.status === 'released'}>
                发布
              </Button>
            </Popconfirm>
          )}
          {hasPermission('label:template:save') && (
            <Popconfirm title="确认停用该模板？" onConfirm={() => handleDisable(record)}>
              <Button type="link" size="small" disabled={record.status !== 'released'}>
                停用
              </Button>
            </Popconfirm>
          )}
          {hasPermission('label:template:list') && (
            <Button type="link" size="small" onClick={() => openPreview(record)}>
              预览渲染
            </Button>
          )}
          {hasPermission('label:template:delete') && (
            <Popconfirm title="确认删除该模板？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger disabled={record.status === 'released'}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const renderItemColumns: ColumnsType<LabelRenderElement> = [
    { title: '元素 key', dataIndex: 'key', width: 130, render: (v) => v || '-' },
    { title: '显示名', dataIndex: 'label', width: 110, render: (v) => v || '-' },
    { title: 'X', dataIndex: 'x', width: 70, render: (v) => (v ?? '-') },
    { title: 'Y', dataIndex: 'y', width: 70, render: (v) => (v ?? '-') },
    { title: '宽', dataIndex: 'w', width: 70, render: (v) => (v ?? '-') },
    { title: '高', dataIndex: 'h', width: 70, render: (v) => (v ?? '-') },
    { title: '字号', dataIndex: 'fontSize', width: 70, render: (v) => (v ?? '-') },
    { title: '对齐', dataIndex: 'align', width: 80, render: (v) => v || '-' },
    { title: '取值', dataIndex: 'value', width: 160, render: (v) => v || '-' },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        标签模板
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="模板编码 / 名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="templateCode" label="模板编码">
            <Input placeholder="模板编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="labelType" label="标签类型">
            <Select placeholder="请选择" allowClear style={{ width: 170 }} options={LABEL_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={LABEL_TEMPLATE_STATUS_OPTIONS} />
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
        title={`标签模板列表（共 ${total} 条）`}
        extra={
          hasPermission('label:template:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增模板
            </Button>
          )
        }
      >
        <Table<LabelTemplateItem>
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

      {/* 新增/编辑标签模板 */}
      <Modal
        title={editing ? '编辑标签模板' : '新增标签模板'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={900}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="templateCode" label="模板编码" rules={[{ required: true, message: '请输入模板编码' }]}>
            <Input placeholder="请输入模板编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="templateName" label="模板名称" rules={[{ required: true, message: '请输入模板名称' }]}>
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          <Form.Item name="templateVersion" label="模板版本">
            <Input placeholder="请输入模板版本" />
          </Form.Item>
          <Form.Item name="labelType" label="标签类型" rules={[{ required: true, message: '请选择标签类型' }]}>
            <Select placeholder="请选择" options={LABEL_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="paperWidth" label="纸张宽度">
            <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
          </Form.Item>
          <Form.Item name="paperHeight" label="纸张高度">
            <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="dpi" label="DPI">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="barcodeType" label="条码类型">
            <Select placeholder="请选择" allowClear options={BARCODE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="dmSymbolSize" label="DM 符号尺寸">
            <Input placeholder="请输入 DM 符号尺寸" />
          </Form.Item>
          <Form.Item name="dmEccLevel" label="DM 纠错等级">
            <Input placeholder="请输入 DM 纠错等级" />
          </Form.Item>
          <Form.Item name="moduleSize" label="模块尺寸">
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="elementJson" label="元素布局（elementJson）">
            <Input.TextArea rows={6} placeholder="请输入元素布局 JSON" />
          </Form.Item>
          <Form.Item name="layoutJson" label="模板布局（layoutJson）">
            <Input.TextArea rows={6} placeholder="请输入模板布局 JSON" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear options={LABEL_TEMPLATE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 预览渲染 */}
      <Drawer
        title={`预览渲染 - ${previewTemplate?.templateCode || ''}`}
        width={900}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        destroyOnClose
        footer={
          <Space>
            <Button onClick={() => setPreviewOpen(false)}>关闭</Button>
            <Button type="primary" loading={previewLoading} onClick={handleRender}>
              渲染
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Form form={previewForm} layout="vertical">
            <Form.Item
              name="barcodeContent"
              label="条码内容"
              rules={[{ required: true, message: '请输入条码内容' }]}
            >
              <Input placeholder="请输入条码内容" />
            </Form.Item>
            {LABEL_PREVIEW_FIELDS.map((field) => (
              <Form.Item key={field.key} name={field.key} label={field.label}>
                <Input placeholder={`请输入${field.label}`} />
              </Form.Item>
            ))}
          </Form>

          {previewResult && (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {previewResult.barcodeBase64 && (
                <div>
                  <img
                    src={previewResult.barcodeBase64}
                    alt="条码预览"
                    style={{ background: '#fff', border: '1px solid #d9d9d9', padding: 8, maxWidth: 240 }}
                  />
                </div>
              )}
              <Card size="small" title="基本信息">
                <Descriptions
                  size="small"
                  bordered
                  column={2}
                  items={[
                    { key: 'templateCode', label: '模板编码', children: previewResult.templateCode || '-' },
                    { key: 'templateName', label: '模板名称', children: previewResult.templateName || '-' },
                    {
                      key: 'labelType',
                      label: '标签类型',
                      children: previewResult.labelType
                        ? LABEL_TYPE_LABEL[previewResult.labelType] || previewResult.labelType
                        : '-',
                    },
                    { key: 'paperWidth', label: '纸张宽度', children: previewResult.paperWidth ?? '-' },
                    { key: 'paperHeight', label: '纸张高度', children: previewResult.paperHeight ?? '-' },
                    { key: 'unit', label: '单位', children: previewResult.unit || '-' },
                    { key: 'dpi', label: 'DPI', children: previewResult.dpi ?? '-' },
                    { key: 'barcodeContent', label: '条码内容', children: previewResult.barcodeContent || '-' },
                  ]}
                />
              </Card>
              {previewResult.warnings && previewResult.warnings.length > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  message="渲染提示"
                  description={
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      {previewResult.warnings.map((text, index) => (
                        <li key={index}>{text}</li>
                      ))}
                    </ul>
                  }
                />
              )}
              <Card size="small" title="布局元素">
                <Table<LabelRenderElement>
                  rowKey={(_, index) => String(index)}
                  columns={renderItemColumns}
                  dataSource={previewResult.items || []}
                  size="small"
                  pagination={false}
                  scroll={{ x: 900 }}
                />
              </Card>
            </Space>
          )}
        </Space>
      </Drawer>

      {/* 模板详情 */}
      <Drawer
        title={`标签模板详情 - ${detail?.templateCode || ''}`}
        width={1000}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Card size="small" title="基本信息" loading={detailLoading}>
            {detail && (
              <Descriptions
                size="small"
                bordered
                column={2}
                items={[
                  { key: 'templateCode', label: '模板编码', children: detail.templateCode },
                  { key: 'templateName', label: '模板名称', children: detail.templateName },
                  { key: 'templateVersion', label: '模板版本', children: detail.templateVersion || '-' },
                  {
                    key: 'labelType',
                    label: '标签类型',
                    children: LABEL_TYPE_LABEL[detail.labelType] || detail.labelType,
                  },
                  { key: 'paperWidth', label: '纸张宽度', children: detail.paperWidth ?? '-' },
                  { key: 'paperHeight', label: '纸张高度', children: detail.paperHeight ?? '-' },
                  { key: 'unit', label: '单位', children: detail.unit || '-' },
                  { key: 'dpi', label: 'DPI', children: detail.dpi ?? '-' },
                  {
                    key: 'barcodeType',
                    label: '条码类型',
                    children: detail.barcodeType ? BARCODE_TYPE_LABEL[detail.barcodeType] || detail.barcodeType : '-',
                  },
                  { key: 'dmSymbolSize', label: 'DM 符号尺寸', children: detail.dmSymbolSize || '-' },
                  { key: 'dmEccLevel', label: 'DM 纠错等级', children: detail.dmEccLevel || '-' },
                  { key: 'moduleSize', label: '模块尺寸', children: detail.moduleSize ?? '-' },
                  {
                    key: 'status',
                    label: '状态',
                    children: (
                      <Tag color={LABEL_TEMPLATE_STATUS_COLOR[detail.status || ''] || 'default'}>
                        {LABEL_TEMPLATE_STATUS_LABEL[detail.status || ''] || detail.status}
                      </Tag>
                    ),
                  },
                  { key: 'remark', label: '备注', children: detail.remark || '-' },
                ]}
              />
            )}
          </Card>
          <Card size="small" title="元素布局（elementJson）">
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {formatJson(detail?.elementJson)}
            </pre>
          </Card>
          <Card size="small" title="模板布局（layoutJson）">
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {formatJson(detail?.layoutJson)}
            </pre>
          </Card>
        </Space>
      </Drawer>
    </Space>
  );
}
