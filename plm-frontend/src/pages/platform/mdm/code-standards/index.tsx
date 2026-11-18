import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
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
import { mdmCodeStandardService } from '@/services/mdmService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MDM_RESET_CYCLE_LABEL,
  MDM_RESET_CYCLE_OPTIONS,
  MDM_STANDARD_STATUS_LABEL,
  MDM_STANDARD_STATUS_OPTIONS,
  type MdmCodeStandardItem,
  type MdmCodeStandardSaveParams,
} from '@/types/mdm';

const { Title } = Typography;

const MANAGE = 'platform:mdm:codestandard:manage';

export default function MdmCodeStandardPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MdmCodeStandardSaveParams>();
  const [data, setData] = useState<MdmCodeStandardItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [domainCode, setDomainCode] = useState('');
  const [resetCycle, setResetCycle] = useState<string | undefined>(undefined);
  const [standardStatus, setStandardStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      dCode = domainCode,
      rCycle = resetCycle,
      sStatus = standardStatus,
    ) => {
      setLoading(true);
      try {
        const res = await mdmCodeStandardService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          domainCode: dCode || undefined,
          resetCycle: rCycle,
          standardStatus: sStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, domainCode, resetCycle, standardStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ seqLength: 4, resetCycle: 'NONE', standardStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: MdmCodeStandardItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editId == null) {
        await mdmCodeStandardService.create(values);
        message.success('编码标准已创建');
      } else {
        await mdmCodeStandardService.update(editId, values);
        message.success('编码标准已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await mdmCodeStandardService.remove(id);
    message.success('编码标准已删除');
    void loadData();
  };

  const columns: ColumnsType<MdmCodeStandardItem> = [
    { title: '标准编号', dataIndex: 'standardNo', width: 160, fixed: 'left', render: plain },
    { title: '域编码', dataIndex: 'domainCode', width: 140, render: plain },
    { title: '标准编码', dataIndex: 'standardCode', width: 140, render: plain },
    { title: '标准名称', dataIndex: 'standardName', width: 200, render: plain },
    { title: '编码模板', dataIndex: 'codePattern', width: 180, render: plain },
    { title: '流水号位数', dataIndex: 'seqLength', width: 110, render: plain },
    { title: '重置周期', dataIndex: 'resetCycle', width: 120, render: (v) => statusTag(MDM_RESET_CYCLE_LABEL, v) },
    { title: '示例值', dataIndex: 'sampleValue', width: 140, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '标准状态',
      dataIndex: 'standardStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(MDM_STANDARD_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该编码标准？" onConfirm={() => void remove(record.id)}>
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
        编码标准
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
          <Form.Item label="重置周期">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={resetCycle}
              onChange={(v) => setResetCycle(v)}
              options={[...MDM_RESET_CYCLE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="标准状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={standardStatus}
              onChange={(v) => setStandardStatus(v)}
              options={[...MDM_STANDARD_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="标准编号 / 编码 / 名称"
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
                  void loadData(1, pageSize, keyword, domainCode, resetCycle, standardStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDomainCode('');
                  setResetCycle(undefined);
                  setStandardStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建编码标准</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`编码标准（共 ${total} 条）`}>
        <Table<MdmCodeStandardItem>
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
        title={editId == null ? '新建编码标准' : '编辑编码标准'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="standardNo" label="标准编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="domainCode" label="域编码" rules={[{ required: true, message: '请输入域编码' }]}>
            <Input placeholder="请输入域编码" />
          </Form.Item>
          <Form.Item name="standardCode" label="标准编码" rules={[{ required: true, message: '请输入标准编码' }]}>
            <Input placeholder="请输入标准编码" />
          </Form.Item>
          <Form.Item name="standardName" label="标准名称" rules={[{ required: true, message: '请输入标准名称' }]}>
            <Input placeholder="请输入标准名称" />
          </Form.Item>
          <Form.Item name="codePattern" label="编码模板">
            <Input placeholder="如 MAT-{SEQ}" />
          </Form.Item>
          <Form.Item name="seqLength" label="流水号位数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="为空默认 4" />
          </Form.Item>
          <Form.Item name="resetCycle" label="重置周期">
            <Select placeholder="为空默认 NONE" options={[...MDM_RESET_CYCLE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sampleValue" label="示例值">
            <Input placeholder="请输入示例值" />
          </Form.Item>
          <Form.Item name="standardStatus" label="标准状态">
            <Select placeholder="为空默认 ACTIVE" options={[...MDM_STANDARD_STATUS_OPTIONS]} />
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
