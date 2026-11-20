import { useState } from 'react';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tabs,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { oaAssetKnowledgeService, oaAssetRepairService } from '@/services/oaService';
import UserSelect from '@/pages/oa/UserSelect';
import BizFlowTab, {
  DATE_FORMAT,
  bizFlowStatusTag,
  bizStatusTag,
  enumLabel,
  formatDate,
  formatDateTime,
  plain,
  yesNoLabel,
  type BizSubmitValue,
} from '@/pages/oa/biz/BizFlowTab';
import {
  OA_ASSET_CATEGORY_LABEL,
  OA_ASSET_CATEGORY_OPTIONS,
  OA_REPAIR_PRIORITY_LABEL,
  OA_REPAIR_PRIORITY_OPTIONS,
  OA_REPAIR_STATUS_COLOR,
  OA_REPAIR_STATUS_LABEL,
  type OaAssetKnowledgeSaveParams,
  type OaAssetRepairAcceptParams,
  type OaAssetRepairDispatchParams,
  type OaAssetRepairHandleParams,
  type OaAssetRepairSaveParams,
  type OaBizFlowItem,
} from '@/types/oa';

const { Text } = Typography;
const { Title } = Typography;

const ASSET_LIST = 'oa:asset:list';
const ASSET_APPLY = 'oa:asset:apply';
const ASSET_MANAGE = 'oa:asset:manage';

const repairStatusTag = bizStatusTag(OA_REPAIR_STATUS_LABEL, OA_REPAIR_STATUS_COLOR);

const ACCEPT_RESULT_OPTIONS = [
  { label: '合格', value: 'PASS' },
  { label: '不合格', value: 'FAIL' },
];

/* ---------------- 1. 设备维修工单（OA-DEV-078） ---------------- */

interface RepairFormValues extends BizSubmitValue {
  assetCategory?: string;
  assetCode?: string;
  assetName?: string;
  assetModel?: string;
  location?: string;
  faultType?: string;
  faultDesc?: string;
  priority?: string;
  requireFinish?: Dayjs;
  remark?: string;
}

interface PendingAction {
  record: OaBizFlowItem;
  reload: () => void;
}

