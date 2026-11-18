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
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { mesCollectRecordService as service } from '@/services/mesCollectService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_COLLECT_DATA_TYPE_LABEL,
  MES_COLLECT_DATA_TYPE_OPTIONS,
  MES_COLLECT_QUALITY_FLAG_LABEL,
  MES_COLLECT_QUALITY_FLAG_OPTIONS,
  MES_COLLECT_VALIDATE_STATUS_LABEL,
  MES_COLLECT_VALIDATE_STATUS_OPTIONS,
  type MesCollectRecord,
  type MesCollectRecordQuery,
  type MesCollectRecordSaveRequest,
} from '@/types/mesCollect';

const { Title } = Typography;

const MANAGE = 'mes:collect:record:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesCollectRecordSaveRequest, 'collectTime' | 'receiveTime'> & {
  collectTime?: Dayjs;
  receiveTime?: Dayjs;
};

export default function MesCollectRecordPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesCollectRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [validateStatus, setValidateStatus] = useState<string | undefined>(undefined);
  const [qualityFlag, setQualityFlag] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = validateStatus,
      flag = qualityFlag,
    ) => {
      setLoading(true);
      try {
        const params: MesCollectRecordQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          validateStatus: status,
          qualityFlag: flag,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, validateStatus, qualityFlag],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ qualityFlag: 'VALID', validateStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: MesCollectRecord) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      collectTime: record.collectTime ? dayjs(record.collectTime) : undefined,
      receiveTime: record.receiveTime ? dayjs(record.receiveTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesCollectRecordSaveRequest = {
        ...values,
        collectTime: values.collectTime ? values.collectTime.format(DATETIME_FORMAT) : undefined,
        receiveTime: values.receiveTime ? values.receiveTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('采集数据已创建');
      } else {
        await service.update(editId, payload);
        message.success('采集数据已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('采集数据已删除');
    void loadData();
  };

  const columns: ColumnsType<MesCollectRecord> = [
    { title: '采集数据编号', dataIndex: 'recordNo', width: 190, fixed: 'left', render: plain },
    { title: '设备编码', dataIndex: 'deviceCode', width: 150, render: plain },
    { title: '采集接口编号', dataIndex: 'interfaceNo', width: 190, render: plain },
    { title: '数据点编码', dataIndex: 'pointCode', width: 160, render: plain },
    { title: '采集值', dataIndex: 'collectValue', width: 140, render: plain },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      width: 120,
      render: (v) => statusTag(MES_COLLECT_DATA_TYPE_LABEL, v),
    },
    { title: '计量单位', dataIndex: 'uom', width: 110, render: plain },
    { title: '采集时间', dataIndex: 'collectTime', width: 170, render: formatDateTime },
    { title: '接收时间', dataIndex: 'receiveTime', width: 170, render: formatDateTime },
    {
      title: '数据质量',
      dataIndex: 'qualityFlag',
      width: 120,
      render: (v) => statusTag(MES_COLLECT_QUALITY_FLAG_LABEL, v),
    },
    {
      title: '校验状态',
      dataIndex: 'validateStatus',
      width: 120,
      render: (v) => statusTag(MES_COLLECT_VALIDATE_STATUS_LABEL, v),
    },
    { title: '校验信息', dataIndex: 'validateMessage', width: 180, render: plain },
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
            <Popconfirm title="确认删除该采集数据？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        采集数据
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="校验状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={validateStatus}
              onChange={(v) => setValidateStatus(v)}
              options={[...MES_COLLECT_VALIDATE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="数据质量">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={qualityFlag}
              onChange={(v) => setQualityFlag(v)}
              options={[...MES_COLLECT_QUALITY_FLAG_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="采集数据编号 / 设备编码 / 数据点编码 / 采集值"
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
                  void loadData(1, pageSize, keyword, validateStatus, qualityFlag);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setValidateStatus(undefined);
                  setQualityFlag(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建采集数据</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`采集数据（共 ${total} 条）`}>
        <Table<MesCollectRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2130 }}
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
        title={editId == null ? '新建采集数据' : '编辑采集数据'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="recordNo" label="采集数据编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="deviceCode" label="设备编码">
            <Input placeholder="请输入设备编码" />
          </Form.Item>
          <Form.Item name="interfaceNo" label="采集接口编号">
            <Input placeholder="请输入采集接口编号" />
          </Form.Item>
          <Form.Item name="pointCode" label="数据点编码" rules={[{ required: true, message: '请输入数据点编码' }]}>
            <Input placeholder="请输入数据点编码" />
          </Form.Item>
          <Form.Item name="collectValue" label="采集值">
            <Input placeholder="请输入采集值" />
          </Form.Item>
          <Form.Item name="dataType" label="数据类型">
            <Select placeholder="请选择数据类型" allowClear options={[...MES_COLLECT_DATA_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="uom" label="计量单位">
            <Input placeholder="请输入计量单位" />
          </Form.Item>
          <Form.Item name="collectTime" label="采集时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="receiveTime" label="接收时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="qualityFlag" label="数据质量">
            <Select placeholder="为空默认 VALID" options={[...MES_COLLECT_QUALITY_FLAG_OPTIONS]} />
          </Form.Item>
          <Form.Item name="validateStatus" label="校验状态">
            <Select placeholder="为空默认 PENDING" options={[...MES_COLLECT_VALIDATE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="validateMessage" label="校验信息">
            <Input placeholder="请输入校验信息" />
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
