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
import { wmsMaterialDiffService as service } from '@/services/wmsReturnService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_MATERIAL_DIFF_STATUS_LABEL,
  WMS_MATERIAL_DIFF_STATUS_OPTIONS,
  WMS_MATERIAL_DIFF_TYPE_LABEL,
  WMS_MATERIAL_DIFF_TYPE_OPTIONS,
  type WmsMaterialDiff,
  type WmsMaterialDiffQuery,
  type WmsMaterialDiffSaveRequest,
} from '@/types/wmsReturn';

const { Title } = Typography;

const MANAGE = 'wms:return:diff:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<WmsMaterialDiffSaveRequest, 'handleTime'> & {
  handleTime?: Dayjs;
};

export default function WmsMaterialDiffPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsMaterialDiff[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [diffStatus, setDiffStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = diffStatus) => {
      setLoading(true);
      try {
        const params: WmsMaterialDiffQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          diffStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, diffStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ diffType: 'QTY', diffStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: WmsMaterialDiff) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      handleTime: record.handleTime ? dayjs(record.handleTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsMaterialDiffSaveRequest = {
        ...values,
        handleTime: values.handleTime ? values.handleTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('差异处理已创建');
      } else {
        await service.update(editId, payload);
        message.success('差异处理已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('差异处理已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsMaterialDiff> = [
    { title: '差异单号', dataIndex: 'diffNo', width: 190, fixed: 'left', render: plain },
    {
      title: '差异类型',
      dataIndex: 'diffType',
      width: 110,
      render: (v) => statusTag(WMS_MATERIAL_DIFF_TYPE_LABEL, v),
    },
    { title: '生产工单号', dataIndex: 'workOrderNo', width: 170, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 160, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '计划数量', dataIndex: 'planQty', width: 100, render: plain },
    { title: '实际数量', dataIndex: 'actualQty', width: 100, render: plain },
    { title: '差异数量', dataIndex: 'diffQty', width: 100, render: plain },
    { title: '差异原因', dataIndex: 'diffReason', width: 160, render: plain },
    {
      title: '差异状态',
      dataIndex: 'diffStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_MATERIAL_DIFF_STATUS_LABEL, v),
    },
    { title: '处理人', dataIndex: 'handler', width: 120, render: plain },
    { title: '处理时间', dataIndex: 'handleTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该差异处理？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        差异处理
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="差异状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={diffStatus}
              onChange={(v) => setDiffStatus(v)}
              options={[...WMS_MATERIAL_DIFF_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="差异单号 / 生产工单号 / 物料编码 / 物料名称"
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
                  void loadData(1, pageSize, keyword, diffStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDiffStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建差异处理</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`差异处理（共 ${total} 条）`}>
        <Table<WmsMaterialDiff>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2300 }}
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
        title={editId == null ? '新建差异处理' : '编辑差异处理'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="diffNo" label="差异单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="diffType" label="差异类型">
            <Select placeholder="为空默认 QTY" options={[...WMS_MATERIAL_DIFF_TYPE_OPTIONS]} />
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
          <Form.Item name="planQty" label="计划数量">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="actualQty" label="实际数量">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="diffQty" label="差异数量">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="diffReason" label="差异原因">
            <Input placeholder="请输入差异原因" />
          </Form.Item>
          <Form.Item name="diffStatus" label="差异状态">
            <Select placeholder="为空默认 PENDING" options={[...WMS_MATERIAL_DIFF_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="handler" label="处理人">
            <Input placeholder="请输入处理人" />
          </Form.Item>
          <Form.Item name="handleTime" label="处理时间">
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
