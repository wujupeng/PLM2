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
import { mesEquipmentCheckService as service } from '@/services/mesEquipmentService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_EQUIPMENT_CHECK_RESULT_LABEL,
  MES_EQUIPMENT_CHECK_RESULT_OPTIONS,
  MES_EQUIPMENT_CHECK_STATUS_LABEL,
  MES_EQUIPMENT_CHECK_STATUS_OPTIONS,
  MES_EQUIPMENT_CHECK_TYPE_LABEL,
  MES_EQUIPMENT_CHECK_TYPE_OPTIONS,
  type MesEquipmentCheck,
  type MesEquipmentCheckQuery,
  type MesEquipmentCheckSaveRequest,
} from '@/types/mesEquipment';

const { Title } = Typography;

const MANAGE = 'mes:equipment:check:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesEquipmentCheckSaveRequest, 'checkTime'> & {
  checkTime?: Dayjs;
};

export default function MesEquipmentCheckPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesEquipmentCheck[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [checkStatus, setCheckStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = checkStatus) => {
      setLoading(true);
      try {
        const params: MesEquipmentCheckQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          checkStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, checkStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ checkType: 'DAILY', checkResult: 'PASS', checkStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: MesEquipmentCheck) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      checkTime: record.checkTime ? dayjs(record.checkTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesEquipmentCheckSaveRequest = {
        ...values,
        checkTime: values.checkTime ? values.checkTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('设备点检已创建');
      } else {
        await service.update(editId, payload);
        message.success('设备点检已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('设备点检已删除');
    void loadData();
  };

  const columns: ColumnsType<MesEquipmentCheck> = [
    { title: '点检单号', dataIndex: 'checkNo', width: 190, fixed: 'left', render: plain },
    { title: '设备编码', dataIndex: 'equipmentCode', width: 150, render: plain },
    { title: '设备名称', dataIndex: 'equipmentName', width: 170, render: plain },
    {
      title: '点检类型',
      dataIndex: 'checkType',
      width: 110,
      render: (v) => statusTag(MES_EQUIPMENT_CHECK_TYPE_LABEL, v),
    },
    { title: '点检项', dataIndex: 'checkItem', width: 180, render: plain },
    {
      title: '点检结果',
      dataIndex: 'checkResult',
      width: 110,
      render: (v) => statusTag(MES_EQUIPMENT_CHECK_RESULT_LABEL, v),
    },
    {
      title: '点检状态',
      dataIndex: 'checkStatus',
      width: 110,
      render: (v) => statusTag(MES_EQUIPMENT_CHECK_STATUS_LABEL, v),
    },
    { title: '点检人', dataIndex: 'inspector', width: 110, render: plain },
    { title: '点检时间', dataIndex: 'checkTime', width: 170, render: formatDateTime },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, fixed: 'right', render: formatDateTime },
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
            <Popconfirm title="确认删除该点检记录？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        设备点检
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="点检状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={checkStatus}
              onChange={(v) => setCheckStatus(v)}
              options={[...MES_EQUIPMENT_CHECK_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="点检单号 / 设备编码 / 设备名称 / 点检人"
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
                  void loadData(1, pageSize, keyword, checkStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setCheckStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建点检</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`设备点检（共 ${total} 条）`}>
        <Table<MesEquipmentCheck>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1800 }}
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
        title={editId == null ? '新建点检' : '编辑点检'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="checkNo" label="点检单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item
            name="equipmentCode"
            label="设备编码"
            rules={[{ required: true, message: '请输入设备编码' }]}
          >
            <Input placeholder="请输入设备编码" />
          </Form.Item>
          <Form.Item name="equipmentName" label="设备名称">
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item name="checkType" label="点检类型">
            <Select placeholder="为空默认 DAILY" options={[...MES_EQUIPMENT_CHECK_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="checkItem" label="点检项">
            <Input placeholder="请输入点检项" />
          </Form.Item>
          <Form.Item name="checkResult" label="点检结果">
            <Select placeholder="为空默认 PASS" options={[...MES_EQUIPMENT_CHECK_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="checkStatus" label="点检状态">
            <Select placeholder="为空默认 PENDING" options={[...MES_EQUIPMENT_CHECK_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="inspector" label="点检人">
            <Input placeholder="请输入点检人" />
          </Form.Item>
          <Form.Item name="checkTime" label="点检时间">
            <DatePicker showTime style={{ width: '100%' }} />
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
