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
  Statistic,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { docStateDefService } from '@/services/docStateService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { boolTag, statusTag } from '@/pages/platform/doc-state/shared';
import {
  DOC_STATE_BOOL_OPTIONS,
  DOC_STATE_STATUS_LABEL,
  DOC_STATE_STATUS_OPTIONS,
  DOC_STATE_TYPE_LABEL,
  DOC_STATE_TYPE_OPTIONS,
  type DocStateDefItem,
  type DocStateDefSaveParams,
  type DocStateDefStats,
} from '@/types/docstate';

const { Title } = Typography;

const DOC_STATE_DEF_MANAGE = 'platform:docstate:docstate:manage';

export default function DocStateDefPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DocStateDefSaveParams>();
  const [data, setData] = useState<DocStateDefItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [docType, setDocType] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [stateType, setStateType] = useState<string | undefined>(undefined);
  const [stateStatus, setStateStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<DocStateDefStats>({});

  const loadStats = useCallback(async () => {
    const res = await docStateDefService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      dType = docType,
      sCode = stateCode,
      sType = stateType,
      sStatus = stateStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await docStateDefService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          docType: dType || undefined,
          stateCode: sCode || undefined,
          stateType: sType,
          stateStatus: sStatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, docType, stateCode, stateType, stateStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      stateType: 'DRAFT',
      stateStatus: 'ACTIVE',
      isInitial: 0,
      isFinal: 0,
      allowEdit: 0,
      allowDelete: 0,
    });
    setOpen(true);
  };

  const openEdit = (record: DocStateDefItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: DocStateDefSaveParams = { ...values };
      if (editId == null) {
        await docStateDefService.create(payload);
        message.success('单据状态定义已创建');
      } else {
        await docStateDefService.update(editId, payload);
        message.success('单据状态定义已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await docStateDefService.remove(id);
    message.success('单据状态定义已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<DocStateDefItem> = [
    { title: '单据类型', dataIndex: 'docType', width: 140, fixed: 'left', render: plain },
    { title: '状态编码', dataIndex: 'stateCode', width: 140, render: plain },
    { title: '状态名称', dataIndex: 'stateName', width: 160, render: plain },
    {
      title: '状态类型',
      dataIndex: 'stateType',
      width: 120,
      render: (v) => statusTag(DOC_STATE_TYPE_LABEL, v),
    },
    { title: '起始态', dataIndex: 'isInitial', width: 100, render: (v) => boolTag(v) },
    { title: '终态', dataIndex: 'isFinal', width: 100, render: (v) => boolTag(v) },
    { title: '可编辑', dataIndex: 'allowEdit', width: 100, render: (v) => boolTag(v) },
    { title: '可删除', dataIndex: 'allowDelete', width: 100, render: (v) => boolTag(v) },
    { title: '排序号', dataIndex: 'sortNo', width: 100, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'stateStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(DOC_STATE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(DOC_STATE_DEF_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该单据状态定义？"
              onConfirm={() => void act(docStateDefService.enable, record.id, '单据状态定义已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该单据状态定义？"
              onConfirm={() => void act(docStateDefService.disable, record.id, '单据状态定义已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该单据状态定义？" onConfirm={() => void remove(record.id)}>
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
        单据状态定义
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="状态总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="停用" value={Number(stats.disabled ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="单据类型">
            <Input
              placeholder="请输入单据类型"
              allowClear
              style={{ width: 160 }}
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="状态编码">
            <Input
              placeholder="请输入状态编码"
              allowClear
              style={{ width: 160 }}
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="状态类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={stateType}
              onChange={(v) => setStateType(v)}
              options={[...DOC_STATE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={stateStatus}
              onChange={(v) => setStateStatus(v)}
              options={[...DOC_STATE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="状态编码 / 名称"
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
                  void loadData(1, pageSize, keyword, docType, stateCode, stateType, stateStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDocType('');
                  setStateCode('');
                  setStateType(undefined);
                  setStateStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(DOC_STATE_DEF_MANAGE) && <Button onClick={openCreate}>新建状态定义</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`单据状态定义（共 ${total} 条）`}>
        <Table<DocStateDefItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2100 }}
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
        title={editId == null ? '新建状态定义' : '编辑状态定义'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="docType" label="单据类型" rules={[{ required: true, message: '请输入单据类型' }]}>
            <Input placeholder="请输入单据类型" />
          </Form.Item>
          <Form.Item name="stateCode" label="状态编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="stateName" label="状态名称" rules={[{ required: true, message: '请输入状态名称' }]}>
            <Input placeholder="请输入状态名称" />
          </Form.Item>
          <Form.Item name="stateType" label="状态类型">
            <Select placeholder="请选择" options={[...DOC_STATE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="isInitial" label="起始态">
            <Select placeholder="请选择" options={[...DOC_STATE_BOOL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="isFinal" label="终态">
            <Select placeholder="请选择" options={[...DOC_STATE_BOOL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="allowEdit" label="允许编辑">
            <Select placeholder="请选择" options={[...DOC_STATE_BOOL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="allowDelete" label="允许删除">
            <Select placeholder="请选择" options={[...DOC_STATE_BOOL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sortNo" label="排序号">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入排序号" />
          </Form.Item>
          <Form.Item name="stateStatus" label="状态">
            <Select placeholder="请选择" options={[...DOC_STATE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
