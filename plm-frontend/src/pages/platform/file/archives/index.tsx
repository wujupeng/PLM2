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
import { fileArchiveService } from '@/services/fileService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/file/shared';
import {
  FILE_ARCHIVE_STATUS_LABEL,
  FILE_ARCHIVE_STATUS_OPTIONS,
  FILE_ARCHIVE_TYPE_LABEL,
  FILE_ARCHIVE_TYPE_OPTIONS,
  FILE_RESTORE_STATUS_LABEL,
  FILE_RESTORE_STATUS_OPTIONS,
  FILE_STORAGE_CLASS_LABEL,
  FILE_STORAGE_CLASS_OPTIONS,
  type FileArchiveItem,
  type FileArchiveSaveParams,
  type FileArchiveStats,
} from '@/types/file';

const { Title } = Typography;

const ARCHIVE_MANAGE = 'platform:file:archive:manage';

export default function FileArchivePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FileArchiveSaveParams>();
  const [data, setData] = useState<FileArchiveItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [archiveType, setArchiveType] = useState<string | undefined>(undefined);
  const [archiveStatus, setArchiveStatus] = useState<string | undefined>(undefined);
  const [restoreStatus, setRestoreStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<FileArchiveStats>({});

  const loadStats = useCallback(async () => {
    const res = await fileArchiveService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = archiveType,
      astatus = archiveStatus,
      rstatus = restoreStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await fileArchiveService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          archiveType: type,
          archiveStatus: astatus,
          restoreStatus: rstatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, archiveType, archiveStatus, restoreStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ archiveType: 'HOT', storageClass: 'STANDARD', archiveStatus: 'PENDING', restoreStatus: 'NONE' });
    setOpen(true);
  };

  const openEdit = (record: FileArchiveItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: FileArchiveSaveParams = { ...values, fileNo: values.fileNo! };
      if (editId == null) {
        await fileArchiveService.create(payload);
        message.success('归档记录已创建');
      } else {
        await fileArchiveService.update(editId, payload);
        message.success('归档记录已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await fileArchiveService.remove(id);
    message.success('归档记录已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<FileArchiveItem> = [
    { title: '归档编号', dataIndex: 'archiveNo', width: 170, fixed: 'left', render: plain },
    { title: '文件编号', dataIndex: 'fileNo', width: 170, render: plain },
    { title: '文件名称', dataIndex: 'fileName', width: 180, render: plain },
    { title: '归档类型', dataIndex: 'archiveType', width: 120, render: (v) => enumText(FILE_ARCHIVE_TYPE_LABEL, v) },
    { title: '存储级别', dataIndex: 'storageClass', width: 120, render: (v) => enumText(FILE_STORAGE_CLASS_LABEL, v) },
    { title: '保留年限', dataIndex: 'retentionYears', width: 100, render: plain },
    { title: '存储路径', dataIndex: 'storagePath', width: 220, ellipsis: true, render: plain },
    { title: '归档时间', dataIndex: 'archiveTime', width: 160, render: formatDateTime },
    { title: '过期时间', dataIndex: 'expireTime', width: 160, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    {
      title: '归档状态',
      dataIndex: 'archiveStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(FILE_ARCHIVE_STATUS_LABEL, v),
    },
    {
      title: '恢复状态',
      dataIndex: 'restoreStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(FILE_RESTORE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(ARCHIVE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认归档该文件？"
              onConfirm={() => void act(fileArchiveService.archive, record.id, '文件已归档')}
            >
              <Button type="link" size="small">
                归档
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认恢复该归档文件？"
              onConfirm={() => void act(fileArchiveService.restore, record.id, '恢复申请已提交')}
            >
              <Button type="link" size="small">
                恢复
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认将该归档置为过期？"
              onConfirm={() => void act(fileArchiveService.expire, record.id, '归档已置为过期')}
            >
              <Button type="link" size="small">
                过期
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该归档记录？" onConfirm={() => void remove(record.id)}>
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
        文件归档
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="归档总数" value={Number(stats.total ?? 0)} />
          <Statistic title="待归档" value={Number(stats.pending ?? 0)} />
          <Statistic title="已归档" value={Number(stats.archived ?? 0)} valueStyle={{ color: '#1677ff' }} />
          <Statistic title="恢复中" value={Number(stats.restoring ?? 0)} />
          <Statistic title="已恢复" value={Number(stats.restored ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="已过期" value={Number(stats.expired ?? 0)} valueStyle={{ color: '#cf1322' }} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="归档类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={archiveType}
              onChange={(v) => setArchiveType(v)}
              options={[...FILE_ARCHIVE_TYPE_OPTIONS]}
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
          <Form.Item label="恢复状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={restoreStatus}
              onChange={(v) => setRestoreStatus(v)}
              options={[...FILE_RESTORE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="归档日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编号 / 文件编号 / 名称 / 存储路径"
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
                  void loadData(1, pageSize, keyword, archiveType, archiveStatus, restoreStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setArchiveType(undefined);
                  setArchiveStatus(undefined);
                  setRestoreStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(ARCHIVE_MANAGE) && <Button onClick={openCreate}>新建归档</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`文件归档（共 ${total} 条）`}>
        <Table<FileArchiveItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2200 }}
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
        title={editId == null ? '新建归档' : '编辑归档'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="archiveNo" label="归档编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="fileNo" label="文件编号" rules={[{ required: true, message: '请输入文件编号' }]}>
            <Input placeholder="请输入文件编号" />
          </Form.Item>
          <Form.Item name="fileName" label="文件名称">
            <Input placeholder="请输入文件名称" />
          </Form.Item>
          <Form.Item name="archiveType" label="归档类型">
            <Select placeholder="请选择" options={[...FILE_ARCHIVE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="storageClass" label="存储级别">
            <Select placeholder="请选择" options={[...FILE_STORAGE_CLASS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="retentionYears" label="保留年限">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="storagePath" label="存储路径">
            <Input placeholder="请输入存储路径" />
          </Form.Item>
          <Form.Item name="archiveTime" label="归档时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="expireTime" label="过期时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="archiveStatus" label="归档状态">
            <Select placeholder="请选择" options={[...FILE_ARCHIVE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="restoreStatus" label="恢复状态">
            <Select placeholder="请选择" options={[...FILE_RESTORE_STATUS_OPTIONS]} />
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
