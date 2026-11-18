package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.DocDetailResponse;
import com.huaweicloud.plm.system.dto.DocItem;
import com.huaweicloud.plm.system.dto.DocQuery;
import com.huaweicloud.plm.system.dto.DocSaveRequest;
import com.huaweicloud.plm.system.entity.OaDocFolder;
import com.huaweicloud.plm.system.entity.OaDocVersion;
import com.huaweicloud.plm.system.entity.OaDocument;
import com.huaweicloud.plm.system.entity.SysOrganization;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.OaDocFolderMapper;
import com.huaweicloud.plm.system.mapper.OaDocumentMapper;
import com.huaweicloud.plm.system.mapper.SysOrganizationMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * 文档服务（OA-DEV-046 ~ OA-DEV-051）：目录内文档的元数据维护、上传、发布/作废/归档、
 * 版本、评论、分享与回收站。所有访问行为写入审计，内容变更同步统一检索索引。
 * 权限统一由 DocPermissionService 判定：无权限文档不出现在列表与检索结果中。
 */
@Service
@RequiredArgsConstructor
public class OaDocumentService {

    public static final String STATUS_DRAFT = "DRAFT";
    public static final String STATUS_IN_REVIEW = "IN_REVIEW";
    public static final String STATUS_PUBLISHED = "PUBLISHED";
    public static final String STATUS_VOID = "VOID";
    public static final String STATUS_ARCHIVED = "ARCHIVED";

    public static final String SOURCE_MANUAL = "MANUAL";
    private static final String SOURCE_WORKFLOW = "WORKFLOW";
    private static final String SOURCE_MAIL = "MAIL";
    private static final String SOURCE_IMPORT = "IMPORT";

    private static final String DEFAULT_DOC_NO_PREFIX = "DOC-";
    private static final int MAX_RECYCLE_PAGE_SIZE = 200;

    private final OaDocumentMapper documentMapper;
    private final OaDocFolderMapper folderMapper;
    private final DocFolderService folderService;
    private final DocPermissionService permissionService;
    private final OaDocVersionService versionService;
    private final OaDocCommentService commentService;
    private final OaDocShareService shareService;
    private final DocSearchService searchService;
    private final DocAccessLogService accessLogService;
    private final OaDocSupportService supportService;
    private final SysUserMapper userMapper;
    private final SysOrganizationMapper organizationMapper;

    /** 文档下载结果：文档元数据与命中的版本，供控制器组装下载响应。 */
    public record DocumentDownload(OaDocument document, OaDocVersion version) {
    }

    /** 文档列表：按目录范围、类型、状态与关键词过滤，逐条按权限过滤后返回。 */
    public PageResult<DocItem> page(DocQuery query) {
        Page<OaDocument> page = query.toPage();
        String keyword = StringUtils.hasText(query.getKeyword()) ? query.getKeyword().trim() : null;
        List<Long> folderIds = query.getFolderId() == null ? List.of()
                : folderService.resolveFolderIds(query.getFolderId(), Boolean.TRUE.equals(query.getIncludeSub()));
        documentMapper.selectPage(page, Wrappers.<OaDocument>lambdaQuery()
                .in(!folderIds.isEmpty(), OaDocument::getFolderId, folderIds)
                .eq(StringUtils.hasText(query.getStatus()), OaDocument::getStatus,
                        query.getStatus() == null ? null : query.getStatus().trim().toUpperCase())
                .eq(StringUtils.hasText(query.getDocType()), OaDocument::getDocType, query.getDocType())
                .eq(query.getOwnerUserId() != null, OaDocument::getOwnerUserId, query.getOwnerUserId())
                .like(StringUtils.hasText(query.getTag()), OaDocument::getTags, query.getTag())
                .ge(StringUtils.hasText(query.getStartDate()), OaDocument::getCreatedAt,
                        startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaDocument::getCreatedAt,
                        endOfDay(query.getEndDate()))
                .and(keyword != null, w -> w.like(OaDocument::getTitle, keyword).or()
                        .like(OaDocument::getKeywords, keyword).or()
                        .like(OaDocument::getDocNo, keyword))
                .orderByDesc(OaDocument::getId));
        List<DocItem> items = new ArrayList<>();
        for (OaDocument doc : page.getRecords()) {
            if (permissionService.evaluateDocument(doc).readable()) {
                items.add(toItem(doc));
            }
        }
        return new PageResult<>(items, page.getTotal(), page.getCurrent(), page.getSize());
    }

