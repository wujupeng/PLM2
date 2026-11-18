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
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { mdmDistributionService } from '@/services/mdmService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MDM_DIST_STATUS_LABEL,
  MDM_DIST_STATUS_OPTIONS,
  MDM_DIST_TYPE_LABEL,
  MDM_DIST_TYPE_OPTIONS,
  type MdmDistributionItem,
  type MdmDistributionSaveParams,
} from '@/types/mdm';

const { Title } = Typography;

/** 后端 LocalDateTime 仅接受 ISO-8601 格式（yyyy-MM-ddTHH:mm:ss）。 */
const DATETIME_SUBMIT_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const DATETIME_PICKER_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const MANAGE = 'platform:mdm:distribution:manage';

/** 表单值类型：日期字段使用 Dayjs，提交时格式化为 ISO 字符串。 */
type FormValues = Omit<MdmDistributionSaveParams, 'distTime' | 'ackTime'> & {
  distTime?: Dayjs;
  ackTime?: Dayjs;
};

export default function MdmDistributionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MdmDistributionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [domainCode, setDomainCode] = useState('');
  const [targetSystem, setTargetSystem] = useState('');
  const [distStatus, setDistStatus] = useState<string | undefined>(undefined);
  const [distType, setDistType] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      dCode = domainCode,
      tSystem = targetSystem,
      dStatus = distStatus,
      dType = distType,
    ) => {
      setLoading(true);
      try {
        const res = await mdmDistributionService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          domainCode: dCode || undefined,
          targetSystem: tSystem || undefined,
          distStatus: dStatus,
          distType: dType,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, domainCode, targetSystem, distStatus, distType],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ distType: 'FULL', distStatus: 'PENDING', retryCount: 0 });
    setOpen(true);
  };

  const openEdit = (record: MdmDistributionItem) => {
    setEditId(record.id);
    const values: FormValues = {
      ...record,
      distTime: record.distTime ? dayjs(record.distTime) : undefined,
      ackTime: record.ackTime ? dayjs(record.ackTime) : undefined,
    };
    form.setFieldsValue(values);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MdmDistributionSaveParams = {
        ...values,
        distTime: values.distTime ? values.distTime.format(DATETIME_SUBMIT_FORMAT) : undefined,
        ackTime: values.ackTime ? values.ackTime.format(DATETIME_SUBMIT_FORMAT) : undefined,
      };
      if (editId == null) {
        await mdmDistributionService.create(payload);
        message.success('主数据分发已创建');
      } else {
        await mdmDistributionService.update(editId, payload);
        message.success('主数据分发已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await mdmDistributionService.remove(id);
    message.success('主数据分发已删除');
    void loadData();
  };

  const columns: ColumnsType<MdmDistributionItem> = [
    { title: '分发编号', dataIndex: 'distNo', width: 160, fixed: 'left', render: plain },
    { title: '域编码', dataIndex: 'domainCode', width: 140, render: plain },
    { title: '主数据编码', dataIndex: 'masterCode', width: 150, render: plain },
    { title: '目标系统', dataIndex: 'targetSystem', width: 120, render: plain },
    { title: '分发类型', dataIndex: 'distType', width: 110, render: (v) => statusTag(MDM_DIST_TYPE_LABEL, v) },
    { title: '分发时间', dataIndex: 'distTime', width: 170, render: formatDateTime },
    { title: '回执时间', dataIndex: 'ackTime', width: 170, render: formatDateTime },
    { title: '重试次数', dataIndex: 'retryCount', width: 100, render: plain },
    { title: '分发消息', dataIndex: 'message', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '分发状态',
      dataIndex: 'distStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(MDM_DIST_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该主数据分发？" onConfirm={() => void remove(record.id)}>
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
        主数据分发
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
          <Form.Item label="目标系统">
            <Input
              placeholder="如 ERP"
              allowClear
              style={{ width: 140 }}
              value={targetSystem}
              onChange={(e) => setTargetSystem(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="分发状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={distStatus}
              onChange={(v) => setDistStatus(v)}
              options={[...MDM_DIST_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="分发类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={distType}
              onChange={(v) => setDistType(v)}
              options={[...MDM_DIST_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="分发编号 / 主数据编码"
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
                  void loadData(1, pageSize, keyword, domainCode, targetSystem, distStatus, distType);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDomainCode('');
                  setTargetSystem('');
                  setDistStatus(undefined);
                  setDistType(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建主数据分发</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`主数据分发（共 ${total} 条）`}>
        <Table<MdmDistributionItem>
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

      <Modal
        title={editId == null ? '新建主数据分发' : '编辑主数据分发'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="distNo" label="分发编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="domainCode" label="域编码" rules={[{ required: true, message: '请输入域编码' }]}>
            <Input placeholder="请输入域编码" />
          </Form.Item>
          <Form.Item name="masterCode" label="主数据编码">
            <Input placeholder="请输入主数据编码" />
          </Form.Item>
          <Form.Item name="targetSystem" label="目标系统" rules={[{ required: true, message: '请输入目标系统' }]}>
            <Input placeholder="请输入目标系统" />
          </Form.Item>
          <Form.Item name="distType" label="分发类型">
            <Select placeholder="为空默认 FULL" options={[...MDM_DIST_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="distStatus" label="分发状态">
            <Select placeholder="为空默认 PENDING" options={[...MDM_DIST_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="distTime" label="分发时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="ackTime" label="回执时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="retryCount" label="重试次数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="为空默认 0" />
          </Form.Item>
          <Form.Item name="message" label="分发消息">
            <Input.TextArea rows={2} placeholder="请输入分发消息" />
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
