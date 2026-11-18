import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Typography, message } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { mdmSourceService } from '@/services/mdmService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MDM_AUTHORITY_LEVEL_LABEL,
  MDM_AUTHORITY_LEVEL_OPTIONS,
  MDM_SOURCE_STATUS_LABEL,
  MDM_SOURCE_STATUS_OPTIONS,
  MDM_SYNC_DIRECTION_LABEL,
  MDM_SYNC_DIRECTION_OPTIONS,
  type MdmSourceItem,
  type MdmSourceSaveParams,
} from '@/types/mdm';

const { Title } = Typography;

const MANAGE = 'platform:mdm:source:manage';

export default function MdmSourcePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MdmSourceSaveParams>();
  const [data, setData] = useState<MdmSourceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [domainCode, setDomainCode] = useState('');
  const [sourceSystem, setSourceSystem] = useState('');
  const [authorityLevel, setAuthorityLevel] = useState<string | undefined>(undefined);
  const [sourceStatus, setSourceStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      dCode = domainCode,
      sSystem = sourceSystem,
      aLevel = authorityLevel,
      sStatus = sourceStatus,
    ) => {
      setLoading(true);
      try {
        const res = await mdmSourceService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          domainCode: dCode || undefined,
          sourceSystem: sSystem || undefined,
          authorityLevel: aLevel,
          sourceStatus: sStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, domainCode, sourceSystem, authorityLevel, sourceStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ authorityLevel: 'PRIMARY', syncDirection: 'OUT', sourceStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: MdmSourceItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editId == null) {
        await mdmSourceService.create(values);
        message.success('权威源登记已创建');
      } else {
        await mdmSourceService.update(editId, values);
        message.success('权威源登记已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await mdmSourceService.remove(id);
    message.success('权威源登记已删除');
    void loadData();
  };

  const columns: ColumnsType<MdmSourceItem> = [
    { title: '源编号', dataIndex: 'sourceNo', width: 160, fixed: 'left', render: plain },
    { title: '域编码', dataIndex: 'domainCode', width: 140, render: plain },
    { title: '源系统', dataIndex: 'sourceSystem', width: 120, render: plain },
    { title: '源实体', dataIndex: 'sourceEntity', width: 160, render: plain },
    {
      title: '权威级别',
      dataIndex: 'authorityLevel',
      width: 120,
      render: (v) => statusTag(MDM_AUTHORITY_LEVEL_LABEL, v),
    },
    {
      title: '同步方向',
      dataIndex: 'syncDirection',
      width: 120,
      render: (v) => statusTag(MDM_SYNC_DIRECTION_LABEL, v),
    },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '源状态',
      dataIndex: 'sourceStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(MDM_SOURCE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该权威源登记？" onConfirm={() => void remove(record.id)}>
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
        权威源登记
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="域编码">
            <Input
              placeholder="请输入域编码"
              allowClear
              style={{ width: 160 }}
              value={domainCode}
              onChange={(e) => setDomainCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="源系统">
            <Input
              placeholder="如 ERP"
              allowClear
              style={{ width: 140 }}
              value={sourceSystem}
              onChange={(e) => setSourceSystem(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="权威级别">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={authorityLevel}
              onChange={(v) => setAuthorityLevel(v)}
              options={[...MDM_AUTHORITY_LEVEL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="源状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={sourceStatus}
              onChange={(v) => setSourceStatus(v)}
              options={[...MDM_SOURCE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="源编号 / 源实体"
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
                  void loadData(1, pageSize, keyword, domainCode, sourceSystem, authorityLevel, sourceStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDomainCode('');
                  setSourceSystem('');
                  setAuthorityLevel(undefined);
                  setSourceStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建权威源登记</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`权威源登记（共 ${total} 条）`}>
        <Table<MdmSourceItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
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
        title={editId == null ? '新建权威源登记' : '编辑权威源登记'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="sourceNo" label="源编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="domainCode" label="域编码" rules={[{ required: true, message: '请输入域编码' }]}>
            <Input placeholder="请输入域编码" />
          </Form.Item>
          <Form.Item name="sourceSystem" label="源系统" rules={[{ required: true, message: '请输入源系统' }]}>
            <Input placeholder="请输入源系统" />
          </Form.Item>
          <Form.Item name="sourceEntity" label="源实体">
            <Input placeholder="请输入源实体" />
          </Form.Item>
          <Form.Item name="authorityLevel" label="权威级别">
            <Select placeholder="为空默认 PRIMARY" options={[...MDM_AUTHORITY_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="syncDirection" label="同步方向">
            <Select placeholder="为空默认 OUT" options={[...MDM_SYNC_DIRECTION_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourceStatus" label="源状态">
            <Select placeholder="为空默认 ACTIVE" options={[...MDM_SOURCE_STATUS_OPTIONS]} />
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
