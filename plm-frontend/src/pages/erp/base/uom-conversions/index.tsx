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
import { erpUomConversionService } from '@/services/erpBaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_ACTIVE_STATUS_LABEL,
  ERP_ACTIVE_STATUS_OPTIONS,
  type ErpUomConversion,
  type ErpUomConversionSaveRequest,
} from '@/types/erpBase';

const { Title } = Typography;

const MANAGE = 'erp:base:uomconversion:manage';

export default function ErpUomConversionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ErpUomConversionSaveRequest>();
  const [data, setData] = useState<ErpUomConversion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [materialCode, setMaterialCode] = useState('');
  const [conversionStatus, setConversionStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      mCode = materialCode,
      cStatus = conversionStatus,
    ) => {
      setLoading(true);
      try {
        const res = await erpUomConversionService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          materialCode: mCode || undefined,
          conversionStatus: cStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, materialCode, conversionStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ conversionStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: ErpUomConversion) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editId == null) {
        await erpUomConversionService.create(values);
        message.success('单位换算已创建');
      } else {
        await erpUomConversionService.update(editId, values);
        message.success('单位换算已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpUomConversionService.remove(id);
    message.success('单位换算已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpUomConversion> = [
    { title: '换算编号', dataIndex: 'conversionNo', width: 160, fixed: 'left', render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: plain },
    { title: '源单位', dataIndex: 'fromUom', width: 120, render: plain },
    { title: '目标单位', dataIndex: 'toUom', width: 120, render: plain },
    { title: '换算率', dataIndex: 'conversionRate', width: 120, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '换算状态',
      dataIndex: 'conversionStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_ACTIVE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该单位换算？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        单位换算
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="物料编码">
            <Input
              placeholder="请输入物料编码"
              allowClear
              style={{ width: 160 }}
              value={materialCode}
              onChange={(e) => setMaterialCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="换算状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={conversionStatus}
              onChange={(v) => setConversionStatus(v)}
              options={[...ERP_ACTIVE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="换算编号 / 物料编码"
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
                  void loadData(1, pageSize, keyword, materialCode, conversionStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setMaterialCode('');
                  setConversionStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建单位换算</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`单位换算（共 ${total} 条）`}>
        <Table<ErpUomConversion>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1300 }}
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
        title={editId == null ? '新建单位换算' : '编辑单位换算'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="conversionNo" label="换算编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="fromUom" label="源单位" rules={[{ required: true, message: '请输入源单位' }]}>
            <Input placeholder="请输入源单位" />
          </Form.Item>
          <Form.Item name="toUom" label="目标单位" rules={[{ required: true, message: '请输入目标单位' }]}>
            <Input placeholder="请输入目标单位" />
          </Form.Item>
          <Form.Item name="conversionRate" label="换算率">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入换算率" />
          </Form.Item>
          <Form.Item name="conversionStatus" label="换算状态">
            <Select placeholder="为空默认 ACTIVE" options={[...ERP_ACTIVE_STATUS_OPTIONS]} />
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
