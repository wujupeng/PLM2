import { useCallback, useEffect, useState } from 'react';
import { Button, Empty, Input, Modal, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { oaDocumentService } from '@/services/oaService';
import type { OaDocumentItem } from '@/types/oa';

const DATETIME_FORMAT = 'MM-DD HH:mm';
const PAGE_SIZE = 10;

/** 移动端文档中心：关键字检索、查看文档信息并下载（受服务端目录权限约束）。 */
export default function MobileDocsPage() {
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [list, setList] = useState<OaDocumentItem[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<OaDocumentItem | null>(null);

  const loadData = useCallback(async (kw: string | undefined, page: number, append = false) => {
    setLoading(true);
    try {
      const res = await oaDocumentService.page({
        pageNum: page,
        pageSize: PAGE_SIZE,
        keyword: kw || undefined,
      });
      setList((prev) => (append ? [...prev, ...(res.list || [])] : res.list || []));
      setTotal(res.total || 0);
      setPageNum(page);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData(undefined, 1, false);
  }, [loadData]);

  const onSearch = (value: string) => {
    const kw = value || undefined;
    setKeyword(kw);
    void loadData(kw, 1, false);
  };

  const handleDownload = async (doc: OaDocumentItem) => {
    try {
      const blob = await oaDocumentService.download(doc.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = doc.fileName || doc.title || `document-${doc.id}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
      message.error('下载失败或无权下载该文档');
    }
  };

  const loadMore = () => {
    if (list.length >= total) return;
    void loadData(keyword, pageNum + 1, true);
  };

  return (
    <div>
      <Input.Search
        allowClear
        placeholder="文档标题 / 关键字"
        onSearch={onSearch}
        style={{ marginBottom: 12 }}
      />

      <Spin spinning={loading}>
        {list.length === 0 && !loading ? (
          <Empty description="暂无文档" style={{ marginTop: 48 }} />
        ) : (
          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
            {list.map((doc) => (
              <div key={doc.id} className="mobile-list-item" onClick={() => setCurrent(doc)}>
                <div className="mobile-ellipsis" style={{ fontWeight: 500 }}>
                  {doc.title || doc.fileName || `文档 ${doc.id}`}
                </div>
                <div
                  className="mobile-row"
                  style={{ marginTop: 4, fontSize: 12, color: '#8c8c8c' }}
                >
                  <span className="mobile-ellipsis">
                    {doc.folderName || '-'} · {doc.ownerName || '-'}
                  </span>
                  <span>
                    {doc.updatedAt ? dayjs(doc.updatedAt).format(DATETIME_FORMAT) : '-'}
                  </span>
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
        title="文档信息"
        open={!!current}
        onCancel={() => setCurrent(null)}
        destroyOnClose
        footer={[
          <Button key="close" onClick={() => setCurrent(null)}>
            关闭
          </Button>,
          <Button key="download" type="primary" onClick={() => current && void handleDownload(current)}>
            下载
          </Button>,
        ]}
      >
        {current && (
          <div style={{ fontSize: 13, color: '#595959', lineHeight: 1.9 }}>
            <div style={{ fontWeight: 500, color: '#262626' }}>{current.title || '-'}</div>
            <div>文档编号：{current.docNo || '-'}</div>
            <div>所属目录：{current.folderName || '-'}</div>
            <div>所有人：{current.ownerName || '-'}</div>
            <div>文件名称：{current.fileName || '-'}</div>
            {current.summary && <div>摘要：{current.summary}</div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
