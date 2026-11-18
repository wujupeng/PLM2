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
import { orgGrantService } from '@/services/orgService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/org/shared';
import {
  ORG_GRANT_STATUS_LABEL,
  ORG_GRANT_STATUS_OPTIONS,
  ORG_GRANT_TYPE_LABEL,
  ORG_GRANT_TYPE_OPTIONS,
  ORG_SCOPE_TYPE_LABEL,
  ORG_SCOPE_TYPE_OPTIONS,
  type OrgGrantItem,
  type OrgGrantSaveParams,
  type OrgGrantStats,
} from '@/types/org';

const { Title } = Typography;

const ORG_GRANT_MANAGE = 'platform:org:orggrant:manage';

export default function OrgGrantPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OrgGrantSaveParams>();
  const [data, setData] = useState<OrgGrantItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [grantType, setGrantType] = useState<string | undefined>(undefined);
  const [grantStatus, setGrantStatus] = useState<string | undefined>(undefined);
  const [scopeType, setScopeType] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<OrgGrantStats>({});

  const loadStats = useCallback(async () => {
    const res = await orgGrantService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      gtype = grantType,
      gstatus = grantStatus,
      stype = scopeType,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await orgGrantService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          grantType: gtype,
          grantStatus: gstatus,
          scopeType: stype,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, grantType, grantStatus, scopeType, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ grantType: 'ORG', scopeType: 'ALL', grantStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: OrgGrantItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OrgGrantSaveParams = { ...values };
      if (editId == null) {
        await orgGrantService.create(payload);
        message.success('跨组织授权已创建');
      } else {
        await orgGrantService.update(editId, payload);
        message.success('跨组织授权已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await orgGrantService.remove(id);
    message.success('跨组织授权已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OrgGrantItem> = [
    { title: '授权编号', dataIndex: 'grantNo', width: 170, fixed: 'left', render: plain },
    { title: '授权类型', dataIndex: 'grantType', width: 120, render: (v) => enumText(ORG_GRANT_TYPE_LABEL, v) },
    { title: '授权方编码', dataIndex: 'grantorCode', width: 150, render: plain },
    { title: '被授权组织 ID', dataIndex: 'granteeOrgId', width: 140, render: plain },
    { title: '被授权组织', dataIndex: 'granteeName', width: 180, render: plain },
    { title: '范围类型', dataIndex: 'scopeType', width: 120, render: (v) => enumText(ORG_SCOPE_TYPE_LABEL, v) },
    { title: '范围值', dataIndex: 'scopeValue', width: 180, ellipsis: true, render: plain },
    { title: '生效时间', dataIndex: 'effectiveDate', width: 160, render: formatDateTime },
    { title: '失效时间', dataIndex: 'expireDate', width: 160, render: formatDateTime },
    { title: '授权理由', dataIndex: 'grantReason', width: 200, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'grantStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ORG_GRANT_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(ORG_GRANT_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认撤销该授权？"
              onConfirm={() => void act(orgGrantService.revoke, record.id, '授权已撤销')}
            >
              <Button type="link" size="small">
                撤销
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认将该授权标记为过期？"
              onConfirm={() => void act(orgGrantService.expire, record.id, '授权已过期')}
            >
              <Button type="link" size="small">
                过期
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该授权？" onConfirm={() => void remove(record.id)}>
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
        跨组织授权
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="授权总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="已过期" value={Number(stats.expired ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="已撤销" value={Number(stats.revoked ?? 0)} valueStyle={{ color: '#cf1322' }} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="授权类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={grantType}
              onChange={(v) => setGrantType(v)}
              options={[...ORG_GRANT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="范围类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={scopeType}
              onChange={(v) => setScopeType(v)}
              options={[...ORG_SCOPE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={grantStatus}
              onChange={(v) => setGrantStatus(v)}
              options={[...ORG_GRANT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="授权编号 / 授权方 / 被授权组织"
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
                  void loadData(1, pageSize, keyword, grantType, grantStatus, scopeType, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setGrantType(undefined);
                  setScopeType(undefined);
                  setGrantStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(ORG_GRANT_MANAGE) && <Button onClick={openCreate}>新建授权</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`跨组织授权（共 ${total} 条）`}>
        <Table<OrgGrantItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2300 }}
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
        title={editId == null ? '新建跨组织授权' : '编辑跨组织授权'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="grantNo" label="授权编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="grantType" label="授权类型">
            <Select placeholder="请选择" options={[...ORG_GRANT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="grantorCode" label="授权方编码">
            <Input placeholder="请输入授权方编码" />
          </Form.Item>
          <Form.Item name="granteeOrgId" label="被授权组织 ID">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入被授权组织 ID" />
          </Form.Item>
          <Form.Item name="granteeName" label="被授权组织">
            <Input placeholder="请输入被授权组织" />
          </Form.Item>
          <Form.Item name="scopeType" label="范围类型">
            <Select placeholder="请选择" options={[...ORG_SCOPE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="scopeValue" label="范围值">
            <Input placeholder="请输入范围值" />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="expireDate" label="失效时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="grantStatus" label="状态">
            <Select placeholder="请选择" options={[...ORG_GRANT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="grantReason" label="授权理由">
            <Input.TextArea rows={2} placeholder="请输入授权理由" />
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
