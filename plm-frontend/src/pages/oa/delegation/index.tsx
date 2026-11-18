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
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { oaDelegationService } from '@/services/oaService';
import UserSelect from '@/pages/oa/UserSelect';
import {
  OA_DELEGATION_SCOPE_LABEL,
  OA_DELEGATION_SCOPE_OPTIONS,
  OA_DELEGATION_STATUS_COLOR,
  OA_DELEGATION_STATUS_LABEL,
  OA_DELEGATION_STATUS_OPTIONS,
  type OaDelegationItem,
  type OaDelegationQuery,
  type OaDelegationSaveParams,
} from '@/types/oa';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

interface DelegationFormValues {
  delegatorUserId?: number;
  delegateUserId?: number;
  applyScope?: string;
  processCode?: string;
  startAt?: Dayjs;
  endAt?: Dayjs;
  delegationStatus?: string;
  reason?: string;
  remark?: string;
}

interface DelegationSearchState {
  keyword?: string;
  delegationStatus?: string;
}

export default function OaDelegationPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DelegationFormValues>();

  const [data, setData] = useState<OaDelegationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<DelegationSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaDelegationItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaDelegationQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          delegationStatus: cond.delegationStatus || undefined,
        };
        const res = await oaDelegationService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: DelegationSearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ applyScope: 'ALL', delegationStatus: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEdit = (record: OaDelegationItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      delegatorUserId: record.delegatorUserId,
      delegateUserId: record.delegateUserId,
      applyScope: record.applyScope,
      processCode: record.processCode,
      startAt: record.startAt ? dayjs(record.startAt) : undefined,
      endAt: record.endAt ? dayjs(record.endAt) : undefined,
      delegationStatus: record.delegationStatus,
      reason: record.reason,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: OaDelegationSaveParams = {
      delegatorUserId: values.delegatorUserId,
      delegateUserId: values.delegateUserId,
      applyScope: values.applyScope,
      processCode: values.applyScope === 'PROCESS' ? values.processCode : undefined,
      startAt: values.startAt ? values.startAt.format(DATETIME_FORMAT) : undefined,
      endAt: values.endAt ? values.endAt.format(DATETIME_FORMAT) : undefined,
      delegationStatus: values.delegationStatus,
      reason: values.reason,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await oaDelegationService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await oaDelegationService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (record: OaDelegationItem) => {
    await oaDelegationService.revoke(record.id);
    message.success('已撤回该授权');
    void loadData();
  };

  const handleDelete = async (record: OaDelegationItem) => {
    await oaDelegationService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<OaDelegationItem> = [
    { title: '授权编号', dataIndex: 'delegationNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    { title: '授权人', dataIndex: 'delegatorName', width: 130, render: (v, r) => v || r.delegatorUserId || '-' },
    { title: '代理人', dataIndex: 'delegateName', width: 130, render: (v, r) => v || r.delegateUserId || '-' },
    {
      title: '授权范围',
      dataIndex: 'applyScope',
      width: 110,
      render: (v?: string, r?: OaDelegationItem) =>
        v ? (
          <span>
            {OA_DELEGATION_SCOPE_LABEL[v] || v}
            {v === 'PROCESS' && r?.processCode ? `（${r.processCode}）` : ''}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: '生效时间',
      dataIndex: 'startAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '失效时间',
      dataIndex: 'endAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '状态',
      dataIndex: 'delegationStatus',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={OA_DELEGATION_STATUS_COLOR[v]}>{OA_DELEGATION_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '事由', dataIndex: 'reason', width: 200, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:delegation:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('oa:delegation:save') && record.delegationStatus === 'ACTIVE' && (
            <Popconfirm title="确认撤回该授权？" onConfirm={() => handleRevoke(record)}>
              <Button type="link" size="small">
                撤回
              </Button>
            </Popconfirm>
          )}
          {hasPermission('oa:delegation:delete') && (
            <Popconfirm title="确认删除该授权记录？" onConfirm={() => handleDelete(record)}>
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
        流程代理授权
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="授权编号 / 姓名" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="delegationStatus" label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              options={OA_DELEGATION_STATUS_OPTIONS}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`代理授权列表（共 ${total} 条）`}
        extra={
          hasPermission('oa:delegation:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增代理授权
            </Button>
          )
        }
      >
        <Table<OaDelegationItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1400 }}
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
        title={editing ? '编辑代理授权' : '新增代理授权'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="delegatorUserId"
            label="授权人"
            rules={[{ required: true, message: '请选择授权人' }]}
          >
            <UserSelect style={{ width: '100%' }} fallbackLabel={editing?.delegatorName} />
          </Form.Item>
          <Form.Item
            name="delegateUserId"
            label="代理人"
            rules={[{ required: true, message: '请选择代理人' }]}
          >
            <UserSelect style={{ width: '100%' }} fallbackLabel={editing?.delegateName} />
          </Form.Item>
          <Form.Item name="applyScope" label="授权范围">
            <Select placeholder="请选择" options={OA_DELEGATION_SCOPE_OPTIONS} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.applyScope !== cur.applyScope}>
            {({ getFieldValue }) =>
              getFieldValue('applyScope') === 'PROCESS' ? (
                <Form.Item name="processCode" label="流程编码">
                  <Input placeholder="请输入指定流程编码" />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item name="startAt" label="生效时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_FORMAT} />
          </Form.Item>
          <Form.Item name="endAt" label="失效时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_FORMAT} />
          </Form.Item>
          <Form.Item name="delegationStatus" label="状态">
            <Select placeholder="请选择" options={OA_DELEGATION_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="reason" label="事由">
            <Input.TextArea rows={2} placeholder="请输入授权事由" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
