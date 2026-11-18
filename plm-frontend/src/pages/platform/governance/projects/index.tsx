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
import { govProjectService } from '@/services/governanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  GOV_PROJECT_STATUS_LABEL,
  GOV_PROJECT_STATUS_OPTIONS,
  type GovProjectItem,
  type GovProjectSaveParams,
} from '@/types/governance';

const { Title } = Typography;

/** 后端 LocalDateTime 仅接受 ISO-8601 格式（yyyy-MM-ddTHH:mm:ss）。 */
const DATETIME_SUBMIT_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const DATETIME_PICKER_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const MANAGE = 'platform:gov:project:manage';

/** 表单值类型：日期字段使用 Dayjs，提交时格式化为 ISO 字符串。 */
type FormValues = Omit<GovProjectSaveParams, 'startDate' | 'endDate'> & {
  startDate?: Dayjs;
  endDate?: Dayjs;
};

export default function GovProjectPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<GovProjectItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [projectType, setProjectType] = useState<string | undefined>(undefined);
  const [projectStatus, setProjectStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      pType = projectType,
      pStatus = projectStatus,
    ) => {
      setLoading(true);
      try {
        const res = await govProjectService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          projectType: pType,
          projectStatus: pStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, projectType, projectStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ projectType: 'PLATFORM', projectStatus: 'PLANNING' });
    setOpen(true);
  };

  const openEdit = (record: GovProjectItem) => {
    setEditId(record.id);
    const values: FormValues = {
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : undefined,
      endDate: record.endDate ? dayjs(record.endDate) : undefined,
    };
    form.setFieldsValue(values);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: GovProjectSaveParams = {
        ...values,
        startDate: values.startDate ? values.startDate.format(DATETIME_SUBMIT_FORMAT) : undefined,
        endDate: values.endDate ? values.endDate.format(DATETIME_SUBMIT_FORMAT) : undefined,
      };
      if (editId == null) {
        await govProjectService.create(payload);
        message.success('治理项目已创建');
      } else {
        await govProjectService.update(editId, payload);
        message.success('治理项目已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await govProjectService.remove(id);
    message.success('治理项目已删除');
    void loadData();
  };

  const columns: ColumnsType<GovProjectItem> = [
    { title: '项目编号', dataIndex: 'projectNo', width: 160, fixed: 'left', render: plain },
    { title: '项目编码', dataIndex: 'projectCode', width: 140, render: plain },
    { title: '项目名称', dataIndex: 'projectName', width: 200, render: plain },
    { title: '项目类型', dataIndex: 'projectType', width: 120, render: plain },
    { title: '发起人', dataIndex: 'sponsor', width: 120, render: plain },
    { title: '项目经理', dataIndex: 'managerName', width: 120, render: plain },
    { title: '计划开始', dataIndex: 'startDate', width: 170, render: formatDateTime },
    { title: '计划结束', dataIndex: 'endDate', width: 170, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '项目状态',
      dataIndex: 'projectStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(GOV_PROJECT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该治理项目？" onConfirm={() => void remove(record.id)}>
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
        项目治理
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="项目类型">
            <Input
              placeholder="如 PLATFORM"
              allowClear
              style={{ width: 160 }}
              value={projectType}
              onChange={(e) => setProjectType(e.target.value || undefined)}
            />
          </Form.Item>
          <Form.Item label="项目状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={projectStatus}
              onChange={(v) => setProjectStatus(v)}
              options={[...GOV_PROJECT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="项目编号 / 编码 / 名称"
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
                  void loadData(1, pageSize, keyword, projectType, projectStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setProjectType(undefined);
                  setProjectStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建治理项目</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`项目治理（共 ${total} 条）`}>
        <Table<GovProjectItem>
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
        title={editId == null ? '新建治理项目' : '编辑治理项目'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="projectNo" label="项目编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="projectCode" label="项目编码">
            <Input placeholder="请输入项目编码" />
          </Form.Item>
          <Form.Item name="projectName" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item name="projectType" label="项目类型">
            <Input placeholder="为空默认 PLATFORM" />
          </Form.Item>
          <Form.Item name="sponsor" label="项目发起人">
            <Input placeholder="请输入项目发起人" />
          </Form.Item>
          <Form.Item name="managerName" label="项目经理">
            <Input placeholder="请输入项目经理" />
          </Form.Item>
          <Form.Item name="startDate" label="计划开始时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="endDate" label="计划结束时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="projectStatus" label="项目状态">
            <Select placeholder="请选择" options={[...GOV_PROJECT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="scopeDesc" label="项目范围说明">
            <Input.TextArea rows={2} placeholder="请输入项目范围说明" />
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
