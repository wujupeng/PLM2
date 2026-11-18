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
import { orgWarehouseService } from '@/services/orgService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/org/shared';
import {
  ORG_WAREHOUSE_STATUS_LABEL,
  ORG_WAREHOUSE_STATUS_OPTIONS,
  ORG_WAREHOUSE_TYPE_LABEL,
  ORG_WAREHOUSE_TYPE_OPTIONS,
  type OrgWarehouseItem,
  type OrgWarehouseSaveParams,
  type OrgWarehouseStats,
} from '@/types/org';

const { Title } = Typography;

const WAREHOUSE_MANAGE = 'platform:org:warehouse:manage';

export default function OrgWarehousePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OrgWarehouseSaveParams>();
  const [data, setData] = useState<OrgWarehouseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [factoryCode, setFactoryCode] = useState('');
  const [warehouseType, setWarehouseType] = useState<string | undefined>(undefined);
  const [warehouseStatus, setWarehouseStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<OrgWarehouseStats>({});

  const loadStats = useCallback(async () => {
    const res = await orgWarehouseService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      fcode = factoryCode,
      wtype = warehouseType,
      wstatus = warehouseStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await orgWarehouseService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          factoryCode: fcode || undefined,
          warehouseType: wtype,
          warehouseStatus: wstatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, factoryCode, warehouseType, warehouseStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ warehouseType: 'RAW', warehouseStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: OrgWarehouseItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OrgWarehouseSaveParams = { ...values, warehouseName: values.warehouseName! };
      if (editId == null) {
        await orgWarehouseService.create(payload);
        message.success('仓库已创建');
      } else {
        await orgWarehouseService.update(editId, payload);
        message.success('仓库已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await orgWarehouseService.remove(id);
    message.success('仓库已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OrgWarehouseItem> = [
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 160, fixed: 'left', render: plain },
    { title: '仓库名称', dataIndex: 'warehouseName', width: 200, render: plain },
    { title: '工厂编码', dataIndex: 'factoryCode', width: 150, render: plain },
    {
      title: '仓库类型',
      dataIndex: 'warehouseType',
      width: 120,
      render: (v) => enumText(ORG_WAREHOUSE_TYPE_LABEL, v),
    },
    { title: '库位', dataIndex: 'location', width: 150, render: plain },
    { title: '容量', dataIndex: 'capacity', width: 110, render: plain },
    { title: '负责人', dataIndex: 'manager', width: 120, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'warehouseStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ORG_WAREHOUSE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(WAREHOUSE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该仓库？"
              onConfirm={() => void act(orgWarehouseService.enable, record.id, '仓库已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该仓库？"
              onConfirm={() => void act(orgWarehouseService.disable, record.id, '仓库已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该仓库？" onConfirm={() => void remove(record.id)}>
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
        仓库管理
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="仓库总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="停用" value={Number(stats.disabled ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="工厂编码">
            <Input
              placeholder="请输入工厂编码"
              allowClear
              style={{ width: 160 }}
              value={factoryCode}
              onChange={(e) => setFactoryCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="仓库类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={warehouseType}
              onChange={(v) => setWarehouseType(v)}
              options={[...ORG_WAREHOUSE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={warehouseStatus}
              onChange={(v) => setWarehouseStatus(v)}
              options={[...ORG_WAREHOUSE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="仓库编码 / 名称"
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
                  void loadData(1, pageSize, keyword, factoryCode, warehouseType, warehouseStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setFactoryCode('');
                  setWarehouseType(undefined);
                  setWarehouseStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(WAREHOUSE_MANAGE) && <Button onClick={openCreate}>新建仓库</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`仓库管理（共 ${total} 条）`}>
        <Table<OrgWarehouseItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2000 }}
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
        title={editId == null ? '新建仓库' : '编辑仓库'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="warehouseName"
            label="仓库名称"
            rules={[{ required: true, message: '请输入仓库名称' }]}
          >
            <Input placeholder="请输入仓库名称" />
          </Form.Item>
          <Form.Item name="factoryCode" label="工厂编码">
            <Input placeholder="请输入工厂编码" />
          </Form.Item>
          <Form.Item name="warehouseType" label="仓库类型">
            <Select placeholder="请选择" options={[...ORG_WAREHOUSE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="location" label="库位">
            <Input placeholder="请输入库位" />
          </Form.Item>
          <Form.Item name="capacity" label="容量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入容量" />
          </Form.Item>
          <Form.Item name="manager" label="负责人">
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item name="warehouseStatus" label="状态">
            <Select placeholder="请选择" options={[...ORG_WAREHOUSE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
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