    /** 文档详情：元数据 + 版本 + 评论 + 分享 + 当前用户有效权限，并记录查看审计。 */
    public DocDetailResponse detail(Long docId) {
        OaDocument doc = requireDocument(docId);
        DocPermissionService.DocAccess access = permissionService.requireDocumentReadable(doc);
        recordView(doc);
        DocDetailResponse response = new DocDetailResponse();
        response.setDoc(toItem(doc));
        response.setVersions(versionService.list(docId));
        response.setComments(commentService.list(docId));
        response.setShares(shareService.list(docId));
        response.setEffectivePermission(access.level());
        response.setDownloadAllowed(access.downloadAllowed());
        return response;
    }

    /** 新建文档并上传首个版本。 */
    @Transactional
    public Long create(DocSaveRequest request, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("上传文件不能为空");
        }
        OaDocFolder folder = folderService.requireFolder(request.getFolderId());
        permissionService.requireFolderWritable(folder);
        String docNo = supportService.nextNo(supportService.config("oa.doc.no.prefix", DEFAULT_DOC_NO_PREFIX));
        if (documentMapper.countByDocNo(docNo) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "文档编号已存在: " + docNo);
        }
        Long userId = permissionService.currentUserId();
        OaDocument doc = new OaDocument();
        doc.setDocNo(docNo);
        doc.setTitle(request.getTitle());
        doc.setFolderId(folder.getId());
        doc.setDocType(request.getDocType());
        doc.setStatus(normalizeStatus(request.getStatus(), STATUS_DRAFT));
        doc.setSourceType(normalizeSourceType(request.getSourceType()));
        doc.setSourceBizId(request.getSourceBizId());
        doc.setSourceBizNo(request.getSourceBizNo());
        doc.setOwnerUserId(userId);
        doc.setOwnerName(resolveDisplayName(userId));
        doc.setOwnerDeptId(permissionService.currentOrgId());
        doc.setOwnerDeptName(resolveDeptName(permissionService.currentOrgId()));
        doc.setSummary(request.getSummary());
        doc.setKeywords(request.getKeywords());
        doc.setTags(request.getTags());
        doc.setExtJson(request.getExtJson());
        doc.setRemark(request.getRemark());
        doc.setViewCount(0L);
        doc.setDownloadCount(0L);
        doc.setArchivedFlag(0);
        doc.setLockFlag(0);
        if (STATUS_PUBLISHED.equals(doc.getStatus())) {
            doc.setPublishedAt(LocalDateTime.now());
        }
        documentMapper.insert(doc);
        versionService.createVersion(doc, file, request.getRevisionNote());
        OaDocument saved = requireDocument(doc.getId());
        searchService.indexDocument(saved);
        accessLogService.record(saved.getId(), saved.getCurrentVersionId(), saved.getFolderId(),
                DocAccessLogService.ACTION_EDIT, "创建文档并上传首个版本");
        return saved.getId();
    }

    /** 更新文档元数据，可迁移目录；状态变更同步发布/归档标记。 */
    @Transactional
    public void update(Long docId, DocSaveRequest request) {
        OaDocument doc = requireDocument(docId);
        permissionService.requireDocumentWritable(doc);
        if (request.getFolderId() != null && !Objects.equals(request.getFolderId(), doc.getFolderId())) {
            OaDocFolder target = folderService.requireFolder(request.getFolderId());
            permissionService.requireFolderWritable(target);
            doc.setFolderId(target.getId());
        }
        if (StringUtils.hasText(request.getTitle())) {
            doc.setTitle(request.getTitle());
        }
        doc.setDocType(request.getDocType());
        doc.setSummary(request.getSummary());
        doc.setKeywords(request.getKeywords());
        doc.setTags(request.getTags());
        doc.setExtJson(request.getExtJson());
        doc.setRemark(request.getRemark());
        if (StringUtils.hasText(request.getStatus())) {
            applyStatus(doc, normalizeStatus(request.getStatus(), doc.getStatus()));
        }
        documentMapper.updateById(doc);
        searchService.indexDocument(doc);
        accessLogService.record(doc.getId(), doc.getCurrentVersionId(), doc.getFolderId(),
                DocAccessLogService.ACTION_EDIT, "更新文档元数据");
    }

    /** 上传新版本：历史版本保留，当前版本指针切换为新版本。 */
    @Transactional
    public void uploadVersion(Long docId, String revisionNote, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("上传文件不能为空");
        }
        OaDocument doc = requireDocument(docId);
        permissionService.requireDocumentWritable(doc);
        versionService.createVersion(doc, file, revisionNote);
        OaDocument saved = requireDocument(docId);
        searchService.indexDocument(saved);
        accessLogService.record(saved.getId(), saved.getCurrentVersionId(), saved.getFolderId(),
                DocAccessLogService.ACTION_EDIT, "上传新版本 v" + saved.getCurrentVersionNo());
    }

    @Transactional
    public void publish(Long docId) {
        OaDocument doc = requireDocument(docId);
        permissionService.requireDocumentWritable(doc);
        applyStatus(doc, STATUS_PUBLISHED);
        documentMapper.updateById(doc);
        searchService.indexDocument(doc);
        accessLogService.record(docId, doc.getCurrentVersionId(), doc.getFolderId(),
                DocAccessLogService.ACTION_EDIT, "发布文档");
    }

    @Transactional
    public void voidDocument(Long docId) {
        OaDocument doc = requireDocument(docId);
        permissionService.requireDocumentManage(doc);
        applyStatus(doc, STATUS_VOID);
        documentMapper.updateById(doc);
        searchService.removeDocumentIndex(docId);
        accessLogService.record(docId, doc.getCurrentVersionId(), doc.getFolderId(),
                DocAccessLogService.ACTION_EDIT, "作废文档并从检索索引移除");
    }

    @Transactional
    public void archive(Long docId) {
        OaDocument doc = requireDocument(docId);
        permissionService.requireDocumentManage(doc);
        applyStatus(doc, STATUS_ARCHIVED);
        documentMapper.updateById(doc);
        searchService.indexDocument(doc);
        accessLogService.record(docId, doc.getCurrentVersionId(), doc.getFolderId(),
                DocAccessLogService.ACTION_EDIT, "归档文档");
    }

    /** 删除文档：逻辑删除进入回收站，仍可恢复。 */
    @Transactional
    public void delete(Long docId) {
        OaDocument doc = requireDocument(docId);
        permissionService.requireDocumentManage(doc);
        documentMapper.deleteById(docId);
        searchService.removeDocumentIndex(docId);
        accessLogService.record(docId, doc.getCurrentVersionId(), doc.getFolderId(),
                DocAccessLogService.ACTION_DELETE, "删除文档（进入回收站）");
    }

    /** 回收站列表：仅管理员可见（回收站管理权限控制）。 */
    public PageResult<DocItem> recyclePage(Integer pageNum, Integer pageSize) {
        int current = pageNum == null || pageNum < 1 ? 1 : pageNum;
        int size = pageSize == null || pageSize < 1 ? 20 : Math.min(pageSize, MAX_RECYCLE_PAGE_SIZE);
        long total = documentMapper.countRecycled();
        List<DocItem> items = documentMapper.selectRecycledPage(size, (current - 1) * size)
                .stream().map(this::toItem).toList();
        return new PageResult<>(items, total, current, size);
    }

    /** 从回收站恢复。 */
    @Transactional
    public void restore(Long docId) {
        if (documentMapper.restoreRecycled(docId) == 0) {
            throw new BusinessException(ResultCode.NOT_FOUND, "回收站中不存在该文档: " + docId);
        }
        OaDocument doc = requireDocument(docId);
        searchService.indexDocument(doc);
        accessLogService.record(docId, doc.getCurrentVersionId(), doc.getFolderId(),
                DocAccessLogService.ACTION_RESTORE, "从回收站恢复文档");
    }

    /** 彻底删除：仅允许删除回收站中的记录，操作不可恢复。 */
    @Transactional
    public void purge(Long docId) {
        if (documentMapper.purgeRecycled(docId) == 0) {
            throw new BusinessException(ResultCode.NOT_FOUND, "回收站中不存在该文档: " + docId);
        }
        searchService.removeDocumentIndex(docId);
        accessLogService.record(docId, null, null, DocAccessLogService.ACTION_DELETE, "彻底删除文档（不可恢复）");
    }

    /** 下载文档：校验下载权限（分享可单独禁止下载），并记录下载审计与下载量。 */
    @Transactional
    public DocumentDownload download(Long docId, Long versionId) {
        OaDocument doc = requireDocument(docId);
        permissionService.requireDownloadable(doc);
        OaDocVersion version = versionId != null
                ? versionService.requireVersion(versionId)
                : versionService.currentVersion(doc);
        if (version == null || !Objects.equals(version.getDocId(), docId)) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文档文件不存在");
        }
        documentMapper.incrementDownloadCount(docId);
        accessLogService.record(docId, version.getId(), doc.getFolderId(),
                DocAccessLogService.ACTION_DOWNLOAD, "下载文档 v" + version.getVersionNo());
        return new DocumentDownload(doc, version);
    }

    public OaDocument requireDocument(Long docId) {
        OaDocument doc = documentMapper.selectById(docId);
        if (doc == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文档不存在: " + docId);
        }
        return doc;
    }

    public DocItem toItem(OaDocument doc) {
        DocItem item = new DocItem();
        item.setId(doc.getId());
        item.setDocNo(doc.getDocNo());
        item.setTitle(doc.getTitle());
        item.setFolderId(doc.getFolderId());
        item.setFolderName(resolveFolderName(doc.getFolderId()));
        item.setDocType(doc.getDocType());
        item.setStatus(doc.getStatus());
        item.setSourceType(doc.getSourceType());
        item.setSourceBizId(doc.getSourceBizId());
        item.setSourceBizNo(doc.getSourceBizNo());
        item.setOwnerUserId(doc.getOwnerUserId());
        item.setOwnerName(doc.getOwnerName());
        item.setOwnerDeptId(doc.getOwnerDeptId());
        item.setOwnerDeptName(doc.getOwnerDeptName());
        item.setCurrentVersionId(doc.getCurrentVersionId());
        item.setCurrentVersionNo(doc.getCurrentVersionNo());
        item.setFileName(doc.getFileName());
        item.setFileSize(doc.getFileSize());
        item.setContentType(doc.getContentType());
        item.setSummary(doc.getSummary());
        item.setKeywords(doc.getKeywords());
        item.setTags(doc.getTags());
        item.setPublishedAt(doc.getPublishedAt());
        item.setArchivedFlag(doc.getArchivedFlag());
        item.setViewCount(doc.getViewCount());
        item.setDownloadCount(doc.getDownloadCount());
        item.setLockFlag(doc.getLockFlag());
        item.setExtJson(doc.getExtJson());
        item.setRemark(doc.getRemark());
        item.setEffectivePermission(permissionService.evaluateDocument(doc).level());
        item.setCreatedAt(doc.getCreatedAt());
        item.setUpdatedAt(doc.getUpdatedAt());
        return item;
    }

    // ---------------- 内部实现 ----------------

    private void recordView(OaDocument doc) {
        documentMapper.incrementViewCount(doc.getId());
        doc.setViewCount((doc.getViewCount() == null ? 0L : doc.getViewCount()) + 1);
        accessLogService.record(doc.getId(), doc.getCurrentVersionId(), doc.getFolderId(),
                DocAccessLogService.ACTION_VIEW, "查看文档详情");
    }

    private void applyStatus(OaDocument doc, String status) {
        doc.setStatus(status);
        if (STATUS_PUBLISHED.equals(status)) {
            doc.setPublishedAt(LocalDateTime.now());
            doc.setArchivedFlag(0);
        } else if (STATUS_ARCHIVED.equals(status)) {
            doc.setArchivedFlag(1);
        } else {
            doc.setArchivedFlag(0);
            if (STATUS_VOID.equals(status)) {
                doc.setPublishedAt(null);
            }
        }
    }

    private String normalizeStatus(String status, String fallback) {
        if (!StringUtils.hasText(status)) {
            return fallback;
        }
        String value = status.trim().toUpperCase();
        switch (value) {
            case STATUS_DRAFT:
            case STATUS_IN_REVIEW:
            case STATUS_PUBLISHED:
            case STATUS_VOID:
            case STATUS_ARCHIVED:
                return value;
            default:
                throw new BusinessException("不支持的文档状态: " + status);
        }
    }

    private String normalizeSourceType(String sourceType) {
        if (!StringUtils.hasText(sourceType)) {
            return SOURCE_MANUAL;
        }
        String value = sourceType.trim().toUpperCase();
        switch (value) {
            case SOURCE_MANUAL:
            case SOURCE_WORKFLOW:
            case SOURCE_MAIL:
            case SOURCE_IMPORT:
                return value;
            default:
                throw new BusinessException("不支持的文档来源类型: " + sourceType);
        }
    }

    private String resolveFolderName(Long folderId) {
        if (folderId == null) {
            return null;
        }
        OaDocFolder folder = folderMapper.selectById(folderId);
        return folder == null ? null : folder.getFolderName();
    }

    private String resolveDisplayName(Long userId) {
        if (userId == null) {
            return null;
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }
        return StringUtils.hasText(user.getDisplayName()) ? user.getDisplayName() : user.getUsername();
    }

    private String resolveDeptName(Long deptId) {
        if (deptId == null) {
            return null;
        }
        SysOrganization org = organizationMapper.selectById(deptId);
        return org == null ? null : org.getOrgName();
    }

    /** 日期转换需 null-safe：条件构造器会提前求值参数表达式。 */
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
