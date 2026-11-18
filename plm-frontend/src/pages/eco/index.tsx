import { useCallback, useEffect, useState } from 'react';
import type { Key } from 'react';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { ecrService, ecoService } from '@/services/ecoService';
import type {
  EcoChangeItemItem,
  EcoChangeOrderItem,
  EcoChangeRequestItem,
  EcoImpactAnalysisItem,
  EcoNoticeItem,
  EcrConvertItem,
  EcoExecuteResult,
} from '@/types/eco';
import {
  ECO_APPROVAL_STATUS_OPTIONS,
  ECO_APPROVAL_STATUS_TEXT,
  ECO_CHANGE_ACTION_OPTIONS,
  ECO_CHANGE_ACTION_TEXT,
  ECO_EXECUTION_STATUS_OPTIONS,
  ECO_EXECUTION_STATUS_TEXT,
  ECO_IMPACT_HANDLE_STATUS_TEXT,
  ECO_IMPACT_TYPE_OPTIONS,
  ECO_IMPACT_TYPE_TEXT,
  ECO_NOTICE_STATUS_TEXT,
  ECO_NOTICE_TARGET_OPTIONS,
  ECO_NOTICE_TARGET_TEXT,
  ECO_OBJECT_TYPE_OPTIONS,
  ECO_OBJECT_TYPE_TEXT,
  ECO_RISK_LEVEL_OPTIONS,
  ECO_RISK_LEVEL_TEXT,
  ECO_SOURCE_TYPE_OPTIONS,
  ECO_SOURCE_TYPE_TEXT,
  ECO_SWITCH_STATUS_TEXT,
  ECO_URGENCY_OPTIONS,
  ECO_URGENCY_TEXT,
  ECR_STATUS_OPTIONS,
  ECR_STATUS_TEXT,
} from '@/types/eco';
import { useAuthStore } from '@/stores/authStore';

const { Title, Text } = Typography;

/** ECR 状态标签颜色 */
const ECR_STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  submitted: 'processing',
  reviewing: 'processing',
  approved: 'success',
  rejected: 'error',
  converted: 'purple',
  closed: 'default',
};

/** ECO 审批状态标签颜色 */
const APPROVAL_STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  submitted: 'processing',
  approved: 'success',
  rejected: 'error',
};

/** ECO 执行状态标签颜色 */
const EXECUTION_STATUS_COLOR: Record<string, string> = {
  pending: 'default',
  executing: 'processing',
  completed: 'success',
};

/** 风险等级标签颜色 */
const RISK_LEVEL_COLOR: Record<string, string> = {
  low: 'green',
  middle: 'orange',
  high: 'red',
};

/** 版本切换状态标签颜色 */
const SWITCH_STATUS_COLOR: Record<string, string> = {
  pending: 'default',
  switched: 'success',
  failed: 'error',
};

/** 影响处理状态标签颜色 */
const IMPACT_HANDLE_COLOR: Record<string, string> = {
  pending: 'default',
  handled: 'success',
  ignored: 'default',
};

/** 通知状态标签颜色 */
const NOTICE_STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  sent: 'processing',
  confirmed: 'success',
};

/** 评审/审批结论选项 */
const DECISION_OPTIONS = [
  { value: 'approve', label: '批准' },
  { value: 'reject', label: '驳回' },
];

interface EcrFormValues {
  title: string;
  sourceType?: string;
  sourceRef?: string;
  reason?: string;
  riskLevel?: string;
  urgency?: string;
  affectedProducts?: string;
  affectedMaterials?: string;
  affectedDocuments?: string;
  affectedProcesses?: string;
  remark?: string;
}

interface ReviewFormValues {
  decision: string;
  comment?: string;
}

interface ConvertFormValues {
  planDesc?: string;
  changeType?: string;
  effectiveDate?: Dayjs;
  effectiveBatch?: string;
}

interface ApproveFormValues {
  decision: string;
  comment?: string;
}

interface ExecuteFormValues {
  effectiveDate?: Dayjs;
  effectiveBatch?: string;
}

interface NoticeFormValues {
  title: string;
  content?: string;
  targetType: string;
  targetCode?: string;
  targetName?: string;
  remark?: string;
}

interface EcrSearchState {
  ecrNo?: string;
  status?: string;
  sourceType?: string;
  riskLevel?: string;
  urgency?: string;
}

interface EcoSearchState {
  ecoNo?: string;
  ecrNo?: string;
  approvalStatus?: string;
  executionStatus?: string;
}

