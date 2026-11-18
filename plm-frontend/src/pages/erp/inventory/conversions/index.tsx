import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
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
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { erpInventoryConversionService } from '@/services/erpInventoryService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_INVENTORY_CONVERSION_STATUS_LABEL,
  ERP_INVENTORY_CONVERSION_STATUS_OPTIONS,
  ERP_INVENTORY_CONVERSION_TYPE_LABEL,
  ERP_INVENTORY_CONVERSION_TYPE_OPTIONS,
  type ErpInventoryConversion,
  type ErpInventoryConversionQuery,
  type ErpInventoryConversionSaveRequest,
} from '@/types/erpInventory';

const { Title } = Typography;

const MANAGE = 'erp:inventory:conversion:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpInventoryConversionSaveRequest, 'conversionDate'> & {
  conversionDate?: Dayjs;
};

export default function ErpInventoryConversionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpInventoryConversion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [conversionType, setConversionType] = useState<string | undefined>(undefined);
  const [conversionStatus, setConversionStatus] = useState<string | undefined>(undefined);
  const [warehouseCode, setWarehouseCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = conversionType,
      status = conversionStatus,
      warehouse = warehouseCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpInventoryConversionQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          conversionType: type,
          conversionStatus: status,
          warehouseCode: warehouse || undefined,
        };
        const res = await erpInventoryConversionService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, conversionType, conversionStatus, warehouseCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ conversionType: 'SPLIT', conversionStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpInventoryConversion) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      conversionDate: record.conversionDate ? dayjs(record.conversionDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpInventoryConversionSaveRequest = {
        ...values,
        conversionDate: values.conversionDate ? values.conversionDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpInventoryConversionService.create(payload);
        message.success('形态转换已创建');
      } else {
        await erpInventoryConversionService.update(editId, payload);
        message.success('形态转换已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpInventoryConversionService.remove(id);
    message.success('形态转换已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpInventoryConversion> = [
    { title: '转换单号', dataIndex: 'conversionNo', width: 170, fixed: 'left', render: plain },
    {
      title: '转换类型',
      dataIndex: 'conversionType',
      width: 100,
      render: (v) => statusTag(ERP_INVENTORY_CONVERSION_TYPE_LABEL, v),
    },
    { title: '源物料编码', dataIndex: 'sourceMaterialCode', width: 140, render: plain },
    { title: '源物料名称', dataIndex: 'sourceMaterialName', width: 160, render: plain },
    { title: '源规格', dataIndex: 'sourceSpec', width: 150, ellipsis: true, render: plain },
    { title: '源数量', dataIndex: 'sourceQty', width: 100, render: plain },
    { title: '源批次', dataIndex: 'sourceBatchNo', width: 140, render: plain },
    { title: '目标物料编码', dataIndex: 'targetMaterialCode', width: 140, render: plain },
    { title: '目标物料名称', dataIndex: 'targetMaterialName', width: 160, render: plain },
    { title: '目标规格', dataIndex: 'targetSpec', width: 150, ellipsis: true, render: plain },
    { title: '目标数量', dataIndex: 'targetQty', width: 100, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 130, render: plain },
    { title: '转换人', dataIndex: 'conversionBy', width: 120, render: plain },
    { title: '转换日期', dataIndex: 'conversionDate', width: 170, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '转换状态',
      dataIndex: 'conversionStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_INVENTORY_CONVERSION_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该形态转换？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        形态转换
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="转换类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={conversionType}
              onChange={(v) => setConversionType(v)}
              options={[...ERP_INVENTORY_CONVERSION_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="转换状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={conversionStatus}
              onChange={(v) => setConversionStatus(v)}
              options={[...ERP_INVENTORY_CONVERSION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="仓库编码">
            <Input
              placeholder="请输入仓库编码"
              allowClear
              style={{ width: 160 }}
              value={warehouseCode}
              onChange={(e) => setWarehouseCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="转换单号 / 源物料编码 / 目标物料编码"
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
                  void loadData(1, pageSize, keyword, conversionType, conversionStatus, warehouseCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setConversionType(undefined);
                  setConversionStatus(undefined);
                  setWarehouseCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建形态转换</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`形态转换（共 ${total} 条）`}>
        <Table<ErpInventoryConversion>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2800 }}
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
        title={editId == null ? '新建形态转换' : '编辑形态转换'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="conversionNo" label="转换单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="conversionType" label="转换类型">
            <Select placeholder="为空默认 SPLIT" options={[...ERP_INVENTORY_CONVERSION_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item
            name="sourceMaterialCode"
            label="源物料编码"
            rules={[{ required: true, message: '请输入源物料编码' }]}
          >
            <Input placeholder="请输入源物料编码" />
          </Form.Item>
          <Form.Item name="sourceMaterialName" label="源物料名称">
            <Input placeholder="请输入源物料名称" />
          </Form.Item>
          <Form.Item name="sourceSpec" label="源规格">
            <Input placeholder="请输入源规格" />
          </Form.Item>
          <Form.Item name="sourceUom" label="源单位">
            <Input placeholder="为空默认 PCS" />
          </Form.Item>
          <Form.Item name="sourceQty" label="源数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入源数量" />
          </Form.Item>
          <Form.Item name="sourceBatchNo" label="源批次">
            <Input placeholder="请输入源批次" />
          </Form.Item>
          <Form.Item
            name="targetMaterialCode"
            label="目标物料编码"
            rules={[{ required: true, message: '请输入目标物料编码' }]}
          >
            <Input placeholder="请输入目标物料编码" />
          </Form.Item>
          <Form.Item name="targetMaterialName" label="目标物料名称">
            <Input placeholder="请输入目标物料名称" />
          </Form.Item>
          <Form.Item name="targetSpec" label="目标规格">
            <Input placeholder="请输入目标规格" />
          </Form.Item>
          <Form.Item name="targetUom" label="目标单位">
            <Input placeholder="为空默认 PCS" />
          </Form.Item>
          <Form.Item name="targetQty" label="目标数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入目标数量" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="conversionBy" label="转换人">
            <Input placeholder="请输入转换人" />
          </Form.Item>
          <Form.Item name="conversionDate" label="转换日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择转换日期" />
          </Form.Item>
          <Form.Item name="conversionStatus" label="转换状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_INVENTORY_CONVERSION_STATUS_OPTIONS]} />
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
