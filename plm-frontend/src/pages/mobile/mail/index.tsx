import { useCallback, useEffect, useState } from 'react';
import { Button, Drawer, Empty, Segmented, Spin, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { oaMailAttachmentService, oaMailService } from '@/services/oaService';
import {
  MAIL_PRIORITY_COLOR,
  MAIL_PRIORITY_LABEL,
  type MailAttachmentItem,
  type MailDetail,
  type MailItem,
} from '@/types/oa';

const DATETIME_FORMAT = 'MM-DD HH:mm';
const PAGE_SIZE = 10;

type MailFolder = 'INBOX' | 'SENT';

/** 移动端内部邮件：收件箱/已发送列表，支持查看详情、下载附件与标记已读。 */
export default function MobileMailPage() {
  const [folder, setFolder] = useState<MailFolder>('INBOX');
  const [list, setList] = useState<MailItem[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [detail, setDetail] = useState<MailDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = useCallback(
    async (nextFolder: MailFolder, page: number, append = false) => {
      setLoading(true);
      try {
        const res = await oaMailService.page({
          pageNum: page,
          pageSize: PAGE_SIZE,
          folderCode: nextFolder,
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
    void loadData('INBOX', 1, false);
  }, [loadData]);

  const switchFolder = (value: MailFolder) => {
    setFolder(value);
    void loadData(value, 1, false);
  };

  const openDetail = async (item: MailItem) => {
    setDetailLoading(true);
    try {
      const res = await oaMailService.detail(item.messageId);
      setDetail(res);
      if (folder === 'INBOX' && item.readFlag !== 1) {
        await oaMailService.markRead(item.messageId, 1);
        setList((prev) =>
          prev.map((it) => (it.messageId === item.messageId ? { ...it, readFlag: 1 } : it)),
        );
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownload = async (attachment: MailAttachmentItem) => {
    const blob = await oaMailAttachmentService.download(attachment.attachmentId);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = attachment.fileName || 'attachment';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const loadMore = () => {
    if (list.length >= total) return;
    void loadData(folder, pageNum + 1, true);
  };

  return (
    <div>
      <Segmented
        block
        value={folder}
        onChange={(value) => switchFolder(value as MailFolder)}
        options={[
          { label: '收件箱', value: 'INBOX' },
          { label: '已发送', value: 'SENT' },
        ]}
        style={{ marginBottom: 12 }}
      />

      <Spin spinning={loading}>
        {list.length === 0 && !loading ? (
          <Empty description="暂无邮件" style={{ marginTop: 48 }} />
        ) : (
          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
            {list.map((item) => (
              <div
                key={item.messageId}
                className="mobile-list-item"
                onClick={() => void openDetail(item)}
              >
                <div className="mobile-row">
                  <span
                    className="mobile-ellipsis"
                    style={{ fontWeight: item.readFlag === 1 ? 400 : 600 }}
                  >
                    {item.subject || '(无主题)'}
                  </span>
                  {item.priority === 'HIGH' && (
                    <Tag color={MAIL_PRIORITY_COLOR.HIGH}>{MAIL_PRIORITY_LABEL.HIGH}</Tag>
                  )}
                </div>
                <div
                  className="mobile-row"
                  style={{ marginTop: 4, fontSize: 12, color: '#8c8c8c' }}
                >
                  <span className="mobile-ellipsis">{item.senderName || '-'}</span>
                  <span>{item.sentAt ? dayjs(item.sentAt).format(DATETIME_FORMAT) : '-'}</span>
                </div>
                {item.preview && (
                  <div
                    className="mobile-ellipsis"
                    style={{ marginTop: 4, fontSize: 12, color: '#a6a6a6' }}
                  >
                    {item.preview}
                  </div>
                )}
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

      <Drawer
        placement="bottom"
        height="82%"
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.message.subject || '(无主题)'}
      >
        <Spin spinning={detailLoading}>
          {detail && (
            <div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 12 }}>
                <div>
                  发件人：{detail.message.senderName || '-'}
                  {detail.message.senderDept ? `（${detail.message.senderDept}）` : ''}
                </div>
                <div>
                  时间：
                  {detail.message.sentAt
                    ? dayjs(detail.message.sentAt).format('YYYY-MM-DD HH:mm')
                    : '-'}
                </div>
                {detail.recipients && detail.recipients.length > 0 && (
                  <div>收件人：{detail.recipients.map((r) => r.recipientName).join('、')}</div>
                )}
              </div>

              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, marginBottom: 16 }}>
                {detail.message.content || '(无正文)'}
              </div>

              {detail.attachments && detail.attachments.length > 0 && (
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>
                    附件（{detail.attachments.length}）
                  </div>
                  {detail.attachments.map((att) => (
                    <div key={att.attachmentId} className="mobile-row mobile-list-item">
                      <span className="mobile-ellipsis">{att.fileName || '未命名附件'}</span>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => void handleDownload(att).catch(() => message.error('下载失败'))}
                      >
                        下载
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Spin>
      </Drawer>
    </div>
  );
}
