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
import { oaUatRecordService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText } from '@/pages/oa/integration/shared';
import {
  OA_UAT_STATUS_LABEL,
  OA_UAT_STATUS_OPTIONS,
  type OaTestQuery,
  type OaUatRecordItem,
  type OaUatRecordSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const UAT_MANAGE = 'oa:test:uat:manage';

export default function OaUatRecordPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaUatRecordSaveParams>();
  const [data, setData] = useState<OaUatRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [dept, setDept] = useState('');
  const [uatStatus, setUatStatus] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OaUatRecordItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      deptValue = dept,
      status = uatStatus,
    ) => {
      setLoading(true);
      try {
        const params: OaTestQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          dept: deptValue || undefined,
          uatStatus: status,
        };
        const res = await oaUatRecordService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, dept, uatStatus],
  );

  const loadStats = useCallback(async () => {
    const res = await oaUatRecordService.stats();
    setStats((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: OaUatRecordItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      uatNo: record.uatNo,
      dept: record.dept,
      sceneName: record.sceneName,
      scenarioRef: record.scenarioRef,
      uatStatus: record.uatStatus,
      ownerDept: record.ownerDept,
      participant: record.participant,
      expected: record.expected,
      actual: record.actual,
      issueCount: record.issueCount,
      blockerCount: record.blockerCount,
      conclusion: record.conclusion,
      uatTime: record.uatTime,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaUatRecordItem) => {
    setDetailOpen(true);
    const res = await oaUatRecordService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaUatRecordSaveParams = { ...values };
      if (editingId !== null) {
        await oaUatRecordService.update(editingId, payload);
        message.success('UAT 记录已更新');
      } else {
        await oaUatRecordService.create(payload);
        message.success('UAT 记录已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const conclude = async (id: number) => {
    await oaUatRecordService.conclude(id, 'PASSED', '验收通过');
    message.success('验收已通过');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaUatRecordService.remove(id);
    message.success('UAT 记录已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaUatRecordItem> = [
    { title: '验收编号', dataIndex: 'uatNo', width: 170, fixed: 'left', render: plain },
    { title: '验收部门', dataIndex: 'dept', width: 130, render: plain },
    { title: '验收场景', dataIndex: 'sceneName', width: 180, render: plain },
    { title: '关联场景编号', dataIndex: 'scenarioRef', width: 150, render: plain },
    {
      title: '验收状态',
      dataIndex: 'uatStatus',
      width: 100,
      render: (v) => enumTag(OA_UAT_STATUS_LABEL, v),
    },
    { title: '责任部门', dataIndex: 'ownerDept', width: 130, render: plain },
    { title: '参与人', dataIndex: 'participant', width: 130, render: plain },
    { title: '预期结果', dataIndex: 'expected', width: 180, ellipsis: true, render: plain },
    { title: '实际结果', dataIndex: 'actual', width: 180, ellipsis: true, render: plain },
    { title: '问题数', dataIndex: 'issueCount', width: 90, render: plain },
    { title: '阻塞问题数', dataIndex: 'blockerCount', width: 110, render: plain },
    { title: '验收结论', dataIndex: 'conclusion', width: 180, ellipsis: true, render: plain },
    { title: '验收时间', dataIndex: 'uatTime', width: 170, render: formatDateTime },
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
          {hasPermission(UAT_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(UAT_MANAGE) && (
            <Button type="link" size="small" onClick={() => void conclude(record.id)}>
              验收通过
            </Button>
          )}
          {hasPermission(UAT_MANAGE) && (
            <Popconfirm title="确认删除该 UAT 记录？" onConfirm={() => void remove(record.id)}>
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
        用户验收（UAT）
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="记录总数" value={Number(stats.total ?? 0)} />
          <Statistic
            title="已通过"
            value={Number(stats.passed ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
          <Statistic
            title="未通过"
            value={Number(stats.failed ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic
            title="验收中"
            value={Number(stats.running ?? 0)}
            valueStyle={{ color: '#096dd9' }}
          />
          <Statistic
            title="待验收"
            value={Number(stats.pending ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic
            title="阻塞问题总数"
            value={Number(stats.blockerTotal ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic title="通过率门槛(%)" value={Number(stats.passRateThreshold ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="关键字">
            <Input
              placeholder="验收编号 / 场景名称"
              allowClear
              style={{ width: 220 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="验收部门">
            <Input
              placeholder="请输入验收部门"
              allowClear
              style={{ width: 160 }}
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="验收状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={uatStatus}
              onChange={(v) => setUatStatus(v)}
              options={[...OA_UAT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, dept, uatStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDept('');
                  setUatStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(UAT_MANAGE) && <Button onClick={openCreate}>新增验收</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`用户验收记录（共 ${total} 条）`}>
        <Table<OaUatRecordItem>
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
        title="UAT 记录详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="验收编号">{plain(detail.uatNo)}</Descriptions.Item>
            <Descriptions.Item label="验收部门">{plain(detail.dept)}</Descriptions.Item>
            <Descriptions.Item label="验收场景">{plain(detail.sceneName)}</Descriptions.Item>
            <Descriptions.Item label="关联场景编号">{plain(detail.scenarioRef)}</Descriptions.Item>
            <Descriptions.Item label="验收状态">
              {enumText(OA_UAT_STATUS_LABEL, detail.uatStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="责任部门">{plain(detail.ownerDept)}</Descriptions.Item>
            <Descriptions.Item label="参与人">{plain(detail.participant)}</Descriptions.Item>
            <Descriptions.Item label="问题数">{plain(detail.issueCount)}</Descriptions.Item>
            <Descriptions.Item label="阻塞问题数">{plain(detail.blockerCount)}</Descriptions.Item>
            <Descriptions.Item label="验收时间">{formatDateTime(detail.uatTime)}</Descriptions.Item>
            <Descriptions.Item label="预期结果" span={2}>
              {plain(detail.expected)}
            </Descriptions.Item>
            <Descriptions.Item label="实际结果" span={2}>
              {plain(detail.actual)}
            </Descriptions.Item>
            <Descriptions.Item label="验收结论" span={2}>
              {plain(detail.conclusion)}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑 UAT 记录' : '新增 UAT 记录'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="uatNo" label="验收编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="dept"
            label="验收部门"
            rules={[{ required: true, message: '请输入验收部门' }]}
          >
            <Input placeholder="请输入验收部门" />
          </Form.Item>
          <Form.Item
            name="sceneName"
            label="验收场景"
            rules={[{ required: true, message: '请输入验收场景名称' }]}
          >
            <Input placeholder="请输入验收场景名称" />
          </Form.Item>
          <Form.Item name="scenarioRef" label="关联场景编号">
            <Input placeholder="请输入关联场景编号" />
          </Form.Item>
          <Form.Item name="uatStatus" label="验收状态">
            <Select placeholder="请选择" options={[...OA_UAT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ownerDept" label="责任部门">
            <Input placeholder="请输入责任部门" />
          </Form.Item>
          <Form.Item name="participant" label="参与人">
            <Input placeholder="请输入参与人" />
          </Form.Item>
          <Form.Item name="expected" label="预期结果">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="actual" label="实际结果">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="issueCount" label="问题数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="blockerCount" label="阻塞问题数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="conclusion" label="验收结论">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="uatTime" label="验收时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
