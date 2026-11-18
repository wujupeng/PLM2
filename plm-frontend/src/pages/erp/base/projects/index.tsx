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
import { erpProjectService } from '@/services/erpBaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PROJECT_STATUS_LABEL,
  ERP_PROJECT_STATUS_OPTIONS,
  ERP_PROJECT_TYPE_LABEL,
  ERP_PROJECT_TYPE_OPTIONS,
  type ErpProject,
  type ErpProjectSaveRequest,
} from '@/types/erpBase';

const { Title } = Typography;

/** 后端 LocalDateTime 仅接受 ISO-8601 格式（yyyy-MM-ddTHH:mm:ss）。 */
const DATETIME_SUBMIT_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const DATETIME_PICKER_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const MANAGE = 'erp:base:project:manage';

/** 表单值类型：日期字段使用 Dayjs，提交时格式化为 ISO 字符串。 */
type FormValues = Omit<ErpProjectSaveRequest, 'startDate' | 'endDate'> & {
  startDate?: Dayjs;
  endDate?: Dayjs;
};

export default function ErpProjectPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpProject[]>([]);
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
        const res = await erpProjectService.page({
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
    form.setFieldsValue({ projectType: 'INTERNAL', projectStatus: 'PLANNING' });
    setOpen(true);
  };

  const openEdit = (record: ErpProject) => {
    setEditId(record.id ?? null);
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
      const payload: ErpProjectSaveRequest = {
        ...values,
        startDate: values.startDate ? values.startDate.format(DATETIME_SUBMIT_FORMAT) : undefined,
        endDate: values.endDate ? values.endDate.format(DATETIME_SUBMIT_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpProjectService.create(payload);
        message.success('项目档案已创建');
      } else {
        await erpProjectService.update(editId, payload);
        message.success('项目档案已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpProjectService.remove(id);
    message.success('项目档案已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpProject> = [
    { title: '项目编号', dataIndex: 'projectNo', width: 160, fixed: 'left', render: plain },
    { title: '项目编码', dataIndex: 'projectCode', width: 140, render: plain },
    { title: '项目名称', dataIndex: 'projectName', width: 200, render: plain },
    {
      title: '项目类型',
      dataIndex: 'projectType',
      width: 110,
      render: (v) => statusTag(ERP_PROJECT_TYPE_LABEL, v),
    },
    { title: '项目经理', dataIndex: 'projectManager', width: 120, render: plain },
    { title: '客户编码', dataIndex: 'customerCode', width: 130, render: plain },
    { title: '开始时间', dataIndex: 'startDate', width: 170, render: formatDateTime },
    { title: '结束时间', dataIndex: 'endDate', width: 170, render: formatDateTime },
    { title: '预算金额', dataIndex: 'budgetAmount', width: 120, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '项目状态',
      dataIndex: 'projectStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ERP_PROJECT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该项目档案？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        项目档案
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="项目类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={projectType}
              onChange={(v) => setProjectType(v)}
              options={[...ERP_PROJECT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="项目状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={projectStatus}
              onChange={(v) => setProjectStatus(v)}
              options={[...ERP_PROJECT_STATUS_OPTIONS]}
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
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建项目档案</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`项目档案（共 ${total} 条）`}>
        <Table<ErpProject>
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
        title={editId == null ? '新建项目档案' : '编辑项目档案'}
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
            <Select placeholder="为空默认 INTERNAL" options={[...ERP_PROJECT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="projectManager" label="项目经理">
            <Input placeholder="请输入项目经理" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="startDate" label="开始时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="endDate" label="结束时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="budgetAmount" label="预算金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入预算金额" />
          </Form.Item>
          <Form.Item name="projectStatus" label="项目状态">
            <Select placeholder="为空默认 PLANNING" options={[...ERP_PROJECT_STATUS_OPTIONS]} />
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
