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
import { intgErpMesCompensationService as service } from '@/services/intgErpMesService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  INTG_ERP_MES_COMPENSATION_STATUS_LABEL,
  INTG_ERP_MES_COMPENSATION_STATUS_OPTIONS,
  INTG_ERP_MES_ERROR_TYPE_LABEL,
  INTG_ERP_MES_ERROR_TYPE_OPTIONS,
  INTG_ERP_MES_OBJECT_TYPE_LABEL,
  INTG_ERP_MES_OBJECT_TYPE_OPTIONS,
  type IntgErpMesCompensation,
  type IntgErpMesCompensationQuery,
  type IntgErpMesCompensationSaveRequest,
} from '@/types/intgErpMes';

const { Title } = Typography;

const MANAGE = 'intg:erp-mes:compensation:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<IntgErpMesCompensationSaveRequest, 'handleTime'> & {
  handleTime?: Dayjs;
};

export default function IntgErpMesCompensationPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<IntgErpMesCompensation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [objectType, setObjectType] = useState<string | undefined>(undefined);
  const [errorType, setErrorType] = useState<string | undefined>(undefined);
  const [compensationStatus, setCompensationStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = objectType,
      errType = errorType,
      status = compensationStatus,
    ) => {
      setLoading(true);
      try {
        const params: IntgErpMesCompensationQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          objectType: type,
          errorType: errType,
          compensationStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, objectType, errorType, compensationStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ objectType: 'PRODUCTION_ORDER', errorType: 'VALIDATION', compensationStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: IntgErpMesCompensation) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      handleTime: record.handleTime ? dayjs(record.handleTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: IntgErpMesCompensationSaveRequest = {
        ...values,
        handleTime: values.handleTime ? values.handleTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('异常补偿已创建');
      } else {
        await service.update(editId, payload);
        message.success('异常补偿已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('异常补偿已删除');
    void loadData();
  };

  const columns: ColumnsType<IntgErpMesCompensation> = [
    { title: '补偿编号', dataIndex: 'compensationNo', width: 190, fixed: 'left', render: plain },
    { title: '批次编号', dataIndex: 'batchNo', width: 160, render: plain },
    { title: '接口编号', dataIndex: 'interfaceNo', width: 160, render: plain },
    {
      title: '集成对象',
      dataIndex: 'objectType',
      width: 120,
      render: (v) => statusTag(INTG_ERP_MES_OBJECT_TYPE_LABEL, v),
    },
    { title: '对象编号', dataIndex: 'objectNo', width: 170, render: plain },
    {
      title: '异常类型',
      dataIndex: 'errorType',
      width: 120,
      render: (v) => statusTag(INTG_ERP_MES_ERROR_TYPE_LABEL, v),
    },
    { title: '错误信息', dataIndex: 'errorMessage', width: 260, render: plain },
    { title: '重试次数', dataIndex: 'retryCount', width: 100, render: plain },
    { title: '处理人', dataIndex: 'handler', width: 120, render: plain },
    { title: '处理时间', dataIndex: 'handleTime', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'compensationStatus',
      width: 110,
      render: (v) => statusTag(INTG_ERP_MES_COMPENSATION_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该异常补偿？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        异常补偿
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="集成对象">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={objectType}
              onChange={(v) => setObjectType(v)}
              options={[...INTG_ERP_MES_OBJECT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="异常类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={errorType}
              onChange={(v) => setErrorType(v)}
              options={[...INTG_ERP_MES_ERROR_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="补偿状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={compensationStatus}
              onChange={(v) => setCompensationStatus(v)}
              options={[...INTG_ERP_MES_COMPENSATION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="补偿编号 / 对象编号 / 错误信息"
              allowClear
              style={{ width: 380 }}
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
                  void loadData(1, pageSize, keyword, objectType, errorType, compensationStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setObjectType(undefined);
                  setErrorType(undefined);
                  setCompensationStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建异常补偿</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`异常补偿（共 ${total} 条）`}>
        <Table<IntgErpMesCompensation>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2400 }}
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
        title={editId == null ? '新建异常补偿' : '编辑异常补偿'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="compensationNo" label="补偿编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次编号">
            <Input placeholder="请输入批次编号" />
          </Form.Item>
          <Form.Item name="interfaceNo" label="接口编号">
            <Input placeholder="请输入接口编号" />
          </Form.Item>
          <Form.Item name="objectType" label="集成对象">
            <Select placeholder="为空默认 PRODUCTION_ORDER" options={[...INTG_ERP_MES_OBJECT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="objectNo" label="对象编号" rules={[{ required: true, message: '请输入对象编号' }]}>
            <Input placeholder="请输入对象编号" />
          </Form.Item>
          <Form.Item name="errorType" label="异常类型">
            <Select placeholder="为空默认 VALIDATION" options={[...INTG_ERP_MES_ERROR_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="errorMessage" label="错误信息">
            <Input.TextArea rows={2} placeholder="请输入错误信息" />
          </Form.Item>
          <Form.Item name="retryCount" label="重试次数">
            <InputNumber style={{ width: '100%' }} placeholder="请输入重试次数" />
          </Form.Item>
          <Form.Item name="handler" label="处理人">
            <Input placeholder="请输入处理人" />
          </Form.Item>
          <Form.Item name="handleTime" label="处理时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="compensationStatus" label="补偿状态">
            <Select placeholder="为空默认 PENDING" options={[...INTG_ERP_MES_COMPENSATION_STATUS_OPTIONS]} />
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
