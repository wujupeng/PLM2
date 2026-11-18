package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.DocVersionItem;
import com.huaweicloud.plm.system.entity.OaDocVersion;
import com.huaweicloud.plm.system.entity.OaDocument;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.OaDocVersionMapper;
import com.huaweicloud.plm.system.mapper.OaDocumentMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * 文档版本服务（OA-DEV-049）：每次上传或恢复生成新版本，历史版本不可被无痕覆盖，
 * 支持历史版本查看与锁定；超过保留上限（oa.doc.version.max.keep）时自动清理最旧版本。
 * 在线预览与病毒扫描状态受 oa.doc.preview.enabled / oa.doc.scan.enabled 控制（IF-OA-08）。
 */
@Service
@RequiredArgsConstructor
public class OaDocVersionService {

    public static final String SCAN_PENDING = "PENDING";
    public static final String SCAN_CLEAN = "CLEAN";
    public static final String SCAN_INFECTED = "INFECTED";

    private static final String STATUS_PUBLISHED = "PUBLISHED";

    private final OaDocVersionMapper versionMapper;
    private final OaDocumentMapper documentMapper;
    private final DocStorageService storageService;
    private final DocPermissionService permissionService;
    private final OaDocSupportService supportService;
    private final SysUserMapper userMapper;

    /** 文档版本历史：最新版本在前。 */
    public List<DocVersionItem> list(Long docId) {
        OaDocument doc = requireDocument(docId);
        permissionService.requireDocumentReadable(doc);
        return versionMapper.selectList(Wrappers.<OaDocVersion>lambdaQuery()
                        .eq(OaDocVersion::getDocId, docId)
                        .orderByDesc(OaDocVersion::getVersionNo)
                        .orderByDesc(OaDocVersion::getId))
                .stream().map(this::toItem).toList();
    }

    /**
     * 生成新版本：落盘文件、递增版本号、把旧版本置为非当前版本，并回写文档当前版本指针。
     */
    @Transactional
    public OaDocVersion createVersion(OaDocument doc, MultipartFile file, String revisionNote) {
        DocStorageService.StoredFile stored = storageService.store(file);
        return saveVersion(doc, stored, revisionNote, null);
    }

    /** 恢复到历史版本：不复制文件，直接以目标版本的存储引用生成一个新版本，保留完整版本链。 */
    @Transactional
    public OaDocVersion restoreVersion(Long docId, Long versionId) {
        OaDocument doc = requireDocument(docId);
        permissionService.requireDocumentWritable(doc);
        OaDocVersion source = requireVersion(versionId);
        if (!Objects.equals(source.getDocId(), docId)) {
            throw new BusinessException("版本不属于该文档: " + versionId);
        }
        DocStorageService.StoredFile stored = new DocStorageService.StoredFile(
                source.getFileName(), source.getFileSize() == null ? 0L : source.getFileSize(),
                source.getContentType(), source.getFileHash(), source.getStoragePath());
        return saveVersion(doc, stored, "恢复到版本 v" + source.getVersionNo(), source);
    }

    /** 锁定/解锁版本：锁定的版本在保留策略清理时不会被自动删除。 */
    @Transactional
    public void lockVersion(Long versionId, Integer lockFlag) {
        OaDocVersion version = requireVersion(versionId);
        OaDocument doc = requireDocument(version.getDocId());
        permissionService.requireDocumentManage(doc);
        version.setLockFlag(lockFlag == null || lockFlag == 1 ? 1 : 0);
        versionMapper.updateById(version);
    }

    public OaDocVersion requireVersion(Long versionId) {
        OaDocVersion version = versionMapper.selectById(versionId);
        if (version == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文档版本不存在: " + versionId);
        }
        return version;
    }

    /** 当前生效版本：优先按文档指针，缺失时回退为最新版本。 */
    public OaDocVersion currentVersion(OaDocument doc) {
        if (doc.getCurrentVersionId() != null) {
            OaDocVersion version = versionMapper.selectById(doc.getCurrentVersionId());
            if (version != null) {
                return version;
            }
        }
        return versionMapper.selectOne(Wrappers.<OaDocVersion>lambdaQuery()
                .eq(OaDocVersion::getDocId, doc.getId())
                .orderByDesc(OaDocVersion::getVersionNo)
                .last("LIMIT 1"));
    }

