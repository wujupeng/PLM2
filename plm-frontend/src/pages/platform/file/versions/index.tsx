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
import { fileVersionService } from '@/services/fileService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { boolTag, fileSizeText, statusTag } from '@/pages/platform/file/shared';
import {
  FILE_BOOLEAN_OPTIONS,
  FILE_VERSION_STATUS_LABEL,
  FILE_VERSION_STATUS_OPTIONS,
  type FileVersionItem,
  type FileVersionSaveParams,
  type FileVersionStats,
} from '@/types/file';

const { Title } = Typography;

const VERSION_MANAGE = 'platform:file:version:manage';

export default function FileVersionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FileVersionSaveParams>();
  const [data, setData] = useState<FileVersionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [versionStatus, setVersionStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<FileVersionStats>({});

  const loadStats = useCallback(async () => {
    const res = await fileVersionService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, vstatus = versionStatus, rg = range) => {
      setLoading(true);
      try {
        const res = await fileVersionService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          versionStatus: vstatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, versionStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ versionStatus: 'HISTORY', currentFlag: 0 });
    setOpen(true);
  };

  const openEdit = (record: FileVersionItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: FileVersionSaveParams = { ...values, fileNo: values.fileNo! };
      if (editId == null) {
        await fileVersionService.create(payload);
        message.success('版本已登记');
      } else {
        await fileVersionService.update(editId, payload);
        message.success('版本已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await fileVersionService.remove(id);
    message.success('版本已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<FileVersionItem> = [
    { title: '版本号', dataIndex: 'versionNo', width: 150, fixed: 'left', render: plain },
    { title: '文件编号', dataIndex: 'fileNo', width: 170, render: plain },
    { title: '文件名称', dataIndex: 'fileName', width: 180, render: plain },
    { title: '版本序号', dataIndex: 'seqNo', width: 100, render: plain },
    { title: '存储桶', dataIndex: 'storageBucket', width: 140, render: plain },
    { title: '对象键', dataIndex: 'objectKey', width: 200, ellipsis: true, render: plain },
    { title: '文件大小', dataIndex: 'fileSize', width: 110, render: fileSizeText },
    { title: '校验值', dataIndex: 'checksum', width: 160, ellipsis: true, render: plain },
    { title: '变更说明', dataIndex: 'changeNote', width: 200, ellipsis: true, render: plain },
    { title: '当前版本', dataIndex: 'currentFlag', width: 100, render: boolTag },
    { title: '上传人', dataIndex: 'uploadBy', width: 100, render: plain },
    { title: '上传时间', dataIndex: 'uploadTime', width: 160, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    {
      title: '版本状态',
      dataIndex: 'versionStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(FILE_VERSION_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(VERSION_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认将该版本置为当前版本？"
              onConfirm={() => void act(fileVersionService.setCurrent, record.id, '已置为当前版本')}
            >
              <Button type="link" size="small">
                设为当前
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该版本？" onConfirm={() => void remove(record.id)}>
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
        文件版本
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="版本总数" value={Number(stats.total ?? 0)} />
          <Statistic title="当前版本" value={Number(stats.current ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="历史版本" value={Number(stats.history ?? 0)} />
          <Statistic title="文件大小合计" value={fileSizeText(stats.totalSize ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="版本状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={versionStatus}
              onChange={(v) => setVersionStatus(v)}
              options={[...FILE_VERSION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="上传日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="版本号 / 文件编号 / 名称 / 上传人"
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
                  void loadData(1, pageSize, keyword, versionStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setVersionStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(VERSION_MANAGE) && <Button onClick={openCreate}>新建版本</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`文件版本（共 ${total} 条）`}>
        <Table<FileVersionItem>
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
        title={editId == null ? '新建版本' : '编辑版本'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="versionNo" label="版本号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="fileNo" label="文件编号" rules={[{ required: true, message: '请输入文件编号' }]}>
            <Input placeholder="请输入文件编号" />
          </Form.Item>
          <Form.Item name="fileName" label="文件名称">
            <Input placeholder="请输入文件名称" />
          </Form.Item>
          <Form.Item name="seqNo" label="版本序号">
            <InputNumber min={0} style={{ width: '100%' }} />
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
          <Form.Item name="checksum" label="校验值">
            <Input placeholder="请输入校验值" />
          </Form.Item>
          <Form.Item name="changeNote" label="变更说明">
            <Input.TextArea rows={2} placeholder="请输入变更说明" />
          </Form.Item>
          <Form.Item name="currentFlag" label="当前版本">
            <Select placeholder="请选择" options={[...FILE_BOOLEAN_OPTIONS]} />
          </Form.Item>
          <Form.Item name="uploadBy" label="上传人">
            <Input placeholder="请输入上传人" />
          </Form.Item>
          <Form.Item name="uploadTime" label="上传时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss，留空取当前时间" />
          </Form.Item>
          <Form.Item name="versionStatus" label="版本状态">
            <Select placeholder="请选择" options={[...FILE_VERSION_STATUS_OPTIONS]} />
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
