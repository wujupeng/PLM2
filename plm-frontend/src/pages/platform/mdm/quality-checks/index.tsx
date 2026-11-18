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
import { mdmQualityCheckService } from '@/services/mdmService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MDM_CHECK_RESULT_LABEL,
  MDM_CHECK_RESULT_OPTIONS,
  type MdmQualityCheckItem,
  type MdmQualityCheckSaveParams,
} from '@/types/mdm';

const { Title } = Typography;

/** 后端 LocalDateTime 仅接受 ISO-8601 格式（yyyy-MM-ddTHH:mm:ss）。 */
const DATETIME_SUBMIT_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const DATETIME_PICKER_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const MANAGE = 'platform:mdm:qualitycheck:manage';

/** 表单值类型：日期字段使用 Dayjs，提交时格式化为 ISO 字符串。 */
type FormValues = Omit<MdmQualityCheckSaveParams, 'checkTime'> & {
  checkTime?: Dayjs;
};

export default function MdmQualityCheckPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MdmQualityCheckItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [domainCode, setDomainCode] = useState('');
  const [checkResult, setCheckResult] = useState<string | undefined>(undefined);
  const [checkItem, setCheckItem] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      dCode = domainCode,
      cResult = checkResult,
      cItem = checkItem,
    ) => {
      setLoading(true);
      try {
        const res = await mdmQualityCheckService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          domainCode: dCode || undefined,
          checkResult: cResult,
          checkItem: cItem || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, domainCode, checkResult, checkItem],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ checkResult: 'PASS', score: 100 });
    setOpen(true);
  };

  const openEdit = (record: MdmQualityCheckItem) => {
    setEditId(record.id);
    const values: FormValues = {
      ...record,
      checkTime: record.checkTime ? dayjs(record.checkTime) : undefined,
    };
    form.setFieldsValue(values);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MdmQualityCheckSaveParams = {
        ...values,
        checkTime: values.checkTime ? values.checkTime.format(DATETIME_SUBMIT_FORMAT) : undefined,
      };
      if (editId == null) {
        await mdmQualityCheckService.create(payload);
        message.success('数据质量校验已创建');
      } else {
        await mdmQualityCheckService.update(editId, payload);
        message.success('数据质量校验已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await mdmQualityCheckService.remove(id);
    message.success('数据质量校验已删除');
    void loadData();
  };

  const columns: ColumnsType<MdmQualityCheckItem> = [
    { title: '校验编号', dataIndex: 'checkNo', width: 160, fixed: 'left', render: plain },
    { title: '域编码', dataIndex: 'domainCode', width: 140, render: plain },
    { title: '主数据编码', dataIndex: 'masterCode', width: 150, render: plain },
    { title: '校验项', dataIndex: 'checkItem', width: 160, render: plain },
    { title: '评分', dataIndex: 'score', width: 90, render: plain },
    { title: '校验信息', dataIndex: 'message', width: 180, ellipsis: true, render: plain },
    { title: '校验时间', dataIndex: 'checkTime', width: 170, render: formatDateTime },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '校验结果',
      dataIndex: 'checkResult',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(MDM_CHECK_RESULT_LABEL, v),
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
            <Popconfirm title="确认删除该数据质量校验？" onConfirm={() => void remove(record.id)}>
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
        数据质量校验
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
          <Form.Item label="校验结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={checkResult}
              onChange={(v) => setCheckResult(v)}
              options={[...MDM_CHECK_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="校验项">
            <Input
              placeholder="请输入校验项"
              allowClear
              style={{ width: 160 }}
              value={checkItem}
              onChange={(e) => setCheckItem(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="校验编号 / 主数据编码"
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
                  void loadData(1, pageSize, keyword, domainCode, checkResult, checkItem);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDomainCode('');
                  setCheckResult(undefined);
                  setCheckItem('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建数据质量校验</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`数据质量校验（共 ${total} 条）`}>
        <Table<MdmQualityCheckItem>
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
        title={editId == null ? '新建数据质量校验' : '编辑数据质量校验'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="checkNo" label="校验编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="domainCode" label="域编码" rules={[{ required: true, message: '请输入域编码' }]}>
            <Input placeholder="请输入域编码" />
          </Form.Item>
          <Form.Item name="masterCode" label="主数据编码">
            <Input placeholder="请输入主数据编码" />
          </Form.Item>
          <Form.Item name="checkItem" label="校验项">
            <Input placeholder="请输入校验项" />
          </Form.Item>
          <Form.Item name="checkResult" label="校验结果">
            <Select placeholder="为空默认 PASS" options={[...MDM_CHECK_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="score" label="评分">
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="为空默认 100" />
          </Form.Item>
          <Form.Item name="message" label="校验信息">
            <Input.TextArea rows={2} placeholder="请输入校验信息" />
          </Form.Item>
          <Form.Item name="checkTime" label="校验时间">
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
