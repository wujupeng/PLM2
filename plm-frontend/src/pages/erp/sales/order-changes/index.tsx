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
import { erpOrderChangeService } from '@/services/erpSalesService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_CHANGE_STATUS_LABEL,
  ERP_CHANGE_STATUS_OPTIONS,
  ERP_CHANGE_TYPE_LABEL,
  ERP_CHANGE_TYPE_OPTIONS,
  type ErpOrderChange,
  type ErpOrderChangeSaveRequest,
} from '@/types/erpSales';

const { Title } = Typography;

const MANAGE = 'erp:sales:orderchange:manage';

type FormValues = Omit<ErpOrderChangeSaveRequest, 'applyDate'> & {
  applyDate?: Dayjs;
};

export default function ErpOrderChangePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpOrderChange[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [changeStatus, setChangeStatus] = useState<string | undefined>(undefined);
  const [changeType, setChangeType] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = changeStatus,
      type = changeType,
      no = orderNo,
    ) => {
      setLoading(true);
      try {
        const res = await erpOrderChangeService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          changeStatus: status,
          changeType: type,
          orderNo: no || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, changeStatus, changeType, orderNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ changeType: 'QUANTITY', changeStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpOrderChange) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      applyDate: record.applyDate ? dayjs(record.applyDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        applyDate: values.applyDate ? values.applyDate.format('YYYY-MM-DDTHH:mm:ss') : undefined,
      };
      if (editId == null) {
        await erpOrderChangeService.create(payload);
        message.success('订单变更已创建');
      } else {
        await erpOrderChangeService.update(editId, payload);
        message.success('订单变更已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpOrderChangeService.remove(id);
    message.success('订单变更已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpOrderChange> = [
    { title: '变更单号', dataIndex: 'changeNo', width: 160, fixed: 'left', render: plain },
    { title: '订单号', dataIndex: 'orderNo', width: 160, render: plain },
    { title: '订单行号', dataIndex: 'orderLineNo', width: 100, render: plain },
    {
      title: '变更类型',
      dataIndex: 'changeType',
      width: 110,
      render: (v) => statusTag(ERP_CHANGE_TYPE_LABEL, v),
    },
    { title: '变更原因', dataIndex: 'changeReason', width: 180, ellipsis: true, render: plain },
    { title: '变更前值', dataIndex: 'beforeValue', width: 140, ellipsis: true, render: plain },
    { title: '变更后值', dataIndex: 'afterValue', width: 140, ellipsis: true, render: plain },
    { title: '申请人', dataIndex: 'applicant', width: 120, render: plain },
    { title: '申请日期', dataIndex: 'applyDate', width: 130, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '变更状态',
      dataIndex: 'changeStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ERP_CHANGE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该订单变更？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        订单变更
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="变更状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={changeStatus}
              onChange={(v) => setChangeStatus(v)}
              options={[...ERP_CHANGE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="变更类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={changeType}
              onChange={(v) => setChangeType(v)}
              options={[...ERP_CHANGE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="订单号">
            <Input
              placeholder="请输入订单号"
              allowClear
              style={{ width: 180 }}
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="变更单号 / 申请人"
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
                  void loadData(1, pageSize, keyword, changeStatus, changeType, orderNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setChangeStatus(undefined);
                  setChangeType(undefined);
                  setOrderNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建订单变更</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`订单变更（共 ${total} 条）`}>
        <Table<ErpOrderChange>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1900 }}
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
        title={editId == null ? '新建订单变更' : '编辑订单变更'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="orderNo" label="订单号" rules={[{ required: true, message: '请输入订单号' }]}>
            <Input placeholder="请输入订单号" />
          </Form.Item>
          <Form.Item name="orderLineNo" label="订单行号">
            <InputNumber style={{ width: '100%' }} placeholder="请输入订单行号" />
          </Form.Item>
          <Form.Item name="changeType" label="变更类型">
            <Select placeholder="为空默认 QUANTITY" options={[...ERP_CHANGE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="changeReason" label="变更原因">
            <Input placeholder="请输入变更原因" />
          </Form.Item>
          <Form.Item name="beforeValue" label="变更前值">
            <Input placeholder="请输入变更前值" />
          </Form.Item>
          <Form.Item name="afterValue" label="变更后值">
            <Input placeholder="请输入变更后值" />
          </Form.Item>
          <Form.Item name="applicant" label="申请人">
            <Input placeholder="请输入申请人" />
          </Form.Item>
          <Form.Item name="applyDate" label="申请日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择申请日期" />
          </Form.Item>
          <Form.Item name="changeStatus" label="变更状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_CHANGE_STATUS_OPTIONS]} />
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
