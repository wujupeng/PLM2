import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { oaFormService, oaInstanceService, oaProcessService } from '@/services/oaService';
import FormFieldInput from '@/pages/oa/FormFieldInput';
import InstanceDetailModal from '@/pages/oa/InstanceDetailModal';
import { useAuthStore } from '@/stores/authStore';
import {
  OA_INSTANCE_STATUS_COLOR,
  OA_INSTANCE_STATUS_LABEL,
  OA_INSTANCE_STATUS_OPTIONS,
  type OaFormFieldItem,
  type OaInstanceQuery,
  type OaProcessDefinitionItem,
  type OaProcessInstanceItem,
} from '@/types/oa';

const { Title } = Typography;
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/** 序列化填报数据：日期对象统一转字符串，避免提交 ISO 原文。 */
const buildFormDataJson = (data: Record<string, unknown>): string =>
  JSON.stringify(data, (_key, value) => (dayjs.isDayjs(value) ? value.format(DATETIME_FORMAT) : value));

interface StartMetaValues {
  processId?: number;
  title?: string;
  remark?: string;
}

interface SearchState {
  keyword?: string;
  instanceStatus?: string;
}

export default function OaMyApplicationPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [metaForm] = Form.useForm<StartMetaValues>();
  const [dataForm] = Form.useForm<Record<string, unknown>>();

  const [data, setData] = useState<OaProcessInstanceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [processes, setProcesses] = useState<OaProcessDefinitionItem[]>([]);
  const [startFields, setStartFields] = useState<OaFormFieldItem[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [detailId, setDetailId] = useState<number | undefined>(undefined);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadProcesses = useCallback(async () => {
    const list = await oaProcessService.published();
    setProcesses(list || []);
  }, []);

  useEffect(() => {
    void loadProcesses();
  }, [loadProcesses]);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaInstanceQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          instanceStatus: cond.instanceStatus || undefined,
        };
        const res = await oaInstanceService.my(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: SearchState) => {
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

  const openStart = () => {
    metaForm.resetFields();
    dataForm.resetFields();
    setStartFields([]);
    setStartOpen(true);
  };

  const handleProcessChange = async (processId?: number) => {
    setStartFields([]);
    dataForm.resetFields();
    if (!processId) return;
    const process = processes.find((p) => p.id === processId);
    if (process && !metaForm.getFieldValue('title')) {
      metaForm.setFieldsValue({ title: process.processName });
    }
    if (process?.formId) {
      const formDetail = await oaFormService.detail(process.formId);
      setStartFields(formDetail.fields || []);
    }
  };

  const handleStart = async () => {
    const meta = await metaForm.validateFields();
    const formData: Record<string, unknown> = startFields.length ? await dataForm.validateFields() : {};
    setSubmitting(true);
    try {
      await oaInstanceService.start({
        processId: meta.processId as number,
        title: meta.title,
        remark: meta.remark,
        formDataJson: buildFormDataJson(formData),
      });
      message.success('已提交审批');
      setStartOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (record: OaProcessInstanceItem) => {
    await oaInstanceService.cancel(record.id);
    message.success('已撤回该申请');
    void loadData();
  };

  const openDetail = (record: OaProcessInstanceItem) => {
    setDetailId(record.id);
    setDetailOpen(true);
  };

  const columns: ColumnsType<OaProcessInstanceItem> = [
    { title: '实例编号', dataIndex: 'instanceNo', width: 180, fixed: 'left', render: (v) => v || '-' },
    { title: '流程名称', dataIndex: 'processName', width: 170, render: (v) => v || '-' },
    { title: '标题', dataIndex: 'title', width: 200, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'instanceStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={OA_INSTANCE_STATUS_COLOR[v]}>{OA_INSTANCE_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '当前节点', dataIndex: 'currentNodeCode', width: 110, render: (v) => v || '-' },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'finishedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
          {hasPermission('oa:instance:cancel') && record.instanceStatus === 'RUNNING' && (
            <Popconfirm title="确认撤回该申请？" onConfirm={() => handleCancel(record)}>
              <Button type="link" size="small" danger>
                撤回
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
        我的申请
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="实例编号 / 标题 / 流程" allowClear style={{ width: 220 }} />
          </Form.Item>
          <Form.Item name="instanceStatus" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={OA_INSTANCE_STATUS_OPTIONS} />
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
        title={`我的申请（共 ${total} 条）`}
        extra={
          hasPermission('oa:instance:start') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openStart}>
              发起流程
            </Button>
          )
        }
      >
        <Table<OaProcessInstanceItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1300 }}
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
        title="发起流程"
        open={startOpen}
        onOk={handleStart}
        confirmLoading={submitting}
        onCancel={() => setStartOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={metaForm} layout="vertical" preserve={false}>
          <Form.Item name="processId" label="选择流程" rules={[{ required: true, message: '请选择流程' }]}>
            <Select
              placeholder="请选择已发布流程"
              showSearch
              optionFilterProp="label"
              onChange={(value?: number) => void handleProcessChange(value)}
              options={processes.map((p) => ({ value: p.id, label: `${p.processName}（${p.processCode}）` }))}
            />
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入申请标题" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>

        {startFields.length > 0 && (
          <>
            <Divider orientation="left" plain>
              表单填报数据
            </Divider>
            <Form form={dataForm} layout="vertical" preserve={false}>
              {startFields.map((field) => (
                <Form.Item
                  key={field.fieldCode}
                  name={field.fieldCode}
                  label={field.fieldName}
                  rules={
                    field.requiredFlag === 1
                      ? [{ required: true, message: `请填写${field.fieldName}` }]
                      : undefined
                  }
                >
                  <FormFieldInput field={field} />
                </Form.Item>
              ))}
            </Form>
          </>
        )}
      </Modal>

      <InstanceDetailModal
        open={detailOpen}
        instanceId={detailId}
        onClose={() => setDetailOpen(false)}
      />
    </Space>
  );
}
