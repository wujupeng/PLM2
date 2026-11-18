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
import dayjs, { type Dayjs } from 'dayjs';
import { devopsBuildRunService } from '@/services/devopsService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  DEVOPS_BUILD_STATUS_LABEL,
  DEVOPS_BUILD_STATUS_OPTIONS,
  type DevopsBuildRunItem,
  type DevopsBuildRunSaveParams,
} from '@/types/devops';

const { Title } = Typography;

/** 后端 LocalDateTime 仅接受 ISO-8601 格式（yyyy-MM-ddTHH:mm:ss）。 */
const DATETIME_SUBMIT_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const DATETIME_PICKER_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const MANAGE = 'platform:devops:buildrun:manage';

/** 表单值类型：日期时间字段使用 Dayjs，提交时格式化为 ISO 字符串。 */
type FormValues = Omit<DevopsBuildRunSaveParams, 'startTime' | 'endTime'> & {
  startTime?: Dayjs;
  endTime?: Dayjs;
};

export default function DevopsBuildRunPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<DevopsBuildRunItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [pipelineCode, setPipelineCode] = useState('');
  const [envCode, setEnvCode] = useState('');
  const [buildStatus, setBuildStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      pCode = pipelineCode,
      eCode = envCode,
      bStatus = buildStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await devopsBuildRunService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          pipelineCode: pCode || undefined,
          envCode: eCode || undefined,
          buildStatus: bStatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, pipelineCode, envCode, buildStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', undefined, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ buildStatus: 'RUNNING' });
    setOpen(true);
  };

  const openEdit = (record: DevopsBuildRunItem) => {
    setEditId(record.id);
    const values = {
      ...record,
      startTime: record.startTime ? dayjs(record.startTime) : undefined,
      endTime: record.endTime ? dayjs(record.endTime) : undefined,
    };
    form.setFieldsValue(values);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: DevopsBuildRunSaveParams = {
        ...values,
        startTime: values.startTime ? values.startTime.format(DATETIME_SUBMIT_FORMAT) : undefined,
        endTime: values.endTime ? values.endTime.format(DATETIME_SUBMIT_FORMAT) : undefined,
      };
      if (editId == null) {
        await devopsBuildRunService.create(payload);
        message.success('构建部署记录已创建');
      } else {
        await devopsBuildRunService.update(editId, payload);
        message.success('构建部署记录已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await devopsBuildRunService.remove(id);
    message.success('构建部署记录已删除');
    void loadData();
  };

  const columns: ColumnsType<DevopsBuildRunItem> = [
    { title: '运行编号', dataIndex: 'runNo', width: 160, fixed: 'left', render: plain },
    { title: '流水线编码', dataIndex: 'pipelineCode', width: 150, render: plain },
    { title: '构建号', dataIndex: 'buildNo', width: 120, render: plain },
    { title: '环境编码', dataIndex: 'envCode', width: 120, render: plain },
    { title: '提交号', dataIndex: 'commitId', width: 140, ellipsis: true, render: plain },
    {
      title: '构建状态',
      dataIndex: 'buildStatus',
      width: 100,
      render: (v) => statusTag(DEVOPS_BUILD_STATUS_LABEL, v),
    },
    { title: '开始时间', dataIndex: 'startTime', width: 170, render: formatDateTime },
    { title: '结束时间', dataIndex: 'endTime', width: 170, render: formatDateTime },
    { title: '耗时(ms)', dataIndex: 'durationMs', width: 110, render: (v) => (v == null ? '-' : String(v)) },
    { title: '制品引用', dataIndex: 'artifactRef', width: 200, ellipsis: true, render: plain },
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
            <Popconfirm title="确认删除该构建部署记录？" onConfirm={() => void remove(record.id)}>
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
        构建记录
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="流水线编码">
            <Input
              placeholder="请输入流水线编码"
              allowClear
              style={{ width: 160 }}
              value={pipelineCode}
              onChange={(e) => setPipelineCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="环境编码">
            <Input
              placeholder="请输入环境编码"
              allowClear
              style={{ width: 140 }}
              value={envCode}
              onChange={(e) => setEnvCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="构建状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={buildStatus}
              onChange={(v) => setBuildStatus(v)}
              options={[...DEVOPS_BUILD_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="开始日期">
            <DatePicker.RangePicker
              value={range}
              onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)}
              format={DATE_FORMAT}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="运行编号 / 构建号 / 提交号"
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
                  void loadData(1, pageSize, keyword, pipelineCode, envCode, buildStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setPipelineCode('');
                  setEnvCode('');
                  setBuildStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建构建记录</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`构建记录（共 ${total} 条）`}>
        <Table<DevopsBuildRunItem>
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
        title={editId == null ? '新建构建记录' : '编辑构建记录'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="runNo" label="运行编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="pipelineCode" label="流水线编码" rules={[{ required: true, message: '请输入流水线编码' }]}>
            <Input placeholder="请输入流水线编码" />
          </Form.Item>
          <Form.Item name="buildNo" label="构建号">
            <Input placeholder="请输入构建号" />
          </Form.Item>
          <Form.Item name="envCode" label="环境编码">
            <Input placeholder="请输入环境编码" />
          </Form.Item>
          <Form.Item name="commitId" label="提交号">
            <Input placeholder="请输入提交号" />
          </Form.Item>
          <Form.Item name="buildStatus" label="构建状态">
            <Select placeholder="请选择" options={[...DEVOPS_BUILD_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="startTime" label="开始时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="endTime" label="结束时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="durationMs" label="耗时（毫秒）">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入耗时" />
          </Form.Item>
          <Form.Item name="artifactRef" label="制品引用">
            <Input placeholder="请输入制品引用" />
          </Form.Item>
          <Form.Item name="message" label="消息">
            <Input.TextArea rows={2} placeholder="请输入消息" />
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
