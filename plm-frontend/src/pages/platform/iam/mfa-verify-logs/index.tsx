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
import { iamMfaVerifyLogService } from '@/services/iamService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/iam/shared';
import {
  IAM_MFA_TYPE_LABEL,
  IAM_MFA_TYPE_OPTIONS,
  IAM_VERIFY_RESULT_LABEL,
  IAM_VERIFY_RESULT_OPTIONS,
  IAM_VERIFY_SCENE_LABEL,
  IAM_VERIFY_SCENE_OPTIONS,
  type IamMfaVerifyLogItem,
  type IamMfaVerifyLogSaveParams,
  type IamMfaVerifyLogStats,
} from '@/types/iam';

const { Title } = Typography;

const MFA_VERIFY_MANAGE = 'platform:iam:mfaverify:manage';

export default function IamMfaVerifyLogPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<IamMfaVerifyLogSaveParams>();
  const [data, setData] = useState<IamMfaVerifyLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [mfaType, setMfaType] = useState<string | undefined>(undefined);
  const [verifyScene, setVerifyScene] = useState<string | undefined>(undefined);
  const [verifyResult, setVerifyResult] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<IamMfaVerifyLogStats>({});

  const loadStats = useCallback(async () => {
    const res = await iamMfaVerifyLogService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = mfaType,
      scene = verifyScene,
      result = verifyResult,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await iamMfaVerifyLogService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          mfaType: type,
          verifyScene: scene,
          verifyResult: result,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, mfaType, verifyScene, verifyResult, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ mfaType: 'TOTP', verifyScene: 'LOGIN', verifyResult: 'SUCCESS', costMs: 0 });
    setOpen(true);
  };

  const openEdit = (record: IamMfaVerifyLogItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: IamMfaVerifyLogSaveParams = { ...values };
      if (editId == null) {
        await iamMfaVerifyLogService.create(payload);
        message.success('校验日志已创建');
      } else {
        await iamMfaVerifyLogService.update(editId, payload);
        message.success('校验日志已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await iamMfaVerifyLogService.remove(id);
    message.success('校验日志已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<IamMfaVerifyLogItem> = [
    { title: '日志编号', dataIndex: 'logNo', width: 170, fixed: 'left', render: plain },
    { title: '用户 ID', dataIndex: 'userId', width: 100, render: plain },
    { title: '用户名', dataIndex: 'username', width: 140, render: plain },
    { title: 'MFA 类型', dataIndex: 'mfaType', width: 140, render: (v) => enumText(IAM_MFA_TYPE_LABEL, v) },
    { title: '校验场景', dataIndex: 'verifyScene', width: 120, render: (v) => enumText(IAM_VERIFY_SCENE_LABEL, v) },
    { title: '失败原因', dataIndex: 'failReason', width: 200, ellipsis: true, render: plain },
    { title: '客户端 IP', dataIndex: 'clientIp', width: 140, render: plain },
    { title: '校验时间', dataIndex: 'verifyTime', width: 160, render: formatDateTime },
    { title: '耗时(ms)', dataIndex: 'costMs', width: 100, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    {
      title: '校验结果',
      dataIndex: 'verifyResult',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(IAM_VERIFY_RESULT_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MFA_VERIFY_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该校验日志？" onConfirm={() => void remove(record.id)}>
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
        MFA 校验日志
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="日志总数" value={Number(stats.total ?? 0)} />
          <Statistic title="成功" value={Number(stats.success ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="失败" value={Number(stats.fail ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="已过期" value={Number(stats.expired ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="耗时合计(ms)" value={Number(stats.totalCostMs ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="MFA 类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 150 }}
              value={mfaType}
              onChange={(v) => setMfaType(v)}
              options={[...IAM_MFA_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="校验场景">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={verifyScene}
              onChange={(v) => setVerifyScene(v)}
              options={[...IAM_VERIFY_SCENE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="校验结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={verifyResult}
              onChange={(v) => setVerifyResult(v)}
              options={[...IAM_VERIFY_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="日志编号 / 用户名 / 客户端 IP"
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
                  void loadData(1, pageSize, keyword, mfaType, verifyScene, verifyResult, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setMfaType(undefined);
                  setVerifyScene(undefined);
                  setVerifyResult(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(MFA_VERIFY_MANAGE) && <Button onClick={openCreate}>新建日志</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`MFA 校验日志（共 ${total} 条）`}>
        <Table<IamMfaVerifyLogItem>
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
        title={editId == null ? '新建 MFA 校验日志' : '编辑 MFA 校验日志'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="logNo" label="日志编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="userId" label="用户 ID">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入用户 ID" />
          </Form.Item>
          <Form.Item name="username" label="用户名">
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="mfaType" label="MFA 类型">
            <Select placeholder="请选择" options={[...IAM_MFA_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="verifyScene" label="校验场景">
            <Select placeholder="请选择" options={[...IAM_VERIFY_SCENE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="verifyResult" label="校验结果">
            <Select placeholder="请选择" options={[...IAM_VERIFY_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="failReason" label="失败原因">
            <Input.TextArea rows={2} placeholder="请输入失败原因" />
          </Form.Item>
          <Form.Item name="clientIp" label="客户端 IP">
            <Input placeholder="请输入客户端 IP" />
          </Form.Item>
          <Form.Item name="verifyTime" label="校验时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="costMs" label="耗时(ms)">
            <InputNumber min={0} style={{ width: '100%' }} />
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
