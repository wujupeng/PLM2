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
import { srmPoChangeService as service } from '@/services/srmCollabService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_PO_CHANGE_TYPE_LABEL,
  SRM_PO_CHANGE_TYPE_OPTIONS,
  SRM_PO_CHANGE_STATUS_LABEL,
  SRM_PO_CHANGE_STATUS_OPTIONS,
  type SrmPoChange,
  type SrmPoChangeQuery,
  type SrmPoChangeSaveRequest,
} from '@/types/srmCollab';

const { Title } = Typography;

const MANAGE = 'srm:collab:change:manage';

type FormValues = Omit<SrmPoChangeSaveRequest, 'beforeDate' | 'afterDate' | 'applyDate' | 'confirmDate'> & {
  beforeDate?: Dayjs;
  afterDate?: Dayjs;
  applyDate?: Dayjs;
  confirmDate?: Dayjs;
};

export default function SrmPoChangePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmPoChange[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [changeType, setChangeType] = useState<string | undefined>(undefined);
  const [changeStatus, setChangeStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = changeType,
      status = changeStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmPoChangeQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          changeType: type,
          changeStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, changeType, changeStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ changeType: 'QTY', changeStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: SrmPoChange) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      beforeDate: record.beforeDate ? dayjs(record.beforeDate) : undefined,
      afterDate: record.afterDate ? dayjs(record.afterDate) : undefined,
      applyDate: record.applyDate ? dayjs(record.applyDate) : undefined,
      confirmDate: record.confirmDate ? dayjs(record.confirmDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmPoChangeSaveRequest = {
        ...values,
        beforeDate: values.beforeDate ? values.beforeDate.format(DATE_FORMAT) : undefined,
        afterDate: values.afterDate ? values.afterDate.format(DATE_FORMAT) : undefined,
        applyDate: values.applyDate ? values.applyDate.format(DATE_FORMAT) : undefined,
        confirmDate: values.confirmDate ? values.confirmDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('变更确认已创建');
      } else {
        await service.update(editId, payload);
        message.success('变更确认已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('变更确认已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmPoChange> = [
    { title: '变更编号', dataIndex: 'changeNo', width: 170, fixed: 'left', render: plain },
    { title: '采购订单号', dataIndex: 'poNo', width: 150, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    {
      title: '变更类型',
      dataIndex: 'changeType',
      width: 110,
      render: (v) => statusTag(SRM_PO_CHANGE_TYPE_LABEL, v),
    },
    { title: '变更前数量', dataIndex: 'beforeQty', width: 110, render: plain },
    { title: '变更后数量', dataIndex: 'afterQty', width: 110, render: plain },
    { title: '变更前日期', dataIndex: 'beforeDate', width: 120, render: formatDate },
    { title: '变更后日期', dataIndex: 'afterDate', width: 120, render: formatDate },
    { title: '变更前单价', dataIndex: 'beforePrice', width: 110, render: plain },
    { title: '变更后单价', dataIndex: 'afterPrice', width: 110, render: plain },
    { title: '变更原因', dataIndex: 'changeReason', width: 160, render: plain },
    { title: '申请人', dataIndex: 'applyBy', width: 100, render: plain },
    { title: '申请日期', dataIndex: 'applyDate', width: 120, render: formatDate },
    { title: '确认人', dataIndex: 'confirmBy', width: 100, render: plain },
    { title: '确认日期', dataIndex: 'confirmDate', width: 120, render: formatDate },
    {
      title: '变更状态',
      dataIndex: 'changeStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_PO_CHANGE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该变更确认？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        变更确认
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="变更类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={changeType}
              onChange={(v) => setChangeType(v)}
              options={[...SRM_PO_CHANGE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="变更状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={changeStatus}
              onChange={(v) => setChangeStatus(v)}
              options={[...SRM_PO_CHANGE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="变更编号 / 采购订单号 / 供应商编码 / 供应商名称"
              allowClear
              style={{ width: 280 }}
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
                  void loadData(1, pageSize, keyword, changeType, changeStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setChangeType(undefined);
                  setChangeStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建变更确认</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`变更确认（共 ${total} 条）`}>
        <Table<SrmPoChange>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 3200 }}
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
        title={editId == null ? '新建变更确认' : '编辑变更确认'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="changeNo" label="变更编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="poNo" label="采购订单号">
            <Input placeholder="请输入采购订单号" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="changeType" label="变更类型">
            <Select placeholder="为空默认 QTY" options={[...SRM_PO_CHANGE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="beforeQty" label="变更前数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入变更前数量" />
          </Form.Item>
          <Form.Item name="afterQty" label="变更后数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入变更后数量" />
          </Form.Item>
          <Form.Item name="beforeDate" label="变更前日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择变更前日期" />
          </Form.Item>
          <Form.Item name="afterDate" label="变更后日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择变更后日期" />
          </Form.Item>
          <Form.Item name="beforePrice" label="变更前单价">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入变更前单价" />
          </Form.Item>
          <Form.Item name="afterPrice" label="变更后单价">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入变更后单价" />
          </Form.Item>
          <Form.Item name="changeReason" label="变更原因">
            <Input placeholder="请输入变更原因" />
          </Form.Item>
          <Form.Item name="applyBy" label="申请人">
            <Input placeholder="请输入申请人" />
          </Form.Item>
          <Form.Item name="applyDate" label="申请日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择申请日期" />
          </Form.Item>
          <Form.Item name="confirmBy" label="确认人">
            <Input placeholder="请输入确认人" />
          </Form.Item>
          <Form.Item name="confirmDate" label="确认日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择确认日期" />
          </Form.Item>
          <Form.Item name="changeStatus" label="变更状态">
            <Select placeholder="为空默认 PENDING" options={[...SRM_PO_CHANGE_STATUS_OPTIONS]} />
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
