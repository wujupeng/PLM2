import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
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
import { PlusOutlined, ReloadOutlined, SearchOutlined, SafetyOutlined } from '@ant-design/icons';
import { oaApplicationService } from '@/services/oaService';
import { roleService } from '@/services/systemService';
import type { RoleOption } from '@/types/system';
import {
  OA_APPLICATION_TYPE_LABEL,
  OA_APPLICATION_TYPE_OPTIONS,
  OA_ENABLED_STATUS_COLOR,
  OA_ENABLED_STATUS_LABEL,
  OA_ENABLED_STATUS_OPTIONS,
  OA_VISIBLE_SCOPE_LABEL,
  OA_VISIBLE_SCOPE_OPTIONS,
  OA_YES_NO_OPTIONS,
  type OaApplicationItem,
  type OaApplicationQuery,
  type OaApplicationSaveParams,
} from '@/types/oa';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface ApplicationFormValues {
  appCode: string;
  appName: string;
  appType?: string;
  entryUrl?: string;
  icon?: string;
  appCategory?: string;
  visibleScope?: string;
  ssoEnabled?: number;
  sortNo?: number;
  status?: string;
  owner?: string;
  description?: string;
  remark?: string;
}

interface ApplicationSearchState {
  keyword?: string;
  appType?: string;
  status?: string;
}

