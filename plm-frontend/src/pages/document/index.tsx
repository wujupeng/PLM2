import { useCallback, useEffect, useState } from 'react';
import {
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
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, SwapOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { docCategoryService, docService } from '@/services/documentService';
import type {
  DocApprovalLogItem,
  DocCategoryItem,
  DocDistributionItem,
  DocDocumentDetail,
  DocDocumentItem,
  DocRelationItem,
  DocReviewAssignee,
  DocReviewTaskItem,
  DocVersionCompareResponse,
  DocVersionItem,
} from '@/types/document';
import {
  DOC_DISTRIBUTION_RECIPIENT_OPTIONS,
  DOC_DISTRIBUTION_RECIPIENT_TEXT,
  DOC_RELATION_TYPE_OPTIONS,
  DOC_RELATION_TYPE_TEXT,
  DOC_REVIEW_DECISION_TEXT,
  DOC_REVIEW_NODE_OPTIONS,
  DOC_REVIEW_NODE_TEXT,
  DOC_STATUS_OPTIONS,
  DOC_STATUS_TEXT,
  DOC_TYPE_OPTIONS,
  DOC_TYPE_TEXT,
} from '@/types/document';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

const DOC_STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  in_review: 'processing',
  approved: 'cyan',
  released: 'success',
  obsolete: 'error',
};

const DECISION_COLOR: Record<string, string> = {
  pending: 'default',
  approved: 'success',
  rejected: 'error',
};

const STATUS_ENABLE_OPTIONS = [
  { value: 1, label: '启用' },
  { value: 0, label: '停用' },
];

interface DocFormValues {
  docNo: string;
  docName: string;
  categoryCode?: string;
  docType?: string;
  productCode?: string;
  materialCode?: string;
  bomCode?: string;
  fileName?: string;
  ownerName?: string;
  distributionControlled?: boolean;
  description?: string;
  remark?: string;
}

interface CategoryFormValues {
  categoryCode: string;
  categoryName: string;
  docType?: string;
  fileTypes?: string;
  requiredMetadata?: string;
  reviewRequired?: boolean;
  reviewNodes?: string[];
  sortNo?: number;
  status?: number;
  remark?: string;
}

interface SearchState {
  keyword?: string;
  categoryCode?: string;
  status?: string;
}

interface CategorySearchState {
  keyword?: string;
  docType?: string;
  status?: number;
}

