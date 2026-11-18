import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { ediService } from '@/services/ediService';
import {
  EDI_ACK_STATUS_COLOR,
  EDI_ACK_STATUS_LABEL,
  EDI_ACK_TYPE_COLOR,
  EDI_ACK_TYPE_LABEL,
  EDI_ACK_TYPE_OPTIONS,
  EDI_ALLOCATION_RULE_LABEL,
  EDI_SEND_CHANNEL_LABEL,
  EDI_SEND_CHANNEL_OPTIONS,
  EDI_SEND_STATUS_COLOR,
  EDI_SEND_STATUS_LABEL,
  EDI_SEND_STATUS_OPTIONS,
  type EdiAckParams,
  type EdiDemandDispatchItem,
  type EdiSupplierAckItem,
} from '@/types/edi';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** 分发查询条件 */
interface DispatchSearchState {
  keyword?: string;
  demandNo?: string;
  supplierCode?: string;
  sendStatus?: string;
  dispatchNo?: string;
}

/** 回执登记表单值（DatePicker 使用 Dayjs） */
interface AckFormValues {
  ackType?: string;
  confirmedQty?: number;
  confirmedDate?: Dayjs;
  shortageQty?: number;
  shortageReason?: string;
  exceptionText?: string;
  source?: string;
  remark?: string;
}

