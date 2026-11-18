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
import { erpMrpRunService } from '@/services/erpDemandPlanService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_MRP_RUN_SCOPE_LABEL,
  ERP_MRP_RUN_SCOPE_OPTIONS,
  ERP_MRP_RUN_STATUS_LABEL,
  ERP_MRP_RUN_STATUS_OPTIONS,
  ERP_MRP_RUN_TYPE_LABEL,
  ERP_MRP_RUN_TYPE_OPTIONS,
  type ErpMrpRun,
  type ErpMrpRunQuery,
  type ErpMrpRunSaveRequest,
} from '@/types/erpDemandPlan';

const { Title } = Typography;

const MANAGE = 'erp:demand-plan:mrprun:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpMrpRunSaveRequest, 'runDate'> & {
  runDate?: Dayjs;
};

export default function ErpMrpRunPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpMrpRun[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [runType, setRunType] = useState<string | undefined>(undefined);
  const [runScope, setRunScope] = useState<string | undefined>(undefined);
  const [runStatus, setRunStatus] = useState<string | undefined>(undefined);
  const [planNo, setPlanNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = runType,
      scope = runScope,
      status = runStatus,
      plan = planNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpMrpRunQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          runType: type,
          runScope: scope,
          runStatus: status,
          planNo: plan || undefined,
        };
        const res = await erpMrpRunService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, runType, runScope, runStatus, planNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ runType: 'MRP', runScope: 'ALL', runStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpMrpRun) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      runDate: record.runDate ? dayjs(record.runDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpMrpRunSaveRequest = {
        ...values,
        runDate: values.runDate ? values.runDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpMrpRunService.create(payload);
        message.success('MRP运算单已创建');
      } else {
        await erpMrpRunService.update(editId, payload);
        message.success('MRP运算单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpMrpRunService.remove(id);
    message.success('MRP运算单已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpMrpRun> = [
    { title: '运算单号', dataIndex: 'runNo', width: 170, fixed: 'left', render: plain },
    {
      title: '运算类型',
      dataIndex: 'runType',
      width: 160,
      render: (v) => statusTag(ERP_MRP_RUN_TYPE_LABEL, v),
    },
    { title: '计划单号', dataIndex: 'planNo', width: 160, render: plain },
    {
      title: '运算范围',
      dataIndex: 'runScope',
      width: 110,
      render: (v) => statusTag(ERP_MRP_RUN_SCOPE_LABEL, v),
    },
    { title: '运算日期', dataIndex: 'runDate', width: 170, render: formatDateTime },
    { title: '运算人', dataIndex: 'runBy', width: 110, render: plain },
    { title: '需求数量', dataIndex: 'demandCount', width: 110, render: plain },
    { title: '建议数量', dataIndex: 'suggestionCount', width: 110, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '运算状态',
      dataIndex: 'runStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_MRP_RUN_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该MRP运算单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        MRP运算单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="运算状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={runStatus}
              onChange={(v) => setRunStatus(v)}
              options={[...ERP_MRP_RUN_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="运算类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 160 }}
              value={runType}
              onChange={(v) => setRunType(v)}
              options={[...ERP_MRP_RUN_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="运算范围">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={runScope}
              onChange={(v) => setRunScope(v)}
              options={[...ERP_MRP_RUN_SCOPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="计划单号">
            <Input
              placeholder="请输入计划单号"
              allowClear
              style={{ width: 160 }}
              value={planNo}
              onChange={(e) => setPlanNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="运算单号 / 运算人"
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
                  void loadData(1, pageSize, keyword, runType, runScope, runStatus, planNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRunType(undefined);
                  setRunScope(undefined);
                  setRunStatus(undefined);
                  setPlanNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建运算单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`MRP运算单（共 ${total} 条）`}>
        <Table<ErpMrpRun>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1800 }}
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
        title={editId == null ? '新建运算单' : '编辑运算单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="runNo" label="运算单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="runType" label="运算类型">
            <Select placeholder="为空默认 MRP" options={[...ERP_MRP_RUN_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="planNo" label="计划单号">
            <Input placeholder="请输入计划单号" />
          </Form.Item>
          <Form.Item name="runScope" label="运算范围">
            <Select placeholder="为空默认 ALL" options={[...ERP_MRP_RUN_SCOPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="runDate" label="运算日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择运算日期" />
          </Form.Item>
          <Form.Item name="runBy" label="运算人">
            <Input placeholder="请输入运算人" />
          </Form.Item>
          <Form.Item name="demandCount" label="需求数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入需求数量" />
          </Form.Item>
          <Form.Item name="suggestionCount" label="建议数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入建议数量" />
          </Form.Item>
          <Form.Item name="runStatus" label="运算状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_MRP_RUN_STATUS_OPTIONS]} />
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
