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
  Space,
  Statistic,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { docStateLogService } from '@/services/docStateService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import {
  type DocStateLogItem,
  type DocStateLogSaveParams,
  type DocStateLogStats,
} from '@/types/docstate';

const { Title } = Typography;

const DOC_STATE_LOG_MANAGE = 'platform:docstate:statelog:manage';

export default function DocStateLogPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DocStateLogSaveParams>();
  const [data, setData] = useState<DocStateLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [docType, setDocType] = useState('');
  const [docNo, setDocNo] = useState('');
  const [toState, setToState] = useState('');
  const [actionCode, setActionCode] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<DocStateLogStats>({});

  const loadStats = useCallback(async () => {
    const res = await docStateLogService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      dType = docType,
      dNo = docNo,
      tState = toState,
      aCode = actionCode,
      opName = operatorName,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await docStateLogService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          docType: dType || undefined,
          docNo: dNo || undefined,
          toState: tState || undefined,
          actionCode: aCode || undefined,
          operatorName: opName || undefined,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, docType, docNo, toState, actionCode, operatorName, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', '', '', '', null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: DocStateLogItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: DocStateLogSaveParams = { ...values };
      if (editId == null) {
        await docStateLogService.create(payload);
        message.success('单据状态日志已创建');
      } else {
        await docStateLogService.update(editId, payload);
        message.success('单据状态日志已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await docStateLogService.remove(id);
    message.success('单据状态日志已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<DocStateLogItem> = [
    { title: '日志编号', dataIndex: 'logNo', width: 170, fixed: 'left', render: plain },
    { title: '单据类型', dataIndex: 'docType', width: 140, render: plain },
    { title: '单据号', dataIndex: 'docNo', width: 160, render: plain },
    { title: '单据标题', dataIndex: 'bizTitle', width: 180, ellipsis: true, render: plain },
    { title: '变更前状态', dataIndex: 'fromState', width: 120, render: plain },
    { title: '变更后状态', dataIndex: 'toState', width: 120, render: plain },
    { title: '动作编码', dataIndex: 'actionCode', width: 140, render: plain },
    { title: '动作名称', dataIndex: 'actionName', width: 160, render: plain },
    { title: '变更原因', dataIndex: 'reason', width: 180, ellipsis: true, render: plain },
    { title: '操作人', dataIndex: 'operatorName', width: 120, render: plain },
    { title: '操作时间', dataIndex: 'operateTime', width: 160, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(DOC_STATE_LOG_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该单据状态日志？" onConfirm={() => void remove(record.id)}>
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
        单据状态日志
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="日志总数" value={Number(stats.total ?? 0)} />
          <Statistic title="涉及单据类型" value={Number(stats.docTypeCount ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="单据类型">
            <Input
              placeholder="请输入单据类型"
              allowClear
              style={{ width: 160 }}
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="单据号">
            <Input
              placeholder="请输入单据号"
              allowClear
              style={{ width: 160 }}
              value={docNo}
              onChange={(e) => setDocNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="变更后状态">
            <Input
              placeholder="请输入变更后状态"
              allowClear
              style={{ width: 140 }}
              value={toState}
              onChange={(e) => setToState(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="动作编码">
            <Input
              placeholder="请输入动作编码"
              allowClear
              style={{ width: 140 }}
              value={actionCode}
              onChange={(e) => setActionCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="操作人">
            <Input
              placeholder="请输入操作人姓名"
              allowClear
              style={{ width: 140 }}
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="操作日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="单据号 / 标题"
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
                  void loadData(1, pageSize, keyword, docType, docNo, toState, actionCode, operatorName, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDocType('');
                  setDocNo('');
                  setToState('');
                  setActionCode('');
                  setOperatorName('');
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', '', '', '', null);
                }}
              >
                重置
              </Button>
              {hasPermission(DOC_STATE_LOG_MANAGE) && <Button onClick={openCreate}>新建日志</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`单据状态日志（共 ${total} 条）`}>
        <Table<DocStateLogItem>
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
        title={editId == null ? '新建日志' : '编辑日志'}
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
          <Form.Item name="docType" label="单据类型" rules={[{ required: true, message: '请输入单据类型' }]}>
            <Input placeholder="请输入单据类型" />
          </Form.Item>
          <Form.Item name="docNo" label="单据号" rules={[{ required: true, message: '请输入单据号' }]}>
            <Input placeholder="请输入单据号" />
          </Form.Item>
          <Form.Item name="bizTitle" label="单据标题">
            <Input placeholder="请输入单据标题" />
          </Form.Item>
          <Form.Item name="fromState" label="变更前状态">
            <Input placeholder="请输入变更前状态编码" />
          </Form.Item>
          <Form.Item name="toState" label="变更后状态" rules={[{ required: true, message: '请输入变更后状态' }]}>
            <Input placeholder="请输入变更后状态编码" />
          </Form.Item>
          <Form.Item name="actionCode" label="动作编码">
            <Input placeholder="请输入动作编码" />
          </Form.Item>
          <Form.Item name="actionName" label="动作名称">
            <Input placeholder="请输入动作名称" />
          </Form.Item>
          <Form.Item name="reason" label="变更原因">
            <Input.TextArea rows={2} placeholder="请输入变更原因" />
          </Form.Item>
          <Form.Item name="operatorId" label="操作人ID">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="留空取当前登录用户" />
          </Form.Item>
          <Form.Item name="operatorName" label="操作人姓名">
            <Input placeholder="留空取当前登录用户" />
          </Form.Item>
          <Form.Item name="operateTime" label="操作时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss，留空取当前时间" />
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
