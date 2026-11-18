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
import { mesTraceCodeService as service } from '@/services/mesTraceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_TRACE_CODE_TYPE_LABEL,
  MES_TRACE_CODE_TYPE_OPTIONS,
  MES_TRACE_CODE_STATUS_LABEL,
  MES_TRACE_CODE_STATUS_OPTIONS,
  MES_TRACE_OBJECT_TYPE_LABEL,
  MES_TRACE_OBJECT_TYPE_OPTIONS,
  type MesTraceCode,
  type MesTraceCodeQuery,
  type MesTraceCodeSaveRequest,
} from '@/types/mesTrace';

const { Title } = Typography;

const MANAGE = 'mes:trace:code:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesTraceCodeSaveRequest, 'printTime'> & {
  printTime?: Dayjs;
};

export default function MesTraceCodePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesTraceCode[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [codeType, setCodeType] = useState<string | undefined>(undefined);
  const [codeStatus, setCodeStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, type = codeType, status = codeStatus) => {
      setLoading(true);
      try {
        const params: MesTraceCodeQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          codeType: type,
          codeStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, codeType, codeStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ codeType: 'DATAMATRIX', codeStatus: 'INACTIVE', objectType: 'SERIAL' });
    setOpen(true);
  };

  const openEdit = (record: MesTraceCode) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      printTime: record.printTime ? dayjs(record.printTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesTraceCodeSaveRequest = {
        ...values,
        printTime: values.printTime ? values.printTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('追溯码已创建');
      } else {
        await service.update(editId, payload);
        message.success('追溯码已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('追溯码已删除');
    void loadData();
  };

  const columns: ColumnsType<MesTraceCode> = [
    { title: '追溯码编号', dataIndex: 'codeNo', width: 190, fixed: 'left', render: plain },
    {
      title: '码制',
      dataIndex: 'codeType',
      width: 130,
      render: (v) => statusTag(MES_TRACE_CODE_TYPE_LABEL, v),
    },
    { title: '追溯码内容', dataIndex: 'codeContent', width: 200, render: plain },
    {
      title: '对象类型',
      dataIndex: 'objectType',
      width: 110,
      render: (v) => statusTag(MES_TRACE_OBJECT_TYPE_LABEL, v),
    },
    { title: '对象编码', dataIndex: 'objectCode', width: 150, render: plain },
    { title: '打印时间', dataIndex: 'printTime', width: 170, render: formatDateTime },
    { title: '打印次数', dataIndex: 'printCount', width: 110, render: plain },
    {
      title: '追溯码状态',
      dataIndex: 'codeStatus',
      width: 120,
      fixed: 'right',
      render: (v) => statusTag(MES_TRACE_CODE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该追溯码？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        追溯码
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="码制">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={codeType}
              onChange={(v) => setCodeType(v)}
              options={[...MES_TRACE_CODE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="追溯码状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={codeStatus}
              onChange={(v) => setCodeStatus(v)}
              options={[...MES_TRACE_CODE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="追溯码编号 / 追溯码内容 / 对象编码"
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
                  void loadData(1, pageSize, keyword, codeType, codeStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setCodeType(undefined);
                  setCodeStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建追溯码</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`追溯码（共 ${total} 条）`}>
        <Table<MesTraceCode>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1550 }}
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
        title={editId == null ? '新建追溯码' : '编辑追溯码'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="codeNo" label="追溯码编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="codeType" label="码制">
            <Select placeholder="为空默认 DATAMATRIX" options={[...MES_TRACE_CODE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="codeStatus" label="追溯码状态">
            <Select placeholder="为空默认 INACTIVE" options={[...MES_TRACE_CODE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="codeContent" label="追溯码内容" rules={[{ required: true, message: '请输入追溯码内容' }]}>
            <Input placeholder="请输入追溯码内容" />
          </Form.Item>
          <Form.Item name="objectType" label="对象类型">
            <Select placeholder="为空默认 SERIAL" options={[...MES_TRACE_OBJECT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="objectCode" label="对象编码">
            <Input placeholder="请输入对象编码" />
          </Form.Item>
          <Form.Item name="printTime" label="打印时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="printCount" label="打印次数">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入打印次数" />
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
