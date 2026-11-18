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
import { mdmCodeIssueService } from '@/services/mdmService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MDM_ISSUE_STATUS_LABEL,
  MDM_ISSUE_STATUS_OPTIONS,
  type MdmCodeIssueItem,
  type MdmCodeIssueSaveParams,
} from '@/types/mdm';

const { Title } = Typography;

/** 后端 LocalDateTime 仅接受 ISO-8601 格式（yyyy-MM-ddTHH:mm:ss）。 */
const DATETIME_SUBMIT_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const DATETIME_PICKER_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const MANAGE = 'platform:mdm:codeissue:manage';

/** 表单值类型：日期字段使用 Dayjs，提交时格式化为 ISO 字符串。 */
type FormValues = Omit<MdmCodeIssueSaveParams, 'issueTime'> & {
  issueTime?: Dayjs;
};

export default function MdmCodeIssuePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MdmCodeIssueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [domainCode, setDomainCode] = useState('');
  const [standardCode, setStandardCode] = useState('');
  const [issueStatus, setIssueStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      dCode = domainCode,
      sCode = standardCode,
      iStatus = issueStatus,
    ) => {
      setLoading(true);
      try {
        const res = await mdmCodeIssueService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          domainCode: dCode || undefined,
          standardCode: sCode || undefined,
          issueStatus: iStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, domainCode, standardCode, issueStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ issueStatus: 'ISSUED' });
    setOpen(true);
  };

  const openEdit = (record: MdmCodeIssueItem) => {
    setEditId(record.id);
    const values: FormValues = {
      ...record,
      issueTime: record.issueTime ? dayjs(record.issueTime) : undefined,
    };
    form.setFieldsValue(values);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MdmCodeIssueSaveParams = {
        ...values,
        issueTime: values.issueTime ? values.issueTime.format(DATETIME_SUBMIT_FORMAT) : undefined,
      };
      if (editId == null) {
        await mdmCodeIssueService.create(payload);
        message.success('编码发放已创建');
      } else {
        await mdmCodeIssueService.update(editId, payload);
        message.success('编码发放已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await mdmCodeIssueService.remove(id);
    message.success('编码发放已删除');
    void loadData();
  };

  const columns: ColumnsType<MdmCodeIssueItem> = [
    { title: '发放编号', dataIndex: 'issueNo', width: 160, fixed: 'left', render: plain },
    { title: '域编码', dataIndex: 'domainCode', width: 140, render: plain },
    { title: '标准编码', dataIndex: 'standardCode', width: 140, render: plain },
    { title: '主数据编码', dataIndex: 'masterCode', width: 150, render: plain },
    { title: '流水号', dataIndex: 'seqValue', width: 110, render: plain },
    { title: '发放时间', dataIndex: 'issueTime', width: 170, render: formatDateTime },
    { title: '发放人', dataIndex: 'issuedBy', width: 120, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '发放状态',
      dataIndex: 'issueStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(MDM_ISSUE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该编码发放记录？" onConfirm={() => void remove(record.id)}>
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
        编码发放
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
          <Form.Item label="标准编码">
            <Input
              placeholder="请输入标准编码"
              allowClear
              style={{ width: 160 }}
              value={standardCode}
              onChange={(e) => setStandardCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="发放状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={issueStatus}
              onChange={(v) => setIssueStatus(v)}
              options={[...MDM_ISSUE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="发放编号 / 主数据编码"
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
                  void loadData(1, pageSize, keyword, domainCode, standardCode, issueStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDomainCode('');
                  setStandardCode('');
                  setIssueStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建编码发放</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`编码发放（共 ${total} 条）`}>
        <Table<MdmCodeIssueItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
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
        title={editId == null ? '新建编码发放' : '编辑编码发放'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="issueNo" label="发放编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="domainCode" label="域编码" rules={[{ required: true, message: '请输入域编码' }]}>
            <Input placeholder="请输入域编码" />
          </Form.Item>
          <Form.Item name="standardCode" label="标准编码">
            <Input placeholder="请输入标准编码" />
          </Form.Item>
          <Form.Item name="masterCode" label="主数据编码">
            <Input placeholder="请输入主数据编码" />
          </Form.Item>
          <Form.Item name="seqValue" label="流水号">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入流水号" />
          </Form.Item>
          <Form.Item name="issueTime" label="发放时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="issuedBy" label="发放人">
            <Input placeholder="为空时取当前登录用户" />
          </Form.Item>
          <Form.Item name="issueStatus" label="发放状态">
            <Select placeholder="为空默认 ISSUED" options={[...MDM_ISSUE_STATUS_OPTIONS]} />
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
