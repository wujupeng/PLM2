import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
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
import { oaTrainingMaterialService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enableTag, enumText } from '@/pages/oa/integration/shared';
import {
  OA_ENABLE_STATUS_OPTIONS,
  OA_TRAINING_MATERIAL_TYPE_LABEL,
  OA_TRAINING_MATERIAL_TYPE_OPTIONS,
  type OaTestQuery,
  type OaTrainingMaterialItem,
  type OaTrainingMaterialSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const TRAINING_MANAGE = 'oa:test:training:manage';

export default function OaTrainingMaterialPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaTrainingMaterialSaveParams>();
  const [data, setData] = useState<OaTrainingMaterialItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [materialType, setMaterialType] = useState<string | undefined>(undefined);
  const [targetRole, setTargetRole] = useState('');
  const [status, setStatus] = useState<number | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OaTrainingMaterialItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = materialType,
      role = targetRole,
      statusValue = status,
    ) => {
      setLoading(true);
      try {
        const params: OaTestQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          materialType: type,
          targetRole: role || undefined,
          status: statusValue,
        };
        const res = await oaTrainingMaterialService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, materialType, targetRole, status],
  );

  const loadStats = useCallback(async () => {
    const res = await oaTrainingMaterialService.stats();
    setStats((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '', undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ status: 1 });
    setOpen(true);
  };

  const openEdit = (record: OaTrainingMaterialItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      materialNo: record.materialNo,
      materialName: record.materialName,
      materialType: record.materialType,
      targetRole: record.targetRole,
      format: record.format,
      location: record.location,
      materialVersion: record.materialVersion,
      publishTime: record.publishTime,
      audienceCount: record.audienceCount,
      signedCount: record.signedCount,
      status: record.status,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaTrainingMaterialItem) => {
    setDetailOpen(true);
    const res = await oaTrainingMaterialService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaTrainingMaterialSaveParams = { ...values };
      if (editingId !== null) {
        await oaTrainingMaterialService.update(editingId, payload);
        message.success('培训材料已更新');
      } else {
        await oaTrainingMaterialService.create(payload);
        message.success('培训材料已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const sign = async (id: number) => {
    await oaTrainingMaterialService.sign(id);
    message.success('签到已登记');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaTrainingMaterialService.remove(id);
    message.success('培训材料已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaTrainingMaterialItem> = [
    { title: '材料编号', dataIndex: 'materialNo', width: 170, fixed: 'left', render: plain },
    { title: '材料名称', dataIndex: 'materialName', width: 200, render: plain },
    {
      title: '材料类型',
      dataIndex: 'materialType',
      width: 120,
      render: (v) => enumText(OA_TRAINING_MATERIAL_TYPE_LABEL, v),
    },
    { title: '目标角色', dataIndex: 'targetRole', width: 140, render: plain },
    { title: '材料格式', dataIndex: 'format', width: 110, render: plain },
    { title: '存放位置', dataIndex: 'location', width: 180, ellipsis: true, render: plain },
    { title: '材料版本', dataIndex: 'materialVersion', width: 110, render: plain },
    { title: '发布时间', dataIndex: 'publishTime', width: 170, render: formatDateTime },
    { title: '应到人数', dataIndex: 'audienceCount', width: 100, render: plain },
    { title: '已签到', dataIndex: 'signedCount', width: 100, render: plain },
    { title: '状态', dataIndex: 'status', width: 90, render: enableTag },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(TRAINING_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(TRAINING_MANAGE) && (
            <Button type="link" size="small" onClick={() => void sign(record.id)}>
              签到 +1
            </Button>
          )}
          {hasPermission(TRAINING_MANAGE) && (
            <Popconfirm title="确认删除该培训材料？" onConfirm={() => void remove(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        培训交付材料
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="材料总数" value={Number(stats.total ?? 0)} />
          <Statistic title="角色培训" value={Number(stats.roleTraining ?? 0)} />
          <Statistic title="操作手册" value={Number(stats.manual ?? 0)} />
          <Statistic title="视频教程" value={Number(stats.video ?? 0)} />
          <Statistic title="常见问题" value={Number(stats.faq ?? 0)} />
          <Statistic title="应到总人数" value={Number(stats.audienceTotal ?? 0)} />
          <Statistic
            title="已签到总人数"
            value={Number(stats.signedTotal ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="关键字">
            <Input
              placeholder="材料编号 / 名称"
              allowClear
              style={{ width: 220 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="材料类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={materialType}
              onChange={(v) => setMaterialType(v)}
              options={[...OA_TRAINING_MATERIAL_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="目标角色">
            <Input
              placeholder="请输入目标角色"
              allowClear
              style={{ width: 160 }}
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 110 }}
              value={status}
              onChange={(v) => setStatus(v)}
              options={[...OA_ENABLE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, materialType, targetRole, status);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setMaterialType(undefined);
                  setTargetRole('');
                  setStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(TRAINING_MANAGE) && <Button onClick={openCreate}>新增材料</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`培训交付材料（共 ${total} 条）`}>
        <Table<OaTrainingMaterialItem>
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
        title="培训材料详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="材料编号">{plain(detail.materialNo)}</Descriptions.Item>
            <Descriptions.Item label="材料名称">{plain(detail.materialName)}</Descriptions.Item>
            <Descriptions.Item label="材料类型">
              {enumText(OA_TRAINING_MATERIAL_TYPE_LABEL, detail.materialType)}
            </Descriptions.Item>
            <Descriptions.Item label="目标角色">{plain(detail.targetRole)}</Descriptions.Item>
            <Descriptions.Item label="材料格式">{plain(detail.format)}</Descriptions.Item>
            <Descriptions.Item label="材料版本">{plain(detail.materialVersion)}</Descriptions.Item>
            <Descriptions.Item label="存放位置" span={2}>
              {plain(detail.location)}
            </Descriptions.Item>
            <Descriptions.Item label="发布时间">
              {formatDateTime(detail.publishTime)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">{enableTag(detail.status)}</Descriptions.Item>
            <Descriptions.Item label="应到人数">{plain(detail.audienceCount)}</Descriptions.Item>
            <Descriptions.Item label="已签到">{plain(detail.signedCount)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑培训材料' : '新增培训材料'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="materialNo" label="材料编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="materialName"
            label="材料名称"
            rules={[{ required: true, message: '请输入材料名称' }]}
          >
            <Input placeholder="请输入材料名称" />
          </Form.Item>
          <Form.Item name="materialType" label="材料类型">
            <Select placeholder="请选择" options={[...OA_TRAINING_MATERIAL_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="targetRole" label="目标角色">
            <Input placeholder="请输入目标角色" />
          </Form.Item>
          <Form.Item name="format" label="材料格式">
            <Input placeholder="如 PDF / MP4 / 在线文档" />
          </Form.Item>
          <Form.Item name="location" label="存放位置">
            <Input placeholder="存放路径 / 链接" />
          </Form.Item>
          <Form.Item name="materialVersion" label="材料版本">
            <Input placeholder="如 V1.0" />
          </Form.Item>
          <Form.Item name="publishTime" label="发布时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="audienceCount" label="应到人数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="signedCount" label="已签到">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={[...OA_ENABLE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
