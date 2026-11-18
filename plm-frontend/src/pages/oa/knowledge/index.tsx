import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Row,
  Space,
  Table,
  Tag,
  Tree,
  Typography,
  Upload,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import { DownloadOutlined, FileTextOutlined, ReadOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { oaDocFolderService, oaDocSearchService, oaDocumentService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import {
  OA_DOC_PERMISSION_LEVEL_COLOR,
  OA_DOC_PERMISSION_LEVEL_LABEL,
  OA_DOC_SCAN_STATUS_COLOR,
  OA_DOC_SCAN_STATUS_LABEL,
  OA_DOC_SOURCE_TYPE_LABEL,
  OA_DOC_STATUS_COLOR,
  OA_DOC_STATUS_LABEL,
  type OaDocDetail,
  type OaDocFolderItem,
  type OaDocSaveParams,
  type OaDocSearchItem,
  type OaDocumentItem,
} from '@/types/oa';

const { Title, Text, Paragraph } = Typography;
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

interface KnowledgeUploadValues {
  title: string;
  docType?: string;
  keywords?: string;
  summary?: string;
  remark?: string;
}

const toTreeData = (nodes: OaDocFolderItem[]): DataNode[] =>
  nodes.map((node) => ({
    key: node.id,
    title: node.folderName,
    children: node.children && node.children.length > 0 ? toTreeData(node.children) : undefined,
  }));

const formatSize = (size?: number) => {
  if (!size) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

export default function OaKnowledgePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [uploadForm] = Form.useForm<KnowledgeUploadValues>();

  const [tree, setTree] = useState<OaDocFolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>(undefined);

  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<OaDocSearchItem[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPageNum, setSearchPageNum] = useState(1);
  const [searchPageSize, setSearchPageSize] = useState(10);

  const [docs, setDocs] = useState<OaDocumentItem[]>([]);
  const [docTotal, setDocTotal] = useState(0);
  const [docLoading, setDocLoading] = useState(false);
  const [docPageNum, setDocPageNum] = useState(1);
  const [docPageSize, setDocPageSize] = useState(10);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<OaDocDetail | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  const treeData = useMemo(() => toTreeData(tree), [tree]);

  const loadTree = useCallback(async () => {
    const res = await oaDocFolderService.tree('KNOWLEDGE');
    setTree(res || []);
  }, []);

  const loadDocs = useCallback(
    async (page = docPageNum, size = docPageSize, folderId = selectedFolderId) => {
      setDocLoading(true);
      try {
        const res = await oaDocumentService.page({
          pageNum: page,
          pageSize: size,
          folderId,
          includeSub: folderId ? true : undefined,
          status: 'PUBLISHED',
        });
        setDocs(res.list || []);
        setDocTotal(res.total || 0);
      } finally {
        setDocLoading(false);
      }
    },
    [docPageNum, docPageSize, selectedFolderId],
  );

  const runSearch = useCallback(
    async (page = searchPageNum, size = searchPageSize, kw = keyword, folderId = selectedFolderId) => {
      if (!kw) {
        setSearchResults([]);
        setSearchTotal(0);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await oaDocSearchService.search({
          pageNum: page,
          pageSize: size,
          keyword: kw,
          folderId,
          includeSub: folderId ? true : undefined,
          sourceType: 'DOCUMENT',
        });
        setSearchResults(res.list || []);
        setSearchTotal(res.total || 0);
      } finally {
        setSearchLoading(false);
      }
    },
    [searchPageNum, searchPageSize, keyword, selectedFolderId],
  );

  useEffect(() => {
    void loadTree();
    void loadDocs(1, 10, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectFolder = (folderId?: number) => {
    setSelectedFolderId(folderId);
    setDocPageNum(1);
    setSearchPageNum(1);
    void loadDocs(1, docPageSize, folderId);
    if (keyword) {
      void runSearch(1, searchPageSize, keyword, folderId);
    }
  };

  const openDetail = async (docId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await oaDocumentService.detail(docId);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
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

  const submitUpload = async () => {
    const values = await uploadForm.validateFields();
    if (!uploadFile) {
      message.warning('请选择要上传的文件');
      return;
    }
    if (!selectedFolderId) {
      message.warning('请先选择知识库分类');
      return;
    }
    const payload: OaDocSaveParams = {
      title: values.title,
      folderId: selectedFolderId,
      docType: values.docType,
      status: 'PUBLISHED',
      sourceType: 'MANUAL',
      keywords: values.keywords,
      summary: values.summary,
      remark: values.remark,
    };
    setUploading(true);
    try {
      await oaDocumentService.create(payload, uploadFile);
      message.success('已上传到知识库');
      setUploadOpen(false);
      setUploadFile(undefined);
      await loadDocs(1, docPageSize, selectedFolderId);
      await oaDocSearchService.reindex();
    } finally {
      setUploading(false);
    }
  };

  const docColumns: ColumnsType<OaDocumentItem> = [
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
      title: '关键词',
      dataIndex: 'keywords',
      render: (v?: string) => v || '-',
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
      width: 160,
      render: (_, record) => (
        <Space size="small">
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
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space align="center">
        <Title level={4} style={{ margin: 0 }}>
          知识库
        </Title>
        <Text type="secondary">ISO 体系 · 经验教训库 · 客户明示要求 · 质量数据库</Text>
      </Space>

      <Row gutter={16}>
        <Col span={6}>
          <Card
            size="small"
            title={
              <Space size={6}>
                <ReadOutlined />
                知识分类
              </Space>
            }
          >
            {treeData.length > 0 ? (
              <Tree
                treeData={treeData}
                defaultExpandAll
                selectedKeys={selectedFolderId ? [selectedFolderId] : []}
                onSelect={(keys) => selectFolder(keys.length ? Number(keys[0]) : undefined)}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无知识库目录" />
            )}
          </Card>
        </Col>

        <Col span={18}>
          <Card
            title={
              <Space size={6}>
                <SearchOutlined />
                全文检索
              </Space>
            }
            extra={
              hasPermission('oa:doc:upload') && (
                <Button
                  type="primary"
                  size="small"
                  icon={<UploadOutlined />}
                  disabled={!selectedFolderId}
                  onClick={() => {
                    uploadForm.resetFields();
                    setUploadFile(undefined);
                    setUploadOpen(true);
                  }}
                >
                  上传到该分类
                </Button>
              )
            }
          >
            <Input.Search
              allowClear
              placeholder="输入关键词检索知识库文档（标题 / 关键词 / 正文），结果按权限过滤"
              enterButton="检索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={(value) => {
                setKeyword(value);
                setSearchPageNum(1);
                void runSearch(1, searchPageSize, value, selectedFolderId);
              }}
            />
            <List<OaDocSearchItem>
              style={{ marginTop: 12 }}
              loading={searchLoading}
              dataSource={searchResults}
              locale={{
                emptyText: keyword ? '未检索到符合条件且有权限的文档' : '请输入关键词开始检索',
              }}
              pagination={
                searchTotal > searchPageSize
                  ? {
                      current: searchPageNum,
                      pageSize: searchPageSize,
                      total: searchTotal,
                      size: 'small',
                      onChange: (page, size) => {
                        setSearchPageNum(page);
                        setSearchPageSize(size);
                        void runSearch(page, size, keyword, selectedFolderId);
                      },
                    }
                  : false
              }
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      size="small"
                      disabled={!item.docId}
                      onClick={() => item.docId && void openDetail(item.docId)}
                    >
                      查看
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FileTextOutlined />}
                    title={
                      <Space size={8} wrap>
                        <Text strong>{item.title}</Text>
                        {item.bizNo && <Tag>{item.bizNo}</Tag>}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0} style={{ width: '100%' }}>
                        <Text type="secondary">{item.snippet || '（无摘要片段）'}</Text>
                        {item.keywords && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            关键词：{item.keywords}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card style={{ marginTop: 16 }} title={`分类文档（共 ${docTotal} 条）`}>
            <Table<OaDocumentItem>
              rowKey="id"
              loading={docLoading}
              columns={docColumns}
              dataSource={docs}
              scroll={{ x: 900 }}
              pagination={{
                current: docPageNum,
                pageSize: docPageSize,
                total: docTotal,
                showSizeChanger: true,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (page, size) => {
                  setDocPageNum(page);
                  setDocPageSize(size);
                  void loadDocs(page, size, selectedFolderId);
                },
              }}
            />
          </Card>
        </Col>
      </Row>

      <Drawer
        title={detail?.doc.title || '文档详情'}
        open={detailOpen}
        width={720}
        loading={detailLoading}
        onClose={() => {
          setDetailOpen(false);
          setDetail(null);
        }}
        extra={
          detail && (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              disabled={detail.downloadAllowed === false}
              onClick={() => void handleDownload(detail.doc.id, detail.doc.fileName)}
            >
              下载
            </Button>
          )
        }
      >
        {detail ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="编号">{detail.doc.docNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="所属分类">{detail.doc.folderName || '-'}</Descriptions.Item>
              <Descriptions.Item label="文档类型">{detail.doc.docType || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={OA_DOC_STATUS_COLOR[detail.doc.status || 'DRAFT']}>
                  {OA_DOC_STATUS_LABEL[detail.doc.status || 'DRAFT']}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="来源">
                {OA_DOC_SOURCE_TYPE_LABEL[detail.doc.sourceType || 'MANUAL'] || detail.doc.sourceType || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="当前版本">
                {detail.doc.currentVersionNo ? `v${detail.doc.currentVersionNo}` : '-'}
                {detail.doc.fileName ? ` · ${detail.doc.fileName}` : ''}
                {detail.doc.fileSize ? ` · ${formatSize(detail.doc.fileSize)}` : ''}
              </Descriptions.Item>
              <Descriptions.Item label="权限">
                {detail.doc.effectivePermission ? (
                  <Tag color={OA_DOC_PERMISSION_LEVEL_COLOR[detail.doc.effectivePermission]}>
                    {OA_DOC_PERMISSION_LEVEL_LABEL[detail.doc.effectivePermission]}
                  </Tag>
                ) : (
                  '-'
                )}
                {detail.downloadAllowed === false && <Tag color="red">禁止下载</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="摘要">{detail.doc.summary || '-'}</Descriptions.Item>
              <Descriptions.Item label="关键词">{detail.doc.keywords || '-'}</Descriptions.Item>
              <Descriptions.Item label="标签">{detail.doc.tags || '-'}</Descriptions.Item>
            </Descriptions>
            <Card size="small" title={`版本历史（${(detail.versions || []).length}）`}>
              <List
                size="small"
                dataSource={detail.versions || []}
                locale={{ emptyText: '暂无版本记录' }}
                renderItem={(version) => (
                  <List.Item
                    actions={[
                      <Button
                        key="dl"
                        type="link"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() =>
                          void handleDownload(detail.doc.id, version.fileName, version.versionId)
                        }
                      >
                        下载
                      </Button>,
                    ]}
                  >
                    <Space size={8} wrap>
                      <Tag>v{version.versionNo}</Tag>
                      {version.currentFlag === 1 && <Tag color="green">当前</Tag>}
                      <Text>{version.fileName}</Text>
                      <Text type="secondary">{formatSize(version.fileSize)}</Text>
                      <Tag color={OA_DOC_SCAN_STATUS_COLOR[version.scanStatus || 'PENDING']}>
                        {OA_DOC_SCAN_STATUS_LABEL[version.scanStatus || 'PENDING']}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {version.createdAt ? dayjs(version.createdAt).format(DATETIME_FORMAT) : ''}
                      </Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
            {detail.doc.summary ? (
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {detail.doc.summary}
              </Paragraph>
            ) : null}
          </Space>
        ) : (
          <Empty description="请选择文档" />
        )}
      </Drawer>

      <Modal
        title="上传到知识库"
        open={uploadOpen}
        onCancel={() => setUploadOpen(false)}
        onOk={() => void submitUpload()}
        confirmLoading={uploading}
        width={600}
        destroyOnClose
      >
        <Form form={uploadForm} layout="vertical" preserve={false}>
          <Form.Item label="上传至分类">
            <Input
              disabled
              value={tree.flatMap((n) => n.children || []).find((c) => c.id === selectedFolderId)?.folderName
                || tree.find((n) => n.id === selectedFolderId)?.folderName
                || '-'}
            />
          </Form.Item>
          <Form.Item name="title" label="文档标题" rules={[{ required: true, message: '请输入文档标题' }]}>
            <Input placeholder="请输入文档标题" />
          </Form.Item>
          <Form.Item name="docType" label="文档类型">
            <Input placeholder="如 ISO / LESSON / CUSTOMER / QUALITY" />
          </Form.Item>
          <Form.Item name="keywords" label="关键词">
            <Input placeholder="多个用逗号分隔" />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <Input.TextArea rows={2} placeholder="请输入摘要" />
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
        </Form>
      </Modal>
    </Space>
  );
}
