import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { wmsService } from '@/services/wmsService';
import {
  WMS_CASE_ACTION_LABEL,
  WMS_CASE_ACTION_OPTIONS,
  WMS_CASE_STATUS_COLOR,
  WMS_CASE_STATUS_LABEL,
  WMS_CASE_STATUS_OPTIONS,
  WMS_WARNING_LEVEL_COLOR,
  WMS_WARNING_LEVEL_LABEL,
  WMS_WARNING_LEVEL_OPTIONS,
  WMS_WARNING_STATUS_COLOR,
  WMS_WARNING_STATUS_LABEL,
  WMS_WARNING_STATUS_OPTIONS,
  type WmsShortageActionItem,
  type WmsShortageCaseActionParams,
  type WmsShortageCaseCreateParams,
  type WmsShortageCaseItem,
  type WmsShortageCaseQuery,
  type WmsShortageCaseUpdateParams,
  type WmsShortageCalcParams,
  type WmsShortageWarningItem,
  type WmsWarningQuery,
} from '@/types/wms';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface CalcFormValues {
  materialCode: string;
  materialName?: string;
  requiredQty: number;
  lineCode?: string;
  workOrderNo?: string;
  requiredDate?: Dayjs;
  inTransitQty?: number;
  safetyStock?: number;
  purchaseLeadTimeDays?: number;
  remark?: string;
}

interface CaseCreateFormValues {
  warningNo?: string;
  materialCode: string;
  materialName?: string;
  lineCode?: string;
  affectedWorkOrders?: string;
  owner?: string;
  cause?: string;
  tempMeasure?: string;
  expectedRecoveryDate?: Dayjs;
  remark?: string;
}

