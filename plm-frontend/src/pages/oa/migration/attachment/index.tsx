import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { oaMigrationAttachmentService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, flagText } from '@/pages/oa/integration/shared';
import {
  OA_MIGRATION_TRANSFER_STATUS_LABEL,
  OA_MIGRATION_TRANSFER_STATUS_OPTIONS,
  type OaMigrationAttachmentItem,
  type OaMigrationAttachmentSaveParams,
  type OaMigrationQuery,
} from '@/types/oa';

const { Title } = Typography;

const ATTACHMENT_MANAGE = 'oa:migration:attachment:manage';

interface AttachmentFormValues {
  taskNo?: string;
  batchId?: number;
  objectCode?: string;
  sourcePath?: string;
  targetPath?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  chunkTotal?: number;
  fileHash?: string;
  targetHash?: string;
  transferStatus?: string;
  retryCount?: number;
  errorMsg?: string;
  remark?: string;
}

export default function OaMigrationAttachmentPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<AttachmentFormValues>();
  const [verifyForm] = Form.useForm<{ targetHash?: string }>();
  const [data, setData] = useState<OaMigrationAttachmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [objectCode, setObjectCode] = useState('');
  const [batchId, setBatchId] = useState<number | undefined>(undefined);
  const [transferStatus, setTransferStatus] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<OaMigrationAttachmentItem | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      status = transferStatus,
      code = objectCode,
      batch = batchId,
      kw = keyword,
    ) => {
      setLoading(true);
      try {
        const params: OaMigrationQuery = {
          pageNum: page,
          pageSize: size,
          transferStatus: status,
          objectCode: code || undefined,
          batchId: batch,
          keyword: kw || undefined,
        };
        const res = await oaMigrationAttachmentService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, transferStatus, objectCode, batchId, keyword],
  );

  const loadStats = useCallback(async () => {
    const res = await oaMigrationAttachmentService.stats();
    setStats((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, undefined, '', undefined, '');
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ transferStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: OaMigrationAttachmentItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      taskNo: record.taskNo,
      batchId: record.batchId,
      objectCode: record.objectCode,
      sourcePath: record.sourcePath,
      targetPath: record.targetPath,
      fileName: record.fileName,
      fileSize: record.fileSize,
      fileType: record.fileType,
      chunkTotal: record.chunkTotal,
      fileHash: record.fileHash,
      targetHash: record.targetHash,
      transferStatus: record.transferStatus,
      retryCount: record.retryCount,
      errorMsg: record.errorMsg,
      remark: record.remark,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaMigrationAttachmentSaveParams = { ...values };
      if (editingId !== null) {
        await oaMigrationAttachmentService.update(editingId, payload);
        message.success('附件迁移任务已更新');
      } else {
        await oaMigrationAttachmentService.create(payload);
        message.success('附件迁移任务已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaMigrationAttachmentService.remove(id);
    message.success('附件迁移任务已删除');
    void loadData();
    void loadStats();
  };

  const advanceChunk = async (id: number) => {
    await oaMigrationAttachmentService.advanceChunk(id);
    message.success('已推进分片');
    void loadData();
    void loadStats();
  };

  const retry = async (id: number) => {
    await oaMigrationAttachmentService.retry(id);
    message.success('已触发重试');
    void loadData();
    void loadStats();
  };

  const openVerify = (record: OaMigrationAttachmentItem) => {
    setVerifyTarget(record);
    verifyForm.resetFields();
    verifyForm.setFieldsValue({ targetHash: record.targetHash });
    setVerifyOpen(true);
  };

  const submitVerify = async () => {
    if (!verifyTarget) return;
    const values = await verifyForm.validateFields();
    setVerifying(true);
    try {
      await oaMigrationAttachmentService.verify(verifyTarget.id, values.targetHash);
      message.success('哈希校验已完成');
      setVerifyOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setVerifying(false);
    }
  };

  const columns: ColumnsType<OaMigrationAttachmentItem> = [
    { title: '任务编号', dataIndex: 'taskNo', width: 170, fixed: 'left', render: plain },
    { title: '对象编码', dataIndex: 'objectCode', width: 130, render: plain },
    { title: '文件名', dataIndex: 'fileName', width: 200, ellipsis: true, render: plain },
    { title: '文件类型', dataIndex: 'fileType', width: 100, render: plain },
    { title: '文件大小', dataIndex: 'fileSize', width: 110, render: plain },
    {
      title: '分片进度',
      key: 'chunkProgress',
      width: 110,
      render: (_, record) => `${record.chunkDone ?? 0}/${record.chunkTotal ?? 0}`,
    },
    { title: '源哈希', dataIndex: 'fileHash', width: 160, ellipsis: true, render: plain },
    { title: '目标哈希', dataIndex: 'targetHash', width: 160, ellipsis: true, render: plain },
    { title: '哈希一致', dataIndex: 'hashMatched', width: 90, render: flagText },
    {
      title: '状态',
      dataIndex: 'transferStatus',
      width: 100,
      render: (v) => enumTag(OA_MIGRATION_TRANSFER_STATUS_LABEL, v),
    },
    { title: '重试次数', dataIndex: 'retryCount', width: 90, render: plain },
    { title: '错误信息', dataIndex: 'errorMsg', width: 200, ellipsis: true, render: plain },
    { title: '迁移时间', dataIndex: 'transferTime', width: 170, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {hasPermission(ATTACHMENT_MANAGE) && record.transferStatus !== 'SUCCESS' && (
            <Button type="link" size="small" onClick={() => void advanceChunk(record.id)}>
              续传
            </Button>
          )}
          {hasPermission(ATTACHMENT_MANAGE) && (
            <Button type="link" size="small" onClick={() => openVerify(record)}>
              校验
            </Button>
          )}
          {hasPermission(ATTACHMENT_MANAGE) && record.transferStatus !== 'SUCCESS' && (
            <Button type="link" size="small" onClick={() => void retry(record.id)}>
              重试
            </Button>
          )}
          {hasPermission(ATTACHMENT_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(ATTACHMENT_MANAGE) && (
            <Popconfirm title="确认删除该任务？" onConfirm={() => void remove(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        附件迁移任务
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="任务总数" value={Number(stats.total ?? 0)} />
          <Statistic
            title="待迁移"
            value={Number(stats.pending ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic
            title="迁移中"
            value={Number(stats.running ?? 0)}
            valueStyle={{ color: '#096dd9' }}
          />
          <Statistic
            title="成功"
            value={Number(stats.success ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
          <Statistic
            title="失败"
            value={Number(stats.failed ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic
            title="重试中"
            value={Number(stats.retrying ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic
            title="哈希不一致"
            value={Number(stats.hashMismatch ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic title="最大重试次数" value={Number(stats.maxRetry ?? 0)} />
          <Statistic title="分片大小(MB)" value={Number(stats.chunkSizeMb ?? 0)} />
          <Statistic title="哈希算法" value={String(stats.hashAlgorithm ?? '-')} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="迁移状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={transferStatus}
              onChange={(v) => setTransferStatus(v)}
              options={[...OA_MIGRATION_TRANSFER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="对象编码">
            <Input
              placeholder="请输入对象编码"
              allowClear
              style={{ width: 160 }}
              value={objectCode}
              onChange={(e) => setObjectCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="批次ID">
            <InputNumber
              placeholder="请输入批次ID"
              style={{ width: 140 }}
              value={batchId}
              onChange={(v) => setBatchId(v ?? undefined)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="任务编号 / 文件名 / 源路径"
              allowClear
              style={{ width: 240 }}
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
                  void loadData(1, pageSize, transferStatus, objectCode, batchId, keyword);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setTransferStatus(undefined);
                  setObjectCode('');
                  setBatchId(undefined);
                  setKeyword('');
                  setPageNum(1);
                  void loadData(1, pageSize, undefined, '', undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(ATTACHMENT_MANAGE) && (
                <Button onClick={openCreate}>新增任务</Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`附件迁移任务（共 ${total} 条）`}>
        <Table<OaMigrationAttachmentItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2100 }}
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
        title={editingId !== null ? '编辑附件迁移任务' : '新增附件迁移任务'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="taskNo" label="任务编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="batchId" label="批次ID">
            <InputNumber style={{ width: '100%' }} placeholder="请输入批次ID" />
          </Form.Item>
          <Form.Item name="objectCode" label="对象编码">
            <Input />
          </Form.Item>
          <Form.Item
            name="sourcePath"
            label="源路径"
            rules={[{ required: true, message: '请输入源路径' }]}
          >
            <Input placeholder="源文件路径" />
          </Form.Item>
          <Form.Item name="targetPath" label="目标路径">
            <Input placeholder="目标文件路径" />
          </Form.Item>
          <Form.Item name="fileName" label="文件名">
            <Input />
          </Form.Item>
          <Form.Item name="fileSize" label="文件大小">
            <InputNumber style={{ width: '100%' }} placeholder="字节数" />
          </Form.Item>
          <Form.Item name="fileType" label="文件类型">
            <Input placeholder="如 PDF / DOCX" />
          </Form.Item>
          <Form.Item name="chunkTotal" label="分片总数">
            <InputNumber style={{ width: '100%' }} placeholder="分片数量" />
          </Form.Item>
          <Form.Item name="fileHash" label="源哈希">
            <Input placeholder="源文件哈希值" />
          </Form.Item>
          <Form.Item name="targetHash" label="目标哈希">
            <Input placeholder="目标文件哈希值" />
          </Form.Item>
          <Form.Item name="transferStatus" label="迁移状态">
            <Select placeholder="请选择" options={[...OA_MIGRATION_TRANSFER_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="retryCount" label="重试次数">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="errorMsg" label="错误信息">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="哈希校验"
        open={verifyOpen}
        onOk={() => void submitVerify()}
        confirmLoading={verifying}
        onCancel={() => setVerifyOpen(false)}
        destroyOnClose
        width={520}
      >
        <Form form={verifyForm} layout="vertical" preserve={false}>
          <Form.Item name="targetHash" label="目标哈希">
            <Input placeholder="请输入目标文件哈希值" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
