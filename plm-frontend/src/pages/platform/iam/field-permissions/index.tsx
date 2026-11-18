import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
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
import { iamFieldPermissionService } from '@/services/iamService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/iam/shared';
import {
  IAM_ACCESS_LEVEL_LABEL,
  IAM_ACCESS_LEVEL_OPTIONS,
  IAM_BIZ_MODULE_LABEL,
  IAM_BIZ_MODULE_OPTIONS,
  IAM_PERM_STATUS_LABEL,
  IAM_PERM_STATUS_OPTIONS,
  type IamFieldPermissionItem,
  type IamFieldPermissionSaveParams,
  type IamFieldPermissionStats,
} from '@/types/iam';

const { Title } = Typography;

const FIELD_PERM_MANAGE = 'platform:iam:fieldperm:manage';

export default function IamFieldPermissionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<IamFieldPermissionSaveParams>();
  const [data, setData] = useState<IamFieldPermissionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [bizModule, setBizModule] = useState<string | undefined>(undefined);
  const [accessLevel, setAccessLevel] = useState<string | undefined>(undefined);
  const [permStatus, setPermStatus] = useState<string | undefined>(undefined);
  const [tableName, setTableName] = useState('');
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<IamFieldPermissionStats>({});

  const loadStats = useCallback(async () => {
    const res = await iamFieldPermissionService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      role = roleCode,
      module = bizModule,
      level = accessLevel,
      pstatus = permStatus,
      table = tableName,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await iamFieldPermissionService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          roleCode: role || undefined,
          bizModule: module,
          accessLevel: level,
          permStatus: pstatus,
          tableName: table || undefined,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, roleCode, bizModule, accessLevel, permStatus, tableName, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined, undefined, '', null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ accessLevel: 'MASKED', permStatus: 'ACTIVE', bizModule: 'PLM' });
    setOpen(true);
  };

  const openEdit = (record: IamFieldPermissionItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: IamFieldPermissionSaveParams = {
        ...values,
        roleCode: values.roleCode!,
        tableName: values.tableName!,
        fieldName: values.fieldName!,
      };
      if (editId == null) {
        await iamFieldPermissionService.create(payload);
        message.success('字段权限已创建');
      } else {
        await iamFieldPermissionService.update(editId, payload);
        message.success('字段权限已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await iamFieldPermissionService.remove(id);
    message.success('字段权限已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<IamFieldPermissionItem> = [
    { title: '权限编号', dataIndex: 'permNo', width: 170, fixed: 'left', render: plain },
    { title: '角色编码', dataIndex: 'roleCode', width: 150, render: plain },
    { title: '业务模块', dataIndex: 'bizModule', width: 130, render: (v) => enumText(IAM_BIZ_MODULE_LABEL, v) },
    { title: '表名', dataIndex: 'tableName', width: 160, render: plain },
    { title: '字段名', dataIndex: 'fieldName', width: 150, render: plain },
    { title: '字段标签', dataIndex: 'fieldLabel', width: 140, render: plain },
    { title: '访问级别', dataIndex: 'accessLevel', width: 120, render: (v) => enumText(IAM_ACCESS_LEVEL_LABEL, v) },
    { title: '脱敏规则', dataIndex: 'maskRule', width: 180, ellipsis: true, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    {
      title: '权限状态',
      dataIndex: 'permStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(IAM_PERM_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(FIELD_PERM_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该字段权限？"
              onConfirm={() => void act(iamFieldPermissionService.enable, record.id, '字段权限已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该字段权限？"
              onConfirm={() => void act(iamFieldPermissionService.disable, record.id, '字段权限已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该字段权限？" onConfirm={() => void remove(record.id)}>
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
        字段权限
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="权限总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="停用" value={Number(stats.disabled ?? 0)} />
          <Statistic title="不可见字段" value={Number(stats.hiddenCount ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="脱敏字段" value={Number(stats.maskedCount ?? 0)} valueStyle={{ color: '#d46b08' }} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="角色编码">
            <Input
              placeholder="请输入角色编码"
              allowClear
              style={{ width: 150 }}
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="业务模块">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 160 }}
              value={bizModule}
              onChange={(v) => setBizModule(v)}
              options={[...IAM_BIZ_MODULE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="访问级别">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={accessLevel}
              onChange={(v) => setAccessLevel(v)}
              options={[...IAM_ACCESS_LEVEL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="权限状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={permStatus}
              onChange={(v) => setPermStatus(v)}
              options={[...IAM_PERM_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="表名">
            <Input
              placeholder="请输入表名"
              allowClear
              style={{ width: 150 }}
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="权限编号 / 字段名 / 字段标签"
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
                  void loadData(1, pageSize, keyword, roleCode, bizModule, accessLevel, permStatus, tableName, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRoleCode('');
                  setBizModule(undefined);
                  setAccessLevel(undefined);
                  setPermStatus(undefined);
                  setTableName('');
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined, undefined, '', null);
                }}
              >
                重置
              </Button>
              {hasPermission(FIELD_PERM_MANAGE) && <Button onClick={openCreate}>新建字段权限</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`字段权限（共 ${total} 条）`}>
        <Table<IamFieldPermissionItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2200 }}
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
        title={editId == null ? '新建字段权限' : '编辑字段权限'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="permNo" label="权限编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="roleCode" label="角色编码" rules={[{ required: true, message: '请输入角色编码' }]}>
            <Input placeholder="请输入角色编码" />
          </Form.Item>
          <Form.Item name="bizModule" label="业务模块">
            <Select placeholder="请选择" allowClear options={[...IAM_BIZ_MODULE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="tableName" label="表名" rules={[{ required: true, message: '请输入表名' }]}>
            <Input placeholder="请输入表名" />
          </Form.Item>
          <Form.Item name="fieldName" label="字段名" rules={[{ required: true, message: '请输入字段名' }]}>
            <Input placeholder="请输入字段名" />
          </Form.Item>
          <Form.Item name="fieldLabel" label="字段标签">
            <Input placeholder="请输入字段标签" />
          </Form.Item>
          <Form.Item name="accessLevel" label="访问级别">
            <Select placeholder="请选择" options={[...IAM_ACCESS_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="maskRule" label="脱敏规则">
            <Input placeholder="请输入脱敏规则" />
          </Form.Item>
          <Form.Item name="permStatus" label="权限状态">
            <Select placeholder="请选择" options={[...IAM_PERM_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
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
