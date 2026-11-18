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
  Statistic,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { iamSodViolationService } from '@/services/iamService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/iam/shared';
import {
  IAM_HANDLE_STATUS_LABEL,
  IAM_HANDLE_STATUS_OPTIONS,
  IAM_RISK_LEVEL_LABEL,
  IAM_RISK_LEVEL_OPTIONS,
  type IamSodViolationItem,
  type IamSodViolationSaveParams,
  type IamSodViolationStats,
} from '@/types/iam';

const { Title } = Typography;

const SOD_VIOLATION_MANAGE = 'platform:iam:sodviolation:manage';

export default function IamSodViolationPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<IamSodViolationSaveParams>();
  const [data, setData] = useState<IamSodViolationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [riskLevel, setRiskLevel] = useState<string | undefined>(undefined);
  const [handleStatus, setHandleStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<IamSodViolationStats>({});

  const loadStats = useCallback(async () => {
    const res = await iamSodViolationService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, risk = riskLevel, hstatus = handleStatus, rg = range) => {
      setLoading(true);
      try {
        const res = await iamSodViolationService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          riskLevel: risk,
          handleStatus: hstatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, riskLevel, handleStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ riskLevel: 'HIGH', handleStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: IamSodViolationItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: IamSodViolationSaveParams = { ...values, ruleNo: values.ruleNo! };
      if (editId == null) {
        await iamSodViolationService.create(payload);
        message.success('违规记录已创建');
      } else {
        await iamSodViolationService.update(editId, payload);
        message.success('违规记录已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await iamSodViolationService.remove(id);
    message.success('违规记录已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<IamSodViolationItem> = [
    { title: '违规编号', dataIndex: 'violationNo', width: 170, fixed: 'left', render: plain },
    { title: '规则编号', dataIndex: 'ruleNo', width: 160, render: plain },
    { title: '规则名称', dataIndex: 'ruleName', width: 180, render: plain },
    { title: '用户 ID', dataIndex: 'userId', width: 100, render: plain },
    { title: '用户名', dataIndex: 'username', width: 140, render: plain },
    { title: '冲突详情', dataIndex: 'conflictDetail', width: 220, ellipsis: true, render: plain },
    { title: '处理人', dataIndex: 'handler', width: 120, render: plain },
    { title: '处理时间', dataIndex: 'handleTime', width: 160, render: formatDateTime },
    { title: '处理说明', dataIndex: 'handleNote', width: 200, ellipsis: true, render: plain },
    { title: '检测时间', dataIndex: 'detectTime', width: 160, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '风险级别', dataIndex: 'riskLevel', width: 110, render: (v) => statusTag(IAM_RISK_LEVEL_LABEL, v) },
    {
      title: '处理状态',
      dataIndex: 'handleStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(IAM_HANDLE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(SOD_VIOLATION_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认将该违规标记为已整改？"
              onConfirm={() => void act(iamSodViolationService.resolve, record.id, '违规已整改')}
            >
              <Button type="link" size="small">
                整改
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认忽略该违规？"
              onConfirm={() => void act(iamSodViolationService.ignore, record.id, '违规已忽略')}
            >
              <Button type="link" size="small">
                忽略
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该违规记录？" onConfirm={() => void remove(record.id)}>
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
        职责分离违规
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="违规总数" value={Number(stats.total ?? 0)} />
          <Statistic title="待处理" value={Number(stats.open ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="处理中" value={Number(stats.handling ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="已整改" value={Number(stats.resolved ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="已忽略" value={Number(stats.ignored ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="风险级别">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={riskLevel}
              onChange={(v) => setRiskLevel(v)}
              options={[...IAM_RISK_LEVEL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="处理状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={handleStatus}
              onChange={(v) => setHandleStatus(v)}
              options={[...IAM_HANDLE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="违规编号 / 规则编号 / 用户名"
              allowClear
              style={{ width: 220 }}
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
                  void loadData(1, pageSize, keyword, riskLevel, handleStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRiskLevel(undefined);
                  setHandleStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(SOD_VIOLATION_MANAGE) && <Button onClick={openCreate}>新建违规</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`职责分离违规（共 ${total} 条）`}>
        <Table<IamSodViolationItem>
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

      <Modal
        title={editId == null ? '新建职责分离违规' : '编辑职责分离违规'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="violationNo" label="违规编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="ruleNo" label="规则编号" rules={[{ required: true, message: '请输入规则编号' }]}>
            <Input placeholder="请输入规则编号" />
          </Form.Item>
          <Form.Item name="ruleName" label="规则名称">
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item name="userId" label="用户 ID">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入用户 ID" />
          </Form.Item>
          <Form.Item name="username" label="用户名">
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="conflictDetail" label="冲突详情">
            <Input.TextArea rows={2} placeholder="请输入冲突详情" />
          </Form.Item>
          <Form.Item name="riskLevel" label="风险级别">
            <Select placeholder="请选择" options={[...IAM_RISK_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="handleStatus" label="处理状态">
            <Select placeholder="请选择" options={[...IAM_HANDLE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="handler" label="处理人">
            <Input placeholder="请输入处理人" />
          </Form.Item>
          <Form.Item name="handleTime" label="处理时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="handleNote" label="处理说明">
            <Input.TextArea rows={2} placeholder="请输入处理说明" />
          </Form.Item>
          <Form.Item name="detectTime" label="检测时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