    public DocVersionItem toItem(OaDocVersion version) {
        DocVersionItem item = new DocVersionItem();
        item.setVersionId(version.getId());
        item.setDocId(version.getDocId());
        item.setVersionNo(version.getVersionNo());
        item.setRevisionNote(version.getRevisionNote());
        item.setFileName(version.getFileName());
        item.setFileSize(version.getFileSize());
        item.setContentType(version.getContentType());
        item.setFileHash(version.getFileHash());
        item.setScanStatus(version.getScanStatus());
        item.setPublishedFlag(version.getPublishedFlag());
        item.setCurrentFlag(version.getCurrentFlag());
        item.setLockFlag(version.getLockFlag());
        item.setUploadedByUserId(version.getUploadedByUserId());
        item.setUploadedByName(resolveUploaderName(version.getUploadedByUserId()));
        item.setCreatedAt(version.getCreatedAt());
        return item;
    }

    // ---------------- 内部实现 ----------------

    private OaDocVersion saveVersion(OaDocument doc, DocStorageService.StoredFile stored,
                                     String revisionNote, OaDocVersion source) {
        int versionNo = nextVersionNo(doc.getId());
        boolean scanEnabled = supportService.configBool("oa.doc.scan.enabled", false);
        OaDocVersion version = new OaDocVersion();
        version.setDocId(doc.getId());
        version.setVersionNo(versionNo);
        version.setRevisionNote(StringUtils.hasText(revisionNote) ? revisionNote : "第 " + versionNo + " 版");
        version.setFileName(stored.fileName());
        version.setFileSize(stored.fileSize());
        version.setContentType(stored.contentType());
        version.setFileHash(stored.fileHash());
        version.setStoragePath(stored.storagePath());
        if (source != null) {
            // 恢复历史版本时沿用原版本的扫描结论，避免重复扫描
            version.setScanStatus(source.getScanStatus());
            version.setScanAt(source.getScanAt());
        } else {
            version.setScanStatus(scanEnabled ? SCAN_PENDING : SCAN_CLEAN);
            version.setScanAt(scanEnabled ? null : LocalDateTime.now());
        }
        version.setPublishedFlag(STATUS_PUBLISHED.equalsIgnoreCase(doc.getStatus()) ? 1 : 0);
        version.setCurrentFlag(1);
        version.setLockFlag(0);
        version.setUploadedByUserId(permissionService.currentUserId());
        versionMapper.insert(version);

        versionMapper.update(null, Wrappers.<OaDocVersion>lambdaUpdate()
                .eq(OaDocVersion::getDocId, doc.getId())
                .ne(OaDocVersion::getId, version.getId())
                .set(OaDocVersion::getCurrentFlag, 0));

        doc.setCurrentVersionId(version.getId());
        doc.setCurrentVersionNo(versionNo);
        doc.setFileName(version.getFileName());
        doc.setFileSize(version.getFileSize());
        doc.setContentType(version.getContentType());
        doc.setFileHash(version.getFileHash());
        documentMapper.updateById(doc);

        cleanup(doc.getId());
        return version;
    }

    private int nextVersionNo(Long docId) {
        OaDocVersion latest = versionMapper.selectOne(Wrappers.<OaDocVersion>lambdaQuery()
                .eq(OaDocVersion::getDocId, docId)
                .orderByDesc(OaDocVersion::getVersionNo)
                .last("LIMIT 1"));
        return latest == null || latest.getVersionNo() == null ? 1 : latest.getVersionNo() + 1;
    }

    /** 保留策略：仅保留最新 N 个版本，其余清理；锁定版本与当前版本不参与清理。 */
    private void cleanup(Long docId) {
        int maxKeep = supportService.configInt("oa.doc.version.max.keep", 20);
        if (maxKeep <= 0) {
            return;
        }
        List<OaDocVersion> versions = versionMapper.selectList(Wrappers.<OaDocVersion>lambdaQuery()
                .eq(OaDocVersion::getDocId, docId)
                .orderByDesc(OaDocVersion::getVersionNo));
        int kept = 0;
        for (OaDocVersion version : versions) {
            boolean protectedVersion = version.getLockFlag() != null && version.getLockFlag() == 1;
            if (protectedVersion || kept < maxKeep) {
                kept++;
                continue;
            }
            versionMapper.deleteById(version.getId());
        }
    }

    private OaDocument requireDocument(Long docId) {
        OaDocument doc = documentMapper.selectById(docId);
        if (doc == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文档不存在: " + docId);
        }
        return doc;
    }

    private String resolveUploaderName(Long userId) {
        if (userId == null) {
            return null;
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }
        return StringUtils.hasText(user.getDisplayName()) ? user.getDisplayName() : user.getUsername();
    }
}
