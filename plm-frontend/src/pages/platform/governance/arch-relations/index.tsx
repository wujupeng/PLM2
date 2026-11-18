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
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { govArchRelationService } from '@/services/governanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  GOV_RELATION_STATUS_LABEL,
  GOV_RELATION_STATUS_OPTIONS,
  GOV_RELATION_TYPE_LABEL,
  GOV_RELATION_TYPE_OPTIONS,
  type GovArchRelationItem,
  type GovArchRelationSaveParams,
} from '@/types/governance';

const { Title } = Typography;

const MANAGE = 'platform:gov:archrelation:manage';

export default function GovArchRelationPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<GovArchRelationSaveParams>();
  const [data, setData] = useState<GovArchRelationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [sourceComponent, setSourceComponent] = useState('');
  const [targetComponent, setTargetComponent] = useState('');
  const [relationType, setRelationType] = useState<string | undefined>(undefined);
  const [relationStatus, setRelationStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      sComp = sourceComponent,
      tComp = targetComponent,
      rType = relationType,
      rStatus = relationStatus,
    ) => {
      setLoading(true);
      try {
        const res = await govArchRelationService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          sourceComponent: sComp || undefined,
          targetComponent: tComp || undefined,
          relationType: rType,
          relationStatus: rStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, sourceComponent, targetComponent, relationType, relationStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ relationType: 'CALL', relationStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: GovArchRelationItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: GovArchRelationSaveParams = { ...values };
      if (editId == null) {
        await govArchRelationService.create(payload);
        message.success('架构关系已创建');
      } else {
        await govArchRelationService.update(editId, payload);
        message.success('架构关系已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await govArchRelationService.remove(id);
    message.success('架构关系已删除');
    void loadData();
  };

  const columns: ColumnsType<GovArchRelationItem> = [
    { title: '关系编号', dataIndex: 'relationNo', width: 160, fixed: 'left', render: plain },
    { title: '源组件', dataIndex: 'sourceComponent', width: 160, render: plain },
    { title: '目标组件', dataIndex: 'targetComponent', width: 160, render: plain },
    {
      title: '关系类型',
      dataIndex: 'relationType',
      width: 110,
      render: (v) => statusTag(GOV_RELATION_TYPE_LABEL, v),
    },
    { title: '协议', dataIndex: 'protocol', width: 120, render: plain },
    { title: '关系说明', dataIndex: 'relationDesc', width: 200, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'relationStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(GOV_RELATION_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该架构关系？" onConfirm={() => void remove(record.id)}>
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
        架构关系
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="源组件">
            <Input
              placeholder="请输入源组件"
              allowClear
              style={{ width: 150 }}
              value={sourceComponent}
              onChange={(e) => setSourceComponent(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="目标组件">
            <Input
              placeholder="请输入目标组件"
              allowClear
              style={{ width: 150 }}
              value={targetComponent}
              onChange={(e) => setTargetComponent(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关系类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={relationType}
              onChange={(v) => setRelationType(v)}
              options={[...GOV_RELATION_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关系状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={relationStatus}
              onChange={(v) => setRelationStatus(v)}
              options={[...GOV_RELATION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="关系编号 / 关系说明"
              allowClear
              style={{ width: 180 }}
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
                  void loadData(1, pageSize, keyword, sourceComponent, targetComponent, relationType, relationStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSourceComponent('');
                  setTargetComponent('');
                  setRelationType(undefined);
                  setRelationStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建架构关系</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`架构关系（共 ${total} 条）`}>
        <Table<GovArchRelationItem>
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
        title={editId == null ? '新建架构关系' : '编辑架构关系'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="relationNo" label="关系编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="sourceComponent" label="源组件" rules={[{ required: true, message: '请输入源组件' }]}>
            <Input placeholder="请输入源组件（组件编号）" />
          </Form.Item>
          <Form.Item name="targetComponent" label="目标组件" rules={[{ required: true, message: '请输入目标组件' }]}>
            <Input placeholder="请输入目标组件（组件编号）" />
          </Form.Item>
          <Form.Item name="relationType" label="关系类型">
            <Select placeholder="请选择" options={[...GOV_RELATION_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="protocol" label="协议">
            <Input placeholder="请输入协议" />
          </Form.Item>
          <Form.Item name="relationDesc" label="关系说明">
            <Input.TextArea rows={2} placeholder="请输入关系说明" />
          </Form.Item>
          <Form.Item name="relationStatus" label="关系状态">
            <Select placeholder="请选择" options={[...GOV_RELATION_STATUS_OPTIONS]} />
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
