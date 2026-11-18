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
import { mesMaterialReplenishService as service } from '@/services/mesReportService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_REPLENISH_STATUS_LABEL,
  MES_REPLENISH_STATUS_OPTIONS,
  MES_REPLENISH_TYPE_LABEL,
  MES_REPLENISH_TYPE_OPTIONS,
  type MesMaterialReplenish,
  type MesMaterialReplenishQuery,
  type MesMaterialReplenishSaveRequest,
} from '@/types/mesReport';

const { Title } = Typography;

const MANAGE = 'mes:report:replenish:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesMaterialReplenishSaveRequest, 'applyTime' | 'issueTime'> & {
  applyTime?: Dayjs;
  issueTime?: Dayjs;
};

export default function MesMaterialReplenishPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesMaterialReplenish[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [replenishStatus, setReplenishStatus] = useState<string | undefined>(undefined);
  const [replenishType, setReplenishType] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = replenishStatus, type = replenishType) => {
      setLoading(true);
      try {
        const params: MesMaterialReplenishQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          replenishStatus: status,
          replenishType: type,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, replenishStatus, replenishType],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ replenishType: 'SUPPLEMENT', replenishStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesMaterialReplenish) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      applyTime: record.applyTime ? dayjs(record.applyTime) : undefined,
      issueTime: record.issueTime ? dayjs(record.issueTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesMaterialReplenishSaveRequest = {
        ...values,
        applyTime: values.applyTime ? values.applyTime.format(DATETIME_FORMAT) : undefined,
        issueTime: values.issueTime ? values.issueTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('补料记录已创建');
      } else {
        await service.update(editId, payload);
        message.success('补料记录已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('补料记录已删除');
    void loadData();
  };

  const columns: ColumnsType<MesMaterialReplenish> = [
    { title: '补料单号', dataIndex: 'replenishNo', width: 190, fixed: 'left', render: plain },
    { title: '生产工单号', dataIndex: 'workOrderNo', width: 170, render: plain },
    { title: '派工单号', dataIndex: 'dispatchNo', width: 170, render: plain },
    { title: '工序编码', dataIndex: 'processCode', width: 120, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 140, render: plain },
    { title: '补料数量', dataIndex: 'replenishQty', width: 110, render: plain },
    { title: '单位', dataIndex: 'unit', width: 90, render: plain },
    {
      title: '补料类型',
      dataIndex: 'replenishType',
      width: 110,
      render: (v) => statusTag(MES_REPLENISH_TYPE_LABEL, v),
    },
    { title: '补料原因', dataIndex: 'reason', width: 180, render: plain },
    { title: '申请人', dataIndex: 'applicant', width: 110, render: plain },
    { title: '申请时间', dataIndex: 'applyTime', width: 170, render: formatDateTime },
    {
      title: '补料状态',
      dataIndex: 'replenishStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_REPLENISH_STATUS_LABEL, v),
    },
    { title: '发料人', dataIndex: 'issuer', width: 110, render: plain },
    { title: '发料时间', dataIndex: 'issueTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该补料记录？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        补料记录
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="补料状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={replenishStatus}
              onChange={(v) => setReplenishStatus(v)}
              options={[...MES_REPLENISH_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="补料类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={replenishType}
              onChange={(v) => setReplenishType(v)}
              options={[...MES_REPLENISH_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="补料单号 / 工单号 / 物料编码 / 物料名称 / 批次号"
              allowClear
              style={{ width: 420 }}
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
                  void loadData(1, pageSize, keyword, replenishStatus, replenishType);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setReplenishStatus(undefined);
                  setReplenishType(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建补料记录</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`补料记录（共 ${total} 条）`}>
        <Table<MesMaterialReplenish>
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
        title={editId == null ? '新建补料记录' : '编辑补料记录'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="replenishNo" label="补料单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="workOrderNo" label="生产工单号">
            <Input placeholder="请输入生产工单号" />
          </Form.Item>
          <Form.Item name="dispatchNo" label="派工单号">
            <Input placeholder="请输入派工单号" />
          </Form.Item>
          <Form.Item name="processCode" label="工序编码">
            <Input placeholder="请输入工序编码" />
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
          <Form.Item name="replenishQty" label="补料数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入补料数量" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="replenishType" label="补料类型">
            <Select placeholder="为空默认 SUPPLEMENT" options={[...MES_REPLENISH_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="reason" label="补料原因">
            <Input.TextArea rows={2} placeholder="请输入补料原因" />
          </Form.Item>
          <Form.Item name="applicant" label="申请人">
            <Input placeholder="请输入申请人" />
          </Form.Item>
          <Form.Item name="applyTime" label="申请时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="replenishStatus" label="补料状态">
            <Select placeholder="为空默认 DRAFT" options={[...MES_REPLENISH_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="issuer" label="发料人">
            <Input placeholder="请输入发料人" />
          </Form.Item>
          <Form.Item name="issueTime" label="发料时间">
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
