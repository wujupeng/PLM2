import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
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
import dayjs, { type Dayjs } from 'dayjs';
import { govMilestoneService } from '@/services/governanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  GOV_MILESTONE_STATUS_LABEL,
  GOV_MILESTONE_STATUS_OPTIONS,
  type GovMilestoneItem,
  type GovMilestoneSaveParams,
} from '@/types/governance';

const { Title } = Typography;

/** 后端 LocalDateTime 仅接受 ISO-8601 格式（yyyy-MM-ddTHH:mm:ss）。 */
const DATETIME_SUBMIT_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const DATETIME_PICKER_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const MANAGE = 'platform:gov:milestone:manage';

/** 表单值类型：日期字段使用 Dayjs，提交时格式化为 ISO 字符串。 */
type FormValues = Omit<GovMilestoneSaveParams, 'planDate' | 'actualDate'> & {
  planDate?: Dayjs;
  actualDate?: Dayjs;
};

export default function GovMilestonePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<GovMilestoneItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [milestoneStatus, setMilestoneStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      pCode = projectCode,
      mStatus = milestoneStatus,
    ) => {
      setLoading(true);
      try {
        const res = await govMilestoneService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          projectCode: pCode || undefined,
          milestoneStatus: mStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, projectCode, milestoneStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ milestoneStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: GovMilestoneItem) => {
    setEditId(record.id);
    const values = {
      ...record,
      planDate: record.planDate ? dayjs(record.planDate) : undefined,
      actualDate: record.actualDate ? dayjs(record.actualDate) : undefined,
    };
    form.setFieldsValue(values);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: GovMilestoneSaveParams = {
        ...values,
        planDate: values.planDate ? values.planDate.format(DATETIME_SUBMIT_FORMAT) : undefined,
        actualDate: values.actualDate ? values.actualDate.format(DATETIME_SUBMIT_FORMAT) : undefined,
      };
      if (editId == null) {
        await govMilestoneService.create(payload);
        message.success('里程碑已创建');
      } else {
        await govMilestoneService.update(editId, payload);
        message.success('里程碑已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await govMilestoneService.remove(id);
    message.success('里程碑已删除');
    void loadData();
  };

  const columns: ColumnsType<GovMilestoneItem> = [
    { title: '里程碑编号', dataIndex: 'milestoneNo', width: 160, fixed: 'left', render: plain },
    { title: '所属项目编码', dataIndex: 'projectCode', width: 150, render: plain },
    { title: '里程碑编码', dataIndex: 'milestoneCode', width: 140, render: plain },
    { title: '里程碑名称', dataIndex: 'milestoneName', width: 200, render: plain },
    { title: '计划达成', dataIndex: 'planDate', width: 170, render: formatDateTime },
    { title: '实际达成', dataIndex: 'actualDate', width: 170, render: formatDateTime },
    { title: '负责人', dataIndex: 'ownerName', width: 120, render: plain },
    { title: '交付物', dataIndex: 'deliverable', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'milestoneStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(GOV_MILESTONE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该里程碑？" onConfirm={() => void remove(record.id)}>
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
        里程碑
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
          <Form.Item label="里程碑状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={milestoneStatus}
              onChange={(v) => setMilestoneStatus(v)}
              options={[...GOV_MILESTONE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="里程碑编号 / 编码 / 名称"
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
                  void loadData(1, pageSize, keyword, projectCode, milestoneStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setProjectCode('');
                  setMilestoneStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建里程碑</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`里程碑（共 ${total} 条）`}>
        <Table<GovMilestoneItem>
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
        title={editId == null ? '新建里程碑' : '编辑里程碑'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="milestoneNo" label="里程碑编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="projectCode"
            label="所属项目编码"
            rules={[{ required: true, message: '请输入所属项目编码' }]}
          >
            <Input placeholder="请输入所属项目编码" />
          </Form.Item>
          <Form.Item name="milestoneCode" label="里程碑编码">
            <Input placeholder="请输入里程碑编码" />
          </Form.Item>
          <Form.Item
            name="milestoneName"
            label="里程碑名称"
            rules={[{ required: true, message: '请输入里程碑名称' }]}
          >
            <Input placeholder="请输入里程碑名称" />
          </Form.Item>
          <Form.Item name="planDate" label="计划达成时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="actualDate" label="实际达成时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="milestoneStatus" label="里程碑状态">
            <Select placeholder="请选择" options={[...GOV_MILESTONE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ownerName" label="负责人">
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item name="deliverable" label="交付物">
            <Input.TextArea rows={2} placeholder="请输入交付物" />
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
