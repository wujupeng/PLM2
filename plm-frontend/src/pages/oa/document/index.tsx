import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tree,
  Typography,
  Upload,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import {
  CommentOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
  LockOutlined,
  PlusOutlined,
  ReloadOutlined,
  RollbackOutlined,
  SettingOutlined,
  ShareAltOutlined,
  UnlockOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import UserSelect from '@/pages/oa/UserSelect';
import UserMultiSelect from '@/pages/oa/UserMultiSelect';
import {
  oaDocAccessLogService,
  oaDocCommentService,
  oaDocFolderService,
  oaDocShareService,
  oaDocumentService,
} from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import {
  OA_DOC_ACCESS_ACTION_COLOR,
  OA_DOC_ACCESS_ACTION_LABEL,
  OA_DOC_FOLDER_TYPE_OPTIONS,
  OA_DOC_PERMISSION_LEVEL_COLOR,
  OA_DOC_PERMISSION_LEVEL_LABEL,
  OA_DOC_PERMISSION_LEVEL_OPTIONS,
  OA_DOC_SCAN_STATUS_COLOR,
  OA_DOC_SCAN_STATUS_LABEL,
  OA_DOC_SHARE_TYPE_COLOR,
  OA_DOC_SHARE_TYPE_LABEL,
  OA_DOC_SHARE_TYPE_OPTIONS,
  OA_DOC_SOURCE_TYPE_LABEL,
  OA_DOC_STATUS_COLOR,
  OA_DOC_STATUS_LABEL,
  OA_DOC_STATUS_OPTIONS,
  OA_DOC_SUBJECT_TYPE_LABEL,
  OA_DOC_SUBJECT_TYPE_OPTIONS,
  type OaDocAccessLogItem,
  type OaDocCommentItem,
  type OaDocCommentSaveParams,
  type OaDocDetail,
  type OaDocFolderItem,
  type OaDocFolderPermissionItem,
  type OaDocFolderPermissionSaveParams,
  type OaDocFolderSaveParams,
  type OaDocQuery,
  type OaDocSaveParams,
  type OaDocShareItem,
  type OaDocShareSaveParams,
  type OaDocVersionItem,
  type OaDocumentItem,
} from '@/types/oa';

const { Title, Text, Paragraph } = Typography;
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

interface DocSearchState {
  keyword?: string;
  docType?: string;
  status?: string;
  tag?: string;
  dateRange?: [Dayjs, Dayjs];
}

interface DocFormValues {
  title: string;
  folderId: number;
  docType?: string;
  status?: string;
  summary?: string;
  keywords?: string;
  tags?: string;
  remark?: string;
  revisionNote?: string;
}

interface PermFormValues {
  subjectType: string;
  subjectId?: number;
  permissionLevel: string;
  inheritFlag?: number;
  remark?: string;
}

interface ShareFormValues {
  shareType: string;
  targetUserId?: number;
  permissionLevel?: string;
  downloadAllowed?: number;
  expireDays?: number;
  remark?: string;
}

const formatSize = (size?: number) => {
  if (!size) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const toTreeData = (nodes: OaDocFolderItem[]): DataNode[] =>
  nodes.map((node) => ({
    key: node.id,
    title: node.folderName,
    children: node.children && node.children.length > 0 ? toTreeData(node.children) : undefined,
  }));

const flattenFolders = (nodes: OaDocFolderItem[], prefix = ''): { value: number; label: string }[] =>
  nodes.flatMap((node) => {
    const label = prefix ? `${prefix} / ${node.folderName}` : node.folderName;
    return [
      { value: node.id, label },
      ...(node.children && node.children.length > 0 ? flattenFolders(node.children, label) : []),
    ];
  });

export default function OaDocumentPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [searchForm] = Form.useForm<DocSearchState>();
  const [docForm] = Form.useForm<DocFormValues>();
  const [folderForm] = Form.useForm<OaDocFolderSaveParams>();
  const [permForm] = Form.useForm<PermFormValues>();
  const [shareForm] = Form.useForm<ShareFormValues>();
  const [commentForm] = Form.useForm<{ content?: string; mentionUserIds?: number[] }>();

  const [tab, setTab] = useState<'documents' | 'recycle'>('documents');
  const [folderType, setFolderType] = useState<string | undefined>(undefined);
  const [folderTree, setFolderTree] = useState<OaDocFolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>(undefined);

  const [data, setData] = useState<OaDocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<DocSearchState>({});

  const [recycleData, setRecycleData] = useState<OaDocumentItem[]>([]);
  const [recycleTotal, setRecycleTotal] = useState(0);
  const [recycleLoading, setRecycleLoading] = useState(false);
  const [recyclePageNum, setRecyclePageNum] = useState(1);
  const [recyclePageSize, setRecyclePageSize] = useState(10);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<OaDocumentItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [parentFolderId, setParentFolderId] = useState<number | undefined>(undefined);
  const [folderSubmitting, setFolderSubmitting] = useState(false);

  const [permOpen, setPermOpen] = useState(false);
  const [permissions, setPermissions] = useState<OaDocFolderPermissionItem[]>([]);
  const [permSubmitting, setPermSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<OaDocDetail | null>(null);
  const [accessLogs, setAccessLogs] = useState<OaDocAccessLogItem[]>([]);
  const [versionFile, setVersionFile] = useState<File | undefined>(undefined);
  const [revisionNote, setRevisionNote] = useState('');

  const [shareModalOpen, setShareModalOpen] = useState(false);

  const folderOptions = useMemo(() => flattenFolders(folderTree), [folderTree]);
  const treeData = useMemo(() => toTreeData(folderTree), [folderTree]);

  const loadTree = useCallback(async (type?: string) => {
    const res = await oaDocFolderService.tree(type);
    setFolderTree(res || []);
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search, folderId = selectedFolderId) => {
      setLoading(true);
      try {
        const params: OaDocQuery = {
          pageNum: page,
          pageSize: size,
          folderId,
          includeSub: folderId ? true : undefined,
          keyword: cond.keyword || undefined,
          docType: cond.docType || undefined,
          status: cond.status || undefined,
          tag: cond.tag || undefined,
          startDate: cond.dateRange?.[0] ? cond.dateRange[0].format('YYYY-MM-DD') : undefined,
          endDate: cond.dateRange?.[1] ? cond.dateRange[1].format('YYYY-MM-DD') : undefined,
        };
        const res = await oaDocumentService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search, selectedFolderId],
  );

  const loadRecycle = useCallback(async (page = recyclePageNum, size = recyclePageSize) => {
    setRecycleLoading(true);
    try {
      const res = await oaDocumentService.recyclePage(page, size);
      setRecycleData(res.list || []);
      setRecycleTotal(res.total || 0);
    } finally {
      setRecycleLoading(false);
    }
  }, [recyclePageNum, recyclePageSize]);

  useEffect(() => {
    void loadTree();
    void loadData(1, 10, {}, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectFolder = (folderId?: number) => {
    setSelectedFolderId(folderId);
    setPageNum(1);
    void loadData(1, pageSize, search, folderId);
  };

  const changeFolderType = (type?: string) => {
    setFolderType(type);
    void loadTree(type);
  };

  const onSearch = (values: DocSearchState) => {
    setSearch(values);
    setPageNum(1);
    void loadData(1, pageSize, values, selectedFolderId);
  };

  const onResetSearch = () => {
    searchForm.resetFields();
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {}, selectedFolderId);
  };

  const openUpload = () => {
    docForm.resetFields();
    docForm.setFieldsValue({ status: 'DRAFT', folderId: selectedFolderId });
    setUploadFile(undefined);
    setUploadOpen(true);
  };

  const submitUpload = async () => {
    const values = await docForm.validateFields();
    if (!uploadFile) {
      message.warning('请选择要上传的文件');
      return;
    }
    const payload: OaDocSaveParams = {
      title: values.title,
      folderId: values.folderId,
      docType: values.docType,
      status: values.status,
      summary: values.summary,
      keywords: values.keywords,
      tags: values.tags,
      remark: values.remark,
      revisionNote: values.revisionNote,
      sourceType: 'MANUAL',
    };
    setUploading(true);
    try {
      await oaDocumentService.create(payload, uploadFile);
      message.success('文档上传成功');
      setUploadOpen(false);
      await loadData(1, pageSize, search);
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (record: OaDocumentItem) => {
    setEditingDoc(record);
    docForm.resetFields();
    docForm.setFieldsValue({
      title: record.title || '',
      folderId: record.folderId as number,
      docType: record.docType,
      status: record.status,
      summary: record.summary,
      keywords: record.keywords,
      tags: record.tags,
      remark: record.remark,
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editingDoc) return;
    const values = await docForm.validateFields();
    const payload: OaDocSaveParams = {
      title: values.title,
      folderId: values.folderId,
      docType: values.docType,
      status: values.status,
      summary: values.summary,
      keywords: values.keywords,
      tags: values.tags,
      remark: values.remark,
    };
    setSaving(true);
    try {
      await oaDocumentService.update(editingDoc.id, payload);
      message.success('文档信息已更新');
      setEditOpen(false);
      if (detail?.doc.id === editingDoc.id) {
        void openDetail(editingDoc.id);
      }
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record: OaDocumentItem) => {
    await oaDocumentService.remove(record.id);
    message.success('已移入回收站');
    await loadData();
  };

  const handlePublish = async (record: OaDocumentItem) => {
    await oaDocumentService.publish(record.id);
    message.success('已发布');
    await loadData();
  };

  const handleVoid = async (record: OaDocumentItem) => {
    await oaDocumentService.voidDocument(record.id);
    message.success('已作废');
    await loadData();
  };

  const handleArchive = async (record: OaDocumentItem) => {
    await oaDocumentService.archive(record.id);
    message.success('已归档');
    await loadData();
  };

  const handleDownload = async (docId: number, fileName?: string, versionId?: number) => {
    const blob = await oaDocumentService.download(docId, versionId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleRestore = async (record: OaDocumentItem) => {
    await oaDocumentService.restore(record.id);
    message.success('已恢复');
    await loadRecycle();
    await loadData();
  };

  const handlePurge = async (record: OaDocumentItem) => {
    await oaDocumentService.purge(record.id);
    message.success('已彻底删除');
    await loadRecycle();
  };

  const openDetail = async (docId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await oaDocumentService.detail(docId);
      setDetail(res);
      setVersionFile(undefined);
      setRevisionNote('');
      commentForm.resetFields();
      const logs = await oaDocAccessLogService.page({ pageNum: 1, pageSize: 50, docId });
      setAccessLogs(logs.list || []);
    } finally {
      setDetailLoading(false);
    }
  };

  const reloadDetail = async () => {
    if (!detail) return;
    const res = await oaDocumentService.detail(detail.doc.id);
    setDetail(res);
    await loadData();
  };

  const submitVersion = async () => {
    if (!detail || !versionFile) {
      message.warning('请选择文件');
      return;
    }
    await oaDocumentService.uploadVersion(detail.doc.id, versionFile, revisionNote || undefined);
    message.success('新版本已上传');
    setVersionFile(undefined);
    setRevisionNote('');
    await reloadDetail();
  };

  const restoreVersion = async (versionId: number) => {
    if (!detail) return;
    await oaDocumentService.restoreVersion(detail.doc.id, versionId);
    message.success('已基于该版本生成新版本');
    await reloadDetail();
  };

  const toggleLock = async (version: OaDocVersionItem) => {
    await oaDocumentService.lockVersion(version.versionId, version.lockFlag === 1 ? 0 : 1);
    message.success(version.lockFlag === 1 ? '已解锁版本' : '已锁定版本');
    await reloadDetail();
  };

  const submitComment = async () => {
    if (!detail) return;
    const values = await commentForm.validateFields();
    if (!values.content) {
      message.warning('请输入评论内容');
      return;
    }
    const payload: OaDocCommentSaveParams = {
      content: values.content,
      versionId: detail.doc.currentVersionId,
      mentionUserIds: (values.mentionUserIds || []).join(','),
    };
    await oaDocCommentService.create(detail.doc.id, payload);
    message.success('评论已发布');
    commentForm.resetFields();
    await reloadDetail();
  };

  const deleteComment = async (commentId: number) => {
    await oaDocCommentService.remove(commentId);
    message.success('评论已删除');
    await reloadDetail();
  };

  const openShareModal = () => {
    shareForm.resetFields();
    shareForm.setFieldsValue({ shareType: 'INTERNAL', permissionLevel: 'READ', downloadAllowed: 1 });
    setShareModalOpen(true);
  };

  const submitShare = async () => {
    if (!detail) return;
    const values = await shareForm.validateFields();
    const payload: OaDocShareSaveParams = {
      shareType: values.shareType,
      targetUserId: values.targetUserId,
      permissionLevel: values.permissionLevel,
      downloadAllowed: values.downloadAllowed,
      expireDays: values.expireDays,
      remark: values.remark,
    };
    await oaDocShareService.create(detail.doc.id, payload);
    message.success('分享已创建');
    setShareModalOpen(false);
    await reloadDetail();
  };

  const revokeShare = async (shareId: number) => {
    await oaDocShareService.revoke(shareId);
    message.success('分享已撤销');
    await reloadDetail();
  };

  const openFolderModal = (parentId?: number) => {
    folderForm.resetFields();
    setParentFolderId(parentId);
    folderForm.setFieldsValue({ folderType: folderType || 'PUBLIC', parentId });
    setFolderModalOpen(true);
  };

  const submitFolder = async () => {
    const values = await folderForm.validateFields();
    setFolderSubmitting(true);
    try {
      await oaDocFolderService.create({ ...values, parentId: values.parentId ?? 0 });
      message.success('目录已创建');
      setFolderModalOpen(false);
      await loadTree(folderType);
    } finally {
      setFolderSubmitting(false);
    }
  };

  const openPermDrawer = async () => {
    if (!selectedFolderId) {
      message.warning('请先选择目录');
      return;
    }
    permForm.resetFields();
    permForm.setFieldsValue({ subjectType: 'ALL', permissionLevel: 'READ', inheritFlag: 1 });
    const res = await oaDocFolderService.permissions(selectedFolderId);
    setPermissions(res || []);
    setPermOpen(true);
  };

  const submitPermission = async () => {
    if (!selectedFolderId) return;
    const values = await permForm.validateFields();
    const payload: OaDocFolderPermissionSaveParams = {
      subjectType: values.subjectType,
      subjectId: values.subjectType === 'ALL' ? undefined : values.subjectId,
      permissionLevel: values.permissionLevel,
      inheritFlag: values.inheritFlag,
      remark: values.remark,
    };
    setPermSubmitting(true);
    try {
      await oaDocFolderService.createPermission(selectedFolderId, payload);
      message.success('权限已添加');
      permForm.resetFields();
      permForm.setFieldsValue({ subjectType: 'ALL', permissionLevel: 'READ', inheritFlag: 1 });
      const res = await oaDocFolderService.permissions(selectedFolderId);
      setPermissions(res || []);
    } finally {
      setPermSubmitting(false);
    }
  };

  const deletePermission = async (permissionId: number) => {
    if (!selectedFolderId) return;
    await oaDocFolderService.deletePermission(permissionId);
    message.success('权限已移除');
    const res = await oaDocFolderService.permissions(selectedFolderId);
    setPermissions(res || []);
  };

  const columns: ColumnsType<OaDocumentItem> = [
    {
      title: '文档',
      dataIndex: 'title',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space size={6} wrap>
            <Text strong>{record.title}</Text>
            {record.docType && <Tag color="blue">{record.docType}</Tag>}
            {record.currentVersionNo ? <Tag>v{record.currentVersionNo}</Tag> : null}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.docNo || '-'}
            {record.fileName ? ` · ${record.fileName}` : ''}
            {record.fileSize ? ` · ${formatSize(record.fileSize)}` : ''}
          </Text>
        </Space>
      ),
    },
    {
      title: '目录',
      dataIndex: 'folderName',
      width: 150,
      render: (v?: string) => v || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={OA_DOC_STATUS_COLOR[record.status || 'DRAFT']}>
          {OA_DOC_STATUS_LABEL[record.status || 'DRAFT']}
        </Tag>
      ),
    },
    {
      title: '来源',
      dataIndex: 'sourceType',
      width: 100,
      render: (v?: string) => OA_DOC_SOURCE_TYPE_LABEL[v || 'MANUAL'] || v || '-',
    },
    {
      title: '属主',
      dataIndex: 'ownerName',
      width: 120,
      render: (v?: string, record?: OaDocumentItem) =>
        [v, record?.ownerDeptName].filter(Boolean).join(' / ') || '-',
    },
    {
      title: '浏览/下载',
      key: 'stat',
      width: 100,
      render: (_, record) => `${record.viewCount ?? 0} / ${record.downloadCount ?? 0}`,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      render: (v?: string, record?: OaDocumentItem) =>
        dayjs(v || record?.createdAt || undefined).isValid()
          ? dayjs(v || record?.createdAt).format(DATETIME_FORMAT)
          : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => void openDetail(record.id)}>
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => void handleDownload(record.id, record.fileName)}
          >
            下载
          </Button>
          {hasPermission('oa:doc:edit') && (
            <>
              {record.status !== 'PUBLISHED' && (
                <Button type="link" size="small" onClick={() => void handlePublish(record)}>
                  发布
                </Button>
              )}
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
                编辑
              </Button>
            </>
          )}
          {hasPermission('oa:doc:delete') && (
            <Popconfirm title="确认移入回收站？" onConfirm={() => void handleDelete(record)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const recycleColumns: ColumnsType<OaDocumentItem> = [
    {
      title: '文档',
      dataIndex: 'title',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.title}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.docNo || '-'} · {record.folderName || '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: '原状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={OA_DOC_STATUS_COLOR[record.status || 'DRAFT']}>
          {OA_DOC_STATUS_LABEL[record.status || 'DRAFT']}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Popconfirm title="确认恢复到原目录？" onConfirm={() => void handleRestore(record)}>
            <Button type="link" size="small" icon={<RollbackOutlined />}>
              恢复
            </Button>
          </Popconfirm>
          <Popconfirm title="彻底删除后不可恢复，确认？" onConfirm={() => void handlePurge(record)}>
            <Button type="link" size="small" danger>
              彻底删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const versionColumns: ColumnsType<OaDocVersionItem> = [
    {
      title: '版本',
      dataIndex: 'versionNo',
      width: 90,
      render: (v?: number, record?: OaDocVersionItem) => (
        <Space size={4}>
          <Text>v{v}</Text>
          {record?.currentFlag === 1 && <Tag color="green">当前</Tag>}
          {record?.lockFlag === 1 && <Tag color="orange">锁定</Tag>}
        </Space>
      ),
    },
    {
      title: '文件',
      dataIndex: 'fileName',
      render: (v?: string, record?: OaDocVersionItem) => (
        <Space direction="vertical" size={0}>
          <Text>{v}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {formatSize(record?.fileSize)}
          </Text>
        </Space>
      ),
    },
    {
      title: '扫描',
      dataIndex: 'scanStatus',
      width: 100,
      render: (v?: string) => (
        <Tag color={OA_DOC_SCAN_STATUS_COLOR[v || 'PENDING']}>
          {OA_DOC_SCAN_STATUS_LABEL[v || 'PENDING']}
        </Tag>
      ),
    },
    {
      title: '说明',
      dataIndex: 'revisionNote',
      render: (v?: string) => v || '-',
    },
    {
      title: '上传人',
      dataIndex: 'uploadedByName',
      width: 110,
      render: (v?: string) => v || '-',
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 210,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => void handleDownload(record.docId as number, record.fileName, record.versionId)}
          >
            下载
          </Button>
          {hasPermission('oa:doc:version') && (
            <>
              <Popconfirm title="基于该版本生成新版本？" onConfirm={() => void restoreVersion(record.versionId)}>
                <Button type="link" size="small" icon={<RollbackOutlined />}>
                  恢复
                </Button>
              </Popconfirm>
              <Button
                type="link"
                size="small"
                icon={record.lockFlag === 1 ? <UnlockOutlined /> : <LockOutlined />}
                onClick={() => void toggleLock(record)}
              >
                {record.lockFlag === 1 ? '解锁' : '锁定'}
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const permColumns: ColumnsType<OaDocFolderPermissionItem> = [
    {
      title: '授权对象',
      key: 'subject',
      render: (_, record) => (
        <Space size={6}>
          <Tag>{OA_DOC_SUBJECT_TYPE_LABEL[record.subjectType || 'ALL']}</Tag>
          <Text>{record.subjectName || (record.subjectId ? `#${record.subjectId}` : '全部')}</Text>
        </Space>
      ),
    },
    {
      title: '权限级别',
      dataIndex: 'permissionLevel',
      width: 110,
      render: (v?: string) => (
        <Tag color={OA_DOC_PERMISSION_LEVEL_COLOR[v || 'READ']}>
          {OA_DOC_PERMISSION_LEVEL_LABEL[v || 'READ']}
        </Tag>
      ),
    },
    {
      title: '继承',
      dataIndex: 'inheritFlag',
      width: 80,
      render: (v?: number) => (v === 1 ? '继承' : '不继承'),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      render: (v?: string) => v || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_, record) => (
        <Popconfirm title="确认移除该权限？" onConfirm={() => void deletePermission(record.id)}>
          <Button type="link" size="small" danger>
            移除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const accessLogColumns: ColumnsType<OaDocAccessLogItem> = [
    {
      title: '动作',
      dataIndex: 'action',
      width: 90,
      render: (v?: string) => (
        <Tag color={OA_DOC_ACCESS_ACTION_COLOR[v || 'VIEW']}>
          {OA_DOC_ACCESS_ACTION_LABEL[v || 'VIEW']}
        </Tag>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'userName',
      width: 130,
      render: (v?: string, record?: OaDocAccessLogItem) => v || (record?.userId ? `#${record.userId}` : '-'),
    },
    {
      title: '明细',
      dataIndex: 'actionDetail',
      render: (v?: string) => v || '-',
    },
    {
      title: 'IP',
      dataIndex: 'clientIp',
      width: 130,
      render: (v?: string) => v || '-',
    },
    {
      title: '时间',
      dataIndex: 'occurredAt',
      width: 170,
      render: (v?: string, record?: OaDocAccessLogItem) =>
        dayjs(v || record?.createdAt || undefined).isValid()
          ? dayjs(v || record?.createdAt).format(DATETIME_FORMAT)
          : '-',
    },
  ];

  const renderDetail = () => {
    if (!detail) return <Empty description="请选择文档" />;
    const doc = detail.doc;
    const basic = (
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="编号">{doc.docNo || '-'}</Descriptions.Item>
        <Descriptions.Item label="标题">{doc.title}</Descriptions.Item>
        <Descriptions.Item label="目录">
          {doc.folderName || '-'}
          {doc.folderId ? <Text type="secondary">（#{doc.folderId}）</Text> : null}
        </Descriptions.Item>
        <Descriptions.Item label="文档类型">{doc.docType || '-'}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={OA_DOC_STATUS_COLOR[doc.status || 'DRAFT']}>
            {OA_DOC_STATUS_LABEL[doc.status || 'DRAFT']}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="来源">
          {OA_DOC_SOURCE_TYPE_LABEL[doc.sourceType || 'MANUAL'] || doc.sourceType || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="当前版本">
          {doc.currentVersionNo ? `v${doc.currentVersionNo}` : '-'}
          {doc.fileName ? ` · ${doc.fileName}` : ''}
          {doc.fileSize ? ` · ${formatSize(doc.fileSize)}` : ''}
        </Descriptions.Item>
        <Descriptions.Item label="属主">
          {[doc.ownerName, doc.ownerDeptName].filter(Boolean).join(' / ') || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="权限">
          {doc.effectivePermission ? (
            <Tag color={OA_DOC_PERMISSION_LEVEL_COLOR[doc.effectivePermission]}>
              {OA_DOC_PERMISSION_LEVEL_LABEL[doc.effectivePermission]}
            </Tag>
          ) : (
            '-'
          )}
          {detail.downloadAllowed === false && <Tag color="red">禁止下载</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="摘要">{doc.summary || '-'}</Descriptions.Item>
        <Descriptions.Item label="关键词">{doc.keywords || '-'}</Descriptions.Item>
        <Descriptions.Item label="标签">{doc.tags || '-'}</Descriptions.Item>
        <Descriptions.Item label="浏览 / 下载">
          {`${doc.viewCount ?? 0} / ${doc.downloadCount ?? 0}`}
        </Descriptions.Item>
        <Descriptions.Item label="备注">{doc.remark || '-'}</Descriptions.Item>
      </Descriptions>
    );

    const versions = (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {hasPermission('oa:doc:version') && (
          <Space wrap>
            <Upload
              maxCount={1}
              fileList={versionFile ? [{ uid: '-1', name: versionFile.name, status: 'done' as const }] : []}
              beforeUpload={(file) => {
                setVersionFile(file);
                return false;
              }}
              onRemove={() => setVersionFile(undefined)}
            >
              <Button icon={<UploadOutlined />}>选择新版本文件</Button>
            </Upload>
            <Input
              placeholder="版本说明"
              style={{ width: 220 }}
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
            />
            <Button type="primary" onClick={() => void submitVersion()}>
              上传新版本
            </Button>
          </Space>
        )}
        <Table<OaDocVersionItem>
          rowKey="versionId"
          size="small"
          columns={versionColumns}
          dataSource={detail.versions || []}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Space>
    );

    const comments = (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {hasPermission('oa:doc:comment') && (
          <Form form={commentForm} layout="vertical">
            <Form.Item name="content" label="发表评论" rules={[{ required: true, message: '请输入评论内容' }]}>
              <Input.TextArea rows={3} placeholder="请输入评论内容，可 @ 提醒相关同事" />
            </Form.Item>
            <Form.Item name="mentionUserIds" label="@ 提醒">
              <UserMultiSelect placeholder="选择需要提醒的同事" style={{ width: '100%' }} />
            </Form.Item>
            <Button type="primary" onClick={() => void submitComment()}>
              发布评论
            </Button>
          </Form>
        )}
        <List<OaDocCommentItem>
          dataSource={detail.comments || []}
          locale={{ emptyText: '暂无评论' }}
          renderItem={(item) => (
            <List.Item
              actions={
                hasPermission('oa:doc:comment')
                  ? [
                      <Popconfirm key="del" title="确认删除该评论？" onConfirm={() => void deleteComment(item.id)}>
                        <Button type="link" size="small" danger>
                          删除
                        </Button>
                      </Popconfirm>,
                    ]
                  : undefined
              }
            >
              <List.Item.Meta
                title={
                  <Space size={8}>
                    <Text strong>{item.authorName || '未知用户'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.createdAt ? dayjs(item.createdAt).format(DATETIME_FORMAT) : ''}
                    </Text>
                  </Space>
                }
                description={<Paragraph style={{ marginBottom: 0 }}>{item.content}</Paragraph>}
              />
            </List.Item>
          )}
        />
      </Space>
    );

    const shares = (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {hasPermission('oa:doc:share') && (
          <Button type="primary" icon={<ShareAltOutlined />} onClick={openShareModal}>
            新建分享
          </Button>
        )}
        <Table<OaDocShareItem>
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={detail.shares || []}
          scroll={{ x: 700 }}
          columns={[
            {
              title: '方式',
              dataIndex: 'shareType',
              width: 100,
              render: (v?: string) => (
                <Tag color={OA_DOC_SHARE_TYPE_COLOR[v || 'INTERNAL']}>
                  {OA_DOC_SHARE_TYPE_LABEL[v || 'INTERNAL']}
                </Tag>
              ),
            },
            {
              title: '对象',
              key: 'target',
              render: (_, record) => record.targetUserName || record.targetDeptName || '—',
            },
            {
              title: '权限',
              dataIndex: 'permissionLevel',
              width: 90,
              render: (v?: string) => OA_DOC_PERMISSION_LEVEL_LABEL[v || 'READ'],
            },
            {
              title: '下载',
              dataIndex: 'downloadAllowed',
              width: 70,
              render: (v?: number) => (v === 1 ? '允许' : '禁止'),
            },
            {
              title: '有效期至',
              dataIndex: 'expireAt',
              width: 170,
              render: (v?: string, record?: OaDocShareItem) =>
                record?.expired ? (
                  <Tag color="orange">已过期</Tag>
                ) : v ? (
                  dayjs(v).format(DATETIME_FORMAT)
                ) : (
                  '不限'
                ),
            },
            {
              title: '状态',
              dataIndex: 'revokedFlag',
              width: 90,
              render: (v?: number) =>
                v === 1 ? <Tag color="red">已撤销</Tag> : <Tag color="green">生效中</Tag>,
            },
            {
              title: '操作',
              key: 'action',
              width: 90,
              render: (_, record) =>
                record.revokedFlag === 1 || !hasPermission('oa:doc:share') ? (
                  '-'
                ) : (
                  <Popconfirm title="确认撤销该分享？" onConfirm={() => void revokeShare(record.id)}>
                    <Button type="link" size="small" danger>
                      撤销
                    </Button>
                  </Popconfirm>
                ),
            },
          ]}
        />
      </Space>
    );

    const audit = (
      <Table<OaDocAccessLogItem>
        rowKey="id"
        size="small"
        pagination={false}
        columns={accessLogColumns}
        dataSource={accessLogs}
        scroll={{ x: 700 }}
        locale={{ emptyText: '暂无访问记录' }}
      />
    );

    return (
      <Tabs
        items={[
          { key: 'basic', label: '基本信息', children: basic },
          {
            key: 'versions',
            label: (
              <Space size={4}>
                <HistoryOutlined />
                版本（{(detail.versions || []).length}）
              </Space>
            ),
            children: versions,
          },
          {
            key: 'comments',
            label: (
              <Space size={4}>
                <CommentOutlined />
                评论（{(detail.comments || []).length}）
              </Space>
            ),
            children: comments,
          },
          {
            key: 'shares',
            label: (
              <Space size={4}>
                <ShareAltOutlined />
                分享（{(detail.shares || []).length}）
              </Space>
            ),
            children: shares,
          },
          { key: 'audit', label: '访问记录', children: audit },
        ]}
      />
    );
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space align="center">
        <Title level={4} style={{ margin: 0 }}>
          企业文档中心
        </Title>
        <Text type="secondary">目录 · 版本 · 权限 · 评论 · 分享 · 归档 · 检索</Text>
      </Space>

      <Row gutter={16}>
        <Col span={6}>
          <Card
            size="small"
            title={
              <Space size={6}>
                <FolderOpenOutlined />
                目录
              </Space>
            }
            extra={
              hasPermission('oa:doc:folder') && (
                <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => openFolderModal(selectedFolderId)}>
                  新建
                </Button>
              )
            }
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Select
                allowClear
                placeholder="目录类型"
                style={{ width: '100%' }}
                value={folderType}
                onChange={changeFolderType}
                options={OA_DOC_FOLDER_TYPE_OPTIONS}
              />
              {treeData.length > 0 ? (
                <Tree
                  treeData={treeData}
                  defaultExpandAll
                  selectedKeys={selectedFolderId ? [selectedFolderId] : []}
                  onSelect={(keys) => selectFolder(keys.length ? Number(keys[0]) : undefined)}
                />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无目录" />
              )}
              <Button block size="small" icon={<SettingOutlined />} onClick={() => void openPermDrawer()}>
                目录权限
              </Button>
            </Space>
          </Card>
        </Col>

        <Col span={18}>
          <Card>
            <Tabs
              activeKey={tab}
              onChange={(key) => {
                setTab(key as 'documents' | 'recycle');
                if (key === 'recycle') {
                  void loadRecycle(1, recyclePageSize);
                }
              }}
              items={[
                { key: 'documents', label: '文档列表' },
                { key: 'recycle', label: '回收站' },
              ]}
            />

            {tab === 'documents' ? (
              <>
                <Form form={searchForm} layout="inline" onFinish={onSearch}>
                  <Form.Item name="keyword" label="关键词">
                    <Input placeholder="标题 / 关键词 / 编号" allowClear style={{ width: 180 }} />
                  </Form.Item>
                  <Form.Item name="docType" label="文档类型">
                    <Input placeholder="如 ISO / LESSON" allowClear style={{ width: 140 }} />
                  </Form.Item>
                  <Form.Item name="status" label="状态">
                    <Select placeholder="不限" allowClear style={{ width: 110 }} options={OA_DOC_STATUS_OPTIONS} />
                  </Form.Item>
                  <Form.Item name="tag" label="标签">
                    <Input placeholder="标签" allowClear style={{ width: 120 }} />
                  </Form.Item>
                  <Form.Item>
                    <Space wrap>
                      <Button type="primary" htmlType="submit">
                        查询
                      </Button>
                      <Button icon={<ReloadOutlined />} onClick={onResetSearch}>
                        重置
                      </Button>
                      {hasPermission('oa:doc:upload') && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={openUpload}>
                          上传文档
                        </Button>
                      )}
                    </Space>
                  </Form.Item>
                </Form>

                <Divider style={{ margin: '16px 0' }} />

                <Table<OaDocumentItem>
                  rowKey="id"
                  loading={loading}
                  columns={columns}
                  dataSource={data}
                  scroll={{ x: 1100 }}
                  pagination={{
                    current: pageNum,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    showTotal: (t) => `共 ${t} 条`,
                    onChange: (page, size) => {
                      setPageNum(page);
                      setPageSize(size);
                      void loadData(page, size, search, selectedFolderId);
                    },
                  }}
                />
              </>
            ) : (
              <Table<OaDocumentItem>
                rowKey="id"
                loading={recycleLoading}
                columns={recycleColumns}
                dataSource={recycleData}
                scroll={{ x: 700 }}
                pagination={{
                  current: recyclePageNum,
                  pageSize: recyclePageSize,
                  total: recycleTotal,
                  showSizeChanger: true,
                  showTotal: (t) => `共 ${t} 条`,
                  onChange: (page, size) => {
                    setRecyclePageNum(page);
                    setRecyclePageSize(size);
                    void loadRecycle(page, size);
                  },
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="上传文档"
        open={uploadOpen}
        onCancel={() => setUploadOpen(false)}
        onOk={() => void submitUpload()}
        confirmLoading={uploading}
        width={640}
        destroyOnClose
      >
        <Form form={docForm} layout="vertical" preserve={false}>
          <Form.Item name="folderId" label="所属目录" rules={[{ required: true, message: '请选择所属目录' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="请选择目录"
              options={folderOptions}
            />
          </Form.Item>
          <Form.Item name="title" label="文档标题" rules={[{ required: true, message: '请输入文档标题' }]}>
            <Input placeholder="请输入文档标题" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="docType" label="文档类型">
                <Input placeholder="如 ISO / LESSON / 图纸" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="初始状态">
                <Select options={OA_DOC_STATUS_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="keywords" label="关键词">
                <Input placeholder="多个用逗号分隔" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tags" label="标签">
                <Input placeholder="多个用逗号分隔" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="summary" label="摘要">
            <Input.TextArea rows={2} placeholder="请输入摘要" />
          </Form.Item>
          <Form.Item name="revisionNote" label="版本说明">
            <Input placeholder="如：初始版本" />
          </Form.Item>
          <Form.Item label="文件" required>
            <Upload
              maxCount={1}
              fileList={uploadFile ? [{ uid: '-1', name: uploadFile.name, status: 'done' as const }] : []}
              beforeUpload={(file) => {
                setUploadFile(file);
                return false;
              }}
              onRemove={() => setUploadFile(undefined)}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑文档信息"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={() => void submitEdit()}
        confirmLoading={saving}
        width={640}
        destroyOnClose
      >
        <Form form={docForm} layout="vertical" preserve={false}>
          <Form.Item name="title" label="文档标题" rules={[{ required: true, message: '请输入文档标题' }]}>
            <Input placeholder="请输入文档标题" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="folderId" label="所属目录" rules={[{ required: true, message: '请选择所属目录' }]}>
                <Select showSearch optionFilterProp="label" options={folderOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Select options={OA_DOC_STATUS_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="docType" label="文档类型">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="keywords" label="关键词">
                <Input placeholder="多个用逗号分隔" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="tags" label="标签">
            <Input placeholder="多个用逗号分隔" />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新建目录"
        open={folderModalOpen}
        onCancel={() => setFolderModalOpen(false)}
        onOk={() => void submitFolder()}
        confirmLoading={folderSubmitting}
        destroyOnClose
      >
        <Form form={folderForm} layout="vertical" preserve={false}>
          <Form.Item name="parentId" label="上级目录">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="留空表示根目录"
              options={folderOptions}
              disabled={parentFolderId !== undefined}
            />
          </Form.Item>
          <Form.Item name="folderCode" label="目录编码" rules={[{ required: true, message: '请输入目录编码' }]}>
            <Input placeholder="如 PROJECT-2026" />
          </Form.Item>
          <Form.Item name="folderName" label="目录名称" rules={[{ required: true, message: '请输入目录名称' }]}>
            <Input placeholder="如 2026 年项目文档" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="folderType" label="目录类型">
                <Select options={OA_DOC_FOLDER_TYPE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sortNo" label="排序号">
                <InputNumber style={{ width: '100%' }} placeholder="数值越小越靠前" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="目录权限"
        open={permOpen}
        width={720}
        onClose={() => setPermOpen(false)}
        extra={<Text type="secondary">目录 #{selectedFolderId}</Text>}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Form form={permForm} layout="inline">
            <Form.Item name="subjectType" label="授权对象" rules={[{ required: true }]}>
              <Select style={{ width: 130 }} options={OA_DOC_SUBJECT_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.subjectType !== cur.subjectType}>
              {({ getFieldValue }) =>
                getFieldValue('subjectType') === 'USER' ? (
                  <Form.Item name="subjectId" label="用户" rules={[{ required: true, message: '请选择用户' }]}>
                    <UserSelect style={{ width: 200 }} />
                  </Form.Item>
                ) : getFieldValue('subjectType') === 'ALL' ? null : (
                  <Form.Item name="subjectId" label="ID" rules={[{ required: true, message: '请输入 ID' }]}>
                    <InputNumber style={{ width: 140 }} placeholder="部门/角色 ID" />
                  </Form.Item>
                )
              }
            </Form.Item>
            <Form.Item name="permissionLevel" label="权限" rules={[{ required: true }]}>
              <Select style={{ width: 110 }} options={OA_DOC_PERMISSION_LEVEL_OPTIONS} />
            </Form.Item>
            <Form.Item name="inheritFlag" label="继承">
              <Select
                style={{ width: 100 }}
                options={[
                  { value: 1, label: '继承' },
                  { value: 0, label: '不继承' },
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" loading={permSubmitting} onClick={() => void submitPermission()}>
                添加
              </Button>
            </Form.Item>
          </Form>
          <Table<OaDocFolderPermissionItem>
            rowKey="id"
            size="small"
            columns={permColumns}
            dataSource={permissions}
            pagination={false}
            locale={{ emptyText: '暂无目录权限配置' }}
          />
        </Space>
      </Drawer>

      <Drawer
        title={detail?.doc.title || '文档详情'}
        open={detailOpen}
        width={900}
        loading={detailLoading}
        onClose={() => {
          setDetailOpen(false);
          setDetail(null);
          setAccessLogs([]);
        }}
        extra={
          detail && (
            <Space>
              <Button
                size="small"
                icon={<DownloadOutlined />}
                disabled={detail.downloadAllowed === false}
                onClick={() => void handleDownload(detail.doc.id, detail.doc.fileName)}
              >
                下载
              </Button>
              {hasPermission('oa:doc:edit') && (
                <>
                  {detail.doc.status !== 'PUBLISHED' && (
                    <Button size="small" onClick={() => void handlePublish(detail.doc)}>
                      发布
                    </Button>
                  )}
                  {detail.doc.status !== 'ARCHIVED' && (
                    <Button size="small" onClick={() => void handleArchive(detail.doc)}>
                      归档
                    </Button>
                  )}
                  {detail.doc.status !== 'VOID' && (
                    <Button size="small" danger onClick={() => void handleVoid(detail.doc)}>
                      作废
                    </Button>
                  )}
                </>
              )}
            </Space>
          )
        }
      >
        {renderDetail()}
      </Drawer>

      <Modal
        title="新建分享"
        open={shareModalOpen}
        onCancel={() => setShareModalOpen(false)}
        onOk={() => void submitShare()}
        destroyOnClose
      >
        <Form form={shareForm} layout="vertical" preserve={false}>
          <Form.Item name="shareType" label="分享方式" rules={[{ required: true }]}>
            <Select options={OA_DOC_SHARE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.shareType !== cur.shareType}>
            {({ getFieldValue }) =>
              getFieldValue('shareType') === 'INTERNAL' ? (
                <Form.Item name="targetUserId" label="分享给" rules={[{ required: true, message: '请选择分享对象' }]}>
                  <UserSelect style={{ width: '100%' }} />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="permissionLevel" label="权限级别">
                <Select options={OA_DOC_PERMISSION_LEVEL_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="downloadAllowed" label="允许下载">
                <Select
                  options={[
                    { value: 1, label: '允许' },
                    { value: 0, label: '禁止' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="expireDays" label="有效期（天）" tooltip="留空使用系统默认，0 表示永久有效">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="留空使用系统默认" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
