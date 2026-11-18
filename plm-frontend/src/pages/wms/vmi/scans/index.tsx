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
import { wmsVmiScanService as service } from '@/services/wmsVmiService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_VMI_SCAN_STATUS_LABEL,
  WMS_VMI_SCAN_STATUS_OPTIONS,
  WMS_VMI_SCAN_TYPE_LABEL,
  WMS_VMI_SCAN_TYPE_OPTIONS,
  type WmsVmiScan,
  type WmsVmiScanQuery,
  type WmsVmiScanSaveRequest,
} from '@/types/wmsVmi';

const { Title } = Typography;

const MANAGE = 'wms:vmi:scan:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<WmsVmiScanSaveRequest, 'scanTime'> & {
  scanTime?: Dayjs;
};

export default function WmsVmiScanPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsVmiScan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [scanStatus, setScanStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = scanStatus) => {
      setLoading(true);
      try {
        const params: WmsVmiScanQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          scanStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, scanStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ scanType: 'IN', scanStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: WmsVmiScan) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      scanTime: record.scanTime ? dayjs(record.scanTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsVmiScanSaveRequest = {
        ...values,
        scanTime: values.scanTime ? values.scanTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('VMI扫码单已创建');
      } else {
        await service.update(editId, payload);
        message.success('VMI扫码单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('VMI扫码单已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsVmiScan> = [
    { title: '扫码单号', dataIndex: 'scanNo', width: 190, fixed: 'left', render: plain },
    {
      title: '扫码类型',
      dataIndex: 'scanType',
      width: 110,
      render: (v) => statusTag(WMS_VMI_SCAN_TYPE_LABEL, v),
    },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '库位编码', dataIndex: 'binCode', width: 120, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 160, render: plain },
    { title: '托盘号', dataIndex: 'palletNo', width: 150, render: plain },
    { title: '扫码数量', dataIndex: 'scanQty', width: 100, render: plain },
    { title: '结存数量', dataIndex: 'onHandQty', width: 100, render: plain },
    {
      title: '扫码状态',
      dataIndex: 'scanStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_VMI_SCAN_STATUS_LABEL, v),
    },
    { title: '操作人', dataIndex: 'operator', width: 120, render: plain },
    { title: '扫码时间', dataIndex: 'scanTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该VMI扫码单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        VMI扫码收发
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="扫码状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={scanStatus}
              onChange={(v) => setScanStatus(v)}
              options={[...WMS_VMI_SCAN_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="扫码单号 / 仓库编码 / 库位编码 / 物料编码 / 物料名称"
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
                  void loadData(1, pageSize, keyword, scanStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setScanStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建VMI扫码单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`VMI扫码收发（共 ${total} 条）`}>
        <Table<WmsVmiScan>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2700 }}
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
        title={editId == null ? '新建VMI扫码单' : '编辑VMI扫码单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="scanNo" label="扫码单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="scanType" label="扫码类型">
            <Select placeholder="为空默认 IN" options={[...WMS_VMI_SCAN_TYPE_OPTIONS]} />
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
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="palletNo" label="托盘号">
            <Input placeholder="请输入托盘号" />
          </Form.Item>
          <Form.Item name="scanQty" label="扫码数量">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="onHandQty" label="结存数量">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="scanStatus" label="扫码状态">
            <Select placeholder="为空默认 DRAFT" options={[...WMS_VMI_SCAN_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="operator" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="scanTime" label="扫码时间">
            <DatePicker showTime style={{ width: '100%' }} />
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
