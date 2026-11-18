import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tabs,
  Tag,
  Tree,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ApartmentOutlined,
  CloudUploadOutlined,
  FileSearchOutlined,
  ImportOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { bomImportService, bomService } from '@/services/bomService';
import { materialService, productService } from '@/services/masterDataService';
import type { MaterialItem, ProductItem } from '@/types/masterData';
import type {
  BomCompareResponse,
  BomExpandNode,
  BomImportBatchItem,
  BomImportErrorItem,
  BomImportResult,
  BomImportRow,
  BomIssueItem,
  BomItem,
  BomLineItem,
  BomLineSaveParams,
  BomPublishLogItem,
  BomValidationResult,
  BomWhereUsedItem,
} from '@/types/bom';
import {
  BOM_BATCH_STATUS_TEXT,
  BOM_ISSUE_TYPE_TEXT,
  BOM_STATUS_OPTIONS,
  BOM_STATUS_TEXT,
  BOM_TARGET_SYSTEMS,
  BOM_TYPE_OPTIONS,
} from '@/types/bom';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

const STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  released: 'success',
  obsolete: 'error',
};

const PUBLISH_STATUS_COLOR: Record<string, string> = {
  pending: 'processing',
  success: 'success',
  failed: 'error',
};

interface BomFormValues {
  productCode: string;
  bomType: string;
  versionNo?: string;
  status?: string;
  effectiveFrom?: Dayjs;
  effectiveTo?: Dayjs;
  description?: string;
  remark?: string;
}

interface BomLineFormValues {
  lineNo?: number;
  parentMaterialCode: string;
  childMaterialCode: string;
  childMaterialName?: string;
  qty: number;
  unit: string;
  itemSeq?: number;
  substituteAllowed?: boolean;
  validFrom?: string;
  validTo?: string;
  remark?: string;
}

interface SearchState {
  keyword?: string;
  productCode?: string;
  bomType?: string;
  status?: string;
}

interface TreeNode {
  title: string;
  key: string;
  children?: TreeNode[];
}

function toTreeData(nodes: BomExpandNode[], prefix = 'root'): TreeNode[] {
  return nodes.map((node, index) => {
    const key = `${prefix}/${node.materialCode}-${index}`;
    const qtyText = node.qty != null ? ` × ${node.qty}${node.unit || ''}` : '';
    return {
      title: `${node.materialCode} ${node.materialName || ''}${qtyText}`,
      key,
      children:
        node.children && node.children.length ? toTreeData(node.children, key) : undefined,
    };
  });
}

