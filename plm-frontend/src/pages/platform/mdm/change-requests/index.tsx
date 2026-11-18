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
import { mdmChangeRequestService } from '@/services/mdmService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MDM_CHANGE_TYPE_LABEL,
  MDM_CHANGE_TYPE_OPTIONS,
  MDM_REQUEST_STATUS_LABEL,
  MDM_REQUEST_STATUS_OPTIONS,
  type MdmChangeRequestItem,
  type MdmChangeRequestSaveParams,
} from '@/types/mdm';

const { Title } = Typography;

/** 后端 LocalDateTime 仅接受 ISO-8601 格式（yyyy-MM-ddTHH:mm:ss）。 */
const DATETIME_SUBMIT_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const DATETIME_PICKER_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const MANAGE = 'platform:mdm:changerequest:manage';

/** 表单值类型：日期字段使用 Dayjs，提交时格式化为 ISO 字符串。 */
type FormValues = Omit<MdmChangeRequestSaveParams, 'applyTime' | 'approveTime'> & {
  applyTime?: Dayjs;
  approveTime?: Dayjs;
};

export default function MdmChangeRequestPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MdmChangeRequestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [domainCode, setDomainCode] = useState('');
  const [changeType, setChangeType] = useState<string | undefined>(undefined);
  const [requestStatus, setRequestStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      dCode = domainCode,
      cType = changeType,
      rStatus = requestStatus,
    ) => {
      setLoading(true);
      try {
        const res = await mdmChangeRequestService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          domainCode: dCode || undefined,
          changeType: cType,
          requestStatus: rStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, domainCode, changeType, requestStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ changeType: 'UPDATE', requestStatus: 'SUBMITTED' });
    setOpen(true);
  };

  const openEdit = (record: MdmChangeRequestItem) => {
    setEditId(record.id);
    const values: FormValues = {
      ...record,
      applyTime: record.applyTime ? dayjs(record.applyTime) : undefined,
      approveTime: record.approveTime ? dayjs(record.approveTime) : undefined,
    };
    form.setFieldsValue(values);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MdmChangeRequestSaveParams = {
        ...values,
        applyTime: values.applyTime ? values.applyTime.format(DATETIME_SUBMIT_FORMAT) : undefined,
        approveTime: values.approveTime ? values.approveTime.format(DATETIME_SUBMIT_FORMAT) : undefined,
      };
      if (editId == null) {
        await mdmChangeRequestService.create(payload);
        message.success('变更申请已创建');
      } else {
        await mdmChangeRequestService.update(editId, payload);
        message.success('变更申请已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await mdmChangeRequestService.remove(id);
    message.success('变更申请已删除');
    void loadData();
  };

  const columns: ColumnsType<MdmChangeRequestItem> = [
    { title: '变更编号', dataIndex: 'changeNo', width: 160, fixed: 'left', render: plain },
    { title: '域编码', dataIndex: 'domainCode', width: 140, render: plain },
    { title: '主数据编码', dataIndex: 'masterCode', width: 150, render: plain },
    { title: '变更类型', dataIndex: 'changeType', width: 110, render: (v) => statusTag(MDM_CHANGE_TYPE_LABEL, v) },
    { title: '申请人', dataIndex: 'applicantName', width: 120, render: plain },
    { title: '审批人', dataIndex: 'approverName', width: 120, render: plain },
    { title: '申请时间', dataIndex: 'applyTime', width: 170, render: formatDateTime },
    { title: '审批时间', dataIndex: 'approveTime', width: 170, render: formatDateTime },
    { title: '变更原因', dataIndex: 'changeReason', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '申请状态',
      dataIndex: 'requestStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(MDM_REQUEST_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该变更申请？" onConfirm={() => void remove(record.id)}>
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
        变更申请
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="域编码">
            <Input
              placeholder="请输入域编码"
              allowClear
              style={{ width: 160 }}
              value={domainCode}
              onChange={(e) => setDomainCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="变更类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={changeType}
              onChange={(v) => setChangeType(v)}
              options={[...MDM_CHANGE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="申请状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={requestStatus}
              onChange={(v) => setRequestStatus(v)}
              options={[...MDM_REQUEST_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="变更编号 / 主数据编码"
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
                  void loadData(1, pageSize, keyword, domainCode, changeType, requestStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDomainCode('');
                  setChangeType(undefined);
                  setRequestStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建变更申请</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`变更申请（共 ${total} 条）`}>
        <Table<MdmChangeRequestItem>
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
        title={editId == null ? '新建变更申请' : '编辑变更申请'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="changeNo" label="变更编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="domainCode" label="域编码" rules={[{ required: true, message: '请输入域编码' }]}>
            <Input placeholder="请输入域编码" />
          </Form.Item>
          <Form.Item name="masterCode" label="主数据编码">
            <Input placeholder="请输入主数据编码" />
          </Form.Item>
          <Form.Item name="changeType" label="变更类型">
            <Select placeholder="为空默认 UPDATE" options={[...MDM_CHANGE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="beforeValue" label="变更前值">
            <Input.TextArea rows={2} placeholder="请输入变更前值" />
          </Form.Item>
          <Form.Item name="afterValue" label="变更后值">
            <Input.TextArea rows={2} placeholder="请输入变更后值" />
          </Form.Item>
          <Form.Item name="changeReason" label="变更原因">
            <Input.TextArea rows={2} placeholder="请输入变更原因" />
          </Form.Item>
          <Form.Item name="requestStatus" label="申请状态">
            <Select placeholder="为空默认 SUBMITTED" options={[...MDM_REQUEST_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="applicantName" label="申请人">
            <Input placeholder="为空时取当前登录用户" />
          </Form.Item>
          <Form.Item name="approverName" label="审批人">
            <Input placeholder="请输入审批人" />
          </Form.Item>
          <Form.Item name="applyTime" label="申请时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="approveTime" label="审批时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
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
