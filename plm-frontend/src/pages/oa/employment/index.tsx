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
  Tag,
  TreeSelect,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { oaEmploymentService, oaPositionService } from '@/services/oaService';
import { organizationService } from '@/services/systemService';
import type { Organization } from '@/types/system';
import UserSelect from '@/pages/oa/UserSelect';
import {
  OA_EMPLOYMENT_STATUS_COLOR,
  OA_EMPLOYMENT_STATUS_LABEL,
  OA_EMPLOYMENT_STATUS_OPTIONS,
  OA_EMPLOYMENT_TYPE_LABEL,
  OA_EMPLOYMENT_TYPE_OPTIONS,
  type OaEmploymentItem,
  type OaEmploymentQuery,
  type OaEmploymentSaveParams,
  type OaPositionItem,
} from '@/types/oa';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;
const DATE_FORMAT = 'YYYY-MM-DD';

interface EmploymentFormValues {
  employeeNo: string;
  userId?: number;
  employeeName: string;
  orgId?: number;
  positionId?: number;
  employmentType?: string;
  employmentStatus?: string;
  hireDate?: Dayjs;
  leaveDate?: Dayjs;
  managerUserId?: number;
  workLocation?: string;
  remark?: string;
}

interface EmploymentSearchState {
  keyword?: string;
  orgId?: number;
  positionId?: number;
  employmentStatus?: string;
}

export default function OaEmploymentPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<EmploymentFormValues>();

  const [data, setData] = useState<OaEmploymentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<EmploymentSearchState>({});
  const [orgTree, setOrgTree] = useState<Organization[]>([]);
  const [positions, setPositions] = useState<OaPositionItem[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaEmploymentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaEmploymentQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          orgId: cond.orgId,
          positionId: cond.positionId,
          employmentStatus: cond.employmentStatus || undefined,
        };
        const res = await oaEmploymentService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  const loadOptions = useCallback(async () => {
    const [tree, positionList] = await Promise.all([
      organizationService.tree(),
      oaPositionService.enabled(),
    ]);
    setOrgTree(tree || []);
    setPositions(positionList || []);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, {});
    void loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const positionOptions = positions.map((p) => ({
    value: p.id,
    label: `${p.positionName}（${p.positionCode}）`,
  }));

  const onSearch = (values: EmploymentSearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ employmentType: 'FULL_TIME', employmentStatus: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEdit = (record: OaEmploymentItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      employeeNo: record.employeeNo,
      userId: record.userId,
      employeeName: record.employeeName,
      orgId: record.orgId,
      positionId: record.positionId,
      employmentType: record.employmentType,
      employmentStatus: record.employmentStatus,
      hireDate: record.hireDate ? dayjs(record.hireDate) : undefined,
      leaveDate: record.leaveDate ? dayjs(record.leaveDate) : undefined,
      managerUserId: record.managerUserId,
      workLocation: record.workLocation,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: OaEmploymentSaveParams = {
      employeeNo: values.employeeNo,
      userId: values.userId,
      employeeName: values.employeeName,
      orgId: values.orgId,
      positionId: values.positionId,
      employmentType: values.employmentType,
      employmentStatus: values.employmentStatus,
      hireDate: values.hireDate ? values.hireDate.format(DATE_FORMAT) : undefined,
      leaveDate: values.leaveDate ? values.leaveDate.format(DATE_FORMAT) : undefined,
      managerUserId: values.managerUserId,
      workLocation: values.workLocation,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await oaEmploymentService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await oaEmploymentService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: OaEmploymentItem) => {
    await oaEmploymentService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<OaEmploymentItem> = [
    { title: '工号', dataIndex: 'employeeNo', width: 130, fixed: 'left', render: (v) => v || '-' },
    { title: '员工姓名', dataIndex: 'employeeName', width: 130, render: (v) => v || '-' },
    { title: '岗位', dataIndex: 'positionName', width: 150, render: (v) => v || '-' },
    {
      title: '用工性质',
      dataIndex: 'employmentType',
      width: 110,
      render: (v?: string) => (v ? OA_EMPLOYMENT_TYPE_LABEL[v] || v : '-'),
    },
    {
      title: '在职状态',
      dataIndex: 'employmentStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={OA_EMPLOYMENT_STATUS_COLOR[v]}>{OA_EMPLOYMENT_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '入职日期',
      dataIndex: 'hireDate',
      width: 120,
      render: (v?: string) => (v ? dayjs(v).format(DATE_FORMAT) : '-'),
    },
    {
      title: '离职日期',
      dataIndex: 'leaveDate',
      width: 120,
      render: (v?: string) => (v ? dayjs(v).format(DATE_FORMAT) : '-'),
    },
    { title: '工作地点', dataIndex: 'workLocation', width: 130, render: (v) => v || '-' },
    { title: '备注', dataIndex: 'remark', width: 200, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:employment:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('oa:employment:delete') && (
            <Popconfirm title="确认删除该员工档案？" onConfirm={() => handleDelete(record)}>
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
        员工档案
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="员工">
            <Input placeholder="工号 / 姓名" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="orgId" label="所属组织">
            <TreeSelect
              placeholder="请选择"
              allowClear
              style={{ width: 200 }}
              treeData={orgTree}
              fieldNames={{ label: 'orgName', value: 'orgId', children: 'children' }}
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item name="positionId" label="岗位">
            <Select
              placeholder="请选择"
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: 200 }}
              options={positionOptions}
            />
          </Form.Item>
          <Form.Item name="employmentStatus" label="在职状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={OA_EMPLOYMENT_STATUS_OPTIONS}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`员工档案列表（共 ${total} 条）`}
        extra={
          hasPermission('oa:employment:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增员工档案
            </Button>
          )
        }
      >
        <Table<OaEmploymentItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1500 }}
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
        title={editing ? '编辑员工档案' : '新增员工档案'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="employeeNo"
            label="工号"
            rules={[{ required: true, message: '请输入工号' }]}
          >
            <Input placeholder="请输入工号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="userId" label="关联账号">
            <UserSelect style={{ width: '100%' }} fallbackLabel={editing?.employeeName} />
          </Form.Item>
          <Form.Item
            name="employeeName"
            label="员工姓名"
            rules={[{ required: true, message: '请输入员工姓名' }]}
          >
            <Input placeholder="请输入员工姓名" />
          </Form.Item>
          <Form.Item name="orgId" label="所属组织">
            <TreeSelect
              placeholder="请选择"
              allowClear
              treeData={orgTree}
              fieldNames={{ label: 'orgName', value: 'orgId', children: 'children' }}
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item name="positionId" label="岗位" extra="岗位名称以岗位管理中的名称为准，保存时自动回填">
            <Select
              placeholder="请选择"
              allowClear
              showSearch
              optionFilterProp="label"
              options={positionOptions}
            />
          </Form.Item>
          <Form.Item name="employmentType" label="用工性质">
            <Select placeholder="请选择" options={OA_EMPLOYMENT_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="employmentStatus" label="在职状态">
            <Select placeholder="请选择" options={OA_EMPLOYMENT_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="hireDate" label="入职日期">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="leaveDate" label="离职日期">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="managerUserId" label="直属上级">
            <UserSelect
              style={{ width: '100%' }}
              fallbackLabel={editing?.managerUserId ? `用户 ${editing.managerUserId}` : undefined}
            />
          </Form.Item>
          <Form.Item name="workLocation" label="工作地点">
            <Input placeholder="请输入工作地点" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
