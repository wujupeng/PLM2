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
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { oaContractService } from '@/services/oaService';
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
  OA_CONTRACT_STATUS_COLOR,
  OA_CONTRACT_STATUS_LABEL,
  OA_CONTRACT_TYPE_LABEL,
  OA_CONTRACT_TYPE_OPTIONS,
  type OaBizFlowItem,
  type OaContractSaveParams,
  type OaContractVersionSaveParams,
} from '@/types/oa';

const { Text } = Typography;
const { Title } = Typography;

const CONTRACT_LIST = 'oa:contract:list';
const CONTRACT_APPLY = 'oa:contract:apply';
const CONTRACT_MANAGE = 'oa:contract:manage';

const contractStatusTag = bizStatusTag(OA_CONTRACT_STATUS_LABEL, OA_CONTRACT_STATUS_COLOR);

interface ContractFormValues extends BizSubmitValue {
  contractName?: string;
  contractType?: string;
  customerCode?: string;
  supplierCode?: string;
  partyA?: string;
  partyB?: string;
  amount?: number;
  currency?: string;
  signDate?: Dayjs;
  effectiveDate?: Dayjs;
  expireDate?: Dayjs;
  legalReviewFlag?: boolean;
  remark?: string;
}

interface VersionFormValues {
  versionDesc?: string;
  changeSummary?: string;
  fileName?: string;
}

interface PendingAction {
  record: OaBizFlowItem;
  reload: () => void;
}

