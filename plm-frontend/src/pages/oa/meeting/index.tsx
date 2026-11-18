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
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import {
  oaMeetingBookingService,
  oaMeetingRoomService,
  oaScheduleService,
} from '@/services/oaService';
import UserSelect from '@/pages/oa/UserSelect';
import {
  OA_MEETING_BOOKING_STATUS_LABEL,
  OA_MEETING_BOOKING_STATUS_OPTIONS,
  OA_SCHEDULE_SHARE_SCOPE_LABEL,
  OA_SCHEDULE_SHARE_SCOPE_OPTIONS,
  OA_SCHEDULE_TYPE_LABEL,
  OA_SCHEDULE_TYPE_OPTIONS,
  type OaMeetingBookingItem,
  type OaMeetingBookingQuery,
  type OaMeetingBookingSaveParams,
  type OaMeetingRoomItem,
  type OaMeetingRoomQuery,
  type OaMeetingRoomSaveParams,
  type OaScheduleItem,
  type OaScheduleQuery,
  type OaScheduleSaveParams,
} from '@/types/oa';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const DATE_FORMAT = 'YYYY-MM-DD';
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';
const DATETIME_SUBMIT_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/** 会议室状态（与后端 room_status 取值保持一致） */
const ROOM_STATUS_OPTIONS = [
  { label: '启用', value: 'ENABLED' },
  { label: '停用', value: 'DISABLED' },
];

const ROOM_STATUS_LABEL: Record<string, string> = {
  ENABLED: '启用',
  DISABLED: '停用',
};

/** 会议室预约状态标签颜色 */
const BOOKING_STATUS_COLOR: Record<string, string> = {
  BOOKED: 'blue',
  CANCELLED: 'default',
  FINISHED: 'green',
};

/** 全天标识选项 */
const ALL_DAY_OPTIONS = [
  { label: '否', value: 0 },
  { label: '是', value: 1 },
];

type RangeValue = [Dayjs, Dayjs] | null;

interface RoomFormValues {
  roomCode: string;
  roomName: string;
  location?: string;
  capacity?: number;
  deviceJson?: string;
  roomStatus?: string;
  managerUserId?: number;
  remark?: string;
}

interface RoomSearchState {
  keyword?: string;
  roomStatus?: string;
}

interface BookingFormValues {
  roomId: number;
  subject: string;
  startTime?: Dayjs;
  endTime?: Dayjs;
  attendeeJson?: string;
  attendeeCount?: number;
  remark?: string;
}

interface BookingSearchState {
  roomId?: number;
  bookingStatus?: string;
  range?: RangeValue;
}

interface ScheduleFormValues {
  title: string;
  scheduleType?: string;
  startTime?: Dayjs;
  endTime?: Dayjs;
  allDayFlag?: number;
  location?: string;
  participantJson?: string;
  shareScope?: string;
  remindMinutes?: number;
  content?: string;
  remark?: string;
}

interface ScheduleSearchState {
  scheduleType?: string;
  range?: RangeValue;
}

