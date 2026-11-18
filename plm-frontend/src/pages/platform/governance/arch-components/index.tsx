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
import { govArchComponentService } from '@/services/governanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  GOV_ARCH_LAYER_LABEL,
  GOV_ARCH_LAYER_OPTIONS,
  GOV_COMPONENT_STATUS_LABEL,
  GOV_COMPONENT_STATUS_OPTIONS,
  type GovArchComponentItem,
  type GovArchComponentSaveParams,
} from '@/types/governance';

const { Title } = Typography;

const MANAGE = 'platform:gov:archcomponent:manage';

export default function GovArchComponentPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<GovArchComponentSaveParams>();
  const [data, setData] = useState<GovArchComponentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [archLayer, setArchLayer] = useState<string | undefined>(undefined);
  const [systemDomain, setSystemDomain] = useState('');
  const [componentStatus, setComponentStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      aLayer = archLayer,
      sDomain = systemDomain,
      cStatus = componentStatus,
    ) => {
      setLoading(true);
      try {
        const res = await govArchComponentService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          archLayer: aLayer,
          systemDomain: sDomain || undefined,
          componentStatus: cStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, archLayer, systemDomain, componentStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ archLayer: 'APPLICATION', componentStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: GovArchComponentItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: GovArchComponentSaveParams = { ...values };
      if (editId == null) {
        await govArchComponentService.create(payload);
        message.success('架构组件已创建');
      } else {
        await govArchComponentService.update(editId, payload);
        message.success('架构组件已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await govArchComponentService.remove(id);
    message.success('架构组件已删除');
    void loadData();
  };

  const columns: ColumnsType<GovArchComponentItem> = [
    { title: '组件编号', dataIndex: 'componentNo', width: 160, fixed: 'left', render: plain },
    { title: '组件编码', dataIndex: 'componentCode', width: 140, render: plain },
    { title: '组件名称', dataIndex: 'componentName', width: 200, render: plain },
    {
      title: '架构分层',
      dataIndex: 'archLayer',
      width: 110,
      render: (v) => statusTag(GOV_ARCH_LAYER_LABEL, v),
    },
    { title: '系统域', dataIndex: 'systemDomain', width: 120, render: plain },
    { title: '组件类型', dataIndex: 'componentType', width: 140, render: plain },
    { title: '技术栈', dataIndex: 'techStack', width: 180, ellipsis: true, render: plain },
    { title: '部署单元', dataIndex: 'deployUnit', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'componentStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(GOV_COMPONENT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该架构组件？" onConfirm={() => void remove(record.id)}>
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
        架构组件
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="架构分层">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={archLayer}
              onChange={(v) => setArchLayer(v)}
              options={[...GOV_ARCH_LAYER_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="系统域">
            <Input
              placeholder="请输入系统域"
              allowClear
              style={{ width: 150 }}
              value={systemDomain}
              onChange={(e) => setSystemDomain(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="组件状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={componentStatus}
              onChange={(v) => setComponentStatus(v)}
              options={[...GOV_COMPONENT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="组件编号 / 编码 / 名称"
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
                  void loadData(1, pageSize, keyword, archLayer, systemDomain, componentStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setArchLayer(undefined);
                  setSystemDomain('');
                  setComponentStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建架构组件</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`架构组件（共 ${total} 条）`}>
        <Table<GovArchComponentItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1900 }}
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
        title={editId == null ? '新建架构组件' : '编辑架构组件'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="componentNo" label="组件编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="componentCode" label="组件编码">
            <Input placeholder="请输入组件编码" />
          </Form.Item>
          <Form.Item name="componentName" label="组件名称" rules={[{ required: true, message: '请输入组件名称' }]}>
            <Input placeholder="请输入组件名称" />
          </Form.Item>
          <Form.Item name="archLayer" label="架构分层">
            <Select placeholder="请选择" options={[...GOV_ARCH_LAYER_OPTIONS]} />
          </Form.Item>
          <Form.Item name="systemDomain" label="系统域">
            <Input placeholder="请输入系统域" />
          </Form.Item>
          <Form.Item name="componentType" label="组件类型">
            <Input placeholder="请输入组件类型" />
          </Form.Item>
          <Form.Item name="techStack" label="技术栈">
            <Input placeholder="请输入技术栈" />
          </Form.Item>
          <Form.Item name="deployUnit" label="部署单元">
            <Input placeholder="请输入部署单元" />
          </Form.Item>
          <Form.Item name="componentStatus" label="组件状态">
            <Select placeholder="请选择" options={[...GOV_COMPONENT_STATUS_OPTIONS]} />
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
