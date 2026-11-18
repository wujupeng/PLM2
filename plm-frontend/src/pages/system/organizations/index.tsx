import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Tree,
  TreeSelect,
  Typography,
  message,
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { organizationService } from '@/services/systemService';
import type { Organization, OrganizationSaveParams } from '@/types/system';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface OrgTreeSelectNode {
  title: string;
  value: number;
  children?: OrgTreeSelectNode[];
}

function toTreeData(list: Organization[]): DataNode[] {
  return list.map((item) => ({
    key: item.orgId,
    title: item.orgName,
    children: item.children && item.children.length ? toTreeData(item.children) : undefined,
  }));
}

function toTreeSelectData(list: Organization[]): OrgTreeSelectNode[] {
  return list.map((item) => ({
    title: item.orgName,
    value: item.orgId,
    children: item.children && item.children.length ? toTreeSelectData(item.children) : undefined,
  }));
}

function findOrg(list: Organization[], orgId: number): Organization | null {
  for (const item of list) {
    if (item.orgId === orgId) return item;
    if (item.children && item.children.length) {
      const found = findOrg(item.children, orgId);
      if (found) return found;
    }
  }
  return null;
}

export default function OrganizationsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OrganizationSaveParams>();

  const [tree, setTree] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Organization | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await organizationService.tree();
      setTree(res || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTree();
  }, [loadTree]);

  useEffect(() => {
    if (selectedId != null) {
      setSelected(findOrg(tree, selectedId));
    } else {
      setSelected(null);
    }
  }, [selectedId, tree]);

  const openCreate = (parentId: number | null) => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ parentId: parentId ?? 0, status: 1, sortNo: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: Organization) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      orgCode: record.orgCode,
      orgName: record.orgName,
      parentId: record.parentId ?? 0,
      orgType: record.orgType,
      sortNo: record.sortNo,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: OrganizationSaveParams = {
      ...values,
      parentId: values.parentId ? values.parentId : null,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await organizationService.update(editing.orgId, payload);
        message.success('更新成功');
      } else {
        await organizationService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      await loadTree();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: Organization) => {
    await organizationService.remove(record.orgId);
    message.success('删除成功');
    if (selectedId === record.orgId) setSelectedId(null);
    await loadTree();
  };

  const treeSelectData: OrgTreeSelectNode[] = [
    { title: '顶级组织', value: 0, children: toTreeSelectData(tree) },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        组织管理
      </Title>

      <Row gutter={16}>
        <Col span={9}>
          <Card
            title="组织架构"
            loading={loading}
            extra={
              <Space>
                <Button icon={<ReloadOutlined />} size="small" onClick={() => void loadTree()} />
                {hasPermission('system:org:create') && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => openCreate(null)}
                  >
                    新增根组织
                  </Button>
                )}
              </Space>
            }
          >
            {tree.length ? (
              <Tree
                treeData={toTreeData(tree)}
                defaultExpandAll
                blockNode
                selectedKeys={selectedId != null ? [selectedId] : []}
                onSelect={(keys) => setSelectedId(keys.length ? Number(keys[0]) : null)}
              />
            ) : (
              <Empty description="暂无组织数据" />
            )}
          </Card>
        </Col>

        <Col span={15}>
          <Card
            title="组织详情"
            extra={
              selected && (
                <Space>
                  {hasPermission('system:org:create') && (
                    <Button size="small" icon={<PlusOutlined />} onClick={() => openCreate(selected.orgId)}>
                      新增下级
                    </Button>
                  )}
                  {hasPermission('system:org:update') && (
                    <Button size="small" onClick={() => openEdit(selected)}>
                      编辑
                    </Button>
                  )}
                  {hasPermission('system:org:delete') && (
                    <Popconfirm title="确认删除该组织？" onConfirm={() => handleDelete(selected)}>
                      <Button size="small" danger>
                        删除
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              )
            }
          >
            {selected ? (
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="组织名称">{selected.orgName}</Descriptions.Item>
                <Descriptions.Item label="组织编码">{selected.orgCode}</Descriptions.Item>
                <Descriptions.Item label="组织类型">{selected.orgType || '-'}</Descriptions.Item>
                <Descriptions.Item label="排序号">{selected.sortNo}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  {selected.status === 1 ? <Tag color="success">启用</Tag> : <Tag color="default">停用</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="上级组织 ID">{selected.parentId ?? '顶级'}</Descriptions.Item>
                <Descriptions.Item label="备注" span={2}>
                  {selected.remark || '-'}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="请从左侧选择一个组织" />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={editing ? '编辑组织' : '新增组织'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="orgName"
            label="组织名称"
            rules={[{ required: true, message: '请输入组织名称' }]}
          >
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item
            name="orgCode"
            label="组织编码"
            rules={[{ required: true, message: '请输入组织编码' }]}
          >
            <Input placeholder="请输入组织编码" />
          </Form.Item>
          <Form.Item name="parentId" label="上级组织">
            <TreeSelect
              placeholder="请选择上级组织"
              treeDefaultExpandAll
              treeData={treeSelectData}
            />
          </Form.Item>
          <Form.Item
            name="orgType"
            label="组织类型"
            rules={[{ required: true, message: '请输入组织类型' }]}
          >
            <Input placeholder="如：company / department" />
          </Form.Item>
          <Form.Item name="sortNo" label="排序号" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
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
    </Space>
  );
}
