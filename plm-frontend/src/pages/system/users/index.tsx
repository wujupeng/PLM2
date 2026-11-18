import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  TreeSelect,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { userService, organizationService, roleService } from '@/services/systemService';
import type { UserItem, UserSaveParams, Organization, RoleOption } from '@/types/system';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface OrgTreeNode {
  title: string;
  value: number;
  children?: OrgTreeNode[];
}

function toTreeData(list: Organization[]): OrgTreeNode[] {
  return list.map((item) => ({
    title: item.orgName,
    value: item.orgId,
    children: item.children && item.children.length ? toTreeData(item.children) : undefined,
  }));
}

interface SearchState {
  keyword?: string;
  orgId?: number;
  status?: number;
}

export default function UsersPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<UserSaveParams>();
  const [passwordForm] = Form.useForm<{ password: string }>();

  const [data, setData] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [orgTree, setOrgTree] = useState<OrgTreeNode[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdUser, setPwdUser] = useState<UserItem | null>(null);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await userService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          orgId: cond.orgId,
          status: cond.status,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    organizationService
      .tree()
      .then((res) => setOrgTree(toTreeData(res || [])))
      .catch(() => undefined);
    roleService
      .options()
      .then((res) => setRoleOptions(res || []))
      .catch(() => undefined);
  }, []);

  const onSearch = (values: SearchState) => {
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
    form.setFieldsValue({ status: 1, roleIds: [] });
    setModalOpen(true);
  };

  const openEdit = (record: UserItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      username: record.username,
      displayName: record.displayName,
      email: record.email,
      phone: record.phone,
      orgId: record.orgId,
      status: record.status,
      roleIds: record.roleIds || [],
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editing) {
        await userService.update(editing.userId, { ...values, password: values.password || undefined });
        message.success('更新成功');
      } else {
        await userService.create(values);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: UserItem) => {
    await userService.remove(record.userId);
    message.success('删除成功');
    void loadData();
  };

  const handleToggleStatus = async (record: UserItem) => {
    const next = record.status === 1 ? 0 : 1;
    await userService.changeStatus(record.userId, next);
    message.success(next === 1 ? '已启用' : '已停用');
    void loadData();
  };

  const openResetPassword = (record: UserItem) => {
    setPwdUser(record);
    passwordForm.resetFields();
    setPwdOpen(true);
  };

  const handleResetPassword = async () => {
    const values = await passwordForm.validateFields();
    if (!pwdUser) return;
    await userService.resetPassword(pwdUser.userId, values.password);
    message.success('密码重置成功');
    setPwdOpen(false);
  };

  const columns: ColumnsType<UserItem> = [
    { title: '用户名', dataIndex: 'username', width: 140 },
    { title: '显示名称', dataIndex: 'displayName', width: 140 },
    { title: '邮箱', dataIndex: 'email', width: 180, render: (v) => v || '-' },
    { title: '手机号', dataIndex: 'phone', width: 140, render: (v) => v || '-' },
    { title: '所属组织', dataIndex: 'orgName', width: 160, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v: number) => (v === 1 ? <Tag color="success">启用</Tag> : <Tag color="default">停用</Tag>),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      width: 180,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {hasPermission('system:user:update') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('system:user:update') && (
            <Button type="link" size="small" onClick={() => handleToggleStatus(record)}>
              {record.status === 1 ? '停用' : '启用'}
            </Button>
          )}
          {hasPermission('system:user:reset-password') && (
            <Button type="link" size="small" onClick={() => openResetPassword(record)}>
              重置密码
            </Button>
          )}
          {hasPermission('system:user:delete') && (
            <Popconfirm title="确认删除该用户？" onConfirm={() => handleDelete(record)}>
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
        用户管理
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="用户名 / 显示名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="orgId" label="所属组织">
            <TreeSelect
              placeholder="请选择组织"
              allowClear
              treeDefaultExpandAll
              treeData={orgTree}
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              options={[
                { value: 1, label: '启用' },
                { value: 0, label: '停用' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space>
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
        title={`用户列表（共 ${total} 条）`}
        extra={
          hasPermission('system:user:create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增用户
            </Button>
          )
        }
      >
        <Table<UserItem>
          rowKey="userId"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1200 }}
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
        title={editing ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={editing ? [] : [{ required: true, message: '请输入密码' }]}
            extra={editing ? '留空表示不修改密码' : undefined}
          >
            <Input.Password placeholder={editing ? '留空表示不修改' : '请输入密码'} autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="displayName"
            label="显示名称"
            rules={[{ required: true, message: '请输入显示名称' }]}
          >
            <Input placeholder="请输入显示名称" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="orgId" label="所属组织">
            <TreeSelect
              placeholder="请选择组织"
              allowClear
              treeDefaultExpandAll
              treeData={orgTree}
            />
          </Form.Item>
          <Form.Item name="roleIds" label="角色">
            <Select
              mode="multiple"
              placeholder="请选择角色"
              allowClear
              options={roleOptions.map((r) => ({ value: r.id, label: r.roleName }))}
            />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select
              options={[
                { value: 1, label: '启用' },
                { value: 0, label: '停用' },
              ]}
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`重置密码 - ${pwdUser?.displayName || ''}`}
        open={pwdOpen}
        onOk={handleResetPassword}
        onCancel={() => setPwdOpen(false)}
        destroyOnClose
      >
        <Form form={passwordForm} layout="vertical" preserve={false}>
          <Form.Item
            name="password"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password placeholder="请输入新密码" autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
