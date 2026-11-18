package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.DocSearchItem;
import com.huaweicloud.plm.system.dto.DocSearchQuery;
import com.huaweicloud.plm.system.entity.OaDocFolder;
import com.huaweicloud.plm.system.entity.OaDocFolderPermission;
import com.huaweicloud.plm.system.entity.OaDocSearchIndex;
import com.huaweicloud.plm.system.entity.OaDocument;
import com.huaweicloud.plm.system.entity.OaMailMessage;
import com.huaweicloud.plm.system.entity.OaMailRecipient;
import com.huaweicloud.plm.system.mapper.OaDocFolderMapper;
import com.huaweicloud.plm.system.mapper.OaDocFolderPermissionMapper;
import com.huaweicloud.plm.system.mapper.OaDocSearchIndexMapper;
import com.huaweicloud.plm.system.mapper.OaDocumentMapper;
import com.huaweicloud.plm.system.mapper.OaMailMessageMapper;
import com.huaweicloud.plm.system.mapper.OaMailRecipientMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * 统一检索服务（OA-DEV-052）：索引文档标题/元数据、邮件正文与附件名，检索时按权限过滤并返回命中片段。
 * 默认使用关系库精简索引，生产可替换为独立搜索引擎，替换不改变上层接口契约。
 * 硬性要求：无权限内容不得出现在检索结果中。
 */
@Service
@RequiredArgsConstructor
public class DocSearchService {

    public static final String SOURCE_DOCUMENT = "DOCUMENT";
    public static final String SOURCE_MAIL = "MAIL";

    private static final String SCOPE_PUBLIC = "PUBLIC";
    private static final String SCOPE_PRIVATE = "PRIVATE";
    private static final String STATUS_VOID = "VOID";
    private static final int SNIPPET_LENGTH = 160;

    private final OaDocSearchIndexMapper searchIndexMapper;
    private final OaDocumentMapper documentMapper;
    private final OaDocFolderMapper folderMapper;
    private final OaDocFolderPermissionMapper folderPermissionMapper;
    private final OaMailMessageMapper mailMessageMapper;
    private final OaMailRecipientMapper mailRecipientMapper;
    private final DocPermissionService permissionService;
    private final OaDocSupportService supportService;

    /** 统一检索：分页返回当前用户有权访问的索引内容。 */
    public PageResult<DocSearchItem> search(DocSearchQuery query) {
        String keyword = StringUtils.hasText(query.getKeyword()) ? query.getKeyword().trim() : null;
        if (keyword == null) {
            throw new BusinessException("检索关键词不能为空");
        }
        String sourceType = StringUtils.hasText(query.getSourceType())
                ? query.getSourceType().trim().toUpperCase() : null;
        Page<OaDocSearchIndex> page = query.toPage();
        searchIndexMapper.selectPage(page, Wrappers.<OaDocSearchIndex>lambdaQuery()
                .eq(sourceType != null, OaDocSearchIndex::getSourceType, sourceType)
                .eq(query.getFolderId() != null, OaDocSearchIndex::getFolderId, query.getFolderId())
                .eq(query.getOwnerUserId() != null, OaDocSearchIndex::getOwnerUserId, query.getOwnerUserId())
                .ge(StringUtils.hasText(query.getStartDate()), OaDocSearchIndex::getIndexedAt,
                        startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaDocSearchIndex::getIndexedAt,
                        endOfDay(query.getEndDate()))
                .and(w -> w.like(OaDocSearchIndex::getTitle, keyword).or()
                        .like(OaDocSearchIndex::getContentText, keyword).or()
                        .like(OaDocSearchIndex::getKeywords, keyword).or()
                        .like(OaDocSearchIndex::getBizNo, keyword))
                .orderByDesc(OaDocSearchIndex::getId));
        List<DocSearchItem> items = new ArrayList<>();
        for (OaDocSearchIndex row : page.getRecords()) {
            if (accessible(row)) {
                items.add(toItem(row, keyword));
            }
        }
        return new PageResult<>(items, page.getTotal(), page.getCurrent(), page.getSize());
    }