export default function EcoManagement() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [ecrForm] = Form.useForm<EcrFormValues>();
  const [reviewForm] = Form.useForm<ReviewFormValues>();
  const [convertForm] = Form.useForm<ConvertFormValues>();
  const [approveForm] = Form.useForm<ApproveFormValues>();
  const [executeForm] = Form.useForm<ExecuteFormValues>();
  const [noticeForm] = Form.useForm<NoticeFormValues>();

  const [activeTab, setActiveTab] = useState('ecr');

  // ECR 列表
  const [ecrData, setEcrData] = useState<EcoChangeRequestItem[]>([]);
  const [ecrTotal, setEcrTotal] = useState(0);
  const [ecrLoading, setEcrLoading] = useState(false);
  const [ecrPageNum, setEcrPageNum] = useState(1);
  const [ecrPageSize, setEcrPageSize] = useState(10);
  const [ecrSearch, setEcrSearch] = useState<EcrSearchState>({});
  const [ecrModalOpen, setEcrModalOpen] = useState(false);
  const [ecrEditing, setEcrEditing] = useState<EcoChangeRequestItem | null>(null);
  const [ecrSubmitting, setEcrSubmitting] = useState(false);

  // ECR 详情
  const [ecrDrawerOpen, setEcrDrawerOpen] = useState(false);
  const [ecrTarget, setEcrTarget] = useState<EcoChangeRequestItem | null>(null);
  const [ecrOrders, setEcrOrders] = useState<EcoChangeOrderItem[]>([]);
  const [ecrDetailLoading, setEcrDetailLoading] = useState(false);

  // 评审
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<EcoChangeRequestItem | null>(null);
  const [reviewSaving, setReviewSaving] = useState(false);

  // 转 ECO
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertTarget, setConvertTarget] = useState<EcoChangeRequestItem | null>(null);
  const [convertItems, setConvertItems] = useState<EcrConvertItem[]>([]);
  const [convertSaving, setConvertSaving] = useState(false);

  // ECO 列表
  const [ecoData, setEcoData] = useState<EcoChangeOrderItem[]>([]);
  const [ecoTotal, setEcoTotal] = useState(0);
  const [ecoLoading, setEcoLoading] = useState(false);
  const [ecoPageNum, setEcoPageNum] = useState(1);
  const [ecoPageSize, setEcoPageSize] = useState(10);
  const [ecoSearch, setEcoSearch] = useState<EcoSearchState>({});

  // ECO 详情
  const [ecoDrawerOpen, setEcoDrawerOpen] = useState(false);
  const [ecoItems, setEcoItems] = useState<EcoChangeItemItem[]>([]);
  const [ecoImpacts, setEcoImpacts] = useState<EcoImpactAnalysisItem[]>([]);
  const [ecoNotices, setEcoNotices] = useState<EcoNoticeItem[]>([]);
  const [ecoDetailOrder, setEcoDetailOrder] = useState<EcoChangeOrderItem | null>(null);
  const [ecoDrawerLoading, setEcoDrawerLoading] = useState(false);

  // 审批
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<EcoChangeOrderItem | null>(null);
  const [approveSaving, setApproveSaving] = useState(false);

  // 影响分析
  const [impactOpen, setImpactOpen] = useState(false);
  const [impactTarget, setImpactTarget] = useState<EcoChangeOrderItem | null>(null);
  const [impactTypes, setImpactTypes] = useState<string[]>([]);
  const [impactList, setImpactList] = useState<EcoImpactAnalysisItem[]>([]);
  const [impactLoading, setImpactLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // 执行
  const [execOpen, setExecOpen] = useState(false);
  const [execTarget, setExecTarget] = useState<EcoChangeOrderItem | null>(null);
  const [execItems, setExecItems] = useState<EcoChangeItemItem[]>([]);
  const [execSelected, setExecSelected] = useState<Key[]>([]);
  const [execResult, setExecResult] = useState<EcoExecuteResult | null>(null);
  const [execLoading, setExecLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  // 通知
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeTarget, setNoticeTarget] = useState<EcoChangeOrderItem | null>(null);
  const [noticeList, setNoticeList] = useState<EcoNoticeItem[]>([]);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeSaving, setNoticeSaving] = useState(false);
  const [noticeActing, setNoticeActing] = useState(false);

  const loadEcr = useCallback(
    async (page = ecrPageNum, size = ecrPageSize, cond = ecrSearch) => {
      setEcrLoading(true);
      try {
        const res = await ecrService.page({
          pageNum: page,
          pageSize: size,
          ecrNo: cond.ecrNo || undefined,
          status: cond.status || undefined,
          sourceType: cond.sourceType || undefined,
          riskLevel: cond.riskLevel || undefined,
          urgency: cond.urgency || undefined,
        });
        setEcrData(res.list || []);
        setEcrTotal(res.total || 0);
      } finally {
        setEcrLoading(false);
      }
    },
    [ecrPageNum, ecrPageSize, ecrSearch],
  );

  const loadEco = useCallback(
    async (page = ecoPageNum, size = ecoPageSize, cond = ecoSearch) => {
      setEcoLoading(true);
      try {
        const res = await ecoService.page({
          pageNum: page,
          pageSize: size,
          ecoNo: cond.ecoNo || undefined,
          ecrNo: cond.ecrNo || undefined,
          approvalStatus: cond.approvalStatus || undefined,
          executionStatus: cond.executionStatus || undefined,
        });
        setEcoData(res.list || []);
        setEcoTotal(res.total || 0);
      } finally {
        setEcoLoading(false);
      }
    },
    [ecoPageNum, ecoPageSize, ecoSearch],
  );

  useEffect(() => {
    void loadEcr(1, ecrPageSize, {});
    void loadEco(1, ecoPageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEcrSearch = (values: EcrSearchState) => {
    const cond = { ...values };
    setEcrSearch(cond);
    setEcrPageNum(1);
    void loadEcr(1, ecrPageSize, cond);
  };

  const onEcrReset = () => {
    setEcrSearch({});
    setEcrPageNum(1);
    void loadEcr(1, ecrPageSize, {});
  };

  const onEcoSearch = (values: EcoSearchState) => {
    const cond = { ...values };
    setEcoSearch(cond);
    setEcoPageNum(1);
    void loadEco(1, ecoPageSize, cond);
  };

  const onEcoReset = () => {
    setEcoSearch({});
    setEcoPageNum(1);
    void loadEco(1, ecoPageSize, {});
  };

  // ECR 新增/编辑
  const openEcrCreate = () => {
    setEcrEditing(null);
    ecrForm.resetFields();
    ecrForm.setFieldsValue({ sourceType: 'internal', riskLevel: 'low', urgency: 'normal' });
    setEcrModalOpen(true);
  };

  const openEcrEdit = (record: EcoChangeRequestItem) => {
    setEcrEditing(record);
    ecrForm.resetFields();
    ecrForm.setFieldsValue({
      title: record.title,
      sourceType: record.sourceType,
      sourceRef: record.sourceRef,
      reason: record.reason,
      riskLevel: record.riskLevel,
      urgency: record.urgency,
      affectedProducts: record.affectedProducts,
      affectedMaterials: record.affectedMaterials,
      affectedDocuments: record.affectedDocuments,
      affectedProcesses: record.affectedProcesses,
      remark: record.remark,
    });
    setEcrModalOpen(true);
  };

  const handleEcrSubmit = async () => {
    const values = await ecrForm.validateFields();
    setEcrSubmitting(true);
    try {
      if (ecrEditing) {
        await ecrService.update(ecrEditing.id, values);
        message.success('更新成功');
      } else {
        await ecrService.create(values);
        message.success('新增成功');
      }
      setEcrModalOpen(false);
      void loadEcr();
    } finally {
      setEcrSubmitting(false);
    }
  };

  const handleEcrDelete = async (record: EcoChangeRequestItem) => {
    await ecrService.remove(record.id);
    message.success('删除成功');
    void loadEcr();
  };

  const openEcrDetail = async (record: EcoChangeRequestItem) => {
    setEcrTarget(record);
    setEcrDrawerOpen(true);
    setEcrDetailLoading(true);
    try {
      const res = await ecrService.detail(record.id);
      setEcrTarget(res.changeRequest);
      setEcrOrders(res.orders || []);
    } finally {
      setEcrDetailLoading(false);
    }
  };

  const openReview = (record: EcoChangeRequestItem) => {
    setReviewTarget(record);
    reviewForm.resetFields();
    reviewForm.setFieldsValue({ decision: 'approve' });
    setReviewOpen(true);
  };

  const handleReview = async () => {
    if (!reviewTarget) return;
    const values = await reviewForm.validateFields();
    setReviewSaving(true);
    try {
      await ecrService.review(reviewTarget.id, values);
      message.success('评审完成');
      setReviewOpen(false);
      void loadEcr();
    } finally {
      setReviewSaving(false);
    }
  };

  const handleEcrSubmitFlow = async (record: EcoChangeRequestItem) => {
    await ecrService.submit(record.id);
    message.success('提交成功');
    void loadEcr();
  };

  // 转 ECO
  const openConvert = (record: EcoChangeRequestItem) => {
    setConvertTarget(record);
    convertForm.resetFields();
    convertForm.setFieldsValue({ changeType: 'modify' });
    setConvertItems([{ objectType: 'material', objectCode: '', changeAction: 'modify' }]);
    setConvertOpen(true);
  };

  const updateConvertItem = (
    index: number,
    field: keyof EcrConvertItem,
    value: string,
  ) => {
    setConvertItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addConvertItem = () => {
    setConvertItems((prev) => [...prev, { objectType: 'material', objectCode: '', changeAction: 'modify' }]);
  };

  const removeConvertItem = (index: number) => {
    setConvertItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (!convertTarget) return;
    const values = await convertForm.validateFields();
    const items = convertItems.filter((item) => item.objectCode);
    if (!items.length) {
      message.warning('请至少录入一条变更对象明细');
      return;
    }
    setConvertSaving(true);
    try {
      await ecrService.convert(convertTarget.id, {
        planDesc: values.planDesc,
        changeType: values.changeType,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
        effectiveBatch: values.effectiveBatch,
        items,
      });
      message.success('已转为变更单');
      setConvertOpen(false);
      void loadEcr();
      setActiveTab('eco');
      void loadEco();
    } finally {
      setConvertSaving(false);
    }
  };

  // ECO 详情
  const openEcoDetail = async (record: EcoChangeOrderItem) => {
    setEcoDetailOrder(record);
    setEcoDrawerOpen(true);
    setEcoDrawerLoading(true);
    try {
      const res = await ecoService.detail(record.id);
      setEcoDetailOrder(res.order);
      setEcoItems(res.items || []);
      setEcoNotices(res.notices || []);
      setEcoImpacts(res.impacts || []);
    } finally {
      setEcoDrawerLoading(false);
    }
  };

  const reloadEcoDetail = async () => {
    if (!ecoDetailOrder) return;
    setEcoDrawerLoading(true);
    try {
      const res = await ecoService.detail(ecoDetailOrder.id);
      setEcoDetailOrder(res.order);
      setEcoItems(res.items || []);
      setEcoNotices(res.notices || []);
      setEcoImpacts(res.impacts || []);
    } finally {
      setEcoDrawerLoading(false);
    }
  };

  const handleRemoveItem = async (record: EcoChangeItemItem) => {
    await ecoService.removeItem(record.id);
    message.success('明细已删除');
    await reloadEcoDetail();
  };

  const handleEcoSubmitFlow = async (record: EcoChangeOrderItem) => {
    await ecoService.submit(record.id);
    message.success('提交成功');
    void loadEco();
  };

  // 审批
  const openApprove = (record: EcoChangeOrderItem) => {
    setApproveTarget(record);
    approveForm.resetFields();
    approveForm.setFieldsValue({ decision: 'approve' });
    setApproveOpen(true);
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    const values = await approveForm.validateFields();
    setApproveSaving(true);
    try {
      await ecoService.approve(approveTarget.id, values);
      message.success('审批完成');
      setApproveOpen(false);
      void loadEco();
    } finally {
      setApproveSaving(false);
    }
  };

  // 影响分析
  const openImpact = async (record: EcoChangeOrderItem) => {
    setImpactTarget(record);
    setImpactTypes([]);
    setImpactList([]);
    setImpactOpen(true);
    setImpactLoading(true);
    try {
      const res = await ecoService.impacts(record.id);
      setImpactList(res || []);
    } finally {
      setImpactLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!impactTarget) return;
    setAnalyzing(true);
    try {
      const res = await ecoService.analyzeImpacts(impactTarget.id, {
        includeTypes: impactTypes.length ? impactTypes : undefined,
      });
      setImpactList(res || []);
      message.success('影响分析完成');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImpactStatus = async (record: EcoImpactAnalysisItem, handleStatus: string) => {
    await ecoService.handleImpact(record.id, { handleStatus });
    message.success('影响处理状态已更新');
    if (impactTarget) {
      const res = await ecoService.impacts(impactTarget.id);
      setImpactList(res || []);
    } else if (ecoDetailOrder) {
      const res = await ecoService.impacts(ecoDetailOrder.id);
      setEcoImpacts(res || []);
    }
  };

  // 执行
  const openExecute = async (record: EcoChangeOrderItem) => {
    setExecTarget(record);
    setExecResult(null);
    executeForm.resetFields();
    setExecOpen(true);
    setExecLoading(true);
    try {
      const res = await ecoService.items(record.id);
      setExecItems(res || []);
      setExecSelected((res || []).map((item) => item.id));
    } finally {
      setExecLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!execTarget) return;
    const values = await executeForm.validateFields();
    setExecuting(true);
    try {
      const res = await ecoService.execute(execTarget.id, {
        effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
        effectiveBatch: values.effectiveBatch,
        switchedItems: execSelected.map((key) => Number(key)),
      });
      setExecResult(res);
      message.success('变更执行完成');
      void loadEco();
    } finally {
      setExecuting(false);
    }
  };

  // 通知
  const openNotice = async (record: EcoChangeOrderItem) => {
    setNoticeTarget(record);
    noticeForm.resetFields();
    noticeForm.setFieldsValue({ targetType: 'internal' });
    setNoticeOpen(true);
    setNoticeLoading(true);
    try {
      const res = await ecoService.notices(record.id);
      setNoticeList(res || []);
    } finally {
      setNoticeLoading(false);
    }
  };

  const reloadNotices = async () => {
    if (noticeTarget) {
      const res = await ecoService.notices(noticeTarget.id);
      setNoticeList(res || []);
      return;
    }
    if (ecoDetailOrder) {
      const res = await ecoService.notices(ecoDetailOrder.id);
      setEcoNotices(res || []);
    }
  };

  const handleCreateNotice = async () => {
    if (!noticeTarget) return;
    const values = await noticeForm.validateFields();
    setNoticeSaving(true);
    try {
      await ecoService.createNotice(noticeTarget.id, values);
      message.success('通知已创建');
      noticeForm.resetFields();
      noticeForm.setFieldsValue({ targetType: 'internal' });
      await reloadNotices();
    } finally {
      setNoticeSaving(false);
    }
  };

  const handleSendNotice = async (record: EcoNoticeItem) => {
    setNoticeActing(true);
    try {
      await ecoService.sendNotice(record.id);
      message.success('通知已发送');
      await reloadNotices();
    } finally {
      setNoticeActing(false);
    }
  };

  const handleConfirmNotice = async (record: EcoNoticeItem) => {
    setNoticeActing(true);
    try {
      await ecoService.confirmNotice(record.id);
      message.success('通知已确认');
      await reloadNotices();
    } finally {
      setNoticeActing(false);
    }
  };

  const ecrColumns: ColumnsType<EcoChangeRequestItem> = [
    { title: '申请编号', dataIndex: 'ecrNo', width: 150, render: (v) => v || '-' },
    { title: '标题', dataIndex: 'title', width: 220 },
    {
      title: '来源',
      dataIndex: 'sourceType',
      width: 110,
      render: (v?: string) => (v ? ECO_SOURCE_TYPE_TEXT[v] || v : '-'),
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={RISK_LEVEL_COLOR[v] || 'default'}>{ECO_RISK_LEVEL_TEXT[v] || v}</Tag> : '-',
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      width: 100,
      render: (v?: string) => (v ? ECO_URGENCY_TEXT[v] || v : '-'),
    },
    { title: '申请人', dataIndex: 'applicantName', width: 110, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={ECR_STATUS_COLOR[v] || 'default'}>{ECR_STATUS_TEXT[v] || v}</Tag> : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 320,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openEcrDetail(record)}>
            详情
          </Button>
          {hasPermission('eco:update') && record.status === 'draft' && (
            <Button type="link" size="small" onClick={() => openEcrEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('eco:update') && record.status === 'draft' && (
            <Popconfirm title="确认提交该变更申请？" onConfirm={() => handleEcrSubmitFlow(record)}>
              <Button type="link" size="small">
                提交
              </Button>
            </Popconfirm>
          )}
          {hasPermission('eco:review') &&
            (record.status === 'submitted' || record.status === 'reviewing') && (
              <Button type="link" size="small" onClick={() => openReview(record)}>
                评审
              </Button>
            )}
          {hasPermission('eco:convert') && record.status === 'approved' && (
            <Button type="link" size="small" onClick={() => openConvert(record)}>
              转 ECO
            </Button>
          )}
          {hasPermission('eco:delete') && (
            <Popconfirm title="确认删除该变更申请？" onConfirm={() => handleEcrDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const ecoColumns: ColumnsType<EcoChangeOrderItem> = [
    { title: '变更单编号', dataIndex: 'ecoNo', width: 150, render: (v) => v || '-' },
    { title: '来源申请', dataIndex: 'ecrNo', width: 140, render: (v) => v || '-' },
    { title: '标题', dataIndex: 'title', width: 200, render: (v) => v || '-' },
    {
      title: '变更类型',
      dataIndex: 'changeType',
      width: 110,
      render: (v?: string) => (v ? ECO_CHANGE_ACTION_TEXT[v] || v : '-'),
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      width: 110,
      render: (v?: string) =>
        v ? (
          <Tag color={APPROVAL_STATUS_COLOR[v] || 'default'}>{ECO_APPROVAL_STATUS_TEXT[v] || v}</Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '执行状态',
      dataIndex: 'executionStatus',
      width: 110,
      render: (v?: string) =>
        v ? (
          <Tag color={EXECUTION_STATUS_COLOR[v] || 'default'}>{ECO_EXECUTION_STATUS_TEXT[v] || v}</Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      width: 130,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 340,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openEcoDetail(record)}>
            详情
          </Button>
          {hasPermission('eco:update') && record.approvalStatus === 'draft' && (
            <Popconfirm title="确认提交该变更单？" onConfirm={() => handleEcoSubmitFlow(record)}>
              <Button type="link" size="small">
                提交
              </Button>
            </Popconfirm>
          )}
          {hasPermission('eco:approve') && record.approvalStatus === 'submitted' && (
            <Button type="link" size="small" onClick={() => openApprove(record)}>
              审批
            </Button>
          )}
          {hasPermission('eco:impact') && (
            <Button type="link" size="small" onClick={() => openImpact(record)}>
              影响分析
            </Button>
          )}
          {hasPermission('eco:execute') && record.approvalStatus === 'approved' && (
            <Button type="link" size="small" onClick={() => openExecute(record)}>
              执行
            </Button>
          )}
          {hasPermission('eco:notice') && (
            <Button type="link" size="small" onClick={() => openNotice(record)}>
              通知
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const orderColumns: ColumnsType<EcoChangeOrderItem> = [
    { title: '变更单编号', dataIndex: 'ecoNo', width: 150, render: (v) => v || '-' },
    { title: '标题', dataIndex: 'title', width: 200, render: (v) => v || '-' },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      width: 110,
      render: (v?: string) => (v ? ECO_APPROVAL_STATUS_TEXT[v] || v : '-'),
    },
    {
      title: '执行状态',
      dataIndex: 'executionStatus',
      width: 110,
      render: (v?: string) => (v ? ECO_EXECUTION_STATUS_TEXT[v] || v : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
  ];

  const ecoItemColumns: ColumnsType<EcoChangeItemItem> = [
    {
      title: '对象类型',
      dataIndex: 'objectType',
      width: 110,
      render: (v?: string) => (v ? ECO_OBJECT_TYPE_TEXT[v] || v : '-'),
    },
    { title: '对象编码', dataIndex: 'objectCode', width: 150, render: (v) => v || '-' },
    { title: '对象名称', dataIndex: 'objectName', width: 160, render: (v) => v || '-' },
    {
      title: '变更动作',
      dataIndex: 'changeAction',
      width: 110,
      render: (v?: string) => (v ? ECO_CHANGE_ACTION_TEXT[v] || v : '-'),
    },
    { title: '变更前版本', dataIndex: 'beforeVersion', width: 110, render: (v) => v || '-' },
    { title: '变更后版本', dataIndex: 'afterVersion', width: 110, render: (v) => v || '-' },
    {
      title: '切换状态',
      dataIndex: 'switchStatus',
      width: 110,
      render: (v?: string) =>
        v ? (
          <Tag color={SWITCH_STATUS_COLOR[v] || 'default'}>{ECO_SWITCH_STATUS_TEXT[v] || v}</Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) =>
        hasPermission('eco:update') && (
          <Popconfirm title="确认删除该变更明细？" onConfirm={() => handleRemoveItem(record)}>
            <Button type="link" size="small" danger>
              删除明细
            </Button>
          </Popconfirm>
        ),
    },
  ];

  const impactColumns: ColumnsType<EcoImpactAnalysisItem> = [
    {
      title: '影响类型',
      dataIndex: 'impactType',
      width: 110,
      render: (v?: string) => (v ? ECO_IMPACT_TYPE_TEXT[v] || v : '-'),
    },
    { title: '对象编码', dataIndex: 'objectCode', width: 150, render: (v) => v || '-' },
    { title: '对象名称', dataIndex: 'objectName', width: 150, render: (v) => v || '-' },
    { title: '当前值', dataIndex: 'currentValue', width: 130, render: (v) => v || '-' },
    { title: '影响说明', dataIndex: 'impactDesc', width: 200, render: (v) => v || '-' },
    {
      title: '处理状态',
      dataIndex: 'handleStatus',
      width: 110,
      render: (v?: string) =>
        v ? (
          <Tag color={IMPACT_HANDLE_COLOR[v] || 'default'}>
            {ECO_IMPACT_HANDLE_STATUS_TEXT[v] || v}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) =>
        hasPermission('eco:impact') && (
          <Space size="small">
            <Popconfirm title="标记为已处理？" onConfirm={() => handleImpactStatus(record, 'handled')}>
              <Button type="link" size="small">
                已处理
              </Button>
            </Popconfirm>
            <Popconfirm title="忽略该影响项？" onConfirm={() => handleImpactStatus(record, 'ignored')}>
              <Button type="link" size="small">
                忽略
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  const noticeColumns: ColumnsType<EcoNoticeItem> = [
    { title: '通知编号', dataIndex: 'noticeNo', width: 150, render: (v) => v || '-' },
    { title: '标题', dataIndex: 'title', width: 200, render: (v) => v || '-' },
    {
      title: '通知对象',
      dataIndex: 'targetType',
      width: 110,
      render: (v?: string) => (v ? ECO_NOTICE_TARGET_TEXT[v] || v : '-'),
    },
    { title: '对象编码', dataIndex: 'targetCode', width: 130, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={NOTICE_STATUS_COLOR[v] || 'default'}>{ECO_NOTICE_STATUS_TEXT[v] || v}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) =>
        hasPermission('eco:notice') && (
          <Space size="small">
            {record.status === 'draft' && (
              <Button type="link" size="small" loading={noticeActing} onClick={() => handleSendNotice(record)}>
                发送
              </Button>
            )}
            {record.status === 'sent' && (
              <Button
                type="link"
                size="small"
                loading={noticeActing}
                onClick={() => handleConfirmNotice(record)}
              >
                确认
              </Button>
            )}
          </Space>
        ),
    },
  ];

  const convertColumns: ColumnsType<EcrConvertItem> = [
    {
      title: '对象类型',
      dataIndex: 'objectType',
      width: 140,
      render: (v: string, _r, index) => (
        <Select
          value={v}
          style={{ width: '100%' }}
          options={ECO_OBJECT_TYPE_OPTIONS}
          onChange={(val) => updateConvertItem(index, 'objectType', val)}
        />
      ),
    },
    {
      title: '对象编码',
      dataIndex: 'objectCode',
      width: 160,
      render: (v: string, _r, index) => (
        <Input
          value={v}
          placeholder="必填"
          onChange={(e) => updateConvertItem(index, 'objectCode', e.target.value)}
        />
      ),
    },
    {
      title: '对象名称',
      dataIndex: 'objectName',
      width: 160,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateConvertItem(index, 'objectName', e.target.value)} />
      ),
    },
    {
      title: '变更动作',
      dataIndex: 'changeAction',
      width: 130,
      render: (v: string, _r, index) => (
        <Select
          value={v}
          style={{ width: '100%' }}
          options={ECO_CHANGE_ACTION_OPTIONS}
          onChange={(val) => updateConvertItem(index, 'changeAction', val)}
        />
      ),
    },
    {
      title: '变更前版本',
      dataIndex: 'beforeVersion',
      width: 130,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateConvertItem(index, 'beforeVersion', e.target.value)} />
      ),
    },
    {
      title: '变更后版本',
      dataIndex: 'afterVersion',
      width: 130,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateConvertItem(index, 'afterVersion', e.target.value)} />
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 150,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateConvertItem(index, 'remark', e.target.value)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 70,
      fixed: 'right',
      render: (_, __, index) => (
        <Button type="link" size="small" danger onClick={() => removeConvertItem(index)}>
          删除
        </Button>
      ),
    },
  ];

  const execColumns: ColumnsType<EcoChangeItemItem> = [
    {
      title: '对象类型',
      dataIndex: 'objectType',
      width: 120,
      render: (v?: string) => (v ? ECO_OBJECT_TYPE_TEXT[v] || v : '-'),
    },
    { title: '对象编码', dataIndex: 'objectCode', width: 150, render: (v) => v || '-' },
    { title: '对象名称', dataIndex: 'objectName', width: 160, render: (v) => v || '-' },
    {
      title: '变更动作',
      dataIndex: 'changeAction',
      width: 110,
      render: (v?: string) => (v ? ECO_CHANGE_ACTION_TEXT[v] || v : '-'),
    },
    { title: '变更前版本', dataIndex: 'beforeVersion', width: 110, render: (v) => v || '-' },
    { title: '变更后版本', dataIndex: 'afterVersion', width: 110, render: (v) => v || '-' },
    {
      title: '切换状态',
      dataIndex: 'switchStatus',
      width: 110,
      render: (v?: string) =>
        v ? (
          <Tag color={SWITCH_STATUS_COLOR[v] || 'default'}>{ECO_SWITCH_STATUS_TEXT[v] || v}</Tag>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        工程变更
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'ecr', label: '变更申请 ECR' },
          { key: 'eco', label: '变更执行 ECO' },
        ]}
      />

      {activeTab === 'ecr' && (
        <>
          <Card>
            <Form layout="inline" onFinish={onEcrSearch}>
              <Form.Item name="ecrNo" label="申请编号">
                <Input placeholder="申请编号" allowClear style={{ width: 160 }} />
              </Form.Item>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择" allowClear style={{ width: 130 }} options={ECR_STATUS_OPTIONS} />
              </Form.Item>
              <Form.Item name="sourceType" label="来源">
                <Select
                  placeholder="请选择"
                  allowClear
                  style={{ width: 130 }}
                  options={ECO_SOURCE_TYPE_OPTIONS}
                />
              </Form.Item>
              <Form.Item name="riskLevel" label="风险等级">
                <Select
                  placeholder="请选择"
                  allowClear
                  style={{ width: 110 }}
                  options={ECO_RISK_LEVEL_OPTIONS}
                />
              </Form.Item>
              <Form.Item name="urgency" label="紧急程度">
                <Select
                  placeholder="请选择"
                  allowClear
                  style={{ width: 110 }}
                  options={ECO_URGENCY_OPTIONS}
                />
              </Form.Item>
              <Form.Item>
                <Space wrap>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    查询
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={onEcrReset}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Card
            title={`变更申请（共 ${ecrTotal} 条）`}
            extra={
              hasPermission('eco:create') && (
                <Button type="primary" icon={<PlusOutlined />} onClick={openEcrCreate}>
                  新增变更申请
                </Button>
              )
            }
          >
            <Table<EcoChangeRequestItem>
              rowKey="id"
              loading={ecrLoading}
              columns={ecrColumns}
              dataSource={ecrData}
              scroll={{ x: 1600 }}
              pagination={{
                current: ecrPageNum,
                pageSize: ecrPageSize,
                total: ecrTotal,
                showSizeChanger: true,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (page, size) => {
                  setEcrPageNum(page);
                  setEcrPageSize(size);
                  void loadEcr(page, size);
                },
              }}
            />
          </Card>
        </>
      )}

      {activeTab === 'eco' && (
        <>
          <Card>
            <Form layout="inline" onFinish={onEcoSearch}>
              <Form.Item name="ecoNo" label="变更单编号">
                <Input placeholder="变更单编号" allowClear style={{ width: 160 }} />
              </Form.Item>
              <Form.Item name="ecrNo" label="来源申请">
                <Input placeholder="来源申请编号" allowClear style={{ width: 160 }} />
              </Form.Item>
              <Form.Item name="approvalStatus" label="审批状态">
                <Select
                  placeholder="请选择"
                  allowClear
                  style={{ width: 130 }}
                  options={ECO_APPROVAL_STATUS_OPTIONS}
                />
              </Form.Item>
              <Form.Item name="executionStatus" label="执行状态">
                <Select
                  placeholder="请选择"
                  allowClear
                  style={{ width: 130 }}
                  options={ECO_EXECUTION_STATUS_OPTIONS}
                />
              </Form.Item>
              <Form.Item>
                <Space wrap>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    查询
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={onEcoReset}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Card title={`变更单（共 ${ecoTotal} 条）`}>
            <Table<EcoChangeOrderItem>
              rowKey="id"
              loading={ecoLoading}
              columns={ecoColumns}
              dataSource={ecoData}
              scroll={{ x: 1500 }}
              pagination={{
                current: ecoPageNum,
                pageSize: ecoPageSize,
                total: ecoTotal,
                showSizeChanger: true,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (page, size) => {
                  setEcoPageNum(page);
                  setEcoPageSize(size);
                  void loadEco(page, size);
                },
              }}
            />
          </Card>
        </>
      )}

      {/* ECR 新增/编辑 */}
      <Modal
        title={ecrEditing ? '编辑变更申请' : '新增变更申请'}
        open={ecrModalOpen}
        onOk={handleEcrSubmit}
        confirmLoading={ecrSubmitting}
        onCancel={() => setEcrModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={ecrForm} layout="vertical" preserve={false}>
          <Form.Item name="title" label="变更标题" rules={[{ required: true, message: '请输入变更标题' }]}>
            <Input placeholder="请输入变更标题" />
          </Form.Item>
          <Form.Item name="sourceType" label="来源类型">
            <Select placeholder="请选择" allowClear options={ECO_SOURCE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="sourceRef" label="来源单据引用">
            <Input placeholder="请输入来源单据引用" />
          </Form.Item>
          <Form.Item name="reason" label="变更原因">
            <Input.TextArea rows={2} placeholder="请输入变更原因" />
          </Form.Item>
          <Form.Item name="riskLevel" label="风险等级">
            <Select placeholder="请选择" allowClear options={ECO_RISK_LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="urgency" label="紧急程度">
            <Select placeholder="请选择" allowClear options={ECO_URGENCY_OPTIONS} />
          </Form.Item>
          <Form.Item name="affectedProducts" label="受影响产品">
            <Input placeholder="多个以逗号分隔" />
          </Form.Item>
          <Form.Item name="affectedMaterials" label="受影响物料">
            <Input placeholder="多个以逗号分隔" />
          </Form.Item>
          <Form.Item name="affectedDocuments" label="受影响图文档">
            <Input placeholder="多个以逗号分隔" />
          </Form.Item>
          <Form.Item name="affectedProcesses" label="受影响工艺">
            <Input placeholder="多个以逗号分隔" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ECR 详情 */}
      <Drawer
        title={`变更申请详情 - ${ecrTarget?.ecrNo || ''}`}
        width={1000}
        open={ecrDrawerOpen}
        onClose={() => setEcrDrawerOpen(false)}
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="申请编号">{ecrTarget?.ecrNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="标题">{ecrTarget?.title || '-'}</Descriptions.Item>
            <Descriptions.Item label="来源类型">
              {ecrTarget?.sourceType ? ECO_SOURCE_TYPE_TEXT[ecrTarget.sourceType] || ecrTarget.sourceType : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="来源单据">{ecrTarget?.sourceRef || '-'}</Descriptions.Item>
            <Descriptions.Item label="风险等级">
              {ecrTarget?.riskLevel ? ECO_RISK_LEVEL_TEXT[ecrTarget.riskLevel] || ecrTarget.riskLevel : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="紧急程度">
              {ecrTarget?.urgency ? ECO_URGENCY_TEXT[ecrTarget.urgency] || ecrTarget.urgency : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="申请人">{ecrTarget?.applicantName || '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {ecrTarget?.status ? ECR_STATUS_TEXT[ecrTarget.status] || ecrTarget.status : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="评审人">{ecrTarget?.reviewerName || '-'}</Descriptions.Item>
            <Descriptions.Item label="评审时间">
              {ecrTarget?.reviewedAt ? dayjs(ecrTarget.reviewedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="变更原因" span={2}>
              {ecrTarget?.reason || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="评审意见" span={2}>
              {ecrTarget?.reviewComment || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="受影响产品" span={2}>
              {ecrTarget?.affectedProducts || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="受影响物料" span={2}>
              {ecrTarget?.affectedMaterials || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="受影响图文档" span={2}>
              {ecrTarget?.affectedDocuments || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="受影响工艺" span={2}>
              {ecrTarget?.affectedProcesses || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {ecrTarget?.remark || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Text strong>转出的变更单</Text>
          <Table<EcoChangeOrderItem>
            rowKey="id"
            loading={ecrDetailLoading}
            columns={orderColumns}
            dataSource={ecrOrders}
            size="small"
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Space>
      </Drawer>

      {/* ECR 评审 */}
      <Modal
        title={`评审变更申请 - ${reviewTarget?.ecrNo || ''}`}
        open={reviewOpen}
        onOk={handleReview}
        confirmLoading={reviewSaving}
        onCancel={() => setReviewOpen(false)}
        destroyOnClose
      >
        <Form form={reviewForm} layout="vertical" preserve={false}>
          <Form.Item name="decision" label="评审结论" rules={[{ required: true, message: '请选择评审结论' }]}>
            <Select options={DECISION_OPTIONS} />
          </Form.Item>
          <Form.Item name="comment" label="评审意见">
            <Input.TextArea rows={3} placeholder="请输入评审意见" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ECR 转 ECO */}
      <Modal
        title={`转为变更单 - ${convertTarget?.ecrNo || ''}`}
        open={convertOpen}
        onOk={handleConvert}
        confirmLoading={convertSaving}
        onCancel={() => setConvertOpen(false)}
        destroyOnClose
        width={1000}
        okText="确认转单"
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Form form={convertForm} layout="inline" preserve={false}>
            <Form.Item name="changeType" label="变更类型">
              <Select style={{ width: 140 }} options={ECO_CHANGE_ACTION_OPTIONS} />
            </Form.Item>
            <Form.Item name="effectiveDate" label="生效日期">
              <DatePicker />
            </Form.Item>
            <Form.Item name="effectiveBatch" label="生效批次">
              <Input placeholder="生效批次" style={{ width: 160 }} />
            </Form.Item>
            <Form.Item
              name="planDesc"
              label="变更方案说明"
              style={{ width: '100%', marginBottom: 8 }}
            >
              <Input.TextArea rows={2} placeholder="请输入变更方案说明" />
            </Form.Item>
          </Form>
          <Space>
            <Button icon={<PlusOutlined />} onClick={addConvertItem}>
              添加明细
            </Button>
            <Text type="secondary">对象编码为必填项，未填写明细将无法提交。</Text>
          </Space>
          <Table<EcrConvertItem>
            rowKey={(_, index) => String(index)}
            columns={convertColumns}
            dataSource={convertItems}
            size="small"
            pagination={false}
            scroll={{ x: 1100 }}
          />
        </Space>
      </Modal>

      {/* ECO 详情 */}
      <Drawer
        title={`变更单详情 - ${ecoDetailOrder?.ecoNo || ''}`}
        width={1000}
        open={ecoDrawerOpen}
        onClose={() => setEcoDrawerOpen(false)}
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="变更单编号">{ecoDetailOrder?.ecoNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="来源申请">{ecoDetailOrder?.ecrNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="标题">{ecoDetailOrder?.title || '-'}</Descriptions.Item>
            <Descriptions.Item label="变更类型">
              {ecoDetailOrder?.changeType
                ? ECO_CHANGE_ACTION_TEXT[ecoDetailOrder.changeType] || ecoDetailOrder.changeType
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="审批状态">
              {ecoDetailOrder?.approvalStatus
                ? ECO_APPROVAL_STATUS_TEXT[ecoDetailOrder.approvalStatus] || ecoDetailOrder.approvalStatus
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="执行状态">
              {ecoDetailOrder?.executionStatus
                ? ECO_EXECUTION_STATUS_TEXT[ecoDetailOrder.executionStatus] || ecoDetailOrder.executionStatus
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="审批人">{ecoDetailOrder?.approverName || '-'}</Descriptions.Item>
            <Descriptions.Item label="审批时间">
              {ecoDetailOrder?.approvedAt
                ? dayjs(ecoDetailOrder.approvedAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="生效日期">
              {ecoDetailOrder?.effectiveDate ? dayjs(ecoDetailOrder.effectiveDate).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="生效批次">{ecoDetailOrder?.effectiveBatch || '-'}</Descriptions.Item>
            <Descriptions.Item label="执行时间">
              {ecoDetailOrder?.executedAt
                ? dayjs(ecoDetailOrder.executedAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="审批意见">{ecoDetailOrder?.approvalComment || '-'}</Descriptions.Item>
            <Descriptions.Item label="变更方案" span={2}>
              {ecoDetailOrder?.planDesc || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {ecoDetailOrder?.remark || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Tabs
            items={[
              {
                key: 'items',
                label: `变更明细（${ecoItems.length}）`,
                children: (
                  <Table<EcoChangeItemItem>
                    rowKey="id"
                    loading={ecoDrawerLoading}
                    columns={ecoItemColumns}
                    dataSource={ecoItems}
                    size="small"
                    pagination={false}
                    scroll={{ x: 1100 }}
                  />
                ),
              },
              {
                key: 'impacts',
                label: `影响分析（${ecoImpacts.length}）`,
                children: (
                  <Table<EcoImpactAnalysisItem>
                    rowKey="id"
                    loading={ecoDrawerLoading}
                    columns={impactColumns}
                    dataSource={ecoImpacts}
                    size="small"
                    pagination={false}
                    scroll={{ x: 1000 }}
                  />
                ),
              },
              {
                key: 'notices',
                label: `变更通知（${ecoNotices.length}）`,
                children: (
                  <Table<EcoNoticeItem>
                    rowKey="id"
                    loading={ecoDrawerLoading}
                    columns={noticeColumns}
                    dataSource={ecoNotices}
                    size="small"
                    pagination={false}
                    scroll={{ x: 900 }}
                  />
                ),
              },
            ]}
          />
        </Space>
      </Drawer>

      {/* ECO 审批 */}
      <Modal
        title={`审批变更单 - ${approveTarget?.ecoNo || ''}`}
        open={approveOpen}
        onOk={handleApprove}
        confirmLoading={approveSaving}
        onCancel={() => setApproveOpen(false)}
        destroyOnClose
      >
        <Form form={approveForm} layout="vertical" preserve={false}>
          <Form.Item name="decision" label="审批结论" rules={[{ required: true, message: '请选择审批结论' }]}>
            <Select options={DECISION_OPTIONS} />
          </Form.Item>
          <Form.Item name="comment" label="审批意见">
            <Input.TextArea rows={3} placeholder="请输入审批意见" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 影响分析 */}
      <Modal
        title={`影响分析 - ${impactTarget?.ecoNo || ''}`}
        open={impactOpen}
        footer={null}
        onCancel={() => setImpactOpen(false)}
        destroyOnClose
        width={1000}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Select
              mode="multiple"
              allowClear
              placeholder="影响类型（留空按系统配置）"
              style={{ minWidth: 320 }}
              value={impactTypes}
              onChange={setImpactTypes}
              options={ECO_IMPACT_TYPE_OPTIONS}
            />
            <Button type="primary" loading={analyzing} onClick={handleAnalyze}>
              开始分析
            </Button>
          </Space>
          <Table<EcoImpactAnalysisItem>
            rowKey="id"
            loading={impactLoading}
            columns={impactColumns}
            dataSource={impactList}
            size="small"
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Space>
      </Modal>

      {/* 变更执行 */}
      <Modal
        title={`变更执行 - ${execTarget?.ecoNo || ''}`}
        open={execOpen}
        onOk={handleExecute}
        confirmLoading={executing}
        onCancel={() => setExecOpen(false)}
        destroyOnClose
        width={1000}
        okText="执行切换"
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Form form={executeForm} layout="inline" preserve={false}>
            <Form.Item name="effectiveDate" label="生效日期">
              <DatePicker />
            </Form.Item>
            <Form.Item name="effectiveBatch" label="生效批次">
              <Input placeholder="生效批次" style={{ width: 160 }} />
            </Form.Item>
          </Form>
          <Text type="secondary">勾选需要本次执行切换的变更明细，仅勾选项会被切换。</Text>
          <Table<EcoChangeItemItem>
            rowKey="id"
            loading={execLoading}
            columns={execColumns}
            dataSource={execItems}
            size="small"
            pagination={false}
            scroll={{ x: 1000 }}
            rowSelection={{
              selectedRowKeys: execSelected,
              onChange: (keys) => setExecSelected(keys),
            }}
          />
          {execResult && (
            <Alert
              type={execResult.pending ? 'warning' : 'success'}
              showIcon
              message={
                execResult.message ||
                `执行结果：已切换 ${execResult.switched ?? 0} 项，待切换 ${execResult.pending ?? 0} 项`
              }
            />
          )}
        </Space>
      </Modal>

      {/* 变更通知 */}
      <Modal
        title={`变更通知 - ${noticeTarget?.ecoNo || ''}`}
        open={noticeOpen}
        footer={null}
        onCancel={() => setNoticeOpen(false)}
        destroyOnClose
        width={1000}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Form form={noticeForm} layout="inline" preserve={false}>
            <Form.Item name="title" label="通知标题" rules={[{ required: true, message: '请输入通知标题' }]}>
              <Input placeholder="通知标题" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
              name="targetType"
              label="通知对象"
              rules={[{ required: true, message: '请选择通知对象' }]}
            >
              <Select style={{ width: 120 }} options={ECO_NOTICE_TARGET_OPTIONS} />
            </Form.Item>
            <Form.Item name="targetCode" label="对象编码">
              <Input placeholder="对象编码" style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="targetName" label="对象名称">
              <Input placeholder="对象名称" style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="content" label="通知内容">
              <Input placeholder="通知内容" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" icon={<PlusOutlined />} loading={noticeSaving} onClick={handleCreateNotice}>
                创建通知
              </Button>
            </Form.Item>
          </Form>
          <Table<EcoNoticeItem>
            rowKey="id"
            loading={noticeLoading}
            columns={noticeColumns}
            dataSource={noticeList}
            size="small"
            pagination={false}
            scroll={{ x: 900 }}
          />
        </Space>
      </Modal>
    </Space>
  );
}
