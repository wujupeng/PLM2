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
import { govRiskService } from '@/services/governanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  GOV_RISK_LEVEL_LABEL,
  GOV_RISK_LEVEL_OPTIONS,
  GOV_RISK_STATUS_LABEL,
  GOV_RISK_STATUS_OPTIONS,
  GOV_RISK_TYPE_LABEL,
  GOV_RISK_TYPE_OPTIONS,
  type GovRiskItem,
  type GovRiskSaveParams,
} from '@/types/governance';

const { Title } = Typography;

const MANAGE = 'platform:gov:risk:manage';

export default function GovRiskPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<GovRiskSaveParams>();
  const [data, setData] = useState<GovRiskItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [riskType, setRiskType] = useState<string | undefined>(undefined);
  const [riskStatus, setRiskStatus] = useState<string | undefined>(undefined);
  const [riskLevel, setRiskLevel] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      pCode = projectCode,
      rType = riskType,
      rStatus = riskStatus,
      rLevel = riskLevel,
    ) => {
      setLoading(true);
      try {
        const res = await govRiskService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          projectCode: pCode || undefined,
          riskType: rType,
          riskStatus: rStatus,
          riskLevel: rLevel,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, projectCode, riskType, riskStatus, riskLevel],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ riskType: 'RISK', riskLevel: 'MEDIUM', riskStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: GovRiskItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: GovRiskSaveParams = { ...values };
      if (editId == null) {
        await govRiskService.create(payload);
        message.success('风险已创建');
      } else {
        await govRiskService.update(editId, payload);
        message.success('风险已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await govRiskService.remove(id);
    message.success('风险已删除');
    void loadData();
  };

  const columns: ColumnsType<GovRiskItem> = [
    { title: '风险编号', dataIndex: 'riskNo', width: 160, fixed: 'left', render: plain },
    { title: '所属项目编码', dataIndex: 'projectCode', width: 150, render: plain },
    { title: '风险标题', dataIndex: 'riskTitle', width: 220, render: plain },
    { title: '风险类型', dataIndex: 'riskType', width: 100, render: (v) => statusTag(GOV_RISK_TYPE_LABEL, v) },
    { title: '风险等级', dataIndex: 'riskLevel', width: 100, render: (v) => statusTag(GOV_RISK_LEVEL_LABEL, v) },
    { title: '发生概率', dataIndex: 'probability', width: 100, render: plain },
    { title: '影响程度', dataIndex: 'impact', width: 100, render: plain },
    { title: '缓解措施', dataIndex: 'mitigation', width: 200, ellipsis: true, render: plain },
    { title: '负责人', dataIndex: 'ownerName', width: 120, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'riskStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(GOV_RISK_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该风险？" onConfirm={() => void remove(record.id)}>
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
        风险与问题
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="所属项目编码">
            <Input
              placeholder="请输入项目编码"
              allowClear
              style={{ width: 180 }}
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="风险类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={riskType}
              onChange={(v) => setRiskType(v)}
              options={[...GOV_RISK_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="风险等级">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={riskLevel}
              onChange={(v) => setRiskLevel(v)}
              options={[...GOV_RISK_LEVEL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="风险状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={riskStatus}
              onChange={(v) => setRiskStatus(v)}
              options={[...GOV_RISK_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="风险编号 / 标题"
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
                  void loadData(1, pageSize, keyword, projectCode, riskType, riskStatus, riskLevel);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setProjectCode('');
                  setRiskType(undefined);
                  setRiskStatus(undefined);
                  setRiskLevel(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建风险</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`风险与问题（共 ${total} 条）`}>
        <Table<GovRiskItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1900 }}
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
        title={editId == null ? '新建风险' : '编辑风险'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="riskNo" label="风险编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="projectCode"
            label="所属项目编码"
            rules={[{ required: true, message: '请输入所属项目编码' }]}
          >
            <Input placeholder="请输入所属项目编码" />
          </Form.Item>
          <Form.Item name="riskTitle" label="风险标题" rules={[{ required: true, message: '请输入风险标题' }]}>
            <Input placeholder="请输入风险标题" />
          </Form.Item>
          <Form.Item name="riskType" label="风险类型">
            <Select placeholder="请选择" options={[...GOV_RISK_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="riskLevel" label="风险等级">
            <Select placeholder="请选择" options={[...GOV_RISK_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="probability" label="发生概率">
            <Input placeholder="请输入发生概率" />
          </Form.Item>
          <Form.Item name="impact" label="影响程度">
            <Input placeholder="请输入影响程度" />
          </Form.Item>
          <Form.Item name="mitigation" label="缓解措施">
            <Input.TextArea rows={2} placeholder="请输入缓解措施" />
          </Form.Item>
          <Form.Item name="riskStatus" label="风险状态">
            <Select placeholder="请选择" options={[...GOV_RISK_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ownerName" label="负责人">
            <Input placeholder="请输入负责人" />
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
