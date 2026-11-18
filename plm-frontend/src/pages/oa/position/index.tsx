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
  TreeSelect,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { oaPositionService } from '@/services/oaService';
import { organizationService } from '@/services/systemService';
import type { Organization } from '@/types/system';
import {
  OA_POSITION_LEVEL_LABEL,
  OA_POSITION_LEVEL_OPTIONS,
  OA_STATUS_COLOR,
  OA_STATUS_OPTIONS,
  type OaPositionItem,
  type OaPositionQuery,
  type OaPositionSaveParams,
} from '@/types/oa';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface PositionFormValues {
  positionCode: string;
  positionName: string;
  orgId?: number;
  positionLevel?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
}

interface PositionSearchState {
  keyword?: string;
  orgId?: number;
  status?: number;
}

export default function OaPositionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<PositionFormValues>();

  const [data, setData] = useState<OaPositionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<PositionSearchState>({});
  const [orgTree, setOrgTree] = useState<Organization[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaPositionItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaPositionQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          orgId: cond.orgId,
          status: cond.status,
        };
        const res = await oaPositionService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  const loadOrgTree = useCallback(async () => {
    const tree = await organizationService.tree();
    setOrgTree(tree || []);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, {});
    void loadOrgTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: PositionSearchState) => {
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
    form.setFieldsValue({ positionLevel: 'STAFF', status: 1, sortNo: 1 });
    setModalOpen(true);
  };

  const openEdit = (record: OaPositionItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: OaPositionSaveParams = { ...values };
    setSubmitting(true);
    try {
      if (editing) {
        await oaPositionService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await oaPositionService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: OaPositionItem) => {
    await oaPositionService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<OaPositionItem> = [
    { title: '岗位编码', dataIndex: 'positionCode', width: 150, fixed: 'left', render: (v) => v || '-' },
    { title: '岗位名称', dataIndex: 'positionName', width: 160, render: (v) => v || '-' },
    {
      title: '岗位层级',
      dataIndex: 'positionLevel',
      width: 110,
      render: (v?: string) => (v ? OA_POSITION_LEVEL_LABEL[v] || v : '-'),
    },
    { title: '排序', dataIndex: 'sortNo', width: 80, render: (v) => (v ?? '-') },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v?: number) =>
        v !== undefined && v !== null ? (
          <Tag color={OA_STATUS_COLOR[String(v)]}>{v === 1 ? '启用' : '停用'}</Tag>
        ) : (
          '-'
        ),
    },
    { title: '备注', dataIndex: 'remark', width: 220, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:position:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('oa:position:delete') && (
            <Popconfirm title="确认删除该岗位？" onConfirm={() => handleDelete(record)}>
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
        岗位管理
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="岗位">
            <Input placeholder="岗位编码/名称" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="orgId" label="所属组织">
            <TreeSelect
              placeholder="请选择"
              allowClear
              style={{ width: 200 }}
              treeData={orgTree}
              fieldNames={{ label: 'orgName', value: 'orgId', children: 'children' }}
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={OA_STATUS_OPTIONS} />
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
        title={`岗位列表（共 ${total} 条）`}
        extra={
          hasPermission('oa:position:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增岗位
            </Button>
          )
        }
      >
        <Table<OaPositionItem>
          rowKey="id"
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
        title={editing ? '编辑岗位' : '新增岗位'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="positionCode"
            label="岗位编码"
            rules={[{ required: true, message: '请输入岗位编码' }]}
          >
            <Input placeholder="请输入岗位编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="positionName"
            label="岗位名称"
            rules={[{ required: true, message: '请输入岗位名称' }]}
          >
            <Input placeholder="请输入岗位名称" />
          </Form.Item>
          <Form.Item name="orgId" label="所属组织">
            <TreeSelect
              placeholder="请选择"
              allowClear
              treeData={orgTree}
              fieldNames={{ label: 'orgName', value: 'orgId', children: 'children' }}
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item name="positionLevel" label="岗位层级">
            <Select placeholder="请选择" options={OA_POSITION_LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="sortNo" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数值越小越靠前" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={OA_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