export default function BomManagement() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<BomFormValues>();
  const [lineForm] = Form.useForm<BomLineFormValues>();
  const [convertForm] = Form.useForm<{ targetVersionNo?: string; description?: string; remark?: string }>();
  const [importForm] = Form.useForm<{
    bomType: string;
    productCode: string;
    versionNo?: string;
    status?: string;
    effectiveFrom?: string;
    sourceFile?: string;
  }>();

  const [activeTab, setActiveTab] = useState('list');

  // 选项
  const [productOptions, setProductOptions] = useState<ProductItem[]>([]);
  const [materialOptions, setMaterialOptions] = useState<MaterialItem[]>([]);

  // BOM 列表
  const [data, setData] = useState<BomItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BomItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 详情与行项目
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<BomItem | null>(null);
  const [lines, setLines] = useState<BomLineItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<BomLineItem | null>(null);
  const [lineSubmitting, setLineSubmitting] = useState(false);

  // 异常校验
  const [validateOpen, setValidateOpen] = useState(false);
  const [validateResult, setValidateResult] = useState<BomValidationResult | null>(null);
  const [validating, setValidating] = useState(false);

  // 转 MBOM
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertTarget, setConvertTarget] = useState<BomItem | null>(null);
  const [convertSubmitting, setConvertSubmitting] = useState(false);

  // 发布
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishTarget, setPublishTarget] = useState<BomItem | null>(null);
  const [publishSystems, setPublishSystems] = useState<string[]>(['ERP']);
  const [publishing, setPublishing] = useState(false);
  const [publishLogs, setPublishLogs] = useState<BomPublishLogItem[]>([]);
  const [retryingLogId, setRetryingLogId] = useState<number | null>(null);

  // 发布日志抽屉
  const [logsOpen, setLogsOpen] = useState(false);
  const [logs, setLogs] = useState<BomPublishLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // 多级展开
  const [expandBomId, setExpandBomId] = useState<number | undefined>(undefined);
  const [expandLevels, setExpandLevels] = useState<number>(10);
  const [expandData, setExpandData] = useState<BomExpandNode[]>([]);
  const [expanding, setExpanding] = useState(false);

  // 版本比较
  const [cmpA, setCmpA] = useState<number | undefined>(undefined);
  const [cmpB, setCmpB] = useState<number | undefined>(undefined);
  const [cmpResult, setCmpResult] = useState<BomCompareResponse | null>(null);
  const [comparing, setComparing] = useState(false);

  // 反查
  const [wuCode, setWuCode] = useState('');
  const [wuData, setWuData] = useState<BomWhereUsedItem[]>([]);
  const [wuLoading, setWuLoading] = useState(false);

  // 导入批次
  const [batches, setBatches] = useState<BomImportBatchItem[]>([]);
  const [bTotal, setBTotal] = useState(0);
  const [bLoading, setBLoading] = useState(false);
  const [bPageNum, setBPageNum] = useState(1);
  const [bPageSize, setBPageSize] = useState(10);
  const [bSearch, setBSearch] = useState<{ bomType?: string; status?: string }>({});
  const [batchErrorOpen, setBatchErrorOpen] = useState(false);
  const [batchErrorTarget, setBatchErrorTarget] = useState<BomImportBatchItem | null>(null);
  const [batchErrors, setBatchErrors] = useState<BomImportErrorItem[]>([]);
  const [batchErrorLoading, setBatchErrorLoading] = useState(false);

  // 单阶导入
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<BomImportRow[]>([]);
  const [importResult, setImportResult] = useState<BomImportResult | null>(null);
  const [importing, setImporting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await bomService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          productCode: cond.productCode || undefined,
          bomType: (cond.bomType as BomItem['bomType']) || undefined,
          status: (cond.status as BomItem['status']) || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  const loadBatches = useCallback(
    async (page = bPageNum, size = bPageSize, cond = bSearch) => {
      setBLoading(true);
      try {
        const res = await bomImportService.batches({
          pageNum: page,
          pageSize: size,
          bomType: (cond.bomType as BomItem['bomType']) || undefined,
          status: cond.status || undefined,
        });
        setBatches(res.list || []);
        setBTotal(res.total || 0);
      } finally {
        setBLoading(false);
      }
    },
    [bPageNum, bPageSize, bSearch],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    void loadBatches(1, bPageSize, {});
    productService
      .options()
      .then((res) => setProductOptions(res || []))
      .catch(() => undefined);
    materialService
      .options()
      .then((res) => setMaterialOptions(res || []))
      .catch(() => undefined);
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
    form.setFieldsValue({ bomType: 'EBOM', status: 'draft' });
    setModalOpen(true);
  };

  const openEdit = (record: BomItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      productCode: record.productCode,
      bomType: record.bomType,
      versionNo: record.versionNo,
      status: record.status,
      effectiveFrom: record.effectiveFrom ? dayjs(record.effectiveFrom) : undefined,
      effectiveTo: record.effectiveTo ? dayjs(record.effectiveTo) : undefined,
      description: record.description,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const productId = productOptions.find((p) => p.productCode === values.productCode)?.id;
    const payload = {
      productCode: values.productCode,
      productId,
      bomType: values.bomType as BomItem['bomType'],
      versionNo: values.versionNo,
      status: values.status as BomItem['status'],
      effectiveFrom: values.effectiveFrom ? values.effectiveFrom.format('YYYY-MM-DD') : undefined,
      effectiveTo: values.effectiveTo ? values.effectiveTo.format('YYYY-MM-DD') : undefined,
      description: values.description,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await bomService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await bomService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: BomItem) => {
    await bomService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  // 详情
  const loadDetail = async (record: BomItem) => {
    setDetailLoading(true);
    try {
      const res = await bomService.detail(record.id);
      setDetail(res.header);
      setLines(res.lines || []);
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = async (record: BomItem) => {
    setDetailOpen(true);
    setDetail(record);
    setLines([]);
    await loadDetail(record);
  };

  const openLineCreate = () => {
    setEditingLine(null);
    lineForm.resetFields();
    lineForm.setFieldsValue({ qty: 1, unit: 'PCS', substituteAllowed: false });
    setLineModalOpen(true);
  };

  const openLineEdit = (line: BomLineItem) => {
    setEditingLine(line);
    lineForm.resetFields();
    lineForm.setFieldsValue({
      lineNo: line.lineNo,
      parentMaterialCode: line.parentMaterialCode,
      childMaterialCode: line.childMaterialCode,
      childMaterialName: line.childMaterialName,
      qty: line.qty,
      unit: line.unit,
      itemSeq: line.itemSeq,
      substituteAllowed: line.substituteAllowed,
      validFrom: line.validFrom,
      validTo: line.validTo,
      remark: line.remark,
    });
    setLineModalOpen(true);
  };

  const handleLineSubmit = async () => {
    if (!detail) return;
    const values = await lineForm.validateFields();
    const payload: BomLineSaveParams = { ...values };
    setLineSubmitting(true);
    try {
      if (editingLine) {
        await bomService.updateLine(editingLine.id, payload);
        message.success('行项目已更新');
      } else {
        await bomService.addLine(detail.id, payload);
        message.success('行项目已新增');
      }
      setLineModalOpen(false);
      await loadDetail(detail);
    } finally {
      setLineSubmitting(false);
    }
  };

  const handleLineDelete = async (line: BomLineItem) => {
    await bomService.removeLine(line.id);
    message.success('行项目已删除');
    if (detail) await loadDetail(detail);
  };

  // 校验
  const handleValidate = async (record: BomItem) => {
    setValidateOpen(true);
    setValidating(true);
    setValidateResult(null);
    try {
      const res = await bomService.validate(record.id);
      setValidateResult(res);
    } finally {
      setValidating(false);
    }
  };

  // 转 MBOM
  const openConvert = (record: BomItem) => {
    setConvertTarget(record);
    convertForm.resetFields();
    convertForm.setFieldsValue({ description: `由 ${record.bomCode} 转换生成` });
    setConvertOpen(true);
  };

  const handleConvert = async () => {
    if (!convertTarget) return;
    const values = await convertForm.validateFields();
    setConvertSubmitting(true);
    try {
      const newId = await bomService.convertToMbom(convertTarget.id, values);
      message.success(`转换成功，新 MBOM 编号：${newId}`);
      setConvertOpen(false);
      void loadData();
    } finally {
      setConvertSubmitting(false);
    }
  };

  // 发布
  const openPublish = (record: BomItem) => {
    setPublishTarget(record);
    setPublishSystems(['ERP']);
    setPublishLogs([]);
    setPublishOpen(true);
  };

  const handlePublish = async () => {
    if (!publishTarget) return;
    if (!publishSystems.length) {
      message.warning('请至少选择一个目标系统');
      return;
    }
    setPublishing(true);
    try {
      const res = await bomService.publish(publishTarget.id, publishSystems);
      setPublishLogs(res || []);
      message.success('发布任务已提交');
    } finally {
      setPublishing(false);
    }
  };

  const handleRetryPublish = async (logId: number) => {
    setRetryingLogId(logId);
    try {
      const res = await bomService.retryPublish(logId);
      message.success('已重试发布');
      setPublishLogs((prev) => prev.map((log) => (log.id === res.id ? res : log)));
      setLogs((prev) => prev.map((log) => (log.id === res.id ? res : log)));
    } finally {
      setRetryingLogId(null);
    }
  };

  const openLogs = async (record: BomItem) => {
    setLogsOpen(true);
    setLogs([]);
    setLogsLoading(true);
    try {
      const res = await bomService.publishLogs(record.id);
      setLogs(res || []);
    } finally {
      setLogsLoading(false);
    }
  };

  // 多级展开
  const handleExpand = async () => {
    if (!expandBomId) {
      message.warning('请先选择 BOM');
      return;
    }
    setExpanding(true);
    try {
      const res = await bomService.expand(expandBomId, expandLevels);
      setExpandData(res || []);
    } finally {
      setExpanding(false);
    }
  };

  // 版本比较
  const handleCompare = async () => {
    if (!cmpA || !cmpB) {
      message.warning('请选择两个 BOM 版本');
      return;
    }
    setComparing(true);
    try {
      const res = await bomService.compare(cmpA, cmpB);
      setCmpResult(res);
    } finally {
      setComparing(false);
    }
  };

  // 反查
  const handleWhereUsed = async () => {
    if (!wuCode.trim()) {
      message.warning('请输入物料编码');
      return;
    }
    setWuLoading(true);
    try {
      const res = await bomService.whereUsed(wuCode.trim());
      setWuData(res || []);
    } finally {
      setWuLoading(false);
    }
  };

  // 导入
  const openImport = () => {
    importForm.resetFields();
    importForm.setFieldsValue({ bomType: 'EBOM', status: 'draft' });
    setImportRows([]);
    setImportResult(null);
    setImportOpen(true);
  };

  const updateImportRow = (index: number, field: keyof BomImportRow, value: string | boolean) => {
    setImportRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (field === 'qty' || field === 'itemSeq' || field === 'rowNumber') {
          const raw = String(value);
          const num = raw === '' ? undefined : Number(raw);
          return { ...row, [field]: Number.isNaN(num) ? undefined : num };
        }
        return { ...row, [field]: value };
      }),
    );
  };

  const addImportRow = () => {
    setImportRows((prev) => [...prev, { sheetName: 'Sheet1', rowNumber: prev.length + 2, qty: 1, unit: 'PCS' }]);
  };

  const removeImportRow = (index: number) => {
    setImportRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    const values = await importForm.validateFields();
    if (!importRows.length) {
      message.warning('请至少录入一行数据');
      return;
    }
    setImporting(true);
    try {
      const res = await bomImportService.submit({
        bomType: values.bomType as BomItem['bomType'],
        productCode: values.productCode,
        versionNo: values.versionNo,
        status: values.status as BomItem['status'],
        effectiveFrom: values.effectiveFrom,
        sourceFile: values.sourceFile,
        rows: importRows,
      });
      setImportResult(res);
      message.success(`导入完成：成功 ${res.successRows} 行，失败 ${res.failRows} 行`);
      void loadData();
      void loadBatches();
    } finally {
      setImporting(false);
    }
  };

  const openBatchErrors = async (record: BomImportBatchItem) => {
    setBatchErrorTarget(record);
    setBatchErrorOpen(true);
    setBatchErrors([]);
    setBatchErrorLoading(true);
    try {
      const res = await bomImportService.batchErrors(record.id);
      setBatchErrors(res || []);
    } finally {
      setBatchErrorLoading(false);
    }
  };

  const columns: ColumnsType<BomItem> = [
    { title: 'BOM 编码', dataIndex: 'bomCode', width: 160 },
    { title: '产品编码', dataIndex: 'productCode', width: 150 },
    {
      title: 'BOM 类型',
      dataIndex: 'bomType',
      width: 120,
      render: (v: string) => <Tag color={v === 'EBOM' ? 'blue' : 'geekblue'}>{v}</Tag>,
    },
    { title: '版本', dataIndex: 'versionNo', width: 110, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: string) => <Tag color={STATUS_COLOR[v] || 'default'}>{BOM_STATUS_TEXT[v] || v}</Tag>,
    },
    {
      title: '生效起',
      dataIndex: 'effectiveFrom',
      width: 120,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '生效止',
      dataIndex: 'effectiveTo',
      width: 120,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    { title: '描述', dataIndex: 'description', width: 160, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 320,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
          {hasPermission('bom:update') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('bom:validate') && (
            <Button type="link" size="small" onClick={() => handleValidate(record)}>
              校验
            </Button>
          )}
          {hasPermission('bom:convert') && record.bomType === 'EBOM' && (
            <Button type="link" size="small" icon={<SwapOutlined />} onClick={() => openConvert(record)}>
              转 MBOM
            </Button>
          )}
          {hasPermission('bom:publish') && (
            <Button type="link" size="small" icon={<CloudUploadOutlined />} onClick={() => openPublish(record)}>
              发布
            </Button>
          )}
          <Button type="link" size="small" onClick={() => openLogs(record)}>
            发布日志
          </Button>
          {hasPermission('bom:delete') && (
            <Popconfirm title="确认删除该 BOM？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const lineColumns: ColumnsType<BomLineItem> = [
    { title: '行号', dataIndex: 'lineNo', width: 80, render: (v) => (v ?? '-') },
    { title: '父物料编码', dataIndex: 'parentMaterialCode', width: 160 },
    { title: '子物料编码', dataIndex: 'childMaterialCode', width: 160 },
    { title: '子物料名称', dataIndex: 'childMaterialName', width: 160, render: (v) => v || '-' },
    { title: '用量', dataIndex: 'qty', width: 90, render: (v) => (v ?? '-') },
    { title: '单位', dataIndex: 'unit', width: 80, render: (v) => v || '-' },
    {
      title: '允许替代',
      dataIndex: 'substituteAllowed',
      width: 100,
      render: (v?: boolean) => (v ? <Tag color="success">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) =>
        (hasPermission('bom:update') || hasPermission('bom:create')) && (
          <Space size="small">
            <Button type="link" size="small" onClick={() => openLineEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该行？" onConfirm={() => handleLineDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  const issueColumns: ColumnsType<BomIssueItem> = [
    {
      title: '类型',
      dataIndex: 'issueType',
      width: 120,
      render: (v?: string) => (v ? BOM_ISSUE_TYPE_TEXT[v] || v : '-'),
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      width: 100,
      render: (v?: string) => {
        if (!v) return '-';
        const color = v === 'high' ? 'red' : v === 'medium' ? 'orange' : 'blue';
        return <Tag color={color}>{v}</Tag>;
      },
    },
    { title: '行号', dataIndex: 'lineNo', width: 80, render: (v) => (v ?? '-') },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: (v) => v || '-' },
    { title: '问题描述', dataIndex: 'message', render: (v) => v || '-' },
    { title: '状态', dataIndex: 'status', width: 110, render: (v) => v || '-' },
  ];

  const publishLogColumns: ColumnsType<BomPublishLogItem> = [
    { title: '目标系统', dataIndex: 'targetSystem', width: 110, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v?: string) => <Tag color={PUBLISH_STATUS_COLOR[v || ''] || 'default'}>{v || '-'}</Tag>,
    },
    { title: '重试次数', dataIndex: 'retryCount', width: 100, render: (v) => (v ?? '-') },
    { title: '响应信息', dataIndex: 'responseMessage', width: 220, render: (v) => v || '-' },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) =>
        record.status === 'failed' ? (
          <Button
            type="link"
            size="small"
            loading={retryingLogId === record.id}
            onClick={() => handleRetryPublish(record.id)}
          >
            重试
          </Button>
        ) : null,
    },
  ];

  const addedColumns: ColumnsType<BomLineItem> = [
    { title: '父物料编码', dataIndex: 'parentMaterialCode', width: 160 },
    { title: '子物料编码', dataIndex: 'childMaterialCode', width: 160 },
    { title: '子物料名称', dataIndex: 'childMaterialName', width: 160, render: (v) => v || '-' },
    { title: '用量', dataIndex: 'qty', width: 90, render: (v) => (v ?? '-') },
    { title: '单位', dataIndex: 'unit', width: 80, render: (v) => v || '-' },
  ];

  const whereUsedColumns: ColumnsType<BomWhereUsedItem> = [
    { title: 'BOM 编码', dataIndex: 'bomCode', width: 160, render: (v) => v || '-' },
    { title: '产品编码', dataIndex: 'productCode', width: 140, render: (v) => v || '-' },
    { title: 'BOM 类型', dataIndex: 'bomType', width: 110, render: (v) => v || '-' },
    { title: '版本', dataIndex: 'versionNo', width: 100, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) => (v ? BOM_STATUS_TEXT[v] || v : '-'),
    },
    { title: '上层物料', dataIndex: 'parentMaterialCode', width: 150, render: (v) => v || '-' },
    { title: '行号', dataIndex: 'lineNo', width: 80, render: (v) => (v ?? '-') },
    { title: '用量', dataIndex: 'qty', width: 90, render: (v) => (v ?? '-') },
  ];

  const batchColumns: ColumnsType<BomImportBatchItem> = [
    { title: '批次号', dataIndex: 'batchNo', width: 160, render: (v) => v || '-' },
    { title: '类型', dataIndex: 'bomType', width: 100, render: (v) => v || '-' },
    { title: '产品编码', dataIndex: 'productCode', width: 140, render: (v) => v || '-' },
    { title: '来源文件', dataIndex: 'sourceFile', width: 180, render: (v) => v || '-' },
    { title: '总行数', dataIndex: 'totalRows', width: 90, render: (v) => (v ?? '-') },
    { title: '成功', dataIndex: 'successRows', width: 90, render: (v) => (v ?? '-') },
    { title: '失败', dataIndex: 'failRows', width: 90, render: (v) => (v ?? '-') },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v?: string) => (v ? BOM_BATCH_STATUS_TEXT[v] || v : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => openBatchErrors(record)}>
          失败明细
        </Button>
      ),
    },
  ];

  const batchErrorColumns: ColumnsType<BomImportErrorItem> = [
    { title: '工作表', dataIndex: 'sheetName', width: 120, render: (v) => v || '-' },
    { title: '行号', dataIndex: 'rowNumber', width: 80, render: (v) => (v ?? '-') },
    { title: '字段', dataIndex: 'fieldName', width: 140, render: (v) => v || '-' },
    { title: '错误信息', dataIndex: 'errorMessage', render: (v) => v || '-' },
  ];

  const importColumns: ColumnsType<BomImportRow> = [
    { title: '#', width: 50, render: (_, __, index) => index + 1 },
    {
      title: '父物料编码',
      dataIndex: 'parentMaterialCode',
      width: 150,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateImportRow(index, 'parentMaterialCode', e.target.value)} />
      ),
    },
    {
      title: '子物料编码',
      dataIndex: 'childMaterialCode',
      width: 150,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateImportRow(index, 'childMaterialCode', e.target.value)} />
      ),
    },
    {
      title: '子物料名称',
      dataIndex: 'childMaterialName',
      width: 150,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateImportRow(index, 'childMaterialName', e.target.value)} />
      ),
    },
    {
      title: '用量',
      dataIndex: 'qty',
      width: 90,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          min={0}
          style={{ width: '100%' }}
          onChange={(val) => updateImportRow(index, 'qty', val == null ? '' : String(val))}
        />
      ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 90,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateImportRow(index, 'unit', e.target.value)} />
      ),
    },
    {
      title: '允许替代',
      dataIndex: 'substituteAllowed',
      width: 100,
      render: (v: boolean, _r, index) => (
        <Switch checked={!!v} onChange={(checked) => updateImportRow(index, 'substituteAllowed', checked)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 70,
      fixed: 'right',
      render: (_, __, index) => (
        <Button type="link" size="small" danger onClick={() => removeImportRow(index)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        BOM 管理
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'list', label: 'BOM 列表' },
          { key: 'expand', label: '多级展开' },
          { key: 'compare', label: '版本比较' },
          { key: 'whereUsed', label: 'BOM 反查' },
          { key: 'import', label: '单阶导入' },
        ]}
      />

      {activeTab === 'list' && (
        <>
          <Card>
            <Form layout="inline" onFinish={onSearch}>
              <Form.Item name="keyword" label="关键词">
                <Input placeholder="BOM 编码" allowClear style={{ width: 180 }} />
              </Form.Item>
              <Form.Item name="productCode" label="产品编码">
                <Input placeholder="请输入产品编码" allowClear style={{ width: 160 }} />
              </Form.Item>
              <Form.Item name="bomType" label="BOM 类型">
                <Select placeholder="请选择" allowClear style={{ width: 160 }} options={BOM_TYPE_OPTIONS} />
              </Form.Item>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择" allowClear style={{ width: 120 }} options={BOM_STATUS_OPTIONS} />
              </Form.Item>
              <Form.Item>
                <Space>
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
            title={`BOM 列表（共 ${total} 条）`}
            extra={
              <Space>
                {hasPermission('bom:import') && (
                  <Button icon={<ImportOutlined />} onClick={openImport}>
                    单阶导入
                  </Button>
                )}
                {hasPermission('bom:create') && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                    新增 BOM
                  </Button>
                )}
              </Space>
            }
          >
            <Table<BomItem>
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={data}
              scroll={{ x: 1500 }}
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

      {activeTab === 'expand' && (
        <Card title="BOM 多级展开">
          <Space wrap style={{ marginBottom: 16 }}>
            <Select
              placeholder="选择 BOM"
              showSearch
              optionFilterProp="label"
              style={{ width: 300 }}
              value={expandBomId}
              onChange={setExpandBomId}
              options={data.map((b) => ({ value: b.id, label: `${b.bomCode} ${b.productCode}` }))}
            />
            <InputNumber
              min={1}
              max={20}
              addonBefore="展开层级"
              value={expandLevels}
              onChange={(v) => setExpandLevels(v ?? 10)}
            />
            <Button type="primary" icon={<ApartmentOutlined />} loading={expanding} onClick={handleExpand}>
              展开
            </Button>
          </Space>
          <Spin spinning={expanding}>
            {expandData.length ? (
              <Tree treeData={toTreeData(expandData)} defaultExpandAll showLine />
            ) : (
              <Empty description="暂无展开结果" />
            )}
          </Spin>
        </Card>
      )}

      {activeTab === 'compare' && (
        <Card title="BOM 版本比较">
          <Space wrap style={{ marginBottom: 16 }}>
            <Select
              placeholder="BOM A"
              showSearch
              optionFilterProp="label"
              style={{ width: 280 }}
              value={cmpA}
              onChange={setCmpA}
              options={data.map((b) => ({ value: b.id, label: `${b.bomCode} ${b.versionNo || ''}` }))}
            />
            <Select
              placeholder="BOM B"
              showSearch
              optionFilterProp="label"
              style={{ width: 280 }}
              value={cmpB}
              onChange={setCmpB}
              options={data.map((b) => ({ value: b.id, label: `${b.bomCode} ${b.versionNo || ''}` }))}
            />
            <Button type="primary" icon={<SearchOutlined />} loading={comparing} onClick={handleCompare}>
              比较
            </Button>
          </Space>
          {cmpResult ? (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Descriptions
                size="small"
                bordered
                column={2}
                items={[
                  {
                    key: 'a',
                    label: 'BOM A',
                    children: cmpResult.headerA
                      ? `${cmpResult.headerA.bomCode} ${cmpResult.headerA.versionNo || ''}`
                      : '-',
                  },
                  {
                    key: 'b',
                    label: 'BOM B',
                    children: cmpResult.headerB
                      ? `${cmpResult.headerB.bomCode} ${cmpResult.headerB.versionNo || ''}`
                      : '-',
                  },
                ]}
              />
              <Card size="small" title={`新增行（${cmpResult.added?.length || 0}）`}>
                <Table<BomLineItem>
                  rowKey={(r) => `add-${r.id}`}
                  size="small"
                  columns={addedColumns}
                  dataSource={cmpResult.added || []}
                  pagination={false}
                  scroll={{ x: 700 }}
                />
              </Card>
              <Card size="small" title={`删除行（${cmpResult.removed?.length || 0}）`}>
                <Table<BomLineItem>
                  rowKey={(r) => `rm-${r.id}`}
                  size="small"
                  columns={addedColumns}
                  dataSource={cmpResult.removed || []}
                  pagination={false}
                  scroll={{ x: 700 }}
                />
              </Card>
              <Card size="small" title={`修改项（${cmpResult.modified?.length || 0}）`}>
                <Table
                  rowKey={(r) => `${r.lineKey}-${r.fieldName}`}
                  size="small"
                  pagination={false}
                  dataSource={cmpResult.modified || []}
                  columns={[
                    { title: '行标识', dataIndex: 'lineKey', width: 160, render: (v) => v || '-' },
                    { title: '字段', dataIndex: 'fieldName', width: 160, render: (v) => v || '-' },
                    { title: 'BOM A 值', dataIndex: 'valueA', width: 200, render: (v) => v || '-' },
                    { title: 'BOM B 值', dataIndex: 'valueB', render: (v) => v || '-' },
                  ]}
                />
              </Card>
            </Space>
          ) : (
            <Empty description="请选择两个 BOM 进行版本比较" />
          )}
        </Card>
      )}

      {activeTab === 'whereUsed' && (
        <Card title="BOM 反查（物料用量清单）">
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="请输入物料编码"
              style={{ width: 240 }}
              value={wuCode}
              onChange={(e) => setWuCode(e.target.value)}
              onPressEnter={handleWhereUsed}
            />
            <Button type="primary" icon={<FileSearchOutlined />} loading={wuLoading} onClick={handleWhereUsed}>
              查询
            </Button>
          </Space>
          <Table<BomWhereUsedItem>
            rowKey={(r) => `${r.headerId}-${r.lineNo}`}
            loading={wuLoading}
            columns={whereUsedColumns}
            dataSource={wuData}
            scroll={{ x: 1100 }}
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          />
        </Card>
      )}

      {activeTab === 'import' && (
        <>
          <Card>
            <Space wrap>
              <Select
                placeholder="BOM 类型"
                allowClear
                style={{ width: 160 }}
                value={bSearch.bomType}
                onChange={(v) => setBSearch((prev) => ({ ...prev, bomType: v }))}
                options={BOM_TYPE_OPTIONS}
              />
              <Select
                placeholder="批次状态"
                allowClear
                style={{ width: 140 }}
                value={bSearch.status}
                onChange={(v) => setBSearch((prev) => ({ ...prev, status: v }))}
                options={Object.entries(BOM_BATCH_STATUS_TEXT).map(([value, label]) => ({ value, label }))}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setBPageNum(1);
                  void loadBatches(1, bPageSize, bSearch);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setBSearch({});
                  setBPageNum(1);
                  void loadBatches(1, bPageSize, {});
                }}
              >
                重置
              </Button>
              {hasPermission('bom:import') && (
                <Button icon={<ImportOutlined />} onClick={openImport}>
                  单阶导入
                </Button>
              )}
            </Space>
          </Card>

          <Card title={`导入批次（共 ${bTotal} 条）`}>
            <Table<BomImportBatchItem>
              rowKey="id"
              loading={bLoading}
              columns={batchColumns}
              dataSource={batches}
              scroll={{ x: 1200 }}
              pagination={{
                current: bPageNum,
                pageSize: bPageSize,
                total: bTotal,
                showSizeChanger: true,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (page, size) => {
                  setBPageNum(page);
                  setBPageSize(size);
                  void loadBatches(page, size);
                },
              }}
            />
          </Card>
        </>
      )}

      {/* 新增/编辑 BOM */}
      <Modal
        title={editing ? '编辑 BOM' : '新增 BOM'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="productCode"
            label="产品编码"
            rules={[{ required: true, message: '请输入或选择产品编码' }]}
          >
            <Select
              showSearch
              placeholder="请选择产品"
              optionFilterProp="label"
              options={productOptions.map((p) => ({
                value: p.productCode,
                label: `${p.productCode} ${p.productName}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="bomType"
            label="BOM 类型"
            rules={[{ required: true, message: '请选择 BOM 类型' }]}
          >
            <Select options={BOM_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="versionNo" label="版本号">
            <Input placeholder="如 V1.0" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="draft">
            <Select options={BOM_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="effectiveFrom" label="生效起">
            <DatePicker />
          </Form.Item>
          <Form.Item name="effectiveTo" label="生效止">
            <DatePicker />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* BOM 详情与行项目 */}
      <Drawer
        title={`BOM 详情 - ${detail?.bomCode || ''}`}
        width={1000}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        <Spin spinning={detailLoading}>
          {detail && (
            <Descriptions
              size="small"
              bordered
              column={2}
              style={{ marginBottom: 16 }}
              items={[
                { key: 'code', label: 'BOM 编码', children: detail.bomCode },
                { key: 'product', label: '产品编码', children: detail.productCode },
                { key: 'type', label: 'BOM 类型', children: detail.bomType },
                { key: 'version', label: '版本', children: detail.versionNo || '-' },
                {
                  key: 'status',
                  label: '状态',
                  children: <Tag color={STATUS_COLOR[detail.status] || 'default'}>{BOM_STATUS_TEXT[detail.status] || detail.status}</Tag>,
                },
                { key: 'desc', label: '描述', children: detail.description || '-' },
              ]}
            />
          )}
          <Space style={{ marginBottom: 12 }}>
            {(hasPermission('bom:create') || hasPermission('bom:update')) && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openLineCreate}>
                新增行
              </Button>
            )}
            <Button icon={<ReloadOutlined />} onClick={() => detail && loadDetail(detail)}>
              刷新
            </Button>
          </Space>
          <Table<BomLineItem>
            rowKey="id"
            loading={detailLoading}
            columns={lineColumns}
            dataSource={lines}
            size="small"
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Drawer>

      {/* 行项目编辑 */}
      <Modal
        title={editingLine ? '编辑行项目' : '新增行项目'}
        open={lineModalOpen}
        onOk={handleLineSubmit}
        confirmLoading={lineSubmitting}
        onCancel={() => setLineModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={lineForm} layout="vertical" preserve={false}>
          <Form.Item name="lineNo" label="行号">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="parentMaterialCode"
            label="父物料编码"
            rules={[{ required: true, message: '请输入父物料编码' }]}
          >
            <Select
              showSearch
              placeholder="请选择父物料"
              optionFilterProp="label"
              options={materialOptions.map((m) => ({
                value: m.materialCode,
                label: `${m.materialCode} ${m.materialName}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="childMaterialCode"
            label="子物料编码"
            rules={[{ required: true, message: '请输入子物料编码' }]}
          >
            <Select
              showSearch
              placeholder="请选择子物料"
              optionFilterProp="label"
              onChange={(value: string) => {
                const material = materialOptions.find((m) => m.materialCode === value);
                if (material) lineForm.setFieldValue('childMaterialName', material.materialName);
              }}
              options={materialOptions.map((m) => ({
                value: m.materialCode,
                label: `${m.materialCode} ${m.materialName}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="childMaterialName" label="子物料名称">
            <Input placeholder="请输入子物料名称" />
          </Form.Item>
          <Form.Item
            name="qty"
            label="用量"
            rules={[{ required: true, message: '请输入用量' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="用量需大于 0" />
          </Form.Item>
          <Form.Item name="unit" label="单位" rules={[{ required: true, message: '请输入单位' }]}>
            <Input placeholder="如 PCS" />
          </Form.Item>
          <Form.Item name="itemSeq" label="工位序号">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="substituteAllowed" label="允许替代" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="validFrom" label="生效起">
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="validTo" label="生效止">
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 异常校验 */}
      <Modal
        title="BOM 异常校验"
        open={validateOpen}
        onCancel={() => setValidateOpen(false)}
        footer={<Button onClick={() => setValidateOpen(false)}>关闭</Button>}
        width={860}
      >
        <Spin spinning={validating}>
          {validateResult && (
            <Alert
              type={validateResult.issueCount > 0 ? 'warning' : 'success'}
              showIcon
              style={{ marginBottom: 12 }}
              message={`共发现 ${validateResult.issueCount} 个异常`}
            />
          )}
          <Table<BomIssueItem>
            rowKey={(r, index) => `${r.id}-${index}`}
            loading={validating}
            columns={issueColumns}
            dataSource={validateResult?.issues || []}
            size="small"
            pagination={false}
            scroll={{ x: 900 }}
          />
        </Spin>
      </Modal>

      {/* 转 MBOM */}
      <Modal
        title={`EBOM 转 MBOM - ${convertTarget?.bomCode || ''}`}
        open={convertOpen}
        onOk={handleConvert}
        confirmLoading={convertSubmitting}
        onCancel={() => setConvertOpen(false)}
        destroyOnClose
      >
        <Form form={convertForm} layout="vertical" preserve={false}>
          <Form.Item name="targetVersionNo" label="目标版本号">
            <Input placeholder="如 V1.0-M" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 发布 */}
      <Modal
        title={`BOM 发布 - ${publishTarget?.bomCode || ''}`}
        open={publishOpen}
        onOk={handlePublish}
        confirmLoading={publishing}
        onCancel={() => setPublishOpen(false)}
        okText="发布"
        width={800}
      >
        <Form layout="vertical">
          <Form.Item label="目标系统" required>
            <Select
              mode="multiple"
              value={publishSystems}
              onChange={setPublishSystems}
              options={BOM_TARGET_SYSTEMS}
              placeholder="请选择目标系统（ERP / MES）"
            />
          </Form.Item>
        </Form>
        {publishLogs.length > 0 && (
          <Table<BomPublishLogItem>
            rowKey="id"
            size="small"
            columns={publishLogColumns}
            dataSource={publishLogs}
            pagination={false}
            scroll={{ x: 700 }}
          />
        )}
      </Modal>

      {/* 发布日志抽屉 */}
      <Drawer
        title={`发布日志 - ${logs.length ? logs[0].bomCode : ''}`}
        width={820}
        open={logsOpen}
        onClose={() => setLogsOpen(false)}
        destroyOnClose
      >
        <Table<BomPublishLogItem>
          rowKey="id"
          loading={logsLoading}
          columns={publishLogColumns}
          dataSource={logs}
          size="small"
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 700 }}
        />
      </Drawer>

      {/* 单阶导入 */}
      <Modal
        title="BOM 单阶导入"
        open={importOpen}
        onOk={handleImport}
        confirmLoading={importing}
        onCancel={() => setImportOpen(false)}
        width={900}
        okText="提交导入"
      >
        <Form form={importForm} layout="inline" preserve={false} style={{ marginBottom: 12 }}>
          <Form.Item name="bomType" label="BOM 类型" rules={[{ required: true, message: '请选择' }]}>
            <Select style={{ width: 150 }} options={BOM_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码" rules={[{ required: true, message: '请输入' }]}>
            <Input style={{ width: 160 }} placeholder="产品编码" />
          </Form.Item>
          <Form.Item name="versionNo" label="版本号">
            <Input style={{ width: 120 }} placeholder="如 V1.0" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select style={{ width: 120 }} options={BOM_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="effectiveFrom" label="生效起">
            <Input style={{ width: 140 }} placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="sourceFile" label="来源文件">
            <Input style={{ width: 160 }} placeholder="如 bom_import.xlsx" />
          </Form.Item>
        </Form>
        <Space style={{ marginBottom: 12 }}>
          <Button icon={<PlusOutlined />} onClick={addImportRow}>
            添加行
          </Button>
          <Button danger disabled={!importRows.length} onClick={() => setImportRows([])}>
            清空表格
          </Button>
        </Space>
        <Table<BomImportRow>
          rowKey={(_, index) => String(index)}
          columns={importColumns}
          dataSource={importRows}
          size="small"
          pagination={false}
          scroll={{ x: 900 }}
        />
        {importResult && (
          <>
            <Alert
              style={{ marginTop: 12 }}
              type={importResult.failRows > 0 ? 'warning' : 'success'}
              showIcon
              message={`导入结果：批次号 ${importResult.batchNo || '-'}，共 ${importResult.totalRows} 行，成功 ${importResult.successRows} 行，失败 ${importResult.failRows} 行`}
            />
            {importResult.errors?.length > 0 && (
              <Table
                style={{ marginTop: 12 }}
                rowKey={(_, index) => String(index)}
                size="small"
                pagination={false}
                dataSource={importResult.errors}
                columns={[
                  { title: '工作表', dataIndex: 'sheetName', width: 120, render: (v) => v || '-' },
                  { title: '行号', dataIndex: 'rowNumber', width: 80, render: (v) => (v ?? '-') },
                  { title: '字段', dataIndex: 'field', width: 140, render: (v) => v || '-' },
                  { title: '错误信息', dataIndex: 'message', render: (v) => v || '-' },
                ]}
              />
            )}
          </>
        )}
      </Modal>

      {/* 批次失败明细 */}
      <Drawer
        title={`导入失败明细 - ${batchErrorTarget?.batchNo || ''}`}
        width={760}
        open={batchErrorOpen}
        onClose={() => setBatchErrorOpen(false)}
        destroyOnClose
      >
        <Table<BomImportErrorItem>
          rowKey={(r, index) => `${r.id}-${index}`}
          loading={batchErrorLoading}
          columns={batchErrorColumns}
          dataSource={batchErrors}
          size="small"
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 700 }}
        />
      </Drawer>
    </Space>
  );
}
