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
import { intgPlmErpMappingService as service } from '@/services/intgPlmErpService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  INTG_PLM_ERP_MAPPING_STATUS_LABEL,
  INTG_PLM_ERP_MAPPING_STATUS_OPTIONS,
  INTG_PLM_ERP_OBJECT_TYPE_LABEL,
  INTG_PLM_ERP_OBJECT_TYPE_OPTIONS,
  INTG_PLM_ERP_REQUIRED_FLAG_OPTIONS,
  type IntgPlmErpMapping,
  type IntgPlmErpMappingQuery,
  type IntgPlmErpMappingSaveRequest,
} from '@/types/intgPlmErp';

const { Title } = Typography;

const MANAGE = 'intg:plm-erp:mapping:manage';

export default function IntgPlmErpMappingPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<IntgPlmErpMappingSaveRequest>();
  const [data, setData] = useState<IntgPlmErpMapping[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [objectType, setObjectType] = useState<string | undefined>(undefined);
  const [mappingStatus, setMappingStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = objectType,
      status = mappingStatus,
    ) => {
      setLoading(true);
      try {
        const params: IntgPlmErpMappingQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          objectType: type,
          mappingStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, objectType, mappingStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ objectType: 'MATERIAL', requiredFlag: 0, mappingStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: IntgPlmErpMapping) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: IntgPlmErpMappingSaveRequest = { ...values };
      if (editId == null) {
        await service.create(payload);
        message.success('字段映射已创建');
      } else {
        await service.update(editId, payload);
        message.success('字段映射已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('字段映射已删除');
    void loadData();
  };

  const columns: ColumnsType<IntgPlmErpMapping> = [
    { title: '映射编号', dataIndex: 'mappingNo', width: 200, fixed: 'left', render: plain },
    { title: '映射名称', dataIndex: 'mappingName', width: 180, render: plain },
    { title: '接口编号', dataIndex: 'interfaceNo', width: 200, render: plain },
    {
      title: '集成对象',
      dataIndex: 'objectType',
      width: 120,
      render: (v) => statusTag(INTG_PLM_ERP_OBJECT_TYPE_LABEL, v),
    },
    { title: '源字段', dataIndex: 'sourceField', width: 160, render: plain },
    { title: '目标字段', dataIndex: 'targetField', width: 160, render: plain },
    { title: '转换规则', dataIndex: 'transformRule', width: 180, render: plain },
    {
      title: '是否必填',
      dataIndex: 'requiredFlag',
      width: 110,
      render: (v) => (v === 1 ? '是' : '否'),
    },
    {
      title: '状态',
      dataIndex: 'mappingStatus',
      width: 110,
      render: (v) => statusTag(INTG_PLM_ERP_MAPPING_STATUS_LABEL, v),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该字段映射？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        字段映射
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="集成对象">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={objectType}
              onChange={(v) => setObjectType(v)}
              options={[...INTG_PLM_ERP_OBJECT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="映射状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={mappingStatus}
              onChange={(v) => setMappingStatus(v)}
              options={[...INTG_PLM_ERP_MAPPING_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="映射编号 / 映射名称 / 源字段 / 目标字段"
              allowClear
              style={{ width: 380 }}
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
                  void loadData(1, pageSize, keyword, objectType, mappingStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setObjectType(undefined);
                  setMappingStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建字段映射</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`字段映射（共 ${total} 条）`}>
        <Table<IntgPlmErpMapping>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2000 }}
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
        title={editId == null ? '新建字段映射' : '编辑字段映射'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="mappingNo" label="映射编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item
            name="mappingName"
            label="映射名称"
            rules={[{ required: true, message: '请输入映射名称' }]}
          >
            <Input placeholder="请输入映射名称" />
          </Form.Item>
          <Form.Item name="interfaceNo" label="接口编号">
            <Input placeholder="请输入接口编号" />
          </Form.Item>
          <Form.Item name="objectType" label="集成对象">
            <Select placeholder="为空默认 MATERIAL" options={[...INTG_PLM_ERP_OBJECT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourceField" label="源字段">
            <Input placeholder="请输入源字段" />
          </Form.Item>
          <Form.Item name="targetField" label="目标字段">
            <Input placeholder="请输入目标字段" />
          </Form.Item>
          <Form.Item name="transformRule" label="转换规则">
            <Input placeholder="请输入转换规则" />
          </Form.Item>
          <Form.Item name="defaultValue" label="默认值">
            <Input placeholder="请输入默认值" />
          </Form.Item>
          <Form.Item name="requiredFlag" label="是否必填">
            <Select placeholder="为空默认 否" options={[...INTG_PLM_ERP_REQUIRED_FLAG_OPTIONS]} />
          </Form.Item>
          <Form.Item name="mappingStatus" label="状态">
            <Select placeholder="为空默认 DRAFT" options={[...INTG_PLM_ERP_MAPPING_STATUS_OPTIONS]} />
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
