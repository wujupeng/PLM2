import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
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
import { mobileExceptionService } from '@/services/mobileService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/mobile/shared';
import {
  EXCEPTION_STATUS_LABEL,
  EXCEPTION_STATUS_OPTIONS,
  EXCEPTION_TYPE_LABEL,
  EXCEPTION_TYPE_OPTIONS,
  type MobileExceptionItem,
  type MobileExceptionResolveParams,
  type MobileExceptionSaveParams,
} from '@/types/mobile';

const { Title } = Typography;

const EXCEPTION_MANAGE = 'platform:mobile:exception:manage';

export default function MobileExceptionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MobileExceptionSaveParams>();
  const [resolveForm] = Form.useForm<MobileExceptionResolveParams>();
  const [data, setData] = useState<MobileExceptionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [sceneCode, setSceneCode] = useState('');
  const [errorType, setErrorType] = useState<string | undefined>(undefined);
  const [exceptionStatus, setExceptionStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveId, setResolveId] = useState<number | null>(null);
  const [resolveSaving, setResolveSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      sCode = sceneCode,
      eType = errorType,
      eStatus = exceptionStatus,
    ) => {
      setLoading(true);
      try {
        const res = await mobileExceptionService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          sceneCode: sCode || undefined,
          errorType: eType,
          exceptionStatus: eStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, sceneCode, errorType, exceptionStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ errorType: 'SCAN_FAIL', exceptionStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: MobileExceptionItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MobileExceptionSaveParams = { ...values };
      if (editId == null) {
        await mobileExceptionService.create(payload);
        message.success('移动异常已创建');
      } else {
        await mobileExceptionService.update(editId, payload);
        message.success('移动异常已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await mobileExceptionService.remove(id);
    message.success('移动异常已删除');
    void loadData();
  };

  const handle = async (id: number) => {
    await mobileExceptionService.handle(id);
    message.success('移动异常已受理');
    void loadData();
  };

  const ignore = async (id: number) => {
    await mobileExceptionService.ignore(id);
    message.success('移动异常已忽略');
    void loadData();
  };

  const openResolve = (record: MobileExceptionItem) => {
    setResolveId(record.id);
    resolveForm.resetFields();
    resolveForm.setFieldsValue({ handleNote: record.handleNote });
    setResolveOpen(true);
  };

  const submitResolve = async () => {
    const values = await resolveForm.validateFields();
    setResolveSaving(true);
    try {
      if (resolveId != null) {
        await mobileExceptionService.resolve(resolveId, { handleNote: values.handleNote || undefined });
        message.success('移动异常已解决');
        setResolveOpen(false);
        void loadData();
      }
    } finally {
      setResolveSaving(false);
    }
  };

  const columns: ColumnsType<MobileExceptionItem> = [
    { title: '异常编号', dataIndex: 'exceptionNo', width: 160, fixed: 'left', render: plain },
    { title: '场景编码', dataIndex: 'sceneCode', width: 140, render: plain },
    { title: '条码', dataIndex: 'barcode', width: 180, render: plain },
    { title: '异常类型', dataIndex: 'errorType', width: 130, render: (v) => statusTag(EXCEPTION_TYPE_LABEL, v) },
    { title: '错误信息', dataIndex: 'errorMessage', width: 220, ellipsis: true, render: plain },
    { title: '处理人', dataIndex: 'handlerName', width: 120, render: plain },
    { title: '处理时间', dataIndex: 'handledTime', width: 160, render: formatDateTime },
    { title: '处理说明', dataIndex: 'handleNote', width: 200, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'exceptionStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(EXCEPTION_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(EXCEPTION_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认受理该移动异常？" onConfirm={() => void handle(record.id)}>
              <Button type="link" size="small">
                受理
              </Button>
            </Popconfirm>
            <Button type="link" size="small" onClick={() => openResolve(record)}>
              解决
            </Button>
            <Popconfirm title="确认忽略该移动异常？" onConfirm={() => void ignore(record.id)}>
              <Button type="link" size="small">
                忽略
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该移动异常？" onConfirm={() => void remove(record.id)}>
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
        移动异常队列
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="场景编码">
            <Input
              placeholder="请输入场景编码"
              allowClear
              style={{ width: 160 }}
              value={sceneCode}
              onChange={(e) => setSceneCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="异常类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 150 }}
              value={errorType}
              onChange={(v) => setErrorType(v)}
              options={[...EXCEPTION_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="异常状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={exceptionStatus}
              onChange={(v) => setExceptionStatus(v)}
              options={[...EXCEPTION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="异常编号 / 条码"
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
                  void loadData(1, pageSize, keyword, sceneCode, errorType, exceptionStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSceneCode('');
                  setErrorType(undefined);
                  setExceptionStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(EXCEPTION_MANAGE) && <Button onClick={openCreate}>新建移动异常</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`移动异常队列（共 ${total} 条）`}>
        <Table<MobileExceptionItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2500 }}
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
        title={editId == null ? '新建移动异常' : '编辑移动异常'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="exceptionNo" label="异常编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="sceneCode" label="场景编码">
            <Input placeholder="请输入场景编码" />
          </Form.Item>
          <Form.Item name="barcode" label="条码">
            <Input placeholder="请输入条码" />
          </Form.Item>
          <Form.Item name="errorType" label="异常类型">
            <Select placeholder="请选择" options={[...EXCEPTION_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="errorMessage" label="错误信息">
            <Input.TextArea rows={2} placeholder="请输入错误信息" />
          </Form.Item>
          <Form.Item name="exceptionStatus" label="异常状态">
            <Select placeholder="请选择" options={[...EXCEPTION_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="handlerName" label="处理人">
            <Input placeholder="请输入处理人" />
          </Form.Item>
          <Form.Item name="handledTime" label="处理时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="handleNote" label="处理说明">
            <Input.TextArea rows={2} placeholder="请输入处理说明" />
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

      <Modal
        title="解决移动异常"
        open={resolveOpen}
        onOk={() => void submitResolve()}
        confirmLoading={resolveSaving}
        onCancel={() => setResolveOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={resolveForm} layout="vertical" preserve={false}>
          <Form.Item name="handleNote" label="处理说明">
            <Input.TextArea rows={4} placeholder="请输入处理说明（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
