import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { erpInventoryBalanceService } from '@/services/erpInventoryService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import type {
  ErpInventoryBalance,
  ErpInventoryBalanceQuery,
  ErpInventoryBalanceSaveRequest,
} from '@/types/erpInventory';

const { Title } = Typography;

const MANAGE = 'erp:inventory:balance:manage';

/** 主单头表单。 */
type FormValues = ErpInventoryBalanceSaveRequest;

export default function ErpInventoryBalancePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpInventoryBalance[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [materialCode, setMaterialCode] = useState('');
  const [warehouseCode, setWarehouseCode] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      material = materialCode,
      warehouse = warehouseCode,
      batch = batchNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpInventoryBalanceQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          materialCode: material || undefined,
          warehouseCode: warehouse || undefined,
          batchNo: batch || undefined,
        };
        const res = await erpInventoryBalanceService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, materialCode, warehouseCode, batchNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: ErpInventoryBalance) => {
    setEditId(record.id ?? null);
    form.resetFields();
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const payload: ErpInventoryBalanceSaveRequest = { ...values };
    setSaving(true);
    try {
      if (editId == null) {
        await erpInventoryBalanceService.create(payload);
        message.success('库存余额已创建');
      } else {
        await erpInventoryBalanceService.update(editId, payload);
        message.success('库存余额已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpInventoryBalanceService.remove(id);
    message.success('库存余额已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpInventoryBalance> = [
    { title: '物料编码', dataIndex: 'materialCode', width: 140, fixed: 'left', render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 130, render: plain },
    { title: '仓库名称', dataIndex: 'warehouseName', width: 150, render: plain },
    { title: '库位', dataIndex: 'locationCode', width: 120, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: plain },
    { title: '在库数量', dataIndex: 'onHandQty', width: 110, render: plain },
    { title: '锁定量', dataIndex: 'lockedQty', width: 100, render: plain },
    { title: '可用量', dataIndex: 'availableQty', width: 100, render: plain },
    { title: '在途量', dataIndex: 'inTransitQty', width: 100, render: plain },
    { title: '平均成本', dataIndex: 'avgCost', width: 110, render: plain },
    { title: '金额', dataIndex: 'amount', width: 120, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    { title: '描述', dataIndex: 'description', width: 150, ellipsis: true, render: plain },
    { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true, render: plain },
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
            <Popconfirm title="确认删除该库存余额？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        库存余额
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
          <Form.Item label="仓库编码">
            <Input
              placeholder="请输入仓库编码"
              allowClear
              style={{ width: 160 }}
              value={warehouseCode}
              onChange={(e) => setWarehouseCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="批次号">
            <Input
              placeholder="请输入批次号"
              allowClear
              style={{ width: 160 }}
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="物料编码 / 物料名称 / 仓库名称"
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
                  void loadData(1, pageSize, keyword, materialCode, warehouseCode, batchNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setMaterialCode('');
                  setWarehouseCode('');
                  setBatchNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建库存余额</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`库存余额（共 ${total} 条）`}>
        <Table<ErpInventoryBalance>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2600 }}
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
        title={editId == null ? '新建库存余额' : '编辑库存余额'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="uom" label="单位">
            <Input placeholder="为空默认 PCS" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码" rules={[{ required: true, message: '请输入仓库编码' }]}>
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="warehouseName" label="仓库名称">
            <Input placeholder="请输入仓库名称" />
          </Form.Item>
          <Form.Item name="locationCode" label="库位">
            <Input placeholder="为空默认空" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="onHandQty" label="在库数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入在库数量" />
          </Form.Item>
          <Form.Item name="lockedQty" label="锁定量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入锁定量" />
          </Form.Item>
          <Form.Item name="availableQty" label="可用量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入可用量" />
          </Form.Item>
          <Form.Item name="inTransitQty" label="在途量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入在途量" />
          </Form.Item>
          <Form.Item name="avgCost" label="平均成本">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入平均成本" />
          </Form.Item>
          <Form.Item name="amount" label="金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入金额" />
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
