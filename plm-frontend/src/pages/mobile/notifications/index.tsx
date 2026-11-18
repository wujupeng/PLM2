import { useCallback, useEffect, useState } from 'react';
import { Button, Empty, Modal, Segmented, Space, Spin, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { oaNotificationService } from '@/services/oaService';
import {
  NOTIFICATION_TYPE_COLOR,
  NOTIFICATION_TYPE_LABEL,
  type NotificationItem,
} from '@/types/oa';

const DATETIME_FORMAT = 'MM-DD HH:mm';
const PAGE_SIZE = 10;

type ReadFilter = 'unread' | 'all';

/** 移动端消息通知：未读/全部切换、查看详情、标记已读与一键全部已读。 */
export default function MobileNotificationsPage() {
  const [filter, setFilter] = useState<ReadFilter>('unread');
  const [list, setList] = useState<NotificationItem[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<NotificationItem | null>(null);

  const loadData = useCallback(
    async (nextFilter: ReadFilter, page: number, append = false) => {
      setLoading(true);
      try {
        const res = await oaNotificationService.page({
          pageNum: page,
          pageSize: PAGE_SIZE,
          readFlag: nextFilter === 'unread' ? 0 : undefined,
        });
        setList((prev) => (append ? [...prev, ...(res.list || [])] : res.list || []));
        setTotal(res.total || 0);
        setPageNum(page);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadData('unread', 1, false);
  }, [loadData]);

  const switchFilter = (value: ReadFilter) => {
    setFilter(value);
    void loadData(value, 1, false);
  };

  const openDetail = async (item: NotificationItem) => {
    setCurrent(item);
    if (item.readFlag !== 1) {
      await oaNotificationService.markRead(item.id, 1);
      setList((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, readFlag: 1 } : it)),
      );
    }
  };

  const markAllRead = async () => {
    await oaNotificationService.markAllRead();
    message.success('已全部标记为已读');
    void loadData(filter, 1, false);
  };

  const loadMore = () => {
    if (list.length >= total) return;
    void loadData(filter, pageNum + 1, true);
  };

  return (
    <div>
      <div className="mobile-row" style={{ marginBottom: 12, gap: 12 }}>
        <Segmented
          value={filter}
          onChange={(value) => switchFilter(value as ReadFilter)}
          options={[
            { label: '未读', value: 'unread' },
            { label: '全部', value: 'all' },
          ]}
        />
        <Button size="small" onClick={() => void markAllRead()}>
          全部已读
        </Button>
      </div>

      <Spin spinning={loading}>
        {list.length === 0 && !loading ? (
          <Empty description="暂无消息" style={{ marginTop: 48 }} />
        ) : (
          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
            {list.map((item) => (
              <div
                key={item.id}
                className="mobile-list-item"
                onClick={() => void openDetail(item)}
              >
                <div className="mobile-row">
                  <Space size={6} className="mobile-ellipsis">
                    {item.readFlag !== 1 && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: '#ff4d4f',
                        }}
                      />
                    )}
                    <span
                      className="mobile-ellipsis"
                      style={{ fontWeight: item.readFlag === 1 ? 400 : 600 }}
                    >
                      {item.title || '(无标题)'}
                    </span>
                  </Space>
                  <Tag color={NOTIFICATION_TYPE_COLOR[item.messageType || ''] || 'default'}>
                    {NOTIFICATION_TYPE_LABEL[item.messageType || ''] || item.messageType || '-'}
                  </Tag>
                </div>
                {item.content && (
                  <div
                    className="mobile-ellipsis"
                    style={{ marginTop: 4, fontSize: 12, color: '#8c8c8c' }}
                  >
                    {item.content}
                  </div>
                )}
                <div style={{ marginTop: 4, fontSize: 12, color: '#a6a6a6' }}>
                  {item.createdAt ? dayjs(item.createdAt).format(DATETIME_FORMAT) : '-'}
                </div>
              </div>
            ))}
          </div>
        )}

        {list.length > 0 && list.length < total && (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Button size="small" onClick={loadMore} loading={loading}>
              加载更多
            </Button>
          </div>
        )}
      </Spin>

      <Modal
        title="消息详情"
        open={!!current}
        onCancel={() => setCurrent(null)}
        destroyOnClose
        footer={
          <Button type="primary" onClick={() => setCurrent(null)}>
            关闭
          </Button>
        }
      >
        {current && (
          <div style={{ fontSize: 13, color: '#595959', lineHeight: 1.8 }}>
            <div style={{ fontWeight: 500, color: '#262626', marginBottom: 6 }}>
              {current.title || '(无标题)'}
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{current.content || '(无内容)'}</div>
            <div style={{ marginTop: 12, color: '#a6a6a6' }}>
              {current.createdAt
                ? dayjs(current.createdAt).format('YYYY-MM-DD HH:mm')
                : '-'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
