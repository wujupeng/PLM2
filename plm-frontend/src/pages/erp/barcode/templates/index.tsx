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
import { erpBarcodeTemplateService } from '@/services/erpBarcodeService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_BARCODE_TEMPLATE_TYPE_LABEL,
  ERP_BARCODE_TEMPLATE_TYPE_OPTIONS,
  ERP_COMMON_ACTIVE_STATUS_LABEL,
  ERP_COMMON_ACTIVE_STATUS_OPTIONS,
  type ErpBarcodeTemplate,
  type ErpBarcodeTemplateQuery,
  type ErpBarcodeTemplateSaveRequest,
} from '@/types/erpBarcode';

const { Title } = Typography;

const MANAGE = 'erp:barcode:template:manage';

export default function ErpBarcodeTemplatePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ErpBarcodeTemplateSaveRequest>();
  const [data, setData] = useState<ErpBarcodeTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [templateType, setTemplateType] = useState<string | undefined>(undefined);
  const [templateStatus, setTemplateStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = templateType,
      status = templateStatus,
    ) => {
      setLoading(true);
      try {
        const params: ErpBarcodeTemplateQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          templateType: type,
          templateStatus: status,
        };
        const res = await erpBarcodeTemplateService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, templateType, templateStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      templateType: 'MATERIAL',
      templateStatus: 'ACTIVE',
      labelWidth: 40,
      labelHeight: 30,
    });
    setOpen(true);
  };

  const openEdit = (record: ErpBarcodeTemplate) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editId == null) {
        await erpBarcodeTemplateService.create(values);
        message.success('标签模板已创建');
      } else {
        await erpBarcodeTemplateService.update(editId, values);
        message.success('标签模板已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpBarcodeTemplateService.remove(id);
    message.success('标签模板已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpBarcodeTemplate> = [
    { title: '模板编码', dataIndex: 'templateCode', width: 170, fixed: 'left', render: plain },
    { title: '模板名称', dataIndex: 'templateName', width: 160, render: plain },
    {
      title: '模板类型',
      dataIndex: 'templateType',
      width: 120,
      render: (v) => statusTag(ERP_BARCODE_TEMPLATE_TYPE_LABEL, v),
    },
    { title: '标签宽度(mm)', dataIndex: 'labelWidth', width: 130, render: plain },
    { title: '标签高度(mm)', dataIndex: 'labelHeight', width: 130, render: plain },
    { title: '打印权限', dataIndex: 'printPermission', width: 140, render: plain },
    { title: '内容配置', dataIndex: 'contentConfig', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '模板状态',
      dataIndex: 'templateStatus',
      width: 120,
      fixed: 'right',
      render: (v) => statusTag(ERP_COMMON_ACTIVE_STATUS_LABEL, v),
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
            <Popconfirm
              title="确认删除该标签模板？"
              onConfirm={() => record.id != null && void remove(record.id)}
            >
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
        标签模板
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="模板类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={templateType}
              onChange={(v) => setTemplateType(v)}
              options={[...ERP_BARCODE_TEMPLATE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="模板状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={templateStatus}
              onChange={(v) => setTemplateStatus(v)}
              options={[...ERP_COMMON_ACTIVE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="模板编码 / 模板名称"
              allowClear
              style={{ width: 260 }}
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
                  void loadData(1, pageSize, keyword, templateType, templateStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setTemplateType(undefined);
                  setTemplateStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建标签模板</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`标签模板（共 ${total} 条）`}>
        <Table<ErpBarcodeTemplate>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
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
        title={editId == null ? '新建标签模板' : '编辑标签模板'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="templateCode"
            label="模板编码"
            rules={[{ required: true, message: '请输入模板编码' }]}
          >
            <Input placeholder="请输入模板编码" />
          </Form.Item>
          <Form.Item name="templateName" label="模板名称">
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          <Form.Item name="templateType" label="模板类型">
            <Select placeholder="为空默认 MATERIAL" options={[...ERP_BARCODE_TEMPLATE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="labelWidth" label="标签宽度">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入标签宽度" />
          </Form.Item>
          <Form.Item name="labelHeight" label="标签高度">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入标签高度" />
          </Form.Item>
          <Form.Item name="contentConfig" label="内容配置">
            <Input.TextArea rows={2} placeholder="请输入内容配置" />
          </Form.Item>
          <Form.Item name="printPermission" label="打印权限">
            <Input placeholder="请输入打印权限" />
          </Form.Item>
          <Form.Item name="templateStatus" label="模板状态">
            <Select placeholder="为空默认 ACTIVE" options={[...ERP_COMMON_ACTIVE_STATUS_OPTIONS]} />
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
