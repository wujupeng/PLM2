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
import { orgLegalEntityService } from '@/services/orgService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/org/shared';
import {
  ORG_LEGAL_STATUS_LABEL,
  ORG_LEGAL_STATUS_OPTIONS,
  type OrgLegalEntityItem,
  type OrgLegalEntitySaveParams,
  type OrgLegalEntityStats,
} from '@/types/org';

const { Title } = Typography;

const LEGAL_ENTITY_MANAGE = 'platform:org:legalentity:manage';

export default function OrgLegalEntityPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OrgLegalEntitySaveParams>();
  const [data, setData] = useState<OrgLegalEntityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [legalStatus, setLegalStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<OrgLegalEntityStats>({});

  const loadStats = useCallback(async () => {
    const res = await orgLegalEntityService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, lstatus = legalStatus, rg = range) => {
      setLoading(true);
      try {
        const res = await orgLegalEntityService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          legalStatus: lstatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, legalStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ legalStatus: 'ACTIVE', baseCurrency: 'CNY' });
    setOpen(true);
  };

  const openEdit = (record: OrgLegalEntityItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OrgLegalEntitySaveParams = { ...values, legalName: values.legalName! };
      if (editId == null) {
        await orgLegalEntityService.create(payload);
        message.success('法人主体已创建');
      } else {
        await orgLegalEntityService.update(editId, payload);
        message.success('法人主体已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await orgLegalEntityService.remove(id);
    message.success('法人主体已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OrgLegalEntityItem> = [
    { title: '法人编码', dataIndex: 'legalCode', width: 160, fixed: 'left', render: plain },
    { title: '法人名称', dataIndex: 'legalName', width: 200, render: plain },
    { title: '统一社会信用代码', dataIndex: 'unifiedSocialCode', width: 200, render: plain },
    { title: '税号', dataIndex: 'taxNo', width: 160, render: plain },
    { title: '法定代表人', dataIndex: 'legalRep', width: 130, render: plain },
    { title: '本位币', dataIndex: 'baseCurrency', width: 100, render: plain },
    { title: '国家', dataIndex: 'country', width: 110, render: plain },
    { title: '地区', dataIndex: 'region', width: 130, render: plain },
    { title: '注册地址', dataIndex: 'address', width: 220, ellipsis: true, render: plain },
    { title: '联系电话', dataIndex: 'contactPhone', width: 150, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'legalStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ORG_LEGAL_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(LEGAL_ENTITY_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该法人主体？"
              onConfirm={() => void act(orgLegalEntityService.enable, record.id, '法人主体已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该法人主体？"
              onConfirm={() => void act(orgLegalEntityService.disable, record.id, '法人主体已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该法人主体？" onConfirm={() => void remove(record.id)}>
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
        法人主体
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="法人总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="停用" value={Number(stats.disabled ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={legalStatus}
              onChange={(v) => setLegalStatus(v)}
              options={[...ORG_LEGAL_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="法人编码 / 名称 / 信用代码"
              allowClear
              style={{ width: 240 }}
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
                  void loadData(1, pageSize, keyword, legalStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setLegalStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(LEGAL_ENTITY_MANAGE) && <Button onClick={openCreate}>新建法人</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`法人主体（共 ${total} 条）`}>
        <Table<OrgLegalEntityItem>
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
        title={editId == null ? '新建法人主体' : '编辑法人主体'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="legalCode" label="法人编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="legalName" label="法人名称" rules={[{ required: true, message: '请输入法人名称' }]}>
            <Input placeholder="请输入法人名称" />
          </Form.Item>
          <Form.Item name="unifiedSocialCode" label="统一社会信用代码">
            <Input placeholder="请输入统一社会信用代码" />
          </Form.Item>
          <Form.Item name="taxNo" label="税号">
            <Input placeholder="请输入税号" />
          </Form.Item>
          <Form.Item name="legalRep" label="法定代表人">
            <Input placeholder="请输入法定代表人" />
          </Form.Item>
          <Form.Item name="baseCurrency" label="本位币">
            <Input placeholder="如 CNY" />
          </Form.Item>
          <Form.Item name="country" label="国家">
            <Input placeholder="请输入国家" />
          </Form.Item>
          <Form.Item name="region" label="地区">
            <Input placeholder="请输入地区" />
          </Form.Item>
          <Form.Item name="address" label="注册地址">
            <Input placeholder="请输入注册地址" />
          </Form.Item>
          <Form.Item name="contactPhone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="legalStatus" label="状态">
            <Select placeholder="请选择" options={[...ORG_LEGAL_STATUS_OPTIONS]} />
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
