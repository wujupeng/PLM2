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
import { mesToolLifeService as service } from '@/services/mesEquipmentService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_TOOL_LIFE_STATUS_LABEL,
  MES_TOOL_LIFE_STATUS_OPTIONS,
  type MesToolLife,
  type MesToolLifeQuery,
  type MesToolLifeSaveRequest,
} from '@/types/mesEquipment';

const { Title } = Typography;

const MANAGE = 'mes:tool:life:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesToolLifeSaveRequest, 'installDate' | 'scrappedDate'> & {
  installDate?: Dayjs;
  scrappedDate?: Dayjs;
};

export default function MesToolLifePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesToolLife[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [lifeStatus, setLifeStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = lifeStatus) => {
      setLoading(true);
      try {
        const params: MesToolLifeQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          lifeStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, lifeStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ lifeStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesToolLife) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      installDate: record.installDate ? dayjs(record.installDate) : undefined,
      scrappedDate: record.scrappedDate ? dayjs(record.scrappedDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesToolLifeSaveRequest = {
        ...values,
        installDate: values.installDate ? values.installDate.format(DATETIME_FORMAT) : undefined,
        scrappedDate: values.scrappedDate ? values.scrappedDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('工装寿命已创建');
      } else {
        await service.update(editId, payload);
        message.success('工装寿命已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('工装寿命已删除');
    void loadData();
  };

  const columns: ColumnsType<MesToolLife> = [
    { title: '工装单号', dataIndex: 'toolNo', width: 190, fixed: 'left', render: plain },
    { title: '工装编码', dataIndex: 'toolCode', width: 150, render: plain },
    { title: '工装名称', dataIndex: 'toolName', width: 170, render: plain },
    { title: '工装类型', dataIndex: 'toolType', width: 120, render: plain },
    { title: '使用设备', dataIndex: 'equipmentCode', width: 150, render: plain },
    { title: '总寿命', dataIndex: 'totalLife', width: 110, render: plain },
    { title: '已用寿命', dataIndex: 'usedLife', width: 110, render: plain },
    { title: '剩余寿命', dataIndex: 'remainingLife', width: 110, render: plain },
    { title: '寿命单位', dataIndex: 'lifeUnit', width: 100, render: plain },
    {
      title: '寿命状态',
      dataIndex: 'lifeStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_TOOL_LIFE_STATUS_LABEL, v),
    },
    { title: '安装日期', dataIndex: 'installDate', width: 170, render: formatDateTime },
    { title: '报废日期', dataIndex: 'scrappedDate', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该工装寿命记录？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        工装寿命
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="寿命状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={lifeStatus}
              onChange={(v) => setLifeStatus(v)}
              options={[...MES_TOOL_LIFE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="工装单号 / 工装编码 / 工装名称 / 工装类型"
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
                  void loadData(1, pageSize, keyword, lifeStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setLifeStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建工装寿命</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`工装寿命（共 ${total} 条）`}>
        <Table<MesToolLife>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2100 }}
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
        title={editId == null ? '新建工装寿命' : '编辑工装寿命'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="toolNo" label="工装单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item
            name="toolCode"
            label="工装编码"
            rules={[{ required: true, message: '请输入工装编码' }]}
          >
            <Input placeholder="请输入工装编码" />
          </Form.Item>
          <Form.Item name="toolName" label="工装名称">
            <Input placeholder="请输入工装名称" />
          </Form.Item>
          <Form.Item name="toolType" label="工装类型">
            <Input placeholder="请输入工装类型" />
          </Form.Item>
          <Form.Item name="equipmentCode" label="使用设备">
            <Input placeholder="请输入使用设备编码" />
          </Form.Item>
          <Form.Item name="totalLife" label="总寿命">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入总寿命" />
          </Form.Item>
          <Form.Item name="usedLife" label="已用寿命">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入已用寿命" />
          </Form.Item>
          <Form.Item name="remainingLife" label="剩余寿命">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入剩余寿命" />
          </Form.Item>
          <Form.Item name="lifeUnit" label="寿命单位">
            <Input placeholder="请输入寿命单位" />
          </Form.Item>
          <Form.Item name="lifeStatus" label="寿命状态">
            <Select placeholder="为空默认 DRAFT" options={[...MES_TOOL_LIFE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="installDate" label="安装日期">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="scrappedDate" label="报废日期">
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
