import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { mdmSyncLogService } from '@/services/mdmService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MDM_SYNC_STATUS_LABEL,
  MDM_SYNC_STATUS_OPTIONS,
  type MdmSyncLogItem,
  type MdmSyncLogSaveParams,
} from '@/types/mdm';

const { Title } = Typography;

/** 后端 LocalDateTime 仅接受 ISO-8601 格式（yyyy-MM-ddTHH:mm:ss）。 */
const DATETIME_SUBMIT_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const DATETIME_PICKER_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const MANAGE = 'platform:mdm:synclog:manage';

/** 表单值类型：日期字段使用 Dayjs，提交时格式化为 ISO 字符串。 */
type FormValues = Omit<MdmSyncLogSaveParams, 'syncTime'> & {
  syncTime?: Dayjs;
};

export default function MdmSyncLogPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MdmSyncLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [domainCode, setDomainCode] = useState('');
  const [sourceSystem, setSourceSystem] = useState('');
  const [targetSystem, setTargetSystem] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      dCode = domainCode,
      sSystem = sourceSystem,
      tSystem = targetSystem,
      sStatus = syncStatus,
    ) => {
      setLoading(true);
      try {
        const res = await mdmSyncLogService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          domainCode: dCode || undefined,
          sourceSystem: sSystem || undefined,
          targetSystem: tSystem || undefined,
          syncStatus: sStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, domainCode, sourceSystem, targetSystem, syncStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ syncStatus: 'SUCCESS' });
    setOpen(true);
  };

  const openEdit = (record: MdmSyncLogItem) => {
    setEditId(record.id);
    const values: FormValues = {
      ...record,
      syncTime: record.syncTime ? dayjs(record.syncTime) : undefined,
    };
    form.setFieldsValue(values);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MdmSyncLogSaveParams = {
        ...values,
        syncTime: values.syncTime ? values.syncTime.format(DATETIME_SUBMIT_FORMAT) : undefined,
      };
      if (editId == null) {
        await mdmSyncLogService.create(payload);
        message.success('同步日志已创建');
      } else {
        await mdmSyncLogService.update(editId, payload);
        message.success('同步日志已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await mdmSyncLogService.remove(id);
    message.success('同步日志已删除');
    void loadData();
  };

  const columns: ColumnsType<MdmSyncLogItem> = [
    { title: '日志编号', dataIndex: 'logNo', width: 160, fixed: 'left', render: plain },
    { title: '域编码', dataIndex: 'domainCode', width: 140, render: plain },
    { title: '源系统', dataIndex: 'sourceSystem', width: 120, render: plain },
    { title: '目标系统', dataIndex: 'targetSystem', width: 120, render: plain },
    { title: '主数据编码', dataIndex: 'masterCode', width: 150, render: plain },
    { title: '同步时间', dataIndex: 'syncTime', width: 170, render: formatDateTime },
    { title: '同步信息', dataIndex: 'message', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '同步状态',
      dataIndex: 'syncStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(MDM_SYNC_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该同步日志？" onConfirm={() => void remove(record.id)}>
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
        同步日志
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="域编码">
            <Input
              placeholder="请输入域编码"
              allowClear
              style={{ width: 160 }}
              value={domainCode}
              onChange={(e) => setDomainCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="源系统">
            <Input
              placeholder="如 PLM"
              allowClear
              style={{ width: 130 }}
              value={sourceSystem}
              onChange={(e) => setSourceSystem(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="目标系统">
            <Input
              placeholder="如 ERP"
              allowClear
              style={{ width: 130 }}
              value={targetSystem}
              onChange={(e) => setTargetSystem(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="同步状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={syncStatus}
              onChange={(v) => setSyncStatus(v)}
              options={[...MDM_SYNC_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="日志编号 / 主数据编码"
              allowClear
              style={{ width: 200 }}
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
                  void loadData(1, pageSize, keyword, domainCode, sourceSystem, targetSystem, syncStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDomainCode('');
                  setSourceSystem('');
                  setTargetSystem('');
                  setSyncStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建同步日志</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`同步日志（共 ${total} 条）`}>
        <Table<MdmSyncLogItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
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
        title={editId == null ? '新建同步日志' : '编辑同步日志'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="logNo" label="日志编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="domainCode" label="域编码" rules={[{ required: true, message: '请输入域编码' }]}>
            <Input placeholder="请输入域编码" />
          </Form.Item>
          <Form.Item name="sourceSystem" label="源系统">
            <Input placeholder="请输入源系统" />
          </Form.Item>
          <Form.Item name="targetSystem" label="目标系统">
            <Input placeholder="请输入目标系统" />
          </Form.Item>
          <Form.Item name="masterCode" label="主数据编码">
            <Input placeholder="请输入主数据编码" />
          </Form.Item>
          <Form.Item name="syncStatus" label="同步状态">
            <Select placeholder="为空默认 SUCCESS" options={[...MDM_SYNC_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="syncTime" label="同步时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="message" label="同步信息">
            <Input.TextArea rows={2} placeholder="请输入同步信息" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
