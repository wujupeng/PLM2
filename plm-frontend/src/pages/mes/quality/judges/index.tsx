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
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { mesInspectionJudgeService as service } from '@/services/mesQualityService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_INSPECTION_JUDGE_RESULT_LABEL,
  MES_INSPECTION_JUDGE_RESULT_OPTIONS,
  MES_INSPECTION_JUDGE_STATUS_LABEL,
  MES_INSPECTION_JUDGE_STATUS_OPTIONS,
  MES_INSPECTION_SPEC_TYPE_LABEL,
  MES_INSPECTION_SPEC_TYPE_OPTIONS,
  type MesInspectionJudge,
  type MesInspectionJudgeQuery,
  type MesInspectionJudgeSaveRequest,
} from '@/types/mesQuality';

const { Title } = Typography;

const MANAGE = 'mes:quality:judge:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesInspectionJudgeSaveRequest, 'judgeTime'> & {
  judgeTime?: Dayjs;
};

export default function MesInspectionJudgePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesInspectionJudge[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [judgeStatus, setJudgeStatus] = useState<string | undefined>(undefined);
  const [judgeResult, setJudgeResult] = useState<string | undefined>(undefined);
  const [sourceType, setSourceType] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = judgeStatus, result = judgeResult) => {
      setLoading(true);
      try {
        const params: MesInspectionJudgeQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          judgeStatus: status,
          judgeResult: result,
          sourceType,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, judgeStatus, judgeResult, sourceType],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ sourceType: 'INCOMING', judgeResult: 'PASS', judgeStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesInspectionJudge) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      judgeTime: record.judgeTime ? dayjs(record.judgeTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesInspectionJudgeSaveRequest = {
        ...values,
        judgeTime: values.judgeTime ? values.judgeTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('检验判定已创建');
      } else {
        await service.update(editId, payload);
        message.success('检验判定已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('检验判定已删除');
    void loadData();
  };

  const columns: ColumnsType<MesInspectionJudge> = [
    { title: '判定单号', dataIndex: 'judgeNo', width: 190, fixed: 'left', render: plain },
    {
      title: '来源类型',
      dataIndex: 'sourceType',
      width: 130,
      render: (v) => statusTag(MES_INSPECTION_SPEC_TYPE_LABEL, v),
    },
    { title: '来源单号', dataIndex: 'sourceNo', width: 170, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: plain },
    {
      title: '判定结果',
      dataIndex: 'judgeResult',
      width: 120,
      render: (v) => statusTag(MES_INSPECTION_JUDGE_RESULT_LABEL, v),
    },
    { title: '判定数量', dataIndex: 'judgeQty', width: 110, render: plain },
    { title: '合格数量', dataIndex: 'qualifiedQty', width: 110, render: plain },
    { title: '不合格数量', dataIndex: 'unqualifiedQty', width: 120, render: plain },
    { title: '判定意见', dataIndex: 'judgeOpinion', width: 200, render: plain },
    { title: '处置方式', dataIndex: 'disposition', width: 140, render: plain },
    { title: '判定人', dataIndex: 'judgeBy', width: 120, render: plain },
    { title: '判定时间', dataIndex: 'judgeTime', width: 170, render: formatDateTime },
    {
      title: '判定状态',
      dataIndex: 'judgeStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_INSPECTION_JUDGE_STATUS_LABEL, v),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该检验判定？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        检验判定
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="判定状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={judgeStatus}
              onChange={(v) => setJudgeStatus(v)}
              options={[...MES_INSPECTION_JUDGE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="判定结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={judgeResult}
              onChange={(v) => setJudgeResult(v)}
              options={[...MES_INSPECTION_JUDGE_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="来源类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={sourceType}
              onChange={(v) => setSourceType(v)}
              options={[...MES_INSPECTION_SPEC_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="判定单号 / 来源单号 / 物料编码 / 物料名称"
              allowClear
              style={{ width: 400 }}
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
                  void loadData(1, pageSize, keyword, judgeStatus, judgeResult);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setJudgeStatus(undefined);
                  setJudgeResult(undefined);
                  setSourceType(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建判定</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`检验判定（共 ${total} 条）`}>
        <Table<MesInspectionJudge>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2550 }}
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
        title={editId == null ? '新建判定' : '编辑判定'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="judgeNo" label="判定单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="sourceType" label="来源类型">
            <Select placeholder="为空默认 INCOMING" options={[...MES_INSPECTION_SPEC_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourceNo" label="来源单号">
            <Input placeholder="请输入来源单号" />
          </Form.Item>
          <Form.Item
            name="materialCode"
            label="物料编码"
            rules={[{ required: true, message: '请输入物料编码' }]}
          >
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="judgeResult" label="判定结果">
            <Select placeholder="为空默认 PASS" options={[...MES_INSPECTION_JUDGE_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="judgeQty" label="判定数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入判定数量" />
          </Form.Item>
          <Form.Item name="qualifiedQty" label="合格数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入合格数量" />
          </Form.Item>
          <Form.Item name="unqualifiedQty" label="不合格数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入不合格数量" />
          </Form.Item>
          <Form.Item name="judgeOpinion" label="判定意见">
            <Input.TextArea rows={2} placeholder="请输入判定意见" />
          </Form.Item>
          <Form.Item name="disposition" label="处置方式">
            <Input placeholder="请输入处置方式" />
          </Form.Item>
          <Form.Item name="judgeBy" label="判定人">
            <Input placeholder="请输入判定人" />
          </Form.Item>
          <Form.Item name="judgeTime" label="判定时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="judgeStatus" label="判定状态">
            <Select placeholder="为空默认 DRAFT" options={[...MES_INSPECTION_JUDGE_STATUS_OPTIONS]} />
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
