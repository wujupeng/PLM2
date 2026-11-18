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
import { wmsFinishedGoodsService as service } from '@/services/wmsOutboundService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_FG_STATUS_LABEL,
  WMS_FG_STATUS_OPTIONS,
  WMS_FG_TYPE_LABEL,
  WMS_FG_TYPE_OPTIONS,
  type WmsFinishedGoods,
  type WmsFinishedGoodsQuery,
  type WmsFinishedGoodsSaveRequest,
} from '@/types/wmsOutbound';

const { Title } = Typography;

const MANAGE = 'wms:outbound:finished:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<WmsFinishedGoodsSaveRequest, 'produceTime' | 'inboundTime'> & {
  produceTime?: Dayjs;
  inboundTime?: Dayjs;
};

export default function WmsFinishedGoodsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsFinishedGoods[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [fgStatus, setFgStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = fgStatus) => {
      setLoading(true);
      try {
        const params: WmsFinishedGoodsQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          fgStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, fgStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ fgType: 'FINISHED', fgStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: WmsFinishedGoods) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      produceTime: record.produceTime ? dayjs(record.produceTime) : undefined,
      inboundTime: record.inboundTime ? dayjs(record.inboundTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsFinishedGoodsSaveRequest = {
        ...values,
        produceTime: values.produceTime ? values.produceTime.format(DATETIME_FORMAT) : undefined,
        inboundTime: values.inboundTime ? values.inboundTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('成品入库已创建');
      } else {
        await service.update(editId, payload);
        message.success('成品入库已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('成品入库已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsFinishedGoods> = [
    { title: '入库单号', dataIndex: 'fgNo', width: 190, fixed: 'left', render: plain },
    {
      title: '入库类型',
      dataIndex: 'fgType',
      width: 110,
      render: (v) => statusTag(WMS_FG_TYPE_LABEL, v),
    },
    { title: '生产工单号', dataIndex: 'workOrderNo', width: 170, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 160, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '库位', dataIndex: 'binCode', width: 130, render: plain },
    { title: '计划数量', dataIndex: 'planQty', width: 100, render: plain },
    { title: '入库数量', dataIndex: 'inboundQty', width: 100, render: plain },
    { title: '包装号', dataIndex: 'packageNo', width: 150, render: plain },
    { title: '包装类型', dataIndex: 'packageType', width: 110, render: plain },
    { title: '标签号', dataIndex: 'labelNo', width: 150, render: plain },
    {
      title: '入库状态',
      dataIndex: 'fgStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_FG_STATUS_LABEL, v),
    },
    { title: '生产人', dataIndex: 'produceBy', width: 120, render: plain },
    { title: '生产时间', dataIndex: 'produceTime', width: 170, render: formatDateTime },
    { title: '入库人', dataIndex: 'inboundBy', width: 120, render: plain },
    { title: '入库时间', dataIndex: 'inboundTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该成品入库？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        成品入库
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="入库状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={fgStatus}
              onChange={(v) => setFgStatus(v)}
              options={[...WMS_FG_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="入库单号 / 生产工单号 / 物料编码 / 物料名称"
              allowClear
              style={{ width: 320 }}
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
                  void loadData(1, pageSize, keyword, fgStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setFgStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建成品入库</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`成品入库（共 ${total} 条）`}>
        <Table<WmsFinishedGoods>
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
        title={editId == null ? '新建成品入库' : '编辑成品入库'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="fgNo" label="入库单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="fgType" label="入库类型">
            <Select placeholder="为空默认 FINISHED" options={[...WMS_FG_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="workOrderNo" label="生产工单号">
            <Input placeholder="请输入生产工单号" />
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
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="binCode" label="库位">
            <Input placeholder="请输入库位" />
          </Form.Item>
          <Form.Item name="planQty" label="计划数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="inboundQty" label="入库数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="packageNo" label="包装号">
            <Input placeholder="请输入包装号" />
          </Form.Item>
          <Form.Item name="packageType" label="包装类型">
            <Input placeholder="请输入包装类型" />
          </Form.Item>
          <Form.Item name="labelNo" label="标签号">
            <Input placeholder="请输入标签号" />
          </Form.Item>
          <Form.Item name="fgStatus" label="入库状态">
            <Select placeholder="为空默认 DRAFT" options={[...WMS_FG_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="produceBy" label="生产人">
            <Input placeholder="请输入生产人" />
          </Form.Item>
          <Form.Item name="produceTime" label="生产时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="inboundBy" label="入库人">
            <Input placeholder="请输入入库人" />
          </Form.Item>
          <Form.Item name="inboundTime" label="入库时间">
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