export default function DocumentManagement() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DocFormValues>();
  const [categoryForm] = Form.useForm<CategoryFormValues>();
  const [relationForm] = Form.useForm<DocRelationSaveValues>();
  const [versionForm] = Form.useForm<VersionFormValues>();
  const [distributionForm] = Form.useForm<DistributionFormValues>();

  const [activeTab, setActiveTab] = useState('documents');

  // 图文档列表
  const [data, setData] = useState<DocDocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});
  const [categories, setCategories] = useState<DocCategoryItem[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DocDocumentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 文档分类
  const [catData, setCatData] = useState<DocCategoryItem[]>([]);
  const [catTotal, setCatTotal] = useState(0);
  const [catLoading, setCatLoading] = useState(false);
  const [catPageNum, setCatPageNum] = useState(1);
  const [catPageSize, setCatPageSize] = useState(10);
  const [catSearch, setCatSearch] = useState<CategorySearchState>({});
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DocCategoryItem | null>(null);
  const [catSubmitting, setCatSubmitting] = useState(false);

  // 详情
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<DocDocumentDetail | null>(null);
  const [versions, setVersions] = useState<DocVersionItem[]>([]);
  const [distributions, setDistributions] = useState<DocDistributionItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // 提交签审
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitTarget, setSubmitTarget] = useState<DocDocumentItem | null>(null);
  const [submitVersion, setSubmitVersion] = useState<string>('');
  const [submitRows, setSubmitRows] = useState<DocReviewAssignee[]>([]);
  const [submitting2, setSubmitting2] = useState(false);

  // 版本
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [versionSubmitting, setVersionSubmitting] = useState(false);

  // 版本比较
  const [cmpLeft, setCmpLeft] = useState<string | undefined>(undefined);
  const [cmpRight, setCmpRight] = useState<string | undefined>(undefined);
  const [cmpResult, setCmpResult] = useState<DocVersionCompareResponse | null>(null);
  const [comparing, setComparing] = useState(false);

  // 评审判定
  const [decideOpen, setDecideOpen] = useState(false);
  const [decideTarget, setDecideTarget] = useState<DocReviewTaskItem | null>(null);
  const [decideValue, setDecideValue] = useState<'approved' | 'rejected'>('approved');
  const [decideComment, setDecideComment] = useState('');
  const [deciding, setDeciding] = useState(false);

  // 发布 / 作废
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [releaseTarget, setReleaseTarget] = useState<DocDocumentItem | null>(null);
  const [releaseVersion, setReleaseVersion] = useState('');
  const [releaseComment, setReleaseComment] = useState('');
  const [releasing, setReleasing] = useState(false);

  const [obsoleteOpen, setObsoleteOpen] = useState(false);
  const [obsoleteTarget, setObsoleteTarget] = useState<DocDocumentItem | null>(null);
  const [obsoleteComment, setObsoleteComment] = useState('');
  const [obsoleting, setObsoleting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await docService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          categoryCode: cond.categoryCode || undefined,
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

  const loadCategories = useCallback(
    async (page = catPageNum, size = catPageSize, cond = catSearch) => {
      setCatLoading(true);
      try {
        const res = await docCategoryService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          docType: cond.docType || undefined,
          status: cond.status,
        });
        setCatData(res.list || []);
        setCatTotal(res.total || 0);
      } finally {
        setCatLoading(false);
      }
    },
    [catPageNum, catPageSize, catSearch],
  );

  const loadCategoryOptions = () => {
    docCategoryService
      .options()
      .then((res) => setCategories(res || []))
      .catch(() => undefined);
  };

  useEffect(() => {
    void loadData(1, pageSize, {});
    void loadCategories(1, catPageSize, {});
    loadCategoryOptions();
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
    form.setFieldsValue({ distributionControlled: false });
    setModalOpen(true);
  };

  const openEdit = (record: DocDocumentItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      docNo: record.docNo,
      docName: record.docName,
      categoryCode: record.categoryCode,
      docType: record.docType,
      productCode: record.productCode,
      materialCode: record.materialCode,
      bomCode: record.bomCode,
      fileName: record.fileName,
      ownerName: record.ownerName,
      distributionControlled: record.distributionControlled === 1,
      description: record.description,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const category = categories.find((c) => c.categoryCode === values.categoryCode);
    const payload = {
      docNo: values.docNo,
      docName: values.docName,
      categoryId: category?.id,
      categoryCode: values.categoryCode,
      docType: values.docType,
      productCode: values.productCode,
      materialCode: values.materialCode,
      bomCode: values.bomCode,
      fileName: values.fileName,
      ownerName: values.ownerName,
      distributionControlled: values.distributionControlled ? 1 : 0,
      description: values.description,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await docService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await docService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: DocDocumentItem) => {
    await docService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  // 详情
  const loadDetail = async (documentId: number) => {
    setDetailLoading(true);
    try {
      const [detailRes, versionRes, distRes] = await Promise.all([
        docService.detail(documentId),
        docService.versions(documentId),
        docService.distributions(documentId),
      ]);
      setDetail(detailRes);
      setVersions(versionRes || []);
      setDistributions(distRes || []);
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = async (record: DocDocumentItem) => {
    setDetailOpen(true);
    setCmpLeft(undefined);
    setCmpRight(undefined);
    setCmpResult(null);
    relationForm.resetFields();
    distributionForm.resetFields();
    await loadDetail(record.id);
  };

  const reloadDetail = async () => {
    if (!detail) return;
    await loadDetail(detail.document.id);
  };

  // 关联关系
  const handleAddRelation = async () => {
    if (!detail) return;
    const values = await relationForm.validateFields();
    await docService.addRelation(detail.document.id, {
      relationType: values.relationType,
      targetId: values.targetId,
      targetCode: values.targetCode,
      targetName: values.targetName,
      relationRole: values.relationRole,
      remark: values.remark,
    });
    message.success('关联关系已新增');
    relationForm.resetFields();
    await reloadDetail();
  };

  const handleRemoveRelation = async (relation: DocRelationItem) => {
    await docService.removeRelation(relation.id);
    message.success('关联关系已删除');
    await reloadDetail();
  };

  // 版本
  const openVersionCreate = () => {
    versionForm.resetFields();
    versionForm.setFieldsValue({ activate: false });
    setVersionModalOpen(true);
  };

  const handleAddVersion = async () => {
    if (!detail) return;
    const values = await versionForm.validateFields();
    setVersionSubmitting(true);
    try {
      await docService.addVersion(detail.document.id, {
        versionNo: values.versionNo,
        fileName: values.fileName,
        filePath: values.filePath,
        fileSize: values.fileSize,
        fileType: values.fileType,
        fileHash: values.fileHash,
        metadataJson: values.metadataJson,
        changeNote: values.changeNote,
        activate: values.activate,
      });
      message.success('版本已新增');
      setVersionModalOpen(false);
      await reloadDetail();
      void loadData();
    } finally {
      setVersionSubmitting(false);
    }
  };

  const handleActivate = async (version: DocVersionItem) => {
    if (!detail) return;
    await docService.activateVersion(detail.document.id, version.id);
    message.success('已激活该版本');
    await reloadDetail();
    void loadData();
  };

  const handleCompare = async () => {
    if (!detail) return;
    if (!cmpLeft || !cmpRight) {
      message.warning('请选择左右两个版本');
      return;
    }
    setComparing(true);
    try {
      const res = await docService.compareVersions(detail.document.id, cmpLeft, cmpRight);
      setCmpResult(res);
    } finally {
      setComparing(false);
    }
  };

  // 评审
  const openDecide = (task: DocReviewTaskItem, decision: 'approved' | 'rejected') => {
    setDecideTarget(task);
    setDecideValue(decision);
    setDecideComment('');
    setDecideOpen(true);
  };

  const handleDecide = async () => {
    if (!decideTarget) return;
    setDeciding(true);
    try {
      await docService.decide(decideTarget.id, { decision: decideValue, comment: decideComment });
      message.success(decideValue === 'approved' ? '已通过' : '已驳回');
      setDecideOpen(false);
      await reloadDetail();
    } finally {
      setDeciding(false);
    }
  };

  // 提交签审
  const openSubmit = (record: DocDocumentItem) => {
    setSubmitTarget(record);
    setSubmitVersion(record.currentVersionNo || 'V1');
    setSubmitRows([]);
    setSubmitOpen(true);
  };

  const addSubmitRow = () => {
    setSubmitRows((prev) => [...prev, { nodeCode: 'prepare', nodeName: '编制' }]);
  };

  const updateSubmitRow = (index: number, field: keyof DocReviewAssignee, value: string | number | undefined) => {
    setSubmitRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (field === 'nodeCode') {
          const node = DOC_REVIEW_NODE_OPTIONS.find((o) => o.value === value);
          return { ...row, nodeCode: String(value), nodeName: node?.label };
        }
        if (field === 'assigneeId') {
          return { ...row, assigneeId: value == null || value === '' ? undefined : Number(value) };
        }
        return { ...row, [field]: value as string };
      }),
    );
  };

  const removeSubmitRow = (index: number) => {
    setSubmitRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!submitTarget) return;
    if (!submitRows.length) {
      message.warning('请至少录入一个签审节点');
      return;
    }
    setSubmitting2(true);
    try {
      await docService.submit(submitTarget.id, {
        versionNo: submitVersion || undefined,
        reviewNodes: submitRows.map((r) => r.nodeCode).join(','),
        assignees: submitRows,
      });
      message.success('已提交签审');
      setSubmitOpen(false);
      void loadData();
      if (detail && detail.document.id === submitTarget.id) await reloadDetail();
    } finally {
      setSubmitting2(false);
    }
  };

  // 发布
  const openRelease = (record: DocDocumentItem) => {
    setReleaseTarget(record);
    setReleaseVersion(record.currentVersionNo || '');
    setReleaseComment('');
    setReleaseOpen(true);
  };

  const handleRelease = async () => {
    if (!releaseTarget) return;
    setReleasing(true);
    try {
      await docService.release(releaseTarget.id, {
        versionNo: releaseVersion || undefined,
        comment: releaseComment,
      });
      message.success('已发布');
      setReleaseOpen(false);
      void loadData();
      if (detail && detail.document.id === releaseTarget.id) await reloadDetail();
    } finally {
      setReleasing(false);
    }
  };

  // 作废
  const openObsolete = (record: DocDocumentItem) => {
    setObsoleteTarget(record);
    setObsoleteComment('');
    setObsoleteOpen(true);
  };

  const handleObsolete = async () => {
    if (!obsoleteTarget) return;
    setObsoleting(true);
    try {
      await docService.obsolete(obsoleteTarget.id, { comment: obsoleteComment });
      message.success('已作废');
      setObsoleteOpen(false);
      void loadData();
      if (detail && detail.document.id === obsoleteTarget.id) await reloadDetail();
    } finally {
      setObsoleting(false);
    }
  };

  // 分发
  const handleAddDistribution = async () => {
    if (!detail) return;
    const values = await distributionForm.validateFields();
    await docService.addDistribution(detail.document.id, {
      versionNo: values.versionNo,
      recipientType: values.recipientType,
      recipientCode: values.recipientCode,
      recipientName: values.recipientName,
      remark: values.remark,
    });
    message.success('分发记录已新增');
    distributionForm.resetFields();
    await reloadDetail();
  };

  const handleRecall = async (record: DocDistributionItem) => {
    await docService.recallDistribution(record.id);
    message.success('已撤回分发');
    await reloadDetail();
  };

  // 分类增删改
  const openCategoryCreate = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    categoryForm.setFieldsValue({ status: 1, reviewRequired: false });
    setCatModalOpen(true);
  };

  const openCategoryEdit = (record: DocCategoryItem) => {
    setEditingCategory(record);
    categoryForm.resetFields();
    categoryForm.setFieldsValue({
      categoryCode: record.categoryCode,
      categoryName: record.categoryName,
      docType: record.docType,
      fileTypes: record.fileTypes,
      requiredMetadata: record.requiredMetadata,
      reviewRequired: record.reviewRequired === 1,
      reviewNodes: record.reviewNodes ? record.reviewNodes.split(',').filter(Boolean) : [],
      sortNo: record.sortNo,
      status: record.status,
      remark: record.remark,
    });
    setCatModalOpen(true);
  };

  const handleCategorySubmit = async () => {
    const values = await categoryForm.validateFields();
    const payload = {
      categoryCode: values.categoryCode,
      categoryName: values.categoryName,
      docType: values.docType,
      fileTypes: values.fileTypes,
      requiredMetadata: values.requiredMetadata,
      reviewRequired: values.reviewRequired ? 1 : 0,
      reviewNodes: (values.reviewNodes || []).join(','),
      sortNo: values.sortNo,
      status: values.status,
      remark: values.remark,
    };
    setCatSubmitting(true);
    try {
      if (editingCategory) {
        await docCategoryService.update(editingCategory.id, payload);
        message.success('更新成功');
      } else {
        await docCategoryService.create(payload);
        message.success('新增成功');
      }
      setCatModalOpen(false);
      void loadCategories();
      loadCategoryOptions();
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleCategoryDelete = async (record: DocCategoryItem) => {
    await docCategoryService.remove(record.id);
    message.success('删除成功');
    void loadCategories();
    loadCategoryOptions();
  };

  const docColumns: ColumnsType<DocDocumentItem> = [
    { title: '图号', dataIndex: 'docNo', width: 190 },
    { title: '名称', dataIndex: 'docName', width: 180 },
    {
      title: '分类',
      dataIndex: 'categoryCode',
      width: 120,
      render: (v) => v || '-',
    },
    {
      title: '关联物料',
      dataIndex: 'materialCode',
      width: 120,
      render: (v) => v || '-',
    },
    {
      title: '关联产品',
      dataIndex: 'productCode',
      width: 120,
      render: (v) => v || '-',
    },
    { title: '当前版本', dataIndex: 'currentVersionNo', width: 100, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={DOC_STATUS_COLOR[v] || 'default'}>{DOC_STATUS_TEXT[v] || v}</Tag> : '-',
    },
    {
      title: '受控分发',
      dataIndex: 'distributionControlled',
      width: 100,
      render: (v?: number) => (v === 1 ? <Tag color="success">是</Tag> : <Tag>否</Tag>),
    },
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
          {hasPermission('doc:update') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('doc:submit') && (
            <Button type="link" size="small" onClick={() => openSubmit(record)}>
              提交签审
            </Button>
          )}
          {hasPermission('doc:release') && (
            <Button type="link" size="small" onClick={() => openRelease(record)}>
              发布
            </Button>
          )}
          {hasPermission('doc:obsolete') && (
            <Button type="link" size="small" onClick={() => openObsolete(record)}>
              作废
            </Button>
          )}
          {hasPermission('doc:delete') && (
            <Popconfirm title="确认删除该图文档？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const categoryColumns: ColumnsType<DocCategoryItem> = [
    { title: '分类编码', dataIndex: 'categoryCode', width: 140 },
    { title: '分类名称', dataIndex: 'categoryName', width: 160 },
    {
      title: '文档类型',
      dataIndex: 'docType',
      width: 120,
      render: (v?: string) => (v ? DOC_TYPE_TEXT[v] || v : '-'),
    },
    { title: '允许文件类型', dataIndex: 'fileTypes', width: 160, render: (v) => v || '-' },
    { title: '必填元数据', dataIndex: 'requiredMetadata', width: 200, render: (v) => v || '-' },
    {
      title: '签审节点',
      dataIndex: 'reviewNodes',
      width: 220,
      render: (v?: string) =>
        v
          ? v
              .split(',')
              .filter(Boolean)
              .map((code) => DOC_REVIEW_NODE_TEXT[code] || code)
              .join(' / ')
          : '-',
    },
    { title: '排序', dataIndex: 'sortNo', width: 80, render: (v) => (v ?? '-') },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v?: number) =>
        v === 1 ? <Tag color="success">启用</Tag> : <Tag color="default">停用</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) =>
        hasPermission('doc:category:save') && (
          <Space size="small">
            <Button type="link" size="small" onClick={() => openCategoryEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该分类？" onConfirm={() => handleCategoryDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  const relationColumns: ColumnsType<DocRelationItem> = [
    {
      title: '关联类型',
      dataIndex: 'relationType',
      width: 110,
      render: (v?: string) => (v ? DOC_RELATION_TYPE_TEXT[v] || v : '-'),
    },
    { title: '关联编码', dataIndex: 'targetCode', width: 160, render: (v) => v || '-' },
    { title: '关联名称', dataIndex: 'targetName', width: 180, render: (v) => v || '-' },
    { title: '关联角色', dataIndex: 'relationRole', width: 120, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) =>
        hasPermission('doc:update') && (
          <Popconfirm title="确认删除该关联关系？" onConfirm={() => handleRemoveRelation(record)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        ),
    },
  ];

  const versionColumns: ColumnsType<DocVersionItem> = [
    { title: '版本', dataIndex: 'versionNo', width: 80, render: (v) => v || '-' },
    { title: '文件名', dataIndex: 'fileName', width: 200, render: (v) => v || '-' },
    { title: '类型', dataIndex: 'fileType', width: 90, render: (v) => v || '-' },
    { title: '大小(字节)', dataIndex: 'fileSize', width: 110, render: (v) => (v ?? '-') },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={DOC_STATUS_COLOR[v] || 'default'}>{DOC_STATUS_TEXT[v] || v}</Tag> : '-',
    },
    {
      title: '发布时间',
      dataIndex: 'releasedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    { title: '变更说明', dataIndex: 'changeNote', width: 160, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_, record) =>
        hasPermission('doc:update') && (
          <Button
            type="link"
            size="small"
            disabled={record.versionNo === detail?.document.currentVersionNo}
            onClick={() => handleActivate(record)}
          >
            激活
          </Button>
        ),
    },
  ];

  const reviewColumns: ColumnsType<DocReviewTaskItem> = [
    { title: '序号', dataIndex: 'seqNo', width: 70, render: (v) => (v ?? '-') },
    {
      title: '节点',
      dataIndex: 'nodeName',
      width: 100,
      render: (v: string | undefined, record) => v || DOC_REVIEW_NODE_TEXT[record.nodeCode || ''] || '-',
    },
    { title: '分配人', dataIndex: 'assigneeName', width: 120, render: (v) => v || '-' },
    {
      title: '判定',
      dataIndex: 'decision',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={DECISION_COLOR[v] || 'default'}>{DOC_REVIEW_DECISION_TEXT[v] || v}</Tag> : '-',
    },
    { title: '意见', dataIndex: 'comment', width: 160, render: (v) => v || '-' },
    {
      title: '时间',
      dataIndex: 'decidedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) =>
        record.decision === 'pending' && hasPermission('doc:review') ? (
          <Space size="small">
            <Button type="link" size="small" onClick={() => openDecide(record, 'approved')}>
              通过
            </Button>
            <Button type="link" size="small" danger onClick={() => openDecide(record, 'rejected')}>
              驳回
            </Button>
          </Space>
        ) : null,
    },
  ];

  const distributionColumns: ColumnsType<DocDistributionItem> = [
    { title: '版本', dataIndex: 'versionNo', width: 90, render: (v) => v || '-' },
    {
      title: '接收方类型',
      dataIndex: 'recipientType',
      width: 120,
      render: (v?: string) => (v ? DOC_DISTRIBUTION_RECIPIENT_TEXT[v] || v : '-'),
    },
    { title: '接收方编码', dataIndex: 'recipientCode', width: 140, render: (v) => v || '-' },
    { title: '接收方名称', dataIndex: 'recipientName', width: 160, render: (v) => v || '-' },
    {
      title: '分发时间',
      dataIndex: 'distributedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) => (v === 'active' ? <Tag color="success">生效</Tag> : <Tag>已撤回</Tag>),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_, record) =>
        record.status === 'active' &&
        hasPermission('doc:distribute') && (
          <Popconfirm title="确认撤回该分发？" onConfirm={() => handleRecall(record)}>
            <Button type="link" size="small" danger>
              撤回
            </Button>
          </Popconfirm>
        ),
    },
  ];

  const approvalLogColumns: ColumnsType<DocApprovalLogItem> = [
    { title: '版本', dataIndex: 'versionNo', width: 90, render: (v) => v || '-' },
    { title: '动作', dataIndex: 'action', width: 120, render: (v) => v || '-' },
    { title: '操作人', dataIndex: 'operatorName', width: 120, render: (v) => v || '-' },
    { title: '意见', dataIndex: 'comment', width: 200, render: (v) => v || '-' },
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
  ];

  const submitColumns: ColumnsType<DocReviewAssignee> = [
    {
      title: '签审节点',
      dataIndex: 'nodeCode',
      width: 160,
      render: (v: string, _r, index) => (
        <Select
          value={v}
          style={{ width: '100%' }}
          options={DOC_REVIEW_NODE_OPTIONS}
          onChange={(val) => updateSubmitRow(index, 'nodeCode', val)}
        />
      ),
    },
    {
      title: '分配人 ID',
      dataIndex: 'assigneeId',
      width: 130,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateSubmitRow(index, 'assigneeId', val ?? '')}
        />
      ),
    },
    {
      title: '分配人名称',
      dataIndex: 'assigneeName',
      width: 180,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateSubmitRow(index, 'assigneeName', e.target.value)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 70,
      render: (_, __, index) => (
        <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => removeSubmitRow(index)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        文档图纸
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'documents', label: '图文档' },
          { key: 'categories', label: '文档分类' },
        ]}
      />

      {activeTab === 'documents' && (
        <>
          <Card>
            <Form layout="inline" onFinish={onSearch}>
              <Form.Item name="keyword" label="关键词">
                <Input placeholder="图号 / 名称" allowClear style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="categoryCode" label="文档分类">
                <Select
                  placeholder="请选择"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  style={{ width: 200 }}
                  options={categories.map((c) => ({
                    value: c.categoryCode,
                    label: `${c.categoryCode} ${c.categoryName}`,
                  }))}
                />
              </Form.Item>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择" allowClear style={{ width: 130 }} options={DOC_STATUS_OPTIONS} />
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
            title={`图文档列表（共 ${total} 条）`}
            extra={
              hasPermission('doc:create') && (
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                  新增图文档
                </Button>
              )
            }
          >
            <Table<DocDocumentItem>
              rowKey="id"
              loading={loading}
              columns={docColumns}
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

      {activeTab === 'categories' && (
        <>
          <Card>
            <Space wrap>
              <Input
                placeholder="分类编码 / 名称"
                allowClear
                style={{ width: 200 }}
                value={catSearch.keyword}
                onChange={(e) => setCatSearch((prev) => ({ ...prev, keyword: e.target.value }))}
              />
              <Select
                placeholder="文档类型"
                allowClear
                style={{ width: 150 }}
                value={catSearch.docType}
                onChange={(v) => setCatSearch((prev) => ({ ...prev, docType: v }))}
                options={DOC_TYPE_OPTIONS}
              />
              <Select
                placeholder="状态"
                allowClear
                style={{ width: 120 }}
                value={catSearch.status}
                onChange={(v) => setCatSearch((prev) => ({ ...prev, status: v }))}
                options={STATUS_ENABLE_OPTIONS}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setCatPageNum(1);
                  void loadCategories(1, catPageSize, catSearch);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setCatSearch({});
                  setCatPageNum(1);
                  void loadCategories(1, catPageSize, {});
                }}
              >
                重置
              </Button>
              {hasPermission('doc:category:save') && (
                <Button type="primary" icon={<PlusOutlined />} onClick={openCategoryCreate}>
                  新增分类
                </Button>
              )}
            </Space>
          </Card>

          <Card title={`文档分类（共 ${catTotal} 条）`}>
            <Table<DocCategoryItem>
              rowKey="id"
              loading={catLoading}
              columns={categoryColumns}
              dataSource={catData}
              scroll={{ x: 1300 }}
              pagination={{
                current: catPageNum,
                pageSize: catPageSize,
                total: catTotal,
                showSizeChanger: true,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (page, size) => {
                  setCatPageNum(page);
                  setCatPageSize(size);
                  void loadCategories(page, size);
                },
              }}
            />
          </Card>
        </>
      )}

      {/* 新增/编辑图文档 */}
      <Modal
        title={editing ? '编辑图文档' : '新增图文档'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="docNo" label="图号" rules={[{ required: true, message: '请输入图号' }]}>
            <Input placeholder="请输入图号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="docName" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item name="categoryCode" label="文档分类">
            <Select
              placeholder="请选择文档分类"
              allowClear
              showSearch
              optionFilterProp="label"
              onChange={(value: string) => {
                const category = categories.find((c) => c.categoryCode === value);
                if (category) form.setFieldValue('docType', category.docType);
              }}
              options={categories.map((c) => ({
                value: c.categoryCode,
                label: `${c.categoryCode} ${c.categoryName}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="docType" label="文档类型">
            <Select placeholder="请选择" allowClear options={DOC_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="productCode" label="关联产品编码">
            <Input placeholder="请输入关联产品编码" />
          </Form.Item>
          <Form.Item name="materialCode" label="关联物料编码">
            <Input placeholder="请输入关联物料编码" />
          </Form.Item>
          <Form.Item name="bomCode" label="关联 BOM 编码">
            <Input placeholder="请输入关联 BOM 编码" />
          </Form.Item>
          <Form.Item name="fileName" label="文件名">
            <Input placeholder="请输入文件名" />
          </Form.Item>
          <Form.Item name="ownerName" label="负责人">
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item name="distributionControlled" label="受控分发" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增/编辑文档分类 */}
      <Modal
        title={editingCategory ? '编辑文档分类' : '新增文档分类'}
        open={catModalOpen}
        onOk={handleCategorySubmit}
        confirmLoading={catSubmitting}
        onCancel={() => setCatModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={categoryForm} layout="vertical" preserve={false}>
          <Form.Item
            name="categoryCode"
            label="分类编码"
            rules={[{ required: true, message: '请输入分类编码' }]}
          >
            <Input placeholder="请输入分类编码" disabled={!!editingCategory} />
          </Form.Item>
          <Form.Item
            name="categoryName"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="docType" label="文档类型">
            <Select placeholder="请选择" allowClear options={DOC_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="fileTypes" label="允许文件类型">
            <Input placeholder="多个以逗号分隔，如 dwg,dxf,pdf" />
          </Form.Item>
          <Form.Item name="requiredMetadata" label="必填元数据">
            <Input placeholder="多个以逗号分隔，如 docNo,docName" />
          </Form.Item>
          <Form.Item name="reviewRequired" label="需要评审" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="reviewNodes" label="签审节点">
            <Select mode="multiple" placeholder="请选择签审节点" options={DOC_REVIEW_NODE_OPTIONS} />
          </Form.Item>
          <Form.Item name="sortNo" label="排序号">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={STATUS_ENABLE_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title={`图文档详情 - ${detail?.document.docNo || ''}`}
        width={900}
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
                  { key: 'docNo', label: '图号', children: detail.document.docNo },
                  { key: 'docName', label: '名称', children: detail.document.docName },
                  {
                    key: 'category',
                    label: '分类',
                    children: detail.document.categoryCode
                      ? `${detail.document.categoryCode} ${detail.category?.categoryName || ''}`
                      : '-',
                  },
                  {
                    key: 'docType',
                    label: '文档类型',
                    children: detail.document.docType
                      ? DOC_TYPE_TEXT[detail.document.docType] || detail.document.docType
                      : '-',
                  },
                  { key: 'product', label: '关联产品', children: detail.document.productCode || '-' },
                  { key: 'material', label: '关联物料', children: detail.document.materialCode || '-' },
                  { key: 'bom', label: '关联 BOM', children: detail.document.bomCode || '-' },
                  { key: 'version', label: '当前版本', children: detail.document.currentVersionNo || '-' },
                  {
                    key: 'status',
                    label: '状态',
                    children: (
                      <Tag color={DOC_STATUS_COLOR[detail.document.status || ''] || 'default'}>
                        {DOC_STATUS_TEXT[detail.document.status || ''] || detail.document.status}
                      </Tag>
                    ),
                  },
                  {
                    key: 'controlled',
                    label: '受控分发',
                    children: detail.document.distributionControlled === 1 ? '是' : '否',
                  },
                  { key: 'owner', label: '负责人', children: detail.document.ownerName || '-' },
                  { key: 'desc', label: '描述', children: detail.document.description || '-' },
                ]}
              />
            )}
          </Card>

          <Card size="small" title="关联对象">
            {hasPermission('doc:update') && (
              <Form form={relationForm} layout="inline" style={{ marginBottom: 12 }}>
                <Form.Item
                  name="relationType"
                  label="关联类型"
                  rules={[{ required: true, message: '请选择' }]}
                >
                  <Select style={{ width: 130 }} options={DOC_RELATION_TYPE_OPTIONS} />
                </Form.Item>
                <Form.Item name="targetId" label="对象 ID">
                  <InputNumber style={{ width: 120 }} />
                </Form.Item>
                <Form.Item name="targetCode" label="对象编码">
                  <Input style={{ width: 150 }} placeholder="对象编码" />
                </Form.Item>
                <Form.Item name="targetName" label="对象名称">
                  <Input style={{ width: 150 }} placeholder="对象名称" />
                </Form.Item>
                <Form.Item name="relationRole" label="关联角色">
                  <Input style={{ width: 120 }} placeholder="如 主图" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRelation}>
                    新增
                  </Button>
                </Form.Item>
              </Form>
            )}
            <Table<DocRelationItem>
              rowKey="id"
              size="small"
              columns={relationColumns}
              dataSource={detail?.relations || []}
              pagination={false}
              scroll={{ x: 800 }}
            />
          </Card>

          <Card
            size="small"
            title="版本列表"
            extra={
              hasPermission('doc:update') && (
                <Button type="link" size="small" icon={<PlusOutlined />} onClick={openVersionCreate}>
                  新增版本
                </Button>
              )
            }
          >
            <Table<DocVersionItem>
              rowKey="id"
              size="small"
              columns={versionColumns}
              dataSource={versions}
              pagination={false}
              scroll={{ x: 1000 }}
            />
            {hasPermission('doc:compare') && (
              <Space wrap style={{ marginTop: 12 }}>
                <Select
                  placeholder="左侧版本"
                  style={{ width: 140 }}
                  value={cmpLeft}
                  onChange={setCmpLeft}
                  options={versions
                    .filter((v) => v.versionNo)
                    .map((v) => ({ value: v.versionNo as string, label: v.versionNo as string }))}
                />
                <Select
                  placeholder="右侧版本"
                  style={{ width: 140 }}
                  value={cmpRight}
                  onChange={setCmpRight}
                  options={versions
                    .filter((v) => v.versionNo)
                    .map((v) => ({ value: v.versionNo as string, label: v.versionNo as string }))}
                />
                <Button type="primary" icon={<SwapOutlined />} loading={comparing} onClick={handleCompare}>
                  比较
                </Button>
              </Space>
            )}
            {cmpResult && (
              <Table
                style={{ marginTop: 12 }}
                rowKey={(r, index) => `${r.field}-${index}`}
                size="small"
                pagination={false}
                dataSource={cmpResult.diffs || []}
                columns={[
                  { title: '字段', dataIndex: 'field', width: 140, render: (v) => v || '-' },
                  { title: '字段说明', dataIndex: 'fieldLabel', width: 160, render: (v) => v || '-' },
                  { title: '左版本值', dataIndex: 'leftValue', width: 200, render: (v) => v || '-' },
                  { title: '右版本值', dataIndex: 'rightValue', width: 200, render: (v) => v || '-' },
                  {
                    title: '是否变化',
                    dataIndex: 'changed',
                    width: 100,
                    render: (v?: boolean) => (v ? <Tag color="warning">已变化</Tag> : <Tag>未变化</Tag>),
                  },
                ]}
              />
            )}
          </Card>

          <Card size="small" title="签审任务">
            <Table<DocReviewTaskItem>
              rowKey="id"
              size="small"
              columns={reviewColumns}
              dataSource={detail?.reviewTasks || []}
              pagination={false}
              scroll={{ x: 1000 }}
            />
          </Card>

          <Card size="small" title="受控分发记录">
            {hasPermission('doc:distribute') && (
              <Form form={distributionForm} layout="inline" style={{ marginBottom: 12 }}>
                <Form.Item name="versionNo" label="版本" rules={[{ required: true, message: '请输入' }]}>
                  <Input style={{ width: 100 }} placeholder="如 V1" />
                </Form.Item>
                <Form.Item
                  name="recipientType"
                  label="接收方类型"
                  rules={[{ required: true, message: '请选择' }]}
                >
                  <Select style={{ width: 130 }} options={DOC_DISTRIBUTION_RECIPIENT_OPTIONS} />
                </Form.Item>
                <Form.Item name="recipientCode" label="接收方编码">
                  <Input style={{ width: 150 }} placeholder="接收方编码" />
                </Form.Item>
                <Form.Item name="recipientName" label="接收方名称">
                  <Input style={{ width: 150 }} placeholder="接收方名称" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDistribution}>
                    新增
                  </Button>
                </Form.Item>
              </Form>
            )}
            <Table<DocDistributionItem>
              rowKey="id"
              size="small"
              columns={distributionColumns}
              dataSource={distributions}
              pagination={false}
              scroll={{ x: 900 }}
            />
          </Card>

          <Card size="small" title="流转留痕">
            <Table<DocApprovalLogItem>
              rowKey="id"
              size="small"
              columns={approvalLogColumns}
              dataSource={detail?.approvalLogs || []}
              pagination={false}
              scroll={{ x: 800 }}
            />
          </Card>
        </Space>
      </Drawer>

      {/* 提交签审 */}
      <Modal
        title={`提交签审 - ${submitTarget?.docNo || ''}`}
        open={submitOpen}
        onOk={handleSubmitReview}
        confirmLoading={submitting2}
        onCancel={() => setSubmitOpen(false)}
        destroyOnClose
        width={720}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space>
            <span>版本号</span>
            <Input
              style={{ width: 160 }}
              value={submitVersion}
              onChange={(e) => setSubmitVersion(e.target.value)}
              placeholder="默认当前版本"
            />
            <Button icon={<PlusOutlined />} onClick={addSubmitRow}>
              新增节点
            </Button>
          </Space>
          <Table<DocReviewAssignee>
            rowKey={(_, index) => String(index)}
            columns={submitColumns}
            dataSource={submitRows}
            size="small"
            pagination={false}
            scroll={{ x: 600 }}
          />
        </Space>
      </Modal>

      {/* 新增版本 */}
      <Modal
        title="新增版本"
        open={versionModalOpen}
        onOk={handleAddVersion}
        confirmLoading={versionSubmitting}
        onCancel={() => setVersionModalOpen(false)}
        destroyOnClose
        width={620}
      >
        <Form form={versionForm} layout="vertical" preserve={false}>
          <Form.Item name="versionNo" label="版本号">
            <Input placeholder="留空则自动递增 V2/V3" />
          </Form.Item>
          <Form.Item name="fileName" label="文件名">
            <Input placeholder="请输入文件名" />
          </Form.Item>
          <Form.Item name="filePath" label="文件路径">
            <Input placeholder="请输入文件路径" />
          </Form.Item>
          <Form.Item name="fileSize" label="文件大小(字节)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="fileType" label="文件类型">
            <Input placeholder="如 dwg" />
          </Form.Item>
          <Form.Item name="fileHash" label="文件摘要">
            <Input placeholder="请输入文件摘要" />
          </Form.Item>
          <Form.Item name="metadataJson" label="元数据 JSON">
            <Input.TextArea rows={2} placeholder='如 {"weight":"12.5g"}' />
          </Form.Item>
          <Form.Item name="changeNote" label="变更说明">
            <Input.TextArea rows={2} placeholder="请输入变更说明" />
          </Form.Item>
          <Form.Item name="activate" label="立即激活" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 评审判定 */}
      <Modal
        title="签审判定"
        open={decideOpen}
        onOk={handleDecide}
        confirmLoading={deciding}
        onCancel={() => setDecideOpen(false)}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="判定结果" required>
            <Select
              value={decideValue}
              onChange={(v) => setDecideValue(v)}
              options={[
                { value: 'approved', label: '通过' },
                { value: 'rejected', label: '驳回' },
              ]}
            />
          </Form.Item>
          <Form.Item label="评审意见">
            <Input.TextArea rows={3} value={decideComment} onChange={(e) => setDecideComment(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 发布 */}
      <Modal
        title={`发布 - ${releaseTarget?.docNo || ''}`}
        open={releaseOpen}
        onOk={handleRelease}
        confirmLoading={releasing}
        onCancel={() => setReleaseOpen(false)}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="版本号">
            <Input value={releaseVersion} onChange={(e) => setReleaseVersion(e.target.value)} placeholder="默认当前版本" />
          </Form.Item>
          <Form.Item label="发布说明">
            <Input.TextArea rows={3} value={releaseComment} onChange={(e) => setReleaseComment(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 作废 */}
      <Modal
        title={`作废 - ${obsoleteTarget?.docNo || ''}`}
        open={obsoleteOpen}
        onOk={handleObsolete}
        confirmLoading={obsoleting}
        onCancel={() => setObsoleteOpen(false)}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="作废说明">
            <Input.TextArea rows={3} value={obsoleteComment} onChange={(e) => setObsoleteComment(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

interface DocRelationSaveValues {
  relationType: string;
  targetId?: number;
  targetCode?: string;
  targetName?: string;
  relationRole?: string;
  remark?: string;
}

interface VersionFormValues {
  versionNo?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  fileType?: string;
  fileHash?: string;
  metadataJson?: string;
  changeNote?: string;
  activate?: boolean;
}

interface DistributionFormValues {
  versionNo: string;
  recipientType: string;
  recipientCode?: string;
  recipientName?: string;
  remark?: string;
}
