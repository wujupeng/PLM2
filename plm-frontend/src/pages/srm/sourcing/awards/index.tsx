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
import { srmAwardService as service } from '@/services/srmSourcingService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_AWARD_TYPE_LABEL,
  SRM_AWARD_TYPE_OPTIONS,
  SRM_AWARD_STATUS_LABEL,
  SRM_AWARD_STATUS_OPTIONS,
  SRM_CURRENCY_LABEL,
  SRM_CURRENCY_OPTIONS,
  type SrmAward,
  type SrmAwardQuery,
  type SrmAwardSaveRequest,
} from '@/types/srmSourcing';

const { Title } = Typography;

const MANAGE = 'srm:sourcing:award:manage';

type FormValues = Omit<SrmAwardSaveRequest, 'awardDate' | 'approveDate'> & {
  awardDate?: Dayjs;
  approveDate?: Dayjs;
};

export default function SrmAwardPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmAward[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [awardType, setAwardType] = useState<string | undefined>(undefined);
  const [awardStatus, setAwardStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = awardType,
      status = awardStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmAwardQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          awardType: type,
          awardStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, awardType, awardStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ awardType: 'SINGLE', awardStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: SrmAward) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      awardDate: record.awardDate ? dayjs(record.awardDate) : undefined,
      approveDate: record.approveDate ? dayjs(record.approveDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmAwardSaveRequest = {
        ...values,
        awardDate: values.awardDate ? values.awardDate.format(DATE_FORMAT) : undefined,
        approveDate: values.approveDate ? values.approveDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('定点定标已创建');
      } else {
        await service.update(editId, payload);
        message.success('定点定标已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('定点定标已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmAward> = [
    { title: '定点单号', dataIndex: 'awardNo', width: 170, fixed: 'left', render: plain },
    { title: '询价单号', dataIndex: 'rfqNo', width: 170, render: plain },
    { title: '比价单号', dataIndex: 'compareNo', width: 170, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    {
      title: '定点类型',
      dataIndex: 'awardType',
      width: 120,
      render: (v) => statusTag(SRM_AWARD_TYPE_LABEL, v),
    },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '定点数量', dataIndex: 'awardQty', width: 110, render: plain },
    { title: '单位', dataIndex: 'unit', width: 80, render: plain },
    { title: '定点单价', dataIndex: 'awardPrice', width: 120, render: plain },
    { title: '定点金额', dataIndex: 'awardAmount', width: 130, render: plain },
    {
      title: '币种',
      dataIndex: 'currency',
      width: 100,
      render: (v) => statusTag(SRM_CURRENCY_LABEL, v),
    },
    { title: '定点日期', dataIndex: 'awardDate', width: 120, render: formatDate },
    { title: '定标人', dataIndex: 'awardBy', width: 100, render: plain },
    { title: '审批人', dataIndex: 'approver', width: 100, render: plain },
    { title: '审批日期', dataIndex: 'approveDate', width: 120, render: formatDate },
    {
      title: '定点状态',
      dataIndex: 'awardStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_AWARD_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该定点定标？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        定点定标
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="定点类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={awardType}
              onChange={(v) => setAwardType(v)}
              options={[...SRM_AWARD_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="定点状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={awardStatus}
              onChange={(v) => setAwardStatus(v)}
              options={[...SRM_AWARD_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="定点单号 / 询价单号 / 供应商编码 / 供应商名称 / 物料编码"
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
                  void loadData(1, pageSize, keyword, awardType, awardStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setAwardType(undefined);
                  setAwardStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建定点定标</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`定点定标（共 ${total} 条）`}>
        <Table<SrmAward>
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
        title={editId == null ? '新建定点定标' : '编辑定点定标'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="awardNo" label="定点单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="rfqNo" label="询价单号">
            <Input placeholder="请输入询价单号" />
          </Form.Item>
          <Form.Item name="compareNo" label="比价单号">
            <Input placeholder="请输入比价单号" />
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
          <Form.Item name="awardType" label="定点类型">
            <Select placeholder="为空默认 SINGLE" options={[...SRM_AWARD_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码" rules={[{ required: true, message: '请输入供应商编码' }]}>
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="awardQty" label="定点数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入定点数量" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="awardPrice" label="定点单价">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入定点单价" />
          </Form.Item>
          <Form.Item name="awardAmount" label="定点金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入定点金额" />
          </Form.Item>
          <Form.Item name="currency" label="币种">
            <Select placeholder="为空默认 CNY" options={[...SRM_CURRENCY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="awardDate" label="定点日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择定点日期" />
          </Form.Item>
          <Form.Item name="awardBy" label="定标人">
            <Input placeholder="请输入定标人" />
          </Form.Item>
          <Form.Item name="approver" label="审批人">
            <Input placeholder="请输入审批人" />
          </Form.Item>
          <Form.Item name="approveDate" label="审批日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择审批日期" />
          </Form.Item>
          <Form.Item name="awardStatus" label="定点状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_AWARD_STATUS_OPTIONS]} />
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
