import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckOutlined, CloseOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { configService } from '@/services/systemService';
import type { ConfigItem, ConfigSaveParams } from '@/types/system';
import { CONFIG_CATEGORIES } from '@/types/system';
import { useAuthStore } from '@/stores/authStore';

const { Title, Text } = Typography;

function categoryLabel(value: string): string {
  return CONFIG_CATEGORIES.find((c) => c.value === value)?.label || value;
}

export default function ConfigsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ConfigSaveParams>();

  const [category, setCategory] = useState<string>(CONFIG_CATEGORIES[0].value);
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [pendingConfirm, setPendingConfirm] = useState<number | undefined>(undefined);

  const [data, setData] = useState<ConfigItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ConfigItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [valueEditingId, setValueEditingId] = useState<number | null>(null);
  const [valueDraft, setValueDraft] = useState<string>('');
  const [valueSaving, setValueSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      cond?: { category?: string; keyword?: string; pendingConfirm?: number },
    ) => {
      setLoading(true);
      try {
        const res = await configService.page({
          pageNum: page,
          pageSize: size,
          category: cond?.category ?? category,
          keyword: cond?.keyword ?? keyword,
          pendingConfirm: cond?.pendingConfirm ?? pendingConfirm,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, category, keyword, pendingConfirm],
  );

  useEffect(() => {
    void loadData(1, pageSize, { category, keyword: undefined, pendingConfirm: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTabChange = (key: string) => {
    setCategory(key);
    setPageNum(1);
    void loadData(1, pageSize, { category: key, keyword, pendingConfirm });
  };

  const onSearch = () => {
    setPageNum(1);
    void loadData(1, pageSize, { category, keyword, pendingConfirm });
  };

  const onReset = () => {
    setKeyword(undefined);
    setPendingConfirm(undefined);
    setPageNum(1);
    void loadData(1, pageSize, { category, keyword: undefined, pendingConfirm: undefined });
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ category, pendingConfirm: 0, editable: 1 });
    setModalOpen(true);
  };

  const openEdit = (record: ConfigItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      category: record.category,
      configKey: record.configKey,
      configName: record.configName,
      configValue: record.configValue,
      pendingConfirm: record.pendingConfirm,
      editable: record.editable,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editing) {
        await configService.update(editing.id, values);
        message.success('更新成功');
      } else {
        await configService.create(values);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: ConfigItem) => {
    await configService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const startValueEdit = (record: ConfigItem) => {
    setValueEditingId(record.id);
    setValueDraft(record.configValue);
  };

  const saveValueEdit = async (record: ConfigItem) => {
    setValueSaving(true);
    try {
      await configService.updateValue(record.id, valueDraft);
      message.success('配置值已更新');
      setValueEditingId(null);
      void loadData();
    } finally {
      setValueSaving(false);
    }
  };

  const columns: ColumnsType<ConfigItem> = [
    { title: '配置键', dataIndex: 'configKey', width: 200 },
    { title: '配置名称', dataIndex: 'configName', width: 180 },
    {
      title: '配置值',
      dataIndex: 'configValue',
      width: 320,
      render: (v: string, record) => {
        if (valueEditingId === record.id) {
          return (
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={valueDraft}
                onChange={(e) => setValueDraft(e.target.value)}
                onPressEnter={() => saveValueEdit(record)}
                autoFocus
              />
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={valueSaving}
                onClick={() => saveValueEdit(record)}
              />
              <Button icon={<CloseOutlined />} onClick={() => setValueEditingId(null)} />
            </Space.Compact>
          );
        }
        return (
          <Space>
            <Text style={{ wordBreak: 'break-all' }}>{v || '-'}</Text>
            {hasPermission('system:config:update') &&
              (record.editable === 1 ? (
                <Tooltip title="行内编辑">
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => startValueEdit(record)}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="该配置不可编辑">
                  <EditOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />
                </Tooltip>
              ))}
          </Space>
        );
      },
    },
    {
      title: '待确认',
      dataIndex: 'pendingConfirm',
      width: 140,
      render: (v: number) =>
        v === 1 ? <Tag color="warning">待业务方确认</Tag> : <Tag color="success">已确认</Tag>,
    },
    {
      title: '可编辑',
      dataIndex: 'editable',
      width: 90,
      render: (v: number) => (v === 1 ? <Tag color="blue">可编辑</Tag> : <Tag>只读</Tag>),
    },
    { title: '备注', dataIndex: 'remark', render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {hasPermission('system:config:update') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('system:config:delete') && (
            <Popconfirm title="确认删除该配置项？" onConfirm={() => handleDelete(record)}>
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
        配置项管理
      </Title>

      <Alert
        type="info"
        showIcon
        message="未明确的编码规则与业务规则统一在此配置，避免在代码中写死"
        description="按分类维护系统编码规则（CODE）、标签规则（LABEL）、EDI 规则（EDI）、物料规则（MATERIAL）。标记为「待业务方确认」的配置项表示取值尚未最终确定，可直接在表格中对可编辑项做行内修改。"
      />

      <Card>
        <Tabs
          activeKey={category}
          onChange={onTabChange}
          items={CONFIG_CATEGORIES.map((c) => ({ key: c.value, label: c.label }))}
        />
        <Space wrap style={{ marginTop: 8 }}>
          <Input
            placeholder="配置键 / 名称关键词"
            allowClear
            style={{ width: 220 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={onSearch}
          />
          <Select
            placeholder="是否待确认"
            allowClear
            style={{ width: 160 }}
            value={pendingConfirm}
            onChange={(v) => setPendingConfirm(v)}
            options={[
              { value: 1, label: '待业务方确认' },
              { value: 0, label: '已确认' },
            ]}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
            查询
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onReset}>
            重置
          </Button>
        </Space>
      </Card>

      <Card
        title={`${categoryLabel(category)}（共 ${total} 条）`}
        extra={
          hasPermission('system:config:create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增配置项
            </Button>
          )
        }
      >
        <Table<ConfigItem>
          rowKey="id"
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
        title={editing ? '编辑配置项' : '新增配置项'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="category"
            label="配置分类"
            rules={[{ required: true, message: '请选择配置分类' }]}
          >
            <Select options={CONFIG_CATEGORIES} />
          </Form.Item>
          <Form.Item
            name="configKey"
            label="配置键"
            rules={[{ required: true, message: '请输入配置键' }]}
          >
            <Input placeholder="请输入配置键，如 MATERIAL_CODE_PREFIX" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="configName"
            label="配置名称"
            rules={[{ required: true, message: '请输入配置名称' }]}
          >
            <Input placeholder="请输入配置名称" />
          </Form.Item>
          <Form.Item
            name="configValue"
            label="配置值"
            rules={[{ required: true, message: '请输入配置值' }]}
          >
            <Input.TextArea rows={2} placeholder="请输入配置值" />
          </Form.Item>
          <Form.Item name="pendingConfirm" label="是否待业务方确认" initialValue={0}>
            <Select
              options={[
                { value: 1, label: '待业务方确认' },
                { value: 0, label: '已确认' },
              ]}
            />
          </Form.Item>
          <Form.Item name="editable" label="是否允许行内编辑" initialValue={1}>
            <Select
              options={[
                { value: 1, label: '允许编辑' },
                { value: 0, label: '只读' },
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
