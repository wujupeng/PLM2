import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
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
import { oaEntrySwitchService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText, flagText } from '@/pages/oa/integration/shared';
import {
  OA_GOLIVE_ENTRY_STATUS_LABEL,
  OA_GOLIVE_ENTRY_STATUS_OPTIONS,
  OA_GOLIVE_ENTRY_TYPE_LABEL,
  OA_GOLIVE_ENTRY_TYPE_OPTIONS,
  type OaEntrySwitchItem,
  type OaEntrySwitchSaveParams,
  type OaGoliveQuery,
} from '@/types/oa';

const { Title } = Typography;

const ENTRY_MANAGE = 'oa:golive:entry:manage';

export default function OaEntrySwitchPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaEntrySwitchSaveParams>();
  const [data, setData] = useState<OaEntrySwitchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [switchType, setSwitchType] = useState<string | undefined>(undefined);
  const [switchStatus, setSwitchStatus] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OaEntrySwitchItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = switchType,
      status = switchStatus,
    ) => {
      setLoading(true);
      try {
        const params: OaGoliveQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          switchType: type,
          switchStatus: status,
        };
        const res = await oaEntrySwitchService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, switchType, switchStatus],
  );

  const loadStats = useCallback(async () => {
    const res = await oaEntrySwitchService.stats();
    setStats((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: OaEntrySwitchItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      switchNo: record.switchNo,
      switchName: record.switchName,
      switchType: record.switchType,
      oldEntry: record.oldEntry,
      newEntry: record.newEntry,
      switchPlan: record.switchPlan,
      dnsTtlMinutes: record.dnsTtlMinutes,
      ssoEnabled: record.ssoEnabled,
      mobileEnabled: record.mobileEnabled,
      switchStatus: record.switchStatus,
      switchTime: record.switchTime,
      verifyResult: record.verifyResult,
      operatorName: record.operatorName,
      orgName: record.orgName,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaEntrySwitchItem) => {
    setDetailOpen(true);
    const res = await oaEntrySwitchService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaEntrySwitchSaveParams = { ...values };
      if (editingId !== null) {
        await oaEntrySwitchService.update(editingId, payload);
        message.success('入口切换已更新');
      } else {
        await oaEntrySwitchService.create(payload);
        message.success('入口切换已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const cutover = async (id: number) => {
    await oaEntrySwitchService.cutover(id);
    message.success('入口已切换');
    void loadData();
    void loadStats();
  };

  const rollback = async (id: number) => {
    await oaEntrySwitchService.rollback(id);
    message.success('入口已回退');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaEntrySwitchService.remove(id);
    message.success('入口切换已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaEntrySwitchItem> = [
    { title: '切换编号', dataIndex: 'switchNo', width: 170, fixed: 'left', render: plain },
    { title: '切换名称', dataIndex: 'switchName', width: 200, render: plain },
    {
      title: '切换类型',
      dataIndex: 'switchType',
      width: 130,
      render: (v) => enumText(OA_GOLIVE_ENTRY_TYPE_LABEL, v),
    },
    { title: '旧入口', dataIndex: 'oldEntry', width: 200, render: plain },
    { title: '新入口', dataIndex: 'newEntry', width: 200, render: plain },
    { title: 'DNS TTL(分钟)', dataIndex: 'dnsTtlMinutes', width: 130, render: (v) => plain(v) },
    { title: 'SSO', dataIndex: 'ssoEnabled', width: 90, render: (v) => flagText(v) },
    { title: '移动端', dataIndex: 'mobileEnabled', width: 90, render: (v) => flagText(v) },
    {
      title: '状态',
      dataIndex: 'switchStatus',
      width: 100,
      render: (v) => enumTag(OA_GOLIVE_ENTRY_STATUS_LABEL, v),
    },
    { title: '切换时间', dataIndex: 'switchTime', width: 170, render: formatDateTime },
    { title: '操作人', dataIndex: 'operatorName', width: 110, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(ENTRY_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(ENTRY_MANAGE) && record.switchStatus !== 'DONE' && (
            <Button type="link" size="small" onClick={() => void cutover(record.id)}>
              切换
            </Button>
          )}
          {hasPermission(ENTRY_MANAGE) && record.switchStatus === 'DONE' && (
            <Button type="link" size="small" onClick={() => void rollback(record.id)}>
              回退
            </Button>
          )}
          {hasPermission(ENTRY_MANAGE) && (
            <Popconfirm title="确认删除该入口切换？" onConfirm={() => void remove(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        正式切换与现有OA退役 · 入口与身份切换
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="切换总数" value={Number(stats.total ?? 0)} />
          <Statistic title="待切换" value={Number(stats.pending ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="已切换" value={Number(stats.done ?? 0)} valueStyle={{ color: '#389e0d' }} />
          <Statistic title="已回退" value={Number(stats.rollback ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="SSO 启用" value={Number(stats.ssoEnabledCount ?? 0)} />
          <Statistic title="移动端启用" value={Number(stats.mobileEnabledCount ?? 0)} />
          <Statistic title="DNS TTL(分钟)" value={Number(stats.dnsTtlMinutes ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="关键字">
            <Input
              placeholder="切换编号 / 名称"
              allowClear
              style={{ width: 220 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="切换类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 150 }}
              value={switchType}
              onChange={(v) => setSwitchType(v)}
              options={[...OA_GOLIVE_ENTRY_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={switchStatus}
              onChange={(v) => setSwitchStatus(v)}
              options={[...OA_GOLIVE_ENTRY_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, switchType, switchStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSwitchType(undefined);
                  setSwitchStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(ENTRY_MANAGE) && <Button onClick={openCreate}>新增切换</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`入口与身份切换（共 ${total} 条）`}>
        <Table<OaEntrySwitchItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1900 }}
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
        title="入口切换详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="切换编号">{plain(detail.switchNo)}</Descriptions.Item>
            <Descriptions.Item label="切换名称">{plain(detail.switchName)}</Descriptions.Item>
            <Descriptions.Item label="切换类型">
              {enumText(OA_GOLIVE_ENTRY_TYPE_LABEL, detail.switchType)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {enumTag(OA_GOLIVE_ENTRY_STATUS_LABEL, detail.switchStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="旧入口" span={2}>
              {plain(detail.oldEntry)}
            </Descriptions.Item>
            <Descriptions.Item label="新入口" span={2}>
              {plain(detail.newEntry)}
            </Descriptions.Item>
            <Descriptions.Item label="切换方案" span={2}>
              {plain(detail.switchPlan)}
            </Descriptions.Item>
            <Descriptions.Item label="DNS TTL(分钟)">{plain(detail.dnsTtlMinutes)}</Descriptions.Item>
            <Descriptions.Item label="切换时间">{formatDateTime(detail.switchTime)}</Descriptions.Item>
            <Descriptions.Item label="SSO 启用">{flagText(detail.ssoEnabled)}</Descriptions.Item>
            <Descriptions.Item label="移动端启用">{flagText(detail.mobileEnabled)}</Descriptions.Item>
            <Descriptions.Item label="验证结果" span={2}>
              {plain(detail.verifyResult)}
            </Descriptions.Item>
            <Descriptions.Item label="操作人">{plain(detail.operatorName)}</Descriptions.Item>
            <Descriptions.Item label="组织">{plain(detail.orgName)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑入口切换' : '新增入口切换'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="switchNo" label="切换编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="switchName"
            label="切换名称"
            rules={[{ required: true, message: '请输入切换名称' }]}
          >
            <Input placeholder="请输入切换名称" />
          </Form.Item>
          <Form.Item name="switchType" label="切换类型">
            <Select placeholder="请选择" options={[...OA_GOLIVE_ENTRY_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="oldEntry" label="旧入口">
            <Input placeholder="请输入旧入口" />
          </Form.Item>
          <Form.Item name="newEntry" label="新入口">
            <Input placeholder="请输入新入口" />
          </Form.Item>
          <Form.Item name="switchPlan" label="切换方案">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="dnsTtlMinutes" label="DNS 缓存时间(分钟)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ssoEnabled" label="是否启用 SSO">
            <Select
              placeholder="请选择"
              options={[
                { label: '是', value: 1 },
                { label: '否', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="mobileEnabled" label="是否启用移动端">
            <Select
              placeholder="请选择"
              options={[
                { label: '是', value: 1 },
                { label: '否', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="switchStatus" label="状态">
            <Select placeholder="请选择" options={[...OA_GOLIVE_ENTRY_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="switchTime" label="切换时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="verifyResult" label="验证结果">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="operatorName" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
