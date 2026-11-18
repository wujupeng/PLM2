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
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { erpProcessResourceService } from '@/services/erpProcessService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PROCESS_RESOURCE_STATUS_LABEL,
  ERP_PROCESS_RESOURCE_STATUS_OPTIONS,
  ERP_PROCESS_RESOURCE_TYPE_LABEL,
  ERP_PROCESS_RESOURCE_TYPE_OPTIONS,
  type ErpProcessResource,
  type ErpProcessResourceQuery,
  type ErpProcessResourceSaveRequest,
} from '@/types/erpProcess';

const { Title } = Typography;

const MANAGE = 'erp:process:resource:manage';

export default function ErpProcessResourcePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ErpProcessResourceSaveRequest>();
  const [data, setData] = useState<ErpProcessResource[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [resourceType, setResourceType] = useState<string | undefined>(undefined);
  const [resourceStatus, setResourceStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = resourceType,
      status = resourceStatus,
    ) => {
      setLoading(true);
      try {
        const params: ErpProcessResourceQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          resourceType: type,
          resourceStatus: status,
        };
        const res = await erpProcessResourceService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, resourceType, resourceStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ resourceType: 'MACHINE', resourceStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: ErpProcessResource) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpProcessResourceSaveRequest = { ...values };
      if (editId == null) {
        await erpProcessResourceService.create(payload);
        message.success('资源资料已创建');
      } else {
        await erpProcessResourceService.update(editId, payload);
        message.success('资源资料已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpProcessResourceService.remove(id);
    message.success('资源资料已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpProcessResource> = [
    { title: '资源编码', dataIndex: 'resourceCode', width: 150, fixed: 'left', render: plain },
    { title: '资源名称', dataIndex: 'resourceName', width: 160, render: plain },
    {
      title: '资源类型',
      dataIndex: 'resourceType',
      width: 110,
      render: (v) => statusTag(ERP_PROCESS_RESOURCE_TYPE_LABEL, v),
    },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '资源分组', dataIndex: 'resourceGroup', width: 130, render: plain },
    { title: '工作中心', dataIndex: 'workCenter', width: 130, render: plain },
    { title: '产能', dataIndex: 'capacity', width: 110, render: plain },
    { title: '产能单位', dataIndex: 'capacityUnit', width: 110, render: plain },
    { title: '计量单位', dataIndex: 'uom', width: 100, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '资源状态',
      dataIndex: 'resourceStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_PROCESS_RESOURCE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该资源资料？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        资源资料
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="资源类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={resourceType}
              onChange={(v) => setResourceType(v)}
              options={[...ERP_PROCESS_RESOURCE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="资源状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={resourceStatus}
              onChange={(v) => setResourceStatus(v)}
              options={[...ERP_PROCESS_RESOURCE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="资源编码 / 资源名称 / 规格型号"
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
                  void loadData(1, pageSize, keyword, resourceType, resourceStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setResourceType(undefined);
                  setResourceStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建资源资料</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`资源资料（共 ${total} 条）`}>
        <Table<ErpProcessResource>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1800 }}
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
        title={editId == null ? '新建资源资料' : '编辑资源资料'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="resourceCode"
            label="资源编码"
            rules={[{ required: true, message: '请输入资源编码' }]}
          >
            <Input placeholder="请输入资源编码" />
          </Form.Item>
          <Form.Item name="resourceName" label="资源名称">
            <Input placeholder="请输入资源名称" />
          </Form.Item>
          <Form.Item name="resourceType" label="资源类型">
            <Select placeholder="为空默认 MACHINE" options={[...ERP_PROCESS_RESOURCE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="resourceGroup" label="资源分组">
            <Input placeholder="请输入资源分组" />
          </Form.Item>
          <Form.Item name="workCenter" label="工作中心">
            <Input placeholder="请输入工作中心" />
          </Form.Item>
          <Form.Item name="capacity" label="产能">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入产能" />
          </Form.Item>
          <Form.Item name="capacityUnit" label="产能单位">
            <Input placeholder="请输入产能单位" />
          </Form.Item>
          <Form.Item name="uom" label="计量单位">
            <Input placeholder="请输入计量单位" />
          </Form.Item>
          <Form.Item name="resourceStatus" label="资源状态">
            <Select placeholder="为空默认 ACTIVE" options={[...ERP_PROCESS_RESOURCE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
