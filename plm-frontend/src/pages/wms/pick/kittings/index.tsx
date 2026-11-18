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
import { wmsKittingCheckService as service } from '@/services/wmsPickingService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_KIT_STATUS_LABEL,
  WMS_KIT_STATUS_OPTIONS,
  type WmsKittingCheck,
  type WmsKittingCheckQuery,
  type WmsKittingCheckSaveRequest,
} from '@/types/wmsPicking';

const { Title } = Typography;

const MANAGE = 'wms:pick:kitting:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<WmsKittingCheckSaveRequest, 'checkTime'> & {
  checkTime?: Dayjs;
};

export default function WmsKittingCheckPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsKittingCheck[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [kitStatus, setKitStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = kitStatus) => {
      setLoading(true);
      try {
        const params: WmsKittingCheckQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          kitStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, kitStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ kitStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: WmsKittingCheck) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      checkTime: record.checkTime ? dayjs(record.checkTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsKittingCheckSaveRequest = {
        ...values,
        checkTime: values.checkTime ? values.checkTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('齐套检查已创建');
      } else {
        await service.update(editId, payload);
        message.success('齐套检查已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('齐套检查已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsKittingCheck> = [
    { title: '检查单号', dataIndex: 'checkNo', width: 190, fixed: 'left', render: plain },
    { title: '生产工单号', dataIndex: 'workOrderNo', width: 170, render: plain },
    { title: '产品编码', dataIndex: 'productCode', width: 160, render: plain },
    { title: '产品名称', dataIndex: 'productName', width: 180, render: plain },
    { title: '计划数量', dataIndex: 'planQty', width: 100, render: plain },
    { title: '物料项总数', dataIndex: 'totalItems', width: 110, render: plain },
    { title: '齐套项数', dataIndex: 'kitItems', width: 100, render: plain },
    { title: '缺料项数', dataIndex: 'shortItems', width: 100, render: plain },
    { title: '缺料数量', dataIndex: 'shortQty', width: 100, render: plain },
    {
      title: '齐套状态',
      dataIndex: 'kitStatus',
      width: 110,
      render: (v) => statusTag(WMS_KIT_STATUS_LABEL, v),
    },
    { title: '检查人', dataIndex: 'checkBy', width: 120, render: plain },
    { title: '检查时间', dataIndex: 'checkTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该齐套检查？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        齐套检查
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="齐套状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={kitStatus}
              onChange={(v) => setKitStatus(v)}
              options={[...WMS_KIT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="检查单号 / 生产工单号 / 产品编码 / 产品名称"
              allowClear
              style={{ width: 300 }}
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
                  void loadData(1, pageSize, keyword, kitStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setKitStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建齐套检查</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`齐套检查（共 ${total} 条）`}>
        <Table<WmsKittingCheck>
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
        title={editId == null ? '新建齐套检查' : '编辑齐套检查'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="checkNo" label="检查单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item
            name="workOrderNo"
            label="生产工单号"
            rules={[{ required: true, message: '请输入生产工单号' }]}
          >
            <Input placeholder="请输入生产工单号" />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="productName" label="产品名称">
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          <Form.Item name="planQty" label="计划数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="totalItems" label="物料项总数">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="kitItems" label="齐套项数">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="shortItems" label="缺料项数">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="shortQty" label="缺料数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="kitStatus" label="齐套状态">
            <Select placeholder="为空默认 PENDING" options={[...WMS_KIT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="checkBy" label="检查人">
            <Input placeholder="请输入检查人" />
          </Form.Item>
          <Form.Item name="checkTime" label="检查时间">
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
