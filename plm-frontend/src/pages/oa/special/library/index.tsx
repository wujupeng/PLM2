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
  Tabs,
  Typography,
  message,
} from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { oaLibraryService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import BizFlowTab, {
  DATE_FORMAT,
  bizStatusTag,
  formatDate,
  formatDateTime,
  plain,
  type BizFlowService,
  type BizSubmitValue,
} from '@/pages/oa/biz/BizFlowTab';
import {
  OA_LIBRARY_BORROW_STATUS_COLOR,
  OA_LIBRARY_BORROW_STATUS_LABEL,
  OA_LIBRARY_BORROW_STATUS_OPTIONS,
  type OaBizFlowItem,
  type OaLibraryBookSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const LIBRARY_LIST = 'oa:library:list';
const LIBRARY_APPLY = 'oa:library:apply';
const LIBRARY_MANAGE = 'oa:library:manage';

const borrowStatusTag = bizStatusTag(OA_LIBRARY_BORROW_STATUS_LABEL, OA_LIBRARY_BORROW_STATUS_COLOR);

const libraryBookService: BizFlowService<OaLibraryBookSaveParams> = {
  page: oaLibraryService.pageBooks,
  detail: oaLibraryService.bookDetail,
  create: oaLibraryService.createBook,
  update: oaLibraryService.updateBook,
  remove: oaLibraryService.removeBook,
};

/* ---------------- 1. 图书档案（OA-DEV-082，无流程） ---------------- */

interface LibraryBookFormValues extends BizSubmitValue {
  bookCode?: string;
  bookName?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  category?: string;
  publishDate?: Dayjs;
  location?: string;
  totalQty?: number;
  status?: number;
  remark?: string;
}

function LibraryBookTab() {
  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '图书编号', dataIndex: 'bookCode', width: 150, fixed: 'left', render: plain },
    { title: '图书名称', dataIndex: 'bookName', width: 200, render: plain },
    { title: '作者', dataIndex: 'author', width: 140, render: plain },
    { title: '出版社', dataIndex: 'publisher', width: 160, render: plain },
    { title: 'ISBN', dataIndex: 'isbn', width: 150, render: plain },
    { title: '出版日期', dataIndex: 'publishDate', width: 120, render: formatDate },
    { title: '总数量', dataIndex: 'totalQty', width: 90, render: plain },
    { title: '可借数量', dataIndex: 'availableQty', width: 100, render: plain },
    { title: '状态', dataIndex: 'status', width: 90, render: (v) => (Number(v) === 1 ? '启用' : '停用') },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <BizFlowTab<OaLibraryBookSaveParams, LibraryBookFormValues>
      title="图书"
      service={libraryBookService}
      columns={columns}
      listPerm={LIBRARY_LIST}
      applyPerm={LIBRARY_MANAGE}
      noFlow
      statusOptions={[]}
      initialValues={{ status: 1, totalQty: 1 }}
      detailFields={[
        { label: '图书编号', key: 'bookCode' },
        { label: '图书名称', key: 'bookName' },
        { label: '作者', key: 'author' },
        { label: '出版社', key: 'publisher' },
        { label: 'ISBN', key: 'isbn' },
        { label: '分类', key: 'category' },
        { label: '出版日期', key: 'publishDate', render: (v) => formatDate(v) },
        { label: '存放位置', key: 'location' },
        { label: '总数量', key: 'totalQty' },
        { label: '可借数量', key: 'availableQty' },
        { label: '状态', key: 'status', render: (v) => (Number(v) === 1 ? '启用' : '停用') },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={() => (
        <>
          <Form.Item name="bookCode" label="图书编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="bookName" label="图书名称" rules={[{ required: true, message: '请输入图书名称' }]}>
            <Input placeholder="请输入图书名称" />
          </Form.Item>
          <Form.Item name="author" label="作者">
            <Input placeholder="请输入作者" />
          </Form.Item>
          <Form.Item name="publisher" label="出版社">
            <Input placeholder="请输入出版社" />
          </Form.Item>
          <Form.Item name="isbn" label="ISBN">
            <Input placeholder="请输入 ISBN" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input placeholder="请输入分类" />
          </Form.Item>
          <Form.Item name="publishDate" label="出版日期">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="location" label="存放位置">
            <Input placeholder="请输入存放位置" />
          </Form.Item>
          <Form.Item name="totalQty" label="总数量">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入总数量" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ label: '启用', value: 1 }, { label: '停用', value: 0 }]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        bookCode: r.bookCode,
        bookName: r.bookName,
        author: r.author,
        publisher: r.publisher,
        isbn: r.isbn,
        category: r.category,
        publishDate: r.publishDate ? dayjs(r.publishDate) : undefined,
        location: r.location,
        totalQty: r.totalQty,
        status: r.status,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        bookCode: v.bookCode,
        bookName: v.bookName,
        author: v.author,
        publisher: v.publisher,
        isbn: v.isbn,
        category: v.category,
        publishDate: v.publishDate ? v.publishDate.format(DATE_FORMAT) : undefined,
        location: v.location,
        totalQty: v.totalQty,
        status: v.status,
        remark: v.remark,
      })}
    />
  );
}

/* ---------------- 2. 图书借阅（OA-DEV-082） ---------------- */

interface BorrowFormValues {
  bookId: number;
  borrowDate?: Dayjs;
  dueDate?: Dayjs;
  remark?: string;
}

function BorrowTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<BorrowFormValues>();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [books, setBooks] = useState<OaBizFlowItem[]>([]);

  const [data, setData] = useState<OaBizFlowItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertList, setAlertList] = useState<OaBizFlowItem[]>([]);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond?: { keyword?: string; borrowStatus?: string }) => {
      setLoading(true);
      try {
        const res = await oaLibraryService.pageBorrows({
          pageNum: page,
          pageSize: size,
          keyword: cond?.keyword || undefined,
          flowStatus: cond?.borrowStatus || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openBorrow = async () => {
    form.resetFields();
    const res = await oaLibraryService.listAvailableBooks();
    setBooks(res || []);
    setOpen(true);
  };

  const submitBorrow = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await oaLibraryService.borrow({
        bookId: values.bookId,
        borrowDate: values.borrowDate ? values.borrowDate.format(DATE_FORMAT) : undefined,
        dueDate: values.dueDate ? values.dueDate.format(DATE_FORMAT) : undefined,
        remark: values.remark,
      });
      message.success('借阅成功');
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async (id: number) => {
    await oaLibraryService.returnBook(id);
    message.success('已归还');
    void loadData();
  };

  const handleRenew = async (id: number) => {
    await oaLibraryService.renew(id);
    message.success('已续借');
    void loadData();
  };

  const openAlert = async () => {
    setAlertOpen(true);
    setAlertLoading(true);
    try {
      const res = await oaLibraryService.overdueList();
      setAlertList(res || []);
    } finally {
      setAlertLoading(false);
    }
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '借阅单号', dataIndex: 'borrowNo', width: 150, fixed: 'left', render: plain },
    { title: '图书编号', dataIndex: 'bookCode', width: 130, render: plain },
    { title: '图书名称', dataIndex: 'bookName', width: 180, render: plain },
    { title: '借阅人', dataIndex: 'borrowerName', width: 110, render: plain },
    { title: '借阅日期', dataIndex: 'borrowDate', width: 120, render: formatDate },
    { title: '应还日期', dataIndex: 'dueDate', width: 120, render: formatDate },
    { title: '归还日期', dataIndex: 'returnDate', width: 120, render: formatDate },
    { title: '续借次数', dataIndex: 'renewCount', width: 90, render: plain },
    { title: '状态', dataIndex: 'borrowStatus', width: 100, render: borrowStatusTag },
    { title: '逾期天数', dataIndex: 'overdueDays', width: 100, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {hasPermission(LIBRARY_APPLY) && (record.borrowStatus === 'BORROWED' || record.borrowStatus === 'OVERDUE') && (
            <Popconfirm title="确认归还该图书？" onConfirm={() => void handleReturn(record.id)}>
              <Button type="link" size="small">
                归还
              </Button>
            </Popconfirm>
          )}
          {hasPermission(LIBRARY_APPLY) && record.borrowStatus === 'BORROWED' && (
            <Popconfirm title="确认续借该图书？" onConfirm={() => void handleRenew(record.id)}>
              <Button type="link" size="small">
                续借
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form
          layout="inline"
          onFinish={(values: { keyword?: string; borrowStatus?: string }) => {
            setPageNum(1);
            void loadData(1, pageSize, values);
          }}
        >
          <Form.Item name="borrowStatus" label="借阅状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={[...OA_LIBRARY_BORROW_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="单号 / 图书 / 借阅人" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, {});
                }}
              >
                重置
              </Button>
              <Button onClick={() => void openAlert()}>逾期提醒</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`图书借阅列表（共 ${total} 条）`}
        extra={
          hasPermission(LIBRARY_APPLY) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => void openBorrow()}>
              新增借阅
            </Button>
          )
        }
      >
        <Table<OaBizFlowItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1400 }}
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
        title="新增借阅"
        open={open}
        onOk={() => void submitBorrow()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="bookId" label="图书" rules={[{ required: true, message: '请选择图书' }]}>
            <Select
              placeholder="请选择可借图书"
              showSearch
              optionFilterProp="label"
              options={books.map((b) => ({
                label: `${b.bookName}（可借 ${b.availableQty ?? 0}）`,
                value: b.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="borrowDate" label="借阅日期">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="dueDate" label="应还日期">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="逾期提醒"
        open={alertOpen}
        onCancel={() => setAlertOpen(false)}
        footer={<Button onClick={() => setAlertOpen(false)}>关闭</Button>}
        width={760}
      >
        <Table<OaBizFlowItem>
          rowKey="id"
          size="small"
          loading={alertLoading}
          dataSource={alertList}
          pagination={false}
          columns={[
            { title: '借阅单号', dataIndex: 'borrowNo', render: plain },
            { title: '图书名称', dataIndex: 'bookName', render: plain },
            { title: '借阅人', dataIndex: 'borrowerName', render: plain },
            { title: '应还日期', dataIndex: 'dueDate', render: (v) => formatDate(v) },
            { title: '逾期天数', dataIndex: 'overdueDays', render: plain },
          ]}
        />
      </Modal>
    </Space>
  );
}

export default function OaLibraryPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        图书管理
      </Title>

      <Tabs
        items={[
          { key: 'books', label: '图书档案', children: <LibraryBookTab /> },
          { key: 'borrows', label: '借阅记录', children: <BorrowTab /> },
        ]}
      />
    </Space>
  );
}
