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
import { docTransitionService } from '@/services/docStateService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { boolTag, statusTag } from '@/pages/platform/doc-state/shared';
import {
  DOC_STATE_BOOL_OPTIONS,
  DOC_STATE_STATUS_LABEL,
  DOC_STATE_STATUS_OPTIONS,
  TRANSITION_TYPE_LABEL,
  TRANSITION_TYPE_OPTIONS,
  type DocTransitionItem,
  type DocTransitionSaveParams,
  type DocTransitionStats,
} from '@/types/docstate';

const { Title } = Typography;

const DOC_TRANSITION_MANAGE = 'platform:docstate:transition:manage';

export default function DocTransitionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DocTransitionSaveParams>();
  const [data, setData] = useState<DocTransitionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [docType, setDocType] = useState('');
  const [fromState, setFromState] = useState('');
  const [toState, setToState] = useState('');
  const [actionCode, setActionCode] = useState('');
  const [transitionType, setTransitionType] = useState<string | undefined>(undefined);
  const [transitionStatus, setTransitionStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<DocTransitionStats>({});

  const loadStats = useCallback(async () => {
    const res = await docTransitionService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      dType = docType,
      fState = fromState,
      tState = toState,
      aCode = actionCode,
      tType = transitionType,
      tStatus = transitionStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await docTransitionService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          docType: dType || undefined,
          fromState: fState || undefined,
          toState: tState || undefined,
          actionCode: aCode || undefined,
          transitionType: tType,
          transitionStatus: tStatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, docType, fromState, toState, actionCode, transitionType, transitionStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', '', '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ transitionType: 'FORWARD', transitionStatus: 'ACTIVE', requireApproval: 0, requireReason: 0 });
    setOpen(true);
  };

  const openEdit = (record: DocTransitionItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: DocTransitionSaveParams = { ...values };
      if (editId == null) {
        await docTransitionService.create(payload);
        message.success('状态流转规则已创建');
      } else {
        await docTransitionService.update(editId, payload);
        message.success('状态流转规则已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await docTransitionService.remove(id);
    message.success('状态流转规则已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<DocTransitionItem> = [
    { title: '单据类型', dataIndex: 'docType', width: 140, fixed: 'left', render: plain },
    { title: '起始状态', dataIndex: 'fromState', width: 130, render: plain },
    { title: '目标状态', dataIndex: 'toState', width: 130, render: plain },
    { title: '动作编码', dataIndex: 'actionCode', width: 140, render: plain },
    { title: '动作名称', dataIndex: 'actionName', width: 160, render: plain },
    {
      title: '流转类型',
      dataIndex: 'transitionType',
      width: 140,
      render: (v) => statusTag(TRANSITION_TYPE_LABEL, v),
    },
    { title: '需审批', dataIndex: 'requireApproval', width: 100, render: (v) => boolTag(v) },
    { title: '需填原因', dataIndex: 'requireReason', width: 100, render: (v) => boolTag(v) },
    { title: '权限码', dataIndex: 'permissionCode', width: 180, ellipsis: true, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'transitionStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(DOC_STATE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(DOC_TRANSITION_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该状态流转规则？"
              onConfirm={() => void act(docTransitionService.enable, record.id, '状态流转规则已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该状态流转规则？"
              onConfirm={() => void act(docTransitionService.disable, record.id, '状态流转规则已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该状态流转规则？" onConfirm={() => void remove(record.id)}>
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
        状态流转规则
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="规则总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="停用" value={Number(stats.disabled ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="单据类型">
            <Input
              placeholder="请输入单据类型"
              allowClear
              style={{ width: 160 }}
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="起始状态">
            <Input
              placeholder="请输入起始状态"
              allowClear
              style={{ width: 140 }}
              value={fromState}
              onChange={(e) => setFromState(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="目标状态">
            <Input
              placeholder="请输入目标状态"
              allowClear
              style={{ width: 140 }}
              value={toState}
              onChange={(e) => setToState(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="动作编码">
            <Input
              placeholder="请输入动作编码"
              allowClear
              style={{ width: 140 }}
              value={actionCode}
              onChange={(e) => setActionCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="流转类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 150 }}
              value={transitionType}
              onChange={(v) => setTransitionType(v)}
              options={[...TRANSITION_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={transitionStatus}
              onChange={(v) => setTransitionStatus(v)}
              options={[...DOC_STATE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="动作编码 / 名称"
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
                  void loadData(
                    1,
                    pageSize,
                    keyword,
                    docType,
                    fromState,
                    toState,
                    actionCode,
                    transitionType,
                    transitionStatus,
                    range,
                  );
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDocType('');
                  setFromState('');
                  setToState('');
                  setActionCode('');
                  setTransitionType(undefined);
                  setTransitionStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', '', '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(DOC_TRANSITION_MANAGE) && <Button onClick={openCreate}>新建流转规则</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`状态流转规则（共 ${total} 条）`}>
        <Table<DocTransitionItem>
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
        title={editId == null ? '新建流转规则' : '编辑流转规则'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="docType" label="单据类型" rules={[{ required: true, message: '请输入单据类型' }]}>
            <Input placeholder="请输入单据类型" />
          </Form.Item>
          <Form.Item name="fromState" label="起始状态" rules={[{ required: true, message: '请输入起始状态' }]}>
            <Input placeholder="请输入起始状态编码" />
          </Form.Item>
          <Form.Item name="toState" label="目标状态" rules={[{ required: true, message: '请输入目标状态' }]}>
            <Input placeholder="请输入目标状态编码" />
          </Form.Item>
          <Form.Item name="actionCode" label="动作编码" rules={[{ required: true, message: '请输入动作编码' }]}>
            <Input placeholder="请输入动作编码" />
          </Form.Item>
          <Form.Item name="actionName" label="动作名称" rules={[{ required: true, message: '请输入动作名称' }]}>
            <Input placeholder="请输入动作名称" />
          </Form.Item>
          <Form.Item name="transitionType" label="流转类型">
            <Select placeholder="请选择" options={[...TRANSITION_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="requireApproval" label="是否要求审批">
            <Select placeholder="请选择" options={[...DOC_STATE_BOOL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="requireReason" label="是否要求填写原因">
            <Select placeholder="请选择" options={[...DOC_STATE_BOOL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="permissionCode" label="权限码">
            <Input placeholder="请输入执行该流转所需权限码" />
          </Form.Item>
          <Form.Item name="transitionStatus" label="状态">
            <Select placeholder="请选择" options={[...DOC_STATE_STATUS_OPTIONS]} />
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
