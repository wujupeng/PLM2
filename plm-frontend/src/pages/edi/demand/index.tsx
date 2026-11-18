import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, SearchOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ediService } from '@/services/ediService';
import {
  EDI_ACK_STATUS_COLOR,
  EDI_ACK_STATUS_LABEL,
  EDI_ALLOCATION_RULE_OPTIONS,
  EDI_CHANGE_TYPE_COLOR,
  EDI_CHANGE_TYPE_LABEL,
  EDI_DEMAND_STATUS_COLOR,
  EDI_DEMAND_STATUS_LABEL,
  EDI_DEMAND_STATUS_OPTIONS,
  EDI_SEND_CHANNEL_OPTIONS,
  EDI_SEND_STATUS_COLOR,
  EDI_SEND_STATUS_LABEL,
  EDI_TRANS_CODE_OPTIONS,
  type EdiCustomerDemandItem,
  type EdiDemandChangeLogItem,
  type EdiDemandDispatchItem,
  type EdiDemandDispatchParams,
  type EdiPartnerItem,
} from '@/types/edi';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** 单据类型选项 */
const DOC_TYPE_OPTIONS = [
  { label: '订单（ORDER）', value: 'ORDER' },
  { label: '预测（FORECAST）', value: 'FORECAST' },
];

/** 单据类型中文名映射 */
const DOC_TYPE_LABEL: Record<string, string> = {
  ORDER: '订单',
  FORECAST: '预测',
};

/** 查询条件 */
interface SearchState {
  keyword?: string;
  partnerCode?: string;
  customerCode?: string;
  transCode?: string;
  docType?: string;
  status?: string;
  materialCode?: string;
  customerOrderNo?: string;
}

/** 分发表单值（不含 demandNo，demandNo 由提交时拼接） */
interface DispatchFormValues {
  supplierCodes?: string[];
  allocationRule?: string;
  sendChannel?: string;
  autoSend?: boolean;
  remark?: string;
}

/** 文本空值统一渲染为 '-' */
const renderText = (v?: string | number | null) =>
  v === undefined || v === null || v === '' ? '-' : v;