    /** 索引或更新一篇文档；作废文档从索引中移除，索引开关关闭时同样移除。 */
    @Transactional
    public void indexDocument(OaDocument doc) {
        if (doc == null || doc.getId() == null) {
            return;
        }
        if (!supportService.configBool("oa.doc.search.index.enabled", true)
                || STATUS_VOID.equalsIgnoreCase(doc.getStatus())) {
            removeDocumentIndex(doc.getId());
            return;
        }
        OaDocSearchIndex row = findIndex(SOURCE_DOCUMENT, doc.getId());
        boolean insert = row == null;
        if (insert) {
            row = new OaDocSearchIndex();
            row.setSourceType(SOURCE_DOCUMENT);
            row.setSourceId(doc.getId());
        }
        row.setBizNo(doc.getDocNo());
        row.setTitle(doc.getTitle());
        row.setContentText(buildDocumentContent(doc));
        row.setKeywords(doc.getKeywords());
        row.setFolderId(doc.getFolderId());
        row.setDocId(doc.getId());
        row.setOwnerUserId(doc.getOwnerUserId());
        row.setOwnerDeptId(doc.getOwnerDeptId());
        row.setPermissionScope(resolveScope(doc));
        row.setIndexedAt(LocalDateTime.now());
        if (insert) {
            searchIndexMapper.insert(row);
        } else {
            searchIndexMapper.updateById(row);
        }
    }

    @Transactional
    public void removeDocumentIndex(Long docId) {
        if (docId == null) {
            return;
        }
        searchIndexMapper.delete(Wrappers.<OaDocSearchIndex>lambdaQuery()
                .eq(OaDocSearchIndex::getSourceType, SOURCE_DOCUMENT)
                .eq(OaDocSearchIndex::getSourceId, docId));
    }

    /** 索引一封邮件（标题 + 正文），供邮件归档后纳入统一检索。 */
    @Transactional
    public void indexMail(OaMailMessage mail) {
        if (mail == null || mail.getId() == null
                || !supportService.configBool("oa.doc.search.index.enabled", true)) {
            return;
        }
        OaDocSearchIndex row = findIndex(SOURCE_MAIL, mail.getId());
        boolean insert = row == null;
        if (insert) {
            row = new OaDocSearchIndex();
            row.setSourceType(SOURCE_MAIL);
            row.setSourceId(mail.getId());
        }
        row.setBizNo(mail.getMessageNo());
        row.setTitle(mail.getSubject());
        row.setContentText(stripHtml(mail.getContent()));
        row.setOwnerUserId(mail.getSenderUserId());
        row.setPermissionScope(SCOPE_PRIVATE);
        row.setIndexedAt(LocalDateTime.now());
        if (insert) {
            searchIndexMapper.insert(row);
        } else {
            searchIndexMapper.updateById(row);
        }
    }

    /** 重建全部索引：供上线初始化与数据迁移后补索引使用。 */
    @Transactional
    public int reindex() {
        List<OaDocument> documents = documentMapper.selectList(Wrappers.<OaDocument>lambdaQuery());
        for (OaDocument doc : documents) {
            indexDocument(doc);
        }
        List<OaMailMessage> mails = mailMessageMapper.selectList(Wrappers.<OaMailMessage>lambdaQuery());
        for (OaMailMessage mail : mails) {
            indexMail(mail);
        }
        return documents.size() + mails.size();
    }

    // ---------------- 内部实现 ----------------

    private OaDocSearchIndex findIndex(String sourceType, Long sourceId) {
        return searchIndexMapper.selectOne(Wrappers.<OaDocSearchIndex>lambdaQuery()
                .eq(OaDocSearchIndex::getSourceType, sourceType)
                .eq(OaDocSearchIndex::getSourceId, sourceId)
                .last("LIMIT 1"));
    }

    /** 检索结果权限过滤：文档按目录权限判定，邮件按发件人/收件人判定。 */
    private boolean accessible(OaDocSearchIndex row) {
        if (SOURCE_MAIL.equalsIgnoreCase(row.getSourceType())) {
            return accessibleMail(row);
        }
        OaDocument doc = row.getDocId() == null ? null : documentMapper.selectById(row.getDocId());
        return doc != null && permissionService.evaluateDocument(doc).readable();
    }

