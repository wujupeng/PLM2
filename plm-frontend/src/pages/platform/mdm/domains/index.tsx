import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Typography, message } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { mdmDomainService } from '@/services/mdmService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MDM_AUTHORITY_SYSTEM_LABEL,
  MDM_AUTHORITY_SYSTEM_OPTIONS,
  MDM_DOMAIN_STATUS_LABEL,
  MDM_DOMAIN_STATUS_OPTIONS,
  MDM_MASTER_TYPE_LABEL,
  MDM_MASTER_TYPE_OPTIONS,
  MDM_SYNC_MODE_LABEL,
  MDM_SYNC_MODE_OPTIONS,
  type MdmDomainItem,
  type MdmDomainSaveParams,
} from '@/types/mdm';

const { Title } = Typography;

const MANAGE = 'platform:mdm:domain:manage';

export default function MdmDomainPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MdmDomainSaveParams>();
  const [data, setData] = useState<MdmDomainItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [masterType, setMasterType] = useState<string | undefined>(undefined);
  const [domainStatus, setDomainStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      mType = masterType,
      dStatus = domainStatus,
    ) => {
      setLoading(true);
      try {
        const res = await mdmDomainService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          masterType: mType,
          domainStatus: dStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, masterType, domainStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ masterType: 'MATERIAL', authoritySystem: 'PLM', syncMode: 'PUSH', domainStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: MdmDomainItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editId == null) {
        await mdmDomainService.create(values);
        message.success('主数据域已创建');
      } else {
        await mdmDomainService.update(editId, values);
        message.success('主数据域已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await mdmDomainService.remove(id);
    message.success('主数据域已删除');
    void loadData();
  };

  const columns: ColumnsType<MdmDomainItem> = [
    { title: '域编号', dataIndex: 'domainNo', width: 160, fixed: 'left', render: plain },
    { title: '域编码', dataIndex: 'domainCode', width: 140, render: plain },
    { title: '域名称', dataIndex: 'domainName', width: 200, render: plain },
    {
      title: '主数据类型',
      dataIndex: 'masterType',
      width: 120,
      render: (v) => statusTag(MDM_MASTER_TYPE_LABEL, v),
    },
    {
      title: '权威源系统',
      dataIndex: 'authoritySystem',
      width: 120,
      render: (v) => statusTag(MDM_AUTHORITY_SYSTEM_LABEL, v),
    },
    { title: '责任部门', dataIndex: 'ownerDept', width: 140, render: plain },
    { title: '同步方式', dataIndex: 'syncMode', width: 110, render: (v) => statusTag(MDM_SYNC_MODE_LABEL, v) },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '域状态',
      dataIndex: 'domainStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(MDM_DOMAIN_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该主数据域？" onConfirm={() => void remove(record.id)}>
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
        主数据域
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="主数据类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={masterType}
              onChange={(v) => setMasterType(v)}
              options={[...MDM_MASTER_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="域状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={domainStatus}
              onChange={(v) => setDomainStatus(v)}
              options={[...MDM_DOMAIN_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="域编号 / 编码 / 名称"
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
                  void loadData(1, pageSize, keyword, masterType, domainStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setMasterType(undefined);
                  setDomainStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建主数据域</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`主数据域（共 ${total} 条）`}>
        <Table<MdmDomainItem>
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
        title={editId == null ? '新建主数据域' : '编辑主数据域'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="domainNo" label="域编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="domainCode" label="域编码" rules={[{ required: true, message: '请输入域编码' }]}>
            <Input placeholder="请输入域编码" />
          </Form.Item>
          <Form.Item name="domainName" label="域名称" rules={[{ required: true, message: '请输入域名称' }]}>
            <Input placeholder="请输入域名称" />
          </Form.Item>
          <Form.Item name="masterType" label="主数据类型">
            <Select placeholder="为空默认 MATERIAL" options={[...MDM_MASTER_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="authoritySystem" label="权威源系统">
            <Select placeholder="为空默认 PLM" options={[...MDM_AUTHORITY_SYSTEM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ownerDept" label="责任部门">
            <Input placeholder="请输入责任部门" />
          </Form.Item>
          <Form.Item name="syncMode" label="同步方式">
            <Select placeholder="为空默认 PUSH" options={[...MDM_SYNC_MODE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="domainStatus" label="域状态">
            <Select placeholder="为空默认 ACTIVE" options={[...MDM_DOMAIN_STATUS_OPTIONS]} />
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
