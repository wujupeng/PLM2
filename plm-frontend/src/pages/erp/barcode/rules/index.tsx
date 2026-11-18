import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
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
import { erpBarcodeRuleService } from '@/services/erpBarcodeService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_BARCODE_SCAN_BIZ_TYPE_LABEL,
  ERP_BARCODE_SCAN_BIZ_TYPE_OPTIONS,
  ERP_BARCODE_TYPE_LABEL,
  ERP_BARCODE_TYPE_OPTIONS,
  ERP_COMMON_ACTIVE_STATUS_LABEL,
  ERP_COMMON_ACTIVE_STATUS_OPTIONS,
  ERP_YES_NO_OPTIONS,
  type ErpBarcodeRule,
  type ErpBarcodeRuleQuery,
  type ErpBarcodeRuleSaveRequest,
} from '@/types/erpBarcode';

const { Title } = Typography;

const MANAGE = 'erp:barcode:rule:manage';

/** 是否开关：1 显示"是"，其余显示"否"。 */
const yesNo = (v?: number | null) => (v === 1 ? '是' : '否');

export default function ErpBarcodeRulePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ErpBarcodeRuleSaveRequest>();
  const [data, setData] = useState<ErpBarcodeRule[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [barcodeType, setBarcodeType] = useState<string | undefined>(undefined);
  const [scanBizType, setScanBizType] = useState<string | undefined>(undefined);
  const [ruleStatus, setRuleStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = barcodeType,
      bizType = scanBizType,
      status = ruleStatus,
    ) => {
      setLoading(true);
      try {
        const params: ErpBarcodeRuleQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          barcodeType: type,
          scanBizType: bizType,
          ruleStatus: status,
        };
        const res = await erpBarcodeRuleService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, barcodeType, scanBizType, ruleStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      barcodeType: 'MATERIAL',
      scanBizType: 'RECEIPT',
      validateEnabled: 1,
      duplicateCheck: 1,
      ruleStatus: 'ACTIVE',
    });
    setOpen(true);
  };

  const openEdit = (record: ErpBarcodeRule) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editId == null) {
        await erpBarcodeRuleService.create(values);
        message.success('扫码规则已创建');
      } else {
        await erpBarcodeRuleService.update(editId, values);
        message.success('扫码规则已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpBarcodeRuleService.remove(id);
    message.success('扫码规则已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpBarcodeRule> = [
    { title: '规则编码', dataIndex: 'ruleCode', width: 170, fixed: 'left', render: plain },
    { title: '规则名称', dataIndex: 'ruleName', width: 160, render: plain },
    {
      title: '条码类型',
      dataIndex: 'barcodeType',
      width: 120,
      render: (v) => statusTag(ERP_BARCODE_TYPE_LABEL, v),
    },
    {
      title: '扫码业务类型',
      dataIndex: 'scanBizType',
      width: 140,
      render: (v) => statusTag(ERP_BARCODE_SCAN_BIZ_TYPE_LABEL, v),
    },
    { title: '规则表达式', dataIndex: 'rulePattern', width: 200, ellipsis: true, render: plain },
    { title: '启用校验', dataIndex: 'validateEnabled', width: 110, render: (v) => yesNo(v) },
    { title: '是否查重', dataIndex: 'duplicateCheck', width: 110, render: (v) => yesNo(v) },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '规则状态',
      dataIndex: 'ruleStatus',
      width: 120,
      fixed: 'right',
      render: (v) => statusTag(ERP_COMMON_ACTIVE_STATUS_LABEL, v),
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
            <Popconfirm
              title="确认删除该扫码规则？"
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
        扫码规则
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="条码类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={barcodeType}
              onChange={(v) => setBarcodeType(v)}
              options={[...ERP_BARCODE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="扫码业务类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={scanBizType}
              onChange={(v) => setScanBizType(v)}
              options={[...ERP_BARCODE_SCAN_BIZ_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="规则状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={ruleStatus}
              onChange={(v) => setRuleStatus(v)}
              options={[...ERP_COMMON_ACTIVE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="规则编码 / 规则名称"
              allowClear
              style={{ width: 260 }}
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
                  void loadData(1, pageSize, keyword, barcodeType, scanBizType, ruleStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBarcodeType(undefined);
                  setScanBizType(undefined);
                  setRuleStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建扫码规则</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`扫码规则（共 ${total} 条）`}>
        <Table<ErpBarcodeRule>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1700 }}
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
        title={editId == null ? '新建扫码规则' : '编辑扫码规则'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="ruleCode"
            label="规则编码"
            rules={[{ required: true, message: '请输入规则编码' }]}
          >
            <Input placeholder="请输入规则编码" />
          </Form.Item>
          <Form.Item name="ruleName" label="规则名称">
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item name="barcodeType" label="条码类型">
            <Select placeholder="为空默认 MATERIAL" options={[...ERP_BARCODE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="scanBizType" label="扫码业务类型">
            <Select
              placeholder="为空默认 RECEIPT"
              options={[...ERP_BARCODE_SCAN_BIZ_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item name="rulePattern" label="规则表达式">
            <Input.TextArea rows={2} placeholder="请输入规则表达式" />
          </Form.Item>
          <Form.Item name="validateEnabled" label="启用校验">
            <Select placeholder="为空默认 是" options={[...ERP_YES_NO_OPTIONS]} />
          </Form.Item>
          <Form.Item name="duplicateCheck" label="是否查重">
            <Select placeholder="为空默认 是" options={[...ERP_YES_NO_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ruleStatus" label="规则状态">
            <Select
              placeholder="为空默认 ACTIVE"
              options={[...ERP_COMMON_ACTIVE_STATUS_OPTIONS]}
            />
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