/** 新建欠料单弹窗（缺料预警「生成欠料单」与欠料异常单「新建欠料单」共用） */
function CaseCreateModal({
  open,
  initial,
  onCancel,
  onSuccess,
}: {
  open: boolean;
  initial?: Partial<CaseCreateFormValues>;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [form] = Form.useForm<CaseCreateFormValues>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initial) {
        form.setFieldsValue(initial);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload: WmsShortageCaseCreateParams = {
      warningNo: values.warningNo,
      materialCode: values.materialCode,
      materialName: values.materialName,
      lineCode: values.lineCode,
      affectedWorkOrders: values.affectedWorkOrders,
      owner: values.owner,
      cause: values.cause,
      tempMeasure: values.tempMeasure,
      expectedRecoveryDate: values.expectedRecoveryDate
        ? values.expectedRecoveryDate.format('YYYY-MM-DD')
        : undefined,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      await wmsService.caseCreate(payload);
      message.success('创建成功');
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="新建欠料单"
      open={open}
      onOk={handleOk}
      confirmLoading={submitting}
      onCancel={onCancel}
      destroyOnClose
      width={640}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item name="warningNo" label="缺料预警号">
          <Input placeholder="请输入缺料预警号" />
        </Form.Item>
        <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
          <Input placeholder="请输入物料编码" />
        </Form.Item>
        <Form.Item name="materialName" label="物料名称">
          <Input placeholder="请输入物料名称" />
        </Form.Item>
        <Form.Item name="lineCode" label="产线">
          <Input placeholder="请输入产线编码" />
        </Form.Item>
        <Form.Item name="affectedWorkOrders" label="受影响工单">
          <Input placeholder="请输入受影响工单" />
        </Form.Item>
        <Form.Item name="owner" label="责任人">
          <Input placeholder="请输入责任人" />
        </Form.Item>
        <Form.Item name="cause" label="原因">
          <Input.TextArea rows={2} placeholder="请输入原因" />
        </Form.Item>
        <Form.Item name="tempMeasure" label="临时措施">
          <Input.TextArea rows={2} placeholder="请输入临时措施" />
        </Form.Item>
        <Form.Item name="expectedRecoveryDate" label="预计恢复日期">
          <DatePicker style={{ width: '100%' }} placeholder="请选择预计恢复日期" />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={2} placeholder="请输入备注" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

/* ==================== 缺料预警 ==================== */

interface WarningSearchState {
  materialCode?: string;
  lineCode?: string;
  workOrderNo?: string;
  warningLevel?: string;
  warningStatus?: string;
}

function WarningTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [calcForm] = Form.useForm<CalcFormValues>();

  const [data, setData] = useState<WmsShortageWarningItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<WarningSearchState>({});

  const [calcOpen, setCalcOpen] = useState(false);
  const [calcSubmitting, setCalcSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<WmsShortageWarningItem | null>(null);

  const [caseOpen, setCaseOpen] = useState(false);
  const [caseInitial, setCaseInitial] = useState<Partial<CaseCreateFormValues>>({});

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: WmsWarningQuery = {
          pageNum: page,
          pageSize: size,
          materialCode: cond.materialCode || undefined,
          lineCode: cond.lineCode || undefined,
          workOrderNo: cond.workOrderNo || undefined,
          warningLevel: cond.warningLevel || undefined,
          warningStatus: cond.warningStatus || undefined,
        };
        const res = await wmsService.warningPage(params);
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

  const onSearch = (values: WarningSearchState) => {
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

  const openCalc = () => {
    calcForm.resetFields();
    setCalcOpen(true);
  };

  const handleCalc = async () => {
    const values = await calcForm.validateFields();
    const payload: WmsShortageCalcParams = {
      materialCode: values.materialCode,
      materialName: values.materialName,
      requiredQty: values.requiredQty,
      lineCode: values.lineCode,
      workOrderNo: values.workOrderNo,
      requiredDate: values.requiredDate ? values.requiredDate.format('YYYY-MM-DD') : undefined,
      inTransitQty: values.inTransitQty,
      safetyStock: values.safetyStock,
      purchaseLeadTimeDays: values.purchaseLeadTimeDays,
      remark: values.remark,
    };
    setCalcSubmitting(true);
    try {
      await wmsService.warningCalculate(payload);
      message.success('缺料计算完成');
      setCalcOpen(false);
      void loadData();
    } finally {
      setCalcSubmitting(false);
    }
  };

  const openDetail = (record: WmsShortageWarningItem) => {
    setDetail(record);
    setDetailOpen(true);
  };

  const openCaseFromWarning = (record: WmsShortageWarningItem) => {
    setCaseInitial({
      warningNo: record.warningNo,
      materialCode: record.materialCode,
      materialName: record.materialName,
      lineCode: record.lineCode,
    });
    setCaseOpen(true);
  };

  const columns: ColumnsType<WmsShortageWarningItem> = [
    { title: '预警编号', dataIndex: 'warningNo', width: 180, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: (v) => v || '-' },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: (v) => v || '-' },
    { title: '产线', dataIndex: 'lineCode', width: 120, render: (v) => v || '-' },
    { title: '工单号', dataIndex: 'workOrderNo', width: 150, render: (v) => v || '-' },
    { title: '需求量', dataIndex: 'requiredQty', width: 100, render: (v) => v ?? '-' },
    { title: '现有量', dataIndex: 'onHandQty', width: 100, render: (v) => v ?? '-' },
    { title: '在途量', dataIndex: 'inTransitQty', width: 100, render: (v) => v ?? '-' },
    { title: '安全库存', dataIndex: 'safetyStock', width: 100, render: (v) => v ?? '-' },
    { title: '缺口量', dataIndex: 'gapQty', width: 100, render: (v) => v ?? '-' },
    { title: '需求日期', dataIndex: 'requiredDate', width: 120, render: (v) => v || '-' },
    { title: '采购周期(天)', dataIndex: 'purchaseLeadTimeDays', width: 120, render: (v) => v ?? '-' },
    {
      title: '预警等级',
      dataIndex: 'warningLevel',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={WMS_WARNING_LEVEL_COLOR[v]}>{WMS_WARNING_LEVEL_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '预警状态',
      dataIndex: 'warningStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={WMS_WARNING_STATUS_COLOR[v]}>{WMS_WARNING_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '计算依据', dataIndex: 'calcBasis', width: 160, render: (v) => v || '-' },
    {
      title: '计算时间',
      dataIndex: 'calcAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
          {hasPermission('wms:shortage:handle') && (
            <Button type="link" size="small" onClick={() => openCaseFromWarning(record)}>
              生成欠料单
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="lineCode" label="产线">
            <Input placeholder="请输入产线编码" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="workOrderNo" label="工单号">
            <Input placeholder="请输入工单号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="warningLevel" label="预警等级">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={WMS_WARNING_LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="warningStatus" label="预警状态">
            <Select placeholder="请选择" allowClear style={{ width: 140 }} options={WMS_WARNING_STATUS_OPTIONS} />
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

      <Card
        title={`缺料预警（共 ${total} 条）`}
        extra={
          hasPermission('wms:shortage:calculate') && (
            <Button type="primary" onClick={openCalc}>
              触发缺料计算
            </Button>
          )
        }
      >
        <Table<WmsShortageWarningItem>
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

      {/* 触发缺料计算 */}
      <Modal
        title="触发缺料计算"
        open={calcOpen}
        onOk={handleCalc}
        confirmLoading={calcSubmitting}
        onCancel={() => setCalcOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={calcForm} layout="vertical" preserve={false}>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="requiredQty" label="需求量" rules={[{ required: true, message: '请输入需求量' }]}>
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入需求量" />
          </Form.Item>
          <Form.Item name="lineCode" label="产线">
            <Input placeholder="请输入产线编码" />
          </Form.Item>
          <Form.Item name="workOrderNo" label="工单号">
            <Input placeholder="请输入工单号" />
          </Form.Item>
          <Form.Item name="requiredDate" label="需求日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择需求日期" />
          </Form.Item>
          <Form.Item name="inTransitQty" label="在途量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入在途量" />
          </Form.Item>
          <Form.Item name="safetyStock" label="安全库存">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入安全库存" />
          </Form.Item>
          <Form.Item name="purchaseLeadTimeDays" label="采购周期(天)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入采购周期" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 缺料预警详情 */}
      <Drawer title="缺料预警详情" width={640} open={detailOpen} onClose={() => setDetailOpen(false)} destroyOnClose>
        {detail && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="预警编号">{detail.warningNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="物料编码">{detail.materialCode || '-'}</Descriptions.Item>
            <Descriptions.Item label="物料名称">{detail.materialName || '-'}</Descriptions.Item>
            <Descriptions.Item label="产线">{detail.lineCode || '-'}</Descriptions.Item>
            <Descriptions.Item label="工单号">{detail.workOrderNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="需求量">{detail.requiredQty ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="现有量">{detail.onHandQty ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="在途量">{detail.inTransitQty ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="安全库存">{detail.safetyStock ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="缺口量">{detail.gapQty ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="需求日期">{detail.requiredDate || '-'}</Descriptions.Item>
            <Descriptions.Item label="采购周期(天)">{detail.purchaseLeadTimeDays ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="预警等级">
              {detail.warningLevel ? (
                <Tag color={WMS_WARNING_LEVEL_COLOR[detail.warningLevel]}>
                  {WMS_WARNING_LEVEL_LABEL[detail.warningLevel] || detail.warningLevel}
                </Tag>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="预警状态">
              {detail.warningStatus ? (
                <Tag color={WMS_WARNING_STATUS_COLOR[detail.warningStatus]}>
                  {WMS_WARNING_STATUS_LABEL[detail.warningStatus] || detail.warningStatus}
                </Tag>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="计算依据">{detail.calcBasis || '-'}</Descriptions.Item>
            <Descriptions.Item label="计算时间">
              {detail.calcAt ? dayjs(detail.calcAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="来源">{detail.source || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注">{detail.remark || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      <CaseCreateModal
        open={caseOpen}
        initial={caseInitial}
        onCancel={() => setCaseOpen(false)}
        onSuccess={() => setCaseOpen(false)}
      />
    </Space>
  );
}

/* ==================== 欠料异常单 ==================== */

interface CaseSearchState {
  materialCode?: string;
  lineCode?: string;
  warningNo?: string;
  owner?: string;
  caseStatus?: string;
}

interface CaseEditFormValues {
  affectedWorkOrders?: string;
  owner?: string;
  cause?: string;
  tempMeasure?: string;
  expectedRecoveryDate?: Dayjs;
  remark?: string;
}

interface CaseCloseFormValues {
  closeEvidence: string;
  closedBy?: string;
  remark?: string;
}

interface ActionFormValues {
  actionType: string;
  content: string;
  operatorName?: string;
}

const CASE_ACTION_COLUMNS: ColumnsType<WmsShortageActionItem> = [
  {
    title: '动作类型',
    dataIndex: 'actionType',
    width: 110,
    render: (v?: string) => (v ? WMS_CASE_ACTION_LABEL[v] || v : '-'),
  },
  { title: '处理内容', dataIndex: 'content', render: (v) => v || '-' },
  { title: '处理人', dataIndex: 'operatorName', width: 120, render: (v) => v || '-' },
  {
    title: '处理时间',
    dataIndex: 'actionAt',
    width: 170,
    render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
  },
];

function CaseActionForm({ caseNo, onAdded }: { caseNo: string; onAdded: () => void }) {
  const [form] = Form.useForm<ActionFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    const values = await form.validateFields();
    const payload: WmsShortageCaseActionParams = {
      actionType: values.actionType,
      content: values.content,
      operatorName: values.operatorName,
    };
    setSubmitting(true);
    try {
      await wmsService.caseAddAction(caseNo, payload);
      message.success('已追加处理记录');
      form.resetFields();
      onAdded();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form form={form} layout="vertical" initialValues={{ actionType: 'MEASURE' }}>
      <Form.Item name="actionType" label="动作类型">
        <Select options={WMS_CASE_ACTION_OPTIONS} />
      </Form.Item>
      <Form.Item name="content" label="处理内容" rules={[{ required: true, message: '请输入处理内容' }]}>
        <Input.TextArea rows={3} placeholder="请输入处理内容" />
      </Form.Item>
      <Form.Item name="operatorName" label="处理人">
        <Input placeholder="请输入处理人" />
      </Form.Item>
      <Button type="primary" loading={submitting} onClick={handleAdd}>
        追加
      </Button>
    </Form>
  );
}

function CaseTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [editForm] = Form.useForm<CaseEditFormValues>();
  const [closeForm] = Form.useForm<CaseCloseFormValues>();

  const [data, setData] = useState<WmsShortageCaseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<CaseSearchState>({});

  const [createOpen, setCreateOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<WmsShortageCaseItem | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsCaseNo, setActionsCaseNo] = useState<string | null>(null);
  const [actionList, setActionList] = useState<WmsShortageActionItem[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const [closeOpen, setCloseOpen] = useState(false);
  const [closeRecord, setCloseRecord] = useState<WmsShortageCaseItem | null>(null);
  const [closeSubmitting, setCloseSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: WmsShortageCaseQuery = {
          pageNum: page,
          pageSize: size,
          materialCode: cond.materialCode || undefined,
          lineCode: cond.lineCode || undefined,
          warningNo: cond.warningNo || undefined,
          owner: cond.owner || undefined,
          caseStatus: cond.caseStatus || undefined,
        };
        const res = await wmsService.casePage(params);
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

  const onSearch = (values: CaseSearchState) => {
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

  const openEdit = (record: WmsShortageCaseItem) => {
    setEditRecord(record);
    editForm.resetFields();
    editForm.setFieldsValue({
      owner: record.owner,
      affectedWorkOrders: record.affectedWorkOrders,
      cause: record.cause,
      tempMeasure: record.tempMeasure,
      expectedRecoveryDate: record.expectedRecoveryDate ? dayjs(record.expectedRecoveryDate) : undefined,
      remark: record.remark,
    });
    setEditOpen(true);
  };

  const handleEditOk = async () => {
    if (!editRecord) return;
    const values = await editForm.validateFields();
    const payload: WmsShortageCaseUpdateParams = {
      owner: values.owner,
      affectedWorkOrders: values.affectedWorkOrders,
      cause: values.cause,
      tempMeasure: values.tempMeasure,
      expectedRecoveryDate: values.expectedRecoveryDate
        ? values.expectedRecoveryDate.format('YYYY-MM-DD')
        : undefined,
      remark: values.remark,
    };
    setEditSubmitting(true);
    try {
      await wmsService.caseUpdate(editRecord.caseNo, payload);
      message.success('更新成功');
      setEditOpen(false);
      void loadData();
    } finally {
      setEditSubmitting(false);
    }
  };

  const loadActions = async (caseNo: string) => {
    setActionLoading(true);
    try {
      const res = await wmsService.caseActions(caseNo);
      setActionList(res || []);
    } finally {
      setActionLoading(false);
    }
  };

  const openActions = (record: WmsShortageCaseItem) => {
    setActionsCaseNo(record.caseNo);
    setActionList([]);
    setActionsOpen(true);
    void loadActions(record.caseNo);
  };

  const openClose = (record: WmsShortageCaseItem) => {
    setCloseRecord(record);
    closeForm.resetFields();
    setCloseOpen(true);
  };

  const handleCloseOk = async () => {
    if (!closeRecord) return;
    const values = await closeForm.validateFields();
    setCloseSubmitting(true);
    try {
      await wmsService.caseClose(closeRecord.caseNo, values);
      message.success('关闭成功');
      setCloseOpen(false);
      void loadData();
    } finally {
      setCloseSubmitting(false);
    }
  };

  const columns: ColumnsType<WmsShortageCaseItem> = [
    { title: '欠料单号', dataIndex: 'caseNo', width: 150, render: (v) => v || '-' },
    { title: '缺料预警号', dataIndex: 'warningNo', width: 150, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: (v) => v || '-' },
    { title: '物料名称', dataIndex: 'materialName', width: 150, render: (v) => v || '-' },
    { title: '产线', dataIndex: 'lineCode', width: 120, render: (v) => v || '-' },
    { title: '受影响工单', dataIndex: 'affectedWorkOrders', width: 160, render: (v) => v || '-' },
    { title: '责任人', dataIndex: 'owner', width: 110, render: (v) => v || '-' },
    { title: '原因', dataIndex: 'cause', width: 160, render: (v) => v || '-' },
    { title: '临时措施', dataIndex: 'tempMeasure', width: 160, render: (v) => v || '-' },
    { title: '预计恢复日期', dataIndex: 'expectedRecoveryDate', width: 140, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'caseStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={WMS_CASE_STATUS_COLOR[v]}>{WMS_CASE_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '关闭证据', dataIndex: 'closeEvidence', width: 160, render: (v) => v || '-' },
    { title: '关闭人', dataIndex: 'closedBy', width: 110, render: (v) => v || '-' },
    {
      title: '关闭时间',
      dataIndex: 'closedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) =>
        hasPermission('wms:shortage:handle') ? (
          <Space size="small" wrap>
            {record.caseStatus !== 'CLOSED' && (
              <Button type="link" size="small" onClick={() => openEdit(record)}>
                编辑
              </Button>
            )}
            <Button type="link" size="small" onClick={() => openActions(record)}>
              处理记录
            </Button>
            {record.caseStatus !== 'CLOSED' && (
              <Button type="link" size="small" onClick={() => openClose(record)}>
                关闭
              </Button>
            )}
          </Space>
        ) : null,
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="lineCode" label="产线">
            <Input placeholder="请输入产线编码" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="warningNo" label="缺料预警号">
            <Input placeholder="请输入缺料预警号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="owner" label="责任人">
            <Input placeholder="请输入责任人" allowClear style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="caseStatus" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={WMS_CASE_STATUS_OPTIONS} />
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

      <Card
        title={`欠料异常单（共 ${total} 条）`}
        extra={
          hasPermission('wms:shortage:handle') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              新建欠料单
            </Button>
          )
        }
      >
        <Table<WmsShortageCaseItem>
          rowKey="caseNo"
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

      <CaseCreateModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          void loadData();
        }}
      />

      {/* 编辑欠料单 */}
      <Modal
        title="编辑欠料单"
        open={editOpen}
        onOk={handleEditOk}
        confirmLoading={editSubmitting}
        onCancel={() => setEditOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={editForm} layout="vertical" preserve={false}>
          <Form.Item name="owner" label="责任人">
            <Input placeholder="请输入责任人" />
          </Form.Item>
          <Form.Item name="affectedWorkOrders" label="受影响工单">
            <Input placeholder="请输入受影响工单" />
          </Form.Item>
          <Form.Item name="cause" label="原因">
            <Input.TextArea rows={2} placeholder="请输入原因" />
          </Form.Item>
          <Form.Item name="tempMeasure" label="临时措施">
            <Input.TextArea rows={2} placeholder="请输入临时措施" />
          </Form.Item>
          <Form.Item name="expectedRecoveryDate" label="预计恢复日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择预计恢复日期" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 处理记录 */}
      <Drawer
        title={`处理记录 - ${actionsCaseNo ?? ''}`}
        width={720}
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        destroyOnClose
      >
        <Table<WmsShortageActionItem>
          rowKey="id"
          size="small"
          loading={actionLoading}
          columns={CASE_ACTION_COLUMNS}
          dataSource={actionList}
          pagination={false}
        />
        {hasPermission('wms:shortage:handle') && actionsCaseNo && (
          <>
            <Divider />
            <Title level={5}>追加处理记录</Title>
            <CaseActionForm caseNo={actionsCaseNo} onAdded={() => void loadActions(actionsCaseNo)} />
          </>
        )}
      </Drawer>

      {/* 关闭欠料单 */}
      <Modal
        title="关闭欠料单"
        open={closeOpen}
        onOk={handleCloseOk}
        confirmLoading={closeSubmitting}
        onCancel={() => setCloseOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={closeForm} layout="vertical" preserve={false}>
          <Form.Item name="closeEvidence" label="关闭证据" rules={[{ required: true, message: '请输入关闭证据' }]}>
            <Input.TextArea rows={3} placeholder="请输入关闭证据" />
          </Form.Item>
          <Form.Item name="closedBy" label="关闭人">
            <Input placeholder="请输入关闭人" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ==================== 缺料与欠料 ==================== */

export default function WmsShortagePage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        缺料与欠料
      </Title>

      <Tabs
        defaultActiveKey="warning"
        items={[
          { key: 'warning', label: '缺料预警', children: <WarningTab /> },
          { key: 'case', label: '欠料异常单', children: <CaseTab /> },
        ]}
      />
    </Space>
  );
}
