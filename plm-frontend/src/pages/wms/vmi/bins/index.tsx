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
import { wmsVmiBinService as service } from '@/services/wmsVmiService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_VMI_BIN_STATUS_LABEL,
  WMS_VMI_BIN_STATUS_OPTIONS,
  WMS_VMI_BIN_TYPE_LABEL,
  WMS_VMI_BIN_TYPE_OPTIONS,
  type WmsVmiBin,
  type WmsVmiBinQuery,
  type WmsVmiBinSaveRequest,
} from '@/types/wmsVmi';

const { Title } = Typography;

const MANAGE = 'wms:vmi:bin:manage';

type FormValues = WmsVmiBinSaveRequest;

export default function WmsVmiBinPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsVmiBin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [binStatus, setBinStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = binStatus) => {
      setLoading(true);
      try {
        const params: WmsVmiBinQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          binStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, binStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ binType: 'STORAGE', binStatus: 'IDLE' });
    setOpen(true);
  };

  const openEdit = (record: WmsVmiBin) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsVmiBinSaveRequest = { ...values };
      if (editId == null) {
        await service.create(payload);
        message.success('VMI库位已创建');
      } else {
        await service.update(editId, payload);
        message.success('VMI库位已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('VMI库位已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsVmiBin> = [
    { title: 'VMI库位单号', dataIndex: 'vmiBinNo', width: 190, fixed: 'left', render: plain },
    {
      title: '库位类型',
      dataIndex: 'binType',
      width: 110,
      render: (v) => statusTag(WMS_VMI_BIN_TYPE_LABEL, v),
    },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '库位编码', dataIndex: 'binCode', width: 120, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '库位容量', dataIndex: 'capacityQty', width: 110, render: plain },
    { title: '托盘数', dataIndex: 'palletQty', width: 100, render: plain },
    { title: '最大托盘数', dataIndex: 'maxPalletQty', width: 110, render: plain },
    { title: '二维码', dataIndex: 'qrCode', width: 180, render: plain },
    {
      title: '库位状态',
      dataIndex: 'binStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_VMI_BIN_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该VMI库位？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        VMI库位
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="库位状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={binStatus}
              onChange={(v) => setBinStatus(v)}
              options={[...WMS_VMI_BIN_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="库位单号 / 仓库编码 / 库位编码 / 物料编码 / 物料名称"
              allowClear
              style={{ width: 360 }}
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
                  void loadData(1, pageSize, keyword, binStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBinStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建VMI库位</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`VMI库位（共 ${total} 条）`}>
        <Table<WmsVmiBin>
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
        title={editId == null ? '新建VMI库位' : '编辑VMI库位'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="vmiBinNo" label="VMI库位单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="binType" label="库位类型">
            <Select placeholder="为空默认 STORAGE" options={[...WMS_VMI_BIN_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="binCode" label="库位编码">
            <Input placeholder="请输入库位编码" />
          </Form.Item>
          <Form.Item
            name="materialCode"
            label="物料编码"
            rules={[{ required: true, message: '请输入物料编码' }]}
          >
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格">
            <Input placeholder="请输入规格" />
          </Form.Item>
          <Form.Item name="capacityQty" label="库位容量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="palletQty" label="托盘数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="maxPalletQty" label="最大托盘数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="qrCode" label="二维码">
            <Input placeholder="请输入二维码内容" />
          </Form.Item>
          <Form.Item name="binStatus" label="库位状态">
            <Select placeholder="为空默认 IDLE" options={[...WMS_VMI_BIN_STATUS_OPTIONS]} />
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
