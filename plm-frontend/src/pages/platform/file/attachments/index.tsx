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
  Statistic,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { fileAttachmentService } from '@/services/fileService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { boolTag, fileSizeText, statusTag } from '@/pages/platform/file/shared';
import {
  FILE_ARCHIVE_STATUS_LABEL,
  FILE_ARCHIVE_STATUS_OPTIONS,
  FILE_BIZ_MODULE_LABEL,
  FILE_BIZ_MODULE_OPTIONS,
  FILE_BOOLEAN_OPTIONS,
  FILE_FILE_STATUS_LABEL,
  FILE_FILE_STATUS_OPTIONS,
  FILE_SCAN_STATUS_LABEL,
  FILE_SCAN_STATUS_OPTIONS,
  FILE_SECURITY_LEVEL_LABEL,
  FILE_SECURITY_LEVEL_OPTIONS,
  FILE_STORAGE_TYPE_LABEL,
  FILE_STORAGE_TYPE_OPTIONS,
  type FileAttachmentItem,
  type FileAttachmentSaveParams,
  type FileAttachmentStats,
} from '@/types/file';

const { Title } = Typography;

const ATTACHMENT_MANAGE = 'platform:file:attachment:manage';

export default function FileAttachmentPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FileAttachmentSaveParams>();
  const [data, setData] = useState<FileAttachmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [bizModule, setBizModule] = useState<string | undefined>(undefined);
  const [bizType, setBizType] = useState<string | undefined>(undefined);
  const [storageType, setStorageType] = useState<string | undefined>(undefined);
  const [securityLevel, setSecurityLevel] = useState<string | undefined>(undefined);
  const [scanStatus, setScanStatus] = useState<string | undefined>(undefined);
  const [fileStatus, setFileStatus] = useState<string | undefined>(undefined);
  const [archiveStatus, setArchiveStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<FileAttachmentStats>({});

  const loadStats = useCallback(async () => {
    const res = await fileAttachmentService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      module = bizModule,
      type = bizType,
      storage = storageType,
      security = securityLevel,
      scan = scanStatus,
      fstatus = fileStatus,
      astatus = archiveStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await fileAttachmentService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          bizModule: module,
          bizType: type || undefined,
          storageType: storage,
          securityLevel: security,
          scanStatus: scan,
          fileStatus: fstatus,
          archiveStatus: astatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, bizModule, bizType, storageType, securityLevel, scanStatus, fileStatus, archiveStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, undefined, undefined, undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetQuery = () => {
    setKeyword('');
    setBizModule(undefined);
    setBizType(undefined);
    setStorageType(undefined);
    setSecurityLevel(undefined);
    setScanStatus(undefined);
    setFileStatus(undefined);
    setArchiveStatus(undefined);
    setRange(null);
    setPageNum(1);
    void loadData(1, pageSize, '', undefined, undefined, undefined, undefined, undefined, undefined, undefined, null);
  };

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ storageType: 'OBJECT', securityLevel: 'INTERNAL', scanStatus: 'PENDING', fileStatus: 'NORMAL', previewSupported: 1 });
    setOpen(true);
  };

  const openEdit = (record: FileAttachmentItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: FileAttachmentSaveParams = { ...values, fileName: values.fileName! };
      if (editId == null) {
        await fileAttachmentService.create(payload);
        message.success('附件已登记');
      } else {
        await fileAttachmentService.update(editId, payload);
        message.success('附件已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await fileAttachmentService.remove(id);
    message.success('附件已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<FileAttachmentItem> = [
    { title: '文件编号', dataIndex: 'fileNo', width: 170, fixed: 'left', render: plain },
    { title: '文件名称', dataIndex: 'fileName', width: 180, render: plain },
    { title: '原始名称', dataIndex: 'originalName', width: 160, render: plain },
    { title: '扩展名', dataIndex: 'fileExt', width: 90, render: plain },
    { title: '业务模块', dataIndex: 'bizModule', width: 130, render: (v) => enumText(FILE_BIZ_MODULE_LABEL, v) },
    { title: '业务类型', dataIndex: 'bizType', width: 120, render: plain },
    { title: '业务单号', dataIndex: 'bizNo', width: 150, render: plain },
    { title: '存储类型', dataIndex: 'storageType', width: 110, render: (v) => enumText(FILE_STORAGE_TYPE_LABEL, v) },
    { title: '存储桶', dataIndex: 'storageBucket', width: 140, render: plain },
    { title: '对象键', dataIndex: 'objectKey', width: 200, ellipsis: true, render: plain },
    { title: '文件大小', dataIndex: 'fileSize', width: 110, render: fileSizeText },
    { title: '类型', dataIndex: 'contentType', width: 140, render: plain },
    { title: '校验值', dataIndex: 'checksum', width: 160, ellipsis: true, render: plain },
    { title: '密级', dataIndex: 'securityLevel', width: 100, render: (v) => enumText(FILE_SECURITY_LEVEL_LABEL, v) },
    {
      title: '扫描状态',
      dataIndex: 'scanStatus',
      width: 110,
      render: (v) => statusTag(FILE_SCAN_STATUS_LABEL, v),
    },
    { title: '支持预览', dataIndex: 'previewSupported', width: 100, render: boolTag },
    { title: '最新版本', dataIndex: 'latestVersionNo', width: 100, render: plain },
    { title: '上传人', dataIndex: 'uploadBy', width: 100, render: plain },
    { title: '上传时间', dataIndex: 'uploadTime', width: 160, render: formatDateTime },
    { title: '保留年限', dataIndex: 'retentionYears', width: 100, render: plain },
    {
      title: '归档状态',
      dataIndex: 'archiveStatus',
      width: 110,
      render: (v) => statusTag(FILE_ARCHIVE_STATUS_LABEL, v),
    },
    { title: '说明', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    {
      title: '文件状态',
      dataIndex: 'fileStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(FILE_FILE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(ATTACHMENT_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认隔离该文件？"
              onConfirm={() => void act(fileAttachmentService.quarantine, record.id, '文件已隔离')}
            >
              <Button type="link" size="small">
                隔离
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认放行该文件？"
              onConfirm={() => void act(fileAttachmentService.release, record.id, '文件已放行')}
            >
              <Button type="link" size="small">
                放行
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认归档该文件？"
              onConfirm={() => void act(fileAttachmentService.archive, record.id, '文件已归档')}
            >
              <Button type="link" size="small">
                归档
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该附件？" onConfirm={() => void remove(record.id)}>
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
        统一附件
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="附件总数" value={Number(stats.total ?? 0)} />
          <Statistic title="正常" value={Number(stats.normal ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="隔离" value={Number(stats.quarantined ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="已归档" value={Number(stats.archived ?? 0)} valueStyle={{ color: '#1677ff' }} />
          <Statistic title="已删除" value={Number(stats.deleted ?? 0)} />
          <Statistic title="待扫描" value={Number(stats.pendingScan ?? 0)} />
          <Statistic title="已感染" value={Number(stats.infected ?? 0)} valueStyle={{ color: '#cf1322' }} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="业务模块">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 160 }}
              value={bizModule}
              onChange={(v) => setBizModule(v)}
              options={[...FILE_BIZ_MODULE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="存储类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={storageType}
              onChange={(v) => setStorageType(v)}
              options={[...FILE_STORAGE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="密级">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 110 }}
              value={securityLevel}
              onChange={(v) => setSecurityLevel(v)}
              options={[...FILE_SECURITY_LEVEL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="扫描状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={scanStatus}
              onChange={(v) => setScanStatus(v)}
              options={[...FILE_SCAN_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="文件状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={fileStatus}
              onChange={(v) => setFileStatus(v)}
              options={[...FILE_FILE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="归档状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={archiveStatus}
              onChange={(v) => setArchiveStatus(v)}
              options={[...FILE_ARCHIVE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="业务类型">
            <Input
              placeholder="请输入业务类型"
              allowClear
              style={{ width: 150 }}
              value={bizType}
              onChange={(e) => setBizType(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编号 / 名称 / 对象键 / 上传人"
              allowClear
              style={{ width: 220 }}
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
                  void loadData(1, pageSize, keyword, bizModule, bizType, storageType, securityLevel, scanStatus, fileStatus, archiveStatus, range);
                }}
              >
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={resetQuery}>
                重置
              </Button>
              {hasPermission(ATTACHMENT_MANAGE) && <Button onClick={openCreate}>新建附件</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`统一附件（共 ${total} 条）`}>
        <Table<FileAttachmentItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 3200 }}
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
        title={editId == null ? '新建附件' : '编辑附件'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="fileNo" label="文件编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="fileName" label="文件名称" rules={[{ required: true, message: '请输入文件名称' }]}>
            <Input placeholder="请输入文件名称" />
          </Form.Item>
          <Form.Item name="originalName" label="原始名称">
            <Input placeholder="请输入原始文件名" />
          </Form.Item>
          <Form.Item name="fileExt" label="扩展名">
            <Input placeholder="如 pdf、dwg" />
          </Form.Item>
          <Form.Item name="bizModule" label="业务模块">
            <Select placeholder="请选择" allowClear options={[...FILE_BIZ_MODULE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="bizType" label="业务类型">
            <Input placeholder="请输入业务类型" />
          </Form.Item>
          <Form.Item name="bizId" label="业务主键">
            <Input placeholder="请输入业务主键" />
          </Form.Item>
          <Form.Item name="bizNo" label="业务单号">
            <Input placeholder="请输入业务单号" />
          </Form.Item>
          <Form.Item name="storageType" label="存储类型">
            <Select placeholder="请选择" options={[...FILE_STORAGE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="storageBucket" label="存储桶">
            <Input placeholder="请输入存储桶" />
          </Form.Item>
          <Form.Item name="objectKey" label="对象键">
            <Input placeholder="请输入对象键" />
          </Form.Item>
          <Form.Item name="fileSize" label="文件大小(字节)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="contentType" label="内容类型">
            <Input placeholder="如 application/pdf" />
          </Form.Item>
          <Form.Item name="checksum" label="校验值">
            <Input placeholder="请输入校验值" />
          </Form.Item>
          <Form.Item name="securityLevel" label="密级">
            <Select placeholder="请选择" options={[...FILE_SECURITY_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="scanStatus" label="扫描状态">
            <Select placeholder="请选择" options={[...FILE_SCAN_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="previewSupported" label="支持预览">
            <Select placeholder="请选择" options={[...FILE_BOOLEAN_OPTIONS]} />
          </Form.Item>
          <Form.Item name="latestVersionNo" label="最新版本号">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="uploadBy" label="上传人">
            <Input placeholder="请输入上传人" />
          </Form.Item>
          <Form.Item name="uploadTime" label="上传时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss，留空取当前时间" />
          </Form.Item>
          <Form.Item name="retentionYears" label="保留年限">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="archiveStatus" label="归档状态">
            <Select placeholder="请选择" allowClear options={[...FILE_ARCHIVE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="fileStatus" label="文件状态">
            <Select placeholder="请选择" options={[...FILE_FILE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="description" label="文件说明">
            <Input.TextArea rows={2} placeholder="请输入文件说明" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
