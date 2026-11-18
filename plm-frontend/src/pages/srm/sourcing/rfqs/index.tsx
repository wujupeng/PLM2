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
import { srmRfqService as service } from '@/services/srmSourcingService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_RFQ_STATUS_LABEL,
  SRM_RFQ_STATUS_OPTIONS,
  SRM_RFQ_TYPE_LABEL,
  SRM_RFQ_TYPE_OPTIONS,
  type SrmRfq,
  type SrmRfqQuery,
  type SrmRfqSaveRequest,
} from '@/types/srmSourcing';

const { Title } = Typography;

const MANAGE = 'srm:sourcing:rfq:manage';

type FormValues = Omit<SrmRfqSaveRequest, 'publishDate' | 'deadlineDate'> & {
  publishDate?: Dayjs;
  deadlineDate?: Dayjs;
};

export default function SrmRfqPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmRfq[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [rfqType, setRfqType] = useState<string | undefined>(undefined);
  const [rfqStatus, setRfqStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = rfqType,
      status = rfqStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmRfqQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          rfqType: type,
          rfqStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, rfqType, rfqStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ rfqType: 'INVITED', rfqStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: SrmRfq) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      publishDate: record.publishDate ? dayjs(record.publishDate) : undefined,
      deadlineDate: record.deadlineDate ? dayjs(record.deadlineDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmRfqSaveRequest = {
        ...values,
        publishDate: values.publishDate ? values.publishDate.format(DATE_FORMAT) : undefined,
        deadlineDate: values.deadlineDate ? values.deadlineDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('询价单已创建');
      } else {
        await service.update(editId, payload);
        message.success('询价单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('询价单已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmRfq> = [
    { title: '询价单号', dataIndex: 'rfqNo', width: 170, fixed: 'left', render: plain },
    { title: '询价标题', dataIndex: 'rfqTitle', width: 200, render: plain },
    { title: '关联寻源单号', dataIndex: 'sourcingNo', width: 170, render: plain },
    {
      title: '询价方式',
      dataIndex: 'rfqType',
      width: 120,
      render: (v) => statusTag(SRM_RFQ_TYPE_LABEL, v),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 140, render: plain },
    { title: '询价数量', dataIndex: 'rfqQty', width: 110, render: plain },
    { title: '单位', dataIndex: 'unit', width: 80, render: plain },
    { title: '发布日期', dataIndex: 'publishDate', width: 120, render: formatDate },
    { title: '报价截止日期', dataIndex: 'deadlineDate', width: 140, render: formatDate },
    { title: '邀请供应商数', dataIndex: 'inviteCount', width: 130, render: plain },
    { title: '已报价数', dataIndex: 'quoteCount', width: 110, render: plain },
    { title: '采购员', dataIndex: 'buyer', width: 100, render: plain },
    {
      title: '询价状态',
      dataIndex: 'rfqStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_RFQ_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该询价单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        询价单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="询价方式">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={rfqType}
              onChange={(v) => setRfqType(v)}
              options={[...SRM_RFQ_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="询价状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={rfqStatus}
              onChange={(v) => setRfqStatus(v)}
              options={[...SRM_RFQ_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="询价单号 / 询价标题 / 物料编码 / 物料名称 / 采购员"
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
                  void loadData(1, pageSize, keyword, rfqType, rfqStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRfqType(undefined);
                  setRfqStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建询价单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`询价单（共 ${total} 条）`}>
        <Table<SrmRfq>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2400 }}
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
        title={editId == null ? '新建询价单' : '编辑询价单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="rfqNo" label="询价单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="rfqTitle" label="询价标题">
            <Input placeholder="请输入询价标题" />
          </Form.Item>
          <Form.Item name="sourcingNo" label="关联寻源单号">
            <Input placeholder="请输入关联寻源单号" />
          </Form.Item>
          <Form.Item name="rfqType" label="询价方式">
            <Select placeholder="为空默认 INVITED" options={[...SRM_RFQ_TYPE_OPTIONS]} />
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
          <Form.Item name="rfqQty" label="询价数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入询价数量" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="publishDate" label="发布日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择发布日期" />
          </Form.Item>
          <Form.Item name="deadlineDate" label="报价截止日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择报价截止日期" />
          </Form.Item>
          <Form.Item name="inviteCount" label="邀请供应商数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入邀请供应商数" />
          </Form.Item>
          <Form.Item name="quoteCount" label="已报价数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入已报价数" />
          </Form.Item>
          <Form.Item name="buyer" label="采购员">
            <Input placeholder="请输入采购员" />
          </Form.Item>
          <Form.Item name="rfqStatus" label="询价状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_RFQ_STATUS_OPTIONS]} />
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
