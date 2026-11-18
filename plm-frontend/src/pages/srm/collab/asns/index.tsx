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
import { srmAsnService as service } from '@/services/srmCollabService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_ASN_STATUS_LABEL,
  SRM_ASN_STATUS_OPTIONS,
  type SrmAsn,
  type SrmAsnQuery,
  type SrmAsnSaveRequest,
} from '@/types/srmCollab';

const { Title } = Typography;

const MANAGE = 'srm:collab:asn:manage';

type FormValues = Omit<SrmAsnSaveRequest, 'shipDate' | 'arriveDate' | 'asnDate'> & {
  shipDate?: Dayjs;
  arriveDate?: Dayjs;
  asnDate?: Dayjs;
};

export default function SrmAsnPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmAsn[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [asnStatus, setAsnStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = asnStatus) => {
      setLoading(true);
      try {
        const params: SrmAsnQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          asnStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, asnStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ asnStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: SrmAsn) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      shipDate: record.shipDate ? dayjs(record.shipDate) : undefined,
      arriveDate: record.arriveDate ? dayjs(record.arriveDate) : undefined,
      asnDate: record.asnDate ? dayjs(record.asnDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmAsnSaveRequest = {
        ...values,
        shipDate: values.shipDate ? values.shipDate.format(DATE_FORMAT) : undefined,
        arriveDate: values.arriveDate ? values.arriveDate.format(DATE_FORMAT) : undefined,
        asnDate: values.asnDate ? values.asnDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('ASN发货通知已创建');
      } else {
        await service.update(editId, payload);
        message.success('ASN发货通知已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('ASN发货通知已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmAsn> = [
    { title: 'ASN发货通知号', dataIndex: 'asnNo', width: 180, fixed: 'left', render: plain },
    { title: '送货预约号', dataIndex: 'appointmentNo', width: 160, render: plain },
    { title: '采购订单号', dataIndex: 'poNo', width: 150, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '发货数量', dataIndex: 'shipQty', width: 110, render: plain },
    { title: '单位', dataIndex: 'unit', width: 90, render: plain },
    { title: '发货日期', dataIndex: 'shipDate', width: 120, render: formatDate },
    { title: '到达日期', dataIndex: 'arriveDate', width: 120, render: formatDate },
    { title: '承运商', dataIndex: 'carrier', width: 130, render: plain },
    { title: '运单号', dataIndex: 'trackingNo', width: 160, render: plain },
    { title: '车牌号', dataIndex: 'vehicleNo', width: 130, render: plain },
    { title: '包装件数', dataIndex: 'packageCount', width: 110, render: plain },
    { title: '发货人', dataIndex: 'asnBy', width: 110, render: plain },
    { title: '发货日期', dataIndex: 'asnDate', width: 120, render: formatDate },
    {
      title: '发货状态',
      dataIndex: 'asnStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_ASN_STATUS_LABEL, v),
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
            <Popconfirm
              title="确认删除该ASN发货通知？"
              onConfirm={() => record.id != null && void remove(record.id)}
            >
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
        ASN发货通知
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="发货状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={asnStatus}
              onChange={(v) => setAsnStatus(v)}
              options={[...SRM_ASN_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="发货通知号 / 送货预约号 / 采购订单号 / 供应商编码 / 运单号"
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
                  void loadData(1, pageSize, keyword, asnStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setAsnStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建ASN发货通知</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`ASN发货通知（共 ${total} 条）`}>
        <Table<SrmAsn>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 3000 }}
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
        title={editId == null ? '新建ASN发货通知' : '编辑ASN发货通知'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="asnNo" label="asnNo">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="appointmentNo" label="appointmentNo">
            <Input placeholder="请输入送货预约号" />
          </Form.Item>
          <Form.Item name="poNo" label="poNo">
            <Input placeholder="请输入采购订单号" />
          </Form.Item>
          <Form.Item name="supplierCode" label="supplierCode">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="supplierName">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="materialCode" label="materialCode">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="materialName">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="spec">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="shipQty" label="shipQty">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入发货数量" />
          </Form.Item>
          <Form.Item name="unit" label="unit">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="shipDate" label="shipDate">
            <DatePicker style={{ width: '100%' }} placeholder="请选择发货日期" />
          </Form.Item>
          <Form.Item name="arriveDate" label="arriveDate">
            <DatePicker style={{ width: '100%' }} placeholder="请选择到达日期" />
          </Form.Item>
          <Form.Item name="carrier" label="carrier">
            <Input placeholder="请输入承运商" />
          </Form.Item>
          <Form.Item name="trackingNo" label="trackingNo">
            <Input placeholder="请输入运单号" />
          </Form.Item>
          <Form.Item name="vehicleNo" label="vehicleNo">
            <Input placeholder="请输入车牌号" />
          </Form.Item>
          <Form.Item name="packageCount" label="packageCount">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入包装件数" />
          </Form.Item>
          <Form.Item name="asnBy" label="asnBy">
            <Input placeholder="请输入发货人" />
          </Form.Item>
          <Form.Item name="asnDate" label="asnDate">
            <DatePicker style={{ width: '100%' }} placeholder="请选择发货日期" />
          </Form.Item>
          <Form.Item name="asnStatus" label="asnStatus">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_ASN_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="description" label="description">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="remark">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