export default function OaApplicationPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ApplicationFormValues>();

  const [data, setData] = useState<OaApplicationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<ApplicationSearchState>({});
  const [roles, setRoles] = useState<RoleOption[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaApplicationItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [grantOpen, setGrantOpen] = useState(false);
  const [grantApp, setGrantApp] = useState<OaApplicationItem | null>(null);
  const [grantRoleIds, setGrantRoleIds] = useState<number[]>([]);
  const [grantLoading, setGrantLoading] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaApplicationQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          appType: cond.appType || undefined,
          status: cond.status || undefined,
        };
        const res = await oaApplicationService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  const loadRoles = useCallback(async () => {
    const list = await roleService.options();
    setRoles(list || []);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, {});
    void loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roleOptions = roles.map((r) => ({
    value: r.id,
    label: `${r.roleName}（${r.roleCode}）`,
  }));

  const onSearch = (values: ApplicationSearchState) => {
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
    form.setFieldsValue({
      appType: 'INTERNAL',
      visibleScope: 'ALL',
      ssoEnabled: 0,
      status: 'enabled',
      sortNo: 1,
    });
    setModalOpen(true);
  };

  const openEdit = (record: OaApplicationItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: OaApplicationSaveParams = { ...values };
    setSubmitting(true);
    try {
      if (editing) {
        await oaApplicationService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await oaApplicationService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: OaApplicationItem) => {
    await oaApplicationService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const openGrant = async (record: OaApplicationItem) => {
    setGrantApp(record);
    setGrantOpen(true);
    setGrantLoading(true);
    try {
      const ids = await oaApplicationService.grantedRoleIds(record.id);
      setGrantRoleIds(ids || []);
    } finally {
      setGrantLoading(false);
    }
  };

  const handleGrant = async () => {
    if (!grantApp) return;
    setGrantLoading(true);
    try {
      await oaApplicationService.grant(grantApp.id, grantRoleIds);
      message.success('授权已保存');
      setGrantOpen(false);
    } finally {
      setGrantLoading(false);
    }
  };

  const columns: ColumnsType<OaApplicationItem> = [
    { title: '应用编码', dataIndex: 'appCode', width: 140, fixed: 'left', render: (v) => v || '-' },
    { title: '应用名称', dataIndex: 'appName', width: 160, render: (v) => v || '-' },
    {
      title: '应用类型',
      dataIndex: 'appType',
      width: 110,
      render: (v?: string) => (v ? OA_APPLICATION_TYPE_LABEL[v] || v : '-'),
    },
    { title: '应用分类', dataIndex: 'appCategory', width: 100, render: (v) => v || '-' },
    { title: '访问地址', dataIndex: 'entryUrl', width: 180, render: (v) => v || '-' },
    {
      title: '可见范围',
      dataIndex: 'visibleScope',
      width: 110,
      render: (v?: string) => (v ? OA_VISIBLE_SCOPE_LABEL[v] || v : '-'),
    },
    {
      title: 'SSO',
      dataIndex: 'ssoEnabled',
      width: 80,
      render: (v?: number) => (
        <Tag color={v === 1 ? 'green' : 'default'}>{v === 1 ? '已接入' : '未接入'}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v?: string) =>
        v ? <Tag color={OA_ENABLED_STATUS_COLOR[v]}>{OA_ENABLED_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '负责人', dataIndex: 'owner', width: 110, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:application:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('oa:application:grant') && (
            <Button
              type="link"
              size="small"
              icon={<SafetyOutlined />}
              onClick={() => void openGrant(record)}
            >
              授权
            </Button>
          )}
          {hasPermission('oa:application:delete') && (
            <Popconfirm title="确认删除该应用？" onConfirm={() => handleDelete(record)}>
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
        应用中心
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="应用">
            <Input placeholder="应用编码 / 名称" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="appType" label="应用类型">
            <Select placeholder="请选择" allowClear style={{ width: 140 }} options={OA_APPLICATION_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={OA_ENABLED_STATUS_OPTIONS} />
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
        title={`应用列表（共 ${total} 条）`}
        extra={
          hasPermission('oa:application:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增应用
            </Button>
          )
        }
      >
        <Table<OaApplicationItem>
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
        title={editing ? '编辑应用' : '新增应用'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="appCode"
            label="应用编码"
            rules={[{ required: true, message: '请输入应用编码' }]}
          >
            <Input placeholder="请输入应用编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="appName"
            label="应用名称"
            rules={[{ required: true, message: '请输入应用名称' }]}
          >
            <Input placeholder="请输入应用名称" />
          </Form.Item>
          <Form.Item name="appType" label="应用类型">
            <Select placeholder="请选择" options={OA_APPLICATION_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="appCategory" label="应用分类">
            <Input placeholder="请输入应用分类" />
          </Form.Item>
          <Form.Item name="entryUrl" label="访问地址">
            <Input placeholder="请输入访问地址" />
          </Form.Item>
          <Form.Item name="icon" label="图标标识">
            <Input placeholder="Ant Design 图标名称，如 AppstoreOutlined" />
          </Form.Item>
          <Form.Item name="visibleScope" label="可见范围">
            <Select placeholder="请选择" options={OA_VISIBLE_SCOPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="ssoEnabled" label="接入 SSO">
            <Select placeholder="请选择" options={OA_YES_NO_OPTIONS} />
          </Form.Item>
          <Form.Item name="sortNo" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数值越小越靠前" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={OA_ENABLED_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="owner" label="负责人">
            <Input placeholder="请输入负责人 / 责任部门" />
          </Form.Item>
          <Form.Item name="description" label="应用说明">
            <Input.TextArea rows={2} placeholder="请输入应用说明" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`应用授权：${grantApp?.appName || ''}`}
        open={grantOpen}
        onOk={handleGrant}
        confirmLoading={grantLoading}
        onCancel={() => setGrantOpen(false)}
        destroyOnClose
        width={560}
      >
        <p style={{ color: 'rgba(0,0,0,0.45)' }}>
          选择可访问该应用的角色（保存后以全量覆盖方式更新，未勾选的角色将失去访问权限）。
        </p>
        <Select
          mode="multiple"
          allowClear
          style={{ width: '100%' }}
          placeholder="请选择角色"
          optionFilterProp="label"
          value={grantRoleIds}
          onChange={(v) => setGrantRoleIds(v)}
          options={roleOptions}
          loading={grantLoading}
        />
      </Modal>
    </Space>
  );
}
