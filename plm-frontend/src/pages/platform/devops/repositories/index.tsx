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
import { devopsRepositoryService } from '@/services/devopsService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  DEVOPS_BRANCH_STRATEGY_LABEL,
  DEVOPS_BRANCH_STRATEGY_OPTIONS,
  DEVOPS_DOMAIN_LABEL,
  DEVOPS_DOMAIN_OPTIONS,
  DEVOPS_REPO_STATUS_LABEL,
  DEVOPS_REPO_STATUS_OPTIONS,
  DEVOPS_REPO_TYPE_LABEL,
  DEVOPS_REPO_TYPE_OPTIONS,
  type DevopsRepositoryItem,
  type DevopsRepositorySaveParams,
} from '@/types/devops';

const { Title } = Typography;

const MANAGE = 'platform:devops:repository:manage';

export default function DevopsRepositoryPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DevopsRepositorySaveParams>();
  const [data, setData] = useState<DevopsRepositoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [repoType, setRepoType] = useState<string | undefined>(undefined);
  const [branchStrategy, setBranchStrategy] = useState<string | undefined>(undefined);
  const [systemDomain, setSystemDomain] = useState<string | undefined>(undefined);
  const [repoStatus, setRepoStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      rType = repoType,
      bStrategy = branchStrategy,
      sDomain = systemDomain,
      rStatus = repoStatus,
    ) => {
      setLoading(true);
      try {
        const res = await devopsRepositoryService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          repoType: rType,
          branchStrategy: bStrategy,
          systemDomain: sDomain,
          repoStatus: rStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, repoType, branchStrategy, systemDomain, repoStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ repoType: 'GIT', branchStrategy: 'GITFLOW', repoStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: DevopsRepositoryItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: DevopsRepositorySaveParams = { ...values };
      if (editId == null) {
        await devopsRepositoryService.create(payload);
        message.success('代码仓库已创建');
      } else {
        await devopsRepositoryService.update(editId, payload);
        message.success('代码仓库已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await devopsRepositoryService.remove(id);
    message.success('代码仓库已删除');
    void loadData();
  };

  const columns: ColumnsType<DevopsRepositoryItem> = [
    { title: '仓库编号', dataIndex: 'repoNo', width: 160, fixed: 'left', render: plain },
    { title: '仓库编码', dataIndex: 'repoCode', width: 150, render: plain },
    { title: '仓库名称', dataIndex: 'repoName', width: 200, render: plain },
    { title: '仓库类型', dataIndex: 'repoType', width: 100, render: (v) => statusTag(DEVOPS_REPO_TYPE_LABEL, v) },
    { title: '仓库地址', dataIndex: 'repoUrl', width: 240, ellipsis: true, render: plain },
    {
      title: '分支策略',
      dataIndex: 'branchStrategy',
      width: 120,
      render: (v) => statusTag(DEVOPS_BRANCH_STRATEGY_LABEL, v),
    },
    { title: '系统域', dataIndex: 'systemDomain', width: 110, render: (v) => statusTag(DEVOPS_DOMAIN_LABEL, v) },
    { title: '负责人', dataIndex: 'ownerName', width: 120, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'repoStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(DEVOPS_REPO_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该代码仓库？" onConfirm={() => void remove(record.id)}>
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
        代码仓库
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="仓库类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 110 }}
              value={repoType}
              onChange={(v) => setRepoType(v)}
              options={[...DEVOPS_REPO_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="分支策略">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={branchStrategy}
              onChange={(v) => setBranchStrategy(v)}
              options={[...DEVOPS_BRANCH_STRATEGY_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="系统域">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={systemDomain}
              onChange={(v) => setSystemDomain(v)}
              options={[...DEVOPS_DOMAIN_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="仓库状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={repoStatus}
              onChange={(v) => setRepoStatus(v)}
              options={[...DEVOPS_REPO_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="仓库编号 / 编码 / 名称 / 地址"
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
                  void loadData(1, pageSize, keyword, repoType, branchStrategy, systemDomain, repoStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRepoType(undefined);
                  setBranchStrategy(undefined);
                  setSystemDomain(undefined);
                  setRepoStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建代码仓库</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`代码仓库（共 ${total} 条）`}>
        <Table<DevopsRepositoryItem>
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
        title={editId == null ? '新建代码仓库' : '编辑代码仓库'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="repoNo" label="仓库编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="repoCode" label="仓库编码" rules={[{ required: true, message: '请输入仓库编码' }]}>
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="repoName" label="仓库名称" rules={[{ required: true, message: '请输入仓库名称' }]}>
            <Input placeholder="请输入仓库名称" />
          </Form.Item>
          <Form.Item name="repoType" label="仓库类型">
            <Select placeholder="请选择" options={[...DEVOPS_REPO_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="repoUrl" label="仓库地址">
            <Input placeholder="请输入仓库地址" />
          </Form.Item>
          <Form.Item name="branchStrategy" label="分支策略">
            <Select placeholder="请选择" options={[...DEVOPS_BRANCH_STRATEGY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="systemDomain" label="所属系统域">
            <Select placeholder="请选择" options={[...DEVOPS_DOMAIN_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ownerName" label="负责人">
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item name="repoStatus" label="仓库状态">
            <Select placeholder="请选择" options={[...DEVOPS_REPO_STATUS_OPTIONS]} />
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
