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
import dayjs, { type Dayjs } from 'dayjs';
import { devopsGateService } from '@/services/devopsService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  DEVOPS_GATE_RESULT_LABEL,
  DEVOPS_GATE_RESULT_OPTIONS,
  DEVOPS_GATE_TYPE_LABEL,
  DEVOPS_GATE_TYPE_OPTIONS,
  DEVOPS_SEVERITY_LABEL,
  DEVOPS_SEVERITY_OPTIONS,
  type DevopsGateItem,
  type DevopsGateSaveParams,
} from '@/types/devops';

const { Title } = Typography;

/** 后端 LocalDateTime 仅接受 ISO-8601 格式（yyyy-MM-ddTHH:mm:ss）。 */
const DATETIME_SUBMIT_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const DATETIME_PICKER_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const MANAGE = 'platform:devops:gate:manage';

/** 表单值类型：日期时间字段使用 Dayjs，提交时格式化为 ISO 字符串。 */
type FormValues = Omit<DevopsGateSaveParams, 'checkTime'> & {
  checkTime?: Dayjs;
};

export default function DevopsGatePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<DevopsGateItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [pipelineCode, setPipelineCode] = useState('');
  const [runNo, setRunNo] = useState('');
  const [gateType, setGateType] = useState<string | undefined>(undefined);
  const [gateResult, setGateResult] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      pCode = pipelineCode,
      rNo = runNo,
      gType = gateType,
      gResult = gateResult,
    ) => {
      setLoading(true);
      try {
        const res = await devopsGateService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          pipelineCode: pCode || undefined,
          runNo: rNo || undefined,
          gateType: gType,
          gateResult: gResult,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, pipelineCode, runNo, gateType, gateResult],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ gateType: 'UNIT_TEST', gateResult: 'PASS', issueCount: 0 });
    setOpen(true);
  };

  const openEdit = (record: DevopsGateItem) => {
    setEditId(record.id);
    const values = {
      ...record,
      checkTime: record.checkTime ? dayjs(record.checkTime) : undefined,
    };
    form.setFieldsValue(values);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: DevopsGateSaveParams = {
        ...values,
        checkTime: values.checkTime ? values.checkTime.format(DATETIME_SUBMIT_FORMAT) : undefined,
      };
      if (editId == null) {
        await devopsGateService.create(payload);
        message.success('质量安全门禁已创建');
      } else {
        await devopsGateService.update(editId, payload);
        message.success('质量安全门禁已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await devopsGateService.remove(id);
    message.success('质量安全门禁已删除');
    void loadData();
  };

  const columns: ColumnsType<DevopsGateItem> = [
    { title: '门禁编号', dataIndex: 'gateNo', width: 160, fixed: 'left', render: plain },
    { title: '流水线编码', dataIndex: 'pipelineCode', width: 150, render: plain },
    { title: '运行编号', dataIndex: 'runNo', width: 140, render: plain },
    { title: '门禁名称', dataIndex: 'gateName', width: 200, render: plain },
    { title: '门禁类型', dataIndex: 'gateType', width: 120, render: (v) => statusTag(DEVOPS_GATE_TYPE_LABEL, v) },
    { title: '阈值表达式', dataIndex: 'thresholdExpr', width: 180, ellipsis: true, render: plain },
    { title: '问题数', dataIndex: 'issueCount', width: 90, render: (v) => (v == null ? '-' : String(v)) },
    { title: '严重级别', dataIndex: 'severity', width: 100, render: (v) => statusTag(DEVOPS_SEVERITY_LABEL, v) },
    { title: '检查时间', dataIndex: 'checkTime', width: 170, render: formatDateTime },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '门禁结果',
      dataIndex: 'gateResult',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(DEVOPS_GATE_RESULT_LABEL, v),
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
            <Popconfirm title="确认删除该质量安全门禁？" onConfirm={() => void remove(record.id)}>
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
        质量安全门禁
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="流水线编码">
            <Input
              placeholder="请输入流水线编码"
              allowClear
              style={{ width: 160 }}
              value={pipelineCode}
              onChange={(e) => setPipelineCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="运行编号">
            <Input
              placeholder="请输入运行编号"
              allowClear
              style={{ width: 150 }}
              value={runNo}
              onChange={(e) => setRunNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="门禁类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={gateType}
              onChange={(v) => setGateType(v)}
              options={[...DEVOPS_GATE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="门禁结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={gateResult}
              onChange={(v) => setGateResult(v)}
              options={[...DEVOPS_GATE_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="门禁编号 / 名称"
              allowClear
              style={{ width: 180 }}
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
                  void loadData(1, pageSize, keyword, pipelineCode, runNo, gateType, gateResult);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setPipelineCode('');
                  setRunNo('');
                  setGateType(undefined);
                  setGateResult(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建质量安全门禁</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`质量安全门禁（共 ${total} 条）`}>
        <Table<DevopsGateItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2000 }}
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
        title={editId == null ? '新建质量安全门禁' : '编辑质量安全门禁'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="gateNo" label="门禁编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="pipelineCode" label="流水线编码" rules={[{ required: true, message: '请输入流水线编码' }]}>
            <Input placeholder="请输入流水线编码" />
          </Form.Item>
          <Form.Item name="runNo" label="运行编号">
            <Input placeholder="请输入运行编号" />
          </Form.Item>
          <Form.Item name="gateName" label="门禁名称" rules={[{ required: true, message: '请输入门禁名称' }]}>
            <Input placeholder="请输入门禁名称" />
          </Form.Item>
          <Form.Item name="gateType" label="门禁类型">
            <Select placeholder="请选择" options={[...DEVOPS_GATE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="thresholdExpr" label="阈值表达式">
            <Input placeholder="请输入阈值表达式" />
          </Form.Item>
          <Form.Item name="issueCount" label="问题数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入问题数" />
          </Form.Item>
          <Form.Item name="severity" label="严重级别">
            <Select placeholder="请选择" options={[...DEVOPS_SEVERITY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="gateResult" label="门禁结果">
            <Select placeholder="请选择" options={[...DEVOPS_GATE_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="checkTime" label="检查时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
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
    </Space>
  );
}
