import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tree,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { roleService, permissionService } from '@/services/systemService';
import type { RoleItem, RoleSaveParams, PermissionNode } from '@/types/system';
import { useAuthStore } from '@/stores/authStore';

const { Title, Text } = Typography;

function toPermTreeData(list: PermissionNode[]): DataNode[] {
  return list.map((item) => ({
    key: item.permissionId,
    title: `${item.permissionName}${item.permissionCode ? ` (${item.permissionCode})` : ''}`,
    children: item.children && item.children.length ? toPermTreeData(item.children) : undefined,
  }));
}

/** 收集所有叶子节点 id（用于回显时只勾选叶子，避免父节点联动误选子节点） */
function collectLeafIds(list: PermissionNode[]): number[] {
  const ids: number[] = [];
  const walk = (nodes: PermissionNode[]) => {
    nodes.forEach((n) => {
      if (n.children && n.children.length) {
        walk(n.children);
      } else {
        ids.push(n.permissionId);
      }
    });
  };
  walk(list);
  return ids;
}

export default function RolesPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<RoleSaveParams>();

  const [data, setData] = useState<RoleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RoleItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [permOpen, setPermOpen] = useState(false);
  const [permLoading, setPermLoading] = useState(false);
  const [permTree, setPermTree] = useState<PermissionNode[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<number[]>([]);
  const [halfCheckedKeys, setHalfCheckedKeys] = useState<number[]>([]);
  const [permRole, setPermRole] = useState<RoleItem | null>(null);
  const [permSaving, setPermSaving] = useState(false);

  const loadData = useCallback(async (page = pageNum, size = pageSize) => {
    setLoading(true);
    try {
      const res = await roleService.page({ pageNum: page, pageSize: size });
      setData(res.list || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize]);

  useEffect(() => {
    void loadData(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: { keyword?: string; status?: number }) => {
    setLoading(true);
    roleService
      .page({ pageNum: 1, pageSize, keyword: values.keyword || undefined, status: values.status })
      .then((res) => {
        setData(res.list || []);
        setTotal(res.total || 0);
        setPageNum(1);
      })
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 1 });
    setModalOpen(true);
  };

  const openEdit = (record: RoleItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      roleCode: record.roleCode,
      roleName: record.roleName,
      dataScope: record.dataScope,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editing) {
        await roleService.update(editing.roleId, values);
        message.success('更新成功');
      } else {
        await roleService.create(values);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: RoleItem) => {
    await roleService.remove(record.roleId);
    message.success('删除成功');
    void loadData();
  };

  const openAssign = async (record: RoleItem) => {
    setPermRole(record);
    setPermOpen(true);
    setPermLoading(true);
    setCheckedKeys([]);
    setHalfCheckedKeys([]);
    try {
      const [tree, granted] = await Promise.all([
        permTree.length ? Promise.resolve(permTree) : permissionService.tree(),
        roleService.getPermissions(record.roleId),
      ]);
      setPermTree(tree || []);
      const leafSetLocal = new Set(collectLeafIds(tree || []));
      setCheckedKeys((granted || []).filter((id) => leafSetLocal.has(id)));
      setHalfCheckedKeys((granted || []).filter((id) => !leafSetLocal.has(id)));
    } finally {
      setPermLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!permRole) return;
    setPermSaving(true);
    try {
      const ids = Array.from(new Set([...checkedKeys, ...halfCheckedKeys]));
      await roleService.assignPermissions(permRole.roleId, ids);
      message.success('权限分配成功');
      setPermOpen(false);
    } finally {
      setPermSaving(false);
    }
  };

  const columns: ColumnsType<RoleItem> = [
    { title: '角色编码', dataIndex: 'roleCode', width: 160 },
    { title: '角色名称', dataIndex: 'roleName', width: 160 },
    { title: '数据范围', dataIndex: 'dataScope', width: 120, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v: number) => (v === 1 ? <Tag color="success">启用</Tag> : <Tag color="default">停用</Tag>),
    },
    { title: '备注', dataIndex: 'remark', render: (v) => v || '-' },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {hasPermission('system:role:update') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('system:role:assign') && (
            <Button type="link" size="small" onClick={() => openAssign(record)}>
              分配权限
            </Button>
          )}
          {hasPermission('system:role:delete') && (
            <Popconfirm title="确认删除该角色？" onConfirm={() => handleDelete(record)}>
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
        角色管理
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="角色编码 / 名称" allowClear style={{ width: 200 }} />
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
              <Button icon={<ReloadOutlined />} onClick={() => void loadData(1, pageSize)}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`角色列表（共 ${total} 条）`}
        extra={
          hasPermission('system:role:create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增角色
            </Button>
          )
        }
      >
        <Table<RoleItem>
          rowKey="roleId"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1000 }}
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
        title={editing ? '编辑角色' : '新增角色'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="roleCode"
            label="角色编码"
            rules={[{ required: true, message: '请输入角色编码' }]}
          >
            <Input placeholder="请输入角色编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="roleName"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="dataScope"
            label="数据范围"
            rules={[{ required: true, message: '请输入数据范围' }]}
          >
            <Input placeholder="如：ALL / DEPT / SELF" />
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

      <Drawer
        title={`分配权限 - ${permRole?.roleName || ''}`}
        width={520}
        open={permOpen}
        onClose={() => setPermOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setPermOpen(false)}>取消</Button>
            <Button type="primary" loading={permSaving} onClick={handleAssign}>
              保存
            </Button>
          </Space>
        }
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          勾选该角色可访问的菜单与操作权限，父级节点会自动关联子级。
        </Text>
        {permLoading ? (
          <Spin style={{ display: 'block', margin: '40px auto' }} />
        ) : (
          <Tree
            checkable
            defaultExpandAll
            selectable={false}
            treeData={toPermTreeData(permTree)}
            checkedKeys={checkedKeys}
            onCheck={(checked, info) => {
              const keys = Array.isArray(checked) ? checked : checked.checked;
              setCheckedKeys(keys as number[]);
              setHalfCheckedKeys((info.halfCheckedKeys as number[]) || []);
            }}
          />
        )}
      </Drawer>
    </Space>
  );
}