/** 时间空值统一渲染为 '-' */
const renderTime = (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-');

export default function EdiCustomerDemandPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [dispatchForm] = Form.useForm<DispatchFormValues>();

  const [data, setData] = useState<EdiCustomerDemandItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  // 供应商下拉选项
  const [supplierOptions, setSupplierOptions] = useState<{ label: string; value: string }[]>([]);

  // 详情抽屉
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<EdiCustomerDemandItem | null>(null);
  const [dispatchList, setDispatchList] = useState<EdiDemandDispatchItem[]>([]);

  // 变更记录抽屉
  const [changesOpen, setChangesOpen] = useState(false);
  const [changesLoading, setChangesLoading] = useState(false);
  const [changes, setChanges] = useState<EdiDemandChangeLogItem[]>([]);

  // 分发弹窗
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatchTarget, setDispatchTarget] = useState<EdiCustomerDemandItem | null>(null);
  const [dispatching, setDispatching] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await ediService.demandPage({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          partnerCode: cond.partnerCode || undefined,
          customerCode: cond.customerCode || undefined,
          transCode: cond.transCode || undefined,
          docType: cond.docType || undefined,
          status: cond.status || undefined,
          materialCode: cond.materialCode || undefined,
          customerOrderNo: cond.customerOrderNo || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  const loadSupplierOptions = useCallback(async () => {
    const list: EdiPartnerItem[] = await ediService.partnerOptions('SUPPLIER');
    setSupplierOptions(
      (list || []).map((item) => ({
        label: item.partnerName || item.partnerCode,
        value: item.partnerCode,
      })),
    );
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, {});
    void loadSupplierOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: SearchState) => {
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

  /** 打开详情抽屉，加载需求详情与分发记录 */
  const openDetail = async (record: EdiCustomerDemandItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    setDispatchList([]);
    try {
      const [detailRes, dispatchRes] = await Promise.all([
        ediService.demandDetail(record.demandNo),
        ediService.dispatchByDemand(record.demandNo),
      ]);
      setDetail(detailRes);
      setDispatchList(dispatchRes || []);
    } finally {
      setDetailLoading(false);
    }
  };

  /** 打开变更记录抽屉 */
  const openChanges = async (record: EdiCustomerDemandItem) => {
    setChangesOpen(true);
    setChangesLoading(true);
    setChanges([]);
    try {
      const res = await ediService.demandChanges(record.demandNo);
      setChanges(res || []);
    } finally {
      setChangesLoading(false);
    }
  };

  /** 打开分发弹窗 */
  const openDispatch = (record: EdiCustomerDemandItem) => {
    setDispatchTarget(record);
    dispatchForm.resetFields();
    dispatchForm.setFieldsValue({ autoSend: true });
    setDispatchOpen(true);
  };

  /** 提交分发 */
  const handleDispatch = async () => {
    if (!dispatchTarget) return;
    const values = await dispatchForm.validateFields();
    const payload: EdiDemandDispatchParams = {
      demandNo: dispatchTarget.demandNo,
      supplierCodes: values.supplierCodes,
      allocationRule: values.allocationRule,
      sendChannel: values.sendChannel,
      autoSend: values.autoSend,
      remark: values.remark,
    };
    setDispatching(true);
    try {
      const res = await ediService.demandDispatch(dispatchTarget.demandNo, payload);
      message.success(`分发成功，共生成 ${res?.length || 0} 条分发记录`);
      setDispatchOpen(false);
      void loadData();
    } finally {
      setDispatching(false);
    }
  };

  const columns: ColumnsType<EdiCustomerDemandItem> = [
    { title: '需求编号', dataIndex: 'demandNo', width: 180, fixed: 'left', render: renderText },
    { title: '来源报文', dataIndex: 'messageNo', width: 180, render: renderText },
    { title: '伙伴', dataIndex: 'partnerCode', width: 140, render: renderText },
    { title: '客户编码', dataIndex: 'customerCode', width: 140, render: renderText },
    { title: '客户订单号', dataIndex: 'customerOrderNo', width: 160, render: renderText },
    { title: '行号', dataIndex: 'customerLineNo', width: 80, render: renderText },
    {
      title: '单据类型',
      dataIndex: 'docType',
      width: 110,
      render: (v?: string) => (v ? DOC_TYPE_LABEL[v] || v : '-'),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: renderText },
    { title: '数量', dataIndex: 'qty', width: 100, render: renderText },
    { title: '单位', dataIndex: 'unit', width: 90, render: renderText },
    {
      title: '需求交期',
      dataIndex: 'requiredDate',
      width: 130,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    { title: '收货地址', dataIndex: 'shipTo', width: 200, render: renderText },
    { title: '版本', dataIndex: 'demandVersion', width: 80, render: renderText },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v?: string) =>
        v ? (
          <Tag color={EDI_DEMAND_STATUS_COLOR[v] || 'default'}>{EDI_DEMAND_STATUS_LABEL[v] || v}</Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '变更类型',
      dataIndex: 'changeType',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={EDI_CHANGE_TYPE_COLOR[v] || 'default'}>{EDI_CHANGE_TYPE_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" onClick={() => void openChanges(record)}>
            变更记录
          </Button>
          {hasPermission('edi:demand:dispatch') && (
            <Button type="link" size="small" icon={<SendOutlined />} onClick={() => openDispatch(record)}>
              分发
            </Button>
          )}
        </Space>
      ),
    },
  ];

  /** 详情抽屉内的分发记录列 */
  const dispatchColumns: ColumnsType<EdiDemandDispatchItem> = [
    { title: '分发编号', dataIndex: 'dispatchNo', width: 180, render: renderText },
    { title: '供应商', dataIndex: 'supplierCode', width: 140, render: renderText },
    { title: '数量', dataIndex: 'qty', width: 100, render: renderText },
    {
      title: '份额',
      dataIndex: 'sharePct',
      width: 100,
      render: (v?: number) => (v === undefined || v === null ? '-' : `${v}%`),
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
      render: renderTime,
    },
  ];

  /** 变更记录列 */
  const changeColumns: ColumnsType<EdiDemandChangeLogItem> = [
    {
      title: '变更类型',
      dataIndex: 'changeType',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={EDI_CHANGE_TYPE_COLOR[v] || 'default'}>{EDI_CHANGE_TYPE_LABEL[v] || v}</Tag> : '-',
    },
    { title: '原数量', dataIndex: 'prevQty', width: 100, render: renderText },
    { title: '新数量', dataIndex: 'newQty', width: 100, render: renderText },
    {
      title: '原交期',
      dataIndex: 'prevDate',
      width: 130,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '新交期',
      dataIndex: 'newDate',
      width: 130,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    { title: '原版本', dataIndex: 'prevVersion', width: 90, render: renderText },
    { title: '新版本', dataIndex: 'newVersion', width: 90, render: renderText },
    { title: '来源报文', dataIndex: 'messageNo', width: 180, render: renderText },
    { title: '操作人', dataIndex: 'operatorName', width: 120, render: renderText },
    { title: '变更时间', dataIndex: 'changedAt', width: 170, render: renderTime },
    { title: '变更原因', dataIndex: 'changeReason', width: 200, render: renderText },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        客户需求
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="需求编号 / 客户订单号" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="partnerCode" label="伙伴">
            <Input placeholder="伙伴编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="客户编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="customerOrderNo" label="客户订单号">
            <Input placeholder="客户订单号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="transCode" label="交易代码">
            <Select
              placeholder="请选择"
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: 160 }}
              options={EDI_TRANS_CODE_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="docType" label="单据类型">
            <Select placeholder="请选择" allowClear style={{ width: 160 }} options={DOC_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 140 }} options={EDI_DEMAND_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="物料编码" allowClear style={{ width: 160 }} />
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

      <Card title={`客户需求列表（共 ${total} 条）`}>
        <Table<EdiCustomerDemandItem>
          rowKey="demandNo"
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

      {/* 需求详情与分发记录 */}
      <Drawer title="需求详情" width={720} open={detailOpen} onClose={() => setDetailOpen(false)}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="需求编号">{renderText(detail?.demandNo)}</Descriptions.Item>
          <Descriptions.Item label="来源报文">{renderText(detail?.messageNo)}</Descriptions.Item>
          <Descriptions.Item label="伙伴">{renderText(detail?.partnerCode)}</Descriptions.Item>
          <Descriptions.Item label="交易代码">
            {detail?.transCode
              ? EDI_TRANS_CODE_OPTIONS.find((item) => item.value === detail.transCode)?.label ||
                detail.transCode
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="单据类型">
            {detail?.docType ? DOC_TYPE_LABEL[detail.docType] || detail.docType : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="客户编码">{renderText(detail?.customerCode)}</Descriptions.Item>
          <Descriptions.Item label="客户订单号">{renderText(detail?.customerOrderNo)}</Descriptions.Item>
          <Descriptions.Item label="行号">{renderText(detail?.customerLineNo)}</Descriptions.Item>
          <Descriptions.Item label="物料编码">{renderText(detail?.materialCode)}</Descriptions.Item>
          <Descriptions.Item label="产品编码">{renderText(detail?.productCode)}</Descriptions.Item>
          <Descriptions.Item label="数量">{renderText(detail?.qty)}</Descriptions.Item>
          <Descriptions.Item label="单位">{renderText(detail?.unit)}</Descriptions.Item>
          <Descriptions.Item label="需求交期">
            {detail?.requiredDate ? dayjs(detail.requiredDate).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="收货地址">{renderText(detail?.shipTo)}</Descriptions.Item>
          <Descriptions.Item label="工厂编码">{renderText(detail?.plantCode)}</Descriptions.Item>
          <Descriptions.Item label="版本">{renderText(detail?.demandVersion)}</Descriptions.Item>
          <Descriptions.Item label="状态">
            {detail?.status ? (
              <Tag color={EDI_DEMAND_STATUS_COLOR[detail.status] || 'default'}>
                {EDI_DEMAND_STATUS_LABEL[detail.status] || detail.status}
              </Tag>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="变更类型">
            {detail?.changeType ? (
              <Tag color={EDI_CHANGE_TYPE_COLOR[detail.changeType] || 'default'}>
                {EDI_CHANGE_TYPE_LABEL[detail.changeType] || detail.changeType}
              </Tag>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="原数量">{renderText(detail?.prevQty)}</Descriptions.Item>
          <Descriptions.Item label="原交期">
            {detail?.prevRequiredDate ? dayjs(detail.prevRequiredDate).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="变更原因">{renderText(detail?.changeReason)}</Descriptions.Item>
          <Descriptions.Item label="备注">{renderText(detail?.remark)}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{renderTime(detail?.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{renderTime(detail?.updatedAt)}</Descriptions.Item>
        </Descriptions>

        <Title level={5} style={{ marginTop: 24 }}>
          分发记录（共 {dispatchList.length} 条）
        </Title>
        <Table<EdiDemandDispatchItem>
          rowKey="dispatchNo"
          size="small"
          columns={dispatchColumns}
          dataSource={dispatchList}
          loading={detailLoading}
          scroll={{ x: 900 }}
          pagination={false}
        />
      </Drawer>

      {/* 变更记录 */}
      <Drawer title="变更记录" width={1000} open={changesOpen} onClose={() => setChangesOpen(false)}>
        <Table<EdiDemandChangeLogItem>
          rowKey="id"
          size="small"
          columns={changeColumns}
          dataSource={changes}
          loading={changesLoading}
          scroll={{ x: 1400 }}
          pagination={false}
        />
      </Drawer>

      {/* 分发 */}
      <Modal
        title="分发给供应商"
        open={dispatchOpen}
        onOk={handleDispatch}
        confirmLoading={dispatching}
        onCancel={() => setDispatchOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={dispatchForm} layout="vertical" preserve={false}>
          <Form.Item name="supplierCodes" label="供应商">
            <Select
              mode="multiple"
              allowClear
              placeholder="留空则按物料全部供货关系分发"
              optionFilterProp="label"
              options={supplierOptions}
            />
          </Form.Item>
          <Form.Item name="allocationRule" label="分配规则">
            <Select
              placeholder="留空取后台默认配置"
              allowClear
              options={EDI_ALLOCATION_RULE_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="sendChannel" label="发送渠道">
            <Select placeholder="请选择" allowClear options={EDI_SEND_CHANNEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="autoSend" label="自动发送" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