export default function OaMeetingPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const [roomForm] = Form.useForm<RoomFormValues>();
  const [bookingForm] = Form.useForm<BookingFormValues>();
  const [scheduleForm] = Form.useForm<ScheduleFormValues>();

  /* ---------------- 会议室管理 ---------------- */
  const [roomData, setRoomData] = useState<OaMeetingRoomItem[]>([]);
  const [roomTotal, setRoomTotal] = useState(0);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomPageNum, setRoomPageNum] = useState(1);
  const [roomPageSize, setRoomPageSize] = useState(10);
  const [roomSearch, setRoomSearch] = useState<RoomSearchState>({});
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomEditing, setRoomEditing] = useState<OaMeetingRoomItem | null>(null);
  const [roomSubmitting, setRoomSubmitting] = useState(false);

  /* ---------------- 会议室预约 ---------------- */
  const [bookingData, setBookingData] = useState<OaMeetingBookingItem[]>([]);
  const [bookingTotal, setBookingTotal] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingPageNum, setBookingPageNum] = useState(1);
  const [bookingPageSize, setBookingPageSize] = useState(10);
  const [bookingSearch, setBookingSearch] = useState<BookingSearchState>({});
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingEditing, setBookingEditing] = useState<OaMeetingBookingItem | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [rooms, setRooms] = useState<OaMeetingRoomItem[]>([]);

  /* ---------------- 我的日程 ---------------- */
  const [scheduleData, setScheduleData] = useState<OaScheduleItem[]>([]);
  const [scheduleTotal, setScheduleTotal] = useState(0);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [schedulePageNum, setSchedulePageNum] = useState(1);
  const [schedulePageSize, setSchedulePageSize] = useState(10);
  const [scheduleSearch, setScheduleSearch] = useState<ScheduleSearchState>({});
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleEditing, setScheduleEditing] = useState<OaScheduleItem | null>(null);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  /* ---------------- 数据加载 ---------------- */
  const loadRooms = useCallback(
    async (page = roomPageNum, size = roomPageSize, cond = roomSearch) => {
      setRoomLoading(true);
      try {
        const params: OaMeetingRoomQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          roomStatus: cond.roomStatus || undefined,
        };
        const res = await oaMeetingRoomService.page(params);
        setRoomData(res.list || []);
        setRoomTotal(res.total || 0);
      } finally {
        setRoomLoading(false);
      }
    },
    [roomPageNum, roomPageSize, roomSearch],
  );

  const loadBookings = useCallback(
    async (page = bookingPageNum, size = bookingPageSize, cond = bookingSearch) => {
      setBookingLoading(true);
      try {
        const params: OaMeetingBookingQuery = {
          pageNum: page,
          pageSize: size,
          roomId: cond.roomId,
          bookingStatus: cond.bookingStatus || undefined,
          startDate: cond.range?.[0] ? cond.range[0].format(DATE_FORMAT) : undefined,
          endDate: cond.range?.[1] ? cond.range[1].format(DATE_FORMAT) : undefined,
        };
        const res = await oaMeetingBookingService.page(params);
        setBookingData(res.list || []);
        setBookingTotal(res.total || 0);
      } finally {
        setBookingLoading(false);
      }
    },
    [bookingPageNum, bookingPageSize, bookingSearch],
  );

  const loadSchedules = useCallback(
    async (page = schedulePageNum, size = schedulePageSize, cond = scheduleSearch) => {
      setScheduleLoading(true);
      try {
        const params: OaScheduleQuery = {
          pageNum: page,
          pageSize: size,
          scheduleType: cond.scheduleType || undefined,
          startDate: cond.range?.[0] ? cond.range[0].format(DATE_FORMAT) : undefined,
          endDate: cond.range?.[1] ? cond.range[1].format(DATE_FORMAT) : undefined,
        };
        const res = await oaScheduleService.page(params);
        setScheduleData(res.list || []);
        setScheduleTotal(res.total || 0);
      } finally {
        setScheduleLoading(false);
      }
    },
    [schedulePageNum, schedulePageSize, scheduleSearch],
  );

  const loadRoomOptions = useCallback(async () => {
    const list = await oaMeetingRoomService.listAll();
    setRooms(list || []);
  }, []);

  useEffect(() => {
    void loadRooms(1, roomPageSize, {});
    void loadBookings(1, bookingPageSize, {});
    void loadSchedules(1, schedulePageSize, {});
    void loadRoomOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roomOptions = rooms.map((r) => ({
    value: r.id,
    label: `${r.roomName}（${r.roomCode}）`,
  }));

  /* ---------------- 会议室管理操作 ---------------- */
  const onRoomSearch = (values: RoomSearchState) => {
    const cond = { ...values };
    setRoomSearch(cond);
    setRoomPageNum(1);
    void loadRooms(1, roomPageSize, cond);
  };

  const onRoomReset = () => {
    setRoomSearch({});
    setRoomPageNum(1);
    void loadRooms(1, roomPageSize, {});
  };

  const openRoomCreate = () => {
    setRoomEditing(null);
    roomForm.resetFields();
    roomForm.setFieldsValue({ roomStatus: 'ENABLED' });
    setRoomModalOpen(true);
  };

  const openRoomEdit = (record: OaMeetingRoomItem) => {
    setRoomEditing(record);
    roomForm.resetFields();
    roomForm.setFieldsValue({
      roomCode: record.roomCode,
      roomName: record.roomName,
      location: record.location,
      capacity: record.capacity,
      deviceJson: record.deviceJson,
      roomStatus: record.roomStatus,
      managerUserId: record.managerUserId,
      remark: record.remark,
    });
    setRoomModalOpen(true);
  };

  const handleRoomSubmit = async () => {
    const values = await roomForm.validateFields();
    const payload: OaMeetingRoomSaveParams = {
      roomCode: values.roomCode,
      roomName: values.roomName,
      location: values.location,
      capacity: values.capacity,
      deviceJson: values.deviceJson,
      roomStatus: values.roomStatus,
      managerUserId: values.managerUserId,
      remark: values.remark,
    };
    setRoomSubmitting(true);
    try {
      if (roomEditing) {
        await oaMeetingRoomService.update(roomEditing.id, payload);
        message.success('更新成功');
      } else {
        await oaMeetingRoomService.create(payload);
        message.success('新增成功');
      }
      setRoomModalOpen(false);
      void loadRooms();
      void loadRoomOptions();
    } finally {
      setRoomSubmitting(false);
    }
  };

  const handleRoomDelete = async (record: OaMeetingRoomItem) => {
    await oaMeetingRoomService.remove(record.id);
    message.success('删除成功');
    void loadRooms();
    void loadRoomOptions();
  };

  /* ---------------- 会议室预约操作 ---------------- */
  const onBookingSearch = (values: BookingSearchState) => {
    const cond = { ...values };
    setBookingSearch(cond);
    setBookingPageNum(1);
    void loadBookings(1, bookingPageSize, cond);
  };

  const onBookingReset = () => {
    setBookingSearch({});
    setBookingPageNum(1);
    void loadBookings(1, bookingPageSize, {});
  };

  const openBookingCreate = () => {
    setBookingEditing(null);
    bookingForm.resetFields();
    setBookingModalOpen(true);
  };

  const openBookingEdit = (record: OaMeetingBookingItem) => {
    setBookingEditing(record);
    bookingForm.resetFields();
    bookingForm.setFieldsValue({
      roomId: record.roomId,
      subject: record.subject,
      startTime: record.startTime ? dayjs(record.startTime) : undefined,
      endTime: record.endTime ? dayjs(record.endTime) : undefined,
      attendeeJson: record.attendeeJson,
      attendeeCount: record.attendeeCount,
      remark: record.remark,
    });
    setBookingModalOpen(true);
  };

  const handleBookingSubmit = async () => {
    const values = await bookingForm.validateFields();
    const payload: OaMeetingBookingSaveParams = {
      roomId: values.roomId,
      subject: values.subject,
      startTime: values.startTime ? values.startTime.format(DATETIME_SUBMIT_FORMAT) : '',
      endTime: values.endTime ? values.endTime.format(DATETIME_SUBMIT_FORMAT) : '',
      attendeeJson: values.attendeeJson,
      attendeeCount: values.attendeeCount,
      remark: values.remark,
    };
    setBookingSubmitting(true);
    try {
      if (bookingEditing) {
        await oaMeetingBookingService.update(bookingEditing.id, payload);
        message.success('更新成功');
      } else {
        await oaMeetingBookingService.create(payload);
        message.success('新增成功');
      }
      setBookingModalOpen(false);
      void loadBookings();
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleBookingCancel = async (record: OaMeetingBookingItem) => {
    await oaMeetingBookingService.cancel(record.id);
    message.success('已取消预约');
    void loadBookings();
  };

  const handleBookingDelete = async (record: OaMeetingBookingItem) => {
    await oaMeetingBookingService.remove(record.id);
    message.success('删除成功');
    void loadBookings();
  };

  /* ---------------- 我的日程操作 ---------------- */
  const onScheduleSearch = (values: ScheduleSearchState) => {
    const cond = { ...values };
    setScheduleSearch(cond);
    setSchedulePageNum(1);
    void loadSchedules(1, schedulePageSize, cond);
  };

  const onScheduleReset = () => {
    setScheduleSearch({});
    setSchedulePageNum(1);
    void loadSchedules(1, schedulePageSize, {});
  };

  const openScheduleCreate = () => {
    setScheduleEditing(null);
    scheduleForm.resetFields();
    scheduleForm.setFieldsValue({
      scheduleType: 'PERSONAL',
      shareScope: 'PRIVATE',
      allDayFlag: 0,
    });
    setScheduleModalOpen(true);
  };

  const openScheduleEdit = (record: OaScheduleItem) => {
    setScheduleEditing(record);
    scheduleForm.resetFields();
    scheduleForm.setFieldsValue({
      title: record.title,
      scheduleType: record.scheduleType,
      startTime: record.startTime ? dayjs(record.startTime) : undefined,
      endTime: record.endTime ? dayjs(record.endTime) : undefined,
      allDayFlag: record.allDayFlag,
      location: record.location,
      participantJson: record.participantJson,
      shareScope: record.shareScope,
      remindMinutes: record.remindMinutes,
      content: record.content,
      remark: record.remark,
    });
    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async () => {
    const values = await scheduleForm.validateFields();
    const payload: OaScheduleSaveParams = {
      title: values.title,
      scheduleType: values.scheduleType,
      startTime: values.startTime ? values.startTime.format(DATETIME_SUBMIT_FORMAT) : '',
      endTime: values.endTime ? values.endTime.format(DATETIME_SUBMIT_FORMAT) : undefined,
      allDayFlag: values.allDayFlag,
      location: values.location,
      participantJson: values.participantJson,
      shareScope: values.shareScope,
      remindMinutes: values.remindMinutes,
      content: values.content,
      remark: values.remark,
    };
    setScheduleSubmitting(true);
    try {
      if (scheduleEditing) {
        await oaScheduleService.update(scheduleEditing.id, payload);
        message.success('更新成功');
      } else {
        await oaScheduleService.create(payload);
        message.success('新增成功');
      }
      setScheduleModalOpen(false);
      void loadSchedules();
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleScheduleDelete = async (record: OaScheduleItem) => {
    await oaScheduleService.remove(record.id);
    message.success('删除成功');
    void loadSchedules();
  };

  /* ---------------- 列定义 ---------------- */
  const roomColumns: ColumnsType<OaMeetingRoomItem> = [
    { title: '会议室编码', dataIndex: 'roomCode', width: 140, fixed: 'left', render: (v) => v || '-' },
    { title: '会议室名称', dataIndex: 'roomName', width: 180, render: (v) => v || '-' },
    { title: '位置', dataIndex: 'location', width: 150, render: (v) => v || '-' },
    { title: '容量', dataIndex: 'capacity', width: 90, render: (v) => v ?? '-' },
    { title: '设备', dataIndex: 'deviceJson', width: 220, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'roomStatus',
      width: 100,
      render: (v?: string) => (v ? ROOM_STATUS_LABEL[v] || v : '-'),
    },
    { title: '管理员', dataIndex: 'managerName', width: 130, render: (v) => v || '-' },
    { title: '备注', dataIndex: 'remark', width: 200, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:meeting:manage') && (
            <Button type="link" size="small" onClick={() => openRoomEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('oa:meeting:manage') && (
            <Popconfirm title="确认删除该会议室？" onConfirm={() => handleRoomDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const bookingColumns: ColumnsType<OaMeetingBookingItem> = [
    { title: '预约单号', dataIndex: 'bookingNo', width: 150, fixed: 'left', render: (v) => v || '-' },
    { title: '会议室', dataIndex: 'roomName', width: 150, render: (v) => v || '-' },
    { title: '会议主题', dataIndex: 'subject', width: 200, render: (v) => v || '-' },
    { title: '组织者', dataIndex: 'organizerName', width: 120, render: (v) => v || '-' },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 160,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: 160,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    { title: '参会人数', dataIndex: 'attendeeCount', width: 100, render: (v) => v ?? '-' },
    {
      title: '状态',
      dataIndex: 'bookingStatus',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={BOOKING_STATUS_COLOR[v]}>{OA_MEETING_BOOKING_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:meeting:book') && (
            <Button type="link" size="small" onClick={() => openBookingEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('oa:meeting:book') && record.bookingStatus === 'BOOKED' && (
            <Popconfirm title="确认取消该预约？" onConfirm={() => handleBookingCancel(record)}>
              <Button type="link" size="small">
                取消
              </Button>
            </Popconfirm>
          )}
          {hasPermission('oa:meeting:manage') && (
            <Popconfirm title="确认删除该预约？" onConfirm={() => handleBookingDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const scheduleColumns: ColumnsType<OaScheduleItem> = [
    { title: '日程编号', dataIndex: 'scheduleNo', width: 150, fixed: 'left', render: (v) => v || '-' },
    { title: '标题', dataIndex: 'title', width: 200, render: (v) => v || '-' },
    {
      title: '类型',
      dataIndex: 'scheduleType',
      width: 110,
      render: (v?: string) => (v ? OA_SCHEDULE_TYPE_LABEL[v] || v : '-'),
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 160,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: 160,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '全天',
      dataIndex: 'allDayFlag',
      width: 80,
      render: (v?: number) => (v === 1 ? '是' : '否'),
    },
    { title: '地点', dataIndex: 'location', width: 140, render: (v) => v || '-' },
    {
      title: '共享范围',
      dataIndex: 'shareScope',
      width: 110,
      render: (v?: string) => (v ? OA_SCHEDULE_SHARE_SCOPE_LABEL[v] || v : '-'),
    },
    {
      title: '提醒分钟',
      dataIndex: 'remindMinutes',
      width: 100,
      render: (v?: number) => (v === undefined || v === null ? '-' : `${v} 分钟`),
    },
    { title: '状态', dataIndex: 'scheduleStatus', width: 100, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:schedule:edit') && (
            <Button type="link" size="small" onClick={() => openScheduleEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('oa:schedule:edit') && (
            <Popconfirm title="确认删除该日程？" onConfirm={() => handleScheduleDelete(record)}>
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
        会议与日程
      </Title>

      <Tabs
        defaultActiveKey="room"
        items={[
          {
            key: 'room',
            label: '会议室管理',
            children: (
              <>
                <Card style={{ marginBottom: 16 }}>
                  <Form layout="inline" onFinish={onRoomSearch}>
                    <Form.Item name="keyword" label="会议室">
                      <Input placeholder="编码 / 名称" allowClear style={{ width: 180 }} />
                    </Form.Item>
                    <Form.Item name="roomStatus" label="状态">
                      <Select
                        placeholder="请选择"
                        allowClear
                        style={{ width: 130 }}
                        options={ROOM_STATUS_OPTIONS}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Space wrap>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                          查询
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={onRoomReset}>
                          重置
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Card>

                <Card
                  title={`会议室列表（共 ${roomTotal} 条）`}
                  extra={
                    hasPermission('oa:meeting:manage') && (
                      <Button type="primary" icon={<PlusOutlined />} onClick={openRoomCreate}>
                        新增会议室
                      </Button>
                    )
                  }
                >
                  <Table<OaMeetingRoomItem>
                    rowKey="id"
                    loading={roomLoading}
                    columns={roomColumns}
                    dataSource={roomData}
                    scroll={{ x: 1300 }}
                    pagination={{
                      current: roomPageNum,
                      pageSize: roomPageSize,
                      total: roomTotal,
                      showSizeChanger: true,
                      showTotal: (t) => `共 ${t} 条`,
                      onChange: (page, size) => {
                        setRoomPageNum(page);
                        setRoomPageSize(size);
                        void loadRooms(page, size);
                      },
                    }}
                  />
                </Card>
              </>
            ),
          },
          {
            key: 'booking',
            label: '会议室预约',
            children: (
              <>
                <Card style={{ marginBottom: 16 }}>
                  <Form layout="inline" onFinish={onBookingSearch}>
                    <Form.Item name="roomId" label="会议室">
                      <Select
                        placeholder="请选择"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        style={{ width: 220 }}
                        options={roomOptions}
                      />
                    </Form.Item>
                    <Form.Item name="bookingStatus" label="状态">
                      <Select
                        placeholder="请选择"
                        allowClear
                        style={{ width: 130 }}
                        options={OA_MEETING_BOOKING_STATUS_OPTIONS.map((o) => ({ ...o }))}
                      />
                    </Form.Item>
                    <Form.Item name="range" label="起止日期">
                      <RangePicker style={{ width: 260 }} format={DATE_FORMAT} />
                    </Form.Item>
                    <Form.Item>
                      <Space wrap>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                          查询
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={onBookingReset}>
                          重置
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Card>

                <Card
                  title={`会议室预约列表（共 ${bookingTotal} 条）`}
                  extra={
                    hasPermission('oa:meeting:book') && (
                      <Button type="primary" icon={<PlusOutlined />} onClick={openBookingCreate}>
                        新建预约
                      </Button>
                    )
                  }
                >
                  <Table<OaMeetingBookingItem>
                    rowKey="id"
                    loading={bookingLoading}
                    columns={bookingColumns}
                    dataSource={bookingData}
                    scroll={{ x: 1500 }}
                    pagination={{
                      current: bookingPageNum,
                      pageSize: bookingPageSize,
                      total: bookingTotal,
                      showSizeChanger: true,
                      showTotal: (t) => `共 ${t} 条`,
                      onChange: (page, size) => {
                        setBookingPageNum(page);
                        setBookingPageSize(size);
                        void loadBookings(page, size);
                      },
                    }}
                  />
                </Card>
              </>
            ),
          },
          {
            key: 'schedule',
            label: '我的日程',
            children: (
              <>
                <Card style={{ marginBottom: 16 }}>
                  <Form layout="inline" onFinish={onScheduleSearch}>
                    <Form.Item name="scheduleType" label="日程类型">
                      <Select
                        placeholder="请选择"
                        allowClear
                        style={{ width: 140 }}
                        options={OA_SCHEDULE_TYPE_OPTIONS.map((o) => ({ ...o }))}
                      />
                    </Form.Item>
                    <Form.Item name="range" label="起止日期">
                      <RangePicker style={{ width: 260 }} format={DATE_FORMAT} />
                    </Form.Item>
                    <Form.Item>
                      <Space wrap>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                          查询
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={onScheduleReset}>
                          重置
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Card>

                <Card
                  title={`日程列表（共 ${scheduleTotal} 条）`}
                  extra={
                    hasPermission('oa:schedule:edit') && (
                      <Button type="primary" icon={<PlusOutlined />} onClick={openScheduleCreate}>
                        新增日程
                      </Button>
                    )
                  }
                >
                  <Table<OaScheduleItem>
                    rowKey="id"
                    loading={scheduleLoading}
                    columns={scheduleColumns}
                    dataSource={scheduleData}
                    scroll={{ x: 1600 }}
                    pagination={{
                      current: schedulePageNum,
                      pageSize: schedulePageSize,
                      total: scheduleTotal,
                      showSizeChanger: true,
                      showTotal: (t) => `共 ${t} 条`,
                      onChange: (page, size) => {
                        setSchedulePageNum(page);
                        setSchedulePageSize(size);
                        void loadSchedules(page, size);
                      },
                    }}
                  />
                </Card>
              </>
            ),
          },
        ]}
      />

      <Modal
        title={roomEditing ? '编辑会议室' : '新增会议室'}
        open={roomModalOpen}
        onOk={handleRoomSubmit}
        confirmLoading={roomSubmitting}
        onCancel={() => setRoomModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={roomForm} layout="vertical" preserve={false}>
          <Form.Item
            name="roomCode"
            label="会议室编码"
            rules={[{ required: true, message: '请输入会议室编码' }]}
          >
            <Input placeholder="请输入会议室编码" disabled={!!roomEditing} />
          </Form.Item>
          <Form.Item
            name="roomName"
            label="会议室名称"
            rules={[{ required: true, message: '请输入会议室名称' }]}
          >
            <Input placeholder="请输入会议室名称" />
          </Form.Item>
          <Form.Item name="location" label="位置">
            <Input placeholder="请输入位置" />
          </Form.Item>
          <Form.Item name="capacity" label="容量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入容量" />
          </Form.Item>
          <Form.Item name="deviceJson" label="设备" extra="JSON 字符串，例如 [&quot;投影仪&quot;,&quot;白板&quot;]">
            <Input.TextArea rows={3} placeholder='例如 ["投影仪","白板"]' />
          </Form.Item>
          <Form.Item name="roomStatus" label="状态">
            <Select placeholder="请选择" options={ROOM_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="managerUserId" label="管理员">
            <UserSelect style={{ width: '100%' }} fallbackLabel={roomEditing?.managerName} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={bookingEditing ? '编辑预约' : '新建预约'}
        open={bookingModalOpen}
        onOk={handleBookingSubmit}
        confirmLoading={bookingSubmitting}
        onCancel={() => setBookingModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={bookingForm} layout="vertical" preserve={false}>
          <Form.Item
            name="roomId"
            label="会议室"
            rules={[{ required: true, message: '请选择会议室' }]}
          >
            <Select
              placeholder="请选择"
              showSearch
              optionFilterProp="label"
              options={roomOptions}
            />
          </Form.Item>
          <Form.Item
            name="subject"
            label="会议主题"
            rules={[{ required: true, message: '请输入会议主题' }]}
          >
            <Input placeholder="请输入会议主题" />
          </Form.Item>
          <Form.Item
            name="startTime"
            label="开始时间"
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_FORMAT} />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="结束时间"
            rules={[{ required: true, message: '请选择结束时间' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_FORMAT} />
          </Form.Item>
          <Form.Item name="attendeeCount" label="参会人数">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入参会人数" />
          </Form.Item>
          <Form.Item name="attendeeJson" label="参会人员" extra="JSON 字符串，存储参会人列表">
            <Input.TextArea rows={3} placeholder="请输入参会人员 JSON" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={scheduleEditing ? '编辑日程' : '新增日程'}
        open={scheduleModalOpen}
        onOk={handleScheduleSubmit}
        confirmLoading={scheduleSubmitting}
        onCancel={() => setScheduleModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={scheduleForm} layout="vertical" preserve={false}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item name="scheduleType" label="日程类型">
            <Select placeholder="请选择" options={OA_SCHEDULE_TYPE_OPTIONS.map((o) => ({ ...o }))} />
          </Form.Item>
          <Form.Item name="startTime" label="开始时间" rules={[{ required: true, message: '请选择开始时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_FORMAT} />
          </Form.Item>
          <Form.Item name="endTime" label="结束时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_FORMAT} />
          </Form.Item>
          <Form.Item name="allDayFlag" label="全天">
            <Select placeholder="请选择" options={ALL_DAY_OPTIONS} />
          </Form.Item>
          <Form.Item name="location" label="地点">
            <Input placeholder="请输入地点" />
          </Form.Item>
          <Form.Item name="participantJson" label="参与人" extra="JSON 字符串，存储参与人列表">
            <Input.TextArea rows={3} placeholder="请输入参与人 JSON" />
          </Form.Item>
          <Form.Item name="shareScope" label="共享范围">
            <Select placeholder="请选择" options={OA_SCHEDULE_SHARE_SCOPE_OPTIONS.map((o) => ({ ...o }))} />
          </Form.Item>
          <Form.Item name="remindMinutes" label="提醒分钟">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入提前提醒分钟数" />
          </Form.Item>
          <Form.Item name="content" label="内容">
            <Input.TextArea rows={3} placeholder="请输入日程内容" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
