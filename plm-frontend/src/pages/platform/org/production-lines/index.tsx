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
import { orgProductionLineService } from '@/services/orgService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/org/shared';
import {
  ORG_LINE_STATUS_LABEL,
  ORG_LINE_STATUS_OPTIONS,
  ORG_LINE_TYPE_LABEL,
  ORG_LINE_TYPE_OPTIONS,
  type OrgProductionLineItem,
  type OrgProductionLineSaveParams,
  type OrgProductionLineStats,
} from '@/types/org';

const { Title } = Typography;

const PRODUCTION_LINE_MANAGE = 'platform:org:productionline:manage';

export default function OrgProductionLinePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OrgProductionLineSaveParams>();
  const [data, setData] = useState<OrgProductionLineItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [factoryCode, setFactoryCode] = useState('');
  const [lineType, setLineType] = useState<string | undefined>(undefined);
  const [lineStatus, setLineStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<OrgProductionLineStats>({});

  const loadStats = useCallback(async () => {
    const res = await orgProductionLineService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      fcode = factoryCode,
      ltype = lineType,
      lstatus = lineStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await orgProductionLineService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          factoryCode: fcode || undefined,
          lineType: ltype,
          lineStatus: lstatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, factoryCode, lineType, lineStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ lineType: 'ASSEMBLY', lineStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: OrgProductionLineItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OrgProductionLineSaveParams = { ...values, lineName: values.lineName! };
      if (editId == null) {
        await orgProductionLineService.create(payload);
        message.success('产线已创建');
      } else {
        await orgProductionLineService.update(editId, payload);
        message.success('产线已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await orgProductionLineService.remove(id);
    message.success('产线已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OrgProductionLineItem> = [
    { title: '产线编码', dataIndex: 'lineCode', width: 160, fixed: 'left', render: plain },
    { title: '产线名称', dataIndex: 'lineName', width: 200, render: plain },
    { title: '工厂编码', dataIndex: 'factoryCode', width: 150, render: plain },
    { title: '车间', dataIndex: 'workshop', width: 150, render: plain },
    { title: '产线类型', dataIndex: 'lineType', width: 120, render: (v) => enumText(ORG_LINE_TYPE_LABEL, v) },
    { title: '小时产能', dataIndex: 'capacityPerHour', width: 120, render: plain },
    { title: '负责人', dataIndex: 'manager', width: 120, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'lineStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ORG_LINE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(PRODUCTION_LINE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该产线？"
              onConfirm={() => void act(orgProductionLineService.enable, record.id, '产线已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该产线？"
              onConfirm={() => void act(orgProductionLineService.disable, record.id, '产线已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该产线？" onConfirm={() => void remove(record.id)}>
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
        产线管理
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="产线总数" value={Number(stats.total ?? 0)} />
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
          <Form.Item label="产线类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={lineType}
              onChange={(v) => setLineType(v)}
              options={[...ORG_LINE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={lineStatus}
              onChange={(v) => setLineStatus(v)}
              options={[...ORG_LINE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="产线编码 / 名称"
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
                  void loadData(1, pageSize, keyword, factoryCode, lineType, lineStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setFactoryCode('');
                  setLineType(undefined);
                  setLineStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(PRODUCTION_LINE_MANAGE) && <Button onClick={openCreate}>新建产线</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`产线管理（共 ${total} 条）`}>
        <Table<OrgProductionLineItem>
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
        title={editId == null ? '新建产线' : '编辑产线'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="lineCode" label="产线编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="lineName" label="产线名称" rules={[{ required: true, message: '请输入产线名称' }]}>
            <Input placeholder="请输入产线名称" />
          </Form.Item>
          <Form.Item name="factoryCode" label="工厂编码">
            <Input placeholder="请输入工厂编码" />
          </Form.Item>
          <Form.Item name="workshop" label="车间">
            <Input placeholder="请输入车间" />
          </Form.Item>
          <Form.Item name="lineType" label="产线类型">
            <Select placeholder="请选择" options={[...ORG_LINE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="capacityPerHour" label="小时产能">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入小时产能" />
          </Form.Item>
          <Form.Item name="manager" label="负责人">
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item name="lineStatus" label="状态">
            <Select placeholder="请选择" options={[...ORG_LINE_STATUS_OPTIONS]} />
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
