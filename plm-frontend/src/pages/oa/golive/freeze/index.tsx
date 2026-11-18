import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
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
import { oaGoliveFreezeService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText, flagText } from '@/pages/oa/integration/shared';
import {
  OA_GOLIVE_FREEZE_STATUS_LABEL,
  OA_GOLIVE_FREEZE_STATUS_OPTIONS,
  OA_GOLIVE_FREEZE_TYPE_LABEL,
  OA_GOLIVE_FREEZE_TYPE_OPTIONS,
  type OaGoliveFreezeItem,
  type OaGoliveFreezeSaveParams,
  type OaGoliveQuery,
} from '@/types/oa';

const { Title } = Typography;

const FREEZE_MANAGE = 'oa:golive:freeze:manage';

export default function OaGoliveFreezePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaGoliveFreezeSaveParams>();
  const [data, setData] = useState<OaGoliveFreezeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [freezeType, setFreezeType] = useState<string | undefined>(undefined);
  const [freezeStatus, setFreezeStatus] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OaGoliveFreezeItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = freezeType,
      status = freezeStatus,
    ) => {
      setLoading(true);
      try {
        const params: OaGoliveQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          freezeType: type,
          freezeStatus: status,
        };
        const res = await oaGoliveFreezeService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, freezeType, freezeStatus],
  );

  const loadStats = useCallback(async () => {
    const res = await oaGoliveFreezeService.stats();
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

  const openEdit = (record: OaGoliveFreezeItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      freezeNo: record.freezeNo,
      freezeName: record.freezeName,
      freezeType: record.freezeType,
      freezeScope: record.freezeScope,
      freezeStart: record.freezeStart,
      freezeEnd: record.freezeEnd,
      readOnlyRetained: record.readOnlyRetained,
      emergencyPlan: record.emergencyPlan,
      noticePublished: record.noticePublished,
      noticeTime: record.noticeTime,
      freezeStatus: record.freezeStatus,
      dutyPerson: record.dutyPerson,
      operatorName: record.operatorName,
      orgName: record.orgName,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaGoliveFreezeItem) => {
    setDetailOpen(true);
    const res = await oaGoliveFreezeService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaGoliveFreezeSaveParams = { ...values };
      if (editingId !== null) {
        await oaGoliveFreezeService.update(editingId, payload);
        message.success('切换冻结已更新');
      } else {
        await oaGoliveFreezeService.create(payload);
        message.success('切换冻结已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action: () => Promise<OaGoliveFreezeItem>, tip: string) => {
    await action();
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaGoliveFreezeService.remove(id);
    message.success('切换冻结已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaGoliveFreezeItem> = [
    { title: '冻结编号', dataIndex: 'freezeNo', width: 170, fixed: 'left', render: plain },
    { title: '冻结名称', dataIndex: 'freezeName', width: 200, render: plain },
    {
      title: '冻结类型',
      dataIndex: 'freezeType',
      width: 130,
      render: (v) => enumText(OA_GOLIVE_FREEZE_TYPE_LABEL, v),
    },
    { title: '冻结范围', dataIndex: 'freezeScope', width: 180, render: plain },
    { title: '冻结开始', dataIndex: 'freezeStart', width: 170, render: formatDateTime },
    { title: '冻结结束', dataIndex: 'freezeEnd', width: 170, render: formatDateTime },
    {
      title: '只读保留',
      dataIndex: 'readOnlyRetained',
      width: 100,
      render: (v) => flagText(v),
    },
    {
      title: '已通知',
      dataIndex: 'noticePublished',
      width: 90,
      render: (v) => flagText(v),
    },
    {
      title: '状态',
      dataIndex: 'freezeStatus',
      width: 100,
      render: (v) => enumTag(OA_GOLIVE_FREEZE_STATUS_LABEL, v),
    },
    { title: '值守负责人', dataIndex: 'dutyPerson', width: 130, render: plain },
    { title: '操作人', dataIndex: 'operatorName', width: 110, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 330,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(FREEZE_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(FREEZE_MANAGE) && record.freezeStatus !== 'ACTIVE' && (
            <Button
              type="link"
              size="small"
              onClick={() => void runAction(() => oaGoliveFreezeService.activate(record.id), '冻结已生效')}
            >
              生效
            </Button>
          )}
          {hasPermission(FREEZE_MANAGE) && record.freezeStatus === 'ACTIVE' && (
            <Button
              type="link"
              size="small"
              onClick={() => void runAction(() => oaGoliveFreezeService.release(record.id), '冻结已解除')}
            >
              解除
            </Button>
          )}
          {hasPermission(FREEZE_MANAGE) && Number(record.noticePublished) !== 1 && (
            <Button
              type="link"
              size="small"
              onClick={() => void runAction(() => oaGoliveFreezeService.notice(record.id), '冻结通知已发布')}
            >
              通知
            </Button>
          )}
          {hasPermission(FREEZE_MANAGE) && (
            <Popconfirm title="确认删除该切换冻结？" onConfirm={() => void remove(record.id)}>
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
        正式切换与现有OA退役 · 切换冻结管理
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="冻结总数" value={Number(stats.total ?? 0)} />
          <Statistic title="待冻结" value={Number(stats.pending ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="冻结中" value={Number(stats.active ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="已解除" value={Number(stats.released ?? 0)} valueStyle={{ color: '#389e0d' }} />
          <Statistic title="只读保留" value={Number(stats.readOnlyRetained ?? 0)} />
          <Statistic title="已发布通知" value={Number(stats.noticePublished ?? 0)} />
          <Statistic title="冻结窗口(小时)" value={Number(stats.freezeWindowHours ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="关键字">
            <Input
              placeholder="冻结编号 / 名称"
              allowClear
              style={{ width: 220 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="冻结类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 150 }}
              value={freezeType}
              onChange={(v) => setFreezeType(v)}
              options={[...OA_GOLIVE_FREEZE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={freezeStatus}
              onChange={(v) => setFreezeStatus(v)}
              options={[...OA_GOLIVE_FREEZE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, freezeType, freezeStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setFreezeType(undefined);
                  setFreezeStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(FREEZE_MANAGE) && <Button onClick={openCreate}>新增冻结</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`切换冻结管理（共 ${total} 条）`}>
        <Table<OaGoliveFreezeItem>
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
        title="切换冻结详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="冻结编号">{plain(detail.freezeNo)}</Descriptions.Item>
            <Descriptions.Item label="冻结名称">{plain(detail.freezeName)}</Descriptions.Item>
            <Descriptions.Item label="冻结类型">
              {enumText(OA_GOLIVE_FREEZE_TYPE_LABEL, detail.freezeType)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {enumTag(OA_GOLIVE_FREEZE_STATUS_LABEL, detail.freezeStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="冻结范围" span={2}>
              {plain(detail.freezeScope)}
            </Descriptions.Item>
            <Descriptions.Item label="冻结开始">{formatDateTime(detail.freezeStart)}</Descriptions.Item>
            <Descriptions.Item label="冻结结束">{formatDateTime(detail.freezeEnd)}</Descriptions.Item>
            <Descriptions.Item label="只读保留">{flagText(detail.readOnlyRetained)}</Descriptions.Item>
            <Descriptions.Item label="已通知">{flagText(detail.noticePublished)}</Descriptions.Item>
            <Descriptions.Item label="通知时间">{formatDateTime(detail.noticeTime)}</Descriptions.Item>
            <Descriptions.Item label="值守负责人">{plain(detail.dutyPerson)}</Descriptions.Item>
            <Descriptions.Item label="应急预案" span={2}>
              {plain(detail.emergencyPlan)}
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
        title={editingId !== null ? '编辑切换冻结' : '新增切换冻结'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="freezeNo" label="冻结编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="freezeName"
            label="冻结名称"
            rules={[{ required: true, message: '请输入冻结名称' }]}
          >
            <Input placeholder="请输入冻结名称" />
          </Form.Item>
          <Form.Item name="freezeType" label="冻结类型">
            <Select placeholder="请选择" options={[...OA_GOLIVE_FREEZE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="freezeScope" label="冻结范围">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="freezeStart" label="冻结开始时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="freezeEnd" label="冻结结束时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="readOnlyRetained" label="只读保留">
            <Select
              placeholder="请选择"
              options={[
                { label: '是', value: 1 },
                { label: '否', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="emergencyPlan" label="应急预案">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="noticePublished" label="是否已通知">
            <Select
              placeholder="请选择"
              options={[
                { label: '是', value: 1 },
                { label: '否', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="noticeTime" label="通知时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="freezeStatus" label="状态">
            <Select placeholder="请选择" options={[...OA_GOLIVE_FREEZE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="dutyPerson" label="值守负责人">
            <Input placeholder="请输入值守负责人" />
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