function ContractTab() {
  const [versionForm] = Form.useForm<VersionFormValues>();
  const [terminateForm] = Form.useForm<{ reason?: string }>();
  const [versionOpen, setVersionOpen] = useState<PendingAction | null>(null);
  const [terminateOpen, setTerminateOpen] = useState<PendingAction | null>(null);
  const [saving, setSaving] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertList, setAlertList] = useState<OaBizFlowItem[]>([]);

  const openAlert = async () => {
    setAlertOpen(true);
    setAlertLoading(true);
    try {
      const res = await oaContractService.expireAlert();
      setAlertList(res || []);
    } finally {
      setAlertLoading(false);
    }
  };

  const handleArchive = async (id: number, reload: () => void) => {
    await oaContractService.archive(id);
    message.success('已归档');
    reload();
  };

  const submitVersion = async () => {
    if (!versionOpen) return;
    const values = await versionForm.validateFields();
    setSaving(true);
    try {
      await oaContractService.addVersion(versionOpen.record.id, values as OaContractVersionSaveParams);
      message.success('已新增版本');
      setVersionOpen(null);
      versionOpen.reload();
    } finally {
      setSaving(false);
    }
  };

  const submitTerminate = async () => {
    if (!terminateOpen) return;
    const values = await terminateForm.validateFields();
    setSaving(true);
    try {
      await oaContractService.terminate(terminateOpen.record.id, values.reason);
      message.success('已终止');
      setTerminateOpen(null);
      terminateOpen.reload();
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '合同编号', dataIndex: 'contractNo', width: 150, fixed: 'left', render: plain },
    { title: '合同名称', dataIndex: 'contractName', width: 200, render: plain },
    { title: '合同类型', dataIndex: 'contractType', width: 110, render: (v) => enumLabel(OA_CONTRACT_TYPE_LABEL, v) },
    { title: '甲方', dataIndex: 'partyA', width: 150, render: plain },
    { title: '乙方', dataIndex: 'partyB', width: 150, render: plain },
    { title: '签订日期', dataIndex: 'signDate', width: 120, render: formatDate },
    { title: '到期日期', dataIndex: 'expireDate', width: 120, render: formatDate },
    { title: '状态', dataIndex: 'contractStatus', width: 100, render: contractStatusTag },
    { title: '当前版本', dataIndex: 'currentVersion', width: 90, render: plain },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: bizFlowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Button onClick={() => void openAlert()}>到期提醒</Button>
      </Space>

      <BizFlowTab<OaContractSaveParams, ContractFormValues>
        title="合同管理"
        service={oaContractService}
        columns={columns}
        listPerm={CONTRACT_LIST}
        applyPerm={CONTRACT_APPLY}
        managePerm={CONTRACT_MANAGE}
        initialValues={{ contractType: 'SALES', currency: 'CNY', legalReviewFlag: false }}
        extraActions={(record, reload) => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                versionForm.resetFields();
                setVersionOpen({ record, reload });
              }}
            >
              新增版本
            </Button>
            {(record.contractStatus === 'EFFECTIVE' || record.contractStatus === 'EXPIRED') && (
              <Popconfirm title="确认归档该合同？" onConfirm={() => void handleArchive(record.id, reload)}>
                <Button type="link" size="small">
                  归档
                </Button>
              </Popconfirm>
            )}
            {record.contractStatus === 'EFFECTIVE' && (
              <Button
                type="link"
                size="small"
                danger
                onClick={() => {
                  terminateForm.resetFields();
                  setTerminateOpen({ record, reload });
                }}
              >
                终止
              </Button>
            )}
          </>
        )}
        detailFields={[
          { label: '合同编号', key: 'contractNo' },
          { label: '合同名称', key: 'contractName' },
          { label: '合同类型', key: 'contractType', render: (v) => enumLabel(OA_CONTRACT_TYPE_LABEL, v) },
          { label: '甲方', key: 'partyA' },
          { label: '乙方', key: 'partyB' },
          { label: '客户编码', key: 'customerCode' },
          { label: '供应商编码', key: 'supplierCode' },
          { label: '金额', key: 'amount' },
          { label: '币种', key: 'currency' },
          { label: '签订日期', key: 'signDate', render: (v) => formatDate(v) },
          { label: '生效日期', key: 'effectiveDate', render: (v) => formatDate(v) },
          { label: '到期日期', key: 'expireDate', render: (v) => formatDate(v) },
          { label: '法务评审', key: 'legalReviewFlag', render: (v) => yesNoLabel(v) },
          { label: '评审意见', key: 'reviewOpinion' },
          { label: '当前版本', key: 'currentVersion' },
          { label: '状态', key: 'contractStatus', render: (v) => contractStatusTag(v) },
          { label: '归档时间', key: 'archiveTime', render: (v) => formatDateTime(v) },
          { label: '流程状态', key: 'flowStatus', render: (v) => bizFlowStatusTag(v) },
          { label: '备注', key: 'remark' },
        ]}
        renderFields={() => (
          <>
            <Text type="secondary">合同评审通过后进入生效状态，支持版本管理与到期提醒。</Text>
            <Form.Item
              name="contractName"
              label="合同名称"
              rules={[{ required: true, message: '请输入合同名称' }]}
              style={{ marginTop: 12 }}
            >
              <Input placeholder="请输入合同名称" />
            </Form.Item>
            <Form.Item name="contractType" label="合同类型">
              <Select placeholder="请选择" options={[...OA_CONTRACT_TYPE_OPTIONS]} />
            </Form.Item>
            <Form.Item name="partyA" label="甲方">
              <Input placeholder="请输入甲方" />
            </Form.Item>
            <Form.Item name="partyB" label="乙方">
              <Input placeholder="请输入乙方" />
            </Form.Item>
            <Form.Item name="customerCode" label="客户编码">
              <Input placeholder="请输入客户编码" />
            </Form.Item>
            <Form.Item name="supplierCode" label="供应商编码">
              <Input placeholder="请输入供应商编码" />
            </Form.Item>
            <Form.Item name="amount" label="金额">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入金额" />
            </Form.Item>
            <Form.Item name="currency" label="币种">
              <Input placeholder="如 CNY" />
            </Form.Item>
            <Form.Item name="signDate" label="签订日期">
              <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
            </Form.Item>
            <Form.Item name="effectiveDate" label="生效日期">
              <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
            </Form.Item>
            <Form.Item name="expireDate" label="到期日期">
              <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
            </Form.Item>
            <Form.Item name="legalReviewFlag" label="需要法务评审" valuePropName="checked">
              <Checkbox>需要法务评审</Checkbox>
            </Form.Item>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={2} placeholder="请输入备注" />
            </Form.Item>
          </>
        )}
        buildEditValues={(r) => ({
          contractName: r.contractName,
          contractType: r.contractType,
          customerCode: r.customerCode,
          supplierCode: r.supplierCode,
          partyA: r.partyA,
          partyB: r.partyB,
          amount: r.amount,
          currency: r.currency,
          signDate: r.signDate ? dayjs(r.signDate) : undefined,
          effectiveDate: r.effectiveDate ? dayjs(r.effectiveDate) : undefined,
          expireDate: r.expireDate ? dayjs(r.expireDate) : undefined,
          legalReviewFlag: r.legalReviewFlag === 1,
          remark: r.remark,
        })}
        buildPayload={(v) => ({
          contractName: v.contractName,
          contractType: v.contractType,
          customerCode: v.customerCode,
          supplierCode: v.supplierCode,
          partyA: v.partyA,
          partyB: v.partyB,
          amount: v.amount,
          currency: v.currency,
          signDate: v.signDate ? v.signDate.format(DATE_FORMAT) : undefined,
          effectiveDate: v.effectiveDate ? v.effectiveDate.format(DATE_FORMAT) : undefined,
          expireDate: v.expireDate ? v.expireDate.format(DATE_FORMAT) : undefined,
          legalReviewFlag: v.legalReviewFlag,
          remark: v.remark,
          submit: v.submit,
        })}
      />

      <Modal
        title="新增合同版本"
        open={!!versionOpen}
        onOk={() => void submitVersion()}
        confirmLoading={saving}
        onCancel={() => setVersionOpen(null)}
        destroyOnClose
      >
        <Form form={versionForm} layout="vertical">
          <Form.Item name="versionDesc" label="版本说明" rules={[{ required: true, message: '请输入版本说明' }]}>
            <Input placeholder="请输入版本说明" />
          </Form.Item>
          <Form.Item name="changeSummary" label="变更摘要">
            <Input.TextArea rows={3} placeholder="请输入变更摘要" />
          </Form.Item>
          <Form.Item name="fileName" label="附件名称">
            <Input placeholder="请输入附件名称" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="终止合同"
        open={!!terminateOpen}
        onOk={() => void submitTerminate()}
        confirmLoading={saving}
        onCancel={() => setTerminateOpen(null)}
        destroyOnClose
      >
        <Form form={terminateForm} layout="vertical">
          <Form.Item name="reason" label="终止原因" rules={[{ required: true, message: '请输入终止原因' }]}>
            <Input.TextArea rows={3} placeholder="请输入终止原因" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="合同到期提醒"
        open={alertOpen}
        onCancel={() => setAlertOpen(false)}
        footer={<Button onClick={() => setAlertOpen(false)}>关闭</Button>}
        width={720}
      >
        <Table<OaBizFlowItem>
          rowKey="id"
          size="small"
          loading={alertLoading}
          dataSource={alertList}
          pagination={false}
          columns={[
            { title: '合同编号', dataIndex: 'contractNo', render: plain },
            { title: '合同名称', dataIndex: 'contractName', render: plain },
            { title: '到期日期', dataIndex: 'expireDate', render: (v) => formatDate(v) },
            {
              title: '状态',
              dataIndex: 'contractStatus',
              render: (v) => (
                <Tag color={OA_CONTRACT_STATUS_COLOR[String(v)]}>
                  {OA_CONTRACT_STATUS_LABEL[String(v)] || String(v ?? '-')}
                </Tag>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
}

export default function OaContractPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        合同管理
      </Title>

      <Tabs items={[{ key: 'contract', label: '合同台账', children: <ContractTab /> }]} />
    </Space>
  );
}
