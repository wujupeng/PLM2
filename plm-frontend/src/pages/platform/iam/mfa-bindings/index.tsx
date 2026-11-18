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
import { iamMfaBindingService } from '@/services/iamService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/iam/shared';
import {
  IAM_BIND_STATUS_LABEL,
  IAM_BIND_STATUS_OPTIONS,
  IAM_MFA_TYPE_LABEL,
  IAM_MFA_TYPE_OPTIONS,
  type IamMfaBindingItem,
  type IamMfaBindingSaveParams,
  type IamMfaBindingStats,
} from '@/types/iam';

const { Title } = Typography;

const MFA_MANAGE = 'platform:iam:mfa:manage';

export default function IamMfaBindingPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<IamMfaBindingSaveParams>();
  const [data, setData] = useState<IamMfaBindingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [mfaType, setMfaType] = useState<string | undefined>(undefined);
  const [bindStatus, setBindStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<IamMfaBindingStats>({});

  const loadStats = useCallback(async () => {
    const res = await iamMfaBindingService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, type = mfaType, bstatus = bindStatus, rg = range) => {
      setLoading(true);
      try {
        const res = await iamMfaBindingService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          mfaType: type,
          bindStatus: bstatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, mfaType, bindStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ mfaType: 'TOTP', bindStatus: 'PENDING', verifyCount: 0, failCount: 0 });
    setOpen(true);
  };

  const openEdit = (record: IamMfaBindingItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: IamMfaBindingSaveParams = { ...values };
      if (editId == null) {
        await iamMfaBindingService.create(payload);
        message.success('MFA 绑定已创建');
      } else {
        await iamMfaBindingService.update(editId, payload);
        message.success('MFA 绑定已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await iamMfaBindingService.remove(id);
    message.success('MFA 绑定已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<IamMfaBindingItem> = [
    { title: '绑定编号', dataIndex: 'bindNo', width: 170, fixed: 'left', render: plain },
    { title: '用户 ID', dataIndex: 'userId', width: 100, render: plain },
    { title: '用户名', dataIndex: 'username', width: 140, render: plain },
    { title: 'MFA 类型', dataIndex: 'mfaType', width: 140, render: (v) => enumText(IAM_MFA_TYPE_LABEL, v) },
    { title: '密钥', dataIndex: 'secretKey', width: 220, ellipsis: true, render: plain },
    { title: '密钥版本', dataIndex: 'keyVer', width: 100, render: plain },
    { title: '联系手机', dataIndex: 'contactPhone', width: 140, render: plain },
    { title: '联系邮箱', dataIndex: 'contactEmail', width: 180, render: plain },
    { title: '绑定时间', dataIndex: 'bindTime', width: 160, render: formatDateTime },
    { title: '最近校验', dataIndex: 'lastVerifyAt', width: 160, render: formatDateTime },
    { title: '校验次数', dataIndex: 'verifyCount', width: 100, render: plain },
    { title: '失败次数', dataIndex: 'failCount', width: 100, render: plain },
    { title: '过期时间', dataIndex: 'expireTime', width: 160, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    {
      title: '绑定状态',
      dataIndex: 'bindStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(IAM_BIND_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MFA_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认绑定该 MFA？"
              onConfirm={() => void act(iamMfaBindingService.bind, record.id, 'MFA 已绑定')}
            >
              <Button type="link" size="small">
                绑定
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认解绑该 MFA？"
              onConfirm={() => void act(iamMfaBindingService.unbind, record.id, 'MFA 已解绑')}
            >
              <Button type="link" size="small">
                解绑
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该 MFA？"
              onConfirm={() => void act(iamMfaBindingService.disable, record.id, 'MFA 已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该 MFA 绑定？" onConfirm={() => void remove(record.id)}>
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
        多因素认证绑定
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="绑定总数" value={Number(stats.total ?? 0)} />
          <Statistic title="待绑定" value={Number(stats.pending ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="已绑定" value={Number(stats.bound ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="已解绑" value={Number(stats.unbound ?? 0)} />
          <Statistic title="已停用" value={Number(stats.disabled ?? 0)} />
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
          <Form.Item label="绑定状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={bindStatus}
              onChange={(v) => setBindStatus(v)}
              options={[...IAM_BIND_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="绑定编号 / 用户名 / 手机 / 邮箱"
              allowClear
              style={{ width: 240 }}
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
                  void loadData(1, pageSize, keyword, mfaType, bindStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setMfaType(undefined);
                  setBindStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(MFA_MANAGE) && <Button onClick={openCreate}>新建绑定</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`多因素认证绑定（共 ${total} 条）`}>
        <Table<IamMfaBindingItem>
          rowKey="id"
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

      <Modal
        title={editId == null ? '新建 MFA 绑定' : '编辑 MFA 绑定'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="bindNo" label="绑定编号">
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
          <Form.Item name="secretKey" label="密钥">
            <Input placeholder="请输入密钥" />
          </Form.Item>
          <Form.Item name="keyVer" label="密钥版本">
            <Input placeholder="请输入密钥版本" />
          </Form.Item>
          <Form.Item name="contactPhone" label="联系手机">
            <Input placeholder="请输入联系手机" />
          </Form.Item>
          <Form.Item name="contactEmail" label="联系邮箱">
            <Input placeholder="请输入联系邮箱" />
          </Form.Item>
          <Form.Item name="bindStatus" label="绑定状态">
            <Select placeholder="请选择" options={[...IAM_BIND_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="bindTime" label="绑定时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="lastVerifyAt" label="最近校验时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="verifyCount" label="校验次数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="failCount" label="失败次数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expireTime" label="过期时间">
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