    private boolean accessibleMail(OaDocSearchIndex row) {
        if (SCOPE_PUBLIC.equalsIgnoreCase(row.getPermissionScope())) {
            return true;
        }
        Long userId = UserContext.getUserId();
        if (userId == null || row.getSourceId() == null) {
            return false;
        }
        OaMailMessage mail = mailMessageMapper.selectById(row.getSourceId());
        if (mail == null) {
            return false;
        }
        if (Objects.equals(mail.getSenderUserId(), userId)) {
            return true;
        }
        return mailRecipientMapper.selectCount(Wrappers.<OaMailRecipient>lambdaQuery()
                .eq(OaMailRecipient::getMessageId, mail.getId())
                .eq(OaMailRecipient::getRecipientUserId, userId)) > 0;
    }

    /** 判断索引范围：目录链上存在「所有人」授权时记为公开可检索，否则为私有。 */
    private String resolveScope(OaDocument doc) {
        if (doc.getFolderId() == null) {
            return SCOPE_PRIVATE;
        }
        OaDocFolder folder = folderMapper.selectById(doc.getFolderId());
        if (folder == null) {
            return SCOPE_PRIVATE;
        }
        List<Long> chainIds = new ArrayList<>();
        chainIds.add(folder.getId());
        Long parentId = folder.getParentId();
        int guard = 0;
        while (parentId != null && parentId > 0 && guard++ < 50) {
            OaDocFolder parent = folderMapper.selectById(parentId);
            if (parent == null) {
                break;
            }
            chainIds.add(parent.getId());
            parentId = parent.getParentId();
        }
        long publicCount = folderPermissionMapper.selectCount(Wrappers.<OaDocFolderPermission>lambdaQuery()
                .in(OaDocFolderPermission::getFolderId, chainIds)
                .eq(OaDocFolderPermission::getSubjectType, DocPermissionService.SUBJECT_ALL));
        return publicCount > 0 ? SCOPE_PUBLIC : SCOPE_PRIVATE;
    }

    private String buildDocumentContent(OaDocument doc) {
        StringBuilder builder = new StringBuilder();
        appendPart(builder, doc.getTitle());
        appendPart(builder, doc.getSummary());
        appendPart(builder, doc.getKeywords());
        appendPart(builder, doc.getTags());
        appendPart(builder, doc.getFileName());
        return builder.toString();
    }

    private void appendPart(StringBuilder builder, String part) {
        if (StringUtils.hasText(part)) {
            if (builder.length() > 0) {
                builder.append(' ');
            }
            builder.append(part);
        }
    }

    private DocSearchItem toItem(OaDocSearchIndex row, String keyword) {
        DocSearchItem item = new DocSearchItem();
        item.setIndexId(row.getId());
        item.setSourceType(row.getSourceType());
        item.setSourceId(row.getSourceId());
        item.setBizNo(row.getBizNo());
        item.setTitle(row.getTitle());
        item.setSnippet(buildSnippet(row.getContentText(), keyword));
        item.setKeywords(row.getKeywords());
        item.setFolderId(row.getFolderId());
        item.setDocId(row.getDocId());
        item.setOwnerUserId(row.getOwnerUserId());
        item.setIndexedAt(row.getIndexedAt());
        return item;
    }

    private String buildSnippet(String text, String keyword) {
        String plain = stripHtml(text);
        if (!StringUtils.hasText(plain)) {
            return null;
        }
        int index = StringUtils.hasText(keyword)
                ? plain.toLowerCase().indexOf(keyword.toLowerCase()) : -1;
        if (index < 0) {
            return plain.length() > SNIPPET_LENGTH ? plain.substring(0, SNIPPET_LENGTH) + "..." : plain;
        }
        int start = Math.max(0, index - 40);
        int end = Math.min(plain.length(), index + keyword.length() + 80);
        return (start > 0 ? "..." : "") + plain.substring(start, end) + (end < plain.length() ? "..." : "");
    }

    private String stripHtml(String text) {
        if (!StringUtils.hasText(text)) {
            return null;
        }
        return text.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
    }

    private LocalDateTime startOfDay(String date) {
        if (!StringUtils.hasText(date)) {
            return null;
        }
        try {
            return LocalDate.parse(date.trim()).atStartOfDay();
        } catch (RuntimeException e) {
            return null;
        }
    }

    private LocalDateTime endOfDay(String date) {
        if (!StringUtils.hasText(date)) {
            return null;
        }
        try {
            return LocalDate.parse(date.trim()).atTime(LocalTime.MAX);
        } catch (RuntimeException e) {
            return null;
        }
    }
}
