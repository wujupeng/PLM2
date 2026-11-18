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
  Statistic,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { orgFactoryService } from '@/services/orgService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/org/shared';
import {
  ORG_FACTORY_STATUS_LABEL,
  ORG_FACTORY_STATUS_OPTIONS,
  ORG_FACTORY_TYPE_LABEL,
  ORG_FACTORY_TYPE_OPTIONS,
  type OrgFactoryItem,
  type OrgFactorySaveParams,
  type OrgFactoryStats,
} from '@/types/org';

const { Title } = Typography;

const FACTORY_MANAGE = 'platform:org:factory:manage';

export default function OrgFactoryPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OrgFactorySaveParams>();
  const [data, setData] = useState<OrgFactoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [legalCode, setLegalCode] = useState('');
  const [factoryType, setFactoryType] = useState<string | undefined>(undefined);
  const [factoryStatus, setFactoryStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<OrgFactoryStats>({});

  const loadStats = useCallback(async () => {
    const res = await orgFactoryService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      lcode = legalCode,
      ftype = factoryType,
      fstatus = factoryStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await orgFactoryService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          legalCode: lcode || undefined,
          factoryType: ftype,
          factoryStatus: fstatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, legalCode, factoryType, factoryStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ factoryType: 'MANUFACTURE', factoryStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: OrgFactoryItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OrgFactorySaveParams = { ...values, factoryName: values.factoryName! };
      if (editId == null) {
        await orgFactoryService.create(payload);
        message.success('工厂已创建');
      } else {
        await orgFactoryService.update(editId, payload);
        message.success('工厂已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await orgFactoryService.remove(id);
    message.success('工厂已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OrgFactoryItem> = [
    { title: '工厂编码', dataIndex: 'factoryCode', width: 160, fixed: 'left', render: plain },
    { title: '工厂名称', dataIndex: 'factoryName', width: 200, render: plain },
    { title: '法人编码', dataIndex: 'legalCode', width: 150, render: plain },
    { title: '工厂类型', dataIndex: 'factoryType', width: 120, render: (v) => enumText(ORG_FACTORY_TYPE_LABEL, v) },
    { title: '国家', dataIndex: 'country', width: 110, render: plain },
    { title: '地区', dataIndex: 'region', width: 130, render: plain },
    { title: '地址', dataIndex: 'address', width: 220, ellipsis: true, render: plain },
    { title: '时区', dataIndex: 'timezone', width: 140, render: plain },
    { title: '负责人', dataIndex: 'manager', width: 120, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'factoryStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ORG_FACTORY_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(FACTORY_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该工厂？"
              onConfirm={() => void act(orgFactoryService.enable, record.id, '工厂已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该工厂？"
              onConfirm={() => void act(orgFactoryService.disable, record.id, '工厂已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该工厂？" onConfirm={() => void remove(record.id)}>
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
        工厂管理
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="工厂总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="停用" value={Number(stats.disabled ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="法人编码">
            <Input
              placeholder="请输入法人编码"
              allowClear
              style={{ width: 160 }}
              value={legalCode}
              onChange={(e) => setLegalCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="工厂类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={factoryType}
              onChange={(v) => setFactoryType(v)}
              options={[...ORG_FACTORY_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={factoryStatus}
              onChange={(v) => setFactoryStatus(v)}
              options={[...ORG_FACTORY_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="工厂编码 / 名称"
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
                  void loadData(1, pageSize, keyword, legalCode, factoryType, factoryStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setLegalCode('');
                  setFactoryType(undefined);
                  setFactoryStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(FACTORY_MANAGE) && <Button onClick={openCreate}>新建工厂</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`工厂管理（共 ${total} 条）`}>
        <Table<OrgFactoryItem>
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
        title={editId == null ? '新建工厂' : '编辑工厂'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="factoryCode" label="工厂编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="factoryName" label="工厂名称" rules={[{ required: true, message: '请输入工厂名称' }]}>
            <Input placeholder="请输入工厂名称" />
          </Form.Item>
          <Form.Item name="legalCode" label="法人编码">
            <Input placeholder="请输入法人编码" />
          </Form.Item>
          <Form.Item name="factoryType" label="工厂类型">
            <Select placeholder="请选择" options={[...ORG_FACTORY_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="country" label="国家">
            <Input placeholder="请输入国家" />
          </Form.Item>
          <Form.Item name="region" label="地区">
            <Input placeholder="请输入地区" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item name="timezone" label="时区">
            <Input placeholder="如 Asia/Shanghai" />
          </Form.Item>
          <Form.Item name="manager" label="负责人">
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item name="factoryStatus" label="状态">
            <Select placeholder="请选择" options={[...ORG_FACTORY_STATUS_OPTIONS]} />
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
