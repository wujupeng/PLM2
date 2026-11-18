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
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { mesQuarantineService as service } from '@/services/mesQualityService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_QUARANTINE_STATUS_LABEL,
  MES_QUARANTINE_STATUS_OPTIONS,
  MES_QUARANTINE_TYPE_LABEL,
  MES_QUARANTINE_TYPE_OPTIONS,
  type MesQuarantine,
  type MesQuarantineQuery,
  type MesQuarantineSaveRequest,
} from '@/types/mesQuality';

const { Title } = Typography;

const MANAGE = 'mes:quality:quarantine:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesQuarantineSaveRequest, 'applyTime' | 'handleTime'> & {
  applyTime?: Dayjs;
  handleTime?: Dayjs;
};

export default function MesQuarantinePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesQuarantine[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [quarantineStatus, setQuarantineStatus] = useState<string | undefined>(undefined);
  const [quarantineType, setQuarantineType] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = quarantineStatus, type = quarantineType) => {
      setLoading(true);
      try {
        const params: MesQuarantineQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          quarantineStatus: status,
          quarantineType: type,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, quarantineStatus, quarantineType],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ quarantineType: 'SUSPECT', quarantineStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: MesQuarantine) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      applyTime: record.applyTime ? dayjs(record.applyTime) : undefined,
      handleTime: record.handleTime ? dayjs(record.handleTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesQuarantineSaveRequest = {
        ...values,
        applyTime: values.applyTime ? values.applyTime.format(DATETIME_FORMAT) : undefined,
        handleTime: values.handleTime ? values.handleTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('隔离记录已创建');
      } else {
        await service.update(editId, payload);
        message.success('隔离记录已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('隔离记录已删除');
    void loadData();
  };

  const columns: ColumnsType<MesQuarantine> = [
    { title: '隔离单号', dataIndex: 'quarantineNo', width: 190, fixed: 'left', render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: plain },
    { title: '隔离数量', dataIndex: 'quarantineQty', width: 110, render: plain },
    {
      title: '隔离类型',
      dataIndex: 'quarantineType',
      width: 130,
      render: (v) => statusTag(MES_QUARANTINE_TYPE_LABEL, v),
    },
    { title: '来源单号', dataIndex: 'sourceNo', width: 170, render: plain },
    { title: '隔离位置', dataIndex: 'location', width: 160, render: plain },
    { title: '隔离原因', dataIndex: 'reason', width: 200, render: plain },
    { title: '申请人', dataIndex: 'applicant', width: 110, render: plain },
    { title: '申请时间', dataIndex: 'applyTime', width: 170, render: formatDateTime },
    { title: '处理人', dataIndex: 'handler', width: 110, render: plain },
    { title: '处理时间', dataIndex: 'handleTime', width: 170, render: formatDateTime },
    {
      title: '隔离状态',
      dataIndex: 'quarantineStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_QUARANTINE_STATUS_LABEL, v),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该隔离记录？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        隔离记录
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="隔离状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={quarantineStatus}
              onChange={(v) => setQuarantineStatus(v)}
              options={[...MES_QUARANTINE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="隔离类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={quarantineType}
              onChange={(v) => setQuarantineType(v)}
              options={[...MES_QUARANTINE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="隔离单号 / 物料编码 / 物料名称 / 来源单号"
              allowClear
              style={{ width: 400 }}
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
                  void loadData(1, pageSize, keyword, quarantineStatus, quarantineType);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setQuarantineStatus(undefined);
                  setQuarantineType(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建隔离</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`隔离记录（共 ${total} 条）`}>
        <Table<MesQuarantine>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2500 }}
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
        title={editId == null ? '新建隔离' : '编辑隔离'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="quarantineNo" label="隔离单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item
            name="materialCode"
            label="物料编码"
            rules={[{ required: true, message: '请输入物料编码' }]}
          >
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="quarantineQty" label="隔离数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入隔离数量" />
          </Form.Item>
          <Form.Item name="quarantineType" label="隔离类型">
            <Select placeholder="为空默认 SUSPECT" options={[...MES_QUARANTINE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourceNo" label="来源单号">
            <Input placeholder="请输入来源单号" />
          </Form.Item>
          <Form.Item name="location" label="隔离位置">
            <Input placeholder="请输入隔离位置" />
          </Form.Item>
          <Form.Item name="reason" label="隔离原因">
            <Input.TextArea rows={2} placeholder="请输入隔离原因" />
          </Form.Item>
          <Form.Item name="applicant" label="申请人">
            <Input placeholder="请输入申请人" />
          </Form.Item>
          <Form.Item name="applyTime" label="申请时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="handler" label="处理人">
            <Input placeholder="请输入处理人" />
          </Form.Item>
          <Form.Item name="handleTime" label="处理时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="quarantineStatus" label="隔离状态">
            <Select placeholder="为空默认 PENDING" options={[...MES_QUARANTINE_STATUS_OPTIONS]} />
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
