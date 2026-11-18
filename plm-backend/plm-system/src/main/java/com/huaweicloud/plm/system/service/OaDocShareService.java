package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.DocShareItem;
import com.huaweicloud.plm.system.dto.DocShareSaveRequest;
import com.huaweicloud.plm.system.entity.OaDocShare;
import com.huaweicloud.plm.system.entity.OaDocument;
import com.huaweicloud.plm.system.entity.SysOrganization;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.OaDocShareMapper;
import com.huaweicloud.plm.system.mapper.OaDocumentMapper;
import com.huaweicloud.plm.system.mapper.SysOrganizationMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 文档分享服务（OA-DEV-050）：内部分享给指定用户/部门，或生成带有效期与撤销能力的链接分享，
 * 下载权限可单独控制。默认有效期来自可配置项 oa.doc.share.default.expire.days，避免写死。
 */
@Service
@RequiredArgsConstructor
public class OaDocShareService {

    private static final String DEFAULT_SHARE_NO_PREFIX = "SHARE-";
    private static final int REMARK_LIMIT = 200;

    private final OaDocShareMapper shareMapper;
    private final OaDocumentMapper documentMapper;
    private final DocPermissionService permissionService;
    private final DocAccessLogService accessLogService;
    private final OaDocSupportService supportService;
    private final SysUserMapper userMapper;
    private final SysOrganizationMapper organizationMapper;

    /** 文档分享列表：最新分享在前。 */
    public List<DocShareItem> list(Long docId) {
        OaDocument doc = requireDocument(docId);
        permissionService.requireDocumentReadable(doc);
        return shareMapper.selectList(Wrappers.<OaDocShare>lambdaQuery()
                        .eq(OaDocShare::getDocId, docId)
                        .orderByDesc(OaDocShare::getId))
                .stream().map(this::toItem).toList();
    }

    /** 创建分享：需具备文档管理权限；链接分享默认有效期取自可配置项。 */
    @Transactional
    public Long create(Long docId, DocShareSaveRequest request) {
        OaDocument doc = requireDocument(docId);
        permissionService.requireDocumentManage(doc);
        String shareType = normalizeShareType(request.getShareType());
        Long targetUserId = null;
        Long targetDeptId = null;
        if (DocPermissionService.SHARE_INTERNAL.equals(shareType)) {
            targetUserId = request.getTargetUserId();
            targetDeptId = request.getTargetDeptId();
            if (targetUserId == null && targetDeptId == null) {
                throw new BusinessException("内部分享必须指定分享用户或部门");
            }
        }
        OaDocShare share = new OaDocShare();
        share.setShareNo(supportService.nextNo(
                supportService.config("oa.doc.share.no.prefix", DEFAULT_SHARE_NO_PREFIX)));
        share.setDocId(docId);
        share.setShareType(shareType);
        share.setTargetUserId(targetUserId);
        share.setTargetDeptId(targetDeptId);
        share.setPermissionLevel(normalizeLevel(request.getPermissionLevel()));
        share.setDownloadAllowed(request.getDownloadAllowed() == null ? 1 : request.getDownloadAllowed());
        share.setExpireAt(resolveExpireAt(request.getExpireDays()));
        share.setRevokedFlag(0);
        share.setViewCount(0L);
        share.setRemark(request.getRemark());
        shareMapper.insert(share);
        accessLogService.record(docId, null, doc.getFolderId(), DocAccessLogService.ACTION_SHARE,
                "创建分享 " + share.getShareNo() + "（" + shareType + "）");
        return share.getId();
    }

    /** 撤销分享：撤销后链接与内部分享立即失效。 */
    @Transactional
    public void revoke(Long shareId) {
        OaDocShare share = requireShare(shareId);
        OaDocument doc = requireDocument(share.getDocId());
        permissionService.requireDocumentManage(doc);
        share.setRevokedFlag(1);
        shareMapper.updateById(share);
        accessLogService.record(doc.getId(), null, doc.getFolderId(), DocAccessLogService.ACTION_SHARE,
                "撤销分享 " + share.getShareNo());
    }

    public OaDocShare requireShare(Long shareId) {
        OaDocShare share = shareMapper.selectById(shareId);
        if (share == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "分享不存在: " + shareId);
        }
        return share;
    }

    public DocShareItem toItem(OaDocShare share) {
        DocShareItem item = new DocShareItem();
        item.setId(share.getId());
        item.setShareNo(share.getShareNo());
        item.setDocId(share.getDocId());
        item.setShareType(share.getShareType());
        item.setTargetUserId(share.getTargetUserId());
        item.setTargetUserName(resolveUserName(share.getTargetUserId()));
        item.setTargetDeptId(share.getTargetDeptId());
        item.setTargetDeptName(resolveDeptName(share.getTargetDeptId()));
        item.setPermissionLevel(share.getPermissionLevel());
        item.setDownloadAllowed(share.getDownloadAllowed());
        item.setExpireAt(share.getExpireAt());
        item.setRevokedFlag(share.getRevokedFlag());
        item.setViewCount(share.getViewCount());
        item.setExpired(share.getExpireAt() != null && share.getExpireAt().isBefore(LocalDateTime.now()));
        item.setRemark(share.getRemark());
        item.setCreatedBy(share.getCreatedBy());
        item.setCreatedAt(share.getCreatedAt());
        return item;
    }

    // ---------------- 内部实现 ----------------

    /** 有效期：未指定取配置默认天数，非正数表示不限制。 */
    private LocalDateTime resolveExpireAt(Integer expireDays) {
        int days = expireDays == null
                ? supportService.configInt("oa.doc.share.default.expire.days", 7)
                : expireDays;
        return days <= 0 ? null : LocalDateTime.now().plusDays(days);
    }

    private String normalizeShareType(String shareType) {
        String value = StringUtils.hasText(shareType)
                ? shareType.trim().toUpperCase() : DocPermissionService.SHARE_INTERNAL;
        if (!DocPermissionService.SHARE_INTERNAL.equals(value) && !DocPermissionService.SHARE_LINK.equals(value)) {
            throw new BusinessException("不支持的分享方式: " + shareType);
        }
        return value;
    }

    private String normalizeLevel(String level) {
        String value = StringUtils.hasText(level)
                ? level.trim().toUpperCase() : DocPermissionService.LEVEL_READ;
        if (DocPermissionService.levelValue(value) == 0) {
            throw new BusinessException("不支持的分享权限级别: " + level);
        }
        return value;
    }

    private OaDocument requireDocument(Long docId) {
        OaDocument doc = documentMapper.selectById(docId);
        if (doc == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文档不存在: " + docId);
        }
        return doc;
    }

    private String resolveUserName(Long userId) {
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
}
