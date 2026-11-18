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
import { govProcessNodeService } from '@/services/governanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  GOV_NODE_STATUS_LABEL,
  GOV_NODE_STATUS_OPTIONS,
  GOV_NODE_TYPE_LABEL,
  GOV_NODE_TYPE_OPTIONS,
  type GovProcessNodeItem,
  type GovProcessNodeSaveParams,
} from '@/types/governance';

const { Title } = Typography;

const MANAGE = 'platform:gov:processnode:manage';

export default function GovProcessNodePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<GovProcessNodeSaveParams>();
  const [data, setData] = useState<GovProcessNodeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [processCode, setProcessCode] = useState('');
  const [nodeType, setNodeType] = useState<string | undefined>(undefined);
  const [nodeStatus, setNodeStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      pCode = processCode,
      nType = nodeType,
      nStatus = nodeStatus,
    ) => {
      setLoading(true);
      try {
        const res = await govProcessNodeService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          processCode: pCode || undefined,
          nodeType: nType,
          nodeStatus: nStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, processCode, nodeType, nodeStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ nodeType: 'ACTIVITY', nodeStatus: 'ACTIVE', seqNo: 1 });
    setOpen(true);
  };

  const openEdit = (record: GovProcessNodeItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: GovProcessNodeSaveParams = { ...values };
      if (editId == null) {
        await govProcessNodeService.create(payload);
        message.success('流程节点已创建');
      } else {
        await govProcessNodeService.update(editId, payload);
        message.success('流程节点已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await govProcessNodeService.remove(id);
    message.success('流程节点已删除');
    void loadData();
  };

  const columns: ColumnsType<GovProcessNodeItem> = [
    { title: '节点编号', dataIndex: 'nodeNo', width: 160, fixed: 'left', render: plain },
    { title: '所属流程编码', dataIndex: 'processCode', width: 150, render: plain },
    { title: '节点编码', dataIndex: 'nodeCode', width: 140, render: plain },
    { title: '节点名称', dataIndex: 'nodeName', width: 200, render: plain },
    { title: '节点类型', dataIndex: 'nodeType', width: 110, render: (v) => statusTag(GOV_NODE_TYPE_LABEL, v) },
    { title: '顺序号', dataIndex: 'seqNo', width: 90, render: (v) => (v == null ? '-' : String(v)) },
    { title: '角色名称', dataIndex: 'roleName', width: 140, render: plain },
    { title: '系统域', dataIndex: 'systemDomain', width: 120, render: plain },
    { title: '输入物', dataIndex: 'inputArtifact', width: 160, ellipsis: true, render: plain },
    { title: '输出物', dataIndex: 'outputArtifact', width: 160, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'nodeStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(GOV_NODE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该流程节点？" onConfirm={() => void remove(record.id)}>
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
        流程节点
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="所属流程编码">
            <Input
              placeholder="请输入流程编码"
              allowClear
              style={{ width: 180 }}
              value={processCode}
              onChange={(e) => setProcessCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="节点类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={nodeType}
              onChange={(v) => setNodeType(v)}
              options={[...GOV_NODE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="节点状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={nodeStatus}
              onChange={(v) => setNodeStatus(v)}
              options={[...GOV_NODE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="节点编号 / 编码 / 名称"
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
                  void loadData(1, pageSize, keyword, processCode, nodeType, nodeStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setProcessCode('');
                  setNodeType(undefined);
                  setNodeStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建流程节点</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`流程节点（共 ${total} 条）`}>
        <Table<GovProcessNodeItem>
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
        title={editId == null ? '新建流程节点' : '编辑流程节点'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="nodeNo" label="节点编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="processCode"
            label="所属流程编码"
            rules={[{ required: true, message: '请输入所属流程编码' }]}
          >
            <Input placeholder="请输入所属流程编码" />
          </Form.Item>
          <Form.Item name="nodeCode" label="节点编码">
            <Input placeholder="请输入节点编码" />
          </Form.Item>
          <Form.Item name="nodeName" label="节点名称" rules={[{ required: true, message: '请输入节点名称' }]}>
            <Input placeholder="请输入节点名称" />
          </Form.Item>
          <Form.Item name="nodeType" label="节点类型">
            <Select placeholder="请选择" options={[...GOV_NODE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="seqNo" label="节点顺序号">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入节点顺序号" />
          </Form.Item>
          <Form.Item name="roleName" label="角色名称">
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item name="systemDomain" label="系统域">
            <Input placeholder="请输入系统域" />
          </Form.Item>
          <Form.Item name="inputArtifact" label="输入物">
            <Input placeholder="请输入输入物" />
          </Form.Item>
          <Form.Item name="outputArtifact" label="输出物">
            <Input placeholder="请输入输出物" />
          </Form.Item>
          <Form.Item name="nodeStatus" label="节点状态">
            <Select placeholder="请选择" options={[...GOV_NODE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
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
