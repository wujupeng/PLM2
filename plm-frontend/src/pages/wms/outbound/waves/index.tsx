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
import { wmsOutboundWaveService as service } from '@/services/wmsOutboundService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_WAVE_STATUS_LABEL,
  WMS_WAVE_STATUS_OPTIONS,
  WMS_WAVE_TYPE_LABEL,
  WMS_WAVE_TYPE_OPTIONS,
  type WmsOutboundWave,
  type WmsOutboundWaveQuery,
  type WmsOutboundWaveSaveRequest,
} from '@/types/wmsOutbound';

const { Title } = Typography;

const MANAGE = 'wms:outbound:wave:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<WmsOutboundWaveSaveRequest, 'pickTime' | 'checkTime'> & {
  pickTime?: Dayjs;
  checkTime?: Dayjs;
};

export default function WmsOutboundWavePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsOutboundWave[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [waveStatus, setWaveStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = waveStatus) => {
      setLoading(true);
      try {
        const params: WmsOutboundWaveQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          waveStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, waveStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ waveType: 'WAVE', waveStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: WmsOutboundWave) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      pickTime: record.pickTime ? dayjs(record.pickTime) : undefined,
      checkTime: record.checkTime ? dayjs(record.checkTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsOutboundWaveSaveRequest = {
        ...values,
        pickTime: values.pickTime ? values.pickTime.format(DATETIME_FORMAT) : undefined,
        checkTime: values.checkTime ? values.checkTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('出库波次已创建');
      } else {
        await service.update(editId, payload);
        message.success('出库波次已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('出库波次已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsOutboundWave> = [
    { title: '波次单号', dataIndex: 'waveNo', width: 190, fixed: 'left', render: plain },
    {
      title: '波次类型',
      dataIndex: 'waveType',
      width: 110,
      render: (v) => statusTag(WMS_WAVE_TYPE_LABEL, v),
    },
    { title: '生产工单号', dataIndex: 'workOrderNo', width: 170, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 160, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '库位', dataIndex: 'binCode', width: 130, render: plain },
    { title: '计划数量', dataIndex: 'planQty', width: 100, render: plain },
    { title: '已拣数量', dataIndex: 'pickedQty', width: 100, render: plain },
    { title: '复核数量', dataIndex: 'checkedQty', width: 100, render: plain },
    {
      title: '波次状态',
      dataIndex: 'waveStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_WAVE_STATUS_LABEL, v),
    },
    { title: '拣货人', dataIndex: 'pickBy', width: 120, render: plain },
    { title: '拣货时间', dataIndex: 'pickTime', width: 170, render: formatDateTime },
    { title: '复核人', dataIndex: 'checkBy', width: 120, render: plain },
    { title: '复核时间', dataIndex: 'checkTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该出库波次？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        出库波次
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="波次状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={waveStatus}
              onChange={(v) => setWaveStatus(v)}
              options={[...WMS_WAVE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="波次单号 / 生产工单号 / 物料编码 / 物料名称"
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
                  void loadData(1, pageSize, keyword, waveStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setWaveStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建出库波次</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`出库波次（共 ${total} 条）`}>
        <Table<WmsOutboundWave>
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
        title={editId == null ? '新建出库波次' : '编辑出库波次'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="waveNo" label="波次单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="waveType" label="波次类型">
            <Select placeholder="为空默认 WAVE" options={[...WMS_WAVE_TYPE_OPTIONS]} />
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
          <Form.Item name="pickedQty" label="已拣数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="checkedQty" label="复核数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="waveStatus" label="波次状态">
            <Select placeholder="为空默认 DRAFT" options={[...WMS_WAVE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="pickBy" label="拣货人">
            <Input placeholder="请输入拣货人" />
          </Form.Item>
          <Form.Item name="pickTime" label="拣货时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="checkBy" label="复核人">
            <Input placeholder="请输入复核人" />
          </Form.Item>
          <Form.Item name="checkTime" label="复核时间">
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
