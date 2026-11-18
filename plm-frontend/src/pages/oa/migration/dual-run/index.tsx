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
import { oaMigrationReconcileService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag } from '@/pages/oa/integration/shared';
import {
  OA_MIGRATION_DUAL_RESULT_LABEL,
  OA_MIGRATION_DUAL_RESULT_OPTIONS,
  type OaMigrationDualRunItem,
  type OaMigrationDualRunSaveParams,
  type OaMigrationQuery,
} from '@/types/oa';

const { Title } = Typography;

const DUAL_MANAGE = 'oa:migration:dual:manage';

interface DualRunFormValues {
  dualNo?: string;
  processCode?: string;
  processName?: string;
  bizKey?: string;
  newInstanceId?: number;
  oldInstanceNo?: string;
  compareResult?: string;
  approverDiff?: string;
  pathDiff?: string;
  fieldDiff?: string;
  notifyDiff?: string;
  resultDiff?: string;
  conclusion?: string;
  runTime?: string;
  remark?: string;
}

export default function OaMigrationDualRunPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DualRunFormValues>();
  const [data, setData] = useState<OaMigrationDualRunItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [compareResult, setCompareResult] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [summary, setSummary] = useState<Record<string, unknown>>({});
  const [detail, setDetail] = useState<OaMigrationDualRunItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, result = compareResult, kw = keyword) => {
      setLoading(true);
      try {
        const params: OaMigrationQuery = {
          pageNum: page,
          pageSize: size,
          compareResult: result,
          keyword: kw || undefined,
        };
        const res = await oaMigrationReconcileService.pageDualRuns(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, compareResult, keyword],
  );

  const loadSummary = useCallback(async () => {
    const res = await oaMigrationReconcileService.dualRunSummary();
    setSummary((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, undefined, '');
    void loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ compareResult: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: OaMigrationDualRunItem) => {
    setEditId(record.id);
    form.resetFields();
    form.setFieldsValue({
      dualNo: record.dualNo,
      processCode: record.processCode,
      processName: record.processName,
      bizKey: record.bizKey,
      newInstanceId: record.newInstanceId,
      oldInstanceNo: record.oldInstanceNo,
      compareResult: record.compareResult,
      approverDiff: record.approverDiff,
      pathDiff: record.pathDiff,
      fieldDiff: record.fieldDiff,
      notifyDiff: record.notifyDiff,
      resultDiff: record.resultDiff,
      conclusion: record.conclusion,
      runTime: record.runTime,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaMigrationDualRunItem) => {
    setDetailOpen(true);
    const res = await oaMigrationReconcileService.dualRunDetail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaMigrationDualRunSaveParams = { ...values };
      if (editId == null) {
        await oaMigrationReconcileService.createDualRun(payload);
        message.success('双跑对照已创建');
      } else {
        await oaMigrationReconcileService.updateDualRun(editId, payload);
        message.success('双跑对照已更新');
      }
      setOpen(false);
      void loadData();
      void loadSummary();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaMigrationReconcileService.removeDualRun(id);
    message.success('双跑对照已删除');
    void loadData();
    void loadSummary();
  };

  const compare = async (record: OaMigrationDualRunItem) => {
    await oaMigrationReconcileService.compareDualRun(record.id);
    message.success('已重新比对');
    void loadData();
    void loadSummary();
  };

  const columns: ColumnsType<OaMigrationDualRunItem> = [
    { title: '对照编号', dataIndex: 'dualNo', width: 170, fixed: 'left', render: plain },
    { title: '流程编码', dataIndex: 'processCode', width: 130, render: plain },
    { title: '流程名称', dataIndex: 'processName', width: 160, render: plain },
    { title: '业务标识', dataIndex: 'bizKey', width: 150, render: plain },
    { title: '新实例ID', dataIndex: 'newInstanceId', width: 110, render: plain },
    { title: '旧单号', dataIndex: 'oldInstanceNo', width: 150, render: plain },
    {
      title: '对照结果',
      dataIndex: 'compareResult',
      width: 110,
      render: (v) => enumTag(OA_MIGRATION_DUAL_RESULT_LABEL, v),
    },
    { title: '审批人差异', dataIndex: 'approverDiff', width: 160, ellipsis: true, render: plain },
    { title: '路径差异', dataIndex: 'pathDiff', width: 160, ellipsis: true, render: plain },
    { title: '字段差异', dataIndex: 'fieldDiff', width: 160, ellipsis: true, render: plain },
    { title: '通知差异', dataIndex: 'notifyDiff', width: 160, ellipsis: true, render: plain },
    { title: '结果差异', dataIndex: 'resultDiff', width: 160, ellipsis: true, render: plain },
    { title: '结论', dataIndex: 'conclusion', width: 160, ellipsis: true, render: plain },
    { title: '运行时间', dataIndex: 'runTime', width: 160, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 230,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(DUAL_MANAGE) && (
            <Button type="link" size="small" onClick={() => void compare(record)}>
              重新比对
            </Button>
          )}
          {hasPermission(DUAL_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(DUAL_MANAGE) && (
            <Popconfirm title="确认删除该对照记录？" onConfirm={() => void remove(record.id)}>
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
        新旧流程双跑对照
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="对照总数" value={Number(summary.total ?? 0)} />
          <Statistic
            title="待对照"
            value={Number(summary.pending ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic
            title="一致"
            value={Number(summary.matched ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
          <Statistic
            title="存在差异"
            value={Number(summary.diff ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic
            title="双跑开关"
            value={Number(summary.dualRunEnabled ?? 0) === 1 ? '已开启' : '已关闭'}
          />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="对照结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={compareResult}
              onChange={(v) => setCompareResult(v)}
              options={[...OA_MIGRATION_DUAL_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="对照编号 / 流程 / 业务标识 / 旧单号"
              allowClear
              style={{ width: 260 }}
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
                  void loadData(1, pageSize, compareResult, keyword);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setCompareResult(undefined);
                  setKeyword('');
                  setPageNum(1);
                  void loadData(1, pageSize, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(DUAL_MANAGE) && <Button onClick={openCreate}>新建对照</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`双跑对照（共 ${total} 条）`}>
        <Table<OaMigrationDualRunItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2300 }}
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
        title="双跑对照详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="对照编号">{plain(detail.dualNo)}</Descriptions.Item>
            <Descriptions.Item label="流程编码">{plain(detail.processCode)}</Descriptions.Item>
            <Descriptions.Item label="流程名称">{plain(detail.processName)}</Descriptions.Item>
            <Descriptions.Item label="业务标识">{plain(detail.bizKey)}</Descriptions.Item>
            <Descriptions.Item label="新实例ID">{plain(detail.newInstanceId)}</Descriptions.Item>
            <Descriptions.Item label="旧单号">{plain(detail.oldInstanceNo)}</Descriptions.Item>
            <Descriptions.Item label="对照结果">
              {enumTag(OA_MIGRATION_DUAL_RESULT_LABEL, detail.compareResult)}
            </Descriptions.Item>
            <Descriptions.Item label="运行时间">{formatDateTime(detail.runTime)}</Descriptions.Item>
            <Descriptions.Item label="审批人差异" span={2}>
              {plain(detail.approverDiff)}
            </Descriptions.Item>
            <Descriptions.Item label="路径差异" span={2}>
              {plain(detail.pathDiff)}
            </Descriptions.Item>
            <Descriptions.Item label="字段差异" span={2}>
              {plain(detail.fieldDiff)}
            </Descriptions.Item>
            <Descriptions.Item label="通知差异" span={2}>
              {plain(detail.notifyDiff)}
            </Descriptions.Item>
            <Descriptions.Item label="结果差异" span={2}>
              {plain(detail.resultDiff)}
            </Descriptions.Item>
            <Descriptions.Item label="结论" span={2}>
              {plain(detail.conclusion)}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editId == null ? '新建双跑对照' : '编辑双跑对照'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="dualNo" label="对照编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="processCode" label="流程编码">
            <Input placeholder="流程编码" />
          </Form.Item>
          <Form.Item
            name="processName"
            label="流程名称"
            rules={[{ required: true, message: '请输入流程名称' }]}
          >
            <Input placeholder="流程名称" />
          </Form.Item>
          <Form.Item name="bizKey" label="业务标识">
            <Input placeholder="业务标识" />
          </Form.Item>
          <Form.Item name="newInstanceId" label="新实例ID">
            <InputNumber style={{ width: '100%' }} placeholder="新实例ID" />
          </Form.Item>
          <Form.Item name="oldInstanceNo" label="旧单号">
            <Input placeholder="旧单号" />
          </Form.Item>
          <Form.Item name="compareResult" label="对照结果">
            <Select placeholder="请选择" options={[...OA_MIGRATION_DUAL_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="approverDiff" label="审批人差异">
            <Input.TextArea rows={2} placeholder="审批人差异" />
          </Form.Item>
          <Form.Item name="pathDiff" label="路径差异">
            <Input.TextArea rows={2} placeholder="路径差异" />
          </Form.Item>
          <Form.Item name="fieldDiff" label="字段差异">
            <Input.TextArea rows={2} placeholder="字段差异" />
          </Form.Item>
          <Form.Item name="notifyDiff" label="通知差异">
            <Input.TextArea rows={2} placeholder="通知差异" />
          </Form.Item>
          <Form.Item name="resultDiff" label="结果差异">
            <Input.TextArea rows={2} placeholder="结果差异" />
          </Form.Item>
          <Form.Item name="conclusion" label="对照结论">
            <Input.TextArea rows={2} placeholder="对照结论" />
          </Form.Item>
          <Form.Item name="runTime" label="运行时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss，留空取当前时间" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