export default function EdiDispatchPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const [data, setData] = useState<EdiDemandDispatchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<DispatchSearchState>({});

  /* 回执记录 Drawer */
  const [ackOpen, setAckOpen] = useState(false);
  const [ackLoading, setAckLoading] = useState(false);
  const [ackList, setAckList] = useState<EdiSupplierAckItem[]>([]);
  const [currentDispatchNo, setCurrentDispatchNo] = useState<string>('');

  /* 回执登记 Modal */
  const [ackForm] = Form.useForm<AckFormValues>();
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [ackSubmitting, setAckSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await ediService.dispatchPage({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          demandNo: cond.demandNo || undefined,
          supplierCode: cond.supplierCode || undefined,
          sendStatus: cond.sendStatus || undefined,
          dispatchNo: cond.dispatchNo || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: DispatchSearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  /** 发送分发 */
  const handleSend = async (record: EdiDemandDispatchItem) => {
    await ediService.dispatchSend(record.dispatchNo);
    message.success('发送成功');
    void loadData();
  };

  /** 拉取某分发的回执记录 */
  const loadAcks = useCallback(async (dispatchNo: string) => {
    setAckLoading(true);
    try {
      const list = await ediService.ackByDispatch(dispatchNo);
      setAckList(list || []);
    } finally {
      setAckLoading(false);
    }
  }, []);

  const openAckDrawer = (record: EdiDemandDispatchItem) => {
    setCurrentDispatchNo(record.dispatchNo);
    setAckList([]);
    setAckOpen(true);
    void loadAcks(record.dispatchNo);
  };

  const openAckModal = () => {
    ackForm.resetFields();
    ackForm.setFieldsValue({ ackType: 'CONFIRM', source: 'API' });
    setAckModalOpen(true);
  };

  const handleAckSubmit = async () => {
    const values = await ackForm.validateFields();
    const payload: EdiAckParams = {
      dispatchNo: currentDispatchNo,
      ackType: values.ackType,
      confirmedQty: values.confirmedQty,
      confirmedDate: values.confirmedDate ? dayjs(values.confirmedDate).format('YYYY-MM-DD') : undefined,
      shortageQty: values.shortageQty,
      shortageReason: values.shortageReason,
      exceptionText: values.exceptionText,
      source: values.source,
      remark: values.remark,
    };
    setAckSubmitting(true);
    try {
      await ediService.ackCreate(payload);
      message.success('登记成功');
      setAckModalOpen(false);
      void loadAcks(currentDispatchNo);
      void loadData();
    } finally {
      setAckSubmitting(false);
    }
  };

  const columns: ColumnsType<EdiDemandDispatchItem> = [
    { title: '分发编号', dataIndex: 'dispatchNo', width: 180, fixed: 'left', render: (v) => v || '-' },
    { title: '需求编号', dataIndex: 'demandNo', width: 170, render: (v) => v || '-' },
    { title: '供应商', dataIndex: 'supplierCode', width: 140, render: (v) => v || '-' },
    { title: '供应商名称', dataIndex: 'supplierName', width: 170, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: (v) => v || '-' },
    { title: '数量', dataIndex: 'qty', width: 100, render: (v) => (v ?? '-') },
    { title: '单位', dataIndex: 'unit', width: 80, render: (v) => v || '-' },
    { title: '需求交期', dataIndex: 'requiredDate', width: 120, render: (v) => v || '-' },
    { title: '版本', dataIndex: 'demandVersion', width: 80, render: (v) => (v ?? '-') },
    {
      title: '分配规则',
      dataIndex: 'allocationRule',
      width: 120,
      render: (v?: string) => (v ? EDI_ALLOCATION_RULE_LABEL[v] || v : '-'),
    },
    { title: '份额', dataIndex: 'sharePct', width: 90, render: (v?: number) => (v == null ? '-' : `${v}%`) },
    {
      title: '渠道',
      dataIndex: 'sendChannel',
      width: 100,
      render: (v?: string) => (v ? EDI_SEND_CHANNEL_LABEL[v] || v : '-'),
    },
    {
      title: '发送状态',
      dataIndex: 'sendStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={EDI_SEND_STATUS_COLOR[v] || 'default'}>{EDI_SEND_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '回执状态',
      dataIndex: 'ackStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={EDI_ACK_STATUS_COLOR[v] || 'default'}>{EDI_ACK_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '发送时间',
      dataIndex: 'sentAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '回执时间',
      dataIndex: 'ackAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('edi:dispatch:send') && (
            <Popconfirm title="确认发送该分发？" onConfirm={() => handleSend(record)}>
              <Button type="link" size="small">
                发送
              </Button>
            </Popconfirm>
          )}
          <Button type="link" size="small" onClick={() => openAckDrawer(record)}>
            回执记录
          </Button>
        </Space>
      ),
    },
  ];

  const ackColumns: ColumnsType<EdiSupplierAckItem> = [
    { title: '回执编号', dataIndex: 'ackNo', width: 180, render: (v) => v || '-' },
    {
      title: '回执类型',
      dataIndex: 'ackType',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={EDI_ACK_TYPE_COLOR[v] || 'default'}>{EDI_ACK_TYPE_LABEL[v] || v}</Tag> : '-',
    },
    { title: '确认数量', dataIndex: 'confirmedQty', width: 100, render: (v) => (v ?? '-') },
    { title: '确认交期', dataIndex: 'confirmedDate', width: 120, render: (v) => v || '-' },
    { title: '缺口数量', dataIndex: 'shortageQty', width: 100, render: (v) => (v ?? '-') },
    { title: '缺口原因', dataIndex: 'shortageReason', width: 160, render: (v) => v || '-' },
    {
      title: '来源',
      dataIndex: 'source',
      width: 100,
      render: (v?: string) => (v ? EDI_SEND_CHANNEL_LABEL[v] || v : '-'),
    },
    {
      title: '是否有差异',
      dataIndex: 'diffFlag',
      width: 110,
      render: (v?: number) => (v === 1 ? <Tag color="warning">是</Tag> : v === 0 ? '否' : '-'),
    },
    {
      title: '回执时间',
      dataIndex: 'ackAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        需求分发与供应商回执
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="编号 / 名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="dispatchNo" label="分发编号">
            <Input placeholder="请输入分发编号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="demandNo" label="需求编号">
            <Input placeholder="请输入需求编号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商">
            <Input placeholder="请输入供应商编码" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="sendStatus" label="发送状态">
            <Select placeholder="请选择" allowClear style={{ width: 150 }} options={EDI_SEND_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`需求分发列表（共 ${total} 条）`}>
        <Table<EdiDemandDispatchItem>
          rowKey="dispatchNo"
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

      {/* 回执记录 */}
      <Drawer
        title={`回执记录 - ${currentDispatchNo}`}
        width={720}
        open={ackOpen}
        onClose={() => setAckOpen(false)}
        destroyOnClose
        extra={
          hasPermission('edi:ack:list') && (
            <Button type="primary" size="small" onClick={openAckModal}>
              登记回执
            </Button>
          )
        }
      >
        <Table<EdiSupplierAckItem>
          rowKey="ackNo"
          loading={ackLoading}
          columns={ackColumns}
          dataSource={ackList}
          scroll={{ x: 1250 }}
          pagination={false}
        />
      </Drawer>

      {/* 登记回执 */}
      <Modal
        title={`登记回执 - ${currentDispatchNo}`}
        open={ackModalOpen}
        onOk={handleAckSubmit}
        confirmLoading={ackSubmitting}
        onCancel={() => setAckModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={ackForm} layout="vertical" preserve={false}>
          <Form.Item name="ackType" label="回执类型">
            <Select placeholder="请选择" options={EDI_ACK_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="confirmedQty" label="确认数量">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="confirmedDate" label="确认交期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="shortageQty" label="缺口数量">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="shortageReason" label="缺口原因">
            <Input placeholder="请输入缺口原因" />
          </Form.Item>
          <Form.Item name="exceptionText" label="异常说明">
            <Input.TextArea rows={2} placeholder="请输入异常说明" />
          </Form.Item>
          <Form.Item name="source" label="来源">
            <Select placeholder="请选择" options={EDI_SEND_CHANNEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
