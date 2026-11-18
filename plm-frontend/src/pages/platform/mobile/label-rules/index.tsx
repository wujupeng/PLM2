import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
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
import { ReloadOutlined, SafetyCertificateOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { labelRuleService } from '@/services/mobileService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/mobile/shared';
import {
  LABEL_CHECK_TYPE_LABEL,
  LABEL_CHECK_TYPE_OPTIONS,
  LABEL_ERROR_LEVEL_LABEL,
  LABEL_ERROR_LEVEL_OPTIONS,
  LABEL_RULE_STATUS_LABEL,
  LABEL_RULE_STATUS_OPTIONS,
  LABEL_TYPE_LABEL,
  LABEL_TYPE_OPTIONS,
  type MobileLabelRuleItem,
  type MobileLabelRuleSaveParams,
  type MobileLabelValidateParams,
} from '@/types/mobile';

const { Title } = Typography;

const LABEL_RULE_MANAGE = 'platform:mobile:labelrule:manage';

export default function MobileLabelRulePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MobileLabelRuleSaveParams>();
  const [validateForm] = Form.useForm<MobileLabelValidateParams>();
  const [data, setData] = useState<MobileLabelRuleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [labelType, setLabelType] = useState<string | undefined>(undefined);
  const [checkType, setCheckType] = useState<string | undefined>(undefined);
  const [ruleStatus, setRuleStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validateOpen, setValidateOpen] = useState(false);
  const [validateSaving, setValidateSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      lType = labelType,
      cType = checkType,
      rStatus = ruleStatus,
    ) => {
      setLoading(true);
      try {
        const res = await labelRuleService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          labelType: lType,
          checkType: cType,
          ruleStatus: rStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, labelType, checkType, ruleStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ labelType: 'MATERIAL', checkType: 'FORMAT', errorLevel: 'ERROR', ruleStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: MobileLabelRuleItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MobileLabelRuleSaveParams = { ...values };
      if (editId == null) {
        await labelRuleService.create(payload);
        message.success('标签校验规则已创建');
      } else {
        await labelRuleService.update(editId, payload);
        message.success('标签校验规则已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await labelRuleService.remove(id);
    message.success('标签校验规则已删除');
    void loadData();
  };

  const openValidate = () => {
    validateForm.resetFields();
    validateForm.setFieldsValue({ labelType: 'MATERIAL' });
    setValidateOpen(true);
  };

  const submitValidate = async () => {
    const values = await validateForm.validateFields();
    setValidateSaving(true);
    try {
      const res = await labelRuleService.validate({
        barcode: values.barcode,
        labelType: values.labelType,
      });
      const tip = `校验结果：${res.valid ? '通过' : '不通过'}；命中规则：${res.ruleCode || '无'}`;
      if (res.valid) {
        message.success(tip);
      } else {
        message.warning(tip);
      }
      if (res.message) {
        message.info(res.message);
      }
    } finally {
      setValidateSaving(false);
    }
  };

  const columns: ColumnsType<MobileLabelRuleItem> = [
    { title: '规则编号', dataIndex: 'ruleNo', width: 160, fixed: 'left', render: plain },
    { title: '规则编码', dataIndex: 'ruleCode', width: 160, render: plain },
    { title: '规则名称', dataIndex: 'ruleName', width: 180, render: plain },
    { title: '标签类型', dataIndex: 'labelType', width: 120, render: (v) => statusTag(LABEL_TYPE_LABEL, v) },
    {
      title: '校验方式',
      dataIndex: 'checkType',
      width: 120,
      render: (v) => statusTag(LABEL_CHECK_TYPE_LABEL, v),
    },
    { title: '条码模式', dataIndex: 'barcodePattern', width: 200, ellipsis: true, render: plain },
    { title: '期望长度', dataIndex: 'expectedLength', width: 100, render: plain },
    { title: '错误级别', dataIndex: 'errorLevel', width: 100, render: (v) => statusTag(LABEL_ERROR_LEVEL_LABEL, v) },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'ruleStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(LABEL_RULE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(LABEL_RULE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该标签校验规则？" onConfirm={() => void remove(record.id)}>
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
        标签校验规则
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="标签类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={labelType}
              onChange={(v) => setLabelType(v)}
              options={[...LABEL_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="校验方式">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={checkType}
              onChange={(v) => setCheckType(v)}
              options={[...LABEL_CHECK_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={ruleStatus}
              onChange={(v) => setRuleStatus(v)}
              options={[...LABEL_RULE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="规则编码 / 名称"
              allowClear
              style={{ width: 200 }}
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
                  void loadData(1, pageSize, keyword, labelType, checkType, ruleStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setLabelType(undefined);
                  setCheckType(undefined);
                  setRuleStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(LABEL_RULE_MANAGE) && (
                <Button type="primary" icon={<SafetyCertificateOutlined />} onClick={openValidate}>
                  校验条码
                </Button>
              )}
              {hasPermission(LABEL_RULE_MANAGE) && <Button onClick={openCreate}>新建标签校验规则</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`标签校验规则（共 ${total} 条）`}>
        <Table<MobileLabelRuleItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2100 }}
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
        title={editId == null ? '新建标签校验规则' : '编辑标签校验规则'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="ruleNo" label="规则编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="ruleCode" label="规则编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="ruleName" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item name="labelType" label="标签类型">
            <Select placeholder="请选择" options={[...LABEL_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="checkType" label="校验方式">
            <Select placeholder="请选择" options={[...LABEL_CHECK_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="barcodePattern" label="条码模式">
            <Input placeholder="请输入条码模式（正则 / 前缀）" />
          </Form.Item>
          <Form.Item name="expectedLength" label="期望长度">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入期望长度" />
          </Form.Item>
          <Form.Item name="errorLevel" label="错误级别">
            <Select placeholder="请选择" options={[...LABEL_ERROR_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ruleStatus" label="状态">
            <Select placeholder="请选择" options={[...LABEL_RULE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="校验条码"
        open={validateOpen}
        onOk={() => void submitValidate()}
        confirmLoading={validateSaving}
        onCancel={() => setValidateOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={validateForm} layout="vertical" preserve={false}>
          <Form.Item name="barcode" label="条码" rules={[{ required: true, message: '请输入条码' }]}>
            <Input placeholder="请输入或扫描条码" />
          </Form.Item>
          <Form.Item name="labelType" label="标签类型">
            <Select placeholder="请选择" options={[...LABEL_TYPE_OPTIONS]} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
