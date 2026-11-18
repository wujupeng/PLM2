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
import { erpMaterialAdditionService } from '@/services/erpProductionService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_MATERIAL_ADDITION_APPROVAL_STATUS_LABEL,
  ERP_MATERIAL_ADDITION_APPROVAL_STATUS_OPTIONS,
  ERP_MATERIAL_ADDITION_STATUS_LABEL,
  ERP_MATERIAL_ADDITION_STATUS_OPTIONS,
  ERP_MATERIAL_ADDITION_TYPE_LABEL,
  ERP_MATERIAL_ADDITION_TYPE_OPTIONS,
  type ErpMaterialAddition,
  type ErpMaterialAdditionQuery,
  type ErpMaterialAdditionSaveRequest,
} from '@/types/erpProduction';

const { Title } = Typography;

const MANAGE = 'erp:production:addition:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpMaterialAdditionSaveRequest, 'additionDate'> & {
  additionDate?: Dayjs;
};

export default function ErpMaterialAdditionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpMaterialAddition[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [additionStatus, setAdditionStatus] = useState<string | undefined>(undefined);
  const [additionType, setAdditionType] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = additionStatus,
      type = additionType,
      order = orderNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpMaterialAdditionQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          additionStatus: status,
          additionType: type,
          orderNo: order || undefined,
        };
        const res = await erpMaterialAdditionService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, additionStatus, additionType, orderNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      additionType: 'NORMAL',
      uom: 'PCS',
      approvalStatus: 'PENDING',
      additionStatus: 'DRAFT',
    });
    setOpen(true);
  };

  const openEdit = (record: ErpMaterialAddition) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      additionDate: record.additionDate ? dayjs(record.additionDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpMaterialAdditionSaveRequest = {
        ...values,
        additionDate: values.additionDate ? values.additionDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpMaterialAdditionService.create(payload);
        message.success('生产补料单已创建');
      } else {
        await erpMaterialAdditionService.update(editId, payload);
        message.success('生产补料单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpMaterialAdditionService.remove(id);
    message.success('生产补料单已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpMaterialAddition> = [
    { title: '补料单号', dataIndex: 'additionNo', width: 170, fixed: 'left', render: plain },
    { title: '生产订单号', dataIndex: 'orderNo', width: 160, render: plain },
    {
      title: '补料类型',
      dataIndex: 'additionType',
      width: 120,
      render: (v) => statusTag(ERP_MATERIAL_ADDITION_TYPE_LABEL, v),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '补料数量', dataIndex: 'additionQty', width: 110, render: plain },
    { title: '补料原因', dataIndex: 'additionReason', width: 160, ellipsis: true, render: plain },
    { title: '超领原因', dataIndex: 'overIssueReason', width: 160, ellipsis: true, render: plain },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      width: 110,
      render: (v) => statusTag(ERP_MATERIAL_ADDITION_APPROVAL_STATUS_LABEL, v),
    },
    { title: '补料人', dataIndex: 'additionBy', width: 120, render: plain },
    { title: '补料日期', dataIndex: 'additionDate', width: 170, render: formatDateTime },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '补料状态',
      dataIndex: 'additionStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_MATERIAL_ADDITION_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该生产补料单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        生产补料
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="补料状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={additionStatus}
              onChange={(v) => setAdditionStatus(v)}
              options={[...ERP_MATERIAL_ADDITION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="补料类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={additionType}
              onChange={(v) => setAdditionType(v)}
              options={[...ERP_MATERIAL_ADDITION_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="生产订单号">
            <Input
              placeholder="请输入生产订单号"
              allowClear
              style={{ width: 160 }}
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="补料单号 / 物料名称"
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
                  void loadData(1, pageSize, keyword, additionStatus, additionType, orderNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setAdditionStatus(undefined);
                  setAdditionType(undefined);
                  setOrderNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建生产补料</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`生产补料（共 ${total} 条）`}>
        <Table<ErpMaterialAddition>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2200 }}
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
        title={editId == null ? '新建生产补料' : '编辑生产补料'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="additionNo" label="补料单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="orderNo" label="生产订单号">
            <Input placeholder="请输入生产订单号" />
          </Form.Item>
          <Form.Item name="additionType" label="补料类型">
            <Select placeholder="为空默认 NORMAL" options={[...ERP_MATERIAL_ADDITION_TYPE_OPTIONS]} />
          </Form.Item>
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
          <Form.Item name="additionQty" label="补料数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入补料数量" />
          </Form.Item>
          <Form.Item name="additionReason" label="补料原因">
            <Input.TextArea rows={2} placeholder="请输入补料原因" />
          </Form.Item>
          <Form.Item name="overIssueReason" label="超领原因">
            <Input.TextArea rows={2} placeholder="请输入超领原因" />
          </Form.Item>
          <Form.Item name="approvalStatus" label="审批状态">
            <Select placeholder="为空默认 PENDING" options={[...ERP_MATERIAL_ADDITION_APPROVAL_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="additionBy" label="补料人">
            <Input placeholder="请输入补料人" />
          </Form.Item>
          <Form.Item name="additionDate" label="补料日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择补料日期" />
          </Form.Item>
          <Form.Item name="additionStatus" label="补料状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_MATERIAL_ADDITION_STATUS_OPTIONS]} />
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
