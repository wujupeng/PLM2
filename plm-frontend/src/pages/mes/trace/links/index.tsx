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
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { mesTraceLinkService as service } from '@/services/mesTraceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_TRACE_OBJECT_TYPE_LABEL,
  MES_TRACE_OBJECT_TYPE_OPTIONS,
  MES_TRACE_LINK_TYPE_LABEL,
  MES_TRACE_LINK_TYPE_OPTIONS,
  type MesTraceLink,
  type MesTraceLinkQuery,
  type MesTraceLinkSaveRequest,
} from '@/types/mesTrace';

const { Title } = Typography;

const MANAGE = 'mes:trace:link:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesTraceLinkSaveRequest, 'linkTime'> & {
  linkTime?: Dayjs;
};

export default function MesTraceLinkPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesTraceLink[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [objectType, setObjectType] = useState<string | undefined>(undefined);
  const [linkType, setLinkType] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, objType = objectType, lkType = linkType) => {
      setLoading(true);
      try {
        const params: MesTraceLinkQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          objectType: objType,
          linkType: lkType,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, objectType, linkType],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ objectType: 'SERIAL', linkType: 'PERSON' });
    setOpen(true);
  };

  const openEdit = (record: MesTraceLink) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      linkTime: record.linkTime ? dayjs(record.linkTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesTraceLinkSaveRequest = {
        ...values,
        linkTime: values.linkTime ? values.linkTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('追溯关联已创建');
      } else {
        await service.update(editId, payload);
        message.success('追溯关联已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('追溯关联已删除');
    void loadData();
  };

  const columns: ColumnsType<MesTraceLink> = [
    { title: '关联编号', dataIndex: 'linkNo', width: 190, fixed: 'left', render: plain },
    {
      title: '对象类型',
      dataIndex: 'objectType',
      width: 110,
      render: (v) => statusTag(MES_TRACE_OBJECT_TYPE_LABEL, v),
    },
    { title: '对象编码', dataIndex: 'objectCode', width: 150, render: plain },
    {
      title: '关联类型',
      dataIndex: 'linkType',
      width: 110,
      render: (v) => statusTag(MES_TRACE_LINK_TYPE_LABEL, v),
    },
    { title: '关联编码', dataIndex: 'linkCode', width: 150, render: plain },
    { title: '关联名称', dataIndex: 'linkName', width: 170, render: plain },
    { title: '关联取值', dataIndex: 'linkValue', width: 150, render: plain },
    { title: '关联时间', dataIndex: 'linkTime', width: 170, render: formatDateTime },
    { title: '操作人', dataIndex: 'operator', width: 110, render: plain },
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
            <Popconfirm title="确认删除该追溯关联？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        追溯关联
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="对象类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={objectType}
              onChange={(v) => setObjectType(v)}
              options={[...MES_TRACE_OBJECT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关联类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={linkType}
              onChange={(v) => setLinkType(v)}
              options={[...MES_TRACE_LINK_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="关联编号 / 对象编码 / 关联编码 / 关联名称"
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
                  void loadData(1, pageSize, keyword, objectType, linkType);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setObjectType(undefined);
                  setLinkType(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建追溯关联</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`追溯关联（共 ${total} 条）`}>
        <Table<MesTraceLink>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1700 }}
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
        title={editId == null ? '新建追溯关联' : '编辑追溯关联'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="linkNo" label="关联编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="objectType" label="对象类型">
            <Select placeholder="为空默认 SERIAL" options={[...MES_TRACE_OBJECT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="objectCode" label="对象编码" rules={[{ required: true, message: '请输入对象编码' }]}>
            <Input placeholder="请输入对象编码" />
          </Form.Item>
          <Form.Item name="linkType" label="关联类型">
            <Select placeholder="为空默认 PERSON" options={[...MES_TRACE_LINK_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="linkCode" label="关联编码">
            <Input placeholder="请输入关联编码" />
          </Form.Item>
          <Form.Item name="linkName" label="关联名称">
            <Input placeholder="请输入关联名称" />
          </Form.Item>
          <Form.Item name="linkValue" label="关联取值">
            <Input placeholder="请输入关联取值" />
          </Form.Item>
          <Form.Item name="linkTime" label="关联时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="operator" label="操作人">
            <Input placeholder="请输入操作人" />
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