function RepairOrderTab() {
  const [dispatchForm] = Form.useForm<OaAssetRepairDispatchParams>();
  const [handleForm] = Form.useForm<OaAssetRepairHandleParams>();
  const [acceptForm] = Form.useForm<OaAssetRepairAcceptParams>();
  const [dispatching, setDispatching] = useState<PendingAction | null>(null);
  const [handling, setHandling] = useState<PendingAction | null>(null);
  const [accepting, setAccepting] = useState<PendingAction | null>(null);
  const [saving, setSaving] = useState(false);

  const handleClose = async (id: number, reload: () => void) => {
    await oaAssetRepairService.close(id);
    message.success('已关闭');
    reload();
  };

  const submitDispatch = async () => {
    if (!dispatching) return;
    const values = await dispatchForm.validateFields();
    setSaving(true);
    try {
      await oaAssetRepairService.dispatch(dispatching.record.id, values);
      message.success('已派工');
      setDispatching(null);
      dispatching.reload();
    } finally {
      setSaving(false);
    }
  };

  const submitHandle = async () => {
    if (!handling) return;
    const values = await handleForm.validateFields();
    setSaving(true);
    try {
      await oaAssetRepairService.handle(handling.record.id, values);
      message.success('已登记维修处理结果');
      setHandling(null);
      handling.reload();
    } finally {
      setSaving(false);
    }
  };

  const submitAccept = async () => {
    if (!accepting) return;
    const values = await acceptForm.validateFields();
    setSaving(true);
    try {
      await oaAssetRepairService.accept(accepting.record.id, values);
      message.success('已完成验收');
      setAccepting(null);
      accepting.reload();
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '维修单号', dataIndex: 'repairNo', width: 150, fixed: 'left', render: plain },
    { title: '资产类别', dataIndex: 'assetCategory', width: 130, render: (v) => enumLabel(OA_ASSET_CATEGORY_LABEL, v) },
    { title: '资产编码', dataIndex: 'assetCode', width: 130, render: plain },
    { title: '资产名称', dataIndex: 'assetName', width: 150, render: plain },
    { title: '故障描述', dataIndex: 'faultDesc', width: 180, ellipsis: true, render: plain },
    { title: '优先级', dataIndex: 'priority', width: 90, render: (v) => enumLabel(OA_REPAIR_PRIORITY_LABEL, v) },
    { title: '维修状态', dataIndex: 'repairStatus', width: 110, render: repairStatusTag },
    { title: '维修人', dataIndex: 'assigneeName', width: 110, render: plain },
    { title: '要求完成', dataIndex: 'requireFinish', width: 120, render: formatDate },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <>
      <BizFlowTab<OaAssetRepairSaveParams, RepairFormValues>
        title="设备维修工单"
        service={oaAssetRepairService}
        columns={columns}
        listPerm={ASSET_LIST}
        applyPerm={ASSET_APPLY}
        managePerm={ASSET_MANAGE}
        statusLabel="流程状态"
        initialValues={{ priority: 'NORMAL' }}
        extraActions={(record, reload) => (
          <>
            {(record.repairStatus === 'DRAFT' || record.repairStatus === 'PENDING_DISPATCH') && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  dispatchForm.resetFields();
                  setDispatching({ record, reload });
                }}
              >
                派工
              </Button>
            )}
            {record.repairStatus === 'DISPATCHED' && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  handleForm.resetFields();
                  setHandling({ record, reload });
                }}
              >
                处理
              </Button>
            )}
            {record.repairStatus === 'HANDLED' && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  acceptForm.resetFields();
                  setAccepting({ record, reload });
                }}
              >
                验收
              </Button>
            )}
            {(record.repairStatus === 'ACCEPTED' || record.repairStatus === 'HANDLED') && (
              <Popconfirm title="确认关闭该维修工单？" onConfirm={() => void handleClose(record.id, reload)}>
                <Button type="link" size="small">
                  关闭
                </Button>
              </Popconfirm>
            )}
          </>
        )}
        detailFields={[
          { label: '维修单号', key: 'repairNo' },
          { label: '资产类别', key: 'assetCategory', render: (v) => enumLabel(OA_ASSET_CATEGORY_LABEL, v) },
          { label: '资产编码', key: 'assetCode' },
          { label: '资产名称', key: 'assetName' },
          { label: '规格型号', key: 'assetModel' },
          { label: '存放位置', key: 'location' },
          { label: '故障类型', key: 'faultType' },
          { label: '优先级', key: 'priority', render: (v) => enumLabel(OA_REPAIR_PRIORITY_LABEL, v) },
          { label: '故障描述', key: 'faultDesc' },
          { label: '报修时间', key: 'reportTime', render: (v) => formatDateTime(v) },
          { label: '要求完成', key: 'requireFinish', render: (v) => formatDate(v) },
          { label: '维修状态', key: 'repairStatus', render: (v) => repairStatusTag(v) },
          { label: '维修人', key: 'assigneeName' },
          { label: '派工时间', key: 'dispatchTime', render: (v) => formatDateTime(v) },
          { label: '派工说明', key: 'dispatchRemark' },
          { label: '故障原因', key: 'faultCause' },
          { label: '维修措施', key: 'repairMeasure' },
          { label: '更换备件', key: 'spareParts' },
          { label: '工时', key: 'workHours' },
          { label: '维修费用', key: 'repairCost' },
          { label: '停机时长(分)', key: 'downtimeMinutes' },
          { label: '维修完成时间', key: 'repairFinishTime', render: (v) => formatDateTime(v) },
          { label: '重复故障', key: 'repeatFlag', render: (v) => yesNoLabel(v) },
          { label: '验收结果', key: 'acceptResult', render: (v) => enumLabel({ PASS: '合格', FAIL: '不合格' }, v) },
          { label: '验收意见', key: 'acceptOpinion' },
          { label: '验收人', key: 'acceptUserName' },
          { label: '验收时间', key: 'acceptTime', render: (v) => formatDateTime(v) },
          { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
          { label: '备注', key: 'remark' },
        ]}
        renderFields={() => (
          <>
            <Form.Item
              name="assetCategory"
              label="资产类别"
              rules={[{ required: true, message: '请选择资产类别' }]}
            >
              <Select placeholder="请选择" options={[...OA_ASSET_CATEGORY_OPTIONS]} />
            </Form.Item>
            <Form.Item name="assetCode" label="资产编码" rules={[{ required: true, message: '请输入资产编码' }]}>
              <Input placeholder="请输入资产编码" />
            </Form.Item>
            <Form.Item name="assetName" label="资产名称">
              <Input placeholder="请输入资产名称" />
            </Form.Item>
            <Form.Item name="assetModel" label="规格型号">
              <Input placeholder="请输入规格型号" />
            </Form.Item>
            <Form.Item name="location" label="存放位置">
              <Input placeholder="请输入存放位置" />
            </Form.Item>
            <Form.Item name="faultType" label="故障类型">
              <Input placeholder="请输入故障类型" />
            </Form.Item>
            <Form.Item name="faultDesc" label="故障描述" rules={[{ required: true, message: '请输入故障描述' }]}>
              <Input.TextArea rows={3} placeholder="请输入故障描述" />
            </Form.Item>
            <Form.Item name="priority" label="优先级">
              <Select placeholder="请选择" options={[...OA_REPAIR_PRIORITY_OPTIONS]} />
            </Form.Item>
            <Form.Item name="requireFinish" label="要求完成日期">
              <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
            </Form.Item>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={2} placeholder="请输入备注" />
            </Form.Item>
          </>
        )}
        buildEditValues={(r) => ({
          assetCategory: r.assetCategory,
          assetCode: r.assetCode,
          assetName: r.assetName,
          assetModel: r.assetModel,
          location: r.location,
          faultType: r.faultType,
          faultDesc: r.faultDesc,
          priority: r.priority,
          requireFinish: r.requireFinish ? dayjs(r.requireFinish) : undefined,
          remark: r.remark,
        })}
        buildPayload={(v) => ({
          assetCategory: v.assetCategory,
          assetCode: v.assetCode,
          assetName: v.assetName,
          assetModel: v.assetModel,
          location: v.location,
          faultType: v.faultType,
          faultDesc: v.faultDesc,
          priority: v.priority,
          requireFinish: v.requireFinish ? v.requireFinish.format(DATE_FORMAT) : undefined,
          remark: v.remark,
          submit: v.submit,
        })}
      />

      <Modal
        title="维修派工"
        open={!!dispatching}
        onOk={() => void submitDispatch()}
        confirmLoading={saving}
        onCancel={() => setDispatching(null)}
        destroyOnClose
      >
        <Form form={dispatchForm} layout="vertical">
          <Form.Item
            name="assigneeUserId"
            label="维修人"
            rules={[{ required: true, message: '请选择维修人' }]}
          >
            <UserSelect style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="dispatchRemark" label="派工说明">
            <Input.TextArea rows={2} placeholder="请输入派工说明" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="登记维修处理结果"
        open={!!handling}
        onOk={() => void submitHandle()}
        confirmLoading={saving}
        onCancel={() => setHandling(null)}
        destroyOnClose
      >
        <Form form={handleForm} layout="vertical">
          <Form.Item name="faultCause" label="故障原因">
            <Input.TextArea rows={2} placeholder="请输入故障原因" />
          </Form.Item>
          <Form.Item name="repairMeasure" label="维修措施" rules={[{ required: true, message: '请输入维修措施' }]}>
            <Input.TextArea rows={3} placeholder="请输入维修措施" />
          </Form.Item>
          <Form.Item name="spareParts" label="更换备件">
            <Input placeholder="请输入更换备件" />
          </Form.Item>
          <Form.Item name="workHours" label="工时">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入工时" />
          </Form.Item>
          <Form.Item name="repairCost" label="维修费用">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入维修费用" />
          </Form.Item>
          <Form.Item name="downtimeMinutes" label="停机时长(分钟)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入停机时长" />
          </Form.Item>
          <Form.Item name="repeatFlag" label="是否重复故障" valuePropName="checked">
            <Checkbox>重复故障</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="维修验收"
        open={!!accepting}
        onOk={() => void submitAccept()}
        confirmLoading={saving}
        onCancel={() => setAccepting(null)}
        destroyOnClose
      >
        <Form form={acceptForm} layout="vertical">
          <Form.Item name="acceptResult" label="验收结果" rules={[{ required: true, message: '请选择验收结果' }]}>
            <Select placeholder="请选择" options={ACCEPT_RESULT_OPTIONS} />
          </Form.Item>
          <Form.Item name="acceptOpinion" label="验收意见">
            <Input.TextArea rows={3} placeholder="请输入验收意见" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

/* ---------------- 2. 维修知识库（OA-DEV-079，无流程） ---------------- */

function KnowledgeTab() {
  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '知识编号', dataIndex: 'knowledgeNo', width: 150, fixed: 'left', render: plain },
    { title: '资产类别', dataIndex: 'assetCategory', width: 130, render: (v) => enumLabel(OA_ASSET_CATEGORY_LABEL, v) },
    { title: '故障类型', dataIndex: 'faultType', width: 120, render: plain },
    { title: '故障现象', dataIndex: 'faultSymptom', width: 200, ellipsis: true, render: plain },
    { title: '解决方法', dataIndex: 'solution', width: 220, ellipsis: true, render: plain },
    { title: '参考费用', dataIndex: 'referenceCost', width: 110, render: plain },
    { title: '来源维修单', dataIndex: 'sourceRepairNo', width: 150, render: plain },
    { title: '命中次数', dataIndex: 'hitCount', width: 100, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaAssetKnowledgeSaveParams, BizSubmitValue & OaAssetKnowledgeSaveParams>
      title="维修知识库"
      service={oaAssetKnowledgeService}
      columns={columns}
      listPerm={ASSET_LIST}
      applyPerm={ASSET_MANAGE}
      noFlow
      statusOptions={[]}
      detailFields={[
        { label: '知识编号', key: 'knowledgeNo' },
        { label: '资产类别', key: 'assetCategory', render: (v) => enumLabel(OA_ASSET_CATEGORY_LABEL, v) },
        { label: '故障类型', key: 'faultType' },
        { label: '故障现象', key: 'faultSymptom' },
        { label: '故障原因', key: 'faultCause' },
        { label: '解决方法', key: 'solution' },
        { label: '更换备件', key: 'spareParts' },
        { label: '参考费用', key: 'referenceCost' },
        { label: '来源维修单', key: 'sourceRepairNo' },
        { label: '检索关键字', key: 'keyword' },
        { label: '命中次数', key: 'hitCount' },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={() => (
        <>
          <Text type="secondary">维修知识库沉淀历史故障与解决措施，供维修派工与处理时检索参考。</Text>
          <Form.Item name="assetCategory" label="资产类别" style={{ marginTop: 12 }}>
            <Select placeholder="请选择" options={[...OA_ASSET_CATEGORY_OPTIONS]} allowClear />
          </Form.Item>
          <Form.Item name="faultType" label="故障类型">
            <Input placeholder="请输入故障类型" />
          </Form.Item>
          <Form.Item name="faultSymptom" label="故障现象">
            <Input.TextArea rows={2} placeholder="请输入故障现象" />
          </Form.Item>
          <Form.Item name="faultCause" label="故障原因">
            <Input.TextArea rows={2} placeholder="请输入故障原因" />
          </Form.Item>
          <Form.Item name="solution" label="解决方法" rules={[{ required: true, message: '请输入解决方法' }]}>
            <Input.TextArea rows={3} placeholder="请输入解决方法" />
          </Form.Item>
          <Form.Item name="spareParts" label="更换备件">
            <Input placeholder="请输入更换备件" />
          </Form.Item>
          <Form.Item name="referenceCost" label="参考费用">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入参考费用" />
          </Form.Item>
          <Form.Item name="sourceRepairNo" label="来源维修单号">
            <Input placeholder="请输入来源维修单号" />
          </Form.Item>
          <Form.Item name="keyword" label="检索关键字">
            <Input placeholder="多个关键字以空格分隔" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        assetCategory: r.assetCategory,
        faultType: r.faultType,
        faultSymptom: r.faultSymptom,
        faultCause: r.faultCause,
        solution: r.solution,
        spareParts: r.spareParts,
        referenceCost: r.referenceCost,
        sourceRepairNo: r.sourceRepairNo,
        keyword: r.keyword,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        assetCategory: v.assetCategory,
        faultType: v.faultType,
        faultSymptom: v.faultSymptom,
        faultCause: v.faultCause,
        solution: v.solution,
        spareParts: v.spareParts,
        referenceCost: v.referenceCost,
        sourceRepairNo: v.sourceRepairNo,
        keyword: v.keyword,
        remark: v.remark,
      })}
    />
  );
}

export default function OaAssetRepairPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        资产维修
      </Title>

      <Tabs
        items={[
          { key: 'repair', label: '设备维修工单', children: <RepairOrderTab /> },
          { key: 'knowledge', label: '维修知识库', children: <KnowledgeTab /> },
        ]}
      />
    </Space>
  );
}
